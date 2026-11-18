const dateKey = value => value.toLocaleDateString('sv-SE');

export function summarizeDashboardDay({events = [], tasks = [], rituals = {completed: 0, total: 0}, now = new Date()} = {}) {
  const instant = new Date(now);
  if (!Number.isFinite(instant.getTime())) return {events: 0, activeEvents: 0, dueTasks: 0, rituals: {completed: 0, total: 0, percent: 0}};
  const start = new Date(instant);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const current = instant.getTime();
  const today = dateKey(start);
  const todaysEvents = (Array.isArray(events) ? events : []).filter(event => {
    const from = Date.parse(event?.start || event?.end || '');
    const until = Date.parse(event?.end || event?.start || '');
    return Number.isFinite(from) && Number.isFinite(until) && from < end.getTime() && until >= start.getTime();
  });
  const activeEvents = todaysEvents.filter(event => {
    const from = Date.parse(event?.start || event?.end || '');
    const until = Date.parse(event?.end || event?.start || '');
    return from <= current && until >= current;
  }).length;
  const dueTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
    if (!task || task.done || !task.due) return false;
    const due = String(task.due).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(due) && due <= today;
  }).length;
  const ritualTotal = Math.max(0, Number(rituals?.total) || 0);
  const ritualCompleted = Math.min(ritualTotal, Math.max(0, Number(rituals?.completed) || 0));
  return {
    events: todaysEvents.length,
    activeEvents,
    dueTasks,
    rituals: {completed: ritualCompleted, total: ritualTotal, percent: ritualTotal ? Math.round(ritualCompleted / ritualTotal * 100) : 0},
  };
}
