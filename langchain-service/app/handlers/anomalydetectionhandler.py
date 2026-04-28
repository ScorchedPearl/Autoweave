import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class AnomalyDetectionHandler(BaseNodeHandler):
    """Isolation Forest anomaly detection on tabular numeric data."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Anomaly Detection Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            raw_data = node_data.get("data", "")
            if isinstance(raw_data, str):
                raw_data = self.substitute_template_variables(raw_data, context)
                if raw_data.strip():
                    data = json.loads(raw_data)
                elif "data" in context:
                    data = context["data"]
                else:
                    raise ValueError("No data provided for anomaly detection")
            else:
                data = raw_data

            contamination = float(node_data.get("contamination", 0.1))
            n_estimators = int(node_data.get("n_estimators", 100))

            def _run():
                import numpy as np
                from sklearn.ensemble import IsolationForest

                X = np.array(data, dtype=float)
                if X.ndim == 1:
                    X = X.reshape(-1, 1)

                model = IsolationForest(
                    contamination=contamination,
                    n_estimators=n_estimators,
                    random_state=42,
                )
                labels = model.fit_predict(X)
                scores = model.decision_function(X)
                anomaly_indices = [int(i) for i, l in enumerate(labels) if l == -1]

                return {
                    "anomaly_labels": labels.tolist(),
                    "anomaly_scores": scores.tolist(),
                    "anomaly_count": int(np.sum(labels == -1)),
                    "anomaly_indices": anomaly_indices,
                    "normal_count": int(np.sum(labels == 1)),
                    "n_samples": len(data),
                    "contamination": contamination,
                }

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _run)

            output = {**context, **result, "node_type": "anomaly-detection", "node_executed_at": datetime.now().isoformat()}
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