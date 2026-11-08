import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [worker, html, css] = await Promise.all([
  readFile(new URL('../sw.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../team-layout-fix.css', import.meta.url), 'utf8'),
]);

test('le service worker renouvelle le shell et précharge le style des équipes', () => {
  assert.match(worker, /astralis-shell-v30/);
  assert.match(worker, /'\/team-layout-fix\.css'/);
  assert.match(worker, /'\/design-system\.css'/);
  assert.match(worker, /'\/topbar-resources\.css'/);
  assert.match(worker, /'\/src\/wish-pulls\.js'/);
});

test('les ressources versionnées sont cherchées exactement avant le repli hors ligne', () => {
  assert.match(worker, /caches\.match\(req\)\.then/);
  assert.match(worker, /\.catch\(\(\)=>caches\.match\(req,\{ignoreSearch:true\}\)\)/);
  assert.doesNotMatch(worker, /caches\.match\(req,\{ignoreSearch:true\}\)\.then/);
});

test('l’index force le rechargement du CSS d’équipe et de son module', () => {
  assert.match(html, /team-layout-fix\.css\?v=20261108-team-compact-roster-4/);
  assert.match(html, /src\/app\.js\?v=20261108-topbar-team-wishes-1/);
});

test('les équipes gardent une grille de portraits et une disposition adaptative', () => {
  assert.match(css, /\.teams-stack \.team-roster\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /grid-template-columns:\s*repeat\(4,/);
  assert.match(css, /@media\s*\(max-width:\s*650px\)/);
  assert.match(css, /#app \.teams-stack \.team-sheet-details\[hidden\]\s*\{\s*display:\s*none\s*!important/s);
});
