const CATALOG = new Set(['characters','weapons','sets','materials']);
const TOOLS = new Set(['teams','builds','lab','calc','farming','endgame','profile','hoyolab','wishes','optimizer']);
let activeRail = null;
let searchNode = null;

function currentSection() {
  return document.querySelector('.side-rail .rail-link.active')?.dataset.nav || 'dashboard';
}
function classifyPage() {
  const host = document.querySelector('#page-content');
  if (!host) return;
  const section = currentSection();
  const isDetail = !!document.querySelector('#modal-root .detail-modal');
  host.dataset.template = isDetail ? 'detail'
    : section === 'dashboard' ? 'dashboard'
    : CATALOG.has(section) ? 'catalog'
    : TOOLS.has(section) ? 'tool' : 'catalog';
  host.dataset.section = section;
}
function installRailGroups(rail) {
  for (const label of [...rail.querySelectorAll('.rail-label')]) {
    const content = label.nextElementSibling;
    if (!content?.matches('.game-list,.rail-nav')) continue;
    const group = document.createElement('details');
    group.className = 'rail-group';
    group.open = true;
    const summary = document.createElement('summary');
    summary.textContent = label.textContent.trim();
    group.append(summary, content);
    label.replaceWith(group);
  }
}
function installSearch(rail) {
  if (activeRail === rail && searchNode?.isConnected) return;
  activeRail = rail;
  installRailGroups(rail);
  const box = document.createElement('label');
  box.className = 'rail-quick-search';
  box.innerHTML = '<input type="search" aria-label="Rechercher une page" placeholder="Rechercher une page…" autocomplete="off"><kbd>Ctrl K</kbd>';
  rail.querySelector('.brand')?.insertAdjacentElement('afterend', box);
  searchNode = box.querySelector('input');
  searchNode.addEventListener('input', () => filterRail(searchNode.value));
  searchNode.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const first = [...rail.querySelectorAll('.rail-link')].find(node => node.dataset.searchHidden !== 'true');
    first?.click();
    searchNode.blur();
  });
}
function filterRail(raw) {
  if (!activeRail) return;
  const query = raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  activeRail.querySelectorAll('.rail-link').forEach(link => {
    const label = link.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
    link.dataset.searchHidden = String(!!query && !label.includes(query));
  });
  activeRail.querySelectorAll('.rail-group').forEach(group => {
    const links = [...group.querySelectorAll('.rail-link')];
    const visible = links.length ? links.some(link => link.dataset.searchHidden !== 'true') : !!group.querySelector('.game-list');
    group.dataset.searchEmpty = String(!visible);
    if (query && visible) group.open = true;
  });
}
function sync() {
  const rail = document.querySelector('.side-rail');
  if (rail) installSearch(rail);
  classifyPage();
  const activeGame = document.querySelector('.game-tab.active,.game-choice.active');
  const gameAccent = activeGame ? getComputedStyle(activeGame).getPropertyValue('--g').trim() : '';
  document.querySelector('.app-frame')?.style.setProperty('--ds-game-accent', gameAccent || 'var(--accent)');
  const modal = !!document.querySelector('#modal-root .modal-backdrop');
  document.documentElement.classList.toggle('astralis-modal-open', modal);
}
window.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    const input = document.querySelector('.rail-quick-search input');
    input?.focus(); input?.select();
  }
  if (event.key === 'Escape' && searchNode) { searchNode.value = ''; filterRail(''); }
});
const observer = new MutationObserver(sync);
observer.observe(document.documentElement, { childList: true, subtree: true });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once: true });
else sync();
