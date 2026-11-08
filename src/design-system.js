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
  const template = section === 'dashboard' ? 'dashboard'
    : CATALOG.has(section) ? 'catalog'
    : TOOLS.has(section) ? 'tool'
    : document.querySelector('#modal-root .detail-modal') ? 'detail' : 'catalog';
  host.dataset.template = template;
  host.dataset.section = section;
}
function installSearch(rail) {
  if (activeRail === rail && searchNode?.isConnected) return;
  activeRail = rail;
  const box = document.createElement('label');
  box.className = 'rail-quick-search';
  box.innerHTML = '<input type="search" aria-label="Rechercher une page" placeholder="Rechercher une page…" autocomplete="off"><kbd>Ctrl K</kbd>';
  const brand = rail.querySelector('.brand');
  brand?.insertAdjacentElement('afterend', box);
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
    const match = !query || link.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').includes(query);
    link.dataset.searchHidden = String(!match);
  });
  activeRail.querySelectorAll('.rail-label').forEach(label => {
    let next = label.nextElementSibling, visible = false;
    while (next && !next.classList.contains('rail-label')) {
      if (next.matches('.rail-nav') && [...next.querySelectorAll('.rail-link')].some(link => link.dataset.searchHidden !== 'true')) visible = true;
      next = next.nextElementSibling;
    }
    label.dataset.searchEmpty = String(!visible);
  });
}
function sync() {
  const rail = document.querySelector('.side-rail');
  if (rail) installSearch(rail);
  classifyPage();
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
