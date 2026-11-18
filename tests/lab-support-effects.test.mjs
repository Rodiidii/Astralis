import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hasUsefulBuff,supportWeaponEffects,partyWeaponBonuses,azurelightSummary} from '../src/lab-support-effects.js';
import {complexEffects} from '../src/complex-effects.js';
import {finalStats,calculateHit} from '../src/damage-engine.js';
const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url))).map(w=>({...w,_id:String(w.id)}));
const weapon=id=>weapons.find(w=>w.id===id);
const support=(id,effect,extra={})=>({character:'support',weapon:String(id),refinement:5,activeWeaponEffects:{[id+':'+effect]:{enabled:true,target:'active'}},...extra});
test('damage-only and healing-only talent cards are not buffs',()=>{
 for(const description of ['Effectue trois attaques successives et inflige 200 % de son ATQ en DGT Hydro.','Restaure les PV des personnages de l’équipe selon son ATQ.','Inflige des DGT de compétence.'])assert.equal(hasUsefulBuff({kind:'talent',description}),false);
 assert.equal(hasUsefulBuff({kind:'talent',description:'Augmente l’ATQ de tous les personnages de l’équipe de 20 %.'}),true);
 assert.equal(hasUsefulBuff({kind:'talent',description:'Augmente sa propre ATQ de 20 %.'}),false);
 assert.equal(hasUsefulBuff({kind:'talent',description:'Augmente sa propre ATQ de 20 %.'},{own:true}),true);
 assert.equal(hasUsefulBuff({locked:true},{native:true}),false);
});
test('Azurelight only buffs its wielder; zero Energy requires the skill window',()=>{
 assert.deepEqual(supportWeaponEffects(weapon(11517),5),[]);
 assert.deepEqual(azurelightSummary({zeroEnergy:true},1),{atkPct:0,critDmg:0,skillGain:24,zeroGain:24,critGain:40});
 const gain=azurelightSummary({enabled:true,zeroEnergy:true},5);assert.equal(gain.atkPct,96);assert.equal(gain.critDmg,80);
 const result=complexEffects({azurelight:{enabled:true,zeroEnergy:true,refinement:1}},{weaponId:11517,refinement:5});assert.equal(result.bonuses.atkPct,96);assert.equal(result.bonuses.critDmg,80);
});
test('Thrilling Tales uses R1/R5 values and only the named handoff recipient',()=>{
 assert.equal(supportWeaponEffects(weapon(14302),1)[0].bonuses.atkPct,24);
 const p={character:'active',allies:[support(14302,'handoff')]};assert.equal(partyWeaponBonuses(p,weapons).atkPct,48);
 p.character='someone-else';assert.deepEqual(partyWeaponBonuses(p,weapons),{});
 p.character='active';p.allies[0].activeWeaponEffects['14302:handoff'].enabled=false;assert.deepEqual(partyWeaponBonuses(p,weapons),{});
});
test('identical non-stacking weapons and Millennial ATK bonuses do not double count',()=>{
 const p={character:'active',allies:[support(14302,'handoff'),support(14302,'handoff',{character:'support-2'})]};assert.equal(partyWeaponBonuses(p,weapons).atkPct,48);
 p.allies=[support(11503,'ode'),support(15503,'farewell',{character:'support-2'})];const result=partyWeaponBonuses(p,weapons);assert.equal(result.atkPct,40);assert.equal(result.em,200);assert.equal(result.normalDmg,32);
});
test('shared EM conversions use source stats; explicitly stacking weapons stack',()=>{
 const p={character:'active',allies:[support(14416,'starlight',{weaponSourceEM:1000}),support(14511,'dreams',{character:'support-2'})]};
 const result=partyWeaponBonuses(p,weapons);assert.equal(result.atkFlat,144);assert.equal(result.em,48);
 p.allies=[support(11418,'moonlight',{weaponSourceEM:1000})];assert.equal(partyWeaponBonuses(p,weapons).er,21.599999999999998);
 p.allies=[support(14511,'dreams'),support(14511,'dreams',{character:'support-2'})];assert.equal(partyWeaponBonuses(p,weapons).em,96);
});
test('support weapon ATK buff increases actual damage via base ATK',()=>{
 const bonuses=partyWeaponBonuses({character:'active',allies:[support(14302,'handoff')]},weapons);
 const hit={baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:100,enemyResistance:.1};
 const before=calculateHit({...hit,stats:finalStats({atk:1000,critRate:50,critDmg:100},{})});
 const after=calculateHit({...hit,stats:finalStats({atk:1000,critRate:50,critDmg:100},bonuses)});assert.ok(Math.abs(after.total/before.total-1.48)<1e-10);
});

test('Wolf buff is not counted twice when the simulated wielder already enables it',()=>{
 const p={character:'active',weaponRefinement:1,effectStates:{'weapon:12502:lowEnemy':{enabled:true}},allies:[support(12502,'lowEnemy')]};
 assert.equal(partyWeaponBonuses(p,weapons,weapon(12502)).atkPct,40);
 p.weaponRefinement=5;assert.deepEqual(partyWeaponBonuses(p,weapons,weapon(12502)),{});
});
