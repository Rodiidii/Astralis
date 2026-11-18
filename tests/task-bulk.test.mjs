import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTaskSelection, selectVisibleTasks, selectedOpenTasks, taskBulkSchedule } from '../src/task-bulk.js';

test('la sélection visible s’ajoute sans effacer les sélections hors filtre', () => {
  assert.deepEqual(selectVisibleTasks(['hidden'], ['a', 'b'], true), ['hidden', 'a', 'b']);
  assert.deepEqual(selectVisibleTasks(['hidden', 'a', 'b'], ['a', 'b'], false), ['hidden']);
});

test('la sélection se déduplique et ignore les objectifs supprimés', () => {
  assert.deepEqual(normalizeTaskSelection(['a', 'a', 'missing', 2], [{ id: 'a' }, { id: 2 }]), ['a', '2']);
});

test('les actions groupées ignorent les tâches terminées et refusent une date invalide', () => {
  const rows = [{ id: 'open', game: 'gi', done: false }, { id: 'done', game: 'gi', done: true }];
  assert.deepEqual(selectedOpenTasks(rows, ['open', 'done']).map(task => task.id), ['open']);
  assert.deepEqual(taskBulkSchedule(rows, ['open', 'done'], '2026-11-16'), [{ id: 'open', game: 'gi', due: '2026-11-16' }]);
  assert.deepEqual(taskBulkSchedule(rows, ['open'], '2026-02-30'), []);
});
