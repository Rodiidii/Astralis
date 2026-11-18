import json, threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1360,'height':900},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if path.startswith('/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif '/assets/skills/' in url or '/UI/' in url:r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:r.abort()
   page.route('**/*',route)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:gi:wish-plan':json.dumps({'wishes':0,'currentPrimos':160,'history':[{'id':'reward-test','date':'2026-11-15','label':'Dailies','primos':60,'count':0,'rewardType':'daily'}]})}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=wishes]').first.click();page.wait_for_selector('wish-journal')
   page.locator('wish-journal details summary').click();button=page.locator('[data-undo-reward="reward-test"]');expect(button).to_be_visible();button.click()
   expect(page.locator('wish-journal [role=status]')).to_contain_text('Gain annulé')
   state=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:wish-plan'))")
   assert state['currentPrimos']==100 and state['history'][-1]['undoOf']=='reward-test'
   expect(page.locator('[data-undo-reward="reward-test"]')).to_have_count(0)
   assert not errors,errors
   browser.close()
  print('OK: parcours annulation vœux Chromium, solde rétabli, journal conservé, action idempotente, aucune erreur JS.')
 finally:server.shutdown()
if __name__=='__main__':main()
