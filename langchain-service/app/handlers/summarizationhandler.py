import logging
import time
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.service.llm_factory import LLMFactory
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

class SummarizationHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing modular Summarization Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            text = self.substitute_template_variables(node_data.get("text", ""), context)
            if not text.strip() and "text" in context: text = context["text"]
            if not text.strip(): raise ValueError("No text provided for summarization")

            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.3, 1500)

            prompt = f"Please provide a concise summary of the following text:\n\n{text}"
            
            def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content
            loop = asyncio.get_event_loop()
            summary = await loop.run_in_executor(None, _call_llm)

            output = {**context, "original_text": text, "summary": summary, "node_type": "summarization", "node_executed_at": datetime.now().isoformat()}
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
            if hasattr(app.state, 'kafka_service'): await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
