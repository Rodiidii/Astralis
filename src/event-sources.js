const normalize = value => String(value || '').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function giEventText(row = {}) {
  return normalize([
    row.title, row.description, row.content, row.type, row.type_name,
    row.eventType, row.event_type, row.eventKind, row.event_kind,
    row.sourceType, row.source_type, row.kind, row.category,
    row.sourceLabel, row.source?.title,
  ].filter(Boolean).join(' '));
}

export function giEventType(row = {}) {
  if (row.webEvent === true || row.externalType === 'web') return 'web';
  if (row.communityEvent === true || row.externalType === 'community') return 'community';
  const category = normalize(row.category || row.kind || row.type || row.type_name || row.eventType || row.event_type || row.eventKind || row.event_kind);
  if (['web', 'web-event', 'web_event'].includes(category)) return 'web';
  if (['community', 'community-event', 'community_event'].includes(category)) return 'community';
  // Source domains and boilerplate footers are not event categories: HoYoLAB
  // hosts ordinary in-game announcements as well as community campaigns.
  const text = normalize([
    row.title, row.type, row.type_name, row.eventType, row.event_type,
    row.eventKind, row.event_kind, row.externalType, row.category, row.kind,
  ].filter(Boolean).join(' '));
  if (/web[\s_-]*event|evenement web|online event|evenement en ligne|h5 page|web activity/.test(text)) return 'web';
  if (/community[\s_-]*event|evenement communautaire|community campaign|communaute|concours|contest|giveaway|tirage au sort|fan.?art|fan.?creation|creator event|evenement createur|partagez votre|share your|submission event|sondage communautaire/.test(text)) return 'community';
  // Descriptions can carry a reliable explicit event label; ignore generic
  // mentions of HoYoLAB, social links, discussion, and community footers.
  const description = normalize(row.description || '');
  if (/web[\s_-]*event|evenement web|online event|evenement en ligne|h5 page|web activity/.test(description)) return 'web';
  if (/community[\s_-]*event|evenement communautaire|community campaign|concours|contest|giveaway|tirage au sort|fan.?art|fan.?creation|evenement createur|sondage communautaire/.test(description)) return 'community';
  return '';
}

export const giEventExternal = row => !!giEventType(row);
