import pytest
from fastapi.testclient import TestClient
from analysis.main import app

client = TestClient(app)

def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"service": "analysis"}

def test_predict():
    resp = client.post("/predict", json={"feedback_text": "Great service!"})
    assert resp.status_code == 200
    assert "sentiment" in resp.json()