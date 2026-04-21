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

class DataAnalystAgentHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing modular Data Analyst Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            
            request = self.substitute_template_variables(node_data.get("analysis_request", ""), context)
            if not request.strip() and "analysis_request" in context: request = context["analysis_request"]
            
            dataset = node_data.get("dataset", "")
            if not dataset and "dataset" in context: dataset = context["dataset"]

            if not request.strip(): raise ValueError("No analysis request provided")

            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.2, 1000)

            prompt = f"Please act as a data analyst. Fulfill the following request:\n{request}\n\nDataset preview/context:\n{dataset}"
            
            def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content
            loop = asyncio.get_event_loop()
            analysis = await loop.run_in_executor(None, _call_llm)

            output = {**context, "analysis_request": request, "analysis_result": analysis, "node_type": "data-analyst-agent", "node_executed_at": datetime.now().isoformat()}
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