import test from 'node:test';
import assert from 'node:assert/strict';
import {artifactAdvice} from '../src/lab-advice.js';
import {complexEffects} from '../src/complex-effects.js';
import {parseActionValue,activeBuffBonuses} from '../src/lab-actions.js';
import {configuredWeaponBonuses} from '../src/lab-config.js';
import {readFileSync} from 'node:fs';
const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));
test('Escoffier: explicit 1–4 Hydro/Cryo tiers and element gating',()=>{
 for(const [count,amount]of [[1,5],[2,10],[3,15],[4,55]]){
  for(const elementKey of ['hydro','cryo','pyro']){
   const result=complexEffects({escoffier:{enabled:true,hydroCryoCount:count}},{elementKey});
   if(elementKey==='pyro')assert.equal(result.bonuses.resReduction,undefined);else assert.ok(Math.abs(result.bonuses.resReduction-amount)<1e-9);
   assert.equal(result.warnings.length,0);
  }
 }
});
test('artifact advice compares exact counterfactuals and avoids negative stats',async()=>{
 const result=await artifactAdvice({em:0,critRate:99,critDmg:100},async stats=>({ok:true,total:(1+Math.min(100,stats.critRate)/100*stats.critDmg/100)*(1+stats.em/1000)}));
 assert.equal(result.ok,true);assert.ok(result.rows.every(row=>Number.isFinite(row.percent)));
 assert.ok(!result.rows.some(row=>row.changes.em<0));
 const em=result.rows.find(row=>row.label==='+30 maîtrise élémentaire');assert.ok(Math.abs(em.percent-3)<1e-9);
 assert.ok(result.rows.every((row,i)=>i===0||result.rows[i-1].percent>=row.percent));
});
test('conditional weapon stacks scale with refinement and Widsith melodies do not stack',()=>{
 const weapon={...weapons.find(row=>row.id===11515),_id:'test'};
 const state={weaponRefinement:5,effectStates:{'weapon:test:bond':{enabled:true,stacks:3}}};
 assert.equal(configuredWeaponBonuses(weapon,state).dmgBonus,96);
 assert.equal(configuredWeaponBonuses(weapon,state).critDmg,40);
 const widsith={...weapons.find(row=>row.id===14402),_id:'random'};
 const result=configuredWeaponBonuses(widsith,{effectStates:{'weapon:random:recital':{enabled:true},'weapon:random:aria':{enabled:true}}});
 assert.equal(result.atkPct,60);assert.equal(result.pyroDmg,undefined);
});
test('EM scaling and self/other recipients with constellation locks',()=>{
 assert.equal(parseActionValue('DGT : 250% EM').baseStat,'em');
 const p={character:'active',constellation:0,allies:[{character:'support',constellation:1}],buffs:[{sourceCharacter:'support',recipient:'self',type:'atkPct',value:30},{sourceCharacter:'support',recipient:'others',type:'em',value:100},{sourceCharacter:'support',constellationRequired:2,type:'critRate',value:20}]};
 assert.deepEqual(activeBuffBonuses(p),{em:100});
 p.allies[0].constellation=2;assert.equal(activeBuffBonuses(p).critRate,20);
});

import {calculateHit,calculateAction} from '../src/damage-engine.js';
test('direct Lunar damage excludes DEF, ordinary DMG, flat bonuses and uses lunar EM formula',()=>{
 const input={stats:{atk:1000,em:200,critRate:50,critDmg:100,dmgBonus:90,electroDmg:80},baseStat:'atk',talentMultiplier:.65,attackerLevel:90,enemyLevel:100,enemyResistance:.1,flatDamage:999,damageBonus:100,reaction:{kind:'lunarDirect',id:'lunarCharged',baseBonus:.14,bonus:.2,elevation:.1,flatDamage:100}};
 const expected=(3*650*1.14*(1+1200/2200+.2)+100)*1.1*1.5*.9;
 const hit=calculateHit(input);assert.equal(hit.ok,true);assert.ok(Math.abs(hit.total-expected)<1e-9);assert.equal(hit.defenseMultiplier,1);
 const next=calculateHit({...input,enemyLevel:1,enemyDefenseReduction:.8,damageBonus:0,flatDamage:0,stats:{...input.stats,dmgBonus:0,electroDmg:0}});assert.equal(next.total,hit.total);
 const action=calculateAction({...input,hitCount:2,reactingHits:0,additivePools:[{id:'ordinary',flatDamage:10000,charges:2}]});assert.equal(action.total,hit.total*2);assert.deepEqual(action.triggered,{});
});
