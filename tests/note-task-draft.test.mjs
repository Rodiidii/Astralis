import test from 'node:test';
import assert from 'node:assert/strict';
import { noteTaskDraft } from '../src/note-task-draft.js';

test('a farm note becomes an editable task with its character and marked checklist', () => {
  let id = 0;
  const draft = noteTaskDraft({ id: 'note-1', title: 'Farm de Furina', tag: 'Farm', target: 'furina-id', targetName: 'Furina', body: 'Domaine conseillé\n- Récupérer les récompenses\n[x] Vérifier le stock\nUne remarque libre' }, 'gi', () => `step-${++id}`);
  assert.equal(draft.game, 'gi');
  assert.equal(draft.title, 'Farm de Furina');
  assert.equal(draft.category, 'Matériaux');
  assert.equal(draft.character, 'furina-id');
  assert.equal(draft.characterName, 'Furina');
  assert.equal(draft.sourceNoteId, 'note-1');
  assert.deepEqual(draft.steps, [
    { id: 'step-1', title: 'Récupérer les récompenses', done: false },
    { id: 'step-2', title: 'Vérifier le stock', done: true }
  ]);
});

test('note conversion ignores free prose, caps checklist length and rejects unsupported games', () => {
  let id = 0;
  const note = { title: '', body: Array.from({ length: 24 }, (_, index) => `- Étape ${index + 1}`).join('\n') };
  const draft = noteTaskDraft(note, 'ww', () => `id-${++id}`);
  assert.equal(draft.title, 'Suivre cette note');
  assert.equal(draft.category, 'Autre');
  assert.equal(draft.steps.length, 20);
  assert.equal(noteTaskDraft(note, 'pokemon'), null);
});
