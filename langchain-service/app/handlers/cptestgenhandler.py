import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.service.llm_factory import LLMFactory
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

class CPTestGenHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing CP Test Gen Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            problem = self.substitute_template_variables(node_data.get("problem", ""), context)
            if not problem.strip() and "problem" in context:
                problem = context["problem"]
            if not problem.strip():
                raise ValueError("No problem provided to cp-testgen")

            # num_tests = node_data.get("num_tests", 1)
            num_tests = 1
            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.4, 4096)

            prompt = (
                f"You are a test case generator for a competitive programming platform.\n"
                f"Generate exactly {num_tests} test case(s) for the problem below.\n\n"
                f"STRICT SIZE RULES — violating any rule makes the output invalid:\n"
                f"- Any integer N (array size, string length, etc.) must be AT MOST 10.\n"
                f"- Array/sequence values must each be between 0 and 20.\n"
                f"- String inputs must be at most 10 characters.\n"
                f"- Do NOT generate stress/large inputs. Keep every test case tiny.\n\n"
                f"Return ONLY a JSON object with a single key 'testcases' whose value is an array of objects.\n"
                f"Each object must have exactly two keys: 'input' (string) and 'output' (string).\n"
                f"No markdown, no explanation, no extra keys — just the raw JSON object.\n\n"
                f"Problem Statement:\n{problem}\n"
            )
            
            def _call_llm():
                return client.invoke([HumanMessage(content=prompt)]).content

            loop = asyncio.get_event_loop()
            result_txt = await loop.run_in_executor(None, _call_llm)
            
            testcases = []
            try:
                clean = result_txt.strip()
                # strip markdown fences
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                if clean.endswith("```"):
                    clean = clean.rsplit("```", 1)[0]
                clean = clean.strip()
                # find first JSON object/array
                start = clean.find("{")
                if start == -1:
                    start = clean.find("[")
                if start != -1:
                    clean = clean[start:]
                data = json.loads(clean)
                if isinstance(data, list):
                    testcases = data
                elif isinstance(data, dict):
                    # handle {"testcases": [...]} or {"test_cases": [...]} or top-level array value
                    for key in ("testcases", "test_cases", "tests", "cases"):
                        if key in data and isinstance(data[key], list):
                            testcases = data[key]
                            break
                logger.info(f"Parsed {len(testcases)} test cases")
            except Exception as parse_err:
                logger.error(f"Failed to parse testgen JSON: {parse_err}\nRaw output: {result_txt[:500]}")

            output = {**context, "problem": problem, "testcases": testcases, "num_tests": len(testcases), "node_type": "cp-testgen"}
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
