import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,wrAttackOptions,createSourceEvaluator} from '../src/lab-wr-adapter.js';
import {LUNAR_STELLAR_REVIEWED_BUFFS as profiles} from '../src/lab-reviewed-lunar-stellar.js';
import {damageTypeInfo} from '../src/lab-damage-types.js';
const e=await loadWrEngine();
const b=(character,c={},co=0,sourceStats={})=>buildWrCharacterData(e,{character,constellation:co,talent:{auto:10,skill:10,burst:10},conditionals:{[character]:c},sourceStats});
const own=(k,c={},co=0,stats={},others=[])=>evaluateWrTeam(e,b(k,c,co,stats),others.map(k=>b(k)));
const team=(k,c={},co=0,stats={},others=[])=>evaluateWrTeam(e,b('Diluc'),[b(k,c,co,stats),...others.map(k=>b(k))]);
const s=(r,k,who='Diluc')=>r.members[who].stats[k];
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-5,`${a} != ${b}`);
const delta=(key,c,field,co=0,stats={},others=[])=>s(team(key,c,co,stats,others),field)-s(team(key,{},co,stats,others),field);

test('Aino : ME d’équipe, bonus C6 selon signelune, ajout d’ultime personnel',()=>{
 close(delta('Aino',{c1AfterSkillOrBurst:'on'},'em',1),80);
 close(delta('Aino',{c6AfterBurst:'on'},'lunarchargedDmg',6),15);
 close(delta('Aino',{c6AfterBurst:'on'},'lunarchargedDmg',6,{},['Ineffa']),35);
 close(s(own('Aino',{},0,{em:600}),'burstFlatDamage','Aino'),300);
 close(delta('Aino',{c6AfterBurst:'on'},'hydroDmg',6),0);
});
test('Columbina : Éclat requis, PV source, domaine C6 et plafonds',()=>{
 close(delta('Columbina',{c2Lunarcharged:'lunarcharged'},'atk',2,{hp:40000},['Aino']),0);
 close(delta('Columbina',{c2Brilliance:'on',c2Lunarcharged:'lunarcharged'},'atk',2,{hp:40000},['Aino']),400);
 close(delta('Columbina',{c2Brilliance:'on',c2Lunarbloom:'lunarbloom'},'em',2,{hp:40000},['Aino']),140);
 close(delta('Columbina',{c2Brilliance:'on',c2Lunarcrystallize:'lunarcrystallize'},'def',2,{hp:40000},['Aino']),400);
 close(delta('Columbina',{c6Lunarbloom:'lunarbloom'},'dendroCritDmg',6),0);
 close(delta('Columbina',{burstDomain:'on',c6Lunarbloom:'lunarbloom'},'dendroCritDmg',6),80);
 close(s(team('Columbina',{},0,{hp:100000}),'lunarchargedBaseBonus'),7);
 close(s(team('Columbina',{},6,{hp:40000}),'lunarchargedElevation'),20);
});
test('Flins : ATQ vers ME, plafond et résistance seulement sous Lueur ascendante',()=>{
 close(s(own('Flins',{},0,{atk:3000}),'em','Flins'),160);
 close(s(own('Flins',{},4,{atk:3000}),'em','Flins'),220);
 close(team('Flins',{c2AfterElectro:'on'},2).enemyResistances.electro,.1);
 close(team('Flins',{c2AfterElectro:'on'},2,{},['Aino']).enemyResistances.electro,-.15);
});
test('Ineffa : ATQ finale vers ME et bonus de Sélénocution uniquement',()=>{
 close(delta('Ineffa',{a4AfterBurst:'on'},'em',0,{atk:3000}),180);
 close(delta('Ineffa',{c1AfterShield:'on'},'lunarchargedDmg',1,{atk:1000}),25);
 close(delta('Ineffa',{c1AfterShield:'on'},'lunarchargedDmg',1,{atk:3000}),50);
 close(delta('Ineffa',{c1AfterShield:'on'},'electroDmg',1,{atk:3000}),0);
});
test('Lauma : ME, CRIT de réaction selon signelune et résistances ciblées',()=>{
 close(s(own('Lauma',{},0,{em:2000}),'skillDmg','Lauma'),32);
 close(delta('Lauma',{a1AfterSkill:'on'},'lunarbloomCritRate',0,{em:1000},['Aino']),10);
 close(delta('Lauma',{a1AfterSkill:'on'},'lunarbloomCritDmg',0,{em:1000},['Aino']),20);
 close(delta('Lauma',{burstPaleHymn:'on'},'lunarbloomFlatDamage',2,{em:0},['Aino']),0);
 assert.ok(delta('Lauma',{burstPaleHymn:'on'},'lunarbloomFlatDamage',2,{em:1000},['Aino'])>4000);
 const r=team('Lauma',{skillAfterHit:'on'});assert.ok(r.enemyResistances.dendro<.1);close(r.enemyResistances.hydro,r.enemyResistances.dendro);close(r.enemyResistances.electro,.1);
});
test('Nefer : voiles dépendant de la signelune et baisse Dendro C4',()=>{
 const base=own('Nefer',{},2,{},['Aino']),boost=own('Nefer',{a1VeilStacks:'5'},2,{},['Aino']);
 close(s(boost,'em','Nefer')-s(base,'em','Nefer'),200);
 close(team('Nefer',{c4ShadowDance:'on'},4).enemyResistances.dendro,-.1);
 close(delta('Nefer',{a1VeilStacks:'5'},'em',2,{},['Aino']),0);
});
test('Zibai : DÉF source et bonus d’équipe limité à Sélénocristallisation',()=>{
 close(s(team('Zibai',{},0,{def:4000}),'lunarcrystallizeBaseBonus'),14);
 close(delta('Zibai',{c2ShiftMode:'on'},'lunarcrystallizeDmg',2),30);
 close(delta('Zibai',{c2ShiftMode:'on'},'geoDmg',2),0);
 const r=own('Zibai',{},0,{},['Zhongli','Furina']);assert.ok(s(r,'em','Zibai')>=60);
});
test('Mitya : noyau stable requis, limites et C1 au personnage actif',()=>{
 close(delta('Mitya',{a1Beacons:'5'},'em',1),0);
 close(delta('Mitya',{coreType:'overloaded',a1Beacons:'5'},'em',1),0);
 close(delta('Mitya',{coreType:'steady',a1Beacons:'5'},'em',1),150);
 close(delta('Mitya',{c2CoreType:'overloaded'},'em',2),0);
 close(delta('Mitya',{c2CoreField:'on',c2CoreType:'overloaded'},'em',2),234);
 close(delta('Mitya',{c1Core:'on'},'critDmg',1),40);
 close(s(team('Mitya',{c1Core:'on'},1),'critDmg','Mitya')-s(team('Mitya',{},1),'critDmg','Mitya'),0);
});
test('Valeriy : partage de ME et ordre d’assaut selon ATQ finale',()=>{
 close(delta('Valeriy',{c2Skill:'on'},'em',2),100);
 const c={chargedOffensive:'on',a4Momentum:'100',a0StellarRadianceSc:'sc'};
 const zero=team('Valeriy',c,4,{atk:0}),buff=team('Valeriy',c,4,{atk:2000});
 assert.ok(s(buff,'stellarconductFlatDamage')>s(zero,'stellarconductFlatDamage'));
 close(delta('Valeriy',{c2Skill:'on'},'em',1),0);
});
test('Vesna : radiance, cumuls personnels et nature des lames',()=>{
 close(s(own('Vesna',{skillArmed:'on'},1),'stellarswirlDmg','Vesna'),20);
 close(delta('Vesna',{skillArmed:'on'},'stellarswirlDmg',1),0);
 assert.ok(s(own('Vesna',{a1Stacks:'6'},2),'atk','Vesna')>s(own('Vesna',{},2),'atk','Vesna'));
 const r=own('Vesna',{a0StellarRadiance:'ss'},6),rows=wrAttackOptions(e,'Vesna',r.display,6);
 assert.ok(rows.some(row=>row.damageType.id==='stellarSwirl'));
});
test('les vraies attaques lunaires/stellaires sont listées et gardent leur nature évaluée',()=>{
 const cases=[['Ineffa',{},'passive1.dmg','lunarCharged'],['Nefer',{},'skill.shade1Dmg','lunarBloom'],['Flins',{},'burst.middleLunarDmg','lunarCharged'],['Zibai',{},'burst.skill2Dmg','lunarCrystallize'],['Mitya',{},'charged.detonationStellarDmg','stellarConduct']];
 for(const [character,conditionals,path,id]of cases){
  const result=own(character,conditionals,6),rows=wrAttackOptions(e,character,result.display,6);
  const row=rows.find(r=>r.wrPath===path);assert.ok(row,character+':'+path);assert.equal(row.damageType.id,id);assert.ok(row.text.includes(row.damageType.label));
  const calculation=createSourceEvaluator(e,{active:{character,constellation:6},team:[],setKeys:{},path,hitCount:1})();assert.ok(calculation.ok);assert.equal(calculation.damageType.id,id);
 }
 const rows=wrAttackOptions(e,'Flins',own('Flins',{},6).display,6);assert.equal(rows.find(row=>row.wrPath==='burst.skillDmg').damageType.id,'electro');
 assert.equal(damageTypeInfo({variant:'stellarswirl',subVariant:'cryo'}).id,'stellarSwirl');
});
test('dix fiches vérifiées : descriptions, rattachements et aucune condition en double',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url))).characters;
 assert.equal(Object.keys(profiles).length,10);
 for(const [key,rows]of Object.entries(profiles)){
  const record=manifest[key];assert.equal(new Set(record.conditions.map(c=>c.path)).size,record.conditions.length);
  for(const [path,[talent,label,help]]of Object.entries(rows)){const condition=record.conditions.find(c=>c.path===path);assert.ok(condition,key+path);assert.equal(condition.talent,talent);assert.equal(condition.label,label);assert.equal(condition.help,help);assert.ok(condition.description.length>25,key+path);}
 }
});
