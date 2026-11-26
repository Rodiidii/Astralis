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
  browser=pw.chromium.launch();context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(60000);page.set_default_navigation_timeout(120000);expect.set_options(timeout=60000);errors=[];downloads=[]
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
  print('New CalcSheets',flush=True)
  page.evaluate("()=>{localStorage.setItem('astralis:gi:calc-sheets',JSON.stringify([{id:'design-sheet',title:'Flins · Variante A',time:20,dpr:30000,dps:1000,color:'#a8cbbb',members:[{name:'Flins',dps:750,weapon:'Lance de Favonius'},{name:'Ineffa',dps:250},{name:'Aino'},{}],notes:'Même ennemi, mêmes buffs',rotation:'Flins E → Ineffa E'}]));combatQA.state.section='calc';combatQA.render()}")
  expect(page.locator('[data-calc-workspace]')).to_be_visible();expect(page.locator('.cw-member')).to_have_count(4);expect(page.locator('.cw-consistency')).to_have_class(__import__('re').compile('has-warning'))
  page.locator('[data-cc=recalculate]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].dps")==1500
  page.locator('[data-cc=sum]').click();assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:calc-sheets'))[0].dpr")==20000
  page.locator('[data-cc=baseline]').click();page.locator('[data-cc=snapshot]').click();page.locator('[data-cc=clone]').click();expect(page.locator('.cw-library-sheet')).to_have_count(2);page.locator('[data-cc=rotation][data-member="0"][data-code="Q"]').click();expect(page.locator('[data-cc-field=rotation]')).to_contain_text('Flins Q')
  page.locator('[data-cc-field=title]').fill('Flins · Ultime');page.locator('[data-cc-field=title]').press('Tab');expect(page.locator('.cw-library-sheet.is-active')).to_contain_text('Ultime')
  with page.expect_download() as d:page.locator('[data-cc=csv]').click()
  target=Path(tmp)/'sheet.csv';d.value.save_as(target);assert 'Flins' in target.read_text(encoding='utf-8-sig')
  page.locator('[data-cc=copy]').click();assert 'Flins' in page.evaluate('navigator.clipboard.readText()')
  page.locator('.cw-page-head').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/calcsheets-new-desktop.png'))
  page.set_viewport_size({'width':390,'height':844});page.wait_for_function('document.querySelector(".workspace").getBoundingClientRect().left<20');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('.cw-sheet-head').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/calcsheets-new-mobile.png'));page.set_viewport_size({'width':1440,'height':1000})
  print('Companion conversations',flush=True)
  page.evaluate("async()=>{const {saveAssistantProfile}=await import('/src/assistant.js');saveAssistantProfile({id:'companion-1',name:'Voyageur QA',companion:'Mavuika',personaCharacter:'10000106',goal:'Préparer Flins',enabled:true,proactive:false});combatQA.state.section='assistant';combatQA.render()}")
  expect(page.locator('.companion-lounge')).to_be_visible();page.locator('#lounge-question').fill('Revoir mon équipe');page.locator('#lounge-question').press('Enter');expect(page.locator('.cl-message.is-guide')).to_have_count(1);expect(page.locator('.cl-message.is-guide')).to_contain_text('recharge');page.locator('#lounge-question').fill('continue');page.locator('#lounge-question').press('Enter');expect(page.locator('.cl-message.is-guide').last).to_contain_text('Favonius')
  page.locator('.cl-message.is-guide [data-cl=keep]').last.click();expect(page.locator('.cl-saved-list')).to_contain_text('Favonius')
  page.locator('[data-cl=tool][data-tool=decisions]').click();page.locator('[data-cl-form=decision] [name=title]').fill('Revoir Flins');page.locator('[data-cl-form=decision] [name=reason]').fill('Tester la recharge avant de changer les artéfacts');page.locator('[data-cl-form=decision] button').click();expect(page.locator('.cl-saved-list')).to_contain_text('Revoir Flins')
  page.locator('[data-cl=tool][data-tool=focus]').click();page.locator('[data-cl=start-session][data-minutes="15"]').click();page.evaluate("()=>{const s=JSON.parse(localStorage.getItem('astralis:companion-lounge:v1'));s.profiles['companion-1'].session.started-=61000;localStorage.setItem('astralis:companion-lounge:v1',JSON.stringify(s))}");page.locator('[data-cl=stop-session]').click();expect(page.locator('.cl-saved-list')).to_contain_text('1 min')
  page.locator('[data-cl-form=debrief] textarea').fill('Une rotation testée.');page.locator('[data-cl-form=debrief] button').click();expect(page.locator('.cl-saved-list')).to_contain_text('Une rotation testée.')
  page.evaluate("()=>combatQA.renderPageOnly()");expect(page.locator('.cl-message.is-guide')).to_have_count(2)
  page.locator('[data-cl=quiet]').click();page.evaluate("()=>combatQA.showAssistantToast({char:combatQA.state.catalogs['gi:character'].find(c=>c._id==='10000106'),text:'Message de contrôle',kind:'En passant',duration:10})");expect(page.locator('.assistant-toast')).to_have_count(0)
  page.locator('[data-cl=quiet]').click();page.evaluate("()=>combatQA.showAssistantToast({char:combatQA.state.catalogs['gi:character'].find(c=>c._id==='10000106'),text:'Ce message est lisible immédiatement et reste dans la boîte de réception.',kind:'Petit mot',duration:10})");expect(page.locator('.assistant-toast')).to_contain_text('immédiatement');page.locator('.assistant-toast').screenshot(path=str(ROOT/'docs/companion-message-new.png'));page.locator('.assistant-toast-close').click();page.locator('[data-cl=pane][data-pane=inbox]').click();expect(page.locator('.cl-inbox-message')).to_contain_text('immédiatement');page.locator('[data-cl=pane][data-pane=chat]').first.click()
  page.locator('.cl-hero').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/companion-lounge-desktop.png'))
  page.locator('[data-cl=pane][data-pane=settings]').first.click();expect(page.locator('.assistant-character-picker')).to_be_visible();page.locator('[data-assistant-field=goal]').fill('Tester mes rotations');page.locator('[data-action=assistant-save-profile]').click();expect(page.locator('[data-assistant-field=goal]')).to_have_value('Tester mes rotations')
  page.locator('[data-cl=pane][data-pane=chat]').first.click();page.set_viewport_size({'width':390,'height':844});page.wait_for_function('document.querySelector(".workspace").getBoundingClientRect().left<20');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('.cl-chat').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/companion-lounge-mobile.png'));page.set_viewport_size({'width':1440,'height':1000})
  print('Booster integration',flush=True)
  page.evaluate("()=>{combatQA.state.section='boosters';combatQA.render()}");print('Booster page navigation',flush=True);expect(page.locator('.pokemon-booster-page')).to_be_visible();print('Booster catalogue ready',flush=True);page.locator('[data-booster-studied-set=sv05]').click();print('Booster set chosen',flush=True);expect(page.locator('.pack-odds-panel')).to_contain_text('16,83');page.locator('[data-booster-action=open][data-booster-count="1"]').first.click();page.wait_for_function('()=>JSON.parse(localStorage.getItem("astralis:booster-session:v1"))?.cards?.length===10');print('Booster opened',flush=True);pack=page.evaluate('JSON.parse(localStorage.getItem("astralis:booster-session:v1"))');assert pack['mode']=='documented';assert all(c['card']['setId']=='sv05' for c in pack['cards']);assert sum(c['finish']!='normal' for c in pack['cards'])==3
  page.locator('.booster-close').click();page.screenshot(path=str(ROOT/'docs/booster-rates-new.png'))
  assert not errors,errors;assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors');print('OK CalcSheets edits/calculations/variants/export/mobile, companion threads/context/memories/sessions/settings/quiet/messages/mobile, real documented booster slots',flush=True);browser.close()
finally:server.shutdown();server.server_close()
