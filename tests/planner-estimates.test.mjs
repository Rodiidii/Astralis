import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePlannerTaskDuration, summarizePlannerDayDuration, formatPlannerDuration } from '../src/planner-estimates.js';

test('estimation uses only the same game and normalized task title, with a robust median', () => {
  const history = [
    { game: 'gi', title: 'Farm de livres', durationMs: 20 * 60_000 },
    { game: 'gi', title: '  FARM   DE LIVRES ', durationMs: 32 * 60_000 },
    { game: 'gi', title: 'Farm de livres', durationMs: 9 * 60 * 60_000 },
    { game: 'hsr', title: 'Farm de livres', durationMs: 6 * 60_000 },
    { game: 'gi', title: 'Autre objectif', durationMs: 12 * 60_000 },
  ];
  assert.deepEqual(estimatePlannerTaskDuration({ game: 'gi', title: 'Farm de livres' }, history), { minutes: 32, samples: 3 });
});

test('no estimate is shown without an exact personal match or for invalid samples', () => {
  assert.equal(estimatePlannerTaskDuration({ game: 'gi', title: 'Farm' }, []), null);
  assert.equal(estimatePlannerTaskDuration({ game: 'gi', title: 'Farm' }, [{ game: 'hsr', title: 'Farm', durationMs: 600_000 }]), null);
  assert.equal(estimatePlannerTaskDuration({ game: 'gi', title: 'Farm' }, [{ game: 'gi', title: 'Farm', durationMs: 10_000 }]), null);
});

test('day total combines entered durations, personal estimates and a clear fallback for open tasks', () => {
  const history = [
    { game: 'gi', title: 'Domaine', durationMs: 25 * 60_000 },
    { game: 'gi', title: 'Boss', durationMs: 40 * 60_000 },
  ];
  const summary = summarizePlannerDayDuration([
    { game: 'gi', title: 'Domaine' },
    { game: 'gi', title: 'Boss' },
    { game: 'ww', title: 'Durée indiquée', durationMinutes: 18 },
    { game: 'gi', title: 'Déjà fini', done: true },
    { game: 'hsr', title: 'Sans repère' },
  ], history);
  assert.deepEqual(summary, { minutes: 113, knownMinutes: 83, estimated: 2, explicit: 1, unknown: 1, open: 4, complete: false });
  assert.deepEqual(summarizePlannerDayDuration([{ game: 'gi', title: 'Fait', done: true }], history), { minutes: 0, knownMinutes: 0, estimated: 0, explicit: 0, unknown: 0, open: 0, complete: false });
});

test('duration labels remain compact and readable', () => {
  assert.equal(formatPlannerDuration(48), '48 min');
  assert.equal(formatPlannerDuration(60), '1 h');
  assert.equal(formatPlannerDuration(125), '2 h 05');
});
