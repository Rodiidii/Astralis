export function partitionFarmSessions(rows, date) {
  const today = (Array.isArray(rows) ? rows : []).filter(row => String(row?.date || '').slice(0, 10) === date);
  return { pending: today.filter(row => !row.done), completed: today.filter(row => !!row.done) };
}

export function setFarmSessionDone(rows, id, done, at = Date.now()) {
  if (!Array.isArray(rows) || id == null || String(id) === '') return null;
  const row = rows.find(item => String(item?.id) === String(id));
  if (!row) return null;
  row.done = Boolean(done);
  const memberIds = (row.characterIds || [row.characterId].filter(Boolean)).map(String);
  if (memberIds.length) row.doneCharacters = row.done ? memberIds : [];
  row.completedAt = row.done ? at : null;
  return row;
}

export function farmSessionPeopleState(row, people = []) {
  const ids = (Array.isArray(people) ? people : []).map(person => ({
    id: String(person?._id ?? person?.id ?? ''),
    name: String(person?._name ?? person?.name ?? ''),
  })).filter(person => person.id && person.name);
  const done = new Set(Array.isArray(row?.doneCharacters) ? row.doneCharacters.map(String) : []);
  const members = ids.map(person => ({ ...person, done: !!row?.done || done.has(person.id) }));
  return { members, completed: members.filter(person => person.done).length, total: members.length,
    complete: members.length > 0 && members.every(person => person.done) };
}

export function setFarmSessionPersonDone(rows, sessionId, characterId, isDone, at = Date.now()) {
  if (!Array.isArray(rows) || sessionId == null || characterId == null) return null;
  const row = rows.find(item => String(item?.id) === String(sessionId));
  if (!row) return null;
  const ids = (row.characterIds || [row.characterId].filter(Boolean)).map(String);
  const id = String(characterId);
  if (!ids.includes(id)) return null;
  const done = new Set(row.done ? ids : Array.isArray(row.doneCharacters) ? row.doneCharacters.map(String) : []);
  if (isDone) done.add(id); else done.delete(id);
  row.doneCharacters = [...done].filter(memberId => ids.includes(memberId));
  row.done = ids.length > 0 && ids.every(memberId => done.has(memberId));
  row.completedAt = row.done ? at : null;
  return row;
}

export function farmPeoplePresentation(people, maxVisible = 4) {
  const names = (Array.isArray(people) ? people : []).map(person => String(person?._name ?? person?.name ?? person ?? '').trim()).filter(Boolean);
  const visibleCount = Math.max(1, Math.min(8, Number(maxVisible) || 4));
  return {
    names,
    visible: (Array.isArray(people) ? people : []).filter(person => String(person?._name ?? person?.name ?? person ?? '').trim()).slice(0, visibleCount),
    overflow: Math.max(0, names.length - visibleCount),
    summary: names.length > 1 ? `${names.length} personnages · ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}` : names[0] || 'Aucun personnage lié'
  };
}

export function farmSessionState(row) {
  return row?.done ? 'complete' : 'planned';
}
