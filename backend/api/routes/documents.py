from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from models.schemas import DocumentResponse
import shutil
import os
import uuid
import json
import time

router = APIRouter()

UPLOAD_DIR = "./data"
DOCS_DB_FILE = "./data/documents.json"

def _load_docs_db() -> List[dict]:
    if os.path.exists(DOCS_DB_FILE):
        with open(DOCS_DB_FILE, "r") as f:
            return json.load(f)
    return []

def _save_docs_db(docs: List[dict]):
    os.makedirs(os.path.dirname(DOCS_DB_FILE), exist_ok=True)
    with open(DOCS_DB_FILE, "w") as f:
        json.dump(docs, f, indent=2)

@router.post("/upload", response_model=List[DocumentResponse])
async def upload_documents(files: List[UploadFile] = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    docs_db = _load_docs_db()
    responses = []

    for file in files:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        doc_record = {
            "id": file_id,
            "filename": file.filename,
            "status": "Processing",
            "message": "Uploaded, queued for indexing",
            "file_type": file.filename.split(".")[-1] if "." in file.filename else "",
            "file_size": os.path.getsize(file_path),
            "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "chunks": 0,
            "file_path": file_path,
        }

        # Try to process immediately
        try:
            from ingestion.pipeline import process_document
            from embeddings.service import embed_texts
            from rag.vector_store import add_documents

            result = process_document(file_path, file_id)
            embeddings = embed_texts(result["chunks"])
            add_documents(
                doc_id=file_id,
                chunks=result["chunks"],
                embeddings=embeddings,
                metadata={
                    "filename": file.filename,
                    "file_type": doc_record["file_type"],
                },
            )
            doc_record["status"] = "Indexed"
            doc_record["chunks"] = result["num_chunks"]
            doc_record["message"] = f"Successfully indexed {result['num_chunks']} chunks"
        except Exception as e:
            doc_record["status"] = "Processing"
            doc_record["message"] = f"Queued: {str(e)[:100]}"

        docs_db.append(doc_record)
        responses.append(DocumentResponse(
            id=file_id,
            filename=file.filename,
            status=doc_record["status"],
            message=doc_record["message"],
        ))

    _save_docs_db(docs_db)
    return responses

@router.get("/")
async def list_documents():
    docs = _load_docs_db()
    # Remove file_path from response
    for d in docs:
        d.pop("file_path", None)
    return {"documents": docs}

@router.delete("/{doc_id}")
async def delete_doc(doc_id: str):
    docs = _load_docs_db()
    doc = next((d for d in docs if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from vector store
    try:
        from rag.vector_store import delete_document
        delete_document(doc_id)
    except Exception:
        pass

    # Remove file
    file_path = doc.get("file_path", "")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    docs = [d for d in docs if d["id"] != doc_id]
    _save_docs_db(docs)
    return {"message": "Document deleted"}
