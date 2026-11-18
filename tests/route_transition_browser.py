import json,threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1920,'height':1080},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   def route(request):
    path=urlsplit(request.request.url).path
    if path.startswith('/api/'):request.fulfill(json={})
    elif request.request.url.startswith(base):request.continue_()
    elif '/assets/skills/' in request.request.url or '/UI/' in request.request.url:request.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:request.abort()
   page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile',JSON.stringify({enabled:false,proactive:false}))")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
   page.locator('.side-rail [data-nav=journey]').click();expect(page.locator('[data-journey-log]')).to_be_visible();expect(page.locator('#page-content')).to_have_class('route-page-enter');assert page.locator('#page-content').evaluate("el=>getComputedStyle(el).animationName==='astralis-route-arrive'"),'La classe de transition ne lance pas son animation';page.wait_for_function("!document.querySelector('#page-content').classList.contains('route-page-enter')")
   page.evaluate("document.body.style.minHeight='1800px';window.scrollTo(0,420)");journey_scroll=page.evaluate('scrollY');assert journey_scroll==420,'Impossible de préparer la position de lecture à mémoriser'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'L’écran large a un débordement horizontal'
   page.emulate_media(reduced_motion='reduce');page.locator('.side-rail [data-nav=tasks]').click();expect(page.locator('.task-controls')).to_be_visible();assert not page.locator('#page-content').evaluate("el=>el.classList.contains('route-page-enter')"),'La transition ignore prefers-reduced-motion'
   page.evaluate('window.scrollTo(0,0)')
   page.locator('.side-rail [data-nav=journey]').click();expect(page.locator('[data-journey-log]')).to_be_visible();assert page.evaluate('scrollY')==journey_scroll,'Le retour au carnet ne restaure pas sa position de lecture'
   page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'La transition ou la page déborde sur téléphone';assert not errors,errors;browser.close()
  print('OK: transition, position de lecture mémorisée, réduction des animations et vues 1920×1080 / 390 px.')
 finally:server.shutdown()
if __name__=='__main__':main()
