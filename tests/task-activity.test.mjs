import test from 'node:test';
import assert from 'node:assert/strict';
import {taskActivitySummary} from '../src/task-activity.js';

const localStamp=(day,hour=12)=>new Date(2026,10,day,hour).getTime();

test('summarizes real completion timestamps over the last seven local days',()=>{
 const result=taskActivitySummary([
  {done:true,completedAt:localStamp(10)},
  {done:true,completedAt:localStamp(10,17)},
  {done:true,completedAt:localStamp(12)},
  {done:false,completedAt:localStamp(12)},
  {done:true,completedAt:localStamp(1)},
 ],localStamp(12,20));
 assert.equal(result.days.length,7);
 assert.equal(result.days.at(-1).count,1);
 assert.equal(result.total,3);
 assert.equal(result.peak,2);
 assert.equal(result.average,0.4);
 assert.equal(result.previousTotal,1);
 assert.equal(result.delta,2);
 assert.equal(result.trend,'up');
});

test('compares the immediately preceding local week and handles a zero baseline',()=>{
 const result=taskActivitySummary([{done:true,completedAt:localStamp(12)},{done:true,completedAt:localStamp(5)}],localStamp(12,20));
 assert.equal(result.previousTotal,1);
 assert.equal(result.delta,0);
 assert.equal(result.trend,'steady');
 const growth=taskActivitySummary([{done:true,completedAt:localStamp(12)}],localStamp(12,20));
 assert.equal(growth.previousTotal,0);
 assert.equal(growth.trend,'up');
});

test('counts an active streak from today, or yesterday when today is still empty',()=>{
 const rows=[{done:true,completedAt:localStamp(10)},{done:true,completedAt:localStamp(11)},{done:true,completedAt:localStamp(12)}];
 assert.equal(taskActivitySummary(rows,localStamp(12,20)).streak,3);
 assert.equal(taskActivitySummary(rows,localStamp(13,20)).streak,3);
 assert.equal(taskActivitySummary([],localStamp(13,20)).streak,0);
});

test('ignores undone tasks and missing completion timestamps',()=>{
 const result=taskActivitySummary([{done:false,completedAt:localStamp(12)},{done:true},{done:true,completedAt:localStamp(12)}],localStamp(12,20));
 assert.equal(result.total,1);
 assert.equal(result.streak,1);
});
