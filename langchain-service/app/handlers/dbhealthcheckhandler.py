import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any

from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage

logger = logging.getLogger(__name__)


class DBHealthCheckHandler(BaseNodeHandler):
    """Checks connectivity and latency for Postgres, MySQL, or MongoDB."""

    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("Initializing DB Health Check Handler")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        start_time = time.time()
        try:
            node_data = message.nodeData
            context = message.context or {}

            db_type = node_data.get("db_type", "postgres").lower()
            host = self.substitute_template_variables(str(node_data.get("host", "localhost")), context)
            port = node_data.get("port")
            database = self.substitute_template_variables(str(node_data.get("database", "")), context)
            username = self.substitute_template_variables(str(node_data.get("username", "")), context)
            password = str(node_data.get("password", ""))
            timeout = float(node_data.get("timeout_seconds", 5.0))

            check_start = time.time()
            result = await asyncio.wait_for(
                self._check(db_type, host, port, database, username, password),
                timeout=timeout,
            )
            latency_ms = round((time.time() - check_start) * 1000, 2)

            output = {
                **context,
                "status": "healthy",
                "db_type": db_type,
                "host": host,
                "port": port or result.get("default_port"),
                "latency_ms": latency_ms,
                "server_version": result.get("server_version", ""),
                "message": result.get("message", "Connection successful"),
                "node_type": "db-health-check",
                "node_executed_at": datetime.now().isoformat(),
            }
            await self._publish_completion_event(message, output, "COMPLETED", int((time.time() - start_time) * 1000))
            return output

        except asyncio.TimeoutError:
            err = f"Connection timed out after {node_data.get('timeout_seconds', 5)} seconds"
            output = {**(message.context or {}), "status": "unhealthy", "error": err}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise RuntimeError(err)
        except Exception as e:
            output = {**(message.context or {}), "status": "unhealthy", "error": str(e)}
            await self._publish_completion_event(message, output, "FAILED", int((time.time() - start_time) * 1000))
            raise

    async def _check(self, db_type: str, host: str, port, database: str, username: str, password: str) -> Dict[str, Any]:
        if db_type == "postgres":
            return await self._check_postgres(host, port or 5432, database, username, password)
        if db_type == "mysql":
            return await self._check_mysql(host, port or 3306, database, username, password)
        if db_type == "mongo":
            return await self._check_mongo(host, port or 27017, database, username, password)
        raise ValueError(f"Unsupported db_type: {db_type}. Use postgres, mysql, or mongo.")

    async def _check_postgres(self, host, port, database, username, password) -> Dict[str, Any]:
        try:
            import asyncpg
        except ImportError:
            raise RuntimeError("asyncpg is required for Postgres health checks. Run: pip install asyncpg")

        conn = await asyncpg.connect(
            host=host, port=int(port), database=database or "postgres",
            user=username, password=password,
        )
        try:
            version = await conn.fetchval("SELECT version()")
        finally:
            await conn.close()

        return {"server_version": version, "default_port": 5432, "message": "SELECT 1 OK"}

    async def _check_mysql(self, host, port, database, username, password) -> Dict[str, Any]:
        try:
            import aiomysql
        except ImportError:
            raise RuntimeError("aiomysql is required for MySQL health checks. Run: pip install aiomysql")

        conn = await aiomysql.connect(
            host=host, port=int(port), db=database or None,
            user=username, password=password,
        )
        try:
            async with conn.cursor() as cur:
                await cur.execute("SELECT VERSION()")
                row = await cur.fetchone()
                version = row[0] if row else ""
        finally:
            conn.close()

        return {"server_version": version, "default_port": 3306, "message": "SELECT VERSION() OK"}

    async def _check_mongo(self, host, port, database, username, password) -> Dict[str, Any]:
        try:
            import motor.motor_asyncio
        except ImportError:
            raise RuntimeError("motor is required for MongoDB health checks. Run: pip install motor")

        if username and password:
            uri = f"mongodb://{username}:{password}@{host}:{port}"
        else:
            uri = f"mongodb://{host}:{port}"

        client = motor.motor_asyncio.AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        try:
            info = await client.admin.command("ping")
            server_info = await client.admin.command("buildInfo")
            version = server_info.get("version", "")
        finally:
            client.close()

        return {"server_version": version, "default_port": 27017, "message": f"ping OK: {info}"}

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
