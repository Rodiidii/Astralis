"""Public active-code normalization tests for Genshin and Honkai: Star Rail."""
import importlib.util
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location("astralis_codes_server", ROOT / "server.py")
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class PublicGameCodesTest(unittest.TestCase):
    def test_fetches_active_codes_for_both_games_and_builds_official_links(self):
        payloads = {
            "genshin": {"active": [
                {"code": "PRIMO2026", "rewards": ["Primogem ×60"]},
                {"code": "primo2026", "rewards": ["duplicate"]},
                {"code": "LIVESTREAM CODE 1", "rewards": ["placeholder"]},
            ]},
            "starrail": {"active": [
                {"code": "JADE2026", "rewards": ["Stellar Jade ×60"]},
            ]},
        }

        def fake_fetch(url):
            game = "genshin" if "/genshin/" in url else "starrail"
            return json.dumps(payloads[game], ensure_ascii=False).encode("utf-8")

        with patch.object(server, "fetch", side_effect=fake_fetch):
            result = json.loads(server.hoyoverse_codes())

        self.assertEqual({row["game"] for row in result["codes"]}, {"gi", "hsr"})
        self.assertEqual(len(result["codes"]), 2)
        by_game = {row["game"]: row for row in result["codes"]}
        self.assertEqual(by_game["gi"]["redeemUrl"], "https://genshin.hoyoverse.com/en/gift?code=PRIMO2026")
        self.assertEqual(by_game["hsr"]["redeemUrl"], "https://hsr.hoyoverse.com/gift?code=JADE2026")
        self.assertEqual(by_game["gi"]["rewards"], ["Primogem ×60"])
        self.assertEqual(result["errors"], {})

    def test_one_source_can_fail_without_losing_the_other_game(self):
        def fake_fetch(url):
            if "/genshin/" in url:
                raise OSError("temporary source outage")
            return json.dumps({"active": [{"code": "JADE2026", "rewards": []}]}).encode()

        with patch.object(server, "fetch", side_effect=fake_fetch):
            result = json.loads(server.hoyoverse_codes())

        self.assertEqual([row["game"] for row in result["codes"]], ["hsr"])
        self.assertIn("gi", result["errors"])

    def test_fails_if_both_public_sources_are_unavailable(self):
        with patch.object(server, "fetch", side_effect=OSError("offline")):
            with self.assertRaises(OSError):
                server.hoyoverse_codes()


if __name__ == "__main__":
    unittest.main()
