import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeHomePrefs,nextHomeAction} from '../src/home-portal.js';
import {idleRules} from '../src/genshin-idle.js';
import {activateFestival,festivalEffects,festivalTheme} from '../src/express-festivals.js';
import {industry,industryBonuses,craftIndustry} from '../src/express-industry-model.js';

test('Personal home settings stay bounded and preserve every widget when reordered',()=>{
 const p=normalizeHomePrefs({height:5000,brightness:-30,accent:'red;display:none',widgets:['events','events','fake'],hidden:['tasks','bad'],motion:'invalid'});
 assert.equal(p.height,740);assert.equal(p.brightness,35);assert.equal(p.accent,'#a1e8d0');assert.equal(p.widgets[0],'events');assert.equal(p.widgets.length,4);assert.deepEqual(p.hidden,['tasks']);assert.equal(p.motion,'full');
});
test('Home suggests actual dated work before a generic destination',()=>{
 assert.equal(nextHomeAction({farm:[{title:'Aptitudes'}],today:[{title:'Objectif'}]}).nav,'farming');
 assert.equal(nextHomeAction({farm:[],today:[{title:'Objectif'}]}).title,'Objectif');
 assert.equal(nextHomeAction({farm:[],today:[],teams:2}).nav,'teams');
 assert.equal(nextHomeAction({farm:[],today:[],teams:0}).nav,'atlas');
});
test('Idle yields are proportional to elapsed time and capped at eight hours',()=>{
 const state=idleRules.baseState([{id:'amber'}]),rates=idleRules.rates(state),start=state.mora;
 idleRules.accrue(state,86400);assert.equal(state.mora-start,rates.mora*28800);
 const current=state.mora;idleRules.accrue(state,-100);assert.equal(state.mora,current);
});
test('Idle team upgrades alter actual passive production without sharing Express currency',()=>{
 const state=idleRules.baseState([{id:'amber'}]),before=idleRules.rates(state);state.owned[0].level=50;
 assert.ok(idleRules.rates(state).mora>before.mora);state.owned.push({id:'lisa',level:10});state.squad.push('lisa');assert.ok(idleRules.rates(state).experience>before.experience);
});
test('Regional celebrations consume materials once, expire, and respect their cooldown',()=>{
 const s={world:'gi',place:'mondstadt'},stock={flora:100,wood:100};assert.equal(activateFestival(s,stock,'unknown',1000),false);
 assert.equal(activateFestival(s,stock,'harvest',1000),true);assert.equal(stock.flora,88);assert.equal(stock.wood,94);
 assert.equal(activateFestival(s,stock,'harvest',2000),false);assert.equal(stock.flora,88);
 assert.equal(festivalEffects(s,1001).click,1.35);assert.deepEqual(festivalEffects(s,121001),{});assert.equal(activateFestival(s,stock,'harvest',250000),false);assert.equal(activateFestival(s,stock,'harvest',301001),true);
});
test('Festival bonuses belong to the selected region and universe',()=>{
 const s={world:'gi',place:'mondstadt'};activateFestival(s,{flora:20,wood:20},'harvest',1000);assert.equal(festivalEffects(s,2000).loot,1.2);
 s.place='liyue';assert.deepEqual(festivalEffects(s,2000),{});assert.match(festivalTheme(s).name,/lanternes/);s.world='hsr';assert.deepEqual(festivalEffects(s,2000),{});
});
test('Celebrations change the actual combat and recipe calculations',()=>{
 const s={world:'gi',place:'mondstadt',characters:{active:'amber',owned:[{key:'amber',level:10}]}},w=industry(s),base=industryBonuses(s,'amber',{});Object.assign(w.stock,{flora:100,wood:100,ore:100,crystal:100});
 assert.ok(activateFestival(s,w.stock,'encore'));const bonus=industryBonuses(s,'amber',{});assert.equal(bonus.energy,base.energy*1.25);assert.equal(bonus.speed,base.speed+8);assert.equal(bonus.crit,base.crit+.05);
 s.industry.festivals={};assert.ok(activateFestival(s,w.stock,'workshop'));const previous=w.stock.provisions||0;assert.ok(craftIndustry(s,'provisions'));assert.ok(w.stock.provisions-previous>=2);
});
