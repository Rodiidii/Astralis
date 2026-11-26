import gzip,importlib.util,json,re,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('bundle',ROOT/'scripts/build_infinityfree.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class InfinityFreeBundleTests(unittest.TestCase):
 def test_private_data_and_diagnostics_are_excluded(self):
  for name in ['assets/user/profile.json','data/character-sheets.sqlite3','.env','server.py','tests/browser.py','artifacts/test.png','assets/card-art/downloads/a.png']:
   self.assertFalse(module.selected(name),name)
 def test_runtime_configuration_and_images_are_kept(self):
  for name in ['index.html','import-sources.json','manifest.webmanifest','src/app.js','assets/card-art/official/a.webp','docs/sources/lore.json']:
   self.assertTrue(module.selected(name),name)
 def test_every_prepared_file_meets_the_host_limit(self):
  files=[p for p in module.WEB.rglob('*') if p.is_file()];self.assertGreater(len(files),1000)
  for p in files:
   limit=10000 if p.name=='.htaccess' else 1000000 if p.suffix in {'.php','.html','.js','.mjs'} else 10000000
   self.assertLess(p.stat().st_size,limit,str(p.relative_to(module.WEB)))
 def test_large_calculation_engines_are_valid_gzip(self):
  for name in ['lab-complete-engine.js','lab-wr-engine.js']:
   compressed=module.WEB/'public'/f'{name}.gz';data=gzip.decompress(compressed.read_bytes());self.assertGreater(len(data),1000000)
 def test_readonly_gateway_cannot_accept_writes(self):
  source=(module.WEB/'api/router.php').read_text(encoding='utf-8');self.assertIn("['GET','HEAD']",source);self.assertIn('reply(403',source);self.assertIn("'readOnly'=>true",source);self.assertIn('https://raw.githubusercontent.com/Rodiidii/Astralis/main/',source)
 def test_root_assets_and_compact_application_exist(self):
  for name in ['index.html','import-sources.json','.htaccess','src/app.js','styles/experience-portal.css','src/home-portal.js','src/genshin-idle.js']:
   self.assertTrue((module.WEB/name).is_file(),name)
if __name__=='__main__':unittest.main()
