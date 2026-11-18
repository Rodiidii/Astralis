import test from 'node:test';
import assert from 'node:assert/strict';
import {RELATION_REFERENCE,parseReferencePage,parseReferenceBundle,referenceAuditSnapshot,referenceStoryUrl} from '../src/relation-reference-audit.js';

test('reference metrics remain separate from the local evidence count',()=>{
 const snapshot=referenceAuditSnapshot();
 assert.equal(snapshot.counts.storyLines,233308);
 assert.equal(snapshot.counts.voiceLines,1203);
 assert.equal(snapshot.delivery.bulkDatabase,false);
 assert.equal(snapshot.delivery.documentedBulkApi,false);
 snapshot.counts.storyLines=1;
 assert.equal(RELATION_REFERENCE.counts.storyLines,233308);
});

test('public character-story URLs accept known languages and encode a single character slug',()=>{
 assert.equal(referenceStoryUrl('Amber'), 'https://ties.catforest.dev/genshin/story/en/Amber.json');
 assert.equal(referenceStoryUrl('Jean Gunnhildr','zh'), 'https://ties.catforest.dev/genshin/story/zh/Jean_Gunnhildr.json');
 assert.equal(referenceStoryUrl('Amber','fr'),'');
 assert.equal(referenceStoryUrl(''),'');
});

test('reference page counter parser rejects missing or malformed statistics',()=>{
 const metrics=parseReferencePage('<li>收录 122 位可玩角色、1,203 条「关于某某…」语音，以及 1,626 个任务里的 233,308 句剧情台词</li>');
 assert.deepEqual(metrics,{playableCharacters:122,voiceLines:1203,quests:1626,storyLines:233308});
 assert.equal(parseReferencePage('<p>Statistics not present</p>'),null);
});

test('reference bundle counters identify the larger story index without labeling it voice lines',()=>{
 const stats=parseReferenceBundle('let i={lines:233308,quests:1626,defined:371,sources:68012};');
 assert.deepEqual(stats,{storyLines:233308,quests:1626,definedCharacters:371,originalReferences:68012});
 assert.equal(parseReferenceBundle('const unrelated={lines:233308};'),null);
});
