"""End-to-end checks through the normal page navigation, with network failures isolated."""
import json,threading
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1366,'height':900},service_workers='block');page.set_default_timeout(60000);page.set_default_navigation_timeout(120000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if url.startswith(base+'/api/gi/events'):r.fulfill(json={'events':[{'id':'banner','title':'Bannière de test','kind':'char-banner','start':'2026-11-01T00:00:00Z','end':'2026-11-28T00:00:00Z','source':{'title':'Source structurée','url':'https://example.com'}}]})
    elif url.startswith(base+'/api/gi/news'):r.fulfill(json={'articles':[],'videos':[]})
    elif url.startswith(base+'/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif 'lunaris' in url:r.fulfill(json={})
    elif any(part in url for part in ['/UI/','/assets/']):r.fulfill(path=str(ROOT/'assets/app-icon.svg'))
    else:r.abort()
   page.route('**/*',route)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:teams:gi':json.dumps([{'id':'test-team','name':'Équipe stable','members':[{'character':'furina'},{},{},{}],'rotation':[]}]),'astralis:gi:team-focus':'deleted-team','astralis:gi:wish-plan':json.dumps({'wishes':40,'currentPrimos':3200,'characterPity':50,'characterGuarantee':True,'history':[]}),'astralis:gi:objectives-v2':json.dumps({'targets':[{'name':'Furina','copies':1,'refinements':0},{'name':'Nahida','copies':1,'refinements':1}],'income':{'start':'2026-11-04','end':'2026-12-16','theatre':1000,'abyss':800}}),'astralis:gi:farm-roster':json.dumps([{'id':'furina','active':True}])}
   page.add_init_script('for(const [key,value] of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=teams]').first.click();expect(page.locator('.team-sheet h3')).to_have_text('Équipe stable');page.locator('[data-team-details-toggle]').click();expect(page.locator('[data-team-details]')).to_be_visible();page.wait_for_timeout(1500);expect(page.locator('[data-team-details]')).to_be_visible();page.locator('[data-edit-team]').first.click();page.wait_for_selector('[data-save-team]');page.screenshot(path=str(ROOT/'docs/teams-current.png'));page.keyboard.press('Escape')
   page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character');page.locator('#build-character').select_option('furina');page.locator('[data-action=build-new]').first.click();page.wait_for_selector('.build-artifact-piece');picker=page.locator('[data-build-picker]').first;picker.locator('summary').click();page.wait_for_timeout(1500);assert picker.get_attribute('open') is not None;assert page.locator('.build-character-select').bounding_box()['height']<270;page.screenshot(path=str(ROOT/'docs/build-current.png'));page.locator('[data-nav=wishes]').first.click();expect(page.locator('.wish-order-graph')).to_have_count(2);page.locator('.goal-ownership summary').first.click();page.locator('[data-target="0"][data-field=targetC]').fill('2');page.locator('[data-target="0"][data-field=targetC]').press('Tab');expect(page.locator('[data-target="0"][data-field=copies]')).to_have_value('3');page.locator('[data-apply-theory]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')).theoreticalPrimos")>0;expect(page.locator('[data-order-graphs] table')).to_have_count(1);page.screenshot(path=str(ROOT/'docs/wishes-current.png'),full_page=True)
   page.locator('[data-nav=farming]').first.click();page.wait_for_selector('.farm-projection-options button');expect(page.locator('.farm-projection-options button')).to_have_count(5);page.locator('[data-artifact-days="2"]').click();page.locator('[data-apply-farm]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')||'[]').length>0");page.screenshot(path=str(ROOT/'docs/farm-current.png'),full_page=True)
   page.locator('[data-nav=events]').first.click();page.wait_for_selector('.event-calendar-chip');assert '[object Object]' not in page.locator('#page-content').inner_text();assert 'Mora ·' not in page.locator('.news-timeline').inner_text();expect(page.locator('.event-calendar-chip').filter(has_text='Bannière de test').first).to_have_text('Bannière de test');page.locator('[data-calendar-day="2026-11-10"]').click();expect(page.locator('.event-date-dialog')).to_be_visible();page.keyboard.press('Escape');page.screenshot(path=str(ROOT/'docs/news-current.png'),full_page=True)
   page.locator('[data-nav=characters]').first.click();page.wait_for_selector('#catalog-search');assert page.locator('.collection-bar').evaluate('n=>n.scrollHeight<=80');page.screenshot(path=str(ROOT/'docs/catalog-current.png'))
   assert not errors,errors;print('Équipes, modale, objectifs, double graphe, simulation de farm, calendrier et barre catalogue validés.',flush=True);browser.close()
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
