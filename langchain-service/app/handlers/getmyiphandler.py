import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class GetMyIPHandler(BaseNodeHandler):
    """Returns the public IP of the workflow server with optional geo enrichment."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Get My IP Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}
            include_geo = str(node_data.get("include_geo", "true")).lower() == "true"

            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                ip_resp = await client.get("https://api.ipify.org?format=json")
                ip_resp.raise_for_status()
                public_ip = ip_resp.json().get("ip", "")

            geo_info: Dict[str, Any] = {}
            if include_geo and public_ip:
                try:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        geo_resp = await client.get(f"https://ipinfo.io/{public_ip}/json")
                        if geo_resp.status_code == 200:
                            data = geo_resp.json()
                            geo_info = {
                                "country": data.get("country", ""),
                                "region": data.get("region", ""),
                                "city": data.get("city", ""),
                                "org": data.get("org", ""),
                                "timezone": data.get("timezone", ""),
                                "loc": data.get("loc", ""),
                            }
                except Exception:
                    pass

            output = {
                **context,
                "public_ip": public_ip,
                **geo_info,
                "node_type": "get-my-ip",
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
