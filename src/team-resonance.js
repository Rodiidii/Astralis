const ELEMENTS = [
  ['pyro', 'Pyro', ['pyro', 'feu']],
  ['hydro', 'Hydro', ['hydro', 'eau']],
  ['anemo', 'Anémo', ['anemo', 'anemo', 'vent']],
  ['electro', 'Électro', ['electro', 'électro', 'foudre']],
  ['dendro', 'Dendro', ['dendro']],
  ['cryo', 'Cryo', ['cryo', 'glace']],
  ['geo', 'Géo', ['geo']],
];

const RESONANCE_EFFECTS = {
  pyro: 'ATQ +25 %.',
  hydro: 'PV max. +25 %.',
  anemo: 'Consommation d’endurance −15 %, vitesse de déplacement +10 %, temps de recharge des compétences −5 %.',
  electro: 'Les réactions Électrocution, Surcharge et Supraconduction génèrent une particule élémentaire (une fois toutes les 6 s).',
  dendro: 'Maîtrise élémentaire +50. Après Brûlure, Stimulation ou Bourgeonnement : +30 pendant 6 s. Après Aggravation, Propagation, Fleurissement ou Exubérance : +20 pendant 6 s.',
  cryo: 'Taux CRIT +15 % contre les ennemis affectés par Cryo ou Gelés.',
  geo: 'Protection de bouclier +15 %. Sous bouclier, dégâts infligés +15 %; toucher un ennemi réduit sa RES Géo de 20 % pendant 15 s.',
  canopy: 'Toutes les RES élémentaires et la RES physique +15 %.'
};

export function teamResonanceEffect(key) {
  return RESONANCE_EFFECTS[String(key || '').toLowerCase()] || '';
}

export function teamElementResonances(elements = []) {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const groups = new Map();
  for (const value of Array.isArray(elements) ? elements : []) {
    const text = normalize(value);
    const element = ELEMENTS.find(([, , aliases]) => aliases.some(alias => text.includes(normalize(alias))));
    if (!element) continue;
    const [key, label] = element;
    groups.set(key, (groups.get(key) || 0) + 1);
  }
  const resonances = ELEMENTS.filter(([key]) => groups.get(key) >= 2)
    .map(([key, label]) => ({ key, label, count: groups.get(key), kind: 'element' }));
  const known = elements.map(normalize).filter(Boolean);
  const uniqueKnown = new Set(known.map(value => ELEMENTS.find(([, , aliases]) => aliases.some(alias => value.includes(normalize(alias))))?.[0]).filter(Boolean));
  const filledSlots = Array.isArray(elements) ? elements.filter(Boolean).length : 0;
  if (filledSlots === 4 && uniqueKnown.size === 4) {
    resonances.push({ key: 'canopy', label: 'Voile protecteur', count: 4, kind: 'all-elements' });
  }
  return resonances;
}
