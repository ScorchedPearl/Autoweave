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

LANGUAGE_INSTRUCTIONS = {
    "python": (
        "Write a Python 3 solution.\n"
        "The code must read from standard input (sys.stdin) and print to standard output.\n"
        "Do not include any explanation , comments or markdown. Output only raw Python code."
    ),
    "cpp": (
        "Write a C++17 solution.\n"
        "Use #include directives as needed. The program must read from stdin and write to stdout.\n"
        "Use a standard int main() entry point.\n"
        "Do not include any explanation , comments or markdown. Output only raw C++ code."
    ),
    "java": (
        "Write a Java solution.\n"
        "The public class must be named exactly 'Main' with a public static void main(String[] args) entry point.\n"
        "Use BufferedReader/Scanner for input and System.out for output.\n"
        "Do not include any explanation, comments  or markdown. Output only raw Java code."
    ),
    "javascript": (
        "Write a Node.js (JavaScript) solution.\n"
        "Read all input synchronously using require('fs').readFileSync('/dev/stdin','utf8') and print to stdout using console.log.\n"
        "Do not include any explanation , comments or markdown. Output only raw JavaScript code."
    ),
}

CODE_FENCE_PREFIXES = {
    "python":     ["```python", "```py", "```"],
    "cpp":        ["```cpp", "```c++", "```c", "```"],
    "java":       ["```java", "```"],
    "javascript": ["```javascript", "```js", "```"],
}

class CPSolverHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        self.llm_factory = LLMFactory(redis_service)
        logger.info("Initializing CP Solver Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            problem = self.substitute_template_variables(node_data.get("problem", ""), context)
            if not problem.strip() and "problem" in context:
                problem = context["problem"]
            if not problem.strip():
                raise ValueError("No problem description provided to cp-solver")

            language = node_data.get("language", context.get("language", "python")).lower()
            if language not in LANGUAGE_INSTRUCTIONS:
                language = "python"

            execution_id = str(message.executionId)
            client = await self.llm_factory.get_llm_client(execution_id, 0.0, 4096)

            lang_instruction = LANGUAGE_INSTRUCTIONS[language]
            prompt = (
                f"You are an elite competitive programmer.\n"
                f"{lang_instruction}\n\n"
                f"Problem Statement:\n{problem}\n"
            )

            def _call_llm():
                return client.invoke([HumanMessage(content=prompt)]).content

            loop = asyncio.get_event_loop()
            code = await loop.run_in_executor(None, _call_llm)
            code = _strip_fences(code, language)

            output = {
                **context,
                "problem": problem,
                "code": code,
                "language": language,
                "node_type": "cp-solver",
                "node_executed_at": datetime.now().isoformat(),
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
            if hasattr(app.state, 'kafka_service'):
                await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")


def _strip_fences(code: str, language: str) -> str:
    for prefix in CODE_FENCE_PREFIXES.get(language, ["```"]):
        if code.startswith(prefix):
            code = code[len(prefix):]
            break
    if code.endswith("```"):
        code = code[:-3]
    return code.strip()
