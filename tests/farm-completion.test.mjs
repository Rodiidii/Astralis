import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFarm} from '../src/farm-simulator.js';
const start='2026-11-11';
test('une récolte inconnue ne reçoit pas une fausse date malgré une autre récolte connue',()=>{
 const materials=[{id:100001,typeText:'Produit de Mondstadt'},{id:100002,typeText:'Produit de Mondstadt'}];
 const result=simulateFarm({start,materials,specialties:{100002:{capacity:10}},characters:[{id:'a',requirements:[{id:100001,count:10},{id:100002,count:30}]}]});
 assert.equal(result.dates.a,undefined);assert.equal(result.completion.a.status,'missing-harvest-data');assert.deepEqual(result.completion.a.unknownHarvestIds,['100001']);
});
test('la limite de simulation reste explicite et ne produit pas de date de fin',()=>{
 const result=simulateFarm({start,maxDays:1,materials:[{id:202}],characters:[{id:'a',requirements:[{id:202,count:2000000}]}]});
 assert.equal(result.dates.a,undefined);assert.equal(result.completion.a.status,'horizon-exceeded');assert.ok(result.unfinished.length);
});
test('un stock hors résine manquant distingue estimation et préparation complète',()=>{
 const result=simulateFarm({start,materials:[{id:112001}],characters:[{id:'a',requirements:[{id:112001,count:5}]}]});
 assert.equal(result.dates.a,start);assert.equal(result.completion.a.status,'manual-stock-needed');assert.deepEqual(result.completion.a.manualIds,['112001']);
 const ready=simulateFarm({start,materials:[{id:112001}],inventory:{112001:5},characters:[{id:'a',requirements:[{id:112001,count:5}]}]});assert.equal(ready.completion.a.status,'estimated');
});
