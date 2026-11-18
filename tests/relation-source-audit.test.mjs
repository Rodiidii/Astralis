import test from 'node:test';
import assert from 'node:assert/strict';
import {formatRelationCitation,summarizeRelationSources} from '../src/relation-source-audit.js';

test('groups relationship evidence by source and dataset, preserving kind, languages and links',()=>{
 const groups=summarizeRelationSources([
  {source:'https://www.example.org/voice/a',dataset:'Voices',kind:'voice',lang:'en'},
  {source:'https://www.example.org/voice/b',dataset:'Voices',kind:'voice',lang:'fr'},
  {source:'https://archive.example/story',dataset:'Quests',kind:'story',lang:'en'},
  {source:'invalid',kind:'other'}
 ]);
 assert.equal(groups[0].host,'example.org');
 assert.equal(groups[0].total,2);
 assert.equal(groups[0].voice,2);
 assert.deepEqual(groups[0].languages,['EN','FR']);
 assert.equal(groups[0].urls.length,2);
 assert.equal(groups[1].story,1);
 assert.equal(groups[2].host,'Source non précisée');
});

test('returns an empty report for absent corpus data',()=>assert.deepEqual(summarizeRelationSources(null),[]));

test('formats a copyable relation citation from its title, direction, language and source',()=>{
 assert.equal(formatRelationCitation({title:'Réplique de combat',quote:'À bientôt.',lang:'fr',source:'https://example.org/voice/1'},'Furina','Neuvillette'),'Réplique de combat — Furina → Neuvillette — FR — À bientôt. — https://example.org/voice/1');
 assert.equal(formatRelationCitation({},'', ''),'Référence relationnelle');
});
