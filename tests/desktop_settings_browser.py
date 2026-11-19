import json
import threading
import time
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
requests=[]
progress={'state':'idle'}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(viewport={'width':1200,'height':900},service_workers='block');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   url=r.request.url
   if url==base+'/harness':r.fulfill(body='<html><body style="--accent:#a88be8;--line:#444;--surface:#222;--surface2:#17171b;--ink:#eee;--muted:#bbb;background:#151519;color:#eee;font:16px system-ui;margin:20px"><main></main></body></html>',content_type='text/html')
   elif '/api/desktop/settings' in url:
    if r.request.method=='POST':requests.append(r.request.post_data_json)
    r.fulfill(json={'ok':True,'supported':True,'autoOpenGenshin':r.request.post_data_json['autoOpenGenshin'] if r.request.method=='POST' else False,'installationPath':'C:\\Documents\\Astralis'})
   elif '/api/desktop/shortcut' in url:requests.append(r.request.post_data_json);r.fulfill(json={'ok':True,'path':'C:\\StartMenu\\Astralis.lnk'})
   elif '/api/update/status' in url:r.fulfill(json=progress)
   elif not url.startswith(base):r.abort()
   elif '/api/' in url or url.startswith(base+'/data/'):r.fulfill(json={})
   else:r.continue_()
  page.route('**/*',route);page.goto(base+'/harness')
  page.evaluate('''async()=>{window.close=()=>window.closeCalls=(window.closeCalls||0)+1;window.desktop=await import('/src/desktop-settings.js');window.updater=await import('/src/update-progress.js');document.querySelector('main').innerHTML=desktop.renderDesktopSettings()+'<section class="update-panel">'+updater.renderUpdateSteps()+'</section>';const css=document.createElement('link');css.rel='stylesheet';css.href='/styles/updater.css';document.head.append(css);desktop.initDesktopSettings();updater.initUpdateProgress();}''')
  expect(page.locator('[data-desktop-auto]')).to_be_enabled();page.locator('[data-desktop-auto]').check();expect(page.locator('[data-desktop-status]')).to_contain_text('Activé')
  assert requests[-1]=={'autoOpenGenshin':True}
  page.locator('[data-shortcut-location]').select_option('startmenu');page.locator('[data-shortcut-icon]').select_option('genshin');page.locator('[data-desktop-shortcut]').click();expect(page.locator('[data-desktop-status]')).to_contain_text('Raccourci créé');assert requests[-1]=={'location':'startmenu','icon':'genshin'}
  progress={'state':'downloading','jobId':'test','elapsedSeconds':12,'remainingSeconds':60,'overallPercent':15,'updatedAt':time.time()}
  page.evaluate('(s)=>updater.showUpdateProgress(s)',progress);expect(page.locator('[data-update-steps]')).to_be_visible();assert page.locator('[data-update-step]').count()==9
  page.wait_for_timeout(2200);page.evaluate('(s)=>updater.showUpdateProgress(s)',progress);assert '14 s' in page.locator('[data-update-elapsed]').inner_text()
  progress={'state':'extracting','jobId':'test','elapsedSeconds':20,'remainingSeconds':30,'overallPercent':40,'updatedAt':time.time(),'steps':[{'id':id,'status':'done' if i<3 else 'active' if i==3 else 'pending'} for i,id in enumerate(['checking','downloading','verifying','extracting','closing','replacing','starting','cleaning','opening'])]}
  page.evaluate('(s)=>updater.showUpdateProgress(s)',progress);expect(page.locator('[data-update-step=extracting]')).to_contain_text('En cours');expect(page.locator('[data-update-step=verifying]')).to_contain_text('Terminé')
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  progress={**progress,'state':'closing'};page.evaluate('(s)=>{updater.showUpdateProgress(s);updater.showUpdateProgress(s)}',progress);assert page.evaluate('closeCalls')==1
  progress={'state':'idle'}
  page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached',timeout=60000)
  page.locator('[data-nav=customize]').first.evaluate('(el)=>el.click()');expect(page.locator('[data-desktop-settings]')).to_be_visible();expect(page.locator('[data-desktop-auto]')).to_be_enabled();assert page.locator('[data-update-step]').count()==9
  assert not errors,errors
  browser.close();print('PASS: Windows settings, toggle, shortcut choices, nine stages, live timer, mobile and full app',flush=True)
finally:server.shutdown();server.server_close()
