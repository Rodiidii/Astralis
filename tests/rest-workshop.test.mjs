import test from 'node:test';
import assert from 'node:assert/strict';
import {claimReward,guaranteeDate,incomeGroups,observedStats} from '../src/wish-wallet.js';
import {officialNews,agendaEntries,versionCalendar} from '../src/agenda-model.js';
import {simulateFarm} from '../src/farm-simulator.js';
import {periodIncome} from '../src/planning-rules.js';

test('une récompense crédite les deux monnaies et bloque un double clic quotidien',()=>{
 const plan=claimReward({currentPrimos:150,wishes:2,welkin:true},'daily','2026-11-11');
 assert.equal(plan.currentPrimos,300);assert.equal(plan.wishes,2);
 assert.throws(()=>claimReward(plan,'daily','2026-11-11'));
 const shop=claimReward(plan,'reset','2026-11-11');assert.equal(shop.wishes,7);
 assert.throws(()=>claimReward(shop,'reset','2026-11-30'));
 const custom=claimReward(shop,'other','2026-11-11',{primos:60,wishes:1,label:'Exploration'});
 assert.equal(custom.currentPrimos,360);assert.equal(custom.wishes,8);
});
test('la date de garantie utilise le solde réel et les récompenses à leur date',()=>{
 assert.equal(guaranteeDate({characterPity:89,characterGuarantee:true,currentPrimos:100,wishes:0},{},'2026-11-11').date,'2026-11-11');
 const plan=claimReward({characterPity:89,characterGuarantee:true,currentPrimos:0,wishes:0},'daily','2026-11-12');
 assert.equal(guaranteeDate(plan,{},'2026-11-12').date,'2026-11-14');
 const ledger=periodIncome({start:'2026-11-15',end:'2026-11-16',theatre:1000,abyss:800}).ledger;
 assert.ok(ledger.some(row=>row.label==='Abysses'&&row.date==='2026-11-16'&&row.primos===800));
 assert.ok(!ledger.some(row=>row.label==='Théâtre'));
});
test('les camemberts excluent les corrections de solde et les statistiques restent observées',()=>{
 assert.deepEqual(incomeGroups([{rewardType:'daily',primos:60},{rewardType:'reset',count:5},{kind:'adjustment',primos:1000}]),[{label:'Quotidiennes',value:60},{label:'Boutique',value:800}]);
 const stats=observedStats({fiftyAttempts:10,fiftyLost:7,pulls:200,fourFeatured:20});assert.equal(stats.lossRate,70);assert.equal(stats.featuredRate,10);assert.equal(stats.every,10);
 assert.equal(observedStats().lossRate,null);
});
test('le fil officiel est indépendant du calendrier et normalise les dates RSS',()=>{
 const rows=officialNews([{id:'good',title:'Annonce',link:'https://genshin.hoyoverse.com/fr/news/1',date:'Tue, 10 Nov 2026 18:00:00 GMT'},{id:'bad',title:'Autre',link:'https://example.com'},{id:'farm',kind:'farm',link:'https://www.hoyolab.com/article/1'}]);
 assert.equal(rows.length,1);assert.equal(rows[0].date,'2026-11-10T18:00:00.000Z');
 const events=agendaEntries([{kind:'abyss',title:'Reset',start:'2026-11-16',end:'2026-11-16'},{kind:'farm',start:'2026-11-16',end:'2026-11-16'}]);assert.equal(events.length,1);assert.equal(events[0].category,'endgame');
 assert.ok(versionCalendar('2026-12').some(v=>v.start.startsWith('2026-12-16')&&v.estimated));
});
test('trois boss différents accompagnent le planning et les jours manuels sont réservés',()=>{
 const materials=[1,2,3].map(i=>({id:113050+i,sources:['Boss '+i+' (Niv.70+)']}));
 const result=simulateFarm({start:'2026-11-09',maxDays:7,reservedDates:['2026-11-10'],characters:materials.map((m,i)=>({id:'p'+i,requirements:[{id:m.id,count:2}]})),materials});
 assert.equal(result.sessions.filter(s=>s.supplements.length).length,3);
 assert.ok(result.sessions.every(s=>s.date!=='2026-11-10'));
 assert.equal(new Set(result.sessions.flatMap(s=>s.supplements.map(x=>x.person))).size,3);
});
