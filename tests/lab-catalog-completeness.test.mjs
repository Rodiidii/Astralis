import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,evaluateWrDisplay,wrAttackOptions,sourceScenario,createSourceEvaluator} from '../src/lab-wr-adapter.js';
import {snapshotWeaponStats} from '../src/lab-config.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const engine=await loadWrEngine(),manifest=read('data/lab-character-conditions.json'),aliases=read('public/gi-name-aliases.json'),sourceSnapshot=read('data/lab-source-snapshot.json'),weapons=read('assets/data/gi-weapons.json');
test('chaque fiche expose normales, chargées, plongeantes, compétence et ultime',()=>{
 for(const key of Object.keys(engine.characters)){
  const build=buildWrCharacterData(engine,{character:key,constellation:6}),display=evaluateWrDisplay(engine,build).display;
  const rows=wrAttackOptions(engine,key,display,6,manifest.characters[key]);
  for(const kind of ['normal','charged','plunge','skill','burst'])assert.ok(rows.some(row=>row.kind===kind),key+':'+kind);
  for(const row of rows){assert.ok(!row.label.includes('NaN'),key);const result=createSourceEvaluator(engine,{active:{character:key,constellation:6},team:[],setKeys:{},path:row.wrPath,hitCount:1})();assert.ok(result.ok,key+':'+row.wrPath);}
 }
});
test('les 255 armes ajoutent leur ATQ de base exacte et leur statistique secondaire',()=>{
 for(const weapon of weapons){
  const level=weapon.rarity<3?70:90,expected=snapshotWeaponStats(sourceSnapshot,weapon,level);
  assert.ok(expected,weapon.name);
  const scenario=sourceScenario(engine,{character:'diluc',level:90,weaponOverride:weapon.id,weaponLevel:90},{characters:[{_id:'diluc',name:'Diluc'}],weapons,aliases,sourceSnapshot});
  assert.ok(scenario.active.weapon,weapon.name);
  const build=buildWrCharacterData(engine,scenario.active),r=evaluateWrTeam(engine,build);
  assert.ok(Math.abs(r.members.diluc.baseAtk-(334.849732+expected.atk))<1,weapon.name+':ATQ de base');
  if(expected.specialized!=null&&!scenario.active.weapon.snapshotStats){const target=engine.uiDataForTeam({[build.character]:build.ownData},'F',build.character)[build.character].target;assert.ok(Math.abs(Number(target.get(engine.input.weapon.sub)?.value)-expected.specialized)<.0001,weapon.name+':secondaire');}
 }
});
test('les niveaux et élévations des armes correspondent aux tables à chaque borne',()=>{
 for(const weapon of weapons)for(const level of [1,20,40,50,60,70,80,90].filter(level=>weapon.rarity>=3||level<=70)){
  const expected=snapshotWeaponStats(sourceSnapshot,weapon,level);
  const scenario=sourceScenario(engine,{character:'diluc',level:90,weaponOverride:weapon.id,weaponLevel:level},{characters:[{_id:'diluc',name:'Diluc'}],weapons,aliases,sourceSnapshot});
  const build=buildWrCharacterData(engine,scenario.active),r=evaluateWrTeam(engine,build);
  assert.ok(Math.abs(r.members.diluc.baseAtk-(334.849732+expected.atk))<1,weapon.name+':'+level);
 }
});
test('chaque condition de kit possède un texte, une commande et une évaluation propre et en équipe',()=>{
 const active=buildWrCharacterData(engine,{character:'Diluc'});
 for(const [key,record]of Object.entries(manifest.characters))for(const condition of record.conditions){
  assert.ok(condition.options.length>1,key+condition.path);
  assert.ok(condition.description||condition.path==='moonsignAfterSkillBurst',key+condition.path+':texte');
  const source=buildWrCharacterData(engine,{character:key,constellation:6,conditionals:{[key]:{[condition.path]:condition.options.at(-1)}}});
  const own=evaluateWrTeam(engine,source),team=evaluateWrTeam(engine,active,[source]);
  assert.ok(Number.isFinite(own.display.basic.atk.value),key+condition.path+':propre');
  assert.ok(Number.isFinite(team.display.basic.atk.value),key+condition.path+':équipe');
 }
});
