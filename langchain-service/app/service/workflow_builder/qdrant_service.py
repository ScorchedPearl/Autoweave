"""
Qdrant vector search service for node matching.

On startup:
  - Connects to Qdrant (localhost:6333 by default)
  - Creates a collection called "nodes" if it doesn't exist
  - Upserts one vector per node type (embedding_text → sentence-transformers)

On query:
  - Embeds the query string with the same model
  - Returns the closest node type (top-1 nearest neighbour)
"""

import logging
from typing import List, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)
from sentence_transformers import SentenceTransformer

from app.service.workflow_builder.node_catalog import NODE_CATALOG, ALL_NODE_TYPES

logger = logging.getLogger(__name__)

COLLECTION_NAME = "nodes"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  
VECTOR_SIZE = 384


class QdrantNodeService:
    def __init__(self, host: str = "localhost", port: int = 6333):
        self._host = host
        self._port = port
        self._client: Optional[QdrantClient] = None
        self._model: Optional[SentenceTransformer] = None

    

    def initialize(self) -> None:
        """Load the embedding model and seed Qdrant. Call once at startup."""
        logger.info("Loading sentence-transformers model %s …", EMBEDDING_MODEL)
        self._model = SentenceTransformer(EMBEDDING_MODEL)

        logger.info("Connecting to Qdrant at %s:%s …", self._host, self._port)
        self._client = QdrantClient(host=self._host, port=self._port)

        self._ensure_collection()
        self._seed_nodes()
        logger.info("QdrantNodeService ready (%d nodes indexed)", len(ALL_NODE_TYPES))

   
    def _ensure_collection(self) -> None:
        existing = {c.name for c in self._client.get_collections().collections}
        if COLLECTION_NAME not in existing:
            self._client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            logger.info("Created Qdrant collection '%s'", COLLECTION_NAME)

    def _seed_nodes(self) -> None:
        texts = [NODE_CATALOG[t]["embedding_text"] for t in ALL_NODE_TYPES]
        vectors = self._model.encode(texts, show_progress_bar=False).tolist()

        points = [
            PointStruct(
                id=idx,
                vector=vectors[idx],
                payload={"node_type": node_type},
            )
            for idx, node_type in enumerate(ALL_NODE_TYPES)
        ]
        self._client.upsert(collection_name=COLLECTION_NAME, points=points)
        logger.debug("Upserted %d node embeddings into Qdrant", len(points))

  
    def find_node_type(self, query: str, top_k: int = 1) -> List[str]:
        """
        Return the top_k most semantically similar node types for a query string.
        Raises RuntimeError if not yet initialised.
        """
        if self._model is None or self._client is None:
            raise RuntimeError("QdrantNodeService not initialised — call initialize() first")

        vector = self._model.encode([query], show_progress_bar=False)[0].tolist()
        try:
            response = self._client.query_points(
                collection_name=COLLECTION_NAME,
                query=vector,
                limit=top_k,
            )
            hits = response.points
        except AttributeError:
            hits = self._client.search(  
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                limit=top_k,
            )
        return [r.payload["node_type"] for r in hits]

    def find_node_type_single(self, query: str) -> str:
        """Convenience wrapper — returns the single best-matching node type."""
        matches = self.find_node_type(query, top_k=1)
        return matches[0] if matches else "text-generation"
