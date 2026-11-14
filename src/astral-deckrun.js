const KEY = 'astralis:arcade:deckrun:v1';
const CARDS = {
  strike: { name: 'Frappe stellaire', icon: '✦', cost: 1, damage: 7, kind: 'attaque', text: 'Inflige 7 dégâts.' },
  heavy: { name: 'Impact gravitationnel', icon: '☄', cost: 2, damage: 15, kind: 'attaque', text: 'Inflige 15 dégâts.' },
  guard: { name: 'Voile prismatique', icon: '◇', cost: 1, block: 9, kind: 'défense', text: 'Obtient 9 points de garde.' },
  focus: { name: 'Visée orbitale', icon: '◎', cost: 1, draw: 2, kind: 'tactique', text: 'Pioche 2 cartes.' },
  rupture: { name: 'Fracture astrale', icon: '✧', cost: 0, damage: 4, draw: 1, kind: 'combo', text: 'Inflige 4 dégâts et pioche 1 carte.' },
  bulwark: { name: 'Bastion vivant', icon: '⬡', cost: 2, block: 17, kind: 'défense', text: 'Obtient 17 points de garde.' },
  flare: { name: 'Étoile fulgurante', icon: '✹', cost: 2, damage: 11, block: 5, kind: 'hybride', text: 'Inflige 11 dégâts et obtient 5 de garde.' },
};
const DATE = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const scopeFor = game => game === 'hsr' ? 'hsr' : ['ww','wuwa'].includes(game) ? 'ww' : 'gi';
const hash = value => { let n=2166136261; for(const c of value){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0; };
const rng = seed => { let state=seed>>>0; const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};random.state=()=>state;return random; };
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)||'{}')||{}; } catch { return {}; } };
const shuffle = (items, random) => { const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; };

function makeRun(game,date=DATE()) {
  const random=rng(hash(`${scopeFor(game)}:${date}:deck-expedition`));
  const draw=shuffle(['strike','strike','strike','strike','strike','guard','guard','guard','heavy','heavy'],random);
  const run={date,floor:1,hp:52,maxHp:52,enemyHp:42,enemyMaxHp:42,energy:3,block:0,draw,discard:[],hand:[],phase:'combat',intent:'quick',log:'Le Gardien spectral observe ta main. Choisis tes cartes, puis termine le tour.',reward:[],seed:hash(`${scopeFor(game)}:${date}:reward`)};
  drawCards(run,5,random);run.seed=random.state();return run;
}
function drawCards(run,count,random) {
  for(let i=0;i<count;i++){
    if(!run.draw.length&&run.discard.length)run.draw=shuffle(run.discard.splice(0),random);
    if(!run.draw.length)break;
    run.hand.push(run.draw.pop());
  }
  return run;
}
function rewardChoices(run) {
  const random=rng(run.seed ^ (run.floor*2654435761));
  return shuffle(['focus','rupture','bulwark','flare','heavy','guard'],random).slice(0,3);
}
function saveRun(scope,run,best) {
  const data=read();data.runs||={};data.runs[scope]=run;if(best){data.best||={};data.best[scope]=best;}
  try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}
}

export function renderDeckRun() {
  return `<section class="arcade-game-view deckrun-view" data-arcade-view="deckrun" role="tabpanel" aria-label="Expédition du deck" hidden>
    <header class="deckrun-heading"><div><small>ROGUELITE DE CARTES · EXPÉDITION QUOTIDIENNE</small><h2>La voie des reliques</h2><p>Lis l’intention du gardien, gère ton énergie et façonne ton deck entre trois affrontements.</p></div><div class="deckrun-record"><small>MEILLEURE EXPÉDITION</small><b data-deckrun-best>—</b></div></header>
    <div class="deckrun-board" data-deckrun-board><div class="deckrun-sky" aria-hidden="true"><i></i><i></i><i></i><span>✦</span></div><div class="deckrun-topline"><span data-deckrun-floor>ÉTAGE 1 / 3</span><span data-deckrun-deck>10 cartes dans le deck</span><span data-deckrun-draw>5 à piocher</span></div>
      <div class="deckrun-fight"><div class="deckrun-enemy"><div class="deckrun-enemy-sigil" data-deckrun-enemy-icon>◈</div><div class="deckrun-enemy-copy"><small data-deckrun-intent>INTENTION · ATTAQUE RAPIDE</small><h3 data-deckrun-enemy>Gardien spectral</h3><div class="deckrun-hp"><i data-deckrun-enemy-hp></i></div><b data-deckrun-enemy-hp-text>42 / 42 PV</b></div></div><div class="deckrun-hero"><div class="deckrun-hero-orbit">✧</div><div><small>TON ÉQUIPE</small><h3>Voyageur astral</h3><span><b data-deckrun-player-hp>52</b> / <span data-deckrun-player-max>52</span> PV</span><div class="deckrun-hp player"><i data-deckrun-player-bar></i></div></div><div class="deckrun-shield">⬡ <b data-deckrun-block>0</b></div></div></div>
      <div class="deckrun-status" data-deckrun-status aria-live="polite">Prépare ta séquence.</div><div class="deckrun-energy"><span>ÉNERGIE</span><b data-deckrun-energy>3 / 3</b><div data-deckrun-energy-pips></div></div>
      <div class="deckrun-reward" data-deckrun-reward hidden><small>RÉCOMPENSE DE L’ÉTAGE</small><b>Ajoute une relique à ton deck</b><div data-deckrun-reward-choices></div></div>
      <div class="deckrun-hand" data-deckrun-hand aria-label="Cartes en main"></div><div class="deckrun-controls"><button type="button" data-deckrun-end>Terminer le tour <span>↵</span></button><button type="button" data-deckrun-new hidden>Nouvelle expédition</button></div>
    </div><footer class="deckrun-foot"><span>Partie locale · Aucun dégât réel de personnage n’est calculé.</span><b data-deckrun-result></b></footer>
  </section>`;
}

export function mountDeckRun(root, game='gi') {
  const panel=root.querySelector('[data-arcade-view="deckrun"]');if(!panel)return()=>{};
  const scope=scopeFor(game),data=read();data.runs||={};data.best||={};
  const today=DATE();let run=data.runs[scope];
  if(!run||run.date!==today)run=makeRun(game,today);
  const el=s=>panel.querySelector(s),random=()=>{run.seed=(Math.imul(run.seed,1664525)+1013904223)>>>0;return run.seed/4294967296;};
  const toast=text=>{el('[data-deckrun-status]').textContent=text;};
  const save=()=>saveRun(scope,run,data.best[scope]);
  const paint=()=>{
    const won=run.phase==='won',lost=run.phase==='lost',rewarding=run.phase==='reward';
    el('[data-deckrun-floor]').textContent=`ÉTAGE ${Math.min(run.floor,3)} / 3`;
    el('[data-deckrun-deck]').textContent=`${run.draw.length+run.discard.length+run.hand.length} cartes dans le deck`;
    el('[data-deckrun-draw]').textContent=`${run.draw.length} à piocher`;
    el('[data-deckrun-enemy]').textContent=run.floor===3?'Sentinelle du Vide':'Gardien spectral';
    el('[data-deckrun-enemy-icon]').textContent=run.floor===3?'✹':'◈';
    el('[data-deckrun-intent]').textContent=`INTENTION · ${run.intent==='heavy'?'FRAPPE LOURDE':run.intent==='guard'?'CANALISE SON ARMURE':'ATTAQUE RAPIDE'}`;
    el('[data-deckrun-enemy-hp]').style.width=`${Math.max(0,run.enemyHp/run.enemyMaxHp*100)}%`;
    el('[data-deckrun-enemy-hp-text]').textContent=`${Math.max(0,run.enemyHp)} / ${run.enemyMaxHp} PV`;
    el('[data-deckrun-player-hp]').textContent=String(run.hp);el('[data-deckrun-player-max]').textContent=String(run.maxHp);
    el('[data-deckrun-player-bar]').style.width=`${Math.max(0,run.hp/run.maxHp*100)}%`;
    el('[data-deckrun-block]').textContent=String(run.block);el('[data-deckrun-energy]').textContent=`${run.energy} / 3`;
    el('[data-deckrun-energy-pips]').innerHTML=Array.from({length:3},(_,i)=>`<i class="${i<run.energy?'charged':''}"></i>`).join('');
    el('[data-deckrun-hand]').innerHTML=run.hand.map((id,i)=>{const card=CARDS[id];return `<button type="button" class="deckrun-card ${card.kind}" data-deckrun-card="${i}" ${run.energy<card.cost||run.phase!=='combat'?'disabled':''} aria-label="${card.name}, coût ${card.cost}, ${card.text}"><span class="deckrun-card-cost">${card.cost}</span><i>${card.icon}</i><b>${card.name}</b><small>${card.text}</small></button>`;}).join('')||'<div class="deckrun-empty-hand">Main vide · termine le tour pour repiocher.</div>';
    el('[data-deckrun-status]').textContent=won?'Expédition réussie · les trois gardiens sont vaincus.':lost?'Expédition terminée · le deck reste intact.':rewarding?'Choisis une relique pour renforcer ton deck.':run.log;
    el('[data-deckrun-reward]').hidden=!rewarding;
    el('[data-deckrun-end]').disabled=run.phase!=='combat';
    el('[data-deckrun-new]').hidden=!(won||lost);
    el('[data-deckrun-result]').textContent=won?`✦ Record : ${run.hp} PV restants`:lost?'Une nouvelle tentative t’attend.':'';
    const record=data.best[scope];el('[data-deckrun-best]').textContent=record?`${record.wins} victoires · ${record.bestHp} PV restants`:'—';
    if(rewarding)el('[data-deckrun-reward-choices]').innerHTML=run.reward.map(id=>{const card=CARDS[id];return `<button type="button" data-deckrun-reward-card="${id}"><i>${card.icon}</i><b>${card.name}</b><small>${card.cost} énergie · ${card.text}</small></button>`;}).join('');
    panel.classList.toggle('run-won',won);panel.classList.toggle('run-lost',lost);
  };
  const endTurn=()=>{
    if(run.phase!=='combat')return;
    const rnd=random();
    if(run.intent==='guard'){run.enemyHp=Math.min(run.enemyMaxHp,run.enemyHp+7);run.log='Le gardien canalise son armure et récupère 7 PV.';}
    else {const hit=run.intent==='heavy'?15+run.floor*2:8+run.floor;const damage=Math.max(0,hit-run.block);run.hp-=damage;run.log=`Le gardien frappe pour ${hit} · ${run.block?`${run.block} bloqués, `:''}${damage} dégâts reçus.`;}
    run.block=0;
    if(run.hp<=0){run.hp=0;run.phase='lost';}
    else {
      run.intent=rnd<.28?'guard':rnd<.56?'heavy':'quick';
      run.energy=3;run.discard.push(...run.hand);run.hand=[];
      run=drawCards(run,5,random);
    }
    if(run.phase==='lost'){data.best[scope]||={wins:0,bestHp:0};}
    save();paint();
  };
  const playCard=index=>{
    if(run.phase!=='combat')return;const id=run.hand[index],card=CARDS[id];if(!card||run.energy<card.cost)return;
    run.energy-=card.cost;run.hand.splice(index,1);run.discard.push(id);
    if(card.damage)run.enemyHp-=card.damage;
    if(card.block)run.block+=card.block;
    if(card.draw)run=drawCards(run,card.draw,random);
    if(run.enemyHp<=0){
      run.enemyHp=0;
      if(run.floor>=3){run.phase='won';data.best[scope]||={wins:0,bestHp:0};data.best[scope].wins++;data.best[scope].bestHp=Math.max(data.best[scope].bestHp,run.hp);}
      else{run.phase='reward';run.reward=rewardChoices(run);}
      run.log=run.phase==='won'?'La Sentinelle du Vide s’éteint. Teyvat est sauf.':'Le gardien est vaincu. Choisis ta récompense.';
    } else run.log=`${card.name} · ${card.text}`;
    save();paint();
  };
  const startReward=id=>{
    if(run.phase!=='reward'||!run.reward.includes(id))return;
    run.draw.push(id);run.floor++;run.enemyMaxHp=42+(run.floor-1)*13;run.enemyHp=run.enemyMaxHp;run.phase='combat';run.energy=3;run.block=0;run.intent='quick';run.log=`${CARDS[id].name} rejoint ton deck. Le prochain gardien approche.`;
    run=drawCards(run,Math.max(0,5-run.hand.length),random);save();paint();
  };
  const newRun=()=>{run=makeRun(game,today);save();paint();};
  const onClick=event=>{
    const card=event.target.closest('[data-deckrun-card]'),reward=event.target.closest('[data-deckrun-reward-card]');
    if(card){playCard(Number(card.dataset.deckrunCard));return;}
    if(reward){startReward(reward.dataset.deckrunRewardCard);return;}
    if(event.target.closest('[data-deckrun-end]')){endTurn();return;}
    if(event.target.closest('[data-deckrun-new]'))newRun();
  };
  const onKey=event=>{if(panel.hidden||!panel.contains(document.activeElement))return;if(event.key==='Enter'&&document.activeElement===el('[data-deckrun-end]')){endTurn();event.preventDefault();}if(/^[1-5]$/.test(event.key)){playCard(Number(event.key)-1);event.preventDefault();}};
  panel.addEventListener('click',onClick);window.addEventListener('keydown',onKey);paint();
  return()=>{panel.removeEventListener('click',onClick);window.removeEventListener('keydown',onKey);};
}
