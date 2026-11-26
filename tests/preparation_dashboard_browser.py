"""Functional and visual checks in an isolated browser profile; no user's saves."""
import json,threading
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=128
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
report={'errors':[],'checks':{},'formats':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=p.chromium.executable_path,args=['--disable-gpu']);context=browser.new_context(viewport={'width':1536,'height':1050},service_workers='block',reduced_motion='reduce',accept_downloads=True,permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:(report['errors'].append(str(e)),print('PAGEERROR',str(e),flush=True)))
  def route(r):
   url=r.request.url
   if not url.startswith(base):r.abort();return
   if '/assets/user/' in url:r.fulfill(status=404,body='');return
   if '/api/character-sheets/status' in url:r.fulfill(json={'ok':True,'readOnly':True,'authenticated':False});return
   if '/api/character-sheets/index' in url:r.fulfill(json={'sheets':[]});return
   if '/api/feedback/status' in url:r.fulfill(json={'ok':True,'ownerAvailable':False});return
   if '/api/gi/endgame' in url:r.fulfill(path=str(ROOT/'hosting-data/gi-endgame.json'));return
   if '/src/app.js' in url:r.fulfill(body=(ROOT/'src/app.js').read_text(encoding='utf-8')+'\nwindow.combatQA={state,render,renderPageOnly,readLocalList,repairStoredEnkaBuild};',content_type='application/javascript');return
   if '/api/' in url:r.fulfill(json={});return
   file=(ROOT/unquote(urlsplit(url).path).lstrip('/')).resolve()
   if file.is_dir():file=file/'index.html'
   if not file.is_relative_to(ROOT) or not file.is_file():r.fulfill(status=404,body='');return
   r.fulfill(path=str(file))
  page.route('**/*',route)
  page.add_init_script("""if(!sessionStorage.getItem('qa-desk')){sessionStorage.setItem('qa-desk','1');localStorage.setItem('astralis:active-game','hsr');localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');localStorage.setItem('astralis:releases:last-seen','2026-11-26-daily-desk-1');} """)
  print('Daily desk: startup',flush=True);page.goto(base,wait_until='domcontentloaded',timeout=120000);page.wait_for_selector('.hc-dashboard',timeout=90000);page.locator('#astralis-launch-screen').wait_for(state='detached',timeout=60000)
  assert page.locator('.app-frame').get_attribute('data-active-game')=='gi';report['checks']['defaultGenshin']=True
  page.add_style_tag(content='.backup-reminder,#assistant-toast-stack,.release-notes-notice{display:none!important}')
  print('Preparation: install isolated fixtures',flush=True);page.evaluate('''async()=>{
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
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify(pack.scenario));localStorage.setItem('astralis:gi:team-focus',pack.teams[0].id);localStorage.setItem('astralis:gi:assistant-profile','{"enabled":false}');state.game='gi';state.section='dashboard';

  }''')
  page.evaluate("""async()=>{const {gameDay}=await import('/src/home-command-model.js');const date=gameDay();localStorage.setItem('astralis:gi:farm-roster',JSON.stringify([{id:'10000120',active:true,priority:1},{id:'10000106',active:true,priority:2}]));localStorage.setItem('astralis:gi:talent-targets',JSON.stringify({'10000120':{levelFrom:80,levelTo:90,from:[8,8,8],to:[9,10,10]},'10000106':{levelFrom:70,levelTo:90,from:[1,6,6],to:[1,10,10]}}));localStorage.setItem('astralis:gi:farm-calendar',JSON.stringify([{id:'qa-talent',date,title:'Philosophies de l’Admonestation',category:'talent',characterId:'10000120',characterName:'Flins',resin:40,materialImage:'/assets/genshin/farm-materials/UI_ItemIcon_104306.png'},{id:'qa-mora',date,title:'Mora',category:'mora',resin:20,characterId:'10000106'},{id:'qa-later',date:'2099-12-31',title:'Hors de ce jour',resin:180}]));localStorage.setItem('astralis:home-portal:v1',JSON.stringify({person:'10000120',tracked:[],height:300}));localStorage.setItem('astralis:gi:wish-plan',JSON.stringify({currentPrimos:100,wishes:2,welkin:true,theatreGain:800}));const Store=await import('/src/store.js');Store.saveTask('gi',{id:'qa-task',title:'Finir le build de Flins',due:date,done:false,steps:[{id:'step-one',title:'Vérifier la recharge',done:false}]});combatQA.render();}""")
  page.wait_for_selector('[data-project="10000120"]');expect(page.locator('.dd-project-card')).to_have_count(2)
  print('BUILD_STATE',page.evaluate("()=>({stored:JSON.parse(localStorage.getItem('astralis:gi:builds')||'[]').map(b=>[b.id,b.character]),read:combatQA.readLocalList('astralis:gi:builds').map(b=>[b.id,b.character])})"),flush=True)
  expect(page.locator('[data-project-build=\"10000120\"]')).to_be_visible()
  print('Preparation: render real PNGs',flush=True);page.wait_for_timeout(1200);page.locator('[data-project="10000120"]').evaluate('e=>e.scrollIntoView({block:"center"})');expect(page.locator('[data-project-preview="10000120"]')).to_have_attribute('data-ready','true',timeout=120000)
  image=page.locator('[data-project="10000120"] [data-project-preview] img');expect(image).to_be_visible();assert image.evaluate('e=>e.naturalWidth')>=1000;report['checks']['realBuildPNG']=True;assert page.locator('[data-project=\"10000120\"]').evaluate('e=>e._pngCanvas.sheetAudit?.width')==2000
  print('Preparation: PNG download and clipboard',flush=True)
  with page.expect_download() as result:page.locator('[data-project-download="10000120"]').click()
  assert Path(result.value.path()).read_bytes()[:8]==b'\x89PNG\r\n\x1a\n';report['checks']['PNGdownload']=True
  page.locator('[data-project-copy="10000120"]').click();expect(page.locator('[data-project="10000120"] [data-project-status]')).to_contain_text('copié');report['checks']['PNGclipboard']=True
  page.screenshot(path=str(ROOT/'docs/preparation-projects.png'));page.locator('[data-project-preview="10000120"]').click();expect(page.locator('.astralis-png-preview canvas')).to_be_visible();page.locator('.astralis-png-preview .png-close').click();report['checks']['PNGpreview']=True
  print('Preparation: wallet and objectives',flush=True)
  page.locator('[data-ledger-claim-daily]').click();expect(page.locator('[data-ledger-primos]')).to_have_text('250');expect(page.locator('[data-ledger-day-primos]')).to_have_text('150')
  page.locator('[data-ledger-claim-daily]').click();expect(page.locator('.dd-ledger-status')).to_contain_text('déjà');expect(page.locator('[data-ledger-primos]')).to_have_text('250')
  page.locator('[data-ledger-undo]').first.click();expect(page.locator('[data-ledger-primos]')).to_have_text('160');page.locator('[data-ledger-claim-daily]').click();expect(page.locator('[data-ledger-primos]')).to_have_text('250');report['checks']['dailyWelkinNoDuplicates']=True
  page.locator('.dd-income-categories label').filter(has=page.locator('input[value=theatre]')).click();page.locator('[data-daily-income] [name=primos]').fill('620');page.locator('[data-daily-income] [type=submit]').click();expect(page.locator('[data-ledger-primos]')).to_have_text('870');report['checks']['variableTheaterIncome']=True
  page.locator('[data-preparation-task] [name=title]').fill('Brouillon à conserver');page.evaluate('()=>combatQA.renderPageOnly()');expect(page.locator('[data-preparation-task] [name=title]')).to_have_value('Brouillon à conserver');report['checks']['draftSurvivesRefresh']=True
  page.locator('[data-preparation-step]').first.check();assert page.evaluate("async()=>{const S=await import('/src/store.js');return S.tasks('gi').find(t=>t.id==='qa-task').steps[0].done}")
  page.locator('[data-preparation-task] [name=title]').fill('Préparer ma prochaine équipe');page.locator('[data-preparation-task] [name=steps]').fill('Choisir mes personnages\nTester la rotation');page.locator('[data-preparation-task] [type=submit]').click();expect(page.locator('.dd-task-list')).to_contain_text('Préparer ma prochaine équipe');report['checks']['objectivesAndSteps']=True
  expect(page.locator('.dd-endgame-card')).to_have_count(3);assert page.locator('.dd-boss-group').count()>=10;expect(page.locator('.dd-endgame-card').nth(1)).to_contain_text('Hydro');expect(page.locator('.dd-endgame-card').nth(1)).to_contain_text('prochaine rotation n’est pas encore publié');report['checks']['publishedEndgameContent']=True
  with page.expect_download() as result:page.locator('[data-preparation-export]').click()
  ics=Path(result.value.path()).read_text(encoding='utf-8');assert 'BEGIN:VCALENDAR' in ics and 'qa-talent@astralis' in ics;report['checks']['calendarExport']=True
  navs=page.locator('.side-rail .rail-nav [data-nav]').evaluate_all('es=>es.map(e=>e.dataset.nav)');assert len(navs)==len(set(navs));assert page.locator('.side-rail .rail-nav svg').count()>20;assert page.locator('.side-rail .nav-game-icon').count()==0;report['checks']['originalIcons']=True
  print('Preparation: viewport checks',flush=True)
  for width,height in [(1920,1080),(1536,1050),(1366,768),(1024,768),(768,1024),(844,390),(430,932),(390,844),(360,800),(320,740)]:
   page.set_viewport_size({'width':width,'height':height});page.evaluate('()=>{for(const e of document.querySelectorAll(".workspace,.main-content,.app-frame"))e.scrollTop=0;scrollTo(0,0)}');page.wait_for_timeout(180)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,page.evaluate('document.documentElement.scrollWidth'))
   resource=page.locator('.topbar-resources');expect(resource).to_be_visible();box=resource.bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1 and box['y']>=0,(width,box)
   for selector in ['[data-daily-income] [name=primos]','[data-daily-income] [type=submit]']:
    b=page.locator(selector).bounding_box();assert b['x']>=0 and b['x']+b['width']<=width+1,(width,selector,b)
   if width>=1366:assert page.locator('[data-daily-income]').bounding_box()['width']>=300
   report['formats'].append({'width':width,'height':height,'overflow':False,'walletVisible':True})
   if width in [1536,390]:page.screenshot(path=str(ROOT/f'docs/preparation-dashboard-{width}.png'))
  page.locator('.hc-page-head [data-au-custom]').click();dialog=page.locator('.hp-settings');expect(dialog).to_be_visible();assert dialog.bounding_box()['width']<=320;page.locator('[data-home-title=characters]').fill('Mes fiches de progression');page.locator('[data-home-widget=events]').uncheck();page.locator('.hp-settings footer [data-home-close]').click();expect(page.locator('[data-home-widget-title=characters]')).to_have_text('Mes fiches de progression');expect(page.locator('[data-home-card=events]')).to_be_hidden();report['checks']['customization']=True
  assert not report['errors'],report['errors'];report['passed']=True;print('PASS preparation dashboard',json.dumps(report,ensure_ascii=False),flush=True);browser.close()
finally:
 (ROOT/'releases').mkdir(exist_ok=True);(ROOT/'releases/preparation-dashboard-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');server.shutdown();server.server_close()
