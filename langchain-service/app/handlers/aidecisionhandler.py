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
            client = await self.llm_factory.get_llm_client(execution_id, 0.0, 1024)

            options_str = "\n".join(f"- {o}" for o in options)
            allowed = ', '.join(repr(str(o)) for o in options)
            prompt = (
                f"You are a decision engine. Evaluate the criteria and select the correct option.\n\n"
                f"Criteria:\n{criteria}\n\n"
                f"Options (pick one, copy it verbatim):\n{options_str}\n\n"
                f"Return ONLY a valid JSON object — no markdown, no extra text:\n"
                f"{{\"decision\": \"<exact option value>\", \"confidence\": <0.0-1.0>}}\n\n"
                f"CRITICAL: The 'decision' field MUST be exactly one of [{allowed}]."
            )

            import json
            import re

            def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content.strip()
            loop = asyncio.get_event_loop()
            raw = await loop.run_in_executor(None, _call_llm)

            clean_raw = raw.strip()
            if clean_raw.startswith("```json"):
                clean_raw = clean_raw[7:]
            if clean_raw.startswith("```"):
                clean_raw = clean_raw[3:]
            if clean_raw.endswith("```"):
                clean_raw = clean_raw[:-3]
            clean_raw = clean_raw.strip()

            logger.info("AI decision raw response: %r", raw)
            try:
                parsed = json.loads(clean_raw)
                decision = str(parsed.get("decision", ""))
                confidence = float(parsed.get("confidence", 1.0))
            except Exception:
<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
                decision_match = re.search(r'"decision"\s*:\s*"([^"]*)"', raw)
                conf_match = re.search(r'"confidence"\s*:\s*([0-9.]+)', raw)
                if decision_match:
                    decision = decision_match.group(1)
                    confidence = float(conf_match.group(1)) if conf_match else 1.0
                    logger.info("Extracted decision from partial JSON: %r", decision)
                else:
                    logger.warning("JSON parse failed for AI decision. Raw response: %r", raw)
                    decision = raw
                    confidence = 1.0

            matched = False
<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
            for opt in options:
                if str(opt).strip().lower() == str(decision).strip().lower():
                    decision = str(opt).strip()
                    matched = True
                    break

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
            if not matched:
                sorted_options = sorted(options, key=lambda x: len(str(x)), reverse=True)
                for opt in sorted_options:
                    pattern = r'\b' + re.escape(str(opt).strip()) + r'\b'
                    if re.search(pattern, str(decision).strip(), re.IGNORECASE):
                        decision = str(opt).strip()
                        matched = True
                        break

            if not matched and options:
                logger.warning("Could not match LLM decision %r to any option %s — retrying with simplified prompt", decision, options)
                simple_prompt = (
                    f"Choose one from this list and reply with ONLY that value, nothing else:\n"
                    f"{chr(10).join(str(o) for o in options)}\n\n"
                    f"Criteria: {criteria}"
                )
                raw2 = await loop.run_in_executor(None, lambda: client.invoke([HumanMessage(content=simple_prompt)]).content.strip())
                for opt in options:
                    if str(opt).strip().lower() == raw2.strip().lower():
                        decision = str(opt).strip()
                        matched = True
                        break
                if not matched:
                    decision = options[0]
                    logger.error("Retry also failed; defaulting to options[0]=%r", decision)

            output = {
                **context, 
                "criteria": criteria, 
                "options_considered": options, 
                "decision": str(decision),
                "confidence": float(confidence),
                "threshold_met": float(confidence) > 0.5,
                "node_type": "ai-decision", 
                "node_executed_at": datetime.now().isoformat()
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
            if hasattr(app.state, 'kafka_service'): await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")