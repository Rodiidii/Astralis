import test from 'node:test';
import assert from 'node:assert/strict';
import {energyPlan,favoniusWindow,energyElement,profileParticles} from '../src/team-energy.js';
test('elemental particles use the recipient element, collector, party size and recipient ER',()=>{
 const members=[{character:'a',name:'A',element:'pyro',particles:4,collector:0,cost:60,er:200},{character:'b',name:'B',element:'pyro',particles:0,collector:1,cost:80,er:100},{character:'c',name:'C',element:'hydro',particles:0,collector:2,cost:60,er:100},{character:'d',name:'D',element:'cryo',particles:0,collector:3,cost:60,er:100}];
 const r=energyPlan(members);assert.equal(r.results[0].particleEnergy,12);assert.ok(Math.abs(r.results[1].particleEnergy-7.2)<1e-8);assert.equal(r.results[2].particleEnergy,2.4);assert.equal(r.results[0].gained,24);assert.equal(r.results[0].required,500);
});
test('Favonius produces three neutral particles, never six flat energy',()=>{
 const r=energyPlan([{character:'a',name:'A',element:'anemo',particles:0,cost:60,er:200,favonius:true,confirmed:1,windows:1,refinement:1,favCollector:0},{character:'b',name:'B',element:'pyro',particles:0,cost:60,er:100},{character:'c',name:'C',particles:0},{character:'d',name:'D',particles:0}],{cycle:20,mode:'confirmed'});
 assert.equal(r.results[0].gained,12);assert.ok(Math.abs(r.results[1].particleEnergy-3.6)<1e-8);
});
test('Favonius crit chance, refinement proc probability, independent hits, cooldown and confirmed triggers',()=>{
 const r=favoniusWindow({refinement:1,critRate:50,hits:2,windows:10,cycle:20});assert.equal(r.available,2);assert.ok(Math.abs(r.chance-.51)<1e-8);assert.ok(Math.abs(r.particles-3.06)<1e-8);
 assert.equal(favoniusWindow({refinement:5,critRate:100,hits:1,windows:20,cycle:20}).available,4);
 assert.equal(favoniusWindow({refinement:1,critRate:0,hits:1,windows:1,cycle:20}).particles,0);
 assert.equal(favoniusWindow({refinement:1,windows:1,cycle:20,confirmed:3}).triggers,1);
});
test('flat energy is not multiplied by recharge and special bursts receive no ER target',()=>{
 const r=energyPlan([{character:'a',name:'A',element:'geo',particles:3,collector:0,cost:40,flat:10,er:200},{character:'b',name:'B',particles:0,cost:0,special:true}],{});assert.equal(r.results[0].gained,28);assert.ok(Math.abs(r.results[0].required-333.3333333333333)<1e-8);assert.equal(r.results[1].required,null);
});
test('missing particle and cost values remain explicitly incomplete; accents map to game elements',()=>{
 const r=energyPlan([{character:'a',name:'A',particles:'',element:'',cost:''}],{});assert.equal(r.warnings.length,3);assert.equal(r.results[0].required,null);assert.equal(energyElement('Électro'),'electro');assert.equal(energyElement('Anémo'),'anemo');
});
test('Flins generation caps at five hits per skill state, and short bursts cost 30 each',()=>{
 assert.equal(profileParticles({particles:1,maxEvents:5},8),5);
 assert.equal(profileParticles({particles:1,maxEvents:5},3),3);
 const r=energyPlan([{character:'Flins',element:'electro',name:'Flins',particles:5,collector:0,cost:30,bursts:2,er:200}],{});
 assert.equal(r.results[0].cost,60);assert.equal(r.results[0].gained,30);assert.equal(r.results[0].required,400);
});
test('electro resonance requires two Electro characters and obeys its five second cooldown',()=>{
 const a={character:'a',name:'A',element:'electro',particles:0,collector:0,cost:30,er:100};
 assert.equal(energyPlan([a],{cycle:20,electroProcs:9}).sources.length,1);
 const r=energyPlan([a,{...a,character:'b'}],{cycle:20,electroProcs:9,electroCollector:0});
 assert.equal(r.sources.at(-1).count,4);assert.equal(r.results[0].gained,12);
});
