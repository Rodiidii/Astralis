import test from 'node:test';
import assert from 'node:assert/strict';
import { ENDGAME_CHECKLIST_KEY, ENDGAME_STARS_KEY, endgameEnemyId, endgameHalfId, endgameEncounterProgress, normalizeEndgameChecklist, normalizeEndgameStars, setEndgameHalfStars, toggleEndgameEnemy } from '../src/endgame-checklist.js';

test('checklist identity separates rotations, floors and halves', () => {
  const first = endgameEnemyId({ cycle: 'Bénédiction A', floor: '12', chamber: '1', half: 'Moitié 1', enemy: 'Tulpa' });
  const otherHalf = endgameEnemyId({ cycle: 'Bénédiction A', floor: '12', chamber: '1', half: 'Moitié 2', enemy: 'Tulpa' });
  const nextRotation = endgameEnemyId({ cycle: 'Bénédiction B', floor: '12', chamber: '1', half: 'Moitié 1', enemy: 'Tulpa' });
  assert.equal(ENDGAME_CHECKLIST_KEY, 'astralis:gi:endgame-checklist:v1');
  assert.notEqual(first, otherHalf);
  assert.notEqual(first, nextRotation);
  assert.equal(endgameEnemyId({ floor: '12', enemy: 'Tulpa' }), '');
});

test('endgame star score is scoped to rotation, floor, chamber and half', () => {
  const first = endgameHalfId({ cycle: 'A', floor: '12', chamber: '1', half: 'First' });
  const second = endgameHalfId({ cycle: 'A', floor: '12', chamber: '1', half: 'Second' });
  const otherRotation = endgameHalfId({ cycle: 'B', floor: '12', chamber: '1', half: 'First' });
  assert.equal(ENDGAME_STARS_KEY, 'astralis:gi:endgame-stars:v1');
  assert.notEqual(first, second);
  assert.notEqual(first, otherRotation);
  let state = setEndgameHalfStars({}, first, 3);
  state = setEndgameHalfStars(state, second, 2);
  assert.deepEqual(normalizeEndgameStars(state).scores, { [first]: 3, [second]: 2 });
  assert.deepEqual(normalizeEndgameStars({ scores: { [first]: 9, '': 2, bad: -4 } }).scores, { [first]: 3, bad: 0 });
  assert.equal(setEndgameHalfStars(state, first, 0).scores[first], 0);
  assert.equal(endgameHalfId({ floor: '12' }), '');
});

test('checklist toggles persist as unique defeated enemies and report half progress', () => {
  const a = 'rotation::12::1::Moitié 1::Tulpa';
  const b = 'rotation::12::1::Moitié 1::Agent';
  let state = toggleEndgameEnemy({}, a, true);
  state = toggleEndgameEnemy(state, a, true);
  assert.deepEqual(normalizeEndgameChecklist(state).defeated, [a]);
  assert.deepEqual(endgameEncounterProgress([a, b], state), { total: 2, done: 1, remaining: 1, percent: 50 });
  state = toggleEndgameEnemy(state, a, false);
  assert.deepEqual(endgameEncounterProgress([a, b], state), { total: 2, done: 0, remaining: 2, percent: 0 });
});
