from utils.patches import apply_patches
apply_patches()

import os
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load .env immediately
load_dotenv(override=True)



# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def _jaccard(a: str, b: str) -> float:
    """Compute word-level Jaccard similarity between two strings."""
    set_a = set(a.lower().split())
    set_b = set(b.lower().split())
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def deduplicate_results(results: List[Dict], similarity_threshold: float = 0.75) -> List[Dict]:
    """Remove near-duplicate chunks (Jaccard ≥ threshold keeps only the higher-scored one)."""
    kept = []
    for candidate in results:
        is_dup = False
        for existing in kept:
            if _jaccard(candidate["text"], existing["text"]) >= similarity_threshold:
                is_dup = True
                break
        if not is_dup:
            kept.append(candidate)
    return kept


# ---------------------------------------------------------------------------
# Reranking
# ---------------------------------------------------------------------------

def rerank_results(results: List[Dict], query: str) -> List[Dict]:
    """Simple reranking by score + keyword overlap."""
    query_words = set(query.lower().split())
    filtered = []

    threshold = 0.15
    for r in results:
        if r["score"] < threshold:
            continue
        text_words = set(r["text"].lower().split())
        overlap = len(query_words & text_words)
        overlap_score = overlap / max(len(query_words), 1)
        r["rerank_score"] = r["score"] * 0.5 + overlap_score * 0.5
        filtered.append(r)

    filtered.sort(key=lambda x: x["rerank_score"], reverse=True)
    return filtered


# ---------------------------------------------------------------------------
# Similarity threshold guard
# ---------------------------------------------------------------------------

# Gemini `text-embedding-004` naturally produces much lower cosine similarities (~0.3)
# than OpenAI's embeddings, so we lower the threshold to 0.25.
SIMILARITY_THRESHOLD = 0.25


def apply_similarity_threshold(
    results: List[Dict],
    threshold: float = SIMILARITY_THRESHOLD,
) -> List[Dict]:
    """Drop any chunk whose rerank_score (or raw score) is below the threshold.

    This prevents the LLM from hallucinating answers from weakly-matched chunks.
    If no results survive, the pipeline will return a clear 'not in documents' response.
    """
    above = [
        r for r in results
        if r.get("rerank_score", r["score"]) >= threshold
    ]
    return above


# ---------------------------------------------------------------------------
# Context builder
# ---------------------------------------------------------------------------

def build_context(results: List[Dict], max_chars: int = 8000) -> str:
    """Build context string from retrieved (deduplicated) documents."""
    if not results:
        return ""

    context_parts = []
    total_len = 0
    for r in results:
        text = r["text"].strip()
        if not text:
            continue
        if total_len + len(text) > max_chars:
            break
        source = r["metadata"].get("filename", "Unknown")
        context_parts.append(f"[Source: {source}]\n{text}")
        total_len += len(text)

    return "\n\n---\n\n".join(context_parts)


# ---------------------------------------------------------------------------
# LLM response generation
# ---------------------------------------------------------------------------

# Structured output format injected into every prompt
_RESPONSE_FORMAT = """
Your response MUST exactly follow this format:

Answer:
<clear explanation summarizing the information>

Key Points:
• point 1
• point 2
• point 3

Sources:
• Document_Name.pdf
"""

def generate_response(query: str, context: str, source_names: List[str] | None = None) -> str:
    """Generate LLM response using the RAG context with structured output."""
    from utils.config import settings
    has_context = bool(context.strip())

    system_prompt = (
        "You are Nexus AI Assistant. You can answer questions in two modes.\n\n"
        "Mode 1: Document Answer\n"
        "If the retrieved documents clearly contain information that answers the question:\n"
        "- Use the documents.\n"
        "- Summarize the information.\n"
        "- Cite the document sources.\n\n"
        "Mode 2: General Knowledge\n"
        "If the retrieved documents are unrelated or only weakly related:\n"
        "- Ignore the documents.\n"
        "- Answer using general knowledge.\n"
        "- Do NOT cite any sources.\n\n"
        "Rules:\n"
        "- Never force an answer from unrelated documents.\n"
        "- If documents do not clearly answer the question, use general knowledge.\n"
        "- Only show sources when they are actually used.\n"
        + _RESPONSE_FORMAT
    )



    # RAG mode only — context must be present here.
    user_prompt = (
        f"CONTEXT:\n{context}\n\n"
        f"QUESTION:\n{query}\n\n"
        "INSTRUCTION:\n"
        "Answer the question using the context. "
        "Follow the EXACT format requested."
    )

    try:
        return _generate_ollama(system_prompt, user_prompt)

    except Exception as e:
        print(f"Ollama inference failed: {e}")
        return _generate_fallback(query, context, source_names)


def generate_general_response(query: str) -> str:
    """Generates a general assistant response if no document context is found or needed.

    Called when no document chunks score above the similarity threshold.
    The response always ends with a 'Note' explaining it's general knowledge.
    """
    from langchain_ollama import OllamaLLM

    system_prompt = (
        "You are Nexus AI Assistant, an intelligent enterprise knowledge assistant.\n"
        "The user's question could not be answered from the uploaded documents because "
        "no relevant document chunks were found above the similarity threshold.\n\n"
        "Answer the question using your general knowledge.\n"
        "Your response MUST follow this exact format:\n\n"
        "Answer:\n"
        "<clear, helpful explanation from general knowledge>\n\n"
        "Key Points:\n"
        "• point 1\n"
        "• point 2\n"
        "• point 3\n\n"
        "Note:\n"
        "This answer is based on general AI knowledge because the uploaded documents "
        "do not contain relevant information about this topic."
    )
    user_prompt = f"Question: {query}"

    try:
        return _generate_ollama(system_prompt, user_prompt)
    except Exception as e:
        print(f"Ollama inference failed: {e}")

    # Fallback when no API key — return a polite general-mode placeholder
    return (
        f"Answer:\n"
        f"This question relates to: {query.strip()}. "
        f"As a general knowledge assistant, I can help with this topic, but a full response "
        f"requires an OpenAI API key to be configured.\n\n"
        f"Key Points:\n"
        f"• Add your OpenAI API key to the .env file to enable general AI answers.\n"
        f"• Upload documents related to this topic to get document-grounded answers.\n\n"
        f"Note:\n"
        f"This answer is based on general AI knowledge because the uploaded documents "
        f"This answer is based on general AI knowledge because the uploaded documents "
        f"do not contain relevant information about this topic."
    )


def _generate_ollama(system: str, user: str) -> str:
    """Generate response using local Ollama model (llama3)."""
    from langchain_ollama import OllamaLLM
    
    llm = OllamaLLM(model="llama3", temperature=0.1)
    # Combine system and user prompt for standard Ollama text generation
    prompt = f"{system}\n\n{user}"
    return llm.invoke(prompt)


def _synthesize_from_chunks(query: str, results: List[Dict]) -> str:
    """
    Produce a structured Answer/Key Points/Sources response from retrieved chunks.
    Used when no LLM API key is configured.
    """
    by_source: Dict[str, List[str]] = {}
    for r in results:
        src = r["metadata"].get("filename", "Unknown Document")
        text = r["text"].strip()
        if src not in by_source:
            by_source[src] = []
        by_source[src].append(text)

    if not by_source:
        return (
            "Answer:\n"
            "The uploaded documents do not contain information about this topic.\n\n"
            "Key Points:\n"
            "• None of the indexed documents address this question directly.\n"
            "• Try rephrasing your question or uploading more relevant documents.\n\n"
            "Sources:\n"
            "*(none matched above similarity threshold)*"
        )

    # Build a bullet-point summary of key sentences per source
    key_points: list[str] = []
    source_names: list[str] = []
    for src, chunks in by_source.items():
        source_names.append(src)
        seen: set = set()
        for chunk in chunks:
            for sentence in chunk.replace("\n", " ").split(". "):
                s = sentence.strip()
                if s and s not in seen and len(s) > 25:
                    seen.add(s)
                    key_points.append(s)
                    if len(key_points) >= 5:
                        break
            if len(key_points) >= 5:
                break

    # First key point becomes the answer summary
    answer_text = key_points[0] if key_points else "Relevant content was found — see key points below."
    bullets = "\n".join(f"• {p}" for p in key_points)
    sources_text = "\n".join(source_names)
    footer = "\n\n---\n*For richer AI summaries, add your OpenAI API key to `.env`.*"

    return (
        f"Answer:\n{answer_text}\n\n"
        f"Key Points:\n{bullets}\n\n"
        f"Sources:\n{sources_text}"
        + footer
    )


def _generate_fallback(query: str, context: str, source_names: List[str] | None = None) -> str:
    """Fallback response (no LLM API key) — always returns structured format."""
    if not context.strip():
        searched = ("\n".join(f"• {s}" for s in source_names)
                    if source_names
                    else "*(none — no documents uploaded or all below similarity threshold)*")
        return (
            "Answer:\n"
            "The uploaded documents do not contain information related to this question.\n\n"
            "Suggestion:\n"
            "Try uploading documents related to this topic or refine your query."
        )

    # Parse context blocks back into result dicts for synthesizer
    blocks = context.split("\n\n---\n\n")
    results_from_context = []
    for block in blocks:
        lines = block.strip().split("\n", 1)
        if len(lines) == 2 and lines[0].startswith("[Source:"):
            src = lines[0][9:].rstrip("]")
            results_from_context.append({"text": lines[1], "metadata": {"filename": src}})
        elif lines:
            results_from_context.append({"text": block, "metadata": {"filename": "Document"}})

    return _synthesize_from_chunks(query, results_from_context)


def expand_query_and_detect_intent(query: str) -> Dict[str, Any]:
    """Uses the LLM to expand the user query and identify if it's doc-focused or general."""
    import json

    
    prompt = f"""
You are a search intent analyzer for an enterprise document system.
Analyze the following user query: "{query}"

Determine the intent of the query:
- "document": The user is asking about specific facts inside files/contracts (e.g. "Summarize Q4 report").
- "general": The user is asking a broad question (e.g. "Explain GDPR rules").
- "mixed": The user likely needs both document search and general info.

Respond EXACTLY in this JSON format without markdown codeblocks:
{{
  "intent": "document",
  "expanded_query": "original query plus synonyms"
}}

"""
    try:
        resp_text = _generate_ollama(prompt, "Return JSON only.")
            
        clean_json = resp_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        return {
            "intent": data.get("intent", "mixed"),
            "expanded_query": data.get("expanded_query", query)
        }
    except Exception as e:
        print(f"Intent detection failed: {e}")
        return {"intent": "mixed", "expanded_query": query}


# ---------------------------------------------------------------------------
# Main pipeline entry point
# ---------------------------------------------------------------------------

def query_rag(query_text: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Main RAG entry point. Matches query -> vector search -> hybrid -> LLM.
    """
    from embeddings.service import get_embedder
    from rag import vector_store
    
    # 1. Expand query and detect intent
    analysis = expand_query_and_detect_intent(query_text)
    intent = analysis.get("intent", "document")
    expanded_query = analysis.get("expanded_query", query_text)

    if intent == "general":
        return {
            "answer": generate_general_response(query_text),
            "sources": []
        }

    # 2. Vector Search (Semantic)
    try:
        embedder = get_embedder()
        query_emb = embedder.embed_query(expanded_query)
        vector_results = vector_store.query_documents(query_emb, top_k=top_k)
    except Exception as e:
        print(f"Vector search failed: {e}")
        vector_results = []

    # 3. Hybrid Search (Keyword)
    try:
        bm25_results = vector_store.query_bm25(expanded_query, top_k=top_k)
    except Exception as e:
        print(f"BM25 search failed: {e}")
        bm25_results = []

    # 4. Merge and Dedup
    all_results = vector_results + bm25_results
    combined_results = deduplicate_results(all_results)
            
    # 5. Generate Response
    # Relevance Filter: If no documents have a score >= 0.4, switch to general mode
    relevant_results = [r for r in combined_results if float(r.get("rerank_score", r["score"])) >= 0.4]
    
    if not relevant_results:
        return {
            "answer": generate_general_response(query_text),
            "sources": [],
            "mode": "general"
        }

    # Build context only from relevant results
    context = build_context(relevant_results)
    source_names = list(set(r["metadata"].get("filename", "Unknown") for r in relevant_results))

    return {
        "answer": generate_response(query_text, context, source_names),
        "sources": [
            {
                "text": r["text"][:300],
                "metadata": r["metadata"],
                "score": round(r.get("rerank_score", r["score"]), 3),
            }
            for r in relevant_results[:3]
        ],
        "mode": "rag",
    }


# Original function follows...
def old_query_rag(query_text: str, top_k: int = 5) -> Dict[str, Any]:
    """Full RAG pipeline: intent → expand → hybrid search (vector+BM25) → dedup → rerank → context → LLM."""
    from rag.vector_store import query_bm25
    
    # 1. Intent Detection & Query Expansion
    analysis = expand_query_and_detect_intent(query_text)
    intent = analysis["intent"]
    expanded_query = analysis["expanded_query"]

    # 2. Fast Path: General Questions
    if intent == "general":
        answer = generate_general_response(query_text)
        return {
            "answer": answer,
            "sources": [],
            "mode": "general",
        }

    # 3. Hybrid Search
    query_embedding = embed_query(expanded_query)
    vector_results = query_documents(query_embedding, top_k=top_k)
    bm25_results = query_bm25(expanded_query, top_k=top_k)
    
    # Merge and deduplicate by text
    merged = {}
    for r in vector_results + bm25_results:
        key = r["text"]
        if key not in merged or r["score"] > merged[key]["score"]:
            merged[key] = r
            
    raw_results = list(merged.values())
    raw_results.sort(key=lambda x: x["score"], reverse=True)
    raw_results = raw_results[:top_k * 2] # Keep top candidates for further filtering

    # Step 1 — Deduplicate near-identical chunks
    results = deduplicate_results(raw_results, similarity_threshold=0.72)

    # Step 2 — Rerank by combined vector score + keyword overlap
    # We use the original query here for exact overlap matches
    results = rerank_results(results, query_text)

    # Step 3 — Apply similarity threshold
    results = apply_similarity_threshold(results, threshold=SIMILARITY_THRESHOLD)

    # 4. Fallback if no relevant docs found
    if not results:
        answer = generate_general_response(query)
        return {
            "answer": answer,
            "sources": [],
            "mode": "general",
        }

    # 5. Generate RAG Response
    context = build_context(results)
    answer = generate_response(query, context)

    return {
        "answer": answer,
        "sources": [
            {
                "text": r["text"][:300],
                "metadata": r["metadata"],
                "score": round(r.get("rerank_score", r["score"]), 3),
            }
            for r in results[:3]
        ],
        "mode": "rag",
    }
