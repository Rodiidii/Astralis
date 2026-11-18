import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeJourneyImport} from '../src/journey-log.js';

const now=Date.now();
const visit={id:'visit-1',kind:'visit',game:'gi',section:'characters',label:'Personnages',at:now-5000,day:'2026-11-15'};
const note={id:'note-1',kind:'note',game:'hsr',label:'Souvenir personnel',text:'Une équipe à essayer',at:now-3000,day:'2026-11-15'};

test('importe une archive ou un export enveloppé puis fusionne les lignes sans doublon',()=>{
 const current=[visit];
 const result=mergeJourneyImport({entries:[visit,note]},current);
 assert.equal(result.imported,1);
 assert.equal(result.skipped,1);
 assert.deepEqual(result.rows.map(row=>row.id),['visit-1','note-1']);
 assert.equal(current.length,1,'les données source ne sont pas modifiées');
});

test('normalise Wuwa et les dates manquantes, limite les textes et écarte les entrées invalides',()=>{
 const result=mergeJourneyImport([
  {id:'old-wuwa',kind:'visit',game:'wuwa',section:'characters',label:'X'.repeat(200),at:now-1000},
  {id:'bad-game',kind:'note',game:'unknown',text:'non',at:now},
  {id:'empty-note',kind:'note',game:'gi',text:'  ',at:now}
 ]);
 assert.equal(result.imported,1);
 assert.equal(result.skipped,2);
 assert.equal(result.rows[0].game,'ww');
 assert.equal(result.rows[0].label.length,120);
 assert.match(result.rows[0].day,/^\d{4}-\d{2}-\d{2}$/);
});

test('rejette un format inconnu, une date future et une archive démesurée',()=>{
 assert.throws(()=>mergeJourneyImport({history:[]}),/liste de traces/);
 const result=mergeJourneyImport([{...visit,id:'future',at:Date.now()+2*86400000}]);
 assert.equal(result.imported,0);
 assert.equal(result.skipped,1);
 assert.throws(()=>mergeJourneyImport(Array(5001).fill(visit)),/5 000/);
});

test('conserve les 600 entrées les plus récentes après fusion',()=>{
 const existing=Array.from({length:600},(_,i)=>({...visit,id:`old-${i}`,at:now-10000+i}));
 const result=mergeJourneyImport([{...note,id:'newest',at:now}],existing);
 assert.equal(result.rows.length,600);
 assert.equal(result.rows.at(-1).id,'newest');
 assert.equal(result.rows[0].id,'old-1');
});
