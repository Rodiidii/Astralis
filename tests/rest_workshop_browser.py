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
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
   def route(r):
    url=r.request.url;path=urlsplit(url).path
    if path=='/api/gi/news':r.fulfill(json={'articles':[{'id':'real','title':'Annonce officielle de test','link':'https://genshin.hoyoverse.com/fr/news/1','date':'Tue, 10 Nov 2026 18:00:00 GMT','category':'news'},{'id':'fake','kind':'farm','title':'Mora inventé','date':'2026-11-10','link':'https://example.com'}]})
    elif path=='/api/gi/events':r.fulfill(json={'events':[{'id':'banner','kind':'char-banner','title':'Bannière datée','start':'2026-11-01','end':'2026-11-28'}]})
    elif 'api.lunaris.moe/data/version.json' in url:r.fulfill(json={'version':'test'})
    elif 'api.lunaris.moe/data/test/fr/char/' in url:r.fulfill(json={'info':{'attributes':[]},'skills':{'normalattack':{'name':'Attaque de test','description':'Description réelle de fixture','icon':'Fixture'}},'passives':{'passive1':{'name':'Passif de test','description':'Description du passif','icon':'PassiveFixture'}}})
    elif path.startswith('/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif '/assets/skills/' in url or '/UI/' in url:r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
    else:r.abort()
   page.route('**/*',route)
   seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False,'proactive':False}),'astralis:gi:farm-roster':json.dumps([{'id':'furina','active':True}]),'astralis:gi:wish-plan':json.dumps({'wishes':3,'currentPrimos':100,'characterPity':60,'characterGuarantee':True,'theatreGain':1000,'abyssGain':800,'history':[]})}
   page.add_init_script('for(const [key,value]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(key,value)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
   page.locator('[data-nav=wishes]').first.click();page.wait_for_selector('wish-wallet')
   page.locator('[data-wallet=currentPrimos]').fill('3200');page.locator('[data-wallet=currentPrimos]').press('Tab');page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos===3200")
   page.locator('[data-reward=daily]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos===3260")
   page.locator('[data-reward=daily]').click();expect(page.locator('wish-wallet [role=status]')).to_contain_text('déjà enregistrée')
   page.locator('[data-reward=reset]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).wishes===8")
   expect(page.locator('.income-summary-table tbody tr')).not_to_have_count(0)
   page.locator('wish-objectives [data-add]').click();page.locator('[data-target="0"][data-field=name]').fill('Contrôle objectif');page.locator('[data-target="0"][data-field=name]').press('Tab')
   page.locator('.goal-ownership summary').first.click()
   page.locator('[data-target="0"][data-field=currentC]').fill('2');page.locator('[data-target="0"][data-field=currentC]').press('Tab')
   page.locator('[data-target="0"][data-field=targetC]').fill('4');page.locator('[data-target="0"][data-field=targetC]').press('Tab')
   expect(page.locator('[data-target="0"][data-field=copies]')).to_have_value('2');expect(page.locator('.wish-target-summary')).to_contain_text('2 copie(s) de personnage')
   page.locator('[data-target="0"][data-field=copies]').fill('3');page.locator('[data-target="0"][data-field=copies]').press('Tab')
   expect(page.locator('.wish-target-summary')).to_contain_text('3 copie(s) de personnage')

   expect(page.locator('.wish-donut')).to_have_count(2);assert page.locator('.wish-history-chart rect').count()==30
   expect(page.locator('.wish-period-comparisons article')).to_have_count(2)
   expect(page.locator('.wish-period-comparisons')).to_contain_text('Cette semaine')
   page.locator('[data-income=end]').fill('2027-08-25');page.locator('[data-income=end]').press('Tab')
   expect(page.locator('[data-income=maps]')).to_be_disabled()
   expect(page.locator('[data-income-ledger]')).to_contain_text('Exploration')
   page.locator('[data-income=autoMaps]').uncheck();expect(page.locator('[data-income=maps]')).to_be_enabled()
   assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')).income.autoMaps===false")
   page.locator('[data-income=versionGifts]').uncheck()
   assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')).income.versionGifts===false")

   page.locator('[data-wish-stat=fiftyAttempts]').fill('10');page.locator('[data-wish-stat=fiftyAttempts]').press('Tab')
   page.locator('[data-wish-stat=fiftyLost]').fill('7');page.locator('[data-wish-stat=fiftyLost]').press('Tab');expect(page.locator('.wish-observed-stats>p')).to_contain_text('70 %')
   page.screenshot(path=str(ROOT/'docs/wallet-rest.png'),full_page=True);page.screenshot(path=str(ROOT/'docs/wallet-rest-head.png'));page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(ROOT/'docs/wallet-rest-mobile.png'),full_page=True);page.set_viewport_size({'width':1440,'height':1000})
   page.locator('[data-nav=events]').first.click();page.wait_for_selector('.news-card');assert page.locator('.news-timeline').inner_text().count('Annonce officielle de test')==1;assert 'Mora inventé' not in page.locator('.news-timeline').inner_text();assert page.locator('.event-calendar-chip').filter(has_text='Bannière datée').count()>0
   assert page.locator('.event-calendar-chip.type-endgame').count()>0
   page.locator('[data-nav=characters]').first.click();page.locator('#catalog-search').fill('Furina');page.locator('.character-catalog-card').filter(has_text='Furina').first.click();page.wait_for_selector('[data-detail-tab=personal-builds]')
   expect(page.locator('.detail-skill').filter(has_text='Passif de test').locator('img')).to_have_count(1)
   page.locator('[data-detail-tab=personal-builds]').click();expect(page.locator('[data-detail-content=personal-builds]')).to_contain_text('Aucun build')
   page.keyboard.press('Escape');page.locator('[data-nav=sets]').first.click();page.wait_for_selector('[data-create-artifact]');page.locator('[data-create-artifact]').click();dialog=page.locator('.artifact-create-dialog');expect(dialog).to_be_visible()
   dialog.locator('[name=value]').fill('4780');dialog.locator('[name=stat0]').select_option('defFlat');dialog.locator('[name=roll0]').fill('39');dialog.locator('[type=submit]').click();expect(dialog.locator('[role=status]')).to_contain_text('enregistrée');expect(dialog).to_be_visible();expect(dialog.locator('[name=roll0]')).to_have_value('')
   page.keyboard.press('Escape');page.locator('[data-nav=farming]').first.click();page.wait_for_selector('#farm-calendar-character');page.locator('#farm-calendar-character').select_option(label='Furina');page.locator('#farm-calendar-category').select_option(label='Livres d’aptitudes');page.wait_for_selector('.farm-calendar-day.is-talent-day');expect(page.locator('#farm-talent-days')).to_contain_text('Donjons')
   page.locator('[data-apply-farm]').click();page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')||'[]').some(r=>r.auto)")
   day=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).find(r=>r.auto).date")
   page.locator('#farm-calendar-task').fill('Session manuelle de test');page.locator('#farm-calendar-date').fill(day);page.locator('[data-action=farm-schedule]').click();page.wait_for_function("day=>JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).some(r=>r.date===day&&!r.auto&&!r.simulated)",arg=day);assert page.evaluate("day=>JSON.parse(localStorage.getItem('astralis:gi:farm-calendar')).every(r=>r.date!==day||!r.auto&&!r.simulated)",day)
   page.locator('[data-nav=endgame]').first.click();page.wait_for_selector('.endgame-calendar-controls');card=page.locator('.endgame-calendar-controls article').filter(has_text='Spirale abyssale');before=card.inner_text();card.get_by_label('Rotation suivante',exact=True).click();assert card.inner_text()!=before
   assert not errors,errors;browser.close();print('Portefeuille, gains, doublons, statistiques, actualités, passifs, onglet builds et création répétée de reliques : OK',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
