import test from 'node:test';
import assert from 'node:assert/strict';
import { NOTE_TEMPLATES, noteTemplateContent, appendNoteTemplate } from '../src/note-templates.js';

test('note templates cover the common play-session records', () => {
  assert.deepEqual(Object.keys(NOTE_TEMPLATES), ['build', 'rotation', 'damage', 'character', 'farm']);
  assert.ok(NOTE_TEMPLATES.damage.body.includes('Buffs actifs'));
  assert.ok(NOTE_TEMPLATES.farm.body.includes('Quantité manquante'));
});

test('note template personalizes its title and safely ignores an unknown template', () => {
  assert.equal(noteTemplateContent('rotation', { character: 'Furina' }).title, 'Notes de rotation · Furina');
  assert.equal(noteTemplateContent('unknown'), null);
});

test('inserting a note template preserves existing notes without adding empty separators', () => {
  const text = NOTE_TEMPLATES.build.body;
  assert.equal(appendNoteTemplate('', text), text);
  assert.equal(appendNoteTemplate('Mes notes\n', text), `Mes notes\n\n${text}`);
  assert.equal(appendNoteTemplate('Mes notes', ''), 'Mes notes');
});
