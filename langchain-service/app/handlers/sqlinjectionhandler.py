import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

import httpx

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

SQLI_PAYLOADS = [
    ("boolean_true",   "' OR '1'='1"),
    ("boolean_true2",  "' OR 1=1--"),
    ("boolean_true3",  "\" OR \"1\"=\"1"),
    ("comment",        "' --"),
    ("comment2",       "'; --"),
    ("union_probe",    "' UNION SELECT NULL--"),
    ("error_probe",    "'"),
    ("error_probe2",   "''"),
    ("sleep_mysql",    "' AND SLEEP(0)--"),
    ("sleep_pg",       "'; SELECT pg_sleep(0)--"),
    ("stacked",        "'; SELECT 1--"),
]

SQL_ERROR_PATTERNS = [
    "you have an error in your sql",
    "syntax error",
    "unclosed quotation mark",
    "quoted string not properly terminated",
    "pg_query",
    "mysql_fetch",
    "ora-",
    "sqlstate",
    "invalid query",
    "db error",
]


class SQLInjectionHandler(BaseNodeHandler):
    """
    SQL injection scanner for authorized security testing.
    Fires common SQLi payloads at a target URL parameter and
    detects vulnerabilities via error strings, length deltas, and status codes.
    Only use against applications you own or have written authorization to test.
    """

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing SQL Injection Scanner Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            target_url = self.substitute_template_variables(str(node_data.get("target_url", "")), context).strip()
            parameter = self.substitute_template_variables(str(node_data.get("parameter", "")), context).strip()
            method = str(node_data.get("method", "GET")).upper()
            baseline_value = self.substitute_template_variables(str(node_data.get("baseline_value", "1")), context).strip()
            timeout = float(node_data.get("timeout_seconds", 5.0))
            custom_payloads_raw = str(node_data.get("custom_payloads", "")).strip()

            if not target_url:
                raise ValueError("target_url is required")
            if not parameter:
                raise ValueError("parameter is required")

            payloads = list(SQLI_PAYLOADS)
            if custom_payloads_raw:
                for p in custom_payloads_raw.split("\n"):
                    p = p.strip()
                    if p:
                        payloads.append((f"custom_{len(payloads)}", p))

            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                baseline_resp = await self._send(client, method, target_url, parameter, baseline_value)
                baseline_len = len(baseline_resp.text)
                baseline_status = baseline_resp.status_code

            results: List[Dict[str, Any]] = []
            vulnerabilities: List[str] = []

            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                for label, payload in payloads:
                    try:
                        resp = await self._send(client, method, target_url, parameter, payload)
                        body_lower = resp.text.lower()

                        error_detected = any(pat in body_lower for pat in SQL_ERROR_PATTERNS)
                        len_delta = abs(len(resp.text) - baseline_len)
                        status_anomaly = resp.status_code != baseline_status
                        reflected = payload.lower() in body_lower

                        vulnerable = error_detected or (len_delta > 50 and status_anomaly) or (error_detected and reflected)

                        entry = {
                            "label": label,
                            "payload": payload,
                            "status_code": resp.status_code,
                            "response_length": len(resp.text),
                            "length_delta": len_delta,
                            "error_detected": error_detected,
                            "status_anomaly": status_anomaly,
                            "vulnerable": vulnerable,
                        }
                        results.append(entry)
                        if vulnerable:
                            vulnerabilities.append(label)

                    except httpx.RequestError as e:
                        results.append({"label": label, "payload": payload, "error": str(e), "vulnerable": False})

                    await asyncio.sleep(0.05)

            is_vulnerable = len(vulnerabilities) > 0
            output = {
                **context,
                "target_url": target_url,
                "parameter": parameter,
                "method": method,
                "is_vulnerable": is_vulnerable,
                "vulnerability_count": len(vulnerabilities),
                "vulnerable_payloads": vulnerabilities,
                "total_payloads_tested": len(results),
                "baseline_status": baseline_status,
                "baseline_length": baseline_len,
                "scan_results": results,
                "node_type": "sql-injection-scanner",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            err = str(e)
            output = {**(message.context or {}), "error": err}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _send(self, client: httpx.AsyncClient, method: str, url: str, param: str, value: str) -> httpx.Response:
        if method == "GET":
            return await client.get(url, params={param: value})
        return await client.post(url, data={param: value})

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
