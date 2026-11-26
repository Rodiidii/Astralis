import { activeEffects } from './express-adventure-engine.js?v=20261126-portal-play-1';
import { characterAnimation } from './express-character-effects.js?v=20261124-expedition-3';
import { createSceneActor } from './express-character-cinematics.js?v=20261124-expedition-3';
const stageEntities=new WeakMap(),live=new WeakMap();let serial=0;
const quiet=(stage,s)=>s.reducedMotion||s.clicker?.calmScene||stage.closest('.calm-scene')||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const SHAPES={heal:'heart',shield:'shield',riposte:'shield',energy:'star',buff:'sun',treasure:'gem',break:'fracture',meteor:'meteor',beam:'wave',volley:'arrow',shatter:'ice',echo:'clock',mark:'frame',drain:'rose',verdict:'deathwings',incoming:'shards',dot:'lightning',pillar:'column'};
const PRIORITY={break:10,charged:9,finisher:8,riposte:7,meteor:6,beam:6,verdict:6,detonate:6,relay:5,summon:4,heal:4,shield:4,dot:3,reaction:3,auto:1};
export function playKitEvents(stage,s,events,people,keyOf){
 if(!stage?.isConnected||!events?.length||stage.classList.contains('cx-media-playing'))return;
 const sorted=[...events].sort((a,b)=>(PRIORITY[b.type]||2)-(PRIORITY[a.type]||2)).slice(0,4);
 const compact=quiet(stage,s);
 for(const [index,event] of sorted.entries()){
  const person=people.find(p=>keyOf(p)===event.key);if(!person)continue;const d=characterAnimation(person,event.key,s.world),root=document.createElement('div');root.className=`cx-kit-proc proc-${event.type}${compact?' is-quiet':''}`;root.dataset.kitProc=event.type;root.setAttribute('aria-hidden','true');root.style.setProperty('--proc-color',d.color);const controls=live.get(stage)||[];while(controls.length>=8)controls.shift().remove();controls.push(root);live.set(stage,controls);
  if(!compact){
   const count=['charged','finisher','break'].includes(event.type)?6:event.type==='auto'?1:3,phase=serial++*2.399;
   for(let i=0;i<count;i++){
    const actor=document.createElement('span');actor.className='cx-proc-actor';const geometry=SHAPES[event.type]||d.scene?.actions[i%d.scene.actions.length]?.actor||d.motif;actor.append(createSceneActor(geometry));root.append(actor);
    const angle=phase+i*Math.PI*2/count,distance=Math.min(260,stage.clientWidth*.35),large=event.type==='charged'||event.type==='break',delay=index*100+i*65;let x=Math.cos(angle)*distance,y=Math.sin(angle)*Math.min(180,distance);
    if(event.type==='summon'||event.type==='dot'){const entities=[...stage.querySelectorAll('[data-entity-owner]')].filter(n=>n.dataset.entityOwner===event.key);if(entities.length){const rect=entities[i%entities.length].getBoundingClientRect(),box=stage.getBoundingClientRect();x=rect.x+rect.width/2-box.x-box.width/2;y=rect.y+rect.height/2-box.y-box.height*.54;}}
    let frames;
    if(event.type==='heal'||event.type==='energy'||event.type==='buff')frames=[{transform:`translate(calc(-50% + ${x*.6}px),70px) scale(.1)`,opacity:0},{transform:`translate(calc(-50% + ${x*.45}px),-30px) scale(.8)`,opacity:.9},{transform:`translate(calc(-50% + ${x*.2}px),-130px) scale(.4)`,opacity:0}];
    else if(event.type==='meteor')frames=[{transform:`translate(calc(-50% + ${x}px),-270px) rotate(-25deg) scale(.3)`,opacity:0},{transform:`translate(calc(-50% + ${x*.5}px),-170px) rotate(-15deg) scale(.8)`,opacity:1},{transform:'translate(-50%,-50%) rotate(10deg) scale(1.9)',opacity:1},{transform:'translate(-50%,-15%) rotate(30deg) scale(2.5)',opacity:0}];
    else frames=[{transform:`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${-angle*30}deg) scale(.15)`,opacity:0},{transform:`translate(calc(-50% + ${x*.55}px),calc(-50% + ${y*.55}px)) rotate(${angle*15}deg) scale(.9)`,opacity:.9},{transform:`translate(-50%,-50%) rotate(${angle*45}deg) scale(${large?1.6:1})`,opacity:1},{transform:`translate(calc(-50% + ${-x*.2}px),calc(-50% + ${-y*.2}px)) rotate(${angle*70}deg) scale(1.7)`,opacity:0}];
    actor.animate(frames,{duration:large?1300:950,delay,easing:'cubic-bezier(.15,.65,.3,1)',fill:'both'});
   }
   const ring=document.createElement('i');ring.className='cx-proc-ring';root.append(ring);ring.animate([{transform:'translate(-50%,-50%) scale(.05)',opacity:0},{transform:'translate(-50%,-50%) scale(.8)',opacity:.8},{transform:`translate(-50%,-50%) scale(${event.type==='break'?2.5:1.7})`,opacity:0}],{duration:1300,delay:index*100+350,easing:'ease-out',fill:'both'});
   if(event.type==='beam'){const beam=document.createElement('span');beam.className='cx-proc-laser';beam.style.setProperty('--beam-angle',`${index%2?-7:7}deg`);beam.innerHTML='<svg viewBox="0 0 600 80" preserveAspectRatio="none"><path class="laser-body" d="M0 40Q120 5 300 40T600 40Q480 75 300 40T0 40Z"/><path d="M0 40Q150 20 300 40T600 40M0 40Q150 60 300 40T600 40"/></svg>';root.append(beam);}
   if(['charged','finisher','riposte'].includes(event.type)){const slash=document.createElement('span');slash.className='cx-proc-arc';slash.style.rotate=`${serial*47%180-90}deg`;slash.innerHTML='<svg viewBox="0 0 300 180"><path d="M12 162Q70 -30 287 25Q115 18 12 162Z"/><path d="M29 171Q110 -3 285 39"/></svg>';root.append(slash);}
  }
  if(index===0&&event.type!=='auto'){stage.querySelector('.cx-proc-callout')?.remove();const label=document.createElement('div');label.className='cx-proc-callout';label.style.setProperty('--proc-color',d.color);label.textContent=event.label;stage.append(label);setTimeout(()=>label.remove(),compact?1400:2100);}
  stage.append(root);setTimeout(()=>root.remove(),compact?500:2100);
 }
 if(!compact){const token=stage.querySelector('.cx-elemental-core');if(token){stage._kitCoreAnimation?.cancel();stage._kitCoreAnimation=token.animate([{filter:'brightness(1)'},{filter:'brightness(1.25) saturate(1.2)'},{filter:'brightness(1)'}],{duration:550,easing:'ease-out'});}}
}
export function restoreKitEntities(stage,s,people,keyOf){
 if(!stage?.isConnected)return;const effects=activeEffects(s).filter(e=>['summon','shield','dot','mark','regen','stance','barrage','riposte'].includes(e.type)),calm=quiet(stage,s),stamp=effects.map(e=>`${e.owner}:${e.type}:${e.entities||0}:${e.visual||''}:${e.until}`).join('|')+'|'+!!calm,previous=stageEntities.get(stage);
 if(previous?.stamp===stamp&&previous.root.isConnected)return;previous?.root.remove();const root=document.createElement('div');root.className='cx-kit-entities'+(calm?' is-quiet':'');root.setAttribute('aria-hidden','true');let index=0;
 for(const e of effects){const p=people.find(p=>keyOf(p)===e.owner);if(!p)continue;const d=characterAnimation(p,e.owner,s.world),type=e.type,count=type==='summon'?Math.min(3,e.entities||1):1;
  for(let n=0;n<count&&index<14;n++,index++){
   const el=document.createElement('span');el.className=`cx-live-entity entity-${type}${e.visual?' entity-'+e.visual:''}`;el.dataset.entityOwner=e.owner;el.dataset.entityType=type;el.style.cssText=`--entity-color:${d.color};--entity-index:${index};--entity-angle:${index*137.5}deg;--entity-delay:${-index*.8}s`;
   const shape=type==='summon'?(e.actors?.[n]||d.scene?.actions[0]?.actor||d.motif):({shield:'shield',riposte:'shield',dot:d.scene?.actions[1]?.actor||'lightning',mark:'frame',regen:'heart',stance:d.motif,barrage:'star'})[type];el.append(createSceneActor(shape));root.append(el);
  }
 }
 stage.prepend(root);stageEntities.set(stage,{stamp,root});
}
