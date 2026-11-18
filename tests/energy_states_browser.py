import json,threading,time
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

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
   now=int(time.time()*1000)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:energy-dock:v1':json.dumps({'gi':{'current':190,'max':200,'minutes':8,'updatedAt':now,'history':[{'at':now-2*86400000,'delta':-40,'label':'Domaine'},{'at':now-86400000,'delta':-20,'label':'Boss'},{'at':now-80000000,'delta':5,'label':'Correction'}]},'hsr':{'current':300,'max':300,'minutes':6,'updatedAt':now}})}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
   page.goto(base+'/tests/fixtures/energy-presets.html',wait_until='domcontentloaded');page.wait_for_selector('.energy-page')
   gi=page.locator('.energy-game[data-energy-game=gi]');expect(gi).to_have_class(__import__('re').compile('is-near-cap'));expect(gi.locator('[data-energy-state]')).to_have_text('Plafond proche')
   hsr=page.locator('.energy-game[data-energy-game=hsr]');expect(hsr).to_have_class(__import__('re').compile('is-full'));expect(hsr.locator('[data-energy-state]')).to_have_text('Plein')
   expect(page.locator('.energy-game[data-energy-game=ww] [data-energy-state]')).to_have_text('À configurer');assert not errors,errors;expect(page.locator('[data-energy-milestone-target]')).to_have_count(3);targets=page.locator('[data-energy-milestone-target]').evaluate_all('(nodes)=>nodes.map(n=>Number(n.dataset.energyMilestoneTarget))');assert targets==[150,160,200],targets;expect(page.locator('[data-energy-milestone-at]')).to_have_count(3)
   expect(page.locator('.energy-week-bars [role=listitem]')).to_have_count(7);expect(page.locator('[data-energy-week-total]')).to_contain_text('−60 dépensé');expect(page.locator('[data-energy-week]')).to_have_attribute('aria-label','Dépenses d’énergie sur les sept derniers jours')
   page.locator('.energy-settings summary').click()
   settings=page.locator('[data-energy-settings]')
   for field,value in [('quickSpend1','30'),('quickSpend2','70'),('quickSpend3','100')]:settings.locator(f'[name={field}]').fill(value)
   settings.locator('button[type=submit]').click()
   expect(page.locator('[data-energy-spend="30"]')).to_be_visible();expect(page.locator('[data-energy-spend="70"]')).to_be_visible();expect(page.locator('[data-energy-spend="100"]')).to_be_visible()
   page.locator('[data-energy-spend="70"]').click();expect(page.locator('#energy-current')).to_have_value('120')
   saved=page.evaluate("JSON.parse(localStorage.getItem('astralis:energy-dock:v1')).gi.quickSpends")
   assert saved==[30,70,100],saved;expect(page.locator('.energy-log')).to_contain_text('Dépense · 70');expect(page.locator('[data-energy-week-total]')).to_contain_text('−130 dépensé');page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Le suivi hebdomadaire déborde sur mobile';assert not errors,errors
   browser.close()
  print('OK: états énergie, suivi hebdomadaire, affichage mobile, réglage des trois raccourcis et journal.')
 finally:server.shutdown()
if __name__=='__main__':main()
