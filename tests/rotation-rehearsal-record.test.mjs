import test from 'node:test';
import assert from 'node:assert/strict';
import {formatRotationTime,rotationCueFrequencies,updateRotationRecord} from '../src/rotation-rehearsal.js';

test('records the first completed rotation as a personal best',()=>{
 const result=updateRotationRecord(null,4321,1000);
 assert.deepEqual(result,{bestMs:4321,bestAt:1000,runs:1,lastMs:4321,lastAt:1000});
});

test('audio practice cues use distinct action pitches and a three-note completion signal',()=>{
 assert.deepEqual(rotationCueFrequencies(0),[392]);
 assert.notDeepEqual(rotationCueFrequencies(1),rotationCueFrequencies(0));
 assert.deepEqual(rotationCueFrequencies(0,true),[523.25,659.25,783.99]);
});

test('keeps the best time while tracking later runs and the latest attempt',()=>{
 const previous={bestMs:4200,bestAt:1000,runs:3,lastMs:4600,lastAt:900};
 assert.deepEqual(updateRotationRecord(previous,4500,2000),{bestMs:4200,bestAt:1000,runs:4,lastMs:4500,lastAt:2000});
 assert.deepEqual(updateRotationRecord(previous,3800,3000),{bestMs:3800,bestAt:3000,runs:4,lastMs:3800,lastAt:3000});
});

test('ignores invalid runs and formats elapsed time for the team card',()=>{
 assert.equal(updateRotationRecord(null,NaN),null);
 assert.equal(updateRotationRecord(null,99),null);
 assert.equal(formatRotationTime(2750),'2,8 s');
});
