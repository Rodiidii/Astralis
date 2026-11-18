import threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda error:errors.append(str(error)));page.goto(base+'/tests/fixtures/inbox-search.html');page.wait_for_selector('[data-inbox-item]');expect(page.locator('[data-inbox-filter=task] b')).to_have_text('2');expect(page.locator('.inbox-farm-person')).to_have_count(2);expect(page.locator('.inbox-farm-person-progress')).to_have_text('0/2 personnages farmés');grid=page.locator('.wish-account-grid');assert page.evaluate('(el)=>getComputedStyle(el).display',grid.element_handle())=='grid';assert page.evaluate('(el)=>el.scrollWidth<=el.clientWidth',grid.element_handle());assert page.evaluate('''el=>{const cells=[...el.children].map(x=>x.getBoundingClientRect());return cells.every((a,i)=>cells.slice(i+1).every(b=>a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1))}''',grid.element_handle()),'wallet cards overlap at desktop width';page.set_viewport_size({'width':390,'height':844});assert page.evaluate('(el)=>el.scrollWidth<=el.clientWidth',grid.element_handle()),'wallet grid overflows on mobile';assert page.evaluate('''el=>[...el.querySelectorAll('input,.wish-field-label')].every(x=>{const a=x.getBoundingClientRect(),b=el.getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1})''',grid.element_handle()),'wallet contents escape their cells';page.set_viewport_size({'width':1280,'height':900});page.locator('[data-inbox-farm-person-id=furina]').click();expect(page.locator('.inbox-farm-person-progress')).to_have_text('1/2 personnages farmés');expect(page.locator('[data-inbox-farm-person-id=furina]')).to_have_attribute('aria-pressed','true');expect(page.locator('[data-inbox-item]:visible')).to_have_count(2)
   page.locator('[data-inbox-search]').fill('Furina');expect(page.locator('[data-inbox-item]:visible')).to_have_count(1);expect(page.locator('[data-inbox-visible-count]')).to_contain_text('1 / 2')
   page.locator('[data-inbox-filter=event]').click();expect(page.locator('[data-inbox-item]:visible')).to_have_count(0);expect(page.locator('[data-inbox-filter-empty]')).to_be_visible()
   page.locator('[data-inbox-search-clear]').click();page.locator('[data-inbox-filter=task]').click();expect(page.locator('[data-inbox-item]:visible')).to_have_count(2)
   page.locator('[data-inbox-search]').fill('Préparer Furina');expect(page.locator('[data-inbox-item]:visible')).to_have_count(1)
   menu=page.locator('.inbox-snooze-menu').first;menu.locator('summary').click();menu.locator('[data-inbox-snooze-hours="168"]').click();expect(page.locator('[data-inbox-search]')).to_have_value('Préparer Furina');expect(page.locator('[data-inbox-filter=task]')).to_have_attribute('aria-pressed','true');expect(page.locator('[data-inbox-item]:visible')).to_have_count(0)
   snoozed=page.evaluate("JSON.parse(localStorage.getItem('astralis:inbox:snoozed:v1'))")
   assert any(value>__import__('time').time()*1000+6*86400000 for value in snoozed.values())
   postponed=page.locator('.inbox-postponed');expect(postponed).to_contain_text('Préparer Furina');postponed.locator('summary').click();postponed.locator('[data-inbox-unsnooze]').click();expect(page.locator('[data-inbox-item]')).to_have_count(2);expect(page.locator('[data-inbox-search]')).to_have_value('Préparer Furina');expect(page.locator('[data-inbox-item]:visible')).to_have_count(1);assert 'task:gi:a' not in page.evaluate("JSON.parse(localStorage.getItem('astralis:inbox:snoozed:v1'))")
   assert not errors,errors;browser.close()
  print('OK: recherche et filtres, progression individuelle du farm, portefeuille sans débordement, compteurs et différés.')
 finally:server.shutdown()
if __name__=='__main__':main()
