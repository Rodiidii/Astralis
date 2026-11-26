import asyncio, json, os, io, wave
from pathlib import Path
from playwright.async_api import async_playwright
ORIGIN=os.environ.get('ASTRALIS_TEST_ORIGIN','http://127.0.0.1:8894')
ART=Path('artifacts');ART.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=r'C:\Users\Ravon\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe',headless=True)
  context=await browser.new_context(viewport={'width':1512,'height':1100},service_workers='block',accept_downloads=True)
  await context.add_init_script("""if(!sessionStorage.getItem('studio-seeded')){localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:preferences',JSON.stringify({theme:'midnight',characterThemeMode:'manual',characterThemeId:'nahida',characterThemeIds:{gi:'nahida'},reducedMotion:true,shellLaunch:false,backupReminder:false}));localStorage.setItem('astralis:favs',JSON.stringify({'gi:character:nahida':true,'gi:character:furina':true,'gi:character:bennett':true,'gi:character:zhongli':true}));sessionStorage.setItem('studio-seeded','1');}""")
  await context.add_init_script("""const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__qaLastAudio=this;return play.call(this)};if('speechSynthesis' in window)speechSynthesis.speak=u=>{window.__qaVoice={pitch:u.pitch,rate:u.rate,volume:u.volume,text:u.text}};""")
  await context.route('**/api/hoyolab/status',lambda r:r.fulfill(json={'connected':False}))
  page=await context.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(ORIGIN+'/',wait_until='domcontentloaded',timeout=60000)
  await page.locator('.shell-v2').wait_for(timeout=45000)
  await page.locator('.side-rail [data-nav=customize]').click()
  await page.locator('[data-settings-tab=appearance]').click()
  await page.locator('[data-theme-studio]').wait_for()
  await page.wait_for_function("document.querySelector('[data-ts-character] option[value=nahida]')")
  if await page.locator('[data-ts-character]').input_value()!='nahida':
   await page.locator('[data-ts-character]').select_option('nahida')
  await page.wait_for_function("document.querySelector('#theme-signature-companion strong')?.textContent==='Nahida'")
  await page.screenshot(path=str(ART/'studio-themes-desktop.png'),full_page=False)
  fields=await page.locator('[data-ts-field]').count();assert fields>=100,fields
  print('Studio loaded:',fields,'controls',flush=True)
  search=page.locator('[data-ts-search]');await search.fill('accent')
  assert not await page.locator('.ts-category-nav').is_visible()
  matching=page.locator('[data-ts-field-row]:visible');assert await matching.count()>0
  assert all('accent' in value for value in await matching.evaluate_all("rows=>rows.map(row=>row.dataset.search)"))
  await search.fill('aucun-reglage-correspondant');assert await page.locator('[data-ts-search-empty]').is_visible()
  await search.fill('');await page.locator('[data-ts-category=layout]').click()
  assert await page.locator('[data-ts-group-id=layout]').is_visible()
  assert not await page.locator('[data-ts-group-id=palette]').is_visible()
  await page.locator('[data-ts-category=palette]').click()
  async def set_field(key,value):
   await page.locator('[data-ts-field='+key+']').evaluate("(n,v)=>{n.closest('details').open=true;if(n.type==='checkbox')n.checked=v;else n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));}",value)
  await set_field('bodySize',16)
  assert await page.evaluate("getComputedStyle(document.body).fontSize")=='16px'
  await page.locator('[data-ts-scope=character]').click()
  await set_field('bodySize',18)
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:theme-studio:v1')).characters['gi:nahida'].bodySize")==18
  await page.locator('[data-ts-character]').select_option('furina')
  assert await page.evaluate("getComputedStyle(document.body).fontSize")=='16px'
  await page.locator('[data-ts-character]').select_option('nahida')
  assert await page.evaluate("getComputedStyle(document.body).fontSize")=='18px'
  await page.locator('[data-ts-inherit=bodySize]').evaluate("n=>{n.closest('details').open=true;n.click()}")
  assert await page.evaluate("getComputedStyle(document.body).fontSize")=='16px'
  await page.locator('.ts-presets summary').click();await page.locator('[data-ts-preset=atelier]').click()
  assert await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--ts-artOpacity').trim()")=='3'
  await page.locator('[data-ts-action=undo]').click()
  assert await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--ts-artOpacity').trim()")=='14'
  await set_field('companionEnabled',False)
  assert await page.locator('#theme-signature-companion').count()==0
  await set_field('companionEnabled',True)
  await page.locator('[data-ts-companion=talk]').click()
  assert await page.locator('#theme-signature-companion').evaluate("n=>n.classList.contains('speaking')")
  async with page.expect_download() as dl:
   await page.locator('[data-ts-action=export]').click()
  theme_download=await dl.value
  theme_data=json.loads(Path(await theme_download.path()).read_text(encoding='utf-8'))
  assert theme_data['format']=='astralis-theme-studio'
  for scope in ['global','character']:
   await page.locator('[data-ts-scope='+scope+']').click()
   audit=await page.evaluate("""async(scope)=>{const {THEME_FIELDS}=await import('/src/theme-studio-model.js?v=20261124-studio-2');for(const f of THEME_FIELDS){const input=document.querySelector('[data-ts-field='+f.key+']');if(f.type==='toggle')input.checked=false;else if(f.type==='color')input.value='#7289ab';else if(f.type==='select')input.value=f.options.at(-1)[0];else input.value=f.min+(f.max-f.min)*.5;input.dispatchEvent(new Event('input',{bubbles:true}));const expected=f.type==='toggle'?input.checked:f.type==='range'?Number(input.value):input.value,stored=JSON.parse(localStorage.getItem('astralis:theme-studio:v1')),target=scope==='global'?stored.global:stored.characters['gi:nahida'];if(target[f.key]!==expected)throw Error('Non enregistré : '+scope+'/'+f.key);}return THEME_FIELDS.length;}""",scope)
   assert audit==120
  print('All 120 controls edited and persisted in both scopes (240 bindings) OK',flush=True)
  await page.locator('[data-ts-import]').set_input_files({'name':'themes.json','mimeType':'application/json','buffer':json.dumps(theme_data).encode()})
  await page.wait_for_timeout(200)
  await page.locator('.ts-presets summary').click();await page.locator('[data-ts-action=save-preset]').click()
  await page.locator('#workspace-dialog [name=name]').fill('Ma signature QA')
  await page.locator('#workspace-dialog [type=submit]').click()
  assert await page.locator('[data-ts-user-preset]').count()==1
  await page.locator('[data-ts-background]').set_input_files({'name':'qa-fond.png','mimeType':'image/png','buffer':Path('assets/ui/game-genshin.png').read_bytes()})
  await page.wait_for_function("document.querySelector('#theme-studio-atmosphere').style.getPropertyValue('--ts-custom-art').includes('blob:')")
  await page.locator('[data-ts-action=clear-background]').click()
  await page.wait_for_function("document.querySelector('[data-ts-bg-label]').textContent.includes('illustration')")
  wav=io.BytesIO()
  with wave.open(wav,'wb') as sound:
   sound.setnchannels(1);sound.setsampwidth(2);sound.setframerate(22050);sound.writeframes(bytes(22050*2*2))
  await page.locator('[data-ts-music]').set_input_files({'name':'qa-musique.wav','mimeType':'audio/wav','buffer':wav.getvalue()})
  await page.wait_for_function("window.__qaLastAudio&&!window.__qaLastAudio.paused&&window.__qaLastAudio.duration>0")
  assert await page.locator('[data-ts-audio-label]').inner_text()=='Piste : qa-musique.wav'
  assert await page.evaluate('window.__qaLastAudio.loop')
  await set_field('voiceEnabled',True)
  await set_field('voicePitch',1.2)
  await set_field('voiceRate',.8)
  await page.locator('[data-ts-companion=talk]').click()
  assert abs(await page.evaluate('window.__qaVoice.pitch')-1.2)<.001
  assert abs(await page.evaluate('window.__qaVoice.rate')-.8)<.001
  await set_field('voiceEnabled',False)
  await page.locator('[data-ts-action=clear-music]').click()
  await page.wait_for_function("document.querySelector('[data-ts-audio-label]').textContent.includes('synthétique')")
  await page.reload(wait_until='domcontentloaded')
  await page.locator('.side-rail [data-nav=customize]').click()
  await page.locator('[data-settings-tab=appearance]').click()
  await page.locator('[data-theme-studio]').wait_for()
  assert await page.evaluate("getComputedStyle(document.body).fontSize")=='16px'
  print('Theme inheritance, overrides, presets, undo, companion, export, reload OK',flush=True)
  await page.locator('.side-rail [data-nav=planner]').click()
  await page.locator('[data-planning-studio]').wait_for()
  await page.locator('[data-ps-action=template]').click()
  await page.locator('[data-ps-template=build]').click()
  await page.locator('.ps-project').wait_for()
  await page.locator('[data-ps-project-open]').click()
  assert await page.locator('.ps-task').count()==5
  assert await page.locator('[data-ps-status-drop=blocked] .ps-task').count()==4
  await page.locator('[data-ps-action=schedule]').click()
  await page.locator('[data-ps-generate]').click()
  await page.locator('#workspace-dialog [type=submit]').click()
  saved_tasks=await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi'))")
  assert sum(bool(t.get('due')) for t in saved_tasks)==5
  first=next(t for t in saved_tasks if not t.get('dependencies'))
  await page.locator('[data-ps-complete="gi:'+first['id']+'"]').click()
  assert await page.locator('[data-ps-status-drop=blocked] .ps-task').count()==3
  assert await page.locator('[data-ps-status-drop=done] .ps-task').count()==1
  next_task=await page.locator('[data-ps-status-drop=todo] [data-ps-drag]').first.get_attribute('data-ps-drag')
  await page.locator('[data-ps-timer="'+next_task+'"]').click()
  assert await page.locator('[data-ps-timer-display]').count()==1
  await page.locator('[data-ps-action=pause-timer]').click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:planning-studio:v1')).timer.startedAt") is None
  await page.locator('[data-ps-action=pause-timer]').click()
  await page.wait_for_timeout(1200)
  await page.locator('[data-ps-action=finish-timer]').click()
  assert await page.locator('[data-ps-timer-display]').count()==0
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:planning-studio:v1')).activity.some(x=>x.type==='session')")
  await page.locator('[data-ps-action=new]').first.click()
  await page.locator('#workspace-dialog [name=title]').fill('QA · objectif récurrent')
  await page.locator('#workspace-dialog [name=due]').fill('2026-11-25')
  await page.locator('#workspace-dialog [name=repeat]').select_option('weekly')
  await page.locator('#workspace-dialog [name=notes]').fill('Une vraie note persistante.')
  await page.locator('#workspace-dialog [name=steps]').fill('Première étape\n[x] Deuxième étape')
  await page.locator('#workspace-dialog [type=submit]').click()
  await page.locator('[data-ps-filter=project]').select_option('all')
  recurring=await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).find(t=>t.title==='QA · objectif récurrent')")
  await page.locator('[data-ps-complete="gi:'+recurring['id']+'"]').click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).filter(t=>t.title==='QA · objectif récurrent').length")==2
  await page.locator('[data-ps-action=undo]').click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).filter(t=>t.title==='QA · objectif récurrent').length")==1
  await page.locator('[data-ps-action=save-view]').click()
  await page.locator('#workspace-dialog [name=name]').fill('Ma vue QA')
  await page.locator('#workspace-dialog [type=submit]').click()
  await page.locator('[data-ps-view=calendar]').click()
  assert await page.locator('.ps-day').count()==7
  await page.locator('[data-ps-calendar=month]').click()
  assert await page.locator('.ps-day').count()==42
  await page.evaluate('window.scrollTo(0,0)')
  await page.screenshot(path=str(ART/'studio-planner-desktop.png'),full_page=False)
  print('Planner loaded',flush=True)
  await page.locator('.side-rail [data-nav=favorites]').click()
  await page.locator('[data-favorites-studio]').wait_for()
  await page.wait_for_timeout(2500)
  await page.wait_for_function("document.querySelectorAll('.fs-original-character .unit-cinematic').length>=4")
  await page.locator('[data-fs-action=collection]').click()
  await page.locator('#workspace-dialog [name=name]').fill('Mes essais Dendro')
  await page.locator('#workspace-dialog [name=description]').fill('Une collection personnelle, pas un filtre visuel.')
  await page.locator('#workspace-dialog [type=submit]').click()
  await page.locator('[data-fs-collection=all]').click()
  await page.locator('[data-fs-edit="gi:character:nahida"]').click()
  await page.locator('#workspace-dialog [name=notes]').fill('Équipe floraison, tester les rotations.')
  await page.locator('#workspace-dialog [name=tags]').fill('dendro, équipe')
  await page.locator('#workspace-dialog [name=rating]').select_option('5')
  await page.locator('#workspace-dialog [name=target]').fill('46')
  await page.locator('#workspace-dialog [name=have]').fill('12')
  await page.locator('#workspace-dialog [name=due]').fill('2026-11-26')
  await page.locator('#workspace-dialog [name=checklist]').fill('Choisir l’arme\n[x] Vérifier les talents')
  await page.locator('#workspace-dialog [name=collections]').check()
  await page.locator('#workspace-dialog [type=submit]').click()
  collection_id=await page.evaluate("JSON.parse(localStorage.getItem('astralis:favorites-studio:v1')).collections[0].id")
  await page.locator('[data-fs-collection="'+collection_id+'"]').click()
  assert await page.locator('.fs-card').count()==1
  await page.locator('[data-fs-action=collection]').click()
  await page.locator('#workspace-dialog [name=name]').fill('Automatique · Dendro')
  await page.locator('#workspace-dialog [name=smart]').check()
  await page.locator('#workspace-dialog [name=tag]').fill('dendro')
  await page.locator('#workspace-dialog [name=minRating]').fill('4')
  await page.locator('#workspace-dialog [type=submit]').click()
  assert await page.locator('.fs-card').count()==1
  await page.locator('[data-fs-compare="gi:character:nahida"]').click()
  await page.locator('[data-fs-action=compare]').click()
  assert await page.locator('.fs-compare-grid article').count()==1
  await page.keyboard.press('Escape')
  await page.locator('[data-fs-view=goals]').click()
  await page.locator('[data-fs-have]').fill('20')
  await page.locator('[data-fs-have]').press('Tab')
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:favorites-studio:v1')).items['gi:character:nahida'].have")==20
  await page.locator('[data-fs-check]').first.check()
  await page.locator('[data-fs-action=reminders]').click()
  await page.locator('[data-fs-action=reminders]').click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).filter(t=>t.favoriteReminder).length")==1
  await page.locator('[data-fs-action=team]').click()
  await page.locator('#workspace-dialog [name=name]').fill('QA · quatre compagnons')
  for i,name in enumerate(['Nahida','Furina','Bennett','Zhongli']):
   await page.locator('[data-fs-picker="'+str(i)+':character:character"]').click()
   await page.locator('[data-fs-picker-query]').fill(name)
   await page.locator('[data-fs-pick]').first.click()
  await page.locator('[data-fs-picker="0:weapon:weapon"]').click()
  await page.locator('[data-fs-pick]').first.click()
  await page.locator('[data-fs-picker="0:set:artifact"]').click()
  await page.locator('[data-fs-pick]').first.click()
  await page.locator('.fs-rotation-editor summary').click()
  await page.locator('[data-fs-rotation-add]').click()
  await page.locator('[data-fs-rotation-add]').click()
  await page.locator('[data-rotation-field=slot]').nth(1).select_option('1')
  await page.locator('[data-rotation-field=action]').nth(1).select_option('burst')
  await page.locator('[data-rotation-field=seconds]').nth(1).fill('2.5')
  await page.locator('[data-rotation-field=seconds]').nth(1).press('Tab')
  assert await page.locator('[data-fs-rotation-total]').inner_text()=='2 actions · 4.0 secondes'
  await page.locator('#workspace-dialog [type=submit]').click()
  saved_team=await page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi')).find(t=>t.name==='QA · quatre compagnons')")
  assert len(saved_team['members'])==4 and saved_team['members'][0]['weapon'] and saved_team['members'][0]['set'] and len(saved_team['rotation'])==2
  await page.locator('[data-fs-view=equipment]').click()
  assert await page.locator('[data-fs-gear-owned]').count()>=6
  await page.locator('[data-fs-gear-owned]').first.check()
  await page.locator('[data-fs-missing-plan]').first.click()
  equipment_count=await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).filter(t=>t.equipmentReference).length")
  assert equipment_count>=5
  await page.locator('[data-fs-missing-plan]').first.click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).filter(t=>t.equipmentReference).length")==equipment_count
  await page.locator('[data-fs-view=gallery]').click()
  await page.locator('[data-fs-collection=all]').click()
  await page.locator('[data-fs-select="gi:character:nahida"]').check()
  await page.locator('[data-fs-action=project]').click()
  await page.locator('#workspace-dialog [name=name]').fill('Projet né des favoris')
  await page.locator('#workspace-dialog [type=submit]').click()
  assert await page.evaluate("JSON.parse(localStorage.getItem('astralis:tasks:gi')).some(t=>t.favoriteKey==='gi:character:nahida'&&t.steps.length===2)")
  await page.locator('[data-fs-action=tools]').click()
  async with page.expect_download() as dl:
   await page.locator('[data-fs-export=json]').click()
  fav_download=await dl.value
  fav_data=json.loads(Path(await fav_download.path()).read_text(encoding='utf-8'))
  assert fav_data['format']=='astralis-favorites-studio' and len(fav_data['data']['collections'])==2
  assert len(fav_data['teams']['gi'][0]['rotation'])==2
  await page.keyboard.press('Escape')
  print('Planner templates, dependencies, schedule, timer, recurrence, undo and views OK',flush=True)
  print('Favorites collections, annotations, goals, checklist, comparison, reminders, equipped team, project and export OK',flush=True)
  await page.evaluate('window.scrollTo(0,0)')
  await page.screenshot(path=str(ART/'studio-favorites-desktop.png'),full_page=False)
  print('Favorites loaded:',await page.locator('.fs-card').count(),flush=True)
  for section in ['planner','favorites','customize']:
   await page.locator('.side-rail [data-nav='+section+']').click()
   if section=='customize':await page.locator('[data-settings-tab=appearance]').click()
   for width in [1512,1024,768,390]:
    await page.set_viewport_size({'width':width,'height':900})
    overflow=await page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    assert overflow['scroll']<=width,(section,overflow)
   await page.screenshot(path=str(ART/('studio-'+section+'-mobile.png')))
   await page.set_viewport_size({'width':1512,'height':1100})
  report={'controlsPerGlobalAndCharacterProfile':fields,'allControlsEditedAndPersistedInBothScopes':True,'verifiedControlBindings':240,'themeInheritanceAndPersistence':True,'presetAndUndo':True,'companionFollowsTheme':True,'customImageAndAudioImportedAndRemoved':True,'importedAudioActuallyDecodedAndPlayed':True,'browserVoiceSettingsVerifiedWithSpeechStub':True,'plannerTemplatesDependenciesAndCapacity':True,'plannerSessionAndTimeHistory':True,'recurrenceAndUndo':True,'calendarWeekAndMonth':True,'collectionsAnnotationsGoals':True,'comparison':True,'remindersDeduplicated':True,'fourCharacterTeamWithEquipment':True,'teamRotationTimelineAndExport':True,'missingEquipmentPlanAndDeduplication':True,'favoriteToProjectWithChecklist':True,'exportsDownloadedAndParsed':True,'errors':errors,'responsiveWidths':[1512,1024,768,390]}
  (ART/'studios-browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
  print(json.dumps(report),flush=True);assert not errors,errors
  await browser.close()
asyncio.run(main())
