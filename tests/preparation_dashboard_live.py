"""Live public-site checks; all player changes stay in a disposable browser profile."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
report={'origin':'https://astralis.wuaze.com','checks':{},'errors':[],'formats':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1536,'height':1050},service_workers='block',reduced_motion='reduce',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(60000);expect.set_options(timeout=60000);page.on('pageerror',lambda e:(report['errors'].append(str(e)),print('PAGE ERROR',e,flush=True)))
 page.add_init_script("localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}');localStorage.setItem('astralis:releases:last-seen','2026-11-27-profile-colors-1')")
 try:
  print('LIVE preparation: startup and published feed',flush=True);page.goto(report['origin']+'/',wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=120000);page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000)
  assert page.evaluate("async()=> (await fetch('/VERSION',{cache:'no-store'}).then(r=>r.text())).trim()")==(ROOT/'VERSION').read_text().strip()
  result=page.evaluate("""async()=>{const r=await fetch('/api/gi/endgame',{cache:'no-store'});return {status:r.status,data:await r.json()}}""");assert result['status']==200;assert result['data']['floors'] and result['data']['theater']['bosses'] and result['data']['onslaught']['bosses'];report['checks']['realPublishedFeed']={'floors':len(result['data']['floors']),'theaterBosses':len(result['data']['theater']['bosses']),'onslaughtBosses':len(result['data']['onslaught']['bosses']),'updatedAt':result['data']['updatedAt']}
  print('LIVE preparation: real player data in isolated profile',flush=True)
  fixture=page.evaluate("""async()=>{const {catalog}=await import('/src/data.js'),{installCombatExamples}=await import('/src/combat-examples.js'),{gameDay}=await import('/src/home-command-model.js');const [character,weapon,artifact,pack]=await Promise.all([catalog('gi','character'),catalog('gi','weapon'),catalog('gi','artifact'),fetch('/data/flins-examples.json').then(r=>r.json())]);const installed=installCombatExamples(localStorage,pack,{character,weapon,artifact}),flins=character.find(c=>String(c.id)==='10000120'||/flins/i.test(c._name));if(!flins)throw Error('Flins absent du catalogue');const date=gameDay();localStorage.setItem('astralis:character-themes:v1',JSON.stringify({['gi:'+flins._id]:{accent:'#6bc8ff',accent2:'#bf8aff'}}));localStorage.setItem('astralis:gi:farm-roster',JSON.stringify([{id:flins._id,active:true}]));localStorage.setItem('astralis:gi:farm-calendar',JSON.stringify([{id:'live-qa-farm',date,category:'talent',title:'Livres d’aptitudes · Flins',resin:40,characterId:flins._id,materialImage:'/assets/genshin/farm-materials/UI_ItemIcon_104306.png'}]));localStorage.setItem('astralis:gi:talent-targets',JSON.stringify({[flins._id]:{levelFrom:80,levelTo:90,from:[1,8,8],to:[1,10,10]}}));localStorage.setItem('astralis:gi:wish-plan',JSON.stringify({currentPrimos:0,wishes:2,welkin:true}));return {id:flins._id,installed}}""")
  page.reload(wait_until='domcontentloaded');page.wait_for_selector('.hc-dashboard');page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000);page.add_style_tag(content='.backup-reminder,#assistant-toast-stack,.release-notes-notice{display:none!important}')
  card=page.locator('[data-project]').filter(has=page.locator('[data-project-build]')).first;expect(card).to_be_visible();expect(card.locator('[data-project-preview]')).to_have_attribute('data-ready','true',timeout=120000);assert card.locator('[data-project-preview] img').evaluate('e=>e.naturalWidth')==2000
  palette=card.evaluate('e=>e._pngCanvas.sheetAudit.palette');assert palette['e1']=='#6bc8ff' and palette['secondary']=='#bf8aff';report['checks']['characterPaletteApplied']=palette
  with page.expect_download() as download:card.locator('[data-project-download]').click()
  png=Path(download.value.path()).read_bytes();assert png.startswith(b'\x89PNG\r\n\x1a\n');(ROOT/'docs/build-flins-live-vivid.png').write_bytes(png);report['checks']['realBuildPNG']=True
  expect(page.locator('.dd-boss-group')).not_to_have_count(0);report['checks']['renderedEndgameContent']=True
  page.locator('[data-ledger-claim-daily]').click();expect(page.locator('[data-ledger-primos]')).to_have_text('150');expect(page.locator('[data-top-resource=gi-primos] b')).to_have_text('150');page.locator('[data-ledger-claim-daily]').click();expect(page.locator('[data-ledger-primos]')).to_have_text('150');report['checks']['walletAndTopbar']=True
  page.locator('[data-home-farm=live-qa-farm]').click();expect(page.locator('[data-home-farm=live-qa-farm]')).to_have_attribute('aria-pressed','true');report['checks']['realFarmCompletion']=True
  assert page.locator('.side-rail .rail-nav svg').count()>20;assert page.locator('.side-rail .nav-game-icon').count()==0;report['checks']['originalSVGIcons']=True
  with page.expect_download() as download:page.locator('[data-preparation-export]').click()
  assert 'BEGIN:VCALENDAR' in Path(download.value.path()).read_text(encoding='utf-8');report['checks']['ICSexport']=True
  print('LIVE preparation: screen formats',flush=True)
  for width,height in [(1920,1080),(1536,1050),(1366,768),(1024,768),(768,1024),(844,390),(430,932),(390,844),(360,800),(320,740)]:
   page.set_viewport_size({'width':width,'height':height});page.evaluate('()=>{for(const e of document.querySelectorAll(".workspace,.main-content,.app-frame"))e.scrollTop=0;scrollTo(0,0)}');page.wait_for_timeout(150);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');expect(page.locator('.topbar-resources')).to_be_visible();b=page.locator('.topbar-resources').bounding_box();assert b['x']>=0 and b['x']+b['width']<=width+1;report['formats'].append([width,height]);
   if width in [1536,390]:page.screenshot(path=str(ROOT/f'docs/preparation-live-{width}.png'))
  privacy=page.evaluate("async()=>{const r=await fetch('/api/feedback/inbox');return r.status}");assert privacy==403;report['checks']['feedbackRemainsPrivate']=True
  assert not report['errors'],report['errors'];report['passed']=True;print('PASS live preparation',json.dumps(report,ensure_ascii=False),flush=True)
 except Exception as error:
  report['passed']=False;report['error']=str(error);page.screenshot(path=str(ROOT/'docs/preparation-live-failure.png'));raise
 finally:
  (ROOT/'releases/preparation-dashboard-live.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');browser.close()
