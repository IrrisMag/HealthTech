import pytest
from fastapi.testclient import TestClient
from reminder.main import app

client = TestClient(app)

def test_appointment_reminder():
    data = {
        "patient_id": "1",
        "patient_phone": "+237620844719",
        "patient_language": "en",
        "appointment_time": "2025-07-20T10:00:00",
        "room": "A101",
        "doctor": "Smith"
    }
    resp = client.post("/reminders/appointment", json=data)
    assert resp.status_code == 200
    assert resp.json()["status"] == "scheduled"
