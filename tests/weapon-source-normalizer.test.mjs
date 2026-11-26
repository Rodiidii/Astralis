import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeWeaponSourceDetails} from '../src/weapon-source-normalizer.js';

const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));

test('Lunaris refinement details feed the exact r1-r5 shape consumed by the lab',()=>{
 const weapon=weapons.find(row=>row.id===11503);
 const raw={passive:{name:'Passif vérifié',refinements:Object.fromEntries(Array.from({length:5},(_,index)=>[String(index+1),{description:`Description R${index+1}`,params:[(index+1)/10]}]))}};
 const result=normalizeWeaponSourceDetails(weapon,raw,'7.2.53');
 assert.equal(result.passiveName,'Passif vérifié');
 assert.equal(result.effectName,'Passif vérifié');
 assert.equal(result.sourceVersion,'7.2.53');
 for(let rank=1;rank<=5;rank++){
  assert.equal(result[`r${rank}`].description,`Description R${rank}`);
  assert.ok(Array.isArray(result[`r${rank}`].sourceParams));
  assert.deepEqual(result[`r${rank}`].sourceParams,[(rank)/10]);
 }
 assert.deepEqual(result.r1.values,weapon.r1.values,'the curated mapping values remain intact');
});

test('a source-only weapon still exposes its descriptions for all published refinements',()=>{
 const result=normalizeWeaponSourceDetails({id:99999},{passive:{name:'Passif sans fiche locale',refinements:{'1':{description:'R1'},'2':{description:'R2'},'3':{description:'R3'},'4':{description:'R4'},'5':{description:'R5'}}}},'7.2.53');
 assert.deepEqual([1,2,3,4,5].map(rank=>result[`r${rank}`]?.description),['R1','R2','R3','R4','R5']);
 assert.deepEqual([1,2,3,4,5].map(rank=>result[`r${rank}`]?.values),[[],[],[],[],[]]);
});
