import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class KMeansHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing K-Means Handler")

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
                    raise ValueError("No data provided for k-means clustering")
            else:
                data = raw_data

            n_clusters = int(node_data.get("n_clusters", 3))
            max_iter = int(node_data.get("max_iter", 300))

            def _run():
                from sklearn.cluster import KMeans
                import numpy as np

                X = np.array(data, dtype=float)
                if X.ndim == 1:
                    X = X.reshape(-1, 1)

                model = KMeans(n_clusters=n_clusters, max_iter=max_iter, random_state=42, n_init=10)
                model.fit(X)
                return {
                    "cluster_labels": model.labels_.tolist(),
                    "centroids": model.cluster_centers_.tolist(),
                    "inertia": float(model.inertia_),
                    "n_clusters": n_clusters,
                    "n_samples": len(data),
                }

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _run)

            output = {**context, **result, "node_type": "k-means", "node_executed_at": datetime.now().isoformat()}
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
