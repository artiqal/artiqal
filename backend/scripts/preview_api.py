import importlib.util
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("content", ROOT / "content.py")
content = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content)

CATEGORIES = content.CATEGORIES
ACTIVITIES_BY_CATEGORY = content.ACTIVITIES_BY_CATEGORY

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

    def send_json(self, payload, status=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.send_header("Cache-Control", "no-cache")
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

    def log_message(self, *_args):
        return


if __name__ == "__main__":
    print("Preview API running at http://127.0.0.1:8000/api/activities")
    HTTPServer(("127.0.0.1", 8000), PreviewApiHandler).serve_forever()
