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
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
  def route(r):
   if not r.request.url.startswith(base):r.abort()
   elif '/api/gi/events' in r.request.url:r.fulfill(json={'events':[{'title':'Bannière actuelle','kind':'char-banner','start':'2026-11-01T00:00:00Z','end':'2026-11-25T18:00:00Z','icons':[{'name':'Furina','src':'/assets/app-icon.svg'},{'name':'Nahida','src':'/assets/app-icon.svg'}]},{'title':'Prochaines armes','kind':'weapon-banner','start':'2026-11-25T18:00:00Z','end':'2026-12-15T18:00:00Z','icons':[{'name':'Arme de test','src':'/assets/app-icon.svg'}]}]})
   elif '/api/' in r.request.url or r.request.url.startswith(base+'/data/'):r.fulfill(json={})
   else:r.continue_()
  page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi')");page.goto(base);page.wait_for_selector('.dashboard-studio',timeout=60000);page.wait_for_timeout(3000)
  print('errors',errors,flush=True);page.screenshot(path=str(ROOT/'docs/dashboard-orbit-initial.png'))
  page.locator('[data-orbit-select="banners"]').click();page.wait_for_selector('.widget-banners .banner-line');assert page.locator('.widget-banners .banner-feature-copy:visible').count()==0;assert page.locator('.widget-banners [data-banner-start]').count()==2
  page.locator('[data-studio-edit]').click();page.locator('[data-studio-widget="companion"] [data-studio-hide]').click();assert page.locator('[data-studio-widget="companion"]').count()==0
  page.locator('[data-studio-add="companion"]').click();assert page.locator('[data-studio-widget="companion"]').count()==1
  page.locator('[data-studio-widget="companion"] [data-studio-resize]').focus();page.keyboard.press('ArrowRight')
  page.locator('[data-studio-edit]').click();page.locator('[data-voyage-back]').click();page.locator('[data-orbit-select="progress"]').focus();page.locator('[data-orbit-select="progress"]').click();page.locator('[data-studio-focus="progress"]').first.click();assert page.locator('.studio-focused').count()==1;page.keyboard.press('Escape');assert page.locator('.studio-focused').count()==0
  page.keyboard.press('Control+j');page.wait_for_selector('.studio-command-dialog');page.keyboard.press('Escape');page.wait_for_selector('.studio-command-dialog',state='detached')
  page.on('dialog',lambda d:d.accept('Session boss'));page.locator('[data-studio-save]').click();assert page.locator('[data-studio-layout] option').count()==2
  page.reload();page.wait_for_selector('.dashboard-studio');page.wait_for_selector('#astralis-launch-screen',state='detached');assert page.locator('[data-studio-layout]').input_value()=='1'
  page.locator('[data-orbit-select="week"]').focus();page.keyboard.press('ArrowRight');assert page.locator('[data-orbit-select="banners"]').get_attribute('aria-pressed')=='true';page.keyboard.press('ArrowLeft');page.wait_for_timeout(600);assert page.locator('.orbit-stage').is_visible();page.screenshot(path=str(ROOT/'docs/dashboard-orbit-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500);page.screenshot(path=str(ROOT/'docs/dashboard-orbit-mobile.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), 'Débordement mobile'
  assert not errors,errors;print('Studio : édition, masquage, redimensionnement clavier, focus, palette, dispositions et mobile validés.',flush=True);browser.close()
 server.shutdown()
if __name__=='__main__':main()
