import test from 'node:test';
import assert from 'node:assert/strict';
import {farmPeoplePresentation,farmSessionState} from '../src/farm-session-progress.js';

test('keeps the full party accessible while showing a compact avatar stack',()=>{
 const people=['Furina','Neuvillette','Charlotte','Navia','Clorinde'].map(_name=>({_name}));
 const view=farmPeoplePresentation(people,4);
 assert.equal(view.visible.length,4);assert.equal(view.overflow,1);assert.equal(view.names.length,5);
 assert.match(view.summary,/5 personnages/);assert.match(view.summary,/Furina, Neuvillette, Charlotte/);
});

test('handles a single character and an empty party without awkward labels',()=>{
 assert.equal(farmPeoplePresentation([{_name:'Skirk'}]).summary,'Skirk');
 assert.equal(farmPeoplePresentation([]).summary,'Aucun personnage lié');
});

test('distinguishes planned and completed farm entries for calendar styling',()=>{
 assert.equal(farmSessionState({done:false}),'planned');
 assert.equal(farmSessionState({done:true}),'complete');
 assert.equal(farmSessionState(null),'planned');
});
