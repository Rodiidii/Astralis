import {writeFile} from 'node:fs/promises';
import {optimizeArtifacts} from '../src/optimizer.js';
const slots=['flower','plume','sands','goblet','circlet'];
function inventory(size){let seed=20261111;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};return Array.from({length:size},(_,i)=>({id:'bench-'+i,slot:slots[i%5],slotIndex:i%5,setKey:['A','B','C','D'][Math.floor(rand()*4)],mainType:i%5===0?'hpFlat':i%5===1?'atkFlat':[['atkPct','em','er'],['atkPct','cryoDmg','em'],['atkPct','critDmg','em']][i%5-2][Math.floor(rand()*3)],mainValue:i%5===0?4780:i%5===1?311:20+rand()*30,level:20,rarity:5,substats:[{type:'critRate',value:2+rand()*15},{type:'atkPct',value:3+rand()*20},{type:'critDmg',value:5+rand()*30},{type:'er',value:3+rand()*15}]}));}
const hit={baseStat:'atk',actionKind:'burst',elementKey:'cryo',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1,critMode:'average'};
const reports=[];
for(const size of [1000,5000])for(const mode of ['single','complex-rotation']){
 const pieces=inventory(size),input={baseStats:{hp:12000,atk:1000,critRate:10,critDmg:60},level:90,hit,setEffects:{A:{two:{atkPct:18},four:{dmgBonus:30}},B:{two:{critRate:12}}}};
 if(mode==='complex-rotation')input.weightedHits=[{hit:{...hit,complexEffects:{furina:{enabled:true,constellation:2,hpChangePercent:100,talentLevel:10}}},weight:1},{hit:{...hit,actionKind:'normal',talentMultiplier:1},weight:5}];
 const start=performance.now();let stop=false;const timer=setTimeout(()=>{stop=true},350),ticks=[];
 const result=await optimizeArtifacts({inventory:pieces,input,topN:5,cancelled:()=>stop,onProgress:p=>ticks.push({elapsed:performance.now()-start,visited:p.visited})});clearTimeout(timer);
 reports.push({size,mode,uniqueStatVectors:new Set(pieces.map(p=>JSON.stringify([p.slot,p.setKey,p.mainType,p.mainValue,p.substats]))).size,elapsedMs:performance.now()-start,exact:result.exact,stopped:result.stopped,visited:result.visited,pruned:result.pruned,rawCombinations:result.rawCombinations,results:result.results.length,progressTicks:ticks.length,search:result.diagnostic?.search});
}
const report={date:new Date().toISOString(),method:'Inventaires déterministes variés ; annulation demandée à 350 ms. Mesure de réactivité et débit partiel, pas de preuve de résolution complète des grands inventaires.',reports};
await writeFile(new URL('../docs/BENCHMARK-OPTIMISEUR.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
