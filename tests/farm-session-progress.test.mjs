import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionFarmSessions, setFarmSessionDone, setFarmSessionPersonDone, farmSessionPeopleState, farmSessionState } from '../src/farm-session-progress.js';

test('farm session completion persists and can be restored cleanly', () => {
  const rows = [{ id: 'one', date: '2026-11-15', title: 'Livres' }, { id: 'two', date: '2026-11-15', done: true }];
  const completed = setFarmSessionDone(rows, 'one', true, 1234);
  assert.equal(completed.completedAt, 1234);
  assert.equal(farmSessionState(completed), 'complete');
  assert.deepEqual(partitionFarmSessions(rows, '2026-11-15').pending.map(row => row.id), []);
  assert.deepEqual(partitionFarmSessions(rows, '2026-11-15').completed.map(row => row.id), ['one', 'two']);

  setFarmSessionDone(rows, 'one', false, 5678);
  assert.equal(rows[0].done, false);
  assert.equal(rows[0].completedAt, null);
  assert.equal(farmSessionState(rows[0]), 'planned');
  assert.deepEqual(partitionFarmSessions(rows, '2026-11-15').pending.map(row => row.id), ['one']);
});

test('farm completion ignores an unknown session id', () => {
  const rows = [{ id: 'known', done: false }];
  assert.equal(setFarmSessionDone(rows, 'missing', true), null);
  assert.equal(rows[0].done, false);
});

test('farm multi-personnage suit chaque personnage avant de terminer la session', () => {
  const rows = [{ id: 'team-farm', characterIds: ['furina', 'nahida'], done: false }];
  const people = [{ _id: 'furina', _name: 'Furina' }, { _id: 'nahida', _name: 'Nahida' }];
  setFarmSessionPersonDone(rows, 'team-farm', 'furina', true, 100);
  assert.deepEqual(farmSessionPeopleState(rows[0], people), {
    members: [{ id: 'furina', name: 'Furina', done: true }, { id: 'nahida', name: 'Nahida', done: false }],
    completed: 1, total: 2, complete: false,
  });
  assert.equal(rows[0].done, false);
  setFarmSessionPersonDone(rows, 'team-farm', 'nahida', true, 200);
  assert.equal(rows[0].done, true);
  assert.equal(rows[0].completedAt, 200);
  setFarmSessionPersonDone(rows, 'team-farm', 'furina', false, 300);
  assert.equal(rows[0].done, false);
  assert.equal(rows[0].completedAt, null);
  assert.equal(farmSessionPeopleState(rows[0], people).completed, 1);
});

test('terminer ou rétablir la session entière garde les sous-états cohérents', () => {
  const rows = [{ id: 'team-farm', characterIds: ['furina', 'nahida'], doneCharacters: ['furina'] }];
  setFarmSessionDone(rows, 'team-farm', true, 10);
  assert.deepEqual(rows[0].doneCharacters, ['furina', 'nahida']);
  setFarmSessionDone(rows, 'team-farm', false, 20);
  assert.deepEqual(rows[0].doneCharacters, []);
  assert.equal(farmSessionPeopleState(rows[0], [{ id: 'furina', name: 'Furina' }, { id: 'nahida', name: 'Nahida' }]).completed, 0);
});
