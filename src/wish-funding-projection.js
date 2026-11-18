const DAY_MS = 86_400_000;
const MAX_DAYS = 30;

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const fromDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Summarizes actually recorded wish income without assuming unlogged rewards. */
export function summarizeWishFunding(plan = {}, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rows = Array.isArray(plan.history) ? plan.history : [];
  const todayKey = dateKey(today);
  const validRows = rows.filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row?.date || '') && row.date <= todayKey);
  const firstRecorded = validRows.reduce((min, row) => Math.min(min, fromDateKey(row.date).getTime()), Infinity);
  const elapsed = Number.isFinite(firstRecorded)
    ? Math.max(1, Math.min(MAX_DAYS, Math.floor((today - new Date(firstRecorded)) / DAY_MS) + 1))
    : 0;
  const days = Array.from({ length: MAX_DAYS }, (_, index) => {
    const date = new Date(today.getTime() - (MAX_DAYS - index - 1) * DAY_MS);
    const key = dateKey(date);
    const primos = validRows.filter((row) => row.date === key)
      .reduce((sum, row) => sum + Math.max(0, Number(row.primos) || 0) + Math.max(0, Number(row.count) || 0) * 160, 0);
    return { date: key, primos };
  });
  const recorded = days.reduce((sum, day) => sum + day.primos, 0);
  const dailyAverage = elapsed ? recorded / elapsed : 0;
  const available = Math.max(0, Number(plan.currentPrimos ?? plan.primos) || 0) + Math.max(0, Number(plan.wishes) || 0) * 160;
  const pity = Math.max(0, Math.min(89, Math.floor(Number(plan.characterPity) || 0)));
  const guaranteedPulls = Math.max(0, 90 - pity) + (plan.characterGuarantee || Number(plan.radiance) >= 3 ? 0 : 90);
  const remaining = Math.max(0, guaranteedPulls * 160 - available);
  const daysToGuarantee = remaining === 0 ? 0 : dailyAverage > 0 ? Math.ceil(remaining / dailyAverage) : null;

  return {
    days,
    elapsed,
    recorded,
    dailyAverage: Math.round(dailyAverage),
    available,
    guaranteedPulls,
    remaining,
    daysToGuarantee,
    hasHistory: elapsed > 0,
  };
}
