import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [app, css, refresh, characterPolish, html, version] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../design-system.css', import.meta.url), 'utf8'),
  readFile(new URL('../global-refresh.css', import.meta.url), 'utf8'),
  readFile(new URL('../character-polish.css', import.meta.url), 'utf8'),
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
  assert.match(html, /content="1\.0\.42"/);
  assert.equal(version.trim(), '1.0.42');
  assert.match(html, /design-system\.css\?v=20261108-c0-2/);
  assert.match(html, /global-refresh\.css\?v=20261108-global-1/);
  assert.match(refresh, /prefers-reduced-motion:\s*reduce/);
  assert.match(refresh, /--ds-card-radius:\s*var\(--card-radius/);
  assert.match(refresh, /\.workspace\s*\{[^}]*overflow:\s*auto/s);
  assert.match(html, /src\/design-system\.js\?v=20261108-c0-2/);
  assert.match(html, /character-polish\.css\?v=20261108-build-guides-1/);
  assert.match(html, /src\/app\.js\?v=20261108-build-guides-1/);
});

test('les cartes Genshin cadrent le splash et affichent le nom avec les icônes élément et arme', () => {
  assert.doesNotMatch(app, /character-card-avatar/);
  assert.match(app, /character-name-caption.*character-card-emblems/s);
  assert.match(app, /giElementIcon\(badge\)/);
  assert.match(app, /giWeaponTypeIcon\(item\.weaponText\|\|item\.weapon\|\|item\.type\)/);
  assert.match(characterPolish, /\.character-catalog-grid \.genshin-card\.archive-card \.art-frame\.unit-cinematic \.unit-portrait/);
  assert.match(characterPolish, /transform: scale\(max\(1\.24,/);
  assert.match(characterPolish, /height: clamp\(340px, 31vw, 452px\)/);
  assert.match(characterPolish, /\.character-catalog-grid \.genshin-card\.archive-card \.art-frame\.unit-cinematic \.character-name-caption/);
  assert.match(characterPolish, /filter: none !important/);
  assert.match(characterPolish, /\.character-catalog-grid \.genshin-card\.archive-card \{ padding: 0 !important; \}/);
  assert.match(characterPolish, /\.character-catalog-grid \.genshin-card\.archive-card \.art-frame\.unit-cinematic\s*\{[^}]*overflow: hidden/s);
  assert.match(characterPolish, /\.unit-portrait\s*\{[^}]*max-width: none !important/s);
  assert.match(characterPolish, /data-item-category="weapon"\][\s\S]*?height: clamp\(205px, 19vw, 278px\)/);
  assert.match(characterPolish, /data-item-category="artifact"\][\s\S]*?object-fit: contain/);
  assert.match(characterPolish, /\.collection-bar\.character-catalog-toolbar[\s\S]*?grid-template-columns: max-content minmax\(0, 1fr\)/);
  assert.match(characterPolish, /@media \(max-width: 1500px\)[\s\S]*?\.character-catalog-toolbar \.collection-controls \{ overflow-x: auto/);
});


test('Genshin portraits fill their entire card and weapon detail has a type icon', () => {
  assert.match(characterPolish, /\.character-catalog-grid > \.genshin-card\.archive-card > \.art-frame\.unit-cinematic\s*\{[^}]*width: calc\(100% \+ 2px\)[^}]*margin: 0 -1px/s);
  assert.match(characterPolish, /\.art-frame\.unit-cinematic > \.unit-portrait\s*\{[^}]*object-fit: cover !important/s);
  assert.match(app, /weaponTypeIcon = weaponType \? giWeaponTypeIcon\(weaponType\)/);
  assert.match(app, /detail-weapon-type-icon/);
});
