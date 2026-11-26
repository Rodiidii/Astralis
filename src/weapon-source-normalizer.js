/**
 * Normalize the live Lunaris weapon detail shape for the catalog, lab and journal.
 * The provider stores each refinement under passive.refinements["1".."5"],
 * while Astralis' lab consumes r1..r5.
 */
export function normalizeWeaponSourceDetails(weapon = {}, raw = {}, sourceVersion = '') {
  const livePassive = raw?.passive && typeof raw.passive === 'object' ? raw.passive : {};
  const passive = { ...(weapon.passive || {}), ...livePassive };
  const sourceRefinements = livePassive.refinements || raw?.refinements || {};
  const refinements = { ...(weapon.refinements || {}), ...sourceRefinements };
  const normalized = {
    ...weapon,
    ...raw,
    passive,
    passiveName: livePassive.name || raw?.passiveName || weapon.passiveName || weapon.effectName || '',
    effectName: livePassive.name || raw?.effectName || weapon.effectName || weapon.passiveName || '',
    refinements,
    sourceVersion: sourceVersion || raw?.sourceVersion || raw?.version || weapon.sourceVersion || weapon.version || '',
    source: 'Lunaris',
  };

  for (let rank = 1; rank <= 5; rank += 1) {
    const key = String(rank);
    const legacy = weapon[`r${rank}`] || raw?.[`r${rank}`] || {};
    const live = sourceRefinements[key] || sourceRefinements[`r${rank}`] || {};
    if (!Object.keys(legacy).length && !Object.keys(live).length) continue;
    normalized[`r${rank}`] = {
      ...legacy,
      ...live,
      description: live.description || live.desc || legacy.description || legacy.desc || '',
      // Keep the curated, effect-specific values used by the verified lab
      // mappings. The source's params also include cooldowns and durations.
      values: Array.isArray(legacy.values) ? legacy.values : Array.isArray(raw?.[`r${rank}`]?.values) ? raw[`r${rank}`].values : [],
      sourceParams: Array.isArray(live.params) ? live.params : Array.isArray(live.sourceParams) ? live.sourceParams : [],
    };
  }

  return normalized;
}
