"""Functional and visual checks in an isolated browser profile; no user's saves."""
import json,threading
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=128
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
report={'errors':[],'checks':{}}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1536,'height':1050},service_workers='block',reduced_motion='reduce');page=context.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:(report['errors'].append(str(e)),print('PAGEERROR',str(e),flush=True)))
  def route(r):
   url=r.request.url
   if not url.startswith(base):r.abort();return
   if '/api/character-sheets/status' in url:r.fulfill(json={'ok':True,'readOnly':True,'authenticated':False});return
   if '/api/character-sheets/index' in url:r.fulfill(json={'sheets':[]});return
   if '/api/feedback/status' in url:r.fulfill(json={'ok':True,'ownerAvailable':False});return
   if '/api/' in url:r.fulfill(json={});return
   file=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
   if file.is_dir():file=file/'index.html'
   if not file.is_relative_to(ROOT) or not file.is_file():r.fulfill(status=404,body='');return
   r.fulfill(path=str(file))
  page.route('**/*',route)
  page.add_init_script("""if(!sessionStorage.getItem('qa-desk')){sessionStorage.setItem('qa-desk','1');localStorage.setItem('astralis:active-game','hsr');localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');localStorage.setItem('astralis:releases:last-seen','2026-11-26-daily-desk-1');} """)
  print('Daily desk: startup',flush=True);page.goto(base,wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000)
  assert page.locator('.app-frame').get_attribute('data-active-game')=='gi';report['checks']['defaultGenshin']=True
  page.add_style_tag(content='.backup-reminder,#assistant-toast-stack,.release-notes-notice{display:none!important}')
  # Real farm saves exercise the same controls as the production calendar.
  page.evaluate("""async()=>{const {gameDay}=await import('/src/home-command-model.js');const date=gameDay();localStorage.setItem('astralis:gi:farm-calendar',JSON.stringify([{id:'qa-talent',date,title:'Philosophies de l’Admonestation',category:'talent',characterId:'10000073',characterName:'Nahida',resin:40,materialImage:'/assets/genshin/farm-materials/UI_ItemIcon_104306.png'},{id:'qa-mora',date,title:'Mora',category:'mora',resin:20},{id:'qa-later',date:'2099-12-31',title:'Hors de ce jour',resin:180}]));localStorage.setItem('astralis:home-portal:v1',JSON.stringify({person:'10000073',tracked:['10000073','10000042'],height:400}));}""")
  page.reload(wait_until='domcontentloaded');page.wait_for_selector('.hc-farm-row');page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);expect(page.locator('.hc-farm-row')).to_have_count(2)
  expect(page.locator('.hc-farm-summary')).to_contain_text('60');page.locator('[data-home-farm=qa-talent]').click();expect(page.locator('[data-home-farm=qa-talent]')).to_have_attribute('aria-pressed','true');assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).find(r=>r.id==='qa-talent').done");report['checks']['farmCompletion']=True
  expect(page.locator('.dd-endgame-card')).to_have_count(3);expect(page.locator('.dd-endgame-card').last).to_contain_text('Prochain calendrier non publié');report['checks']['endgameDates']=True
  print('Daily desk: settings and persistence',flush=True);page.locator('.hc-page-head [data-au-custom]').click();dialog=page.locator('.hp-settings');expect(dialog).to_be_visible();page.locator('[data-home-pref=scene]').select_option('fontaine');page.locator('[data-home-title=farm]').fill('Mes matériaux du jour');page.locator('[data-home-widget=events]').uncheck();page.locator('[data-home-pref=goal]').fill('Mon prochain projet : Nahida');page.locator('[data-home-track-add]').select_option(label='Bennett');page.wait_for_timeout(250);expect(page.locator('.hp-settings')).to_be_visible();page.locator('.hp-settings footer [data-home-close]').click()
  expect(page.locator('[data-home-card=events]')).to_be_hidden();expect(page.locator('[data-home-widget-title=farm]')).to_have_text('Mes matériaux du jour');expect(page.locator('[data-home-goal]')).to_have_text('Mon prochain projet : Nahida');assert page.locator('.dd-project-card').count()==3;report['checks']['personalization']=True
  page.reload(wait_until='domcontentloaded');page.wait_for_selector('.hc-dashboard');page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);expect(page.locator('[data-home-card=events]')).to_be_hidden();expect(page.locator('[data-home-widget-title=farm]')).to_have_text('Mes matériaux du jour');report['checks']['persistence']=True
  # Restored SVG icons; navigation destinations remain unique.
  navs=page.locator('.side-rail .rail-nav [data-nav]').evaluate_all('es=>es.map(e=>e.dataset.nav)');assert len(navs)==len(set(navs));assert 'feedback' in navs;assert page.locator('.side-rail .rail-nav svg').count()>20;report['checks']['regroupedNavigation']=True
  page.screenshot(path=str(ROOT/'docs/daily-desk-desktop.png'))
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(ROOT/'docs/daily-desk-mobile.png'));page.locator('.hc-page-head [data-au-custom]').click();assert page.locator('.hp-settings').bounding_box()['width']<=390;page.locator('.hp-settings footer [data-home-close]').click();report['checks']['mobile']=True
  page.locator('.side-rail [data-nav=feedback]').evaluate('e=>e.click()');expect(page.locator('.feedback-page')).to_be_visible();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(ROOT/'docs/daily-desk-feedback-mobile.png'));report['checks']['feedbackPage']=True
  assert not report['errors'],report['errors'];print('PASS daily desk: farm, dates, customization, persistence, Genshin default, icons, navigation and mobile',flush=True);browser.close();report['passed']=True
finally:
 (ROOT/'releases').mkdir(exist_ok=True);(ROOT/'releases/daily-desk-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');server.shutdown();server.server_close()
