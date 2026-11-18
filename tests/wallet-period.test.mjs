import test from 'node:test';
import assert from 'node:assert/strict';
import {walletBalance,claimReward,undoReward,wishLedgerCsv,effectiveWishIncome,incomeGroups,incomeComparisons} from '../src/wish-wallet.js';
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

test('un gain journalisé peut être annulé une fois sans casser le solde courant',()=>{
 const original=claimReward({wishes:2,currentPrimos:159},'daily','2026-11-11');
 const gain=original.history[0];
 const undone=undoReward(original,gain.id,'2026-11-12');
 assert.equal(walletBalance(undone).available,2);
 assert.equal(undone.currentPrimos,159);
 assert.equal(undone.wishes,2);
 assert.equal(undone.history.at(-1).undoOf,gain.id);
 assert.throws(()=>undoReward(undone,gain.id),/déjà été annulé/);
 assert.throws(()=>undoReward({wishes:0,currentPrimos:0,history:[gain]},gain.id),/solde a changé/);
});

test('les gains annulés ne gonflent plus les graphiques ni les comparaisons de revenus',()=>{
 const gained=claimReward({wishes:0,currentPrimos:0},'other','2026-11-12',{primos:640,label:'Exploration'}),plan=undoReward(gained,gained.history[0].id,'2026-11-13');
 assert.equal(plan.history.length,2);
 assert.equal(effectiveWishIncome(plan.history).length,0);
 assert.deepEqual(incomeGroups(plan.history),[]);
 assert.equal(incomeComparisons(plan.history,'2026-11-15').find(row=>row.id==='week').current,0);
});

test('le journal de vœux s’exporte en CSV compatible tableur, corrections et accents compris',()=>{
 const csv=wishLedgerCsv([{id:'a',date:'2026-11-15',label:'Faveur, journée "bonus"',rewardType:'daily',primos:150,count:0,balancePrimos:150,balanceWishes:0},{id:'b',date:'2026-11-15',label:'Correction · solde',kind:'adjustment',primos:-5,count:0,balancePrimos:145,balanceWishes:0},{id:'c',date:'2026-11-15',label:'Annulation',kind:'adjustment',undoOf:'a',primos:-150,count:0,balancePrimos:0,balanceWishes:0}]);
 assert.ok(csv.startsWith('\uFEFF"Date";"Origine";"Type";'));
 assert.match(csv,/"Faveur, journée ""bonus""";"daily";"150";"0";"150";"0";"Oui"/);
 assert.match(csv,/"Correction · solde";"Correction";"-5"/);
 assert.match(csv,/"Annulation";"Correction";"-150"/);
});
