const STAT_ROWS = [
  ['hp', 'PV', 'hpFlat', 'hp', 0],
  ['atk', 'ATQ', 'atkFlat', 'atk', 0],
  ['def', 'DÉF', 'defFlat', 'def', 0],
  ['em', 'Maîtrise élémentaire', 'em', 'em', 0],
  ['er', 'Recharge d’énergie', 'er', 'er', 100],
  ['critRate', 'Taux CRIT', 'critRate', 'critRate', 5],
  ['critDmg', 'DGT CRIT', 'critDmg', 'critDmg', 50],
  ['dmgBonus', 'Bonus de DGT', 'dmgBonus', 'dmgBonus', 0],
];

const firstFinite = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (value !== null && value !== '' && Number.isFinite(number)) return number;
  }
  return null;
};

/** Split a displayed build total into an observed base and its combined additions. */
export function buildStatBreakdown(totals) {
  if (!totals || typeof totals !== 'object') return [];
  const base = totals.base || {};
  return STAT_ROWS.flatMap(([key, label, token, baseKey, fallback]) => {
    const total = firstFinite(totals[key]);
    const baseValue = firstFinite(
      key === 'atk' ? totals.baseAtk : null,
      base[baseKey],
      base[key],
      key === 'atk' ? base.attack : null,
      key === 'def' ? base.defense : null,
      key === 'em' ? base.elementalMastery : null,
      fallback,
    );
    if (total === null || baseValue === null) return [];
    return [{ key, label, token, base: baseValue, added: total - baseValue, total }];
  });
}
