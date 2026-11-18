import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareArtifactPools,optimizeArtifacts} from '../src/optimizer.js';
const slots=['flower','plume','sands','goblet','circlet'];
const mains=['hpFlat','atkFlat','er','cryoDmg','critRate'];
const inventory=slots.flatMap((slot,i)=>['a','b'].map(setKey=>({id:slot+'-'+setKey,slot,setKey,mainType:mains[i],mainValue:1,substats:[],level:20,rarity:5})));
const wrong=['sands','goblet','circlet'].map(slot=>({id:'wrong-'+slot,slot,setKey:'b',mainType:'hpPct',mainValue:99999,substats:[{type:'atkFlat',value:99999}],level:20,rarity:5}));
const mainStats={sands:['er'],goblet:['cryoDmg'],circlet:['critRate']};
const input={baseStats:{atk:1000,critRate:5,critDmg:50},hit:{baseStat:'atk',actionKind:'normal',elementKey:'cryo',talentMultiplier:1,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'}};
test('les stats principales filtrent les pièces avant comptage et avant optimisation',async()=>{
 const prepared=prepareArtifactPools([...inventory,...wrong],{mainStats});assert.equal(prepared.combinations,32);assert.equal(prepared.source.length,10);
 assert.deepEqual(prepared.counts,Object.fromEntries(slots.map(slot=>[slot,2])));
 const result=await optimizeArtifacts({inventory:[...inventory,...wrong],input,filters:{mainStats,configuration:'any'},topN:10});
 assert.equal(result.combinations,32);assert.ok(result.results.length);assert.ok(result.results.every(row=>row.rows.every(id=>!id.startsWith('wrong-'))));
});
test('un set imposé exige quatre pièces et conserve la cinquième pièce libre',async()=>{
 const result=await optimizeArtifacts({inventory,input,filters:{mainStats,requiredSets:['a'],configuration:'any'},topN:10});
 assert.equal(result.results.length,6);for(const row of result.results)assert.ok(row.rows.filter(id=>id.endsWith('-a')).length>=4);
 const invalid=await optimizeArtifacts({inventory,input,filters:{requiredSets:['a','b']}});assert.equal(invalid.results.length,0);assert.match(invalid.error,/seul set de 4 pièces/);
});
test('les bonus 2 pièces sont détectés automatiquement sans imposer deux sets',async()=>{
 const result=await optimizeArtifacts({inventory,input:{baseStats:{atk:1000},setEffects:{a:{two:{atkPct:100}},b:{two:{atkPct:100}}}},objective:'atk',filters:{configuration:'any'},topN:1});
 const counts=new Map();for(const id of result.results[0].rows){const key=inventory.find(piece=>piece.id===id).setKey;counts.set(key,(counts.get(key)||0)+1);}
 assert.deepEqual([...counts.values()].sort(),[2,3]);assert.ok(result.results[0].score>=3000);
});
