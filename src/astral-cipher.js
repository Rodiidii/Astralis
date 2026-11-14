const SAVE_KEY = 'astralis:arcade:cipher:v1';
const SYMBOLS = {
  gi: ['🔥', '💧', '❄', '⚡', '🍃', '◆'],
  hsr: ['⚔', '🔥', '❄', '⚡', '🌪', '◈'],
  ww: ['⚔', '🔥', '❄', '⚡', '🌊', '✧'],
};
const dateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const gameKey = game => game === 'hsr' ? 'hsr' : ['ww', 'wuwa'].includes(game) ? 'ww' : 'gi';
const hash = value => { let out = 2166136261; for (const ch of value) { out ^= ch.charCodeAt(0); out = Math.imul(out, 16777619); } return out >>> 0; };
const randomFor = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const readState = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { return {}; } };

export function dailyCipher(game, date = dateKey()) {
  const key = gameKey(game), symbols = SYMBOLS[key], random = randomFor(hash(`${key}:${date}:cipher`));
  return Array.from({ length: 4 }, () => Math.floor(random() * symbols.length));
}

export function evaluateCipherGuess(solution, guess) {
  let exact = 0;
  const left = [], right = [];
  solution.forEach((value, i) => { if (value === guess[i]) exact++; else { left.push(value); right.push(guess[i]); } });
  let misplaced = 0;
  for (const value of right) { const i = left.indexOf(value); if (i >= 0) { misplaced++; left.splice(i, 1); } }
  return { exact, misplaced };
}

export function renderAstralCipher() {
  return `<section class="arcade-game-view cipher-view" data-arcade-view="cipher" role="tabpanel" aria-label="Décodeur astral" hidden>
    <header class="cipher-heading"><div><small>CRYPTAGE DU JOUR · CODE IDENTIQUE POUR TON UNIVERS</small><h2>Décodeur astral</h2><p>Déchiffre la séquence de quatre sceaux. Les retours indiquent combien sont bien placés et combien sont présents ailleurs.</p></div><div class="cipher-score"><small>SÉRIE</small><b data-cipher-streak>0 jour</b><small>RECORD</small><b data-cipher-best>—</b></div></header>
    <div class="cipher-console"><div class="cipher-orbit" aria-hidden="true"><i></i><i></i><i></i><span>✦</span></div><div class="cipher-board"><div class="cipher-secret" data-cipher-secret aria-label="Code secret">${Array.from({length:4},(_,i)=>`<span data-cipher-secret-slot="${i}">?</span>`).join('')}</div><div class="cipher-hud"><span data-cipher-day>CODE DU JOUR</span><b data-cipher-status aria-live="polite">Sélectionne quatre sceaux.</b></div>
      <div class="cipher-history" data-cipher-history aria-label="Tentatives précédentes"></div><div class="cipher-guess" data-cipher-guess aria-label="Combinaison actuelle">${Array.from({length:4},(_,i)=>`<button type="button" data-cipher-slot="${i}" aria-label="Emplacement ${i+1}, vide">＋</button>`).join('')}</div>
      <div class="cipher-palette" data-cipher-palette aria-label="Sceaux disponibles"></div><div class="cipher-actions"><button type="button" data-cipher-clear>Effacer</button><button type="button" data-cipher-submit>Décrypter la séquence <span aria-hidden="true">↗</span></button></div>
      <p class="cipher-rule">Quatre emplacements · répétitions autorisées · six essais maximum</p></div></div>
    <footer class="cipher-footer"><span>Les mêmes sceaux sont cachés pour tous les joueurs aujourd’hui.</span><b data-cipher-result></b></footer>
  </section>`;
}

export function mountAstralCipher(root, game = 'gi') {
  const panel = root.querySelector('[data-arcade-view="cipher"]');
  if (!panel) return () => {};
  const key = gameKey(game), date = dateKey(), symbols = SYMBOLS[key], solution = dailyCipher(key, date);
  const historyNode = panel.querySelector('[data-cipher-history]'), guessNode = panel.querySelector('[data-cipher-guess]');
  const status = panel.querySelector('[data-cipher-status]'), result = panel.querySelector('[data-cipher-result]');
  const state = readState(), gameState = state[key] || { days: {}, best: 0, streak: 0, lastWon: '' };
  const savedDay = gameState.days?.[date] || { guesses: [], done: false, won: false, score: 0 };
  let draft = [], selectedSlot = 0;

  const renderHistory = () => {
    historyNode.innerHTML = savedDay.guesses.map((row, i) => `<div class="cipher-history-row"><small>${String(i + 1).padStart(2, '0')}</small><span class="cipher-history-code">${row.guess.map(n => `<i data-sigil="${n}">${symbols[n]}</i>`).join('')}</span><span class="cipher-clues" aria-label="${row.exact} bien placé(s), ${row.misplaced} présent(s) ailleurs">${Array.from({length:row.exact},()=>'<i class="exact">●</i>').join('')}${Array.from({length:row.misplaced},()=>'<i class="misplaced">●</i>').join('')}${Array.from({length:4-row.exact-row.misplaced},()=>'<i class="absent">·</i>').join('')}</span></div>`).join('');
    panel.querySelectorAll('[data-cipher-secret-slot]').forEach((node,i)=>{node.textContent=savedDay.done?symbols[solution[i]]:'?';});
  };
  const renderDraft = () => {
    guessNode.querySelectorAll('[data-cipher-slot]').forEach((button,i)=>{
      const value = draft[i];
      button.textContent = value === undefined ? '＋' : symbols[value];
      button.dataset.filled = String(value !== undefined);
      button.setAttribute('aria-label', `Emplacement ${i + 1}, ${value === undefined ? 'vide' : `sceau ${symbols[value]}`}${selectedSlot === i ? ', sélectionné' : ''}`);
      button.setAttribute('aria-pressed', String(selectedSlot === i));
    });
    panel.querySelectorAll('[data-cipher-token]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.cipherToken)===draft[selectedSlot])));
  };
  const save = () => { state[key] = gameState; try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {} };
  const settle = won => {
    savedDay.done = true; savedDay.won = won; savedDay.score = won ? Math.max(100, 700 - savedDay.guesses.length * 100) : 0;
    gameState.days ||= {}; gameState.days[date] = savedDay;
    if (won) {
      gameState.best = Math.max(Number(gameState.best) || 0, savedDay.score);
      if (gameState.lastWon !== date) {
        const prev = new Date(`${gameState.lastWon || '2000-01-01'}T12:00:00`), now = new Date(`${date}T12:00:00`);
        gameState.streak = Math.round((now - prev) / 86400000) === 1 ? (Number(gameState.streak) || 0) + 1 : 1;
        gameState.lastWon = date;
      }
      status.textContent = 'Séquence harmonisée · code révélé';
      result.textContent = `✦ ${savedDay.score} points · ${gameState.streak} jour${gameState.streak===1?'':'s'} de série`;
      panel.classList.add('is-solved');
    } else {
      status.textContent = 'Le signal s’est dissipé · code révélé';
      result.textContent = 'Reviens demain pour un nouveau cryptage.';
      panel.classList.add('is-failed');
    }
    save();
    panel.querySelector('[data-cipher-submit]').disabled = true;
    panel.querySelector('[data-cipher-clear]').disabled = true;
    renderHistory();
  };
  const onClick = event => {
    const slot = event.target.closest('[data-cipher-slot]'), token = event.target.closest('[data-cipher-token]');
    if (savedDay.done) return;
    if (slot) { selectedSlot = Number(slot.dataset.cipherSlot); renderDraft(); return; }
    if (token) { draft[selectedSlot] = Number(token.dataset.cipherToken); selectedSlot = draft.length < 4 ? draft.length : (selectedSlot + 1) % 4; renderDraft(); return; }
    if (event.target.closest('[data-cipher-clear]')) { draft = []; selectedSlot = 0; status.textContent = 'Combinaison effacée.'; renderDraft(); return; }
    if (event.target.closest('[data-cipher-submit]')) {
      if (draft.length !== 4 || draft.some(n => !Number.isInteger(n))) { status.textContent = 'Il faut placer quatre sceaux avant de décrypter.'; return; }
      const feedback = evaluateCipherGuess(solution, draft), guess = [...draft];
      savedDay.guesses.push({ guess, ...feedback }); draft = []; selectedSlot = 0;
      if (feedback.exact === 4) settle(true);
      else if (savedDay.guesses.length >= 6) settle(false);
      else status.textContent = `${feedback.exact} bien placé${feedback.exact===1?'':'s'} · ${feedback.misplaced} présent${feedback.misplaced===1?'':'s'} ailleurs · ${6-savedDay.guesses.length} essais restants`;
      save(); renderHistory(); renderDraft();
    }
  };
  panel.querySelector('[data-cipher-palette]').innerHTML = symbols.map((symbol,i)=>`<button type="button" data-cipher-token="${i}" aria-label="Choisir le sceau ${symbol}" aria-pressed="false"><i data-sigil="${i}">${symbol}</i></button>`).join('');
  panel.querySelector('[data-cipher-best]').textContent = gameState.best ? `${gameState.best} pts` : '—';
  panel.querySelector('[data-cipher-streak]').textContent = `${Number(gameState.streak)||0} jour${gameState.streak===1?'':'s'}`;
  panel.querySelector('[data-cipher-day]').textContent = `CRYPTAGE · ${new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}).toLocaleUpperCase('fr-FR')}`;
  panel.addEventListener('click', onClick);
  if (savedDay.done) {
    status.textContent = savedDay.won ? 'Séquence harmonisée · code révélé' : 'Le signal s’est dissipé · code révélé';
    result.textContent = savedDay.won ? `✦ ${savedDay.score} points · ${gameState.streak} jour${gameState.streak===1?'':'s'} de série` : 'Reviens demain pour un nouveau cryptage.';
    panel.classList.add(savedDay.won ? 'is-solved' : 'is-failed');
    panel.querySelector('[data-cipher-submit]').disabled = true; panel.querySelector('[data-cipher-clear]').disabled = true;
  }
  renderHistory(); renderDraft();
  return () => panel.removeEventListener('click', onClick);
}
