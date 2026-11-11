import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validReleases} from '../src/release-notes.js';
test('le journal publié est valide, unique et garde ses limites explicites',()=>{const data=JSON.parse(readFileSync(new URL('../changelog.json',import.meta.url)));const rows=validReleases(data);assert.equal(rows.length,data.releases.length);assert.ok(rows[0].changes.length>=4);assert.ok(rows[0].limits.length>=2);});
test('formats inconnus et entrées invalides ne produisent pas une fausse nouveauté',()=>{assert.deepEqual(validReleases({}),[]);const row={id:'x',date:'2026-11-11',title:'Test',changes:[]};assert.equal(validReleases({schemaVersion:1,releases:[row,row,{}]}).length,1);});
