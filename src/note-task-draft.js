const TASK_CATEGORY = { build: 'Build', rotation: 'Endgame', 'test dps': 'Endgame', personnage: 'Personnage', farm: 'Matériaux', 'a faire': 'Autre' };

/** Turn a note into an editable task draft without changing the saved note. */
export function noteTaskDraft(note, game, idFactory = () => globalThis.crypto?.randomUUID?.() || `note-step-${Date.now()}`) {
  if (!note || typeof note !== 'object' || !['gi', 'hsr', 'ww'].includes(game)) return null;
  const categoryKey = String(note.tag || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  const steps = String(note.body || '').split(/\r?\n/).map(line => {
    const match = line.match(/^\s*(?:[-*]\s+|\[([ xX])\]\s+)(.+?)\s*$/);
    return match ? { id: String(idFactory()), title: match[2], done: Boolean(match[1]?.trim()) } : null;
  }).filter(Boolean).slice(0, 20);
  return {
    id: String(idFactory()), game, title: String(note.title || '').trim() || 'Suivre cette note',
    category: TASK_CATEGORY[categoryKey] || (note.targetName ? 'Personnage' : 'Autre'), priority: 'Normale', due: '',
    scheduleMode: 'flexible', character: String(note.target || ''), characterName: String(note.targetName || ''),
    done: false, steps, sourceNoteId: String(note.id || '')
  };
}
