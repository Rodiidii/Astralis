"""Real app navigation with isolated data and mocked HoYoLAB/third-party frames."""
import asyncio,json,os,time
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8892')
ART=Path('artifacts')

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  ctx=await browser.new_context(viewport={'width':1440,'height':1050},service_workers='block',accept_downloads=True)
  await ctx.add_init_script("""if(!localStorage.getItem('utility-qa')){localStorage.setItem('utility-qa','1');localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',characterThemeMode:'off',reducedMotion:true,backupReminder:false,shellLaunch:false}));localStorage.setItem('astralis:gi:wish-plan',JSON.stringify({currentPrimos:1600,primos:1600,currentPrimosExplicit:true,wishes:5,characterPity:24,weaponPity:12,radiance:1,characterGuarantee:false,weaponGuarantee:false,rewardSetup:true,history:[],pullHistory:[]}));localStorage.setItem('astralis:gi:catalog-diffs:v1',JSON.stringify([{id:'10000073',type:'updated',name:'Nahida',category:'character',at:Date.now(),fields:[{key:'description',before:'Description précédente',after:'Description mise à jour',type:'updated'}]},{id:'qa-weapon',type:'new',name:'Lame de test',category:'weapon',at:Date.now()},{id:'qa-set',type:'new',name:'Set de test',category:'artifact',at:Date.now()}]));localStorage.setItem('astralis:data:additions:v1',JSON.stringify([{game:'gi',id:'10000073',category:'character',name:'Nahida',at:Date.now(),source:'Catalogue de vérification'}]));}""")
  account={'connected':False,'uid':'','region':'os_euro'};writes=[]
  async def hoyo(route):
   req=route.request;path=req.url.split('/api/hoyolab/')[-1].split('?')[0]
   if path=='credentials':
    payload=json.loads(req.post_data or '{}');writes.append(path);account.update(connected=True,uid=payload.get('uid','700000000'),region=payload.get('region','os_euro'));await route.fulfill(json={'ok':True})
   elif path=='status':await route.fulfill(json=account)
   elif path=='resin':await route.fulfill(json={'current':128,'maximum':200,'updatedAt':int(time.time()),'recoverySeconds':72*480})
   elif path=='disconnect':account['connected']=False;await route.fulfill(json={'ok':True})
   else:await route.fulfill(status=404,json={})
  await ctx.route('**/api/hoyolab/**',hoyo)
  async def external(route):await route.fulfill(content_type='text/html',body='<html><title>Cadre de vérification</title><body>Outil externe simulé pour vérifier le cadre Astralis.</body></html>')
  for pattern in ['https://act.hoyolab.com/**','https://frzyc.github.io/**','https://fribbels.github.io/**','https://gcsim.app/**','https://www.wutheringtools.com/**','https://dj12421.github.io/**']:await ctx.route(pattern,external)
  page=await ctx.new_page();page.set_default_timeout(18000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
  page.on('console',lambda m:(errors.append(m.text),print('RENDER ERROR',m.text,flush=True)) if m.type=='error' and m.text.startswith('Astralis n’a pas pu') else None)
  async def clean():
   await page.locator('#assistant-toast-stack,.release-notes-notice').evaluate_all('(ns)=>ns.forEach(n=>n.remove())');await page.mouse.move(0,0)
  async def navigate(key):
   if (await page.evaluate('innerWidth'))<761:await page.set_viewport_size({'width':1440,'height':1050})
   await page.locator('.side-rail [data-nav='+key+']').click();await page.locator('[data-utility-page='+key+']').wait_for();await clean();await page.evaluate('scrollTo(0,0)')
   await page.wait_for_function("getComputedStyle(document.querySelector('.utility-page')).display==='grid'")
   assert not await page.get_by_text('Cette page a rencontré un problème.',exact=True).count()
  async def fits(key,width):
   await page.set_viewport_size({'width':width,'height':844 if width<550 else 1050})
   metrics=await page.evaluate('''()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.utility-page *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&getComputedStyle(n).display!=='none'&&(r.right>innerWidth+2||r.left<-2)}).slice(0,10).map(n=>({tag:n.tagName,cls:n.className,text:n.textContent.slice(0,40),r:n.getBoundingClientRect().toJSON()}))})''')
   assert metrics['width']<=width,(key,width,metrics)
  await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000);await page.locator('.shell-v2').wait_for(timeout=30000)
  nav=await page.locator('.side-rail .rail-link').evaluate_all('''ns=>ns.map(n=>({id:n.dataset.nav||n.dataset.action||'progress',icon:n.querySelector('[data-navigation-icon]')?.dataset.navigationIcon,shape:n.querySelector('[data-navigation-icon]')?.innerHTML}))''')
  assert len(nav)>=39 and all(row['icon'] for row in nav),nav
  assert len(set(row['shape'] for row in nav))>=38,nav
  assert len(set(row['icon'] for row in nav if row['id'] in ['atlas','planner','focus','energy','lab','calc','wishes','hoyolab','data','skowt','optimizer','changelog']))==12
  print('Semantic icons:',len(nav),'destinations,',len(set(row['shape'] for row in nav)),'different drawings',flush=True)
  pages=['hoyolab','wishes','changelog','optimizer','skowt','data'];sizes=[1440,1024,768,390]
  for key in pages:
   await navigate(key)
   for width in sizes:await fits(key,width)
   await page.screenshot(path=str(ART/('utility-'+key+'-mobile.png')))
   await page.set_viewport_size({'width':1440,'height':1050});await page.evaluate('scrollTo(0,0)');await clean()
   await page.screenshot(path=str(ART/('utility-'+key+'-desktop.png')))
   print(key,'4 widths OK',flush=True)
  # Journal: category, query, no-results state and real before/after disclosure.
  await navigate('changelog');await page.locator('[data-utility-filter=weapon]').click();assert await page.locator('[data-utility-row]:visible').count()==1
  await page.locator('[data-utility-filter=all]').click();await page.locator('[data-utility-query]').fill('Nahida');assert await page.locator('[data-utility-row]:visible').count()==1
  await page.locator('.utility-diff-details summary').click();assert await page.locator('.utility-diff-details ins').inner_text()=='Description mise à jour'
  await page.locator('[data-utility-query]').fill('aucune-correspondance');assert await page.locator('[data-utility-empty]').is_visible()
  await page.locator('[data-utility-query]').fill('');assert await page.locator('[data-utility-row]:visible').count()==3
  await page.screenshot(path=str(ART/'utility-journal-filled.png'))
  # Sources: game filtering and a search share a truthful visible count.
  await navigate('data');await page.locator('[data-utility-filter=gi]').click();assert await page.locator('.utility-source-card:visible').count()==1
  await page.locator('[data-utility-query]').fill('inexistant');assert await page.locator('[data-utility-empty]').is_visible()
  await page.locator('[data-utility-query]').fill('');await page.locator('[data-utility-filter=all]').click();assert await page.locator('.utility-source-card:visible').count()==3
  print('Journal before/after and source filters OK',flush=True)
  # HoYoLAB: all writes are intercepted and never reach the user's credential vault.
  await navigate('hoyolab');await page.locator('[data-utility-account-open]').click();assert await page.locator('.utility-account-connection').get_attribute('open') is not None
  await page.locator('[data-utility-reveal]').click();assert await page.locator('#hoyolab-ltuid').get_attribute('type')=='text'
  await page.locator('[data-utility-reveal]').click();await page.locator('#hoyolab-uid').fill('700000000');await page.locator('#hoyolab-region').select_option('os_asia')
  await page.locator('#hoyolab-ltuid').fill('qa-ltuid');await page.locator('#hoyolab-ltoken').fill('qa-session')
  await page.locator('[data-action=hoyolab-save]').click();await page.locator('[data-resin-value]').wait_for();assert await page.locator('[data-resin-value]').inner_text()=='128'
  assert writes==['credentials']
  await page.locator('[data-hoyolab-tool=map]').click();assert not await page.locator('.utility-external-frame').count()
  await page.locator('[data-utility-embed]').click();assert 'interactive-map' in await page.locator('.utility-external-frame').get_attribute('src')
  assert await page.locator('.utility-hoyo-tools .utility-section-head a').get_attribute('target')=='_blank'
  print('HoYoLAB form, resin and opt-in embed OK (mock service)',flush=True)
  # Wishes retain wallet updates, rewards, goals, counters and CSV export.
  await navigate('wishes');await page.locator('[data-wallet=currentPrimos]').fill('3200');await page.locator('[data-wallet=currentPrimos]').dispatch_event('change')
  await page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos===3200")
  await page.locator('.utility-wish-reserve strong').filter(has_text='25').wait_for()
  await page.locator('[data-reward=daily]').click();await page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos===3260")
  await page.locator('#wishes-tab-goals').click();await page.locator('wish-objectives [data-add]').click()
  await page.locator('wish-objectives [data-target="0"][data-field=name]').fill('Nahida');await page.locator('wish-objectives [data-target="0"][data-field=name]').dispatch_event('change')
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')).targets[0].name")=='Nahida'
  for width in sizes:await fits('wish-goals',width)
  await page.screenshot(path=str(ART/'utility-wish-goals-mobile.png'))
  await page.set_viewport_size({'width':1440,'height':1050});await page.locator('#wishes-tab-goals').focus();await page.keyboard.press('ArrowRight');assert await page.locator('#wishes-tab-history').get_attribute('aria-selected')=='true'
  async with page.expect_download() as dl:await page.locator('[data-export-wish-ledger]').click()
  assert (await dl.value).suggested_filename.endswith('.csv')
  await page.locator('wish-journal>section>details>summary').click()
  await page.locator('[data-undo-reward]').click()
  await page.wait_for_function("JSON.parse(localStorage.getItem('astralis:gi:wish-plan')).currentPrimos===3200")
  await page.locator('wish-journal [role=status]').filter(has_text='Gain annulé').wait_for()
  assert not await page.locator('[data-undo-reward]').count()
  await page.locator('#wish-pull-name').fill('Nahida');await page.locator('#wish-pull-pity').fill('76');await page.locator('[data-action=wish-pull-log]').click()
  assert await page.locator('.wish-pull-list .pull-result').count()==1
  for width in sizes:await fits('wish-history',width)
  await page.screenshot(path=str(ART/'utility-wish-history-mobile.png'))
  print('Wallet, rewards, undo, goals, keyboard tabs, pull history and CSV OK',flush=True)
  # Optimizer profile import and export stay in the isolated browser database.
  await navigate('optimizer');await page.locator('.utility-optimizer-card [data-action=embed-tool]').first.click()
  await page.locator('.embedded-tool-frame').wait_for();assert 'genshin-optimizer' in await page.locator('.utility-external-frame').get_attribute('src')
  await page.locator('.embedded-tool-frame [data-action=embed-fribbels]').click();assert not await page.locator('.embedded-tool-frame').count()
  profile={'data':{'avatar_list':[{'id':1001,'name':'Personnage de vérification','level':80,'rank':0,'icon':'/assets/ui/game-starrail.png','relics':[],'ornaments':[]}]}}
  await page.locator('#hsr-profile-file').set_input_files({'name':'verification-hoyolab.json','mimeType':'application/json','buffer':json.dumps(profile).encode()})
  await page.locator('[data-action=download-hsr-profile]:not([disabled])').wait_for()
  async with page.expect_download() as profile_dl:await page.locator('[data-action=download-hsr-profile]').click()
  assert (await profile_dl.value).suggested_filename.endswith('.json')
  print('Optimizer frame, real profile import and download OK',flush=True)
  # Light theme and a lore character; inspect the same pages after switching universes.
  await page.locator('.shell-bar-utilities > [data-shell=appearance]').click();await page.locator('[data-shell-theme=paper]').click()
  await page.locator('[data-shell-character]').select_option('lore-ronova');await page.keyboard.press('Escape')
  await navigate('data');await page.wait_for_timeout(200);await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(ART/'utility-data-light-ronova.png'))
  await page.locator('.side-rail').evaluate('(n)=>n.scrollTop=n.scrollHeight');await page.screenshot(path=str(ART/'utility-navigation-icons.png'))
  for game in ['hsr','ww']:
   await page.set_viewport_size({'width':1440,'height':1050})
   await page.locator('.side-rail [data-game='+game+']').click()
   for key in ['optimizer','skowt','data']:
    await navigate(key);await fits(game+':'+key,390)
  print('Light theme, Ronova, Star Rail and Wuthering Waves OK',flush=True)
  report={'pages':pages,'responsiveWidths':sizes,'semanticDestinations':len(nav),'distinctMenuDrawings':len(set(row['shape'] for row in nav)),'journalFiltersAndDiffs':True,'sourceFilters':True,'hoyolabFormAndResinWithMockService':True,'optInExternalFrames':True,'walletAndRewards':True,'rewardUndo':True,'goalsAndPity':True,'keyboardTabs':True,'pullHistory':True,'csvExport':True,'profileImportAndJsonDownload':True,'lightThemeAndCharacterTheme':True,'sharedPagesInAllGames':True,'externalServicesMocked':True,'errors':errors}
  (ART/'utility-pages-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report),flush=True)
  await browser.close();assert not errors

asyncio.run(main())
