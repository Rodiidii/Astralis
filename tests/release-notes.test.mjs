import test from 'node:test';
import assert from 'node:assert/strict';
import {unseenReleases,validReleases} from '../src/release-notes.js';

const rows=[{id:'newest'},{id:'middle'},{id:'oldest'}];
test('automatic changelog only presents releases newer than the last acknowledged one',()=>{
 assert.deepEqual(unseenReleases(rows,'middle'),[{id:'newest'}]);
});
test('a first visit shows only the latest release instead of marking all history as new',()=>{
 assert.deepEqual(unseenReleases(rows,null),[{id:'newest'}]);
});
test('a removed seen marker falls back to the latest release only',()=>{
 assert.deepEqual(unseenReleases(rows,'expired-release'),[{id:'newest'}]);
});
test('release data rejects duplicate ids and malformed dates',()=>{
 const valid=validReleases({schemaVersion:1,releases:[{id:'2026-11-24-a',date:'2026-11-24',title:'A',changes:[]},{id:'2026-11-24-a',date:'2026-11-24',title:'A copy',changes:[]},{id:'bad-date',date:'yesterday',title:'Bad',changes:[]}]});
 assert.equal(valid.length,1);
});
