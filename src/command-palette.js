const paletteState = { open: false, active: 0, query: '' };
let characterCommands = [];
const QUICK_ACTIONS = {
  'new-task': { label: 'Créer une tâche', keywords: 'objectif rappel todo planning' },
  'new-note': { label: 'Écrire une note', keywords: 'carnet mémo brouillon' },
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
  const actions = Object.entries(QUICK_ACTIONS).flatMap(([action, details]) =>
    [...document.querySelectorAll(`button[data-action="${action}"]`)]
      .filter(button => !button.hidden && button.getAttribute('aria-hidden') !== 'true' && button.getClientRects().length)
      .map(button => ({ id: `action:${action}`, label: details.label, keywords: details.keywords, category: 'Action rapide', button }))
      .slice(0, 1)
  );
  return [...games, ...pages, ...actions].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
}

function filteredCommands() {
  const query = paletteState.query.trim().toLocaleLowerCase('fr');
  const all = sourceCommands();
  if (query) {
    const matches=all.filter(item => `${item.label} ${item.keywords||''} ${item.category}`.toLocaleLowerCase('fr').includes(query));
    const characters=characterCommands.filter(item=>`${item.label} ${item.gameLabel} personnage`.toLocaleLowerCase('fr').includes(query)).slice(0,10);
    return [...characters,...matches];
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
  return [...characters, ...ordered.map(item => order.has(item.id) ? { ...item, category: 'Récemment ouvert' } : item)];
}

function paint() {
  const host = document.querySelector('[data-command-palette]');
  if (!host) return;
  const commands = filteredCommands();
  paletteState.active = Math.max(0, Math.min(paletteState.active, commands.length - 1));
  host.querySelector('[data-command-results]').innerHTML = commands.length ? commands.map((item, index) =>
    `<button type="button" class="command-result ${item.character?'command-character':''} ${index === paletteState.active ? 'is-active' : ''}" data-command-index="${index}" role="option" aria-selected="${index === paletteState.active}"><span class="command-result-icon" aria-hidden="true">${item.icon?`<img src="${item.icon.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])}" alt="" loading="lazy">`:item.category === 'Action rapide' ? '↗' : '✦'}</span><span class="command-result-copy"><b>${item.label.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])}</b><small>${item.category === 'Personnage récent' ? item.category : item.character?`Personnage · ${item.gameLabel}`:item.category}</small></span><kbd>↵</kbd></button>`
  ).join('') : '<p class="command-empty">Aucune page ne correspond. Essaie un autre mot.</p>';
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
  host.innerHTML = `<section class="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><header><div><span class="eyebrow">NAVIGATION RAPIDE · ASTRALIS</span><h2 id="command-title">Où veux-tu aller ?</h2></div><kbd>ESC</kbd></header><label class="command-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Rechercher une page…" autocomplete="off" aria-label="Rechercher une page" aria-controls="command-results"><kbd>CTRL K</kbd></label><div class="command-results" id="command-results" role="listbox" data-command-results></div><footer><span data-command-count></span><span><kbd>↑</kbd><kbd>↓</kbd> parcourir <kbd>↵</kbd> ouvrir</span></footer></section>`;
  host.addEventListener('click', event => {
    if (event.target === host) { close(); return; }
    const result = event.target.closest('[data-command-index]');
    if (!result) return;
    const target = filteredCommands()[Number(result.dataset.commandIndex)];
    close();
    if(target?.character){window.dispatchEvent(new CustomEvent('astralis:open-quick-character',{detail:{game:target.game,id:target.character}}));return;}
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
  characterCommands=(event.detail||[]).map(item=>({label:String(item.name||''),icon:String(item.icon||''),game:String(item.game||''),gameLabel:String(item.gameLabel||''),character:String(item.id||''),category:'Personnage'})).filter(item=>item.label&&item.game&&item.character);
  if(paletteState.open)paint();
});

document.addEventListener('keydown', event => {
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
    event.preventDefault();
    document.querySelector('[data-command-palette] input')?.focus();
  }
});

document.addEventListener('click', event => {
  if (event.target.closest?.('[data-command-palette-open]')) { open(); return; }
  const button = event.target.closest?.('.side-rail [data-nav], .side-rail [data-game]');
  if (!button) return;
  const id = button.dataset.nav ? `page:${button.dataset.nav}` : `game:${button.dataset.game}`;
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('astralis:command-recent:v1') || '[]'); } catch {}
  recent = [{ id, at: Date.now() }, ...recent.filter(item => item.id !== id)].slice(0, 8);
  try { localStorage.setItem('astralis:command-recent:v1', JSON.stringify(recent)); } catch {}
});
