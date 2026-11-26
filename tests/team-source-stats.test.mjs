import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {analyzeTeamSources} from '../src/team-source-stats.js';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url)));
const pack=read('data/flins-examples.json'),aliases=read('public/gi-name-aliases.json');
const context={team:pack.teams[0],builds:pack.builds,aliases,sourceSnapshot:read('data/lab-source-snapshot.json'),
 characters:Object.entries(read('data/lab-character-conditions.json').characters).map(([name,c])=>({_id:c.id,id:c.id,name,_name:c.name})),
 weapons:aliases.weapons.map(w=>({_id:w.id,id:w.id,name:w.en[0],rarity:4})),
 sets:aliases.artifacts.map(s=>({_id:s.id,id:s.id,name:s.en[0]}))};
test('team and lab agree on Flins stats, including ATK-scaled Ineffa mastery',async()=>{
 const result=await analyzeTeamSources(context),flins=result.members['10000120'].stats;
 assert.ok(Math.abs(flins.em-pack.observed.stats.em)<1e-7);
 assert.ok(Math.abs(flins.atk-pack.observed.stats.atk)<1e-7);
 const donor=result.receipts.members['10000120'].find(r=>r.owner==='10000116'&&r.kind==='kit');
 assert.ok(donor.effects.some(e=>e.stat==='em'&&e.value>0));
 const weaker=await analyzeTeamSources({...context,builds:context.builds.map(build=>build.character==='10000116'?{...build,weaponLevelValue:1}:build)});
 assert.ok(weaker.members['10000120'].stats.em<flins.em);
});
test('support sets grant their effects without inventing artifact stats on unbuilt characters',async()=>{
 const result=await analyzeTeamSources(context);
 // Aino has no imported pieces: no fake flower, plume or HP substats.
 assert.ok(result.members['10000121'].stats.hp<12000);
 assert.ok(result.receipts.members['10000120'].some(r=>r.owner==='10000121'&&r.kind==='artifacts'));
 assert.ok(result.receipts.enemy.some(r=>r.owner==='10000043'&&r.effects.some(e=>e.element==='electro'&&Math.abs(e.value-40)<1e-7)));
});
