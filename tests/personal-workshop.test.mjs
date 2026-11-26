import {renderWishDecision} from '../src/wish-decision.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {DIALOGUE_CATALOGUE,characterDialogueBank,contextualDialogue,DIALOGUE_CONTEXTS} from '../src/companion-dialogues.js';
import {companionContextTransition} from '../src/companion-context.js';
import {fiveStarDistribution,targetWishDistribution,wishDecision} from '../src/wish-decision-model.js';
import {buildPriority} from '../src/build-priorities.js';
import {normalizeMapRoute} from '../src/atlas-map-viewer.js';
import {toggleNoteChecklist} from '../src/personal-archives.js';
test('Each of the 314 catalogue identities has 100 distinct complete contextual replies',()=>{
 const entries=Object.entries(DIALOGUE_CATALOGUE);assert.equal(entries.length,314);
 for(const [id,p] of entries){const rows=characterDialogueBank(id);assert.equal(rows.length,100,id);assert.equal(new Set(rows.map(r=>r.text)).size,100,id);assert.deepEqual([...new Set(rows.map(r=>r.context))],DIALOGUE_CONTEXTS);for(const r of rows){assert.ok(r.text.length>65,id);assert.doesNotMatch(r.text,/[<>{}]|undefined|\[object Object\]/);assert.match(r.text,/[.!?]$/);}assert.match(contextualDialogue(id,'arrival'),new RegExp(p.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));}
 assert.notEqual(contextualDialogue('Nahida','build'),contextualDialogue('Furina','build'));
});
test('Context follows navigation and does not count every rerender as a new visit',()=>{let s=companionContextTransition({},'lab',100000);assert.equal(s.context,'lab');const repeated=companionContextTransition(s.state,'lab',100005);assert.equal(repeated.context,null);assert.equal(repeated.state.counts.lab,1);s=companionContextTransition(s.state,'calc',101000);assert.equal(s.context,'rotation');assert.equal(s.state.counts.calc,1);});
test('Distribution mass is conserved for character/weapon, pity and guarantee states',()=>{for(const kind of ['character','weapon'])for(const pity of [0,45,75,89]){const pdf=fiveStarDistribution(kind,pity);assert.ok(Math.abs(pdf.reduce((a,b)=>a+b,0)-1)<1e-12);for(const guaranteed of [false,true]){const p=targetWishDistribution(kind,{characterPity:pity,weaponPity:pity,characterGuarantee:guaranteed,weaponFatePoint:guaranteed});assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-12);}}assert.deepEqual(targetWishDistribution('character',{characterPity:89,characterGuarantee:true}),[0,1]);assert.deepEqual(targetWishDistribution('weapon',{weaponPity:79,weaponFatePoint:true}),[0,1]);});
test('Wishes reserve, guarantee, dates and thresholds use one consistent wallet',()=>{const r=wishDecision({currentPrimos:8159,wishes:10,characterPity:65,characterGuarantee:true},{reserve:10,copies:1,end:'2026-12-06',daily:60},'2026-11-26');assert.equal(r.available,60);assert.equal(r.remainingPrimos,159);assert.equal(r.usable,50);assert.equal(r.hard,25);assert.equal(r.chance,100);assert.equal(r.days,10);assert.equal(r.forecast,64);assert.equal(r.futureUsable,54);assert.equal(r.missingPrimos,0);assert.ok(r.thresholds.every((v,i,a)=>!i||v.pulls>=a[i-1].pulls));assert.equal(wishDecision({}, {copies:0}).hard,0);assert.equal(wishDecision({}, {copies:0}).chance,100);const weapon=wishDecision({weaponPity:50},{kind:'weapon',weaponFatePoint:true});assert.equal(weapon.hard,30);assert.equal(wishDecision({weaponPity:50},{kind:'weapon'}).hard,110);});
test('Spending cap stays active for future income and does not steal the reserve',()=>{const r=wishDecision({wishes:50},{limit:20,reserve:35,end:'2026-12-06',daily:160},'2026-11-26');assert.equal(r.usable,15);assert.equal(r.futureUsable,20);assert.equal(wishDecision({wishes:5},{reserve:10}).usable,0);});
test('Useful substats reflect base-ATK buffs, no-energy kits, Kokomi and Favonius',()=>{const b=buildPriority({_id:'10000032'});assert.ok(!b.priority.includes('atkPct'));assert.ok(b.priority.includes('er'));const m=buildPriority({_id:'10000106'},null,'amplify');assert.ok(!m.priority.includes('er'));assert.ok(m.priority.includes('em'));const k=buildPriority({_id:'10000054'});assert.ok(!k.priority.includes('critRate'));assert.ok(buildPriority({_id:'10000054'},{_name:'Codex de Favonius'}).priority.includes('critRate'));const z=buildPriority({_id:'10000030'});assert.ok(z.priority.includes('hpPct'));});
test('Map import validates coordinates, preserves notes and limits route size',()=>{const r=normalizeMapRoute([{x:15,y:30,label:'Départ',note:'Grotte',done:true},{x:150,y:30},{x:NaN,y:3}]);assert.equal(r.length,1);assert.equal(r[0].note,'Grotte');assert.ok(r[0].done);assert.equal(normalizeMapRoute(Array(100).fill({x:1,y:1})).length,80);});
test('Checklist edits only the intended line, preserving surrounding prose',()=>{const text='## Rotation\n- [ ] Compétence\nPhrase personnelle\n- [x] Ultime';const changed=toggleNoteChecklist(text,1,true);assert.equal(changed,'## Rotation\n- [x] Compétence\nPhrase personnelle\n- [x] Ultime');assert.equal(toggleNoteChecklist(changed,2,true),changed);assert.equal(toggleNoteChecklist(changed,3,false).split('\n')[3],'- [ ] Ultime');});

test('A past deadline never counts future rewards toward its budget',()=>{const r=wishDecision({currentPrimos:160,wishes:2},{end:'2026-11-25',extra:1600,daily:60},'2026-11-26');assert.equal(r.forecast,3);assert.equal(r.days,0);});

test('Every Genshin catalogue entry has a role and local variants use their actual scaling',async()=>{
 const catalogue=JSON.parse(await readFile(new URL('../public/card-catalog.json',import.meta.url),'utf8')).catalogs['gi:character'];for(const c of catalogue)assert.notEqual(buildPriority(c).label,'Rôle à préciser',c.name);
 const geo=buildPriority({id:'10000005',elementText:'Géo'});assert.ok(geo.priority.includes('atkPct'));assert.ok(!geo.priority.includes('defPct'));
 assert.deepEqual(buildPriority({id:'10000007',elementText:'Électro'}).priority,['er']);
 assert.ok(buildPriority({name:'Danica'}).priority.includes('atkPct'));
 assert.ok(buildPriority({name:'Somnia'}).priority.includes('em'));
 assert.ok(buildPriority({name:'Columbina'}).priority.includes('hpPct'));
});

test('A specific four-star is never presented as a guaranteed five-star target',()=>{
 const old=globalThis.localStorage;globalThis.localStorage={getItem:key=>key==='astralis:gi:objectives-v2'?JSON.stringify({targets:[{name:'Bennett',copies:1},{name:'Mavuika',copies:1}]}):null};
 try{const html=renderWishDecision([{name:'Bennett',rarity:4},{name:'Mavuika',rarity:5}]);assert.match(html,/<option value="0" disabled>/);assert.match(html,/<option value="1" >Mavuika/);assert.match(html,/aucun budget ne garantit un 4★ précis/);}finally{globalThis.localStorage=old;}
});
