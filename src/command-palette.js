import {commandSearchMatches} from './command-search.js?v=20261115-fr-search-1';
const paletteState = { open: false, active: 0, query: '' };
let characterCommands = [];
const GAME_MARKS = { gi:'/assets/ui/game-genshin.png', hsr:'/assets/ui/game-starrail.png', ww:'/assets/ui/game-wuthering.png' };
const QUICK_ACTIONS = {
  'new-task': { label: 'Créer une tâche', keywords: 'objectif rappel todo planning', global: true },
  'new-note': { label: 'Écrire une note', keywords: 'carnet mémo brouillon', global: true },
  'focus-start': { label: 'Lancer un sprint de concentration', keywords: 'focus session concentration minuteur 25 minutes', global: true },
  'focus-open': { label: 'Ouvrir ma session en cours', keywords: 'reprendre retrouver studio de session minuteur focus', global: true },
  'new-team': { label: 'Composer une équipe', keywords: 'personnages team composition' },
  'build-new': { label: 'Créer un build', keywords: 'équipement artéfacts reliques' },
  'build-duplicate': { label: 'Dupliquer le build', keywords: 'copie variante cloner équipement' },
  'calc-new': { label: 'Créer une feuille de calcul', keywords: 'calcsheet comparaison dégâts' },
  'daily-spin': { label: 'Tirer une équipe aléatoire', keywords: 'random hasard personnages' },
};

function sourceCommands() {
  const pages = [...document.querySelectorAll('.side-rail [data-nav]')]
    .filter(button => button.matches('button.rail-link') && button.textContent.trim() && !button.hidden)
    .map(button => ({ id: `page:${button.dataset.nav}`, label: button.textContent.trim().replace(/\s+/g, ' '), category: 'Page', button }));
  const games = [...document.querySelectorAll('.side-rail [data-game]')]
    .filter(button => button.matches('button.game-choice') && button.textContent.trim() && !button.hidden)
    .map(button => ({ id: `game:${button.dataset.game}`, label: (button.querySelector('span')?.textContent||button.textContent).trim().replace(/\s+/g, ' '), category: 'Changer d’univers', button }));
  let focusActive=false;try{focusActive=Boolean(JSON.parse(localStorage.getItem('astralis:focus-station:v1')||'{}')?.active)}catch{}
  const globalActions=Object.entries(QUICK_ACTIONS).filter(([action,details])=>details.global&&!(action==='focus-start'&&focusActive)&&!(action==='focus-open'&&!focusActive)).map(([action,details])=>({id:`action:${action}`,label:details.label,keywords:details.keywords,category:'Action rapide',globalAction:action}));
  const actions = Object.entries(QUICK_ACTIONS).filter(([,details])=>!details.global).flatMap(([action, details]) =>
    [...document.querySelectorAll(`button[data-action="${action}"]`)]
      .filter(button => !button.hidden && button.getAttribute('aria-hidden') !== 'true' && button.getClientRects().length)
      .map(button => ({ id: `action:${action}`, label: details.label, keywords: details.keywords, category: 'Action rapide', button }))
      .slice(0, 1)
  );
  return [...games, ...pages, ...globalActions, ...actions].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
}

function readPinnedCommands() { try { return JSON.parse(localStorage.getItem('astralis:command-pinned:v1') || '[]').filter(id => typeof id === 'string'); } catch { return []; } }

function filteredCommands() {
  const query = paletteState.query.trim().toLocaleLowerCase('fr');
  const all = sourceCommands();
  if (query) {
    const matches=all.filter(item => commandSearchMatches(`${item.label} ${item.keywords||''} ${item.category}`,query));
    const characters=characterCommands.filter(item=>commandSearchMatches(`${item.label} ${item.gameLabel} personnage`,query)).slice(0,10);
    const pinnedOrder = new Map(readPinnedCommands().map((id,index)=>[id,index]));
    return [...characters,...matches].sort((a,b)=>(pinnedOrder.get(a.id)??Infinity)-(pinnedOrder.get(b.id)??Infinity)).map(item=>pinnedOrder.has(item.id)?{...item,category:'Épinglé'}:item);
  }
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('astralis:command-recent:v1') || '[]'); } catch {}
  let recentCharacters = [];
  try { recentCharacters = JSON.parse(localStorage.getItem('astralis:command-characters:v1') || '[]'); } catch {}
  const characterOrder = new Map(recentCharacters.map((item, index) => [`${item.game}:${item.id}`, index]));
  const characters = characterCommands
    .filter(item => characterOrder.has(`${item.game}:${item.character}`))
    .sort((a, b) => characterOrder.get(`${a.game}:${a.character}`) - characterOrder.get(`${b.game}:${b.character}`))
    .slice(0, 5)
    .map(item => ({ ...item, category: 'Personnage récent' }));
  const order = new Map(recent.map((item, index) => [item.id, index]));
  const ordered = [...all].sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
  const pinnedOrder = new Map(readPinnedCommands().map((id,index)=>[id,index]));
  const destinations = ordered.map(item => order.has(item.id) ? { ...item, category: 'Récemment ouvert' } : item).sort((a,b)=>(pinnedOrder.get(a.id)??Infinity)-(pinnedOrder.get(b.id)??Infinity)).map(item=>pinnedOrder.has(item.id)?{...item,category:'Épinglé'}:item);
  return [...characters, ...destinations];
}

function paint() {
  const host = document.querySelector('[data-command-palette]');
  if (!host) return;
  const commands = filteredCommands();
  paletteState.active = Math.max(0, Math.min(paletteState.active, commands.length - 1));
  host.querySelector('[data-command-results]').innerHTML = commands.length ? commands.map((item, index) => {
    const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const fallback=GAME_MARKS[item.game]||GAME_MARKS.gi,source=escape(item.icon||fallback);
    const result=`<button type="button" class="command-result ${item.character?'command-character':''} ${index === paletteState.active ? 'is-active' : ''}" data-command-index="${index}" role="option" aria-selected="${index === paletteState.active}"><span class="command-result-icon" aria-hidden="true">${item.character||item.icon?`<img src="${source}" alt="" loading="lazy" decoding="async">`:item.category === 'Action rapide' ? '↗' : '✦'}</span><span class="command-result-copy"><b>${escape(item.label)}</b><small>${item.category === 'Personnage récent' ? item.category : item.character?`Personnage · ${escape(item.gameLabel)}`:escape(item.category)}</small></span><kbd>↵</kbd></button>`;
    if(item.character)return result;
    const pinned=readPinnedCommands().includes(item.id);
    return `<div class="command-result-wrap">${result}<button type="button" class="command-pin ${pinned?'is-pinned':''}" data-command-pin="${escape(item.id)}" aria-pressed="${pinned}" aria-label="${pinned?'Retirer des':'Épingler dans'} les favoris : ${escape(item.label)}" title="${pinned?'Retirer des':'Épingler dans'} les favoris">${pinned?'★':'☆'}</button></div>`;
  }
  ).join('') : '<p class="command-empty">Aucune page ne correspond. Essaie un autre mot.</p>';
  host.querySelectorAll('.command-result img').forEach(image=>{
    const item=commands[Number(image.closest('[data-command-index]')?.dataset.commandIndex)],fallback=GAME_MARKS[item?.game]||GAME_MARKS.gi;
    const candidates=[...(item?.iconCandidates||[]).filter(url=>url&&url!==image.src),fallback];let cursor=0;
    const retry=()=>{if(cursor<candidates.length){image.src=candidates[cursor++];return;}image.removeEventListener('error',retry);image.remove();const holder=image.closest('.command-result-icon');if(holder){holder.classList.add('is-fallback');holder.textContent='✦';}};
    image.addEventListener('error',retry);
  });
  host.querySelector('[data-command-count]').textContent = commands.length ? `${commands.length} destination${commands.length > 1 ? 's' : ''}` : '0 résultat';
}

function close() {
  const host = document.querySelector('[data-command-palette]');
  if (!host) return;
  host.remove();
  paletteState.open = false;
  paletteState.query = '';
}

function open() {
  if (paletteState.open) return;
  const host = document.createElement('div');
  host.className = 'command-palette-backdrop';
  host.dataset.commandPalette = '';
  host.innerHTML = `<section class="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><header><div><span class="eyebrow">NAVIGATION RAPIDE · ASTRALIS</span><h2 id="command-title">Où veux-tu aller ?</h2></div><kbd>ESC</kbd></header><label class="command-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Rechercher une page…" autocomplete="off" aria-label="Rechercher une page" aria-controls="command-results"><kbd>CTRL K</kbd></label><div class="command-results" id="command-results" role="listbox" data-command-results></div><footer><span data-command-count></span><span class="command-palette-help">☆ Épingle · Alt+Maj+F session</span><span><kbd>↑</kbd><kbd>↓</kbd> parcourir <kbd>↵</kbd> ouvrir</span></footer></section>`;
  host.addEventListener('click', event => {
    const pin=event.target.closest('[data-command-pin]');
    if(pin){event.preventDefault();event.stopPropagation();const ids=readPinnedCommands(),id=pin.dataset.commandPin,next=ids.includes(id)?ids.filter(value=>value!==id):[id,...ids].slice(0,12);try{localStorage.setItem('astralis:command-pinned:v1',JSON.stringify(next));}catch{}paint();host.querySelector('input')?.focus();return;}
    if (event.target === host) { close(); return; }
    const result = event.target.closest('[data-command-index]');
    if (!result) return;
    const target = filteredCommands()[Number(result.dataset.commandIndex)];
    close();
    if(target?.character){window.dispatchEvent(new CustomEvent('astralis:open-quick-character',{detail:{game:target.game,id:target.character}}));return;}
    if(target?.globalAction){window.dispatchEvent(new CustomEvent('astralis:quick-action',{detail:{action:target.globalAction}}));return;}
    target?.button.click();
  });
  host.querySelector('input').addEventListener('input', event => { paletteState.query = event.target.value; paletteState.active = 0; paint(); });
  document.body.append(host);
  paletteState.open = true;
  paint();
  host.querySelector('input').focus();
  window.dispatchEvent(new Event('astralis:quick-search-open'));
}

window.addEventListener('astralis:quick-characters-ready',event=>{
  characterCommands=(event.detail||[]).map(item=>({label:String(item.name||''),icon:String(item.icon||''),iconCandidates:Array.isArray(item.iconCandidates)?item.iconCandidates.map(String).filter(Boolean):[],game:String(item.game||''),gameLabel:String(item.gameLabel||''),character:String(item.id||''),category:'Personnage'})).filter(item=>item.label&&item.game&&item.character);
  if(paletteState.open)paint();
});

document.addEventListener('keydown', event => {
  const editing=event.target?.matches?.('input,textarea,select,[contenteditable="true"]');
  if(event.altKey&&event.shiftKey&&event.key.toLowerCase()==='f'&&!editing&&!paletteState.open&&!document.querySelector('dialog[open],[role="dialog"]')){
    event.preventDefault();let active=false;try{active=Boolean(JSON.parse(localStorage.getItem('astralis:focus-station:v1')||'{}')?.active)}catch{}
    window.dispatchEvent(new CustomEvent('astralis:quick-action',{detail:{action:active?'focus-open':'focus-start'}}));return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    paletteState.open ? close() : open();
    return;
  }
  if (!paletteState.open) return;
  if (event.key === 'Escape') { event.preventDefault(); close(); return; }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const max = filteredCommands().length;
    if (max) paletteState.active = (paletteState.active + (event.key === 'ArrowDown' ? 1 : -1) + max) % max;
    paint();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    document.querySelector(`[data-command-index="${paletteState.active}"]`)?.click();
  } else if (event.key === 'Tab') {
    const host=document.querySelector('[data-command-palette]'),focusable=[...(host?.querySelectorAll('input:not([disabled]),button:not([disabled])')||[])];
    if(!focusable.length)return;
    const current=focusable.indexOf(document.activeElement),direction=event.shiftKey?-1:1;
    const next=current<0?(direction>0?0:focusable.length-1):(current+direction+focusable.length)%focusable.length;
    event.preventDefault();focusable[next].focus();
  }
});

document.addEventListener('click', event => {
  if (event.target.closest?.('[data-command-palette-open]')) { open(); return; }
  const button = event.target.closest?.('.side-rail [data-nav], .side-rail [data-game], .mobile-quick-nav [data-nav], .topbar [data-game]');
  if (!button) return;
  const id = button.dataset.nav ? `page:${button.dataset.nav}` : `game:${button.dataset.game}`;
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('astralis:command-recent:v1') || '[]'); } catch {}
  recent = [{ id, at: Date.now() }, ...recent.filter(item => item.id !== id)].slice(0, 8);
  try { localStorage.setItem('astralis:command-recent:v1', JSON.stringify(recent)); } catch {}
});
