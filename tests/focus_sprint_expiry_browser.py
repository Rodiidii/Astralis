import json,threading,time
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   started=int(time.time()*1000)+60000
   active={'id':'sprint-expiry','game':'gi','mode':'farm','title':'Défi minute','tasks':[],'status':'running','elapsedMs':0,'resumedAt':started,'startedAt':started,'focusDurationMs':1000,'focusRemainingMs':1000,'focusResumedAt':started}
   page.add_init_script("localStorage.setItem('astralis:focus-station:v1',"+json.dumps(json.dumps({'active':active,'history':[]},ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/focus-routines.html')
   page.evaluate("()=>{const key='astralis:focus-station:v1',data=JSON.parse(localStorage.getItem(key));data.active.resumedAt=Date.now()-1200;data.active.focusResumedAt=Date.now()-1200;localStorage.setItem(key,JSON.stringify(data));document.dispatchEvent(new Event('visibilitychange'))}")
   expect(page.locator('[data-focus-sprint-state]')).to_have_text('EN PAUSE',timeout=4000)
   expect(page.locator('#status')).to_contain_text('Sprint terminé')
   saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active")
   assert saved['status']=='paused' and saved['focusRemainingMs']==0 and 'resumedAt' not in saved
   assert not errors,errors;browser.close()
  print('PASS: foreground visibility immediately reconciles an expired sprint and shows one discreet in-app notice.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
