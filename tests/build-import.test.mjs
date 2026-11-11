
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeEnkaArtifact,enkaStatReference,equippedStatVector,levelStatRow,pieceSubstats} from '../src/build-model.js';
import {parseActionValue,activeBuffBonuses,snapshotCharacterStats,talentValueRows} from '../src/lab-actions.js';
import {calculateHit,calculateAction,finalStats} from '../src/damage-engine.js';
import {normalizeGoodArtifact,validateArtifact} from '../src/artifact-model.js';
test('Enka: identifiant textuel, niveau, coupe élémentaire et sous-stats exactes',()=>{
 const piece=normalizeEnkaArtifact({reliquary:{mainPropId:15008,level:21},flat:{rankLevel:5,equipType:'EQUIP_RING',reliquaryMainstat:{mainPropId:'FIGHT_PROP_ICE_ADD_HURT',statValue:46.6},reliquarySubstats:[{appendPropId:'FIGHT_PROP_CRITICAL',statValue:10.1},{appendPropId:'FIGHT_PROP_DEFENSE',statValue:39}]}});
 assert.equal(piece.mainType,'cryoDmg');assert.equal(piece.level,20);assert.equal(piece.mainValue,46.6);assert.equal(piece.sub0Value,10.1);
 assert.deepEqual(pieceSubstats({...piece,sub0Value:12}),[{type:'critRate',value:12},{type:'defFlat',value:39}]);
});
test('les sous-stats entières sont comparées après arrondi d’affichage',()=>{
 const p=normalizeGoodArtifact({setKey:'ThunderingFury',slotKey:'plume',rarity:5,level:20,mainStatKey:'atk',mainStatValue:311,substats:[{key:'def',value:39},{key:'critRate_',value:19.5},{key:'eleMas',value:23},{key:'enerRech_',value:6.5}]});
 assert.equal(validateArtifact(p).valid,true,JSON.stringify(validateArtifact(p)));
 assert.equal(validateArtifact({...p,substats:[{type:'defFlat',value:9999}]}).valid,false);
});
test('une table de niveaux utilise le niveau déclaré et non un index de tableau',()=>{
 assert.equal(levelStatRow([{level:1,attack:14},{level:90,attack:359}],90).attack,359);
});
test('Enka retrouve le total du compte sans doubler les artéfacts',()=>{
 const pieces=[{mainType:'atkPct',mainValue:46.6,substats:[{type:'atkFlat',value:311},{type:'critRate',value:10}]}];
 const avatar={fightPropMap:{1:12000,4:900,7:800,2:0,3:0,5:331,6:.646,8:0,9:0,20:.4,22:1.2,23:1,28:100}};
 const ref=enkaStatReference(avatar,pieces);const gear=equippedStatVector(pieces);
 const bonuses={...ref.bonuses};for(const [key,value]of Object.entries(gear))bonuses[key]=(bonuses[key]||0)+value;
 const stats=finalStats(ref.base,bonuses);assert.ok(Math.abs(stats.atk-(900*1.646+331))<1e-8);assert.equal(stats.critRate,40);
});
test('Skirk: cinq entailles et un coup final distincts, pas six ultimes',()=>{
 const snapshot=JSON.parse(readFileSync(new URL('../data/lab-source-snapshot.json',import.meta.url)));
 const stats=snapshotCharacterStats(snapshot,'10000114',90);
 assert.ok(stats.base.atk>350&&stats.base.atk<370);assert.ok(stats.base.hp>12000&&stats.base.hp<13000);
 const parsed=parseActionValue('DGT : 220.968% ×5 + 368.28%');
 assert.equal(parsed.hitCount,6);
 const input={stats:{atk:1000,critRate:0,critDmg:0},baseStat:'atk',attackerLevel:90,enemyLevel:100,enemyResistance:.1};
 const result=calculateAction({...input,...parsed});
 const expected=calculateHit({...input,talentMultiplier:2.20968}).total*5+calculateHit({...input,talentMultiplier:3.6828}).total;
 assert.ok(Math.abs(result.total-expected)<1e-8);
 assert.equal(parseActionValue('100% / 200%'),null);
});
test('un seul coup réagit dans une attaque à trois coups',()=>{
 const input={stats:{atk:1000,em:0},baseStat:'atk',talentMultiplier:1,attackerLevel:90,hitCount:3,reaction:{kind:'amplifying',baseMultiplier:2},reactingHits:1};
 const result=calculateAction(input),plain=calculateHit({...input,reaction:null});
 assert.ok(Math.abs(result.total-plain.total*4)<1e-8);
});
test('buffs: nature, cumuls, désactivation et expiration',()=>{
 const p={buffs:[{type:'atkPct',value:20,stacks:2,duration:5},{type:'burstDmg',value:30,active:true},{type:'critRate',value:15,active:false}]};
 assert.deepEqual(activeBuffBonuses(p,0),{atkPct:40,burstDmg:30});assert.deepEqual(activeBuffBonuses(p,5),{burstDmg:30});
});
