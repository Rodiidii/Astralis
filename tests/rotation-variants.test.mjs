import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteRotationVariant, saveRotationVariant, selectRotationVariant } from '../src/rotation-variants.js';

test('enregistre plusieurs variantes et garde la rotation manuelle séparément', () => {
  const team = { rotation: [{ name: 'E' }] };
  const first = saveRotationVariant(team, 'Ouverture');
  assert.equal(first.name, 'Ouverture');
  team.rotation.push({ name: 'Q' });
  const second = saveRotationVariant(team, 'Recharge', '');
  assert.equal(team.rotationVariants.length, 2);
  assert.equal(second.actions.length, 2);
  assert.equal(selectRotationVariant(team, first.id), true);
  assert.deepEqual(team.rotation.map(row => row.name), ['E', 'Q']);
  team.rotation.push({ name: 'N' });
  assert.equal(selectRotationVariant(team, second.id), true);
  assert.deepEqual(team.rotation.map(row => row.name), ['E', 'Q']);
  assert.deepEqual(team.rotationVariants[0].actions.map(row => row.name), ['E', 'Q', 'N']);
  assert.equal(selectRotationVariant(team, ''), true);
  assert.deepEqual(team.rotation.map(row => row.name), ['E']);
});

test('renomme ou supprime une variante active sans perdre le brouillon manuel', () => {
  const team = { rotation: [{ name: 'E' }] };
  const variant = saveRotationVariant(team, 'Avant');
  team.rotation.push({ name: 'Q' });
  saveRotationVariant(team, 'Après', variant.id);
  assert.equal(team.rotationVariants.length, 1);
  assert.equal(team.rotationVariants[0].name, 'Après');
  assert.deepEqual(team.rotationVariants[0].actions.map(row => row.name), ['E', 'Q']);
  assert.equal(deleteRotationVariant(team, variant.id), true);
  assert.equal(team.activeRotationVariantId, '');
  assert.deepEqual(team.rotation.map(row => row.name), ['E']);
  assert.equal(deleteRotationVariant(team, 'missing'), false);
});
