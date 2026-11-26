const DAY_MS = 86400000;

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

export function nextTaskDue(due, recurrence, preferredDay) {
  const date = parseDate(due);
  if (!date) return '';
  if (recurrence === 'daily') date.setTime(date.getTime() + DAY_MS);
  else if (recurrence === 'weekly') date.setTime(date.getTime() + 7 * DAY_MS);
  else if (recurrence === 'monthly') {
    const wantedDay = Math.max(1, Math.min(31, Number(preferredDay) || date.getUTCDate()));
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(wantedDay, lastDay));
  } else return '';
  return date.toISOString().slice(0, 10);
}

export function recurringTaskExists(tasks, task, due) {
  const seriesId = String(task?.seriesId || task?.id || '');
  return (Array.isArray(tasks) ? tasks : []).some(row => String(row?.seriesId || row?.id || '') === seriesId && row?.due === due);
}

export function makeNextRecurringTask(task, due, createId = () => crypto.randomUUID()) {
  if (!task || !due) return null;
  const id = String(createId());
  const steps = Array.isArray(task.steps) ? task.steps.filter(step => step && String(step.title || '').trim()).map(step => ({
    id: String(createId()), title: String(step.title).trim(), done: false
  })) : [];
  const next = { ...task, id, seriesId: String(task.seriesId || task.id || id), due, done: false, completedAt: null, steps };
  if ('actualMinutes' in next) next.actualMinutes=0;
  if ('status' in next) next.status='todo';
  if ('occurrenceCreated' in next) next.occurrenceCreated=false;
  delete next._editing;
  return next;
}

export function recurrenceLabel(value) {
  return ({ daily: 'Chaque jour', weekly: 'Chaque semaine', monthly: 'Chaque mois' })[value] || '';
}
