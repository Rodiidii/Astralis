// Run with: node scripts/verify-express-scenes.mjs
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CHARACTER_SCENES } from '../src/express-character-scenes.js';
import { SCENE_ACTORS, SCENE_MOTIONS, findCharacterScene, sceneVisualFingerprint } from '../src/express-character-cinematics.js';
import { CHARACTER_SHAPES } from '../src/express-character-shapes.js';
import { LORE_COMPANIONS } from '../src/express-lore-companions.js';

const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const catalogs={gi:read('assets/data/gi-characters.json'),hsr:Object.entries(read('assets/data/hsr-nanoka-character.json')).map(([id,p])=>({...p,id,name:p.en})),ww:read('assets/data/ww-characters.json')};
let characters=0;
for(const [world,rows] of Object.entries(catalogs)){
 for(const person of [...rows,...LORE_COMPANIONS[world]]){
  assert.ok(findCharacterScene(person,person.name,world),`Missing scene: ${world}:${person.id} ${person.name}`);
  characters++;
 }
}
const fingerprints=new Map();
for(const [id,scene] of Object.entries(CHARACTER_SCENES)){
 assert.equal(scene.actions.length,3,id);
 for(const action of scene.actions){
  assert.ok(SCENE_ACTORS.includes(action.actor),`Unknown shape: ${id} ${action.actor}`);
  assert.ok(SCENE_MOTIONS.includes(action.motion),`Unknown movement: ${id} ${action.motion}`);
  assert.ok(action.at>=0 && action.at<(scene.duration||2000),`Invalid timing: ${id}`);
 }
 const fingerprint=sceneVisualFingerprint(scene);
 assert.ok(!fingerprints.has(fingerprint),`Identical visual scenes: ${id} and ${fingerprints.get(fingerprint)}`);
 fingerprints.set(fingerprint,id);
}
for(const rows of Object.values(LORE_COMPANIONS))for(const p of rows){
 assert.ok(existsSync(new URL('..'+p.icon,import.meta.url)),`Missing portrait: ${p.name}`);
 assert.ok(p.loreBasis && p.source && p.signature,`Incomplete lore guest: ${p.name}`);
}
// Avoid the ambiguous "bat": the Trailblazer has a baseball bat, not wings.
for(const id of ['hsr:8001','hsr:8002'])assert.equal(CHARACTER_SCENES[id].actions[0].actor,'baseballbat');
assert.equal(CHARACTER_SCENES['hsr:1408'].actions[0].actor,'ruinmeteor');
assert.notEqual(CHARACTER_SHAPES.wolf,CHARACTER_SHAPES.pig);
assert.notEqual(CHARACTER_SHAPES.bow,CHARACTER_SHAPES.blade);
console.log(JSON.stringify({charactersChecked:characters,scenes:Object.keys(CHARACTER_SCENES).length,distinctVisualScenes:fingerprints.size,objectShapes:SCENE_ACTORS.length,missingScenes:0},null,2));
