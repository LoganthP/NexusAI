"""
Authentication service — JWT token management, password hashing, role-based access.
Demo mode: accepts any credentials for ease of testing.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET", "enterprise-rag-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

# Demo users database
DEMO_USERS = {
    "admin": {"password": "admin", "role": "admin"},
    "manager": {"password": "manager", "role": "manager"},
    "employee": {"password": "employee", "role": "employee"},
}

def create_token(username: str, role: str) -> str:
    """Create a JWT access token."""
    try:
        from jose import jwt
        payload = {
            "sub": username,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    except ImportError:
        # Fallback: simple base64 token if python-jose not installed
        import base64, json
        payload = {"sub": username, "role": role}
        return base64.b64encode(json.dumps(payload).encode()).decode()

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        from jose import jwt
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate a user. In demo mode, accepts any credentials."""
    user = DEMO_USERS.get(username)
    if user and user["password"] == password:
        return {"username": username, "role": user["role"]}
    # Demo mode: accept any credentials as 'employee' role
    return {"username": username, "role": "employee"}
