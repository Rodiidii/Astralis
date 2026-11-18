import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeRelationInsights} from '../src/relation-insights.js';

test('les repères distinguent les mentions entrantes, sortantes et réciproques',()=>{
 const people=[{id:'a',name:'Amber'},{id:'b',name:'Barbara'},{id:'c',name:'Collei'},{id:'d',name:'Diona'}];
 const rows=[
  {id:'ab1',from:'a',to:'b',lang:'fr'},{id:'ab1',from:'a',to:'b',lang:'en'},
  {id:'ab2',from:'a',to:'b'},{id:'ba1',from:'b',to:'a'},
  {id:'ac1',from:'a',to:'c'},{id:'ca1',from:'c',to:'a'},
  {id:'cx',from:'c',to:'missing'},{id:'self',from:'d',to:'d'}
 ];
 assert.deepEqual(summarizeRelationInsights(people,rows),{
  people:4,evidenceCount:7,
  mostMentioned:{id:'a',value:2,name:'Amber'},
  mostSpeaks:{id:'a',value:2,name:'Amber'},
  mostReciprocal:{a:'a',b:'b',forward:2,reverse:1,total:3},
  isolated:{id:'d',name:'Diona',value:0},isolatedCount:1
 });
});

test('un corpus vide reste utilisable et identifie tous les personnages sans preuve',()=>{
 const result=summarizeRelationInsights([{id:'x',name:'X'}],[]);
 assert.equal(result.evidenceCount,0);
 assert.equal(result.mostMentioned,null);
 assert.equal(result.mostReciprocal,null);
 assert.equal(result.isolatedCount,1);
});
