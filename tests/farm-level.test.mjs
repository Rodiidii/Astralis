import test from 'node:test';
import assert from 'node:assert/strict';
import {farmLevelGoal} from '../src/planning-rules.js';
test('EXP réelle par niveau : total 1–90 et palier 80–90 sans interpolation',()=>{
 assert.equal(farmLevelGoal({}).xp,8362650);
 assert.equal(farmLevelGoal({}).mora,1672530);
 assert.equal(farmLevelGoal({levelFrom:80,levelTo:90}).xp,3423125);
 assert.equal(farmLevelGoal({levelFrom:80,levelTo:90}).mora,684625);
 assert.equal(farmLevelGoal({levelFrom:1,levelTo:2}).xp,1000);
 assert.equal(farmLevelGoal({levelFrom:2,levelTo:3}).xp,1325);
 assert.equal(farmLevelGoal({levelFrom:40,levelTo:40}).xp,0);
});
test('addition des niveaux adjacents et ascensions cohérentes',()=>{
 const first=farmLevelGoal({levelFrom:1,levelTo:20}),rest=farmLevelGoal({levelFrom:20,levelTo:90});
 assert.equal(first.xp,120175);assert.equal(first.xp+rest.xp,8362650);
 assert.deepEqual(first.ascensions,[]);assert.deepEqual(rest.ascensions,[1,2,3,4,5,6]);
});
