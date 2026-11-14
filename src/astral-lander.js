const KEY='astralis:arcade:lander:v1';
const W=720,H=380,GRAVITY=.046,THRUST=.115,TURN=.047;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const scope=game=>game==='hsr'?'hsr':['ww','wuwa'].includes(game)?'ww':'gi';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const write=data=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};

export function makeLandingWorld(game='gi',date=new Date().toLocaleDateString('sv-SE')){
 let n=2166136261;for(const c of `${scope(game)}:${date}:lander`){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}
 const seed=n>>>0;
 return {date,seed,wind:((seed%9)-4)*.0007,padX:490+(seed%95),padWidth:92};
}
export function stepLander(state,input={},world={wind:0},frames=1){
 const s={...state};for(let i=0;i<frames;i++){
  s.angle=clamp(s.angle+(Number(input.turn)||0)*TURN,-1.12,1.12);
  s.vx+=world.wind||0;s.vy+=GRAVITY;
  if(input.thrust&&s.fuel>0){s.vx+=Math.sin(s.angle)*THRUST;s.vy-=Math.cos(s.angle)*THRUST;s.fuel=Math.max(0,s.fuel-.19)}
  s.x+=s.vx;s.y+=s.vy;s.frames=(s.frames||0)+1;
 }
 return s;
}
export function evaluateLanding(state,world){
 const x=Math.abs(state.x-(world.padX+world.padWidth/2)),onPad=x<=world.padWidth/2-9;
 const landed=state.y>=H-34&&onPad&&state.vy<.76&&Math.abs(state.vx)<.56&&Math.abs(state.angle)<.23;
 const crashed=state.y>=H-34&&!landed||state.x<0||state.x>W||state.y<0;
 return {landed,crashed,onPad,horizontalError:Math.round(x),speed:Math.hypot(state.vx,state.vy)};
}
const initialState=()=>({x:90,y:72,vx:1.25,vy:0,angle:0,fuel:100,frames:0});

export function renderAstralLander(game='gi'){
 const universe=game==='hsr'?'EXPRESS':scope(game)==='ww'?'RÉSONANCE':'TEYVAT';
 return `<section class="arcade-game-view lander-view" data-arcade-view="lander" role="tabpanel" aria-label="Atterrissage lunaire" hidden><header class="lander-heading"><div><small>SIMULATEUR DE VOL · ${universe} · DÉFI DU JOUR</small><h2>Atterrissage lunaire</h2><p>Gère l’inertie, corrige l’inclinaison et économise le carburant. Pose doucement la navette au centre de la plateforme.</p></div><div class="lander-record"><small>POSES RÉUSSIES</small><b data-lander-record>0</b></div></header><div class="lander-layout"><div class="lander-scene"><canvas data-lander-canvas width="720" height="380" tabindex="0" role="img" aria-label="Simulateur de pilotage. Flèches gauche et droite pour tourner, espace pour pousser. Atterris sur la plateforme sans dépasser les limites de vitesse."></canvas><div class="lander-caption" data-lander-status aria-live="polite">Prêt au décollage · flèches pour orienter, Espace pour propulser.</div><div class="lander-hud"><span>VITESSE <b data-lander-speed>0.00</b></span><span>CARBURANT <b data-lander-fuel>100%</b></span><span>ANGLE <b data-lander-angle>0°</b></span></div></div><aside class="lander-side"><div class="lander-target"><small>ZONE DE POSE</small><b>Plateforme mobile</b><span>Vitesse verticale &lt; 0,76 · horizontale &lt; 0,56</span><i data-lander-wind>Vent calme</i></div><div class="lander-controls" aria-label="Commandes tactiles"><button type="button" data-lander-turn="-1" aria-label="Incliner à gauche">↶</button><button type="button" data-lander-thrust aria-label="Activer le propulseur">▲<small>POUSSER</small></button><button type="button" data-lander-turn="1" aria-label="Incliner à droite">↷</button></div><button type="button" class="lander-start" data-lander-start>↻ Recommencer le vol</button><p>Clavier : ← → pour tourner · Espace pour propulser · R pour recommencer. Chaque univers a son vent et sa plateforme du jour.</p></aside></div></section>`;
}

export function mountAstralLander(root,game='gi'){
 const panel=root.querySelector('[data-arcade-view="lander"]');if(!panel)return()=>{};
 const canvas=panel.querySelector('[data-lander-canvas]'),ctx=canvas?.getContext('2d');if(!ctx)return()=>{};
 const world=makeLandingWorld(game),saved=read(),profile=saved[scope(game)]||{landings:0,bestFuel:0};let state=initialState(),keys=new Set(),raf=0,alive=true,finished=false,last=0;
 panel.querySelector('[data-lander-record]').textContent=String(profile.landings||0);panel.querySelector('[data-lander-wind]').textContent=`Vent ${(world.wind*1000).toFixed(1)} · ${world.date}`;
 const resize=()=>{const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round((r.width||W)*dpr));canvas.height=Math.max(1,Math.round((r.height||H)*dpr));ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);draw()};
 const draw=()=>{
  if(!alive)return;ctx.clearRect(0,0,W,H);const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#101a30');bg.addColorStop(.68,'#283049');bg.addColorStop(1,'#3c3445');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  let z=world.seed;for(let i=0;i<72;i++){z=(Math.imul(z,1664525)+1013904223)>>>0;const x=z%W,y=(z>>>10)%250;ctx.fillStyle=`rgba(241,235,222,${.14+(z%5)*.07})`;ctx.beginPath();ctx.arc(x,y,z%17===0?1.6:.8,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#a59a9c';ctx.beginPath();ctx.moveTo(0,335);for(let x=0;x<=W;x+=24){const ridge=310+Math.sin(x*.031+world.seed%10)*16+Math.sin(x*.077)*7;ctx.lineTo(x,ridge)}ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();ctx.fillStyle='#d6c7a8';ctx.fillRect(world.padX,H-36,world.padWidth,5);ctx.fillStyle='#e6d7b6';ctx.fillRect(world.padX+world.padWidth/2-2,H-43,4,7);
  ctx.save();ctx.translate(state.x,state.y);ctx.rotate(state.angle);ctx.shadowColor='#91dcff';ctx.shadowBlur=15;ctx.fillStyle='#e5edf7';ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(12,12);ctx.lineTo(5,9);ctx.lineTo(0,13);ctx.lineTo(-5,9);ctx.lineTo(-12,12);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#86dbdd';ctx.fillRect(-3,13,6,4);if(keys.has(' ')){ctx.fillStyle='#ffb365';ctx.beginPath();ctx.moveTo(-4,16);ctx.lineTo(0,27+Math.random()*5);ctx.lineTo(4,16);ctx.fill()}ctx.restore();
  const meter=clamp(state.fuel/100,0,1);ctx.fillStyle='#ffffff24';ctx.fillRect(22,24,116,5);ctx.fillStyle=meter>.25?'#8ce0c5':'#ff927e';ctx.fillRect(22,24,116*meter,5);ctx.fillStyle='#f2eee6';ctx.font='700 10px system-ui';ctx.fillText('RÉSERVE',22,18);
  const speed=Math.hypot(state.vx,state.vy);panel.querySelector('[data-lander-speed]').textContent=speed.toFixed(2);panel.querySelector('[data-lander-fuel]').textContent=`${Math.ceil(state.fuel)}%`;panel.querySelector('[data-lander-angle]').textContent=`${Math.round(state.angle*180/Math.PI)}°`;
 };
 const finish=()=>{finished=true;const result=evaluateLanding(state,world);if(result.landed){profile.landings=(profile.landings||0)+1;profile.bestFuel=Math.max(profile.bestFuel||0,Math.floor(state.fuel));panel.querySelector('[data-lander-record]').textContent=String(profile.landings);try{saved[scope(game)]=profile;write(saved)}catch{}panel.querySelector('[data-lander-status]').textContent=`Atterrissage réussi · ${Math.floor(state.fuel)}% de carburant conservé.`}else panel.querySelector('[data-lander-status]').textContent=`${result.onPad?'Impact trop rapide':'Zone manquée'} · vitesse ${result.speed.toFixed(2)}. Réessaie avec moins d’inertie.`;};
 const loop=ts=>{if(!alive||panel.hidden){raf=0;last=0;return}if(last){const n=Math.min(3,Math.floor((ts-last)/16.67)||1);for(let i=0;i<n;i++)state=stepLander(state,{turn:(keys.has('ArrowLeft')||keys.has('a')?-1:0)+(keys.has('ArrowRight')||keys.has('d')?1:0),thrust:keys.has(' ')||keys.has('ArrowUp')||keys.has('w')},world)}last=ts;draw();const outcome=evaluateLanding(state,world);if(outcome.landed||outcome.crashed)finish();else raf=requestAnimationFrame(loop)};
 const start=()=>{if(raf)cancelAnimationFrame(raf);state=initialState();keys.clear();finished=false;last=0;panel.querySelector('[data-lander-status]').textContent='Vol engagé · corrige doucement l’inclinaison avant de freiner.';raf=requestAnimationFrame(loop);canvas.focus()};
 const keydown=e=>{if(panel.hidden)return;const key=e.key===' '?' ':e.key;if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(key)||'adwr'.includes(key.toLowerCase()))e.preventDefault();if(key.toLowerCase()==='r'){start();return}keys.add(key===' '?' ':key.toLowerCase())};const keyup=e=>keys.delete(e.key===' '?' ':e.key.toLowerCase());
 const down=e=>{const t=e.target.closest('[data-lander-turn],[data-lander-thrust]');if(!t)return;e.preventDefault();if(t.hasAttribute('data-lander-thrust'))keys.add(' ');else keys.add(Number(t.dataset.landerTurn)<0?'ArrowLeft':'ArrowRight');t.setPointerCapture?.(e.pointerId)};const up=()=>{keys.delete(' ');keys.delete('ArrowLeft');keys.delete('ArrowRight')};
 const onClick=e=>{if(e.target.closest('[data-lander-start]'))start()};const onMode=()=>{if(!panel.hidden&&!raf&&!finished){last=0;raf=requestAnimationFrame(loop)}};const visibility=()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;last=0;keys.clear()}else onMode()};
 panel.addEventListener('click',onClick);panel.addEventListener('pointerdown',down);panel.addEventListener('pointerup',up);panel.addEventListener('pointercancel',up);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',up);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);root.addEventListener('arcade:modechange',onMode);const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(canvas);resize();return()=>{alive=false;if(raf)cancelAnimationFrame(raf);observer?.disconnect();panel.removeEventListener('click',onClick);panel.removeEventListener('pointerdown',down);panel.removeEventListener('pointerup',up);panel.removeEventListener('pointercancel',up);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',up);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('arcade:modechange',onMode)};
}
