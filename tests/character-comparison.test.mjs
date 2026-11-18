import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_COMPARE_KEY, normalizeCharacterComparison, toggleCharacterComparison, characterComparisonRows } from '../src/character-comparison.js';

const characters = [
  { _id: 'venti', _name: 'Venti', rarity: 5, vision: 'Anémo', weaponText: 'Arc', nation: 'Mondstadt', faction: 'Archons' },
  { _id: 'zhongli', _name: 'Zhongli', rarity: 5, element: 'Géo', weapon: 'Lance', region: 'Liyue' },
  { _id: 'nahida', _name: 'Nahida', rarity: 5, path: 'Dendro' },
  { _id: 'extra', _name: 'Extra', rarity: 4 },
];

test('character comparison keeps three unique entries from the active catalog', () => {
  assert.equal(CHARACTER_COMPARE_KEY, 'astralis:gi:character-compare:v1');
  let value = {};
  for (const id of ['venti', 'zhongli', 'nahida']) value = toggleCharacterComparison(value, id, characters).state;
  assert.deepEqual(value.ids, ['venti', 'zhongli', 'nahida']);
  assert.equal(toggleCharacterComparison(value, 'extra', characters).reason, 'limit');
  assert.deepEqual(toggleCharacterComparison(value, 'zhongli', characters).state.ids, ['venti', 'nahida']);
  assert.deepEqual(normalizeCharacterComparison({ ids: ['gone', 'venti', 'venti', 'zhongli', 'nahida', 'extra'] }, characters), { ids: ['venti', 'zhongli', 'nahida'] });
});

test('comparison rows use catalog metadata and leave missing fields blank', () => {
  const rows = characterComparisonRows({ ids: ['venti', 'zhongli'] }, characters);
  assert.deepEqual(rows[0], { id: 'venti', name: 'Venti', rarity: 5, element: 'Anémo', weapon: 'Arc', region: 'Mondstadt', affiliation: 'Archons' });
  assert.equal(rows[1].region, 'Liyue');
  assert.equal(rows[1].affiliation, '');
});
