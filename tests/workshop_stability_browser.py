"""Exercise production full/partial render paths, delayed data and fallback image reuse."""
import json,threading,re,sys,subprocess
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 pieces=[{'set':'15040','mainType':k,'mainValue':v,'level':20}for k,v in [('hpFlat',4780),('atkFlat',311),('atkPct',46.6),('cryoDmg',46.6),('critDmg',62.2)]]
 build={'id':'stable-build','character':'10000114','name':'Build stable','weapon':'11517','level':90,'pieces':pieces,'weaponLevelValue':90}
 teams=[{'id':'stable-team','name':'Équipe stable','members':[{'character':'skirk','buildId':'stable-build','weapon':'11517','set':'15040'},{},{},{}],'rotation':[{'character':'skirk','code':'E'}]}]
 seed={'astralis:active-game':'gi','astralis:gi:assistant-profile':json.dumps({'enabled':False}),'astralis:teams:gi':json.dumps(teams),'astralis:gi:builds':json.dumps([build])}
 errors=[];missing=[];before='--baseline' in sys.argv
 source=subprocess.check_output(['git','show','d3cb557:src/app.js'],cwd=ROOT).decode('utf-8') if before else (ROOT/'src/app.js').read_text(encoding='utf-8')
 out=ROOT/'docs/captures/workshop-stability';out.mkdir(parents=True,exist_ok=True)
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block');page.set_default_timeout(60000);page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url
    if '/src/app.js' in url and url.startswith(base):r.fulfill(body=source+'\nwindow.workshopTest={render,renderPageOnly,img};',content_type='application/javascript')
    elif url.startswith(base+'/missing-stability.png'):missing.append(url);r.fulfill(status=404)
    elif url.startswith(base+'/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif 'lunaris' in url:r.fulfill(json={})
    else:r.abort()
   page.route('**/*',route);page.add_init_script('for(const[k,v]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(k,v)')
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
   page.locator('[data-nav=teams]').first.click();page.wait_for_selector('[data-team-details-toggle]');page.locator('[data-team-details-toggle]').click()
   expect(page.locator('[data-team-details]')).to_be_visible()
   if before:
    page.evaluate('workshopTest.render()');expect(page.locator('[data-team-details]')).to_be_hidden();page.screenshot(path=str(out/'before-team-collapsed.png'),animations='disabled');browser.close();print('Régression reproduite sur d3cb557 : rendu complet ferme les détails ouverts.',flush=True);return
   page.screenshot(path=str(out/'after-team-expanded.png'),animations='disabled')
   for kind in ['render','renderPageOnly']:
    page.evaluate('(kind)=>workshopTest[kind]()',kind)
    expect(page.locator('[data-team-details]')).to_be_visible();expect(page.locator('[data-team-details-toggle]')).to_have_attribute('aria-expanded','true')
   page.locator('[data-favorite-team]').click();expect(page.locator('[data-team-details]')).to_be_visible()
   page.locator('[data-edit-team]').first.click();expect(page.locator('.team-builder')).to_be_visible();page.keyboard.press('Escape')
   page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character');page.locator('#build-character').select_option('skirk');expect(page.locator('#build-select')).to_have_value('stable-build');expect(page.locator('.workspace>.page-hero .hero-stat>strong')).to_have_text('1')
   picker=page.locator('[data-build-picker="set:0"]');picker.locator('summary').click();search=picker.locator('[data-image-picker-search]');search.fill('gladi');search.focus();search.evaluate('(el)=>el.setSelectionRange(1,4)')
   for kind in ['render','renderPageOnly']:
    page.evaluate('(kind)=>workshopTest[kind]()',kind)
    expect(picker).to_have_attribute('open','');expect(search).to_have_value('gladi');expect(search).to_be_focused();assert search.evaluate('(el)=>[el.selectionStart,el.selectionEnd]')==[1,4]
    assert picker.locator('.image-picker-option:visible').count()>0
    assert all('gladi' in s.lower() for s in picker.locator('.image-picker-option:visible').all_text_contents())
   search.scroll_into_view_if_needed();page.screenshot(path=str(out/'after-picker.png'),animations='disabled')
   position=search.bounding_box()['y'];page.evaluate('workshopTest.render()');assert abs(search.bounding_box()['y']-position)<3
   page.evaluate("""()=>{const box=document.createElement('div');box.id='image-stability';document.body.append(box);box.innerHTML=workshopTest.img(['/missing-stability.png','/assets/genshin/skills/Skill_S_SkirkNew_01.png'],'probe','Skill de contrôle','loading="eager"');}""")
   page.wait_for_function("document.querySelector('#image-stability img')?.complete&&document.querySelector('#image-stability img')?.naturalWidth>0")
   for _ in range(5):
    page.evaluate("""()=>{document.querySelector('#image-stability').innerHTML=workshopTest.img(['/missing-stability.png','/assets/genshin/skills/Skill_S_SkirkNew_01.png'],'probe','Skill de contrôle','loading="eager"');}""")
    assert page.locator('#image-stability img').get_attribute('src').endswith('Skill_S_SkirkNew_01.png')
   assert len(missing)==1,missing
   # Closing deliberately stays closed, while selecting a set closes the picker.
   picker.locator('summary').click();page.evaluate('workshopTest.render()');expect(picker).not_to_have_attribute('open','')
   picker.locator('summary').click();picker.locator('.image-picker-option:visible').first.click();expect(picker).not_to_have_attribute('open','')
   page.evaluate('workshopTest.renderPageOnly()');expect(picker).not_to_have_attribute('open','')
   assert not errors,errors
   browser.close();print('Équipes et sélecteurs stables après rendus complets/partiels, recherche/focus conservés, repli image sans boucle : OK',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
