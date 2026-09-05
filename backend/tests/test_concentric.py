"""Backend API tests for Artiqal."""
import os
import io
import time
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
RUN_EXTERNAL_AI_TESTS = os.environ.get("RUN_EXTERNAL_AI_TESTS", "").strip().lower() == "true"

if not BASE_URL or not ADMIN_EMAIL or not ADMIN_PASSWORD:
    pytest.skip(
        "Live backend integration tests require BACKEND_TEST_URL, ADMIN_EMAIL, and ADMIN_PASSWORD",
        allow_module_level=True,
    )


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


# ---------- Health ----------
class TestHealth:
    def test_root_ok(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data.get("app") == "artiqal API"


# ---------- Content ----------
class TestContent:
    def test_categories(self, session):
        r = session.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8
        slugs = {c["slug"] for c in data}
        expected = {
            "reading", "writing", "word-finding", "auditory-comprehension",
            "functional-communication", "games", "sfa-therapy", "all-activities",
        }
        assert expected.issubset(slugs), f"Missing slugs: {expected - slugs}"
        for c in data:
            for key in ("slug", "name", "tagline", "color", "icon", "description"):
                assert key in c

    def test_reading_activities(self, session):
        r = session.get(f"{API}/categories/reading/activities", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        slugs = {a["slug"] for a in data}
        assert "receipt" in slugs
        assert "medication-package" not in slugs

    def test_unknown_category_404(self, session):
        r = session.get(f"{API}/categories/does-not-exist/activities", timeout=15)
        assert r.status_code == 404

    def test_receipt_activity(self, session):
        r = session.get(f"{API}/activities/reading/receipt", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "receipt"
        assert data["category"] == "reading"
        assert "content" in data
        assert "text" in data["content"]
        assert "GREEN MARKET" in data["content"]["text"]
        assert "questions" in data["content"]
        assert len(data["content"]["questions"]) >= 3
        for q in data["content"]["questions"]:
            assert "q" in q and "options" in q and "answer" in q

    def test_unknown_activity_404(self, session):
        r = session.get(f"{API}/activities/reading/no-such", timeout=15)
        assert r.status_code == 404

    def test_all_activities_flat(self, session):
        r = session.get(f"{API}/activities", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # All active categories combined - reading(2) + word-finding(1) + func(3) + games(1) + sfa(1) = 8
        assert len(data) >= 8
        for a in data:
            assert "category" in a
            assert "slug" in a
            assert "title" in a
        # Check at least one from each category
        cats = {a["category"] for a in data}
        for c in ("reading", "word-finding", "functional-communication", "games", "sfa-therapy"):
            assert c in cats, f"Missing category {c} in flattened activities"

    def test_sfa_words(self, session):
        r = session.get(f"{API}/sfa/words", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 5
        required = {"word", "group", "use", "action", "location", "properties", "association"}
        for w in data:
            assert required.issubset(set(w.keys())), f"Missing fields: {required - set(w.keys())}"


# ---------- Auth ----------
class TestAuth:
    def test_register_login_me_logout(self):
        s = requests.Session()
        unique = uuid.uuid4().hex[:8]
        email = f"test_{unique}@example.com"
        password = "TestPass123!"

        # Register
        r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": password}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["name"] == "Test User"
        assert data["auth_provider"] == "email"
        assert "access_token" in s.cookies, f"access_token not set. Cookies: {dict(s.cookies)}"

        # /me with cookie
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == email

        # Logout clears cookie
        r = s.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Cookie cleared - subsequent /me should 401
        s.cookies.clear()
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

        # Login again
        s2 = requests.Session()
        r = s2.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
        assert r.status_code == 200
        assert "access_token" in s2.cookies
        r = s2.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == email

    def test_admin_login(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200, r.text
        assert "access_token" in s.cookies
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == ADMIN_EMAIL

    def test_duplicate_email_400(self):
        s = requests.Session()
        unique = uuid.uuid4().hex[:8]
        email = f"dup_{unique}@example.com"
        payload = {"name": "Dup", "email": email, "password": "TestPass123!"}
        r1 = s.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r1.status_code == 200
        s2 = requests.Session()
        r2 = s2.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r2.status_code == 400

    def test_wrong_password_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password"}, timeout=15)
        assert r.status_code == 401

    def test_me_without_auth_401(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401


# ---------- LLM integrations ----------
@pytest.mark.skipif(
    not RUN_EXTERNAL_AI_TESTS,
    reason="External AI integration tests require RUN_EXTERNAL_AI_TESTS=true",
)
class TestLLMIntegrations:
    def test_tts_requires_auth(self):
        r = requests.post(f"{API}/tts", json={"text": "hello", "voice": "nova"}, timeout=15)
        assert r.status_code == 401

    def test_tts_with_auth(self, admin_session):
        r = admin_session.post(f"{API}/tts", json={"text": "hello", "voice": "nova"}, timeout=60)
        assert r.status_code == 200, f"TTS failed: {r.status_code} {r.text[:500]}"
        data = r.json()
        assert "audio_base64" in data
        assert isinstance(data["audio_base64"], str)
        assert len(data["audio_base64"]) > 100  # non-trivial audio
        assert data.get("mime") == "audio/mp3"

    def test_generate_scenario_requires_auth(self):
        r = requests.post(f"{API}/generate-scenario", json={"scenario_type": "receipt"}, timeout=15)
        assert r.status_code == 401

    def test_generate_scenario_invalid_type(self, admin_session):
        r = admin_session.post(f"{API}/generate-scenario", json={"scenario_type": "bogus"}, timeout=20)
        assert r.status_code == 400

    def test_generate_scenario_receipt(self, admin_session):
        r = admin_session.post(f"{API}/generate-scenario", json={"scenario_type": "receipt"}, timeout=120)
        assert r.status_code == 200, f"Scenario failed: {r.status_code} {r.text[:500]}"
        data = r.json()
        assert "text" in data
        assert isinstance(data["text"], str)
        assert len(data["text"]) > 30

    def test_transcribe_requires_auth(self):
        # multipart without auth
        files = {"file": ("a.webm", b"\x00\x00", "audio/webm")}
        r = requests.post(f"{API}/transcribe", files=files, timeout=15)
        assert r.status_code == 401

    def test_transcribe_no_file_with_auth(self, admin_session):
        # missing file -> 422
        # admin_session has Content-Type json header; remove for multipart
        s = requests.Session()
        s.cookies.update(admin_session.cookies)
        r = s.post(f"{API}/transcribe", timeout=15)
        assert r.status_code in (400, 422)
