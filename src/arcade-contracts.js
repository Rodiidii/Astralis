const STORAGE_KEY = 'astralis:arcade:daily-contracts:v1';
const WALLET_KEY = 'astralis:booster-quests:v1';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const safeRead = key => {
  try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; }
};

const objectives = [
  { id: 'lines', icon: '▤', title: 'Tracer une constellation', detail: 'Efface 3 lignes au Tetris astral', target: 3 },
  { id: 'memory', icon: '✧', title: 'Réunir les étoiles', detail: 'Résous une Mémoire des constellations', target: 1 },
  { id: 'boss', icon: '⚔', title: 'Vaincre un gardien', detail: 'Remporte un étage dans l’Arène des échos', target: 1 },
];

export function renderArcadeContracts() {
  return `<section class="arcade-contracts" data-arcade-contracts aria-labelledby="arcade-contract-title">
    <div class="arcade-contract-heading"><div><small>CONTRAT ASTRAL · RENOUVELÉ À MINUIT</small><h2 id="arcade-contract-title">Trois actes, une récompense</h2><p>Les progrès suivent tes parties et restent enregistrés sur cet appareil.</p></div>
      <div class="arcade-contract-reward"><span>✦</span><b>10</b><small>boosters bonus</small></div></div>
    <div class="arcade-contract-list">${objectives.map((o,i)=>`<article class="arcade-contract-card" data-contract="${o.id}"><div class="arcade-contract-icon" aria-hidden="true">${o.icon}</div><div class="arcade-contract-copy"><small>ACTE 0${i+1}</small><b>${o.title}</b><span>${o.detail}</span><div class="arcade-contract-meter"><i data-contract-meter="${o.id}"></i></div></div><div class="arcade-contract-count"><b data-contract-count="${o.id}">0/${o.target}</b><span data-contract-state="${o.id}">À faire</span></div></article>`).join('')}</div>
    <footer class="arcade-contract-footer"><span data-contract-summary>0 / 3 actes accomplis</span><b data-contract-reward-state>Récompense à gagner</b></footer>
  </section>`;
}

export function mountArcadeContracts(root) {
  const panel = root.querySelector('[data-arcade-contracts]');
  if (!panel) return () => {};
  const game = root.dataset.game || 'gi';
  const key = `${game}:${todayKey()}`;
  const all = safeRead(STORAGE_KEY);
  const state = all[key] && typeof all[key] === 'object' ? all[key] : { progress: {}, claimed: false };
  state.progress ||= {};

  const paint = () => {
    let completed = 0;
    for (const item of objectives) {
      const amount = Math.min(item.target, Math.max(0, Number(state.progress[item.id]) || 0));
      const done = amount >= item.target;
      if (done) completed++;
      const card = panel.querySelector(`[data-contract="${item.id}"]`);
      card?.classList.toggle('is-complete', done);
      const count = panel.querySelector(`[data-contract-count="${item.id}"]`);
      if (count) count.textContent = `${amount}/${item.target}`;
      const status = panel.querySelector(`[data-contract-state="${item.id}"]`);
      if (status) status.textContent = done ? 'Accompli' : 'À faire';
      const meter = panel.querySelector(`[data-contract-meter="${item.id}"]`);
      if (meter) meter.style.width = `${amount / item.target * 100}%`;
    }
    panel.querySelector('[data-contract-summary]').textContent = `${completed} / 3 actes accomplis`;
    const reward = panel.querySelector('[data-contract-reward-state]');
    reward.textContent = state.claimed ? '✦ 10 boosters ajoutés' : completed === 3 ? 'Récompense prête' : 'Récompense à gagner';
    panel.classList.toggle('is-fulfilled', completed === 3);
  };

  const save = () => {
    all[key] = state;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch {}
  };

  const add = (id, amount = 1) => {
    if (!objectives.some(item => item.id === id)) return;
    const item = objectives.find(row => row.id === id);
    state.progress[id] = Math.min(item.target, (Number(state.progress[id]) || 0) + Math.max(0, Number(amount) || 0));
    const complete = objectives.every(row => (Number(state.progress[row.id]) || 0) >= row.target);
    if (complete && !state.claimed) {
      state.claimed = true;
      const wallet = safeRead(WALLET_KEY);
      wallet.bonus = Math.max(0, Number(wallet.bonus) || 0) + 10;
      try { localStorage.setItem(WALLET_KEY, JSON.stringify(wallet)); } catch {}
      window.dispatchEvent(new CustomEvent('astralis:booster-wallet-updated', { detail: { bonus: wallet.bonus, earned: 10, source: 'daily-arcade-contract' } }));
      panel.classList.remove('contract-celebrate');
      void panel.offsetWidth;
      panel.classList.add('contract-celebrate');
    }
    save();
    paint();
  };

  const onEvent = event => {
    const detail = event.detail || {};
    if (detail.game && detail.game !== game) return;
    if (event.type === 'astralis:arcade-lines-cleared') add('lines', detail.lines);
    else if (event.type === 'astralis:arcade-memory-solved') add('memory');
    else if (event.type === 'astralis:arcade-boss-defeated') add('boss');
  };
  const events = ['astralis:arcade-lines-cleared', 'astralis:arcade-memory-solved', 'astralis:arcade-boss-defeated'];
  events.forEach(name => window.addEventListener(name, onEvent));
  paint();
  return () => events.forEach(name => window.removeEventListener(name, onEvent));
}
