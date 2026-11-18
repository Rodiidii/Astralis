import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStatBreakdown } from '../src/build-stat-breakdown.js';

test('sépare les valeurs de base des ajouts sans modifier les totaux affichés', () => {
  const rows = buildStatBreakdown({
    hp: 18000, atk: 2100, def: 900, em: 120, er: 130,
    critRate: 75, critDmg: 180, dmgBonus: 46.6, baseAtk: 800,
    base: { hp: 10000, attack: 500, defense: 700, elementalMastery: 20 },
  });
  assert.equal(rows.length, 8);
  assert.deepEqual(rows.map(({ key, base, added, total }) => [key, base, added, total]), [
    ['hp', 10000, 8000, 18000], ['atk', 800, 1300, 2100],
    ['def', 700, 200, 900], ['em', 20, 100, 120],
    ['er', 100, 30, 130], ['critRate', 5, 70, 75],
    ['critDmg', 50, 130, 180], ['dmgBonus', 0, 46.6, 46.6],
  ]);
});

test('accepte les statistiques importées Enka et ignore les totaux manquants', () => {
  const rows = buildStatBreakdown({ hp: 12000, atk: 1500, baseAtk: 700, er: 115, critRate: 60, critDmg: 140, base: { hp: 9000, def: 800, er: 115, critRate: 60, critDmg: 140 } });
  assert.equal(rows.find(row => row.key === 'atk').added, 800);
  assert.equal(rows.find(row => row.key === 'er').base, 115);
  assert.equal(rows.some(row => row.key === 'em'), false);
  assert.deepEqual(buildStatBreakdown(null), []);
});
