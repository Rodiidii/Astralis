const MAX_EXPANDED_TEAMS = 120;

export function normalizeExpandedTeamIds(raw, validIds) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { parsed = []; }
  }
  if (!Array.isArray(parsed)) return new Set();
  const valid = new Set((Array.isArray(validIds) ? validIds : []).map(String));
  return new Set(parsed.filter(id => typeof id === 'string' && id.length <= 128 && valid.has(id)).slice(-MAX_EXPANDED_TEAMS));
}

export function updateExpandedTeamIds(current, teamId, expanded, validIds) {
  const valid = new Set((Array.isArray(validIds) ? validIds : []).map(String));
  const id = String(teamId ?? '');
  const next = new Set([...normalizeExpandedTeamIds([...(current || [])], [...valid])].filter(value => valid.has(value)));
  if (!valid.has(id)) return next;
  if (expanded) next.add(id); else next.delete(id);
  return new Set([...next].slice(-MAX_EXPANDED_TEAMS));
}
