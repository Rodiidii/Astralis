import test from 'node:test';
import assert from 'node:assert/strict';
import {giEventType,giEventExternal,giEventText} from '../src/event-sources.js';

test('web events are identified separately and excluded as external entries',()=>{
  const row={title:'Web Event: Journey of Wonders',start:'2026-12-01',end:'2026-12-08'};
  assert.equal(giEventType(row),'web');
  assert.equal(giEventExternal(row),true);
});

test('community events remain separate from web events',()=>{
  assert.equal(giEventType({title:'Community Event · Fan Art Contest'}),'community');
  assert.equal(giEventType({title:'Événement communautaire HoYoLAB'}),'community');
  assert.equal(giEventType({title:'Evenement web Genshin'}),'web');
  assert.equal(giEventType({category:'web'}),'web');
  assert.equal(giEventType({kind:'community_event'}),'community');
});

test('ordinary in-game activities stay in the calendar',()=>{
  assert.equal(giEventType({title:'Pèlerinage lunaire',description:'Combattez dans Teyvat pour gagner des primogemmes'}),'');
  assert.equal(giEventExternal({type_name:'WebEvent'}),true);
  assert.equal(giEventText({title:'Événement communautaire'}).includes('evenement communautaire'),true);
});
