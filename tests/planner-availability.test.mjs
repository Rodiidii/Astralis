import test from 'node:test';
import assert from 'node:assert/strict';
import { findNextAvailableSlot, normalizeAvailability } from '../src/planner-availability.js';

test('uses the configured opening time when the current day is free', () => {
  const slot = findNextAvailableSlot([], { startDate: '2026-11-15', startTime: '18:00', dailyMinutes: 120, slotMinutes: 30, nowMinute: 17 * 60 });
  assert.equal(slot.date, '2026-11-15');
  assert.equal(slot.startTime, '18:00');
  assert.equal(slot.endTime, '18:30');
});

test('places the session after dated objectives across all game profiles', () => {
  const tasks = [
    { game: 'gi', due: '2026-11-15', durationMinutes: 45, done: false },
    { game: 'hsr', due: '2026-11-15', durationMinutes: 30, done: false },
    { game: 'ww', due: '2026-11-15', durationMinutes: 15, done: true },
  ];
  const slot = findNextAvailableSlot(tasks, { startDate: '2026-11-15', startTime: '18:00', dailyMinutes: 120, slotMinutes: 30, defaultTaskMinutes: 30, nowMinute: 17 * 60 });
  assert.equal(slot.startTime, '19:15');
  assert.equal(slot.occupiedMinutes, 75);
  assert.equal(slot.taskCount, 2);
});

test('uses personal history estimates before fallback and advances when a day is full', () => {
  const tasks = [{ game: 'gi', due: '2026-11-15', title: 'Domaine', done: false }];
  const slot = findNextAvailableSlot(tasks, { startDate: '2026-11-15', startTime: '18:00', dailyMinutes: 60, slotMinutes: 30, defaultTaskMinutes: 30, nowMinute: 17 * 60, estimateTaskDuration: () => ({ minutes: 60, samples: 3 }) });
  assert.equal(slot.date, '2026-11-16');
  assert.equal(slot.startTime, '18:00');
});

test('accounts for the time already elapsed today and returns no slot outside the horizon', () => {
  const slot = findNextAvailableSlot([], { startDate: '2026-11-15', startTime: '18:00', dailyMinutes: 120, slotMinutes: 30, nowMinute: 20 * 60 });
  assert.equal(slot.date, '2026-11-16');
  assert.equal(findNextAvailableSlot([], { startDate: '2026-11-15', dailyMinutes: 30, slotMinutes: 60, horizonDays: 2 }), null);
});

test('normalizes invalid availability settings safely', () => {
  assert.deepEqual(normalizeAvailability({ startTime: '25:70', dailyMinutes: 900 }), { startTime: '18:00', dailyMinutes: 600 });
});
