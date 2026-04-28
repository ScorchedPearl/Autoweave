import logging
import re
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)

ETH_PATTERN = re.compile(r"^0x[0-9a-fA-F]{40}$")
BTC_PATTERN = re.compile(r"^(1|3)[1-9A-HJ-NP-Za-km-z]{25,34}$|^bc1[0-9a-z]{6,87}$")
SOL_PATTERN = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")


class WalletValidatorHandler(BaseNodeHandler):
    """Validates a cryptocurrency wallet address (ETH / BTC / SOL) without any API calls."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Wallet Validator Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            address = self.substitute_template_variables(str(node_data.get("address", "")), context).strip()
            chain = str(node_data.get("chain", "eth")).lower()

            if not address:
                raise ValueError("address is required")

            is_valid, address_type, checksum = self._validate(address, chain)

            output = {
                **context,
                "address": address,
                "chain": chain,
                "is_valid": is_valid,
                "address_type": address_type,
                "checksum_address": checksum,
                "node_type": "wallet-validator",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            err = str(e)
            output = {**(message.context or {}), "error": err, "is_valid": False}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    def _validate(self, address: str, chain: str):
        checksum = ""
        if chain == "eth":
            is_valid = bool(ETH_PATTERN.match(address))
            address_type = "ERC-20 / EOA" if is_valid else "invalid"
            if is_valid:
                try:
                    checksum = self._eth_checksum(address)
                except Exception:
                    checksum = address
            return is_valid, address_type, checksum

        if chain == "btc":
            if re.match(r"^bc1", address):
                is_valid = bool(BTC_PATTERN.match(address))
                address_type = "bech32 (SegWit)" if is_valid else "invalid"
            elif address.startswith("3"):
                is_valid = bool(BTC_PATTERN.match(address))
                address_type = "P2SH" if is_valid else "invalid"
            elif address.startswith("1"):
                is_valid = bool(BTC_PATTERN.match(address))
                address_type = "P2PKH (legacy)" if is_valid else "invalid"
            else:
                is_valid = False
                address_type = "invalid"
            return is_valid, address_type, address if is_valid else ""

        if chain == "sol":
            is_valid = bool(SOL_PATTERN.match(address))
            address_type = "Solana account" if is_valid else "invalid"
            return is_valid, address_type, address if is_valid else ""

        return False, "unsupported chain", ""

    @staticmethod
    def _eth_checksum(address: str) -> str:
        import hashlib
        addr = address.lower().replace("0x", "")
        hashed = hashlib.sha3_256(addr.encode()).hexdigest()
        result = "0x"
        for i, ch in enumerate(addr):
            if ch.isdigit():
                result += ch
            elif int(hashed[i], 16) >= 8:
                result += ch.upper()
            else:
                result += ch.lower()
        return result

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
