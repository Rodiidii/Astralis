import os
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
  page=await browser.new_page(service_workers='block',viewport={'width':1366,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8766')+'/health')
  await page.evaluate('''async()=>{
   document.body.innerHTML='<div data-genshin-idle></div>';document.body.style.cssText='margin:0;padding:20px;background:#10171c;color:#ddd';
   for(const url of ['/styles/express-worlds.css','/styles/express-clicker.css','/styles/express-clicker-modern.css','/styles/express-character-cinematics.css','/styles/express-adventure.css','/styles/express-expedition-redesign.css','/styles/character-identity.css']){const l=document.createElement('link');l.rel='stylesheet';l.href=url+'?v=20261124-expedition-3';document.head.append(l);}
   const crew={owned:['amber','kaeya','lisa','barbara','ronova','istaroth'],active:'amber',levels:{amber:4}};
   localStorage.setItem('astralis:express-des-mondes:v1',JSON.stringify({version:1,world:'gi',place:'mondstadt',screen:'home',xp:9999,characters:crew,crewByWorld:{gi:crew},wallets:{mora:1000000,credits:1000000,shells:1000000},tutorial:{done:true},clicker:{energy:{'gi:ronova':240,'gi:istaroth':240}},lastAt:Date.now()}));
   window.people=await fetch('/assets/data/gi-characters.json').then(r=>r.json());window.app=await import('/src/express-worlds.js?v=20261124-expedition-3');app.mountTeyvatTycoon(document.querySelector('[data-genshin-idle]'),'gi',people);await import('/src/express-ultimate-player.js?v=20261124-expedition-3').then(m=>m.preloadUltimateMedia());
  }''')
  await page.locator('.cx-object-render').evaluate('i=>i.decode()');assert 'gi-anemo.png' in await page.locator('.cx-object-render').get_attribute('src')
  directions=[]
  for _ in range(8):
   await page.locator('.cx-wish').click(force=True);directions.append(await page.locator('.is-normal-attack').last.get_attribute('data-attack-direction'))
  assert len(set(directions))==8,directions
  await page.locator('.cx-loot-choice').wait_for();lootText=await page.locator('.cx-loot-choice').inner_text();assert 'ACTUEL' in lootText and 'NOUVEAU' in lootText
  await page.locator('[data-rpg-loot-equip]').click();await page.locator('[data-rpg-tab=build]').click();before=await page.locator('.cx-build-summary').inner_text();await page.locator('[data-rpg-train=amber][data-count="1"]').click();after=await page.locator('.cx-build-summary').inner_text();assert before!=after;assert await page.locator('.cx-learned-passives .is-learned').count()>=1
  await page.locator('[data-rpg-workbench]').screenshot(path='artifacts/rpg-growth-and-passives.png',animations='disabled')
  await page.locator('[data-rpg-tab=camp]').click();assert await page.locator('[data-rpg-research]').count()==10;await page.locator('[data-rpg-research=might]').click();assert 'RANG 1 / 300' in await page.locator('.cx-research-grid').inner_text()
  await page.locator('[data-cx-power=skill]').click();assert await page.locator('.cx-skill-spectacle').count()==1;assert await page.locator('.cx-skill-ray').count()==12
  await page.wait_for_timeout(350);await page.locator('[data-cx-stage]').screenshot(path='artifacts/rpg-skill-spectacle.png',animations='allow')
  await page.locator('[data-cx-team-edit]').click();await page.locator('[data-cx-team-slot="0"]').select_option('ronova');await page.locator('[data-cx-team-active=ronova]').click()
  await page.locator('[data-cx-team-burst=ronova]').click();film=await page.evaluate('''async()=>{for(let n=0;n<160;n++){const v=document.querySelector('.cx-ultimate-fullframe video');if(v&&v.currentTime>.08){v.pause();return {src:v.src,seconds:v.duration,controls:v.controls,tag:document.querySelector('.cx-ultimate-title small').textContent};}await new Promise(r=>setTimeout(r,30));}return null;}''');assert film and 'lore-ronova' in film['src'] and film['seconds']<=5.1 and not film['controls'],film
  await page.locator('.cx-ultimate-skip').click();await page.wait_for_selector('[data-aftermath=death]');assert await page.locator('.cx-aftermath-mote').count()==14;await page.wait_for_timeout(500)
  await page.locator('[data-cx-stage]').screenshot(path='artifacts/rpg-ronova-eclipse.png',animations='allow')
  await page.locator('.cx-wish').click(force=True);assert await page.locator('[data-aftermath=death]').count()==1
  await page.locator('[data-rpg-tab=build]').click();await page.wait_for_selector('[data-aftermath=death]');assert await page.locator('[data-rpg-atmosphere-label]').inner_text()
  await page.locator('[data-rpg-clear-atmosphere]').click();assert await page.locator('[data-aftermath]').count()==0
  if not await page.locator('[data-cx-team-slot="0"]').count():await page.locator('[data-cx-team-edit]').click()
  await page.locator('[data-cx-team-slot="0"]').select_option('istaroth');await page.locator('[data-cx-team-burst=istaroth]').click();await page.locator('.cx-ultimate-skip').click();await page.wait_for_selector('[data-aftermath=time]')
  await page.emulate_media(reduced_motion='reduce');await page.wait_for_timeout(1100);assert await page.locator('.cx-aftermath.is-quiet').count()==1;assert await page.locator('.cx-aftermath-mote').count()==0
  await page.set_viewport_size({'width':390,'height':844});await page.locator('[data-cx-stage]').scroll_into_view_if_needed();await page.screenshot(path='artifacts/rpg-core-and-dialogue-mobile.png');box=await page.locator('[data-clicker]').bounding_box();assert box['width']<=390;assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  allProfiles=await page.evaluate('''async()=>{const {CHARACTER_SCENES}=await import('/src/express-character-scenes.js?v=20261124-expedition-3');const {aftermathProfile}=await import('/src/express-battle-vfx.js?v=20261124-expedition-3');return Object.keys(CHARACTER_SCENES).map(id=>{const [world,pid]=id.split(':');return aftermathProfile({id:pid,name:id},pid,world);});}''');assert len(allProfiles)==300 and all(p['seconds']<=18 for p in allProfiles)
  report={'eightAttackDirections':directions,'automaticLootComparison':True,'trainingChangesStats':True,'learnedPassives':True,'tenResearchBranches':True,'skillRays':12,'ronovaShortMovie':film,'postUltimateEclipse':True,'aftermathSurvivesRender':True,'timeDomain':True,'dismissibleAtmosphere':True,'reducedMotion':True,'mobileWidth':box['width'],'allCharacterAtmospheres':len(allProfiles),'errors':errors}
  Path('artifacts/rpg-expansion-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True);assert not errors;await browser.close()
asyncio.run(main())
