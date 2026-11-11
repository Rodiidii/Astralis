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
 def handle_error(self,*args):pass
def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 errors=[]
 with sync_playwright() as p:
  browser=p.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block')
  def route(r):
   if not r.request.url.startswith(base):r.abort()
   elif '/api/' in r.request.url or r.request.url.startswith(base+'/data/'):r.fulfill(json={})
   else:r.continue_()
  context.route('**/*',route);page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
  page.add_init_script("localStorage.setItem('astralis:binder-preview-all','true');localStorage.setItem('astralis:preferences',JSON.stringify({assistantEnabled:false}))")
  page.goto(base+'/?debug=cards');page.wait_for_function("document.documentElement.dataset.appReady==='true'")
  page.locator('[data-nav="collection"]').click();page.wait_for_selector('astralis-card .tcg-card')
  page.locator('[data-binder-rarity]').select_option('gold');page.wait_for_selector('astralis-card[data-rarity="gold"] .tcg-card');page.wait_for_timeout(600)
  card=page.locator('.binder-card[data-binder-view]').first;card.focus();page.keyboard.press('Enter');page.wait_for_selector('.binder-view-overlay astralis-card .tcg-card')
  assert page.locator('.binder-view-overlay astralis-card').get_attribute('mode')=='detail'
  page.wait_for_timeout(400)
  with page.expect_download() as download:page.locator('[data-card-export]').click()
  output=ROOT/'docs/card-visual-tests/export-card.png';download.value.save_as(str(output));assert output.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
  page.keyboard.press('Escape');assert page.locator('.binder-view-overlay').count()==0
  page.locator('[data-cards-page-view]').click();page.wait_for_selector('.cards-page-overlay astralis-card .tcg-card')
  assert page.locator('.cards-page-overlay astralis-card[mode="detail"]').count()>0
  page.keyboard.press('Escape');assert page.locator('.cards-page-overlay').count()==0
  page.locator('[data-nav="boosters"]').click();page.locator('[data-booster-game="gi"]').click()
  cover=page.locator('.tcg-booster').get_attribute('style');assert 'genshin.png' in cover
  page.locator('[data-booster-action="open"][data-booster-count="1"]').first.click()
  page.wait_for_selector('.booster-opening-overlay astralis-card .tcg-card',timeout=15000)
  assert page.locator('.booster-opening-overlay astralis-card').get_attribute('mode')=='booster'
  page.screenshot(path=str(ROOT/'docs/card-visual-tests/booster-integration.png'))
  page.locator('[data-booster-action="close"]').click();assert not errors,errors
  page.set_viewport_size({'width':390,'height':844});page.locator('[data-nav="collection"]').click();page.wait_for_selector('astralis-card .tcg-card');page.wait_for_timeout(300)
  diagnostics=page.evaluate('astralisCards.diagnose()');assert not diagnostics['broken'];assert not diagnostics['overflow'],diagnostics['overflow']
  page.screenshot(path=str(ROOT/'docs/card-visual-tests/binder-mobile.png'))
  browser.close()
 server.shutdown();print('Application : classeur, clavier, consultation, export PNG, booster et mobile validés.')
if __name__=='__main__':main()
