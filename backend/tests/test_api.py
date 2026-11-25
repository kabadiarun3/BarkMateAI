from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_audio_endpoint_returns_honest_demo():
    r = client.post("/api/audio/analyze", data={"dog_name":"Buddy"},
                    files={"file":("bark.wav", b"fake-audio", "audio/wav")})
    assert r.status_code == 200
    assert r.json()["is_demo"] is True
    assert r.json()["confidence"] is None

def test_empty_audio_rejected():
    r = client.post("/api/audio/analyze",
                    files={"file":("empty.wav", b"", "audio/wav")})
    assert r.status_code == 400

def test_wrong_content_type_rejected():
    r = client.post("/api/audio/analyze",
                    files={"file":("x.txt", b"abc", "text/plain")})
    assert r.status_code == 415

def test_owner_context_feedback_saved():
    r = client.post("/api/feedback", json={
        "dog_name":"Buddy", "observed_context":"doorbell_or_visitor",
        "owner_note":"Barked when doorbell rang"
    })
    assert r.status_code == 200
    assert r.json()["saved"] is True

def test_unknown_context_rejected():
    r = client.post("/api/feedback", json={
        "dog_name":"Buddy", "observed_context":"sad"
    })
    assert r.status_code == 422
