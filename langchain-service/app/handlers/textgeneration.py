import logging
import time
import asyncio
import os
from datetime import datetime, timezone
from typing import Dict, Any
from app.handlers.basehandler import BaseNodeHandler
from app.models.workflow_message import NodeExecutionMessage, NodeCompletionMessage
from app.core.config import settings
from app.service.llm_factory import LLMFactory
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)

class TextGenerationHandler(BaseNodeHandler):
    """Modular text generation handler using Langchain for OpenAI, Gemini, and Claude."""
    
    def __init__(self, redis_service):
        super().__init__(redis_service)
        logger.info("🔧 Initializing modular text generation handler...")
        
        self.llm_factory = LLMFactory(redis_service)
        self.max_tokens_limit = 4096
        
        logger.info(f"✅ Text generation handler initialized - Max tokens: {self.max_tokens_limit}")

    async def execute(self, message: NodeExecutionMessage) -> Dict[str, Any]:
        """Generate text using Langchain Model determined by API Key availability"""
        start_time = time.time()
        logger.info(f"🚀 Executing modular text-generation node: {message.nodeId}")

        try:
      
            execution_id = str(message.executionId)

            node_data = message.nodeData
            context = message.context or {}

            raw_prompt = node_data.get("prompt", "Hello, how are you?")
            prompt = self.substitute_template_variables(raw_prompt, context)

            requested_tokens = int(node_data.get("max_tokens", self.max_tokens_limit))
            # Floor at 1024 so stale small values saved in old workflows don't truncate output
            max_tokens = max(min(requested_tokens, self.max_tokens_limit), 1024)

            if requested_tokens > self.max_tokens_limit:
                logger.warning(f"⚠️ Requested {requested_tokens} tokens, capped to {self.max_tokens_limit}")

            temperature = node_data.get("temperature", 0.7)

            client = await self.llm_factory.get_llm_client(execution_id, temperature, max_tokens)
            logger.info(f"🤖 Generating with Modular LLM, max_tokens: {max_tokens}")

           
            generated_text = await self._generate_text(prompt, client)

            
            api_key_source = await self._determine_api_key_source(execution_id)

        
            output = {
                **context,
                "generated_text": generated_text,
                "full_text": f"{prompt} {generated_text}",
                "original_prompt": prompt,
                "node_type": "text-generation",
                "node_executed_at": datetime.now().isoformat(),
                "api_key_source": api_key_source,
                "execution_id": execution_id,
                "parameters": {
                    "max_tokens": max_tokens,
                    "temperature": temperature
                }
            }

            processing_time = int((time.time() - start_time) * 1000)
            await self._publish_completion_event(message, output, "COMPLETED", processing_time)

            logger.info(f"✅ Generated {len(generated_text)} chars in {processing_time}ms")
            return output

        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(f"❌ Generation failed: {e}")

            error_output = {
                **context,
                "error": str(e),
                "generated_text": None,
                "original_prompt": node_data.get("prompt", ""),
                "node_type": "text-generation",
                "execution_id": str(message.executionId)
            }

            await self._publish_completion_event(message, error_output, "FAILED", processing_time)
            raise

    async def _determine_api_key_source(self, execution_id: str) -> str:
        """Determine which source the API key came from for logging"""
        return await self.llm_factory.get_provider_name(execution_id)

    async def _generate_text(self, prompt: str, client) -> str:
        """Call Langchain model with provided client"""
        
        def _call_llm():
            try:
                response = client.invoke([HumanMessage(content=prompt)])
                return response.content
                
            except Exception as e:
                raise RuntimeError(f"LangChain LLM error: {e}")

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call_llm)

    async def _publish_completion_event(self, message: NodeExecutionMessage,
                                        output: Dict[str, Any], status: str, processing_time: int):
        """Publish completion event"""
        try:
            from app.main import app
            
            completion_message = NodeCompletionMessage(
                executionId=message.executionId,
                workflowId=message.workflowId,
                nodeId=message.nodeId,
                nodeType=message.nodeType,
                status=status,
                output=output,
                error=output.get("error") if status == "FAILED" else None,
                timestamp=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z'),
                processingTime=processing_time
            )
            
            if hasattr(app.state, 'kafka_service'):
                await app.state.kafka_service.publish_completion(completion_message)
                
        except Exception as e:
            logger.error(f"❌ Failed to publish event: {e}")

    def update_token_limit(self, new_limit: int):
        """Update the token limit"""
        old_limit = self.max_tokens_limit
        self.max_tokens_limit = new_limit
        logger.info(f"🔧 Token limit updated: {old_limit} -> {new_limit}")
        return {"old_limit": old_limit, "new_limit": new_limit}

    async def update_api_key_in_redis(self, new_api_key: str, execution_id: str = None):
        """Deprecated."""
        pass