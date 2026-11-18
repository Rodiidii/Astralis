import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFocusWeek, buildFocusActivitySummary, focusSessionStreak, focusWeeklyGoalProgress, focusWeeklySessionGoalProgress, normalizeFocusWeeklyGoal, normalizeFocusWeeklySessionGoal, renderFocusStation, focusHistoryPeriodMatches, summarizeFocusHistory } from '../src/focus-station.js';

test('focus week summarizes seven local days and scales bars to the busiest day', () => {
  const at = new Date(2026, 10, 15, 15).getTime();
  const rows = [
    { endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 90 * 60_000 },
    { endedAt: new Date(2026, 10, 15, 14).getTime(), durationMs: 30 * 60_000 },
    { endedAt: new Date(2026, 10, 13, 12).getTime(), durationMs: 30 * 60_000 },
    { endedAt: new Date(2026, 10, 8, 12).getTime(), durationMs: 9_000_000 },
  ];
  const week = buildFocusWeek(rows, at);
  assert.equal(week.length, 7);
  assert.equal(week[0].day, '2026-11-09');
  assert.deepEqual({ day: week.at(-1).day, minutes: week.at(-1).minutes, sessions: week.at(-1).sessions, today: week.at(-1).today, level: week.at(-1).level }, { day: '2026-11-15', minutes: 120, sessions: 2, today: true, level: 4 });
  assert.equal(week[4].minutes, 30);
  assert.equal(week[4].level, 1);
});

test('weekly focus goal reports remaining time, completion and a capped progress bar', () => {
  const at = new Date(2026, 10, 15, 15).getTime();
  const rows = [
    { endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 90 * 60_000 },
    { endedAt: new Date(2026, 10, 13, 12).getTime(), durationMs: 30 * 60_000 },
  ];
  assert.deepEqual(focusWeeklyGoalProgress(rows, 180, at), { minutes: 120, target: 180, remaining: 60, percent: 67, complete: false });
  assert.deepEqual(focusWeeklyGoalProgress(rows, 90, at), { minutes: 120, target: 90, remaining: 0, percent: 100, complete: true });
  assert.equal(focusWeeklyGoalProgress([], 180, at).percent, 0);
});

test('weekly focus goal accepts bounded 15-minute increments', () => {
  assert.equal(normalizeFocusWeeklyGoal(74), 75);
  assert.equal(normalizeFocusWeeklyGoal(0), 30);
  assert.equal(normalizeFocusWeeklyGoal(99999), 1800);
  assert.equal(normalizeFocusWeeklyGoal('invalid'), 180);
});

test('weekly focus goal can target completed sessions with a bounded count', () => {
  const at = new Date(2026, 10, 15, 15).getTime();
  const rows = [
    { endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 45 * 60_000 },
    { endedAt: new Date(2026, 10, 13, 12).getTime(), durationMs: 30 * 60_000 },
  ];
  assert.deepEqual(focusWeeklySessionGoalProgress(rows, 5, at), { sessions: 2, target: 5, remaining: 3, percent: 40, complete: false });
  assert.deepEqual(focusWeeklySessionGoalProgress(rows, 2, at), { sessions: 2, target: 2, remaining: 0, percent: 100, complete: true });
  assert.equal(focusWeeklySessionGoalProgress([], 5, at).percent, 0);
  assert.equal(normalizeFocusWeeklySessionGoal(0), 1);
  assert.equal(normalizeFocusWeeklySessionGoal(44), 30);
  assert.equal(normalizeFocusWeeklySessionGoal('invalid'), 5);
});

test('focus history period filters use local calendar days and summarize completion', () => {
  const at = new Date(2026, 10, 16, 12).getTime();
  const rows = [
    { endedAt: new Date(2026, 10, 16, 10).getTime(), durationMs: 30 * 60_000, done: 2, total: 2 },
    { endedAt: new Date(2026, 10, 9, 10).getTime(), durationMs: 60 * 60_000, done: 1, total: 2 },
    { endedAt: new Date(2026, 9, 1, 10).getTime(), durationMs: 15 * 60_000, done: 0, total: 1 },
  ];
  assert.deepEqual(rows.map(row => focusHistoryPeriodMatches(row, '7d', at)), [true, false, false]);
  assert.deepEqual(rows.map(row => focusHistoryPeriodMatches(row, '30d', at)), [true, true, false]);
  assert.deepEqual(summarizeFocusHistory(rows.slice(0, 2)), { sessions: 2, durationMs: 90 * 60_000, averageMs: 45 * 60_000, completion: 75 });
  assert.deepEqual(summarizeFocusHistory([]), { sessions: 0, durationMs: 0, averageMs: 0, completion: 0 });
});

test('weekly activity breakdown groups valid sessions and excludes older or empty rows', () => {
  const at = new Date(2026, 10, 15, 15).getTime();
  const rows = [
    { mode: 'farm', endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 45 * 60_000 },
    { mode: 'farm', endedAt: new Date(2026, 10, 13, 12).getTime(), durationMs: 15 * 60_000 },
    { mode: 'build', endedAt: new Date(2026, 10, 14, 12).getTime(), durationMs: 30 * 60_000 },
    { mode: 'boss', endedAt: new Date(2026, 10, 8, 12).getTime(), durationMs: 60 * 60_000 },
    { mode: 'unknown', endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 60 * 60_000 },
    { mode: 'team', endedAt: new Date(2026, 10, 15, 12).getTime(), durationMs: 0 },
  ];
  assert.deepEqual(buildFocusActivitySummary(rows, at), [
    { mode: 'farm', icon: '⌖', label: 'Farm', minutes: 60, sessions: 2, progress: 100 },
    { mode: 'build', icon: '◇', label: 'Build', minutes: 30, sessions: 1, progress: 50 },
  ]);
  assert.deepEqual(buildFocusActivitySummary([], at), []);
  assert.match(renderFocusStation('gi'), /Activité des sept derniers jours/);
  assert.match(renderFocusStation('gi'), /apparaîtront après ta première session terminée/);
});

test('focus streak counts consecutive local days and keeps the current streak alive through today', () => {
  const at = new Date(2026, 10, 15, 15).getTime(), row = day => ({ endedAt: new Date(`${day}T12:00:00`).getTime(), durationMs: 60_000 });
  assert.deepEqual(focusSessionStreak([row('2026-11-10'), row('2026-11-11'), row('2026-11-12'), row('2026-11-14'), row('2026-11-16'), { endedAt: at, durationMs: 0 }], at), { current: 1, best: 3, activeToday: false, activeDays: 4 });
  assert.deepEqual(focusSessionStreak([row('2026-11-14'), row('2026-11-15')], at), { current: 2, best: 2, activeToday: true, activeDays: 2 });
  assert.deepEqual(focusSessionStreak([], at), { current: 0, best: 0, activeToday: false, activeDays: 0 });
});


