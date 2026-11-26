import os
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
  page=await browser.new_page(service_workers='block',viewport={'width':1366,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8766')+'/health');await page.evaluate('''async()=>{
   document.body.innerHTML='<div data-genshin-idle></div>';document.body.style.cssText='margin:0;padding:20px;background:#10171c;color:#ddd';for(const file of ['express-worlds','express-clicker','express-clicker-modern','express-character-cinematics','express-adventure','express-expedition-redesign','character-identity']){const link=document.createElement('link');link.rel='stylesheet';link.href='/styles/'+file+'.css?v=20261124-expedition-3';document.head.append(link);}
   const crew={owned:['amber','barbara','zhongli','furina','neuvillette','istaroth'],active:'amber',levels:{}},s={version:1,world:'gi',place:'mondstadt',screen:'home',xp:100,characters:crew,crewByWorld:{gi:crew},wallets:{mora:5000,credits:5000,shells:5000},tutorial:{done:true},clicker:{teams:{gi:['amber','barbara','zhongli','furina']},energy:{'gi:furina':1000,'gi:istaroth':1000}},lastAt:Date.now()};
   const engine=await import('/src/express-adventure-engine.js?v=20261124-expedition-3');const z=engine.adventure(s);z.hp=100000;z.maxHp=100000;localStorage.setItem('astralis:express-des-mondes:v1',JSON.stringify(s));const people=await fetch('/assets/data/gi-characters.json').then(r=>r.json());const app=await import('/src/express-worlds.js?v=20261124-expedition-3');app.mountTeyvatTycoon(document.querySelector('[data-genshin-idle]'),'gi',people);
  }''');await page.locator('.cx-deep-kit').wait_for()
  await page.locator('.cx-kit-manual summary').click();assert await page.locator('.cx-kit-manual-grid>article').count()==6
  before=await page.locator('[data-kit-resource]').inner_text()
  for _ in range(4):await page.locator('.cx-wish').click(force=True)
  after=await page.locator('[data-kit-resource]').inner_text();assert before!=after;assert await page.locator('[data-kit-proc=finisher]').count()>0
  await page.locator('[data-cx-power=skill]').click();assert await page.locator('[data-entity-owner=amber][data-entity-type=summon]').count()==1
  await page.locator('[data-cx-power=charged]').click();assert await page.locator('[data-kit-proc=charged]').count()>0;assert await page.locator('[data-entity-owner=amber][data-entity-type=summon]').count()==0
  await page.locator('[data-cx-team-active=zhongli]').click();await page.locator('[data-cx-power=skill]').click();assert await page.locator('.entity-pillar').count()==1;assert await page.locator('.entity-shield').count()>=1
  for _ in range(3):await page.locator('.cx-wish').click(force=True)
  await page.locator('[data-cx-power=charged]').click();assert await page.locator('.entity-riposte').count()>=1
  await page.locator('[data-cx-stage]').screenshot(path='artifacts/kit-zhongli-pillar-and-guard.png',animations='allow')
  await page.locator('[data-cx-team-active=furina]').click();await page.locator('[data-cx-power=skill]').click();assert await page.locator('[data-entity-owner=furina][data-entity-type=summon]').count()==3
  await page.locator('.cx-kit-manual summary').click();await page.locator('[data-deep-kit]').screenshot(path='artifacts/kit-furina-manual.png',animations='disabled');await page.locator('[data-cx-stage]').screenshot(path='artifacts/kit-furina-three-guests.png',animations='allow')
  for _ in range(4):await page.locator('.cx-wish').click(force=True)
  await page.locator('[data-cx-power=charged]').click();assert await page.locator('[data-kit-proc=summon]').count()>0
  await page.locator('[data-cx-team-edit]').click();await page.locator('[data-cx-team-slot="3"]').select_option('neuvillette');await page.locator('[data-cx-team-active=neuvillette]').click()
  for _ in range(3):await page.locator('.cx-wish').click(force=True)
  hpBefore=await page.locator('[data-rpg-enemy-hp]').inner_text();await page.keyboard.press('r');assert await page.locator('[data-kit-proc=beam]').count()>0;assert await page.locator('.cx-proc-laser').count()>0;await page.locator('[data-cx-stage]').screenshot(path='artifacts/kit-neuvillette-beam.png',animations='allow')
  await page.wait_for_timeout(2100);hpAfter=await page.locator('[data-rpg-enemy-hp]').inner_text();assert hpBefore!=hpAfter
  resource=await page.locator('[data-kit-resource]').inner_text();await page.locator('[data-cx-search]').focus();await page.keyboard.press('r');assert await page.locator('[data-kit-resource]').inner_text()==resource;await page.locator('[data-cx-search]').fill('')
  await page.emulate_media(reduced_motion='reduce');await page.locator('[data-cx-team-active=barbara]').click()
  for _ in range(4):await page.locator('.cx-wish').click(force=True)
  await page.locator('[data-cx-power=charged]').click();assert await page.locator('.cx-kit-proc.is-quiet').count()>0;assert await page.locator('.cx-kit-proc.is-quiet .cx-proc-actor').count()==0
  await page.set_viewport_size({'width':390,'height':844});await page.locator('[data-deep-kit]').scroll_into_view_if_needed();await page.screenshot(path='artifacts/kit-mobile-panel.png');assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  report={'sixActionDescriptions':True,'resourceFillsOnNormals':True,'cycleFinisherVisible':True,'chargedButtonAndKeyboard':True,'amberRabbitExplodes':True,'persistentPillar':True,'riposteArmed':True,'threeSalonGuestsVisible':True,'realBeamDamage':True,'typingRDoesNotAttack':True,'reducedMotion':True,'mobileNoOverflow':True,'errors':errors};Path('artifacts/kit-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True);assert not errors;await browser.close()
asyncio.run(main())
