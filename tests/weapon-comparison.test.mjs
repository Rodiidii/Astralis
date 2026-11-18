import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_COMPARE_KEY, normalizeWeaponComparison, toggleWeaponComparison, weaponComparisonRows } from '../src/weapon-comparison.js';

const weapons = [
  { _id: 'a', _name: 'Lame A', rarity: 5, weaponText: 'Épée', baseAtkValue: 47.5, mainStatText: 'DGT CRIT', baseStatText: '9,6%', effectName: 'Pacte', r1: { description: 'Effet R1' }, r5: { description: 'Effet R5' } },
  { _id: 'b', _name: 'Arc B', rarity: 4, weaponText: 'Arc', baseAtkValue: 42.4, r1: { description: 'Bonus R1' } },
  { _id: 'c', _name: 'Lance C', rarity: 4 },
  { _id: 'd', _name: 'Catalyseur D', rarity: 4 },
];

test('weapon comparison keeps at most three unique catalog entries', () => {
  assert.equal(WEAPON_COMPARE_KEY, 'astralis:gi:weapon-compare:v1');
  let value = {};
  for (const id of ['a', 'b', 'c']) value = toggleWeaponComparison(value, id, weapons).state;
  assert.deepEqual(value.ids, ['a', 'b', 'c']);
  assert.equal(toggleWeaponComparison(value, 'd', weapons).reason, 'limit');
  assert.deepEqual(toggleWeaponComparison(value, 'b', weapons).state.ids, ['a', 'c']);
  assert.deepEqual(normalizeWeaponComparison({ ids: ['missing', 'a', 'a', 'b', 'c', 'd'], refinement: 9 }, weapons), { ids: ['a', 'b', 'c'], refinement: 5 });
});

test('comparison rows select the chosen refinement and expose factual source fields', () => {
  const rows = weaponComparisonRows({ ids: ['a', 'b'], refinement: 5 }, weapons);
  assert.equal(rows[0].baseAttackLevel1, 47.5);
  assert.equal(rows[0].secondaryValue, '9,6%');
  assert.equal(rows[0].passive, 'Effet R5');
  assert.equal(rows[0].refinement, 5);
  assert.equal(rows[1].passive, 'Bonus R1');
});
