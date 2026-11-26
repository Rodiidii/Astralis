import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {sheetReport,createCalcSheet,recalculateSheet,sheetCsv} from '../src/calc-workspace-model.js';
import {loungeState,companionRoom,startConversation,composeCompanionTurn,companionVoice,appendCompanionTurn,finishCompanionSession} from '../src/companion-lounge-model.js';
import {PACK_PROFILES,drawPokemonPack,validatePackPool,packRarity} from '../src/pokemon-pack-rates.js';
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/pokemon-tcg-catalog.json',import.meta.url),'utf8'));
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
test('CalcSheets calculates contributions, flags incoherent totals and keeps the linked team unchanged',()=>{
 const team={id:'a',name:'Équipe',members:[{character:'1',weapon:'2'}],rotation:[{character:'1',code:'E',count:2}],rotationTime:20};
 const sheet=createCalcSheet(team,{character:[{_id:'1',_name:'Flins'}],weapon:[{_id:'2',_name:'Favonius'}]},'sheet-a');assert.equal(sheet.members[0].name,'Flins');assert.equal(sheet.rotation,'Flins E ×2');
 sheet.dpr=30000;sheet.dps=1000;sheet.members[0].dps=750;sheet.members[1].dps=250;assert.equal(sheetReport(sheet).mismatch,true);
 assert.equal(recalculateSheet(sheet).dps,1500);const next=recalculateSheet(sheet,'members');assert.equal(next.dps,1000);assert.equal(next.dpr,20000);assert.equal(next.members[0].share,'75.0 %');assert.equal(team.members[0].dps,undefined);assert.match(sheetCsv(next),/"Flins"/);
});
test('Companion conversations retain context without inventing ER or unrecorded farm sessions',()=>{
 const profile={companion:'Nahida',goal:'Préparer Flins'},room=companionRoom(loungeState(),'p1');startConversation(room,'t1');
 const first=composeCompanionTurn('Revoir mon équipe',profile,{teamNames:['Flins / Ineffa']},[]);appendCompanionTurn(room,'Revoir mon équipe',first,{_id:'nahida',_name:'Nahida'});
 const follow=composeCompanionTurn('continue',profile,{},room.threads[0].messages);assert.equal(follow.topic,'team');assert.match(follow.text,/Favonius/);assert.doesNotMatch(follow.text,/\d+ %/);
 const farm=composeCompanionTurn('Que farmer ?',profile,{farmNames:['Aptitudes de Flins']});assert.match(farm.text,/Aptitudes de Flins/);assert.match(composeCompanionTurn('Que farmer ?',profile,{}).text,/ne contient pas/);
 assert.equal(room.threads[0].messages[1].speaker,'Nahida');assert.equal(companionRoom(loungeState(),'p2').threads.length,0);
});
test('Companion session times derive from elapsed time and remain independent of game objectives',()=>{
 const room=companionRoom(loungeState(),'p1');room.session={started:100000,minutes:15};const row=finishCompanionSession(room,161500,'Livres terminés');assert.equal(row.seconds,61);assert.equal(row.note,'Livres terminés');assert.equal(room.session,null);assert.equal(room.sessions.length,1);
});
test('Documented Pokémon packs retain actual slot composition and support a rare and reverse copy together',()=>{
 for(const id of Object.keys(PACK_PROFILES)){const cards=catalogue.cards.filter(c=>c.setId===id);assert.equal(validatePackPool(cards,id).ok,true);const rows=drawPokemonPack(cards,{id},{rng:seeded(42)});assert.equal(rows.length,10);assert.equal(rows.filter(x=>x.slot==='common').length,4);assert.equal(rows.filter(x=>x.slot==='uncommon').length,3);assert.equal(rows.filter(x=>x.finish!=='normal').length,3);assert.ok(rows.every(x=>x.card.setId===id));}
 const demo=catalogue.cards.filter(c=>c.setId==='sv05'),sequence=[.99,.99,.99,...Array(7).fill(0),0,0,0];let cursor=0;const twins=drawPokemonPack(demo,{id:'sv05'},{rng:()=>sequence[cursor++]??0});assert.equal(twins[0].card.id,twins[7].card.id);assert.equal(twins[0].finish,'normal');assert.equal(twins[7].finish,'reverse');
 assert.throws(()=>drawPokemonPack(catalogue.cards,{id:'sv06'}),/Aucune étude/);
 const free=drawPokemonPack(catalogue.cards,{id:'sv06'},{mode:'catalogue',rng:seeded(4)});assert.equal(free.length,10);assert.ok(free.every(x=>!x.documented&&x.card.setId==='sv06'));
});
test('200,000 pack simulation per documented set follows every measured rarity rate',()=>{
 const observed={};for(const[id,profile]of Object.entries(PACK_PROFILES)){const pool=catalogue.cards.filter(c=>c.setId===id),n=200000,counts={};for(const key of Object.keys(profile.rates))counts[key]=0;const rng=seeded(id==='sv05'?137:761);
  for(let i=0;i<n;i++){const rows=drawPokemonPack(pool,{id},{rng});for(const x of rows.slice(7))if(Object.hasOwn(counts,x.rarity))counts[x.rarity]++;}
  observed[id]={packs:n,rates:{}};for(const[key,p]of Object.entries(profile.rates)){const actual=counts[key]/n,tolerance=5*Math.sqrt(p*(1-p)/n);assert.ok(Math.abs(actual-p)<tolerance,`${id} ${key}: ${actual} vs ${p}`);observed[id].rates[key]={expected:p,observed:actual,hits:counts[key]};}
 }
 fs.writeFileSync(new URL('../docs/booster-rates-observed.json',import.meta.url),JSON.stringify(observed,null,2));
});
test('Catalogue incompleteness cannot silently redistribute a missing rarity',()=>{
 const pool=catalogue.cards.filter(c=>c.setId==='sv05'&&packRarity(c)!=='hyper');assert.equal(validatePackPool(pool,'sv05').ok,false);assert.throws(()=>drawPokemonPack(pool,{id:'sv05'}),/toutes les raretés/);
});

test('Character conversation voices differ while all game data stays in the factual reply',()=>{
 const names=['Nahida','Mavuika','Furina','Skirk','Nilou','Zhongli','Alhaitham','Kaveh','Cyno','Dehya','Itto','Navia','Citlali','Collei','Paimon'];assert.equal(new Set(names.map(n=>companionVoice(n))).size,15);
 const a=composeCompanionTurn('Revoir mon équipe',{companion:'Mavuika'},{}),b=composeCompanionTurn('Revoir mon équipe',{companion:'Nahida'},{});assert.notEqual(a.text,b.text);assert.match(a.text,/Aucune équipe/);assert.match(b.text,/Aucune équipe/);
});
