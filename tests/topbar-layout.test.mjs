import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const [app, css, html] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles/topbar-resources.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
]);

test('les ressources suivent les actions, restent à droite avant le profil et sont dynamiques par jeu', () => {
  assert.match(app, /<div class="topbar-resources"[^>]*>\$\{topbarResources\(state\.game\)\}<\/div><button class="topbar-profile"/);
  assert.match(app, /if\(game==='gi'\)/);
  assert.match(app, /if\(game==='hsr'\)/);
  assert.match(css, /\.topbar-resources\s*\{[^}]*margin-left:\s*auto/s);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
});

test('les compteurs sont compactables et défilables sur mobile sans recouvrir le profil', async () => {
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.topbar-actions\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media\s*\(max-width:\s*420px\)/);
  assert.match(app, /currency-genshin-primogem\.png/);
  assert.match(app, /currency-genshin-resin\.png/);
  await Promise.all(['currency-genshin-primogem.png','currency-genshin-resin.png','currency-genshin-fate.png','currency-starrail-jade.png','currency-starrail-pass.png','currency-starrail-special-pass.png'].map(file => access(new URL(`../assets/ui/${file}`, import.meta.url))));
});
