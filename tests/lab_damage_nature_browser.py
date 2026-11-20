import threading
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server
server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch();page=browser.new_page(service_workers='block');page.set_default_timeout(30000);errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.route('**/*',lambda r:r.fulfill(body='<main></main>',content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  page.evaluate("""async()=>{
   const lab=await import('/src/lab-page.js');const manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json());const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());const snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const characters=Object.entries(manifest.characters).map(([key,row])=>({_id:key,id:row.id,_name:row.name}));
   window.openNature=(key,conditions={})=>{localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:key,referenceCharacter:key,tab:'buffs',buffOwner:-1,level:90,constellation:6,talent:'',attackSelection:'wr:normal.0',wrConditions:{[key]:conditions},allies:[],inventoryDefaultsVersion:1,setRequirementsVersion:2}));document.querySelector('main').innerHTML=lab.renderDamageLab({characters,weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot});lab.initDamageLab();};
  }""")
  for key,conditions,reaction in [('Ineffa',{},'lunarCharged'),('Nefer',{},'lunarBloom'),('Zibai',{},'lunarCrystallize'),('Mitya',{},'stellarConduct'),('Sandrone',{'a0StellarRadianceSc':'ss'},'stellarSwirl')]:
   page.evaluate('(args)=>openNature(...args)',[key,conditions])
   row=page.locator(f'[data-lab-attack-table] tr[data-damage-type={reaction}]').first;row.wait_for(state='attached')
   assert row.locator('td').count()==4
   assert row.locator('.lab-damage-type').inner_text().strip()
   assert 'Nature des DGT' in page.locator('[data-lab-attack-table]').inner_text()
   assert row.locator('td').nth(1).inner_text()!='À renseigner',key
   print(key,reaction,'table verified',flush=True)
  page.evaluate("()=>openNature('Sandrone')")
  page.locator('[data-lab-attack-table] table').first.wait_for(state='attached')
  radiance=page.locator('[data-source-path=a0StellarRadianceSc]');radiance.wait_for(state='attached');radiance.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName===\"DETAILS\")p.open=true;}');radiance.select_option('ss')
  page.locator('[data-lab-attack-table] tr[data-damage-type=stellarSwirl]').first.wait_for(state='attached')
  page.evaluate("()=>openNature('Ineffa')")
  control=page.locator('[data-source-path=c1AfterShield]');control.wait_for(state='attached');control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==="DETAILS")p.open=true;}');control.check()
  output=control.locator('xpath=ancestor::div[contains(@class,"lab-source-condition")]').locator('[data-source-buff-value]')
  page.wait_for_function('(el)=>el.textContent.includes("Sélénocution")',arg=output.element_handle())
  assert not errors,errors
  print('PASS: five damage natures and live reaction-specific buff amount',flush=True);browser.close()
finally:server.shutdown();server.server_close()
