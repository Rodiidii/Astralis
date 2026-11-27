"""The public archive contains the committed tree, without a duplicate source archive."""
import importlib.util,subprocess,tempfile,unittest,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('release_builder',ROOT/'scripts/build_release.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
class ReleaseStreamTest(unittest.TestCase):
 def test_committed_files_only_and_public_exclusions(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);subprocess.run(['git','init','-q'],cwd=root,check=True)
   files={'VERSION':'1.0.62\n','src/app.js':'const committed=true;','assets/photo.png':'binary fixture','assets/user/profile.json':'private','docs/report.md':'diagnostic','tests/test.js':'test','unrelated.log':'log'}
   for name,value in files.items():
    p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(value,encoding='utf-8')
   subprocess.run(['git','add','.'],cwd=root,check=True);subprocess.run(['git','-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','fixture'],cwd=root,check=True)
   (root/'src/app.js').write_text('uncommitted',encoding='utf-8');(root/'untracked.txt').write_text('local',encoding='utf-8')
   output=root/'public.zip';builder.write_committed_archive(root,output)
   with zipfile.ZipFile(output) as z:
    self.assertIsNone(z.testzip());self.assertEqual(set(z.namelist()),{'VERSION','src/app.js','assets/photo.png'});self.assertEqual(z.read('src/app.js'),b'const committed=true;')
   self.assertFalse((root/'.astralis-release-source.zip').exists())
if __name__=='__main__':unittest.main()
