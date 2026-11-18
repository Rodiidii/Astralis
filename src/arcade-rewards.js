export function claimTetrisDailyReward(state = {}, score = 0, day = '') {
  const safeScore = Number(score);
  if (!Number.isFinite(safeScore) || safeScore <= 1500 || !/^\d{4}-\d{2}-\d{2}$/.test(String(day))) {
    return { awarded: false, state };
  }
  if (state?.tetrisRewardDay === day) return { awarded: false, state };
  const next = {
    ...(state && typeof state === 'object' ? state : {}),
    tetrisRewardDay: day,
    bonus: Math.max(0, Number(state?.bonus) || 0) + 5,
  };
  return { awarded: true, amount: 5, state: next };
}

export function tetrisHapticPattern(event, lines = 0) {
  if (event === 'special') return [18, 24, 42];
  if (event === 'game-over') return [48, 36, 78];
  if (event !== 'line-clear') return [];
  const count = Math.max(0, Math.floor(Number(lines) || 0));
  return count >= 4 ? [32, 24, 68] : count >= 2 ? [24, 18, 36] : count === 1 ? [12] : [];
}
