"""Backend API tests for the Artiqal clinician Session Mode endpoints.

Endpoints under test:
- POST   /api/sessions
- GET    /api/sessions
- GET    /api/sessions/{id}
- DELETE /api/sessions/{id}

Notes:
- POST /api/sessions generates a deterministic local objective by default.
- An explicitly AI-enabled server may take longer, so POST keeps a generous timeout.
- The backend URL and administrator credentials must be provided explicitly.
"""

import os
import uuid
import requests
import pytest

BASE_URL = (
    os.environ.get("BACKEND_TEST_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or ""
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "").strip()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "").strip()

if not BASE_URL or not ADMIN_EMAIL or not ADMIN_PASSWORD:
    pytest.skip(
        "Live backend integration tests require BACKEND_TEST_URL, ADMIN_EMAIL, and ADMIN_PASSWORD",
        allow_module_level=True,
    )

POST_TIMEOUT = 120  # Allows for an explicitly AI-enabled backend target.


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(
        f"{API}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    assert "access_token" in s.cookies
    return s


def _sample_payload(name="TEST_session_basic"):
    return {
        "name": name,
        "patient_label": "J.D.",
        "notes": "good engagement",
        "started_at": "2026-05-02T10:00:00Z",
        "ended_at": "2026-05-02T10:25:00Z",
        "duration_sec": 1500,
        "activities": [
            {
                "category": "reading",
                "activity_slug": "receipt",
                "activity_title": "Reading a Receipt",
                "started_at": "2026-05-02T10:00:30Z",
            }
        ],
        "attempts": [
            {
                "activity_slug": "receipt",
                "activity_title": "Reading a Receipt",
                "category": "reading",
                "qid": "q0",
                "correct": True,
                "picked": "$15.42",
                "expected": "$15.42",
                "ts": "2026-05-02T10:01:00Z",
            },
            {
                "activity_slug": "receipt",
                "activity_title": "Reading a Receipt",
                "category": "reading",
                "qid": "q1",
                "correct": False,
                "picked": "$3.49",
                "expected": "$2.99",
                "ts": "2026-05-02T10:02:00Z",
            },
        ],
        "cues": [
            {
                "activity_slug": "receipt",
                "activity_title": "Reading a Receipt",
                "category": "reading",
                "cue_type": "show_answer",
                "detail": "$2.99",
                "ts": "2026-05-02T10:02:30Z",
            }
        ],
    }


# ---------- Auth gating ----------
class TestSessionsAuth:
    def test_post_sessions_requires_auth(self):
        r = requests.post(f"{API}/sessions", json=_sample_payload("TEST_noauth"), timeout=20)
        assert r.status_code == 401, r.text

    def test_get_sessions_requires_auth(self):
        r = requests.get(f"{API}/sessions", timeout=15)
        assert r.status_code == 401

    def test_get_session_by_id_requires_auth(self):
        r = requests.get(f"{API}/sessions/sess_doesnotexist", timeout=15)
        assert r.status_code == 401

    def test_delete_session_requires_auth(self):
        r = requests.delete(f"{API}/sessions/sess_doesnotexist", timeout=15)
        assert r.status_code == 401


# ---------- Validation ----------
class TestSessionsValidation:
    def test_missing_name_422(self, admin_session):
        bad = _sample_payload()
        bad.pop("name")
        r = admin_session.post(f"{API}/sessions", json=bad, timeout=30)
        assert r.status_code == 422, r.text

    def test_empty_name_422(self, admin_session):
        bad = _sample_payload()
        bad["name"] = ""
        r = admin_session.post(f"{API}/sessions", json=bad, timeout=30)
        assert r.status_code == 422, r.text

    def test_negative_duration_422(self, admin_session):
        bad = _sample_payload()
        bad["duration_sec"] = -10
        r = admin_session.post(f"{API}/sessions", json=bad, timeout=30)
        assert r.status_code == 422, r.text


# ---------- CRUD + summary + SOAP ----------
class TestSessionsCRUD:
    """Full create -> get -> list -> delete flow with persistence and aggregation checks."""

    def test_full_crud_and_aggregation(self, admin_session):
        unique = uuid.uuid4().hex[:6]
        payload = _sample_payload(name=f"TEST_session_{unique}")

        # CREATE
        r = admin_session.post(f"{API}/sessions", json=payload, timeout=POST_TIMEOUT)
        assert r.status_code == 200, f"POST failed: {r.status_code} {r.text[:500]}"
        created = r.json()

        # Top level fields
        assert created["name"] == payload["name"]
        assert created["patient_label"] == payload["patient_label"]
        assert created["notes"] == payload["notes"]
        assert created["duration_sec"] == 1500
        assert created["started_at"] == payload["started_at"]
        assert created["ended_at"] == payload["ended_at"]
        assert "session_id" in created and created["session_id"].startswith("sess_")
        assert "user_id" in created
        assert "_id" not in created  # ObjectId must be stripped

        # SOAP
        soap = created.get("soap_objective")
        assert isinstance(soap, str), "soap_objective must be a string"
        assert len(soap.strip()) > 50, f"soap_objective looks too short: {soap!r}"

        # Summary totals
        summary = created["summary"]
        totals = summary["totals"]
        assert totals["attempts_total"] == 2
        assert totals["attempts_correct"] == 1
        assert totals["attempts_incorrect"] == 1
        assert totals["cues_used"] == 1
        assert totals["activities_count"] == 1
        # accuracy_pct = round(100 * 1 / 2) = 50
        assert totals["accuracy_pct"] == 50

        # Per-activity aggregation
        per = summary["per_activity"]
        assert isinstance(per, list) and len(per) == 1
        a0 = per[0]
        assert a0["activity_slug"] == "receipt"
        assert a0["category"] == "reading"
        assert a0["activity_title"] == "Reading a Receipt"
        assert a0["attempts_total"] == 2
        assert a0["attempts_correct"] == 1
        assert a0["attempts_incorrect"] == 1
        assert a0["cues_used"] == 1
        assert a0["cue_types"] == {"show_answer": 1}

        session_id = created["session_id"]

        # GET by id
        r = admin_session.get(f"{API}/sessions/{session_id}", timeout=20)
        assert r.status_code == 200
        full = r.json()
        assert full["session_id"] == session_id
        assert full["name"] == payload["name"]
        assert full["soap_objective"] == soap
        assert full["summary"]["totals"]["accuracy_pct"] == 50
        assert "_id" not in full
        # Raw arrays retained
        assert len(full["attempts"]) == 2
        assert len(full["cues"]) == 1
        assert len(full["activities"]) == 1

        # LIST
        r = admin_session.get(f"{API}/sessions", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        ids = [it["session_id"] for it in items]
        assert session_id in ids
        listed = next(it for it in items if it["session_id"] == session_id)
        # List projection should include summary + basic fields
        assert listed["name"] == payload["name"]
        assert "summary" in listed and "totals" in listed["summary"]
        assert listed["summary"]["totals"]["attempts_total"] == 2
        # _id must not leak
        for it in items:
            assert "_id" not in it

        # DELETE
        r = admin_session.delete(f"{API}/sessions/{session_id}", timeout=20)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # GET after delete -> 404
        r = admin_session.get(f"{API}/sessions/{session_id}", timeout=15)
        assert r.status_code == 404

        # DELETE again -> 404
        r = admin_session.delete(f"{API}/sessions/{session_id}", timeout=15)
        assert r.status_code == 404

    def test_multi_activity_aggregation(self, admin_session):
        """Two activities with mixed attempts and multiple cue types."""
        unique = uuid.uuid4().hex[:6]
        payload = {
            "name": f"TEST_multi_{unique}",
            "patient_label": None,
            "notes": None,
            "started_at": "2026-05-02T11:00:00Z",
            "ended_at": "2026-05-02T11:30:00Z",
            "duration_sec": 1800,
            "activities": [
                {
                    "category": "reading",
                    "activity_slug": "receipt",
                    "activity_title": "Reading a Receipt",
                    "started_at": "2026-05-02T11:00:30Z",
                },
                {
                    "category": "word-finding",
                    "activity_slug": "naming",
                    "activity_title": "Picture Naming",
                    "started_at": "2026-05-02T11:10:00Z",
                },
            ],
            "attempts": [
                {"activity_slug": "receipt", "activity_title": "Reading a Receipt",
                 "category": "reading", "qid": "q0", "correct": True, "ts": "2026-05-02T11:01:00Z"},
                {"activity_slug": "receipt", "activity_title": "Reading a Receipt",
                 "category": "reading", "qid": "q1", "correct": True, "ts": "2026-05-02T11:02:00Z"},
                {"activity_slug": "receipt", "activity_title": "Reading a Receipt",
                 "category": "reading", "qid": "q2", "correct": False, "ts": "2026-05-02T11:03:00Z"},
                {"activity_slug": "naming", "activity_title": "Picture Naming",
                 "category": "word-finding", "qid": "n0", "correct": False, "ts": "2026-05-02T11:11:00Z"},
            ],
            "cues": [
                {"activity_slug": "receipt", "activity_title": "Reading a Receipt",
                 "category": "reading", "cue_type": "hint", "ts": "2026-05-02T11:02:30Z"},
                {"activity_slug": "naming", "activity_title": "Picture Naming",
                 "category": "word-finding", "cue_type": "show_answer", "ts": "2026-05-02T11:11:30Z"},
                {"activity_slug": "naming", "activity_title": "Picture Naming",
                 "category": "word-finding", "cue_type": "hint", "ts": "2026-05-02T11:12:00Z"},
            ],
        }

        r = admin_session.post(f"{API}/sessions", json=payload, timeout=POST_TIMEOUT)
        assert r.status_code == 200, r.text[:500]
        doc = r.json()
        totals = doc["summary"]["totals"]
        assert totals["attempts_total"] == 4
        assert totals["attempts_correct"] == 2
        assert totals["attempts_incorrect"] == 2
        assert totals["cues_used"] == 3
        assert totals["activities_count"] == 2
        # 2/4 = 50%
        assert totals["accuracy_pct"] == 50

        per = {a["activity_slug"]: a for a in doc["summary"]["per_activity"]}
        assert per["receipt"]["attempts_correct"] == 2
        assert per["receipt"]["attempts_incorrect"] == 1
        assert per["receipt"]["cue_types"] == {"hint": 1}
        assert per["naming"]["attempts_correct"] == 0
        assert per["naming"]["attempts_incorrect"] == 1
        assert per["naming"]["cue_types"] == {"show_answer": 1, "hint": 1}

        # cleanup
        admin_session.delete(f"{API}/sessions/{doc['session_id']}", timeout=15)

    def test_zero_attempts_accuracy_none(self, admin_session):
        unique = uuid.uuid4().hex[:6]
        payload = {
            "name": f"TEST_empty_{unique}",
            "started_at": "2026-05-02T12:00:00Z",
            "ended_at": "2026-05-02T12:05:00Z",
            "duration_sec": 300,
            "activities": [
                {"category": "reading", "activity_slug": "receipt",
                 "activity_title": "Reading a Receipt", "started_at": "2026-05-02T12:00:30Z"}
            ],
            "attempts": [],
            "cues": [],
        }
        r = admin_session.post(f"{API}/sessions", json=payload, timeout=POST_TIMEOUT)
        assert r.status_code == 200, r.text[:500]
        doc = r.json()
        totals = doc["summary"]["totals"]
        assert totals["attempts_total"] == 0
        assert totals["accuracy_pct"] is None
        assert totals["activities_count"] == 1
        assert isinstance(doc["soap_objective"], str) and len(doc["soap_objective"]) > 0
        admin_session.delete(f"{API}/sessions/{doc['session_id']}", timeout=15)

    def test_get_other_users_session_404(self, admin_session):
        """A session belonging to another user must not be readable by admin (returns 404)."""
        # Create a fresh user
        s2 = requests.Session()
        unique = uuid.uuid4().hex[:8]
        email = f"TEST_other_{unique}@example.com"
        r = s2.post(
            f"{API}/auth/register",
            json={"name": "Other User", "email": email, "password": "TestPass123!"},
            timeout=20,
        )
        assert r.status_code == 200, r.text

        # Other user creates a session
        r = s2.post(f"{API}/sessions", json=_sample_payload(f"TEST_other_{unique}"), timeout=POST_TIMEOUT)
        assert r.status_code == 200, r.text[:500]
        other_id = r.json()["session_id"]

        # Admin should NOT be able to GET it
        r = admin_session.get(f"{API}/sessions/{other_id}", timeout=15)
        assert r.status_code == 404

        # Admin should NOT be able to DELETE it
        r = admin_session.delete(f"{API}/sessions/{other_id}", timeout=15)
        assert r.status_code == 404

        # Admin's list should not contain it
        r = admin_session.get(f"{API}/sessions", timeout=20)
        assert r.status_code == 200
        ids = [it["session_id"] for it in r.json()]
        assert other_id not in ids

        # Cleanup as the owner
        s2.delete(f"{API}/sessions/{other_id}", timeout=15)
