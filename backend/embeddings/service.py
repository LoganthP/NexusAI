"""
Embedding service — generates vector embeddings for text chunks.
Uses the high-quality local HuggingFace `BAAI/bge-large-en` model for offline RAG processing.
"""
from typing import List

_embedder = None

def get_embedder():
    """Lazy-load the BGE embeddings model into memory."""
    global _embedder
    if _embedder is None:
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
        except ImportError:
            raise ImportError("Please run: pip install langchain-huggingface")

        _embedder = HuggingFaceEmbeddings(
            model_name="BAAI/bge-base-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
    return _embedder

def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of text chunks."""
    embedder = get_embedder()
    return embedder.embed_documents(texts)

def embed_query(text: str) -> List[float]:
    """Embed a single query text."""
    embedder = get_embedder()
    return embedder.embed_query(text)

