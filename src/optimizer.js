import { ARTIFACT_SLOTS, pruneDominatedArtifacts, statVector } from './artifact-model.js';
import { calculateHit, finalStats } from './damage-engine.js';

function addStats(target, source, factor = 1) { for (const [k, v] of Object.entries(source || {})) target[k] = (target[k] || 0) + Number(v || 0) * factor; }
function qualifies(counts) { const values = [...counts.values()].sort((a, b) => b - a); return values[0] >= 4 || (values[0] >= 2 && values[1] >= 2); }
function appliesEffects(stats, counts, setEffects) { for (const [key, count] of counts) { const effect=setEffects[key];if(count>=2)addStats(stats,effect?.two);if(count>=4)addStats(stats,effect?.four); } }

export function evaluateDamageStats(input, artifactStats, counts = new Map()) {
  const bonuses = { ...(input.bonuses || {}) }; addStats(bonuses, artifactStats); appliesEffects(bonuses, counts, input.setEffects || {});
  const stats = finalStats(input.baseStats || {}, bonuses);
  if (input.hit?.elementKey) stats.dmgBonus += Number(bonuses[`${input.hit.elementKey}Dmg`]) || 0;
  const value = calculateHit({ ...input.hit, stats, attackerLevel: input.hit?.attackerLevel ?? input.level, enemyLevel: input.hit?.enemyLevel ?? 100 });
  return { ...value, stats, bonuses };
}

/** Exact top-N search over all retained valid pieces. B&B is used only for the supported monotone one-hit damage evaluator. */
export async function optimizeArtifacts(options) {
  const { inventory = [], input = {}, topN = 5, currentIds = [], cancelled = () => false, onProgress = () => {} } = options || {};
  const relevant = input.relevantStats ? new Set(input.relevantStats) : null;
  const started = performance.now(), pools = ARTIFACT_SLOTS.map((_, slotIndex) => pruneDominatedArtifacts(inventory.filter(x => x.slotIndex === slotIndex && !x.locked), relevant)).sort((a,b)=>a.length-b.length);
  const combos = pools.reduce((n, pool) => n * Math.max(1, pool.length), 1);
  if (pools.some(pool => !pool.length)) return { results: [], combinations: 0, visited: 0, pruned: 0, elapsedMs: 0, error: 'Il manque une pièce dans au moins un emplacement.' };
  const best = [], chosen = Array(5), running = Object.create(null), counts = new Map(), suffixMax = Array.from({ length: 6 }, () => Object.create(null));
  for (let i = 4; i >= 0; i--) {
    const slotMax = Object.create(null);
    for (const row of pools[i]) for (const [key, value] of Object.entries(statVector(row, relevant))) slotMax[key] = Math.max(slotMax[key] || 0, value);
    suffixMax[i] = { ...suffixMax[i + 1] }; addStats(suffixMax[i], slotMax);
  }
  // Optimistic set ceiling: all positive 2pc/4pc terms from every possible set, intentionally over-counted.
  const setCeiling = Object.create(null);
  for (const effect of Object.values(input.setEffects || {})) for (const tier of ['two', 'four']) for (const [key, value] of Object.entries(effect?.[tier] || {})) if (value > 0) setCeiling[key] = (setCeiling[key] || 0) + value;
  let visited = 0, pruned = 0, stopped = false;
  const score = (rows, artifactStats, setCounts) => {
    if (!qualifies(setCounts)) return null;
    const result = evaluateDamageStats(input, artifactStats, setCounts);
    return result.ok ? { score: result.total, result, rows: [...rows] } : null;
  };
  const eligibleIds=new Set(pools.flat().map(x=>x.id));
  const current = inventory.filter(x => currentIds.includes(x.id) && eligibleIds.has(x.id));
  if (current.length === 5) {
    const stats = Object.create(null), setCounts = new Map();
    for (const row of current) { addStats(stats, statVector(row, relevant)); setCounts.set(row.setKey, (setCounts.get(row.setKey) || 0) + 1); }
    const seed = score(current, stats, setCounts); if (seed) best.push(seed);
  }
  const optimisticPossible = (index) => {
    if (best.length < topN) return true;
    const stats = { ...running }, boundSets = new Map(counts);
    addStats(stats, suffixMax[index]); addStats(stats, setCeiling);
    const bound = evaluateDamageStats(input, stats, boundSets);
    const floor = best[Math.min(topN, best.length) - 1]?.score ?? -Infinity;
    return !bound.ok || bound.total > floor;
  };
  const visit = async index => {
    if (stopped) return;
    if (cancelled()) { stopped = true; return; }
    if (index === 5) {
      visited++;
      const result = score(chosen, running, counts);
      if (result) { best.push(result); best.sort((a, b) => b.score - a.score); if (best.length > topN) best.length = topN; }
      if (visited % 1024 === 0) { onProgress({ visited, pruned, combinations: combos }); await new Promise(resolve=>setTimeout(resolve,0)); }
      return;
    }
    if (!optimisticPossible(index)) { pruned++; return; }
    const pool = pools[index].slice().sort((a, b) => quickPotential(b) - quickPotential(a));
    for (const piece of pool) {
      chosen[index] = piece; const vector = statVector(piece, relevant);
      addStats(running, vector); counts.set(piece.setKey, (counts.get(piece.setKey) || 0) + 1);
      await visit(index + 1);
      counts.set(piece.setKey, counts.get(piece.setKey) - 1); if (!counts.get(piece.setKey)) counts.delete(piece.setKey);
      addStats(running, vector, -1);
      if (stopped) break;
    }
  };
  await visit(0); onProgress({ visited, pruned, combinations: combos, done: true });
  return { results: best.map(x => ({ ...x, rows: x.rows.map(row => row.id) })), visited, pruned, combinations: combos, elapsedMs: performance.now() - started, exact: !stopped, stopped };
}

function quickPotential(piece) { const s = statVector(piece); return (s.critRate || 0) * 1.9 + (s.critDmg || 0) + (s.atkPct || 0) * .72 + (s.em || 0) * .12 + (s.er || 0) * .1 + (s.dmgBonus || 0); }
