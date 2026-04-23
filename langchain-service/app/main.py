import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from app.service.kafka import KafkaService
from app.service.node_executor import NodeExecutorService
from app.service.redis import RedisService
from app.core.config import settings

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

@app.get("/node-types")
async def get_supported_node_types():
    return {
        "supported_nodes": [
            "text-generation",
            "k-means", 
            "python-task",
            "question-answer",
            "clusterization",
            "cp-solver",
            "cp-testgen",
            "cp-executor",
            "cp-agent"
        ]
    }
