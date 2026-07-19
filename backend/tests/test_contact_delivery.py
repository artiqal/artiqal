import base64
import io
import unittest
import zipfile
from unittest.mock import Mock

from pydantic import ValidationError

from contact_delivery import (
    MAX_ATTACHMENT_BYTES,
    MAX_CONTACT_ATTACHMENTS,
    MAX_TOTAL_ATTACHMENT_BYTES,
    ContactAttachmentValidationError,
    ContactDeliveryConfigurationError,
    ContactDeliveryError,
    ContactMessage,
    ContactRateLimiter,
    ResendSettings,
    build_resend_payload,
    build_contact_rate_limit_response,
    deliver_contact_message,
    load_resend_settings,
    load_contact_rate_limit_settings,
    parse_contact_multipart,
    sanitize_attachment_filename,
    validate_contact_attachment,
    validate_contact_attachments,
)


def make_docx():
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types />")
        archive.writestr("word/document.xml", "<document />")
    return output.getvalue()


def make_multipart(fields, attachments=None, boundary="artiqal-test-boundary"):
    parts = []
    for name, value in fields.items():
        parts.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                str(value).encode(),
                b"\r\n",
            ]
        )
    for attachment in attachments or []:
        filename, content_type, content = attachment
        parts.extend(
            [
                f"--{boundary}\r\n".encode(),
                (
                    'Content-Disposition: form-data; name="attachments"; '
                    f'filename="{filename}"\r\n'
                ).encode(),
                f"Content-Type: {content_type}\r\n\r\n".encode(),
                content,
                b"\r\n",
            ]
        )
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


class ContactMessageValidationTests(unittest.TestCase):
    def valid_payload(self, **overrides):
        payload = {
            "fullName": "Aisha Rahman",
            "contactType": "Speech-language pathologist",
            "email": "aisha@example.com",
            "subject": "Activity library question",
            "message": "Please tell me more about the available activities.",
            "honeypot": "",
        }
        payload.update(overrides)
        return payload

    def test_requires_valid_contact_fields(self):
        with self.assertRaises(ValidationError):
            ContactMessage(**self.valid_payload(fullName="   "))
        with self.assertRaises(ValidationError):
            ContactMessage(**self.valid_payload(contactType="Clinician"))
        with self.assertRaises(ValidationError):
            ContactMessage(**self.valid_payload(email="not-an-email"))

    def test_accepts_each_contact_type_and_empty_honeypot(self):
        for contact_type in (
            "Speech-language pathologist",
            "Client / patient",
            "Family member / caregiver",
            "Student",
            "Other",
        ):
            payload = ContactMessage(**self.valid_payload(contactType=contact_type))
            self.assertEqual(payload.contactType, contact_type)
            self.assertEqual(payload.honeypot, "")


class ContactAttachmentTests(unittest.TestCase):
    def test_accepts_pdf_png_jpeg_doc_and_docx(self):
        fixtures = (
            ("context.pdf", "application/pdf", b"%PDF-1.7 sample"),
            ("screen.png", "image/png", b"\x89PNG\r\n\x1a\ncontent"),
            ("photo.jpg", "image/jpeg", b"\xff\xd8\xff\xe0content"),
            ("notes.doc", "application/msword", b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1content"),
            (
                "notes.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                make_docx(),
            ),
        )
        for filename, content_type, content in fixtures:
            with self.subTest(filename=filename):
                attachment = validate_contact_attachment(filename, content_type, content)
                self.assertEqual(attachment.original_filename, filename)
                self.assertEqual(attachment.content, content)

    def test_rejects_oversized_unsupported_and_mismatched_files(self):
        with self.assertRaisesRegex(ContactAttachmentValidationError, "10 MB"):
            validate_contact_attachment(
                "large.pdf",
                "application/pdf",
                b"%PDF-" + (b"x" * MAX_ATTACHMENT_BYTES),
            )
        with self.assertRaisesRegex(ContactAttachmentValidationError, "PDF, PNG"):
            validate_contact_attachment("payload.exe", "application/octet-stream", b"MZ")
        with self.assertRaisesRegex(ContactAttachmentValidationError, "does not match"):
            validate_contact_attachment("image.png", "application/octet-stream", b"\x89PNG\r\n\x1a\n")
        with self.assertRaisesRegex(ContactAttachmentValidationError, "contents"):
            validate_contact_attachment("image.png", "image/png", b"not a png")

    def test_sanitizes_path_and_unsafe_filename_characters(self):
        original, sanitized = sanitize_attachment_filename("../../client notes (final)\n.pdf")
        self.assertEqual(original, "client notes (final).pdf")
        self.assertEqual(sanitized, "client_notes_final.pdf")

    def test_accepts_five_files_and_rejects_a_sixth(self):
        fixture = ("context.pdf", "application/pdf", b"%PDF-1.7 sample")
        self.assertEqual(len(validate_contact_attachments([fixture] * MAX_CONTACT_ATTACHMENTS)), 5)
        with self.assertRaisesRegex(ContactAttachmentValidationError, "up to 5"):
            validate_contact_attachments([fixture] * (MAX_CONTACT_ATTACHMENTS + 1))

    def test_rejects_a_combined_payload_larger_than_25_mb(self):
        fixtures = []
        for index in range(3):
            fixtures.append((
                f"context-{index}.pdf",
                "application/pdf",
                b"%PDF-" + (b"x" * (MAX_TOTAL_ATTACHMENT_BYTES // 3)),
            ))
        with self.assertRaisesRegex(ContactAttachmentValidationError, "25 MB"):
            validate_contact_attachments(fixtures)


class ContactDeliveryTests(unittest.TestCase):
    def setUp(self):
        self.payload = ContactMessage(
            fullName="Aisha Rahman",
            contactType="Family member / caregiver",
            email="aisha@example.com",
            subject="Activity library question",
            message="Please tell me more about the available activities.",
            honeypot="",
        )
        self.settings = ResendSettings(
            api_key="test-resend-key",
            from_email="Artiqal <contact@artiqal.test>",
            to_email="admin@artiqal.test",
            subject_prefix="[Artiqal Website]",
        )
        self.environ = {
            "RESEND_API_KEY": "test-resend-key",
            "CONTACT_FROM_EMAIL": "Artiqal <contact@artiqal.test>",
            "CONTACT_TO_EMAIL": "admin@artiqal.test",
            "CONTACT_SUBJECT_PREFIX": "[Artiqal Website]",
        }

    def test_builds_payload_without_an_attachment(self):
        provider_payload = build_resend_payload(self.payload, self.settings)

        self.assertNotIn("attachments", provider_payload)
        self.assertEqual(provider_payload["subject"], "[Artiqal Website] Activity library question")
        self.assertEqual(provider_payload["reply_to"], "aisha@example.com")
        self.assertEqual(provider_payload["to"], ["admin@artiqal.test"])

    def test_all_attachments_are_base64_encoded_with_metadata_in_email_body(self):
        attachments = validate_contact_attachments([
            ("client screen.png", "image/png", b"\x89PNG\r\n\x1a\ncontent"),
            ("context.pdf", "application/pdf", b"%PDF-1.7 sample"),
        ])
        provider_payload = build_resend_payload(self.payload, self.settings, attachments)

        self.assertEqual(provider_payload["attachments"][0]["filename"], "client_screen.png")
        self.assertEqual(
            base64.b64decode(provider_payload["attachments"][0]["content"]),
            attachments[0].content,
        )
        self.assertEqual(len(provider_payload["attachments"]), 2)
        self.assertIn("Attachment count: 2", provider_payload["text"])
        self.assertIn("Original filename: client screen.png", provider_payload["text"])
        self.assertIn("File type: image/png", provider_payload["text"])
        self.assertIn(f"File size: {attachments[0].size} bytes", provider_payload["text"])
        self.assertIn("Original filename: context.pdf", provider_payload["text"])

    def test_delivery_returns_only_after_resend_confirms_an_id(self):
        sender = Mock(return_value="resend-message-id")
        message_id = deliver_contact_message(self.payload, self.environ, sender=sender)

        self.assertEqual(message_id, "resend-message-id")
        api_key, provider_payload = sender.call_args.args
        self.assertEqual(api_key, "test-resend-key")
        self.assertNotIn("test-resend-key", str(provider_payload))

    def test_provider_failure_is_not_converted_to_success(self):
        sender = Mock(side_effect=ContactDeliveryError("provider rejected request"))
        with self.assertRaises(ContactDeliveryError):
            deliver_contact_message(self.payload, self.environ, sender=sender)

    def test_rejects_missing_resend_configuration(self):
        with self.assertRaises(ContactDeliveryConfigurationError):
            load_resend_settings({})


class ContactMultipartAndRateLimitTests(unittest.TestCase):
    def setUp(self):
        self.fields = {
            "fullName": "Aisha Rahman",
            "contactType": "Student",
            "email": "aisha@example.com",
            "subject": "Question",
            "message": "Please help.",
            "honeypot": "",
        }

    def test_parses_submission_without_attachment(self):
        body, content_type = make_multipart(self.fields)
        fields, attachments = parse_contact_multipart(body, content_type)
        self.assertEqual(fields, self.fields)
        self.assertEqual(attachments, [])

    def test_parses_repeated_attachment_fields(self):
        body, content_type = make_multipart(
            self.fields,
            [
                ("context.pdf", "application/pdf", b"%PDF-1.7 sample"),
                ("screen.png", "image/png", b"\x89PNG\r\n\x1a\ncontent"),
            ],
        )
        fields, attachments = parse_contact_multipart(body, content_type)
        self.assertEqual(fields["fullName"], "Aisha Rahman")
        self.assertEqual([attachment.filename for attachment in attachments], ["context.pdf", "screen.png"])

    def test_rejects_a_sixth_repeated_attachment(self):
        fixture = ("context.pdf", "application/pdf", b"%PDF-1.7 sample")
        body, content_type = make_multipart(
            self.fields,
            [fixture] * (MAX_CONTACT_ATTACHMENTS + 1),
        )
        with self.assertRaisesRegex(ContactAttachmentValidationError, "up to 5"):
            parse_contact_multipart(body, content_type)

    def test_all_valid_submissions_consume_one_request_and_window_slides(self):
        now = [100.0]
        limiter = ContactRateLimiter(max_requests=2, window_seconds=60, clock=lambda: now[0])
        self.assertTrue(limiter.acquire("client").allowed)
        self.assertTrue(limiter.acquire("client").allowed)
        rejected = limiter.acquire("client")
        self.assertFalse(rejected.allowed)
        self.assertEqual(rejected.retry_after_seconds, 60)
        now[0] += 31
        self.assertEqual(limiter.acquire("client").retry_after_seconds, 29)
        now[0] += 30
        self.assertTrue(limiter.acquire("client").allowed)

    def test_failed_delivery_reservation_can_be_released(self):
        limiter = ContactRateLimiter(max_requests=1, window_seconds=60)
        reservation = limiter.acquire("client")
        self.assertTrue(reservation.allowed)
        limiter.release(reservation)
        self.assertTrue(limiter.acquire("client").allowed)

    def test_rate_limit_configuration_uses_environment_or_safe_defaults(self):
        defaults = load_contact_rate_limit_settings({})
        self.assertEqual(defaults.max_requests, 5)
        self.assertEqual(defaults.window_seconds, 900)

        configured = load_contact_rate_limit_settings({
            "CONTACT_RATE_LIMIT_MAX_REQUESTS": "8",
            "CONTACT_RATE_LIMIT_WINDOW_SECONDS": "120",
        })
        self.assertEqual(configured.max_requests, 8)
        self.assertEqual(configured.window_seconds, 120)

        invalid = load_contact_rate_limit_settings({
            "CONTACT_RATE_LIMIT_MAX_REQUESTS": "0",
            "CONTACT_RATE_LIMIT_WINDOW_SECONDS": "invalid",
        })
        self.assertEqual(invalid, defaults)

    def test_rate_limit_response_includes_dynamic_header_and_body(self):
        limiter = ContactRateLimiter(max_requests=1, window_seconds=37, clock=lambda: 10)
        limiter.acquire("client")
        rejected = limiter.acquire("client")
        payload, headers = build_contact_rate_limit_response(rejected)
        self.assertEqual(payload["retryAfterSeconds"], 37)
        self.assertEqual(headers["Retry-After"], "37")


if __name__ == "__main__":
    unittest.main()
