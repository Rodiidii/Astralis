import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { characterTrailers, factionMember, isOfficialTrailer, loreEvents, regionTrailers } from '../src/lore-archive.js';
import { LORE_REGIONS } from '../src/lore.js';

const archive = JSON.parse(readFileSync(new URL('../data/lore-archive.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(readFileSync(new URL('../assets/data/gi-characters.json', import.meta.url), 'utf8'));
const figures = JSON.parse(readFileSync(new URL('../assets/data/gi-relation-lore.json', import.meta.url), 'utf8'));

test('filmography matches official full subject, not a name in a subtitle or a hashtag', () => {
  const good = { id: 'aau-c8l5z9c', channel: 'https://www.youtube.com/@GenshinImpact', title: 'Character Teaser - "Furina: Member of the Cast"' };
  const list = [good, { ...good, channel: 'https://www.youtube.com/@Fan' }, { ...good, title: 'Character Trailer - "Charlotte: Interview with Furina"' }, { ...good, title: 'Version 4.2 Trailer | Genshin Impact #Furina' }];
  assert.deepEqual(characterTrailers(list, { _name: 'Furina' }), [good]);
  assert.ok(archive.videos.every(isOfficialTrailer));
  assert.equal(new Set(archive.videos.map(video => video.id)).size, archive.videos.length);
});

test('the eight explored regions have a verified launch trailer, excluding extracts', () => {
  for (const region of LORE_REGIONS.slice(0, 8)) {
    const videos = regionTrailers(archive.videos, region);
    assert.ok(videos.length, region.name);
    assert.ok(videos.every(video => !video.title.includes('(Extract')));
  }
});

test('the journal filters by region and accent-insensitive search, with local thumbnails', () => {
  const results = loreEvents(archive.events, 'mondstadt', 'alizees');
  assert.ok(results.length >= 2);
  assert.ok(results.every(event => event.region === 'mondstadt'));
  assert.equal(new Set(archive.events.map(event => event.id)).size, archive.events.length);
  for (const event of archive.events) {
    assert.match(event.source, /\?oldid=\d+$/);
    if (event.image) assert.ok(existsSync(new URL('../' + event.image, import.meta.url)), event.title);
  }
});

test('every listed playable and lore figure has a sourced profile', () => {
  for (const character of [...catalog, ...figures]) {
    const profile = archive.profiles[character.id];
    assert.ok(profile?.chapters?.length, character.name);
    assert.ok(profile.chapters.every(chapter => chapter.text && chapter.source));
  }
});

test('faction members match exact names or affiliations and include historical membership', () => {
  const faction = { name: 'Maison du Foyer', members: ['Fréminet'], historical: ['Ancien membre'] };
  assert.ok(factionMember(faction, { _name: 'Freminet' }));
  assert.ok(factionMember(faction, { _name: 'Lynette', affiliation: 'Maison du Foyer' }));
  assert.ok(factionMember(faction, { _name: 'Ancien membre' }));
  assert.ok(!factionMember(faction, { _name: 'Jean', affiliation: 'Proche de la Maison du Foyer' }));
});
