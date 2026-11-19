import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,evaluateWrDisplay,wrAttackOptions} from '../src/lab-wr-adapter.js';
import {TWENTY_REVIEWED_BUFFS} from '../src/lab-reviewed-twenty.js';
import {readFileSync} from 'node:fs';
import {renderSourceBuffs} from '../src/lab-source-buffs.js';
const e=await loadWrEngine();
const b=(character,c={},co=6,sourceStats={},extra={})=>buildWrCharacterData(e,{character,constellation:co,conditionals:{[character]:c},level:90,talent:{auto:10,skill:10,burst:10},sourceStats,...extra});
const own=(k,c={},co=6,stats={},extra={})=>evaluateWrTeam(e,b(k,c,co,stats,extra));
const team=(k,c={},co=6,stats={},active='Diluc',others=[])=>evaluateWrTeam(e,b(active),[b(k,c,co,stats),...others.map(k=>b(k))]);
const s=(r,k,member)=>r.members[member||Object.keys(r.members)[0]].stats[k];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const delta=(k,c,field,co=6)=>s(team(k,c,co),field,'Diluc')-s(team(k,{},co),field,'Diluc');
test('Albedo : 125 ME, plongeantes C4 et ajout dépendant de sa DÉF',()=>{
 close(delta('Albedo',{burstUsed:'burstUsed'},'em'),125);
 close(delta('Albedo',{skillInField:'skillInField'},'plungeDmg'),30);
 close(delta('Albedo',{skillInField:'skillInField'},'plungeDmg',0),0);
 assert.ok(own('Albedo',{c2Stacks:'4'},6,{def:2000}).display.burst.dmg.value>own('Albedo',{c2Stacks:'4'},6,{def:1000}).display.burst.dmg.value);
 const hex=def=>evaluateWrTeam(e,b('Mona',{lockHomework:'on'}),[b('Albedo',{lockHomework:'on',lockCreateSolar:'on',lockCreateSilver:'on'},6,{def})]);
 close(s(hex(1000),'normalDmg','Mona'),14);close(s(hex(3000),'normalDmg','Mona'),42);close(s(hex(6000),'normalDmg','Mona'),42);
});
test('Alhaitham : C2 personnelle, C4 alliée et C6 personnelle',()=>{
 close(s(own('Alhaitham',{debateStacks:'4'}),'em')-s(own('Alhaitham'),'em'),200);
 close(delta('Alhaitham',{mirrorsConsumed:'3'},'em'),90);
 close(delta('Alhaitham',{debateStacks:'4'},'em'),0);
 close(s(own('Alhaitham',{excessMirror:'on'}),'critDmg')-s(own('Alhaitham'),'critDmg'),70);
});
test('Barbara : Hydro C2 et endurance partagés, avec verrou C0',()=>{
 close(delta('Barbara',{c2:'on'},'hydroDmg'),15);
 close(delta('Barbara',{c2:'on'},'hydroDmg',0),0);
 close(delta('Barbara',{skill:'on'},'staminaReduction'),-12);
});
test('Beidou : P2 personnel, résistance C6 et impact Électro C4',()=>{
 close(s(own('Beidou',{Ascension4:'on'}),'normalDmg'),15);close(delta('Beidou',{Ascension4:'on'},'normalDmg'),0);
 close(team('Beidou',{burst:'on'}).enemyResistances.electro,-.05);
 const a=own('Beidou'),z=own('Beidou',{c4AfterDamage:'on'});
 close(z.display.normal[0].value-a.display.normal[0].value,a.display.constellation4.skillDmg.value);
 close(own('Beidou',{c4AfterDamage:'on'},0).display.normal[0].value,own('Beidou',{},0).display.normal[0].value);
});
test('Chongyun : vitesse et résistance Cryo uniquement',()=>{
 close(delta('Chongyun',{skill:'activeInArea'},'attackSpeed'),8);
 const r=team('Chongyun',{asc4:'hit'});close(r.enemyResistances.cryo,0);close(r.enemyResistances.pyro,.1);
});
test('Collei : C1 hors terrain personnelle et C4 excluant Collei',()=>{
 close(s(own('Collei',{offField:'on'}),'er')-s(own('Collei'),'er'),20);
 close(delta('Collei',{offField:'on'},'er'),0);close(delta('Collei',{afterBurst:'on'},'em'),60);
 close(s(own('Collei',{afterBurst:'on'}),'em'),s(own('Collei'),'em'));
});
test('Diluc : cumuls C2 et rythme C4 sur les frappes 2/3 seulement',()=>{
 close(s(own('Diluc',{DilucC2:'3'}),'attackSpeed'),15);
 const a=own('Diluc'),z=own('Diluc',{c4Rhythm:'on'});
 close(z.display.skill.firstHit.value,a.display.skill.firstHit.value);
 close(z.display.skill.secondHit.value,a.display.skill.secondHit.value*1.4);
 close(z.display.skill.thirdHit.value,a.display.skill.thirdHit.value*1.4);
 close(own('Diluc',{c4Rhythm:'on'},0).display.skill.secondHit.value,own('Diluc',{},0).display.skill.secondHit.value);
});
test('Ganyu : P1 limité aux flèches de givre et P2 transmis',()=>{
 const a=own('Ganyu'),z=own('Ganyu',{A1:'on'});
 assert.ok(z.display.charged.frostflake.value>a.display.charged.frostflake.value);close(z.display.normal[0].value,a.display.normal[0].value);
 close(delta('Ganyu',{A4:'on'},'cryoDmg'),20);close(team('Ganyu',{C1:'on'}).enemyResistances.cryo,-.05);
 close(delta('Ganyu',{C4:'5'},'dmgBonus'),25);
});
test('Gorou : DÉF, trois Géo et CRIT Géo C6',()=>{
 assert.ok(delta('Gorou',{afterBurst:'afterBurst'},'def')>0);
 const r=team('Gorou',{inField:'inField',afterSkillBurst:'afterSkillBurst'},6,{},'Albedo',['Zhongli']);
 close(s(r,'geoCritDmg','Albedo'),40);close(s(r,'geoDmg','Albedo')-s(team('Gorou',{},6,{},'Albedo',['Zhongli']),'geoDmg','Albedo'),15);
});
test('Heizou : 80 ME aux autres, C6 limitée à la compétence',()=>{
 close(delta('ShikanoinHeizou',{skillHit:'on'},'em'),80);
 close(s(own('ShikanoinHeizou',{skillHit:'on'}),'em'),s(own('ShikanoinHeizou'),'em'));
 close(s(own('ShikanoinHeizou',{declensionStacks:'4'}),'skillCritRate'),16);
 close(s(own('ShikanoinHeizou',{declensionStacks:'4'}),'skillCritDmg'),32);
});
test('Hu Tao : PV vers ATQ plafonnés à 400 % de base, CRIT réservé aux alliés',()=>{
 const c={GuideToAfterlifeVoyage:'on'},a=own('HuTao',{},0,{hp:100000}),z=own('HuTao',c,0,{hp:100000});
 close(s(z,'atk')-s(a,'atk'),a.members.HuTao.baseAtk*4);
 assert.ok(s(own('HuTao',c,0,{hp:2000}),'atk')>s(own('HuTao',c,0,{hp:1000}),'atk'));
 close(delta('HuTao',{FlutterBy:'on',GardenOfEternalRest:'on'},'critRate'),24);
 close(s(own('HuTao',{FlutterBy:'on'}),'critRate'),s(own('HuTao'),'critRate'));
 close(s(own('HuTao',{SanguineRouge:'on'}),'pyroDmg'),33);
});
test('Keqing : P2 CRIT/recharge et quatre bonus Électro C6 personnels',()=>{
 const a=own('Keqing'),z=own('Keqing',{afterBurst:'afterBurst',c6Stack:'4'});
 close(s(z,'critRate')-s(a,'critRate'),15);close(s(z,'er')-s(a,'er'),15);close(s(z,'electroDmg')-s(a,'electroDmg'),24);
 close(delta('Keqing',{afterBurst:'afterBurst'},'critRate'),0);
});
test('Klee : étincelle sur la chargée, élévation requise et baisse de DÉF',()=>{
 const a=own('Klee'),z=own('Klee',{a1Spark:'on'});
 close(z.display.charged.dmg.value,a.display.passive1.dmg.value);close(z.display.normal[0].value,a.display.normal[0].value);
 const extra={level:1,ascension:0};close(own('Klee',{a1Spark:'on'},0,{},extra).display.charged.dmg.value,own('Klee',{},0,{},extra).display.charged.dmg.value);
 close(delta('Klee',{ExplosiveFrags:'on'},'defReduction'),23);close(delta('Klee',{BlazingDelight:'on'},'pyroDmg'),10);
 close(s(own('Klee',{lockHomework:'on',BlazingDelight:'on'}),'pyroDmg')-s(a,'pyroDmg'),50);
 close(s(own('Klee',{lockHomework:'on',lockC1:'on'}),'atk'),s(a,'atk')*1.6);
});
test('Lyney : compte les autres Pyro, plafond 100 %, C2 et RÉS C4',()=>{
 close(s(own('Lyney',{a4AffectedByPyro:'on'}),'dmgBonus'),60);
 const r=evaluateWrTeam(e,b('Lyney',{a4AffectedByPyro:'on'}),[b('Bennett'),b('Xiangling'),b('Diluc')]);close(s(r,'dmgBonus','Lyney'),100);
 close(s(own('Lyney',{c2Stacks:'3'}),'critDmg')-s(own('Lyney'),'critDmg'),60);
 close(team('Lyney',{c4Hit:'on'}).enemyResistances.pyro,-.1);
});
test('Raiden : recharge source, coût de l’ultime et C4 excluant Raiden',()=>{
 close(s(own('RaidenShogun',{},0,{er:200}),'electroDmg'),40);
 close(delta('RaidenShogun',{skillEyeTeam:'80'},'burstDmg',0),24);
 assert.ok(delta('RaidenShogun',{c4:'c4'},'atk')>0);close(s(own('RaidenShogun',{c4:'c4'}),'atk'),s(own('RaidenShogun'),'atk'));
 close(s(own('RaidenShogun',{InBurst:'on'}),'defIgnore'),60);
});
test('Nomade : contacts et C2 exigent Bienfait venteux',()=>{
 close(s(own('Wanderer',{skillCryoContact:'cryo'}),'critRate'),s(own('Wanderer'),'critRate'));
 close(s(own('Wanderer',{afterSkill:'on',skillCryoContact:'cryo'}),'critRate')-s(own('Wanderer'),'critRate'),20);
 close(s(own('Wanderer',{c2Points:'50'}),'burstDmg'),0);
 close(s(own('Wanderer',{afterSkill:'on',c2Points:'50'}),'burstDmg'),200);
});
test('Xiangling : piment ATQ, baisse Pyro et C6 sans renforcement rétroactif',()=>{
 assert.ok(delta('Xiangling',{afterChili:'afterChili'},'atk')>0);
 close(team('Xiangling',{afterGuobaHit:'afterGuobaHit'}).enemyResistances.pyro,-.05);
 close(delta('Xiangling',{afterPyronado:'duringPyronado'},'pyroDmg'),15);
 close(own('Xiangling',{afterPyronado:'duringPyronado'}).display.burst.dmgNado.value,own('Xiangling').display.burst.dmgNado.value);
});
test('Xingqiu : Hydro automatique, réduction liée au bonus Hydro et C4 personnelle',()=>{
 close(s(own('Xingqiu'),'hydroDmg'),20);close(delta('Xingqiu',{skill:'on'},'damageReduction',0),33);
 close(own('Xingqiu',{burst:'on'}).display.skill.press1.value,own('Xingqiu').display.skill.press1.value*1.5);
 close(team('Xingqiu',{c2:'on'}).enemyResistances.hydro,-.05);
});
test('Xiao : masque, P2 de compétence et C2 personnelle',()=>{
 close(s(own('Xiao',{inBurst:'inBurst',a1BurstStack:'4'}),'dmgBonus'),25);
 close(s(own('Xiao',{a4SkillStack:'3'}),'skillDmg'),45);
 close(delta('Xiao',{offField:'on'},'er'),0);close(s(own('Xiao',{offField:'on'}),'er')-s(own('Xiao'),'er'),25);
});
test('Yelan : bonus actif de 1 à 50 %, C4 PV et diversité élémentaire',()=>{
 close(delta('Yelan',{a4Stacks:'0'},'dmgBonus'),1);close(delta('Yelan',{a4Stacks:'14'},'dmgBonus'),50);
 assert.ok(delta('Yelan',{c4Stacks:'4'},'hp')>0);
 const solo=own('Yelan');const mixed=evaluateWrTeam(e,b('Yelan'),[b('Zhongli')]);close(s(mixed,'hp','Yelan')/s(solo,'hp','Yelan'),1.12/1.06);
});
test('les 20 fiches possèdent textes, rattachements, contrôles et cinq catégories',()=>{
 const m=JSON.parse(readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url))).characters;
 assert.equal(Object.keys(TWENTY_REVIEWED_BUFFS).length,20);
 for(const [key,profiles]of Object.entries(TWENTY_REVIEWED_BUFFS)){
  for(const [path,[talent,label,help]]of Object.entries(profiles)){const c=m[key].conditions.find(c=>c.path===path);assert.ok(c,`${key}.${path}`);assert.equal(c.talent,talent);assert.equal(c.label,label);assert.equal(c.help,help);assert.ok(m[key].talents[talent]?.description,`${key}.${talent} texte`);}
  const actions=wrAttackOptions(e,key,evaluateWrDisplay(e,b(key)).display,6,m[key]);for(const kind of ['normal','charged','plunge','skill','burst'])assert.ok(actions.some(a=>a.kind===kind),`${key}.${kind}`);
  const html=renderSourceBuffs(m[key],{level:90,constellation:6},0);
  for(const path of Object.keys(profiles))assert.equal(html.split(`data-source-path="${path}"`).length-1,1,`${key}.${path} contrôle unique`);
  for(const talent of Object.values(m[key].talents))if(talent.name)assert.ok(html.includes(talent.name.replaceAll('&','&amp;').replaceAll("'",'&#39;')),`${key}.${talent.name} visible`);
 }
});
