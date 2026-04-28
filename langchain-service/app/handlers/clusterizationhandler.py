import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class ClusterizationHandler(BaseNodeHandler):
    """Supports DBSCAN, Agglomerative (hierarchical), and Mini-Batch K-Means clustering."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Clusterization Handler")

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
                    raise ValueError("No data provided for clusterization")
            else:
                data = raw_data

            algorithm = node_data.get("algorithm", "dbscan").lower()
            eps = float(node_data.get("eps", 0.5))
            min_samples = int(node_data.get("min_samples", 5))
            n_clusters = int(node_data.get("n_clusters", 3))

            def _run():
                import numpy as np
                from sklearn.preprocessing import StandardScaler

                X = np.array(data, dtype=float)
                if X.ndim == 1:
                    X = X.reshape(-1, 1)

                X_scaled = StandardScaler().fit_transform(X)

                if algorithm == "dbscan":
                    from sklearn.cluster import DBSCAN
                    model = DBSCAN(eps=eps, min_samples=min_samples)
                    labels = model.fit_predict(X_scaled)
                    n_found = len(set(labels)) - (1 if -1 in labels else 0)
                    noise_count = int(np.sum(labels == -1))
                    return {"cluster_labels": labels.tolist(), "n_clusters_found": n_found, "noise_points": noise_count, "algorithm_used": "dbscan"}

                elif algorithm == "hierarchical":
                    from sklearn.cluster import AgglomerativeClustering
                    model = AgglomerativeClustering(n_clusters=n_clusters)
                    labels = model.fit_predict(X_scaled)
                    return {"cluster_labels": labels.tolist(), "n_clusters_found": n_clusters, "noise_points": 0, "algorithm_used": "hierarchical"}

                else:
                    from sklearn.cluster import MiniBatchKMeans
                    model = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, n_init=3)
                    labels = model.fit_predict(X_scaled)
                    return {"cluster_labels": labels.tolist(), "n_clusters_found": n_clusters, "noise_points": 0, "algorithm_used": "minibatch-kmeans", "inertia": float(model.inertia_)}

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _run)

            output = {**context, **result, "n_samples": len(data), "node_type": "clusterization", "node_executed_at": datetime.now().isoformat()}
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
