import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeExpandedTeamIds,updateExpandedTeamIds} from '../src/team-detail-state.js';

test('expanded team details survive render state changes and discard removed teams',()=>{
 const valid=['alpha','beta'];
 assert.deepEqual([...normalizeExpandedTeamIds('["alpha","missing","alpha",4]',valid)],['alpha']);
 const expanded=updateExpandedTeamIds(new Set(['alpha']),'beta',true,valid);
 assert.deepEqual([...expanded],['alpha','beta']);
 assert.deepEqual([...updateExpandedTeamIds(expanded,'alpha',false,valid)],['beta']);
 assert.deepEqual([...updateExpandedTeamIds(expanded,'missing',true,valid)],['alpha','beta']);
});

test('invalid stored data and overlong ids cannot persist',()=>{
 assert.equal(normalizeExpandedTeamIds('{bad', ['alpha']).size,0);
 assert.equal(normalizeExpandedTeamIds('{"alpha":true}', ['alpha']).size,0);
 assert.equal(normalizeExpandedTeamIds([`x`.repeat(129)], [`x`.repeat(129)]).size,0);
});
