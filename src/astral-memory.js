import { unlockArcadeAchievement } from './arcade-achievements.js?v=20261114-arcade-5';
import { exportArcadeScoreCard } from './arcade-score-card.js?v=20261114-score-card-2';

const KEY='astralis:arcade:memory:v1';
const dateKey=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;};
const hash=value=>{let result=2166136261;for(const char of value){result^=char.charCodeAt(0);result=Math.imul(result,16777619);}return result>>>0;};

export function mountAstralMemory(root,{game,roster=[],audio=()=>{}}={}){
  const panel=root.querySelector('[data-arcade-view="memory"]');if(!panel)return()=>{};
  const grid=panel.querySelector('[data-memory-grid]'),movesNode=panel.querySelector('[data-memory-moves]'),timeNode=panel.querySelector('[data-memory-time]'),bestNode=panel.querySelector('[data-memory-best]'),status=panel.querySelector('[data-memory-status]'),startButton=panel.querySelector('[data-memory-start]'),shareButton=panel.querySelector('[data-memory-share]'),shareStatus=panel.querySelector('[data-memory-share-status]');
  const scope=game==='hsr'?'hsr':['ww','wuwa'].includes(game)?'ww':'gi',today=dateKey(),picks=roster.filter(person=>person?.icon).slice();
  let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
  const best=Number(saved[scope]?.bestMoves)||0;bestNode.textContent=best?`${best} coups`:'—';
  const dailySeed=hash(`${scope}:${today}`);let deck=[],first=null,locked=false,moves=0,matches=0,seconds=0,clock=0,started=false,finished=false,seed=dailySeed,pausedAt=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const shuffled=items=>{const out=items.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const makeDeck=()=>{
    seed=dailySeed;const selection=shuffled(picks).slice(0,8);
    while(selection.length<8)selection.push({name:`Étoile ${selection.length+1}`,icon:'/assets/app-icon.svg'});
    deck=shuffled(selection.flatMap((person,index)=>[{id:`${index}-a`,pair:index,person},{id:`${index}-b`,pair:index,person}]));
  };
  const elapsed=()=>{seconds=Math.floor((Date.now()-clock)/1000);timeNode.textContent=`${seconds} s`;};
  const render=()=>{grid.innerHTML=deck.map(card=>{const revealed=card.open||card.matched;return `<button type="button" class="memory-card ${card.open?'is-open':''} ${card.matched?'is-matched':''}" data-memory-card="${card.id}" aria-label="${revealed?card.person.name:'Carte cachée'}" aria-pressed="${Boolean(revealed)}"><span class="memory-card-inner"><span class="memory-card-back" aria-hidden="true">✦</span><span class="memory-card-front" aria-hidden="${!revealed}"><img src="${card.person.icon}" alt=""><b aria-hidden="true">${card.person.name}</b></span></span></button>`;}).join('');movesNode.textContent=String(moves);};
  const reset=()=>{clearInterval(clockTimer);first=null;locked=false;moves=0;matches=0;seconds=0;started=false;finished=false;timeNode.textContent='0 s';movesNode.textContent='0';status.textContent='MÉMORISE LES CONSTELLATIONS';startButton.textContent='Nouvelle constellation du jour';shareButton.hidden=true;shareStatus.textContent='';makeDeck();render();};
  let clockTimer=0;
  const finish=()=>{elapsed();finished=true;clearInterval(clockTimer);window.dispatchEvent(new CustomEvent('astralis:arcade-memory-solved',{detail:{game}}));shareButton.hidden=false;shareStatus.textContent='Défi terminé : ta carte de résultat est prête.';status.textContent=`Constellation réunie en ${moves} coups · ${seconds} s`;unlockArcadeAchievement('memory-win',root);if(moves<=20)unlockArcadeAchievement('memory-quick',root);const old=Number(saved[scope]?.bestMoves)||Infinity;if(moves<old){saved[scope]={bestMoves:moves,bestSeconds:seconds,date:today};try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}bestNode.textContent=`${moves} coups`;}};
  const onClick=async e=>{if(e.target.closest('[data-memory-share]')){if(!finished)return;shareButton.disabled=true;shareStatus.textContent='Création de la carte…';try{shareStatus.textContent=await exportArcadeScoreCard({game:scope,score:moves,accuracy:100,combo:moves,date:new Date().toLocaleDateString('fr-FR'),title:'Mémoire des constellations',scoreLabel:'COUPS',accuracyLabel:'RÉUSSITE',statOneLabel:'TEMPS DE RÉSOLUTION',statOneValue:`${seconds} s`,statTwoLabel:'PAIRES RÉUNIES',statTwoValue:'8 / 8'});}catch(error){shareStatus.textContent=error?.message||'La carte n’a pas pu être créée.';}finally{shareButton.disabled=false;}return;}if(e.target.closest('[data-memory-start]')){reset();return;}const button=e.target.closest('[data-memory-card]');if(!button||locked||finished)return;const card=deck.find(item=>item.id===button.dataset.memoryCard);if(!card||card.open||card.matched)return;if(!started){started=true;clock=Date.now();status.textContent='TROUVE LES PAIRES';clockTimer=setInterval(elapsed,250);}card.open=true;audio('flip');render();if(!first){first=card;return;}moves++;movesNode.textContent=String(moves);if(first.pair===card.pair){first.matched=card.matched=true;first=null;matches++;audio('match');render();if(matches===8)finish();return;}locked=true;const previous=first;first=null;grid.querySelectorAll('.memory-card.is-open').forEach(node=>node.classList.add('is-mismatch'));setTimeout(()=>{previous.open=card.open=false;locked=false;render();},720);};
  const pauseClock=()=>{if(!started||finished||pausedAt)return;pausedAt=Date.now();clearInterval(clockTimer);status.textContent='DÉFI EN PAUSE';};
  const resumeClock=()=>{if(!started||finished||!pausedAt)return;clock+=Date.now()-pausedAt;pausedAt=0;status.textContent='TROUVE LES PAIRES';clockTimer=setInterval(elapsed,250);};
  const onMode=e=>e.detail?.mode==='memory'?resumeClock():pauseClock();
  const onVisibility=()=>document.hidden?pauseClock():resumeClock();
  const onKey=e=>{if(panel.hidden||e.code!=='Escape')return;reset();};
  panel.addEventListener('click',onClick);root.addEventListener('arcade:modechange',onMode);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('keydown',onKey);reset();
  return()=>{clearInterval(clockTimer);panel.removeEventListener('click',onClick);root.removeEventListener('arcade:modechange',onMode);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('keydown',onKey);};
}
