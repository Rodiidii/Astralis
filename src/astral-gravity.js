const KEY='astralis:arcade:gravity:v1';
const W=720,H=380,DT=.04,MAX_STEPS=150,GRAVITY=1_420_000,SOFTENING=6200;
const GAME_SCOPE=game=>game==='hsr'?'hsr':['ww','wuwa'].includes(game)?'ww':'gi';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const write=data=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
const dailySeed=(game,date)=>{let n=2166136261;for(const c of `${GAME_SCOPE(game)}:${date}:gravity`){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export function orbitTrace(angle,power,limit=MAX_STEPS){
 const a=Number(angle)*Math.PI/180;let x=58,y=285,vx=Math.cos(a)*Number(power),vy=-Math.sin(a)*Number(power);const points=[];
 for(let i=0;i<limit;i++){
  const dx=364-x,dy=183-y,r2=dx*dx+dy*dy+SOFTENING,r=Math.sqrt(r2),factor=GRAVITY/(r2*r);
  vx+=dx*factor*DT;vy+=dy*factor*DT;x+=vx*DT;y+=vy*DT;
  points.push({x,y,vx,vy});if(x<0||x>W||y<0||y>H)break;
 }
 return points;
}
export function makeOrbitCourse(game,date){
 if(!date){const d=new Date();date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
 const seed=dailySeed(game,date),angle=12+(seed%19),power=190+((seed>>>6)%41),trace=orbitTrace(angle,power,MAX_STEPS);
 const picks=[17,34,51],stars=picks.map((step,i)=>{const p=trace[Math.min(step,trace.length-1)];return {x:p?.x??140+i*90,y:p?.y??230-i*40,id:i}}),dock=trace[Math.min(68,trace.length-1)]||{x:610,y:90};
 return {date,seed,stars,dock:{x:dock.x,y:dock.y},solution:{angle,power}};
}
export function scoreOrbit(course,points){
 const collected=new Set();for(const p of points){for(const star of course.stars)if(Math.hypot(p.x-star.x,p.y-star.y)<23)collected.add(star.id)}
 const last=points.at(-1),docked=points.some(p=>Math.hypot(p.x-course.dock.x,p.y-course.dock.y)<27&&Math.hypot(p.vx,p.vy)<330);return {fragments:collected.size,docked,escaped:!docked&&(!last||last.x<0||last.x>W||last.y<0||last.y>H)};
}

export function renderAstralGravity(game='gi'){
 const universe=game==='hsr'?'EXPRESS':GAME_SCOPE(game)==='ww'?'RÉSONANCE':'TEYVAT';
 return `<section class="arcade-game-view gravity-view" data-arcade-view="gravity" role="tabpanel" aria-label="Gravité zéro" hidden><header class="gravity-heading"><div><small>SIMULATEUR ORBITAL · ${universe} · PARCOURS DU JOUR</small><h2>Gravité zéro</h2><p>Règle l’angle et l’impulsion, lis la trajectoire calculée, collecte trois fragments et rejoins la station.</p></div><div class="gravity-record"><small>MEILLEUR VOL</small><b data-gravity-record>—</b></div></header><div class="gravity-layout"><div class="gravity-scene"><canvas data-gravity-canvas width="720" height="380" tabindex="0" role="img" aria-label="Trajectoire orbitale : utilise les réglages de cap et d’impulsion, puis lance le vaisseau."></canvas><div class="gravity-scene-chip"><i>✦</i><span>ROUTE DU JOUR</span><b data-gravity-day>—</b></div><div class="gravity-scene-caption" data-gravity-status aria-live="polite">Ajuste la trajectoire pour frôler les trois fragments.</div></div><aside class="gravity-controls"><div class="gravity-objective"><small>MISSION</small><b>Fragments requis · 3</b><div data-gravity-fragments><i>◇</i><i>◇</i><i>◇</i></div></div><label class="gravity-slider"><span><b>Cap orbital</b><output data-gravity-angle-label>30°</output></span><input type="range" min="0" max="60" step="1" value="30" data-gravity-angle aria-label="Cap orbital en degrés"><small>0° horizon · 60° ascension</small></label><label class="gravity-slider"><span><b>Impulsion</b><output data-gravity-power-label>250</output></span><input type="range" min="180" max="290" step="1" value="250" data-gravity-power aria-label="Puissance de l’impulsion"><small>Une impulsion forte élargit l’orbite</small></label><div class="gravity-actions"><button type="button" data-gravity-launch>✦ Lancer</button><button type="button" data-gravity-reset>↺ Recentrer</button></div><div class="gravity-stats"><span>ESSAIS <b data-gravity-attempts>0</b></span><span>FRAGMENTS <b data-gravity-count>0 / 3</b></span></div><p class="gravity-hint">La ligne pointillée est une prévision. Le parcours quotidien est propre à cet univers et change au prochain jour local.</p></aside></div></section>`;
}

export function mountAstralGravity(root,game='gi'){
 const panel=root.querySelector('[data-arcade-view="gravity"]');if(!panel)return()=>{};
 const canvas=panel.querySelector('[data-gravity-canvas]'),ctx=canvas?.getContext('2d');if(!ctx)return()=>{};
 const scope=GAME_SCOPE(game),course=makeOrbitCourse(game),saved=read(),stored=saved[scope]||{},profile={attempts:Number(stored.attempts)||0,cleared:Number(stored.cleared)||0,best:Number(stored.best)||0},angleInput=panel.querySelector('[data-gravity-angle]'),powerInput=panel.querySelector('[data-gravity-power]'),status=panel.querySelector('[data-gravity-status]');
 let angle=Number(angleInput.value),power=Number(powerInput.value),flight=null,frame=0,collected=new Set(),raf=0,alive=true;
 panel.querySelector('[data-gravity-day]').textContent=course.date;panel.querySelector('[data-gravity-record]').textContent=profile.best?`${profile.best} fragments · ${profile.cleared} réussites`:'—';
 const save=()=>{saved[scope]=profile;write(saved)};
 const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round((rect.width||W)*dpr));canvas.height=Math.max(1,Math.round((rect.height||H)*dpr));ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);draw()};
 const draw=()=>{
  if(!alive)return;ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#101829');bg.addColorStop(.58,'#121a2e');bg.addColorStop(1,'#20182c');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const s=course.seed;for(let i=0;i<64;i++){const x=((s>>>((i%4)*8))+i*137)%W,y=((s>>>(((i+2)%4)*8))+i*83)%H;ctx.fillStyle=`rgba(221,230,255,${.12+(i%5)*.09})`;ctx.beginPath();ctx.arc(x,y,i%13===0?1.7:.7,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle='#96adcf12';ctx.lineWidth=1;for(let x=38;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=25;y<H;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  const glow=ctx.createRadialGradient(364,183,12,364,183,115);glow.addColorStop(0,'#f4d58c38');glow.addColorStop(.4,'#c39bff1c');glow.addColorStop(1,'#776ec800');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(364,183,115,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(364,183);ctx.rotate(-.22);ctx.strokeStyle='#cfbb8870';ctx.setLineDash([4,8]);ctx.beginPath();ctx.ellipse(0,0,104,72,0,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.setLineDash([]);
  const well=ctx.createRadialGradient(364,183,4,364,183,34);well.addColorStop(0,'#fff3cb');well.addColorStop(.14,'#dfc77c');well.addColorStop(.43,'#9f77c7');well.addColorStop(1,'#6e59aa00');ctx.fillStyle=well;ctx.beginPath();ctx.arc(364,183,34,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eddfa080';ctx.lineWidth=1;ctx.beginPath();ctx.arc(364,183,10,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.shadowColor='#f0d38a80';ctx.shadowBlur=12;ctx.fillStyle='#f1d68c';ctx.beginPath();ctx.roundRect(617,course.dock.y-18,46,36,9);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#342b3f';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⌂',640,course.dock.y);ctx.restore();
  course.stars.forEach(star=>{if(collected.has(star.id))return;const pulse=1+Math.sin(performance.now()/250+star.id)*.13;ctx.save();ctx.translate(star.x,star.y);ctx.rotate(performance.now()/3000);ctx.scale(pulse,pulse);ctx.shadowColor='#95e9dc';ctx.shadowBlur=17;ctx.fillStyle='#b2f7e5';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(3,-3);ctx.lineTo(9,0);ctx.lineTo(3,3);ctx.lineTo(0,9);ctx.lineTo(-3,3);ctx.lineTo(-9,0);ctx.lineTo(-3,-3);ctx.closePath();ctx.fill();ctx.restore()});
  const trajectory=flight?.points||orbitTrace(angle,power,MAX_STEPS);if(trajectory.length){ctx.beginPath();ctx.moveTo(58,285);trajectory.forEach(p=>ctx.lineTo(p.x,p.y));ctx.strokeStyle=flight?'#f0d78e':'#b8c5e977';ctx.lineWidth=flight?2.5:1.5;ctx.setLineDash(flight?[]:[4,6]);ctx.stroke();ctx.setLineDash([])}
  const point=flight?.points?.[Math.min(frame,flight.points.length-1)]||{x:58,y:285};ctx.save();ctx.translate(point.x,point.y);ctx.rotate(-angle*Math.PI/180);ctx.shadowColor='#a8edff';ctx.shadowBlur=13;ctx.fillStyle='#edf6ff';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,-7);ctx.lineTo(-4,0);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ed9f73';ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(-15,0);ctx.lineTo(-7,3);ctx.fill();ctx.restore();
 };
 const showProgress=()=>{const count=collected.size;panel.querySelector('[data-gravity-count]').textContent=`${count} / 3`;panel.querySelector('[data-gravity-fragments]').innerHTML=Array.from({length:3},(_,i)=>`<i class="${i<count?'collected':''}">${i<count?'✦':'◇'}</i>`).join('')};
 const finish=()=>{if(!flight)return;const points=flight.points.slice(0,frame+1),score=scoreOrbit(course,points);if(score.fragments!==collected.size){collected=new Set();for(const p of points)for(const star of course.stars)if(Math.hypot(p.x-star.x,p.y-star.y)<23)collected.add(star.id)}profile.attempts++;profile.best=Math.max(profile.best,collected.size);angleInput.disabled=false;powerInput.disabled=false;const docked=score.docked&&collected.size===3;if(docked){profile.cleared++;status.textContent=`Amarrage parfait · ${collected.size} fragments · ${profile.attempts} essais cumulés.`}else if(flight.reason==='impact'){status.textContent=`Impact avec l’astre · ${collected.size}/3 fragments récupérés. Recalcule ton orbite.`}else if(score.escaped){status.textContent=`Trajectoire perdue · ${collected.size}/3 fragments récupérés. Ajuste le cap et recommence.`}else status.textContent=`Vol terminé · ${collected.size}/3 fragments. La station exige les trois.`;panel.querySelector('[data-gravity-attempts]').textContent=profile.attempts;panel.querySelector('[data-gravity-record]').textContent=`${profile.best} fragments · ${profile.cleared} réussites`;showProgress();save();flight=null;frame=0;draw()};
 const animate=()=>{if(!alive||panel.hidden||!flight)return;if(frame<flight.points.length-1){frame++;const p=flight.points[frame];course.stars.forEach(star=>{if(Math.hypot(p.x-star.x,p.y-star.y)<23)collected.add(star.id)});showProgress();draw();if(Math.hypot(p.x-364,p.y-183)<25){flight.reason='impact';finish();return}if(Math.hypot(p.x-course.dock.x,p.y-course.dock.y)<27){finish();return}if((p.x>W||p.x<0||p.y>H||p.y<0)||frame>=flight.points.length-1){finish();return}raf=requestAnimationFrame(animate)}else finish()};
 const launch=()=>{if(flight)return;flight={points:orbitTrace(angle,power,MAX_STEPS)};angleInput.disabled=true;powerInput.disabled=true;frame=0;collected=new Set();status.textContent='Impulsion engagée · suis les fragments dans le champ gravitationnel.';raf=requestAnimationFrame(animate)};
 const reset=()=>{if(raf)cancelAnimationFrame(raf);raf=0;flight=null;angleInput.disabled=false;powerInput.disabled=false;frame=0;collected=new Set();showProgress();status.textContent='Trajectoire recalculée. Ajuste le cap et l’impulsion avant le départ.';draw()};
 const update=()=>{if(!flight){angle=Number(angleInput.value);power=Number(powerInput.value);panel.querySelector('[data-gravity-angle-label]').textContent=`${angle}°`;panel.querySelector('[data-gravity-power-label]').textContent=String(power);draw()}};
 const onModeChange=()=>{if(!panel.hidden&&flight&&!raf)raf=requestAnimationFrame(animate)};const onVisibility=()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0}else onModeChange()};const onInput=e=>{if(e.target===angleInput||e.target===powerInput)update()};const onClick=e=>{if(e.target.closest('[data-gravity-launch]'))launch();if(e.target.closest('[data-gravity-reset]'))reset()};
 const onKey=e=>{if(panel.hidden)return;if(e.code==='Space'&&!/INPUT|BUTTON/.test(document.activeElement?.tagName||'')){launch();e.preventDefault()}if(e.key.toLowerCase()==='r')reset()};
 angleInput.value=String(clamp(course.solution.angle+9,0,60));powerInput.value=String(clamp(course.solution.power+20,180,290));update();panel.querySelector('[data-gravity-attempts]').textContent=profile.attempts||0;showProgress();
 panel.addEventListener('input',onInput);panel.addEventListener('click',onClick);panel.addEventListener('keydown',onKey);root.addEventListener('arcade:modechange',onModeChange);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('resize',resize);const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(canvas);resize();
 return()=>{alive=false;if(raf)cancelAnimationFrame(raf);observer?.disconnect();window.removeEventListener('resize',resize);root.removeEventListener('arcade:modechange',onModeChange);document.removeEventListener('visibilitychange',onVisibility);panel.removeEventListener('input',onInput);panel.removeEventListener('click',onClick);panel.removeEventListener('keydown',onKey)};
}
