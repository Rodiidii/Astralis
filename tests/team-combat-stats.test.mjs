import test from 'node:test';
import assert from 'node:assert/strict';
import {teamCombatStats} from '../src/build-model.js';
test('les statistiques d’équipe et d’export utilisent la base correcte, sans doublonner les bonus',()=>{
 const input={atk:2000,hp:18000,def:900,em:100,critRate:70.2,critDmg:180.5,er:120,dmgBonus:46.6,baseAtk:1000,base:{hp:12000,defense:700}};
 const buffs=[{type:'atk',value:20},{type:'atk',value:10},{type:'atkFlat',value:200},{type:'critRate',value:15},{type:'em',value:100},{type:'energy',value:20},{type:'dmg',value:30},{type:'atk',value:999,active:false}];
 const result=teamCombatStats(input,buffs);
 assert.equal(result.atk,2500);assert.equal(result.em,200);assert.equal(result.er,140);
 assert.equal(result.critRate,85.2);assert.equal(result.critDmg,180.5);assert.equal(result.dmgBonus,76.6);
 assert.equal(input.atk,2000);assert.equal(teamCombatStats(null,buffs),null);
});
test('les pourcentages PV/DÉF ne multiplient pas les statistiques déjà équipées',()=>{
 const result=teamCombatStats({hp:20000,def:1200,atk:1000,base:{hp:10000,defense:800},baseAtk:700},[{type:'hp',value:20},{type:'def',value:25}]);
 assert.equal(result.hp,22000);assert.equal(result.def,1400);
});
