const clean = value => String(value ?? '').trim().slice(0, 120);

export function normalizePlannerTaskFilters(value = {}) {
  const game = ['all', 'gi', 'hsr', 'ww'].includes(String(value.game || 'all')) ? String(value.game || 'all') : 'all';
  return { game, category: clean(value.category) || 'all', character: clean(value.character) || 'all' };
}

export function plannerCharacterFilterKey(task) {
  const identity = String(task?.character || '').trim() || String(task?.characterName || '').trim();
  return identity ? `${String(task?.game || '').trim()}:${identity}` : '';
}

export function filterPlannerTasks(tasks = [], rawFilters = {}) {
  const filters = normalizePlannerTaskFilters(rawFilters);
  return (Array.isArray(tasks) ? tasks : []).filter(task => {
    if (!task) return false;
    if (filters.game !== 'all' && task.game !== filters.game) return false;
    if (filters.category !== 'all' && String(task.category || 'Autre') !== filters.category) return false;
    if (filters.character !== 'all' && plannerCharacterFilterKey(task) !== filters.character) return false;
    return true;
  });
}

export function plannerTaskFilterOptions(tasks = []) {
  const categories = [...new Set((Array.isArray(tasks) ? tasks : []).filter(Boolean).map(task => String(task.category || 'Autre').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const people = new Map();
  for (const task of Array.isArray(tasks) ? tasks : []) {
    const key = plannerCharacterFilterKey(task);
    if (!key) continue;
    const name = String(task.characterName || task.character || 'Personnage').trim();
    people.set(key, { key, name, game: String(task.game || '') });
  }
  return { categories, characters: [...people.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr') || a.game.localeCompare(b.game)) };
}
