"""Exercise the prepared static tree, including gzip JavaScript over HTTP."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlsplit,unquote
import gzip,json,threading
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];WEB=ROOT/'releases/InfinityFree/htdocs'
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  file=(WEB/unquote(urlsplit(self.path).path).lstrip('/')).resolve()
  if file.is_relative_to(WEB) and not file.exists() and str(file).endswith('.js') and Path(str(file)+'.gz').is_file():
   data=Path(str(file)+'.gz').read_bytes();self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Content-Encoding','gzip');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  super().do_GET()
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=128
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',0),partial(Handler,directory=str(WEB)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',reduced_motion='reduce');page=context.new_page();errors=[];page.on('requestfailed',lambda r:print('REQUESTFAILED',r.url,r.failure,flush=True));page.on('response',lambda r:print('HTTPERROR',r.status,r.url,flush=True) if r.status>=400 and '/api/' not in r.url else None);page.on('console',lambda m:print('CONSOLE',m.text,flush=True) if m.type=='error' else None);page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGEERROR',str(e),flush=True)));page.set_default_timeout(45000)
  def route(r):
   url=r.request.url
   if not url.startswith(base):r.abort();return
   if '/api/character-sheets/status' in url:r.fulfill(json={'ok':True,'readOnly':True,'authenticated':False,'localAdmin':False,'publishReady':False});return
   if '/api/character-sheets/index' in url:r.fulfill(json={'sheets':[]});return
   if '/api/update/' in url:r.fulfill(json={'available':False,'supported':False,'hosted':True,'currentVersion':'1.0.58'});return
   if '/api/desktop/' in url:r.fulfill(json={'ok':True,'supported':False,'hosted':True,'settings':{}});return
   if '/api/' in url:r.fulfill(status=503,json={'error':'Service Python non raccordé dans le test du dossier web.','backendRequired':True});return
   file=(WEB/unquote(urlsplit(url).path).lstrip('/')).resolve()
   if file.is_dir():file=file/'index.html'
   if not file.is_relative_to(WEB):r.fulfill(status=403,body='');return
   if file.is_file():r.fulfill(path=str(file));return
   if file.suffix=='.js' and Path(str(file)+'.gz').is_file():r.fulfill(body=gzip.decompress(Path(str(file)+'.gz').read_bytes()),content_type='application/javascript');return
   r.fulfill(status=404,body='')
  page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:releases:last-seen','2026-11-26-portal-play-1');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}')")
  print('Bundle startup: minified app and unchanged module graph',flush=True);page.goto(base,wait_until='domcontentloaded',timeout=120000);
  try:page.wait_for_selector('.home-portal',timeout=45000)
  except Exception:
   print('STARTUP_BODY',page.locator('body').inner_text()[:5000],flush=True);page.screenshot(path=str(ROOT/'docs/portal-infinityfree-startup.png'));raise
  page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);page.add_style_tag(content='.backup-reminder,.release-notes-notice,#assistant-toast-stack{display:none!important}')
  print('Compressed calculation engines',flush=True)
  for file in ['lab-complete-engine.js','lab-wr-engine.js']:
   response=context.request.get(base+'/public/'+file);assert response.status==200;assert response.headers.get('content-encoding')=='gzip';page.add_script_tag(url=base+'/public/'+file,type='module');print('GZIP_OK',file,flush=True)
  print('Arcade and standalone Idle in the prepared tree',flush=True);page.locator('.side-rail .rail-link[data-nav=arcade]').click();page.wait_for_selector('[data-al-play=idle]');expect(page.locator('.al-game-card')).to_have_count(16);page.locator('[data-al-play=idle]').click();page.wait_for_selector('.genshin-idle');page.locator('[data-idle-collect]').click();page.locator('[data-idle-arcade-back]').click();page.screenshot(path=str(ROOT/'docs/portal-infinityfree.png'))
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert not errors,errors
  report=json.loads((ROOT/'releases/InfinityFree/verification.json').read_text(encoding='utf-8'));report['browserCheck']={'passed':True,'minifiedApplicationStarted':True,'gzipCalculationEnginesLoaded':2,'arcadeCovers':16,'idleCollectionWorked':True,'mobileOverflow':False,'phpApiTestedOnInfinityFree':False};(ROOT/'releases/InfinityFree/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
  print('PASS: prepared bundle startup, compressed engines, Genshin Arcade, Idle collection and mobile',flush=True);browser.close()
finally:server.shutdown();server.server_close()
