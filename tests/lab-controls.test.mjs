
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {attackKind,attackOptions,configuredSetEffects,configuredWeaponBonuses,setEffectOptions,snapshotWeaponStats} from '../src/lab-config.js';
import {evaluateDamageStats,optimizeArtifacts} from '../src/optimizer.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/data/gi-artifacts.json',import.meta.url)));
const makeSet=id=>{const set=catalog.find(s=>s.id===id);return {...set,_id:String(id),_labKey:String(id)};};
const input={baseStats:{atk:1000,critRate:0,critDmg:0},hit:{actionKind:'charged',talentMultiplier:1,baseStat:'atk',attackerLevel:90,enemyLevel:100,enemyResistance:.1},bonuses:{}};
test('catégories : NA, CA, plongeante, skill et burst restent distinctes',()=>{
 assert.equal(attackKind(0,'DGT attaque chargée'),'charged');assert.equal(attackKind(0,'DGT chute basse'),'plunge');assert.equal(attackKind(0,'1er coup'),'normal');
 assert.equal(attackKind(1,'coup chargé'),'skill');assert.equal(attackKind(2,'coup'),'burst');
 const ctx={skills:[{values:['Attaque : 100%','Attaque chargée : 150% ×2','Chute basse : 200%']} ]};
 const rows=attackOptions(ctx,{talentLevel:10});
 assert.deepEqual(rows.map(row=>row.kind),['normal','charged','plunge']);
 assert.equal(rows[1].parsed.hitCount,2);
});
test('bonus de CA appliqué au build candidat uniquement avec quatre pièces',()=>{
 const set=makeSet(15003),p={effectStates:{'set:15003:four:ranged':{enabled:true}}};
 const effects=configuredSetEffects([set],p);
 const no=evaluateDamageStats({...input,setEffects:effects},{},new Map([['15003',2]]));
 const yes=evaluateDamageStats({...input,setEffects:effects},{},new Map([['15003',4]]));
 assert.ok(Math.abs(yes.total/no.total-1.35)<1e-10);
 const normal=evaluateDamageStats({...input,hit:{...input.hit,actionKind:'normal'},setEffects:effects},{},new Map([['15003',4]]));
 assert.equal(normal.total,no.total);
});
test('cumuls du Chasseur, conditions désactivées par défaut, et types Skill/Q',()=>{
 const chasseur=makeSet(15031);
 assert.equal(configuredSetEffects([chasseur],{})['15031'].four.critRate,undefined);
 const active=configuredSetEffects([chasseur],{effectStates:{'set:15031:four:hpchange':{enabled:true,stacks:3}}});
 assert.equal(active['15031'].four.critRate,36);
 const golden=configuredSetEffects([makeSet(15032)],{effectStates:{'set:15032:four:offfield':{enabled:true}}});
 assert.equal(golden['15032'].two.skillDmg,20);assert.equal(golden['15032'].four.skillDmg,50);
 assert.equal(golden['15032'].four.burstDmg,undefined);
});
test('un effet complexe non interprété reste configurable sans JSON',()=>{
 const unknown={id:999,_id:'custom',effect2Pc:'Condition complexe de 20 % si deux alliés...',effect4Pc:'Une formule non documentée.'};
 assert.equal(setEffectOptions(unknown).two.length,0);
 const effects=configuredSetEffects([unknown],{customEffects:{'set:custom:four':{enabled:true,type:'burstDmg',value:45}}});
 assert.equal(effects.custom.four.burstDmg,45);
});
test('passif d’arme : activation, raffinement et désactivation',()=>{
 const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));
 const weapon={...weapons.find(row=>row.id===11515),_id:'absolution'};
 assert.equal(configuredWeaponBonuses(weapon,{weaponRefinement:1}).critDmg,20);
 assert.equal(configuredWeaponBonuses(weapon,{weaponRefinement:5}).critDmg,40);
 assert.equal(configuredWeaponBonuses(weapon,{weaponRefinement:5,effectStates:{'weapon:absolution:base':{enabled:false}}}).critDmg,undefined);
});
test('arme : croissance locale exacte, secondaire et aucun cumul du raffinement natif',()=>{
 const snapshot=JSON.parse(readFileSync(new URL('../data/lab-source-snapshot.json',import.meta.url)));
 const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));
 const weapon=weapons.find(row=>row.id===11515);
 const stats=snapshotWeaponStats(snapshot,weapon,90);
 assert.ok(stats.atk>670&&stats.atk<680);assert.ok(stats.specialized>.44&&stats.specialized<.45);
 assert.ok(snapshotWeaponStats(snapshot,weapon,80).atk<stats.atk);
});
test('les effets conditionnels guident la recherche sans créer de pièces',async()=>{
 const inventory=Array.from({length:5},(_,i)=>({id:'mine-'+i,slotIndex:i,slot:['flower','plume','sands','goblet','circlet'][i],setKey:'15003',mainType:'atkFlat',mainValue:1,substats:[],level:0}));
 const effects=configuredSetEffects([makeSet(15003)],{effectStates:{'set:15003:four:ranged':{enabled:true}}});
 const result=await optimizeArtifacts({inventory,input:{...input,setEffects:effects},filters:{configuration:'any'},topN:1});
 assert.equal(result.results.length,1);
 assert.deepEqual(result.results[0].rows.slice().sort(),inventory.map(row=>row.id).sort());
});

test('un buff source respecte le terrain, le plafond et sa durée', async () => {
 const {activeBuffBonuses}=await import('../src/lab-actions.js');
 const p={fightPosition:'on',buffs:[{
  type:'atkFlat',active:true,sourcePosition:'off',sourceCondition:'off',
  sourceStat:1000,sourcePercent:30,value:50,stacks:2,maximum:600,duration:10
 }]};
 assert.equal(activeBuffBonuses(p).atkFlat,600);
 assert.equal(activeBuffBonuses(p,10).atkFlat,undefined);
 p.buffs[0].sourcePosition='on';
 assert.equal(activeBuffBonuses(p).atkFlat,undefined);
 p.buffs[0].sourcePosition='off';
 p.buffs[0].position='off';
 assert.equal(activeBuffBonuses(p).atkFlat,undefined);
});

test('les buffs de pourcentage d’équipe utilisent les stats de base',async()=>{
 const {applyTeamStatBonuses}=await import('../src/build-model.js');
 const result=applyTeamStatBonuses({atk:2400,hp:30000,def:1000,baseAtk:800,
  base:{hp:12000,defense:600}}, {atk:25,atkFlat:100,hp:20,hpFlat:500,def:30});
 assert.equal(result.atk,2700);
 assert.equal(result.hp,32900);
 assert.equal(result.def,1180);
});

test('plusieurs composantes de passif sont conservées et désactivables',()=>{
 const scope='set:custom:four';
 const p={customEffects:{[scope]:{enabled:true,type:'atkPct',value:20,
  additional:[{enabled:true,type:'em',value:120},{enabled:false,type:'critRate',value:50}]}}};
 const effects=configuredSetEffects([{id:999,_id:'custom'}],p).custom.four;
 assert.equal(effects.atkPct,20);
 assert.equal(effects.em,120);
 assert.equal(effects.critRate,undefined);
});

test('Emblème recalcule le bonus de Q sur la recharge de chaque candidat et respecte 75 %',()=>{
 const effects=configuredSetEffects([makeSet(15020)],{});
 const hit={...input.hit,actionKind:'burst'};
 const base={...input,hit,baseStats:{atk:1000,er:100},setEffects:effects};
 const counts=new Map([['15020',4]]);
 const first=evaluateDamageStats(base,{},counts);
 const stronger=evaluateDamageStats(base,{er:100},counts);
 const capped=evaluateDamageStats(base,{er:300},counts);
 const without=evaluateDamageStats({...base,setEffects:{}},{});
 assert.ok(Math.abs(first.total/without.total-1.3)<1e-8);
 assert.ok(Math.abs(stronger.total/without.total-1.55)<1e-8);
 assert.ok(Math.abs(capped.total/without.total-1.75)<1e-8);
});
