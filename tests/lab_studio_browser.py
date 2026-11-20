import os
import re
import threading
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright
from voyage_browser import ROOT,Quiet,Server

server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
css=''.join(f'<link rel="stylesheet" href="{href}">' for href in re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"',(ROOT/'index.html').read_text(encoding='utf-8')) if not href.startswith('http'))
html='<meta charset="utf-8">'+css+'''<style>body{margin:0;background:#0b0d12}main{margin-left:230px;padding:22px;min-width:0}.test-sidebar{position:fixed;inset:0 auto 0 0;width:230px;background:#13141a;border-right:1px solid #ffffff10;padding:28px;color:#eee;font:14px system-ui}.test-sidebar b{letter-spacing:3px}.test-sidebar p{color:#8b869b;font-size:12px;margin-top:40px}.test-sidebar strong{display:block;color:#d5c3ff;background:#c4b5fd12;border-radius:9px;padding:12px;margin-top:25px}@media(max-width:720px){main{margin:0;padding:10px}.test-sidebar{display:none}}</style><aside class="test-sidebar"><b>ASTRALIS</b><p>ATELIER DE BUILDS</p><strong>Laboratoire de dégâts</strong></aside><main></main>'''
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(service_workers='block',viewport={'width':1440,'height':1000})
  page.set_default_timeout(60000)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda r:r.fulfill(body=html,content_type='text/html') if r.request.url==base+'/harness' else r.continue_() if r.request.url.startswith(base) else r.abort())
  page.goto(base+'/harness')
  page.evaluate('''async()=>{
   const lab=await import('/src/lab-page.js'),manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json()),aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json()),snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const characters=Object.entries(manifest.characters).map(([key,row])=>({_id:key,id:row.id,_name:row.name,elementText:key==='Skirk'?'Cryo':'',_labImage:row.id?'/assets/relations/portraits/'+row.id+'.png':null,_labSplash:row.id?'/assets/genshin/splashes/'+row.id+'.webp':null}));
   localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({character:'Skirk',referenceCharacter:'Skirk',elementKey:'cryo',tab:'overview',buffSlot:-1,level:90,constellation:0,talentLevel:10,attackSelection:'wr:normal.0',actionKind:'normal',targetName:'Flash à sept phases · première frappe',wrConditions:{Skirk:{skillActive:'on',a4DeathStacks:'2'}},allies:[{character:'Furina',level:90,constellation:0,wrConditions:{Furina:{burstFanfare:'250'}}}],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
   document.querySelector('main').innerHTML=lab.renderDamageLab({characters,weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot});lab.initDamageLab();
  }''')
  page.locator('[data-lab-target-attack] option[value="wr:normal.0"]').wait_for(state='attached')
  page.locator('[data-lab-action=calculate]').click()
  page.wait_for_function("()=>/\\d/.test(document.querySelector('[data-lab-damage]').textContent)")
  assert page.locator('[role=tab]').count()==6
  assert page.locator('.lab-studio').count()==1
  page.evaluate('scrollTo(0,0)')
  page.screenshot(path=str(Path(os.environ['TEMP'])/'astralis-studio-desktop.png'))
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  page.locator('#lab-tab-buffs').click()
  page.locator('[data-received-member=Skirk]').wait_for(state='attached')
  assert not page.locator('.lab-scenario-panel').evaluate('(el)=>el.open')
  page.locator('.lab-tabs').scroll_into_view_if_needed()
  page.screenshot(path=str(Path(os.environ['TEMP'])/'astralis-studio-buffs.png'))
  for tab in ['talents','optimizer','rotation','priority','overview']:
   page.locator('#lab-tab-'+tab).click()
   assert page.locator('#lab-view-'+tab).is_visible()
  page.locator('.lab-build-drawer').evaluate('(el)=>el.open=true')
  assert page.locator('.lab-weapon-bench').is_visible()
  page.locator('.lab-build-drawer').evaluate('(el)=>el.open=false')
  page.set_viewport_size({'width':390,'height':844})
  page.evaluate('scrollTo(0,0)')
  page.screenshot(path=str(Path(os.environ['TEMP'])/'astralis-studio-mobile.png'))
  if not page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'):
   print(page.evaluate("()=>[...document.querySelectorAll('.lab-studio *')].filter(el=>el.getBoundingClientRect().right>innerWidth+2&&el.getBoundingClientRect().width>0).map(el=>[el.tagName,el.className,Math.round(el.getBoundingClientRect().right)]).slice(0,20)"),flush=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  for tab in ['buffs','optimizer','rotation','talents']:
   page.locator('#lab-tab-'+tab).click()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),tab
  page.locator('#lab-tab-buffs').click()
  page.locator('.lab-tabs').scroll_into_view_if_needed()
  page.screenshot(path=str(Path(os.environ['TEMP'])/'astralis-studio-mobile-buffs.png'))
  page.locator('.lab-build-drawer').evaluate('(el)=>el.open=true')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'mobile build drawer'
  page.locator('.lab-build-drawer').evaluate('(el)=>el.open=false')
  assert not errors,errors
  print('PASS: desktop/mobile layout, six tabs, weapon drawer, live damage and buffs',flush=True)
  browser.close()
finally:
 server.shutdown()
 server.server_close()
