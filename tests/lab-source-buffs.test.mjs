import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,resolveWrCharacterKey,wrStatKey,wrPlainStats,wrAttackOptions,wrSavedConditions} from '../src/lab-wr-adapter.js';
import {renderSourceBuffs} from '../src/lab-source-buffs.js';
const engine=await loadWrEngine();
const manifest=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url)));
const build=(character,conditionals={},other={})=>buildWrCharacterData(engine,{character,level:90,talent:{auto:10,skill:10,burst:10},conditionals,...other});
test('chaque fiche du moteur et ses 398 conditions possèdent des commandes sans récursion',()=>{
 let conditions=0;
 assert.equal(Object.keys(manifest.characters).length,Object.keys(engine.characters).length);
 for(const [key,character] of Object.entries(engine.characters)){
  const record=manifest.characters[key];assert.ok(record,key);
  for(const path of engine.conditionalPaths.characters[key]||[]){
   const options=engine.conditionOptions(key,path);assert.ok(options.includes('off'));assert.ok(options.length>1,key+':'+path);assert.equal(new Set(options).size,options.length);
   assert.deepEqual(record.conditions.find(row=>row.path===path)?.options,options);conditions++;
  }
  assert.match(renderSourceBuffs({...record,key},{constellation:6},-1),/lab-source-buffs/);
 }
 assert.equal(conditions,398);
});
test('Bennett : la valeur activeInArea est utilisée et transmet réellement son ATQ à Diluc',()=>{
 assert.deepEqual(engine.conditionOptions('Bennett','activeInArea'),['off','activeInArea']);
 const active=build('Diluc'),off=evaluateWrTeam(engine,active,[build('Bennett')]),on=evaluateWrTeam(engine,active,[build('Bennett',{Bennett:{activeInArea:'activeInArea',underHP:'underHP'}})]);
 assert.ok(on.display.normal[0].value>off.display.normal[0].value);
});
test('Diluc : les cumuls C2 renforcent les dégâts seulement à partir de C2',()=>{
 for(const constellation of [0,2]){
  const off=evaluateWrTeam(engine,build('Diluc',{}, {constellation}));
  const on=evaluateWrTeam(engine,build('Diluc',{Diluc:{DilucC2:'3'}},{constellation}));
  if(constellation===2)assert.ok(on.display.normal[0].value>off.display.normal[0].value);else assert.equal(on.display.normal[0].value,off.display.normal[0].value);
 }
});
test('les résistances sont transmises en pourcentage et les statistiques affichées sont numériques',()=>{
 const low=evaluateWrTeam(engine,build('Diluc',{}, {enemyResistance:10}));
 const high=evaluateWrTeam(engine,build('Diluc',{}, {enemyResistance:50}));
 assert.ok(low.display.normal[0].value>high.display.normal[0].value);
 const stats=wrPlainStats(low.display);assert.ok(stats.atk>0);assert.ok(stats.critRate>=0);assert.equal(wrStatKey('critRate'),'critRate_');assert.equal(wrStatKey('hpPct'),'hp_');
});

test('Sigewinne C6 : le bonus CRIT du déchaînement exige les soins',()=>{
 const off=evaluateWrTeam(engine,build('Sigewinne',{}, {constellation:6}));
 const on=evaluateWrTeam(engine,build('Sigewinne',{Sigewinne:{c6AfterHeal:'on'}},{constellation:6}));
 const a=Object.values(off.display.burst).find(node=>Number.isFinite(node.value));
 const b=Object.values(on.display.burst).find(node=>Number.isFinite(node.value));
 assert.ok(b.value>a.value);
});
test('toutes les 137 fiches restent calculables après la réparation des conditions',()=>{
 for(const key of Object.keys(engine.characters)){
  const result=evaluateWrTeam(engine,build(key));assert.ok(result.display&&Object.keys(result.display).length,key);assert.ok(wrAttackOptions(engine,key,result.display,0).length,key+' : aucune attaque calculable');
 }
});
import {createSourceEvaluator} from '../src/lab-wr-adapter.js';
import {optimizeArtifacts} from '../src/optimizer.js';
test('optimisation : les mêmes buffs de source et d’équipe produisent les mêmes dégâts',async()=>{
 const slots=['flower','plume','sands','goblet','circlet'];
 const inventory=slots.map((slot,i)=>({id:'source-'+i,slot,setKey:'glad',rarity:5,level:20,mainType:['hpFlat','atkFlat','atkPct','pyroDmg','critRate'][i],mainValue:1,substats:[]}));
 const scenario={active:{character:'Diluc',level:90,ascension:6,constellation:2,talent:{auto:10,skill:10,burst:10},conditionals:{Diluc:{DilucC2:'3'}},artifacts:[]},team:[{character:'Bennett',level:90,ascension:6,talent:{auto:10,skill:10,burst:10},conditionals:{Bennett:{activeInArea:'activeInArea',underHP:'underHP'}}}],path:'normal.0',hitCount:1,setKeys:{glad:'GladiatorsFinale'}};
 const expected=createSourceEvaluator(engine,scenario)(inventory);
 const out=await optimizeArtifacts({inventory,input:{sourceDamage:scenario},filters:{configuration:'any'},topN:1});
 assert.equal(out.results.length,1);assert.ok(Math.abs(out.results[0].score-expected.total)<1e-8);assert.equal(out.diagnostic.boundDisabledReason,'source-formula');
});

test('Furina C0 : une ancienne sélection de 400 points est ramenée au plafond de 300',()=>{
 assert.equal(wrSavedConditions(engine,'Furina',{Furina:{burstFanfare:'400'}},0).Furina.burstFanfare,'300');
 assert.equal(wrSavedConditions(engine,'Furina',{Furina:{burstFanfare:'400'}},1).Furina.burstFanfare,'400');
});
