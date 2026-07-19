import importlib.util
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

from pydantic import ValidationError


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from contact_delivery import (  # noqa: E402
    MAX_MULTIPART_BYTES,
    ContactAttachmentValidationError,
    ContactDeliveryConfigurationError,
    ContactDeliveryError,
    ContactMessage,
    ContactMultipartValidationError,
    ContactRateLimiter,
    build_contact_rate_limit_response,
    deliver_contact_message,
    parse_contact_multipart,
)


def load_local_environment(path):
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip().strip('"').strip("'"))


load_local_environment(ROOT / ".env")

spec = importlib.util.spec_from_file_location("content", ROOT / "content.py")
content = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content)

CATEGORIES = content.CATEGORIES
ACTIVITIES_BY_CATEGORY = content.ACTIVITIES_BY_CATEGORY
contact_rate_limiter = ContactRateLimiter.from_environment(os.environ)

ALLOWED_PREVIEW_ORIGINS = {
    "http://127.0.0.1:4173",
    "http://localhost:4173",
}


class PreviewApiHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin in ALLOWED_PREVIEW_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Vary", "Origin")

    def send_json(self, payload, status=200, headers=None):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.send_header("Cache-Control", "no-cache")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/categories":
            self.send_json(CATEGORIES)
            return

        if path == "/api/activities":
            self.send_json([
                {**activity, "category": slug}
                for slug, activities in ACTIVITIES_BY_CATEGORY.items()
                for activity in activities
            ])
            return

        if path.startswith("/api/categories/") and path.endswith("/activities"):
            slug = path.split("/")[3]
            status = 200 if slug in ACTIVITIES_BY_CATEGORY else 404
            self.send_json(ACTIVITIES_BY_CATEGORY.get(slug, []), status)
            return

        if path.startswith("/api/activities/"):
            parts = path.split("/")
            category = parts[3] if len(parts) > 3 else ""
            slug = parts[4] if len(parts) > 4 else ""
            activity = next(
                (item for item in ACTIVITIES_BY_CATEGORY.get(category, []) if item.get("slug") == slug),
                None,
            )
            self.send_json(activity or {"detail": "Activity not found"}, 200 if activity else 404)
            return

        self.send_json({"detail": "Not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/contact":
            self.send_json({"detail": "Not found"}, 404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json({"detail": "Invalid request length."}, 400)
            return
        if content_length <= 0:
            self.send_json({"detail": "The contact request is empty."}, 400)
            return
        if content_length > MAX_MULTIPART_BYTES:
            self.close_connection = True
            self.send_json({"detail": "The contact request is too large."}, 413)
            return

        try:
            fields, attachments = parse_contact_multipart(
                self.rfile.read(content_length),
                self.headers.get("Content-Type", ""),
            )
            payload = ContactMessage(
                fullName=fields.get("fullName", ""),
                contactType=fields.get("contactType", ""),
                email=fields.get("email", ""),
                subject=fields.get("subject", ""),
                message=fields.get("message", ""),
                honeypot=fields.get("honeypot", ""),
            )
        except ContactAttachmentValidationError as error:
            self.send_json({"detail": str(error)}, 400)
            return
        except ContactMultipartValidationError as error:
            self.send_json({"detail": str(error)}, 400)
            return
        except ValidationError:
            self.send_json({"detail": "Invalid contact form data."}, 422)
            return

        if payload.honeypot:
            self.send_json({"status": "accepted"}, 202)
            return

        rate_limit_decision = contact_rate_limiter.acquire(self.client_address[0])
        if not rate_limit_decision.allowed:
            response_payload, response_headers = build_contact_rate_limit_response(rate_limit_decision)
            self.send_json(response_payload, 429, response_headers)
            return

        try:
            deliver_contact_message(payload, os.environ, attachments)
        except ContactDeliveryConfigurationError:
            contact_rate_limiter.release(rate_limit_decision)
            self.send_json({"detail": "Contact message delivery is not configured."}, 503)
            return
        except ContactDeliveryError:
            contact_rate_limiter.release(rate_limit_decision)
            self.send_json({"detail": "Contact message delivery failed."}, 502)
            return

        self.send_json({"status": "accepted"}, 202)

    def log_message(self, *_args):
        return


if __name__ == "__main__":
    print("Preview API running at http://127.0.0.1:8000/api/activities")
    HTTPServer(("127.0.0.1", 8000), PreviewApiHandler).serve_forever()
