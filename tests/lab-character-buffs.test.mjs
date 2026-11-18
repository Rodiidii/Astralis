import test from 'node:test';
import assert from 'node:assert/strict';
import {syncCharacterBuffTeam} from '../src/lab-character-buffs.js';
import {activeBuffBonuses} from '../src/lab-actions.js';
const characters=[{_id:'furina',id:10000089,elementText:'Hydro'},{_id:'shenhe',id:10000063,elementText:'Cryo'},{_id:'kazuha',id:10000047,elementText:'Anémo'}];
test('buffs natifs suivent les personnages, leurs constellations et les éléments exacts',()=>{
 const p={character:'furina',constellation:2,allies:[{character:'shenhe',constellation:1},{character:'kazuha'}],complexEffects:{furina:{enabled:true},shenhe:{enabled:true},mona:{enabled:true}}};
 syncCharacterBuffTeam(p,characters);
 assert.deepEqual(p.complexTeamElements,['hydro','cryo','anemo']);assert.equal(p.complexEffects.furina.constellation,2);assert.equal(p.complexEffects.shenhe.constellation,1);assert.equal(p.complexEffects.mona.enabled,false);
 p.allies=[];syncCharacterBuffTeam(p,characters);assert.equal(p.complexEffects.shenhe.enabled,false);
});
test('un bonus personnalisé ne reste pas actif lorsque son personnage quitte l’équipe',()=>{
 const p={character:'furina',allies:[{character:'shenhe'}],buffs:[{active:true,sourceCharacter:'shenhe',type:'cryoDmg',value:15},{active:true,type:'atkPct',value:20}]};
 assert.equal(activeBuffBonuses(p).cryoDmg,15);p.allies=[];assert.equal(activeBuffBonuses(p).cryoDmg,undefined);assert.equal(activeBuffBonuses(p).atkPct,20);
});
import {buffFieldOptions,renderCharacterBuffFields} from '../src/lab-buff-controls.js';
import {kitEffectDescriptions} from '../src/lab-config.js';
test('les choix de cumuls respectent les bornes des mécaniques et des constellations',()=>{
 assert.deepEqual(buffFieldOptions('skirk','deathStacks'),[0,1,2,3]);
 assert.equal(Math.max(...buffFieldOptions('skirk','serpentExtra',{constellation:0})),12);
 assert.equal(Math.max(...buffFieldOptions('skirk','serpentExtra',{constellation:2})),22);
 assert.equal(buffFieldOptions('shenhe','atk'),null);
 const html=renderCharacterBuffFields('skirk',[['deathStacks','Cumuls',3],['sevenPhase','Posture','checkbox']],{deathStacks:2,sevenPhase:true});
 assert.match(html,/<select/);assert.match(html,/<option value="2" selected/);assert.match(html,/type="checkbox"[^>]* checked/);
});
test('les textes distinguent passifs, talents, équipement et constellations verrouillées',()=>{
 const rows=kitEffectDescriptions({passives:[{name:'Passif',description:'Texte du passif'}],skillTalents:[{name:'Compétence',description:'Texte du talent'}],constellations:[{name:'C1',description:'Texte C1'}]},0,null,1,null);
 assert.deepEqual(rows.map(row=>row.kind),['talent','constellation','passive']);
 assert.equal(rows[0].description,'Texte du talent');assert.equal(rows[1].locked,true);
});
import {nativeBuffGroups,complexConfigForSimulation} from '../src/lab-buff-controls.js';
import {PARTY_SET_EFFECTS,partySetEffects,additionalPartySetBonuses} from '../src/lab-party-sets.js';
import {recommendedLabSets} from '../src/lab-set-recommendations.js';
import {readFileSync} from 'node:fs';
test('une attaque simple ignore les horodatages sans modifier la rotation sauvegardée',()=>{
 const p={simulationMode:'single',complexEffects:{skirk:{enabled:true,deathStacksAt:45,specialBurstAt:40,deathStacks:3}}};
 const simple=complexConfigForSimulation(p);assert.equal(simple.skirk.deathStacksAt,0);assert.equal(simple.skirk.deathStacks,3);assert.equal(p.complexEffects.skirk.deathStacksAt,45);
 assert.equal(complexConfigForSimulation({...p,simulationMode:'rotation'}).skirk.deathStacksAt,0);
 const fields=[['deathStacksAt','Renouvellement',0],['deathStacks','Cumuls',3]];
 assert.doesNotMatch(renderCharacterBuffFields('skirk',fields,{}),/deathStacksAt/);
 assert.doesNotMatch(renderCharacterBuffFields('skirk',fields,{}, {rotation:true}),/deathStacksAt/);
 const group=nativeBuffGroups('skirk').find(g=>g.keys.includes('deathStacks'));assert.equal(group.kind,'passive');assert.equal(group.index,1);
});
test('les auras de sets respectent 4 pièces, les éléments et leur non-cumul',()=>{
 const sets=[{id:15007,_id:'noblesse',_labKey:'15007'},{id:15025,_id:'deepwood',_labKey:'15025'}];
 const p={elementKey:'cryo',allies:[{character:'a',set:'noblesse',activeSetEffects:{15007:true}},{character:'b',set:'noblesse',activeSetEffects:{15007:true}},{character:'c',set:'deepwood',activeSetEffects:{15025:true}}]};
 assert.equal(partySetEffects(p,sets).length,1);assert.deepEqual(additionalPartySetBonuses(partySetEffects(p,sets)),{atkPct:20});
 assert.deepEqual(additionalPartySetBonuses(partySetEffects(p,sets),new Map([['15007',4]]),{'15007':{four:{atkPct:20}}}),{atkPct:0});
 p.allies[0].setMode='2+2';p.allies[1].setMode='2+2';assert.equal(partySetEffects(p,sets).length,0);
 p.elementKey='dendro';assert.equal(partySetEffects(p,sets)[0].bonuses.resReduction,30);
});
test('les suggestions résolvent les noms français/anglais et incluent les alternatives 2 pièces',()=>{
 const sets=JSON.parse(readFileSync(new URL('../assets/data/gi-artifacts.json',import.meta.url)));
 const guides=JSON.parse(readFileSync(new URL('../public/gi-build-reverse-fallback.json',import.meta.url)));
 const aliases=JSON.parse(readFileSync(new URL('../public/gi-name-aliases.json',import.meta.url)));
 const result=recommendedLabSets({id:10000114,_id:'skirk',_name:'Skirk',elementText:'Cryo'},sets,guides,aliases,'atk');
 assert.ok(result.recommended.some(set=>set.id===15040));assert.ok(result.alternatives.some(set=>set.id===14001));
});
import {configuredSetEffects} from '../src/lab-config.js';
test('les conditions des sets respectent le texte et ne suppriment pas les bonus personnalisés',()=>{
 const sets=JSON.parse(readFileSync(new URL('../assets/data/gi-artifacts.json',import.meta.url))).map(set=>({...set,_id:String(set.id),_labKey:String(set.id)}));
 const p={elementKey:'cryo',effectStates:{'set:15044:four:witch':{enabled:true},'set:14001:four:frozen':{enabled:true},'set:15025:four:dendro':{enabled:true}},customEffects:{'set:14001:four':{enabled:true,type:'critRate',value:5}}};
 let effects=configuredSetEffects(sets,p);assert.equal(effects['15044'].four.critRate,0);assert.equal(effects['14001'].four.critRate,45);assert.equal(effects['15025'].four.resReduction,undefined);
 p.effectStates['set:15044:four:hit']={enabled:true};p.elementKey='dendro';effects=configuredSetEffects(sets,p);assert.equal(effects['15044'].four.atkPct,25);assert.equal(effects['15044'].four.critRate,20);assert.equal(effects['15025'].four.resReduction,30);
});
test('les activations de Skirk sont indépendantes entre compétence, passif et déchaînement',()=>{
 const p={simulationMode:'single',complexEffects:{skirk:{enabled:true,primaryEnabled:false,enable_passive_1:true,enable_talent_2:false,sevenPhase:true,deathStacks:3,afterSpecialBurst:true,serpentExtra:12}}};
 let config=complexConfigForSimulation(p).skirk;assert.equal(config.enabled,true);assert.equal(config.sevenPhase,false);assert.equal(config.deathStacks,3);assert.equal(config.afterSpecialBurst,false);assert.equal(config.serpentExtra,0);
 p.complexEffects.skirk.primaryEnabled=true;p.complexEffects.skirk.enable_passive_1=false;config=complexConfigForSimulation(p).skirk;assert.equal(config.sevenPhase,true);assert.equal(config.deathStacks,0);
});

import {furinaBuffInputs,buffGroupInfo} from '../src/lab-buff-controls.js';
import {furinaFanfare} from '../src/complex-effects.js';
test('les points de Fanfare remplacent les variations de PV sans perdre les anciens calculs',()=>{
 const legacy={constellation:2,talentLevel:10,hpChangePercent:100,mode:'partyHPdelta'};
 const manual={...legacy,...furinaBuffInputs(legacy)};
 assert.equal(manual.mode,'manual');assert.equal(manual.fanfare,400);
 assert.equal(furinaFanfare(manual).dmgBonus,furinaFanfare(legacy).dmgBonus);assert.equal(furinaFanfare(manual).hpPct,furinaFanfare(legacy).hpPct);
 const group=nativeBuffGroups('furina')[0];assert.ok(group.keys.includes('fanfare'));assert.ok(!group.keys.includes('hpChangePercent'));
 assert.match(buffGroupInfo('furina',group).condition,/points de Fanfare/);
});
test('les bonus permanents de set sont automatiques, les conditions restent à activer',()=>{
 const set={id:15032,_id:'15032',effect2Pc:'Augmente les DGT infligés par la compétence élémentaire de 20 %.'};
 const result=configuredSetEffects([set],{effectStates:{'set:15032:two:base':{enabled:false},'set:15032:four:skill':{enabled:false}}});
 assert.equal(result['15032'].two.skillDmg,20);assert.equal(result['15032'].four.skillDmg,25);
});
