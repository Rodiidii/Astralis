export const LORE_READING_KEY = 'astralis:gi:lore-reading:v1';

export function normalizeLoreReadingState(value = {}) {
  const ids = field => [...new Set((Array.isArray(value?.[field]) ? value[field] : []).map(id => String(id ?? '').trim()).filter(Boolean))];
  const recent = (Array.isArray(value?.recent) ? value.recent : []).map(row => ({
    id: String(row?.id ?? '').trim(),
    category: ['characters', 'regions', 'events', 'cosmology'].includes(row?.category) ? row.category : '',
    label: String(row?.label ?? '').trim().slice(0, 100),
    visitedAt: Number(row?.visitedAt) || 0,
  })).filter(row => row.id && row.category && row.label).filter((row, index, rows) => rows.findIndex(item => item.id === row.id && item.category === row.category) === index).slice(0, 6);
  return { read: ids('read'), saved: ids('saved'), recent, updatedAt: Number(value?.updatedAt) || 0 };
}

export function recordLoreVisit(value, category, id, label, now = Date.now()) {
  if (!['characters', 'regions', 'events', 'cosmology'].includes(category) || !String(id ?? '').trim() || !String(label ?? '').trim()) return normalizeLoreReadingState(value);
  const state = normalizeLoreReadingState(value), key = String(id).trim();
  return { ...state, recent: [{ id: key, category, label: String(label).trim().slice(0, 100), visitedAt: Number(now) || Date.now() }, ...state.recent.filter(row => !(row.id === key && row.category === category))].slice(0, 6), updatedAt: Number(now) || Date.now() };
}

export function loreRecentVisits(value) {
  return normalizeLoreReadingState(value).recent.slice().sort((a, b) => b.visitedAt - a.visitedAt);
}

export function toggleLoreReadingState(value, field, id, enabled) {
  if (!['read', 'saved'].includes(field) || !String(id ?? '').trim()) return normalizeLoreReadingState(value);
  const state = normalizeLoreReadingState(value), key = String(id).trim(), values = new Set(state[field]);
  if (enabled ?? !values.has(key)) values.add(key); else values.delete(key);
  return { ...state, [field]: [...values], updatedAt: Date.now() };
}

export function loreReadingCounts(state, characters = []) {
  const normalized = normalizeLoreReadingState(state), valid = new Set((Array.isArray(characters) ? characters : []).map(row => String(row?._id ?? row?.id ?? '')).filter(Boolean));
  const read = normalized.read.filter(id => valid.has(id)).length;
  const saved = normalized.saved.filter(id => valid.has(id)).length;
  return { total: valid.size, read, unread: Math.max(0, valid.size - read), saved, percent: valid.size ? Math.round(read / valid.size * 100) : 0 };
}

export function loreCollectionCounts(state, rows = [], idOf = row => row?.id) {
  const normalized = normalizeLoreReadingState(state), ids = [...new Set((Array.isArray(rows) ? rows : []).map(row => String(idOf(row) ?? '').trim()).filter(Boolean))];
  const readSet = new Set(normalized.read), savedSet = new Set(normalized.saved), read = ids.filter(id => readSet.has(id)).length, saved = ids.filter(id => savedSet.has(id)).length;
  return { total: ids.length, read, unread: Math.max(0, ids.length - read), saved, percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
}

export function filterLoreReadingCharacters(characters = [], state, filter = 'all') {
  const normalized = normalizeLoreReadingState(state), read = new Set(normalized.read), saved = new Set(normalized.saved);
  if (filter === 'read') return characters.filter(row => read.has(String(row?._id ?? row?.id ?? '')));
  if (filter === 'unread') return characters.filter(row => !read.has(String(row?._id ?? row?.id ?? '')));
  if (filter === 'saved') return characters.filter(row => saved.has(String(row?._id ?? row?.id ?? '')));
  return Array.isArray(characters) ? characters : [];
}
