import {createSpaceEffects} from './space-effects.js';
let currentHost,lastGame,exploring=false,flying=false,clock=0,panelSide='right',cachedConfig={},configAt=0,resize,stageObserver,layoutMetrics={};
const phases=new Map();let interactionUntil=0,heldId='';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function settings(host){try{return JSON.parse(localStorage.getItem(`astralis:cosmos:${host.dataset.studioGame}`)||'{}')}catch{return {}}}

// Homothetic ellipses never intersect. Members of a track keep their spacing.
export function orbitTrackPosition(index,count,phase=0,entry={},free=false){
 const track=index%3,members=Math.ceil((count-track)/3),slot=Math.floor(index/3);
 const angle=-Math.PI/2+slot*Math.PI*2/Math.max(1,members)+track*.48+phase;
 const radius=free?Math.min(44,Math.max(25,Number(entry.radius)||25+track*9.5)):25+track*9.5;
 const tilt=(free?Math.min(35,Math.max(-35,Number(entry.tilt)||0)):-8)*Math.PI/180;
 const a=Math.cos(angle)*radius,b=Math.sin(angle)*radius*.85;
 return {x:50+a*Math.cos(tilt)-b*Math.sin(tilt),y:50+a*Math.sin(tilt)+b*Math.cos(tilt),angle,track,radius};
}
function bodyFor(host,id){
 const source=host.querySelector(`[data-orbit-select="${id}"] .celestial-body`);if(!source)return document.createElement('span');
 const copy=source.cloneNode(true);copy.querySelectorAll('canvas').forEach(canvas=>canvas.remove());const world=copy.querySelector('astralis-world'),original=source.querySelector('astralis-world');world?.setAttribute('detail','');if(world&&Number.isFinite(original?.angle))world.setAttribute('phase',String(original.angle));return copy;
}
function hero(host,id,chooseSide=false){
 const header=host.querySelector('.voyage-destination');if(!header)return;
 const node=host.querySelector(`[data-orbit-select="${id}"]`),entry=settings(host).icons?.[id]||{};
 // Give each destination a distinct exploration composition, while keeping the
 // user's explicit panel-side preference independent from the planet artwork.
 const worlds={week:'mondstadt',banners:'liyue',wishes:'inazuma',team:'sumeru',session:'fontaine',companion:'natlan',events:'primordial',progress:'natlan',activity:'inazuma',wall:'nodkrai',endgame:'snezhnaya',farm:'natlan',favorites:'liyue'};
 const layouts={week:'mondstadt',banners:'liyue',wishes:'inazuma',team:'sumeru',session:'fontaine',companion:'natlan',events:'primordial',progress:'natlan',activity:'inazuma',wall:'nodkrai',endgame:'snezhnaya',farm:'natlan',favorites:'liyue'};
 header.dataset.worldId=id;header.dataset.worldLayout=worlds[id]||'mondstadt';header.dataset.composition=layouts[id]||'mondstadt';host.dataset.composition=layouts[id]||'mondstadt';
 if(['left','right','top','bottom'].includes(entry.panelSide))panelSide=entry.panelSide;
 else if(chooseSide&&node){const rect=node.getBoundingClientRect(),bounds=host.getBoundingClientRect();panelSide=rect.left+rect.width/2<bounds.left+bounds.width/2?'right':'left';}
 host.dataset.panelSide=panelSide;
 header.querySelector('.voyage-world-preview').replaceChildren(bodyFor(host,id));header.querySelector('h2').textContent=node?.querySelector('.orbit-node-label')?.textContent||'';
 host.style.setProperty('--destination-bg',/^#[a-f0-9]{6}$/i.test(entry.sky||'')?entry.sky:'#11101b');
}
export function travelTo(id){
 const host=document.querySelector('.dashboard-studio');if(!host||host.dataset.view!=='orbit'||host.dataset.cosmosBackground==='none'||host.dataset.editing==='true'||flying)return;
 hero(host,id,!exploring);if(exploring){host.querySelector('.voyage-destination')?.scrollIntoView({block:'nearest',behavior:reduced()?'instant':'smooth'});return;}
 const node=host.querySelector(`[data-orbit-select="${id}"]`);if(!node)return;
 flying=true;host.dataset.flight='true';host.setAttribute('aria-busy','true');
 const overlay=document.createElement('div');overlay.className='voyage-flight';overlay.setAttribute('aria-hidden','true');
 const body=bodyFor(host,id),rect=node.querySelector('.celestial-body').getBoundingClientRect(),bounds=host.getBoundingClientRect();body.classList.add('voyage-travelling-world');body.style.left=(rect.left-bounds.left)+'px';body.style.top=(rect.top-bounds.top)+'px';body.style.width=rect.width+'px';body.style.height=rect.height+'px';body.querySelector('astralis-world')?.setAttribute('spin','3');overlay.append(body);host.append(overlay);
 const wide=host.dataset.voyageWide==='true',targetX=bounds.width*(wide?(['top','bottom'].includes(panelSide)?.5:panelSide==='right'?.2:.8):.5),targetY=host.querySelector('.studio-toolbar').getBoundingClientRect().bottom-bounds.top+(wide?245:150);
 const dx=targetX-(rect.left-bounds.left)-rect.width*.5,dy=targetY-(rect.top-bounds.top)-rect.height*.5,scale=(wide?245:matchMedia('(max-width:700px)').matches?120:145)/rect.width,duration=reduced()||host.dataset.cosmosMotion==='off'?1:1150;
 const camera=host.querySelector('.orbit-stage')?.animate([{transform:'perspective(1200px) rotateX(0deg) rotateZ(0deg)',opacity:1},{offset:.5,transform:'perspective(1200px) rotateX(18deg) rotateZ(-13deg) scale(.94)',opacity:.6},{transform:'perspective(1200px) rotateX(32deg) rotateZ(-22deg) scale(1.35)',opacity:0}],{duration,easing:'cubic-bezier(.5,0,.18,1)',fill:'forwards'});
 const animation=body.animate([{transform:'translate3d(0,0,0) rotateZ(0deg) scale(1)'},{offset:.43,transform:`translate3d(${dx*.45-65}px,${dy*.3-55}px,0) rotateZ(-24deg) scale(${scale*.48})`},{offset:.78,transform:`translate3d(${dx+35}px,${dy+15}px,0) rotateZ(14deg) scale(${scale*1.1})`},{transform:`translate3d(${dx}px,${dy}px,0) rotateZ(0deg) scale(${scale})`}],{duration,easing:'cubic-bezier(.5,0,.18,1)',fill:'forwards'});
 animation.finished.catch(()=>{}).then(()=>{if(host.isConnected){const arrival=host.querySelector('.voyage-world-preview astralis-world'),traveller=body.querySelector('astralis-world');if(arrival&&Number.isFinite(traveller?.angle)){arrival.angle=traveller.angle;arrival.painted=false;}exploring=true;host.dataset.exploring='true';host.dataset.flight='false';host.removeAttribute('aria-busy');camera?.cancel();overlay.remove();host.querySelector('[data-voyage-back]')?.focus({preventScroll:true});host.querySelector('.studio-toolbar')?.scrollIntoView({block:'start',behavior:reduced()?'instant':'smooth'});}else{camera?.cancel();overlay.remove();}flying=false;});
}
export function leaveVoyage(){
 const host=document.querySelector('.dashboard-studio');exploring=false;flying=false;if(!host)return;host.dataset.exploring='false';host.dataset.flight='false';host.removeAttribute('aria-busy');host.querySelector(`[data-orbit-select="${host.dataset.orbitActive}"]`)?.focus({preventScroll:true});host.querySelector('.studio-toolbar')?.scrollIntoView({block:'start',behavior:reduced()?'instant':'smooth'});
}
function boot(){
 const host=document.querySelector('.dashboard-studio');if(host===currentHost)return;currentHost=host;configAt=0;layoutMetrics={};resize?.disconnect();stageObserver?.disconnect();if(!host)return;host.dataset.voyageWide=String(host.clientWidth-40>=760);resize=new ResizeObserver(([entry])=>host.dataset.voyageWide=String(entry.contentRect.width>=760));resize.observe(host);host._orbitVisible=true;const stage=host.querySelector('.orbit-stage');if(stage){stageObserver=new IntersectionObserver(entries=>host._orbitVisible=entries[0].isIntersecting);stageObserver.observe(stage);}
 if(lastGame!==host.dataset.studioGame){lastGame=host.dataset.studioGame;exploring=false;}else if(flying){exploring=true;flying=false;}host.dataset.exploring=String(exploring);host.dataset.flight='false';
 const header=document.createElement('header');header.className='voyage-destination';header.innerHTML='<button type="button" data-voyage-back>← Retour au système</button><div class="voyage-world-preview"></div><div class="voyage-world-caption"><small>ESCALE PERSONNELLE</small><h2></h2><p>Ton monde, tes outils.</p></div>';host.querySelector('.studio-canvas')?.before(header);
 const debris=document.createElement('div');debris.className='voyage-debris';debris.setAttribute('aria-hidden','true');debris.innerHTML=Array.from({length:66},(_,i)=>`<i style="--rock-x:${(i*47.31)%112-6}%;--rock-y:${i<44?22+(i*7.37)%42:(i*29)%100}%;--rock-size:${i%8===0?20:i%3===0?11:4+i%6}px;--rock-delay:-${i*2.3}s;--rock-duration:${42+i%9*7}s;--rock-opacity:${.4+i%5*.12}"></i>`).join('');host.prepend(debris);host.prepend(createSpaceEffects());if(heldId&&performance.now()<interactionUntil&&document.activeElement===document.body)host.querySelector('[data-orbit-select="'+heldId+'"]')?.focus({preventScroll:true});if(exploring)hero(host,host.dataset.orbitActive);
}
function orbit(now){
 boot();const host=currentHost,delta=clock?Math.min(34,now-clock):0;clock=now;
 if(host?.isConnected&&!document.hidden){
  if(!configAt||now-configAt>250){cachedConfig=settings(host);configAt=now;host.dataset.asteroids=String(cachedConfig.asteroids!==false);}
  if(host._orbitVisible!==false&&host.dataset.editing!=='true'&&host.dataset.view==='orbit'&&host.dataset.exploring!=='true'&&host.dataset.flight!=='true'){
   const config=cachedConfig,free=config.freeOrbits===true,nodes=[...host.querySelectorAll('.orbit-node')],paused=config.motion===false||reduced(),speed=Math.max(.2,Math.min(3,Number(config.speed)||1));
   const blocked=new Set(nodes.map((node,i)=>(node.matches(':hover')||node===document.activeElement||node.dataset.orbitSelect===heldId&&now<interactionUntil)?i%3:-1));
   const tracks=[0,1,2].map(track=>{const key=host.dataset.studioGame+':track:'+track;let phase=phases.get(key)||0;if(!paused&&!blocked.has(track))phase+=delta/1000*Math.PI*2/([180,135,210][track])*speed;phases.set(key,phase);return phase;});
   const proposed=[];nodes.forEach((node,index)=>{const entry=config.icons?.[node.dataset.orbitSelect]||{},key=host.dataset.studioGame+':'+node.dataset.orbitSelect;let phase=tracks[index%3];if(free){phase=phases.get(key)||0;if(!paused&&!node.matches(':hover')&&node!==document.activeElement)phase+=delta/1000*Math.PI*2/Math.max(35,Math.min(200,Number(entry.period)||90+index%3*45))*speed;phases.set(key,phase);}
    const position=orbitTrackPosition(index,nodes.length,phase,entry,free);proposed.push({node,position,index});node.style.setProperty('--node-x',position.x+'%');node.style.setProperty('--node-y',position.y+'%');if(!node._reported||now-node._reported>180){node.dataset.orbitAngle=position.angle.toFixed(5);node._reported=now;}
   });
   const stage=host.querySelector('.orbit-stage'),width=stage?.clientWidth||800,height=stage?.clientHeight||600;
   const points=proposed.map(({node,position,index})=>{const bodyRadius=((width<500?18:27)+[0,5,-2,2,-3,3,-1,4,1][index%9])*Math.max(.8,Math.min(1.8,Number(config.worldScale)||1.3));const locked=node.matches(':hover')||node===document.activeElement||node.dataset.orbitSelect===heldId&&now<interactionUntil;const previous=locked?node._orbitPoint:null;return {node,x:previous?.x??position.x*width/100,y:previous?.y??position.y*height/100-12,offsetY:12,bodyRadius,r:bodyRadius*1.5+3,locked};});
   if(layoutMetrics.stage!==stage||now-layoutMetrics.measured>250){
    const marker=stage?.querySelector('.orbit-center-marker'),markerRect=marker?.getBoundingClientRect(),stageRect=stage?.getBoundingClientRect(),globe=marker?.querySelector('astralis-planet');
    layoutMetrics={stage,measured:now,centerX:markerRect&&stageRect?markerRect.left-stageRect.left+markerRect.width/2:width/2,centerY:markerRect&&stageRect?markerRect.top-stageRect.top+markerRect.height/2:height/2,globeRadius:(globe?.getBoundingClientRect().width||((width<500?112:140)*(Number(config.globeScale)||1)))/2};
   }
   const {centerX,centerY,globeRadius}=layoutMetrics;
   // Reserve the full outer paths of the three moons and the three ruler relics,
   // then keep each world circle beyond their reach. The marker may be offset
   // vertically by the responsive dashboard layout, so use its actual position.
   const centralRadius=globeRadius*(1+1.79/2.35)+18;
   const keepClear=p=>{const dx=p.x-centerX,dy=p.y-centerY,d=Math.hypot(dx,dy)||1,min=centralRadius+p.r+18;if(d<min){p.x=centerX+dx/d*min;p.y=centerY+dy/d*min;}};
   for(const p of points)keepClear(p);

   for(let pass=0;pass<12;pass++){for(const p of points){const margin=p.bodyRadius+12;p.x=Math.max(margin,Math.min(width-margin,p.x));p.y=Math.max(margin,Math.min(height-margin-20,p.y));keepClear(p);}for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
    const a=points[i],b=points[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+b.r+16;
    if(d<min){const push=min-d;if(!a.locked){const ratio=b.locked?1:.5;a.x-=dx/d*push*ratio;a.y-=dy/d*push*ratio;}if(!b.locked){const ratio=a.locked?1:.5;b.x+=dx/d*push*ratio;b.y+=dy/d*push*ratio;}}
   }
   }
   for(const p of points){keepClear(p);p.node._orbitPoint={x:p.x,y:p.y};p.node.style.setProperty('--node-x',p.x/width*100+'%');p.node.style.setProperty('--node-y',(p.y+p.offsetY)/height*100+'%');p.node.style.setProperty('--regional-size',p.bodyRadius*2+'px');}
  }
 }
 requestAnimationFrame(orbit);
}
if(typeof document!=='undefined'){
 const hold=event=>{const node=event.target.closest?.('.orbit-node');if(node){heldId=node.dataset.orbitSelect;interactionUntil=performance.now()+1800;}else if(event.type==='focusin')heldId='';};document.addEventListener('pointermove',event=>{if(!event.target.closest?.('.orbit-node'))heldId='';},{passive:true});document.addEventListener('focusin',hold);document.addEventListener('pointerover',hold,{passive:true});
 new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});requestAnimationFrame(orbit);
 document.addEventListener('click',event=>{if(event.target.closest('[data-voyage-back]'))leaveVoyage();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.dashboard-studio[data-exploring="true"]')&&!document.querySelector('dialog[open],.studio-focused')){event.preventDefault();event.stopImmediatePropagation();leaveVoyage();}},true);
}
