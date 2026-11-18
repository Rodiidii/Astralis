export const WEAPON_COMPARE_KEY = 'astralis:gi:weapon-compare:v1';

export function normalizeWeaponComparison(value = {}, catalog = []) {
  const allowed = new Set((Array.isArray(catalog) ? catalog : []).map(item => String(item?._id ?? item?.id ?? '')).filter(Boolean));
  const ids = [...new Set((Array.isArray(value?.ids) ? value.ids : []).map(id => String(id ?? '').trim()).filter(id => id && (!allowed.size || allowed.has(id))))].slice(0, 3);
  const refinement = Math.max(1, Math.min(5, Math.floor(Number(value?.refinement) || 1)));
  return { ids, refinement };
}

export function toggleWeaponComparison(value, id, catalog = []) {
  const state = normalizeWeaponComparison(value, catalog);
  const key = String(id ?? '').trim();
  if (!key) return { state, reason: 'invalid' };
  if (state.ids.includes(key)) return { state: { ...state, ids: state.ids.filter(item => item !== key) }, reason: 'removed' };
  if (state.ids.length >= 3) return { state, reason: 'limit' };
  if (catalog.length && !catalog.some(item => String(item?._id ?? item?.id) === key)) return { state, reason: 'missing' };
  return { state: { ...state, ids: [...state.ids, key] }, reason: 'added' };
}

export function weaponComparisonRows(value, catalog = []) {
  const state = normalizeWeaponComparison(value, catalog);
  return state.ids.map(id => catalog.find(item => String(item?._id ?? item?.id) === id)).filter(Boolean).map(item => {
    const passive = item[`r${state.refinement}`] || item.r1 || {};
    return {
      id: String(item._id ?? item.id),
      name: String(item._name ?? item.name ?? 'Arme'),
      rarity: Number(item.rarity ?? item.max_rarity ?? 0) || 0,
      weaponType: String(item.weaponText ?? item.weapon ?? item.weaponType ?? item.type ?? ''),
      baseAttackLevel1: Number(item.baseAtkValue) || null,
      secondaryStat: String(item.mainStatText || item.ascensionStat?.name || ''),
      secondaryValue: String(item.baseStatText || item.ascensionStat?.value || ''),
      passiveName: String(item.effectName || ''),
      passive: String(passive.description || item.description || ''),
      refinement: state.refinement,
    };
  });
}
