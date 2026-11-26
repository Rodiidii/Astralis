import test from 'node:test';import assert from 'node:assert/strict';
import {knowledgeState,documentId,upsertDocument,diffLines,validateKnowledgeImport,mergeKnowledge,pathBetween,knowledgeMarkdown,knowledgeGraphSummary} from '../src/knowledge-model.js';
import {calcConsistency,planExportICS,mergeFarmBackup} from '../src/progression-workbench.js';
test('new source text preserves personal notes, excerpts and consulted references',()=>{let s=upsertDocument({}, {title:'Nahida',text:'Ancien',sources:[{url:'https://example.com',checked:true}]});const id=documentId('Nahida');s.documents[id].notes=[{id:'n',text:'Personnel'}];s=upsertDocument(s,{title:'Nahida',text:'Nouveau',sources:[{url:'https://example.com'}]});assert.equal(s.documents[id].notes[0].text,'Personnel');assert.equal(s.documents[id].sources[0].checked,true);assert.equal(s.documents[id].text,'Nouveau');});
test('carnet backup validation and merge preserve existing private notes',()=>{let a=upsertDocument({},{title:'A',text:'Texte'}),b=structuredClone(a),id=documentId('A');a.documents[id].notes=[{id:'a',text:'A'}];b.documents[id].notes=[{id:'b',text:'B'}];const out=mergeKnowledge(a,validateKnowledgeImport(JSON.stringify(b)));assert.equal(out.documents[id].notes.length,2);assert.throws(()=>validateKnowledgeImport('{"version":1,"documents":{"__proto__":{}}}'));assert.ok(knowledgeMarkdown(out.documents[id]).includes('Notes personnelles'));});
test('source revision comparison and graph paths operate on actual values',()=>{assert.deepEqual(diffLines('a\nb','b\nc'),{added:['c'],removed:['a'],unchanged:1});assert.deepEqual(pathBetween([{a:'a',b:'b'},{a:'b',b:'c'}],'a','c'),['a','b','c']);assert.deepEqual(pathBetween([],'a','c'),[]);});
test('spreadsheets flag inconsistent values and calculate shares without inventing a result',()=>{const r=calcConsistency({time:20,dps:1000,dpr:30000,members:[{dps:750},{dps:250}]});assert.equal(r.inconsistent,true);assert.deepEqual(r.shares,[75,25]);assert.equal(calcConsistency({}).inconsistent,false);});
test('farm ICS exports all-day dates with valid escaped calendar text',()=>{const s=planExportICS([{id:'x',date:'2026-11-26',title:'Aptitudes; Aino',resin:180}]);assert.ok(s.includes('DTSTART;VALUE=DATE:20261126'));assert.ok(s.includes('Aptitudes  Aino'));assert.ok(!s.includes('DTSTART:undefined'));});

test('farm backup restores weapon goals and missing stock without overwriting the current plan',()=>{
 const current={calendar:[{id:'a',date:'2026-11-26',title:'Current'}],roster:[],weapons:[{id:'w',level:90}],inventory:{mora:50},xp:{purple:3},journal:[]};
 const pack={format:'astralis-farm-v1',calendar:[{id:'a',date:'2026-11-26',title:'Old'},{id:'b',date:'2026-11-27'}],weapons:[{id:'w',level:1},{id:'x',level:80}],inventory:{mora:10,book:7},xp:{purple:1,blue:5}};
 const out=mergeFarmBackup(current,pack);assert.equal(out.calendar.length,2);assert.equal(out.calendar[0].title,'Current');assert.equal(out.weapons[0].level,90);assert.equal(out.weapons.length,2);assert.deepEqual(out.inventory,{mora:50,book:7});assert.deepEqual(out.xp,{purple:3,blue:5});assert.equal(current.calendar.length,1);
 assert.throws(()=>mergeFarmBackup(current,{...pack,roster:'bad'}));assert.throws(()=>mergeFarmBackup(current,{...pack,inventory:{mora:-2}}));
});

test('carnet restore rejects malformed text and unsafe imported identifiers before rendering',()=>{
 assert.throws(()=>validateKnowledgeImport('{"version":1,"documents":"bad"}'));
 const s=upsertDocument({},{title:'A',text:'Source'});s.documents[documentId('A')].notes=[{id:'"><img',text:'Bad'}];assert.throws(()=>validateKnowledgeImport(JSON.stringify(s)));
});

test('relation reciprocity uses the direction of original evidence inside grouped links',()=>{
 const edges=[{a:'a',b:'b',proofs:[{from:'a',to:'b'},{from:'b',to:'a'}]},{a:'b',b:'c',proofs:[{from:'b',to:'c'}]}];
 assert.deepEqual(knowledgeGraphSummary(edges),{nodes:3,pairs:2,proofs:3,reciprocal:1});
 assert.equal(knowledgeGraphSummary([{a:'a',b:'b',proofs:[{from:'a',to:'b'}]}]).reciprocal,0);
});
