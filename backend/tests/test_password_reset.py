import copy
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from password_reset import (
    GENERIC_PASSWORD_RESET_MESSAGE,
    PasswordResetDeliveryError,
    PasswordResetDispatch,
    PasswordResetRateLimiter,
    PasswordResetSettings,
    build_password_reset_email,
    build_password_reset_rate_limit_response,
    consume_password_reset_token,
    create_password_reset_dispatch,
    deliver_password_reset_email,
    ensure_password_reset_indexes,
    hash_reset_token,
    load_password_reset_rate_limit_settings,
    load_password_reset_settings,
)


NOW = datetime(2026, 7, 19, 12, 0, tzinfo=timezone.utc)


class FakeUsers:
    def __init__(self, documents=None):
        self.documents = [copy.deepcopy(document) for document in (documents or [])]

    async def find_one(self, query):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                return copy.deepcopy(document)
        return None

    async def update_one(self, query, update):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                document.update(update.get("$set", {}))
                for key, value in update.get("$inc", {}).items():
                    document[key] = document.get(key, 0) + value
                return SimpleNamespace(modified_count=1)
        return SimpleNamespace(modified_count=0)


class FakeResetTokens:
    def __init__(self, documents=None):
        self.documents = [copy.deepcopy(document) for document in (documents or [])]
        self.indexes = []

    @staticmethod
    def _matches(document, query):
        for key, expected in query.items():
            actual = document.get(key)
            if isinstance(expected, dict) and "$gt" in expected:
                if actual is None or actual <= expected["$gt"]:
                    return False
            elif actual != expected:
                return False
        return True

    async def update_many(self, query, update):
        count = 0
        for document in self.documents:
            if self._matches(document, query):
                document.update(update.get("$set", {}))
                count += 1
        return SimpleNamespace(modified_count=count)

    async def update_one(self, query, update):
        for document in self.documents:
            if self._matches(document, query):
                document.update(update.get("$set", {}))
                return SimpleNamespace(modified_count=1)
        return SimpleNamespace(modified_count=0)

    async def insert_one(self, document):
        self.documents.append(copy.deepcopy(document))
        return SimpleNamespace(inserted_id="reset-token-id")

    async def find_one_and_update(self, query, update, return_document):
        del return_document
        for document in self.documents:
            if self._matches(document, query):
                before = copy.deepcopy(document)
                document.update(update.get("$set", {}))
                return before
        return None

    async def create_index(self, fields, **options):
        self.indexes.append((fields, options))


class FakeSessions:
    def __init__(self):
        self.deleted_queries = []

    async def delete_many(self, query):
        self.deleted_queries.append(query)
        return SimpleNamespace(deleted_count=1)


def email_user(**overrides):
    user = {
        "user_id": "user_email",
        "email": "clinician@example.com",
        "password_hash": "old-password-hash",
        "auth_provider": "email",
        "auth_version": 2,
    }
    user.update(overrides)
    return user


def reset_environment(**overrides):
    environ = {
        "RESEND_API_KEY": "test-resend-key",
        "PASSWORD_RESET_FROM_EMAIL": "Artiqal <contact@artiqal.test>",
        "PASSWORD_RESET_URL": "https://app.artiqal.test/reset-password",
        "PASSWORD_RESET_SUPPORT_EMAIL": "support@artiqal.test",
        "PASSWORD_RESET_TOKEN_TTL_SECONDS": "3600",
    }
    environ.update(overrides)
    return environ


class PasswordResetRequestTests(unittest.IsolatedAsyncioTestCase):
    async def test_known_email_creates_one_hashed_expiring_token(self):
        users = FakeUsers([email_user()])
        tokens = FakeResetTokens()

        dispatch = await create_password_reset_dispatch(
            users=users,
            reset_tokens=tokens,
            email=" Clinician@Example.com ",
            environ=reset_environment(),
            now=NOW,
            token_factory=lambda: "raw-reset-token-value-that-is-long-enough",
        )

        self.assertEqual(dispatch.email, "clinician@example.com")
        self.assertEqual(len(tokens.documents), 1)
        stored = tokens.documents[0]
        self.assertEqual(stored["token_hash"], hash_reset_token(dispatch.raw_token))
        self.assertNotIn(dispatch.raw_token, str(stored))
        self.assertEqual(stored["expires_at"], NOW + timedelta(hours=1))
        self.assertIsNone(stored["used_at"])
        self.assertIsNone(stored["revoked_at"])

    async def test_unknown_and_google_only_accounts_create_nothing(self):
        unknown_tokens = FakeResetTokens()
        unknown = await create_password_reset_dispatch(
            users=FakeUsers(),
            reset_tokens=unknown_tokens,
            email="missing@example.com",
            environ=reset_environment(),
            now=NOW,
        )
        google_tokens = FakeResetTokens()
        google_only = await create_password_reset_dispatch(
            users=FakeUsers([email_user(auth_provider="google", password_hash=None)]),
            reset_tokens=google_tokens,
            email="clinician@example.com",
            environ=reset_environment(),
            now=NOW,
        )

        self.assertIsNone(unknown)
        self.assertIsNone(google_only)
        self.assertEqual(unknown_tokens.documents, [])
        self.assertEqual(google_tokens.documents, [])
        self.assertEqual(
            GENERIC_PASSWORD_RESET_MESSAGE,
            "If an account exists with this email, we have sent password reset instructions.",
        )

    async def test_new_request_revokes_previous_unused_tokens(self):
        previous = {
            "user_id": "user_email",
            "token_hash": "previous-hash",
            "expires_at": NOW + timedelta(minutes=10),
            "used_at": None,
            "revoked_at": None,
            "created_at": NOW - timedelta(minutes=5),
        }
        tokens = FakeResetTokens([previous])

        await create_password_reset_dispatch(
            users=FakeUsers([email_user()]),
            reset_tokens=tokens,
            email="clinician@example.com",
            environ=reset_environment(),
            now=NOW,
        )

        self.assertEqual(tokens.documents[0]["revoked_at"], NOW)
        self.assertEqual(len(tokens.documents), 2)


class PasswordResetConsumptionTests(unittest.IsolatedAsyncioTestCase):
    def make_token_document(self, raw_token="valid-reset-token-value-that-is-long-enough", **overrides):
        document = {
            "user_id": "user_email",
            "token_hash": hash_reset_token(raw_token),
            "expires_at": NOW + timedelta(minutes=30),
            "used_at": None,
            "revoked_at": None,
            "created_at": NOW - timedelta(minutes=2),
        }
        document.update(overrides)
        return document

    async def test_valid_token_updates_password_invalidates_sessions_and_is_single_use(self):
        raw_token = "valid-reset-token-value-that-is-long-enough"
        users = FakeUsers([email_user()])
        tokens = FakeResetTokens([self.make_token_document(raw_token)])
        sessions = FakeSessions()

        first_result = await consume_password_reset_token(
            reset_tokens=tokens,
            users=users,
            user_sessions=sessions,
            raw_token=raw_token,
            new_password="new-password",
            hash_password=lambda _password: "new-password-hash",
            now=NOW,
        )
        second_result = await consume_password_reset_token(
            reset_tokens=tokens,
            users=users,
            user_sessions=sessions,
            raw_token=raw_token,
            new_password="another-password",
            hash_password=lambda _password: "another-password-hash",
            now=NOW,
        )

        self.assertTrue(first_result)
        self.assertFalse(second_result)
        self.assertEqual(users.documents[0]["password_hash"], "new-password-hash")
        self.assertEqual(users.documents[0]["auth_version"], 3)
        self.assertEqual(users.documents[0]["password_changed_at"], NOW)
        self.assertEqual(tokens.documents[0]["used_at"], NOW)
        self.assertEqual(sessions.deleted_queries, [{"user_id": "user_email"}])

    async def test_expired_revoked_and_unknown_tokens_are_rejected(self):
        raw_token = "expired-reset-token-value-that-is-long-enough"
        cases = (
            self.make_token_document(raw_token, expires_at=NOW),
            self.make_token_document(raw_token, revoked_at=NOW - timedelta(seconds=1)),
        )
        for document in cases:
            with self.subTest(document=document):
                users = FakeUsers([email_user()])
                result = await consume_password_reset_token(
                    reset_tokens=FakeResetTokens([document]),
                    users=users,
                    user_sessions=FakeSessions(),
                    raw_token=raw_token,
                    new_password="new-password",
                    hash_password=lambda _password: self.fail("expired tokens must not be hashed"),
                    now=NOW,
                )
                self.assertFalse(result)
                self.assertEqual(users.documents[0]["password_hash"], "old-password-hash")

        unknown_result = await consume_password_reset_token(
            reset_tokens=FakeResetTokens(),
            users=FakeUsers([email_user()]),
            user_sessions=FakeSessions(),
            raw_token="unknown-reset-token-value-that-is-long-enough",
            new_password="new-password",
            hash_password=lambda _password: self.fail("unknown tokens must not be hashed"),
            now=NOW,
        )
        self.assertFalse(unknown_result)

    async def test_google_only_account_cannot_gain_a_password(self):
        raw_token = "valid-reset-token-value-that-is-long-enough"
        users = FakeUsers([email_user(auth_provider="google", password_hash=None)])
        result = await consume_password_reset_token(
            reset_tokens=FakeResetTokens([self.make_token_document(raw_token)]),
            users=users,
            user_sessions=FakeSessions(),
            raw_token=raw_token,
            new_password="unsafe-new-password",
            hash_password=lambda _password: self.fail("Google-only accounts must not gain a password"),
            now=NOW,
        )
        self.assertFalse(result)
        self.assertIsNone(users.documents[0]["password_hash"])


class PasswordResetEmailAndConfigurationTests(unittest.TestCase):
    def setUp(self):
        self.dispatch = PasswordResetDispatch(
            user_id="user_email",
            email="clinician@example.com",
            raw_token="raw-reset-token-value-that-is-long-enough",
            token_hash=hash_reset_token("raw-reset-token-value-that-is-long-enough"),
            expires_at=NOW + timedelta(hours=1),
        )
        self.settings = PasswordResetSettings(
            api_key="test-resend-key",
            from_email="Artiqal <contact@artiqal.test>",
            reset_url="https://app.artiqal.test/reset-password",
            support_email="support@artiqal.test",
            token_ttl_seconds=3600,
        )

    def test_builds_dedicated_reset_email_with_token_only_in_link(self):
        payload = build_password_reset_email(self.dispatch, self.settings)

        self.assertEqual(payload["from"], "Artiqal <contact@artiqal.test>")
        self.assertEqual(payload["to"], ["clinician@example.com"])
        self.assertEqual(payload["subject"], "[Artiqal] Reset your password")
        self.assertIn("?token=raw-reset-token-value-that-is-long-enough", payload["text"])
        self.assertIn("expires in 60 minutes", payload["text"])
        self.assertIn("support@artiqal.test", payload["text"])
        self.assertNotIn(self.dispatch.token_hash, str(payload))

    def test_delivery_success_and_provider_failure_remain_distinct(self):
        sender = Mock(return_value="resend-message-id")
        message_id = deliver_password_reset_email(
            self.dispatch,
            reset_environment(),
            sender=sender,
        )
        self.assertEqual(message_id, "resend-message-id")
        self.assertEqual(sender.call_args.args[0], "test-resend-key")
        self.assertNotIn("test-resend-key", str(sender.call_args.args[1]))

        failed_sender = Mock(side_effect=PasswordResetDeliveryError("provider failed"))
        with self.assertRaises(PasswordResetDeliveryError):
            deliver_password_reset_email(
                self.dispatch,
                reset_environment(),
                sender=failed_sender,
            )

    def test_settings_use_dedicated_sender_or_safe_contact_fallback(self):
        dedicated = load_password_reset_settings(reset_environment())
        self.assertEqual(dedicated.from_email, "Artiqal <contact@artiqal.test>")

        fallback_environment = reset_environment()
        fallback_environment.pop("PASSWORD_RESET_FROM_EMAIL")
        fallback_environment["CONTACT_FROM_EMAIL"] = "Artiqal <shared@artiqal.test>"
        fallback = load_password_reset_settings(fallback_environment)
        self.assertEqual(fallback.from_email, "Artiqal <shared@artiqal.test>")


class PasswordResetRateLimitAndIndexTests(unittest.IsolatedAsyncioTestCase):
    async def test_rate_limit_is_password_reset_specific_and_dynamic(self):
        now = [100.0]
        limiter = PasswordResetRateLimiter(
            max_requests=2,
            window_seconds=60,
            clock=lambda: now[0],
        )
        self.assertTrue(limiter.check("127.0.0.1").allowed)
        self.assertTrue(limiter.check("127.0.0.1").allowed)
        rejected = limiter.check("127.0.0.1")
        body, headers = build_password_reset_rate_limit_response(rejected)
        self.assertEqual(body["retryAfterSeconds"], 60)
        self.assertEqual(headers["Retry-After"], "60")

        now[0] += 31
        self.assertEqual(limiter.check("127.0.0.1").retry_after_seconds, 29)
        now[0] += 30
        self.assertTrue(limiter.check("127.0.0.1").allowed)

    async def test_rate_limit_defaults_and_environment_overrides(self):
        defaults = load_password_reset_rate_limit_settings({})
        self.assertEqual(defaults.max_requests, 5)
        self.assertEqual(defaults.window_seconds, 900)
        configured = load_password_reset_rate_limit_settings(
            {
                "PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS": "3",
                "PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS": "120",
            }
        )
        self.assertEqual(configured.max_requests, 3)
        self.assertEqual(configured.window_seconds, 120)

    async def test_creates_unique_hash_ttl_and_user_indexes(self):
        tokens = FakeResetTokens()
        await ensure_password_reset_indexes(tokens)
        self.assertIn(("token_hash", {"unique": True}), tokens.indexes)
        self.assertIn(("expires_at", {"expireAfterSeconds": 0}), tokens.indexes)
        self.assertIn(([('user_id', 1), ('created_at', -1)], {}), tokens.indexes)


if __name__ == "__main__":
    unittest.main()
