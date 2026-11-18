import test from 'node:test';
import assert from 'node:assert/strict';
import {inboxMatches} from '../src/inbox-center.js';

const reminder={title:'Spirale abyssale',detail:'Fin · étage 12',status:'En cours',date:'Aujourd’hui',game:'gi',kind:'event',rank:1};

test('searches reminders across title, details, date and game',()=>{
 for(const query of ['spirale','étage','etage','aujourd’hui','aujourdhui','genshin'])assert.equal(inboxMatches(reminder,{query}),true,query);
 assert.equal(inboxMatches(reminder,{query:'Kafka'}),false);
});

test('combines category and urgency filters with text search',()=>{
 assert.equal(inboxMatches(reminder,{filter:'event',query:'étage'}),true);
 assert.equal(inboxMatches(reminder,{filter:'task',query:'étage'}),false);
 assert.equal(inboxMatches({...reminder,rank:3},{filter:'priority',query:'spirale'}),false);
});
