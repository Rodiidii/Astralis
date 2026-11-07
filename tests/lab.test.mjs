import test from 'node:test';
import assert from 'node:assert/strict';
import { RESISTANCE_MULTIPLIER, DEFENSE_MULTIPLIER, calculateHit, finalStats } from '../src/damage-engine.js';
import { normalizeGoodArtifact, validateArtifact, pruneDominatedArtifacts } from '../src/artifact-model.js';
import { evaluateDamageStats, optimizeArtifacts } from '../src/optimizer.js';

test('résistance et défense utilisent les formules Genshin',()=>{
  assert.equal(RESISTANCE_MULTIPLIER(.1),.9);
  assert.equal(RESISTANCE_MULTIPLIER(-.2),1.1);
  assert.equal(RESISTANCE_MULTIPLIER(.8),1/4.2);
  assert.equal(DEFENSE_MULTIPLIER(90,100),190/390);
  assert.equal(DEFENSE_MULTIPLIER(90,100,1),190/(190+200*.1));
});
test('stat finale pourcentage + plat et calcul moyen isolent les termes',()=>{
  assert.deepEqual(finalStats({atk:1000,critRate:50,critDmg:100},{atkPct:20,atkFlat:50}),{hp:0,atk:1250,def:0,em:0,critRate:50,critDmg:100,dmgBonus:0,er:0,healing:0,defReduction:0,defIgnore:0});
  const out=calculateHit({stats:{atk:1000,critRate:50,critDmg:100},baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1});
  assert.equal(out.ok,true);assert.ok(Math.abs(out.direct-(2000*1.5*(190/390)*.9))<1e-9);
});
test('réactions manquantes restent TODO_DATA et ne sont pas remplacées par zéro',()=>{
  const out=calculateHit({stats:{atk:1000,em:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,reaction:{kind:'amplifying',baseMultiplier:undefined}});
  assert.equal(out.ok,false);assert.ok(out.warnings.some(x=>x.includes('TODO_DATA')));
  assert.ok(Number.isNaN(Number(undefined)));
});
test('stat de référence et multiplicateur absents ne produisent pas un faux zéro',()=>{
  assert.equal(calculateHit({stats:{},baseStat:'atk',talentMultiplier:1,attackerLevel:90}).ok,false);
  assert.equal(calculateHit({stats:{atk:100},baseStat:'atk',talentMultiplier:0,attackerLevel:90}).ok,false);
});
test('validation GOOD signale les lignes impossibles',()=>{
  const row=normalizeGoodArtifact({id:'a',setKey:'set',slotKey:'flower',rarity:5,level:20,mainStatKey:'FIGHT_PROP_HP',mainStatValue:4780,substats:[{key:'FIGHT_PROP_ATTACK_PERCENT',value:5.83},{key:'FIGHT_PROP_CRITICAL',value:3.89},{key:'FIGHT_PROP_CRITICAL_HURT',value:7.77}]});
  assert.equal(validateArtifact(row).valid,true);
  assert.equal(validateArtifact({...row,mainType:'critRate'}).valid,false);
  assert.equal(validateArtifact({...row,slot:'flower',mainType:'atkPct'}).valid,false);
});
test('le pré-filtrage conserve une copie d’un vecteur identique',()=>{
  const row={id:'a',slotIndex:0,setKey:'A',mainType:'atkPct',mainValue:46.6,substats:[{type:'critRate',value:10}]};
  assert.deepEqual(pruneDominatedArtifacts([row,{...row,id:'b'}]).map(x=>x.id),['a']);
});
function fixtureInventory(){const rows=[];for(let i=0;i<5;i++){for(const [setKey,atkPct,critDmg] of [['A',10+i,5],['B',7,15+i]])rows.push({id:`${i}-${setKey}`,slotIndex:i,slot:['flower','plume','sands','goblet','circlet'][i],setKey,mainType:'atkPct',mainValue:atkPct,substats:[{type:'critDmg',value:critDmg}],rarity:5,level:20,locked:false});}return rows;}
test('optimiseur exact = recherche brute sur petit inventaire',async()=>{
  const inventory=fixtureInventory(),input={baseStats:{atk:1000,critRate:50,critDmg:100},bonuses:{},level:90,setEffects:{A:{two:{atkPct:18},four:{dmgBonus:35}},B:{two:{atkPct:18},four:{dmgBonus:15}}},hit:{baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'}};
  let brute=-Infinity;const choose=(slot,rows,counts,stats)=>{if(slot===5){const c=[...counts.values()].sort((a,b)=>b-a);if(!(c[0]>=4||(c[0]>=2&&c[1]>=2)))return;brute=Math.max(brute,evaluateDamageStats(input,stats,counts).total);return;}for(const p of inventory.filter(x=>x.slotIndex===slot)){rows.push(p);stats.atkPct=(stats.atkPct||0)+p.mainValue;stats.critDmg=(stats.critDmg||0)+p.substats[0].value;counts.set(p.setKey,(counts.get(p.setKey)||0)+1);choose(slot+1,rows,counts,stats);counts.set(p.setKey,counts.get(p.setKey)-1);if(!counts.get(p.setKey))counts.delete(p.setKey);stats.atkPct-=p.mainValue;stats.critDmg-=p.substats[0].value;rows.pop();}};choose(0,[],new Map(),{});
  const result=await optimizeArtifacts({inventory,input,topN:1});assert.equal(result.exact,true);assert.equal(result.results.length,1);assert.ok(Math.abs(result.results[0].score-brute)<1e-8);
});
test('un bonus 4 pièces cumule aussi le bonus 2 pièces',()=>{
  const input={baseStats:{atk:1000,critRate:0,critDmg:0},bonuses:{},setEffects:{A:{two:{atkPct:18},four:{dmgBonus:35}}},hit:{baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1}};
  const result=evaluateDamageStats(input,{},new Map([['A',4]]));
  assert.equal(result.bonuses.atkPct,18);assert.equal(result.stats.dmgBonus,35);assert.equal(result.stats.atk,1180);
});
test('le bonus élémentaire sélectionné influe sur le résultat optimisé',()=>{
  const input={baseStats:{atk:1000,critRate:0,critDmg:0},bonuses:{},hit:{baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1,elementKey:'pyro'}};
  const plain=evaluateDamageStats(input,{},new Map()),withGoblet=evaluateDamageStats(input,{pyroDmg:46.6},new Map());
  assert.ok(withGoblet.total>plain.total);
});
