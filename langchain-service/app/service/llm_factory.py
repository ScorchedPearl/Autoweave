import os
import logging
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger(__name__)

class LLMFactory:
    """Factory to return modular LangChain chat models based on available API keys in Redis."""
    
    def __init__(self, redis_service):
        self.redis_service = redis_service

    async def get_llm_client(self, execution_id: str, temperature: float = 0.7, max_tokens: int = 2048) -> BaseChatModel:
        """Determines which API key is available in the workflow execution and returns the corresponding LangChain Chat model."""

        # Check OpenAI
        openai_key = await self.redis_service.get(f"execution:{execution_id}:openai_api_key")
        if not openai_key:
            openai_key = await self.redis_service.get("openai_api_key")
        if not openai_key:
            openai_key = os.getenv("OPENAI_API_KEY")

        if openai_key:
            logger.info(f"✅ Using OpenAI for execution: {execution_id}")
            return ChatOpenAI(
                api_key=openai_key,
                model="gpt-3.5-turbo",
                temperature=temperature,
                max_tokens=max_tokens,
                request_timeout=90,
            )

        # Check Gemini
        gemini_key = await self.redis_service.get(f"execution:{execution_id}:gemini_api_key")
        if not gemini_key:
            gemini_key = await self.redis_service.get("gemini_api_key")
        if not gemini_key:
            gemini_key = os.getenv("GEMINI_API_KEY")

        if gemini_key:
            logger.info(f"✅ Using Google Gemini for execution: {execution_id}")
            return ChatGoogleGenerativeAI(
                google_api_key=gemini_key,
                model="gemini-2.5-flash",
                temperature=temperature,
                max_output_tokens=max_tokens,
                request_timeout=90,
            )

        # Check Claude
        claude_key = await self.redis_service.get(f"execution:{execution_id}:claude_api_key")
        if not claude_key:
            claude_key = await self.redis_service.get("claude_api_key")
        if not claude_key:
            claude_key = os.getenv("ANTHROPIC_API_KEY")

        if claude_key:
            logger.info(f"✅ Using Anthropic Claude for execution: {execution_id}")
            return ChatAnthropic(
                api_key=claude_key,
                model="claude-3-haiku-20240307",
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=90,
            )

        raise ValueError("No API key found for OpenAI, Gemini, or Claude in Redis or Environment.")

    async def get_provider_name(self, execution_id: str) -> str:
        """Helper to return the provider name for logging."""
        if await self.redis_service.get(f"execution:{execution_id}:openai_api_key") or await self.redis_service.get("openai_api_key"): return "openai"
        if await self.redis_service.get(f"execution:{execution_id}:gemini_api_key") or await self.redis_service.get("gemini_api_key"): return "gemini"
        if await self.redis_service.get(f"execution:{execution_id}:claude_api_key") or await self.redis_service.get("claude_api_key"): return "claude"
        return "unknown"
