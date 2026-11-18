const keyFor = game => `astralis:studio:last-action:${String(game || '')}`;
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
const valid = value => /^[a-z0-9][a-z0-9-]{0,47}$/i.test(String(value || ''));

export function saveDashboardLastAction(storage, game, destination, label, timestamp = Date.now()) {
  if (!storage || !valid(game) || !valid(destination)) return null;
  const numericTime = Number(timestamp);
  const action = { destination, label: clean(label) || 'Reprendre ma dernière page', savedAt: Number.isFinite(numericTime) ? Math.max(0, numericTime) : Date.now() };
  storage.setItem(keyFor(game), JSON.stringify(action));
  return action;
}

export function loadDashboardLastAction(storage, game) {
  if (!storage || !valid(game)) return null;
  try {
    const action = JSON.parse(storage.getItem(keyFor(game)) || 'null');
    const numericTime = Number(action?.savedAt);
    return action && valid(action.destination) ? { destination: action.destination, label: clean(action.label) || 'Reprendre ma dernière page', savedAt: Number.isFinite(numericTime) ? Math.max(0, numericTime) : 0 } : null;
  } catch {
    return null;
  }
}
