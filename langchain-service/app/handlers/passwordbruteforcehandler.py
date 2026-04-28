import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import httpx

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class PasswordBruteForceHandler(BaseNodeHandler):
    """
    Credential tester for authorized penetration testing.
    Fires POST requests to a login endpoint with a wordlist and reports
    which credential succeeded based on a configurable success indicator.
    Only use against systems you own or have written authorization to test.
    """

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Password Brute Force Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            target_url = self.substitute_template_variables(str(node_data.get("target_url", "")), context).strip()
            username = self.substitute_template_variables(str(node_data.get("username", "")), context).strip()
            username_field = str(node_data.get("username_field", "username"))
            password_field = str(node_data.get("password_field", "password"))
            wordlist_raw = self.substitute_template_variables(str(node_data.get("wordlist", "")), context)
            success_indicator = self.substitute_template_variables(str(node_data.get("success_indicator", "")), context).strip()
            failure_indicator = self.substitute_template_variables(str(node_data.get("failure_indicator", "invalid")), context).strip()
            max_attempts = min(int(node_data.get("max_attempts", 20)), 100)
            delay_ms = float(node_data.get("delay_ms", 100))
            timeout = float(node_data.get("timeout_seconds", 5.0))

            if not target_url:
                raise ValueError("target_url is required")
            if not username:
                raise ValueError("username is required")

            passwords = [p.strip() for p in wordlist_raw.replace("\n", ",").split(",") if p.strip()]
            if not passwords:
                raise ValueError("wordlist must contain at least one password")

            passwords = passwords[:max_attempts]

            found_password: Optional[str] = None
            attempts: List[Dict[str, Any]] = []
            stopped_at = len(passwords)

            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                for i, password in enumerate(passwords):
                    payload = {username_field: username, password_field: password}
                    try:
                        resp = await client.post(target_url, data=payload)
                        body = resp.text

                        if success_indicator and success_indicator in body:
                            success = True
                        elif failure_indicator and failure_indicator in body:
                            success = False
                        else:
                            success = resp.status_code in (200, 302) and resp.status_code not in (401, 403)

                        attempts.append({
                            "password": password,
                            "status_code": resp.status_code,
                            "success": success,
                        })

                        if success:
                            found_password = password
                            stopped_at = i + 1
                            break

                    except httpx.RequestError as e:
                        attempts.append({"password": password, "error": str(e), "success": False})

                    if delay_ms > 0:
                        await asyncio.sleep(delay_ms / 1000.0)

            output = {
                **context,
                "target_url": target_url,
                "username": username,
                "found": found_password is not None,
                "found_password": found_password,
                "attempts_made": stopped_at,
                "total_wordlist": len(passwords),
                "attempts_detail": attempts,
                "node_type": "password-brute-force",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            err = str(e)
            output = {**(message.context or {}), "error": err}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _publish_completion_event(self, message: NodeExecutionMessage, output: Dict[str, Any], status: str, processing_time: int):
        try:
            from app.main import app
            completion_message = NodeCompletionMessage(
                executionId=message.executionId, workflowId=message.workflowId,
                nodeId=message.nodeId, nodeType=message.nodeType,
                status=status, output=output,
                error=output.get("error") if status == "FAILED" else None,
                timestamp=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z'),
                processingTime=processing_time,
            )
            if hasattr(app.state, 'kafka_service'):
                await app.state.kafka_service.publish_completion(completion_message)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
