export const CHARACTER_COMPARE_KEY = 'astralis:gi:character-compare:v1';

export function normalizeCharacterComparison(value = {}, catalog = []) {
  const allowed = new Set((Array.isArray(catalog) ? catalog : []).map(row => String(row?._id ?? row?.id ?? '')).filter(Boolean));
  const ids = [...new Set((Array.isArray(value?.ids) ? value.ids : []).map(id => String(id ?? '').trim()).filter(id => id && (!allowed.size || allowed.has(id))))].slice(0, 3);
  return { ids };
}

export function toggleCharacterComparison(value, id, catalog = []) {
  const state = normalizeCharacterComparison(value, catalog);
  const key = String(id ?? '').trim();
  if (!key) return { state, reason: 'invalid' };
  if (state.ids.includes(key)) return { state: { ids: state.ids.filter(item => item !== key) }, reason: 'removed' };
  if (state.ids.length >= 3) return { state, reason: 'limit' };
  if (catalog.length && !catalog.some(row => String(row?._id ?? row?.id) === key)) return { state, reason: 'missing' };
  return { state: { ids: [...state.ids, key] }, reason: 'added' };
}

export function characterComparisonRows(value, catalog = []) {
  const state = normalizeCharacterComparison(value, catalog);
  return state.ids.map(id => catalog.find(row => String(row?._id ?? row?.id) === id)).filter(Boolean).map(row => ({
    id: String(row._id ?? row.id),
    name: String(row._name ?? row.name ?? 'Personnage'),
    rarity: Number(row.rarity ?? row.max_rarity ?? 0) || 0,
    element: String(row.elementText ?? row.vision ?? row.element ?? row.pathText ?? row.path ?? ''),
    weapon: String(row.weaponText ?? row.weaponType ?? row.weapon ?? row.type ?? ''),
    region: String(row.nation ?? row.region ?? ''),
    affiliation: String(row.faction ?? row.affiliation ?? row.association ?? ''),
  }));
}
