export function normalizeTaskSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.filter(step => step && typeof step === 'object' && String(step.title || '').trim()).map((step, index) => ({ id: String(step.id || `step-${index}`), title: String(step.title).trim(), done: Boolean(step.done) }));
}

export function parseTaskSteps(text, previous = [], createId = () => crypto.randomUUID()) {
  const byTitle = new Map();
  for (const step of normalizeTaskSteps(previous)) {
    const key = step.title.toLocaleLowerCase(), queue = byTitle.get(key) || [];
    queue.push(step); byTitle.set(key, queue);
  }
  return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(title => {
    const match = byTitle.get(title.toLocaleLowerCase())?.shift();
    return { id: match?.id || String(createId()), title, done: match?.done || false };
  });
}

export function toggleTaskStep(steps, id) {
  return normalizeTaskSteps(steps).map(step => step.id === String(id) ? { ...step, done: !step.done } : step);
}

export function taskStepProgress(steps) {
  const normalized = normalizeTaskSteps(steps), done = normalized.filter(step => step.done).length;
  return { done, total: normalized.length, percent: normalized.length ? Math.round(done / normalized.length * 100) : 0 };
}

export function resetTaskSteps(steps, createId = () => crypto.randomUUID()) {
  return normalizeTaskSteps(steps).map(step => ({ ...step, id: String(createId()), done: false }));
}

function localISODate(date = new Date()) {
  const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

export function taskDuePresentation(due, today = localISODate()) {
  if (!due) return { state: 'none', delta: null, label: 'Sans échéance' };
  const toDay = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
    const stamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(stamp) ? Math.floor(stamp / 86400000) : null;
  };
  const end = toDay(due), start = toDay(today);
  if (end === null || start === null) return { state: 'unknown', delta: null, label: 'Échéance à vérifier' };
  const delta = end - start, date = new Date(`${due}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  if (delta < 0) return { state: 'overdue', delta, label: `En retard · ${Math.abs(delta)} jour${Math.abs(delta) > 1 ? 's' : ''}`, date };
  if (delta === 0) return { state: 'today', delta, label: `Aujourd’hui · ${date}`, date };
  if (delta === 1) return { state: 'tomorrow', delta, label: `Demain · ${date}`, date };
  if (delta <= 7) return { state: 'soon', delta, label: `Dans ${delta} jours · ${date}`, date };
  return { state: 'scheduled', delta, label: `Le ${date}`, date };
}

export function tasksDueWithin(tasks=[],today=localISODate(),days=7){
 const horizon=Math.max(0,Math.floor(Number(days)||0));
 return tasks.filter(task=>{
  if(task.done||!task.due)return false;
  const delta=taskDuePresentation(task.due,today).delta;
  return Number.isFinite(delta)&&delta>=0&&delta<=horizon;
 });
}
export function tasksWithoutDueDate(tasks=[]) {
 return tasks.filter(task=>!task.done&&!String(task.due||'').trim());
}

export function taskCategories(tasks = []) {
 const counts = new Map();
 for (const task of Array.isArray(tasks) ? tasks : []) {
  const label = String(task?.category || 'Objectif').trim() || 'Objectif';
  const key = label.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
  const current = counts.get(key);
  counts.set(key, { label: current?.label || label, count: (current?.count || 0) + 1 });
 }
 return [...counts.values()]
  .sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));
}

export function taskCategoryProgress(tasks = [], category = '') {
 const normalize=value=>String(value||'Objectif').trim().normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr');
 const rows=(Array.isArray(tasks)?tasks:[]).filter(task=>normalize(task?.category)===normalize(category));
 const done=rows.filter(task=>task?.done).length;
 return { total: rows.length, open: rows.length-done, done, percent: rows.length?Math.round(done/rows.length*100):0 };
}

export function filterTasksByCategory(tasks = [], category = 'all') {
 if (!category || category === 'all') return Array.isArray(tasks) ? tasks : [];
 const selected = String(category).normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
 return (Array.isArray(tasks) ? tasks : []).filter(task => String(task?.category || 'Objectif').trim().normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr') === selected);
}
