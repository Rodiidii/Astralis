"""Use the Tsaritsa catalog rows through the real lab and weapon picker."""
import threading
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
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda r:r.fulfill(body='<main></main>',content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  page.evaluate('''async()=>{
   const lab=await import('/src/lab-page.js'),f=await fetch('/tests/fixtures/tsaritsa-level-stats.json').then(r=>r.json());
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'anastasya',referenceCharacter:'anastasya',statSchema:3,tab:'overview',level:90,constellation:0,atk:0,hp:0,def:0,critRate:5,critDmg:50,er:100,elementKey:'cryo',weaponLevel:90,weaponOverride:'',talent:'',attackSelection:'',allies:[],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
   window.rerender=()=>{document.querySelector('main').innerHTML=lab.renderDamageLab({characters:[f.character],weapons:[f.weapon]});lab.initDamageLab();};window.rerender();
  }''')
  def stat(key,value):
   page.wait_for_function('([key,value])=>document.querySelector(`[data-lab-live-stat="${key}"]`)?.textContent===value',arg=[key,value])
  stat('hp','12 736');stat('atk','356');stat('def','779');stat('critDmg','88,4 %');stat('er','100 %')
  page.locator('.lab-weapon-picker>summary').click()
  page.locator('[data-lab-weapon-choice="15516"]').click()
  stat('atk','898');stat('critDmg','176,6 %')
  assert '+542' in page.locator('[data-lab-weapon-baseline]').inner_text()
  assert '88,2' in page.locator('[data-lab-weapon-baseline]').inner_text()
  page.locator('[data-lab-reference]').evaluate('(el)=>el.open=true')
  page.locator('[data-lab=talent]').evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  page.locator('[data-lab=talent]').fill('1')
  page.wait_for_function(r'()=>/\d/.test(document.querySelector("[data-lab-damage]").textContent)')
  damage=page.locator('[data-lab-damage]').inner_text()
  page.locator('[data-lab-weapon-level]').select_option('1')
  stat('atk','400');stat('critDmg','107,6 %')
  page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=damage)
  page.locator('[data-lab-weapon-level]').select_option('90')
  stat('atk','898');stat('critDmg','176,6 %')
  page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent===old',arg=damage)
  page.evaluate('()=>window.rerender()')
  stat('atk','898')
  page.locator('.lab-weapon-picker>summary').click()
  page.locator('[data-lab-weapon-choice=""]').click()
  stat('atk','356');stat('critDmg','88,4 %')
  assert not errors,errors
  print('PASS: Tsaritsa base stats, ascension, weapon ATK/substat, levels, rerender and removal',flush=True)
  browser.close()
finally:
 server.shutdown()
