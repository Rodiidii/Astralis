import { canAutoScheduleTask, compareTaskScheduleMode } from './task-schedule-mode.js';

export function shiftPlannerDate(date, offset) {
  const source = /^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) ? String(date) : new Date().toLocaleDateString('sv-SE');
  const parsed = new Date(`${source}T12:00:00`);
  if (!Number.isFinite(parsed.getTime())) return '';
  parsed.setDate(parsed.getDate() + Math.trunc(Number(offset) || 0));
  return parsed.toLocaleDateString('sv-SE');
}

export function plannerWeekDates(anchor, weekOffset = 0) {
  if (!isPlannerDate(anchor)) return [];
  const start = shiftPlannerDate(anchor, Math.max(-52, Math.min(52, Math.trunc(Number(weekOffset) || 0))) * 7);
  return Array.from({ length: 7 }, (_, index) => shiftPlannerDate(start, index));
}

/** Copy unfinished objectives into the matching weekdays of another week. Existing target objectives are preserved and never duplicated. */
export function copyPlannerWeekTasks(tasks = [], sourceDates = [], targetDates = [], idFactory = null) {
  if (!Array.isArray(tasks) || !Array.isArray(sourceDates) || !Array.isArray(targetDates) || sourceDates.length !== 7 || targetDates.length !== 7 || !sourceDates.every(isPlannerDate) || !targetDates.every(isPlannerDate)) return [];
  const signature = (game, due, title) => `${String(game || '').toLowerCase()}\u0000${due}\u0000${String(title || '').trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')}`;
  const sourceIndex = new Map(sourceDates.map((date, index) => [date, index]));
  const existing = new Set(tasks.filter(task => targetDates.includes(task?.due)).map(task => signature(task?.game, task?.due, task?.title)));
  const makeId = typeof idFactory === 'function' ? idFactory : () => globalThis.crypto?.randomUUID?.() || `planner-copy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const copies = [];
  for (const task of tasks) {
    const index = sourceIndex.get(task?.due);
    if (index == null || task?.done || !targetDates[index]) continue;
    const due = targetDates[index], key = signature(task?.game, due, task?.title);
    if (existing.has(key)) continue;
    existing.add(key);
    const copy = { ...task, id: String(makeId()), due, done: false };
    delete copy.updated;
    delete copy.completedAt;
    copies.push(copy);
  }
  return copies;
}

export function isPlannerDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isFinite(parsed.getTime()) && parsed.toLocaleDateString('sv-SE') === value;
}

export function plannerDayLoad(tasks = []) {
  const count = Array.isArray(tasks) ? tasks.length : 0;
  return { count, conflict: count > 1, crowded: count > 3 };
}

/** Summarize a day's open objectives across game profiles, so competing plans are visible before the day starts. */
export function plannerCrossGameSummary(tasks = []) {
  const labels = { gi: 'Genshin', hsr: 'Star Rail', ww: 'Wuthering Waves' };
  const counts = new Map();
  for (const task of Array.isArray(tasks) ? tasks : []) {
    if (!task || task.done) continue;
    const game = String(task.game || '').trim().toLowerCase();
    if (!game) continue;
    counts.set(game, (counts.get(game) || 0) + 1);
  }
  const games = [...counts].sort(([a], [b]) => ['gi', 'hsr', 'ww'].indexOf(a) - ['gi', 'hsr', 'ww'].indexOf(b) || a.localeCompare(b));
  if (games.length < 2) return null;
  const parts = games.map(([game, count]) => `${labels[game] || game} ×${count}`);
  return { games: games.map(([game, count]) => ({ id: game, label: labels[game] || game, count })), label: parts.join(' · '), total: games.reduce((sum, [, count]) => sum + count, 0) };
}

/** Priority-weighted day pressure makes two urgent goals stand out from two routine ones. */
export function plannerDayPriorityLoad(tasks = []) {
  const weights = { urgente: 3, haute: 2, normale: 1, basse: 0.5 };
  const rows = (Array.isArray(tasks) ? tasks : []).filter(task => task && !task.done);
  const score = rows.reduce((total, task) => {
    const priority = String(task.priority || 'normale').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
    return total + (weights[priority] ?? weights.normale);
  }, 0);
  const level = score >= 6 ? 'heavy' : score >= 3 ? 'busy' : score > 0 ? 'light' : 'clear';
  return { score, level, open: rows.length, urgent: rows.filter(task => ['urgente', 'haute'].includes(String(task.priority || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr'))).length };
}

/** Return dated tasks for one day, with unfinished goals first and stable source order. */
export function plannerDayTasks(tasks = [], date) {
  if (!isPlannerDate(date) || !Array.isArray(tasks)) return [];
  return tasks.map((task, index) => ({ task, index }))
    .filter(row => row.task?.due === date)
    .sort((a, b) => Number(Boolean(a.task?.done)) - Number(Boolean(b.task?.done)) || a.index - b.index)
    .map(row => row.task);
}

/** Keep week cells compact while letting a user reveal every task on a busy day. */
export function plannerDayPreview(tasks = [], date, expanded = false, limit = 3) {
  const rows = plannerDayTasks(tasks, date);
  const safeLimit = Math.max(1, Math.min(20, Math.trunc(Number(limit) || 3)));
  const visible = expanded ? rows : rows.slice(0, safeLimit);
  return { visible, total: rows.length, hidden: Math.max(0, rows.length - visible.length), expanded: Boolean(expanded) && rows.length > safeLimit };
}

export function plannerWeekProgress(tasks = [], dates = []) {
  const rows = Array.isArray(dates) ? dates.filter(isPlannerDate).map(date => {
    const dayTasks = (Array.isArray(tasks) ? tasks : []).filter(task => task?.due === date);
    const completed = dayTasks.filter(task => task?.done).length;
    return { date, total: dayTasks.length, completed, remaining: dayTasks.length - completed,
      percent: dayTasks.length ? Math.round(completed / dayTasks.length * 100) : 0 };
  }) : [];
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const completed = rows.reduce((sum, row) => sum + row.completed, 0);
  return { rows, total, completed, remaining: total - completed,
    percent: total ? Math.round(completed / total * 100) : 0 };
}

/** Compact workload summary for choosing lighter days before moving tasks. */
export function plannerWeekLoadSummary(tasks = [], dates = [], crowdedAt = 4) {
  const source=Array.isArray(tasks)?tasks:[];
  const rows = (Array.isArray(dates) ? dates : []).filter(isPlannerDate).map(date => {
    const openTasks = source.filter(task => task?.due === date && !task?.done);
    const open = openTasks.length;
    const urgent = openTasks.filter(task=>['urgente','haute'].includes(String(task?.priority||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr'))).length;
    return { date, open, urgent };
  });
  const peak = rows.reduce((best, row) => row.open > best.open ? row : best, { date: '', open: 0, urgent: 0 });
  return {
    days: rows.length,
    open: rows.reduce((sum, row) => sum + row.open, 0),
    urgent: rows.reduce((sum,row)=>sum+row.urgent,0),
    freeDays: rows.filter(row => row.open === 0).length,
    conflictDays: rows.filter(row => row.open > 1).length,
    crowdedDays: rows.filter(row => row.open >= Math.max(2, Number(crowdedAt) || 4)).length,
    peak
  };
}

/** Assign only undated/overdue open tasks, balancing load across usable week days. */
export function spreadPlannerBacklog(tasks = [], dates = [], today = new Date().toLocaleDateString('sv-SE'), options = {}) {
  const days = (Array.isArray(dates) ? dates : []).filter(date => isPlannerDate(date) && date >= today);
  if (!days.length) return [];
  const priority = { urgente: 0, haute: 1, normale: 2, basse: 3 };
  const rows = (Array.isArray(tasks) ? tasks : []).map((task,index)=>({task,index})).filter(({task}) => canAutoScheduleTask(task) && (!isPlannerDate(task.due) || task.due < today))
    .sort((a,b)=>{
      const modeDelta=compareTaskScheduleMode(a.task,b.task);
      if(modeDelta)return modeDelta;
      const rank=value=>priority[String(value?.priority||'normale').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr')]??2;
      const priorityDelta=rank(a.task)-rank(b.task);
      if(priorityDelta)return priorityDelta;
      const aDated=isPlannerDate(a.task.due),bDated=isPlannerDate(b.task.due);
      if(aDated&&bDated&&a.task.due!==b.task.due)return a.task.due.localeCompare(b.task.due);
      if(aDated!==bDated)return aDated?-1:1;
      return a.index-b.index;
    }).map(row=>row.task);
  const duration = task => {
    const explicit = Number(task?.durationMinutes);
    const estimateRow = typeof options.estimateTaskDuration === 'function' ? options.estimateTaskDuration(task) : null;
    const estimate = Number(estimateRow?.minutes ?? estimateRow);
    const fallback = Number(options.defaultTaskMinutes) || 30;
    return Math.max(1, Math.min(720, Math.round(Number.isFinite(explicit) && explicit > 0 ? explicit : Number.isFinite(estimate) && estimate > 0 ? estimate : fallback)));
  };
  const loads = new Map(days.map(date => [date, (Array.isArray(tasks) ? tasks : []).filter(task => !task?.done && task?.due === date).reduce((sum, task) => sum + duration(task), 0)]));
  return rows.map(task => {
    const date = days.reduce((best, candidate) => loads.get(candidate) < loads.get(best) ? candidate : best, days[0]);
    loads.set(date, loads.get(date) + duration(task));
    return { id: task.id, game: task.game, title: task.title, due: date };
  });
}

export function plannerCalendarIcs(tasks = [], stamp = new Date()) {
  const escapeText = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const dateOnly = value => isPlannerDate(value) ? String(value).replaceAll('-', '') : '';
  const nextDate = value => {
    const parsed = new Date(`${value}T12:00:00Z`);
    if (!Number.isFinite(parsed.getTime())) return '';
    parsed.setUTCDate(parsed.getUTCDate() + 1);
    return parsed.toISOString().slice(0, 10).replaceAll('-', '');
  };
  const dtstamp = stamp instanceof Date && Number.isFinite(stamp.getTime())
    ? stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    : new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const usedIds = new Set();
  const events = (Array.isArray(tasks) ? tasks : []).filter(task => !task?.done && dateOnly(task?.due)).map((task, index) => {
    const start = dateOnly(task.due), end = nextDate(task.due);
    if (!end) return '';
    const baseId = String(task.id || `${task.game || 'astralis'}-${start}-${task.title || 'task'}`);
    let uniqueId = baseId, suffix = 2;
    while (usedIds.has(uniqueId)) uniqueId = `${baseId}-${suffix++}`;
    usedIds.add(uniqueId);
    const id = escapeText(uniqueId);
    const description = [task.game, task.category].filter(Boolean).join(' · ') || 'Objectif Astralis';
    return ['BEGIN:VEVENT', `UID:${id}@astralis.local`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeText(task.title || 'Objectif Astralis')}`,
      `DESCRIPTION:${escapeText(description)}`, 'STATUS:CONFIRMED', 'TRANSP:TRANSPARENT', 'END:VEVENT'].join('\r\n');
  }).filter(Boolean);
  return foldCalendarLines(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Astralis//Personal Progress Planner//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR', ''].join('\r\n'));
}

/** RFC 5545 folds content lines at 75 UTF-8 octets without splitting a character. */
export function foldCalendarLines(calendar) {
  const encoder = new TextEncoder();
  return String(calendar).split('\r\n').map(line => {
    const folded = [];
    let chunk = '', bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > 75 && chunk) {
        folded.push(chunk);
        chunk = ' ';
        bytes = 1;
      }
      chunk += character;
      bytes += size;
    }
    folded.push(chunk);
    return folded.join('\r\n');
  }).join('\r\n');
}
