import test from 'node:test';
import assert from 'node:assert/strict';
import {farmRequirementProgress} from '../src/farm-simulator.js';

test('shows remaining requirements per character after priority stock allocation',()=>{
 const progress=farmRequirementProgress([{id:'book',name:'Guide',count:9},{id:'boss',name:'Core',count:2}],{book:6,boss:8});
 assert.equal(progress.required,11);assert.equal(progress.owned,8);assert.equal(progress.remaining,3);assert.equal(progress.complete,1);assert.equal(progress.total,2);assert.equal(progress.percent,73);
 assert.deepEqual(progress.rows.map(row=>[row.id,row.owned,row.remaining]),[['book',6,3],['boss',2,0]]);
});

test('empty requirements are complete and malformed stock never creates negative remaining needs',()=>{
 assert.deepEqual(farmRequirementProgress([]),{rows:[],required:0,owned:0,remaining:0,complete:0,total:0,percent:100});
 const progress=farmRequirementProgress([{id:'x',count:2},{id:'y',count:-3}],{x:-5,y:4});
 assert.equal(progress.required,2);assert.equal(progress.owned,0);assert.equal(progress.remaining,2);assert.equal(progress.rows[1].remaining,0);
});
