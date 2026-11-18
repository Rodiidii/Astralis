const clean = value => String(value ?? '').replace(/\r/g, '').trim();

export function notesAsMarkdown(notes = [], game = 'Astralis', date = new Date()) {
  const rows = (Array.isArray(notes) ? notes : []).filter(note => note && clean(note.title));
  const stamp = date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : '';
  const sections = rows.map(note => {
    const title = clean(note.title).replace(/([\\`*_{}\[\]<])/g, '\\$1');
    const metadata = [clean(note.tag) || 'Générale', clean(note.targetName)].filter(Boolean).join(' · ');
    const body = clean(note.body) || '_Note vide_';
    return `## ${title}\n\n_${metadata}${note.pinned ? ' · Épinglée' : ''}_\n\n${body}`;
  });
  return [`# Carnet Astralis · ${clean(game) || 'Astralis'}`, '', `Exporté le ${stamp}`, '', ...sections, ''].join('\n');
}
