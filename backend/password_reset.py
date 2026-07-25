import html
import json
import math
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from typing import Callable, Mapping, Optional

DEFAULT_PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS = 5
DEFAULT_PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS = 15 * 60
DEFAULT_PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60
GENERIC_PASSWORD_RESET_MESSAGE = (
    "If an account exists with this email, we have sent password reset instructions."
)
INVALID_PASSWORD_RESET_MESSAGE = "This password reset link is invalid or has expired."


class PasswordResetConfigurationError(RuntimeError):
    pass


class PasswordResetDeliveryError(RuntimeError):
    pass


@dataclass(frozen=True)
class PasswordResetSettings:
    api_key: str
    from_email: str
    reset_url: str
    support_email: str
    token_ttl_seconds: int


@dataclass(frozen=True)
class PasswordResetDispatch:
    user_id: str
    email: str
    raw_token: str = field(repr=False)
    token_hash: str
    expires_at: datetime


@dataclass(frozen=True)
class PasswordResetRateLimitSettings:
    max_requests: int
    window_seconds: int


@dataclass(frozen=True)
class PasswordResetRateLimitDecision:
    allowed: bool
    retry_after_seconds: int = 0


def _positive_int(environ: Mapping[str, str], name: str, default: int) -> int:
    try:
        value = int(environ.get(name, ""))
    except (TypeError, ValueError):
        return default
    return value if value > 0 else default


def load_password_reset_rate_limit_settings(
    environ: Mapping[str, str],
) -> PasswordResetRateLimitSettings:
    return PasswordResetRateLimitSettings(
        max_requests=_positive_int(
            environ,
            "PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS",
            DEFAULT_PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS,
        ),
        window_seconds=_positive_int(
            environ,
            "PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS",
            DEFAULT_PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS,
        ),
    )


class PasswordResetRateLimiter:
    """Process-local sliding-window limiter keyed by the direct client address."""

    def __init__(
        self,
        max_requests: int = DEFAULT_PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS,
        window_seconds: int = DEFAULT_PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS,
        clock: Callable[[], float] = time.monotonic,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clock = clock
        self._events = defaultdict(deque)
        self._lock = threading.Lock()

    @classmethod
    def from_environment(cls, environ: Mapping[str, str]):
        settings = load_password_reset_rate_limit_settings(environ)
        return cls(settings.max_requests, settings.window_seconds)

    def check(self, key: str) -> PasswordResetRateLimitDecision:
        now = self.clock()
        cutoff = now - self.window_seconds
        with self._lock:
            events = self._events[key]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= self.max_requests:
                return PasswordResetRateLimitDecision(
                    allowed=False,
                    retry_after_seconds=max(
                        1,
                        math.ceil(events[0] + self.window_seconds - now),
                    ),
                )
            events.append(now)
            return PasswordResetRateLimitDecision(allowed=True)


def build_password_reset_rate_limit_response(
    decision: PasswordResetRateLimitDecision,
) -> tuple[dict, dict]:
    retry_after_seconds = max(1, decision.retry_after_seconds)
    return (
        {
            "detail": "Too many password reset requests. Please try again later.",
            "retryAfterSeconds": retry_after_seconds,
        },
        {"Retry-After": str(retry_after_seconds)},
    )


def hash_reset_token(raw_token: str) -> str:
    return sha256(raw_token.encode("utf-8")).hexdigest()


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def load_password_reset_settings(environ: Mapping[str, str]) -> PasswordResetSettings:
    api_key = environ.get("RESEND_API_KEY", "").strip()
    from_email = (
        environ.get("PASSWORD_RESET_FROM_EMAIL", "").strip()
        or environ.get("CONTACT_FROM_EMAIL", "").strip()
    )
    reset_url = environ.get("PASSWORD_RESET_URL", "").strip()
    support_email = (
        environ.get("PASSWORD_RESET_SUPPORT_EMAIL", "").strip()
        or environ.get("CONTACT_TO_EMAIL", "").strip()
    )
    missing = [
        name
        for name, value in (
            ("RESEND_API_KEY", api_key),
            ("PASSWORD_RESET_FROM_EMAIL", from_email),
            ("PASSWORD_RESET_URL", reset_url),
            ("PASSWORD_RESET_SUPPORT_EMAIL", support_email),
        )
        if not value
    ]
    if missing:
        raise PasswordResetConfigurationError(
            f"Missing password reset configuration: {', '.join(missing)}"
        )

    parsed_url = urllib.parse.urlparse(reset_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise PasswordResetConfigurationError("PASSWORD_RESET_URL must be an absolute HTTP(S) URL")

    return PasswordResetSettings(
        api_key=api_key,
        from_email=from_email,
        reset_url=reset_url,
        support_email=support_email,
        token_ttl_seconds=_positive_int(
            environ,
            "PASSWORD_RESET_TOKEN_TTL_SECONDS",
            DEFAULT_PASSWORD_RESET_TOKEN_TTL_SECONDS,
        ),
    )


def build_reset_url(reset_url: str, raw_token: str) -> str:
    parsed = urllib.parse.urlsplit(reset_url)
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [(key, value) for key, value in query if key != "token"]
    query.append(("token", raw_token))
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urllib.parse.urlencode(query), parsed.fragment)
    )


def build_password_reset_email(
    dispatch: PasswordResetDispatch,
    settings: PasswordResetSettings,
) -> dict:
    reset_link = build_reset_url(settings.reset_url, dispatch.raw_token)
    expiry_minutes = max(1, math.ceil(settings.token_ttl_seconds / 60))
    safe_link = html.escape(reset_link, quote=True)
    safe_support_email = html.escape(settings.support_email)
    text = "\n".join(
        [
            "Reset your artiqal password",
            "",
            "Use the secure link below to choose a new password:",
            reset_link,
            "",
            f"This link expires in {expiry_minutes} minutes and can be used only once.",
            "If you did not request this change, you can ignore this email.",
            f"Need help? Contact {settings.support_email}.",
        ]
    )
    html_body = (
        "<h1>Reset your artiqal password</h1>"
        "<p>Use the secure link below to choose a new password:</p>"
        f'<p><a href="{safe_link}">Reset your password</a></p>'
        f"<p>This link expires in {expiry_minutes} minutes and can be used only once.</p>"
        "<p>If you did not request this change, you can ignore this email.</p>"
        f"<p>Need help? Contact {safe_support_email}.</p>"
    )
    return {
        "from": settings.from_email,
        "to": [dispatch.email],
        "subject": "[Artiqal] Reset your password",
        "text": text,
        "html": html_body,
    }


def send_password_reset_with_resend(api_key: str, provider_payload: dict) -> str:
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(provider_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "artiqal-Password-Reset/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError) as error:
        raise PasswordResetDeliveryError(
            "The email provider did not accept the password reset message."
        ) from error

    message_id = response_data.get("id")
    if not message_id:
        raise PasswordResetDeliveryError(
            "The email provider did not confirm the password reset message."
        )
    return str(message_id)


def deliver_password_reset_email(
    dispatch: PasswordResetDispatch,
    environ: Mapping[str, str],
    sender: Optional[Callable[[str, dict], str]] = None,
) -> str:
    settings = load_password_reset_settings(environ)
    provider_payload = build_password_reset_email(dispatch, settings)
    return (sender or send_password_reset_with_resend)(settings.api_key, provider_payload)


async def create_password_reset_dispatch(
    *,
    users,
    reset_tokens,
    email: str,
    environ: Mapping[str, str],
    now: Optional[datetime] = None,
    token_factory: Callable[[], str] = generate_reset_token,
) -> Optional[PasswordResetDispatch]:
    normalized_email = email.strip().lower()
    user = await users.find_one({"email": normalized_email})
    if (
        not user
        or user.get("auth_provider", "email") != "email"
        or not user.get("password_hash")
    ):
        return None

    now = now or datetime.now(timezone.utc)
    ttl_seconds = _positive_int(
        environ,
        "PASSWORD_RESET_TOKEN_TTL_SECONDS",
        DEFAULT_PASSWORD_RESET_TOKEN_TTL_SECONDS,
    )
    raw_token = token_factory()
    token_hash = hash_reset_token(raw_token)
    expires_at = now + timedelta(seconds=ttl_seconds)

    await reset_tokens.update_many(
        {
            "user_id": user["user_id"],
            "used_at": None,
            "revoked_at": None,
        },
        {"$set": {"revoked_at": now}},
    )
    await reset_tokens.insert_one(
        {
            "user_id": user["user_id"],
            "token_hash": token_hash,
            "expires_at": expires_at,
            "used_at": None,
            "revoked_at": None,
            "created_at": now,
        }
    )
    return PasswordResetDispatch(
        user_id=user["user_id"],
        email=normalized_email,
        raw_token=raw_token,
        token_hash=token_hash,
        expires_at=expires_at,
    )


async def revoke_password_reset_dispatch(reset_tokens, dispatch: PasswordResetDispatch) -> None:
    await reset_tokens.update_one(
        {
            "token_hash": dispatch.token_hash,
            "used_at": None,
            "revoked_at": None,
        },
        {"$set": {"revoked_at": datetime.now(timezone.utc)}},
    )


async def consume_password_reset_token(
    *,
    reset_tokens,
    users,
    user_sessions,
    raw_token: str,
    new_password: str,
    hash_password: Callable[[str], str],
    now: Optional[datetime] = None,
) -> bool:
    now = now or datetime.now(timezone.utc)
    token_document = await reset_tokens.find_one_and_update(
        {
            "token_hash": hash_reset_token(raw_token),
            "expires_at": {"$gt": now},
            "used_at": None,
            "revoked_at": None,
        },
        {"$set": {"used_at": now}},
        return_document=False,
    )
    if not token_document:
        return False

    user = await users.find_one({"user_id": token_document["user_id"]})
    if (
        not user
        or user.get("auth_provider", "email") != "email"
        or not user.get("password_hash")
    ):
        return False

    result = await users.update_one(
        {
            "user_id": user["user_id"],
            "auth_provider": user.get("auth_provider", "email"),
            "password_hash": user["password_hash"],
        },
        {
            "$set": {
                "password_hash": hash_password(new_password),
                "password_changed_at": now,
            },
            "$inc": {"auth_version": 1},
        },
    )
    if not result.modified_count:
        return False

    await user_sessions.delete_many({"user_id": user["user_id"]})
    await reset_tokens.update_many(
        {
            "user_id": user["user_id"],
            "used_at": None,
            "revoked_at": None,
        },
        {"$set": {"revoked_at": now}},
    )
    return True


async def ensure_password_reset_indexes(reset_tokens) -> None:
    await reset_tokens.create_index("token_hash", unique=True)
    await reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await reset_tokens.create_index([("user_id", 1), ("created_at", -1)])
