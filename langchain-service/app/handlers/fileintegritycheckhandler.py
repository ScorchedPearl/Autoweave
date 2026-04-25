import hashlib
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class FileIntegrityCheckHandler(BaseNodeHandler):
    """Hashes input content and compares it against an expected hash to detect tampering."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing File Integrity Check Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            content = self.substitute_template_variables(str(node_data.get("content", "")), context)
            expected_hash = self.substitute_template_variables(str(node_data.get("expected_hash", "")), context).strip().lower()
            algorithm = str(node_data.get("algorithm", "sha256")).lower().replace("-", "_")
            label = self.substitute_template_variables(str(node_data.get("label", "file")), context)

            if not content:
                raise ValueError("content is required")

            raw = content.encode("utf-8")
            actual_hash = hashlib.new(algorithm, raw).hexdigest()

            tampered = False
            match_result = "no_baseline"
            if expected_hash:
                tampered = actual_hash != expected_hash
                match_result = "match" if not tampered else "mismatch"

            output = {
                **context,
                "label": label,
                "actual_hash": actual_hash,
                "expected_hash": expected_hash or None,
                "algorithm": algorithm,
                "tampered": tampered,
                "match_result": match_result,
                "content_length_bytes": len(raw),
                "node_type": "file-integrity-check",
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
