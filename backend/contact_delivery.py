import base64
import json
import math
import re
import threading
import time
import unicodedata
import urllib.error
import urllib.request
import zipfile
from collections import defaultdict, deque
from dataclasses import dataclass
from email import policy
from email.parser import BytesParser
from io import BytesIO
from pathlib import Path
from typing import Callable, Iterable, Literal, Mapping, Optional, Sequence

from pydantic import BaseModel, Field, field_validator


MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
MAX_CONTACT_ATTACHMENTS = 5
MAX_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024
MAX_MULTIPART_BYTES = MAX_TOTAL_ATTACHMENT_BYTES + (1024 * 1024)
DEFAULT_CONTACT_RATE_LIMIT_MAX_REQUESTS = 5
DEFAULT_CONTACT_RATE_LIMIT_WINDOW_SECONDS = 15 * 60

ALLOWED_ATTACHMENT_TYPES = {
    ".pdf": {"application/pdf"},
    ".png": {"image/png"},
    ".jpg": {"image/jpeg", "image/jpg"},
    ".jpeg": {"image/jpeg", "image/jpg"},
    ".doc": {"application/msword"},
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
}

ContactType = Literal[
    "Speech-language pathologist",
    "Client / patient",
    "Family member / caregiver",
    "Student",
    "Other",
]


class ContactMessage(BaseModel):
    fullName: str = Field(min_length=1, max_length=120)
    contactType: ContactType
    email: str = Field(min_length=3, max_length=254)
    subject: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=10000)
    honeypot: str = Field(default="", max_length=200)

    @field_validator("fullName", "subject", "message")
    @classmethod
    def validate_non_empty_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be blank")
        return cleaned

    @field_validator("fullName", "subject")
    @classmethod
    def prevent_header_injection(cls, value: str) -> str:
        if "\r" in value or "\n" in value:
            raise ValueError("must be a single line")
        return value

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, value: str) -> str:
        cleaned = value.strip()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", cleaned):
            raise ValueError("must be a valid email address")
        return cleaned


@dataclass(frozen=True)
class ContactAttachment:
    original_filename: str
    filename: str
    content_type: str
    content: bytes

    @property
    def size(self) -> int:
        return len(self.content)


@dataclass(frozen=True)
class ResendSettings:
    api_key: str
    from_email: str
    to_email: str
    subject_prefix: str


class ContactDeliveryConfigurationError(RuntimeError):
    pass


class ContactDeliveryError(RuntimeError):
    pass


class ContactAttachmentValidationError(ValueError):
    pass


class ContactMultipartValidationError(ValueError):
    pass


@dataclass(frozen=True)
class ContactRateLimitSettings:
    max_requests: int
    window_seconds: int


@dataclass(frozen=True)
class ContactRateLimitDecision:
    allowed: bool
    retry_after_seconds: int = 0
    reservation_id: Optional[int] = None
    key: Optional[str] = None


def load_contact_rate_limit_settings(environ: Mapping[str, str]) -> ContactRateLimitSettings:
    def positive_int(name: str, default: int) -> int:
        try:
            value = int(environ.get(name, ""))
        except (TypeError, ValueError):
            return default
        return value if value > 0 else default

    return ContactRateLimitSettings(
        max_requests=positive_int(
            "CONTACT_RATE_LIMIT_MAX_REQUESTS",
            DEFAULT_CONTACT_RATE_LIMIT_MAX_REQUESTS,
        ),
        window_seconds=positive_int(
            "CONTACT_RATE_LIMIT_WINDOW_SECONDS",
            DEFAULT_CONTACT_RATE_LIMIT_WINDOW_SECONDS,
        ),
    )


class ContactRateLimiter:
    def __init__(
        self,
        max_requests: int = DEFAULT_CONTACT_RATE_LIMIT_MAX_REQUESTS,
        window_seconds: int = DEFAULT_CONTACT_RATE_LIMIT_WINDOW_SECONDS,
        clock: Callable[[], float] = time.monotonic,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clock = clock
        self._events = defaultdict(deque)
        self._lock = threading.Lock()
        self._next_reservation_id = 1

    @classmethod
    def from_environment(cls, environ: Mapping[str, str]):
        settings = load_contact_rate_limit_settings(environ)
        return cls(settings.max_requests, settings.window_seconds)

    def acquire(self, key: str) -> ContactRateLimitDecision:
        now = self.clock()
        cutoff = now - self.window_seconds
        with self._lock:
            events = self._events[key]
            while events and events[0][0] <= cutoff:
                events.popleft()
            if len(events) >= self.max_requests:
                retry_after_seconds = max(
                    1,
                    math.ceil(events[0][0] + self.window_seconds - now),
                )
                return ContactRateLimitDecision(False, retry_after_seconds)
            reservation_id = self._next_reservation_id
            self._next_reservation_id += 1
            events.append((now, reservation_id))
            return ContactRateLimitDecision(
                True,
                reservation_id=reservation_id,
                key=key,
            )

    def release(self, decision: ContactRateLimitDecision) -> None:
        if not decision.allowed or decision.key is None or decision.reservation_id is None:
            return
        with self._lock:
            events = self._events.get(decision.key)
            if not events:
                return
            for event in events:
                if event[1] == decision.reservation_id:
                    events.remove(event)
                    break
            if not events:
                self._events.pop(decision.key, None)


def build_contact_rate_limit_response(decision: ContactRateLimitDecision):
    retry_after_seconds = max(1, decision.retry_after_seconds)
    return (
        {
            "detail": "Too many contact requests. Please try again later.",
            "retryAfterSeconds": retry_after_seconds,
        },
        {"Retry-After": str(retry_after_seconds)},
    )


def load_resend_settings(environ: Mapping[str, str]) -> ResendSettings:
    required = {
        "RESEND_API_KEY": environ.get("RESEND_API_KEY", "").strip(),
        "CONTACT_FROM_EMAIL": environ.get("CONTACT_FROM_EMAIL", "").strip(),
        "CONTACT_TO_EMAIL": environ.get("CONTACT_TO_EMAIL", "").strip(),
        "CONTACT_SUBJECT_PREFIX": environ.get("CONTACT_SUBJECT_PREFIX", "").strip(),
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise ContactDeliveryConfigurationError(
            f"Missing contact delivery configuration: {', '.join(missing)}"
        )
    return ResendSettings(
        api_key=required["RESEND_API_KEY"],
        from_email=required["CONTACT_FROM_EMAIL"],
        to_email=required["CONTACT_TO_EMAIL"],
        subject_prefix=required["CONTACT_SUBJECT_PREFIX"],
    )


def sanitize_attachment_filename(filename: str) -> tuple[str, str]:
    basename = filename.replace("\\", "/").rsplit("/", 1)[-1]
    original = "".join(character for character in basename if character.isprintable()).strip()
    original = original[:180] or "attachment"
    normalized = unicodedata.normalize("NFKD", original).encode("ascii", "ignore").decode()
    extension = Path(normalized).suffix.lower()
    stem = Path(normalized).stem
    safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("._-") or "attachment"
    safe_extension = re.sub(r"[^A-Za-z0-9.]", "", extension)
    return original, f"{safe_stem[:120]}{safe_extension[:12]}"


def validate_contact_attachment(
    filename: str,
    content_type: str,
    content: bytes,
) -> ContactAttachment:
    original_filename, safe_filename = sanitize_attachment_filename(filename)
    extension = Path(safe_filename).suffix.lower()
    normalized_type = (content_type or "").split(";", 1)[0].strip().lower()

    if extension not in ALLOWED_ATTACHMENT_TYPES:
        raise ContactAttachmentValidationError(
            "Choose a PDF, PNG, JPG, DOC, or DOCX file."
        )
    if normalized_type not in ALLOWED_ATTACHMENT_TYPES[extension]:
        raise ContactAttachmentValidationError(
            "The attachment’s file type does not match an allowed format."
        )
    if not content:
        raise ContactAttachmentValidationError("The selected attachment is empty.")
    if len(content) > MAX_ATTACHMENT_BYTES:
        raise ContactAttachmentValidationError("Attachments must be 10 MB or smaller.")
    if not _content_matches_extension(extension, content):
        raise ContactAttachmentValidationError(
            "The attachment’s contents do not match its declared file type."
        )

    return ContactAttachment(
        original_filename=original_filename,
        filename=safe_filename,
        content_type=normalized_type,
        content=content,
    )


def validate_contact_attachments(
    attachments: Iterable[tuple[str, str, bytes]],
) -> list[ContactAttachment]:
    attachment_specs = list(attachments)
    if len(attachment_specs) > MAX_CONTACT_ATTACHMENTS:
        raise ContactAttachmentValidationError("You can attach up to 5 files.")

    validated = [
        validate_contact_attachment(filename, content_type, content)
        for filename, content_type, content in attachment_specs
    ]
    if sum(attachment.size for attachment in validated) > MAX_TOTAL_ATTACHMENT_BYTES:
        raise ContactAttachmentValidationError(
            "Attachments must be 25 MB or smaller in total."
        )
    return validated


def _content_matches_extension(extension: str, content: bytes) -> bool:
    if extension == ".pdf":
        return content.startswith(b"%PDF-")
    if extension == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if extension in {".jpg", ".jpeg"}:
        return content.startswith(b"\xff\xd8\xff")
    if extension == ".doc":
        return content.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    if extension == ".docx":
        try:
            with zipfile.ZipFile(BytesIO(content)) as archive:
                names = set(archive.namelist())
                return "[Content_Types].xml" in names and "word/document.xml" in names
        except (OSError, zipfile.BadZipFile):
            return False
    return False


def build_resend_payload(
    payload: ContactMessage,
    settings: ResendSettings,
    attachments: Optional[Sequence[ContactAttachment]] = None,
) -> dict:
    attachments = list(attachments or [])
    body_lines = [
        f"Name: {payload.fullName}",
        f"Contact type: {payload.contactType}",
        f"Email: {payload.email}",
        f"Subject: {payload.subject}",
    ]
    if attachments:
        body_lines.extend(["", f"Attachment count: {len(attachments)}", "Attachments:"])
        for index, attachment in enumerate(attachments, start=1):
            body_lines.extend(
                [
                    f"{index}. Original filename: {attachment.original_filename}",
                    f"   File type: {attachment.content_type}",
                    f"   File size: {attachment.size} bytes",
                ]
            )
    body_lines.extend(["", "Message:", payload.message])

    provider_payload = {
        "from": settings.from_email,
        "to": [settings.to_email],
        "subject": f"{settings.subject_prefix} {payload.subject}",
        "reply_to": payload.email,
        "text": "\n".join(body_lines),
    }
    if attachments:
        provider_payload["attachments"] = [
            {
                "filename": attachment.filename,
                "content": base64.b64encode(attachment.content).decode("ascii"),
            }
            for attachment in attachments
        ]
    return provider_payload


def deliver_contact_message(
    payload: ContactMessage,
    environ: Mapping[str, str],
    attachments: Optional[Sequence[ContactAttachment]] = None,
    sender: Optional[Callable[[str, dict], str]] = None,
) -> str:
    settings = load_resend_settings(environ)
    provider_payload = build_resend_payload(payload, settings, attachments)
    return (sender or send_with_resend)(settings.api_key, provider_payload)


def send_with_resend(api_key: str, provider_payload: dict) -> str:
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(provider_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Artiqal-Contact/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError) as error:
        raise ContactDeliveryError("The email provider did not accept the message.") from error

    message_id = response_data.get("id")
    if not message_id:
        raise ContactDeliveryError("The email provider did not confirm the message.")
    return str(message_id)


def parse_contact_multipart(body: bytes, content_type: str) -> tuple[dict, list[ContactAttachment]]:
    if len(body) > MAX_MULTIPART_BYTES:
        raise ContactMultipartValidationError("The contact request is too large.")
    if not content_type.lower().startswith("multipart/form-data;"):
        raise ContactMultipartValidationError("Expected a multipart form submission.")

    message = BytesParser(policy=policy.default).parsebytes(
        f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8") + body
    )
    if not message.is_multipart():
        raise ContactMultipartValidationError("The multipart form data is invalid.")

    fields = {}
    attachment_specs = []
    for part in message.iter_parts():
        field_name = part.get_param("name", header="content-disposition")
        if not field_name:
            continue
        filename = part.get_filename()
        raw_content = part.get_payload(decode=True) or b""
        if filename is not None:
            if field_name != "attachments":
                raise ContactMultipartValidationError(
                    "Attachments must use the attachments field."
                )
            if filename:
                attachment_specs.append((filename, part.get_content_type(), raw_content))
                if len(attachment_specs) > MAX_CONTACT_ATTACHMENTS:
                    raise ContactAttachmentValidationError("You can attach up to 5 files.")
            continue
        if field_name in fields:
            raise ContactMultipartValidationError("Duplicate contact form fields are not allowed.")
        try:
            fields[field_name] = raw_content.decode(part.get_content_charset() or "utf-8")
        except UnicodeDecodeError as error:
            raise ContactMultipartValidationError("Contact form text must be UTF-8.") from error

    return fields, validate_contact_attachments(attachment_specs)
