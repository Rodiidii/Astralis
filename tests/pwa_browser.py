"""Offline shell regression and WebKit mobile smoke test; no claim of physical install."""
import json,threading
from functools import partial
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
 for size in [180,192,512]:
  with Image.open(ROOT/f'assets/pwa/icon-{size}.png') as im:assert im.size==(size,size)
 assert manifest['display']=='standalone' and manifest['start_url']=='./index.html'
 assert len([i for i in manifest['icons'] if i['type']=='image/png'])==3
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 out=ROOT/'docs/captures/pwa';out.mkdir(parents=True,exist_ok=True)
 try:
  with sync_playwright() as p:
   for engine in ['chromium','webkit']:
    browser=getattr(p,engine).launch()
    context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    page=context.new_page();page.set_default_timeout(90000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def route(r):
     url=r.request.url
     if url.startswith(base+'/api/'):r.fulfill(json={})
     elif url.startswith(base):r.continue_()
     else:r.abort()
    page.route('**/*',route)
    page.add_init_script('''if(!localStorage.getItem('pwa-test-seeded')){localStorage.setItem('pwa-test-seeded','1');localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');localStorage.setItem('astralis:studio:gi','{"view":"blocks","layouts":[{"name":"PWA","widgets":[]}]}');}''')
    page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
    expect(page.locator('[data-nav=teams]').first).to_be_attached()
    page.locator('[data-nav=teams]').first.evaluate('(el)=>el.click()');assert page.locator('#page-content').inner_text().strip()
    assert page.locator('meta[name=viewport]').get_attribute('content').endswith('viewport-fit=cover')
    assert page.locator('link[rel=apple-touch-icon]').get_attribute('href').endswith('icon-180.png')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.screenshot(path=str(out/(engine+'-mobile.png')),full_page=True)
    if engine=='chromium':
     # Verify that the installed shell contains the entry point and essential assets.
     page.evaluate('''async()=>{await navigator.serviceWorker.ready;}''')
     page.wait_for_function("async()=>{const cache=await caches.open('astralis-shell-v93');return !!(await cache.match('/index.html'))&&!!(await cache.match('/src/app.js'))&&!!(await cache.match('/assets/pwa/icon-192.png'));}",timeout=180000)
     local=page.evaluate('''async()=>{const c=await caches.open('astralis-shell-v93');return (await c.keys()).length;}''')
     assert local>30,local
     # Wait for the load event to finish registration before testing navigation offline.
     page.reload(wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
     page.wait_for_function('navigator.serviceWorker.controller!==null')
     context.set_offline(True);page.reload(wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
     expect(page.locator('[data-nav=teams]').first).to_be_attached()
     assert page.locator('body').inner_text().find('Uncaught SyntaxError')<0
     page.screenshot(path=str(out/'chromium-offline.png'),full_page=True)
    assert not errors,errors
    context.close();browser.close()
   print('PNG iOS, manifeste, WebKit mobile et navigation hors ligne Chromium vérifiés.',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
