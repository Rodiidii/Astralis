export const ENDGAME_CHECKLIST_KEY = 'astralis:gi:endgame-checklist:v1';
export const ENDGAME_STARS_KEY = 'astralis:gi:endgame-stars:v1';

const clean = value => String(value ?? '').trim();

export function endgameEnemyId({ cycle = '', floor = '', chamber = '', half = '', enemy = '' } = {}) {
  const parts = [cycle, floor, chamber, half, enemy].map(clean);
  return parts.every(Boolean) ? parts.join('::') : '';
}

export function endgameHalfId({ cycle = '', floor = '', chamber = '', half = '' } = {}) {
  const parts = [cycle, floor, chamber, half].map(clean);
  return parts.every(Boolean) ? parts.join('::') : '';
}

export function normalizeEndgameStars(value = {}) {
  const scores = {};
  for (const [id, raw] of Object.entries(value?.scores || {})) {
    const score = Math.max(0, Math.min(3, Math.floor(Number(raw) || 0)));
    if (clean(id)) scores[clean(id)] = score;
  }
  return { scores, updatedAt: Number(value?.updatedAt) || 0 };
}

export function setEndgameHalfStars(value, id, stars) {
  const key = clean(id), state = normalizeEndgameStars(value);
  if (!key) return state;
  const score = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
  return { scores: { ...state.scores, [key]: score }, updatedAt: Date.now() };
}

export function normalizeEndgameChecklist(value = {}) {
  const defeated = Array.isArray(value?.defeated)
    ? [...new Set(value.defeated.map(clean).filter(Boolean))]
    : [];
  return { defeated, updatedAt: Number(value?.updatedAt) || 0 };
}

export function toggleEndgameEnemy(value, id, defeated) {
  const key = clean(id);
  const state = normalizeEndgameChecklist(value);
  if (!key) return state;
  const entries = new Set(state.defeated);
  if (defeated) entries.add(key); else entries.delete(key);
  return { defeated: [...entries], updatedAt: Date.now() };
}

export function endgameEncounterProgress(rows = [], value = {}) {
  const ids = [...new Set((Array.isArray(rows) ? rows : []).map(clean).filter(Boolean))];
  const cleared = new Set(normalizeEndgameChecklist(value).defeated);
  const done = ids.filter(id => cleared.has(id)).length;
  return { total: ids.length, done, remaining: Math.max(0, ids.length - done), percent: ids.length ? Math.round(done / ids.length * 100) : 0 };
}
