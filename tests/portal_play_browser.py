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
  browser=pw.chromium.launch(executable_path=pw.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block',accept_downloads=True,permissions=['clipboard-read','clipboard-write'],reduced_motion='reduce');page=context.new_page();page.set_default_timeout(45000);page.set_default_navigation_timeout(120000);expect.set_options(timeout=45000);errors=[];downloads=[];published=[]
  page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e.stack,flush=True)));page.on('download',lambda d:downloads.append(d))
  def route(r):
   url=r.request.url
   if url.startswith(base+'/src/app.js'):r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,showAssistantToast,openBooster,boosterOddsMode};',content_type='application/javascript')
   elif url.startswith(base+'/assets/user/combat-examples-request.json'):r.fulfill(status=404,body='')
   elif url.startswith(base+'/api/gi/lore?'):r.fulfill(json={'extract':'# Le témoignage\nFontaine conserve un témoignage approfondi.\n# Les sources\nLe texte est chargé depuis le service de lecture.'})
   elif url.startswith(base+'/api/character-sheets/status'):r.fulfill(json={'ok':True,'readOnly':False,'adminConfigured':True,'authenticated':False,'localAdmin':True,'publishReady':True,'storage':'QA local'})
   elif url.startswith(base+'/api/character-sheets/publish'):
    payload=r.request.post_data_json['sheet'];published.append(payload);r.fulfill(json={'ok':True,'sheet':{'id':payload['id'],'version':1,'updatedAt':1800000000000}})
   elif url.startswith(base+'/api/character-sheets/index'):r.fulfill(json={'sheets':[]})
   elif url.startswith(base+'/api/character-sheets/status'):r.fulfill(json={'ok':True,'readOnly':False,'adminConfigured':True,'authenticated':False,'localAdmin':True,'publishReady':True,'storage':'QA local'})
   elif url.startswith(base+'/api/character-sheets/publish'):
    payload=r.request.post_data_json['sheet'];published.append(payload);r.fulfill(json={'ok':True,'sheet':{'id':payload['id'],'version':1,'updatedAt':1800000000000}})
   elif url.startswith(base+'/api/character-sheets/index'):r.fulfill(json={'sheets':[]})
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
  page.add_style_tag(content='.backup-reminder,.data-update-toast,.data-update-notice,#assistant-toast-stack,#theme-signature-companion{display:none!important}')

  def show(section):
   page.evaluate('(section)=>{combatQA.state.section=section;combatQA.render()}',section)
   page.wait_for_timeout(250)
   page.evaluate("()=>{window.scrollTo(0,0);document.querySelector('.workspace')?.scrollTo(0,0);document.querySelector('#page-content')?.scrollTo(0,0)}")
  def shot(name):page.screenshot(path=str(ROOT/('docs/portal-'+name+'.png')))
  print('Home portal',flush=True);show('dashboard');expect(page.locator('.home-portal')).to_be_visible()
  page.evaluate("async()=>{const S=await import('/src/store.js');S.saveTask('gi',{id:'qa-portal',title:'Préparer une équipe',due:new Date().toLocaleDateString('sv-SE'),done:false});combatQA.render()}")
  page.locator('[data-au-task=qa-portal]').click();page.wait_for_timeout(100);assert page.evaluate("async()=>{const S=await import('/src/store.js');return S.tasks('gi').find(t=>t.id==='qa-portal').done}")
  print('Customize open',flush=True);page.locator('[data-au-custom]').click();page.locator('[data-home-pref=scene]').select_option('liyue');print('Preset',flush=True);page.locator('[data-home-preset=nocturne]').click(no_wait_after=True);print('Preset ready',flush=True);page.locator('[data-home-pref=goal]').fill('Mon prochain objectif : une équipe de Teyvat');page.locator('[data-home-pref=height]').evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",'600');page.locator('[data-home-pref=particles]').uncheck();page.locator('[data-home-widget=events]').uncheck();page.locator('[data-home-move=tasks][data-direction="-1"]').click();page.locator('.hp-settings footer [data-home-close]').click()
  expect(page.locator('[data-home-card=events]')).to_be_hidden();assert page.locator('.hp-hero').bounding_box()['height']==600
  show('dashboard');expect(page.locator('[data-home-scene-label]')).to_have_text('Liyue');assert page.locator('.home-portal').get_attribute('data-home-preset')=='nocturne';shot('dashboard')
  print('Shell and top clearance',flush=True)
  assert page.locator('.side-rail').evaluate("e=>getComputedStyle(e).borderRightWidth")=='0px';assert page.locator('.topbar').evaluate("e=>getComputedStyle(e).borderBottomWidth")=='0px'
  assert page.locator('.hp-page-head').bounding_box()['y']>=page.locator('.topbar').bounding_box()['y']+page.locator('.topbar').bounding_box()['height']
  page.locator('.shell-bar-utilities > [data-shell=appearance]').click();page.locator('[data-shell-pref=shellHeader]').select_option('flow');page.wait_for_timeout(150);assert page.locator('.topbar').evaluate('e=>getComputedStyle(e).position')=='relative';page.locator('[data-shell-pref=shellRadius]').evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",'30');page.locator('[data-shell-pref=shellGap]').evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",'36');page.locator('[data-shell-pref=shellHeader]').select_option('fixed');page.locator('#shell-personalization [data-shell=close]').click()
  print('CalcSheets scroll',flush=True);page.set_viewport_size({'width':1440,'height':700});show('calc');page.locator('[data-cc=new]').first.click();page.locator('[data-cw-view=tracking]').click();library=page.locator('.cw-library');expect(library).to_be_visible();assert library.evaluate('e=>getComputedStyle(e).position')=='static'
  print('CALC_ANCESTORS',library.evaluate("e=>{const rows=[];for(let p=e;p;p=p.parentElement){let c=getComputedStyle(p);rows.push({tag:p.tagName,cls:p.className,y:p.getBoundingClientRect().top,h:p.clientHeight,sh:p.scrollHeight,sy:p.scrollTop,ov:c.overflowY,pos:c.position})}return rows}"),flush=True);before=library.bounding_box()['y'];page.evaluate("()=>{const el=document.querySelector('.cw-library');let p=el.parentElement;while(p&&!(p.scrollHeight>p.clientHeight+50&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)))p=p.parentElement;if(p)p.scrollTo({top:600,behavior:'instant'});else window.scrollTo({top:600,behavior:'instant'})}");page.wait_for_timeout(180);page.mouse.move(900,500);page.mouse.wheel(0,650);page.wait_for_timeout(200);after=library.bounding_box()['y'];print('CALC_SCROLL',before,after,page.evaluate('window.scrollY'),flush=True);shot('calc-diagnostic');assert after<before-100,(before,after);shot('calcsheets-scroll');page.locator('[data-cw-view=composition]').click();page.set_viewport_size({'width':1440,'height':1000})
  print('Genshin illustrated Arcade and Idle',flush=True);show('arcade');page.wait_for_selector('[data-al-play=idle]');expect(page.locator('.al-game-card')).to_have_count(16)
  page.locator('.al-game-card').last.scroll_into_view_if_needed();page.wait_for_timeout(300);images=page.locator('.al-genshin-cover');assert images.count()==16
  for i in range(images.count()):
   img=images.nth(i);img.scroll_into_view_if_needed();page.wait_for_timeout(50)
  page.wait_for_function("[...document.querySelectorAll('.al-genshin-cover')].every(i=>i.complete&&i.naturalWidth>0)")
  assert page.locator('.al-game-art svg').count()==0;page.locator('[data-al-play=idle]').scroll_into_view_if_needed();shot('arcade')
  page.locator('[data-al-play=idle]').click();page.wait_for_selector('.genshin-idle');expect(page.locator('.arcade-layout')).to_be_hidden();idle_key='astralis:gi:genshin-idle:v1';initial=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',idle_key);page.locator('[data-idle-collect]').click();assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).mora',idle_key)>initial['mora'];page.locator('.idle-play-modes [data-idle-mode=team]').click();page.locator('[data-idle-recruit]').first.click();assert len(page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).owned',idle_key))==2
  page.locator('.idle-play-modes [data-idle-mode=boss]').click();hp=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).bossHp',idle_key);page.locator('[data-idle-attack]').click();assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).bossHp',idle_key)<hp
  page.locator('.idle-play-modes [data-idle-mode=camp]').click();shot('idle');page.locator('[data-idle-arcade-back]').click();expect(page.locator('.al-library')).to_be_visible()
  page.locator('[data-al-play=memory]').click();expect(page.locator('.arcade-console')).to_be_visible();page.locator('.al-back').click();expect(page.locator('.al-library')).to_be_visible()
  print('Express presentation and active celebration',flush=True)
  page.evaluate("()=>{const k='astralis:express-des-mondes:v1',s=JSON.parse(localStorage.getItem(k)||'{}');s.world='gi';s.place='mondstadt';s.screen='home';s.tutorial={...(s.tutorial||{}),done:true};s.wallets={...(s.wallets||{}),mora:1000000,credits:1000000,shells:1000000};localStorage.setItem(k,JSON.stringify(s))}");show('daily-quiz');page.wait_for_selector('[data-world-root]');page.wait_for_selector('[data-industry]');print('Express mounted',flush=True);
  if page.locator('[data-exw=tutorial-start]').count():page.locator('[data-exw=tutorial-start]').click()
  page.locator('[data-experience-pref=look]').select_option('night');assert page.locator('[data-world-root]').get_attribute('data-experience-look')=='night'
  page.evaluate("async()=>{const k='astralis:express-des-mondes:v1',s=JSON.parse(localStorage.getItem(k));const {industry}=await import('/src/express-industry-model.js');Object.assign(industry(s).stock,{flora:100,wood:100,ore:100,crystal:100});localStorage.setItem(k,JSON.stringify(s));combatQA.render()}")
  page.locator('[data-industry-action=view][data-view=festival]').click();page.locator('[data-industry-action=festival][data-program=harvest]').click();expect(page.locator('.ei-festival-program.is-active')).to_be_visible();assert page.evaluate("()=>{const s=JSON.parse(localStorage.getItem('astralis:express-des-mondes:v1'));return Object.values(s.industry.festivals).some(f=>f.program==='harvest'&&f.end> Date.now())}");shot('express')
  page.locator('[data-cabin-mode=classic]').first.click();expect(page.locator('.genshin-idle')).to_be_visible();assert len(page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).owned',idle_key))==2
  page.locator('[data-cabin-mode=idle]').click();expect(page.locator('[data-world-root]')).to_be_visible();assert page.locator('[data-world-root]').get_attribute('data-experience-look')=='night'
  print('Global page starts',flush=True)
  for section in ['teams','builds','lab','farming','sheets','atlas','planner','favorites']:
   show(section);assert not page.locator('.page-recovery').count(),section
  print('Mobile',flush=True);page.set_viewport_size({'width':390,'height':844})
  for section in ['dashboard','calc','arcade','daily-quiz','teams','builds','lab','sheets','atlas']:
   show(section);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(section,page.evaluate('document.documentElement.scrollWidth'));shot(section+'-mobile')
  show('arcade');page.locator('[data-al-play=idle]').click();page.wait_for_selector('.genshin-idle');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');shot('idle-mobile')
  page.emulate_media(reduced_motion='reduce');show('dashboard');assert page.locator('.hp-sky').evaluate('e=>getComputedStyle(e).animationName')=='none'
  assert not errors,errors;assert not page.evaluate('window.qaConsoleErrors'),page.evaluate('window.qaConsoleErrors')
  print('PASS: portal customization, task, fixed/flow header, CalcSheets scrolling, 16 Genshin covers, separate Idle save/recruit/combat, Express celebration and layout, nine mobile pages, reduced motion',flush=True);browser.close()
finally:server.shutdown();server.server_close()
