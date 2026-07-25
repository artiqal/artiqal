import copy
import sys
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from content import get_activity
from green_voicemail_seed import (
    INTERACTION_MODE,
    LANGUAGE_CODE,
    THEME_PACK_SLUG,
    extract_green_voicemail_seed,
)
from voicemail_content_provider import (
    SupabaseVoicemailContentError,
    _reconstruct_items,
    get_voicemail_activity,
)


class FakeSupabaseVoicemailClient:
    def __init__(self, items=None, error=None):
        self.items = items
        self.error = error
        self.calls = 0

    async def load_green_items(self):
        self.calls += 1
        if self.error:
            raise self.error
        return copy.deepcopy(self.items)


def reconstruct_seed_items(seed):
    return _reconstruct_items(
        seed.items,
        seed.questions,
        seed.options,
    )


class GreenVoicemailSeedTests(unittest.TestCase):
    def setUp(self):
        self.source_activity = get_activity("functional-communication", "voicemails")
        self.source_items = self.source_activity["content"]["levels"]["green"]["letters"]

    def test_extracts_exact_green_slice_with_explicit_defaults(self):
        seed = extract_green_voicemail_seed()

        self.assertEqual(len(seed.items), 10)
        self.assertEqual(len(seed.questions), 50)
        self.assertEqual(len(seed.options), 150)
        self.assertEqual([item["legacy_item_id"] for item in seed.items], [str(i) for i in range(1, 11)])
        self.assertEqual([item["sort_order"] for item in seed.items], list(range(10)))
        self.assertEqual({item["language_code"] for item in seed.items}, {LANGUAGE_CODE})
        self.assertEqual({item["theme_pack_slug"] for item in seed.items}, {THEME_PACK_SLUG})
        self.assertEqual({item["interaction_mode"] for item in seed.items}, {INTERACTION_MODE})
        self.assertEqual({item["status"] for item in seed.items}, {"published"})

    def test_seed_ids_are_stable_and_import_is_idempotent(self):
        first = extract_green_voicemail_seed()
        second = extract_green_voicemail_seed()

        self.assertEqual(first, second)
        self.assertEqual(len({row["id"] for row in first.items}), 10)
        self.assertEqual(len({row["id"] for row in first.questions}), 50)
        self.assertEqual(len({row["id"] for row in first.options}), 150)

    def test_relational_round_trip_preserves_content_and_correct_answers(self):
        reconstructed = reconstruct_seed_items(extract_green_voicemail_seed())

        self.assertEqual(reconstructed, self.source_items)
        for source_item, restored_item in zip(self.source_items, reconstructed):
            self.assertEqual(source_item["letterhead"]["transcript"], restored_item["letterhead"]["transcript"])
            self.assertEqual(source_item["letterhead"]["audio_url"], restored_item["letterhead"]["audio_url"])
            for source_question, restored_question in zip(source_item["questions"], restored_item["questions"]):
                self.assertEqual(source_question["options"], restored_question["options"])
                self.assertEqual(
                    source_question["options"][source_question["answer"]],
                    restored_question["options"][restored_question["answer"]],
                )

    def test_incomplete_question_or_option_slice_is_rejected(self):
        seed = extract_green_voicemail_seed()

        with self.assertRaisesRegex(
            SupabaseVoicemailContentError,
            "exactly 5 questions",
        ):
            _reconstruct_items(seed.items, seed.questions[:-1], seed.options[:-3])

        with self.assertRaisesRegex(
            SupabaseVoicemailContentError,
            "exactly 3 options",
        ):
            _reconstruct_items(seed.items, seed.questions, seed.options[:-1])


class GreenVoicemailProviderTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.code_activity = get_activity("functional-communication", "voicemails")
        self.supabase_items = reconstruct_seed_items(extract_green_voicemail_seed())

    async def test_missing_configuration_uses_code_content_without_calling_client(self):
        client = FakeSupabaseVoicemailClient(items=[])

        result = await get_voicemail_activity(self.code_activity, {}, client=client)

        self.assertIs(result, self.code_activity)
        self.assertEqual(client.calls, 0)

    async def test_unavailable_supabase_uses_complete_code_fallback(self):
        client = FakeSupabaseVoicemailClient(
            error=SupabaseVoicemailContentError("temporary failure")
        )

        result = await get_voicemail_activity(
            self.code_activity,
            {"SUPABASE_URL": "https://example.supabase.co", "SUPABASE_SERVICE_ROLE_KEY": "test-key"},
            client=client,
        )

        self.assertIs(result, self.code_activity)
        self.assertEqual(client.calls, 1)

    async def test_configured_provider_replaces_green_atomically_and_preserves_api_shape(self):
        client = FakeSupabaseVoicemailClient(items=self.supabase_items)

        result = await get_voicemail_activity(
            self.code_activity,
            {"SUPABASE_URL": "https://example.supabase.co", "SUPABASE_SERVICE_ROLE_KEY": "test-key"},
            client=client,
        )

        self.assertIsNot(result, self.code_activity)
        self.assertEqual(result, self.code_activity)
        self.assertEqual(client.calls, 1)
        self.assertEqual(len(result["content"]["levels"]["green"]["letters"]), 10)
        self.assertEqual(
            result["content"]["levels"]["amber"],
            self.code_activity["content"]["levels"]["amber"],
        )


if __name__ == "__main__":
    unittest.main()
