export const loreKey = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const officialChannels = new Set([
  'https://www.youtube.com/@genshinimpact',
  'https://www.youtube.com/channel/ucis882ypwzt1nfam0gr0d9q',
]);

const aliases = {
  'nomade': ['Wanderer'],
  'shogun raiden': ['Raiden Shogun'],
  'tartaglia': ['Childe'],
  'thomas': ['Thoma'],
  'rosalia': ['Rosaria'],
  'il dottore': ['Dottore'],
  'il capitano': ['Capitano'],
  'vodyanista': ['Vodyanitsa'],
};

export function isOfficialTrailer(video) {
  return /^[\w-]{11}$/.test(video.id) &&
    officialChannels.has(String(video.channel).toLowerCase().replace(/\/$/, ''));
}

const launchSpotlights = {
  'cryo chapter cavalry captain kaeya genshin impact': 'kaeya',
  'pyro chapter chef de cuisine xiangling genshin impact': 'xiangling',
};

export function characterTrailers(videos, character) {
  const name = loreKey(character._name);
  const names = new Set([name, ...(aliases[name] || []).map(loreKey)]);
  return videos.filter(video => {
    if (!isOfficialTrailer(video)) return false;
    const subject = String(video.title || '').match(/^(?:New )?Character (?:Trailer|Demo|Teaser)\s*[-–—:]\s*["“«]?([^:："”»]+)[:：]/i)?.[1];
    return names.has(subject ? loreKey(subject) : launchSpotlights[loreKey(video.title)]);
  });
}

const launchVersions = {
  mondstadt: '1.0', liyue: '1.1', inazuma: '2.0',
  sumeru: '3.0', fontaine: '4.0', natlan: '5.0', 'nod-krai': 'Luna I', snezhnaya: '7.0',
};

export function regionTrailers(videos, region) {
  return videos.filter(video => {
    if (!isOfficialTrailer(video) || !/\b(?:Trailer|Teaser|Preview)\b/i.test(String(video.title || '').split('|')[0]) || /\(Extract\b/i.test(video.title)) return false;
    const version = String(video.title || '').match(/^Version\s+["“]?(\d+\.\d+|Luna [IVX]+)(?=\s|["”])/i)?.[1];
    if (version && version === launchVersions[region.id]) return true;
    const subject = String(video.title || '').match(/^(.+?)\s+(?:Exploration|Region|Regional)\s+(?:Teaser|Trailer|Preview)\b/i)?.[1];
    return subject && loreKey(subject) === loreKey(region.name);
  });
}

export function loreEvents(events, region, query = '') {
  const needle = loreKey(query);
  return events.filter(event => (!region || region === 'all' || region === event.region) &&
    loreKey([event.title, event.originalTitle, event.summary, event.kind].join(' ')).includes(needle));
}

export function factionMember(faction, character) {
  const names = [character._name, character.name, character.loreTitle].filter(Boolean).map(loreKey);
  const affiliations = [character.affiliation, character.faction].filter(Boolean).map(loreKey);
  const affiliation = loreKey(faction.name);
  const roster = [...faction.members, ...(faction.historical || [])];
  return roster.some(member => names.includes(loreKey(member))) ||
    affiliations.includes(affiliation);
}

export function fetchLoreJSON(path) {
  return fetch(path).then(response => {
    if (!response.ok) throw new Error('Archive indisponible');
    return response.json();
  });
}
