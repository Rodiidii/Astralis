const MODES = new Set(['flexible', 'fixed', 'optional']);

export function normalizeTaskScheduleMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  return MODES.has(mode) ? mode : 'flexible';
}

export function taskScheduleModeLabel(value) {
  return ({ flexible: 'Flexible', fixed: 'Fixe', optional: 'Optionnelle' })[normalizeTaskScheduleMode(value)];
}

export function canAutoScheduleTask(task) {
  return Boolean(task && !task.done && normalizeTaskScheduleMode(task.scheduleMode) !== 'fixed');
}

export function compareTaskScheduleMode(a, b) {
  const rank = { flexible: 0, optional: 1, fixed: 2 };
  return rank[normalizeTaskScheduleMode(a?.scheduleMode)] - rank[normalizeTaskScheduleMode(b?.scheduleMode)];
}
