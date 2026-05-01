import logging
import time
import json
import shutil
import tempfile
import os
import subprocess
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.service.llm_factory import LLMFactory
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

LANGUAGE_INSTRUCTIONS = {
    "python": (
        "Write a Python 3 solution.\n"
        "The code must read from standard input (sys.stdin) and print to standard output.\n"
        "Do not include any explanation or markdown. Output only raw Python code."
    ),
    "cpp": (
        "Write a C++17 solution.\n"
        "Use #include directives as needed. The program must read from stdin and write to stdout.\n"
        "Use a standard int main() entry point.\n"
        "Do not include any explanation or markdown. Output only raw C++ code."
    ),
    "java": (
        "Write a Java solution.\n"
        "The public class must be named exactly 'Main' with a public static void main(String[] args) entry point.\n"
        "Use BufferedReader/Scanner for input and System.out for output.\n"
        "Do not include any explanation or markdown. Output only raw Java code."
    ),
    "javascript": (
        "Write a Node.js (JavaScript) solution.\n"
        "Read all input synchronously using require('fs').readFileSync('/dev/stdin','utf8') and print to stdout using console.log.\n"
        "Do not include any explanation or markdown. Output only raw JavaScript code."
    ),
}

LANGUAGE_EXTENSIONS = {
    "python": ".py",
    "cpp": ".cpp",
    "java": ".java",
    "javascript": ".js",
}

CODE_FENCE_PREFIXES = {
    "python":     ["```python", "```py", "```"],
    "cpp":        ["```cpp", "```c++", "```c", "```"],
    "java":       ["```java", "```"],
    "javascript": ["```javascript", "```js", "```"],
}


def _strip_fences(code: str, language: str) -> str:
    for prefix in CODE_FENCE_PREFIXES.get(language, ["```"]):
        if code.startswith(prefix):
            code = code[len(prefix):]
            break
    if code.endswith("```"):
        code = code[:-3]
    return code.strip()


def _run_one_test(language: str, source_path: str, input_data: str, timeout: int = 2) -> Tuple[str, str, int]:
    if language == "python":
        proc = subprocess.run(["python3", source_path], input=input_data, text=True, capture_output=True, timeout=timeout)
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "cpp":
        binary = source_path.replace(".cpp", "")
        compile_proc = subprocess.run(["g++", "-O2", "-std=c++17", "-o", binary, source_path], capture_output=True, text=True, timeout=30)
        if compile_proc.returncode != 0:
            raise RuntimeError(f"Compilation error:\n{compile_proc.stderr}")
        try:
            proc = subprocess.run([binary], input=input_data, text=True, capture_output=True, timeout=timeout)
        finally:
            if os.path.exists(binary):
                os.remove(binary)
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "java":
        src_dir = os.path.dirname(source_path)
        compile_proc = subprocess.run(["javac", source_path], capture_output=True, text=True, timeout=30)
        if compile_proc.returncode != 0:
            raise RuntimeError(f"Compilation error:\n{compile_proc.stderr}")
        proc = subprocess.run(["java", "-cp", src_dir, "Main"], input=input_data, text=True, capture_output=True, timeout=timeout)
        return proc.stdout, proc.stderr, proc.returncode

    elif language == "javascript":
        proc = subprocess.run(["node", source_path], input=input_data, text=True, capture_output=True, timeout=timeout)
        return proc.stdout, proc.stderr, proc.returncode

    else:
        raise ValueError(f"Unsupported language: {language}")


class CPAgentHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing CP Agent Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            problem = self.substitute_template_variables(node_data.get("problem", ""), context)
            if not problem.strip() and "problem" in context:
                problem = context["problem"]
            if not problem.strip():
                raise ValueError("No problem description provided to cp-agent")

            language = node_data.get("language", context.get("language", "python")).lower()
            if language not in LANGUAGE_INSTRUCTIONS:
                language = "python"

            max_iterations = node_data.get("max_iterations", 3)
            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.2, 1000)

            testcases = await self._generate_tests(client, problem, 5)
            code = ""
            error_feedback = ""
            all_passed = False
            final_results = []

            for iteration in range(max_iterations):
                code = await self._solve_problem(client, problem, language, error_feedback)
                all_passed, results = self._execute_code(code, language, testcases)
                final_results = results
                if all_passed:
                    break
                error_feedback = self._build_feedback(results)

            output = {
                **context,
                "problem": problem,
                "final_code": code,
                "language": language,
                "all_passed": all_passed,
                "test_results": final_results,
                "node_type": "cp-agent",
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            await self._publish_completion_event(message, {**(message.context or {}), "error": str(e)}, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _generate_tests(self, client, problem: str, num_tests: int) -> List[Dict]:
        prompt = (
            f"You are a test case generator for a competitive programming platform.\n"
            f"Generate {num_tests} challenging test cases including edge cases.\n"
            f"Return ONLY a JSON object with a single key 'testcases', which is an array of objects.\n"
            f"Each object must have 'input' (string) and 'output' (string expected output).\n\n"
            f"Problem Statement:\n{problem}\n"
        )
        def _call_llm():
            return client.invoke([HumanMessage(content=prompt)]).content
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, _call_llm)
        try:
            if res.startswith("```json"):
                res = res[7:]
            elif res.startswith("```"):
                res = res[3:]
            if res.endswith("```"):
                res = res[:-3]
            return json.loads(res.strip()).get("testcases", [])
        except Exception:
            return []

    async def _solve_problem(self, client, problem: str, language: str, feedback: str) -> str:
        lang_instruction = LANGUAGE_INSTRUCTIONS[language]
        prompt = (
            f"You are an elite competitive programmer.\n"
            f"{lang_instruction}\n\n"
            f"Problem Statement:\n{problem}\n"
        )
        if feedback:
            prompt += f"\nYOUR PREVIOUS ATTEMPT FAILED WITH THESE ERRORS:\n{feedback}\nPlease fix the logic."

        def _call_llm():
            return client.invoke([HumanMessage(content=prompt)]).content
        loop = asyncio.get_event_loop()
        code = await loop.run_in_executor(None, _call_llm)
        return _strip_fences(code, language)

    def _execute_code(self, code: str, language: str, testcases: List[Dict]):
        if not testcases:
            return True, []
        results, all_passed = [], True
        ext = LANGUAGE_EXTENSIONS[language]
        tmp_dir = None

        if language == "java":
            tmp_dir = tempfile.mkdtemp()
            source_path = os.path.join(tmp_dir, "Main.java")
            with open(source_path, "w") as f:
                f.write(code)
        else:
            with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as f:
                f.write(code)
                source_path = f.name

        try:
            for i, test in enumerate(testcases):
                input_data = test.get("input", "")
                expected_output = test.get("output", "").strip()
                try:
                    stdout, stderr, returncode = _run_one_test(language, source_path, input_data)
                    passed = (stdout.strip() == expected_output and returncode == 0)
                    if not passed:
                        all_passed = False
                    results.append({
                        "test_case": i + 1, "passed": passed,
                        "input": input_data, "expected": expected_output,
                        "actual": stdout.strip(), "stderr": stderr.strip(),
                    })
                except subprocess.TimeoutExpired:
                    all_passed = False
                    results.append({"test_case": i + 1, "passed": False, "error": "Time Limit Exceeded"})
                except RuntimeError as e:
                    all_passed = False
                    compilation_err = str(e)
                    for j in range(i, len(testcases)):
                        results.append({"test_case": j + 1, "passed": False, "error": compilation_err})
                    break
        finally:
            if os.path.exists(source_path):
                os.remove(source_path)
            if tmp_dir and os.path.isdir(tmp_dir):
                shutil.rmtree(tmp_dir, ignore_errors=True)

        return all_passed, results

    def _build_feedback(self, results: List[Dict]) -> str:
        feedback = []
        for r in results:
            if not r.get("passed", False):
                case_str = f"Test Case {r.get('test_case')}:\nInput: {r.get('input')}\nExpected: {r.get('expected')}\n"
                if "error" in r:
                    case_str += f"Error: {r['error']}\n"
                else:
                    case_str += f"Actual Output: {r.get('actual')}\n"
                feedback.append(case_str)
        return "\n".join(feedback)

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
