import logging
import time
import json
import tempfile
import os
import subprocess
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class PythonTaskHandler(BaseNodeHandler):
    """Executes arbitrary Python code in a sandboxed subprocess.

    The code receives workflow context as `input_data` (a dict) and should
    assign its result to a variable named `result`.  stdout is also captured.
    """

    TIMEOUT = 10

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Python Task Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            raw_code = node_data.get("code", "")
            code = self.substitute_template_variables(raw_code, context)
            if not code.strip():
                raise ValueError("No Python code provided for python-task")

            raw_input = node_data.get("data", "")
            if isinstance(raw_input, str):
                raw_input = self.substitute_template_variables(raw_input, context)
                input_data = json.loads(raw_input) if raw_input.strip() else context
            else:
                input_data = raw_input if raw_input else context

            loop = asyncio.get_event_loop()
            exec_result = await loop.run_in_executor(None, self._run_code, code, input_data)

            output = {
                **context,
                "stdout": exec_result["stdout"],
                "result": exec_result["result"],
                "exit_code": exec_result["exit_code"],
                "node_type": "python-task",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            await self._publish_completion_event(message, {**(message.context or {}), "error": str(e)}, "FAILED", int((time.time() - start_time) * 1000))
            raise

    def _run_code(self, user_code: str, input_data: Any) -> Dict[str, Any]:
        wrapper = f"""
import json, sys

input_data = {json.dumps(input_data)}
result = None

{user_code}

print("__RESULT__:" + json.dumps(result, default=str))
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(wrapper)
            path = f.name

        try:
            proc = subprocess.run(
                ["python3", path],
                capture_output=True,
                text=True,
                timeout=self.TIMEOUT,
            )
            stdout_lines = [l for l in proc.stdout.splitlines() if not l.startswith("__RESULT__:")]
            result_lines = [l for l in proc.stdout.splitlines() if l.startswith("__RESULT__:")]
            result_value = None
            if result_lines:
                try:
                    result_value = json.loads(result_lines[-1][len("__RESULT__:"):])
                except Exception:
                    result_value = result_lines[-1][len("__RESULT__:"):]

            return {
                "stdout": "\n".join(stdout_lines),
                "stderr": proc.stderr,
                "result": result_value,
                "exit_code": proc.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"stdout": "", "stderr": "Execution timed out", "result": None, "exit_code": -1}
        finally:
            if os.path.exists(path):
                os.remove(path)

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
