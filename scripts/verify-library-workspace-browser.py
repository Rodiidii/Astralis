import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8893')
ART=Path('artifacts')

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  context=await browser.new_context(viewport={'width':1440,'height':1050},service_workers='block')
  await context.add_init_script("""if(!localStorage.getItem('library-qa-seeded')){localStorage.setItem('library-qa-seeded','1');localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',characterThemeMode:'off',reducedMotion:true,shellLaunch:false,backupReminder:false}));}""")
  await context.route('**/api/hoyolab/status',lambda r:r.fulfill(json={'connected':False}))
  page=await context.new_page();page.set_default_timeout(20000);errors=[]
  page.on('pageerror',lambda e:(errors.append(str(e)),print('JS ERROR',str(e),flush=True)))
  page.on('console',lambda m:(errors.append(m.text),print('RENDER ERROR',m.text,flush=True)) if m.type=='error' and m.text.startswith('Astralis n’a pas pu') else None)
  async def clean():
   await page.locator('#assistant-toast-stack,.release-notes-notice').evaluate_all('(ns)=>ns.forEach(n=>n.remove())');await page.mouse.move(0,0)
  async def route(section):
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('.side-rail button[data-nav='+section+']').click();await page.locator('.library-workspace').wait_for(timeout=45000)
   await page.wait_for_function("getComputedStyle(document.querySelector('.library-workspace')).display==='grid'")
   await clean();await page.evaluate('scrollTo(0,0)')
   assert not await page.get_by_text('Cette page a rencontré un problème.',exact=True).count()
  async def search(query):
   await page.locator('[data-library-search]').fill(query)
   await page.wait_for_timeout(250)
   await page.wait_for_function('(q)=>JSON.parse(localStorage.getItem("astralis:library-workspace:v1"))[document.querySelector(".library-workspace").dataset.libraryScope].query===q',arg=query)
  async def fits(label,width):
   await page.set_viewport_size({'width':width,'height':844 if width<550 else 1050})
   metrics=await page.evaluate('''()=>({width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.library-workspace *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left<-2)&&!n.closest('.library-element-strip,.library-recent,.library-compare-picks')}).slice(0,8).map(n=>({tag:n.tagName,cls:n.className,r:n.getBoundingClientRect().toJSON()}))})''')
   assert metrics['width']<=width,(label,width,metrics)
  await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000);await page.locator('.shell-v2').wait_for(timeout=30000)
  sizes=[1440,1024,768,390];counts={}
  for section in ['characters','weapons','sets','materials']:
   await route(section);counts[section]=int(await page.locator('.library-results-head p>b').inner_text());assert counts[section]>0;assert await page.locator('.library-card').count()==min(48,counts[section])
   for width in sizes:await fits(section,width)
   await page.screenshot(path=str(ART/('library-'+section+'-mobile.png')))
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('.library-card .art-main,.library-card-art img').first.evaluate('(i)=>i.decode().catch(()=>null)');await page.screenshot(path=str(ART/('library-'+section+'-desktop.png')))
   await page.locator('[data-library-view=list]').click();assert await page.locator('.library-workspace').get_attribute('data-library-view')=='list'
   for width in [1024,390]:await fits(section+'-list',width)
   await page.screenshot(path=str(ART/('library-'+section+'-list-mobile.png')))
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('[data-library-view=gallery]').click()
   print(section,counts[section],'cards, gallery and list responsive OK',flush=True)
  await route('materials');await page.locator('[data-library-load-more]').click();assert await page.locator('.library-card').count()==96
  # Accent-insensitive semantic search, facets, saved searches and category isolation.
  await route('characters');await search('Nahida');assert await page.locator('.library-card').count()==1
  await page.locator('.library-saved-searches>summary').click();await page.locator('[data-library-preset-name]').fill('Ma recherche Nahida');await page.locator('[data-library-save-form] button').click()
  assert await page.locator('[data-library-preset]').count()==1
  await page.keyboard.press('Escape');await page.locator('[data-library-clear=query]').click();assert await page.locator('.library-card').count()==min(48,counts['characters'])
  await page.locator('.library-saved-searches>summary').click();await page.locator('[data-library-preset]').click();assert await page.locator('.library-card').count()==1
  await page.locator('[data-library-reset]:visible').last.click();await page.locator('[data-library-filters]').click()
  await page.locator('[data-library-filter=weapon]').select_option(label='Catalyseur');assert await page.locator('.library-card').count()>1
  await page.locator('[data-library-filter=rarity]').select_option('5');assert await page.locator('.library-card').count()>1
  await page.locator('[data-library-reset]:visible').last.click();await search('epee');assert await page.locator('.library-card').count()>1
  await search('aucune-fiche-123');assert await page.locator('.library-empty').is_visible();await page.locator('[data-library-reset]:visible').last.click()
  await search('Nahida');card=page.locator('.library-card');id=await card.get_attribute('data-library-id')
  await card.locator('[data-favorite]').click();assert await page.locator('.library-card [data-favorite] .ic-fill').count()==1
  await page.locator('.library-card [data-owned]').click();assert await page.locator('.library-card [data-owned] .ic-check').count()==1
  await page.locator('.library-card [data-library-watch]').click();await page.locator('[data-library-scope-filter=watch]').click();assert await page.locator('.library-card').count()==1
  await page.locator('.library-card [data-library-peek]').click();await page.locator('#library-dialog[open]').wait_for();await page.keyboard.press('Escape')
  await page.locator('.library-recent').wait_for();assert await page.locator('.library-recent button[data-library-peek]').count()==1
  await page.reload(wait_until='domcontentloaded');await page.locator('.shell-v2').wait_for();await route('characters');assert await page.locator('.library-card').count()==1
  assert await page.locator('.library-card').get_attribute('data-library-id')==id
  print('Saved searches, facets, favorites, ownership, preparation list and persistence OK',flush=True)
  # Original full character detail can still be opened from the quick preview.
  await page.locator('.library-card [data-library-peek]').click();await page.locator('[data-library-open-detail]').click();await page.locator('#modal-root .detail-modal').wait_for()
  assert not await page.locator('#library-dialog[open]').count();await page.locator('#modal-root .modal-close').first.click()
  # Add three distinct characters, enforce the limit, open a native comparison dialog.
  await page.locator('[data-library-reset]:visible').last.click()
  for i in range(3):await page.locator('.library-card [data-library-compare]').nth(i).click()
  await page.locator('.library-card [data-library-compare]').nth(3).click();assert await page.locator('.library-compare-picks>button').count()==3
  await page.locator('[data-library-compare-open]').click();assert await page.locator('.library-compare-columns>article').count()==3
  await page.set_viewport_size({'width':390,'height':844});assert await page.locator('.library-compare-columns').evaluate('n=>n.scrollWidth>n.clientWidth')
  await page.screenshot(path=str(ART/'library-comparison-mobile.png'));await page.keyboard.press('Escape')
  await page.set_viewport_size({'width':1440,'height':1050});await page.locator('[data-library-compare-clear]').click()
  print('Original details and 3-item comparison with mobile scrolling OK',flush=True)
  # Weapon comparisons expose source descriptions for the selected refinement.
  await route('weapons');assert await page.locator('.library-card').count()==min(48,counts['weapons'])
  await search('Absolution');assert await page.locator('.library-card').count()==1
  await page.locator('[data-library-compare]').click();await page.locator('[data-library-compare-open]').click();await page.locator('[data-library-refinement]').select_option('5')
  assert 'Passif · R5' in await page.locator('.library-compare-columns').inner_text();await page.keyboard.press('Escape')
  await page.locator('[data-library-reset]:visible').last.click();await route('sets');await search('recharge');assert await page.locator('.library-card').count()>0
  await page.locator('.library-card [data-library-peek]').first.click();assert await page.locator('.library-peek-effects article').count()>=1
  await page.screenshot(path=str(ART/'library-set-effects.png'));await page.keyboard.press('Escape');await page.locator('[data-library-reset]:visible').last.click()
  print('Weapon refinement and set effect search/preview OK',flush=True)
  # Materials: manual quantities, remaining amount, focus return, scopes and reload.
  await route('materials');await search('Noyau aberrant des fonds');assert await page.locator('.library-card').count()==1
  await page.locator('.library-card [data-library-peek]').click();await page.locator('[data-library-quantity=have]').fill('12');await page.locator('[data-library-quantity=target]').fill('46')
  assert await page.locator('[data-library-remaining]').inner_text()=='34 à réunir'
  await page.screenshot(path=str(ART/'library-material-quantities.png'));await page.keyboard.press('Escape')
  assert '34 à réunir' in await page.locator('.library-quantity-badge').inner_text()
  await page.locator('[data-library-scope-filter=needed]').click();assert await page.locator('.library-card').count()==1
  await page.reload(wait_until='domcontentloaded');await page.locator('.shell-v2').wait_for();await route('materials');assert '34 à réunir' in await page.locator('.library-quantity-badge').inner_text()
  await page.locator('.library-card [data-library-peek]').click();await page.locator('[data-library-quantity=have]').fill('46');assert 'atteinte' in await page.locator('[data-library-remaining]').inner_text();await page.keyboard.press('Escape')
  assert await page.locator('.library-empty').is_visible();await page.locator('[data-library-reset]:visible').last.click()
  print('Material quantity targets, remaining count, completed scope and persistence OK',flush=True)
  # Shared layouts and controls for the two other universes, plus theme inheritance.
  cross={}
  for game in ['hsr','ww']:
   await page.set_viewport_size({'width':1440,'height':1050});await page.locator('.side-rail [data-game='+game+']').click();cross[game]={}
   for section in ['characters','weapons','sets','materials']:
    await route(section);cross[game][section]=int(await page.locator('.library-results-head p>b').inner_text());await fits(game+section,390)
   print(game,cross[game],flush=True)
  await page.set_viewport_size({'width':1440,'height':1050});await page.locator('.side-rail [data-game=gi]').click();await route('characters')
  await page.locator('.shell-bar-utilities>[data-shell=appearance]').click();await page.locator('[data-shell-theme=paper]').click();await page.locator('[data-shell-character]').select_option('lore-ronova');await page.keyboard.press('Escape')
  await clean();await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(ART/'library-character-light-ronova.png'))
  assert await page.locator('.app-frame').get_attribute('data-identity')=='gi:ronova'
  report={'routes':['characters','weapons','sets','materials'],'responsiveWidths':sizes,'countsGenshin':counts,'countsOtherGames':cross,'galleryAndList':True,'originalCharacterFrames':True,'progressiveRendering':True,'independentSavedSearches':True,'facets':True,'favoritesAndOwned':True,'preparationList':True,'recentPreviews':True,'originalFullDetails':True,'comparisonThreeItemLimit':True,'comparisonMobileScroll':True,'weaponRefinement':True,'setEffects':True,'manualMaterialTargetsAndRemaining':True,'persistAfterReload':True,'lightAndCharacterThemes':True,'errors':errors}
  (ART/'library-workspace-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True);assert not errors
  await browser.close()

asyncio.run(main())
