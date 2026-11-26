import test from 'node:test';
import assert from 'node:assert/strict';
import {claimReward,undoReward,walletBalance,guaranteeDate} from '../src/wish-wallet.js';
import {recordDashboardIncome,dailyIncomeSummary} from '../src/dashboard-ledger.js';
import {projectPeople,endgamePreparation,serverTimestamp,dayResinBudget,programmeICS} from '../src/dashboard-preparation-model.js';
const date='2026-11-26';
test('quotidiennes et Faveur séparées : 60 + 90, sans doublon même avec ancien journal combiné',()=>{
 let p=claimReward({currentPrimos:0,welkin:true},'welkin',date);
 p=claimReward(p,'daily',date);assert.equal(p.currentPrimos,150);assert.throws(()=>claimReward(p,'welkin',date),/déjà/);
 const old=claimReward({currentPrimos:0,welkin:true},'daily',date);assert.equal(old.currentPrimos,150);assert.throws(()=>claimReward(old,'welkin',date),/déjà/);
 const separate=claimReward({currentPrimos:0,welkin:true},'daily',date,{separateWelkin:true});assert.equal(separate.currentPrimos,60);
});
test('annuler puis corriger un gain conserve le solde, la catégorie et les comparaisons',()=>{
 let p=recordDashboardIncome({currentPrimos:10},{category:'theatre',date,primos:620,wishes:0,note:'8 actes'},date);
 assert.equal(p.currentPrimos,630);p=undoReward(p,p.history[0].id,date);
 p=recordDashboardIncome(p,{category:'theatre',date,primos:800,wishes:0},date);
 assert.equal(p.currentPrimos,810);assert.equal(dailyIncomeSummary(p,date).primos,800);
 assert.throws(()=>recordDashboardIncome(p,{category:'theatre',date,primos:800,wishes:0},date),/déjà/);
});
test('gains : dates calendaires impossibles, avenir, fractions et valeurs négatives sont refusés',()=>{
 for(const entry of [{date:'2026-02-31'},{date:'2026-11-27'},{primos:-1},{wishes:0.1},{category:'unknown'}])assert.throws(()=>recordDashboardIncome({},{category:'other',date,primos:10,wishes:0,...entry},date));
 const p=recordDashboardIncome({},{category:'code',date,primos:300,wishes:2},date);assert.equal(p.history[0].rewardType,'code');assert.equal(walletBalance(p).available,3);
});
test('prévision : une Faveur déjà encaissée ne repasse pas dans la garantie',()=>{
 const options={characterPity:89,characterGuarantee:true,welkin:true,theatreGain:0,abyssGain:0,currentPrimos:90,history:[{id:'f',date,rewardType:'welkin',rewardPeriod:date,primos:90}]};
 assert.equal(guaranteeDate(options,{},date).date,'2026-11-27');
});
test('le plan réunit personnages actifs, sessions partagées et suivis sans doublon et avec leur build',()=>{
 const c={people:[{id:'a',sourceId:'1'},{id:'b',sourceId:'2'},{id:'c'},{id:'d'}],farmProjects:[{id:'a',active:true}],farmRows:[{characterIds:['a','b'],done:false}],builds:[{id:'build-b',character:'2'}]};
 const rows=projectPeople(c,['c','a']);assert.deepEqual(rows.map(r=>r.id),['a','b','c']);assert.equal(rows[1].builds[0].id,'build-b');assert.equal(rows[0].sessions.length,1);
});
test('endgame : prochain contenu uniquement si publié, jamais une composition périmée',()=>{
 const now=new Date('2026-11-26T12:00:00Z'),data={windows:{theater:{end:'2026-12-01T04:00'}},theater:{bosses:[{name:'Current'}]},archive:{rotations:[{kind:'theater',published:true,start:'2026-12-01T04:00',bosses:[{name:'Next'}]}]}};
 assert.equal(endgamePreparation(data,'theater',now).bosses[0].name,'Next');data.archive.rotations[0].published=false;
 const current=endgamePreparation(data,'theater',now);assert.equal(current.upcoming,false);assert.equal(current.bosses[0].name,'Current');
 assert.equal(endgamePreparation(data,'theater',new Date('2026-12-02')).hasContent,false);
 assert.equal(serverTimestamp('2026-12-01T04:00:00','europe'),Date.parse('2026-12-01T03:00:00Z'));
});
test('résine : seules les sessions restantes du jour sont décomptées',()=>{
 assert.deepEqual(dayResinBudget([{date,resin:40},{date,resin:60,done:true},{date:'2026-11-27',resin:180}],date,25),{planned:40,available:25,missing:15,runs20:2});
});
test('agenda ICS : dates exclusives, accents, échappement et pliage UTF-8 à 75 octets',()=>{
 const text=programmeICS([{id:'x',date,title:'Événement, '+('é'.repeat(90)),resin:40},{id:'done',date,done:true}], [{kind:'theater',title:'Théâtre',end:'2026-12-01T03:00:00Z'}],new Date('2026-11-26T12:00:00Z'));
 assert.match(text,/DTEND;VALUE=DATE:20261127/);assert.match(text,/DTSTART:20261201T030000Z/);assert.match(text,/Événement\\,/);assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,2);
 for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75,line);
});
