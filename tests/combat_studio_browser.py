"""Exercise every new tool in an isolated browser, never the player's profile."""
import json, threading, os
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright, expect
from voyage_browser import ROOT, Quiet, Server

def main():
 server=Server(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}'
 report=[]
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch()
   page=browser.new_page(viewport={'width':1440,'height':1000},service_workers='block')
   page.set_default_timeout(90000)
   expect.set_options(timeout=30000)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.route('**/__combat_qa',lambda r:r.fulfill(body='<html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>:root{--ink:#e9ebf3;--muted:#a3a8b8;--surface:#161b26;--surface-2:#1e2532;--bg:#0d111a;--line:#ffffff1b;--accent:#d9b875;--sans:Arial}body{background:var(--bg);color:var(--ink);font:15px Arial;margin:0;padding:30px}#app{max-width:1140px;margin:auto}button,input,select,textarea{font:inherit}.ic{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5}details>summary{cursor:pointer}</style><main id="app"><div id="page-content"></div></main></html>',content_type='text/html'))
   page.goto(base+'/__combat_qa')
   page.evaluate('''async()=>{
    const mod=await import('/src/combat-studio.js');const icons=await import('/src/icons.js');const engine=await import('/src/damage-engine.js');
    const pieces=Array.from({length:5},(_,i)=>({id:'p'+i,mainType:i?'atkPct':'hpFlat',mainValue:46.6,level:20,sub0Type:'critRate',sub0Value:10,sub1Type:'critDmg',sub1Value:20}));
    window.builds=[{id:'b1',name:'Nahida · maîtrise',character:'a',pieces,weapon:'w1'},{id:'b2',name:'Nahida · critique',character:'a',pieces:pieces.map((p,i)=>({...p,id:'q'+i,sub0Value:15})),weapon:'w2'}];
    window.teams=[{id:'t1',name:'Éclosion astrale',members:[{character:'a',buildId:'b1',role:'support'},{character:'b'}, {},{}],rotation:[{type:'skill',id:'e',key:'e',name:'Compétence',character:'a',code:'E'},{type:'burst',id:'q',key:'q',name:'Déchaînement',character:'b',code:'Q'}]},{id:'t2',name:'Seconde moitié',members:[{character:'a',buildId:'b2'},{character:'c'},{},{}],rotation:[]}];
    localStorage.setItem('astralis:gi:builds',JSON.stringify(builds));localStorage.setItem('astralis:teams:gi',JSON.stringify(teams));window.tasks=[];
    window.scenario={character:'a',talent:2,level:90,enemyLevel:100,resistance:10,defReduction:0,hitCount:1,critMode:'average',allies:[{character:'b'}],buffs:[{value:20}],weaponRefinement:1};
    window.mount=kind=>{document.querySelector('#page-content').innerHTML=kind==='builds'?'<section class="builds-hub">Atelier existant</section>':kind==='teams'?'<main class="teams-studio">Atelier existant</main>':'<div data-damage-lab>Calculateur existant</div>';mod.mountCombatStudio(document.querySelector('#page-content'),{
      section:kind,game:'gi',icon:icons.ic,characters:()=>[{id:'a',name:'Nahida'},{id:'b',name:'Furina'},{id:'c',name:'Yelan'},{id:'d',name:'Bennett'}],character:id=>({id,name:{a:'Nahida',b:'Furina',c:'Yelan',d:'Bennett'}[id]||id}),
      teams:()=>JSON.parse(localStorage.getItem('astralis:teams:gi')),saveTeam:t=>localStorage.setItem('astralis:teams:gi',JSON.stringify([t,...JSON.parse(localStorage.getItem('astralis:teams:gi')).filter(x=>x.id!==t.id)])),task:t=>tasks.push(t),
      buildStats:b=>({atk:1000,hp:15000,def:800,em:800,er:140,critRate:50+(b.pieces?.[0]?.sub0Value||0),critDmg:120,dmgBonus:46.6}),openLab:b=>window.openedLab=b.id,reload:()=>mount(kind),
      lab:{read:()=>structuredClone(scenario),restore:p=>window.scenario=p,evaluate:async p=>engine.calculateAction({stats:{atk:1000+(p.allies.length?300:0)+(p.buffs.length?200:0)+p.weaponRefinement*10,hp:10000,def:800,em:0,critRate:50,critDmg:100,er:100,dmgBonus:0},baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:p.enemyLevel,enemyResistance:p.resistance/100,enemyDefenseReduction:p.defReduction/100,hitCount:p.hitCount,critMode:p.critMode})}
    });};window.featureDefinitions=mod.COMBAT_FEATURES;
   }''')
   def tool(kind,index):
    group=page.evaluate('([kind,i])=>featureDefinitions[kind][i][0]',[kind,index])
    page.locator(f'[data-cs-tab="{group}"]').click()
    page.locator(f'[data-cs-tool-target="{index}"]').click()
    f=page.locator(f'[data-cs-form="{index}"]')
    return f
   def run(f):
    f.locator('button[type=submit]').click()
    expect(f.locator('[data-cs-result]')).not_to_be_empty()
   for kind in ['builds','teams','lab']:
    page.evaluate('(kind)=>mount(kind)',kind)
    assert page.locator('[data-cs-tab]').count()==5
    for i in range(20):
     f=tool(kind,i)
     if kind=='builds':
      if i==0:f.locator('[name=atk]').fill('2000')
      if i==1:f.locator('[name=slot0]').check()
      if i==6 or i==10:f.locator('[name=other]').select_option('b2')
      if i==13:f.locator('[name=team]').select_option('t1')
      if i==19:f.locator('[name=file]').set_input_files({'name':'build.json','mimeType':'application/json','buffer':json.dumps({'character':'a','name':'Imported','pieces':[]}).encode()})
     elif kind=='teams':
      if i==1:f.locator('[name=character]').select_option('d')
      if i==2:f.locator('[name=to]').select_option('1')
      if i==5 or i==6:f.locator('[name=other]').select_option('t2')
      if i==10:assert f.locator('input[type=number]').count()==2
      if i==11:f.locator('[name=index]').select_option('1')
      if i==15:f.locator('[name=seconds]').fill('45');f.locator('[name=success]').check()
     else:
      if i==3:
       # The first scenario is real persisted data; create the second with different parameters.
       page.evaluate("()=>{const key='astralis:gi:combat-studio:lab:v1',s=JSON.parse(localStorage.getItem(key));s.records.current.scenarios.push({id:'second',name:'B',p:{...scenario,resistance:50}});localStorage.setItem(key,JSON.stringify(s));mount('lab')}")
       f=tool('lab',i);f.locator('[name=b]').select_option('second')
     run(f)
     # Actions that rebuild the accordion expose their result in the replacement.
     f=page.locator(f'[data-cs-form="{i}"]')
     result=f.locator('[data-cs-result]').inner_text()
     assert result and not any(s in result for s in ['Choisis un autre','Choisis deux','invalide','introuvable']), (kind,i,result)
     if kind=='builds' and i==10:
      f.locator('[data-cs-secondary=apply-swap]').click()
      assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:builds'))[0].pieces[0].id")=='q0'
     if kind=='teams' and i==1:
      f.locator('[data-cs-secondary=swap-bench]').click()
      assert page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi')).find(t=>t.id==='t1').members[0].character")=='d'
     if kind=='teams' and i==14:
      f.locator('[data-cs-secondary=stop-clock]').click()
     if kind=='teams' and i==11:f.locator('[data-cs-secondary=apply-opening]').click()
     if kind=='lab' and i==2:f.locator('[data-cs-secondary=compare-baseline]').click();expect(f.locator('[data-cs-result]')).to_contain_text('Écart')
     if kind=='builds' and i==15:
      page.evaluate("()=>{const k='astralis:gi:builds',b=JSON.parse(localStorage.getItem(k));b.find(x=>x.id==='b1').name='Changed';localStorage.setItem(k,JSON.stringify(b))}")
      f.locator('[data-cs-secondary=restore-build]').click()
      assert page.evaluate("JSON.parse(localStorage.getItem('astralis:gi:builds')).find(x=>x.id==='b1').name")=='Nahida · maîtrise'
     if kind=='teams' and i==18:
      page.evaluate("()=>{const k='astralis:teams:gi',t=JSON.parse(localStorage.getItem(k));t.find(x=>x.id==='t1').name='Changed';localStorage.setItem(k,JSON.stringify(t))}")
      f.locator('[data-cs-secondary=restore-team]').click()
      assert page.evaluate("JSON.parse(localStorage.getItem('astralis:teams:gi')).find(x=>x.id==='t1').name")=='Éclosion astrale'
     if kind=='lab' and i==1:
      f.locator('[data-cs-secondary=restore-scenario]').click()
      assert page.evaluate('scenario.character')=='a'
     if kind=='lab' and i==19:
      f.locator('[name=file]').set_input_files({'name':'scenario.json','mimeType':'application/json','buffer':json.dumps({'character':'a','enemyLevel':90,'resistance':20,'hitCount':1,'critMode':'average','allies':[],'buffs':[],'weaponRefinement':1}).encode()})
      f.locator('[data-cs-secondary=import-scenario]').click()
      assert page.evaluate('scenario.resistance')==20
     report.append({'page':kind,'tool':i+1,'result':result[:160]})
    # Values persist through remount and mobile cards do not overflow.
    page.evaluate('(kind)=>mount(kind)',kind)
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[data-cs-tab]').nth(1).click()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),kind
    page.screenshot(path=str(ROOT/'docs'/f'combat-{kind}-mobile.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1000})
    page.screenshot(path=str(ROOT/'docs'/f'combat-{kind}-tools.png'),full_page=True)
   assert len(report)==60 and not errors,(len(report),errors)
   (ROOT/'docs'/'combat-studio-observations.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
   browser.close()
  print('OK : 60 outils exécutés, écritures isolées, échange de pièces, banc de remplacement et vue mobile.')
 finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
