import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

COMMON_PORT_NAMES: Dict[int, str] = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
    80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB",
    993: "IMAPS", 995: "POP3S", 1433: "MSSQL", 3306: "MySQL",
    3389: "RDP", 5432: "PostgreSQL", 5900: "VNC", 6379: "Redis",
    8080: "HTTP-Alt", 8443: "HTTPS-Alt", 27017: "MongoDB",
}


class PortScannerHandler(BaseNodeHandler):
    """Async TCP port scanner — returns open/closed status for each port."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Port Scanner Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            host = self.substitute_template_variables(str(node_data.get("host", "")), context).strip()
            if not host:
                raise ValueError("host is required")

            ports_raw = self.substitute_template_variables(str(node_data.get("ports", "22,80,443,8080")), context)
            ports = self._parse_ports(ports_raw)
            if not ports:
                raise ValueError("No valid ports specified")
            if len(ports) > 200:
                raise ValueError("Max 200 ports per scan")

            timeout = float(node_data.get("timeout_ms", 1000)) / 1000.0

            results = await self._scan_ports(host, ports, timeout)

            open_ports = [r for r in results if r["status"] == "open"]
            closed_ports = [r for r in results if r["status"] != "open"]

            output = {
                **context,
                "host": host,
                "open_ports": open_ports,
                "closed_ports": [r["port"] for r in closed_ports],
                "open_count": len(open_ports),
                "total_scanned": len(ports),
                "scan_summary": f"{len(open_ports)}/{len(ports)} ports open on {host}",
                "node_type": "port-scanner",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            err = str(e)
            output = {**(message.context or {}), "error": err}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    def _parse_ports(self, raw: str) -> List[int]:
        ports = set()
        for part in raw.replace(" ", "").split(","):
            if "-" in part:
                lo, hi = part.split("-", 1)
                ports.update(range(int(lo), int(hi) + 1))
            elif part.isdigit():
                ports.add(int(part))
        return sorted(p for p in ports if 1 <= p <= 65535)

    async def _scan_ports(self, host: str, ports: List[int], timeout: float) -> List[Dict[str, Any]]:
        sem = asyncio.Semaphore(50)

        async def probe(port: int) -> Dict[str, Any]:
            async with sem:
                try:
                    _, writer = await asyncio.wait_for(
                        asyncio.open_connection(host, port), timeout=timeout
                    )
                    writer.close()
                    try:
                        await writer.wait_closed()
                    except Exception:
                        pass
                    return {"port": port, "status": "open", "service": COMMON_PORT_NAMES.get(port, "")}
                except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
                    return {"port": port, "status": "closed", "service": COMMON_PORT_NAMES.get(port, "")}

        return await asyncio.gather(*[probe(p) for p in ports])

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
