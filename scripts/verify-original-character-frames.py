import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8893')
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  ctx=await b.new_context(viewport={'width':1440,'height':1050},service_workers='block')
  await ctx.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',characterThemeMode:'off',reducedMotion:true,shellLaunch:false,backupReminder:false}));")
  await ctx.route('**/api/hoyolab/status',lambda r:r.fulfill(json={'connected':False}))
  page=await ctx.new_page();page.set_default_timeout(25000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000);await page.locator('.shell-v2').wait_for(timeout=30000)
  sizes=[1440,1024,768,390];games={}
  for game in ['gi','hsr','ww']:
   await page.set_viewport_size({'width':1440,'height':1050})
   if game!='gi':await page.locator('.side-rail [data-game='+game+']').click()
   await page.locator('.side-rail button[data-nav=characters]').click();await page.locator('.library-original-frame').first.wait_for(timeout=45000)
   assert await page.locator('.library-card').count()==await page.locator('.library-original-frame').count()
   assert await page.locator('.library-original-frame .unit-cinematic').count()>0
   sources=await page.evaluate('''async()=>{const data=await import('/src/data.js?v=87');const game=document.querySelector('.app-frame').dataset.activeGame,rows=await data.catalog(game,'character');return [...document.querySelectorAll('.library-original-frame')].slice(0,3).map(node=>{const item=rows.find(x=>x._id===node.dataset.libraryId);return {id:node.dataset.libraryId,src:node.querySelector('.unit-portrait').getAttribute('src'),original:data.splashImageCandidates(game,item)[0]}})}''')
   assert all(s['src']==s['original'] for s in sources),sources
   games[game]=sources
   await page.locator('#assistant-toast-stack,.release-notes-notice').evaluate_all('(ns)=>ns.forEach(n=>n.remove())')
   for width in sizes:
    await page.set_viewport_size({'width':width,'height':844 if width==390 else 1050});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(game,width)
   await page.screenshot(path='artifacts/library-original-'+game+'-mobile.png')
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('.library-original-frame').first.scroll_into_view_if_needed();await page.screenshot(path='artifacts/library-original-'+game+'-desktop.png')
   await page.locator('[data-library-view=list]').click();await page.set_viewport_size({'width':390,'height':844});assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('[data-library-view=gallery]').click()
   await page.locator('.library-original-frame [data-library-peek]').first.click();await page.locator('#library-dialog[open]').wait_for();await page.keyboard.press('Escape')
   print(game,'original frames, exact splash sources and 4 responsive widths OK',flush=True)
  await page.locator('.side-rail [data-game=gi]').click();await page.locator('.side-rail button[data-nav=characters]').click()
  await page.locator('[data-library-search]').fill('Nahida');await page.wait_for_timeout(400)
  await page.locator('.library-original-frame [data-favorite]').click();assert await page.locator('.library-original-frame [data-favorite] .ic-fill').count()==1
  await page.locator('.library-original-frame [data-owned]').click();assert await page.locator('.library-original-frame [data-owned] .ic-check').count()==1
  await page.locator('.library-original-frame [data-library-watch]').click();await page.locator('[data-library-scope-filter=watch]').click();assert await page.locator('.library-original-frame').count()==1
  await page.locator('.library-original-frame [data-library-compare]').click();await page.locator('[data-library-compare-open]').click();assert await page.locator('.library-compare-columns>article').count()==1
  await page.keyboard.press('Escape')
  # A selected skin remains the first image candidate in the preserved renderer.
  await page.evaluate("localStorage.setItem('astralis:gi:skin-splash:nahida','/assets/ui/game-genshin.png')")
  await page.locator('[data-library-view=list]').click();assert await page.locator('.library-original-frame .unit-portrait').get_attribute('src')=='/assets/ui/game-genshin.png'
  report={'sameOriginalRenderer':True,'sameSplashCandidates':True,'selectedSkinPreserved':True,'allThreeGames':True,'responsiveWidths':sizes,'newSearchAndScopes':True,'favoriteAndOwnedActions':True,'newPreviewAndComparison':True,'samples':games,'errors':errors}
  Path('artifacts/original-character-frames-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True);assert not errors
  await b.close()
asyncio.run(main())
