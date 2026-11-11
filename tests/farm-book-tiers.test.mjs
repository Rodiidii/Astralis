import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFarm,craftableInventory,allocateFarmInventory,FARM_YIELDS} from '../src/farm-simulator.js';
const books=[0,1,2].map(i=>({id:104301+i,rarity:i+2,sortRank:13101,typeText:'Matériau d’aptitude de personnage',daysOfWeek:['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']}));
const simulate=(requirements,extra={})=>simulateFarm({start:'2026-11-09',materials:books,characters:[{id:'a',requirements}],...extra});
test('des livres violets ne peuvent pas remplacer les verts et bleus manquants',()=>{
 assert.equal(simulate([{id:104301,count:60}]).sessions.length,3);
 assert.equal(simulate([{id:104302,count:300}]).sessions.length,13);
 assert.equal(simulate([{id:104301,count:60}],{inventory:{104303:10000}}).sessions.length,3);
});
test('la réserve de rareté inférieure est partagée et réservée avant les synthèses',()=>{
 const result=simulate([], {characters:[{id:'a',requirements:[{id:104303,count:9}]},{id:'b',requirements:[{id:104301,count:6}]}]});
 assert.equal(result.dates.a,'2026-11-09');assert.equal(result.dates.b,'2026-11-09');
 const stock=craftableInventory([{id:104301,count:6},{id:104303,count:1}],books,{104301:9});
 assert.equal(stock[104301],6);assert.equal(stock[104302],1);assert.equal(stock[104303]||0,0);
});
test('les fractions de rendement hebdomadaire persistent, sans perte ni conversion inverse',()=>{
 const weekly={id:113055,sources:['Narval (Niv.70+)']};
 const result=simulate([{id:104301,count:39},{id:113055,count:2.5}],{materials:[...books,weekly]});
 assert.equal(result.sessions.length,3);assert.equal(result.sessions[0].weeklyResin,30);
 assert.ok(Math.abs(result.sessions[0].expectedDrops.find(x=>x.id==='104301').count-20*150/180)<1e-9);
 assert.equal(result.dates.a,'2026-11-11');
});
test('les rendements annoncés suivent exactement le scénario demandé',()=>{
 assert.deepEqual(FARM_YIELDS.talent,[20,18,2]);assert.equal(FARM_YIELDS.resin,180);
 assert.equal(FARM_YIELDS.xp,1102500);assert.equal(FARM_YIELDS.mora,540000);assert.equal(FARM_YIELDS.boss,15.75);assert.equal(FARM_YIELDS.weekly,2.5);
});

test('la priorité explicite gouverne le stock partagé, sans modifier les entrées',()=>{
 const characters=[{id:'second',priority:1,requirements:[{id:104303,count:3}]},{id:'first',priority:0,requirements:[{id:104303,count:3}]}];
 const result=simulate([], {characters,inventory:{104303:3}});
 assert.equal(result.dates.first,'2026-11-09');assert.equal(result.sessions[0].characterIds[0],'second');assert.equal(characters[0].id,'second');
});

test('l’allocation utilisée par les fiches ne réutilise pas le même stock pour deux personnages',()=>{
 const characters=[{id:'a',requirements:[{id:104301,count:6},{id:104302,count:1}]},{id:'b',requirements:[{id:104301,count:3},{id:104302,count:2}]}];
 const result=allocateFarmInventory(characters,books,{104301:12,104302:1});
 assert.equal(result.allocation.a[104301],6);assert.equal(result.allocation.b[104301],3);
 assert.equal(result.allocation.a[104302],1);assert.equal(result.allocation.b[104302],1);assert.equal(result.remaining.b.find(r=>r.id==='104302').count,1);
 assert.equal(result.unallocated[104301],0);assert.equal(result.unallocated[104302],0);
});

test('les matériaux de monstres réservent aussi tous les besoins avant synthèse',()=>{
 const mobs=[0,1,2].map(i=>({id:112005+i,rarity:1+i,sortRank:2001,typeText:'Matériau de monstre'}));
 const stock=craftableInventory([{id:112005,count:9},{id:112006,count:2},{id:112007,count:1}],mobs,{112005:27});
 assert.equal(stock[112005],9);assert.equal(stock[112006],3);assert.equal(stock[112007],1);
 const allocations=allocateFarmInventory([{id:'a',requirements:[{id:112005,count:6},{id:112006,count:2}]},{id:'b',requirements:[{id:112005,count:3},{id:112007,count:1}]}],mobs,{112005:27});
 assert.equal(allocations.remaining.b.find(r=>r.id==='112007').count,0);assert.equal(allocations.allocation.b[112005],3);
});
