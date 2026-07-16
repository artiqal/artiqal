import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from admin_bootstrap import bootstrap_admin_user
from session_objective import build_session_document, select_session_objective


class FakeUsers:
    def __init__(self, existing=None):
        self.existing = existing
        self.find_queries = []
        self.inserted = []

    async def find_one(self, query):
        self.find_queries.append(query)
        return self.existing

    async def insert_one(self, document):
        self.inserted.append(document)


class AdminBootstrapSafetyTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_or_incomplete_configuration_skips_bootstrap(self):
        for environ in (
            {},
            {"ADMIN_EMAIL": "admin@example.test"},
            {"ADMIN_PASSWORD": "explicit-password"},
            {"ADMIN_EMAIL": " ", "ADMIN_PASSWORD": " "},
        ):
            with self.subTest(environ=environ):
                users = FakeUsers()
                result = await bootstrap_admin_user(
                    users=users,
                    hash_password=lambda _password: self.fail("password must not be hashed"),
                    environ=environ,
                    logger=Mock(),
                )

                self.assertEqual(result, "skipped")
                self.assertEqual(users.find_queries, [])
                self.assertEqual(users.inserted, [])

    async def test_explicit_configuration_creates_one_new_administrator(self):
        users = FakeUsers()
        hashed_passwords = []

        result = await bootstrap_admin_user(
            users=users,
            hash_password=lambda password: hashed_passwords.append(password) or "hashed-value",
            environ={
                "ADMIN_EMAIL": "  Owner@Example.Test ",
                "ADMIN_PASSWORD": "unique-explicit-password",
            },
            logger=Mock(),
            user_id_factory=lambda: "user_explicitadmin",
            now_factory=lambda: "2026-07-16T12:00:00+00:00",
        )

        self.assertEqual(result, "created")
        self.assertEqual(users.find_queries, [{"email": "owner@example.test"}])
        self.assertEqual(hashed_passwords, ["unique-explicit-password"])
        self.assertEqual(len(users.inserted), 1)
        self.assertEqual(
            users.inserted[0],
            {
                "user_id": "user_explicitadmin",
                "email": "owner@example.test",
                "name": "Concentric Admin",
                "password_hash": "hashed-value",
                "auth_provider": "email",
                "picture": None,
                "role": "admin",
                "created_at": "2026-07-16T12:00:00+00:00",
            },
        )
        self.assertNotIn("password", users.inserted[0])

    async def test_existing_administrator_is_never_updated_or_rehashed(self):
        users = FakeUsers(existing={"user_id": "user_existing", "password_hash": "original-hash"})

        result = await bootstrap_admin_user(
            users=users,
            hash_password=lambda _password: self.fail("existing password must not be rehashed"),
            environ={
                "ADMIN_EMAIL": "owner@example.test",
                "ADMIN_PASSWORD": "different-explicit-password",
            },
            logger=Mock(),
        )

        self.assertEqual(result, "existing")
        self.assertEqual(users.find_queries, [{"email": "owner@example.test"}])
        self.assertEqual(users.inserted, [])


class SessionAiSafetyTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.payload = SimpleNamespace(
            patient_label="J.D.",
            notes="Good engagement",
            duration_sec=1500,
        )
        self.summary = {
            "totals": {
                "activities_count": 1,
                "attempts_total": 2,
                "attempts_correct": 1,
                "attempts_incorrect": 1,
                "accuracy_pct": 50,
                "cues_used": 1,
            },
            "per_activity": [
                {
                    "activity_title": "Reading a Receipt",
                    "category": "reading",
                    "attempts_correct": 1,
                    "attempts_total": 2,
                    "cues_used": 1,
                    "cue_types": {"hint": 1},
                }
            ],
        }
        self.user = {"user_id": "user_test"}

    async def test_session_objective_is_local_by_default_and_external_generator_is_not_called(self):
        external_calls = []

        async def external_generator(*args):
            external_calls.append(args)
            return "external objective"

        objective = await select_session_objective(
            payload=self.payload,
            summary=self.summary,
            user=self.user,
            external_generator=external_generator,
            api_key="configured-key",
            environ={},
        )

        self.assertEqual(external_calls, [])
        self.assertIn("Patient: J.D.", objective)
        self.assertIn("Clinician notes: Good engagement", objective)
        self.assertIn("Reading a Receipt", objective)
        self.assertIn("1/2 correct", objective)

    async def test_enabled_flag_without_api_key_still_uses_local_objective(self):
        async def external_generator(*_args):
            self.fail("external generator must not run without an API key")

        objective = await select_session_objective(
            payload=self.payload,
            summary=self.summary,
            user=self.user,
            external_generator=external_generator,
            api_key=None,
            environ={"ENABLE_EXTERNAL_AI_SESSION_NOTES": "true"},
        )

        self.assertIn("Patient participated in a structured aphasia therapy session", objective)

    async def test_external_generator_requires_both_explicit_flag_and_api_key(self):
        external_calls = []

        async def external_generator(*args):
            external_calls.append(args)
            return "explicit external objective"

        objective = await select_session_objective(
            payload=self.payload,
            summary=self.summary,
            user=self.user,
            external_generator=external_generator,
            api_key="configured-key",
            environ={"ENABLE_EXTERNAL_AI_SESSION_NOTES": "true"},
        )

        self.assertEqual(objective, "explicit external objective")
        self.assertEqual(external_calls, [(self.payload, self.summary, self.user)])

    async def test_ai_disabled_session_document_preserves_all_session_data(self):
        class Dumpable:
            def __init__(self, value):
                self.value = value

            def model_dump(self):
                return self.value

        self.payload.name = "  Safety test session  "
        self.payload.started_at = "2026-07-16T11:00:00+00:00"
        self.payload.ended_at = "2026-07-16T11:25:00+00:00"
        self.payload.activities = [Dumpable({"activity_slug": "receipt"})]
        self.payload.attempts = [Dumpable({"qid": "q1", "correct": True})]
        self.payload.cues = [Dumpable({"cue_type": "hint"})]

        async def external_generator(*_args):
            self.fail("external generator must remain disabled")

        objective = await select_session_objective(
            payload=self.payload,
            summary=self.summary,
            user=self.user,
            external_generator=external_generator,
            api_key="configured-key",
            environ={},
        )
        document = build_session_document(
            payload=self.payload,
            summary=self.summary,
            objective=objective,
            user=self.user,
            session_id="sess_safetytest",
            created_at="2026-07-16T12:00:00+00:00",
        )

        self.assertEqual(document["name"], "Safety test session")
        self.assertEqual(document["patient_label"], "J.D.")
        self.assertEqual(document["notes"], "Good engagement")
        self.assertEqual(document["activities"], [{"activity_slug": "receipt"}])
        self.assertEqual(document["attempts"], [{"qid": "q1", "correct": True}])
        self.assertEqual(document["cues"], [{"cue_type": "hint"}])
        self.assertIs(document["summary"], self.summary)
        self.assertEqual(document["soap_objective"], objective)


if __name__ == "__main__":
    unittest.main()
