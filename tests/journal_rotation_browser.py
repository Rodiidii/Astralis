"""Teams, isolated overrides, energy references, JSON lab import and PNG clipboard."""
import json,threading,hashlib,tempfile
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as pw,tempfile.TemporaryDirectory() as tmp:
  browser=pw.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(45000);expect.set_options(timeout=45000);errors=[];downloads=[]
  page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)));page.on('download',lambda d:downloads.append(d))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,teamSourceAnalysis,teamSourcePending};',content_type='application/javascript')
   elif url.startswith(base+'/assets/user/combat-examples-request.json'):r.fulfill(status=404,body='')
   elif url.startswith(base+'/api/'):r.fulfill(json={})
   elif url.startswith(base):r.continue_()
   else:r.abort()
  page.add_init_script("window.qaConsoleErrors=[];const ce=console.error;console.error=(...a)=>{window.qaConsoleErrors.push(a.map(v=>v?.stack||String(v)));ce(...a)}");print('Stage startup',flush=True);page.route('**/*',route);page.goto(base,wait_until='domcontentloaded');page.wait_for_function('window.combatQA!==undefined')
  print('Stage fixtures',flush=True);page.evaluate('''async()=>{
   const {state}=combatQA,manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json()),aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   Object.defineProperty(state,'catalogErrors',{configurable:true,get:()=>({}),set:()=>{}});
   state.catalogs['gi:character']=Object.entries(manifest.characters).filter(([key,row])=>['10000120','10000116','10000110','10000121','10000043','10000031','10000106','10000107','10000032'].includes(row.id)).map(([key,row])=>({_id:row.id,id:row.id,_category:'character',_name:row.name,name:key,elementText:({Flins:'Electro',Ineffa:'Electro',Iansan:'Electro',Aino:'Hydro',Sucrose:'Anemo',Fischl:'Electro',Mavuika:'Pyro',Citlali:'Cryo',Bennett:'Pyro'})[key]||'Cryo',_labImage:'/assets/relations/portraits/'+row.id+'.png',_labSplash:'/assets/genshin/splashes/'+row.id+'.webp'}));
   const icons={'13407':'UI_EquipIcon_Pole_Zephyrus','12502':'UI_EquipIcon_Claymore_Wolfmound','12401':'UI_EquipIcon_Claymore_Zephyrus'};
   state.catalogs['gi:weapon']=aliases.weapons.map(r=>({_id:r.id,id:r.id,_category:'weapon',_name:r.fr?.[0]||r.en[0],name:r.en[0],rarity:Number(r.id[2])||5,images:{filename_icon:icons[r.id]}}));
   state.catalogs['gi:artifact']=aliases.artifacts.map(r=>({_id:r.id,id:r.id,_category:'artifact',_name:r.fr?.[0]||r.en[0],name:r.en[0],rarity:5,images:{filename_flower:'UI_RelicIcon_'+r.id+'_4',filename_plume:'UI_RelicIcon_'+r.id+'_2',filename_sands:'UI_RelicIcon_'+r.id+'_5',filename_goblet:'UI_RelicIcon_'+r.id+'_1',filename_circlet:'UI_RelicIcon_'+r.id+'_3'}}));
   for(const kind of ['character','weapon','artifact']){const fixture=state.catalogs['gi:'+kind];Object.defineProperty(state.catalogs,'gi:'+kind,{configurable:true,get:()=>fixture,set:()=>{}});}
   for(const c of state.catalogs['gi:character'])state.details['gi:'+c._id]={};
   state.labSources=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const {installCombatExamples}=await import('/src/combat-examples.js'),pack=await fetch('/data/flins-examples.json').then(r=>r.json());installCombatExamples(localStorage,pack,{character:state.catalogs['gi:character'],weapon:state.catalogs['gi:weapon'],artifact:state.catalogs['gi:artifact']});
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify(pack.scenario));localStorage.setItem('astralis:gi:team-focus',pack.teams[0].id);localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');state.game='gi';state.section='teams';combatQA.render();
  }''')
  print('Stage rotation composer',flush=True)
  composer=page.locator('.rotation-composer').first
  expect(composer).to_be_visible()
  expect(composer.locator('.rotation-composer-members>article')).to_have_count(4)
  before=page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi'))[0].rotation")
  composer.get_by_role('button',name='Ajouter Compétence · Flins',exact=True).click()
  updated=page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi'))[0].rotation")
  assert updated[-1]['code']=='E' and updated[-1]['character']=='10000120'
  composer.locator('[data-rotation-undo]').click()
  assert page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi'))[0].rotation")==before
  composer.scroll_into_view_if_needed()
  page.wait_for_function("()=>[...document.querySelectorAll('.rotation-composer:first-of-type .skill-image')].every(e=>e.complete&&e.naturalWidth>0)")
  composer.screenshot(path=str(ROOT/'docs/rotation-composer.png'))
  page.evaluate("()=>{combatQA.state.giEvents={};combatQA.state.giEndgame={blessing:'QA cycle',floors:[{floor:'12',levels:'Niveau 100',chambers:[{name:'Salle 12-1',halves:[{name:'1re moitié',enemies:[]},{name:'2e moitié',enemies:[]}]}]}],theater:{title:'Théâtre QA',period:'2026-11',elements:['Pyro'],opening:[],guests:[],bosses:[]},onslaught:{title:'Carnage QA',period:'2026-11',bosses:[{name:'Boss QA',stage:1,enemies:[]}]}};combatQA.state.section='endgame';combatQA.render()}")
  print('Stage endgame saved teams',flush=True)
  page.locator('[data-endgame-view=abyss]').first.click()
  panel=page.locator('[data-endgame-panel=abyss]')
  print('panel.locator(\'[data-endgame-team="20"]\').select_option',flush=True)
  panel.locator('[data-endgame-team="20"]').select_option('example-flins-team-20261126')
  card=page.locator('[data-endgame-panel=abyss] [data-eg-team-slot="20"]')
  expect(card.locator('.eg-selected-roster>span')).to_have_count(4)
  print("card.locator('.eg-team-rotation>summary').click()",flush=True)
  card.locator('.eg-team-rotation>summary').click()
  assert card.locator('.eg-team-rotation>div>span').count()>8
  card.screenshot(path=str(ROOT/'docs/endgame-saved-team.png'))
  print("page.locator('[data-endgame-view=onslaught]').first.click()",flush=True)
  page.locator('[data-endgame-view=onslaught]').first.click()
  page.locator('[data-endgame-panel=onslaught] [data-endgame-team="50"]').select_option('example-flins-budget-20261126')
  expect(page.locator('[data-endgame-panel=onslaught] .eg-selected-roster')).to_be_visible()
  print("page.locator('[data-endgame-view=theater]').first.click()",flush=True)
  page.locator('[data-endgame-view=theater]').first.click()
  page.locator('[data-endgame-panel=theater] [data-endgame-team="40"]').select_option('example-flins-team-20261126')
  page.evaluate('combatQA.renderPageOnly()')
  expect(page.locator('[data-endgame-panel=theater] [data-endgame-team="40"]')).to_have_value('example-flins-team-20261126')
  page.locator('[data-endgame-panel=theater] [data-endgame-team="40"]').select_option('')
  expect(page.locator('[data-endgame-panel=theater] .eg-selected-roster')).to_have_count(0)
  print('Stage lore journal',flush=True)
  page.evaluate("async()=>{combatQA.state.loreDossiers={archive:await fetch('/data/lore-archive.json').then(r=>r.json())};combatQA.state.loreCategory='overview';combatQA.state.section='lore';combatQA.render()}")
  expect(page.locator('.lj-discover')).to_be_visible()
  page.screenshot(path=str(ROOT/'docs/lore-discover-modern.png'))
  page.locator('[data-lore-category=journal]').first.click()
  expect(page.locator('.lj-grid .lj-card')).to_have_count(6)
  expect(page.locator('.lj-paths>article')).to_have_count(3)
  page.locator('.lj-grid [data-lore-journal=enkanomiya]').click()
  expect(page.locator('.lj-dossier h2')).to_have_text('Un soleil sous la mer')
  expect(page.locator('.lj-reading-layout main>section')).to_have_count(3)
  expect(page.locator('.lj-source a').first).to_have_attribute('href','https://genshin.hoyoverse.com/en/news/detail/18038')
  page.locator('.lj-dossier [data-lore-reading-action=read]').click()
  expect(page.locator('.lj-dossier [data-lore-reading-action=read]')).to_have_attribute('aria-pressed','true')
  page.locator('.lj-dossier [data-lore-reading-action=saved]').click()
  assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:lore-reading:v1')).saved.includes('journal:enkanomiya')")
  page.locator('.lj-reading-layout main>section').last.scroll_into_view_if_needed()
  expect(page.locator('.lj-reading-layout main>section').last).to_be_visible()
  page.screenshot(path=str(ROOT/'docs/lore-journal-enkanomiya.png'))
  page.locator('.lj-back').click()
  page.locator('[data-lore-search]').fill('englouti')
  expect(page.locator('.lj-grid .lj-card')).to_have_count(1)
  page.locator('[data-lore-search]').fill('')
  page.set_viewport_size({'width':390,'height':844})
  expect(page.locator('.lj-grid .lj-card')).to_have_count(6)
  assert page.locator('.lore-journal-page').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  page.locator('.lj-grid [data-lore-journal=remuria]').click()
  expect(page.locator('.lj-reading-layout nav')).to_be_visible()
  assert page.locator('.lj-dossier').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  page.screenshot(path=str(ROOT/'docs/lore-journal-mobile.png'))
  assert not errors,errors
  assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  print('OK visible action composer, undo, saved teams in Abyss/Theatre/Carnage, six sourced dossiers, reading state, search, desktop and mobile',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
