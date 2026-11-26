"""Full app integration and real sourced lab calculations, isolated storage."""
import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch()
  page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block')
  expect.set_options(timeout=90000)
  page.set_default_timeout(90000);errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):
    r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,renderModal,builderDraft};',content_type='application/javascript')
   elif url.startswith(base+'/api/'):r.fulfill(json={})
   elif url.startswith(base):r.continue_()
   else:r.abort()
  page.route('**/*',route)
  page.add_init_script("localStorage.setItem('astralis:active-game','gi');localStorage.setItem('astralis:gi:assistant-profile','{\"enabled\":false}')")
  page.goto(base,wait_until='domcontentloaded')
  page.wait_for_selector('#astralis-launch-screen',state='detached')
  page.wait_for_function('window.combatQA!==undefined')
  page.evaluate('''async()=>{
   const {state,render}=combatQA;
   // This integration test supplies local catalog fixtures; network catalog errors
   // from the startup dashboard must not replace them during the assertions.
   Object.defineProperty(state,'catalogErrors',{configurable:true,get:()=>({}),set:()=>{}});
   const manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json());
   const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   const snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const chars=Object.entries(manifest.characters).map(([key,row])=>({_id:key,id:row.id,_category:'character',_name:row.name,elementText:({Skirk:'Cryo',Furina:'Hydro',Mavuika:'Pyro',Zhongli:'Geo'})[key]||'Hydro',weaponType:'sword',_labImage:row.id?'/assets/relations/portraits/'+row.id+'.png':null,_labSplash:row.id?'/assets/genshin/splashes/'+row.id+'.webp':null}));
   state.catalogs['gi:character']=chars;state.catalogs['gi:weapon']=[];state.catalogs['gi:artifact']=[];state.labSources=snapshot;
   localStorage.setItem('astralis:gi:builds',JSON.stringify([{id:'qa-build',name:'Skirk · essai',character:'Skirk',level:90,constellation:'C0',pieces:[],weaponLevelValue:90}]));
   localStorage.setItem('astralis:teams:gi',JSON.stringify([{id:'qa-team',name:'Équipe Skirk',members:[{character:'Skirk',buildId:'qa-build',role:'main-dps'},{character:'Furina',buildId:'qa-furina',role:'support'},{character:'Mavuika',buildId:'qa-mavuika',role:'sub-dps'},{character:'Zhongli',buildId:'qa-zhongli',role:'support'}],rotation:[{type:'skill',character:'Skirk',name:'Compétence',code:'E'}]}]));
   const builds=JSON.parse(localStorage.getItem('astralis:gi:builds'));for(const c of ['Furina','Mavuika','Zhongli'])builds.push({...builds[0],id:'qa-'+c.toLowerCase(),character:c,name:c+' · test'});localStorage.setItem('astralis:gi:builds',JSON.stringify(builds));state.game='gi';state.section='teams';render();
  }''')
  expect(page.locator('.combat-studio.cs-teams')).to_be_visible()
  expect(page.locator('[data-action=new-team]:visible')).to_have_count(1)
  expect(page.locator('.team-stat-card')).to_have_count(4)
  page.wait_for_function("()=>{const e=document.querySelector('.team-four-stats');return e&&getComputedStyle(e).gridTemplateColumns.split(' ').length===4}")
  assert page.locator('.team-four-stats').evaluate("e=>new Set([...e.children].map(c=>Math.round(c.getBoundingClientRect().top))).size")==1
  page.wait_for_function("()=>[...document.querySelectorAll('.team-stat-card img')].every(i=>i.complete&&i.naturalWidth>0)")
  page.locator('.team-four-stats').screenshot(path=str(ROOT/'docs/team-four-stats.png'))
  assert page.locator('rotation-rehearsal').count()==0
  assert page.locator('[data-cs-tab]').count()==2
  page.locator('.cr-library-drawer > summary').click()
  page.locator('[data-team-library-search]').fill('Skirk')
  expect(page.locator('.team-search-record:visible')).to_have_count(1)
  page.locator('[data-team-library-search]').fill('')
  page.locator('.cr-library-drawer > summary').click()
  page.locator('[data-team-details-toggle]').first.click()
  page.wait_for_function("()=>[...document.querySelectorAll('.cr-team-illustration')].every(i=>i.complete&&i.naturalWidth>0)")
  page.evaluate("()=>{document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=0});scrollTo(0,0)}");page.wait_for_timeout(400);page.screenshot(path=str(ROOT/'docs/combat-equipes-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'team overflow'
  page.set_viewport_size({'width':1440,'height':1000})
  page.locator('[data-cs-tab=energy]').click()
  expect(page.locator('.te-workbench')).to_be_visible()
  assert page.locator('.te-member').count()==4
  for i in range(4):page.locator(f'[data-energy-member="{i}"] [data-energy-field=particles]').fill('4')
  assert page.locator('.te-warning').count()==0
  assert page.locator('.te-results article').count()==4
  page.locator('.te-workbench').screenshot(path=str(ROOT/'docs/team-energy.png'))
  page.locator('[data-cs-tab=workspace]').click()
  assert page.evaluate("combatQA.builderDraft({members:[{character:'Skirk'}]}).members.length")==4
  page.evaluate("()=>{combatQA.state.builder={...combatQA.builderDraft(JSON.parse(localStorage.getItem('astralis:teams:gi'))[0]),_editing:true};combatQA.renderModal()}")
  expect(page.locator('.team-editor-v2')).to_be_visible()
  for width in [1366,390]:
   page.set_viewport_size({'width':width,'height':768})
   assert page.locator('.team-editor-v2').evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}')
  page.set_viewport_size({'width':1366,'height':768})
  page.locator('[data-builder-slot="1"]').click()
  expect(page.locator('.builder-slot-person')).to_contain_text('Furina')
  assert page.locator('.team-editor-v2 .modal-header').evaluate("e=>{const r=e.getBoundingClientRect();return e.closest('.team-editor-v2').contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))}")
  page.locator('.team-editor-v2').screenshot(path=str(ROOT/'docs/team-editor.png'))
  page.locator('[data-slot-picker="1:character"]').click()
  expect(page.locator('.entity-picker-modal')).to_be_visible()
  assert page.locator('.entity-picker-modal').evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}')
  assert page.locator('[data-pick-entity="Skirk"]').count()==0
  page.evaluate("()=>{combatQA.state.details['gi:Bennett']={skills:[],constellations:[]}}")
  page.locator('[data-pick-entity="Bennett"]').click()
  page.wait_for_function("()=>combatQA.state.builder.members[1].character==='Bennett'&&!combatQA.state.picker")
  assert page.evaluate("combatQA.state.builder.members[1].buildId") == ''
  page.locator('[data-team-field=name]').fill('Équipe pratique')
  page.locator('[data-save-team]').click()
  assert page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi'))[0].name")=='Équipe pratique'
  page.set_viewport_size({'width':1440,'height':1000})
  page.evaluate("()=>{combatQA.state.buildCharacter='Skirk';combatQA.state.buildId='qa-build';combatQA.state.section='builds';combatQA.render()}")
  expect(page.locator('.combat-studio.cs-builds')).to_be_visible()
  expect(page.locator('.build-editor')).to_be_visible()
  expect(page.locator('.build-stat-grid b')).to_have_count(8)
  expect(page.locator('.cr-build-stage')).to_be_visible()
  expect(page.locator('.cr-piece-drawer')).to_have_count(5)
  assert page.locator('[data-cs-tab]').count()==1
  page.locator('.cr-piece-drawer').first.locator(':scope > summary').click()
  page.locator('.cr-piece-drawer').first.locator(':scope > summary').click()
  for width in [1366,390]:
   page.set_viewport_size({'width':width,'height':900})
   assert page.locator('.cr-piece-drawer').first.locator('.build-stat-input').evaluate_all("rows=>rows.every(r=>{const s=r.querySelector('select').getBoundingClientRect(),i=r.querySelector('input').getBoundingClientRect();return s.width>70&&i.width>60&&s.right<=i.left+1&&i.right<=r.getBoundingClientRect().right+1})")
  page.set_viewport_size({'width':1440,'height':1000})
  page.locator('.cr-piece-drawer').first.screenshot(path=str(ROOT/'docs/build-piece-edit.png'))
  page.locator('.cr-piece-drawer').nth(1).locator(':scope > summary').click()
  expect(page.locator('.cr-piece-drawer').nth(1)).to_have_attribute('open','')
  page.locator('input[data-build-field=name]').fill('Skirk · vitrine')
  page.locator('[data-action=build-save]').click()
  assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:builds')).find(b=>b.id==='qa-build').name")=='Skirk · vitrine'
  expect(page.locator('.cr-build-stage')).to_be_visible()
  assert page.locator('.cr-build-identity .build-portrait-hero').evaluate('e=>e.getBoundingClientRect().height')>300
  assert page.locator('.cr-build-identity .build-portrait-hero').evaluate('e=>Math.abs(e.getBoundingClientRect().top-e.parentElement.getBoundingClientRect().top)')<3
  page.evaluate("()=>{document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=0});scrollTo(0,0)}");page.wait_for_timeout(400);page.screenshot(path=str(ROOT/'docs/combat-builds-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'build overflow'
  page.set_viewport_size({'width':1440,'height':1000})
  page.evaluate('''()=>{
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'Skirk',referenceCharacter:'Skirk',elementKey:'cryo',tab:'overview',level:90,constellation:0,talentLevel:10,attackSelection:'wr:normal.0',actionKind:'normal',targetName:'Flash à sept phases',hitCount:1,critMode:'average',wrConditions:{Skirk:{skillActive:'on',a4DeathStacks:'2'}},allies:[{character:'Furina',level:90,constellation:0,wrConditions:{Furina:{burstFanfare:'250'}}}],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
   combatQA.state.section='lab';combatQA.render();
  }''')
  expect(page.locator('.combat-studio.cs-lab')).to_be_visible()
  result=page.evaluate('''async()=>{
   const lab=await import('/src/lab-page.js?v=20261126-reading-studio-2');const p=lab.readResearchScenario();
   const before=JSON.stringify(p),a=await lab.evaluateResearchScenario(p),b=await lab.evaluateResearchScenario({...structuredClone(p),resistance:50}),c=await lab.evaluateResearchScenario({...structuredClone(p),allies:[]});
   if(!a.ok||!b.ok||!c.ok)throw Error(JSON.stringify({a,b,c}));
   return {a:a.total,b:b.total,c:c.total,unchanged:before===JSON.stringify(lab.readResearchScenario())};
  }''')
  assert result['a']>result['b']>0,result
  assert result['a']>result['c']>0,result
  assert result['unchanged'],result
  expect(page.locator('.cp-lab-party > .lab-buff-roster')).to_be_visible()
  page.locator('[data-lab-buff-owner="0"]').click()
  expect(page.locator('.cp-lab-party [data-buff-slot="0"]')).to_be_visible()
  page.locator('[data-lab-tab=overview]').click();expect(page.locator('.lab-preparation > .lab-tabs')).to_be_visible();page.locator('[data-lab-action=calculate]').first.click();page.wait_for_function("()=>/\\d/.test(document.querySelector('[data-lab-damage]').textContent)");page.evaluate("()=>{document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=0});scrollTo(0,0)}");page.wait_for_timeout(400);page.screenshot(path=str(ROOT/'docs/combat-laboratoire-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844})
  if not page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'):
   print(page.evaluate("()=>[...document.querySelectorAll('.combat-studio *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2&&e.getBoundingClientRect().width>0).map(e=>[e.className,Math.round(e.getBoundingClientRect().right)]).slice(0,12)"),flush=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'lab overflow'
  page.screenshot(path=str(ROOT/'docs/combat-laboratoire-mobile.png'),full_page=True)
  assert not errors,errors
  (ROOT/'docs/combat-lab-observed.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
  print('OK : quatre stats, recharge, éditeur d’équipe, artéfacts sans chevauchement, buffs en haut, desktop/mobile et calculs sourcés.',result,flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
