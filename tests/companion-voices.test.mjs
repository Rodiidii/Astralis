import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { characterNudge } from '../src/assistant.js';

test('les profils de compagnons servent des répliques propres au personnage', async () => {
  const folder = new URL('../companions/gi/', import.meta.url);
  const files = await readdir(folder);
  const lines = new Set();
  for (const file of files) {
    const profile = JSON.parse(await readFile(new URL(file, folder), 'utf8'));
    for (const bank of Object.values(profile.situations)) {
      assert.ok(bank.length);
      for (const line of bank) {
        assert.ok(!lines.has(line), line);
        assert.doesNotMatch(line, /[<>{}]/);
        lines.add(line);
      }
    }
    for (const situation of ['morning', 'evening']) {
      assert.equal(characterNudge({name: profile.slug}, {situation}), profile.situations[situation][0]);
    }
  }
  assert.equal(files.length, 15);
});
