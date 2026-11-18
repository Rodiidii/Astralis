const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
};

export function normalizeAvailability(value = {}) {
  const time = /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value.startTime || '')) ? value.startTime : '18:00';
  return { startTime: time, dailyMinutes: clamp(value.dailyMinutes, 30, 600, 120) };
}

/** Find the first day with enough free time for a focused session.
 * Dated open tasks consume their explicit duration, their personal history estimate,
 * or the configured fallback session length (in that order).
 */
export function findNextAvailableSlot(tasks = [], options = {}) {
  const settings = normalizeAvailability(options);
  const slotMinutes = clamp(options.slotMinutes, 5, 360, 30);
  const fallbackMinutes = clamp(options.defaultTaskMinutes, 5, 360, 30);
  const startDate = String(options.startDate || '');
  const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && Number.isFinite(new Date(`${value}T12:00:00`).getTime());
  if (!isDate(startDate)) return null;
  const horizon = clamp(options.horizonDays, 1, 366, 60);
  const [hour, minute] = settings.startTime.split(':').map(Number);
  const baseMinute = hour * 60 + minute;
  const nowMinute = clamp(options.nowMinute, 0, 1439, baseMinute);
  const rows = Array.isArray(tasks) ? tasks : [];
  const addDays = (date, offset) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + offset); return d.toLocaleDateString('sv-SE'); };
  for (let day = 0; day < horizon; day++) {
    const date = addDays(startDate, day);
    const scheduled = rows.filter(task => task && !task.done && task.due === date);
    const occupiedMinutes = scheduled.reduce((sum, task) => {
      const explicit = Number(task.durationMinutes);
      const history = typeof options.estimateTaskDuration === 'function' ? options.estimateTaskDuration(task) : null;
      const estimate = Number(history?.minutes ?? history);
      const duration = Number.isFinite(explicit) && explicit > 0 ? explicit : Number.isFinite(estimate) && estimate > 0 ? estimate : fallbackMinutes;
      return sum + clamp(duration, 1, 720, fallbackMinutes);
    }, 0);
    const openingMinute = day === 0 ? Math.max(baseMinute, nowMinute) : baseMinute;
    const freeMinutes = Math.max(0, settings.dailyMinutes - Math.max(0, openingMinute - baseMinute) - occupiedMinutes);
    if (freeMinutes < slotMinutes) continue;
    const start = Math.min(1439, openingMinute + occupiedMinutes);
    const end = Math.min(1439, start + slotMinutes);
    return { date, startTime: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`, endTime: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`, slotMinutes, occupiedMinutes, taskCount: scheduled.length, estimatedTasks: scheduled.filter(task => !(Number(task.durationMinutes) > 0) && !(typeof options.estimateTaskDuration === 'function' && Number(options.estimateTaskDuration(task)?.minutes) > 0)).length, dailyMinutes: settings.dailyMinutes };
  }
  return null;
}
