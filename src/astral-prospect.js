const KEY='astralis:arcade:prospect:v1',COLS=6,ROWS=5,ORE=5,HAZARDS=5,CHARGES=14,HULL=3;
const scope=game=>game==='hsr'?'hsr':['ww','wuwa'].includes(game)?'ww':'gi';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const write=data=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
export function makeProspectingField(game='gi',date=new Date().toLocaleDateString('sv-SE')){
 let seed=2166136261;for(const c of `${scope(game)}:${date}:prospect`){seed^=c.charCodeAt(0);seed=Math.imul(seed,16777619)}let n=seed>>>0;
 const next=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n};const cells=Array.from({length:COLS*ROWS},(_,i)=>i);
 for(let i=cells.length-1;i>0;i--){const j=next()%(i+1);[cells[i],cells[j]]=[cells[j],cells[i]]}
 const ore=new Set(cells.slice(0,ORE)),hazards=new Set(cells.slice(ORE,ORE+HAZARDS));
 const neighbors=index=>{const x=index%COLS,y=Math.floor(index/COLS),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS)out.push(ny*COLS+nx)}return out};
 return {date,seed,cols:COLS,rows:ROWS,ore:[...ore],hazards:[...hazards],neighbors:Object.fromEntries(cells.map(i=>[i,neighbors(i)]))};
}
export function createProspectingState(){return {opened:[],scanned:[],oreFound:0,charges:CHARGES,hull:HULL,ended:false,won:false,score:0};}
export function prospectCell(field,state,index,action='mine'){
 if(state.ended||!Number.isInteger(index)||index<0||index>=field.cols*field.rows||state.opened.includes(index))return state;
 const next={...state,opened:[...state.opened],scanned:[...state.scanned]};
 if(action==='scan'){
  if(next.charges<2||next.scanned.includes(index))return state;
  next.charges-=2;next.scanned.push(index);next.scanClues={...(next.scanClues||{}),[index]:field.neighbors[index].filter(n=>field.ore.includes(n)).length};
 }else{
  next.charges--;
  if(field.ore.includes(index)){next.oreFound++;next.opened.push(index)}
  else if(field.hazards.includes(index)){next.hull--;next.opened.push(index)}
  else next.opened.push(index);
 }
 next.won=next.oreFound>=field.ore.length;next.ended=next.won||next.hull<=0||next.charges<=0;
 if(next.ended)next.score=next.oreFound*100+next.charges*15+Math.max(0,next.hull)*25+(next.won?250:0);
 return next;
}
export function renderAstralProspect(game='gi'){
 const universe=game==='hsr'?'EXPRESS':scope(game)==='ww'?'RÉSONANCE':'TEYVAT';
 return `<section class="arcade-game-view prospect-view" data-arcade-view="prospect" role="tabpanel" aria-label="Prospection d’astéroïdes" hidden><header class="prospect-heading"><div><small>MISSION DE RÉCUPÉRATION · ${universe} · CARTE QUOTIDIENNE</small><h2>Prospection d’astéroïdes</h2><p>Scanne les filons, choisis où forer et extrais cinq minerais avant d’épuiser les charges ou la coque.</p></div><div class="prospect-record"><small>MEILLEUR SCORE</small><b data-prospect-best>0</b></div></header><div class="prospect-layout"><div class="prospect-board-wrap"><div class="prospect-board-top"><span>SECTEUR <b data-prospect-date>—</b></span><span>FILONS <b data-prospect-ore>0 / 5</b></span></div><div class="prospect-board" data-prospect-board role="group" aria-label="Champ d’astéroïdes"></div><div class="prospect-status" data-prospect-status aria-live="polite">Carte chargée · l’outil choisi détermine l’action sur la case.</div></div><aside class="prospect-tools"><div class="prospect-gauges"><div><small>CHARGES DE FORAGE</small><b data-prospect-charges>14</b><span data-prospect-charge-meter></span></div><div><small>INTÉGRITÉ FOREUSE</small><b data-prospect-hull>3 / 3</b><span data-prospect-hull-meter></span></div></div><div class="prospect-mode"><small>OUTIL SÉLECTIONNÉ</small><button type="button" data-prospect-action="mine" aria-pressed="true">⛏ Forer · 1 charge</button><button type="button" data-prospect-action="scan" aria-pressed="false">⌖ Scanner · 2 charges</button><p>Le scanner affiche le nombre de filons autour d’une case. Le forage peut révéler minerai, roche ou poche instable.</p></div><div class="prospect-legend"><span><i class="ore">◆</i> Minerai</span><span><i class="rock">·</i> Roche</span><span><i class="hazard">!</i> Poche instable</span><span><i class="scan">⌖</i> Scan actif</span></div><button type="button" data-prospect-reset>↻ Nouveau forage</button></aside></div></section>`;
}
export function mountAstralProspect(root,game='gi'){
 const panel=root.querySelector('[data-arcade-view="prospect"]');if(!panel)return()=>{};
 const board=panel.querySelector('[data-prospect-board]'),date=new Date().toLocaleDateString('sv-SE'),field=makeProspectingField(game,date),saved=read(),record=saved[scope(game)]||{};let state=createProspectingState(),action='mine',alive=true;
 panel.querySelector('[data-prospect-date]').textContent=`${date} · ${field.seed.toString(16).slice(-4).toUpperCase()}`;panel.querySelector('[data-prospect-best]').textContent=String(Number(record.best)||0);
 const draw=()=>{if(!alive)return;board.innerHTML=Array.from({length:field.cols*field.rows},(_,i)=>{const opened=state.opened.includes(i),scan=state.scanned.includes(i),clue=state.scanClues?.[i],ore=field.ore.includes(i),hazard=field.hazards.includes(i);let content=opened?(ore?'<i class="ore">◆</i>':hazard?'<i class="hazard">!</i>':`<i class="rock">${field.neighbors[i].filter(n=>field.hazards.includes(n)).length||'·'}</i>`):scan?`<i class="scan">${clue}</i>`:'<i class="unknown">✦</i>';const label=opened?(ore?'Minerai extrait':hazard?'Poche instable déclenchée':'Roche analysée'):scan?`${clue} filon(s) à proximité`:`Case ${i+1} non explorée`;
  return `<button type="button" class="prospect-cell ${opened?'opened':''} ${scan?'scanned':''}" data-prospect-cell="${i}" aria-label="${label}" ${state.ended?'disabled':''}>${content}</button>`}).join('');
  panel.querySelector('[data-prospect-ore]').textContent=`${state.oreFound} / ${field.ore.length}`;panel.querySelector('[data-prospect-charges]').textContent=String(state.charges);panel.querySelector('[data-prospect-hull]').textContent=`${Math.max(0,state.hull)} / ${HULL}`;panel.querySelector('[data-prospect-charge-meter]').style.setProperty('--fill',`${state.charges/CHARGES*100}%`);panel.querySelector('[data-prospect-hull-meter]').style.setProperty('--fill',`${Math.max(0,state.hull)/HULL*100}%`);
 };
 const act=index=>{const before=state;state=prospectCell(field,state,index,action);if(state===before)return;draw();if(state.ended){if(state.won){panel.querySelector('[data-prospect-status]').textContent=`Extraction complète · ${state.score} points · coque ${state.hull}/${HULL}.`;if(state.score>(Number(record.best)||0)){record.best=state.score;saved[scope(game)]=record;write(saved);panel.querySelector('[data-prospect-best]').textContent=String(state.score)}}else panel.querySelector('[data-prospect-status]').textContent=`Mission interrompue · ${state.oreFound}/${ORE} filons extraits. ${state.hull<=0?'La foreuse est détruite.':'Les charges sont épuisées.'} ${state.score} points.`}else panel.querySelector('[data-prospect-status]').textContent=action==='scan'?`Scan terminé · ${state.scanClues[index]} filon(s) dans les cases voisines.`:field.ore.includes(index)?'Filon extrait · la foreuse tient bon.':'Roche forée · vérifie le scan avant de dépenser tes prochaines charges.'};
 const onClick=e=>{const tile=e.target.closest('[data-prospect-cell]'),tool=e.target.closest('[data-prospect-action]');if(tile){act(Number(tile.dataset.prospectCell));return}if(tool){action=tool.dataset.prospectAction;panel.querySelectorAll('[data-prospect-action]').forEach(b=>b.setAttribute('aria-pressed',String(b===tool)));return}if(e.target.closest('[data-prospect-reset]')){state=createProspectingState();action='mine';panel.querySelectorAll('[data-prospect-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.prospectAction==='mine')));panel.querySelector('[data-prospect-status]').textContent='Nouvelle tentative sur le même secteur quotidien.';draw()}};
 draw();panel.addEventListener('click',onClick);return()=>{alive=false;panel.removeEventListener('click',onClick)};
}
