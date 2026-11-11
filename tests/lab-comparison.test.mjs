import test from 'node:test';
import assert from 'node:assert/strict';
import {renderLabResults} from '../src/lab-view.js';
import {compareLabScores,labReferenceScore} from '../src/lab-comparison.js';
import {evaluateDamageStats,optimizeArtifacts} from '../src/optimizer.js';
test('gain et perte utilisent une référence positive et gardent leur signe',()=>{
 assert.equal(compareLabScores(100,125).percent,25);assert.equal(compareLabScores(100,80).percent,-20);assert.equal(compareLabScores(100,100).percent,0);
 for(const ref of [0,-1,null,undefined,NaN,Infinity,''])assert.equal(compareLabScores(ref,100).percent,null);
 assert.equal(compareLabScores(100,Infinity).status,'unknown');
});
test('DPS et stats utilisent les unités de leur objectif, sans durée fictive',()=>{
 assert.equal(labReferenceScore({objective:'dps',rotationSeconds:20},{ok:true,total:1000}),50);
 assert.equal(labReferenceScore({objective:'dps',rotationSeconds:0},{ok:true,total:1000}),null);
 assert.equal(labReferenceScore({objective:'atk'},{ok:false},{atk:2500}),2500);
 assert.equal(labReferenceScore({objective:'healing'},{ok:true,total:999},{healing:20}),null);
});
test('optimisation DPS : durée absente ou invalide refusée explicitement',async()=>{
 for(const duration of [undefined,0,-1,NaN,Infinity]){const result=await optimizeArtifacts({objective:'dps',input:{rotationDuration:duration}});assert.equal(result.results.length,0);assert.match(result.error,/durée/);}
});

test('classement top 5 identique à une recherche brute sur 243 assemblages variés',async()=>{
 const slots=['flower','plume','sands','goblet','circlet'];
 const inventory=slots.flatMap((slot,index)=>[0,1,2].map(n=>({id:index+'-'+n,slot,slotIndex:index,setKey:n===2?'b':'a',mainType:'atkFlat',mainValue:10+index*3+n*7,level:20,rarity:5,substats:[{type:'critRate',value:n===1?12:2},{type:'critDmg',value:n===2?20:4}]})));
 const input={baseStats:{atk:900,critRate:10,critDmg:60},level:90,hit:{baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'},setEffects:{a:{two:{atkPct:18},four:{critRate:20}},b:{two:{critDmg:20}}}};
 const brute=[];function walk(rows,index){if(index===5){const stats={},counts=new Map();for(const row of rows){stats.atkFlat=(stats.atkFlat||0)+row.mainValue;for(const sub of row.substats)stats[sub.type]=(stats[sub.type]||0)+sub.value;counts.set(row.setKey,(counts.get(row.setKey)||0)+1);}brute.push(evaluateDamageStats(input,stats,counts).total);return;}for(const row of inventory.filter(r=>r.slotIndex===index))walk([...rows,row],index+1);}walk([],0);brute.sort((a,b)=>b-a);
 const out=await optimizeArtifacts({inventory,input,topN:5});assert.equal(out.exact,true);assert.equal(out.results.length,5);out.results.forEach((row,index)=>assert.ok(Math.abs(row.score-brute[index])<1e-8));
});

test('les cartes affichent perte, référence chiffrée et état indisponible',()=>{
 const context={builds:[],inventory:[],sets:[],currentStats:{atk:100}},p={objective:'atk',setEffects:'{}'},results=[{score:80,rows:[],result:{stats:{atk:80}}}];
 const lower=renderLabResults(context,p,results,{ok:false},null);assert.match(lower,/-20/);assert.match(lower,/référence : 100 ATQ/);
 const partial=renderLabResults(context,{...p,searchComplete:false},results,{ok:false},null);assert.match(partial,/MEILLEUR TROUVÉ · RECHERCHE INTERROMPUE/);assert.doesNotMatch(partial,/MEILLEUR ASSEMBLAGE/);
 const zero=renderLabResults({...context,currentStats:{atk:0}},p,results,{ok:true,total:0},null);assert.match(zero,/référence nulle ou négative/);assert.doesNotMatch(zero,/Infinity|NaN/);
});
