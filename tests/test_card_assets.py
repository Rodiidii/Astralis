"""Verify the fingerprints of the files actually shipped, not merely the manifest."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
class CardAssets(unittest.TestCase):
 def test_canonical_artworks_are_present_and_unchanged(self):
  manifest=json.loads((ROOT/'public/card-artworks.json').read_text(encoding='utf-8'))
  pixels=set()
  for key in manifest['assignments'].values():
   artwork=manifest['artworks'][key];path=(ROOT/key).resolve()
   self.assertTrue(path.is_relative_to((ROOT/'assets/card-art').resolve()))
   self.assertTrue(path.is_file(),key)
   self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),artwork['sha256'],key)
   fingerprint=artwork.get('sourcePixelSha256')or artwork['pixelSha256']
   self.assertNotIn(fingerprint,pixels,key);pixels.add(fingerprint)
if __name__=='__main__':unittest.main()
