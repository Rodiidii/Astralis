"""Exercise the real source checkbox handler and the visible stat table."""
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
  page.set_default_timeout(15000)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda r:r.fulfill(body='<html><body><main></main></body></html>',content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  page.evaluate('''async()=>{
   const m=await import('/src/lab-page.js');
   const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   const snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const weapons=(await fetch('/assets/data/gi-weapons.json').then(r=>r.json())).filter(w=>[11501,11101,11419].includes(w.id)).map(w=>({...w,_id:String(w.id),_name:w.name}));
   const characters=[{_id:'diluc',id:'10000016',_name:'Diluc',elementType:'ELEMENT_PYRO'},{_id:'bennett',id:'10000032',_name:'Bennett',elementType:'ELEMENT_PYRO'},{_id:'zhongli',id:'10000030',_name:'Zhongli',elementType:'ELEMENT_GEO'},{_id:'local-character',id:'999999',_name:'Personnage local',elementType:'ELEMENT_CRYO'},{_id:'shenhe',id:'10000063',_name:'Shenhe',elementType:'ELEMENT_CRYO'}];
   window.resetSupport=async(character)=>{
    const state=JSON.parse(localStorage.getItem('astralis:gi:damage-lab:v1'));state.allies=[{character,level:90,constellation:6,talentLevel:10}];state.attackSelection='';state.talent='';localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify(state));
    document.querySelector('main').innerHTML=m.renderDamageLab({characters,weapons,sourceAliases:aliases,sourceSnapshot:snapshot});m.initDamageLab();
   };
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'diluc',tab:'buffs',buffOwner:0,level:90,constellation:0,talent:1,attackSelection:'wr:normal.0',actionKind:'normal',elementKey:'pyro',atk:1000,hp:10000,def:700,er:100,critRate:5,critDmg:50,resistance:10,enemyLevel:100,allies:[{character:'bennett',level:90,constellation:1,talentLevel:10}],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
   document.querySelector('main').innerHTML=m.renderDamageLab({characters,weapons,sourceAliases:aliases,sourceSnapshot:snapshot});m.initDamageLab();
  }''')
  control=page.locator('[data-source-path="activeInArea"]')
  control.wait_for(state='attached')
  control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  stat=page.locator('[data-lab-live-stat="atk"]')
  before=stat.inner_text()
  control.check()
  page.wait_for_function('(before)=>document.querySelector("[data-lab-live-stat=atk]").textContent!==before',arg=before)
  after=stat.inner_text()
  print({'before':before,'after':after,'errors':errors},flush=True)
  control.uncheck()
  page.wait_for_function('(before)=>document.querySelector("[data-lab-live-stat=atk]").textContent===before',arg=before)
  page.evaluate('()=>window.resetSupport("zhongli")')
  shield=page.locator('[data-lab-source-buff="0"][data-source-path="skill"]')
  shield.wait_for(state='attached')
  shield.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  shield.check()
  page.wait_for_function('()=>document.querySelector("[data-lab-res-reduction]").textContent.includes("20 %")')
  stacks=page.locator('[data-lab-source-buff="0"][data-source-path="p1"]')
  stacks.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  stacks.select_option('5')
  page.wait_for_function('()=>document.querySelector("[data-lab-live-stat=shieldStrength]").textContent.includes("25")')
  print({'shield':page.locator('[data-lab-live-stat=shieldStrength]').inner_text(),'res':page.locator('[data-lab-res-reduction]').inner_text(),'errors':errors},flush=True)
  page.evaluate('''async()=>{const state=JSON.parse(localStorage.getItem('astralis:gi:damage-lab:v1'));Object.assign(state,{character:'local-character',referenceCharacter:'local-character',statSchema:3,hp:13188,atk:396,def:806,elementKey:'cryo',attackSelection:'',talent:'',inventoryDefaultsVersion:1});localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify(state));await window.resetSupport('bennett');}''')
  local_control=page.locator('[data-lab-source-buff="0"][data-source-path="activeInArea"]')
  local_control.wait_for(state='attached')
  local_control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  local_before=page.locator('[data-lab-live-stat=atk]').inner_text()
  local_control.check()
  page.wait_for_function('(old)=>document.querySelector("[data-lab-live-stat=atk]").textContent!==old',arg=local_before)
  print({'local_before':local_before,'local_after':page.locator('[data-lab-live-stat=atk]').inner_text(),'errors':errors},flush=True)
  page.evaluate('()=>window.resetSupport("shenhe")')
  quill=page.locator('[data-lab-source-buff="0"][data-source-path="quill"]')
  quill.wait_for(state='attached')
  quill.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  page.locator('[data-lab=talent]').evaluate('(el)=>{el.value="1";el.dispatchEvent(new Event("change",{bubbles:true}));}')
  page.locator('[data-lab-buff-calculate]').click()
  page.wait_for_function('()=>/\\d/.test(document.querySelector("[data-lab-damage]").textContent)')
  damage_before=page.locator('[data-lab-damage]').inner_text()
  quill.check()
  page.wait_for_function('(old)=>document.querySelector("[data-lab-damage]").textContent!==old',arg=damage_before)
  print({'local_cryo_damage_before':damage_before,'local_cryo_damage_after':page.locator('[data-lab-damage]').inner_text()},flush=True)
  bonuses=page.locator('.lab-damage-bonus-details')
  bonuses.locator('summary').click()
  assert bonuses.locator('[data-lab-damage-bonus]').count()==14
  assert bonuses.locator('[data-lab-live-stat=normalDmg]').is_visible()
  assert bonuses.locator('[data-lab-live-stat=pyroDmg]').is_visible()
  assert bonuses.locator('[data-lab-live-stat=cryoDmg]').is_visible()
  page.evaluate('''async()=>{const s=JSON.parse(localStorage.getItem('astralis:gi:damage-lab:v1'));s.character='diluc';s.referenceCharacter='diluc';s.hp=12980;s.atk=334.8;s.def=783;s.weaponLevel=90;localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify(s));await window.resetSupport('bennett');}''')
  page.locator('.lab-weapon-picker>summary').click()
  page.locator('[data-lab-weapon-choice="11501"]').click()
  page.wait_for_function('()=>document.querySelector("[data-lab-weapon-baseline]")?.textContent.includes("ATQ de base")')
  print({'weapon_baseline':page.locator('[data-lab-weapon-baseline]').inner_text(),'atk':page.locator('[data-lab-live-stat=atk]').inner_text()},flush=True)
  page.locator('.lab-weapon-picker>summary').click()
  page.locator('[data-lab-weapon-choice="11101"]').click()
  page.wait_for_function('()=>document.querySelector("[data-lab-weapon-level]").value==="70"')
  assert 'NaN' not in page.locator('[data-lab-live-stat=atk]').inner_text()
  assert not errors,errors
  browser.close()
finally:
 server.shutdown()
