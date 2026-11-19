import json
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch
import server

class DesktopApiTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.http=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler);cls.port=cls.http.server_port
  cls.base=f'http://127.0.0.1:{cls.port}';cls.thread=threading.Thread(target=cls.http.serve_forever,daemon=True);cls.thread.start()
 @classmethod
 def tearDownClass(cls):cls.http.shutdown();cls.http.server_close()
 def request(self,path,body=None,origin=None):
  request=urllib.request.Request(self.base+path,data=json.dumps(body).encode() if body is not None else None,headers={'Origin':origin or self.base,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(request) as response:return response.status,json.load(response)
  except urllib.error.HTTPError as exc:
   with exc:return exc.code,json.load(exc)
 def test_health_reports_loaded_version_even_if_files_were_replaced(self):
  loaded=server._SERVER_VERSION
  with patch.object(server,'PORT',self.port),patch.object(server,'HOSTED',False),patch.object(Path,'read_text',return_value='99.0.0'):
   status,data=self.request('/health')
   self.assertEqual(status,200);self.assertEqual(data['version'],loaded);self.assertEqual(data['instance'],server._SERVER_INSTANCE)
 def test_large_custom_icon_request_is_accepted_and_icon_paths_cannot_be_injected(self):
  data='data:image/png;base64,'+'A'*12000
  with patch.object(server,'PORT',self.port),patch.object(server,'HOSTED',False),patch.object(server.desktop_integration,'set_app_icon') as save,patch.object(server.desktop_integration,'refresh_shortcut_icons') as refresh:
   status,_=self.request('/api/desktop/icon',{'iconData':data,'root':'C:/other'})
   self.assertEqual(status,200);save.assert_called_once_with(data);refresh.assert_called_once_with(Path(server.__file__).resolve().parent)
 def test_settings_and_shortcuts_use_only_the_running_installation(self):
  with patch.object(server,'PORT',self.port),patch.object(server,'HOSTED',False),patch.object(server.desktop_integration,'save_settings',return_value={'autoOpenGenshin':True,'supported':True}) as save,patch.object(server.desktop_integration,'create_shortcut',return_value='Astralis.lnk') as shortcut:
   status,data=self.request('/api/desktop/settings',{'autoOpenGenshin':True,'root':'C:/not-the-installation'});self.assertEqual(status,200);self.assertTrue(data['autoOpenGenshin']);self.assertEqual(save.call_args.args,(Path(server.__file__).resolve().parent,True))
   status,data=self.request('/api/desktop/shortcut',{'location':'startmenu','icon':'genshin'});self.assertEqual(status,200);self.assertEqual(shortcut.call_args.args,(Path(server.__file__).resolve().parent,'startmenu','app'))
 def test_remote_origin_cannot_enable_a_startup_watcher(self):
  with patch.object(server,'PORT',self.port),patch.object(server.desktop_integration,'save_settings') as save:
   status,_=self.request('/api/desktop/settings',{'autoOpenGenshin':True},'https://unrelated.example');self.assertEqual(status,403);save.assert_not_called()
 def test_hosted_version_cannot_change_windows_settings(self):
  with patch.object(server,'PORT',self.port),patch.object(server,'HOSTED',True),patch.object(server.Handler,'_require_access',return_value=True),patch.object(server.desktop_integration,'save_settings') as save:
   status,_=self.request('/api/desktop/settings',{'autoOpenGenshin':True});self.assertEqual(status,410);save.assert_not_called()
 def test_bad_setting_types_are_rejected(self):
  with patch.object(server,'PORT',self.port),patch.object(server,'HOSTED',False),patch.object(server.desktop_integration,'save_settings') as save:
   status,_=self.request('/api/desktop/settings',{'autoOpenGenshin':'yes'});self.assertEqual(status,400);save.assert_not_called()

if __name__=='__main__':unittest.main()
