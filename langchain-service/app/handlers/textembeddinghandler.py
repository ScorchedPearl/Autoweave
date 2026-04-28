import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.service.llm_factory import LLMFactory

logger = logging.getLogger(__name__)


class TextEmbeddingHandler(BaseNodeHandler):
    """Generates dense vector embeddings using OpenAI Embeddings API."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing Text Embedding Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            execution_id = str(message.executionId)

            raw_texts = node_data.get("texts", "")
            if isinstance(raw_texts, str):
                raw_texts = self.substitute_template_variables(raw_texts, context)
                if raw_texts.strip():
                    try:
                        texts = json.loads(raw_texts)
                        if isinstance(texts, str):
                            texts = [texts]
                    except Exception:
                        texts = [raw_texts.strip()]
                elif "texts" in context:
                    val = context["texts"]
                    texts = val if isinstance(val, list) else [str(val)]
                else:
                    raise ValueError("No texts provided for text-embedding")
            elif isinstance(raw_texts, list):
                texts = raw_texts
            else:
                texts = [str(raw_texts)]

            model = node_data.get("model", "text-embedding-3-small")

            api_key = await self.redis_service.get(f"execution:{execution_id}:openai_api_key")
            if not api_key:
                api_key = await self.redis_service.get("openai_api_key")
            if not api_key:
                import os
                api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API key is required for text embeddings")

            def _embed():
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                response = client.embeddings.create(input=texts, model=model)
                embeddings = [item.embedding for item in response.data]
                return embeddings

            loop = asyncio.get_event_loop()
            embeddings: List[List[float]] = await loop.run_in_executor(None, _embed)

            output = {
                **context,
                "embeddings": embeddings,
                "dimensions": len(embeddings[0]) if embeddings else 0,
                "text_count": len(texts),
                "model": model,
                "node_type": "text-embedding",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            await self._publish_completion_event(message, {**(message.context or {}), "error": str(e)}, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _publish_completion_event(self, message: NodeExecutionMessage, output: Dict[str, Any], status: str, processing_time: int):
        try:
            from app.main import app
            completion_message = NodeCompletionMessage(
                executionId=message.executionId, workflowId=message.workflowId, nodeId=message.nodeId, nodeType=message.nodeType,
                status=status, output=output, error=output.get("error") if status == "FAILED" else None,
                timestamp=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z'), processingTime=processing_time
            )
            if hasattr(app.state, 'kafka_service'):
                await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
