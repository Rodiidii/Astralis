import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTaskFocusDraft } from '../src/task-focus-bridge.js';

test('transfers an open task into a bounded focus session draft', () => {
  const draft = buildTaskFocusDraft({
    id: 8, title: 'Préparer Furina', category: 'Build', character: 14, characterName: 'Furina',
    done: false,
    steps: [
      { id: 'done', title: 'Vérifier l’arme', done: true },
      { id: 'relics', title: 'Comparer les reliques', done: false },
      { id: 'result', title: 'Enregistrer le résultat', done: false },
    ],
  }, 'gi');
  assert.deepEqual(draft, {
    id: '8', game: 'gi', mode: 'build', title: 'Préparer Furina',
    characterId: '14', characterName: 'Furina',
    tasks: ['Comparer les reliques', 'Enregistrer le résultat'],
    stepLinks: [{ id: 'relics', title: 'Comparer les reliques' }, { id: 'result', title: 'Enregistrer le résultat' }],
  });
});

test('rejects completed, empty, and unsupported task sources', () => {
  assert.equal(buildTaskFocusDraft({ title: 'Fait', done: true }, 'gi'), null);
  assert.equal(buildTaskFocusDraft({ title: '  ' }, 'gi'), null);
  assert.equal(buildTaskFocusDraft({ title: 'Objectif' }, 'unknown'), null);
});

test('maps common objective categories and caps transferred steps', () => {
  assert.equal(buildTaskFocusDraft({ title: 'Boss', category: 'Endgame' }, 'hsr').mode, 'boss');
  const steps = Array.from({ length: 20 }, (_, index) => ({ title: `Étape ${index + 1}`, done: false }));
  assert.equal(buildTaskFocusDraft({ title: 'Tour', category: 'Exploration', steps }, 'ww').tasks.length, 12);
});
