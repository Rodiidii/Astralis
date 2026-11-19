"""Open each reviewed character and operate its actual buff control in the lab."""
import threading
import sys
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT, Quiet, Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(service_workers='block')
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.route('**/*',lambda r:r.fulfill(body='<main></main>',content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  keys=page.evaluate('''async(batch)=>{
   const lab=await import('/src/lab-page.js'),module=await import(batch==='next'?'/src/lab-reviewed-next-twenty.js':'/src/lab-reviewed-twenty.js');const profiles=module.NEXT_TWENTY_REVIEWED_BUFFS||module.TWENTY_REVIEWED_BUFFS;
   const manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json());
   const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   const snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const characters=Object.entries(manifest.characters).map(([key,r])=>({_id:key,id:r.id,_name:r.name}));
   window.openReviewed=(key)=>{
    localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:key,referenceCharacter:key,tab:'buffs',buffOwner:-1,level:90,constellation:6,talent:'',attackSelection:'',allies:[],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
    document.querySelector('main').innerHTML=lab.renderDamageLab({characters,weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot});lab.initDamageLab();
    const path=Object.keys(profiles[key])[0];if(!path)return {automatic:true};const c=manifest.characters[key].conditions.find(c=>c.path===path);return {path,value:c.options.at(-1)};
   };return Object.keys(profiles);
  }''','next' if '--next' in sys.argv else 'first')
  selected=next((arg.split('=',1)[1].split(',') for arg in sys.argv if arg.startswith('--only=')),keys)
  for key in keys:
   if key not in selected:continue
   choice=page.evaluate('(key)=>window.openReviewed(key)',key)
   if choice.get('automatic'):
    page.locator('.lab-source-buffs').wait_for(state='attached')
    page.locator('.lab-source-buffs details').evaluate_all('(els)=>els.forEach(el=>el.open=true)')
    assert '+1 niveau' in page.locator('.lab-source-buffs').inner_text()
    print(key,'bonus automatique présent',flush=True)
    continue
   control=page.locator(f'[data-lab-source-buff="-1"][data-source-path="{choice["path"]}"]')
   control.wait_for(state='attached')
   assert control.count()==1,(key,'duplicate control')
   control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
   assert control.is_enabled(),(key,'locked at C6/90')
   if control.get_attribute('type')=='checkbox':control.check()
   else:control.select_option(choice['value'])
   row=control.locator('xpath=ancestor::div[contains(@class,"lab-source-condition")]')
   assert row.locator('.lab-condition-help').first.inner_text().strip(),(key,'missing explanation')
   output=row.locator('[data-source-buff-value]')
   page.wait_for_function('(el)=>el.textContent.trim()&&!el.textContent.includes("Calcul de")',arg=output.element_handle())
   assert 'indisponible' not in output.inner_text().lower(),(key,output.inner_text())
   print(key,output.inner_text(),flush=True)
  assert not errors,errors
  browser.close()
finally:
 server.shutdown()
