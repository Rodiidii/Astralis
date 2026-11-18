export function sortFavoriteRecords(rows = [], mode = 'saved') {
  return (Array.isArray(rows) ? rows : []).map((item, index) => ({ item, index })).sort((a, b) => {
    const left = a.item || {}, right = b.item || {};
    if (mode === 'name') return String(left._name || '').localeCompare(String(right._name || ''), 'fr', { sensitivity: 'base' }) || a.index - b.index;
    if (mode === 'rarity') return (Number(right.rarity) || 0) - (Number(left.rarity) || 0) || String(left._name || '').localeCompare(String(right._name || ''), 'fr') || a.index - b.index;
    if (mode === 'element') return String(left.elementText || left.element || '').localeCompare(String(right.elementText || right.element || ''), 'fr', { sensitivity: 'base' }) || String(left._name || '').localeCompare(String(right._name || ''), 'fr') || a.index - b.index;
    return a.index - b.index;
  }).map(entry => entry.item);
}
