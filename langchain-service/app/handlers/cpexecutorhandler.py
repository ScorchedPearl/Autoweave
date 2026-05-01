import logging
import time
import subprocess
import tempfile
import os
import json
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

_TEMPLATE_VAR = re.compile(r'^\s*\{\{(\w+)\}\}\s*$')

LANGUAGE_EXTENSIONS = {
    "python":     ".py",
    "cpp":        ".cpp",
    "java":       ".java",
    "javascript": ".js",
}

def _resolve_from_context(raw, context: dict, expect_list: bool = False):
    if isinstance(raw, list):
        return raw
    if not isinstance(raw, str):
        return raw
    m = _TEMPLATE_VAR.match(raw)
    if m:
        val = context.get(m.group(1))
        if val is not None:
            return val
    if expect_list:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
    return raw


def _run_one_test(language: str, source_path: str, input_data: str, timeout: int) -> Tuple[str, str, int]:
    """Compile (if needed) and run one test. Returns (stdout, stderr, returncode)."""
    if language == "python":
        proc = subprocess.run(
            ["python3", source_path],
            input=input_data, text=True, capture_output=True, timeout=timeout,
        )
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "cpp":
        binary = source_path.replace(".cpp", "")
        compile_proc = subprocess.run(
            ["g++", "-O2", "-std=c++17", "-o", binary, source_path],
            capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            raise RuntimeError(f"Compilation error:\n{compile_proc.stderr}")
        try:
            proc = subprocess.run(
                [binary], input=input_data, text=True, capture_output=True, timeout=timeout,
            )
        finally:
            if os.path.exists(binary):
                os.remove(binary)
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "java":
        src_dir = os.path.dirname(source_path)
        compile_proc = subprocess.run(
            ["javac", source_path],
            capture_output=True, text=True, timeout=30,
        )
        if compile_proc.returncode != 0:
            raise RuntimeError(f"Compilation error:\n{compile_proc.stderr}")
        proc = subprocess.run(
            ["java", "-cp", src_dir, "Main"],
            input=input_data, text=True, capture_output=True, timeout=timeout,
        )
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "javascript":
        proc = subprocess.run(
            ["node", source_path],
            input=input_data, text=True, capture_output=True, timeout=timeout,
        )
        return proc.stdout, proc.stderr, proc.returncode

    else:
        raise ValueError(f"Unsupported language: {language}")


class CPExecutorHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing CP Executor Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            language = node_data.get("language", context.get("language", "python")).lower()
            if language not in LANGUAGE_EXTENSIONS:
                language = "python"

            code = _resolve_from_context(node_data.get("code", ""), context)
            if not isinstance(code, str) or not code.strip():
                code = context.get("code", "")

            testcases: List[dict] = _resolve_from_context(
                node_data.get("testcases", []), context, expect_list=True
            )
            if not isinstance(testcases, list):
                testcases = context.get("testcases", [])

            if not code.strip():
                raise ValueError("No code provided to cp-executor")

            timeout = int(node_data.get("timeout", 2))
            ext = LANGUAGE_EXTENSIONS[language]

            # Java requires the file to be named Main.java
            if language == "java":
                tmp_dir = tempfile.mkdtemp()
                source_path = os.path.join(tmp_dir, "Main.java")
                with open(source_path, "w") as f:
                    f.write(code)
            else:
                with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as f:
                    f.write(code)
                    source_path = f.name
                tmp_dir = None

            results = []
            all_passed = True
            compilation_error = None

            try:
                for i, test in enumerate(testcases):
                    input_data = test.get("input", "")
                    expected_output = test.get("output", "").strip()
                    try:
                        stdout, stderr, returncode = _run_one_test(language, source_path, input_data, timeout)
                        actual_output = stdout.strip()
                        passed = (actual_output == expected_output and returncode == 0)
                        if not passed:
                            all_passed = False
                        results.append({
                            "test_case": i + 1, "passed": passed,
                            "input": input_data, "expected": expected_output,
                            "actual": actual_output, "stderr": stderr.strip(),
                        })
                    except subprocess.TimeoutExpired:
                        all_passed = False
                        results.append({"test_case": i + 1, "passed": False, "error": "Time Limit Exceeded"})
                    except RuntimeError as e:
                        compilation_error = str(e)
                        all_passed = False
                        for j in range(i, len(testcases)):
                            results.append({"test_case": j + 1, "passed": False, "error": compilation_error})
                        break
            finally:
                if os.path.exists(source_path):
                    os.remove(source_path)
                if tmp_dir and os.path.isdir(tmp_dir):
                    import shutil
                    shutil.rmtree(tmp_dir, ignore_errors=True)

            output = {
                **context,
                "test_results": results,
                "all_passed": all_passed,
                "passed_count": sum(1 for r in results if r.get("passed")),
                "total_tests": len(results),
                "language": language,
                "node_type": "cp-executor",
            }
            if compilation_error:
                output["compilation_error"] = compilation_error

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
