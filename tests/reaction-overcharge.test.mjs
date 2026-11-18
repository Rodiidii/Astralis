import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreReactionMatch,reactionBoostRemaining} from '../src/reaction-overcharge.js';

test('a four-or-more match charges eight seconds of double score for the next reactions',()=>{
 const match=scoreReactionMatch({size:4,chain:1,now:1000,boostUntil:0});
 assert.deepEqual(match,{points:300,multiplier:1,activated:true,boostUntil:9000});
 assert.equal(scoreReactionMatch({size:3,chain:2,now:2000,boostUntil:match.boostUntil}).points,600);
 assert.equal(scoreReactionMatch({size:3,chain:1,now:9000,boostUntil:match.boostUntil}).points,150);
});

test('an existing overcharge doubles bonus points and a new long match refreshes its timer',()=>{
 const match=scoreReactionMatch({size:5,chain:2,now:7000,boostUntil:9000});
 assert.equal(match.points,1200);
 assert.equal(match.multiplier,2);
 assert.equal(match.boostUntil,15000);
 assert.equal(reactionBoostRemaining(match.boostUntil,12500),2500);
 assert.equal(reactionBoostRemaining(match.boostUntil,16000),0);
});
