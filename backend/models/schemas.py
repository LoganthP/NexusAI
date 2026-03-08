from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None

class SourceNode(BaseModel):
    text: str
    metadata: dict
    score: float

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceNode]
    mode: str = "rag"   # "rag" = answered from documents | "general" = general AI knowledge

class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    message: str

class AnalyticsStats(BaseModel):
    total_queries: int
    total_documents: int
    total_embeddings: int
    average_response_time: float
    top_documents: List[dict]
    query_trends: List[dict]
    response_latency: List[dict]
