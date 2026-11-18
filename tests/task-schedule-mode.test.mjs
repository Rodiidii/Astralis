import test from 'node:test';
import assert from 'node:assert/strict';
import { canAutoScheduleTask, compareTaskScheduleMode, normalizeTaskScheduleMode, taskScheduleModeLabel } from '../src/task-schedule-mode.js';

test('les modes reconnus gardent leur choix et les anciennes tâches restent flexibles', () => {
  assert.equal(normalizeTaskScheduleMode('fixed'), 'fixed');
  assert.equal(normalizeTaskScheduleMode('optional'), 'optional');
  assert.equal(normalizeTaskScheduleMode('unknown'), 'flexible');
  assert.equal(taskScheduleModeLabel('fixed'), 'Fixe');
  assert.equal(taskScheduleModeLabel('optional'), 'Optionnelle');
});

test('seules les tâches ouvertes fixes sont écartées du déplacement automatique', () => {
  assert.equal(canAutoScheduleTask({ done: false, scheduleMode: 'fixed' }), false);
  assert.equal(canAutoScheduleTask({ done: false, scheduleMode: 'optional' }), true);
  assert.equal(canAutoScheduleTask({ done: false }), true);
  assert.equal(canAutoScheduleTask({ done: true, scheduleMode: 'flexible' }), false);
});

test('les tâches flexibles passent avant les tâches optionnelles', () => {
  assert.ok(compareTaskScheduleMode({ scheduleMode: 'flexible' }, { scheduleMode: 'optional' }) < 0);
  assert.equal(compareTaskScheduleMode({ scheduleMode: 'flexible' }, {}), 0);
});
