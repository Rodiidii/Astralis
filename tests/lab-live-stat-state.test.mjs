import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWrEngine,sourceScenario,buildWrCharacterData,evaluateWrTeam,createSourceEvaluator} from '../src/lab-wr-adapter.js';
const engine=await loadWrEngine();
const context={characters:[{_id:'Diluc',name:'Diluc'},{_id:'Bennett',name:'Bennett'}]};
const base={character:'Diluc',level:90,constellation:0,talentLevel:10,attackSelection:'wr:normal.0',hitCount:1,allies:[{character:'Bennett',level:90,constellation:1,talentLevel:10,wrConditions:{Bennett:{activeInArea:'activeInArea'}}}]};
const evaluate=(p,extra={})=>{const scenario=sourceScenario(engine,p,{...context,...extra});return createSourceEvaluator(engine,scenario)();};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('référence manuelle : les buffs restent additifs et les dégâts suivent les statistiques',()=>{
 const a=evaluate({...base,manualStatOverrides:{atk:1400}}),z=evaluate({...base,manualStatOverrides:{atk:1600}});
 assert.ok(a.ok&&z.ok);close(z.stats.atk-a.stats.atk,200);assert.ok(z.total>a.total);
 const off=evaluate({...base,manualStatOverrides:{atk:1600},allies:[{...base.allies[0],wrConditions:{}}]});close(off.stats.atk,1600);assert.ok(z.stats.atk>off.stats.atk);
});
test('saisir zéro et désactiver un buff manuel ne réutilisent pas l’ancienne valeur',()=>{
 const p={...base,allies:[],manualStatOverrides:{atk:0}};close(evaluate(p).stats.atk,0);
 close(evaluate(p,{combatBonuses:{atkFlat:100}}).stats.atk,100);close(evaluate(p,{combatBonuses:{}}).stats.atk,0);
});
test('la radiance de Diona renforce uniquement la Dispersion Cryo',()=>{
 const b=(character,c={})=>buildWrCharacterData(engine,{character,constellation:6,conditionals:{[character]:c}});
 const support={Constellation6:'lower',lockRevelation:'on'};
 const a=evaluateWrTeam(engine,b('Sucrose'),[b('Diona',support)]),z=evaluateWrTeam(engine,b('Sucrose'),[b('Diona',{...support,lockStellarRadianceSc:'ss'})]);
 for(const ele of ['pyro','hydro','electro'])close(z.display.reaction[ele+'Swirl'].value,a.display.reaction[ele+'Swirl'].value);
 assert.ok(z.display.reaction.cryoSwirl.value>a.display.reaction.cryoSwirl.value);close(z.members.Sucrose.stats.cryoSwirlDmg,40);
});
test('Diona : la baisse d’ATQ ennemie ne change ni l’ATQ alliée ni les RÉS',()=>{
 const d=conditions=>buildWrCharacterData(engine,{character:'Diona',level:90,conditionals:{Diona:conditions}}),active=buildWrCharacterData(engine,{character:'Diluc'});
 const a=evaluateWrTeam(engine,active,[d({})]),z=evaluateWrTeam(engine,active,[d({a4EnemyInMist:'on'})]);
 close(z.members.Diluc.stats.enemyAttackReduction,10);close(z.members.Diluc.stats.atk,a.members.Diluc.stats.atk);assert.deepEqual(z.enemyResistances,a.enemyResistances);
});
