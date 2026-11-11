"""Actual dialog: custom team, source stats, save/reopen and mobile layout."""
import threading
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch()
   for width in [1440,390]:
    page=browser.new_page(viewport={'width':width,'height':900})
    page.route('**/control-harness',lambda route:route.fulfill(body='<html><head><link rel="stylesheet" href="/assets/rest-workshop.css"></head><body></body></html>',content_type='text/html'))
    page.goto(f'http://127.0.0.1:{server.server_port}/control-harness')
    page.evaluate("async()=>{window.controls=await import('/src/complex-controls.js');window.pending=controls.editComplexEffects({},['pyro','geo','hydro','anemo']);}")
    dialog=page.get_by_role('dialog');expect(dialog).to_be_visible()
    expect(dialog.locator('[name="yunjin.passive2"]')).to_be_checked()
    dialog.locator('[name="yunjin.enabled"]').check()
    dialog.locator('[name="yunjin.def"]').fill('2700')
    dialog.locator('[name="yunjin.constellation"]').fill('3')
    dialog.locator('[name="team-slot-3"]').select_option('electro')
    assert dialog.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'), dialog.evaluate('(el)=>({width:el.clientWidth,scroll:el.scrollWidth,children:[...el.querySelectorAll("*")].filter(x=>x.getBoundingClientRect().right>el.getBoundingClientRect().right).map(x=>[x.tagName,x.className,x.getBoundingClientRect().width])})')
    captures=ROOT/'docs/captures/lab-effects';captures.mkdir(parents=True,exist_ok=True)
    page.screenshot(path=str(captures/f'conditions-{width}.png'))
    page.get_by_role('button',name='Appliquer les conditions').click()
    saved=page.evaluate('async()=>{window.saved=await pending;return saved;}')
    assert saved['elements']==['pyro','geo','hydro','electro']
    assert saved['config']['yunjin']['def']==2700 and saved['config']['yunjin']['constellation']==3
    assert saved['config']['yunjin']['enabled'] is True
    page.evaluate('window.pending=controls.editComplexEffects(saved.config,saved.elements);void 0')
    expect(dialog.locator('[name="yunjin.def"]')).to_have_value('2700')
    expect(dialog.locator('[name="team-slot-3"]')).to_have_value('electro')
    dialog.locator('[name="team"]').select_option('geo,geo,geo,geo')
    for i in range(4):expect(dialog.locator(f'[name="team-slot-{i}"]')).to_have_value('geo')
    page.keyboard.press('Escape')
    assert page.evaluate('async()=>await pending') is None
    page.close()
   browser.close()
   print('Conditions complexes : Yun Jin, composition personnalisée, sauvegarde, réouverture, annulation, desktop et mobile validés.',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
