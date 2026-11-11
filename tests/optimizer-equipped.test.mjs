import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizeArtifacts } from '../src/optimizer.js';

test('un équipement actuel complet initialise la recherche et reste parmi les résultats', async () => {
  const slots=['flower','plume','sands','goblet','circlet'];
  const inventory=slots.map((slot,index)=>({id:'equipped-'+index,setKey:'set',slot,slotIndex:index,mainType:'atkFlat',mainValue:10,substats:[],level:20}));
  const result=await optimizeArtifacts({inventory,currentIds:inventory.map(piece=>piece.id),topN:1,input:{baseStats:{atk:1000,critRate:50,critDmg:100},level:90,hit:{baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'}}});
  assert.equal(result.exact,true);
  assert.equal(result.results.length,1);
  assert.deepEqual(new Set(result.results[0].rows),new Set(inventory.map(piece=>piece.id)));
});

test('le score pondéré applique des bonus propres à chaque coup',async()=>{
 const {evaluateDamageStats}=await import('../src/optimizer.js');
 const input={level:90,baseStats:{atk:1000},hit:{baseStat:'atk',talentMultiplier:1,enemyLevel:100,critMode:'nonCrit'}};
 const base=evaluateDamageStats(input,{}),boost=evaluateDamageStats({...input,bonuses:{atkPct:30}},{});
 const combined=evaluateDamageStats({...input,weightedHits:[{hit:input.hit,bonuses:{},weight:1.5},{hit:input.hit,bonuses:{atkPct:30},weight:2}]},{});
 assert.ok(combined.ok);
 assert.equal(combined.total,base.total*1.5+boost.total*2);
});

test('les dégâts ajoutés et la défense ignorée restent cohérents avec le moteur',async()=>{
 const {evaluateDamageStats}=await import('../src/optimizer.js');
 const {calculateAction}=await import('../src/damage-engine.js');
 const hit={baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,
  enemyResistance:.1,critMode:'nonCrit',flatDamage:100,defenseIgnore:.1};
 const input={level:90,baseStats:{atk:1000},hit,bonuses:{flatDamage:300,defIgnore:20}};
 const result=evaluateDamageStats(input,{});
 const expected=calculateAction({...hit,stats:result.stats,flatDamage:400,defenseIgnore:.3});
 assert.ok(result.ok);
 assert.ok(Math.abs(result.total-expected.total)<1e-8);
});
