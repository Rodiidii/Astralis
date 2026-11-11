import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1000,'height':900},service_workers='block');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{server.server_port}/tests/sheets-harness.html');page.evaluate("""async()=>{await import('/src/planning-controls.js');localStorage.setItem('astralis:gi:objectives-v2',JSON.stringify({targets:[{name:'Contrôle',currentC:2,targetC:4,copies:7}],income:{start:'2026-11-04',end:'2026-12-16'}}));document.body.innerHTML='<wish-objectives></wish-objectives>';}""")
   expect(page.locator('[data-field=copies]')).to_have_value('2');expect(page.locator('.wish-target-summary')).to_contain_text('2 copie(s)')
   page.locator('[data-field=copies]').fill('3');page.locator('[data-field=copies]').press('Tab');expect(page.locator('[data-field=targetC]')).to_have_value('5');expect(page.locator('.wish-target-summary')).to_contain_text('3 copie(s)')
   page.locator('.goal-ownership summary').click();page.locator('[data-field=targetC]').fill('6');page.locator('[data-field=targetC]').press('Tab');expect(page.locator('[data-field=copies]')).to_have_value('4')
   page.reload();page.evaluate("async()=>{await import('/src/planning-controls.js');document.body.innerHTML='<wish-objectives></wish-objectives>'}");expect(page.locator('[data-field=copies]')).to_have_value('4');assert not errors,errors
   page.locator('[data-apply-theory]').click();expect(page.locator('[data-theory-status]')).to_have_attribute('data-stale','false')
   before=page.locator('.wish-order-graph figcaption').last.inner_text();field=page.locator('[data-income=extraPrimos]');field.fill('3200');field.press('Tab');expect(page.locator('[data-theory-status]')).to_have_attribute('data-stale','true');assert page.locator('.wish-order-graph figcaption').last.inner_text()==before
   page.locator('[data-apply-theory]').click();expect(page.locator('[data-theory-status]')).to_have_attribute('data-stale','false');assert page.locator('.wish-order-graph figcaption').last.inner_text()!=before
   page.locator('[data-income=end]').fill('2020-01-01');page.locator('[data-income=end]').press('Tab');expect(page.locator('[data-apply-theory]')).to_be_disabled()
   assert not errors,errors
   browser.close();print('Objectifs : copies et constellations synchronisées, synthèse et persistance validées.',flush=True)
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
