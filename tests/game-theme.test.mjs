import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [app, css, refresh, html, version] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../design-system.css', import.meta.url), 'utf8'),
  readFile(new URL('../global-refresh.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../VERSION', import.meta.url), 'utf8'),
]);

test('chaque jeu fournit son accent au thème global sans écraser un accent personnalisé', () => {
  assert.match(app, /const gameAccent=GAMES\[state\.game\]\?\.accent\|\|theme\.accent/);
  assert.match(app, /characterProfile\?\.accent\|\|prefs\.accent\|\|gameAccent/);
  assert.match(app, /prefs\.customAccent2\|\|characterProfile\?\.accent2\|\|gameAccent/);
  assert.match(app, /localStorage\.setItem\('astralis:active-game', state\.game\);applyPreferences\(\)/);
});

test('les fiches utilisent le thème du personnage, sinon celui du jeu actif', () => {
  assert.match(css, /--ds-game-accent:\s*var\(--game-accent,\s*var\(--accent\)\)/);
  assert.match(css, /\.app-frame\.character-themed\s*\{\s*--ds-page-accent:\s*var\(--theme-accent,\s*var\(--accent\)\)/);
  assert.match(css, /\.app-frame:not\(\.character-themed\).*--ds-page-accent/s);
});

test('le cache et les ressources de cette version sont identifiés pour le prochain lancement', () => {
  assert.match(html, /content="1\.0\.34"/);
  assert.equal(version.trim(), '1.0.34');
  assert.match(html, /design-system\.css\?v=20261108-c0-2/);
  assert.match(html, /global-refresh\.css\?v=20261108-global-1/);
  assert.match(refresh, /prefers-reduced-motion:\s*reduce/);
  assert.match(refresh, /--ds-card-radius:\s*var\(--card-radius/);
  assert.match(refresh, /\.workspace\s*\{[^}]*overflow:\s*auto/s);
  assert.match(html, /src\/design-system\.js\?v=20261108-c0-2/);
});
