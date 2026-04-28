import hashlib
import hmac
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

ALGORITHMS = {"md5", "sha1", "sha256", "sha512", "sha3_256", "blake2b"}


class HashGeneratorHandler(BaseNodeHandler):
    """Computes cryptographic hashes of input data using standard algorithms."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Hash Generator Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            data = self.substitute_template_variables(str(node_data.get("data", "")), context)
            algorithm = str(node_data.get("algorithm", "sha256")).lower().replace("-", "_")
            encoding = str(node_data.get("encoding", "utf-8"))
            hmac_secret = str(node_data.get("hmac_secret", "")).strip()
            output_format = str(node_data.get("output_format", "hex")).lower()

            if not data:
                raise ValueError("data is required")
            if algorithm not in ALGORITHMS:
                raise ValueError(f"Unsupported algorithm '{algorithm}'. Choose from: {', '.join(sorted(ALGORITHMS))}")

            raw = data.encode(encoding)

            if hmac_secret:
                digest = hmac.new(hmac_secret.encode(encoding), raw, algorithm).digest()
                hash_type = "hmac"
            else:
                h = hashlib.new(algorithm, raw)
                digest = h.digest()
                hash_type = "hash"

            if output_format == "base64":
                import base64
                result = base64.b64encode(digest).decode()
            else:
                result = digest.hex()

            output = {
                **context,
                "hash": result,
                "algorithm": algorithm,
                "hash_type": hash_type,
                "output_format": output_format,
                "input_length": len(raw),
                "digest_length_bytes": len(digest),
                "node_type": "hash-generator",
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
