import asyncio
import io
import json
import logging
import textwrap
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.service.kafka import KafkaService
from app.service.node_executor import NodeExecutorService
from app.service.redis import RedisService
from app.core.config import settings
from app.service.workflow_builder.qdrant_service import QdrantNodeService
from app.service.workflow_builder import workflow_generator

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting FastAPI Workflow Node Executor")
    
    try:
        print(settings.serpapi_key)

        redis_service = RedisService()
        await redis_service.connect()
        kafka_service = KafkaService()
        node_executor = NodeExecutorService(redis_service, kafka_service)

        # Initialise Qdrant node-matching service (loads sentence-transformers model once)
        qdrant_node_service = QdrantNodeService(host="localhost", port=6333)
        try:
            qdrant_node_service.initialize()
            workflow_generator.set_qdrant_service(qdrant_node_service)
            app.state.qdrant_node_service = qdrant_node_service
            logger.info("✅ QdrantNodeService ready")
        except Exception as qdrant_err:
            logger.warning("⚠️  Qdrant unavailable — workflow builder disabled: %s", qdrant_err)
        



        consumer_task = asyncio.create_task(
            kafka_service.start_consumer(node_executor.execute_node)
        )
        app.state.kafka_service = kafka_service
        app.state.node_executor = node_executor
        app.state.redis_service = redis_service
        app.state.consumer_task = consumer_task
        


        logger.info("✅ FastAPI service started successfully")


        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to start FastAPI service: {e}")
        raise
    finally:
        logger.info("🛑 Shutting down FastAPI service")
        if hasattr(app.state, 'consumer_task'):
            app.state.consumer_task.cancel()
        if hasattr(app.state, 'kafka_service'):
            await app.state.kafka_service.close()
        if hasattr(app.state, 'redis_service'):
            await app.state.redis_service.close()
        logger.info("✅ FastAPI service stopped")

app = FastAPI(
    title="Workflow Node Executor",
    description="FastAPI microservice for executing AI/ML workflow nodes",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    try:
        await app.state.redis_service.ping()
        return {
            "status": "healthy",
            "service": "fastapi-node-executor",
            "version": "1.0.0",
            "redis": "connected",
            "kafka": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "FastAPI Workflow Node Executor",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Extract text from an uploaded PDF and return it as a string."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    try:
        from pypdf import PdfReader
        contents = await file.read()
        reader = PdfReader(io.BytesIO(contents))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text() or ""
            pages_text.append(text)
        full_text = "\n\n".join(pages_text).strip()
        return {
            "text": full_text,
            "pages": len(reader.pages),
            "filename": file.filename,
            "char_count": len(full_text),
        }
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


@app.post("/generate-pdf")
async def generate_pdf(payload: dict):
    """Generate a downloadable PDF report from workflow result data."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.enums import TA_LEFT, TA_CENTER

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=0.75*inch, rightMargin=0.75*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=16,
                                     textColor=colors.HexColor("#06b6d4"), spaceAfter=6, alignment=TA_CENTER)
        sub_style  = ParagraphStyle("Sub",   parent=styles["Normal"],   fontSize=8,
                                     textColor=colors.HexColor("#94a3b8"), spaceAfter=12, alignment=TA_CENTER)
        key_style  = ParagraphStyle("Key",   parent=styles["Normal"],   fontSize=9,
                                     textColor=colors.HexColor("#67e8f9"), fontName="Courier-Bold")
        val_style  = ParagraphStyle("Val",   parent=styles["Normal"],   fontSize=8,
                                     textColor=colors.HexColor("#e2e8f0"), fontName="Courier", leading=11)

        story = [
            Paragraph("AutoWeave — Workflow Results", title_style),
        ]

        exec_id = payload.get("executionId", "")
        if exec_id:
            story.append(Paragraph(f"Execution ID: {exec_id}", sub_style))
        story.append(Spacer(1, 0.15*inch))

        skip = {"executionId", "workflowId", "nodeId", "nodeType"}
        for key, value in payload.items():
            if key in skip:
                continue
            if isinstance(value, (dict, list)):
                raw = json.dumps(value, indent=2, default=str)
            else:
                raw = str(value)

            # wrap long values
            lines = []
            for line in raw.splitlines():
                lines.extend(textwrap.wrap(line, width=90) or [""])
            display = "\n".join(lines)

            table_data = [[Paragraph(key, key_style), Paragraph(display.replace("\n", "<br/>"), val_style)]]
            tbl = Table(table_data, colWidths=[1.6*inch, 5.6*inch])
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#0f172a")),
                ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#0b1120")),
                ("BOX",        (0, 0), (-1, -1), 0.5, colors.HexColor("#1e3a5f")),
                ("INNERGRID",  (0, 0), (-1, -1), 0.25, colors.HexColor("#1e3a5f")),
                ("VALIGN",     (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING",  (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 0.06*inch))

        doc.build(story)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=workflow-results.pdf"},
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ── Workflow Builder endpoints ──────────────────────────────────────────

class WorkflowGenerateRequest(BaseModel):
    prompt: str
    api_key: str
    provider: str = "openai"   # "openai" | "gemini" | "claude"

class WorkflowKeywordsRequest(BaseModel):
    keywords: List[str]


@app.post("/workflow/generate")
async def workflow_generate(req: WorkflowGenerateRequest):
    """AI mode: extract intents from a natural-language prompt → build workflow."""
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt must not be empty")
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="api_key is required for AI mode")
    try:
        result = workflow_generator.generate_from_prompt(
            prompt=req.prompt,
            api_key=req.api_key,
            provider=req.provider,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("workflow_generate error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Workflow generation failed: {exc}")


@app.post("/workflow/from-keywords")
async def workflow_from_keywords(req: WorkflowKeywordsRequest):
    """Manual mode: match each keyword to a node via Qdrant → build workflow. Zero AI."""
    if not req.keywords:
        raise HTTPException(status_code=400, detail="keywords list must not be empty")
    try:
        result = workflow_generator.generate_from_keywords(req.keywords)
        return result
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("workflow_from_keywords error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Keyword workflow failed: {exc}")


@app.get("/workflow/node-suggestions")
async def workflow_node_suggestions():
    """Return all available node types with their labels and categories for the frontend keyword picker."""
    from app.service.workflow_builder.node_catalog import NODE_CATALOG
    return {
        "nodes": [
            {
                "type": node_type,
                "label": entry["label"],
                "category": entry["category"],
                "icon": entry["icon"],
            }
            for node_type, entry in NODE_CATALOG.items()
        ]
    }


@app.get("/node-types")
async def get_supported_node_types():
    return {
        "supported_nodes": [
            "text-generation",
            "summarization",
            "ai-decision",
            "question-answer",
            "text-classification",
            "named-entity",
            "translation",
            "content-generation",
            "search-agent",
            "data-analyst-agent",
            "cp-solver",
            "cp-testgen",
            "cp-executor",
            "cp-agent",
            "k-means",
            "clusterization",
            "python-task",
            "linear-regression",
            "anomaly-detection",
            "text-embedding",
        ]
    }
