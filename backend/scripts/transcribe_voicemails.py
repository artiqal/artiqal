"""One-off: transcribe voicemail mp3 URLs with Whisper-1 and print the transcripts
plus suggested metadata. Run from /app/backend.

Usage:
    cd /app/backend && python scripts/transcribe_voicemails.py
"""
import asyncio
import io
import json
import os
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.openai import OpenAISpeechToText

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "backend" / ".env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")

# Slug, public URL — first 5 Green voicemails
VOICEMAILS = [
    ("green-1-gp-appt", "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/7xol65fe_Green%201%20-%20GP%20Appt%20Reminder.mp3"),
    ("green-2-prescription-ready", "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/lc4ni4xi_Green%202%20-%20Prescription%20Ready.mp3"),
    ("green-3-birthday", "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/hudgh49h_G03_%20Family%20Birthday%20Reminder.mp3"),
    ("green-4-parcel", "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/itcahi65_G04_Parcel%20Collection%20Notice.mp3"),
    ("green-5-hair-appt", "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/n7f4pqjw_G05_GP_Hair%20Appointment%20Reminder.mp3"),
]


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "soniva-stt/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


async def main():
    stt = OpenAISpeechToText(api_key=API_KEY)
    results = {}
    for slug, url in VOICEMAILS:
        print(f"\n→ {slug}")
        try:
            data = fetch(url)
            buf = io.BytesIO(data)
            buf.name = f"{slug}.mp3"
            resp = await stt.transcribe(file=buf, model="whisper-1", response_format="json", language="en")
            text = resp.get("text") if isinstance(resp, dict) else getattr(resp, "text", "")
            print(f"  size: {len(data)//1024} KB")
            print(f"  transcript: {text}")
            results[slug] = text.strip()
        except Exception as exc:  # noqa: BLE001
            print(f"  FAILED: {exc!r}")
            results[slug] = ""
    out = ROOT / "backend" / "scripts" / "voicemail_transcripts.json"
    out.write_text(json.dumps(results, indent=2))
    print(f"\nsaved → {out}")


if __name__ == "__main__":
    asyncio.run(main())
