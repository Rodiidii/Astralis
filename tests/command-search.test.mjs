import test from 'node:test';
import assert from 'node:assert/strict';
import {commandSearchMatches,normalizeCommandSearch} from '../src/command-search.js';

test('normalise accents, ligatures et ponctuation pour les recherches françaises',()=>{
 assert.equal(normalizeCommandSearch('Vœux & objectifs'),'voeux objectifs');
 assert.equal(commandSearchMatches('Vœux & objectifs','voeux'),true);
 assert.equal(commandSearchMatches('Équipes · composition','equipes composition'),true);
});

test('accepte les recherches compactées et les mots partiels, sans faire de correspondance partielle erronée',()=>{
 assert.equal(commandSearchMatches('Honkai: Star Rail','starrail'),true);
 assert.equal(commandSearchMatches('Personnages · Genshin Impact','genshin pers'),true);
 assert.equal(commandSearchMatches('Personnages · Genshin Impact','star rail'),false);
 assert.equal(commandSearchMatches('N’importe quelle destination','   '),true);
});
