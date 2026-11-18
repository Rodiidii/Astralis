import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLoreReadingState, toggleLoreReadingState, loreReadingCounts, loreCollectionCounts, filterLoreReadingCharacters, recordLoreVisit, loreRecentVisits } from '../src/lore-reading-list.js';

const roster = [{ _id: 'amber' }, { _id: 'jean' }, { _id: 'venti' }];

test('le suivi des dossiers élimine les identifiants vides et dupliqués', () => {
  assert.deepEqual(normalizeLoreReadingState({ read: ['amber', 'amber', ''], saved: ['jean'] }), { read: ['amber'], saved: ['jean'], recent: [], updatedAt: 0 });
});

test('lecture et liste à lire se basculent sans toucher à l’autre état', () => {
  const read = toggleLoreReadingState({ saved: ['amber'] }, 'read', 'amber', true);
  assert.deepEqual(read.read, ['amber']);
  assert.deepEqual(read.saved, ['amber']);
  const unread = toggleLoreReadingState(read, 'read', 'amber', false);
  assert.deepEqual(unread.read, []);
  assert.deepEqual(unread.saved, ['amber']);
});

test('le compteur ignore les dossiers retirés du roster et calcule la progression', () => {
  assert.deepEqual(loreReadingCounts({ read: ['amber', 'gone'], saved: ['jean', 'gone'] }, roster), { total: 3, read: 1, unread: 2, saved: 1, percent: 33 });
});

test('les filtres du bureau de lecture séparent dossiers lus, à lire et enregistrés', () => {
  const state = { read: ['jean'], saved: ['venti'] };
  assert.deepEqual(filterLoreReadingCharacters(roster, state, 'read').map(row => row._id), ['jean']);
  assert.deepEqual(filterLoreReadingCharacters(roster, state, 'unread').map(row => row._id), ['amber', 'venti']);
  assert.deepEqual(filterLoreReadingCharacters(roster, state, 'saved').map(row => row._id), ['venti']);
});

test('les compteurs des archives comptent une collection et ignorent les entrées hors filtre', () => {
  const state = { read: ['event:festival', 'event:festival', 'event:quest'], saved: ['event:quest', 'region:liyue'] };
  assert.deepEqual(loreCollectionCounts(state, [{ id: 'event:festival' }, { id: 'event:quest' }]), { total: 2, read: 2, unread: 0, saved: 1, percent: 100 });
  assert.deepEqual(loreCollectionCounts(state, [{ id: 'region:liyue' }, { id: 'region:mondstadt' }]), { total: 2, read: 0, unread: 2, saved: 1, percent: 0 });
});

test('la reprise garde les six dernières entrées uniques dans leur ordre de consultation', () => {
  let state = {};
  for (let i = 0; i < 8; i++) state = recordLoreVisit(state, 'characters', `p${i}`, `Personnage ${i}`, i + 1);
  state = recordLoreVisit(state, 'regions', 'region:liyue', 'Liyue', 20);
  state = recordLoreVisit(state, 'characters', 'p7', 'Personnage 7', 21);
  assert.deepEqual(loreRecentVisits(state).map(row => row.id), ['p7', 'region:liyue', 'p6', 'p5', 'p4', 'p3']);
  assert.equal(normalizeLoreReadingState({ recent: [{ id: 'x', category: 'bad', label: 'bad' }] }).recent.length, 0);
});
