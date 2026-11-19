"""The stat table must stay live across rerenders and reference-field edits."""
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
   const lab=await import('/src/lab-page.js');
   const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json()),snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const context={characters:[{_id:'diluc',id:'10000016',_name:'Diluc',elementType:'ELEMENT_PYRO'},{_id:'bennett',id:'10000032',_name:'Bennett',elementType:'ELEMENT_PYRO'}],weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot};
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'diluc',referenceCharacter:'diluc',statSchema:3,tab:'buffs',buffOwner:0,level:90,constellation:0,actionKind:'normal',attackSelection:'',talent:'',atk:1000,hp:10000,def:700,em:0,er:100,critRate:5,critDmg:50,elementKey:'pyro',resistance:10,enemyLevel:100,allies:[{character:'bennett',level:90,constellation:1,talentLevel:10}],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
   window.rerenderLab=()=>{document.querySelector('main').innerHTML=lab.renderDamageLab(context);lab.initDamageLab();};window.rerenderLab();
  }''')
  control=page.locator('[data-source-path="activeInArea"]')
  control.wait_for(state='attached')
  control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="334,8"')
  control.check()
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="565,8"')
  page.evaluate('''()=>{const k='astralis:gi:damage-lab:v1',s=JSON.parse(localStorage.getItem(k));s.tab='overview';localStorage.setItem(k,JSON.stringify(s));window.rerenderLab();}''')
  assert page.locator('[data-lab-live-stat=atk]').inner_text()=='565,8','combat stats lost after rendering the same character again'
  page.locator('[data-lab-reference]').evaluate('(el)=>el.open=true')
  page.locator('[data-lab=atk]').fill('1400')
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="1 630,9"')
  page.locator('[data-lab=atk]').fill('1600')
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="1 830,9"')
  page.evaluate('()=>window.rerenderLab()')
  assert page.locator('[data-lab-live-stat=atk]').inner_text()=='1 830,9'
  page.locator('[data-lab-tab=buffs]').click()
  control=page.locator('[data-source-path="activeInArea"]')
  control.wait_for(state='attached')
  control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  control.uncheck()
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="1 600"')
  control.check()
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="1 830,9"')
  source=page.locator('[data-lab-passive-source="0"][data-source-stat="baseAtk"]')
  source.fill('1000')
  page.wait_for_function('()=>Number(document.querySelector("[data-lab-live-stat=atk]").textContent.replace(/[\\s ]/g,"").replace(",","."))>2500')
  source.fill('')
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=atk]").textContent==="1 830,9"')
  page.evaluate('''()=>{const k='astralis:gi:damage-lab:v1',s=JSON.parse(localStorage.getItem(k));s.buffs=[{type:'atkFlat',value:100,stacks:1,active:true}];localStorage.setItem(k,JSON.stringify(s));window.rerenderLab();}''')
  assert page.locator('[data-lab-live-stat=atk]').inner_text()=='1 930,9'
  assert not errors,errors
  print('PASS: rerenders, live ATK edits, buff off/on, live source edits, and manual buffs',flush=True)
  browser.close()
finally:
 server.shutdown()
