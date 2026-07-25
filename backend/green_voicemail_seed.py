"""Extract and idempotently import the Green voicemail slice into Supabase."""

from __future__ import annotations

import argparse
import copy
import os
import uuid
from dataclasses import dataclass
from typing import Any, Mapping

import requests

from content import get_activity


SEED_NAMESPACE = uuid.UUID("ad3d9667-cf7c-4d34-bd5c-519ba8de8d5f")
ACTIVITY_SLUG = "voicemails"
LEVEL_KEY = "green"
LANGUAGE_CODE = "en"
LANGUAGE_NAME = "English (UK/US)"
THEME_PACK_SLUG = "mixed-bag"
THEME_PACK_NAME = "Mixed Bag"
INTERACTION_MODE = "single"
STATUS = "published"


def _stable_uuid(key: str) -> str:
    return str(uuid.uuid5(SEED_NAMESPACE, key))


@dataclass(frozen=True)
class GreenVoicemailSeed:
    level: dict[str, Any]
    items: list[dict[str, Any]]
    questions: list[dict[str, Any]]
    options: list[dict[str, Any]]


def extract_green_voicemail_seed() -> GreenVoicemailSeed:
    """Build relational seed rows directly from backend/content.py."""
    activity = get_activity("functional-communication", ACTIVITY_SLUG)
    if not activity:
        raise ValueError("Listening to a Voicemail content was not found")

    source_level = activity["content"]["levels"][LEVEL_KEY]
    source_items = source_level.get("letters", [])
    if len(source_items) != 10:
        raise ValueError(f"Expected exactly 10 Green voicemail items, found {len(source_items)}")

    level_id = _stable_uuid(f"{ACTIVITY_SLUG}:{LEVEL_KEY}")
    level = {
        "id": level_id,
        "activity_slug": ACTIVITY_SLUG,
        "legacy_level_key": LEVEL_KEY,
        "title": source_level["title"],
        "language_code": LANGUAGE_CODE,
        "language_name": LANGUAGE_NAME,
        "theme_pack_slug": THEME_PACK_SLUG,
        "theme_pack_name": THEME_PACK_NAME,
        "interaction_mode": INTERACTION_MODE,
        "status": STATUS,
        "sort_order": 0,
    }
    items: list[dict[str, Any]] = []
    questions: list[dict[str, Any]] = []
    options: list[dict[str, Any]] = []

    for item_order, source_item in enumerate(source_items):
        legacy_item_id = str(source_item["id"])
        item_id = _stable_uuid(f"{ACTIVITY_SLUG}:{LEVEL_KEY}:item:{legacy_item_id}")
        source_letterhead = copy.deepcopy(source_item.get("letterhead", {}))
        transcript = source_letterhead.pop("transcript")
        audio_source_url = source_letterhead.pop("audio_url")
        duration_label = source_letterhead.pop("duration", None)
        items.append(
            {
                "id": item_id,
                "level_id": level_id,
                "legacy_item_id": legacy_item_id,
                "title": source_item["title"],
                "summary": source_item.get("summary", ""),
                "body_text": source_item.get("text", ""),
                "transcript": transcript,
                "audio_source_url": audio_source_url,
                "duration_label": duration_label,
                "letterhead_data": source_letterhead,
                "language_code": LANGUAGE_CODE,
                "theme_pack_slug": THEME_PACK_SLUG,
                "interaction_mode": INTERACTION_MODE,
                "status": STATUS,
                "sort_order": item_order,
            }
        )

        for question_order, source_question in enumerate(source_item.get("questions", [])):
            legacy_question_id = f"q{question_order}"
            question_id = _stable_uuid(
                f"{ACTIVITY_SLUG}:{LEVEL_KEY}:item:{legacy_item_id}:{legacy_question_id}"
            )
            questions.append(
                {
                    "id": question_id,
                    "item_id": item_id,
                    "legacy_question_id": legacy_question_id,
                    "prompt": source_question["q"],
                    "replay_key": source_question.get("replay_key"),
                    "status": STATUS,
                    "sort_order": question_order,
                }
            )
            correct_index = source_question["answer"]
            for option_order, option_text in enumerate(source_question.get("options", [])):
                legacy_option_id = f"o{option_order}"
                options.append(
                    {
                        "id": _stable_uuid(
                            f"{ACTIVITY_SLUG}:{LEVEL_KEY}:item:{legacy_item_id}:"
                            f"{legacy_question_id}:{legacy_option_id}"
                        ),
                        "question_id": question_id,
                        "legacy_option_id": legacy_option_id,
                        "option_text": option_text,
                        "is_correct": option_order == correct_index,
                        "sort_order": option_order,
                    }
                )

    validate_green_voicemail_seed(GreenVoicemailSeed(level, items, questions, options))
    return GreenVoicemailSeed(level, items, questions, options)


def validate_green_voicemail_seed(seed: GreenVoicemailSeed) -> None:
    if len(seed.items) != 10:
        raise ValueError("Green voicemail seed must contain exactly 10 items")
    if [item["sort_order"] for item in seed.items] != list(range(10)):
        raise ValueError("Green voicemail item ordering is not contiguous")
    if any(item["language_code"] != LANGUAGE_CODE for item in seed.items):
        raise ValueError("Every Green voicemail item must explicitly use English")
    if any(item["theme_pack_slug"] != THEME_PACK_SLUG for item in seed.items):
        raise ValueError("Every Green voicemail item must explicitly use Mixed Bag")
    if any(item["interaction_mode"] != INTERACTION_MODE for item in seed.items):
        raise ValueError("Every Green voicemail item must explicitly use single interaction")

    correct_counts: dict[str, int] = {}
    for option in seed.options:
        if option["is_correct"]:
            correct_counts[option["question_id"]] = correct_counts.get(option["question_id"], 0) + 1
    if len(correct_counts) != len(seed.questions) or set(correct_counts.values()) != {1}:
        raise ValueError("Every Green voicemail question must have exactly one correct option")


class SupabaseSeedClient:
    def __init__(self, url: str, service_role_key: str, timeout_seconds: float = 30.0):
        self.base_url = f"{url.rstrip('/')}/rest/v1"
        self.timeout_seconds = timeout_seconds
        self.client = requests.Session()
        self.client.headers.update(
            {
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json",
            }
        )

    def upsert(self, table: str, rows: list[dict[str, Any]], conflict: str = "id") -> None:
        response = self.client.post(
            f"{self.base_url}/{table}",
            params={"on_conflict": conflict},
            headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
            json=rows,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()

    def count(self, table: str, filters: Mapping[str, str]) -> int:
        params = {"select": "id", **filters}
        response = self.client.get(
            f"{self.base_url}/{table}",
            params=params,
            headers={"Prefer": "count=exact", "Range": "0-0"},
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        content_range = response.headers.get("content-range", "")
        try:
            return int(content_range.rsplit("/", 1)[1])
        except (IndexError, ValueError) as error:
            raise RuntimeError(f"Supabase did not return an exact count for {table}") from error

    def close(self) -> None:
        self.client.close()


def import_green_voicemails(url: str, service_role_key: str) -> GreenVoicemailSeed:
    seed = extract_green_voicemail_seed()
    client = SupabaseSeedClient(url, service_role_key)
    try:
        client.upsert("voicemail_levels", [seed.level])
        client.upsert("voicemail_items", seed.items)
        client.upsert("voicemail_questions", seed.questions)
        client.upsert("voicemail_answer_options", seed.options)
        imported_count = client.count(
            "voicemail_items",
            {"level_id": f"eq.{seed.level['id']}", "status": "eq.published"},
        )
        if imported_count != 10:
            raise RuntimeError(f"Expected 10 imported Green voicemail items, found {imported_count}")
    finally:
        client.close()
    return seed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Extract and validate repository content without contacting Supabase.",
    )
    args = parser.parse_args()
    seed = extract_green_voicemail_seed()
    if args.verify_only:
        print(
            f"Validated {len(seed.items)} items, {len(seed.questions)} questions, "
            f"and {len(seed.options)} answer options."
        )
        return 0

    url = os.environ.get("SUPABASE_URL", "").strip()
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not service_role_key:
        parser.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
    import_green_voicemails(url, service_role_key)
    print(
        f"Imported {len(seed.items)} items, {len(seed.questions)} questions, "
        f"and {len(seed.options)} answer options."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
