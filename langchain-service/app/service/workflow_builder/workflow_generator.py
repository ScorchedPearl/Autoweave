"""
Workflow generator — top-level orchestrator.

Two public functions:
  generate_from_prompt(prompt, api_key, provider)
    → AI mode: extract intents → Qdrant-match each → assemble → return

  generate_from_keywords(keywords)
    → Manual mode: Qdrant-match each keyword directly → assemble → return
    → Zero AI calls, 100% deterministic

Both return {"nodes": [...], "edges": [...]} ready for the frontend.
"""

import logging
from typing import Any, Dict, List

from app.service.workflow_builder.intent_extractor import extract_intents
from app.service.workflow_builder.assembler import build_workflow

logger = logging.getLogger(__name__)

# Module-level singleton — set once at app startup by main.py
_qdrant_service = None


def set_qdrant_service(service) -> None:
    global _qdrant_service
    _qdrant_service = service


def _require_qdrant():
    if _qdrant_service is None:
        raise RuntimeError("QdrantNodeService not wired — call set_qdrant_service() at startup")
    return _qdrant_service


# ──────────────────────────────────────────────────────────────────────
# AI mode
# ──────────────────────────────────────────────────────────────────────

def generate_from_prompt(
    prompt: str,
    api_key: str,
    provider: str = "openai",
) -> Dict[str, Any]:
    """
    Full AI-assisted pipeline:
      1. LLM extracts an ordered list of intent phrases (one call, tight constraint)
      2. Each phrase is matched to a node type via Qdrant semantic search
      3. Params are extracted by pure regex rules
      4. Assembler wires nodes + edges deterministically
    """
    qdrant = _require_qdrant()

    logger.info("generate_from_prompt: extracting intents via %s", provider)
    intents = extract_intents(prompt, api_key, provider)
    logger.info("generate_from_prompt: %d intents extracted: %s", len(intents), intents)

    pairs = _intents_to_pairs(intents, qdrant)
    return build_workflow(pairs)


# ──────────────────────────────────────────────────────────────────────
# Manual keyword mode
# ──────────────────────────────────────────────────────────────────────

def generate_from_keywords(keywords: List[str]) -> Dict[str, Any]:
    """
    Zero-AI pipeline:
      1. Each keyword is matched to a node type via Qdrant semantic search
      2. Params extracted by pure regex rules
      3. Assembler wires nodes + edges deterministically
    """
    qdrant = _require_qdrant()

    logger.info("generate_from_keywords: %d keywords received: %s", len(keywords), keywords)
    pairs = _intents_to_pairs(keywords, qdrant)
    return build_workflow(pairs)


# ──────────────────────────────────────────────────────────────────────
# Shared helper
# ──────────────────────────────────────────────────────────────────────

def _intents_to_pairs(intents: List[str], qdrant) -> List[tuple]:
    """Map each intent phrase to its best-matching node type."""
    pairs = []
    for phrase in intents:
        node_type = qdrant.find_node_type_single(phrase)
        logger.debug("  '%s' → %s", phrase, node_type)
        pairs.append((node_type, phrase))
    return pairs
