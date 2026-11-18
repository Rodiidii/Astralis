/** Public facts observed on the reference page; intentionally separate from Astralis' local corpus. */
export const RELATION_REFERENCE = Object.freeze({
  url: 'https://ties.catforest.dev/genshin?utm_source=x&utm_medium=social&utm_campaign=yties-202611',
  checkedAt: '2026-11-15',
  counts: Object.freeze({ storyLines: 233308, quests: 1626, playableCharacters: 122, voiceLines: 1203, originalReferences: 68012 }),
  delivery: Object.freeze({
    graph: 'Ressource JavaScript statique chargée par la page',
    characterStories: 'JSON public à la demande, un personnage et une langue par requête',
    sample: 'https://ties.catforest.dev/genshin/story/en/Amber.json',
    bulkDatabase: false,
    documentedBulkApi: false
  })
});

export function referenceStoryUrl(character, language = 'en') {
  const allowed = new Set(['en', 'zh', 'ja', 'ko']);
  if (!allowed.has(language) || typeof character !== 'string' || !character.trim()) return '';
  const slug = character.trim().replace(/\s+/g, '_');
  return `https://ties.catforest.dev/genshin/story/${language}/${encodeURIComponent(slug)}.json`;
}

export function referenceAuditSnapshot() {
  return {
    url: RELATION_REFERENCE.url,
    checkedAt: RELATION_REFERENCE.checkedAt,
    counts: { ...RELATION_REFERENCE.counts },
    delivery: { ...RELATION_REFERENCE.delivery }
  };
}

export function parseReferencePage(html) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ');
  const match = text.match(/收录\s*([\d,]+)\s*位可玩角色、\s*([\d,]+)\s*条[^，,]*语音，以及\s*([\d,]+)\s*个任务里的\s*([\d,]+)\s*句剧情台词/);
  if (!match) return null;
  const number = value => Number(value.replaceAll(',', ''));
  return { playableCharacters: number(match[1]), voiceLines: number(match[2]), quests: number(match[3]), storyLines: number(match[4]) };
}

/** Read only the published aggregate counters from the page's static client bundle. */
export function parseReferenceBundle(bundle) {
  const text=String(bundle||'');
  const match=text.match(/(?:let|const|var)\s+\w+\s*=\s*\{\s*lines\s*:\s*(\d+)\s*,\s*quests\s*:\s*(\d+)\s*,\s*defined\s*:\s*(\d+)\s*,\s*sources\s*:\s*(\d+)\s*\}/);
  if(!match)return null;
  return {storyLines:Number(match[1]),quests:Number(match[2]),definedCharacters:Number(match[3]),originalReferences:Number(match[4])};
}
