import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFarm,materialKind} from '../src/farm-simulator.js';
import {simulateWishOrder} from '../src/wish-simulation.js';
const books=[0,1,2].map(i=>({id:104301+i,rarity:i+2,sortRank:13101,typeText:"Matériau d’aptitude de personnage",daysOfWeek:['Lundi','Jeudi','Dimanche']}));
const start='2026-11-09';
test('les livres disponibles sont convertis uniquement après réservation globale',()=>{
 const result=simulateFarm({start,materials:books,inventory:{104301:9},characters:[{id:'a',requirements:[{id:104302,count:2}]},{id:'b',requirements:[{id:104301,count:6}]}]});
 assert.equal(result.sessions.length,1);assert.equal(result.sessions[0].kind,'talent');assert.equal(result.dates.b,start);
});
test('un domaine partagé consomme une seule journée et respecte les jours ouverts',()=>{
 const result=simulateFarm({start:'2026-11-10',materials:books,characters:[{id:'a',requirements:[{id:104302,count:10}]},{id:'b',requirements:[{id:104302,count:10}]}]});
 assert.equal(result.sessions.length,1);assert.equal(result.sessions[0].date,'2026-11-12');assert.deepEqual(result.sessions[0].characterIds,['a','b']);
});
test('spécialités hors résine et fin intégrant les repousses partagées',()=>{
 const item={id:100023,typeText:'Produit de Mondstadt'};
 assert.equal(materialKind(item),'specialty');
 const result=simulateFarm({start,materials:[item],specialties:{100023:{capacity:37}},characters:[{id:'a',requirements:[{id:100023,count:40}]},{id:'b',requirements:[{id:100023,count:40}]}]});
 assert.equal(result.sessions.length,0);assert.equal(result.dates.a,'2026-11-11');assert.equal(result.dates.b,'2026-11-13');
});
test('un boss hebdomadaire n’est réclamé qu’une fois par semaine',()=>{
 const item={id:113055,sources:['Narval (Niv.70+)']};
 const result=simulateFarm({start,materials:[item],characters:[{id:'a',requirements:[{id:113055,count:6}]}]});
 const claims=result.sessions.filter(s=>s.supplements.length);assert.equal(claims.length,3);assert.equal(new Set(claims.map(s=>s.date)).size,3);assert.ok(claims.every(s=>s.weeklyResin===30));
});
test('garanties, budget nul et ordre successif des objectifs de vœux',()=>{
 const rows=[{name:'A',copies:1},{name:'B',copies:1,refinements:1}];
 const none=simulateWishOrder(rows,{wishes:0},500);assert.equal(none.rows[0].chance,0);
 const full=simulateWishOrder(rows,{characterPity:89,characterGuarantee:true,wishes:400},500);assert.equal(full.rows[0].median,1);assert.equal(full.rows[1].chance,100);assert.ok(full.rows[1].median>full.rows[0].median);
 assert.deepEqual(full,simulateWishOrder(rows,{characterPity:89,characterGuarantee:true,wishes:400},500));
});

test('le budget théorique additionne les restes de primogemmes avant conversion',()=>{const result=simulateWishOrder([],{currentPrimos:159,theoreticalPrimos:1},10);assert.equal(result.budget,0);assert.equal(result.theory,1);});

test('les journées d’artéfacts occupent les jours les moins prioritaires',()=>{const result=simulateFarm({start,artifactDays:4,materials:books,characters:[{id:'a',requirements:[{id:104303,count:300}]}]});assert.equal(result.sessions[0].date,start);assert.equal(result.sessions[0].kind,'talent');const firstWeek=result.sessions.filter(s=>s.date<'2026-11-16');assert.equal(firstWeek.filter(s=>s.kind==='artifact').length,4);assert.ok(firstWeek.filter(s=>s.kind==='talent').every(s=>[1,4,0].includes(new Date(s.date+'T12:00:00').getDay())));});
