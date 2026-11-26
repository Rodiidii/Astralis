"""Public Genshin calendar normalization and reward enrichment tests."""
import importlib.util
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location("astralis_events_server", ROOT / "server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class GenshinEventsTest(unittest.TestCase):
    def test_reward_source_enriches_a_calendar_row_with_a_timezone_offset(self):
        calendar_rows = [{
            "id": "stress-project", "kind": "event", "title": "Stress Block Smashing Project",
            "start": "2026-11-26T00:00:00Z", "end": "2026-12-03T00:00:00Z",
            "image": "", "icons": [], "primogems": None, "description": "Published calendar row",
        }]
        html = '<html><script id="cal-data">' + json.dumps(calendar_rows) + '</script></html>'
        reward = {
            "events": [{
                "name": "Projet de destruction des blocs de stress", "type_name": "ActTypeOther",
                "start_time": 1795705200, "end_time": 1796313600,
                "description": "Événement publié en français.",
                "rewards": [{"name": "Primogemmes", "amount": 420, "icon": "https://example.invalid/primo.png"}],
                "special_reward": None,
            }],
            "banners": [],
        }

        def fake_fetch(url):
            if "genshinflex.com" in url:
                return html.encode("utf-8")
            if "ennead.cc" in url:
                return json.dumps(reward, ensure_ascii=False).encode("utf-8")
            raise AssertionError(url)

        with patch.object(server, "fetch", side_effect=fake_fetch):
            result = json.loads(server.genshin_events())

        self.assertEqual(len(result["events"]), 1)
        event = result["events"][0]
        self.assertEqual(event["kind"], "event")
        self.assertEqual(event["primogems"], 420)
        self.assertEqual(event["rewards"][0]["amount"], 420)
        self.assertEqual(event["verificationSource"]["title"], "Récompenses et illustrations · Ennead")
        self.assertEqual(event["title"], "Projet de destruction des blocs de stress")
        self.assertEqual(event["description"], "Événement publié en français.")

    def test_same_window_events_do_not_inherit_each_others_primogems(self):
        start = int(server._calendar_datetime("2026-12-03T00:00:00Z").timestamp())
        end = int(server._calendar_datetime("2026-12-15T00:00:00Z").timestamp())
        calendar_rows = [{
            "id": "event-grand-defense", "kind": "event",
            "title": "The Grand Defense: Defy the Unjust Judgment",
            "start": "2026-12-03T00:00:00Z", "end": "2026-12-15T00:00:00Z",
            "image": "", "icons": [], "primogems": None, "description": "",
        }, {
            "id": "ann-grand-defense", "kind": "event",
            "title": "The Grand Defense: Defy the Unjust Judgment",
            "start": "2026-12-02T00:00:00Z", "end": "2026-12-14T23:00:00Z",
            "image": "", "icons": [], "primogems": None, "description": "Annonce en doublon",
        }]
        rewards = {
            "events": [
                {"id": 465, "name": "La grande défense : Contre un jugement injuste", "type_name": "ActTypeOther",
                 "start_time": start, "end_time": end, "description": "", "rewards": [{"name": "Primogemmes", "amount": 920}], "special_reward": None},
                {"id": 470, "name": "Dans le feu de la fonderie : Marée sans fin", "type_name": "ActTypeOther",
                 "start_time": start, "end_time": end, "description": "", "rewards": [], "special_reward": None},
            ],
            "banners": [],
        }
        html = '<html><script id="cal-data">' + json.dumps(calendar_rows) + '</script></html>'

        def fake_fetch(url):
            if "genshinflex.com" in url:
                return html.encode("utf-8")
            if "ennead.cc" in url:
                return json.dumps(rewards, ensure_ascii=False).encode("utf-8")
            raise AssertionError(url)

        with patch.object(server, "fetch", side_effect=fake_fetch):
            result = json.loads(server.genshin_events())

        by_title = {event["title"]: event for event in result["events"]}
        grand_defense = by_title["La grande défense : Contre un jugement injuste"]
        forge = by_title["Dans le feu de la fonderie : Marée sans fin"]
        self.assertEqual(grand_defense["primogems"], 920)
        self.assertEqual(forge["primogems"], 0)
        self.assertTrue(forge["id"].startswith("ennead-event-"))
        self.assertEqual(len(result["events"]), 2)

    def test_calendar_filters_expired_invalid_and_duplicate_rows(self):
        now = server.datetime(2026, 11, 25, tzinfo=server.timezone.utc)
        rows = [
            {"id": "ok", "kind": "event", "title": "Actif", "start": "2026-11-26T00:00:00Z", "end": "2026-11-27T00:00:00Z"},
            {"id": "expired", "kind": "event", "title": "Terminé", "start": "2026-11-20T00:00:00Z", "end": "2026-11-21T00:00:00Z"},
            {"id": "bad", "kind": "event", "title": "Date invalide", "start": "n/a", "end": "2026-11-27T00:00:00Z"},
            {"id": "dup", "kind": "event", "title": "Actif", "start": "2026-11-26T06:00:00+06:00", "end": "2026-11-27T06:00:00+06:00"},
        ]
        result = server._clean_genshin_calendar(rows, now=now)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "ok")

    def test_onslaught_translation_matches_its_french_title(self):
        score = server._calendar_identity_score(
            {"kind": "onslaught", "title": "Stygian Onslaught"},
            {"kind": "onslaught", "title": "Carnage chtonien"},
        )
        self.assertGreaterEqual(score, 20)


if __name__ == "__main__":
    unittest.main()
