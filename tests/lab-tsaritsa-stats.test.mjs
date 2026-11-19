import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadWrEngine,sourceScenario,buildWrCharacterData,evaluateWrTeam} from '../src/lab-wr-adapter.js';
import {levelStatRow} from '../src/build-model.js';
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/tsaritsa-level-stats.json',import.meta.url)));
const engine=await loadWrEngine();
const context={characters:[fixture.character,{_id:'Bennett',name:'Bennett'}],weapons:[fixture.weapon]};
const state={character:'anastasya',level:90,weaponLevel:90,weaponOverride:'15516',atk:0,hp:0,def:0};
const evaluate=(p={},ctx={})=>{const scenario=sourceScenario(engine,{...state,...p},{...context,...ctx});return evaluateWrTeam(engine,buildWrCharacterData(engine,scenario.active),scenario.team.map(s=>buildWrCharacterData(engine,s))).members.anastasya;};
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('Tsarine : vraies bases et élévation, même hors du moteur local',()=>{
 const {stats,baseAtk}=evaluate({weaponOverride:null});close(baseAtk,356);close(stats.hp,12736);close(stats.atk,356);close(stats.def,779);close(stats.critRate,5);close(stats.critDmg,88.4);close(stats.er,100);
 for(const value of Object.values(stats))assert.ok(Number.isFinite(value));
});
test('arme récente : ATQ de base et DGT CRIT ajoutés exactement une fois',()=>{
 const {stats,baseAtk}=evaluate();close(baseAtk,356+542);close(stats.atk,898);close(stats.critDmg,50+38.4+88.2);
 const first=evaluate({weaponLevel:1});close(first.baseAtk,356+44);close(first.stats.critDmg,50+38.4+19.2);
 close(evaluate({weaponOverride:null}).stats.critDmg,88.4);
});
test('niveaux et données maximales du catalogue gardent les mêmes unités',()=>{
 const low=evaluate({level:1,weaponLevel:1});close(low.stats.hp,991);close(low.stats.atk,28+44);close(low.stats.critDmg,50+19.2);
 const catalogOnly={characters:[{...fixture.character,levelStats:undefined}],weapons:[{...fixture.weapon,levelStats:undefined}]};close(evaluate({},catalogOnly).stats.atk,898);close(evaluate({},catalogOnly).stats.critDmg,176.6);
 const row=levelStatRow(fixture.weapon.levelStats,90);close(row.attack,542);close(row.specialized,.882);assert.equal(row.specializedType,'FIGHT_PROP_CRITICAL_HURT');
});
test('artéfacts et bonus ATQ % utilisent personnage + arme comme ATQ de base',()=>{
 const ctx={sets:[{_id:'gladiator',name:'GladiatorsFinale'},{_id:'wanderer',name:'WanderersTroupe'}],equipped:[{id:'plume',slot:'plume',setKey:'gladiator',rarity:5,level:20,mainType:'atkFlat',substats:[]},{id:'sands',slot:'sands',setKey:'wanderer',rarity:5,level:20,mainType:'atkPct',substats:[]}]};
 const a=evaluate({loadout:'equipped'},ctx),z=evaluate({loadout:'equipped'},{...ctx,combatBonuses:{atkPct:20}});close(a.baseAtk,898);close(a.stats.atk,898*1.466+311);close(z.stats.atk-a.stats.atk,898*.2);
});
test('les buffs alliés restent appliqués après ajout de la vraie arme',()=>{
 const a=evaluate(),z=evaluate({allies:[{character:'Bennett',level:90,constellation:1,talentLevel:10,wrConditions:{Bennett:{activeInArea:'activeInArea'}}}]});assert.ok(z.stats.atk>a.stats.atk);close(z.baseAtk,898);close(z.stats.critDmg,176.6);
});
