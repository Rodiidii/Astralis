import test from 'node:test';
import assert from 'node:assert/strict';
import {theoreticalBudgetStatus} from '../src/wish-targets.js';
test('un budget non appliqué est distinct d’un budget zéro appliqué',()=>{
 assert.equal(theoreticalBudgetStatus({},{}).applied,false);assert.equal(theoreticalBudgetStatus({theoreticalPrimos:0},{}).applied,true);
});
test('changement de montant ou période signalé sans effacer le budget utilisé',()=>{
 const data={income:{start:'2026-11-04',end:'2026-12-16'},theoreticalPrimos:1000,theoreticalWishes:5,theoreticalPeriod:{start:'2026-11-04',end:'2026-12-16'}};
 assert.equal(theoreticalBudgetStatus(data,{primos:1000,wishes:5}).changed,false);
 assert.equal(theoreticalBudgetStatus(data,{primos:1100,wishes:5}).changed,true);
 assert.equal(theoreticalBudgetStatus({...data,income:{...data.income,end:'2026-12-17'}},{primos:1000,wishes:5}).changed,true);
 assert.equal(theoreticalBudgetStatus(data,{primos:1100,wishes:5}).primos,1000);
});
test('ancien budget sans période et période invalide explicitement signalés',()=>{
 assert.equal(theoreticalBudgetStatus({theoreticalPrimos:1000},{primos:1000}).changed,true);
 assert.equal(theoreticalBudgetStatus({}, {error:'Période invalide'}).invalid,true);
});
