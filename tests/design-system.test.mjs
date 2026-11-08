import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [js, css] = await Promise.all([
  readFile(new URL('../src/design-system.js', import.meta.url), 'utf8'),
  readFile(new URL('../design-system.css', import.meta.url), 'utf8'),
]);

test('la navigation rapide est accessible au clavier et tolère les accents', () => {
  assert.match(js, /event\.ctrlKey\s*\|\|\s*event\.metaKey/);
  assert.match(js, /event\.key\.toLowerCase\(\)\s*===\s*'k'/);
  assert.match(js, /normalize\('NFD'\)/);
  assert.match(js, /event\.key\s*!==\s*'Enter'/);
});

test('les groupes de navigation sont repliables et accessibles', () => {
  assert.match(js, /createElement\('details'\)/);
  assert.match(js, /createElement\('summary'\)/);
  assert.match(js, /group\.open\s*=\s*true/);
  assert.match(css, /\.rail-group>summary/);
});

test('les quatre familles de gabarits sont affectées aux routes', () => {
  for (const template of ['detail', 'dashboard', 'catalog', 'tool']) {
    assert.ok(js.includes(`'${template}'`), `gabarit absent : ${template}`);
  }
  assert.match(js, /host\.dataset\.template/);
});

test('les fiches gardent le défilement tactile et bloquent le fond', () => {
  assert.match(css, /overscroll-behavior:\s*contain/);
  assert.match(css, /touch-action:\s*pan-y/);
  assert.match(css, /html\.astralis-modal-open,html\.astralis-modal-open body\s*\{\s*overflow:\s*hidden/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
