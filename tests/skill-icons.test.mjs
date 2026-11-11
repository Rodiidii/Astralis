import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTER_SKILL_ICONS} from '../src/character-skill-icons.js';
import {skillList} from '../src/data.js';
test('les icônes locales existent et correspondent aux trois talents sourcés de Skirk et Furina',()=>{
 assert.ok(Object.keys(CHARACTER_SKILL_ICONS).length>=100);
 assert.deepEqual(CHARACTER_SKILL_ICONS['10000114'].map(p=>p.split('/').at(-1)),['Skill_A_01.png','Skill_S_SkirkNew_01.png','Skill_E_SkirkNew_01.png']);
 assert.match(CHARACTER_SKILL_ICONS['10000089'][1],/Skill_S_Furina_01/);
 for(const sources of Object.values(CHARACTER_SKILL_ICONS))for(const source of sources.filter(Boolean)){
  assert.ok(readFileSync(new URL('../'+source,import.meta.url)).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),source);
 }
});
test('un lien distant de skill incorrect ne masque pas le fichier local connu',()=>{
 const rows=skillList('gi',{id:10000114,_id:'skirk'},{skillTalents:[{name:'NA',icon:'https://example.invalid/broken.png'},{name:'E'},{name:'Q'}]});
 assert.equal(rows[1].image,CHARACTER_SKILL_ICONS['10000114'][1]);
 assert.deepEqual(rows[0].fallbacks,['https://example.invalid/broken.png']);
});
