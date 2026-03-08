"""API endpoint tests for the Enterprise RAG System."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Enterprise RAG System API" in response.json()["message"]

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_chat_endpoint():
    response = client.post("/api/chat/", json={
        "query": "What is the leave policy?",
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data

def test_list_documents():
    response = client.get("/api/documents/")
    assert response.status_code == 200
    assert "documents" in response.json()

def test_analytics():
    response = client.get("/api/analytics/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_queries" in data

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_auth_login_demo():
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "anypassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "testuser"
