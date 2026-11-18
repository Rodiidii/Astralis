import test from 'node:test';
import assert from 'node:assert/strict';
import {canScheduleTetrisDrop} from '../src/arcade-loop.js';

test('Tetris schedules a drop only while its live board is active',()=>{
 assert.equal(canScheduleTetrisDrop(),true);
 for(const state of [
  {mounted:false},
  {hidden:true},
  {mode:'memory'},
  {mode:'reactions'},
  {paused:true},
  {ended:true},
 ]) assert.equal(canScheduleTetrisDrop(state),false,JSON.stringify(state));
});

test('Tetris drop resumes only after its actual pause or visibility gate clears',()=>{
 assert.equal(canScheduleTetrisDrop({hidden:false,paused:false,mode:'tetris'}),true);
 assert.equal(canScheduleTetrisDrop({hidden:false,paused:true,mode:'tetris'}),false);
 assert.equal(canScheduleTetrisDrop({hidden:true,paused:false,mode:'tetris'}),false);
});
