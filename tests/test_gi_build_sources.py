import unittest

import server


class GenshinBuildSourceTests(unittest.TestCase):
    def test_genshinflex_extracts_published_weapons_and_split_sets(self):
        page = '''<section id="build"><h3>Weapons</h3><ol><li><a href="/en/weapons/a"><b>Peak Patrol Song</b></a></li></ol><h3>Artifacts</h3><ol><li><b>Husk of Opulent Dreams + Golden Troupe</b><small>4-piece</small></li></ol></section>'''
        row = server._parse_genshinflex_build_page(page, "albedo")
        self.assertEqual(row["name"], "Albedo")
        self.assertEqual(row["weapons"], ["Peak Patrol Song"])
        self.assertEqual(row["sets"], ["Husk of Opulent Dreams", "Golden Troupe"])

    def test_reverse_compatibility_keeps_every_source_match_and_all_weapons(self):
        rows = [
            {"name": f"Character {n}", "weapons": ["Test Sword"], "sets": [], "sources": ["Genshin.gg"]}
            for n in range(12)
        ]
        matches = server.gi_compatible_build_rows(rows, "weapon", {"Test Sword"})
        self.assertEqual(len(matches), 12)
        self.assertEqual(server.gi_compatible_build_rows(rows, "weapon", {"Missing"}), [])

    def test_reverse_compatibility_includes_each_published_artifact_user(self):
        rows = [
            {"name": f"Character {n}", "weapons": [], "sets": ["Deepwood Memories"]}
            for n in range(16)
        ]
        self.assertEqual(len(server.gi_compatible_build_rows(rows, "artifact", {"Deepwood Memories"})), 16)

    def test_flex_page_without_build_data_is_ignored(self):
        self.assertIsNone(server._parse_genshinflex_build_page("<section id='build'><h3>Stats</h3></section>", "unknown"))


if __name__ == "__main__":
    unittest.main()
