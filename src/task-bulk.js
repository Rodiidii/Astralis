export function normalizeTaskSelection(selected = [], tasks = []) {
  const available = new Set((Array.isArray(tasks) ? tasks : []).map(task => String(task?.id ?? '')));
  return [...new Set((Array.isArray(selected) ? selected : []).map(value => String(value ?? '')).filter(id => id && available.has(id)))];
}

export function selectVisibleTasks(selected = [], visible = [], checked = true) {
  const current = new Set(Array.isArray(selected) ? selected.map(String) : []);
  for (const value of Array.isArray(visible) ? visible : []) {
    const id = String(value ?? '');
    if (!id) continue;
    if (checked) current.add(id); else current.delete(id);
  }
  return [...current];
}

export function selectedOpenTasks(tasks = [], selected = []) {
  const ids = new Set((Array.isArray(selected) ? selected : []).map(String));
  return (Array.isArray(tasks) ? tasks : []).filter(task => task && !task.done && ids.has(String(task.id ?? '')));
}

export function taskBulkSchedule(tasks = [], selected = [], due = '') {
  const date = String(due), parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return [];
  return selectedOpenTasks(tasks, selected).map(task => ({ id: String(task.id), game: task.game, due }));
}
