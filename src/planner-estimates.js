const normalize = value => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLocaleLowerCase('fr');

/** Estimate a task only from completed focus sessions with the same title and game. */
export function estimatePlannerTaskDuration(task, history = []) {
  const title = normalize(task?.title), game = String(task?.game || '');
  if (!title || !game || !Array.isArray(history)) return null;
  const samples = history
    .filter(row => row && row.game === game && normalize(row.title) === title)
    .map(row => Number(row.durationMs))
    .filter(ms => Number.isFinite(ms) && ms >= 60_000 && ms <= 12 * 60 * 60 * 1000)
    .map(ms => ms / 60_000)
    .sort((a, b) => a - b);
  if (!samples.length) return null;
  const middle = Math.floor(samples.length / 2);
  const median = samples.length % 2 ? samples[middle] : (samples[middle - 1] + samples[middle]) / 2;
  return { minutes: Math.max(1, Math.round(median)), samples: samples.length };
}

export function summarizePlannerDayDuration(tasks = [], history = [], defaultTaskMinutes = 30) {
  const open = (Array.isArray(tasks) ? tasks : []).filter(task => task && !task.done);
  const fallback = Math.max(5, Math.min(360, Math.round(Number(defaultTaskMinutes) || 30)));
  const rows = open.map(task => {
    const explicit = Number(task.durationMinutes);
    if (Number.isFinite(explicit) && explicit > 0) return { minutes: Math.max(1, Math.round(explicit)), kind: 'explicit' };
    const personal = estimatePlannerTaskDuration(task, history);
    return personal ? { minutes: personal.minutes, kind: 'history' } : { minutes: fallback, kind: 'fallback' };
  });
  const known = rows.filter(row => row.kind !== 'fallback');
  return {
    minutes: rows.reduce((sum, row) => sum + row.minutes, 0),
    knownMinutes: known.reduce((sum, row) => sum + row.minutes, 0),
    estimated: rows.filter(row => row.kind === 'history').length,
    explicit: rows.filter(row => row.kind === 'explicit').length,
    unknown: rows.filter(row => row.kind === 'fallback').length,
    open: open.length,
    complete: rows.length > 0 && known.length === rows.length,
  };
}

export function formatPlannerDuration(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60), rest = value % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}
