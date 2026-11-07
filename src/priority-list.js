const STORAGE_KEY = 'astralis:gi:optimizer-priority:v1';
const read = () => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
const write = value => { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return value; };
export const getCharacterPriority = () => read();
export function setCharacterPriority(ids) { return write([...new Set((ids || []).map(String).filter(Boolean))]); }
export function movePriority(id, delta) { const rows = read(), index = rows.indexOf(String(id)); if (index < 0) return rows; const next = Math.max(0, Math.min(rows.length - 1, index + delta)); rows.splice(next, 0, rows.splice(index, 1)[0]); return write(rows); }
export function priorityArtifactPool(inventory, characterId, options = {}) {
  if (!options.enabled) return inventory;
  const list = read(), rank = list.indexOf(String(characterId));
  if (rank < 0) return inventory;
  const protectedOwners = new Set(list.slice(0, rank).map(String));
  const names = new Set((options.characters || []).filter(c => protectedOwners.has(String(c._id))).map(c => String(c._name).toLowerCase()));
  return inventory.filter(piece => !piece.location || (!protectedOwners.has(String(piece.location)) && !names.has(String(piece.location).toLowerCase())) || options.unlockedLocations?.includes(piece.location));
}
export function artifactImpact(targetBuildId, inventory) {
  const build = JSON.parse(localStorage.getItem('astralis:gi:builds') || '[]').find(row => row.id === targetBuildId);
  if (!build) return { build: null, pieces: [] };
  const used = new Set((build.pieces || []).map(piece => piece.ownedArtifactId).filter(Boolean));
  return { build, pieces: inventory.filter(piece => used.has(piece.id)) };
}
