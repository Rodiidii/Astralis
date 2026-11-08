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
