import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {celestiaToLab,applyMavuikaMeltPreset} from '../src/celestia-lab-import.js';
import {loadWrEngine,sourceScenario,createSourceEvaluator,auditSourceScenario} from '../src/lab-wr-adapter.js';
import {pieceSubstats} from '../src/build-model.js';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url)));
const original=read('data/celestia-exports/team/mavuika-melt-premium.json'),aliases=read('public/gi-name-aliases.json');
const context={aliases,sourceSnapshot:read('data/lab-source-snapshot.json'),characters:Object.entries(read('data/lab-character-conditions.json').characters).map(([key,row])=>({_id:row.id,id:row.id,name:key,_name:row.name})),weapons:aliases.weapons.map(row=>({_id:row.id,id:row.id,_name:row.en[0],name:row.en[0],rarity:Number(String(row.id)[2])||5})),sets:aliases.artifacts.map(row=>({_id:row.id,id:row.id,name:row.en[0],_name:row.en[0]}))};
test('Celestia team import preserves levels, C6, weapons, set counts and aggregate substats',()=>{
 const before=JSON.stringify(original),pack=celestiaToLab(original,context);
 assert.equal(pack.builds.length,4);assert.equal(pack.scenario.allies.length,3);
 assert.equal(pack.scenario.allies.find(m=>m.character==='10000110').constellation,6);
 assert.equal(pack.builds[0].tcAggregateSubstats.critDMG_,66.05);
 assert.equal(pack.builds[0].pieces[2].mainType,'em');assert.equal(pack.builds[0].pieces[2].mainValue,187);
 assert.equal(pack.scenario.attackSelection,'wr:burst.skillDmg');assert.equal(pack.scenario.reaction,'melt');
 assert.equal(JSON.stringify(original),before);
 const single=celestiaToLab(original,{...context,mode:'character'});assert.equal(single.builds.length,1);assert.equal(single.scenario.allies.length,0);
});
test('Mavuika imported into the real engine uses Melt, Iansan C6 and Wolf’s Gravestone conditions',async()=>{
 const pack=applyMavuikaMeltPreset(celestiaToLab(original,context),context),engine=await loadWrEngine();
 const builds=pack.builds.map(build=>({...build,pieces:build.pieces.map(piece=>({...piece,substats:pieceSubstats(piece)}))}));
 const env={...context,builds,equipped:builds[0].pieces};
 const evaluate=p=>createSourceEvaluator(engine,sourceScenario(engine,p,env))();
 const p=pack.scenario,full=evaluate(p),noMelt=evaluate({...p,reaction:'none'}),noC6=structuredClone(p),proc=structuredClone(p);
 noC6.allies.find(m=>m.character==='10000110').wrConditions.Iansan.c6Extreme='off';
 proc.wrConditions.WolfsGravestone={WolfishTracker:'on'};
 const withoutC6=evaluate(noC6),withProc=evaluate(proc);
 assert.equal(p.weaponOverride,'12502');assert.equal(p.weaponRefinement,1);
 for(const r of [full,noMelt,withoutC6,withProc])assert.ok(r.ok&&r.total>0,JSON.stringify(r));
 assert.ok(full.total>noMelt.total*1.9);assert.ok(full.total>withoutC6.total);assert.ok(withProc.total>full.total);
 const observed={scenario:p.tcName,average:full.total,noMelt:noMelt.total,noIansanC6:withoutC6.total,wolfPassiveTriggered:withProc.total,stats:full.stats};
 fs.writeFileSync(new URL('../docs/mavuika-melt-observed.json',import.meta.url),JSON.stringify(observed,null,2));
 console.log('Mavuika observations',JSON.stringify({average:full.total,noMelt:noMelt.total,noC6:withoutC6.total,withWolf:withProc.total}));
});

test('Mavuika Melt and critical modes independently match the KQM formulas',async()=>{
 const pack=applyMavuikaMeltPreset(celestiaToLab(original,context),context),engine=await loadWrEngine(),builds=pack.builds.map(b=>({...b,pieces:b.pieces.map(p=>({...p,substats:pieceSubstats(p)}))})),scenario=sourceScenario(engine,pack.scenario,{...context,builds,equipped:builds[0].pieces}),audit=auditSourceScenario(engine,scenario),full=createSourceEvaluator(engine,scenario)(),em=full.stats.em;
 // KQM displays the rounded constant 2.78; the game engine uses 25/9.
 assert.ok(Math.abs(audit.amplification-2*(1+(25/9)*em/(1400+em)))<.00001);
 assert.ok(Math.abs(audit.amplification-2*(1+2.78*em/(1400+em)))<.001);
 assert.ok(Math.abs(audit.crit/audit.nonCrit-(1+full.stats.critDmg/100))<.00001);
 assert.ok(Math.abs(audit.average/audit.nonCrit-(1+Math.min(1,full.stats.critRate/100)*full.stats.critDmg/100))<.00001);
 fs.writeFileSync(new URL('../docs/mavuika-independent-audit.json',import.meta.url),JSON.stringify(audit,null,2));
});
