import logging
import time
import subprocess
import tempfile
import os
import json
import re
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

_TEMPLATE_VAR = re.compile(r'^\s*\{\{(\w+)\}\}\s*$')

def _resolve_from_context(raw, context: dict, expect_list: bool = False):
    """Resolve a nodeData value that may be a {{template}} reference or JSON string."""
    # Already the right type
    if isinstance(raw, list):
        return raw
    if not isinstance(raw, str):
        return raw
    # Single {{varname}} pattern → pull directly from context (preserves type)
    m = _TEMPLATE_VAR.match(raw)
    if m:
        val = context.get(m.group(1))
        if val is not None:
            return val
    # Try JSON decode for list-type fields
    if expect_list:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
    return raw

class CPExecutorHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing CP Executor Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            code = _resolve_from_context(node_data.get("code", ""), context)
            if not isinstance(code, str) or not code.strip():
                code = context.get("code", "")

            testcases: List[dict] = _resolve_from_context(
                node_data.get("testcases", []), context, expect_list=True
            )
            if not isinstance(testcases, list):
                testcases = context.get("testcases", [])

            if not code.strip(): raise ValueError("No code provided to cp-executor")

            results = []
            all_passed = True
            with tempfile.NamedTemporaryFile(mode='w', suffix=".py", delete=False) as f:
                f.write(code)
                script_path = f.name
            try:
                for i, test in enumerate(testcases):
                    input_data = test.get("input", "")
                    expected_output = test.get("output", "").strip()
                    try:
                        proc = subprocess.run(['python3', script_path], input=input_data, text=True, capture_output=True, timeout=2)
                        actual_output = proc.stdout.strip()
                        passed = (actual_output == expected_output and proc.returncode == 0)
                        if not passed: all_passed = False
                        results.append({ "test_case": i + 1, "passed": passed, "input": input_data, "expected": expected_output, "actual": actual_output, "stderr": proc.stderr.strip() })
                    except subprocess.TimeoutExpired:
                        all_passed = False
                        results.append({ "test_case": i + 1, "passed": False, "error": "Time Limit Exceeded" })
            finally:
                if os.path.exists(script_path): os.remove(script_path)

            output = {**context, "test_results": results, "all_passed": all_passed, "passed_count": sum(1 for r in results if r.get("passed")), "total_tests": len(results), "node_type": "cp-executor"}
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
