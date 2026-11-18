export const TEAM_ROLE_OPTIONS = [
  ['main-dps', 'DPS principal'],
  ['sub-dps', 'DPS secondaire'],
  ['support', 'Support'],
  ['sustain', 'Soin / protection'],
  ['flex', 'Flex'],
];

const ROLE_LABELS = new Map(TEAM_ROLE_OPTIONS);

export function teamRoleCoverage(members = []) {
  const occupied = (Array.isArray(members) ? members : []).filter(member => String(member?.character ?? '').trim());
  const counts = new Map();
  for (const member of occupied) {
    const role = String(member?.role ?? '').trim();
    if (ROLE_LABELS.has(role)) counts.set(role, (counts.get(role) || 0) + 1);
  }
  const assigned = [...counts.values()].reduce((total, count) => total + count, 0);
  return {
    occupied: occupied.length,
    assigned,
    unassigned: Math.max(0, occupied.length - assigned),
    complete: occupied.length > 0 && assigned === occupied.length,
    roles: TEAM_ROLE_OPTIONS.filter(([key]) => counts.has(key)).map(([key, label]) => ({ key, label, count: counts.get(key) })),
  };
}

export function teamRoleReview(members = []) {
  const state = teamRoleCoverage(members);
  if (!state.occupied) return { tone: 'neutral', message: 'Ajoute des personnages pour analyser les rôles.' };
  if (state.unassigned) return { tone: 'neutral', message: `${state.unassigned} rôle${state.unassigned > 1 ? 's' : ''} à préciser pour un bilan complet.` };
  const count = key => state.roles.find(role => role.key === key)?.count || 0;
  const main = count('main-dps'), sustain = count('sustain'), support = count('support');
  if (!main) return { tone: 'review', message: 'Aucun DPS principal n’est renseigné.' };
  if (main > 1) return { tone: 'review', message: 'Plusieurs DPS principaux : vérifie leur temps de terrain.' };
  if (!sustain) return { tone: 'review', message: 'Aucun soin ou protecteur n’est renseigné.' };
  if (!support && !count('sub-dps')) return { tone: 'review', message: 'Aucun support ni DPS secondaire n’est renseigné.' };
  return { tone: 'ready', message: 'Répartition des rôles complète : DPS, soutien et survie identifiés.' };
}
