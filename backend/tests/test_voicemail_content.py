import re
import sys
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from content import get_activity


EXPECTED_DURATIONS = {
    "green": ["0:30", "0:15", "0:17", "0:17", "0:14", "0:17", "0:21", "0:21", "0:15", "0:22"],
    "amber": ["0:29", "0:26", "0:27", "0:20", "0:25", "0:27", "0:24", "0:31", "0:34", "0:30"],
    "red": ["0:48", "0:52", "0:31", "0:41", "0:34", "0:47", "0:47", "0:40", "0:41", "0:41"],
    "pink": ["0:25", "0:28", "0:30", "0:45", "0:24", "0:30", "0:29", "0:31", "0:28", "0:27"],
}


def _all_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for nested_value in value.values():
            yield from _all_strings(nested_value)
    elif isinstance(value, (list, tuple)):
        for nested_value in value:
            yield from _all_strings(nested_value)


class VoicemailContentIntegrityTests(unittest.TestCase):
    def test_active_voicemail_content_has_no_known_encoding_artifacts(self):
        activity = get_activity("functional-communication", "voicemails")
        content_text = "\n".join(_all_strings(activity))

        self.assertIsNone(re.search(r"(?:Â|Ã|â[€“”™]|�)", content_text))
        self.assertIn("Café", content_text)
        self.assertIn("Hannah · table booking update", content_text)
        self.assertIn("£100 fine", content_text)

    def test_voicemail_duration_metadata_matches_audited_audio_assets(self):
        activity = get_activity("functional-communication", "voicemails")
        levels = activity["content"]["levels"]

        self.assertEqual(set(levels), set(EXPECTED_DURATIONS))
        for level_key, expected in EXPECTED_DURATIONS.items():
            actual = [item["letterhead"]["duration"] for item in levels[level_key]["letters"]]
            self.assertEqual(actual, expected)
