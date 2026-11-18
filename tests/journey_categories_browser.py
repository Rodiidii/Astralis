import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   rows=[{'id':'b1','kind':'note','game':'gi','category':'build','label':'Souvenir personnel','text':'Build Furina','at':1794700000000,'day':'2026-11-14'},{'id':'f1','kind':'note','game':'gi','category':'farm','label':'Souvenir personnel','text':'Boss à préparer','at':1794700100000,'day':'2026-11-15'},{'id':'v1','kind':'visit','game':'gi','section':'builds','label':'Mes builds','at':1794700200000,'day':'2026-11-15'}]
   page.add_init_script('localStorage.setItem("astralis:journey-log:v1",'+json.dumps(json.dumps(rows,ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/journey-log.html',wait_until='load');expect(page.locator('.journey-entry')).to_have_count(3);expect(page.locator('[data-journey-note-edit]')).to_have_count(2);expect(page.locator('.journey-rhythm')).to_be_visible();expect(page.locator('.journey-rhythm-day')).to_have_count(7);expect(page.locator('.journey-rhythm')).to_contain_text('Nuit')
   page.locator('[data-journey-filter="category"]').select_option('build');expect(page.locator('.journey-entry:visible')).to_have_count(1);expect(page.locator('.journey-entry:visible')).to_contain_text('Build Furina')
   page.locator('[data-journey-filter="category"]').select_option('farm');expect(page.locator('.journey-entry:visible')).to_have_count(1);expect(page.locator('.journey-entry:visible')).to_contain_text('Boss à préparer')
   page.locator('[data-journey-filter="category"]').select_option('all');page.locator('[data-journey-note-edit="b1"]').select_option('farm');page.wait_for_function("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).find(row=>row.id==='b1').category==='farm'");page.locator('[data-journey-filter="category"]').select_option('farm');expect(page.locator('.journey-entry:visible')).to_have_count(2)
   form=page.locator('[data-journey-note-form]');form.locator('[data-journey-note-category]').select_option('idea');form.locator('#journey-note-input').fill('Tester une nouvelle rotation');form.locator('button[type="submit"]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:journey-log:v1')).some(row=>row.text==='Tester une nouvelle rotation'&&row.category==='idea')")
   page.locator('[data-journey-filter="category"]').select_option('idea');expect(page.locator('.journey-entry:visible')).to_have_count(1)
   page.set_viewport_size({'width':390,'height':844});assert page.locator('[data-journey-log]').evaluate('(node)=>node.scrollWidth<=node.clientWidth'),page.locator('[data-journey-log]').evaluate('(node)=>({width:node.clientWidth,scroll:node.scrollWidth,children:[...node.querySelectorAll("*")].filter(x=>x.scrollWidth>x.clientWidth+2).slice(0,12).map(x=>[x.className?.baseVal||x.className,x.clientWidth,x.scrollWidth])})');assert not errors,errors
   browser.close()
  print('OK: catégories, sauvegarde, filtres, rythme hebdomadaire et affichage mobile du Carnet.')
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
