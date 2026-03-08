from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, SourceNode
import time

router = APIRouter()

# In-memory stats tracker
query_log = []

@router.post("/", response_model=ChatResponse)
async def chat_with_docs(request: ChatRequest):
    start_time = time.time()
    try:
        from rag.query_pipeline import query_rag
        result = query_rag(request.query)
        elapsed = time.time() - start_time
        query_log.append({
            "query": request.query,
            "time": elapsed,
            "timestamp": time.time(),
        })
        return ChatResponse(
            answer=result["answer"],
            sources=[
                SourceNode(
                    text=s["text"],
                    metadata=s["metadata"],
                    score=s["score"],
                )
                for s in result.get("sources", [])
            ],
            mode=result.get("mode", "rag"),
        )
    except Exception as e:
        # Fallback mock response if pipeline isn't ready
        return ChatResponse(
            answer=(
                f"Thank you for your query: *\"{request.query}\"*\n\n"
                "The RAG pipeline is initializing. Please ensure:\n"
                "1. Documents have been uploaded via the Document Manager\n"
                "2. The `sentence-transformers` package is installed\n\n"
                f"*Technical detail: {str(e)[:200]}*"
            ),
            sources=[],
        )
