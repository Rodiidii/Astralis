import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFarm} from '../src/farm-simulator.js';
const start='2026-11-09';
test('EXP avant Mora, sans alternance artificielle',()=>{
 const result=simulateFarm({start,materials:[{id:202}],characters:[{id:'a',xp:4*1102500,requirements:[{id:202,count:540000}]}]});
 assert.deepEqual(result.sessions.map(row=>row.kind),['xp','xp','xp','xp','mora']);
});
test('un boss partagé distribue son rendement restant aux personnages suivants',()=>{
 const item={id:113055,sources:['Narval (Niv.70+)']};
 const result=simulateFarm({start,materials:[item],characters:[{id:'a',requirements:[{id:item.id,count:1}]},{id:'b',requirements:[{id:item.id,count:1.5}]}]});
 assert.equal(result.sessions.length,1);assert.deepEqual(result.sessions[0].supplements.map(x=>x.person),['a','b']);
 assert.equal(result.sessions[0].weeklyResin,30);assert.equal(result.dates.a,start);assert.equal(result.dates.b,start);
});
test('quatrième boss disponible : 60 résines, sans fausse limite de trois boss',()=>{
 const materials=Array.from({length:4},(_,i)=>({id:113050+i,sources:['Boss '+i+' (Niv.70+)']}));
 const result=simulateFarm({start,maxDays:7,materials,characters:materials.map((m,i)=>({id:'p'+i,requirements:[{id:m.id,count:2}]}))});
 assert.equal(result.sessions.length,4);assert.deepEqual(result.sessions.map(s=>s.weeklyResin),[30,30,30,60]);assert.equal(result.unfinished.length,0);
});
test('la résine hebdomadaire réduit le rendement de l’activité principale',()=>{
 const item={id:113055,sources:['Narval (Niv.70+)']};
 const result=simulateFarm({start,materials:[item,{id:202}],characters:[{id:'a',requirements:[{id:item.id,count:2.5},{id:202,count:540000}]}]});
 assert.equal(result.sessions[0].kind,'mora');assert.equal(result.sessions[0].weeklyResin,30);assert.equal(result.sessions[1].kind,'mora');
 assert.equal(result.dates.a,'2026-11-10');
});
