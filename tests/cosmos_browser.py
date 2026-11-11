"""Exercise the actual binder, keyboard consultation, export, and booster UI."""
import base64, json, threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 request_queue_size=128
 def handle_error(self,*args):pass

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':768});errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
  def route(r):
   if not r.request.url.startswith(base):r.abort()
   elif '/api/gi/events' in r.request.url:r.fulfill(json={'events':[{'title':'Bannière actuelle','kind':'char-banner','start':'2026-11-01T00:00:00Z','end':'2026-11-25T18:00:00Z','icons':[{'name':'Furina','src':'/assets/app-icon.svg'},{'name':'Nahida','src':'/assets/app-icon.svg'}]},{'title':'Prochaines armes','kind':'weapon-banner','start':'2026-11-25T18:00:00Z','end':'2026-12-15T18:00:00Z','icons':[{'name':'Arme de test','src':'/assets/app-icon.svg'}]}]})
   elif '/api/' in r.request.url or r.request.url.startswith(base+'/data/'):r.fulfill(json={})
   else:
    from urllib.parse import urlsplit,unquote
    path=(ROOT/unquote(urlsplit(r.request.url).path).lstrip('/')).resolve()
    if path.is_dir():path=path/'index.html'
    if path.is_relative_to(ROOT) and path.is_file():r.fulfill(path=str(path))
    else:r.fulfill(status=404,body='')
  page.route('**/*',route)
  page.add_init_script("""
   localStorage.setItem('astralis:active-game','gi');
   const avatar='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
   localStorage.setItem('astralis:local-profile:v1',JSON.stringify({name:'Voyageur test',avatar}));
   const observer=new MutationObserver(()=>{
    const photo=document.querySelector('[data-launch-avatar] img');
    const name=document.querySelector('[data-launch-player]')?.textContent;
    if(photo?.getAttribute('src')===avatar&&name==='Voyageur test'){
     window.launchProfileVerified=true;
     observer.disconnect();
    }
   });
   observer.observe(document,{subtree:true,childList:true});
  """)
  page.goto(base,wait_until='domcontentloaded')
  page.wait_for_function('window.launchProfileVerified === true')
  page.wait_for_selector('.dashboard-studio',timeout=60000)
  page.wait_for_timeout(3000)
  page.wait_for_selector('astralis-planet[data-texture="teyvat-map-v2"]',timeout=20000)
  assert page.locator('.lunar-orbit').count()==3
  globe=page.locator('astralis-planet');before=globe.get_attribute('data-rotation');world=page.locator('.orbit-node astralis-world').first;world_before=world.get_attribute('data-rotation');page.wait_for_timeout(500);assert globe.get_attribute('data-rotation')!=before;assert world.get_attribute('data-rotation')!=world_before;assert page.locator('.orbit-node .celestial-function svg').count()>=10
  page.locator('[data-cosmos-open]').click();page.wait_for_selector('.cosmos-settings')
  page.locator('[data-cosmos="color"]').fill('#050508');page.locator('[data-cosmos="accent"]').fill('#88e3d5')
  for kind in ['mars','neptune','ice','venus','mercury','gas']:
   page.locator('[data-celestial-kind="week"]').select_option(kind)
   page.wait_for_selector(f'[data-orbit-select="week"] astralis-world[kind="{kind}"][data-ready="true"]:not([data-texture])',state='attached')
  page.locator('[data-celestial-kind="week"]').select_option('lava');assert page.locator('[data-orbit-select="week"] astralis-world[kind="lava"]').count()==1
  page.locator('[data-celestial-kind="week"]').select_option('blackhole')
  assert page.locator('[data-orbit-select="week"] .celestial-blackhole').count()==1
  page.locator('[data-celestial-kind="team"]').select_option('character')
  page.locator('[data-cosmos="background"]').select_option('aurora');assert page.locator('.dashboard-studio').get_attribute('data-cosmos-background')=='aurora'
  page.locator('[data-cosmos="background"]').select_option('galaxy')
  page.keyboard.press('Escape');page.wait_for_selector('.cosmos-settings',state='detached')
  page.locator('[data-cosmos-view]').select_option('blocks');assert page.locator('[data-studio-widget]:visible').count()>8
  assert page.locator('.orbit-stage').count()==0
  page.screenshot(path=str(ROOT/'docs/cosmos-blocks.png'),full_page=True)
  page.reload();page.wait_for_selector('[data-cosmos-view]');page.wait_for_selector('#astralis-launch-screen',state='detached');assert page.locator('[data-cosmos-view]').input_value()=='blocks'
  page.locator('[data-cosmos-view]').select_option('orbit');page.wait_for_selector('astralis-planet[data-ready="true"]');assert page.locator('[data-orbit-select="week"] .celestial-blackhole').count()==1
  page.keyboard.press('Control+j');page.wait_for_selector('.studio-command-dialog');page.locator('.studio-command-dialog input').fill('Mes builds');page.locator('.studio-command-results button').click();page.wait_for_selector('[data-nav="builds"].active');assert page.locator('.dashboard-studio').count()==0
  page.locator('[data-nav="dashboard"]').click();page.wait_for_selector('astralis-planet[data-ready="true"]')
  page.locator('[data-cosmos-open]').click();page.locator('[data-cosmos="motion"]').uncheck();page.keyboard.press('Escape')
  assert page.locator('.dashboard-studio').get_attribute('data-cosmos-motion')=='off'
  page.wait_for_timeout(550);frozen=page.locator('astralis-planet canvas').evaluate('(canvas)=>canvas.toDataURL()');page.wait_for_timeout(650);assert page.locator('astralis-planet canvas').evaluate('(canvas)=>canvas.toDataURL()')==frozen,'La planète doit rester immobile'
  page.emulate_media(reduced_motion='reduce');assert page.locator('.lunar-orbit').first.evaluate('(node)=>getComputedStyle(node).animationName')=='none';page.emulate_media(reduced_motion='no-preference')
  page.wait_for_timeout(500);page.screenshot(path=str(ROOT/'docs/cosmos-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500);page.screenshot(path=str(ROOT/'docs/cosmos-mobile.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Débordement mobile'
  assert not errors,errors;print('Cosmos : rotation des sphères, pictogrammes, panneaux sans défilement interne, trois lunes, apparences, couleurs, persistance, blocs, commandes, mouvement et mobile validés.',flush=True);browser.close()
 server.shutdown()
if __name__=='__main__':main()
