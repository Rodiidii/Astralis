import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  p=await b.new_page(service_workers='block',viewport={'width':1366,'height':950});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  await p.goto('http://127.0.0.1:8766/health')
  await p.evaluate('''async()=>{
   document.body.innerHTML='<div data-genshin-idle></div>';document.body.style.cssText='margin:0;padding:20px;background:#10171c;color:#ddd';
   for(const url of ['/styles/express-worlds.css','/styles/express-clicker.css','/styles/express-clicker-modern.css','/styles/express-character-cinematics.css','/styles/express-adventure.css','/styles/express-expedition-redesign.css','/styles/character-identity.css']){const l=document.createElement('link');l.rel='stylesheet';l.href=url+'?v=20261124-expedition-3';document.head.append(l);}
   const crew={owned:['amber','kaeya','lisa','barbara'],active:'amber',levels:{}};localStorage.setItem('astralis:express-des-mondes:v1',JSON.stringify({version:1,world:'gi',place:'mondstadt',screen:'home',characters:crew,crewByWorld:{gi:crew},wallets:{mora:5000,credits:5000,shells:5000},tutorial:{done:true},lastAt:Date.now()}));
   const people=await fetch('/assets/data/gi-characters.json').then(r=>r.json());const app=await import('/src/express-worlds.js?v=20261124-expedition-3');app.mountTeyvatTycoon(document.querySelector('[data-genshin-idle]'),'gi',people);
  }''')
  await p.locator('.cx-object-render').evaluate('(i)=>i.decode()');await p.locator('[data-cx-stage]').screenshot(path='artifacts/regional-art-mondstadt.png')
  before=await p.locator('[data-rpg-enemy-hp]').inner_text();await p.locator('.cx-wish').click();after=await p.locator('[data-rpg-enemy-hp]').inner_text();assert before!=after
  await p.wait_for_timeout(400);idle=await p.locator('.cx-object-render').evaluate('i=>getComputedStyle(i).animationName');assert 'cx-render-breathe' in idle or 'cx-core-float' in idle,idle
  assets=await p.evaluate('''async()=>{const {REGIONAL_OBJECTS,regionalObject}=await import('/src/express-regional-objects.js?v=20261124-expedition-3');const result=[];for(const [place,object]of Object.entries(REGIONAL_OBJECTS)){const image=new Image();image.src=object.image;await image.decode();result.push({place,width:image.naturalWidth,height:image.naturalHeight,image:object.image});}return result;}''');assert len(assets)==18
  await p.locator('[data-place="gi:liyue"]').click();await p.locator('.cx-object-render').evaluate('(i)=>i.decode()');assert 'gi-geo.png' in await p.locator('.cx-object-render').get_attribute('src');await p.locator('[data-cx-stage]').screenshot(path='artifacts/regional-art-liyue.png')
  await p.set_viewport_size({'width':390,'height':844});await p.locator('[data-cx-stage]').scroll_into_view_if_needed();await p.screenshot(path='artifacts/regional-art-mobile.png');box=await p.locator('[data-clicker]').bounding_box();assert box['width']<=390
  stage=await p.locator('[data-cx-stage]').bounding_box();obj=await p.locator('.cx-object-render').bounding_box();assert obj['x']>=stage['x'] and obj['x']+obj['width']<=stage['x']+stage['width']
  await p.locator('[data-world=ww]').first.click();await p.wait_for_timeout(1200);await p.locator('.cx-object-render').evaluate('(i)=>i.decode()');await p.screenshot(path='artifacts/regional-art-wuwa.png',animations='disabled')
  await p.emulate_media(reduced_motion='reduce');motion=await p.locator('.cx-object-render').evaluate("i=>getComputedStyle(i).animationName");assert motion=='none',motion
  report={'decodedRegionalAssets':assets,'switchingUpdatesImage':True,'clickChangesEnemyHP':True,'mobileWithinStage':True,'reducedMotion':motion,'errors':errors};Path('artifacts/regional-art-verification.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True);assert not errors;await b.close()
asyncio.run(main())
