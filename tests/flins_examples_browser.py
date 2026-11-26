"""Real page interactions with examples in isolated storage, never the user profile."""
import json,threading
from functools import partial
from playwright.sync_api import sync_playwright,expect
from voyage_browser import ROOT,Quiet,Server
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block')
  page.set_default_timeout(90000);expect.set_options(timeout=90000);errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,teamSourceAnalysis,teamSourcePending};',content_type='application/javascript')
   elif url.startswith(base+'/assets/user/combat-examples-request.json'):r.fulfill(status=404,body='')
   elif url.startswith(base+'/api/'):r.fulfill(json={})
   elif url.startswith(base):r.continue_()
   else:r.abort()
  page.route('**/*',route);page.goto(base,wait_until='domcontentloaded');page.wait_for_function('window.combatQA!==undefined')
  page.evaluate('''async()=>{
   const {state}=combatQA,manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json()),aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   Object.defineProperty(state,'catalogErrors',{configurable:true,get:()=>({}),set:()=>{}});
   const ids=['10000120','10000116','10000121','10000043','10000031'];
   state.catalogs['gi:character']=Object.entries(manifest.characters).filter(([key,row])=>ids.includes(row.id)).map(([key,row])=>({_id:'c-'+row.id,id:row.id,_category:'character',_name:row.name,name:key,elementText:({Flins:'Electro',Ineffa:'Electro',Aino:'Hydro',Sucrose:'Anemo',Fischl:'Electro'})[key],_labImage:'/assets/relations/portraits/'+row.id+'.png',_labSplash:'/assets/genshin/splashes/'+row.id+'.webp',weaponType:key==='Aino'?'claymore':key==='Sucrose'?'catalyst':key==='Fischl'?'bow':'polearm'}));
   state.catalogs['gi:weapon']=aliases.weapons.filter(r=>['13407','12401'].includes(r.id)).map(r=>({_id:'w-'+r.id,id:r.id,_category:'weapon',_name:r.en[0],name:r.en[0],rarity:4}));
   state.catalogs['gi:artifact']=aliases.artifacts.filter(r=>['15041','15025','15042','15002'].includes(r.id)).map(r=>({_id:'a-'+r.id,id:r.id,_category:'artifact',_name:r.en[0],name:r.en[0],rarity:5}));
   for(const kind of ['character','weapon','artifact']){const fixture=state.catalogs['gi:'+kind];Object.defineProperty(state.catalogs,'gi:'+kind,{configurable:true,get:()=>fixture,set:()=>{}});}
   for(const c of state.catalogs['gi:character'])state.details['gi:'+c._id]={};
   state.labSources=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const module=await import('/src/combat-examples.js'),pack=await fetch('/data/flins-examples.json').then(r=>r.json());
   localStorage.setItem('astralis:gi:builds','[{"id":"personal-build","name":"Mon build"}]');
   module.installCombatExamples(localStorage,pack,{character:state.catalogs['gi:character'],weapon:state.catalogs['gi:weapon'],artifact:state.catalogs['gi:artifact']});
   localStorage.setItem('astralis:gi:team-focus',pack.teams[0].id);state.game='gi';state.section='teams';combatQA.render();
  }''')
  expect(page.locator('.cp-lineup-slot')).to_have_count(4)
  page.wait_for_function('combatQA.teamSourcePending.size===0&&combatQA.teamSourceAnalysis.size>0')
  assert page.locator('.team-roster,.unit-art').count()==0
  assert page.locator('.is-canopy').count()==0
  assert page.locator('.cp-lineup-slot').evaluate_all('rows=>rows.every(r=>{const art=r.querySelector(".team-compact-member").getBoundingClientRect(),gear=r.querySelector(".unit-equipment").getBoundingClientRect();return gear.top>=art.bottom-1&&gear.top-art.bottom<12&&r.querySelector(".equipment-tile").getBoundingClientRect().height<56})')
  expect(page.locator('.team-stat-card')).to_have_count(4)
  for key in ['hp','atk','def']:
   assert page.locator(f'.team-stat-card [data-team-stat={key}] dd').evaluate_all('rows=>rows.every(row=>row.textContent!=="—")')
  first=page.locator('.team-stat-card').first
  first.locator('.team-member-buffs>summary').click();expect(first.locator('.team-member-buffs')).to_contain_text('Ineffa')
  page.locator('.team-four-stats').screenshot(path=str(ROOT/'docs/flins-team-stats.png'))
  page.locator('.team-stats-disclosure>summary').click();expect(page.locator('.team-four-stats')).not_to_be_visible()
  page.evaluate('combatQA.renderPageOnly()');expect(page.locator('.team-four-stats')).not_to_be_visible()
  print('OK team equipment, base/total stats, source attribution, persistent disclosure',flush=True)
  page.locator('[data-cs-tab=energy]').click();expect(page.locator('.te-workbench')).to_be_visible()
  page.locator('[data-energy-member="0"] [data-energy-field=burstVariant]').select_option('short')
  expect(page.locator('[data-energy-member="0"] [data-energy-field=cost]')).to_have_value('30')
  expect(page.locator('[data-energy-member="0"] [data-energy-field=bursts]')).to_have_value('2')
  page.locator('[data-energy-member="0"] [data-energy-field=generation]').select_option('flins-normal')
  expect(page.locator('[data-energy-member="0"] [data-energy-field=particles]')).to_have_value('5')
  page.locator('[data-energy-member="0"] [data-energy-field=events]').fill('3')
  expect(page.locator('[data-energy-member="0"] [data-energy-field=particles]')).to_have_value('3')
  print('OK Flins short burst, generation profile and live energy calculation',flush=True)
  page.locator('[data-cs-tab=workspace]').click();page.locator('[data-flins-example]').click()
  expect(page.locator('[data-damage-lab]')).to_be_visible()
  page.wait_for_function('()=>!!document.querySelector("[data-lab-target-name]")')
  result=page.evaluate('''async()=>{const m=await import('/src/lab-page.js?v=20261126-reading-studio-2');const p=m.readResearchScenario();const a=await m.evaluateResearchScenario(p);return {a,p};}''')
  assert result['a']['ok'],result
  assert result['a']['total']>0,result
  # Read back from the actual application and compare with the standalone engine.
  expected=json.loads((ROOT/'docs/flins-observed.json').read_text(encoding='utf-8'))['withTeam']
  assert abs(result['a']['total']-expected)<0.05,(result['a']['total'],expected)
  page.locator('[data-lab-action=calculate]').first.click();page.wait_for_function('()=>/\\d/.test(document.querySelector("[data-lab-damage]").textContent)')
  page.locator('.lab-live-output').screenshot(path=str(ROOT/'docs/flins-lab-result.png'))
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  page.set_viewport_size({'width':1440,'height':1000})
  page.evaluate('''()=>{
   localStorage.setItem('astralis:gi:owned-artifacts',JSON.stringify([{id:'test-imported-flower',slot:'flower',setKey:'a-15041',rarity:5,level:20,mainType:'hpFlat',mainValue:4780,substats:[{type:'critDmg',value:28},{type:'critRate',value:10.5},{type:'atkPct',value:9.9},{type:'em',value:21}]}]));
   combatQA.state.buildCharacter='c-10000120';combatQA.state.buildId='example-flins-20261126';combatQA.state.section='builds';combatQA.render();
  }''')
  expect(page.locator('.build-import-slot').first).to_be_visible()
  page.locator('.build-import-slot').first.locator(':scope>summary').click()
  page.locator('[data-owned-piece-choice="0"]').click()
  page.wait_for_function('()=>JSON.parse(localStorage.getItem("astralis:gi:builds")).find(b=>b.id==="example-flins-20261126").pieces[0].ownedArtifactId==="test-imported-flower"')
  expect(page.locator('.build-import-slot').first.locator('.build-relic-piece-list')).not_to_be_visible()
  page.locator('.build-import-slot').first.locator(':scope>summary').click()
  page.locator('.build-import-slot').first.locator('[data-relic-mode=existing]').click()
  expect(page.locator('[data-owned-piece-choice="0"]')).to_be_visible()
  print('OK imported artifact applied, inventory collapsed, Change reopens it',flush=True)
  assert page.evaluate('JSON.parse(localStorage.getItem("astralis:gi:builds")).some(b=>b.id==="personal-build")')
  assert not errors,errors
  (ROOT/'docs/flins-browser-observed.json').write_text(json.dumps({'damage':result['a']['total'],'expected':expected,'errors':errors},indent=2),encoding='utf-8')
  print('OK real Flins lab result, saved examples and mobile layout:',result['a']['total'],flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
