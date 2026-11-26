import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8894')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  context=await browser.new_context(service_workers='block',viewport={'width':1440,'height':1000})
  await context.add_init_script("""localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',shellLaunch:false,reducedMotion:true,backupReminder:false}));localStorage.setItem('astralis:favs',JSON.stringify({'gi:character:nahida':true}));const proto=window.AudioContext?.prototype;if(proto){const create=proto.createOscillator;proto.createOscillator=function(){window.__oscillators=(window.__oscillators||0)+1;return create.call(this)}}""")
  await context.route('**/api/hoyolab/status',lambda r:r.fulfill(json={'connected':False}))
  page=await context.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000);await page.locator('.shell-v2').wait_for()
  await page.locator('.side-rail [data-nav=planner]').click()
  await page.locator('[data-ps-action=new]').first.click();await page.locator('#workspace-dialog [name=title]').fill('Objectif à annuler');await page.locator('#workspace-dialog [type=submit]').click()
  await page.evaluate("async()=>{const s=await import('/src/store.js');s.saveTask('gi',{id:'external',title:'Créé ailleurs',done:false,priority:'Haute'});}")
  await page.locator('[data-ps-action=undo]').click()
  rows=await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")
  assert [r['id'] for r in rows]==['external'],rows
  await page.locator('.side-rail [data-nav=favorites]').click();await page.wait_for_function("document.querySelector('[data-fs-select=\"gi:character:nahida\"]')")
  await page.locator('[data-fs-select="gi:character:nahida"]').check();await page.locator('[data-fs-action=project]').click();await page.locator('#workspace-dialog [name=name]').fill('Projet à annuler');await page.locator('#workspace-dialog [type=submit]').click()
  await page.evaluate("""async()=>{const s=await import('/src/store.js');s.saveTask('gi',{id:'external-2',title:'Encore une modification externe',done:false});const c=JSON.parse(localStorage.getItem('astralis:planning-studio:v1'));c.projects.push({id:'external-project',name:'Projet créé ailleurs',game:'gi'});localStorage.setItem('astralis:planning-studio:v1',JSON.stringify(c));}""")
  await page.locator('[data-fs-action=undo]').click()
  rows=await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")
  assert set(r['id'] for r in rows)=={'external','external-2'},rows
  projects=await page.evaluate("JSON.parse(localStorage.getItem('astralis:planning-studio:v1')).projects")
  assert [p['id'] for p in projects]==['external-project'],projects
  await page.locator('.side-rail [data-nav=customize]').click();await page.locator('[data-settings-tab=appearance]').click();await page.locator('[data-ts-character]').select_option('nahida')
  await page.locator('[data-ts-field=ambientTone]').evaluate("n=>{n.closest('details').open=true}")
  await page.locator('[data-ts-field=ambientTone]').evaluate("n=>{n.value='silence';n.dispatchEvent(new Event('input',{bubbles:true}))}");await page.wait_for_timeout(300)
  await page.evaluate('window.__oscillators=0')
  await page.locator('[data-ts-field=ambientTone]').evaluate("n=>{n.value='identity';n.dispatchEvent(new Event('input',{bubbles:true}))}")
  await page.wait_for_function('window.__oscillators>=3')
  await page.wait_for_function("document.querySelector('.topbar-ambience').getAttribute('aria-pressed')==='true'")
  await page.locator('[data-ts-field=audioEnabled]').evaluate("n=>{n.checked=false;n.dispatchEvent(new Event('input',{bubbles:true}))}")
  await page.wait_for_function("document.querySelector('.topbar-ambience').getAttribute('aria-pressed')==='false'")
  for section in ['planner','favorites','customize']:
   await page.set_viewport_size({'width':1440,'height':1000});await page.locator('.side-rail [data-nav='+section+']').click()
   if section=='customize':await page.locator('[data-settings-tab=appearance]').click()
   await page.set_viewport_size({'width':390,'height':844})
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert await page.locator('#theme-signature-companion').evaluate('n=>n.getBoundingClientRect().bottom<=innerHeight-80')
   await page.evaluate("document.querySelector('.workspace').scrollTo(0,0)")
   await page.screenshot(path='artifacts/studio-final-'+section+'-mobile.png')
  report={'plannerUndoPreservesLaterTasks':True,'favoritesProjectUndoPreservesLaterTasksAndProjects':True,'silenceToCharacterAmbienceRestartsAudio':True,'audioOffStopsPlayback':True,'finalMobileLayouts':True,'companionClearsBottomNavigation':True,'errors':errors}
  Path('artifacts/studios-undo-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);assert not errors
  await browser.close()
asyncio.run(main())
