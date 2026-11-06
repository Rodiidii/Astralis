const root = document.querySelector('#app');
if (root && 'MutationObserver' in window) {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced' || document.documentElement.dataset.prefPageAnimation === 'false';
  let lastPage = '', preset = 0, queued = false;
  const selectors = ['.page-hero', '#page-content > section', '#page-content > article', '#page-content > .panel', '[data-dashboard-widget]', '.binder-card', '.character-card', '.weapon-card', '.set-card', '.build-artifact-piece', '.team-card', '.endgame-live-card', '.gi-event-card', '.calc-sheet', '.favorite-card'];
  const play = () => {
    queued = false;
    const frame = root.querySelector('.app-frame'), page = frame?.dataset.themeSection;
    if (!frame || !page || page === lastPage) return;
    lastPage = page;
    if (reduced()) return;
    const nodes = [...new Set(selectors.flatMap(selector => [...root.querySelectorAll(selector)]))]
      .filter(node => node.isConnected && node.getClientRects().length && node.offsetWidth > 0)
      .slice(0, 38);
    nodes.forEach((node, index) => {
      const id = String((preset++ % 200) + 1).padStart(3, '0');
      node.style.setProperty('--ax-delay', `${Math.min(index * 38, 760)}ms`);
      node.dataset.astralisMotion = id;
      node.addEventListener('animationend', event => {
        if (event.target === node && node.dataset.astralisMotion === id) {
          node.removeAttribute('data-astralis-motion');
          node.style.removeProperty('--ax-delay');
        }
      }, { once: true });
    });
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(play));
  };
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-theme-section'] });
  schedule();
}
