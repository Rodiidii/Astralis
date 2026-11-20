"""Open each reviewed character and operate its actual buff control in the lab."""
import threading
import sys
sys.stdout.reconfigure(encoding="utf-8")
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
   const lab=await import('/src/lab-page.js'),module=await import(batch==='final'?'/src/lab-reviewed-final-roster.js':batch==='third'?'/src/lab-reviewed-third-twenty.js':batch==='next'?'/src/lab-reviewed-next-twenty.js':'/src/lab-reviewed-twenty.js');const profiles=module.FINAL_ROSTER_BUFFS||module.THIRD_TWENTY_REVIEWED_BUFFS||module.NEXT_TWENTY_REVIEWED_BUFFS||module.TWENTY_REVIEWED_BUFFS;
   const manifest=await fetch('/data/lab-character-conditions.json').then(r=>r.json());
   const aliases=await fetch('/public/gi-name-aliases.json').then(r=>r.json());
   const snapshot=await fetch('/data/lab-source-snapshot.json').then(r=>r.json());
   const characters=Object.entries(manifest.characters).map(([key,r])=>({_id:key,id:r.id,_name:r.name}));
   const adapter=await import('/src/lab-wr-adapter.js'),engine=await adapter.loadWrEngine();
   window.openReviewed=(key)=>{
    const finalChoices={Aloy:['A1'],Amber:['A4'],AratakiItto:['burst'],Chasca:['c6FatalRounds','skill.shellDmg'],Dahlia:['burstActive'],Durin:['a1WhiteDendro','normal.0',{burstForm:'white'}],Escoffier:['a4SkillBurstHit'],Ifa:['a4NsBurst'],Illuga:['c4BurstActive'],Jahoda:['a4Heal'],Kachina:['a1NightsoulBurst'],Kaeya:['CryoC1'],KamisatoAyaka:['afterSkillA1'],KamisatoAyato:['skillStacks'],Kaveh:['afterBurst'],Kinich:['c2Hit'],KukiShinobu:['underHP'],LanYan:['c4AfterBurst'],Linnea:['a1Lumi'],Lisa:['LisaA4'],Lohen:['c6BurstMaster'],Mavuika:['a1NsBurst'],Mualani:['a4Stacks'],Nicole:['skillGraceActive'],Ningguang:['Ascension4'],Odette:['burst'],Prune:['c6RallyReaction'],Qiqi:['c4Talisman'],Razor:['A4'],Sandrone:['c1Decoding'],Sigewinne:['a1BedRest'],Skirk:['c2AfterBurst','normal.0',{skillActive:'on'}],Somnia:['superposition'],Alyosha:['skillPrecision'],Varesa:['a4NsBurst'],Varka:['a4Stacks','normal.na1'],Venti:['lockC4SkillBurst'],Vodyanitsa:['skillSong'],Xianyun:['a4HasStacks'],Xinyan:['p2Shield'],Yanfei:['p1Seals'],Yoimiya:['c2'],YumemizukiMizuki:['skillDream']};
    const finalChoice=finalChoices[key]||[/TravelerAnemo/.test(key)?'c4SkillActive':/TravelerGeo/.test(key)?'geoC1BurstArea':/TravelerElectro/.test(key)?'electroSkillAmulet':/TravelerDendro/.test(key)?'a1Stacks':/TravelerHydro/.test(key)?'suffusion':/TravelerPyro/.test(key)?'c1SkillActive':'c2Crystal',/TravelerHydro/.test(key)?'skill.dewdropDmg':'normal.0'];
    const preferred={Neuvillette:'charged.judgmentDmg',Ororon:'passive1.dmg',Dehya:'skill.fieldDmg',Sayu:'skill.kickHoldDmg',Freminet:'skill.frostDmg',Gaming:'skill.cloudstriderDmg'}[key]||'normal.0';
    const extraConditions=batch==='final'?{[key]:finalChoice[2]||{}}:key==='Dori'?{Dori:{c4BelowHp:'belowHp',c4BelowEner:'belowEner'}}:{};
    localStorage.setItem('astralis:gi:damage-lab:v1',JSON.stringify({wrConditions:extraConditions,character:key,referenceCharacter:key,tab:'buffs',buffOwner:-1,level:90,constellation:6,talent:'',attackSelection:batch==='final'?'wr:'+(finalChoice[1]||'normal.0'):batch==='third'?'wr:'+preferred:'',allies:batch==='third'&&key==='Xilonen'?[{character:'Diluc',level:90},{character:'Furina',level:90}]:[],inventoryDefaultsVersion:1,setRequirementsVersion:2}));
    document.querySelector('main').innerHTML=lab.renderDamageLab({characters,weapons:[],sourceAliases:aliases,sourceSnapshot:snapshot});lab.initDamageLab();
    const path=batch==='final'?finalChoice[0]:Object.keys(profiles[key])[0];if(!path)return {automatic:true};const c=manifest.characters[key].conditions.find(c=>c.path===path);return {path,value:c.options.at(-1)};
   };return Object.keys(profiles);
  }''','final' if '--final' in sys.argv else 'third' if '--third' in sys.argv else 'next' if '--next' in sys.argv else 'first')
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
   assert not any(word in output.inner_text().lower() for word in ['indisponible','ne produit pas','chargement']),(key,output.inner_text())
   if '--third' in sys.argv or '--final' in sys.argv:
    assert 'Aucun effet mesurable' not in output.inner_text(),(key,output.inner_text())
   print(key,output.inner_text(),flush=True)
  assert not errors,errors
  browser.close()
finally:
 server.shutdown()
