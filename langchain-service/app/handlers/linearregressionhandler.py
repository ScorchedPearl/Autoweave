import logging
import time
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class LinearRegressionHandler(BaseNodeHandler):
    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing Linear Regression Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            X_train = self._resolve_json(node_data.get("X_train", ""), context, "X_train")
            y_train = self._resolve_json(node_data.get("y_train", ""), context, "y_train")
            X_predict_raw = node_data.get("X_predict", "")
            X_predict = self._resolve_json(X_predict_raw, context) if X_predict_raw else None

            if X_train is None or y_train is None:
                raise ValueError("X_train and y_train are required for linear regression")

            def _run():
                import numpy as np
                from sklearn.linear_model import LinearRegression
                from sklearn.metrics import r2_score

                X = np.array(X_train, dtype=float)
                y = np.array(y_train, dtype=float).ravel()
                if X.ndim == 1:
                    X = X.reshape(-1, 1)

                model = LinearRegression()
                model.fit(X, y)
                y_pred_train = model.predict(X)
                score = float(r2_score(y, y_pred_train))

                result = {
                    "coefficients": model.coef_.tolist(),
                    "intercept": float(model.intercept_),
                    "r2_score": score,
                    "n_train_samples": len(y),
                }
                if X_predict is not None:
                    Xp = np.array(X_predict, dtype=float)
                    if Xp.ndim == 1:
                        Xp = Xp.reshape(-1, 1)
                    result["predictions"] = model.predict(Xp).tolist()
                    result["n_predictions"] = len(result["predictions"])
                return result

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _run)

            output = {**context, **result, "node_type": "linear-regression", "node_executed_at": datetime.now().isoformat()}
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except Exception as e:
            await self._publish_completion_event(message, {**(message.context or {}), "error": str(e)}, "FAILED", int((time.time() - start_time) * 1000))
            raise

    def _resolve_json(self, raw, context, ctx_key=None):
        if isinstance(raw, str):
            raw = self.substitute_template_variables(raw, context)
            if raw.strip():
                return json.loads(raw)
            if ctx_key and ctx_key in context:
                return context[ctx_key]
            return None
        return raw

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