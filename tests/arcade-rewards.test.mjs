import test from 'node:test';
import assert from 'node:assert/strict';
import { claimTetrisDailyReward, tetrisHapticPattern } from '../src/arcade-rewards.js';

test('Tetris grants five boosters only above 1,500 and only once per local day', () => {
  const initial = { bonus: 2, free: 3, tetrisRewardDay: '' };
  assert.equal(claimTetrisDailyReward(initial, 1500, '2026-11-15').awarded, false);
  const first = claimTetrisDailyReward(initial, 1501, '2026-11-15');
  assert.equal(first.awarded, true);
  assert.equal(first.amount, 5);
  assert.deepEqual(first.state, { bonus: 7, free: 3, tetrisRewardDay: '2026-11-15' });
  assert.equal(claimTetrisDailyReward(first.state, 9000, '2026-11-15').awarded, false);
  const nextDay = claimTetrisDailyReward(first.state, 1501, '2026-11-16');
  assert.equal(nextDay.state.bonus, 12);
  assert.equal(nextDay.state.free, 3);
  assert.equal(initial.tetrisRewardDay, '');
});

test('invalid scores or day keys never mint boosters', () => {
  for (const score of [NaN, Infinity, 'bad', 1200]) assert.equal(claimTetrisDailyReward({ bonus: 1 }, score, '2026-11-15').awarded, false);
  assert.equal(claimTetrisDailyReward({ bonus: 1 }, 5000, 'today').awarded, false);
});

test('Tetris propose des vibrations tactiles proportionnelles aux combos et aux événements',()=>{
 assert.deepEqual(tetrisHapticPattern('line-clear',0),[]);
 assert.deepEqual(tetrisHapticPattern('line-clear',1),[12]);
 assert.deepEqual(tetrisHapticPattern('line-clear',3),[24,18,36]);
 assert.deepEqual(tetrisHapticPattern('line-clear',4),[32,24,68]);
 assert.deepEqual(tetrisHapticPattern('special'),[18,24,42]);
 assert.deepEqual(tetrisHapticPattern('game-over'),[48,36,78]);
 assert.deepEqual(tetrisHapticPattern('other'),[]);
});
