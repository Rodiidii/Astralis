import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_SCENES } from '../src/express-character-scenes.js';
import { SCENE_ACTORS } from '../src/express-character-cinematics.js';
import { visualIdentity, LORE_VISUALS, IDENTITY_SIGNATURE_COUNT } from '../src/character-visual-identity.js';
import { CHARACTER_PORTRAITS } from '../src/character-portrait-assets.js';

const compositions=new Set(),results=[];
for(const [id,scene] of Object.entries(CHARACTER_SCENES)){
 const [world,key]=id.split(':'),identity=visualIdentity({id:key,name:id},key,world);
 assert.equal(identity.id,id);assert.equal(identity.authored,true,id);
 assert.ok(identity.portrait&&fs.existsSync('.'+identity.portrait),`Missing local portrait: ${id}`);
 assert.equal(identity.actors.length,3,id);
 assert.ok(identity.actors.every(actor=>SCENE_ACTORS.includes(actor)),id);
 assert.deepEqual(identity.actors,scene.actions.map(a=>a.actor),id);
 assert.match(identity.accent,/^#[0-9a-f]{6}$/i,id);
 const composition=identity.actors.join('|');compositions.add(composition);
 results.push({id,portrait:identity.portrait,family:identity.family,composition});
}
assert.equal(visualIdentity({_id:'lore-istaroth',_name:'Istaroth'},'lore-istaroth','gi').id,'gi:istaroth');
assert.equal(visualIdentity({name:'Furina'},'furina','gi').portrait,CHARACTER_PORTRAITS['gi:10000089']);
assert.equal(LORE_VISUALS.obsidian.portrait,'/assets/express-lore/obsidian.png');
const obsidianHash=createHash('sha256').update(fs.readFileSync('.'+LORE_VISUALS.obsidian.portrait)).digest('hex');
assert.equal(obsidianHash,'7325fb981758564acb2455cbdb68081151f60a05ce6f062fa604e08e4fc31182');
const wwRepair=JSON.parse(fs.readFileSync('artifacts/ww-portrait-repair.json','utf8'));assert.equal(new Set(Object.values(wwRepair).map(r=>createHash('sha256').update(fs.readFileSync('.'+r.url)).digest('hex'))).size,12);
const report={characters:results.length,localStandardPortraits:Object.keys(CHARACTER_PORTRAITS).filter(k=>!k.startsWith('ww:')).length,
 localWuwaPortraits:results.filter(r=>r.id.startsWith('ww:')).length,lorePortraits:Object.keys(LORE_VISUALS).length,
 dedicatedPalettes:IDENTITY_SIGNATURE_COUNT,authoredCompositions:compositions.size,obsidianUnchanged:true,incorrectWuwaEchoIconsReplaced:12,errors:[],results};
fs.writeFileSync('artifacts/character-identities-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,results:undefined},null,2));
