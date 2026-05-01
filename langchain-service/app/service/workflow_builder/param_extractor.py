"""
Pure Python / regex param extractor.

Given an intent phrase (e.g. "translate to french") and the matched
node type (e.g. "translation"), applies the node's param_rules to
extract concrete field values that override the default_config.

No AI involved — completely deterministic.
"""

import re
import logging
from typing import Dict, Any

from app.service.workflow_builder.node_catalog import NODE_CATALOG

logger = logging.getLogger(__name__)


def extract_params(intent_phrase: str, node_type: str) -> Dict[str, Any]:
    """
    Run all param_rules for the given node_type against the intent_phrase.
    Returns a dict of {field_key: extracted_value} for any rules that matched.
    """
    entry = NODE_CATALOG.get(node_type)
    if not entry:
        return {}

    phrase_lower = intent_phrase.lower()
    overrides: Dict[str, Any] = {}

    for pattern, field, group in entry.get("param_rules", []):
        match = re.search(pattern, phrase_lower, re.IGNORECASE)
        if match:
            try:
                value = match.group(group)
<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
                value = _normalise(field, value)
                overrides[field] = value
                logger.debug(
                    "param_extractor: %s.%s = %r  (pattern=%r)",
                    node_type, field, value, pattern,
                )
            except IndexError:
                pass

    return overrides



<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
_LANG_MAP = {
    "fr": "french", "es": "spanish", "de": "german", "ja": "japanese",
    "zh": "chinese", "ar": "arabic", "ko": "korean", "ru": "russian",
    "hi": "hindi", "pt": "portuguese", "it": "italian", "en": "english",
}

_DB_MAP = {
    "postgresql": "postgres",
    "mongodb": "mongo",
}

_CONTENT_TYPE_MAP = {
    "blog": "blog_post",
    "social": "social_media",
    "product": "product_description",
    "press": "press_release",
}

_ALGORITHM_MAP = {
    "minibatch": "minibatch-kmeans",
    "mini batch": "minibatch-kmeans",
}


def _normalise(field: str, value: str) -> Any:
    v = value.strip().lower()

    if field == "target_language":
        return _LANG_MAP.get(v, v)

    if field == "source_language":
        return _LANG_MAP.get(v, v)

    if field == "db_type":
        return _DB_MAP.get(v, v)

    if field == "content_type":
        return _CONTENT_TYPE_MAP.get(v, v)

    if field == "algorithm" and v in _ALGORITHM_MAP:
        return _ALGORITHM_MAP[v]

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    if field in (
        "max_tokens", "max_results", "n_clusters", "num_tests",
        "max_iterations", "max_attempts", "maxResults", "duration",
        "n_estimators",
    ):
        try:
            return int(v)
        except ValueError:
            pass

    if field in ("contamination", "confidence_threshold", "temperature", "eps"):
        try:
            return float(v)
        except ValueError:
            pass

    return value.strip()
