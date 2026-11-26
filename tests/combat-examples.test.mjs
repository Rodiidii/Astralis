import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installCombatExamples} from '../src/combat-examples.js';
const pack=JSON.parse(fs.readFileSync(new URL('../data/flins-examples.json',import.meta.url)));
const catalog={character:['10000120','10000116','10000121','10000043','10000031'].map(id=>({id,_id:'c-'+id})),weapon:['13407','12401'].map(id=>({id,_id:'w-'+id})),artifact:['15041','15025','15042','15002'].map(id=>({id,_id:'a-'+id}))};
function storage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
test('requested examples resolve current catalog IDs and preserve existing builds, teams and lab state',()=>{
 const s=storage();s.setItem('astralis:gi:builds','[{"id":"personal"}]');s.setItem('astralis:teams:gi','[{"id":"personal-team"}]');s.setItem('astralis:gi:damage-lab:v1','{"character":"my-character"}');
 const r=installCombatExamples(s,pack,catalog);assert.equal(r.builds,2);assert.equal(r.teams,2);
 const builds=JSON.parse(s.getItem('astralis:gi:builds'));assert.equal(builds[0].character,'c-10000120');assert.equal(builds[0].weapon,'w-13407');assert.equal(builds[0].pieces[0].set,'a-15041');assert.ok(builds.some(b=>b.id==='personal'));
 assert.equal(s.getItem('astralis:gi:damage-lab:v1'),'{"character":"my-character"}');
 assert.equal(installCombatExamples(s,pack,catalog).installed,false);assert.equal(JSON.parse(s.getItem('astralis:gi:builds')).length,3);
});
test('a missing catalog record does not partially install the requested examples',()=>{
 const s=storage();assert.throws(()=>installCombatExamples(s,pack,{...catalog,weapon:[]}),/manquante/);assert.equal(s.getItem('astralis:gi:builds'),null);
});
