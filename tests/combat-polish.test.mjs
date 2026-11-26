import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {energyPlan,favoniusTimeline,energyRequirement} from '../src/team-energy.js';
import {checkEnergyReference} from '../src/team-energy-reference.js';
import {normalizeTeamStats,teamStatOverrides} from '../src/team-stat-overrides.js';
test('distributed turret collection uses recipient field share and recipient recharge',()=>{
 const members=[{character:'a',name:'A',element:'electro',particles:4,collector:'time',onField:60,cost:60,er:200},{character:'b',name:'B',element:'electro',particles:0,onField:20},{character:'c',element:'hydro',particles:0,onField:10},{character:'d',element:'anemo',particles:0,onField:10}];
 const r=energyPlan(members);assert.ok(Math.abs(r.results[0].particleEnergy-10.08)<1e-8);assert.ok(Math.abs(r.results[1].particleEnergy-8.16)<1e-8);assert.equal(r.results[0].gained,20.16);
});
test('unused and alternate-cycle bursts are not forced to one cast',()=>{
 assert.equal(energyRequirement({cost:80,bursts:0,particleEnergy:20}),0);
 assert.equal(energyRequirement({cost:80,bursts:.5,particleEnergy:20}),200);
 assert.equal(energyRequirement({cost:60,bursts:1,flat:10,particleEnergy:25}),200);
});
test('timed Favonius accounts for its internal cooldown and excludes off-field hits',()=>{
 const r=favoniusTimeline({refinement:1,critRate:100,cycle:20,hitTimes:[0,1,2,3,13,{at:15,active:false}]});
 // 60% chance per critical hit; the first four hits cannot each produce particles.
 assert.ok(r.triggers>1&&r.triggers<2);assert.equal(r.hitTimes.length,5);
 const perfect=favoniusTimeline({refinement:5,critRate:100,cycle:20,hitTimes:[0,1,5.9,6,12,18]});assert.equal(perfect.triggers,4);assert.equal(perfect.particles,12);
});
test('three published ERC ledgers independently reproduce all twelve recharge targets',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/team-energy-reference.json',import.meta.url))),rows=checkEnergyReference(data);
 assert.equal(rows.length,3);for(const row of rows)for(const m of row.members)assert.ok(m.error<.00001,JSON.stringify(m));
 assert.ok(rows[0].members[0].computed>131&&rows[0].members[0].computed<132);
});
test('team overrides are isolated from linked build stats and can be reset',()=>{
 const base={atk:2000,er:120},before=JSON.stringify(base),slot={statOverrides:{atk:3500,er:'',hp:-1}};
 assert.deepEqual(normalizeTeamStats(slot.statOverrides),{atk:3500});assert.equal(teamStatOverrides(base,slot).atk,3500);assert.equal(JSON.stringify(base),before);assert.equal(teamStatOverrides(base,{}).atk,2000);
});


test('unmodeled weapon dependencies keep lab rendering valid after JSON import', async()=>{
 const {configuredWeaponBonuses,effectSetting}=await import('../src/lab-config.js');
 assert.deepEqual(effectSetting({},'weapon:12514',undefined),{enabled:false,stacks:1});
 assert.deepEqual(configuredWeaponBonuses({id:'12514'},{weaponRefinement:1}),{});
});
