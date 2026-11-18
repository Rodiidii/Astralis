import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   zones=[{'id':'a','name':'Mondstadt','progress':20,'goal':90,'goalDate':'2026-11-20','checks':[]},{'id':'b','name':'Liyue','progress':45,'updated':100,'checks':[]},{'id':'c','name':'Inazuma','progress':100,'checks':[]},{'id':'d','name':'Sumeru','progress':0,'checks':[]}]
   page.add_init_script('localStorage.setItem("astralis:exploration-atlas:v1:gi",'+json.dumps(json.dumps({'zones':zones,'log':[]},ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/exploration-atlas-circuit.html');expect(page.locator('.atlas-circuit li')).to_have_count(3)
   expect(page.locator('.atlas-circuit li').nth(0)).to_contain_text('Mondstadt');expect(page.locator('.atlas-circuit li').nth(1)).to_contain_text('Liyue')
   page.locator('[data-atlas-progress="a"]').evaluate("el=>{el.value='100';el.dispatchEvent(new Event('input',{bubbles:true}))}");expect(page.locator('.atlas-circuit li')).to_have_count(2);expect(page.locator('.atlas-circuit li').first).to_contain_text('Liyue')
   assert not errors,errors;browser.close()
  print('OK : le circuit sélectionne les zones prioritaires et se recalcule pendant la progression.')
 finally:server.shutdown()
if __name__=='__main__':main()
