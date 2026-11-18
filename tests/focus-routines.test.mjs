import test from 'node:test';
import assert from 'node:assert/strict';
import {appendFocusTask,compareFocusSession,deleteFocusRoutine,focusBreakRemaining,focusHistoryMatches,focusSprintSuggestion,mergeFocusHistory,normalizeFocusAnnotation,normalizeFocusRoutine,pauseFocusOnExit,saveFocusRoutine} from '../src/focus-station.js';

test('adds one non-empty step at a time and caps active checklists at twelve',()=>{
 const session={tasks:[{text:'Étape initiale',done:false}]};assert.equal(appendFocusTask(session,'  Vérifier les matériaux  '),true);assert.deepEqual(session.tasks.at(-1),{text:'Vérifier les matériaux',done:false});assert.equal(appendFocusTask(session,'   '),false);session.tasks=Array.from({length:12},(_,index)=>({text:`Étape ${index}`,done:false}));assert.equal(appendFocusTask(session,'Étape de trop'),false);assert.equal(session.tasks.length,12);
});

test('normalizes a personal routine and bounds its editable checklist',()=>{
 const row=normalizeFocusRoutine({id:'one',game:'unknown',mode:'bad',title:'  Session Skirk  ',tasks:[' Domaine ','',...Array(14).fill('Étape')]});
 assert.equal(row.game,'gi');assert.equal(row.mode,'free');assert.equal(row.title,'Session Skirk');assert.equal(row.tasks.length,12);assert.equal(row.tasks[0],'Domaine');
});

test('saves custom routines without mutating prior data and limits the shelf',()=>{
 const initial=Array.from({length:3},(_,i)=>({id:`r${i}`,game:'gi',mode:'farm',title:`Routine ${i}`,tasks:[]}));
 const updated=saveFocusRoutine(initial,{id:'r3',game:'hsr',mode:'team',title:'Équipe',tasks:['Cycle']},3);
 assert.equal(initial.length,3);assert.deepEqual(updated.map(row=>row.id),['r1','r2','r3']);assert.equal(updated.at(-1).game,'hsr');
 assert.deepEqual(saveFocusRoutine(updated,{id:'r2',game:'gi',mode:'build',title:'Build',tasks:[]},3).map(row=>row.id),['r1','r3','r2']);
});

test('deletes only the selected routine and rejects blank titles',()=>{
 const rows=[{id:'a'},{id:'b'}];assert.deepEqual(deleteFocusRoutine(rows,'a'),[{id:'b'}]);assert.equal(rows.length,2);assert.equal(normalizeFocusRoutine({id:'x',title:'  '}),null);
});

test('filters completed sessions by objective, game, and activity',()=>{
 const rows=[{title:'Farm talents Furina',game:'gi',mode:'farm'},{title:'Cycle Kafka',game:'hsr',mode:'team'},{title:'Boss hebdomadaire',game:'ww',mode:'boss'}];
 assert.deepEqual(focusHistoryMatches(rows,{query:'furina'}),[rows[0]]);
 assert.deepEqual(focusHistoryMatches(rows,{game:'hsr',mode:'team'}),[rows[1]]);
 assert.deepEqual(focusHistoryMatches(rows,{game:'gi',mode:'boss'}),[]);
});

test('compares only earlier sessions with the same game, activity, and objective',()=>{
 const old={game:'gi',mode:'farm',title:'Domaine de l’Ingéniosité',durationMs:600000,endedAt:1000},same={game:'gi',mode:'farm',title:'Domaine de l’Ingéniosité',durationMs:900000,endedAt:2000},later={game:'gi',mode:'farm',title:'Domaine de l’Ingéniosité',durationMs:1200000,endedAt:3000},other={game:'hsr',mode:'farm',title:'Domaine de l’Ingéniosité',durationMs:300000,endedAt:500};
 assert.deepEqual(compareFocusSession(same,[old,same,later,other]),{samples:1,averageMs:600000,deltaMs:300000,percent:50});
 assert.equal(compareFocusSession(old,[old,same,later]),null);
 assert.equal(compareFocusSession(other,[old,other]),null);
});

test('imports focus history by merging valid unique rows and rejecting duplicates or malformed data',()=>{
 const existing=[{id:'old-id',game:'gi',mode:'farm',title:'Domaine',durationMs:60000,startedAt:100,endedAt:200}],incoming={history:[{id:'different-id',game:'gi',mode:'farm',title:'Domaine',durationMs:60000,startedAt:100,endedAt:200},{id:'new-id',game:'hsr',mode:'team',title:'Mémoire',durationMs:120000,startedAt:300,endedAt:400,done:9,total:4},{game:'nope',mode:'free',title:'Invalide',durationMs:1,endedAt:500}]};
 const result=mergeFocusHistory(existing,incoming);assert.equal(result.added,1);assert.equal(result.skipped,2);assert.equal(result.history.length,2);assert.equal(result.history[1].game,'hsr');assert.equal(result.history[1].done,9);
});

test('suggests a sprint from comparable sessions only and falls back to 25 minutes',()=>{
 const rows=[{game:'gi',mode:'farm',focusDurationMs:15*60000},{game:'gi',mode:'farm',focusDurationMs:45*60000},{game:'hsr',mode:'farm',focusDurationMs:60*60000}];
 assert.deepEqual(focusSprintSuggestion([], 'gi','farm'),{minutes:25,samples:0});
 assert.deepEqual(focusSprintSuggestion(rows,'gi','farm'),{minutes:25,samples:2});
 assert.deepEqual(focusSprintSuggestion(rows,'hsr','farm'),{minutes:60,samples:1});
 assert.deepEqual(focusSprintSuggestion(rows,'gi','team'),{minutes:25,samples:0});
});

test('pauses an active focus session on app exit and preserves elapsed time and sprint balance',()=>{
 const data={active:{status:'running',elapsedMs:12000,resumedAt:1000,focusDurationMs:300000,focusRemainingMs:180000,focusResumedAt:2000,tasks:[{text:'Domaine',done:false}]},history:[]};
 const result=pauseFocusOnExit(data,12000);
 assert.equal(result.active.status,'paused');assert.equal(result.active.elapsedMs,23000);assert.equal(result.active.focusRemainingMs,170000);
 assert.equal(result.active.resumedAt,undefined);assert.equal(result.active.focusResumedAt,undefined);assert.equal(result.active.tasks[0].text,'Domaine');
 const unchanged={active:{status:'paused',elapsedMs:50},history:[]};assert.equal(pauseFocusOnExit(unchanged,100),unchanged);assert.equal(unchanged.active.elapsedMs,50);
});

test('pauses a planned break on app exit without consuming closed-app time',()=>{
 const data={active:{status:'break',breakDurationMs:600000,breakRemainingMs:600000,breakResumedAt:10000,elapsedMs:30000,tasks:[]},history:[]};
 const result=pauseFocusOnExit(data,70000);
 assert.equal(result.active.status,'paused');assert.equal(result.active.breakRemainingMs,540000);assert.equal(result.active.breakAvailable,true);assert.equal(result.active.breakResumedAt,undefined);
 assert.equal(focusBreakRemaining(result.active,90000),540000);
});


test('keeps a bounded character annotation and note through history import',()=>{
 const metadata=normalizeFocusAnnotation({characterId:'furina',characterName:'  Furina  ',characterImage:'javascript:alert(1)',note:'x'.repeat(520)});
 assert.deepEqual(metadata,{characterId:'furina',characterName:'Furina',characterImage:'',note:'x'.repeat(500)});
 const result=mergeFocusHistory([],[{id:'annotated',game:'gi',mode:'build',title:'Build Furina',durationMs:60000,startedAt:1000,endedAt:61000,characterId:'furina',characterName:'Furina',characterImage:'/assets/furina.webp',note:'Vérifier le set'}]);
 assert.equal(result.history[0].characterName,'Furina');assert.equal(result.history[0].characterImage,'/assets/furina.webp');assert.equal(result.history[0].note,'Vérifier le set');
});
