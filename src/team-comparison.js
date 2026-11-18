export function normalizeTeamComparisonSelection(ids, teams = [], limit = 3) {
  const available = new Set((Array.isArray(teams) ? teams : []).map(team => String(team?.id ?? '')).filter(Boolean));
  const max = Math.max(2, Math.min(3, Math.floor(Number(limit) || 3)));
  const selected = [...new Set((Array.isArray(ids) ? ids : []).map(id => String(id ?? '').trim()).filter(id => id && available.has(id)))];
  return selected.slice(-max);
}

export function buildTeamComparison(teams = []) {
  const rows = (Array.isArray(teams) ? teams : []).slice(0, 3).filter(team => team && team.id != null).map(team => {
    const members = (Array.isArray(team.members) ? team.members : []).map(slot => String(slot?.character ?? '')).filter(Boolean);
    const rotation = Array.isArray(team.rotation) ? team.rotation.filter(action => action && action.type !== 'comboEnd') : [];
    return { id: String(team.id), name: String(team.name || 'Équipe sans nom'), members, filled: members.length, missing: Math.max(0, 4 - members.length), rotationSteps: rotation.length, favorite: team.favorite === true };
  });
  const shared = rows.length > 1 ? rows.map(row => new Set(row.members)).reduce((common, members) => new Set([...common].filter(id => members.has(id))), new Set(rows[0].members)) : new Set();
  return { teams: rows, sharedCharacterIds: [...shared], canCompare: rows.length >= 2 };
}
