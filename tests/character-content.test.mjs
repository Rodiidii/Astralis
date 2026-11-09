import assert from 'node:assert/strict';
import test from 'node:test';
import { renderGameText, skillValuesAtLevel, talentValuesAtLevel } from '../src/character-content.js';

test('les descriptions de kit rendent les couleurs et retours à la ligne sans exécuter de balise arbitraire', () => {
  const html = renderGameText('<color=#FFD780>Attaque normale</color>\\n<script>alert(1)</script>');
  assert.equal(html, '<span style="color:#FFD780">Attaque normale</span><br>&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('les valeurs de multiplicateur proviennent du niveau 10 uniquement', () => {
  const values = talentValuesAtLevel({ 'DGT 1er coup': Array.from({ length: 15 }, (_, index) => `${index + 1}%`) });
  assert.deepEqual(values, ['DGT 1er coup · Niv. 10 : 10%']);
});


test('les tags LINK de Lunaris deviennent du texte lisible sans balisage brut', () => {
  assert.equal(renderGameText('Révèle {LINK#N11490001}Transcendance{/LINK}, puis inflige des DGT.'), 'Révèle Transcendance, puis inflige des DGT.');
});

test('les multiplicateurs Lunaris issus des paramètres affichent uniquement le niveau 10', () => {
  const skill = { attributes: { labels: ['DGT 1er coup'], parameters: { param1: Array.from({ length: 15 }, (_, index) => `${index + 1}%`) } } };
  assert.deepEqual(skillValuesAtLevel(skill), ['DGT 1er coup · Niv. 10 : 10%']);
});

test('le formatage gère paragraphes, alpha, styles et paramètres de niveau', () => {
  const source = '<color=#FFD780FF>Attaque normale</color>\\nEnchaîne.\\n\\n<b>Puissance</b> : {param1:F1P}';
  const html = renderGameText(source, { level: 10, parameters: { param1: Array.from({ length: 15 }, (_, i) => (i + 1) / 100) } });
  assert.equal(html, '<span style="color:#FFD780FF">Attaque normale</span><br>Enchaîne.<br><br><b>Puissance</b> : 10,0%');
  assert.doesNotMatch(html, /<color|\\\\n|\{param/i);
});

test('les balises autorisées restent sûres et les balises inconnues sont échappées', () => {
  const html = renderGameText('<i>italique</i> <u>souligné</u> <size=999>grand</size> <sprite=ElementPyro> <img src=x onerror=alert(1)>');
  assert.equal(html, '<i>italique</i> <u>souligné</u> <span style="font-size:48px">grand</span> <span class="game-sprite" role="img" aria-label="ElementPyro">✦</span> &lt;img src=x onerror=alert(1)&gt;');
  assert.doesNotMatch(html, /<img/i);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/i);
});

test('un paramètre inconnu ne laisse pas une séquence brute dans le texte', () => {
  assert.equal(renderGameText('DGT {PARAM_INCONNU:F1P}'), 'DGT —');
});

test('les sprites nommés et les paramètres déjà exprimés en pourcentage sont rendus correctement', () => {
  const html = renderGameText('<sprite name=ElementPyro> {param1:F1P}', { parameters: { param1: ['12.5%'] } });
  assert.equal(html, '<span class="game-sprite" role="img" aria-label="ElementPyro">✦</span> 12,5%');
});
