import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { normalizeGoodArtifact } from '../src/artifact-model.js';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('les anciennes reliques importées sont normalisées avant affichage et sélection', () => {
  const start = source.indexOf('function giReadOwnedArtifacts()');
  const end = source.indexOf('\nfunction ', start + 12);
  const body = source.slice(start, end);
  const stored = [{ id: 'old-good-goblet', setKey: '15040', slot: 'goblet', rarity: 5, level: 20, mainType: 'cryoDmg', mainValue: 46.6, substats: [] }];
  const context = {
    localStorage: { getItem: () => JSON.stringify(stored) },
    normalizeGoodArtifact,
    GI_GOOD_INVENTORY_KEY: 'astralis:gi:owned-artifacts',
  };
  vm.createContext(context);
  vm.runInContext(body, context);
  const rows = context.giReadOwnedArtifacts();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].slotIndex, 3);
  assert.equal(rows[0].slot, 'goblet');
});
