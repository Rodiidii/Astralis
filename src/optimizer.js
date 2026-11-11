import {complexEffects} from './complex-effects.js';
import { ARTIFACT_SLOTS, pruneDominatedArtifacts, statVector } from './artifact-model.js?v=20261110-builds-3';
import {typedAttackBonus} from './lab-config.js?v=20261110-lab-controls-4';
import { calculateAction, finalStats } from './damage-engine.js';

const add = (target, source, factor = 1) => {
  for (const [key, value] of Object.entries(source || {})) target[key] = (target[key] || 0) + Number(value || 0) * factor;
};
const countArtifactSets = rows => {
  const counts = new Map();
  for (const row of rows.filter(Boolean)) counts.set(row.setKey, (counts.get(row.setKey) || 0) + 1);
  return counts;
};
export function hasValidSetConfiguration(counts, mode = 'standard') {
  const values = [...counts.values()].sort((a, b) => b - a);
  const four = values[0] >= 4, two = values.filter(n => n >= 2).length >= 2;
  const rainbow = values.length === 5 && values.every(n => n === 1);
  return mode === 'any' || (mode === 'standard' && (four || two)) || (mode === '4pc' && four) || (mode === '2+2' && two) || (mode === 'rainbow' && rainbow);
}
function addSetBonuses(bonuses, counts, effects) {
  for (const [key, count] of counts) {
    const effect = effects?.[key];
    if (count >= 2) add(bonuses, effect?.two);
    if (count >= 4) add(bonuses, effect?.four);
  }
}
function mergedBonuses(base, artifactStats, counts, effects) {
  const bonuses = { ...(base || {}) };
  add(bonuses, artifactStats);
  addSetBonuses(bonuses, counts, effects);
  return bonuses;
}
export function evaluateDamageStats(input, artifactStats, counts = new Map()) {
  const bonuses = mergedBonuses(input.bonuses, artifactStats, counts, input.setEffects);
  const evaluate=(hit,localBonuses)=>{
    const context={...hit?.complexContext,actionKind:hit?.actionKind,elementKey:hit?.elementKey};
    const initial=complexEffects(hit?.complexEffects,context),combined={...localBonuses};add(combined,initial.bonuses);
    const stats=finalStats(input.baseStats||{},combined),complex=complexEffects(hit?.complexEffects,{...context,stats});
    localBonuses=combined;
    const result=calculateAction({...hit,stats,talentScale:complex.talentScale,additivePools:complex.pools,
      flatDamage:(Number(hit?.flatDamage)||0)+(Number(localBonuses.flatDamage)||0)+complex.flatDamage,
      damageBonus:(Number(hit?.damageBonus)||0)+typedAttackBonus(localBonuses,hit?.actionKind,stats),
      resistanceReduction:(Number(hit?.resistanceReduction)||0)+(Number(localBonuses.resReduction)||0)/100,
      enemyDefenseReduction:(Number(hit?.enemyDefenseReduction)||0)+(Number(localBonuses.defReduction)||0)/100,
      defenseIgnore:(Number(hit?.defenseIgnore)||0)+(Number(localBonuses.defIgnore)||0)/100,
      attackerLevel:hit?.attackerLevel??input.level,enemyLevel:hit?.enemyLevel??100});
    return {...result,stats};
  };
  if(input.weightedHits?.length){
    let total=0;
    for(const row of input.weightedHits){
      const local={...bonuses};add(local,row.bonuses);
      const result=evaluate(row.hit,local);
      if(!result.ok)return result;
      total+=result.total*row.weight;
    }
    return {ok:true,total,stats:finalStats(input.baseStats||{},bonuses),bonuses};
  }
  return {...evaluate(input.hit,bonuses),bonuses};
}
function scoreBuild(input, artifactStats, counts, rows, objective) {
  if (objective === 'damage' || objective === 'dps' || !objective) {
    const damage = evaluateDamageStats(input, artifactStats, counts);
    if (!damage.ok) return null;
    const score = objective === 'dps' ? damage.total / Number(input.rotationDuration) : damage.total;
    return { score, result: damage, rows: [...rows] };
  }
  const final = finalStats(input.baseStats || {}, mergedBonuses(input.bonuses, artifactStats, counts, input.setEffects));
  if (objective === 'hp' || objective === 'atk' || objective === 'def') return { score: final[objective], result: { ok: true, total: final[objective], stats: final }, rows: [...rows] };
  if (objective === 'ehp') {
    const resistance = Number(input.incomingResistance), reduction = Number(input.incomingDamageReduction);
    if (!Number.isFinite(resistance) || !Number.isFinite(reduction)) return null;
    const multiplier = Math.max(.01, (1 - Math.max(-1, Math.min(1, resistance))) * (1 - Math.max(0, Math.min(.9, reduction))));
    const total = final.hp / multiplier;
    return { score: total, result: { ok: true, total, stats: final, ehpMultiplier: multiplier }, rows: [...rows] };
  }
  if (objective === 'healing') {
    const base = Number(input.healingBase), ratio = Number(input.healingRatio), flat = Number(input.healingFlat || 0);
    if (!Number.isFinite(base) || !Number.isFinite(ratio)) return null;
    const total = (base * ratio + flat) * (1 + final.healing / 100);
    return { score: total, result: { ok: true, total, stats: final }, rows: [...rows] };
  }
  if (objective === 'custom') {
    const score = Object.entries(input.weights || {}).reduce((sum, [key, weight]) => sum + (Number(final[key] ?? final[`${key}Pct`]) || 0) * Number(weight || 0), 0);
    return { score, result: { ok: true, total: score, stats: final }, rows: [...rows] };
  }
  return null;
}
const constraintsPass = (final, limits) => Object.entries(limits || {}).every(([key, limit]) => {
  if (limit == null || limit === '') return true;
  const value = Number(final[key] || 0);
  if (typeof limit === 'object') {
    const min = limit.min == null || limit.min === '' ? -Infinity : Number(limit.min);
    const max = limit.max == null || limit.max === '' ? Infinity : Number(limit.max);
    return value >= min && value <= max;
  }
  return Number.isFinite(Number(limit)) && value >= Number(limit);
});
const positiveSetCeiling = effects => {
  const out = {};
  for (const effect of Object.values(effects || {})) for (const tier of ['two', 'four']) for (const [key, value] of Object.entries(effect?.[tier] || {})) if (Number(value) > 0) out[key] = (out[key] || 0) + Number(value);
  return out;
};
const sameIds = rows => new Set(rows.map(row => String(row.id))).size === rows.length;

/** Applique une seule fois les mêmes filtres à l'estimation et à l'optimiseur. */
export function prepareArtifactPools(inventory = [], filters = {}) {
  const excluded = new Set([...(filters.excludedIds || []), ...(filters.usedByHigherPriority || [])].map(String));
  const lockedIds = new Set((filters.lockedIds || []).map(String));
  const allowed = new Set((filters.allowedSets || []).map(String));
  const required = new Set((filters.requiredSets || []).map(String));
  const excludedSets = new Set((filters.excludedSets || []).map(String));
  const minLevel = Number(filters.minLevel ?? 0), maxLevel = Number(filters.maxLevel ?? 20);
  const source = inventory.filter(row => {
    const id = String(row.id);
    if (excluded.has(id) || row.level < minLevel || row.level > maxLevel) return false;
    if (row.locked && !filters.includeLocked && !lockedIds.has(id)) return false;
    if (excludedSets.has(String(row.setKey))) return false;
    if (allowed.size && !allowed.has(String(row.setKey)) && !required.has(String(row.setKey))) return false;
    const mains = filters.mainStats?.[row.slot];
    return !mains?.length || mains.includes(row.mainType);
  });
  let pools = ARTIFACT_SLOTS.map(slot => source.filter(row => row.slot === slot));
  const conflicts = [];
  for (let i = 0; i < ARTIFACT_SLOTS.length; i++) {
    const pinned = pools[i].filter(row => lockedIds.has(String(row.id)));
    if (pinned.length > 1) conflicts.push(`Plusieurs pièces sont verrouillées pour ${ARTIFACT_SLOTS[i]}.`);
    else if (pinned.length === 1) pools[i] = pinned;
  }
  if (filters.partition?.slot) {
    const index = ARTIFACT_SLOTS.indexOf(filters.partition.slot), part = Number(filters.partition.index) || 0, count = Math.max(1, Number(filters.partition.count) || 1);
    if (index >= 0 && count > 1) pools[index] = pools[index].filter((_, i) => i % count === part);
  }
  if (filters.allowPartial) pools = pools.map(pool => [...pool, null]);
  const counts = Object.fromEntries(ARTIFACT_SLOTS.map((slot, i) => [slot, pools[i].filter(Boolean).length]));
  const combinations = pools.reduce((n, pool) => n * pool.length, 1);
  return { source, pools, counts, combinations, conflicts };
}

/** Recherche exacte top-N, avec maxima suffixes immuables et borne optimiste pour dégâts/DPS. */
export async function optimizeArtifacts(options = {}) {
  const { inventory = [], input = {}, topN = 5, currentIds = [], cancelled = () => false, onProgress = () => {}, filters = {}, objective = 'damage' } = options;
  if(objective==='dps'&&(!Number.isFinite(Number(input.rotationDuration))||Number(input.rotationDuration)<=0))return {results:[],combinations:0,rawCombinations:0,visited:0,pruned:0,elapsedMs:0,exact:true,error:'Indique une durée de rotation strictement positive pour optimiser le DPS.'};
  const started = globalThis.performance?.now?.() ?? Date.now();
  const top = Math.max(1, Math.min(50, Number(topN) || 5));
  const prepared = prepareArtifactPools(inventory, filters), { source, conflicts } = prepared;
  if (conflicts.length) return { results: [], combinations: 0, rawCombinations: 0, visited: 0, pruned: 0, elapsedMs: 0, exact: true, error: conflicts.join(' '), diagnostic: { filtered: source.length, source: source.length, slotCounts: prepared.counts } };
  const filtered = source;
  let pools = prepared.pools.map(pool => pool.map(piece => piece === null ? null : piece));
  const rawCombinations = pools.reduce((total, pool) => total * pool.length, 1);
  const allowPartial = !!filters.allowPartial;
  const combinations = pools.reduce((total, pool) => total * pool.length, 1);
  const empty = pools.findIndex(pool => !pool.length);
  if (empty >= 0) return { results: [], combinations: 0, rawCombinations, visited: 0, pruned: 0, elapsedMs: 0, exact: true, error: `Aucune pièce disponible : ${ARTIFACT_SLOTS[empty]}.`, diagnostic: { filtered: filtered.length, source: source.length, slotCounts: Object.fromEntries(ARTIFACT_SLOTS.map((slot, i) => [slot, pools[i].length])) } };

  const complex=!!Object.values(input.hit?.complexEffects||{}).some(effect=>effect?.enabled),weighted=!!input.weightedHits?.length;
  const relevant=complex||weighted?null:input.relevantStats?new Set(input.relevantStats):null;
  const ordered = pools.map((pool, i) => ({ slot: ARTIFACT_SLOTS[i], pool: pool.map(piece => ({ piece, vector: piece ? statVector(piece,relevant) : {} })) })).sort((a, b) => a.pool.length - b.pool.length);
  const chosen = Array(ARTIFACT_SLOTS.length).fill(null), running = {}, setCounts = new Map(), best = [], bestKeys = new Set();
  const setCeiling = positiveSetCeiling(input.setEffects), suffix = Array.from({ length: ordered.length + 1 }, () => ({}));
  for (let i = ordered.length - 1; i >= 0; i--) {
    const max = {};
    for (const item of ordered[i].pool) for (const [key, value] of Object.entries(item.vector)) max[key] = Math.max(max[key] || 0, Number(value) || 0);
    suffix[i] = { ...suffix[i + 1] };
    add(suffix[i], max);
  }
  const bounded = !complex&&!weighted&&(objective === 'damage' || objective === 'dps');
  let visited = 0, nodes = 0, pruned = 0, stopped = false, lastTick = started;
  const requiredPossible = idx => (filters.requiredSets || []).every(key => (setCounts.get(key) || 0) + ordered.slice(idx).filter(({ pool }) => pool.some(item => item.piece?.setKey === key)).length >= 2);
  const consider = () => {
    const rows = chosen.filter(Boolean);
    if (rows.length !== ARTIFACT_SLOTS.length && !allowPartial) return;
    if (!sameIds(rows) || !hasValidSetConfiguration(setCounts, filters.configuration || 'standard')) return;
    if ((filters.requiredSets || []).some(key => (setCounts.get(key) || 0) < 2)) return;
    const final = finalStats(input.baseStats || {}, mergedBonuses(input.bonuses, running, setCounts, input.setEffects));
    if (!constraintsPass(final, filters.minimums)) return;
    const candidate = scoreBuild(input, running, setCounts, chosen, objective);
    if (!candidate || !Number.isFinite(candidate.score)) return;
    const signature = rows.map(row => String(row.id)).sort().join('|');
    if (bestKeys.has(signature)) return;
    bestKeys.add(signature);
    best.push(candidate);
    best.sort((a, b) => b.score - a.score);
    if (best.length > top) best.length = top;
  };
  const cannotBeat = idx => {
    if (!bounded || best.length < top) return false;
    const optimistic = { ...running };
    add(optimistic, suffix[idx]);
    add(optimistic, setCeiling);
    const upper = scoreBuild(input, optimistic, new Map(), chosen, objective);
    return !!upper && upper.score <= best[top - 1].score;
  };
  const visit = async idx => {
    if (stopped) return;
    if (cancelled()) { stopped = true; return; }
    nodes++;const tick=globalThis.performance?.now?.()??Date.now();
    if(tick-lastTick>75){lastTick=tick;onProgress({visited,nodes,pruned,combinations,rawCombinations,done:false});await new Promise(resolve=>setTimeout(resolve,0));if(cancelled()){stopped=true;return;}}
    if (!requiredPossible(idx)) { pruned++; return; }
    if (idx === ordered.length) {
      visited++;
      consider();
      const now = globalThis.performance?.now?.() ?? Date.now();
      if (visited % 1500 === 0 || now - lastTick > 90) { lastTick = now; onProgress({ visited, pruned, combinations, rawCombinations, done: false }); await new Promise(resolve => setTimeout(resolve, 0)); }
      return;
    }
    if (cannotBeat(idx)) { pruned++; return; }
    const { slot, pool } = ordered[idx], originalIndex = ARTIFACT_SLOTS.indexOf(slot);
    for (const { piece, vector } of pool) {
      chosen[originalIndex] = piece;
      if (piece) { add(running, vector); setCounts.set(piece.setKey, (setCounts.get(piece.setKey) || 0) + 1); }
      await visit(idx + 1);
      if (piece) {
        add(running, vector, -1);
        const next = setCounts.get(piece.setKey) - 1;
        if (next) setCounts.set(piece.setKey, next); else setCounts.delete(piece.setKey);
      }
      chosen[originalIndex] = null;
      if (stopped) break;
    }
  };
  // L'équipement existant fournit un seuil uniquement s'il satisfait tous les filtres.
  if (currentIds.length === ARTIFACT_SLOTS.length && new Set(currentIds.map(String)).size === ARTIFACT_SLOTS.length) {
    const rows = currentIds.map(id => filtered.find(row => String(row.id) === String(id)));
    if (rows.every(Boolean) && rows.map(row => row.slot).sort().join('|') === [...ARTIFACT_SLOTS].sort().join('|')) {
      const stats = {}, currentCounts = countArtifactSets(rows);
      for (const row of rows) add(stats, statVector(row));
      const final = finalStats(input.baseStats || {}, mergedBonuses(input.bonuses, stats, currentCounts, input.setEffects));
      if (hasValidSetConfiguration(currentCounts, filters.configuration || 'standard') && !(filters.requiredSets || []).some(key => (currentCounts.get(key) || 0) < 2) && constraintsPass(final, filters.minimums)) {
        const seed = scoreBuild(input, stats, currentCounts, rows, objective);
      if (seed) { best.push(seed); bestKeys.add(rows.map(row => String(row.id)).sort().join('|')); }
      }
    }
  }
  await visit(0);
  const elapsedMs = (globalThis.performance?.now?.() ?? Date.now()) - started;
  onProgress({ visited, pruned, combinations, rawCombinations, done: true });
  return { results: best.map(row => ({ ...row, rows: row.rows.map(piece => piece?.id ?? null) })), visited, pruned, combinations, rawCombinations, elapsedMs, exact: !stopped, stopped, piecesEliminated: Math.max(0, source.length - ordered.reduce((n, item) => n + item.pool.filter(Boolean).length, 0)), diagnostic: { filtered: filtered.length, source: source.length, slotCounts: prepared.counts, search:bounded?'bounded':'exhaustive', boundDisabledReason:complex?'complex-effects':weighted?'weighted-hits':null,nodes }, error: best.length ? '' : diagnoseNoResults(filtered, filters) };
}
function diagnoseNoResults(rows, filters) {
  if (!rows.length) return 'Les filtres retirent toutes les reliques. Assouplis niveau, sets ou exclusions.';
  for (const slot of ARTIFACT_SLOTS) if (!rows.some(row => row.slot === slot)) return `Aucune relique admissible pour ${slot}. Assouplis les filtres de cet emplacement.`;
  const counts = countArtifactSets(rows);
  if ((filters.requiredSets || []).some(key => (counts.get(key) || 0) < 2)) return 'Un set imposé ne possède pas deux pièces admissibles.';
  return 'Aucune combinaison ne respecte la configuration ou les statistiques minimales. Assouplis le filtre signalé.';
}
export async function optimizePriorityList({ characters = [], inventory = [], optionsForCharacter = () => ({}), onProgress = () => {}, cancelled = () => false, refinePasses = 0 } = {}) {
  let remaining = [...inventory];
  const results = [];
  for (let i = 0; i < characters.length; i++) {
    if (cancelled()) break;
    const character = characters[i], options = optionsForCharacter(character) || {}, locked = new Set((options.lockedIds || []).map(String));
    const protectedOwners = characters.slice(0, i).map(row => String(row._id));
    const protectedNames = new Set(characters.slice(0,i).map(row=>String(row._name||'').toLocaleLowerCase('fr')));
    const available = remaining.filter(piece => { const owner = String(piece.location || ''); if (locked.has(String(piece.id))) return true; if (piece.locked) return false; return !owner || (!protectedOwners.includes(owner)&&!protectedNames.has(owner.toLocaleLowerCase('fr'))); });
    const result = await optimizeArtifacts({ ...options, inventory: available, cancelled, onProgress: progress => onProgress({ character: character._name, index: i, ...progress }) });
    results.push({ character, result });
    if (result.results?.[0]) { const used = new Set(result.results[0].rows.map(String)); remaining = remaining.filter(piece => !used.has(String(piece.id))); }
  }
  // L'allocation séquentielle protège strictement les résultats des rangs supérieurs.
  // Une passe d'échange naïve pouvait attribuer la même pièce à deux personnages;
  // l'affinage multi-personnage reste désactivé tant qu'un solveur global n'est pas utilisé.
  return { results, remaining };
}
