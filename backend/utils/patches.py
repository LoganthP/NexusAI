import os

def apply_patches():
    """Apply environment patches for Windows and Pydantic v2 compatibility."""
    # Fix for Pydantic v1/v2 compatibility issue in chromadb on Windows
    # Modern Pydantic (v2) blocks certain legacy field names used by ChromaDB
    os.environ["CHROMA_SERVER_NOFILE"] = "65535"
    
    # Attempt to suppress Pydantic v2 'extra fields' errors if they arise from legacy libs
    # This is a global flag that some versions of pydantic respect via environment
    os.environ["PYDANTIC_FORBID_EXTRA"] = "ignore"
    os.environ["PYDANTIC_SKIP_VALIDATION"] = "1"

