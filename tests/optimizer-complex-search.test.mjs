import test from 'node:test';
import assert from 'node:assert/strict';
import {optimizeArtifacts,evaluateDamageStats} from '../src/optimizer.js';
const slots=['flower','plume','sands','goblet','circlet'];
const inventory=slots.flatMap((slot,index)=>[0,1,2].map(n=>({id:index+'-'+n,slot,slotIndex:index,setKey:n===2?'b':'a',mainType:'atkFlat',mainValue:15+index*3+n*11,level:20,rarity:5,substats:[{type:'critRate',value:n===1?13:2},{type:'critDmg',value:n===2?23:5}]})));
const hit={baseStat:'atk',actionKind:'burst',elementKey:'cryo',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'};
function brute(input){const scores=[];function walk(rows,index){if(index===5){const stats={},counts=new Map();for(const row of rows){stats.atkFlat=(stats.atkFlat||0)+row.mainValue;for(const sub of row.substats)stats[sub.type]=(stats[sub.type]||0)+sub.value;counts.set(row.setKey,(counts.get(row.setKey)||0)+1);}scores.push(evaluateDamageStats(input,stats,counts).total);return;}for(const row of inventory.filter(r=>r.slotIndex===index))walk([...rows,row],index+1);}walk([],0);return scores.sort((a,b)=>b-a);}
for(const mode of ['complex','weighted'])test('top N complet contre recherche brute : '+mode,async()=>{
 const input={baseStats:{atk:900,critRate:10,critDmg:60},level:90,hit,bonuses:{},relevantStats:['atkFlat']};
 if(mode==='complex')input.hit={...hit,complexEffects:{furina:{enabled:true,constellation:2,hpChangePercent:100,talentLevel:10}}};
 else input.weightedHits=[{hit,weight:2},{hit:{...hit,actionKind:'normal'},weight:1,bonuses:{atkPct:25}}];
 const expected=brute(input),out=await optimizeArtifacts({inventory,input,topN:5});assert.equal(out.exact,true);assert.equal(out.diagnostic.search,'exhaustive');assert.equal(out.visited,243);assert.equal(out.results.length,5);out.results.forEach((row,i)=>assert.ok(Math.abs(row.score-expected[i])<1e-8));
});
test('annulation temporelle : une recherche exhaustive rend la main et ne prétend pas être complète',async()=>{
 const many=slots.flatMap((slot,i)=>Array.from({length:20},(_,n)=>({id:i+'-'+n,slot,slotIndex:i,setKey:'a',mainType:'atkFlat',mainValue:n+1,substats:[]})));
 let stop=false,progress=0;setTimeout(()=>{stop=true},20);
 const out=await optimizeArtifacts({inventory:many,input:{baseStats:{atk:1000},hit,weightedHits:[{hit,weight:1}]},cancelled:()=>stop,onProgress:()=>progress++});assert.equal(out.stopped,true);assert.equal(out.exact,false);assert.ok(out.visited<20**5);assert.ok(progress>0);
});
