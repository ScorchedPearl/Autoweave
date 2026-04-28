"""
Workflow assembler — fully deterministic, zero AI.

Given an ordered list of (node_type, intent_phrase) pairs it builds the
React-Flow-compatible nodes and edges JSON that the frontend can load
directly into setNodes / setEdges.

Output wiring rules:
  - Every workflow is prepended with a "start" node.
  - For each node that has an input_key in the catalog, the upstream
    node's output_key is injected as "{{output_key}}" into that field
    (only when the current config value is still the generic "{{text}}"
     or "{{data}}" placeholder, or is empty).
  - "ai-decision" and "condition" nodes produce two outgoing edges
    (true/false branches) pointing to the same next node (the user can
    re-wire in the canvas if needed).

Node position layout (left-to-right, clean spacing):
  x = 80 + index * 320
  y = 200  (all on one row; branching nodes offset their label only)
"""

import copy
import logging
from typing import Any, Dict, List, Tuple

from app.service.workflow_builder.node_catalog import NODE_CATALOG
from app.service.workflow_builder.param_extractor import extract_params

logger = logging.getLogger(__name__)

# Placeholders that are safe to replace with a wired upstream variable
_GENERIC_PLACEHOLDERS = {"{{text}}", "{{data}}", "{{labels}}", "{{document}}", ""}

# Node types that have two outgoing branches
_BRANCHING_TYPES = {"ai-decision", "condition"}

X_START = 80
X_STEP = 320
Y_BASE = 200


def build_workflow(
    intent_node_pairs: List[Tuple[str, str]],
) -> Dict[str, Any]:
    """
    Parameters
    ----------
    intent_node_pairs : list of (node_type, intent_phrase)
        Ordered list where each tuple is the matched node type and the
        original phrase used to match it (for param extraction).

    Returns
    -------
    {"nodes": [...], "edges": [...]}  — React Flow format
    """

    # Always start with the start node
    steps: List[Tuple[str, str]] = [("start", "start")] + list(intent_node_pairs)

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    prev_output_key: str | None = None

    for idx, (node_type, phrase) in enumerate(steps):
        entry = NODE_CATALOG.get(node_type)
        if not entry:
            logger.warning("assembler: unknown node type %r — skipping", node_type)
            continue

        node_id = f"gen-{idx}"

        # Deep-copy defaults so we never mutate the catalog
        config: Dict[str, Any] = copy.deepcopy(entry.get("default_config", {}))

        # 1. Apply regex-extracted params from the intent phrase
        if phrase and phrase != "start":
            overrides = extract_params(phrase, node_type)
            config.update(overrides)

        # 2. Wire upstream output into this node's primary input field
        input_key = entry.get("input_key")
        if input_key and prev_output_key:
            current_val = str(config.get(input_key, ""))
            if current_val in _GENERIC_PLACEHOLDERS or current_val.startswith("{{"):
                config[input_key] = f"{{{{{prev_output_key}}}}}"

        # 3. Build the React Flow node
        # Every generated node gets a standard input handle ("input") and output handle ("output")
        # so React Flow can anchor edges.  The start node has no input handle.
        is_start = node_type == "start"
        node_inputs = [] if is_start else [
            {"id": "input", "label": "Input", "type": "string", "required": True}
        ]
        node_outputs = [
            {"id": "output", "label": "Output", "type": "string", "required": False}
        ]

        rf_node: Dict[str, Any] = {
            "id": node_id,
            "type": "workflowNode",
            "position": {"x": X_START + idx * X_STEP, "y": Y_BASE},
            "data": {
                "id": node_id,
                "label": entry["label"],
                "nodeType": node_type,
                "icon": entry["icon"],
                "description": entry.get("embedding_text", "")[:80],
                "config": config,
                "inputs": node_inputs,
                "outputs": node_outputs,
            },
        }
        nodes.append(rf_node)

        # 4. Wire edge from previous node using explicit handle IDs
        if idx > 0:
            prev_id = f"gen-{idx - 1}"
            prev_type = steps[idx - 1][0]

            if prev_type in _BRANCHING_TYPES:
                edges.append({
                    "id": f"e-{prev_id}-{node_id}-true",
                    "source": prev_id,
                    "target": node_id,
                    "sourceHandle": "true",
                    "targetHandle": "input",
                    "label": "true",
                })
                edges.append({
                    "id": f"e-{prev_id}-{node_id}-false",
                    "source": prev_id,
                    "target": node_id,
                    "sourceHandle": "false",
                    "targetHandle": "input",
                    "label": "false",
                })
            else:
                edges.append({
                    "id": f"e-{prev_id}-{node_id}",
                    "source": prev_id,
                    "target": node_id,
                    "sourceHandle": "output",
                    "targetHandle": "input",
                })

        # 5. Advance the upstream output key
        output_key = entry.get("output_key")
        if output_key:
            prev_output_key = output_key

    return {"nodes": nodes, "edges": edges}
