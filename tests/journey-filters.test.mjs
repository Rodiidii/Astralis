import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyEntryMatches,journeyFilteredRows,journeyWeeklyRecap,journeyActivityPattern,mergeJourneyImport,updateJourneyNoteCategory} from '../src/journey-log.js';

test('le carnet filtre par univers, type et mots de la note sans dépendre de la casse',()=>{
 const note={game:'gi',kind:'note',search:'souvenir personnel build furina genshin impact'};
 const visit={game:'hsr',kind:'visit',search:'mes builds hsr honkai star rail'};
 assert.equal(journeyEntryMatches(note,{query:'FURINA'}),true);
 assert.equal(journeyEntryMatches(note,{game:'gi',kind:'note'}),true);
 assert.equal(journeyEntryMatches(note,{game:'hsr'}),false);
 assert.equal(journeyEntryMatches(visit,{query:'build',game:'hsr',kind:'visit'}),true);
 assert.equal(journeyEntryMatches(visit,{kind:'note'}),false);
 assert.equal(journeyEntryMatches(note,{query:'absent'}),false);
 assert.equal(journeyEntryMatches({...note,day:'2026-11-15'},{day:'2026-11-15'}),true);
 assert.equal(journeyEntryMatches({...note,day:'2026-11-14'},{day:'2026-11-15'}),false);
 assert.equal(journeyEntryMatches({...note,category:'build'},{category:'build'}),true);
 assert.equal(journeyEntryMatches({...note,category:'farm'},{category:'build'}),false);
 assert.equal(journeyEntryMatches(visit,{category:'build'}),false);
});

test('l’export de sélection applique tous les filtres à l’archive complète, y compris aux notes',()=>{
 const rows=[
  {id:'note-1',game:'gi',kind:'note',category:'build',label:'Souvenir personnel',text:'Build Furina',at:new Date(2026,10,15,10).getTime(),day:'2026-11-15'},
  {id:'visit-1',game:'hsr',kind:'visit',section:'hsr-builds',label:'Mes builds HSR',at:new Date(2026,10,15,11).getTime(),day:'2026-11-15'},
  {id:'visit-2',game:'gi',kind:'visit',section:'characters',label:'Personnages',at:new Date(2026,10,14,11).getTime(),day:'2026-11-14'}
 ];
 assert.deepEqual(journeyFilteredRows(rows,{query:'furina',game:'gi',kind:'note',day:'2026-11-15'}).map(row=>row.id),['note-1']);
 assert.deepEqual(journeyFilteredRows(rows,{category:'build'}).map(row=>row.id),['note-1']);
 assert.deepEqual(journeyFilteredRows(rows,{game:'hsr'}).map(row=>row.id),['visit-1']);
 assert.deepEqual(journeyFilteredRows(rows,{}).map(row=>row.id),rows.map(row=>row.id));
});

test('les catégories de souvenirs survivent à une fusion et les valeurs inconnues restent exclues',()=>{
 const at=Date.now(),payload=[
  {id:'build',game:'gi',kind:'note',category:'build',text:'Build Furina',at},
  {id:'bad',game:'gi',kind:'note',category:'other',text:'Texte libre',at:at+1}
 ];
 const merged=mergeJourneyImport(payload,[]);
 assert.equal(merged.imported,2);
 assert.equal(merged.rows.find(row=>row.id==='build').category,'build');
 assert.equal(merged.rows.find(row=>row.id==='bad').category,undefined);
});

test('une catégorie peut être corrigée sans modifier les autres traces',()=>{
 const rows=[{id:'n1',kind:'note',text:'Mon build',category:'memory'},{id:'v1',kind:'visit',section:'builds'}];
 const result=updateJourneyNoteCategory(rows,'n1','build');
 assert.equal(result.updated,true);
 assert.equal(result.rows[0].category,'build');
 assert.equal(result.rows[1],rows[1]);
 assert.equal(updateJourneyNoteCategory(rows,'missing','build').updated,false);
 assert.equal(updateJourneyNoteCategory(rows,'n1','unknown').updated,false);
});

test('le bilan hebdomadaire compare deux fenêtres locales et recommande une escale récente',()=>{
 const at=new Date(2026,10,16,12).getTime(),rows=[
  {kind:'visit',game:'gi',section:'characters',label:'Personnages',day:'2026-11-14',at:new Date(2026,10,14,12).getTime()},
  {kind:'visit',game:'gi',section:'characters',label:'Personnages',day:'2026-11-15',at:new Date(2026,10,15,12).getTime()},
  {kind:'note',game:'gi',text:'Build à finir',day:'2026-11-15',at:new Date(2026,10,15,13).getTime()},
  ...Array.from({length:5},(_,index)=>({kind:'visit',game:'gi',section:'characters',label:'Personnages',day:'2026-11-09',at:new Date(2026,10,9,12,index).getTime()})),
  {kind:'note',game:'gi',text:'Entrée future ignorée',day:'2026-11-17',at:new Date(2026,10,17,12).getTime()},
 ];
 const recap=journeyWeeklyRecap(rows,new Date(at));
 assert.deepEqual({traces:recap.current.traces,visits:recap.current.visits,notes:recap.current.notes,activeDays:recap.current.activeDays},{traces:3,visits:2,notes:1,activeDays:2});
 assert.equal(recap.previous.traces,5);assert.equal(recap.change,-2);assert.equal(recap.changePercent,-40);assert.equal(recap.topPlace.count,2);assert.equal(recap.topPlace.section,'characters');
 assert.equal(journeyWeeklyRecap([],new Date(at)).changePercent,null);
});

test('le rythme sur huit semaines distingue les jours actifs des visites répétées et ignore les dates hors fenêtre',()=>{
 const now=new Date(2026,10,16,12),rows=[
  {kind:'visit',at:new Date(2026,10,14,18).getTime()},
  {kind:'visit',at:new Date(2026,10,14,19).getTime()},
  {kind:'visit',at:new Date(2026,10,16,8).getTime()},
  {kind:'note',at:new Date(2026,10,15,20).getTime()},
  {kind:'visit',at:new Date(2026,8,21,18).getTime()},
  {kind:'visit',at:new Date(2026,10,17,18).getTime()}
 ];
 const pattern=journeyActivityPattern(rows,now),saturday=pattern.days.find(day=>day.weekday===6),monday=pattern.days.find(day=>day.weekday===1);
 assert.equal(pattern.windowDays,56);assert.equal(pattern.totalVisits,3);assert.equal(saturday.possibleDays,8);assert.equal(saturday.activeDays,1);assert.equal(saturday.visits,2);assert.equal(monday.activeDays,1);assert.equal(pattern.peakDay.weekday,6);assert.equal(pattern.peakPeriod.id,'evening');
 const empty=journeyActivityPattern([],now);assert.equal(empty.peakDay,null);assert.equal(empty.peakPeriod,null);assert.equal(empty.totalVisits,0);
});
