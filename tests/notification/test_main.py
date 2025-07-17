import pytest
from fastapi.testclient import TestClient
from notification.main import app

client = TestClient(app)

def test_send_notification(monkeypatch):
    def mock_post(*args, **kwargs):
        class MockResp:
            status_code = 200
        return MockResp()
    monkeypatch.setattr("requests.post", mock_post)
    data = {"to": "+237620844719", "message": "Test", "type": "sms"}
    resp = client.post("/notifications/send", json=data)
    assert resp.status_code == 200