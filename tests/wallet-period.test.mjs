import test from 'node:test';
import assert from 'node:assert/strict';
import {walletBalance,claimReward} from '../src/wish-wallet.js';
import {periodIncome,incomeBreakdown} from '../src/planning-rules.js';
test('le solde convertit au plancher, garde les restes et ne confond pas zéro et ancien solde',()=>{
 assert.deepEqual(walletBalance({wishes:12,currentPrimos:159}),{wishes:12,primos:159,converted:0,remaining:159,available:12});
 assert.equal(walletBalance({wishes:12,currentPrimos:160}).available,13);assert.equal(walletBalance({primos:999,currentPrimos:0}).available,0);
 assert.equal(walletBalance({wishes:Infinity,currentPrimos:NaN}).available,0);
 const plan=claimReward({wishes:2,currentPrimos:159},'daily','2026-11-11');assert.equal(walletBalance(plan).available,3);assert.equal(walletBalance(plan).remaining,59);assert.equal(plan.history.length,1);assert.throws(()=>claimReward(plan,'daily','2026-11-11'));
});
test('les treize règles de revenus se retrouvent dans le détail sans double comptage',()=>{
 const result=periodIncome({start:'2026-11-04',end:'2026-12-16',welkin:true,theatre:750,abyss:600,maps:1,freeWishes:3,freeMultis:2,extraPrimos:159});
 const at=(date,label)=>result.ledger.find(row=>row.date===date&&row.label.includes(label));
 assert.equal(result.patches,2);assert.equal(at('2026-11-11','semaine 2').primos,450);assert.equal(at('2026-11-24','mardi').primos,40);assert.equal(at('2026-11-22','dimanche').primos,1000);assert.equal(at('2026-11-29','dimanche').primos,420);assert.equal(at('2026-12-09','mercredi').primos,420);assert.equal(at('2026-12-04','Codes').primos,300);
 assert.equal(at('2026-12-01','Boutique').wishes,5);assert.equal(at('2026-12-01','Théâtre').primos,750);assert.equal(at('2026-11-16','Abysses').primos,600);
 assert.equal(at('2026-12-16','Ajouts').wishes,23);assert.equal(at('2026-12-16','Exploration').primos,3000);
 const groups=incomeBreakdown(result.ledger);assert.equal(groups.reduce((n,r)=>n+r.primos,0),result.primos);assert.equal(groups.reduce((n,r)=>n+r.wishes,0),result.wishes);
 assert.equal(result.ledger.filter(r=>r.label==='Commissions quotidiennes').length,43);
});
