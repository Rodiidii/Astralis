import test from 'node:test';
import assert from 'node:assert/strict';
import { makeNextRecurringTask, nextTaskDue, recurringTaskExists } from '../src/task-recurrence.js';

test('daily and weekly occurrences advance by calendar days', () => {
  assert.equal(nextTaskDue('2026-11-15', 'daily'), '2026-11-16');
  assert.equal(nextTaskDue('2026-11-15', 'weekly'), '2026-11-22');
});

test('monthly recurrence clamps month ends and respects leap years', () => {
  assert.equal(nextTaskDue('2026-01-31', 'monthly'), '2026-02-28');
  assert.equal(nextTaskDue('2028-01-31', 'monthly'), '2028-02-29');
  assert.equal(nextTaskDue('2026-12-31', 'monthly'), '2027-01-31');
  assert.equal(nextTaskDue(nextTaskDue('2026-01-31', 'monthly', 31), 'monthly', 31), '2026-03-31');
});

test('invalid dates and disabled recurrence do not create an occurrence', () => {
  assert.equal(nextTaskDue('', 'weekly'), '');
  assert.equal(nextTaskDue('2026-02-30', 'daily'), '');
  assert.equal(nextTaskDue('2026-11-15', ''), '');
});

test('next occurrence preserves task details while resetting checklist and completion state', () => {
  let id = 0;
  const task = { id: 'root', title: 'Farmer', game: 'gi', seriesId: 'root', due: '2026-11-15', recurrence: 'weekly', done: true, completedAt: 123, character: 'furina', priority: 'Haute', steps: [{ id: 'a', title: 'Résine', done: true }, { id: 'b', title: 'Boss', done: false }], _editing: true };
  const next = makeNextRecurringTask(task, '2026-11-22', () => `new-${++id}`);
  assert.equal(next.id, 'new-1');
  assert.equal(next.seriesId, 'root');
  assert.equal(next.game, 'gi');
  assert.equal(next.character, 'furina');
  assert.equal(next.priority, 'Haute');
  assert.equal(next.done, false);
  assert.equal(next.completedAt, null);
  assert.deepEqual(next.steps, [{ id: 'new-2', title: 'Résine', done: false }, { id: 'new-3', title: 'Boss', done: false }]);
  assert.equal('_editing' in next, false);
});

test('duplicate prevention is scoped to a series and exact due date', () => {
  const task = { id: 'root', seriesId: 'series-a' };
  const rows = [{ id: 'next', seriesId: 'series-a', due: '2026-11-22' }, { id: 'other', seriesId: 'series-b', due: '2026-11-22' }];
  assert.equal(recurringTaskExists(rows, task, '2026-11-22'), true);
  assert.equal(recurringTaskExists(rows, task, '2026-11-29'), false);
});
