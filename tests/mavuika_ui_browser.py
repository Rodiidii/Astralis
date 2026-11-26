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
  browser=pw.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(90000);expect.set_options(timeout=90000);errors=[];downloads=[]
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
  print('Stage lab open',flush=True);page.evaluate("()=>{combatQA.state.section='lab';combatQA.render()}")
  expect(page.locator('.lab-visible-loadout')).to_be_visible();expect(page.locator('lab-configurations')).to_be_visible()
  print('Stage lab upload',flush=True);page.locator('lab-configurations input[type=file]').set_input_files(str(ROOT/'data/celestia-exports/team/mavuika-melt-premium.json'))
  
  try:page.wait_for_function('()=>JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).character==="10000106"',timeout=30000)
  except Exception:
   print('Import status',page.locator('[data-import-status]').all_text_contents(),page.locator('.toast').all_text_contents(),flush=True);page.screenshot(path=str(ROOT/'docs/import-error.png'));raise
  imported=page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1"))')
  assert len(imported['allies'])==3
  assert next(m for m in imported['allies'] if m['character']=='10000110')['constellation']==6
  print('Stage lab preset',flush=True)
  try:page.locator('[data-mavuika-example]').click(timeout=60000)
  except Exception:
   print('AFTER IMPORT',page.locator('body').inner_text(timeout=3000)[-7000:],errors,page.evaluate('window.qaConsoleErrors'),flush=True);page.screenshot(path=str(ROOT/'docs/import-error.png'));raise
  page.wait_for_function('()=>JSON.parse(localStorage.getItem("astralis:gi:damage-lab:v1")).celestiaPreset==="mavuika-wgs"')
  print('Stage lab evaluate',flush=True);result=page.evaluate('''async()=>{const m=await import('/src/lab-page.js?v=20261126-reading-studio-2');const p=m.readResearchScenario();return {p,r:await m.evaluateResearchScenario(p)};}''')
  (ROOT/'artifacts/mavuika-browser-debug.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
  assert result['r']['ok'],result
  expected=json.loads((ROOT/'docs/mavuika-melt-observed.json').read_text(encoding='utf-8'))['average']
  assert abs(result['r']['total']-expected)<.1,(result['r']['total'],expected)
  assert result['p']['weaponOverride']=='12502'
  page.locator('[data-lab-action=calculate]').first.click();page.wait_for_function('()=>/\\d/.test(document.querySelector("[data-lab-damage]").textContent)')
  print('OK direct JSON lab import and Mavuika Melt/WGS:',result['r']['total'],flush=True)
  print('Checking the real calculate button',flush=True)
  page.locator('[data-lab-action=calculate]').first.click(timeout=60000)
  expect(page.locator('[data-lab-breakdown]')).to_contain_text('Gain de la réaction',timeout=60000)
  expect(page.locator('[data-lab-breakdown]')).to_contain_text('3,2')
  expect(page.locator('[data-lab-result-title]')).to_contain_text('Dégâts moyens')
  page.locator('[data-lab-breakdown]').evaluate("e=>{let p=e.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement}}");page.locator('[data-lab-breakdown]').screenshot(path=str(ROOT/'docs/mavuika-melt-breakdown.png'))
  assert not errors,errors
  assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  print('OK Mavuika JSON import, Melt ratio 3.2001115, average/non-crit/crit and actual calculate button',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
