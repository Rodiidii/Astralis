import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {equippedStatVector,levelStatRow} from '../src/build-model.js';
import {artifactStatKey} from '../src/artifact-model.js';
import {snapshotCharacterStats} from '../src/lab-actions.js';
import {snapshotWeaponStats} from '../src/lab-config.js';
import {finalStats} from '../src/damage-engine.js';
const sourceSnapshot=JSON.parse(readFileSync(new URL('../data/lab-source-snapshot.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function fn(name){const a=source.indexOf('function '+name+'(');return source.slice(a,source.indexOf('\nfunction ',a+12));}
test('statistiques identiques avec snapshot ou tables de niveaux : sous-stats, set et bonus élémentaires',()=>{
 const set={_id:'set-test'},character={id:1,elementText:'Cryo',substatType:'FIGHT_PROP_ICE_ADD_HURT'},weapon={id:2,mainStatType:'FIGHT_PROP_CRITICAL'};
 const build={level:90,weaponLevelValue:90,pieces:[{mainType:'hpFlat',mainValue:4780},{mainType:'atkFlat',mainValue:311},{mainType:'atkPct',mainValue:46.6,substats:[{type:'critRate',value:13.2}]},{mainType:'cryoDmg',mainValue:46.6},{mainType:'critDmg',mainValue:62.2}]};
 const context={state:{labSources:true,catalogs:{}},equippedStatVector,artifactFinalStats:finalStats,artifactStatKey,giLevelRow:levelStatRow,hasEnkaReference:()=>false,
  element:()=> 'Cryo',giStatToken:x=>/Cryo|ICE/.test(x)?'cryoDmg':artifactStatKey(x),giBuildPieceSet:()=>set,configuredSetEffects:()=>({'set-test':{two:{atkPct:18},four:{}}}),
  snapshotCharacterStats:s=>s?{base:{hp:10000,atk:300,def:700,critRate:5,critDmg:50,er:100,em:0,dmgBonus:0},bonuses:{cryoDmg:28.8}}:null,
  snapshotWeaponStats:()=>({atk:600,specialized:.331})};
 vm.createContext(context);for(const name of ['giWeaponMaxLevel','giWeaponLevelValue','giBuildEquipmentBonuses','giSnapshotTotals','giBuildTotals'])vm.runInContext(fn(name),context);
 const snapshot=context.giBuildTotals(character,{},build,weapon,{});context.state.labSources=null;
 assert.equal(context.giBuildTotals(character,{},build,weapon,{}),null);
 const fallback=context.giBuildTotals(character,{levelStats:{'90':{level:90,hp:10000,attack:300,defense:700,specialized:.288}}},build,weapon,{'90':{level:90,attack:600,specialized:.331}});
 for(const[key,value]of Object.entries({hp:14780,atk:1792.4,def:700,em:0,critRate:51.3,critDmg:112.2,er:100,dmgBonus:75.4})){
  assert.ok(Math.abs(snapshot[key]-value)<1e-8,'snapshot '+key+': '+snapshot[key]);assert.ok(Math.abs(fallback[key]-value)<1e-8,'table '+key+': '+fallback[key]);
 }
});

test('une arme 2★ réglée au-delà de son plafond est ramenée à 70 au lieu de masquer toutes les stats',()=>{
 const character={id:10000002,_id:'kamisato-ayaka',elementText:'Cryo'},weapon={id:11201,rarity:2},build={level:90,weaponLevelValue:90,pieces:[]};
 let requestedWeaponLevel=null;
 const context={state:{labSources:sourceSnapshot,catalogs:{}},equippedStatVector,artifactFinalStats:finalStats,artifactStatKey,giLevelRow:levelStatRow,
  hasEnkaReference:()=>false,element:()=> 'Cryo',giStatToken:x=>/Cryo/.test(x)?'cryoDmg':artifactStatKey(x),giBuildPieceSet:()=>null,configuredSetEffects:()=>({}),
  snapshotCharacterStats,snapshotWeaponStats:(_snapshot,item,level,ascended)=>{requestedWeaponLevel=level;return snapshotWeaponStats(sourceSnapshot,item,level,ascended);}};
 vm.createContext(context);for(const name of ['giWeaponMaxLevel','giWeaponLevelValue','giBuildEquipmentBonuses','giSnapshotTotals','giBuildTotals'])vm.runInContext(fn(name),context);
 assert.equal(context.giWeaponMaxLevel(weapon),70);
 assert.equal(context.giWeaponMaxLevel({rarity:3}),90);
 const totals=context.giBuildTotals(character,{},build,weapon,{});
 assert.ok(totals,'les stats restent visibles avec l’arme au niveau maximal autorisé');
 assert.equal(requestedWeaponLevel,70);
 assert.equal(totals.weaponBase.level,70);
 assert.ok(totals.hp>10000&&totals.atk>300&&totals.def>500);
});
