import threading
import os
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(service_workers='block',viewport={'width':1366,'height':900})
  page.set_default_timeout(60000)
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.route('**/*',lambda r:r.fulfill(body='<link rel="stylesheet" href="/styles/lab.css"><link rel="stylesheet" href="/styles/lab-redesign.css"><style>body{background:#10171e;color:#e8eff5;font-family:Arial}main{max-width:1300px;margin:auto}</style><main></main>',content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  page.evaluate('''async()=>{
   const lab=await import('/src/lab-page.js'),manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json()),aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json()),snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const characters=Object.entries(manifest.characters).map(([key,r])=>({_id:key,id:r.id,_name:r.name}));
   window.openReceipts=allies=>{localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'Diluc',referenceCharacter:'Diluc',tab:'buffs',buffSlot:0,level:90,constellation:0,talentLevel:10,attackSelection:'wr:normal.0',allies,inventoryDefaultsVersion:1,setRequirementsVersion:2}));document.querySelector('main').innerHTML=lab.renderDamageLab({characters,weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot});lab.initDamageLab();};
  }''')
  page.evaluate("()=>openReceipts([{character:'Xilonen',level:90,talentLevel:10,constellation:2,wrConditions:{Xilonen:{sourceActive:'on'}}},{character:'Furina',level:90}])")
  target=page.locator('[data-lab-buff-receipts]')
  page.wait_for_function("()=>document.querySelector('[data-lab-buff-receipts]').textContent.includes('Baisse de RÉS Hydro')")
  assert page.locator('[data-received-member]').count()==3
  assert 'Échantillons : Pyro / Hydro / Géo' in target.inner_text()
  assert 'ATQ' in page.locator('[data-received-member=Diluc]').inner_text()
  control=page.locator('[data-source-character=Xilonen][data-source-path=sourceActive]')
  control.wait_for(state='attached')
  control.evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement){if(p.tagName==="DETAILS")p.open=true;p.hidden=false;}}')
  control.uncheck()
  page.wait_for_function("()=>!document.querySelector('[data-lab-buff-receipts]').textContent.includes('Baisse de RÉS Hydro')")
  assert 'Baisse de RÉS Géo' in target.inner_text()
  assert 'ATQ' not in page.locator('[data-received-member=Diluc]').inner_text()
  page.evaluate("()=>openReceipts([{character:'Ineffa',level:90,constellation:1,passiveSourceStats:{atk:3000},wrConditions:{Ineffa:{c1AfterShield:'on'}}}])")
  page.wait_for_function("()=>document.querySelector('[data-received-member=Diluc]')?.textContent.includes('Sélénocution')")
  assert '+50 %' in page.locator('[data-received-member=Diluc]').inner_text()
  details=page.locator('.lab-damage-bonus-details')
  details.evaluate('(el)=>el.open=true')
  for label in ['Sélénocution','Sélénofleurissement','Sélénocristallisation','Astroconduction','Astrodispersion']:
   assert label in details.inner_text()
  assert page.locator('[data-lab-live-stat=lunarchargedDmg][data-lab-damage-bonus]').inner_text()=='50 %'
  page.locator('.lab-reaction-bonus-details').evaluate('(el)=>el.open=true')
  assert 'Élévation' in details.inner_text()
  assert 'Taux CRIT supplémentaire' in details.inner_text()
  page.locator('[data-lab-received-buffs]').screenshot(path=str(Path(os.environ['TEMP'])/'astralis-buff-receipts.png'))
  page.set_viewport_size({'width':390,'height':844})
  assert page.locator('[data-lab-received-buffs]').evaluate('(el)=>el.scrollWidth<=el.clientWidth+2')
  assert not errors,errors
  print('PASS: recipients, Xilonen composition, live disabling, lunar amounts and five reaction families',flush=True)
  browser.close()
finally:
 server.shutdown()
 server.server_close()
