import asyncio
import logging
import ssl
import socket
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class SSLCertHandler(BaseNodeHandler):
    """Inspects a domain's TLS certificate: expiry, issuer, SANs, validity."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing SSL Cert Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            hostname = self.substitute_template_variables(str(node_data.get("hostname", "")), context).strip()
            if not hostname:
                raise ValueError("hostname is required")

            port = int(node_data.get("port", 443))
            timeout = float(node_data.get("timeout_seconds", 10.0))

            loop = asyncio.get_event_loop()
            cert_info = await asyncio.wait_for(
                loop.run_in_executor(None, self._fetch_cert, hostname, port, timeout),
                timeout=timeout + 2,
            )

            output = {
                **context,
                **cert_info,
                "node_type": "ssl-cert-checker",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            err = str(e)
            output = {**(message.context or {}), "error": err, "is_valid": False}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    def _fetch_cert(self, hostname: str, port: int, timeout: float) -> Dict[str, Any]:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        not_after_str = cert.get("notAfter", "")
        not_before_str = cert.get("notBefore", "")

        not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        not_before = datetime.strptime(not_before_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        days_remaining = (not_after - now).days

        subject = {k: v for tup in cert.get("subject", []) for k, v in tup}
        issuer = {k: v for tup in cert.get("issuer", []) for k, v in tup}

        sans = []
        for san_type, san_val in cert.get("subjectAltName", []):
            sans.append(f"{san_type}:{san_val}")

        return {
            "hostname": hostname,
            "port": port,
            "is_valid": days_remaining > 0,
            "days_until_expiry": days_remaining,
            "expiry_date": not_after.isoformat(),
            "issued_date": not_before.isoformat(),
            "subject_cn": subject.get("commonName", ""),
            "issuer_cn": issuer.get("commonName", ""),
            "issuer_org": issuer.get("organizationName", ""),
            "san_list": sans,
            "serial_number": str(cert.get("serialNumber", "")),
            "version": cert.get("version", 0),
        }

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
