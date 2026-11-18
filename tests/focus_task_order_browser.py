import json,threading,time
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 active={'id':'focus-order-test','game':'gi','mode':'farm','title':'Test ordre','tasks':[{'text':'Alpha','done':False},{'text':'Beta','done':False},{'text':'Gamma','done':False}],'status':'running','startedAt':int(time.time()*1000),'resumedAt':int(time.time()*1000),'elapsedMs':0,'focusDurationMs':0,'focusRemainingMs':0}
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.add_init_script('if(!localStorage.getItem("astralis:focus-station:v1"))localStorage.setItem("astralis:focus-station:v1",'+json.dumps(json.dumps({'active':active,'history':[]},ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/focus-history.html',wait_until='domcontentloaded');expect(page.locator('.focus-task-row')).to_have_count(3)
   expect(page.locator('[data-focus-move-task="0"][data-focus-direction="-1"]')).to_be_disabled();expect(page.locator('[data-focus-move-task="2"][data-focus-direction="1"]')).to_be_disabled()
   move=page.locator('[data-focus-move-task="1"][data-focus-direction="-1"]');move.focus();page.keyboard.press('Enter')
   page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.tasks[0].text==='Beta'")
   page.reload(wait_until='domcontentloaded');expect(page.locator('.focus-task-row').first).to_contain_text('Beta');expect(page.locator('.focus-task-row').nth(1)).to_contain_text('Alpha')
   page.locator('[data-focus-move-task="0"][data-focus-direction="1"]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.tasks[1].text==='Beta'");expect(page.locator('.focus-task-row').nth(1)).to_contain_text('Beta')
   page.set_viewport_size({'width':390,'height':844});task=page.locator('[data-focus-task-add] input');expect(task).to_be_visible();task.fill('Récupérer le butin');task.press('Enter');expect(page.locator('.focus-task-row')).to_have_count(4);page.wait_for_function("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.tasks.at(-1).text==='Récupérer le butin'");assert page.locator('[data-focus-console]').evaluate('(node)=>node.scrollWidth<=node.clientWidth'),'Le studio de session déborde sur téléphone'
   for index in range(8):
    task=page.locator('[data-focus-task-add] input');task.fill(f'Étape supplémentaire {index+1}');task.press('Enter')
   expect(page.locator('.focus-task-row')).to_have_count(12);expect(page.locator('[data-focus-task-add]')).to_have_count(0);expect(page.locator('.focus-task-cap')).to_be_visible();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:focus-station:v1')).active.tasks.length") == 12
   page.reload(wait_until='domcontentloaded');expect(page.locator('.focus-task-row')).to_have_count(12);expect(page.locator('.focus-task-cap')).to_be_visible()
   assert not errors,errors;browser.close()
  print('OK: étapes réordonnables et ajoutées sur mobile, limite 12 et persistance vérifiées après rechargement.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
