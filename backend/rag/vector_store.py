from utils.patches import apply_patches
apply_patches()

import os
import duckdb
import numpy as np
import json
from typing import List, Dict, Any, Optional

_db_conn = None

def get_connection():
    global _db_conn
    if _db_conn is None:
        db_path = os.getenv("DUCKDB_PATH", "./data/nexus_rag.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        _db_conn = duckdb.connect(db_path)
        
        # Initialize tables
        _db_conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                text TEXT,
                embedding FLOAT[],
                metadata JSON
            )
        """)
    return _db_conn

def add_documents(
    doc_id: str,
    chunks: List[str],
    embeddings: List[List[float]],
    metadata: Dict[str, Any],
):
    """Store document chunks with their embeddings in DuckDB."""
    conn = get_connection()
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        chunk_id = f"{doc_id}_chunk_{i}"
        meta = {
            "file_id": doc_id,
            "filename": metadata.get("filename", ""),
            "chunk_index": i,
            "file_type": metadata.get("file_type", ""),
        }
        conn.execute(
            "INSERT OR REPLACE INTO documents VALUES (?, ?, ?, ?)",
            [chunk_id, chunk, emb, json.dumps(meta)]
        )
    return len(chunks)

def query_documents(
    query_embedding: List[float],
    top_k: int = 5,
    filter_metadata: Optional[Dict] = None,
) -> List[Dict[str, Any]]:
    """Query the DuckDB store for similar documents using cosine similarity."""
    conn = get_connection()
    
    # DuckDB's list_cosine_similarity function is highly efficient
    # We select results where similarity > 0 (or a threshold)
    query = """
        SELECT text, metadata, 
               list_cosine_similarity(embedding, ?::FLOAT[]) as score
        FROM documents
        ORDER BY score DESC
        LIMIT ?
    """
    
    results = conn.execute(query, [query_embedding, top_k]).fetchall()
    
    documents = []
    for text, meta_json, score in results:
        documents.append({
            "text": text,
            "metadata": json.loads(meta_json),
            "score": float(score) if score is not None else 0.0,
        })
    return documents

def query_bm25(query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Query the store using BM25 for exact keyword matching."""
    try:
        from rank_bm25 import BM25Okapi
    except ImportError:
        return []
        
    conn = get_connection()
    all_data = conn.execute("SELECT text, metadata FROM documents").fetchall()
    
    if not all_data:
        return []

    all_docs = [r[0] for r in all_data]
    all_metas = [json.loads(r[1]) for r in all_data]

    # Simple tokenization
    tokenized_corpus = [doc.lower().split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = query_text.lower().split()
    doc_scores = bm25.get_scores(tokenized_query)
    
    top_n = min(top_k, len(all_docs))
    top_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:top_n]
    
    max_score = max(doc_scores) if len(doc_scores) > 0 else 1.0
    if max_score == 0:
        max_score = 1.0
        
    documents = []
    for i in top_indices:
        if doc_scores[i] == 0:
            continue
        documents.append({
            "text": all_docs[i],
            "metadata": all_metas[i],
            "score": float((doc_scores[i] / max_score) * 0.9), 
        })
    return documents

def delete_document(doc_id: str):
    """Delete all chunks for a document."""
    conn = get_connection()
    # We use JSON_EXTRACT to filter by file_id within the metadata blob
    conn.execute("DELETE FROM documents WHERE json_extract(metadata, '$.file_id') = ?", [doc_id])

def get_stats():
    """Get vector store statistics."""
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    return {"total_embeddings": count}
