"""Exercise the farm, calculation, event gallery and knowledge reader in the real app."""
import json,threading,hashlib,tempfile
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as pw,tempfile.TemporaryDirectory() as tmp:
  browser=pw.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(30000);expect.set_options(timeout=30000);errors=[];downloads=[]
  page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)));page.on('download',lambda d:downloads.append(d))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,teamSourceAnalysis,teamSourcePending};',content_type='application/javascript')
   elif url.startswith(base+'/assets/user/combat-examples-request.json'):r.fulfill(status=404,body='')
   elif url.startswith(base+'/api/gi/lore?'):r.fulfill(json={'extract':'# Le témoignage\nFontaine conserve un témoignage approfondi.\n# Les sources\nLe texte est chargé depuis le service de lecture.'})
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
  print('CalcSheets',flush=True)
  page.evaluate("()=>{localStorage.setItem('astralis:gi:calc-sheets',JSON.stringify([{id:'sheet-a',title:'Comparaison A',time:20,dpr:30000,dps:1000,members:[{name:'Flins',dps:750},{name:'Ineffa',dps:250},{},{}],notes:'Hypothèse A'}]));combatQA.state.section='calc';combatQA.render()}")
  expect(page.locator('.pc-calc-desk')).to_be_visible();page.locator('[data-pc=calc-normalize]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].dps")==1500
  page.locator('[data-pc=calc-contributions]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].members[0].share")=='75.0 %'
  page.locator('[data-pc=calc-baseline]').click();page.locator('[data-pc=calc-snapshot]').click();page.locator('[data-pc=calc-history]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:calc-workbench')).history['sheet-a'][0].dps")==1000
  page.locator('[data-pc=calc-clone]').click();expect(page.locator('.pc-sheet-tabs button')).to_have_count(2);page.locator('.pc-sheet-tabs button').last.click();expect(page.locator('.calc-sheet:visible')).to_have_count(1)
  page.locator('.pc-calc-desk').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/calcsheets-studio.png'))
  print('Farm',flush=True)
  page.evaluate("()=>{combatQA.state.catalogs['gi:material']=[{_id:'202',id:202,_name:'Mora',name:'Mora',typeText:'Mora',rarity:3,images:{filename_icon:'UI_ItemIcon_202'}}];localStorage.setItem('astralis:gi:farm-calendar',JSON.stringify([{id:'session-a',date:new Date().toLocaleDateString('sv-SE'),title:'Aptitudes de Flins',kind:'talent',resin:180,materialIds:[]}]));combatQA.state.section='farming';combatQA.render()}")
  expect(page.locator('.pc-farm-desk')).to_be_visible();page.locator('.pc-tools-drawer>summary').click();page.locator('[data-pc-budget]').fill('160');expect(page.locator('[data-pc-runs]')).to_contain_text('8 run(s)');page.locator('[data-pc-loot]').fill('6 livres dorés');page.locator('[data-pc=session-log]').click();page.locator('[data-pc=farm-log]').click();expect(page.locator('[data-pc-output]')).to_contain_text('6 livres dorés');page.screenshot(path=str(ROOT/'docs/farm-studio.png'))
  print('Event gallery',flush=True)
  page.evaluate("()=>{combatQA.state.giNews={refreshedAt:Date.now(),articles:[{id:'qa-news',title:'Annonce QA',category:'news',content:'Un contenu complet à lire dans la fiche.',image:'/assets/exploration-atlas/photos/gi/0208ba9649fd24.webp',date:'2026-11-26',link:'https://genshin.hoyoverse.com/fr/news/detail/qa'}],videos:[]};combatQA.state.giEvents={refreshedAt:Date.now(),events:[]};combatQA.state.section='events';combatQA.render()}")
  expect(page.locator('.event-visual-button[aria-label="Voir Annonce QA"]')).to_be_visible();expect(page.locator('.news-tag-group')).to_have_count(0);page.locator('.event-visual-button[aria-label="Voir Annonce QA"]').click();expect(page.locator('.event-detail-dialog')).to_be_visible();expect(page.locator('.event-detail-dialog')).to_contain_text('Annonce QA');page.locator('.event-detail-close').click();page.screenshot(path=str(ROOT/'docs/events-gallery.png'))
  print('Full app lore and archive',flush=True)
  page.evaluate("async()=>{combatQA.state.loreDossiers={archive:await fetch('/data/lore-archive.json').then(r=>r.json())};combatQA.state.loreCategory='journal';combatQA.state.loreJournal='enkanomiya';combatQA.state.section='lore';combatQA.render()}")
  expect(page.locator('.kw-bar')).to_be_visible();page.locator('.kw-bar').get_by_role('button',name='Mon carnet',exact=True).click();page.locator('.kw-tabs [data-pane=reading]').click();page.locator('[data-kw=done]').click();assert 'journal:enkanomiya' in page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:lore-reading:v1')).read");page.locator('[data-kw=close]').click();expect(page.locator('.lj-dossier [data-lore-reading-action=read]')).to_have_attribute('aria-pressed','true');page.locator('.kw-mention').filter(has_text='Istaroth').first.click();expect(page.locator('.lore-full-dossier h2')).to_contain_text('Istaroth')
  page.evaluate("()=>{combatQA.state.giLoreIndex={articles:[{title:'Une archive QA',extract:'La région de Fontaine conserve des traces du passé.',url:'https://example.com/archive',categories:['Lieux']}],count:1};combatQA.state.loreCategory='archive';combatQA.state.loreArticle='';combatQA.renderPageOnly()}")
  page.locator('[data-archive-open]').first.click();expect(page.locator('.kw-archive-dossier h2')).to_have_text('Une archive QA');page.locator('[data-archive-full]').click();expect(page.locator('.kw-archive-dossier')).to_contain_text('témoignage approfondi');page.locator('.kw-bar').get_by_role('button',name='Mon carnet',exact=True).click();expect(page.locator('.kw-dialog')).to_be_visible();page.locator('.kw-dialog [data-kw=close]').click();page.set_viewport_size({'width':390,'height':844});assert page.locator('.kw-archive-dossier').evaluate('e=>e.scrollWidth<=e.clientWidth+1');page.wait_for_function("()=>{const r=document.querySelector('.workspace').getBoundingClientRect();return r.left<20&&r.width>=350}");page.locator('.kw-archive-dossier').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/archive-reading-mobile.png'))
  assert not errors,errors
  assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  print('OK CalcSheets variants/history/coherence, farm runs/journal, image-only gallery, linked lore and full archive reader/mobile',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
