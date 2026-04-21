import logging
import time
import json
import tempfile
import os
import subprocess
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.service.llm_factory import LLMFactory
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

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
            if not problem.strip() and "problem" in context: problem = context["problem"]
            if not problem.strip(): raise ValueError("No problem description provided to cp-agent")

            max_iterations = node_data.get("max_iterations", 3)
            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.2, 1000)

            testcases = await self._generate_tests(client, problem, 5)
            code = ""
            error_feedback = ""
            all_passed = False
            final_results = []
            
            for iteration in range(max_iterations):
                code = await self._solve_problem(client, problem, error_feedback)
                all_passed, results = self._execute_code(code, testcases)
                final_results = results
                if all_passed: break
                error_feedback = self._build_feedback(results)

            output = {**context, "problem": problem, "final_code": code, "all_passed": all_passed, "test_results": final_results, "node_type": "cp-agent"}
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            await self._publish_completion_event(message, {**(message.context or {}), "error": str(e)}, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _generate_tests(self, client, problem: str, num_tests: int) -> List[Dict]:
        prompt = f"You are a test case generator for a competitive programming platform.\nGenerate {num_tests} challenging test cases including edge cases.\nYou must return ONLY a JSON object containing a single key 'testcases', which is an array of objects.\nEach object must have 'input' (string) and 'output' (string expected output).\n\nProblem Statement:\n{problem}\n"
        def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, _call_llm)
        try:
            if res.startswith("```json"): res = res[7:]
            elif res.startswith("```"): res = res[3:]
            if res.endswith("```"): res = res[:-3]
            return json.loads(res.strip()).get("testcases", [])
        except: return []

    async def _solve_problem(self, client, problem: str, feedback: str) -> str:
        prompt = f"You are an elite competitive programmer.\nWrite a python 3 solution to the following problem.\nThe code must read from standard input (sys.stdin) and print to standard output.\nDo not include any explanation or markdown formatting in your code block, just the raw python code.\n\nProblem Statement:\n{problem}\n"
        if feedback: prompt += f"\nYOUR PREVIOUS ATTEMPT FAILED WITH THESE ERRORS:\n{feedback}\nPlease fix the logic."
        def _call_llm(): return client.invoke([HumanMessage(content=prompt)]).content
        loop = asyncio.get_event_loop()
        code = await loop.run_in_executor(None, _call_llm)
        if code.startswith("```python"): code = code[9:]
        elif code.startswith("```"): code = code[3:]
        if code.endswith("```"): code = code[:-3]
        return code.strip()

    def _execute_code(self, code: str, testcases: List[Dict]):
        if not testcases: return True, []
        results, all_passed = [], True
        with tempfile.NamedTemporaryFile(mode='w', suffix=".py", delete=False) as f:
            f.write(code)
            script_path = f.name
        try:
            for i, test in enumerate(testcases):
                input_data = test.get("input", "")
                expected_output = test.get("output", "").strip()
                try:
                    proc = subprocess.run(['python3', script_path], input=input_data, text=True, capture_output=True, timeout=2)
                    passed = (proc.stdout.strip() == expected_output and proc.returncode == 0)
                    if not passed: all_passed = False
                    results.append({"test_case": i + 1, "passed": passed, "input": input_data, "expected": expected_output, "actual": proc.stdout.strip(), "stderr": proc.stderr.strip()})
                except subprocess.TimeoutExpired:
                    all_passed = False
                    results.append({"test_case": i + 1, "passed": False, "error": "Time Limit Exceeded"})
        finally:
            if os.path.exists(script_path): os.remove(script_path)
        return all_passed, results

    def _build_feedback(self, results: List[Dict]) -> str:
        feedback = []
        for r in results:
            if not r.get("passed", False):
                case_str = f"Test Case {r.get('test_case')}:\nInput: {r.get('input')}\nExpected: {r.get('expected')}\n"
                if "error" in r: case_str += f"Error: {r['error']}\n"
                else: case_str += f"Actual Output: {r.get('actual')}\n"
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
            if hasattr(app.state, 'kafka_service'): await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
