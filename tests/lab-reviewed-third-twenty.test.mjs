import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,wrAttackOptions} from '../src/lab-wr-adapter.js';
import {THIRD_TWENTY_REVIEWED_BUFFS as profiles} from '../src/lab-reviewed-third-twenty.js';
import {renderSourceBuffs} from '../src/lab-source-buffs.js';
import {sourceAttackEffects} from '../src/lab-source-action-stats.js';
const e=await loadWrEngine();
const b=(key,c={},co=0,sourceStats={},extra={})=>buildWrCharacterData(e,{character:key,level:90,constellation:co,talent:{auto:10,skill:10,burst:10},conditionals:{[key]:c},sourceStats,...extra});
const own=(key,c={},co=0,stats={},extra={})=>evaluateWrTeam(e,b(key,c,co,stats,extra));
const team=(key,c={},co=0,stats={},active='Diluc',others=[])=>evaluateWrTeam(e,b(active),[b(key,c,co,stats),...others.map(key=>b(key))]);
const stat=(r,field,who=Object.keys(r.members)[0])=>r.members[who].stats[field];
const close=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-5,`${actual} != ${expected}`);
const delta=(key,c,field,co=0,stats={},active='Diluc',others=[])=>stat(team(key,c,co,stats,active,others),field,active)-stat(team(key,{},co,stats,active,others),field,active);
const value=(r,path)=>path.split('.').reduce((v,key)=>v?.[key],r.display)?.value;

test('Neuvillette : multiplicateur spécifique, PV actuels et C2 sans partage',()=>{
 const base=own('Neuvillette'),boost=own('Neuvillette',{a1Stacks:'3'});
 close(value(boost,'charged.judgmentDmg')/value(base,'charged.judgmentDmg'),1.6);
 close(value(boost,'charged.dmg'),value(base,'charged.dmg'));
 close(stat(own('Neuvillette',{a4Hp:'20'}),'hydroDmg'),12);
 close(stat(own('Neuvillette',{a4Hp:'50'}),'hydroDmg'),30);
 assert.ok(value(own('Neuvillette',{a1Stacks:'3'},2),'charged.judgmentDmg')>value(own('Neuvillette',{a1Stacks:'3'},1),'charged.judgmentDmg'));
 close(delta('Neuvillette',{a4Hp:'50'},'hydroDmg'),0);
});
test('Wriothesley : normales renforcées, chargée, cumuls et C4 sur le bon bénéficiaire',()=>{
 const base=own('Wriothesley'),skill=own('Wriothesley',{skillActive:'on'});
 close(value(skill,'normal.0'),value(skill,'skill.enhanced_0'));
 assert.ok(value(skill,'normal.0')>value(base,'normal.0'));
 close(value(own('Wriothesley',{a1Rebuke:'on'}),'charged.dmg')/value(base,'charged.dmg'),1.5);
 close(value(own('Wriothesley',{a1Rebuke:'on'},1),'charged.dmg')/value(own('Wriothesley',{},1),'charged.dmg'),3);
 close(stat(own('Wriothesley',{a4EdictStacks:'5'}),'atk'),stat(base,'atk'));
 const stacked=own('Wriothesley',{skillActive:'on',a4EdictStacks:'5'});
 close(stat(stacked,'atk')-stat(skill,'atk'),stacked.members.Wriothesley.baseAtk*.3);
 close(stat(own('Wriothesley',{c4Overheal:'on'},4),'attackSpeed'),20);
 close(delta('Wriothesley',{c4Overheal:'on'},'attackSpeed',4),10);
 close(stat(team('Wriothesley',{c4Overheal:'on'},4),'attackSpeed','Wriothesley'),0);
 close(delta('Wriothesley',{c4Overheal:'on'},'attackSpeed',3),0);
 close(stat(own('Wriothesley',{c4Overheal:'on',lockRevelation:'on',lockStellarRadianceSc:'on'},4),'damageReduction'),25);
});
test('Navia : shrapnels, bonus personnels et baisse Géo de C4',()=>{
 const r=own('Navia',{a1AfterSkill:'on',skillCharges:'6',shotsHit:'11'},6);
 for(const field of ['normalDmg','chargedDmg','plungeDmg'])close(stat(r,field),40);
 close(stat(r,'skillDmg'),45);close(delta('Navia',{a1AfterSkill:'on'},'normalDmg',6),0);
 close(team('Navia',{c4AfterBurstHit:'on'},4).enemyResistances.geo,-.1);
 close(team('Navia',{c4AfterBurstHit:'on'},3).enemyResistances.geo,.1);
 close(team('Navia',{c4AfterBurstHit:'on'},4).enemyResistances.pyro,.1);
});
test('Clorinde : ATQ finale, plafonds C0/C2, CRIT et protection C6 distincte',()=>{
 const c0=own('Clorinde',{a1Reactions:'3'},0,{atk:5000});
 const c2=own('Clorinde',{a1Reactions:'3'},2,{atk:5000});
 close(stat(c0,'electroNormalFlatDamage'),1800);close(stat(c2,'electroNormalFlatDamage'),2700);
 close(stat(c2,'burstFlatDamage'),2700);
 close(sourceAttackEffects(c2.members.Clorinde.stats,'normal','electro').flat,2700);
 close(sourceAttackEffects(c2.members.Clorinde.stats,'normal','physical').flat,0);
 close(stat(own('Clorinde',{a4BondChanges:'2'}),'critRate')-stat(own('Clorinde'),'critRate'),20);
 close(stat(own('Clorinde',{c6AfterSkill:'on'},6),'damageReduction'),0);
 close(stat(own('Clorinde',{c6VigilProtection:'on'},6),'damageReduction'),80);
 close(delta('Clorinde',{a4BondChanges:'2',c6AfterSkill:'on'},'critRate',6),0);
});
test('Arlecchino : seuil 30 %, C6 par catégorie et résistances personnelles',()=>{
 close(stat(own('Arlecchino',{bondPercent:'20'},0,{atk:2000}),'normalFlatDamage'),0);
 assert.ok(stat(own('Arlecchino',{bondPercent:'30'},0,{atk:2000}),'normalFlatDamage')>0);
 const r=own('Arlecchino',{c6AfterSkill:'on'},6);
 close(stat(r,'normalCritRate'),10);close(stat(r,'normalCritDmg'),70);close(stat(r,'burstCritRate'),10);close(stat(r,'burstCritDmg'),70);close(stat(r,'chargedCritDmg'),0);
 close(sourceAttackEffects(r.members.Arlecchino.stats,'normal','pyro').stats.critRate,stat(r,'critRate')+10);
 close(stat(own('Arlecchino',{},0,{atk:5000}),'pyroResistance'),20);
 close(stat(own('Arlecchino',{c2AfterAbsorb:'on'},2,{atk:5000}),'pyroResistance'),40);
 close(team('Arlecchino',{c2AfterAbsorb:'on'},2).enemyResistances.pyro,.1);
 close(delta('Arlecchino',{c6AfterSkill:'on'},'normalCritRate',6),0);
});
test('Chiori : bonus Géo personnel et normales C6 selon la DÉF',()=>{
 close(stat(own('Chiori',{a4Construct:'on'}),'geoDmg'),20);
 const r=own('Chiori',{},6,{def:2000});close(stat(r,'normalFlatDamage'),4700);close(stat(r,'chargedFlatDamage'),0);
 close(delta('Chiori',{a4Construct:'on'},'geoDmg'),0);
});
test('Émilie : ATQ vers bonus plafonné, baisse Dendro et ajout C6',()=>{
 close(stat(own('Emilie',{a4Burning:'on'},0,{atk:1000}),'dmgBonus'),15);
 close(stat(own('Emilie',{a4Burning:'on'},0,{atk:3000}),'dmgBonus'),36);
 close(team('Emilie',{c2Hit:'on'},2).enemyResistances.dendro,-.2);
 const r=own('Emilie',{c6Fragrance:'on'},6,{atk:2000});close(stat(r,'normalFlatDamage'),6000);close(stat(r,'chargedFlatDamage'),6000);close(stat(r,'plungeFlatDamage'),0);
 close(delta('Emilie',{a4Burning:'on'},'dmgBonus',0,{atk:3000}),0);
});
test('Gaming : soins reçus, seuil de PV et bonus limité à Augure nébuleux',()=>{
 const base=own('Gaming'),below=own('Gaming',{a4HpState:'below'}),above=own('Gaming',{a4HpState:'above'});
 close(stat(below,'incomingHealing'),20);close(stat(below,'healing'),0);close(stat(above,'incomingHealing'),0);
 close(value(above,'skill.cloudstriderDmg')/value(base,'skill.cloudstriderDmg'),1.2);
 close(value(above,'plunging.high'),value(base,'plunging.high'));
 assert.ok(stat(own('Gaming',{c2Overheal:'on'},2),'atk')>stat(own('Gaming',{},2),'atk'));
 close(delta('Gaming',{c2Overheal:'on'},'atk',2),0);
});
test('Sethos : ME uniquement sur Perce-ombre, bonus Électro et partage C4',()=>{
 const base=own('Sethos',{},0,{em:500}),active=own('Sethos',{a4Sandshade:'on'},0,{em:500});
 assert.ok(value(active,'charged.shadow')>value(base,'charged.shadow'));
 close(value(active,'burst.dusk_0'),value(base,'burst.dusk_0'));
 close(stat(own('Sethos',{c2Stacks:'2'},2),'electroDmg'),30);
 close(delta('Sethos',{c4Strike:'on'},'em',4),80);
 close(stat(own('Sethos',{c4Strike:'on'},4),'em')-stat(own('Sethos',{},4),'em'),80);
 close(delta('Sethos',{c4Strike:'on'},'em',3),0);
});
test('Tighnari : ME, plafond de 60 % et C4 partagée sans double comptage',()=>{
 close(stat(own('Tighnari',{p1AfterWreath:'on'}),'em'),50);
 close(stat(own('Tighnari',{},0,{em:2000}),'chargedDmg'),60);
 close(stat(own('Tighnari',{},0,{em:2000}),'burstDmg'),60);
 close(delta('Tighnari',{c4:'after'},'em',4),60);close(delta('Tighnari',{c4:'react'},'em',4),120);
 close(delta('Tighnari',{p1AfterWreath:'on'},'em'),0);
});
test('Cyno : transformation des normales, ME et C1 personnelle',()=>{
 const r=own('Cyno',{afterBurst:'on'});
 close(value(own('Cyno',{a1Judication:'on'}),'skill.skillDmg'),value(own('Cyno'),'skill.skillDmg'));
 close(value(r,'skill.skillDmg'),value(r,'skill.riteDmg'));
 close(value(own('Cyno',{afterBurst:'on',a1Judication:'on'}),'skill.skillDmg')/value(r,'skill.skillDmg'),1.35);
 close(stat(r,'em'),100);close(value(r,'normal.0'),value(r,'burst.normal_0'));close(value(r,'charged.dmg'),value(r,'burst.charged'));
 close(stat(own('Cyno',{c1Speed:'on'},1),'attackSpeed'),20);
 close(stat(own('Cyno',{c2NormHitStacks:'5'},2),'electroDmg'),50);
 close(delta('Cyno',{afterBurst:'on',c1Speed:'on'},'em',1),0);
 close(delta('Cyno',{c1Speed:'on'},'attackSpeed',1),0);
});
test('Dehya : C1 selon PV, poings C6 et bonus de compétence ciblé',()=>{
 const r=own('Dehya',{},1,{hp:40000});close(stat(r,'skillFlatDamage'),1440);close(stat(r,'burstFlatDamage'),2400);
 close(stat(own('Dehya',{c6CritStacks:'4'},6),'burstCritDmg'),60);
 close(stat(own('Dehya',{c6CritStacks:'4'},6),'burstCritRate'),10);
 close(stat(own('Dehya',{c6CritStacks:'4'},6),'normalCritDmg'),0);
 const base=own('Dehya',{},2),boost=own('Dehya',{c2InField:'on'},2);
 assert.ok(value(boost,'skill.fieldDmg')>value(base,'skill.fieldDmg'));
 close(delta('Dehya',{c6CritStacks:'4'},'burstCritDmg',6),0);
});
test('Dori : C4 uniquement pour le personnage relié, PV et énergie séparés',()=>{
 close(delta('Dori',{c4BelowHp:'belowHp',c4BelowEner:'belowEner'},'incomingHealing',4),0);
 close(delta('Dori',{burstLinked:'on',c4BelowHp:'belowHp'},'incomingHealing',4),50);
 close(delta('Dori',{burstLinked:'on',c4BelowEner:'belowEner'},'er',4),30);
 close(delta('Dori',{burstLinked:'on',c4BelowHp:'belowHp'},'er',4),0);
 close(delta('Dori',{burstLinked:'on',c4BelowHp:'belowHp'},'incomingHealing',3),0);
});
test('Sayu : paliers de C2 et dégâts/soins C6 plafonnés selon la ME',()=>{
 const base=own('Sayu',{},2),boost=own('Sayu',{c2SkillStack:'20'},2);
 assert.ok(value(boost,'skill.kickHoldDmg')>value(base,'skill.kickHoldDmg'));
 close(value(boost,'skill.wheelDmg'),value(base,'skill.wheelDmg'));
 const max=own('Sayu',{},6,{atk:2000,em:2000}),over=own('Sayu',{},6,{atk:2000,em:3000});
 close(value(max,'burst.darumaDmg'),value(over,'burst.darumaDmg'));close(value(max,'burst.darumaHeal'),value(over,'burst.darumaHeal'));
});
test('Lynette : diversité réelle, partage ATQ et bonus Anémo personnel',()=>{
 const r=team('Lynette',{a1AfterBurst:'on'},0,{},'Diluc',['Nahida','Furina']);
 const base=team('Lynette',{},0,{},'Diluc',['Nahida','Furina']);
 close(stat(r,'atk','Diluc')-stat(base,'atk','Diluc'),r.members.Diluc.baseAtk*.2);
 close(stat(own('Lynette',{c6AfterThrust:'on'},6),'anemoDmg')-stat(own('Lynette',{},6),'anemoDmg'),20);
 close(delta('Lynette',{burstAbsorb:'pyro'},'burstDmg'),0);
});
test('Fréminet : C4 plafonnée à deux cumuls, C6 à trois',()=>{
 const base=own('Freminet',{},6),two=own('Freminet',{c4C6Stacks:'2'},6),three=own('Freminet',{c4C6Stacks:'3'},6);
 close(stat(two,'atk'),stat(three,'atk'));close(stat(three,'critDmg')-stat(base,'critDmg'),36);
 close(stat(three,'atk')-stat(base,'atk'),three.members.Freminet.baseAtk*.18);
 close(delta('Freminet',{c4C6Stacks:'3'},'atk',6),0);
});
test('Xilonen : composition, échantillons, C2 selon élément et DÉF de C4/C6',()=>{
 close(team('Xilonen',{sourceActive:'on'}).enemyResistances.pyro,.1);
 close(team('Xilonen',{sourceActive:'on'},0,{},'Diluc',['Furina']).enemyResistances.pyro,-.26);
 close(team('Xilonen',{sourceActive:'on'},0,{},'Diluc',['Furina']).enemyResistances.hydro,-.26);
 close(delta('Xilonen',{sourceActive:'on'},'atk',2,{},'Diluc',['Furina']),team('Xilonen',{},2,{},'Diluc',['Furina']).members.Diluc.baseAtk*.45);
 close(delta('Xilonen',{c4Blooming:'on'},'normalFlatDamage',4,{def:3000}),1950);
 close(stat(own('Xilonen',{c6Imperishable:'on'},6,{def:3000}),'normalFlatDamage'),0);
 close(stat(own('Xilonen',{c6Imperishable:'on',nsBlessing:'on'},6,{def:3000}),'normalFlatDamage'),9000);
});
test('Ororon : Spiri-sens requis, C6 sur le personnage actif uniquement',()=>{
 close(stat(own('Ororon',{c2BurstHitStack:'4'},2),'electroDmg'),0);
 close(stat(own('Ororon',{c2Supersense:'on',c2BurstHitStack:'4'},2),'electroDmg'),40);
 const r=team('Ororon',{c6Stacks:'3'},6),base=team('Ororon',{},6);
 close(stat(r,'atk','Diluc')-stat(base,'atk','Diluc'),r.members.Diluc.baseAtk*.3);
 close(stat(r,'atk','Ororon'),stat(base,'atk','Ororon'));
});
test('Citlali : baisses Pyro/Hydro, ME finale, exclusion personnelle et C6',()=>{
 close(team('Citlali',{a1NsFreezeMelt:'on'}).enemyResistances.pyro,-.1);
 close(team('Citlali',{a1NsFreezeMelt:'on'},2).enemyResistances.hydro,-.3);
 close(team('Citlali',{a1NsFreezeMelt:'on'},2).enemyResistances.cryo,.1);
 close(delta('Citlali',{c1BladeConsume:'on'},'normalFlatDamage',1,{em:1000}),2000);
 close(stat(own('Citlali',{c1BladeConsume:'on'},1,{em:1000}),'normalFlatDamage'),0);
 close(delta('Citlali',{c2ShieldEleMas:'on'},'em',2),250);
 close(delta('Citlali',{c6NsConsumed:'40'},'pyroDmg',6),60);
 close(delta('Citlali',{c6NsConsumed:'40'},'dmgBonus',6),0);
});
test('Iansan : ATQ finale, plafond du talent et C2 excluant Iansan',()=>{
 const base=team('Iansan',{},0,{atk:4000}),buff=team('Iansan',{burstNs:'42'},0,{atk:4000});
 close(stat(buff,'atk','Diluc')-stat(base,'atk','Diluc'),690);
 const own0=own('Iansan',{},2),ownA1=own('Iansan',{a1Precise:'on'},2);
 close(stat(ownA1,'atk')-stat(own0,'atk'),ownA1.members.Iansan.baseAtk*.2);
 close(delta('Iansan',{a1Precise:'on'},'atk',2),team('Iansan',{},2).members.Diluc.baseAtk*.3);
 close(delta('Iansan',{c6Extreme:'on'},'dmgBonus',6),25);
 close(delta('Iansan',{c6Extreme:'on'},'dmgBonus',5),0);
});
test('20 fiches : descriptions, talents, commandes uniques, valeurs et catégories',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url))).characters;
 assert.equal(Object.keys(profiles).length,20);
 for(const [key,conditions]of Object.entries(profiles)){
  const record=manifest[key];assert.ok(record,key);const paths=record.conditions.map(c=>c.path);assert.equal(new Set(paths).size,paths.length,key);
  for(const [path,[talent,label,description]]of Object.entries(conditions)){
   const condition=record.conditions.find(c=>c.path===path);assert.ok(condition,key+':'+path);assert.equal(condition.talent,talent,key+':'+path);assert.equal(condition.label,label);assert.equal(condition.help,description);assert.ok(condition.description.length>25,key+':'+talent);
  }
  const html=renderSourceBuffs(record,{level:90,constellation:6});assert.ok(!html.includes('Le texte détaillé de ce talent n’est pas fourni'),key);
  const r=own(key,{},6),rows=wrAttackOptions(e,key,r.display,6,record);
  for(const kind of ['normal','charged','plunge','skill','burst'])assert.ok(rows.some(row=>row.kind===kind),key+':'+kind);
 }
});

test('les actions renforcées gardent leur vraie catégorie, sans faux dégâts pour les paramètres',()=>{
 const cases=[['Wriothesley','skill.enhanced_0','normal'],['Cyno','burst.normal_0','normal'],['Sethos','burst.dusk_0','charged'],['Gaming','skill.cloudstriderDmg','plunge']];
 for(const [key,path,kind]of cases){const rows=wrAttackOptions(e,key,own(key).display,0,{});assert.equal(rows.find(row=>row.wrPath===path)?.kind,kind,key);}
 const rows=wrAttackOptions(e,'Sethos',own('Sethos').display,0,{});assert.ok(!rows.some(row=>row.wrPath==='burst.dusk_dmgInc'));assert.ok(rows.some(row=>row.wrPath==='utility.burst'));
});
