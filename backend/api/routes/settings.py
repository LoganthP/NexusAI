import json
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

SETTINGS_FILE = "./data/settings.json"

DEFAULT_SETTINGS = {
    "model": "GPT-4o",
    "vector_store": "NumpyVectorDB (Local)",
    "embeddings": "text-embedding-3-small",
    "top_k": 3,
    "chunk_size": 1000,
    "chunk_overlap": 200,
}


def _load_settings() -> dict:
    """Load settings from JSON sidecar file, falling back to defaults."""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                saved = json.load(f)
                merged = {**DEFAULT_SETTINGS, **saved}
                return merged
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)


def _save_settings(data: dict):
    """Persist settings to JSON sidecar file."""
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)


class RAGSettings(BaseModel):
    model: Optional[str] = None
    vector_store: Optional[str] = None
    embeddings: Optional[str] = None
    top_k: Optional[int] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None


@router.get("/")
async def get_settings():
    """Return current RAG configuration."""
    return _load_settings()


@router.put("/")
async def update_settings(payload: RAGSettings):
    """Update editable RAG parameters (top_k, chunk_size, chunk_overlap)."""
    current = _load_settings()
    if payload.model is not None:
        current["model"] = payload.model
    if payload.vector_store is not None:
        current["vector_store"] = payload.vector_store
    if payload.embeddings is not None:
        current["embeddings"] = payload.embeddings
    if payload.top_k is not None:
        val: int = payload.top_k
        current["top_k"] = max(1, min(20, val))
    if payload.chunk_size is not None:
        val: int = payload.chunk_size
        current["chunk_size"] = max(100, min(4000, val))
    if payload.chunk_overlap is not None:
        val: int = payload.chunk_overlap
        current["chunk_overlap"] = max(0, min(int(current.get("chunk_size", 1000)) // 2, val))
    _save_settings(current)
    return {"message": "Settings saved successfully", "settings": current}
