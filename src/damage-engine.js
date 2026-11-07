// Pure Genshin damage math. Talent/set/reaction coefficients are always inputs: missing game data stays TODO_DATA.
export const DAMAGE_FORMULA_VERSION = 'genshin-damage-v1';
export const RESISTANCE_MULTIPLIER = res => res < 0 ? 1 - res / 2 : res < .75 ? 1 - res : 1 / (4 * res + 1);
export const DEFENSE_MULTIPLIER = (attackerLevel, enemyLevel, reduction = 0, ignore = 0) => {
  const a = Number(attackerLevel), e = Number(enemyLevel);
  if (!Number.isFinite(a) || !Number.isFinite(e)) return null;
  // KQM TCL documents the 90% cap on DEF reduction; DEF ignore is a separate term.
  const r = Math.max(0, Math.min(.9, Number(reduction) || 0)), i = Math.max(0, Math.min(1, Number(ignore) || 0));
  return (a + 100) / ((a + 100) + (e + 100) * (1 - r) * (1 - i));
};
export const amplifyingReactionMultiplier = (em, bonus = 0) => 1 + 2.78 * Math.max(0, em) / (Math.max(0, em) + 1400) + bonus;
export const transformativeReactionMultiplier = (em, bonus = 0) => 1 + 16 * Math.max(0, em) / (Math.max(0, em) + 2000) + bonus;

export function finalStats(base, bonuses = {}) {
  const out = {};
  for (const stat of ['hp', 'atk', 'def']) out[stat] = (Number(base?.[stat]) || 0) * (1 + (Number(bonuses[`${stat}Pct`]) || 0) / 100) + (Number(bonuses[`${stat}Flat`]) || 0);
  for (const stat of ['em', 'critRate', 'critDmg', 'dmgBonus', 'er', 'healing', 'defReduction', 'defIgnore']) out[stat] = (Number(base?.[stat]) || 0) + (Number(bonuses[stat]) || 0);
  return out;
}

/**
 * Evaluate one hit. `talentMultiplier` is a decimal multiplier (e.g. 2.15 for 215%).
 * `reaction.coefficient` and `.levelMultiplier` must come from a versioned open game-data source.
 */
export function calculateHit(input = {}) {
  const { stats = {}, baseStat = 'atk', talentMultiplier, flatDamage = 0, attackerLevel, enemyLevel = 100,
    enemyResistance = .1, enemyDefenseReduction = 0, defenseIgnore = 0, damageBonus = 0, damageReduction = 0,
    critMode = 'average', reaction = null } = input;
  const warnings = [];
  if (reaction && !['amplifying', 'additive', 'transformative'].includes(reaction.kind)) return { ok: false, error: 'TODO_DATA: type de réaction inconnu.', warnings: ['TODO_DATA'] };
  if (!Number.isFinite(Number(talentMultiplier)) || Number(talentMultiplier) <= 0) return { ok: false, error: 'TODO_DATA: multiplicateur du talent absent ou invalide.', warnings: ['TODO_DATA'] };
  if (!['atk', 'def', 'hp'].includes(baseStat) || !Number.isFinite(Number(stats[baseStat])) || Number(stats[baseStat]) <= 0) {
    return { ok: false, error: `TODO_DATA: stat de référence ${baseStat || 'du personnage'} absente ou invalide.`, warnings: ['TODO_DATA'] };
  }
  if (!Number.isFinite(Number(attackerLevel)) || Number(attackerLevel) < 1 || Number(attackerLevel) > 100) {
    return { ok: false, error: 'Niveau du personnage requis (1–100).', warnings };
  }
  const base = (Number(stats[baseStat]) || 0) * Number(talentMultiplier) + (Number(flatDamage) || 0);
  const def = DEFENSE_MULTIPLIER(attackerLevel, enemyLevel, enemyDefenseReduction, defenseIgnore);
  if (def == null) return { ok: false, error: 'Niveau du personnage absent.', warnings };
  const res = RESISTANCE_MULTIPLIER(Math.max(-1, Math.min(10, Number(enemyResistance) - (Number(input.resistanceReduction) || 0))));
  const dr = Math.max(0, 1 - (Number(damageReduction) || 0));
  const critRate = Math.max(0, Number(stats.critRate) || 0) / 100, critDmg = Math.max(0, Number(stats.critDmg) || 0) / 100;
  const crit = critMode === 'nonCrit' ? 1 : critMode === 'crit' ? 1 + critDmg : 1 + Math.min(critRate, 1) * critDmg;
  let reactionMultiplier = 1, additive = 0, transformative = 0, reactionName = '';
  if (reaction?.kind === 'amplifying') { const baseMultiplier=Number(reaction.baseMultiplier);if(!Number.isFinite(baseMultiplier)){warnings.push('TODO_DATA: multiplicateur de Vapeur/Fonte selon le sens de réaction.');}else reactionMultiplier = baseMultiplier * amplifyingReactionMultiplier(stats.em || 0, (Number(reaction.bonus) || 0) + (Number(reaction.resonanceBonus) || 0)); reactionName = reaction.name || 'Amplification'; }
  else if (reaction?.kind === 'additive') {
    if (!Number.isFinite(Number(reaction.coefficient)) || !Number.isFinite(Number(reaction.levelMultiplier))) warnings.push('TODO_DATA: coefficient/niveau d’Intensification ou Propagation.');
    else { additive = Number(reaction.coefficient) * Number(reaction.levelMultiplier) * (1 + 5 * Math.max(0, Number(stats.em)||0) / (1200 + Math.max(0, Number(stats.em)||0)) + (Number(reaction.bonus)||0)); reactionName = reaction.name || 'Réaction additive'; }
  } else if (reaction?.kind === 'transformative') {
    if (!Number.isFinite(Number(reaction.coefficient)) || !Number.isFinite(Number(reaction.levelMultiplier))) warnings.push('TODO_DATA: coefficient/niveau de réaction transformative.');
    else { const reactionRes=RESISTANCE_MULTIPLIER(Math.max(-1,Math.min(10,Number(reaction.enemyResistance??enemyResistance)-(Number(reaction.resistanceReduction)||0))));transformative=Number(reaction.coefficient)*Number(reaction.levelMultiplier)*transformativeReactionMultiplier(stats.em||0,(Number(reaction.bonus)||0)+(Number(reaction.resonanceBonus)||0))*reactionRes;reactionName = reaction.name || 'Réaction transformative'; }
  }
  if (warnings.some(warning=>warning.startsWith('TODO_DATA:'))) return { ok:false,error:warnings.join(' '),warnings };
  const bonus = (Number(stats.dmgBonus) || 0) / 100 + (Number(damageBonus) || 0) / 100;
  const direct = ((base + additive) * (1 + bonus) * crit * def * res * dr) * reactionMultiplier;
  const total = direct + transformative;
  return { ok: true, total, direct, base, additive, transformative, bonusMultiplier: 1 + bonus, critMultiplier: crit, defenseMultiplier: def, resistanceMultiplier: res, damageReductionMultiplier: dr, reactionMultiplier, reactionName, warnings, terms: { formula: 'DGT direct = (base + additif) × bonus DGT × CRIT × DEF × RÉS × amplification; réaction transformative = coefficient × niveau × EM × RÉS', baseStat, talentMultiplier: Number(talentMultiplier), enemyLevel: Number(enemyLevel) } };
}
