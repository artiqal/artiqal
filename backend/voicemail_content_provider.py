"""Backend-owned Supabase provider for the Green voicemail migration slice."""

from __future__ import annotations

import copy
import logging
import asyncio
from collections import defaultdict
from typing import Any, Mapping

import requests


logger = logging.getLogger(__name__)
ACTIVITY_SLUG = "voicemails"
LEVEL_KEY = "green"
EXPECTED_ITEM_COUNT = 10
EXPECTED_QUESTIONS_PER_ITEM = 5
EXPECTED_OPTIONS_PER_QUESTION = 3


class SupabaseVoicemailContentError(RuntimeError):
    """Raised when the Supabase slice is incomplete or invalid."""


class SupabaseVoicemailClient:
    def __init__(self, url: str, service_role_key: str, timeout_seconds: float = 10.0):
        self.base_url = f"{url.rstrip('/')}/rest/v1"
        self.timeout_seconds = timeout_seconds
        self.headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
        }

    async def _get(self, table: str, params: Mapping[str, str]) -> list[dict[str, Any]]:
        response = await asyncio.to_thread(
            requests.get,
            f"{self.base_url}/{table}",
            params=params,
            headers=self.headers,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, list):
            raise SupabaseVoicemailContentError(f"Unexpected Supabase response for {table}")
        return payload

    async def load_green_items(self) -> list[dict[str, Any]]:
        levels = await self._get(
            "voicemail_levels",
            {
                "select": "id",
                "activity_slug": f"eq.{ACTIVITY_SLUG}",
                "legacy_level_key": f"eq.{LEVEL_KEY}",
                "language_code": "eq.en",
                "theme_pack_slug": "eq.mixed-bag",
                "interaction_mode": "eq.single",
                "status": "eq.published",
                "limit": "2",
            },
        )
        if len(levels) != 1:
            raise SupabaseVoicemailContentError("Expected one published Green voicemail level")
        level_id = levels[0]["id"]
        items = await self._get(
            "voicemail_items",
            {
                "select": (
                    "id,legacy_item_id,title,summary,body_text,transcript,audio_source_url,"
                    "duration_label,letterhead_data,sort_order"
                ),
                "level_id": f"eq.{level_id}",
                "language_code": "eq.en",
                "theme_pack_slug": "eq.mixed-bag",
                "interaction_mode": "eq.single",
                "status": "eq.published",
                "order": "sort_order.asc",
            },
        )
        if len(items) != EXPECTED_ITEM_COUNT:
            raise SupabaseVoicemailContentError(
                f"Expected {EXPECTED_ITEM_COUNT} published Green voicemail items, found {len(items)}"
            )
        item_ids = [item["id"] for item in items]
        questions = await self._get(
            "voicemail_questions",
            {
                "select": "id,item_id,prompt,replay_key,sort_order",
                "item_id": f"in.({','.join(item_ids)})",
                "status": "eq.published",
                "order": "sort_order.asc",
            },
        )
        question_ids = [question["id"] for question in questions]
        if not question_ids:
            raise SupabaseVoicemailContentError("Published Green voicemail questions are missing")
        options = await self._get(
            "voicemail_answer_options",
            {
                "select": "question_id,option_text,is_correct,sort_order",
                "question_id": f"in.({','.join(question_ids)})",
                "order": "sort_order.asc",
            },
        )
        return _reconstruct_items(items, questions, options)


def _reconstruct_items(
    item_rows: list[dict[str, Any]],
    question_rows: list[dict[str, Any]],
    option_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    _validate_complete_slice(item_rows, question_rows, option_rows)
    questions_by_item: dict[str, list[dict[str, Any]]] = defaultdict(list)
    options_by_question: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for option in option_rows:
        options_by_question[option["question_id"]].append(option)
    for values in options_by_question.values():
        values.sort(key=lambda value: value["sort_order"])
    for question in question_rows:
        questions_by_item[question["item_id"]].append(question)
    for values in questions_by_item.values():
        values.sort(key=lambda value: value["sort_order"])

    reconstructed: list[dict[str, Any]] = []
    for item in sorted(item_rows, key=lambda value: value["sort_order"]):
        reconstructed_questions = []
        for question in questions_by_item[item["id"]]:
            question_options = options_by_question[question["id"]]
            correct_indexes = [
                index for index, option in enumerate(question_options) if option["is_correct"]
            ]
            if len(correct_indexes) != 1:
                raise SupabaseVoicemailContentError(
                    f"Question {question['id']} must have exactly one correct option"
                )
            reconstructed_question = {
                "q": question["prompt"],
                "options": [option["option_text"] for option in question_options],
                "answer": correct_indexes[0],
            }
            if question.get("replay_key") is not None:
                reconstructed_question["replay_key"] = question["replay_key"]
            reconstructed_questions.append(reconstructed_question)
        if not reconstructed_questions:
            raise SupabaseVoicemailContentError(
                f"Green voicemail item {item['legacy_item_id']} has no published questions"
            )

        letterhead = copy.deepcopy(item.get("letterhead_data") or {})
        letterhead["audio_url"] = item["audio_source_url"]
        if item.get("duration_label") is not None:
            letterhead["duration"] = item["duration_label"]
        letterhead["transcript"] = item["transcript"]
        reconstructed.append(
            {
                "id": _restore_legacy_id(item["legacy_item_id"]),
                "title": item["title"],
                "summary": item.get("summary", ""),
                "letterhead": letterhead,
                "text": item.get("body_text", ""),
                "questions": reconstructed_questions,
            }
        )
    return reconstructed


def _validate_complete_slice(
    item_rows: list[dict[str, Any]],
    question_rows: list[dict[str, Any]],
    option_rows: list[dict[str, Any]],
) -> None:
    if len(item_rows) != EXPECTED_ITEM_COUNT:
        raise SupabaseVoicemailContentError(
            f"Expected {EXPECTED_ITEM_COUNT} published Green voicemail items, found {len(item_rows)}"
        )

    item_ids = {item["id"] for item in item_rows}
    questions_by_item: dict[str, int] = defaultdict(int)
    for question in question_rows:
        if question["item_id"] not in item_ids:
            raise SupabaseVoicemailContentError("Green voicemail question references an unknown item")
        questions_by_item[question["item_id"]] += 1
    if any(questions_by_item[item_id] != EXPECTED_QUESTIONS_PER_ITEM for item_id in item_ids):
        raise SupabaseVoicemailContentError(
            f"Every Green voicemail item must have exactly {EXPECTED_QUESTIONS_PER_ITEM} questions"
        )

    question_ids = {question["id"] for question in question_rows}
    options_by_question: dict[str, int] = defaultdict(int)
    for option in option_rows:
        if option["question_id"] not in question_ids:
            raise SupabaseVoicemailContentError("Green voicemail option references an unknown question")
        options_by_question[option["question_id"]] += 1
    if any(
        options_by_question[question_id] != EXPECTED_OPTIONS_PER_QUESTION
        for question_id in question_ids
    ):
        raise SupabaseVoicemailContentError(
            f"Every Green voicemail question must have exactly {EXPECTED_OPTIONS_PER_QUESTION} options"
        )


def _restore_legacy_id(value: str) -> Any:
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


async def get_voicemail_activity(
    code_activity: dict[str, Any],
    environ: Mapping[str, str],
    client: SupabaseVoicemailClient | None = None,
) -> dict[str, Any]:
    """Return one atomic Green source: Supabase when valid, otherwise code."""
    url = environ.get("SUPABASE_URL", "").strip()
    service_role_key = environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not service_role_key:
        return code_activity

    provider = client or SupabaseVoicemailClient(url, service_role_key)
    try:
        green_items = await provider.load_green_items()
    except (
        SupabaseVoicemailContentError,
        requests.RequestException,
        IndexError,
        KeyError,
        TypeError,
        ValueError,
    ):
        logger.warning("Supabase Green voicemail content unavailable; using code fallback", exc_info=True)
        return code_activity

    activity = copy.deepcopy(code_activity)
    activity["content"]["levels"][LEVEL_KEY]["letters"] = green_items
    return activity
