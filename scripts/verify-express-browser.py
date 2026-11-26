import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
  ctx=await b.new_context(service_workers='block',viewport={'width':1366,'height':1050});p=await ctx.new_page();errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' and '<path>' in m.text else None)
  await p.goto('http://127.0.0.1:8766/health')
  await p.evaluate('''async()=>{
   document.body.innerHTML='<div data-genshin-idle></div>';document.body.style.cssText='margin:0;padding:20px;background:#10171c;color:#ddd';
   for(const url of ['/styles/express-worlds.css','/styles/express-clicker.css','/styles/express-clicker-modern.css','/styles/express-character-cinematics.css','/styles/express-adventure.css','/styles/express-expedition-redesign.css','/styles/character-identity.css']){const l=document.createElement('link');l.rel='stylesheet';l.href=url;document.head.append(l);}
   const gi={owned:['amber','kaeya','lisa','barbara','ronova','zhongli'],active:'amber',levels:{}},hsr={owned:['phainon','march7th','danheng','himeko','asta'],active:'phainon',levels:{}},ww={owned:['yangyang','chixia','baizhi','rover'],active:'yangyang',levels:{}};
   localStorage.setItem('astralis:express-des-mondes:v1',JSON.stringify({version:1,world:'gi',place:'mondstadt',screen:'home',characters:gi,crewByWorld:{gi,hsr,ww},wallets:{mora:5000,credits:5000,shells:5000},tutorial:{done:true},clicker:{energy:{'gi:amber':240,'gi:kaeya':200,'gi:lisa':200,'gi:barbara':200,'gi:ronova':240,'hsr:phainon':300}},lastAt:Date.now()}));
   window.rpgPeople=await fetch('/assets/data/gi-characters.json').then(r=>r.json());window.rpgModule=await import('/src/express-worlds.js?v=20261124-rpg-3');rpgModule.mountTeyvatTycoon(document.querySelector('[data-genshin-idle]'),'gi',rpgPeople);
   const {preloadUltimateMedia}=await import('/src/express-ultimate-player.js?v=20261124-rpg-3');await preloadUltimateMedia();
  }''')
  proof=await p.evaluate('''async()=>{
   globalThis.__rpgMediaTrace=[];document.querySelector('[data-cx-team-burst="amber"]').click();
   for(let i=0;i<240;i++){const v=document.querySelector('.cx-ultimate-fullframe video');if(v&&v.currentTime>.08){v.pause();const root=v.closest('.cx-ultimate-fullframe').getBoundingClientRect(),box=document.querySelector('[data-cx-stage]').getBoundingClientRect();return {played:v.currentTime,controls:v.controls,muted:v.muted,frameWidth:root.width,stageWidth:box.width};}await new Promise(r=>setTimeout(r,40));}return {error:'missing clip',trace:globalThis.__rpgMediaTrace};
  }''');print('Film',proof,flush=True);assert proof.get('played',0)>0,proof
  assert not proof['controls'] and abs(proof['stageWidth']-proof['frameWidth'])<3
  await p.locator('[data-cx-stage]').screenshot(path='artifacts/rpg-fullframe-final.png')
  await p.evaluate("document.querySelector('.cx-ultimate-skip')?.click()")
  for _ in range(10):await p.locator('.cx-wish').click()
  await p.locator('[data-rpg-tab=build]').click();before=await p.locator('.cx-build-summary').inner_text();await p.locator('[data-rpg-equip]').first.click();after=await p.locator('.cx-build-summary').inner_text();assert before!=after
  await p.locator('[data-rpg-workbench]').screenshot(path='artifacts/rpg-build-final.png')
  await p.locator('[data-cx-power=skill]').click();await p.locator('[data-cx-team-active=kaeya]').click();await p.locator('[data-cx-team-burst=kaeya]').click();await p.evaluate("document.querySelector('.cx-ultimate-skip')?.click()")
  combo=await p.locator('[data-rpg-combo]').inner_text();assert combo=='Relais parfait',combo
  await p.locator('[data-cx-team-edit]').click();await p.locator('[data-cx-team-slot="0"]').select_option('ronova')
  lore=await p.evaluate("(()=>{document.querySelector('[data-cx-team-burst=ronova]').click();const r=document.querySelector('.cx-ultimate-fullframe');return {scene:r?.querySelector('.cx-character-scene')?.dataset.characterScene,iframes:r?.querySelectorAll('iframe').length,controls:r?.querySelectorAll('video[controls]').length}})()")
  assert lore['scene']=='gi:ronova' and lore['iframes']==0 and lore['controls']==0,lore
  await p.evaluate("document.querySelector('.cx-ultimate-skip')?.click()")
  # Save/restoration through the module's production mount/load path.
  await p.evaluate("rpgModule.mountTeyvatTycoon(document.querySelector('[data-genshin-idle]'),'gi',rpgPeople)")
  await p.locator('[data-rpg-build-target-picker]').select_option('amber');assert await p.locator('.cx-equipped-grid button').count()>=1
  await p.locator('[data-world=ww]').first.click();await p.wait_for_timeout(1000)
  await p.wait_for_function("[...document.querySelectorAll('.cx-squad .exw-portrait')].length===4&&[...document.querySelectorAll('.cx-squad .exw-portrait')].every(i=>i.complete&&i.naturalWidth>0)")
  icons=await p.locator('.cx-squad .exw-portrait').evaluate_all('ns=>ns.map(i=>i.src)');object=await p.locator('[data-regional-object]').get_attribute('data-regional-object');assert object=='bell'
  await p.locator('[data-cx-stage]').screenshot(path='artifacts/rpg-wuwa-final.png')
  await p.locator('[data-world=hsr]').first.click();await p.wait_for_timeout(1000)
  await p.locator('[data-cx-team-burst=phainon]').click();await p.locator('.cx-ultimate-fullframe audio').wait_for(state='attached');await p.evaluate("document.querySelector('.cx-ultimate-skip')?.click()")
  await p.locator('[data-world=gi]').first.click();await p.locator('[data-place="gi:liyue"]').click();assert await p.locator('[data-regional-object]').get_attribute('data-regional-object')=='lantern'
  await p.locator('[data-place="gi:mondstadt"]').click();await p.set_viewport_size({'width':390,'height':844});await p.locator('[data-cx-stage]').scroll_into_view_if_needed();await p.screenshot(path='artifacts/rpg-mobile-final.png');box=await p.locator('[data-clicker]').bounding_box();print('MobileBox',box,await p.evaluate("({body:document.body.clientWidth,scroll:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('[data-clicker] *')].filter(n=>n.getBoundingClientRect().width>390).slice(0,8).map(n=>({c:n.className,w:n.getBoundingClientRect().width}))})"),flush=True);assert box['width']<=390
  # Decode every locally stored regional illustration.
  shapes=await p.evaluate('''async()=>{const {REGIONAL_OBJECTS,regionalObject}=await import('/src/express-regional-objects.js?v=20261124-rpg-3');let count=0;const host=document.createElement('div');document.body.append(host);for(const [place]of Object.entries(REGIONAL_OBJECTS)){host.innerHTML=regionalObject({place,world:'gi'}).html;await host.querySelector('img').decode();if(host.querySelector('img').naturalWidth<128)throw Error(place);count++;}host.remove();return count;}''')
  ultimateAudit=await p.evaluate('''async()=>{const {CHARACTER_SCENES}=await import('/src/express-character-scenes.js?v=20261124-rpg-3');const {playUltimateMedia,stopUltimateMedia}=await import('/src/express-ultimate-player.js?v=20261124-rpg-3');const stage=document.querySelector('[data-cx-stage]');const errors=[];for(const [id,scene]of Object.entries(CHARACTER_SCENES)){const [world,pid]=id.split(':');playUltimateMedia(stage,{id:pid,name:scene.title},pid,world,{muted:true});const root=stage.querySelector('.cx-ultimate-fullframe');if(!root||root.querySelectorAll('.cx-scene-actor svg').length!==3||root.querySelectorAll('iframe').length)errors.push(id);}stopUltimateMedia();return {count:Object.keys(CHARACTER_SCENES).length,errors};}''')
  assert not ultimateAudit['errors'],ultimateAudit
  report={'fullFrameVideo':proof,'allUltimateScenes':ultimateAudit,'buildBefore':before,'buildAfter':after,'combo':combo,'lore':lore,'wwLocalIcons':icons,'persistentBuild':True,'regionalObjectsRendered':shapes,'mobileWidth':box['width'],'errors':errors};Path('artifacts/rpg-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print('PASS',json.dumps({k:v for k,v in report.items() if k not in ['buildBefore','buildAfter','wwLocalIcons']}),flush=True);assert not errors
  await b.close()
asyncio.run(main())
