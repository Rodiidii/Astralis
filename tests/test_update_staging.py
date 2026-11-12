import tempfile
import unittest
from pathlib import Path

from server import _update_archive_paths


class UpdateStagingPathTests(unittest.TestCase):
    def test_update_download_does_not_overwrite_a_previous_update_zip(self):
        with tempfile.TemporaryDirectory() as directory:
            updates = Path(directory)
            existing = updates / "Astralis-Update.zip"
            existing.write_bytes(b"a previous installer may still have this open")

            part, final = _update_archive_paths(updates, "Astralis-Patch-from-1.0.48.zip")

            self.assertNotEqual(part, existing)
            self.assertNotEqual(final, existing)
            self.assertTrue(part.name.startswith("Astralis-Patch-from-1.0.48.zip."))
            self.assertTrue(final.name.startswith("Astralis-Update-"))
            self.assertTrue(final.name.endswith(".zip"))
            self.assertEqual(existing.read_bytes(), b"a previous installer may still have this open")

    def test_each_update_attempt_gets_its_own_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            first = _update_archive_paths(Path(directory), "Astralis-Update.zip")
            second = _update_archive_paths(Path(directory), "Astralis-Update.zip")

            self.assertNotEqual(first[0], second[0])
            self.assertNotEqual(first[1], second[1])


if __name__ == "__main__":
    unittest.main()
