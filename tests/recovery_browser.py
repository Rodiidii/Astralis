"""Regression against the user's rejected layouts, real assets and numeric IDs."""
import json,subprocess,threading,sys,re
from functools import partial
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}'
 captures=ROOT/'docs/captures/recovery';captures.mkdir(parents=True,exist_ok=True)
 sources={path:subprocess.check_output(['git','show','8f636c1:'+path],cwd=ROOT) for path in ['index.html','src/app.js','src/planning-controls.js']}
 pieces=[dict(set='15040',mainType=k,mainValue=v,level=20,rarity=5) for k,v in [('hpFlat',4780),('atkFlat',311),('atkPct',46.6),('cryoDmg',46.6),('critDmg',62.2)]]
 build=dict(id='numeric-build',character='10000114',name='Identifiants numériques',level=90,constellation='C0',weapon='11517',weaponLevelValue=90,weaponRefinement=1,pieces=pieces,set='15040')
 with sync_playwright() as p:
  browser=p.chromium.launch()
  try:
   for mode in (['after'] if '--after-only' in sys.argv else ['before','after']):
    context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block')
    page=context.new_page();page.set_default_timeout(60000);page.set_default_navigation_timeout(120000)
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    def route(r):
     url=r.request.url;path=urlsplit(url).path.lstrip('/')
     if mode=='before' and url.startswith(base) and (path or 'index.html') in sources:
      key=path or 'index.html';r.fulfill(body=sources[key],content_type='text/html' if key.endswith('html') else 'text/javascript')
     elif url.startswith(base+'/api/'):r.fulfill(json={})
     elif url.startswith(base):r.continue_()
     elif 'lunaris' in url:r.fulfill(json={})
     elif any(word in path.lower() for word in ['splash','gacha','avatarimg']):r.fulfill(path=str(ROOT/'assets/genshin/splashes/alhaitham.png'))
     elif '/ui/' in path.lower():r.fulfill(path=str(ROOT/'assets/ui/game-genshin.png'))
     else:r.abort()
    page.route('**/*',route)
    seed={'astralis:active-game':'gi','astralis:gi:lab-demo-complex-v2':'1','astralis:gi:assistant-profile':json.dumps({'enabled':False}),
      'astralis:teams:gi':json.dumps([{'id':'recovery-team','name':'Équipe de contrôle','members':[{'character':'skirk','buildId':'numeric-build','automaticBuffs':'off','buffs':[{'type':'atk','value':20,'scope':'active'}]},{},{},{}],'rotation':[{'character':'skirk','code':'E','name':'Ravage · E'},{'character':'skirk','code':'Q','name':'Ravage · Q'}]}]),'astralis:gi:builds':json.dumps([{**build,'character':'skirk'} if mode=='before' else build]),'astralis:gi:farm-roster':json.dumps([{'id':'skirk','active':True},{'id':'furina','active':True}])}
    page.add_init_script('for(const [k,v]of Object.entries('+json.dumps(seed)+'))localStorage.setItem(k,v)')
    page.goto(base,wait_until='domcontentloaded');page.wait_for_selector('#astralis-launch-screen',state='detached')
    page.locator('[data-nav=builds]').first.click();page.wait_for_selector('#build-character');page.locator('#build-character').select_option('skirk')
    if mode=='after':
     expect(page.locator('#build-select')).to_have_value('numeric-build')
     page.wait_for_function("document.querySelector('.build-stat-grid b')?.textContent!=='—'")
     values=page.locator('.build-stat-grid b').all_text_contents()
     source=json.loads((ROOT/'data/lab-source-snapshot.json').read_text(encoding='utf-8'))
     c=source['characters']['10000114'];weapon=source['weapons']['11517']
     atk=c['curves'][1]['base']*source['curves'][c['curves'][1]['curve']][90]+c['ascensionBonus']['atk'][6]
     atk+=weapon['mainStat']['base']*source['weaponCurves'][weapon['mainStat']['curve']][90]+weapon['ascensionBonus']['atk'][6]
     expected=atk*1.466+311
     actual=float(''.join(values[1].split()).replace(',','.'))
     assert abs(actual-expected)<1.1,(actual,expected,values)
     boxes=page.locator('.build-artifact-piece').evaluate_all('rows=>rows.map(r=>{const b=r.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})')
     assert len(boxes)==5 and all(abs(b['x']-boxes[0]['x'])<2 for b in boxes),boxes
     assert all(boxes[i+1]['y']>=boxes[i]['y']+boxes[i]['h'] for i in range(4)),boxes
     assert all(b['w']>700 and b['h']<470 for b in boxes),boxes
    page.locator('.build-artifact-grid').scroll_into_view_if_needed()
    page.screenshot(path=str(captures/(mode+'-build.png')),full_page=True)
    page.locator('[data-nav=farming]').first.click();page.wait_for_selector('.farm-projection-options button')
    page.locator('.farm-projections').scroll_into_view_if_needed()
    page.screenshot(path=str(captures/(mode+'-farm.png')),full_page=True)
    if mode=='after':
     portraits=page.locator('farm-forecasts img,farm-talent-targets img')
     portraits.evaluate_all('nodes=>nodes.forEach(n=>n.loading="eager")')
     page.wait_for_function("[...document.querySelectorAll('farm-forecasts img,farm-talent-targets img')].every(i=>i.complete&&i.naturalWidth>0&&!i.src.includes('placeholder'))")
     assert page.locator('.farm-scenario-number').all_text_contents()==['0','1','2','3','4']
     expect(page.locator('.farm-resource-card')).to_have_count(2)
     parse=lambda text:float(''.join(text.split()).replace(',','.'))
     xp_before=parse(page.locator('.farm-resource-total strong').first.inner_text())
     page.locator('[data-farm-xp=purple]').fill('100');page.locator('[data-farm-xp=purple]').press('Tab')
     expect(page.locator('[data-farm-xp=purple]')).to_have_value('100')
     assert parse(page.locator('.farm-resource-total strong').first.inner_text())==xp_before-2000000
     mora_before=parse(page.locator('.farm-resource-card.mora .farm-resource-total strong').inner_text())
     field=page.locator('.farm-resource-card.mora [data-farm-inventory]');field.fill('10000');field.press('Tab')
     assert parse(page.locator('.farm-resource-card.mora .farm-resource-total strong').inner_text())==max(0,mora_before-10000)

     expected_first=page.locator('[data-farm-rank="1"]').get_attribute('data-farm-person')
     page.locator('[data-farm-rank="0"]').drag_to(page.locator('[data-farm-rank="1"]'))
     page.wait_for_function("id=>JSON.parse(localStorage.getItem('astralis:gi:farm-priority')||'[]')[0]===id",arg=expected_first)
     page.set_viewport_size({'width':390,'height':844})
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     page.screenshot(path=str(captures/'after-farm-mobile.png'),full_page=True)
    if mode=='after':
     page.set_viewport_size({'width':1440,'height':1000});page.locator('[data-nav=characters]').first.click();page.wait_for_selector('#catalog-search');page.locator('#catalog-search').fill('Skirk');page.locator('.character-catalog-card').filter(has_text='Skirk').first.click()
     expect(page.locator('.gi-character-detail')).to_be_visible()
     expect(page.locator('.gi-character-detail .detail-art-main')).to_have_css('filter',re.compile(r'brightness\(0\.72\)'))
     page.screenshot(path=str(captures/'after-character.png'),full_page=True)
     page.keyboard.press('Escape')
     page.locator('[data-nav=teams]').first.click();page.locator('[data-team-details-toggle]').click()
     expect(page.locator('.team-active-stats')).to_be_visible()
     team_atk=float(''.join(page.locator('.team-stats-table tr').filter(has_text='ATQ').locator('td').inner_text().split()).replace(',','.'))
     assert abs(team_atk-(expected+atk*.2))<1.1,(team_atk,expected,atk)
     icons=page.locator('.rotation-line .rotation-skill-image');expect(icons).to_have_count(2)
     assert icons.nth(0).get_attribute('src').endswith('Skill_S_SkirkNew_01.png')
     assert icons.nth(1).get_attribute('src').endswith('Skill_E_SkirkNew_01.png')
     page.wait_for_function("[...document.querySelectorAll('.rotation-line .rotation-skill-image')].every(i=>i.complete&&i.naturalWidth)")
     page.locator('.team-active-stats').scroll_into_view_if_needed();page.screenshot(path=str(captures/'after-team-stats.png'),full_page=True)
    assert not errors,errors
    context.close()
   # Real action images must be preserved in the mounted export, not replaced by generic SVGs.
   page=browser.new_page();page.goto(base+'/tests/sheets-harness.html');page.wait_for_function('window.ready')
   result=page.evaluate('''async()=>{
    const {mountSheet}=await import('/src/sheet-renderer.js');const d=sheetData('cryo','complete');
    d.rotation=d.rotation.map(a=>({...a,image:'/assets/genshin/skills/Skill_E_SkirkNew_01.png'}));
    const sheet=await mountSheet('team',d);const images=sheet.root.querySelectorAll('img.sheet-rotation-skill');
    const result={count:images.length,broken:[...images].filter(i=>!i.complete||!i.naturalWidth).length};sheet.dispose();return result;
   }''')
   assert result=={'count':8,'broken':0},result
   page.evaluate("""async()=>{const {renderSheet}=await import('/src/sheet-renderer.js');const d=sheetData('cryo','complete');d.rotation=d.rotation.map(a=>({...a,image:'/assets/genshin/skills/Skill_E_SkirkNew_01.png'}));const canvas=await renderSheet('team',d,{pixelRatio:2});window.recoveryCanvas=canvas;}""")
   with page.expect_download() as download:
    page.evaluate("""async()=>{const blob=await new Promise(r=>recoveryCanvas.toBlob(r,'image/png'));const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='team-after.png';a.click();}""")
   download.value.save_as(str(captures/'team-after.png'))
   assert (captures/'team-after.png').read_bytes()[:8]==b'\x89PNG\r\n\x1a\n'
   print('P0 recovery: artifact rows, numeric build stats, farm portraits/design/drag/mobile and real rotation images verified.',flush=True)
  finally:browser.close();server.shutdown();server.server_close()

if __name__=='__main__':main()
