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

    def test_names_match_without_accents_or_punctuation(self):
        self.assertEqual(server._gi_build_token("Épée du faucon"), server._gi_build_token("epee-du-faucon"))
        rows = [{"name": "Jean", "weapons": ["Favonius Sword"], "sets": []}]
        self.assertEqual(len(server.gi_compatible_build_rows(rows, "weapon", {"Épée de Favonius", "Favonius Sword"})), 1)

    def test_genshin_gg_parser_accepts_reordered_attributes(self):
        page = """<section><div data-id="a" class="featured builds-list-item"><div title="unit" class="build-name">Mualani</div><div class="build-role">Main DPS</div><div class="build-weapon-name">Surf's Up</div><div class="build-weapon-name">Obsidian Codex</div><a class="portrait" href="/characters/mualani/"><img alt="" src="/mualani.png"></a></div></section>"""
        rows = server._parse_genshin_gg_build_page(page)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["weapons"], ["Surf's Up"])
        self.assertEqual(rows[0]["sets"], ["Obsidian Codex"])
        self.assertEqual(rows[0]["role"], "Main DPS")

    def test_flex_reads_role_patch_and_reordered_build_id(self):
        page = """<main><section class="guide" data-page="x" id="build"><p>Main DPS</p><span>patch 7.1</span><h3>Weapons</h3><a title="w" href="/en/weapons/surf"><span><b>Surf's Up</b></span></a><h3>Artifacts</h3><b>Obsidian Codex + Golden Troupe</b></section></main>"""
        row = server._parse_genshinflex_build_page(page, "mualani")
        self.assertEqual(row["role"], "Main DPS")
        self.assertEqual(row["patch"], "7.1")
        self.assertEqual(row["sets"], ["Obsidian Codex", "Golden Troupe"])

    def test_flex_page_without_build_data_is_ignored(self):
        self.assertIsNone(server._parse_genshinflex_build_page("<section id='build'><h3>Stats</h3></section>", "unknown"))


if __name__ == "__main__":
    unittest.main()
