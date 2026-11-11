import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 piece={'id':'owned-coupe','slot':'goblet','slotIndex':3,'setKey':'15040','mainType':'cryoDmg','mainValue':46.6,'level':20,'rarity':5,'substats':[{'type':'atkPct','value':10.5},{'type':'critRate','value':7.8},{'type':'critDmg','value':14},{'type':'em','value':23}]}
 build={'id':'equip-test','character':'10000114','name':'Contrôle de pièce','level':90,'weapon':'11517','weaponLevelValue':90,'pieces':[{}, {}, {},{'set':'finale-des-galeries-profondes','mainType':'hpPct','mainValue':46.6,'image':'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'},{}]}
 seed={'astralis:gi:builds':json.dumps([build]),'astralis:gi:owned-artifacts':json.dumps([piece]),'astralis:active-game':'gi','astralis:gi:assistant-profile':'{"enabled":false}','astralis:releases:last-seen':'2026-11-11-atelier-1'}
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    if r.request.url.startswith(base+'/api/'):r.fulfill(json={})
    elif r.request.url.startswith(base):r.continue_()
    elif 'lunaris' in r.request.url:r.fulfill(json={})
    else:r.abort()
   page.route('**/*',route);page.add_init_script("if(!localStorage.getItem('equip-seeded')){localStorage.setItem('equip-seeded','1');for(const[k,v]of Object.entries("+json.dumps(seed)+"))localStorage.setItem(k,v);}")
   def open_build():
    page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character');page.locator('#build-character').select_option('skirk');expect(page.locator('#build-select')).to_have_value('equip-test')
   page.goto(base,wait_until='domcontentloaded');open_build();slot=page.locator('.build-artifact-piece').nth(3)
   # Open the inventory, choose the numeric set and equip the owned goblet.
   slot.locator('.build-import-slot>summary').click();slot.locator('.build-relic-set-menu>summary').click();slot.locator('[data-owned-set-choice]').click();choice=slot.locator('[data-owned-piece-choice]');expect(choice).to_have_count(1);expect(choice).to_contain_text('7,8');choice.click()
   page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:builds'))[0].pieces[3].ownedArtifactId==='owned-coupe'")
   expect(slot.locator('[data-piece-field=mainType]').first).to_have_value('cryoDmg');expect(slot.locator('[data-piece-field=mainValue]').first).to_have_value('46.6')
   stored=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:builds'))[0].pieces[3]");assert stored['sub0Value']==10.5 and stored['sub3Value']==23;assert '/equipment/' in stored['image']
   values=page.locator('.build-stat-grid b').all_text_contents();page.reload(wait_until='domcontentloaded');open_build();assert page.locator('.build-stat-grid b').all_text_contents()==values
   stored=page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:builds'))[0].pieces[3]");assert stored['mainType']=='cryoDmg';assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:owned-artifacts'))[0].substats[0].value")==10.5
   assert not errors,errors;browser.close();print('Artéfact possédé : sélection, principale/sous-stats, image correcte, calculs et persistance validés.',flush=True)
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
