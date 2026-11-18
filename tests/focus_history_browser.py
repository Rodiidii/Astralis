import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   history=[{'id':'old','game':'gi','mode':'free','title':'Ancienne exploration','durationMs':900000,'done':1,'total':2,'endedAt':1791000000000},{'id':'a','game':'gi','mode':'farm','title':'Farm talents Furina','durationMs':120000,'done':2,'total':3,'endedAt':1794700000000},{'id':'b','game':'hsr','mode':'team','title':'Cycle Kafka','durationMs':180000,'done':1,'total':1,'endedAt':1794700100000},{'id':'c','game':'ww','mode':'boss','title':'Boss hebdomadaire','durationMs':60000,'done':0,'total':2,'endedAt':1794700200000},{'id':'d','game':'gi','mode':'farm','title':'Farm talents Furina','characterName':'Furina','note':'Tester le bonus du vitrail','durationMs':180000,'done':3,'total':3,'endedAt':1794700300000}]
   page.add_init_script('localStorage.setItem("astralis:focus-station:v1",'+json.dumps(json.dumps({'active':None,'history':history},ensure_ascii=False))+')')
   page.goto(base+'/tests/fixtures/focus-history.html');page.wait_for_selector('[data-focus-history-row]');expect(page.locator('.focus-week-day')).to_have_count(7);expect(page.locator('.focus-week')).to_be_visible();expect(page.locator('.focus-streak-card')).to_be_visible();expect(page.locator('.focus-streak-record')).to_contain_text('Record personnel · 1 jour');expect(page.locator('[data-focus-history-row]').first.locator('.focus-history-compare')).to_contain_text('moyenne');expect(page.locator('.focus-history-compare')).to_have_count(1)
   goal=page.locator('[data-focus-week-goal]');expect(page.locator('[data-focus-week-goal-label]')).to_contain_text('9 / 180 min');goal.select_option('60');expect(page.locator('[data-focus-week-goal-label]')).to_contain_text('9 / 60 min');assert page.locator('[data-focus-week-goal-bar]').evaluate("e=>e.style.getPropertyValue('--focus-week-goal-progress')")=='15%';assert page.evaluate("localStorage.getItem('astralis:focus-weekly-goal:v1')")=='60'
   expect(page.locator('[data-focus-history-row]:visible')).to_have_count(5)
   expect(page.locator('[data-focus-history-summary]')).to_contain_text('5 sessions');expect(page.locator('[data-focus-history-summary]')).to_contain_text('étapes terminées')
   page.locator('[data-focus-history-period]').select_option('7d');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(4);expect(page.locator('[data-focus-history-summary]')).to_contain_text('4 sessions')
   page.locator('[data-focus-history-period]').select_option('30d');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(4)
   page.locator('[data-focus-history-period]').select_option('all');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(5)
   page.locator('[data-focus-history-query]').fill('furina');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(2)
   page.locator('[data-focus-history-query]').fill('vitrail');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(1)
   page.locator('[data-focus-history-query]').fill('');page.locator('[data-focus-history-game]').select_option('hsr');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(1)
   page.locator('[data-focus-history-game]').select_option('all');page.locator('[data-focus-history-mode]').select_option('boss');expect(page.locator('[data-focus-history-row]:visible')).to_have_count(1)
   page.locator('[data-focus-history-query]').fill('introuvable');expect(page.locator('[data-focus-history-empty]')).to_be_visible();page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Focus Studio déborde sur téléphone';assert page.locator('.focus-streak-card').evaluate('(el)=>{const a=el.getBoundingClientRect(),b=innerWidth;return a.left>=0&&a.right<=b}'),'La carte de régularité sort de l’écran mobile';assert not errors,errors;browser.close()
  print('OK: historique et filtres Focus, série locale, affichage mobile.')
 finally:server.shutdown()
if __name__=='__main__':main()
