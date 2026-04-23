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

class AIDecisionHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing modular AI Decision Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            
            criteria = self.substitute_template_variables(node_data.get("decision_criteria", ""), context)
            if not criteria.strip() and "decision_criteria" in context: criteria = context["decision_criteria"]
            if not criteria.strip(): raise ValueError("No criteria provided")

            options = node_data.get("options", [])
            if not options and "options" in context: options = context["options"]

            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.1, 1000)

            prompt = f"Please make a decision based on the following criteria:\n{criteria}\n\nOptions available:\n{options}\n\nReturn your choice and a brief explanation."
            
            def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content
            loop = asyncio.get_event_loop()
            decision = await loop.run_in_executor(None, _call_llm)

            output = {**context, "criteria": criteria, "options": options, "decision": decision, "node_type": "ai-decision", "node_executed_at": datetime.now().isoformat()}
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