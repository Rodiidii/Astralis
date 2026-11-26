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
  browser=pw.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(20000);page.set_default_navigation_timeout(120000);expect.set_options(timeout=20000);errors=[];downloads=[]
  page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e.stack,flush=True)));page.on('download',lambda d:downloads.append(d))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,showAssistantToast,openBooster,boosterOddsMode};',content_type='application/javascript')
   elif url.startswith(base+'/assets/user/combat-examples-request.json'):r.fulfill(status=404,body='')
   elif url.startswith(base+'/api/gi/lore?'):r.fulfill(json={'extract':'# Le témoignage\nFontaine conserve un témoignage approfondi.\n# Les sources\nLe texte est chargé depuis le service de lecture.'})
   elif url.startswith(base+'/api/'):r.fulfill(json={})
   elif url.startswith(base):
    from urllib.parse import urlsplit,unquote
    path=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
    if path.is_dir():path=path/'index.html'
    if path.is_relative_to(ROOT) and path.is_file():r.fulfill(path=str(path))
    else:r.fulfill(status=404,body='')
   else:r.abort()
  cdp=context.new_cdp_session(page);cdp.send('Debugger.enable');cdp.on('Debugger.scriptFailedToParse',lambda e:print('SYNTAX',e.get('url'),e.get('startLine'),flush=True))
  page.add_init_script("window.qaConsoleErrors=[];const ce=console.error;console.error=(...a)=>{window.qaConsoleErrors.push(a.map(v=>v?.stack||String(v)));ce(...a)}");print('Stage startup',flush=True);page.route('**/*',route);page.goto(base,wait_until='commit');page.wait_for_function('window.combatQA!==undefined',timeout=120000)
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
  print('New workshop fixtures',flush=True)
  page.add_style_tag(content='.backup-reminder,.data-update-toast{display:none!important}')
  page.evaluate("async()=>{const Store=await import('/src/store.js');Store.saveNote('gi',{id:'note-qa',title:'Préparer ma rotation',body:'## Objectif\\n- [ ] Tester la recharge\\nConserver les mêmes buffs.',tag:'Combat'});combatQA.state.section='notes';combatQA.render()}")
  expect(page.locator('.notebook-index')).to_be_visible();expect(page.locator('.notebook-body')).to_contain_text('Tester la recharge');page.locator('[data-note-check]').check();assert '[x]' in page.evaluate("async()=>{const S=await import('/src/store.js');return S.notes('gi').find(n=>n.id==='note-qa').body}")
  page.screenshot(path=str(ROOT/'docs/notebook-personal.png'))
  page.evaluate("()=>{localStorage.setItem('astralis:gi:calc-sheets',JSON.stringify([{id:'qa-table',title:'Flins · Rotation',time:20,dpr:30000,dps:1000,color:'#a8cbbb',members:[{name:'Flins',dps:750},{name:'Ineffa',dps:250},{name:'Aino'},{}]}]));combatQA.state.section='calc';combatQA.render()}")
  expect(page.locator('.cw-table tbody tr')).to_have_count(4);page.locator('[data-cc=recalculate]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].dps")==1500
  page.locator('[data-cc=sum]').first.click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].dpr")==20000
  page.locator('[data-cc-member="0"][data-cc-prop=dps]').fill('1500');expect(page.locator('[data-cw-share="0"]')).to_contain_text('85.7');page.locator('[data-cc=rotation][data-member="0"][data-code=Q]').click();expect(page.locator('[data-cc-field=rotation]')).to_contain_text('Flins Q');page.screenshot(path=str(ROOT/'docs/calcsheets-table.png'))
  assert page.locator('.cw-table').evaluate('(e)=>e.scrollWidth<=e.closest(".cw-table-scroll").clientWidth+1'),'desktop table should expose every column without scrolling'
  assert not errors,errors;print('PASS: desktop CalcSheets exposes all six columns',flush=True);browser.close()
finally:server.shutdown();server.server_close()
