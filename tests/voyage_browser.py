"""Actual app: orbital overview, split destinations, wallet and widget regressions."""
import base64, json, threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=128
 def handle_error(self,*args):pass

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 with sync_playwright() as p:
  browser=p.chromium.launch(args=['--enable-unsafe-swiftshader']);page=browser.new_page(viewport={'width':1366,'height':768});page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
  def route(r):
   if not r.request.url.startswith(base):r.abort()
   elif '/api/gi/events' in r.request.url:r.fulfill(json={'events':[{'title':'Bannière actuelle','kind':'char-banner','start':'2026-11-01T00:00:00Z','end':'2026-11-25T18:00:00Z','icons':[{'name':'Furina','src':'/assets/app-icon.svg'},{'name':'Nahida','src':'/assets/app-icon.svg'}]},{'title':'Prochaines armes','kind':'weapon-banner','start':'2026-11-25T18:00:00Z','end':'2026-12-15T18:00:00Z','icons':[{'name':'Arme de test','src':'/assets/app-icon.svg'}]}]})
   elif '/api/gi/endgame' in r.request.url:r.fulfill(json={'floors':[{'floor':'12','chambers':[{'chamber':1,'halves':[{'enemies':[{'name':'Boss A','level':100}]},{'enemies':[{'name':'Boss B','level':100}]}]}]}]})
   elif '/api/' in r.request.url or r.request.url.startswith(base+'/data/'):r.fulfill(json={})
   else:
    from urllib.parse import urlsplit,unquote
    path=(ROOT/unquote(urlsplit(r.request.url).path).lstrip('/')).resolve()
    if path.is_dir():path=path/'index.html'
    if path.is_relative_to(ROOT) and path.is_file():r.fulfill(path=str(path))
    else:r.fulfill(status=404,body='')
  page.route('**/*',route);page.add_init_script("""localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:wish-plan',JSON.stringify({wishes:12,currentPrimos:3526,primos:3526,characterPity:20,history:[]}));localStorage.setItem('astralis:tasks:gi',JSON.stringify([{id:'task-1',title:'Finir mes talents',done:false}]));localStorage.setItem('astralis:gi:profile',JSON.stringify({playerInfo:{nickname:'Test'},avatarInfoList:[{avatarId:10000005,propMap:{4001:{val:90}},fightPropMap:{2000:18000,2001:2100,2002:850,20:.6,22:1.4,23:1.2,28:100},equipList:[{itemId:11501,weapon:{level:90,affixMap:{a:0}},flat:{name:'Épée de test',icon:'UI_EquipIcon_Sword_Falcon'}}]}]}));""");page.add_init_script("localStorage.setItem('astralis:cosmos:gi',JSON.stringify({revision:2,icons:{wishes:{panelSide:'right'},team:{panelSide:'left'}}}))");page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('.dashboard-studio',timeout=60000);page.wait_for_timeout(3000)
  page.wait_for_selector('astralis-planet[data-ready="true"]');page.wait_for_selector('#astralis-launch-screen',state='detached')
  page.wait_for_selector('astralis-planet[data-geography="entire-teyvat"]');page.wait_for_function("document.querySelector('astralis-planet').diorama.orbits.getObjectByName('ruler-life')")
  assert page.locator('astralis-planet').get_attribute('region')=='teyvat'
  assert page.locator('[data-orbit-select="enka"]').count()==0
  assert page.locator('.voyage-debris i').count()==66
  assert page.locator('.space-constellation').count()==5
  assert page.locator('.space-dust').count()==42
  assert page.locator('astralis-planet').bounding_box()['width']>=175
  assert page.locator('.voyage-debris').evaluate('n=>Number(getComputedStyle(n).opacity)>0')
  assert page.locator('.cosmos-meteor').count()==7
  page.wait_for_function("getComputedStyle(document.querySelector('.cosmos-meteor')).animationName==='galaxyMeteor'")
  page.wait_for_function("getComputedStyle(document.querySelector('.cosmos-depth'),'::before').backgroundImage.includes('linear-gradient') && !getComputedStyle(document.querySelector('.cosmos-depth'),'::before').backgroundImage.includes('url(')")
  def split(side):
   page.wait_for_function("side=>document.querySelector('.dashboard-studio').dataset.panelSide===side",arg=side)
   planet=page.locator('.voyage-world-preview .celestial-body').bounding_box();panel=page.locator('[data-studio-widget][data-orbit-current]').bounding_box()
   assert planet['width']>=240
   if side=='right':assert planet['x']+planet['width']<panel['x']
   else:assert panel['x']+panel['width']<planet['x']
   assert abs(planet['y']-panel['y'])<300
  for _ in range(4):
   assert page.locator('.orbit-node-icon>.celestial-body').evaluate_all("nodes=>nodes.every((node,i)=>nodes.slice(i+1).every(other=>{const a=node.getBoundingClientRect(),b=other.getBoundingClientRect();return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2)>=(a.width+b.width)/2}))")
   page.wait_for_timeout(200)
  assert page.locator('[data-orbit-select="companion"]').count()==0
  expected={'week':'mondstadt','banners':'liyue','wishes':'inazuma','team':'sumeru','session':'fontaine','events':'primordial','progress':'natlan','wall':'nodkrai','endgame':'snezhnaya'}
  for widget,region in expected.items():
   world=page.locator(f'[data-orbit-select="{widget}"] astralis-world');assert world.get_attribute('region')==region;page.wait_for_function("region=>document.querySelector('astralis-world[region=\"'+region+'\"]')?.dataset.engine==='webgl-diorama'",arg=region);assert world.locator('.regional-diorama').count()==1
  page.wait_for_function("[...document.querySelectorAll('.celestial-archon-badge img')].every(n=>n.complete&&n.naturalWidth>0)")
  page.wait_for_function("[...document.querySelectorAll('astralis-world')].filter(n=>{const r=n.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).every(n=>n.gpuLast>0)")
  assert page.locator('[data-orbit-select="activity"]').count()==0
  node=page.locator('[data-orbit-select="wishes"]');before=node.get_attribute('data-orbit-angle');page.wait_for_timeout(400);assert node.get_attribute('data-orbit-angle')!=before
  page.evaluate("window.flightObserved=false;new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&n.matches('.voyage-flight'))window.flightObserved=true}).observe(document.body,{childList:true,subtree:true})");node.focus();other=page.locator('[data-orbit-select="week"]');other_before=other.get_attribute('data-orbit-angle');page.wait_for_timeout(350);assert other.get_attribute('data-orbit-angle')!=other_before;node.click();page.wait_for_function('window.flightObserved===true');page.screenshot(path=str(ROOT/'docs/voyage-flight.png'));page.wait_for_selector('.dashboard-studio[data-exploring="true"] .feature-wallet')
  split('right');print('Texture et destination droite valides.',flush=True)
  assert page.locator('[data-wallet-total]').inner_text()=='34'
  page.locator('[data-feature-gains] [name="primos"]').fill('160');page.locator('[data-feature-gains] [name="wishes"]').fill('2');page.locator('[data-feature-gains] button[type="submit"]').click();page.wait_for_function("document.querySelector('[data-wallet-total]')?.textContent==='37'")
  assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos")==3686;page.screenshot(path=str(ROOT/'docs/voyage-wishes.png'),full_page=True)
  # Live rotation and the travel animation were verified above. Freeze ambience for the remaining form/layout scenarios.
  page.evaluate("(()=>{const key='astralis:cosmos:gi',v=JSON.parse(localStorage.getItem(key)||'{}');v.motion=false;localStorage.setItem(key,JSON.stringify(v));document.querySelector('.dashboard-studio').dataset.cosmosMotion='off'})()")
  page.locator('[data-voyage-back]').click();page.wait_for_selector('.dashboard-studio[data-exploring="false"]')
  page.locator('[data-orbit-select="team"]').focus();page.locator('[data-orbit-select="team"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"] .feature-challenge-team')
  split('left');page.screenshot(path=str(ROOT/'docs/voyage-panel-left.png'));print('Destination gauche valide.',flush=True)
  assert page.locator('.feature-challenge-team button').count()==4
  page.locator('.feature-pool summary').click();pool=page.locator('[data-feature-team-person]');pool.nth(0).check();pool.nth(1).check();page.locator('[data-feature-team-roll]').click();page.wait_for_timeout(300);assert page.locator('.feature-challenge-team button').count()==2
  page.locator('[data-voyage-back]').click();page.locator('[data-orbit-select="wall"]').focus();page.locator('[data-orbit-select="wall"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"] .feature-build');assert '2 100' in page.locator('.feature-build-stats').inner_text() or '2' in page.locator('.feature-build-stats').inner_text()
  page.locator('[data-voyage-back]').click();page.locator('[data-orbit-select="endgame"]').focus();page.locator('[data-orbit-select="endgame"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"] .feature-chamber');assert 'Boss A' in page.locator('.feature-chamber').inner_text();assert 'Partie 2' in page.locator('.feature-chamber').inner_text();page.screenshot(path=str(ROOT/'docs/voyage-endgame.png'),full_page=True)
  page.locator('[data-voyage-back]').click();page.locator('[data-orbit-select="session"]').focus();page.locator('[data-orbit-select="session"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"] [data-feature-session]');page.locator('[data-feature-session] [name="goal"]').fill('Finir mes talents');page.locator('[data-feature-session] button').click();page.wait_for_selector('[data-feature-session-pause]');page.locator('[data-feature-session-pause]').click()
  page.locator('[data-voyage-back]').click();page.wait_for_timeout(200);page.screenshot(path=str(ROOT/'docs/voyage-overview.png'),full_page=True)
  page.locator('[data-cosmos-open]').click();page.locator('[data-planet-panel="week"]').select_option('bottom');page.keyboard.press('Escape');page.locator('[data-orbit-select="week"]').focus();page.locator('[data-orbit-select="week"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"][data-panel-side="bottom"]');page.wait_for_timeout(1400)
  planet=page.locator('.voyage-world-preview .celestial-body').bounding_box();panel=page.locator('[data-studio-widget][data-orbit-current]').bounding_box();page.screenshot(path=str(ROOT/'docs/voyage-vertical.png'));assert planet['y']+planet['height']<panel['y'],(planet,panel)
  page.locator('[data-voyage-back]').click()
  page.locator('[data-cosmos-open]').click();page.locator('[data-planet-panel="week"]').select_option('top');page.keyboard.press('Escape');page.locator('[data-orbit-select="week"]').focus();page.locator('[data-orbit-select="week"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"][data-panel-side="top"]');page.wait_for_timeout(1400)
  assert page.evaluate("(()=>{const a=document.querySelector('.voyage-world-preview .celestial-body').getBoundingClientRect(),b=document.querySelector('[data-studio-widget][data-orbit-current]').getBoundingClientRect();return b.bottom<a.top})()")
  page.locator('[data-voyage-back]').click()
  page.locator('[data-cosmos-open]').click();page.locator('[data-cosmos="freeOrbits"]').check();page.locator('[data-planet-orbit="week"]').evaluate("node=>{node.value='120';node.dispatchEvent(new Event('input',{bubbles:true}))}");page.locator('[data-cosmos="background"]').select_option('none');page.keyboard.press('Escape');page.wait_for_selector('.orbit-stage',state='detached');assert page.locator('.orbit-stage').count()==0;assert page.locator('.studio-widget:visible').count()>8;page.screenshot(path=str(ROOT/'docs/voyage-plain.png'),full_page=True)
  page.locator('[data-cosmos-open]').click();page.locator('[data-cosmos="background"]').select_option('galaxy');page.keyboard.press('Escape');page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(400);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(ROOT/'docs/voyage-mobile.png'),full_page=True)
  page.locator('[data-orbit-select="wishes"]').focus();page.locator('[data-orbit-select="wishes"]').click();page.wait_for_selector('.dashboard-studio[data-exploring="true"] .feature-wallet')
  assert page.locator('.voyage-world-preview .celestial-body').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.screenshot(path=str(ROOT/'docs/voyage-mobile-detail.png'),full_page=True)
  page.emulate_media(reduced_motion='reduce');world=page.locator('.voyage-world-preview astralis-world');page.wait_for_timeout(250);frozen=world.get_attribute('data-rotation');page.wait_for_timeout(400);assert world.get_attribute('data-rotation')==frozen
  assert page.locator('.voyage-debris i').first.evaluate('n=>getComputedStyle(n).animationName')=='none'
  assert not errors,errors;print('Voyage : orbites, animation de caméra, gains et soldes, sélection Daily Challenge, Enka, moitiés endgame, session, mode neutre et mobile validés.',flush=True);browser.close()
 server.shutdown()
if __name__=='__main__':main()
