import test from 'node:test';
import assert from 'node:assert/strict';
import {incomeComparisons,guaranteeDate} from '../src/wish-wallet.js';
import {periodIncome} from '../src/planning-rules.js';
test('comparaison hebdomadaire à jours égaux, conversion des vœux et exclusion des corrections',()=>{
 const history=[{date:'2026-11-09',primos:60},{date:'2026-11-10',count:1},{date:'2026-11-11',primos:1000,kind:'adjustment'},
  {date:'2026-11-02',primos:100},{date:'2026-11-05',primos:99999}];
 const week=incomeComparisons(history,'2026-11-11')[0];
 assert.equal(week.current,220);assert.equal(week.previous,100);assert.equal(week.delta,120);assert.equal(week.percent,120);
 assert.equal(week.from,'2026-11-09');assert.equal(week.previousTo,'2026-11-04');
});
test('mois de longueurs différentes et base nulle : pas de pourcentage infini',()=>{
 const rows=incomeComparisons([{date:'2026-03-31',primos:160},{date:'2026-02-28',primos:320}],'2026-03-31');
 assert.equal(rows[1].previousTo,'2026-02-28');assert.equal(rows[1].delta,-160);assert.equal(rows[1].percent,-50);
 assert.equal(incomeComparisons([],'2026-11-11')[0].percent,null);
});
test('scénario personnel : carte en 7.2/7.4, pas en 7.3 ; cadeaux 7.4 et 8.0 désactivables',()=>{
 const options={start:'2026-11-04',end:'2027-08-25',autoMaps:true,versionGifts:true};
 const rows=periodIncome(options).ledger;
 assert.ok(rows.some(r=>r.date==='2026-11-04'&&r.label.startsWith('Exploration')&&r.primos===3000));
 assert.ok(!rows.some(r=>r.date==='2026-12-16'&&r.label.startsWith('Exploration')));
 assert.ok(rows.some(r=>r.date==='2027-01-27'&&r.label.startsWith('Exploration')));
 assert.equal(rows.find(r=>r.label==='Multi offerte · 7.4').wishes,10);
 assert.equal(rows.find(r=>r.label==='Deux multis offertes · 8.0').wishes,20);
 const manual=periodIncome({...options,autoMaps:false,versionGifts:false,maps:2}).ledger;
 assert.ok(!manual.some(r=>r.label.includes('offerte')));
 assert.equal(manual.filter(r=>r.label.startsWith('Exploration')).reduce((s,r)=>s+r.primos,0),6000);
});

test('la date de garantie ne crédite pas deux fois les cartes du scénario',()=>{
 const income={start:'2026-11-04',end:'2027-08-25',autoMaps:true,versionGifts:true,theatre:0,abyss:0};
 const plan={characterPity:0,characterGuarantee:true,currentPrimos:5000,wishes:0};
 let budget=5000;const expected=periodIncome({...income,end:'2028-11-03'}).ledger.find(row=>{budget+=row.primos+160*row.wishes;return budget>=14400;}).date;
 assert.equal(guaranteeDate(plan,income,'2026-11-04').date,expected);
});
