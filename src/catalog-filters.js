export function resetCatalogFilters(state) {
  return {
    ...state,
    query: '',
    element: 'all',
    weaponType: 'all',
    rarity: 'all',
    ownedOnly: false,
    order: 'release',
    pageSize: 24
  };
}

export function catalogActiveFilterChips(state = {}) {
  const chips = [];
  if (String(state.query || '').trim()) chips.push({ key: 'query', label: `Recherche · ${String(state.query).trim()}` });
  if (state.element && state.element !== 'all') chips.push({ key: 'element', label: String(state.element) });
  if (state.weaponType && state.weaponType !== 'all') chips.push({ key: 'weaponType', label: ({sword:'Épée',claymore:'Épée à deux mains',polearm:'Lance',bow:'Arc',catalyst:'Catalyseur'})[state.weaponType] || String(state.weaponType) });
  if (state.rarity && state.rarity !== 'all') chips.push({ key: 'rarity', label: `${state.rarity} étoiles` });
  if (state.ownedOnly) chips.push({ key: 'ownedOnly', label: 'Possédés uniquement' });
  if (state.order && state.order !== 'release') chips.push({ key: 'order', label: state.order === 'name' ? 'Nom A—Z' : state.order === 'rarity' ? 'Rareté' : String(state.order) });
  return chips;
}

export function clearCatalogFilter(state = {}, key = '') {
  const defaults = { query: '', element: 'all', weaponType: 'all', rarity: 'all', ownedOnly: false, order: 'release' };
  if (!Object.hasOwn(defaults, key)) return { ...state };
  return { ...state, [key]: defaults[key], pageSize: 24 };
}

export function filterWeaponsByType(items, selected, typeForItem) {
  const rows = Array.isArray(items) ? items : [];
  if (!selected || selected === 'all') return rows;
  if (typeof typeForItem !== 'function') return [];
  return rows.filter(item => typeForItem(item) === selected);
}
