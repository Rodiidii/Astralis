export const ARTIFACT_SLOTS = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
export const ARTIFACT_MAIN_MAX = Object.freeze({ hpFlat: 4780, atkFlat: 311, hpPct: 46.6, atkPct: 46.6, defPct: 58.3, em: 187, er: 51.8, critRate: 31.1, critDmg: 62.2, pyroDmg: 46.6, hydroDmg: 46.6, cryoDmg: 46.6, electroDmg: 46.6, anemoDmg: 46.6, geoDmg: 46.6, dendroDmg: 46.6, physicalDmg: 58.3, healing: 35.9 });
export const ARTIFACT_SUBSTAT_MAX = Object.freeze({ hpFlat: 298.75, atkFlat: 19.45, defFlat: 23.15, hpPct: 5.83, atkPct: 5.83, defPct: 7.29, em: 23.31, er: 6.48, critRate: 3.89, critDmg: 7.77 });
const SLOT_ALIASES = { flower: 'flower', plume: 'plume', feather: 'plume', sands: 'sands', goblet: 'goblet', circlet: 'circlet' };
const GOOD_STATS = { FIGHT_PROP_HP: 'hpFlat', FIGHT_PROP_HP_PERCENT: 'hpPct', FIGHT_PROP_ATTACK: 'atkFlat', FIGHT_PROP_ATTACK_PERCENT: 'atkPct', FIGHT_PROP_DEFENSE: 'defFlat', FIGHT_PROP_DEFENSE_PERCENT: 'defPct', FIGHT_PROP_ELEMENT_MASTERY: 'em', FIGHT_PROP_CHARGE_EFFICIENCY: 'er', FIGHT_PROP_CRITICAL: 'critRate', FIGHT_PROP_CRITICAL_HURT: 'critDmg', FIGHT_PROP_FIRE_ADD_HURT: 'pyroDmg', FIGHT_PROP_WATER_ADD_HURT: 'hydroDmg', FIGHT_PROP_ICE_ADD_HURT: 'cryoDmg', FIGHT_PROP_ELEC_ADD_HURT: 'electroDmg', FIGHT_PROP_WIND_ADD_HURT: 'anemoDmg', FIGHT_PROP_ROCK_ADD_HURT: 'geoDmg', FIGHT_PROP_GRASS_ADD_HURT: 'dendroDmg', FIGHT_PROP_PHYSICAL_ADD_HURT: 'physicalDmg', FIGHT_PROP_HEAL_ADD: 'healing' };
const normalizeStat = key => GOOD_STATS[key] || ({ hp: 'hpFlat', atk: 'atkFlat', def: 'defFlat', critRate_: 'critRate' }[key]) || key;
const MAIN_STATS_BY_SLOT = Object.freeze({
  flower: ['hpFlat'], plume: ['atkFlat'],
  sands: ['hpPct', 'atkPct', 'defPct', 'em', 'er'],
  goblet: ['hpPct', 'atkPct', 'defPct', 'em', 'pyroDmg', 'hydroDmg', 'cryoDmg', 'electroDmg', 'anemoDmg', 'geoDmg', 'dendroDmg', 'physicalDmg'],
  circlet: ['hpPct', 'atkPct', 'defPct', 'em', 'critRate', 'critDmg', 'healing']
});

export function normalizeGoodArtifact(row, index = 0) {
  const slot = SLOT_ALIASES[String(row?.slotKey || row?.slot || '').toLowerCase()];
  const mainType = normalizeStat(row?.mainStatKey || row?.mainType || row?.mainStat?.key || '');
  const subs = Array.isArray(row?.substats) ? row.substats : [];
  return { id: String(row?.id || `import-${index}`), setKey: String(row?.setKey || row?.set || ''), rarity: Number(row?.rarity) || 0,
    level: Number(row?.level) || 0, slot, slotIndex: ARTIFACT_SLOTS.indexOf(slot), mainType, mainValue: Number(row?.mainStatValue ?? row?.mainStat?.value) || 0,
    substats: subs.map(s => ({ type: normalizeStat(s.key || s.type), value: Number(s.value) || 0 })), location: String(row?.location || ''), locked: !!row?.lock };
}

export function validateArtifact(piece) {
  const issues = [];
  if (!ARTIFACT_SLOTS.includes(piece?.slot)) issues.push('Emplacement inconnu.');
  if (!piece?.setKey) issues.push('Set non reconnu.');
  if (![4, 5].includes(Number(piece?.rarity))) issues.push('Rareté non valide pour une relique optimisée.');
  if (!Number.isFinite(Number(piece?.level)) || piece.level < 0 || piece.level > 20) issues.push('Niveau hors limites (0–20).');
  if (!piece?.mainType || !Number.isFinite(Number(piece?.mainValue)) || piece.mainValue <= 0) issues.push('Stat principale manquante ou invalide.');
  if (piece?.slot && MAIN_STATS_BY_SLOT[piece.slot] && !MAIN_STATS_BY_SLOT[piece.slot].includes(piece.mainType)) issues.push('Stat principale impossible pour cet emplacement.');
  const subs = piece?.substats || [];
  if (subs.length < 3 || subs.length > 4) issues.push('Une pièce doit avoir 3 ou 4 sous-stats.');
  const types = [piece?.mainType, ...subs.map(s => s.type)];
  if (new Set(types).size !== types.length) issues.push('Une stat apparaît plusieurs fois, ou correspond à la stat principale.');
  for (const sub of subs) {
    const max = ARTIFACT_SUBSTAT_MAX[sub.type];
    if (!max || !Number.isFinite(Number(sub.value)) || sub.value < 0 || sub.value > max * 9.01) issues.push(`Valeur de sous-stat invalide : ${sub.type || 'inconnue'}.`);
  }
  return { valid: issues.length === 0, issues };
}

export function statVector(piece, relevant = null) {
  const vector = Object.create(null);
  const add = (k, v) => { if (!relevant || relevant.has(k)) vector[k] = (vector[k] || 0) + Number(v || 0); };
  add(piece.mainType, piece.mainValue);
  for (const s of piece.substats || []) add(s.type, s.value);
  return vector;
}

/** Safe elimination: same slot, set and main stat only; never discard a piece that could complete a different set. */
export function pruneDominatedArtifacts(pieces, relevantStats = null) {
  const groups = new Map();
  for (const p of pieces) {
    const key = [p.slotIndex, p.setKey, p.mainType].join('|');
    (groups.get(key) || groups.set(key, []).get(key)).push(p);
  }
  const kept = [];
  for (const group of groups.values()) {
    const seen = new Set(), unique = [];
    for (const p of group) {
      const v = statVector(p, relevantStats), signature = Object.keys(v).sort().map(k => `${k}:${v[k]}`).join(';');
      if (seen.has(signature)) continue;
      seen.add(signature);
      unique.push(p);
    }
    for (const p of unique) {
      const v = statVector(p, relevantStats);
      const dominated = unique.some(q => q !== p && Object.entries(v).every(([k, n]) => (statVector(q, relevantStats)[k] || 0) >= n) && Object.entries(statVector(q, relevantStats)).some(([k, n]) => n > (v[k] || 0)));
      if (!dominated) kept.push(p);
    }
  }
  return kept;
}
