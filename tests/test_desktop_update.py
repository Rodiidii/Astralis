import importlib.util
import json
import os
import struct
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import desktop_integration as desktop
import update_progress
from scripts import apply_update
from scripts import genshin_watcher

class UpdateTransactionTests(unittest.TestCase):
 def fixture(self,folder,delta=False):
  root=folder/'Documents'/'Mon Astralis';root.mkdir(parents=True)
  for name,body in {'server.py':'old','VERSION':'1.0.53','index.html':'old','Installer et lancer Astralis.ps1':'old','Lancer Astralis.bat':'old','obsolete.txt':'old','user-data/notes.json':'personal','assets/user/avatar.txt':'avatar','.git/HEAD':'git','data/lab-user-exports/team.json':'team'}.items():
   file=root/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_text(body)
  archive=folder/'update.zip'
  with zipfile.ZipFile(archive,'w') as z:
   for name in ['server.py','index.html','Installer et lancer Astralis.ps1','Lancer Astralis.bat']:z.writestr(name,'new')
   z.writestr('VERSION','1.0.54');z.writestr('user-data/notes.json','must not overwrite')
   if delta:z.writestr('ASTRALIS-PATCH.json',json.dumps({'kind':'astralis-delta','baseVersion':'1.0.53','deleted':['obsolete.txt']}))
  return root,archive
 def run_update(self,root,archive,healthy=True,replace=None):
  with patch.object(sys,'argv',['apply_update',str(root),str(archive),'123456']),patch.object(apply_update,'close_app_windows') as close,patch.object(apply_update.subprocess,'run'),patch.object(apply_update.os,'kill',side_effect=ProcessLookupError),patch.object(apply_update.time,'sleep'),patch.object(apply_update,'stop_replacement_server'),patch.object(apply_update,'wait_for_new_app',return_value=healthy),patch.object(apply_update,'start_app') as start:
   if replace:
    with patch.object(apply_update,'replace_with_retry',side_effect=replace):code=apply_update.main()
   else:code=apply_update.main()
   return code,start.call_args_list
 def test_full_and_delta_replace_same_folder_preserve_data_and_delete_archive(self):
  for delta in [False,True]:
   with self.subTest(delta=delta),tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
    folder=Path(temp);root,archive=self.fixture(folder,delta);code,calls=self.run_update(root,archive)
    self.assertEqual(code,0);self.assertEqual(root.parent,folder/'Documents');self.assertEqual(root.name,'Mon Astralis')
    self.assertEqual((root/'VERSION').read_text(),'1.0.54');self.assertFalse(archive.exists());self.assertFalse((root/'obsolete.txt').exists())
    for name,body in [('user-data/notes.json','personal'),('assets/user/avatar.txt','avatar'),('.git/HEAD','git'),('data/lab-user-exports/team.json','team')]:self.assertEqual((root/name).read_text(),body)
    self.assertEqual(calls[0].kwargs,{'server_only':True});self.assertEqual(calls[-1].kwargs,{'window_only':True})
    state=update_progress.read_status();self.assertEqual(state['state'],'done');self.assertTrue(all(s['status']=='done' for s in state['steps']));self.assertEqual(state['overallPercent'],100)
 def test_failure_to_start_restores_old_installation_and_personal_data(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   root,archive=self.fixture(Path(temp));code,calls=self.run_update(root,archive,False)
   self.assertEqual(code,4);self.assertEqual((root/'VERSION').read_text(),'1.0.53');self.assertEqual((root/'user-data/notes.json').read_text(),'personal');self.assertTrue(archive.exists());self.assertTrue(calls)
 def test_failed_folder_swap_restores_data_already_moved_to_staging(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   root,archive=self.fixture(Path(temp));original=apply_update.replace_with_retry;raised=False
   def replace(source,target):
    nonlocal raised
    if '.astralis-next-' in source.name and target==root and not raised:raised=True;raise OSError('sharing violation')
    original(source,target)
   code,_=self.run_update(root,archive,replace=replace);self.assertEqual(code,4);self.assertEqual((root/'VERSION').read_text(),'1.0.53');self.assertEqual((root/'assets/user/avatar.txt').read_text(),'avatar')
 def test_path_traversal_and_windows_streams_are_rejected(self):
  for name in ['../outside','C:/outside','a/../../x','a/file:stream','a/trailing.','a/trailing ']:
   with self.subTest(name=name),self.assertRaises(ValueError):apply_update.safe_relative(name)
 def test_malformed_archive_never_stops_the_running_app(self):
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   root,archive=self.fixture(Path(temp));archive.write_bytes(b'not a zip')
   code,_=self.run_update(root,archive);self.assertEqual(code,4);self.assertEqual((root/'VERSION').read_text(),'1.0.53')

class DesktopTests(unittest.TestCase):
 def test_rising_edge_opens_once_until_genshin_is_closed_and_relaunched(self):
  previous=False;opens=0
  for running in [False,True,True,True,False,False,True,True]:
   opens+=genshin_watcher.should_open(previous,running);previous=running
  self.assertEqual(opens,2)
 def test_only_actual_game_process_names_match(self):
  for name,expected in [('GenshinImpact.exe',True),('YuanShen.exe',True),('HoYoPlay.exe',False),('notepad.exe',False)]:
   with patch.object(genshin_watcher,'process_names',return_value=[name]):self.assertEqual(genshin_watcher.game_running(),expected)
 def test_custom_app_icon_is_used_and_reset_restores_default(self):
  import base64
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   png=(ROOT/'assets/pwa/icon-192.png').read_bytes()
   icon=desktop.set_app_icon('data:image/png;base64,'+base64.b64encode(png).decode())
   self.assertEqual(desktop.app_icon(ROOT),icon)
   self.assertEqual(icon.read_bytes()[22:],png)
   self.assertEqual(struct.unpack('<HHH',icon.read_bytes()[:6]),(0,1,1))
   desktop.set_app_icon(None);self.assertEqual(desktop.app_icon(ROOT),ROOT/'assets/pwa/astralis.ico')
   for bad in ['data:image/svg+xml;base64,AAAA','data:image/png;base64,AAAA','data:image/png;base64,%%%']:
    with self.assertRaises(ValueError):desktop.set_app_icon(bad)
 @unittest.skipUnless(os.name=='nt','Windows COM integration')
 def test_real_shortcut_follows_custom_icon_even_with_legacy_icon_choice(self):
  import base64
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}):
   icon=desktop.set_app_icon('data:image/png;base64,'+base64.b64encode((ROOT/'assets/pwa/icon-192.png').read_bytes()).decode())
   link=Path(temp)/'Custom.lnk';desktop.create_shortcut(ROOT,'desktop','genshin',_destination=link)
   result=subprocess.run(['powershell.exe','-NoProfile','-Command',"(New-Object -ComObject WScript.Shell).CreateShortcut($env:TEST_LINK).IconLocation"],env={**os.environ,'TEST_LINK':str(link)},capture_output=True,text=True,check=True,creationflags=subprocess.CREATE_NO_WINDOW)
   self.assertEqual(result.stdout.strip(),str(icon)+',0')
 def test_icons_are_valid_windows_ico_containers(self):
  for name in ['astralis','genshin']:
   raw=(ROOT/'assets/pwa'/f'{name}.ico').read_bytes();self.assertEqual(struct.unpack('<HHH',raw[:6]),(0,1,1));self.assertEqual(raw[22:30],b'\x89PNG\r\n\x1a\n')
 @unittest.skipUnless(os.name=='nt','Windows COM integration')
 def test_real_shortcut_with_icon_and_quoted_installation_path(self):
  with tempfile.TemporaryDirectory(prefix='Astralis shortcut ') as temp:
   destination=Path(temp)/'Test Astralis.lnk';desktop.create_shortcut(ROOT,'desktop','astralis',_destination=destination)
   self.assertTrue(destination.is_file());env={**os.environ,'TEST_LINK':str(destination)}
   result=subprocess.run(['powershell.exe','-NoProfile','-Command',"$l=(New-Object -ComObject WScript.Shell).CreateShortcut($env:TEST_LINK);@{target=$l.TargetPath;arguments=$l.Arguments;icon=$l.IconLocation}|ConvertTo-Json"],env=env,capture_output=True,text=True,check=True)
   data=json.loads(result.stdout);self.assertIn('powershell.exe',data['target'].lower());self.assertIn(str(ROOT),data['arguments']);self.assertIn('-ReuseServer',data['arguments']);self.assertIn('astralis.ico',data['icon'])
 @unittest.skipUnless(os.name=='nt','Windows registry integration')
 def test_enable_and_disable_startup_under_isolated_registry_key(self):
  import winreg,uuid
  key='Software\\AstralisTests\\'+uuid.uuid4().hex
  try:
   with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'LOCALAPPDATA':temp}),patch.object(desktop,'RUN_KEY',key),patch.object(desktop.subprocess,'Popen'):
    desktop.save_settings(ROOT,True)
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER,key) as handle:self.assertIn('genshin_watcher.py',winreg.QueryValueEx(handle,'AstralisGenshin')[0])
    self.assertTrue(desktop.read_settings()['autoOpenGenshin']);desktop.save_settings(ROOT,False)
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER,key) as handle:
     with self.assertRaises(FileNotFoundError):winreg.QueryValueEx(handle,'AstralisGenshin')
  finally:
   try:winreg.DeleteKey(winreg.HKEY_CURRENT_USER,key)
   except FileNotFoundError:pass

if __name__=='__main__':unittest.main()
