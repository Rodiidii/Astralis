import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWishTarget,wishTargetOwnership} from '../src/wish-targets.js';
import {orderedGuarantees} from '../src/planning-rules.js';
import {simulateWishOrder} from '../src/wish-simulation.js';
test('la possession prévaut sur des compteurs de copies obsolètes',()=>{
 const target={currentC:2,targetC:4,currentR:2,targetR:5,copies:7,refinements:5};
 assert.equal(normalizeWishTarget(target).copies,2);assert.equal(normalizeWishTarget(target).refinements,3);
 const guaranteed=orderedGuarantees([target],{})[0],sim=simulateWishOrder([target],{},100).rows[0];assert.equal(guaranteed.copies,sim.copies);assert.equal(guaranteed.refinements,sim.refinements);
 assert.equal(guaranteed.wishes,2*180+3*160);
});
test('objectifs déjà possédés sans coût ; C0 non possédé demande une copie',()=>{
 assert.equal(normalizeWishTarget({currentC:-1,targetC:0}).copies,1);
 const target={currentC:6,targetC:2,currentR:5,targetR:1};assert.equal(orderedGuarantees([target],{})[0].wishes,0);
 assert.equal(simulateWishOrder([target],{},100).rows[0].chance,100);
});
test('pity initiale utilisée une seule fois, budgets restants exacts',()=>{
 const rows=orderedGuarantees([{copies:1},{copies:1,refinements:1}],{characterPity:89,characterGuarantee:true,weaponPity:79,wishes:1,primos:159});
 assert.equal(rows[0].wishes,1);assert.equal(rows[0].missingPrimos,0);assert.equal(rows[1].wishes,261);assert.equal(rows[1].missingPrimos,261*160-159);
});
test('comptages bornés et entiers, anciens objectifs conservés',()=>{
 assert.equal(normalizeWishTarget({copies:2.9,refinements:1.8}).copies,2);assert.equal(normalizeWishTarget({copies:Infinity}).copies,0);
 assert.equal(normalizeWishTarget({currentC:99,targetC:99}).copies,0);
});
test('progression ownership expose seulement les possessions réellement renseignées',()=>{
 assert.deepEqual(wishTargetOwnership({copies:2,refinements:1}),{character:null,weapon:null});
 assert.deepEqual(wishTargetOwnership({currentC:-1,targetC:2,currentR:1,targetR:4}),{
  character:{from:'Non possédé',to:'C2',ownedCopies:0,targetCopies:3,progress:0},
  weapon:{from:'R1',to:'R4',ownedCopies:1,targetCopies:4,progress:25},
 });
 assert.equal(wishTargetOwnership({currentC:2,targetC:2,currentR:4,targetR:4}).character.progress,100);
 assert.equal(wishTargetOwnership({currentC:-1,targetC:0}).character.progress,0);
});
