import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedWeaponEffects} from '../src/lab-weapon-effects.js';
import {configuredWeaponBonuses,attackCritStats,typedAttackBonus,snapshotWeaponStats} from '../src/lab-config.js';
import {finalStats,calculateAction} from '../src/damage-engine.js';
import {extendedBuffBonuses,extendedBuffPools,extendedBuffWarnings} from '../src/lab-extended-buffs.js';
import {partyWeaponBonuses,partyWeaponWarnings} from '../src/lab-support-effects.js';
const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));
const weapon=id=>({...weapons.find(w=>w.id===id),_id:String(id)});
const config=(id,effects={},rank=1,extra={})=>configuredWeaponBonuses(weapon(id),{weaponRefinement:rank,nativeElementKey:'cryo',effectStates:Object.fromEntries(Object.entries(effects).map(([key,value])=>['weapon:'+id+':'+key,{enabled:true,stacks:value}])),...extra});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('live weapon milestones fill a missing secondary stat without dropping base ATK',()=>{
 const snapshot=JSON.parse(readFileSync(new URL('../data/lab-source-snapshot.json',import.meta.url)));
 const milleReves=weapon(14511);
 milleReves.statsAtMilestones={'90':{atk:542,'Elemental Mastery':265}};
 const result=snapshotWeaponStats(snapshot,milleReves,90);
 assert.ok(result&&Number.isFinite(result.atk));
 assert.ok(Math.abs(result.atk-542)<1,'base ATK remains available');
 assert.equal(result.specialized,265);
 assert.equal(result.secondaryType,'em');
});
test('explicit weapon effects retain the same components at all five refinements',()=>{
 let count=0;
 for(const row of weapons){
  const first=publishedWeaponEffects(row,1);if(!first)continue;count++;
  for(let rank=1;rank<=5;rank++){
   const effects=publishedWeaponEffects(row,rank);
   assert.deepEqual(effects.map(e=>e.id),first.map(e=>e.id),row.name+' R'+rank);
   for(const effect of effects)for(const value of Object.values(effect.bonuses))assert.ok(Array.isArray(value)?value.length&&value.every(Number.isFinite):Number.isFinite(value),row.name);
  }
 }
 assert.ok(count>=192);
});
test('each published weapon passive control changes the calculator when checked',()=>{
 let checked=0;
 for(const row of weapons){
  const first=publishedWeaponEffects(row,1);if(!first)continue;
  const id=String(row.id),weapon={...row,_id:id},scope='weapon:'+id;
  for(let rank=1;rank<=5;rank++){
   const options=publishedWeaponEffects(weapon,rank);
   const off=Object.fromEntries(options.map(option=>[scope+':'+option.id,{enabled:false,stacks:option.max||1}]));
   const on=Object.fromEntries(options.map(option=>[scope+':'+option.id,{enabled:true,stacks:option.max||1}]));
   const disabled=configuredWeaponBonuses(weapon,{weaponRefinement:rank,effectStates:off,nativeElementKey:'cryo'});
   const characterId=options.find(option=>option.characters?.length)?.characters?.[0]||'test-character';
   const fightPosition=options.some(option=>option.offfield)?'off':'on';
   const enabled=configuredWeaponBonuses(weapon,{weaponRefinement:rank,effectStates:on,nativeElementKey:'cryo',characterId,fightPosition});
   assert.deepEqual(disabled,{},`${row.name} R${rank} unchecked`);
   assert.ok(Object.values(enabled).some(value=>Array.isArray(value)?value.some(Number.isFinite):Number.isFinite(value)&&value!==0),`${row.name} R${rank} checked`);
   checked++;
  }
 }
 assert.ok(checked>=960,`verified ${checked} weapon/refinement combinations`);
});
test('Mistsplitter, Polar Star and Thundering Pulse use nonlinear refinement tables',()=>{
 assert.equal(config(11509,{seal:3}).cryoDmg,40);
 assert.equal(config(11509,{seal:3},5).cryoDmg,80);
 assert.equal(config(15507,{star:4}).atkPct,48);
 assert.equal(config(15507,{star:4},5).atkPct,96);
 assert.equal(config(15509,{seal:3}).normalDmg,40);
 assert.equal(config(15509,{seal:3},5).normalDmg,80);
});
test('stack prerequisites and shield doubling never grant free extra stacks',()=>{
 assert.equal(config(13505,{full:1}).dmgBonus,undefined);
 assert.equal(config(13505,{hit:6,full:1}).dmgBonus,undefined);
 assert.equal(config(13505,{hit:7,full:1}).dmgBonus,12);
 close(config(11504,{shield:1}).atkPct||0,0);
 close(config(11504,{hit:2,shield:5}).atkPct,16);
 close(config(13507,{consummation:4,offfield:1}).atkPct,25.6);
});
test('Engulfing, Key and Xiphos conversions recalculate final candidate stats',()=>{
 const engulf=config(13509,{burst:1});
 const stats=finalStats({atk:1000,hp:10000,er:200},engulf);
 close(stats.er,230);close(stats.atk,1364);
 close(finalStats({atk:1000,er:1000},engulf).atk,1800);
 const key=config(11511,{rhapsody:3,full:1});
 const ks=finalStats({hp:10000,em:100},key);close(ks.hp,12000);close(ks.em,100+12000*.0056);
 close(finalStats({em:1000,er:100},config(11418,{moonlight:1})).er,136);
});
test('HP-dependent normal bonus caps per candidate and does not become flat damage',()=>{
 const bonuses=config(14431,{crown:1});
 close(typedAttackBonus(bonuses,'normal',{hp:10000}),6);
 close(typedAttackBonus(bonuses,'normal',{hp:100000}),16);
 close(typedAttackBonus(bonuses,'skill',{hp:100000}),0);
});
test('talent-specific CRIT and lunar CRIT do not leak into other damage types',()=>{
 const bonuses={burstCritRate:20,burstCritDmg:30,lunarBloomCritDmg:60};
 assert.deepEqual(attackCritStats({critRate:50,critDmg:100},bonuses,'burst',null),{critRate:70,critDmg:130});
 assert.deepEqual(attackCritStats({critRate:50,critDmg:100},bonuses,'burst',{kind:'lunarDirect',id:'lunarBloom'}),{critRate:50,critDmg:160});
 assert.deepEqual(attackCritStats({critRate:50,critDmg:100},bonuses,'skill',null),{critRate:50,critDmg:100});
});
test('support HP, DEF and ATK conversions use distinct source fields and deduplicate weapons',()=>{
 const allies=[{character:'a',weapon:'11511',weaponSourceHP:50000,activeWeaponEffects:{'11511:rhapsody':{enabled:true}}},{character:'b',weapon:'11511',weaponSourceHP:40000,activeWeaponEffects:{'11511:rhapsody':{enabled:true}}},{character:'c',weapon:'11516',weaponSourceDEF:4000,activeWeaponEffects:{'11516:ode':{enabled:true}}}];
 const bonuses=partyWeaponBonuses({character:'main',allies},weapons);
 close(bonuses.em,100);close(bonuses.cryoDmg,25.6);
 assert.deepEqual(partyWeaponWarnings({character:'main',allies},weapons),[]);
 delete allies[0].weaponSourceHP;assert.equal(partyWeaponWarnings({character:'main',allies},weapons).length,1);
 const guidance={character:'a',weapon:'14523',weaponSourceATK:4000,activeWeaponEffects:{'14523:guidance':{enabled:true},'14523:hexerei':{enabled:true}}};
 close(partyWeaponBonuses({character:'main',allies:[guidance],fightPosition:'on'},weapons).dmgBonus,26);
 close(partyWeaponBonuses({character:'main',allies:[guidance],fightPosition:'off'},weapons).dmgBonus,13);
});
test('Xianyun C2 replaces the base scaling/cap and affects one target per plunge',()=>{
 const cfg={actionKind:'plunge',fightPosition:'on',members:[{id:'10000093',constellation:2,effects:{a4:{enabled:true,sourceValue:10000}}}]};
 const pools=extendedBuffPools(cfg);assert.equal(pools[0].flatDamage,18000);
 const result=calculateAction({stats:{atk:1000,critRate:0,critDmg:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:90,enemyResistance:0,actionKind:'plunge',targetCount:3,hitCount:1,additivePools:pools});
 close(result.total,(3000+18000)*.5);assert.equal(Object.values(result.triggered)[0],1);
});
test('Neuvillette multiplier, Citlali C2 shred and Xilonen C2 recipient elements are distinct',()=>{
 const neuv={actionKind:'charged',targetName:'Jugement équitable',members:[{id:'10000087',own:true,constellation:2,effects:{glory:{enabled:true,stacks:3},c2:{enabled:true}}}]};
 const nb=extendedBuffBonuses(neuv);close(nb.talentScale,1.6);close(nb.chargedCritDmg,42);
 const cit={elementKey:'pyro',members:[{id:'10000107',constellation:2,effects:{a1:{enabled:true},c2shred:{enabled:true}}}]};
 assert.equal(extendedBuffBonuses(cit).resReduction,40);cit.elementKey='cryo';assert.equal(extendedBuffBonuses(cit).resReduction,undefined);
 const xilo={characterElement:'pyro',elementKey:'physical',members:[{id:'10000103',constellation:2,effects:{c2pyro:{enabled:true},c2hydro:{enabled:true}}}]};
 assert.deepEqual(extendedBuffBonuses(xilo),{atkPct:45});
});
test('manual HP/elapsed inputs are validated and Yelan growth clamps at 50%',()=>{
 const cfg={fightPosition:'on',members:[{id:'10000060',constellation:0,effects:{ramp:{enabled:true,sourceValue:100}}}]};
 assert.equal(extendedBuffBonuses(cfg).dmgBonus,50);
 delete cfg.members[0].effects.ramp.sourceValue;assert.equal(extendedBuffWarnings(cfg).length,1);
});
