const STORAGE='astralis:constellation-path:v1';
const DAY=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layouts=[
  {name:'La Voie de l’Express',points:[[12,18],[38,12],[64,19],[88,12],[18,48],[44,43],[70,50],[91,42],[12,81],[39,73],[66,83],[88,76]],path:[0,1,2,3,7,6,5,4,8,9,10,11]},
  {name:'Le Cygne astral',points:[[18,13],[44,10],[73,16],[89,34],[72,42],[47,36],[23,43],[10,65],[33,78],[59,70],[83,84],[92,60]],path:[0,1,2,3,4,5,6,7,8,9,10,11]},
  {name:'Les Jardins suspendus',points:[[14,22],[39,12],[62,20],[86,14],[24,44],[49,39],[76,46],[12,67],[39,83],[63,69],[88,82],[89,57]],path:[0,1,2,3,6,11,10,9,8,7,4,5]}
];
function seededHash(text){let x=2166136261;for(const c of text)x=Math.imul(x^c.charCodeAt(0),16777619);return x>>>0}
function graphFor(){const day=DAY(),seed=seededHash(`${day}:astral-path`),layout=layouts[seed%layouts.length],path=layout.path,edges=new Set();for(let i=0;i<path.length-1;i++)edges.add([Math.min(path[i],path[i+1]),Math.max(path[i],path[i+1])].join('-'));const extras=[[0,5],[1,6],[2,7],[4,9],[5,10],[3,8],[6,10],[2,5],[7,10]];for(const [a,b] of extras)if((seededHash(`${seed}:${a}:${b}`)%3)!==0)edges.add([a,b].sort((x,y)=>x-y).join('-'));return {day,seed,layout,edges:[...edges].map(edge=>edge.split('-').map(Number)),solution:path}}
function load(){try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}}
function save(data){try{localStorage.setItem(STORAGE,JSON.stringify(data))}catch{}}

export function mountAstralConstellations(root,{game='gi',audio=()=>{},award=()=>{}}={}){
  const panel=root?.querySelector('[data-arcade-view="path"]');if(!panel)return()=>{};
  const graph=graphFor(game),board=panel.querySelector('[data-path-board]'),status=panel.querySelector('[data-path-status]'),scoreNode=panel.querySelector('[data-path-score]'),bestNode=panel.querySelector('[data-path-best]'),timeNode=panel.querySelector('[data-path-time]'),movesNode=panel.querySelector('[data-path-moves]'),startButton=panel.querySelector('[data-path-start]'),hintButton=panel.querySelector('[data-path-hint]'),undoButton=panel.querySelector('[data-path-undo]');
  const existing=load(),profile=existing[game]||{},today=graph.day;
  let solvedToday=profile.day===today&&profile.solved===true,todayScore=Number(profile.todayScore)||0,todayTime=Number(profile.todayTime)||0;
  let path=[],undoStack=[],startedAt=0,elapsed=0,timer=0,finished=solvedToday,started=false,hints=0;
  let best=Number(profile.best)||0;bestNode.textContent=best?`${best.toLocaleString('fr-FR')} pts`:'—';
  const connected=(a,b)=>graph.edges.some(([x,y])=>x===a&&y===b||x===b&&y===a);
  function render(){
    const used=new Set(path),pointData=graph.layout.points;
    const edgeSvg=graph.edges.map(([a,b])=>{const p=pointData[a],q=pointData[b],active=path.some((id,i)=>i<path.length-1&&((id===a&&path[i+1]===b)||(id===b&&path[i+1]===a)));return `<line x1="${p[0]}%" y1="${p[1]}%" x2="${q[0]}%" y2="${q[1]}%" class="path-edge ${active?'is-lit':''}"/>`}).join('');
    const trace=path.length>1?`<polyline class="path-trace" points="${path.map(id=>pointData[id].map(n=>`${n}%`).join(',')).join(' ')}"/>`:'';
    const nodes=pointData.map(([x,y],id)=>{const first=id===graph.solution[0],last=id===graph.solution.at(-1),current=path.at(-1)===id;return `<button type="button" class="path-star ${used.has(id)?'is-visited':''} ${current?'is-current':''} ${first?'is-origin':''} ${last?'is-destination':''}" style="--x:${x}%;--y:${y}%" data-path-node="${id}" aria-label="Étoile ${id+1}${first?' · départ':last?' · arrivée':''}${used.has(id)?' · visitée':''}" ${finished||!started?'disabled':''}><i>${first?'✦':last?'✧':'·'}</i><small>${String(id+1).padStart(2,'0')}</small></button>`}).join('');
    board.innerHTML=`<svg class="path-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${edgeSvg}${trace}</svg>${nodes}`;
    movesNode.textContent=String(path.length);
    scoreNode.textContent=solvedToday?todayScore.toLocaleString('fr-FR'):'—';
    startButton.textContent=finished?'Défi du jour terminé ✓':started?'Recommencer':'Commencer le tracé';
    startButton.disabled=solvedToday;
    hintButton.disabled=!started||finished||hints>=3;
    undoButton.disabled=!started||finished||path.length<2;
    if(solvedToday){status.textContent=`Défi réussi · ${todayTime} s · ${hints} aide(s)`;timeNode.textContent=`${todayTime} s`;}
    else if(finished){status.textContent='Le chemin s’est refermé. Recommence pour trouver une autre route.';}
    else if(!started){status.textContent=`Départ ${graph.solution[0]+1} · arrivée ${graph.solution.at(-1)+1} · passe par les 12 étoiles une seule fois.`;}
    else status.textContent=path.length===1?'Choisis une étoile reliée pour continuer.':`${12-path.length} étoile(s) à relier · aucune étoile déjà visitée.`;
  }
  function updateTimer(){if(!started||finished)return;elapsed=Math.floor((Date.now()-startedAt)/1000);timeNode.textContent=`${elapsed} s`;}
  function begin(){if(solvedToday)return;started=true;finished=false;path=[graph.solution[0]];undoStack=[];hints=0;elapsed=0;startedAt=Date.now();clearInterval(timer);timer=setInterval(updateTimer,250);render();audio('start');}
  function choose(id){if(!started||finished||!Number.isInteger(id))return;if(path.at(-1)===id)return;if(path.includes(id)){status.textContent='Cette étoile est déjà traversée. Une constellation se trace sans repasser deux fois au même endroit.';return;}if(!connected(path.at(-1),id)){status.textContent='Ces étoiles ne sont pas reliées. Suis un trait lumineux.';return;}undoStack.push([...path]);path.push(id);audio('step');
    if(path.length===12){if(id!==graph.solution.at(-1)){path.pop();render();status.textContent='Termine à l’étoile d’arrivée indiquée par ✧.';return;}finished=true;solvedToday=true;clearInterval(timer);elapsed=Math.max(1,Math.floor((Date.now()-startedAt)/1000));const earned=Math.max(100,1200-elapsed*5-hints*120),saved=load(),previous=saved[game]||{};best=Math.max(Number(previous.best)||0,earned);todayScore=earned;todayTime=elapsed;bestNode.textContent=`${best.toLocaleString('fr-FR')} pts`;const next={...saved,[game]:{...previous,day:today,solved:true,todayTime:elapsed,todayScore:earned,best,solvedCount:(Number(previous.solvedCount)||0)+1}};save(next);audio('win');award('path-first');if(earned>=900)award('path-quick');}
    render();}
  function onClick(event){const node=event.target.closest('[data-path-node]');if(node){choose(Number(node.dataset.pathNode));return;}if(event.target.closest('[data-path-start]')){if(started&&!finished){begin();status.textContent='Nouveau tracé commencé.';}else begin();}else if(event.target.closest('[data-path-undo]')){if(undoStack.length){path=undoStack.pop();render();}}else if(event.target.closest('[data-path-hint]')){if(!started||hints>=3)return;const next=graph.solution[path.length],current=path.at(-1);if(next!=null){hints++;panel.querySelectorAll('[data-path-node]').forEach(el=>el.classList.toggle('is-hint',Number(el.dataset.pathNode)===next));status.textContent=`Indice ${hints}/3 : l’étoile ${next+1} est reliée à ${current+1}.`;setTimeout(()=>panel.querySelectorAll('.is-hint').forEach(el=>el.classList.remove('is-hint')),1500);}}
  }
  function pauseClock(){if(started&&!finished&&timer){elapsed=Math.floor((Date.now()-startedAt)/1000);clearInterval(timer);timer=0;}}
  function resumeClock(){if(started&&!finished&&!timer&&!document.hidden){startedAt=Date.now()-elapsed*1000;timer=setInterval(updateTimer,250);}}
  function onVisibility(){if(document.hidden)pauseClock();else resumeClock();}
  function onModeChange(event){if(event.detail?.mode==='path')resumeClock();else pauseClock();}
  panel.addEventListener('click',onClick);document.addEventListener('visibilitychange',onVisibility);root.addEventListener('arcade:modechange',onModeChange);render();
  return()=>{clearInterval(timer);panel.removeEventListener('click',onClick);document.removeEventListener('visibilitychange',onVisibility);root.removeEventListener('arcade:modechange',onModeChange)};
}
