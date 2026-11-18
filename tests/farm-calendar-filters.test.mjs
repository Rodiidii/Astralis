import test from 'node:test';
import assert from 'node:assert/strict';
import {filterFarmCalendarRows,farmCalendarMaterialIds,normalizeFarmCalendarFilters} from '../src/farm-calendar-filters.js';

const chars=[{_id:'amber',_name:'Amber'},{_id:'diluc',_name:'Diluc'}];
const rows=[
 {id:'one',characterIds:['amber'],materialIds:['book','boss']},
 {id:'two',character:'Diluc',materialIds:['book']},
 {id:'three',characterIds:['amber','diluc'],materialIds:['boss']},
 {id:'four',characterIds:['amber'],materialIds:[]}
];

test('calendar filters combine character and material while keeping multi-character sessions',()=>{
 assert.deepEqual(filterFarmCalendarRows(rows,{character:'amber'},chars).map(row=>row.id),['one','three','four']);
 assert.deepEqual(filterFarmCalendarRows(rows,{material:'book'},chars).map(row=>row.id),['one','two']);
 assert.deepEqual(filterFarmCalendarRows(rows,{character:'amber',material:'boss'},chars).map(row=>row.id),['one','three']);
});

test('legacy character names and malformed filters are handled safely',()=>{
 assert.deepEqual(filterFarmCalendarRows(rows,{character:'diluc'},chars).map(row=>row.id),['two','three']);
 assert.deepEqual(normalizeFarmCalendarFilters({character:null,material:3}),{character:'',material:'3'});
 assert.deepEqual(farmCalendarMaterialIds(rows,[{id:'book'},{id:'other'},{id:'boss'}]),['book','boss']);
});
