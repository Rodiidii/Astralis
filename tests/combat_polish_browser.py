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
  print('Stage teams',flush=True);expect(page.locator('.teams-switch-card')).to_have_count(2)
  print('Stage sources',flush=True);page.wait_for_function('combatQA.teamSourcePending.size===0')
  assert page.evaluate('JSON.parse(localStorage.getItem("astralis:teams:gi")).every(t=>t.rotation.length>8)')
  page.locator('.teams-switcher').screenshot(path=str(ROOT/'docs/teams-quick-polish.png'))
  before=page.evaluate('localStorage.getItem("astralis:gi:builds")')
  print('Stage overrides',flush=True);first=page.locator('.team-stat-card').first;first.locator('.team-stat-adjust>summary').click();first.locator('[data-team-override=atk]').fill('3500');first.locator('[data-team-stats-save]').click()
  page.wait_for_function('combatQA.teamSourcePending.size===0')
  expect(page.locator('.team-stat-card').first.locator('[data-team-stat=atk] dd').last).to_have_text('3 500')
  assert before==page.evaluate('localStorage.getItem("astralis:gi:builds")')
  print('Stage energy',flush=True);page.locator('[data-cs-tab=energy]').click();expect(page.locator('.te-workbench')).to_be_visible()
  expect(page.locator('[data-energy-member="0"] [data-energy-field=cost]')).to_have_value('30')
  expect(page.locator('[data-energy-member="0"] [data-energy-field=bursts]')).to_have_value('2')
  page.locator('[data-energy-member="1"] [data-energy-field=bursts]').fill('0.5')
  assert float(page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:team-energy:v3")).records["example-flins-team-20261126"].members[1].bursts'))==.5
  page.locator('.te-references>summary').click();expect(page.locator('.te-references table')).to_have_count(3)
  assert page.locator('.te-references tbody tr').count()==12
  assert all('0 pt' in value for value in page.locator('.te-references tbody td:last-child').all_text_contents())
  page.locator('.te-references').screenshot(path=str(ROOT/'docs/energy-kqm-reference.png'))
  print('OK teams, rotations, independent stats, energy and 3 published references',flush=True)
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
  try:page.locator('[data-mavuika-example]').click(timeout=25000)
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
  page.evaluate("()=>{combatQA.state.section='builds';combatQA.state.buildCharacter='10000120';combatQA.state.buildId='example-flins-20261126';combatQA.render()}")
  page.locator('[data-action=build-export-png]').click();dialog=page.locator('.astralis-png-preview');canvas=dialog.locator('canvas')
  expect(canvas).to_be_visible();page.wait_for_function('()=>!document.querySelector(".astralis-png-preview [data-save]").disabled')
  assert canvas.evaluate('c=>c.width')==4000
  assert canvas.evaluate('c=>c.height')==1880
  assert canvas.evaluate('c=>c.sheetAudit.overflows')==[]
  dialog.screenshot(path=str(ROOT/'docs/build-export-dialog.png'))
  png=canvas.evaluate('c=>c.toDataURL()');(ROOT/'docs/build-export-polish.png').write_bytes(__import__('base64').b64decode(png.split(',')[1]))
  dialog.locator('[data-copy-only]').click();expect(dialog.locator('[role=status]')).to_contain_text('Image copiée')
  assert not downloads
  assert page.evaluate('(async()=> (await navigator.clipboard.read()).some(item=>item.types.includes("image/png")))()')
  with page.expect_download() as pending:dialog.locator('[data-save]').click()
  exported=Path(tmp)/'build.png';pending.value.save_as(exported)
  assert hashlib.sha256(exported.read_bytes()).hexdigest()==hashlib.sha256(__import__('base64').b64decode(png.split(',')[1])).hexdigest()
  page.set_viewport_size({'width':390,'height':844});assert dialog.evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}')
  dialog.screenshot(path=str(ROOT/'docs/build-export-dialog-mobile.png'))
  assert not errors,errors
  assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  (ROOT/'docs/combat-polish-browser.json').write_text(json.dumps({'mavuikaDamage':result['r']['total'],'png':[4000,1880],'clipboardOnlyDownloads':0,'errors':errors},indent=2),encoding='utf-8')
  print('OK PNG layout, exact pixels for copy/download, no copy-only download, mobile',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
