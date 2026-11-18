
import test from 'node:test';import assert from 'node:assert/strict';
import {relationRank,relationEvidenceProfile,concentricRelations,proofsForMode} from '../src/relation-ranks.js';
import {sharedVoiceTargets} from '../src/relation-ranks.js';
test('les mentions communes respectent le sens et excluent le Voyageur',()=>{
 const edges=[{proofs:[
  {from:'a',to:'c',kind:'voice'}, {from:'b',to:'c',kind:'voice'},
  {from:'a',to:'10000005',kind:'voice'}, {from:'b',to:'10000005',kind:'voice'},
  {from:'d',to:'a',kind:'voice'}, {from:'b',to:'d',kind:'voice'},
  {from:'a',to:'e',kind:'story'}, {from:'b',to:'e',kind:'voice'},
  {from:'a',to:'f',kind:'voice',scope:'collective'}, {from:'b',to:'f',kind:'voice'}
 ]}];
 assert.deepEqual(sharedVoiceTargets(edges,'a','b'),['c']);
 assert.deepEqual(sharedVoiceTargets([],'a','b'),[]);
});
const p={id:'q',source:'https://example.org',quote:'source'};
test('les rangs ne transforment pas une scène en amitié',()=>{
assert.equal(relationRank([{...p,kind:'story',quest:'quest'}]).rank,2);
assert.equal(relationRank([{...p,kind:'voice',scope:'collective'}]).rank,1);
assert.equal(relationRank([{...p,kind:'voice'}]).rank,4);
assert.equal(relationRank([{...p,relationType:'family',explicitRelation:true}]).rank,5);
assert.equal(relationRank([{...p,source:''}]).rank,0);
});
test('le résumé de proximité reste attaché aux preuves et ne prétend pas mesurer les émotions',()=>{
 const profile=relationEvidenceProfile([
  {...p,kind:'voice',from:'a',to:'b'},
  {...p,id:'s1',kind:'story',quest:'quest-1'},
  {...p,id:'s2',kind:'story',quest:'quest-1'},
  {...p,id:'collective',kind:'voice',scope:'collective'}
 ]);
 assert.equal(profile.rank,4);
 assert.equal(profile.voiceCount,1);
 assert.equal(profile.storyCount,2);
 assert.equal(profile.questCount,1);
 assert.equal(profile.collectiveCount,1);
 assert.match(profile.details,/1 mention/);
 assert.equal(relationEvidenceProfile([]).label,'Aucun lien direct documenté');
 assert.equal(relationEvidenceProfile([{...p,source:'',kind:'voice'}]).proofCount,0);
});
test('centrement et positions finies pour cent personnages',()=>{
const people=Array.from({length:140},(_,i)=>({id:String(i)}));const points=concentricRelations(people,[],'0');
assert.equal(points[0].x,500);assert.equal(points.length,140);assert.ok(points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
});

test('les modes distinguent les voix, le lore et le degré sans modifier les preuves',()=>{
 const rows=[{...p,kind:'voice'},{...p,kind:'voice',scope:'collective'},{...p,kind:'story',quest:'q'}];
 assert.deepEqual(proofsForMode(rows,'voice'),[rows[0]]);
 assert.deepEqual(proofsForMode(rows,'lore'),[rows[2]]);
 assert.deepEqual(proofsForMode(rows,'connection'),rows);
});
