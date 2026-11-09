import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DEFAULT_IMPORT_SOURCES, validateImportSources } from '../src/import-sources.js';

test('le manifeste public versionné passe la validation', async () => {
  const manifest=JSON.parse(await readFile(new URL('../import-sources.json',import.meta.url),'utf8'));
  assert.deepEqual(validateImportSources(manifest),DEFAULT_IMPORT_SOURCES);
});
test('la configuration refuse une origine inconnue et un chemin hors catalogue', () => {
  const badOrigin=structuredClone(DEFAULT_IMPORT_SOURCES);badOrigin.games.gi.lunaris.versionUrl='https://attacker.invalid/version.json';
  assert.throws(()=>validateImportSources(badOrigin),/non autorisée/);
  const badPath=structuredClone(DEFAULT_IMPORT_SOURCES);badPath.games.hsr.catalogBase='/data/../../private';
  assert.throws(()=>validateImportSources(badPath),/chemin local invalide/);
});
test('le modèle Lunaris exige ses deux paramètres de chemin', () => {
  const bad=structuredClone(DEFAULT_IMPORT_SOURCES);bad.games.gi.lunaris.dataTemplate='https://api.lunaris.moe/data/{version}/charlist.json';
  assert.throws(()=>validateImportSources(bad),/\{file\}/);
});
test('la synchronisation automatique est plafonnée à six heures et journalisée', async () => {
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const data=await readFile(new URL('../src/data.js',import.meta.url),'utf8');
  assert.match(app,/const DATA_AUTO_SYNC_INTERVAL=6\*60\*60\*1000/);
  assert.match(app,/dataSyncLog\(\)/);
  assert.match(data,/const DATA_REFRESH_INTERVAL = 6 \* 60 \* 60 \* 1000/);
  assert.match(data,/catalogue|catalog/i);
});
