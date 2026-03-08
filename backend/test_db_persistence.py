import os
import sys
import numpy as np

# Move to backend root
sys.path.append(os.getcwd())

from rag.vector_store import NumpyVectorDB, add_documents, get_collection

DB_TEST_PATH = "data/test_vector_db.json"

def test_persistence():
    print(f"Testing persistence with {DB_TEST_PATH}")
    if os.path.exists(DB_TEST_PATH):
        os.remove(DB_TEST_PATH)
        
    db = NumpyVectorDB(DB_TEST_PATH)
    print(f"Initial count: {db.count()}")
    
    ids = ["id1", "id2"]
    embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
    documents = ["doc1 content", "doc2 content"]
    metadatas = [{"key": "val1"}, {"key": "val2"}]
    
    print("Adding documents...")
    db.add(ids, embeddings, documents, metadatas)
    print(f"Count after add: {db.count()}")
    
    print("Loading new instance...")
    db2 = NumpyVectorDB(DB_TEST_PATH)
    print(f"Count in new instance: {db2.count()}")
    
    if db2.count() == 2:
        print("Persistence SUCCESS")
    else:
        print("Persistence FAILURE")
        
    # Check actual file size
    if os.path.exists(DB_TEST_PATH):
        print(f"File size: {os.path.getsize(DB_TEST_PATH)} bytes")
        with open(DB_TEST_PATH, 'r') as f:
            print("File content snippet:", f.read()[:200])
    else:
        print("File NOT FOUND on disk")

if __name__ == "__main__":
    test_persistence()
