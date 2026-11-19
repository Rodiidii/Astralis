"""Windows integration in temporary folders; never updates the real installation."""
import hashlib
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.request
import zipfile
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from scripts import apply_update
import update_progress

def wait_until(check,timeout=25):
 deadline=time.monotonic()+timeout
 while time.monotonic()<deadline:
  try:
   value=check()
   if value:return value
  except (OSError,ValueError):pass
  time.sleep(.2)
 raise AssertionError('Timed out waiting for the isolated Windows integration')

@unittest.skipUnless(os.name=='nt','Windows process integration')
class WindowsLifecycleTests(unittest.TestCase):
 def test_closes_only_the_native_app_window_and_keeps_a_regular_browser(self):
  import uuid
  from desktop_integration import close_app_windows
  candidates=[Path(os.environ.get('ProgramFiles',''))/'Google/Chrome/Application/chrome.exe',Path(os.environ.get('ProgramFiles(x86)',''))/'Microsoft/Edge/Application/msedge.exe']
  chrome=next((p for p in candidates if p.is_file()),None)
  if not chrome:self.skipTest('No installed Chromium browser')
  with tempfile.TemporaryDirectory(prefix='Astralis native window ') as temp:
   folder=Path(temp);uid=uuid.uuid4().hex;app_title='Astralis Native '+uid;browser_title='Astralis Browser '+uid
   for name,title in [('app.html',app_title),('browser.html',browser_title)]:
    (folder/name).write_text('<title>'+title+'</title><p>Isolated Astralis update test</p>')
   args=[str(chrome),'--user-data-dir='+str(folder/'profile'),'--no-first-run','--no-default-browser-check','--disable-background-mode','--disable-background-networking','--window-position=20,20','--window-size=450,350']
   startup=subprocess.STARTUPINFO();startup.dwFlags|=subprocess.STARTF_USESHOWWINDOW;startup.wShowWindow=4
   process=subprocess.Popen(args+['--app='+(folder/'app.html').as_uri()],startupinfo=startup,creationflags=subprocess.CREATE_NO_WINDOW,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
   script="Add-Type -AssemblyName UIAutomationClient;$r=[System.Windows.Automation.AutomationElement]::RootElement;$a=$r.FindAll([System.Windows.Automation.TreeScope]::Children,[System.Windows.Automation.Condition]::TrueCondition);@($a|Where-Object {$_.Current.Name -like ('*'+$env:ASTRALIS_TEST_UID+'*')}|ForEach-Object {$_.Current.Name})|ConvertTo-Json -Compress"
   def titles():
    result=subprocess.run(['powershell.exe','-NoProfile','-Command',script],env={**os.environ,'ASTRALIS_TEST_UID':uid},capture_output=True,text=True,timeout=15,creationflags=subprocess.CREATE_NO_WINDOW)
    return result.stdout.strip()
   try:
    wait_until(lambda:app_title in titles())
    subprocess.run(args+['--new-window',(folder/'browser.html').as_uri()],startupinfo=startup,creationflags=subprocess.CREATE_NO_WINDOW,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=15)
    wait_until(lambda:browser_title in titles())
    before=titles()
    trace=folder/'trace.txt'
    with patch.dict(os.environ,{'ASTRALIS_CLOSE_TRACE':str(trace)}):close_app_windows(ROOT,[app_title,browser_title])
    def closed():
     found=titles();return found if app_title not in found and browser_title in found else False
    try:after=wait_until(closed,timeout=10)
    except AssertionError:self.fail((before,titles(),trace.read_text(errors='replace') if trace.exists() else 'no trace'))
    self.assertIn(browser_title,after);self.assertNotIn(app_title,after)
   finally:
    if process.poll() is None:subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=False)
    process.wait(timeout=15)
    time.sleep(.8)
 def test_game_process_detection_dispatches_launcher_once_per_game_session(self):
  with tempfile.TemporaryDirectory(prefix='Astralis game integration ') as temp:
   folder=Path(temp);app=folder/'Documents'/'Astralis';app.mkdir(parents=True)
   marker=folder/'opened.txt'
   (app/'Installer et lancer Astralis.ps1').write_text("param([switch]$ReuseServer)\nAdd-Content -LiteralPath $env:ASTRALIS_TEST_MARKER -Value 'opened'\n",encoding='utf-8-sig')
   local=folder/'Astralis';local.mkdir();config=local/'desktop-settings.json';config.write_text(json.dumps({'root':str(app),'autoOpenGenshin':True}))
   fake=folder/'GenshinImpact.exe';shutil.copy2(Path(os.environ['SystemRoot'])/'System32/cmd.exe',fake)
   env={**os.environ,'LOCALAPPDATA':temp,'ASTRALIS_TEST_MARKER':str(marker),'ASTRALIS_WATCHER_HEALTH_URL':'http://127.0.0.1:1/health'}
   trace=folder/'detection.txt'
   probe=folder/'probe.py'
   probe.write_text("import runpy,sys\nfrom pathlib import Path\nm=runpy.run_path(sys.argv[1])\ng=m['game_running']\ntrace=Path(sys.argv[2])\ndef probe():\n value=g()\n with trace.open('a') as f:f.write(str(int(value))+'\\n')\n return value\nm['main'].__globals__['game_running']=probe\nm['main']()\n")
   error=(folder/'watcher-error.txt').open('w')
   watcher=subprocess.Popen([sys.executable,str(probe),str(ROOT/'scripts/genshin_watcher.py'),str(trace)],env=env,stdout=error,stderr=error,creationflags=subprocess.CREATE_NO_WINDOW)
   games=[]
   def launch():
    game=subprocess.Popen([str(fake),'/D','/K'],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW);games.append(game);return game
   try:
    launch()
    try:wait_until(lambda:marker.exists() and marker.read_text().count('opened')==1)
    except AssertionError:self.fail({'watcher':watcher.poll(),'game':games[-1].poll(),'trace':trace.read_text() if trace.exists() else '', 'stderr':(folder/'watcher-error.txt').read_text()})
    time.sleep(3.5);self.assertEqual(marker.read_text().count('opened'),1)
    games[0].terminate();games[0].wait(timeout=15)
    try:wait_until(lambda:trace.exists() and trace.read_text().splitlines()[-1]=='0')
    except AssertionError:self.fail({'watcher':watcher.poll(),'game':games[-1].poll(),'trace':trace.read_text() if trace.exists() else '', 'stderr':(folder/'watcher-error.txt').read_text()})
    launch();wait_until(lambda:marker.read_text().count('opened')==2)
    config.write_text(json.dumps({'root':str(app),'autoOpenGenshin':False}));self.assertEqual(watcher.wait(timeout=10),0)
   finally:
    if watcher.poll() is None:watcher.terminate();watcher.wait(timeout=10)
    error.close()
    for game in games:
     if game.poll() is None:game.terminate();game.wait(timeout=10)
     if game.stdin:game.stdin.close()

 def test_real_server_is_replaced_by_new_pid_in_same_folder(self):
  with tempfile.TemporaryDirectory(prefix='Astralis updater integration ') as temp:
   folder=Path(temp);app=folder/'Documents'/'Astralis';app.mkdir(parents=True)
   local=folder/'Astralis';local.mkdir()
   with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
   server_code='''import hashlib,json,os\nfrom pathlib import Path\nfrom http.server import BaseHTTPRequestHandler,HTTPServer\nr=Path(__file__).resolve().parent\nclass H(BaseHTTPRequestHandler):\n def log_message(self,*a):pass\n def do_GET(self):\n  b=json.dumps({'ok':True,'version':(r/'VERSION').read_text().strip(),'instance':hashlib.sha256(str(r).casefold().encode()).hexdigest()[:12],'pid':os.getpid(),'appWindows':int((r/'opened.txt').exists())}).encode();self.send_response(200);self.end_headers();self.wfile.write(b)\nHTTPServer(('127.0.0.1',int(os.environ['ASTRALIS_TEST_PORT'])),H).serve_forever()\n'''
   launcher='''param([switch]$ServerOnly,[switch]$WindowOnly,[switch]$ReuseServer)
$r=Split-Path -Parent $MyInvocation.MyCommand.Path
if($WindowOnly){Set-Content -LiteralPath (Join-Path $r 'opened.txt') -Value 'opened';exit 0}
Start-Process -FilePath $env:ASTRALIS_TEST_PYTHON -ArgumentList @(('"'+(Join-Path $r 'server.py')+'"')) -WorkingDirectory $env:TEMP -WindowStyle Hidden -RedirectStandardError (Join-Path $env:ASTRALIS_TEST_LOGS ((Get-Content (Join-Path $r 'VERSION') -Raw).Trim()+'.err'))
'''
   for name,body in {'server.py':server_code,'Installer et lancer Astralis.ps1':launcher,'Lancer Astralis.bat':'@echo off','index.html':'old','VERSION':'1.0.53','user-data/notes.json':'keep'}.items():
    file=app/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_text(body,encoding='utf-8-sig' if name.endswith('.ps1') else 'utf-8')
   archive=folder/'update.zip'
   with zipfile.ZipFile(archive,'w') as z:
    for name in ['server.py','Installer et lancer Astralis.ps1','Lancer Astralis.bat']:z.write(app/name,name)
    z.writestr('index.html','new');z.writestr('VERSION','1.0.54')
   url=f'http://127.0.0.1:{port}/health'
   env={'LOCALAPPDATA':temp,'ASTRALIS_TEST_LOGS':temp,'ASTRALIS_TEST_PORT':str(port),'ASTRALIS_TEST_PYTHON':sys.executable,'ASTRALIS_UPDATE_HEALTH_URL':url,'ASTRALIS_UPDATE_START_TIMEOUT':'20'}
   def health():
    with urllib.request.urlopen(url,timeout=1) as response:return json.load(response)
   with patch.dict(os.environ,env):
    old=subprocess.Popen([sys.executable,str(app/'server.py')],env=os.environ.copy(),cwd=temp,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW)
    try:
     before=wait_until(health);self.assertEqual(before['pid'],old.pid)
     with patch.object(sys,'argv',['apply_update',str(app),str(archive),str(old.pid)]):code=apply_update.main()
     diagnostics={p.name:p.read_text(errors='replace') for p in folder.glob('*.err')}
     self.assertEqual(code,0,(update_progress.read_status(),diagnostics));after=wait_until(health);self.assertNotEqual(before['pid'],after['pid']);self.assertEqual(after['version'],'1.0.54')
     wait_until(lambda:(app/'opened.txt').exists());self.assertFalse(archive.exists());self.assertEqual((app/'user-data/notes.json').read_text(),'keep');self.assertEqual(app.name,'Astralis');self.assertEqual(app.parent,folder/'Documents')
    finally:
     try:
      pid=health()['pid'];subprocess.run(['taskkill','/PID',str(pid),'/F'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=False)
     except Exception:pass
     if old.poll() is None:old.terminate()
     old.wait(timeout=10)

if __name__=='__main__':unittest.main()
