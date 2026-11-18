import test from 'node:test';
import assert from 'node:assert/strict';
import {filterNotes,noteLibrarySummary,sortNotes} from '../src/note-filters.js';

const notes=[
 {id:'pinned',title:'Rotation Furina',body:'Réaction Vaporisation',tag:'Rotation',targetName:'Furina',pinned:true},
 {id:'plain',title:'Notes de farm',body:'Résine et matériaux',tag:'Farm',targetName:'Neuvillette',pinned:false},
 {id:'other',title:'Build',body:'test dégâts',tag:'Build',pinned:true},
];

test('note search ignores case and accents across title, body and linked character',()=>{
 assert.deepEqual(filterNotes(notes,{query:'furina'}).map(note=>note.id),['pinned']);
 assert.deepEqual(filterNotes(notes,{query:'resine'}).map(note=>note.id),['plain']);
 assert.deepEqual(filterNotes(notes,{query:'NEUVILLETTE'}).map(note=>note.id),['plain']);
});

test('note filters combine category, search and pinned-only without mutating source',()=>{
 assert.deepEqual(filterNotes(notes,{tag:'Rotation',pinnedOnly:true}).map(note=>note.id),['pinned']);
 assert.deepEqual(filterNotes(notes,{query:'farm',pinnedOnly:true}),[]);
 assert.deepEqual(filterNotes(notes,{pinnedOnly:true}).map(note=>note.id),['pinned','other']);
 assert.equal(notes.length,3);
});

test('note library summary counts linked, pinned and recent notes without counting future dates',()=>{
 const now=1_800_000_000_000,week=7*24*60*60*1000;
 const summary=noteLibrarySummary([
  {targetName:'Furina',pinned:true,updated:now-1000},
  {targetName:'',pinned:false,updated:now-week-1},
  {targetName:'Neuvillette',pinned:true,updated:now+1000},
  {targetName:'   ',updated:0},
 ],now);
 assert.deepEqual(summary,{total:4,pinned:2,linked:2,updatedThisWeek:1});
 assert.deepEqual(noteLibrarySummary(null,now),{total:0,pinned:0,linked:0,updatedThisWeek:0});
});

test('note sorting supports recent, oldest, title and character while keeping pins first',()=>{
 const rows=[
  {id:'z',title:'Zeta',targetName:'Furina',updated:1},
  {id:'pinned',title:'Aster',targetName:'Neuvillette',updated:2,pinned:true},
  {id:'a',title:'Alpha',targetName:'Furina',updated:3},
  {id:'blank',title:'Sans lien',updated:4},
 ];
 assert.deepEqual(sortNotes(rows).map(row=>row.id),['pinned','blank','a','z']);
 assert.deepEqual(sortNotes(rows,'oldest').map(row=>row.id),['pinned','z','a','blank']);
 assert.deepEqual(sortNotes(rows,'title').map(row=>row.id),['pinned','a','blank','z']);
 assert.deepEqual(sortNotes(rows,'character').map(row=>row.id),['pinned','a','z','blank']);
 assert.deepEqual(rows.map(row=>row.id),['z','pinned','a','blank']);
});
