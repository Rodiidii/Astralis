import test from 'node:test';
import assert from 'node:assert/strict';
import { moveRotationGroup, rotationGroupRange } from '../src/rotation-order.js';

test('déplace une action vers le haut ou le bas sans perdre les métadonnées', () => {
  const steps = [{ name: 'A' }, { name: 'B', count: 2 }, { name: 'C' }];
  assert.deepEqual(moveRotationGroup(steps, 2, 0).map(row => row.name), ['C', 'A', 'B']);
  assert.deepEqual(moveRotationGroup(steps, 0, 1).map(row => row.name), ['B', 'A', 'C']);
  assert.equal(moveRotationGroup(steps, 1, 1), steps);
  assert.equal(moveRotationGroup(steps, -1, 1), steps);
  assert.equal(moveRotationGroup(steps, 1, 8), steps);
});

test('un combo se déplace en bloc depuis son début ou une de ses actions', () => {
  const steps = [
    { name: 'Avant' },
    { type: 'comboStart', comboId: 'x', repetitions: 3 },
    { name: 'E' },
    { name: 'Q' },
    { type: 'comboEnd', comboId: 'x' },
    { name: 'Après' },
  ];
  assert.deepEqual(rotationGroupRange(steps, 3), { start: 1, end: 4 });
  const moved = moveRotationGroup(steps, 2, 5);
  assert.deepEqual(moved.map(row => row.name || row.type), ['Avant', 'Après', 'comboStart', 'E', 'Q', 'comboEnd']);
  assert.deepEqual(moveRotationGroup(steps, 4, 0).map(row => row.name || row.type), ['comboStart', 'E', 'Q', 'comboEnd', 'Avant', 'Après']);
});
