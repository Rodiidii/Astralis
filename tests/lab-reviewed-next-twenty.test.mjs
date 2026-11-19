import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,evaluateWrDisplay,wrAttackOptions} from '../src/lab-wr-adapter.js';
import {NEXT_TWENTY_REVIEWED_BUFFS as profiles} from '../src/lab-reviewed-next-twenty.js';
import {renderSourceBuffs} from '../src/lab-source-buffs.js';
import {sourceAttackEffects,sourceReactionEffects} from '../src/lab-source-action-stats.js';
const e=await loadWrEngine();
const b=(character,c={},co=6,sourceStats={},extra={})=>buildWrCharacterData(e,{character,constellation:co,level:90,talent:{auto:10,skill:10,burst:10},conditionals:{[character]:c},sourceStats,...extra});
const own=(k,c={},co=6,stats={},extra={})=>evaluateWrTeam(e,b(k,c,co,stats,extra));
const team=(k,c={},co=6,stats={},active='Diluc',others=[])=>evaluateWrTeam(e,b(active),[b(k,c,co,stats),...others.map(v=>typeof v==='string'?b(v):v)]);
const s=(r,k,member)=>r.members[member||Object.keys(r.members)[0]].stats[k];
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-6,`${a} != ${b}`);
const delta=(k,c,field,co=6,stats={},active='Diluc',others=[])=>s(team(k,c,co,stats,active,others),field,active)-s(team(k,{},co,stats,active,others),field,active);
test('Jean : C1 personnelle, C2 partagée, baisse Anémo et réduction des dégâts subis',()=>{
 close(delta('Jean',{c2:'on'},'attackSpeed'),15);close(delta('Jean',{c2:'on'},'movementSpeed'),15);
 close(team('Jean',{c4:'on'}).enemyResistances.anemo,-.3);close(team('Jean',{c4:'on'}).enemyResistances.cryo,.1);
 close(delta('Jean',{c6:'on'},'damageReduction'),35);close(delta('Jean',{c2:'on'},'attackSpeed',0),0);
 assert.ok(own('Jean',{c1:'on'}).display.skill.dmg.value>own('Jean').display.skill.dmg.value);
});
test('Diona : seuil C6 exclusif et Révélation/radiance conditionnelles',()=>{
 close(delta('Diona',{Constellation6:'higher'},'em'),200);close(delta('Diona',{Constellation6:'higher'},'incomingHealing'),0);
 close(delta('Diona',{Constellation6:'lower'},'incomingHealing'),30);close(delta('Diona',{Constellation6:'lower'},'em'),0);
 close(delta('Diona',{Ascension1:'on'},'staminaReduction'),-10);
 close(delta('Diona',{lockRevelation:'on',lockStellarRadianceSc:'on'},'superconductDmg'),0);
 close(delta('Diona',{lockRevelation:'on',lockStellarRadianceSc:'on',Constellation6:'higher'},'superconductDmg'),40);
});
test('Layla : force du bouclier et ajout de 5 % des PV aux normales/chargées',()=>{
 close(delta('Layla',{a1Stacks:'4'},'shieldStrength'),24);
 close(delta('Layla',{c4Active:'on'},'normalFlatDamage',6,{hp:40000}),2000);
 close(delta('Layla',{c4Active:'on'},'chargedFlatDamage',6,{hp:20000}),1000);
 close(delta('Layla',{c4Active:'on'},'skillFlatDamage',6,{hp:40000}),0);
});
test('Thomas : 25 % de force, C6 limitée aux normales/chargées/plongeantes et PV du P2',()=>{
 close(delta('Thoma',{p1BarrierStacks:'5'},'shieldStrength'),25);
 for(const field of ['normalDmg','chargedDmg','plungeDmg'])close(delta('Thoma',{c6AfterBarrier:'on'},field),15);
 close(delta('Thoma',{c6AfterBarrier:'on'},'burstDmg'),0);
 assert.ok(own('Thoma',{},0,{hp:40000}).display.burst.collapseDmg.value>own('Thoma',{},0,{hp:20000}).display.burst.collapseDmg.value);
});
test('Candace : normales élémentaires seulement et coefficient PV',()=>{
 close(delta('Candace',{afterBurst:'on'},'normalElementalDmg',0,{hp:40000}),40);
 close(delta('Candace',{afterBurst:'on'},'normalElementalDmg',0,{hp:20000}),30);
 close(delta('Candace',{afterBurst:'on'},'normalDmg',0,{hp:40000}),0);
 close(delta('Candace',{afterBurst:'on'},'chargedDmg',0,{hp:40000}),0);
 assert.ok(s(own('Candace',{c2AfterSkillHit:'on'}),'hp')>s(own('Candace'),'hp'));
});
test('Rosalia : taux CRIT source, plafond, exclusion personnelle et C6 physique',()=>{
 close(delta('Rosaria',{RosariaA4:'on'},'critRate',0,{critRate:80}),12);
 close(delta('Rosaria',{RosariaA4:'on'},'critRate',0,{critRate:200}),15);
 close(delta('Rosaria',{RosariaA4:'on'},'critRate',0,{critRate:0}),0);
 close(s(own('Rosaria',{RosariaA4:'on'},0,{critRate:80}),'critRate'),s(own('Rosaria',{},0,{critRate:80}),'critRate'));
 close(team('Rosaria',{DilucC6:'on'}).enemyResistances.physical,-.1);
 close(delta('Rosaria',{RosariaC1:'on'},'normalDmg'),0);
});
test('Mika : état requis, paliers et CRIT physique uniquement',()=>{
 close(delta('Mika',{a1DetectorStacks:'5',c6Crit:'on'},'physicalDmg'),0);
 close(delta('Mika',{inSoulwind:'on',a1DetectorStacks:'5',c6Crit:'on'},'physicalDmg'),50);
 close(delta('Mika',{inSoulwind:'on',c6Crit:'on'},'physicalCritDmg'),60);
 close(delta('Mika',{inSoulwind:'on',c6Crit:'on'},'critDmg'),0);
 close(delta('Mika',{inSoulwind:'on',c6Crit:'on'},'physicalCritDmg',0),0);
 const manifest=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url))).characters;
 const html=renderSourceBuffs(manifest.Mika,{level:20,constellation:0});
 const options=html.match(/<select[^>]*data-source-path="a1DetectorStacks"[\s\S]*?<\/select>/)?.[0];assert.ok(options);assert.ok(!options.includes('value="4"')&&!options.includes('value="5"'));
});
test('Faruzan : ATQ de base uniquement, état requis et bonus Anémo',()=>{
 close(delta('Faruzan',{burstBenefit:'on',a4Active:'on'},'anemoFlatDamage',0,{baseAtk:1000}),320);
 close(delta('Faruzan',{a4Active:'on'},'anemoFlatDamage',0,{baseAtk:1000}),0);
 close(delta('Faruzan',{burstBenefit:'on',c6Crit:'on'},'anemoCritDmg'),40);
 close(team('Faruzan',{burstHit:'on'}).enemyResistances.anemo,-.2);
 close(delta('Faruzan',{burstBenefit:'on'},'pyroDmg'),0);
});
test('Chevreuse : restriction de composition, PV, plafond et bénéficiaires',()=>{
 const c={a1AfterOverload:'on'};close(team('Chevreuse',c,0,{},'Diluc',['Fischl']).enemyResistances.pyro,-.3);
 close(team('Chevreuse',c,0,{},'Diluc',['Fischl','Jean']).enemyResistances.pyro,.1);
 const a=delta('Chevreuse',{a4AfterBall:'on'},'atk',0,{hp:40000}),z=delta('Chevreuse',{a4AfterBall:'on'},'atk',0,{hp:80000});close(a,z);assert.ok(a>0);
 close(delta('Chevreuse',{a4AfterBall:'on'},'atk',0,{hp:40000},'Ganyu'),0);
 close(delta('Chevreuse',{c6AfterHealStacks:'3'},'pyroDmg'),60);close(delta('Chevreuse',{c6AfterHealStacks:'3'},'electroDmg'),60);
});
test('Charlotte : ATQ personnelle, composition Fontaine et C4 sur ultime',()=>{
 close(delta('Charlotte',{c2Hit:'3'},'atk'),0);assert.ok(s(own('Charlotte',{c2Hit:'3'}),'atk')>s(own('Charlotte'),'atk'));
 const r=evaluateWrTeam(e,b('Charlotte'),[b('Furina'),b('Diluc')]);close(s(r,'healing','Charlotte'),5);close(s(r,'cryoDmg','Charlotte')-s(own('Charlotte'),'cryoDmg'),5);
 assert.ok(own('Charlotte',{c4Marked:'on'}).display.burst.skillDmg.value>own('Charlotte').display.burst.skillDmg.value);
});
test('Yaoyao : C1 Dendro et ME personnelle selon PV plafonnée',()=>{
 close(delta('Yaoyao',{c1Explode:'on'},'dendroDmg'),15);
 close(s(own('Yaoyao',{c4AfterSkillBurst:'on'},6,{hp:20000}),'em')-s(own('Yaoyao',{},6,{hp:20000}),'em'),60);
 close(s(own('Yaoyao',{c4AfterSkillBurst:'on'},6,{hp:80000}),'em')-s(own('Yaoyao',{},6,{hp:80000}),'em'),120);
 close(delta('Yaoyao',{c4AfterSkillBurst:'on'},'em',6,{hp:40000}),0);
});
test('Kirara : sept éléments, pas physique, et conversion personnelle des PV',()=>{
 for(const ele of ['pyro','hydro','cryo','electro','anemo','geo','dendro'])close(delta('Kirara',{c6AfterSkillBurst:'on'},ele+'Dmg'),12);
 close(delta('Kirara',{c6AfterSkillBurst:'on'},'physicalDmg'),0);
 close(s(own('Kirara',{},0,{hp:40000}),'skillDmg'),16);close(s(own('Kirara',{},0,{hp:40000}),'burstDmg'),12);
});
test('Baizhu : réactions distinctes selon PV et plafond à 50 000',()=>{
 const c={a4AfterHeal:'on'};for(const field of ['bloomDmg','burningDmg','hyperbloomDmg','burgeonDmg'])close(delta('Baizhu',c,field,0,{hp:50000}),100);
 close(delta('Baizhu',c,'aggravateDmg',0,{hp:50000}),40);close(delta('Baizhu',c,'lunarbloomDmg',0,{hp:50000}),35);
 close(delta('Baizhu',c,'bloomDmg',0,{hp:100000}),100);close(delta('Baizhu',c,'dendroDmg',0,{hp:50000}),0);
 close(delta('Baizhu',{c4AfterBurst:'on'},'em'),80);
 close(s(own('Baizhu',{a1HpStatus:'below'}),'healing'),20);close(s(own('Baizhu',{a1HpStatus:'above'}),'dendroDmg')-s(own('Baizhu'),'dendroDmg'),25);
});
test('Kokomi : C4/C6 exigent l’ultime, HP et bonus de soins réellement utilisés',()=>{
 close(s(own('SangonomiyaKokomi'),'attackSpeed'),0);close(s(own('SangonomiyaKokomi',{burst:'on'}),'attackSpeed'),10);
 close(s(own('SangonomiyaKokomi',{c6:'on'}),'hydroDmg'),s(own('SangonomiyaKokomi'),'hydroDmg'));
 close(s(own('SangonomiyaKokomi',{burst:'on',c6:'on'}),'hydroDmg')-s(own('SangonomiyaKokomi'),'hydroDmg'),40);
 const c={burst:'on'};close(s(own('SangonomiyaKokomi',c,0,{hp:40000,healing:75}),'normalFlatDamage')-s(own('SangonomiyaKokomi',c,0,{hp:40000,healing:25}),'normalFlatDamage'),3000);
 close(delta('SangonomiyaKokomi',c,'normalFlatDamage',0,{hp:40000}),0);
});
test('Nilou : équipe valide, noyaux plafonnés, ME et C2 conditionnelles',()=>{
 const c={a1AfterSkill:'on',a1AfterHit:'on',c2Hydro:'hydro',c2Dendro:'dendro'};
 close(delta('Nilou',c,'bloomDmg',6,{hp:80000},'Nahida'),400);close(delta('Nilou',c,'bloomDmg',6,{hp:30000},'Nahida'),0);
 close(delta('Nilou',c,'em',6,{hp:80000},'Nahida'),100);close(delta('Nilou',c,'em',6,{hp:80000},'Diluc',['Nahida']),0);
 close(team('Nilou',c,6,{hp:80000},'Nahida').enemyResistances.hydro,-.25);
 close(team('Nilou',{c2Hydro:'hydro'},6,{},'Nahida').enemyResistances.hydro,.1);
 close(s(own('Nilou',{},6,{hp:50000}),'critDmg')-s(own('Nilou',{},0,{hp:50000}),'critDmg'),60);
});
test('Yae : ME vers sakura, C4, C1 et C2 améliorées sans partage aux réservistes',()=>{
 close(s(own('YaeMiko',{},0,{em:1000}),'skillDmg'),150);
 close(delta('YaeMiko',{c4:'hit'},'electroDmg'),20);
 close(delta('YaeMiko',{lockRevelation:'on',c1:'on'},'electroDmg'),50);
 close(delta('YaeMiko',{c1:'on'},'electroDmg'),0);
 close(delta('YaeMiko',{lockRevelation:'on',c2:'4'},'em'),200);
});
test('Fischl : regard C1, Hexerei, C6 verrouillée et bonus personnels/actifs',()=>{
 const a=own('Fischl'),z=own('Fischl',{c1OzAbsent:'on'});close(z.display.normal[0].value-a.display.normal[0].value,a.display.constellation1.dmg.value);
 close(own('Fischl',{c1OzAbsent:'on'},0).display.normal[0].value,own('Fischl',{},0).display.normal[0].value);
 const other=b('Mona',{lockHomework:'on'}),c={lockHomework:'on',lockEcLc:'on',lockC6Oz:'on'};
 close(delta('Fischl',c,'em',0,{},'Diluc',[other]),90);close(delta('Fischl',c,'em',6,{},'Diluc',[other]),180);
 close(delta('Fischl',c,'em',6),0);
});
test('Tartaglia : niveau normal +1 automatique appliqué aux vrais multiplicateurs',()=>{
 const a=own('Diluc'),z=team('Tartaglia',{},0,{},'Diluc');close(s(z,'normalTalentBonus','Diluc')-s(a,'normalTalentBonus','Diluc'),1);
 assert.ok(z.display.normal[0].value>a.display.normal[0].value);close(z.display.skill.firstHit.value,a.display.skill.firstHit.value);
});
test('Eula : DÉF, baisse physique/Cryo, C1 et cumuls d’épée',()=>{
 assert.ok(s(own('Eula',{Grimheart:'stack2'}),'def')>s(own('Eula',{Grimheart:'stack1'}),'def'));
 const r=team('Eula',{grimheartConsumed:'on'});assert.ok(r.enemyResistances.physical<.1);close(r.enemyResistances.pyro,.1);
 close(s(own('Eula',{TidalIllusion:'on'}),'physicalDmg')-s(own('Eula'),'physicalDmg'),30);
 assert.ok(own('Eula',{LightfallSword:'30'}).display.burst.lightFallSwordNew.value>own('Eula',{LightfallSword:'1'}).display.burst.lightFallSwordNew.value);
});
test('Noëlle : DÉF vers ATQ, ajout C6, et aucune transmission aux alliés',()=>{
 const c={SweepingTime:'on'},a=own('Noelle',{},0,{def:2000}),z=own('Noelle',c,0,{def:2000});assert.ok(s(z,'atk')>s(a,'atk'));
 const c6=own('Noelle',c,6,{def:2000});close(s(c6,'atk')-s(own('Noelle',c,5,{def:2000}),'atk'),1000);close(delta('Noelle',c,'atk',6,{def:2000}),0);
 close(s(own('Noelle'),'chargedDmg'),15);
});
test('20 nouvelles fiches : contrôles uniques, textes complets, actions et évaluation de chaque condition',()=>{
 const m=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url))).characters;assert.equal(Object.keys(profiles).length,20);
 for(const [key,ps]of Object.entries(profiles)){
  const html=renderSourceBuffs(m[key],{level:90,constellation:6},0);
  for(const [path,[talent,label,help]]of Object.entries(ps)){const c=m[key].conditions.find(c=>c.path===path);assert.ok(c,`${key}.${path}`);assert.equal(c.talent,talent);assert.equal(c.label,label);assert.equal(c.help,help);assert.ok(m[key].talents[talent]?.description,`${key}.${talent}`);assert.equal(html.split(`data-source-path="${path}"`).length-1,1,`${key}.${path} unique`);}
  const rows=wrAttackOptions(e,key,evaluateWrDisplay(e,b(key)).display,6,m[key]);for(const kind of ['normal','charged','plunge','skill','burst'])assert.ok(rows.some(r=>r.kind===kind),`${key}.${kind}`);
  for(const c of m[key].conditions){const r=own(key,{[c.path]:c.options.at(-1)});assert.ok(Number.isFinite(s(r,'atk')),`${key}.${c.path} calcul`);}
 }
 assert.ok(m.SangonomiyaKokomi.talents.passive4.description.includes('25 %'));
});
test('les coefficients locaux reçoivent aussi les effets typés de Candace, Faruzan, Mika et Baizhu',()=>{
 const stats={normalElementalDmg:40,anemoFlatDamage:320,physicalCritDmg:60,anemoCritDmg:40,critRate:5,critDmg:50,bloomDmg:100};
 close(sourceAttackEffects(stats,'normal','hydro').bonus,40);close(sourceAttackEffects(stats,'normal','physical').bonus,0);
 close(sourceAttackEffects(stats,'skill','anemo').flat,320);close(sourceAttackEffects(stats,'normal','physical').stats.critDmg,110);
 close(sourceAttackEffects(stats,'skill','anemo').stats.critDmg,90);
 const original={id:'bloom',kind:'transformative',bonus:.2};const reaction=sourceReactionEffects(original,stats,{dendro:-.25},10);close(reaction.bonus,1.2);close(reaction.resistanceReduction,.35);close(original.bonus,.2);
});
