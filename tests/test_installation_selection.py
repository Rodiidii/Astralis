import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from scripts import genshin_watcher as watcher

ROOT = Path(__file__).resolve().parents[1]

class InstallationTests(unittest.TestCase):
 def fixture(self, folder, name, version):
  root=folder/name;root.mkdir()
  (root/'VERSION').write_text(version)
  (root/'server.py').write_text('')
  (root/'Installer et lancer Astralis.ps1').write_text("param([switch]$ReuseServer)\nSet-Content -LiteralPath $env:ASTRALIS_SELECTION_MARKER -Value 'new'\n",encoding='utf-8-sig')
  return root
 def test_newer_registered_installation_wins_and_missing_one_is_ignored(self):
  with tempfile.TemporaryDirectory() as tmp,patch.dict(os.environ,{'LOCALAPPDATA':tmp}):
   folder=Path(tmp);old=self.fixture(folder,'old','1.0.9');new=self.fixture(folder,'new','1.0.54')
   local=folder/'Astralis';local.mkdir();record=local/'active-installation.json'
   record.write_text(json.dumps({'root':str(new)}),encoding='utf-8-sig')
   self.assertEqual(watcher.resolve_installation(old),new.resolve())
   self.assertEqual(watcher.resolve_installation(new),new.resolve())
   record.write_text(json.dumps({'root':str(folder/'deleted')}))
   self.assertEqual(watcher.resolve_installation(old),old.resolve())
 def test_open_window_from_other_version_or_folder_does_not_suppress_launch(self):
  with tempfile.TemporaryDirectory() as tmp,patch.dict(os.environ,{'LOCALAPPDATA':tmp}):
   root=self.fixture(Path(tmp),'current','1.0.54')
   class Response:
    def __enter__(self):return self
    def __exit__(self,*args):pass
    def read(self,*args):return json.dumps({'ok':True,'version':'1.0.53','instance':'other','appWindows':1}).encode()
   with patch('urllib.request.urlopen',return_value=Response()),patch.object(watcher.subprocess,'Popen') as launch:
    watcher.open_app(root)
    launch.assert_called_once()
    self.assertIn(str(root/'Installer et lancer Astralis.ps1'),launch.call_args.args[0])
 @unittest.skipUnless(os.name=='nt','Windows launcher')
 def test_successful_launch_retargets_game_watcher_without_changing_enabled_setting(self):
  with tempfile.TemporaryDirectory() as tmp:
   folder=Path(tmp);root=self.fixture(folder,'new copy','1.0.54')
   local=folder/'Astralis';local.mkdir();settings=local/'desktop-settings.json';settings.write_text(json.dumps({'root':'old','autoOpenGenshin':True}))
   source=(ROOT/'Installer et lancer Astralis.ps1').read_text(encoding='utf-8-sig')
   block=source[source.index('function Save-AstralisInstallation'):source.index('# An older shortcut')]
   probe=folder/'save.ps1';probe.write_text("$root=$env:ASTRALIS_SELECTION_ROOT\n$expectedVersion='1.0.54'\n"+block+"\nSave-AstralisInstallation",encoding='utf-8-sig')
   result=subprocess.run(['powershell.exe','-NoProfile','-ExecutionPolicy','Bypass','-File',str(probe)],env={**os.environ,'LOCALAPPDATA':tmp,'ASTRALIS_SELECTION_ROOT':str(root)},capture_output=True,text=True,timeout=20,creationflags=subprocess.CREATE_NO_WINDOW)
   self.assertEqual(result.returncode,0,result.stderr)
   self.assertEqual(json.loads(settings.read_text(encoding='utf-8')),{'root':str(root),'autoOpenGenshin':True})
   self.assertEqual(json.loads((local/'active-installation.json').read_text(encoding='utf-8-sig'))['root'],str(root))
 @unittest.skipUnless(os.name=='nt','Windows launcher')
 def test_old_launcher_redirects_to_registered_newer_version(self):
  with tempfile.TemporaryDirectory() as tmp:
   folder=Path(tmp);old=self.fixture(folder,'old copy','1.0.9');new=self.fixture(folder,'new copy','1.0.54')
   local=folder/'Astralis';local.mkdir();(local/'active-installation.json').write_text(json.dumps({'root':str(new)}),encoding='utf-8-sig')
   source=(ROOT/'Installer et lancer Astralis.ps1').read_text(encoding='utf-8-sig')
   block=source[source.index('function Save-AstralisInstallation'):source.index('$expectedVersion = (Get-Content')]
   probe=folder/'probe.ps1';probe.write_text("$root=$env:ASTRALIS_SELECTION_ROOT\n$ServerOnly=$false;$WindowOnly=$false\n"+block+"\nthrow 'Old installation was selected'",encoding='utf-8-sig')
   marker=folder/'selected.txt'
   result=subprocess.run(['powershell.exe','-NoProfile','-ExecutionPolicy','Bypass','-File',str(probe)],env={**os.environ,'LOCALAPPDATA':tmp,'ASTRALIS_SELECTION_ROOT':str(old),'ASTRALIS_SELECTION_MARKER':str(marker)},capture_output=True,text=True,timeout=20,creationflags=subprocess.CREATE_NO_WINDOW)
   self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(marker.read_text().strip(),'new')

if __name__=='__main__':unittest.main()
