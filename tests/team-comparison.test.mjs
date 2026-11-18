import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTeamComparisonSelection, buildTeamComparison } from '../src/team-comparison.js';

const teams = [
  { id: 'a', name: 'Aube', members: [{ character: 'furina' }, { character: 'neuv' }, {}, {}], rotation: [{ type: 'skill' }, { type: 'comboEnd' }, { type: 'burst' }] },
  { id: 'b', name: 'Marée', members: [{ character: 'furina' }, { character: 'navia' }, { character: 'xianyun' }, {}], rotation: [{ type: 'skill' }] },
  { id: 'c', name: 'Orage', members: [{ character: 'furina' }], favorite: true },
  { id: 'd', name: 'Vent', members: [] },
];

test('la sélection conserve l’ordre, élimine doublons et équipes supprimées, et plafonne à trois', () => {
  assert.deepEqual(normalizeTeamComparisonSelection(['b', 'a', 'b', 'gone', 'c', 'd'], teams), ['a', 'c', 'd']);
  assert.deepEqual(normalizeTeamComparisonSelection(['gone'], teams), []);
});

test('la comparaison résume roster, emplacements vides, rotation réelle et personnages partagés', () => {
  assert.deepEqual(buildTeamComparison(teams.slice(0, 2)), {
    teams: [
      { id: 'a', name: 'Aube', members: ['furina', 'neuv'], filled: 2, missing: 2, rotationSteps: 2, favorite: false },
      { id: 'b', name: 'Marée', members: ['furina', 'navia', 'xianyun'], filled: 3, missing: 1, rotationSteps: 1, favorite: false },
    ],
    sharedCharacterIds: ['furina'],
    canCompare: true,
  });
});

test('une sélection solo indique honnêtement qu’elle ne forme pas encore une comparaison', () => {
  const summary = buildTeamComparison([teams[2]]);
  assert.equal(summary.canCompare, false);
  assert.deepEqual(summary.sharedCharacterIds, []);
});
