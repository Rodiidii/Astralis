import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   history=[{'id':str(i),'game':'gi','mode':'farm','title':f'Farm {i}','durationMs':1800000,'focusDurationMs':minutes*60000,'done':1,'total':1,'endedAt':1794700000000+i} for i,minutes in enumerate([25,45,60])]
   history.append({'id':'hsr','game':'hsr','mode':'farm','title':'Calyx','durationMs':1800000,'focusDurationMs':60*60000,'done':1,'total':1,'endedAt':1794700000100})
   page.add_init_script('localStorage.setItem("astralis:focus-station:v1",'+json.dumps(json.dumps({'active':None,'history':history},ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/focus-history.html');page.wait_for_selector('[data-focus-form]')
   expect(page.locator('[name="focusMinutes"]')).to_have_value('45');expect(page.locator('[data-focus-sprint-suggestion]')).to_contain_text('3 session')
   page.locator('[name="mode"]').select_option('boss');expect(page.locator('[name="focusMinutes"]')).to_have_value('25')
   page.locator('[name="mode"]').select_option('farm');page.locator('[name="game"]').select_option('hsr');expect(page.locator('[name="focusMinutes"]')).to_have_value('60')
   page.locator('[data-focus-routine="team"]').click();expect(page.locator('[name="mode"]')).to_have_value('team');expect(page.locator('[name="focusMinutes"]')).to_have_value('25')
   fullscreen_page=browser.new_page();fullscreen_page.add_init_script("""(()=>{ const startedAt=Date.now(); localStorage.setItem('astralis:focus-station:v1', JSON.stringify({active:{id:'fullscreen-check',game:'gi',mode:'team',title:'Session immersive',tasks:[{text:'Etape 1',done:false}],status:'running',elapsedMs:0,resumedAt:startedAt,startedAt,focusDurationMs:1500000,focusRemainingMs:1500000,focusResumedAt:startedAt},history:[]})); })()""")
   fullscreen_page.goto(base+'/tests/fixtures/focus-history.html');fullscreen=fullscreen_page.locator('[data-focus-fullscreen]');expect(fullscreen).to_have_attribute('aria-pressed','false');fullscreen.click();expect(fullscreen).to_have_attribute('aria-pressed','true');assert fullscreen_page.locator('[data-focus-console]').evaluate("el=>document.fullscreenElement===el||el.classList.contains('is-focus-fullscreen')");fullscreen_page.keyboard.press('Escape');expect(fullscreen).to_have_attribute('aria-pressed','false')
   assert not errors,errors;browser.close()
  print('OK: la suggestion du sprint suit les sessions du même univers et de la même activité.')
 finally:server.shutdown()
if __name__=='__main__':main()
