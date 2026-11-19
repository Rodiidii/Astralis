import base64
import json
import os
import tempfile
import threading
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT,Quiet,Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
requests=[];available=True
try:
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1100},service_workers='block');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   url=r.request.url
   if '/api/update/check' in url:r.fulfill(json={'ok':True,'available':available,'release':{'tag':'v9.0.0','name':'Nouvelle version'},'installable':True})
   elif '/api/desktop/' in url:
    if r.request.method=='POST':requests.append((url,r.request.post_data_json))
    r.fulfill(json={'ok':True,'supported':True,'autoOpenGenshin':False,'installationPath':'C:\\Documents\\Astralis','path':'Astralis.lnk'})
   elif '/api/update/status' in url:r.fulfill(json={'state':'idle'})
   elif not url.startswith(base):r.abort()
   elif '/api/' in url or url.startswith(base+'/data/'):r.fulfill(json={})
   else:r.continue_()
  page.route('**/*',route)
  # Badge must appear even when the launch toast has already been seen.
  page.add_init_script("localStorage.setItem('astralis:update:launch-notified','v9.0.0')")
  page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached',timeout=60000)
  expect(page.locator('.side-rail [data-nav=customize] [data-update-badge]')).to_be_visible(timeout=15000)
  page.locator('.side-rail [data-nav=customize]').click();expect(page.locator('[data-settings-workbench]')).to_be_visible()
  assert page.locator('[data-settings-tab]').count()==4
  assert page.locator('[data-settings-panel]:visible').count()==1
  for tab in ['appearance','audio','advanced','application']:
   page.locator(f'[data-settings-tab={tab}]').click();expect(page.locator(f'[data-settings-panel={tab}]')).to_be_visible()
   assert page.locator('[data-settings-panel]:visible').count()==1
  expect(page.locator('[data-shortcut-preview]')).to_be_visible()
  assert page.locator('[data-shortcut-icon]').count()==0
  svg=b'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#f4b95a"/></svg>'
  page.locator('#custom-favicon-file').set_input_files({'name':'custom.svg','mimeType':'image/svg+xml','buffer':svg})
  page.wait_for_timeout(1000)
  assert any(url.endswith('/icon') and (data.get('iconData') or '').startswith('data:image/png;base64,') for url,data in requests)
  page.locator('[data-desktop-shortcut]').click();page.wait_for_timeout(300)
  data=[data for url,data in requests if url.endswith('/shortcut')][-1]
  png=base64.b64decode(data['iconData'].split(',')[1]);assert png[:8]==b'\x89PNG\r\n\x1a\n'
  expect(page.locator('.side-rail [data-nav=customize] [data-update-badge]')).to_be_visible()
  page.locator('[data-action=reset-app-icon]').click();page.wait_for_timeout(400)
  assert any(url.endswith('/icon') and data['iconData'] is None for url,data in requests)
  page.evaluate("document.querySelectorAll('*').forEach(el=>{if(el.scrollTop>0)el.scrollTop=0})")
  page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-settings-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  for tab in ['application','appearance','audio','advanced']:
   page.locator(f'[data-settings-tab={tab}]').click();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),tab
  page.locator('[data-settings-tab=application]').click();page.screenshot(path=str(Path(tempfile.gettempdir())/'astralis-settings-mobile.png'),full_page=True)
  available=False;page.locator('[data-action=update-check]').click()
  expect(page.locator('.side-rail [data-nav=customize] [data-update-badge]')).to_have_count(0)
  assert not errors,errors
  browser.close();print('PASS: settings tabs, custom/default icon, shortcut PNG, persistent update badge, no-update clearing and mobile layout',flush=True)
finally:server.shutdown();server.server_close()
