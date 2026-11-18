import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeWishFunding } from '../src/wish-funding-projection.js';

const now = new Date(2026, 10, 16, 12);

test('projection combines only recorded primogems and wishes over the observed period', () => {
  const summary = summarizeWishFunding({
    history: [
      { date: '2026-11-14', primos: 320, count: 1 },
      { date: '2026-11-16', primos: 80, count: 2 },
      { date: '2026-11-17', primos: 9999, count: 10 },
    ],
    currentPrimos: 500,
    wishes: 3,
    characterPity: 70,
    characterGuarantee: true,
  }, now);

  assert.equal(summary.recorded, 880);
  assert.equal(summary.elapsed, 3);
  assert.equal(summary.dailyAverage, 293);
  assert.equal(summary.available, 980);
  assert.equal(summary.guaranteedPulls, 20);
  assert.equal(summary.remaining, 2220);
  assert.equal(summary.daysToGuarantee, 8);
  assert.equal(summary.days.length, 30);
});

test('no history never invents an income pace, while a covered guarantee needs no more primos', () => {
  const empty = summarizeWishFunding({ currentPrimos: 0, wishes: 0 }, now);
  assert.equal(empty.hasHistory, false);
  assert.equal(empty.dailyAverage, 0);
  assert.equal(empty.daysToGuarantee, null);

  const covered = summarizeWishFunding({ currentPrimos: 14400, characterPity: 0, characterGuarantee: true }, now);
  assert.equal(covered.remaining, 0);
  assert.equal(covered.daysToGuarantee, 0);
});

test('counts the radiance guarantee as one featured hard-pity ceiling', () => {
  const summary = summarizeWishFunding({ currentPrimos: 0, characterPity: 20, radiance: 3 }, now);
  assert.equal(summary.guaranteedPulls, 70);
});
