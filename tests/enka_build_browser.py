"""Synthetic Enka totals: UI, team and PNG model stay aligned, edits switch to game data."""
import json,threading,math
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block');page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    url=r.request.url
    if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.enkaTest={enkaBuildMetadata,hasEnkaReference,buildSheetModel,teamSheetModel,state,render};',content_type='application/javascript')
    elif url.startswith(base+'/api/'):r.fulfill(json={})
    elif url.startswith(base):r.continue_()
    elif 'lunaris' in url:r.fulfill(json={})
    else:r.abort()
   page.route('**/*',route);page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}');")
   page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character')
   page.evaluate("""()=>{
    const pieces=[['hpFlat',4780],['atkFlat',311],['atkPct',46.6],['cryoDmg',46.6],['critDmg',62.2]].map(([mainType,mainValue])=>({set:'15040',mainType,mainValue,level:20,rarity:5}));
    const b={id:'enka-proof',character:'skirk',name:'Fixture Enka - valeurs contrôlées',level:90,weapon:'11517',weaponLevelValue:90,weaponRefinement:1,constellation:'C0',pieces,set:'15040'};
    Object.assign(b,enkaTest.enkaBuildMetadata(b,{avatarId:10000114,fightPropMap:{1:12000,4:900,7:800,2:4780,3:.2,5:331,6:.646,8:0,9:0,20:.4,22:1.2,23:1.5,28:100,46:.616}}));
    localStorage.setItem('astralis:gi:builds',JSON.stringify([b]));localStorage.setItem('astralis:teams:gi',JSON.stringify([{id:'enka-team',name:'Enka test',members:[{character:'skirk',buildId:b.id,automaticBuffs:'off'},{},{},{}],rotation:[]}]));
    enkaTest.state.buildCharacter='skirk';enkaTest.state.buildId=b.id;enkaTest.render();
   }""")
   expect(page.locator('#build-select')).to_have_value('enka-proof')
   parse=lambda s:float(''.join(s.split()).replace(',','.').replace('%',''))
   expected=[19180,1812.4,800,100,150,40,120,61.6]
   values=[parse(s) for s in page.locator('.build-stat-grid b').all_text_contents()]
   assert len(values)==8 and all(abs(a-b)<1.1 for a,b in zip(values,expected)),(values,expected)
   def models():
    return page.evaluate("""()=>{const b=JSON.parse(localStorage.getItem('astralis:gi:builds'))[0],c=enkaTest.state.catalogs['gi:character'].find(c=>c._id==='skirk'),t=JSON.parse(localStorage.getItem('astralis:teams:gi'))[0];return{valid:enkaTest.hasEnkaReference(b),build:enkaTest.buildSheetModel(b,c).stats,team:enkaTest.teamSheetModel(t).members[0].stats};}""")
   expect(page.locator('.build-derived-stats header')).to_contain_text('Enka · configuration importée')
   assert 'undefined' not in page.locator('.build-derived-stats header').inner_text()
   initial=models();assert initial['valid'];assert abs(initial['build']['atk']-1812.4)<.001;assert initial['team']==initial['build'],initial
   # Choosing a real new weapon invalidates observed residual bonuses.
   next_weapon=page.evaluate("enkaTest.state.catalogs['gi:weapon'].find(w=>String(w.id)==='11501')._id")
   picker=page.locator('[data-build-picker="weapon:main"]');picker.locator('summary').click();choice=picker.locator('[data-picker-value="'+next_weapon+'"]');expect(choice).to_have_count(1);choice.click()
   page.wait_for_function("id=>JSON.parse(localStorage.getItem('astralis:gi:builds'))[0].weapon===id",arg=next_weapon)
   expect(page.locator('.build-derived-stats header')).to_contain_text('Données du jeu')
   changed=models();assert not changed['valid'];assert changed['build']['atk']!=1812.4;assert changed['team']==changed['build'],changed
   assert abs(parse(page.locator('.build-stat-grid b').nth(1).inner_text())-changed['build']['atk'])<1.1
   page.reload(wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached');page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character');page.locator('#build-character').select_option('skirk')
   expect(page.locator('#build-select')).to_have_value('enka-proof')
   expect(page.locator('[data-build-field=weapon]')).to_have_value(next_weapon);assert models()['valid'] is False
   assert abs(parse(page.locator('.build-stat-grid b').nth(1).inner_text())-changed['build']['atk'])<1.1
   page.locator('[data-nav=teams]').first.click();page.locator('[data-team-details-toggle]').click();assert abs(parse(page.locator('.team-stats-table tr').filter(has_text='ATQ').locator('td').inner_text())-changed['build']['atk'])<1.1
   assert not errors,errors;browser.close();print('Référence Enka, chiffres UI/équipe/modèles PNG, changement d’arme et persistance : OK',flush=True)
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
