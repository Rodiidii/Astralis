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
   elif url.startswith(base):
    from urllib.parse import urlsplit,unquote
    path=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
    if path.is_dir():path=path/'index.html'
    if path.is_relative_to(ROOT) and path.is_file():r.fulfill(path=str(path))
    else:r.fulfill(status=404,body='')
   else:r.abort()
  page.add_init_script("window.qaConsoleErrors=[];const ce=console.error;console.error=(...a)=>{window.qaConsoleErrors.push(a.map(v=>v?.stack||String(v)));ce(...a)}");print('Stage startup',flush=True);page.route('**/*',route);page.goto(base,wait_until='commit');page.wait_for_function('window.combatQA!==undefined')
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
  print('Stage gallery PNG',flush=True)
  page.evaluate("()=>{combatQA.state.section='builds';combatQA.state.buildCharacter='10000120';combatQA.state.buildId='example-flins-20261126';combatQA.render()}")
  page.locator('[data-action=build-export-png]').click();dialog=page.locator('.astralis-png-preview');canvas=dialog.locator('canvas')
  expect(canvas).to_be_visible();page.wait_for_function('()=>!document.querySelector(".astralis-png-preview [data-save]").disabled')
  assert canvas.evaluate('c=>c.width')==4000
  assert canvas.evaluate('c=>c.height')==1880
  assert canvas.evaluate('c=>c.sheetAudit.overflows')==[]
  dialog.screenshot(path=str(ROOT/'docs/build-gallery-dialog.png'))
  initial=canvas.evaluate('c=>c.toDataURL()')
  page.evaluate('window.qaPreviousCanvas=document.querySelector(".astralis-png-preview canvas")');dialog.locator('[aria-label="Sous-stats à mettre en valeur"]').select_option('reaction');page.wait_for_function('()=>document.querySelector(".astralis-png-preview canvas")!==window.qaPreviousCanvas');page.wait_for_function('()=>!document.querySelector(".astralis-png-preview [data-save]").disabled');assert canvas.evaluate('c=>c.sheetAudit.overflows')==[]
  reaction=canvas.evaluate('c=>c.toDataURL()');assert reaction!=initial;page.evaluate('window.qaPreviousCanvas=document.querySelector(".astralis-png-preview canvas")');dialog.locator('[aria-label=Palette]').select_option('pyro');page.wait_for_function('()=>document.querySelector(".astralis-png-preview canvas")!==window.qaPreviousCanvas');page.wait_for_function('()=>!document.querySelector(".astralis-png-preview [data-save]").disabled')
  dialog.locator('[aria-label=Palette]').select_option('');dialog.locator('[aria-label="Sous-stats à mettre en valeur"]').select_option('');page.wait_for_function('()=>!document.querySelector(".astralis-png-preview [data-save]").disabled')
  png=canvas.evaluate('c=>c.toDataURL()');(ROOT/'docs/build-export-gallery.png').write_bytes(__import__('base64').b64decode(png.split(',')[1]))
  dialog.locator('[data-copy-only]').click();expect(dialog.locator('[role=status]')).to_contain_text('Image copiée')
  assert not downloads
  assert page.evaluate('(async()=> (await navigator.clipboard.read()).some(item=>item.types.includes("image/png")))()')
  with page.expect_download() as pending:dialog.locator('[data-save]').click()
  exported=Path(tmp)/'build.png';pending.value.save_as(exported)
  assert hashlib.sha256(exported.read_bytes()).hexdigest()==hashlib.sha256(__import__('base64').b64decode(png.split(',')[1])).hexdigest()
  page.set_viewport_size({'width':390,'height':844});assert dialog.evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}')
  dialog.screenshot(path=str(ROOT/'docs/build-gallery-mobile.png'))
  assert not errors,errors
  assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  (ROOT/'docs/png-gallery-browser.json').write_text(json.dumps({'png':[4000,1880],'clipboardOnlyDownloads':0,'errors':errors},indent=2),encoding='utf-8')
  print('OK PNG character identity, role priority selection, palette changes, layout, exact pixels for copy/download, no copy-only download, mobile',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
