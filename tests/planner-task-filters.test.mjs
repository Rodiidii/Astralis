import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlannerTasks, normalizePlannerTaskFilters, plannerCharacterFilterKey, plannerTaskFilterOptions } from '../src/planner-task-filters.js';

const tasks = [
  { id: 'a', game: 'gi', title: 'Artefacts', category: 'Build', character: 'furina', characterName: 'Furina' },
  { id: 'b', game: 'hsr', title: 'Cavernes', category: 'Build', character: 'robin', characterName: 'Robin' },
  { id: 'c', game: 'gi', title: 'Boss', category: 'Combat', character: 'furina', characterName: 'Furina' },
  { id: 'd', game: 'ww', title: 'Exploration', category: '', characterName: 'Jinhsi' },
];

test('filters tasks by game, category and character at the same time', () => {
  assert.deepEqual(filterPlannerTasks(tasks, { game: 'gi', category: 'Build', character: 'gi:furina' }).map(task => task.id), ['a']);
});

test('keeps character identities separate across game rosters', () => {
  const sameName = [{ game: 'gi', character: 'rover', characterName: 'Rover' }, { game: 'ww', character: 'rover', characterName: 'Rover' }];
  assert.equal(plannerCharacterFilterKey(sameName[0]), 'gi:rover');
  assert.deepEqual(filterPlannerTasks(sameName, { character: 'ww:rover' }), [sameName[1]]);
});

test('builds sorted, unique filter options and labels category-less tasks', () => {
  const options = plannerTaskFilterOptions(tasks);
  assert.deepEqual(options.categories, ['Autre', 'Build', 'Combat']);
  assert.deepEqual(options.characters.map(person => person.name), ['Furina', 'Jinhsi', 'Robin']);
});

test('normalizes invalid filter values and leaves the full task list visible', () => {
  assert.deepEqual(normalizePlannerTaskFilters({ game: 'unknown', category: '', character: '' }), { game: 'all', category: 'all', character: 'all' });
  assert.equal(filterPlannerTasks(tasks, {}).length, tasks.length);
});
