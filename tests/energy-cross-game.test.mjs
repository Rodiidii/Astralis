import test from 'node:test';
import assert from 'node:assert/strict';
import { energyGameForecast, energyPortfolioForecast, energyMonthlyActivity } from '../src/energy-tracker.js';

test('energy selector asks for a stock that has not been entered', () => {
  assert.deepEqual(energyGameForecast('gi', null, 10_000), {
    current: null,
    max: 200,
    progress: 0,
    label: 'Saisis ton stock',
    state: 'setup',
  });
});

test('monthly activity keeps the exact actions for a day, sorted by time', () => {
  const now = new Date(2026, 10, 16, 12).getTime();
  const summary = energyMonthlyActivity({history:[
    {at:new Date(2026,10,16,11).getTime(),delta:-40,label:'Domaine'},
    {at:new Date(2026,10,16,9).getTime(),delta:60,label:'Récompense'},
    {at:new Date(2026,10,15,17).getTime(),delta:-20,label:'Boss'},
  ]},now);
  const today = summary.days.at(-1);
  assert.equal(today.key,'2026-11-16');
  assert.equal(today.spent,40);
  assert.equal(today.gained,60);
  assert.deepEqual(today.entries.map(entry=>entry.label),['Récompense','Domaine']);
  assert.equal(summary.days.at(-2).entries[0].label,'Boss');
});

test('energy selector estimates the next point and full reserve from the saved rate', () => {
  const forecast = energyGameForecast('hsr', { current: 299, max: 300, minutes: 6, updatedAt: 10_000 }, 10_000);
  assert.equal(forecast.current, 299);
  assert.equal(forecast.max, 300);
  assert.equal(forecast.progress, 99);
  assert.equal(forecast.label, '+1 dans 0 h 06 · plein 0 h 06');
  assert.equal(forecast.state, 'near-cap');
});

test('energy selector respects a custom cap and marks a full reserve', () => {
  const forecast = energyGameForecast('ww', { current: 250, max: 250, minutes: 12, updatedAt: 10_000 }, 10_000);
  assert.equal(forecast.current, 250);
  assert.equal(forecast.max, 250);
  assert.equal(forecast.progress, 100);
  assert.equal(forecast.label, 'Réserve pleine');
  assert.equal(forecast.state, 'full');
});

test('energy selector updates the time when regeneration has partially elapsed', () => {
  const forecast = energyGameForecast('gi', { current: 0, max: 200, minutes: 8, updatedAt: 10_000 }, 10_000 + 2 * 60_000);
  assert.equal(forecast.current, 0);
  assert.equal(forecast.progress, 0);
  assert.equal(forecast.label, '+1 dans 0 h 06 · plein 26 h 38');
  assert.equal(forecast.state, 'charging');
});

test('energy cards signalent le plafond avant qu’il soit atteint', () => {
  const near = energyGameForecast('gi', { current: 170, max: 200, minutes: 8, updatedAt: 10_000 }, 10_000);
  assert.equal(near.state, 'near-cap');
  const charging = energyGameForecast('gi', { current: 100, max: 200, minutes: 8, updatedAt: 10_000 }, 10_000);
  assert.equal(charging.state, 'charging');
});

test('la veille multi-univers classe la prochaine réserve pleine sans additionner les ressources', () => {
  const data = {
    gi: { current: 190, max: 200, minutes: 8, updatedAt: 10_000 },
    hsr: { current: 299, max: 300, minutes: 6, updatedAt: 10_000 },
    ww: { current: 240, max: 240, minutes: 6, updatedAt: 10_000 },
  };
  const snapshot = energyPortfolioForecast(data, 10_000);
  assert.equal(snapshot.configured, 3);
  assert.equal(snapshot.nearCap, 2);
  assert.equal(snapshot.full, 1);
  assert.deepEqual(snapshot.next, { id: 'hsr', name: 'Honkai: Star Rail', current: 299, max: 300, state: 'near-cap', fullInMs: 360_000 });
  assert.equal(energyPortfolioForecast({ gi: data.gi }, 10_000).configured, 1);
});
