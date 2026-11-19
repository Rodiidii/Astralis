import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam} from '../src/lab-wr-adapter.js';
const e=await loadWrEngine();
const b=(character,conditions={},constellation=0,bonusStats={})=>buildWrCharacterData(e,{character,constellation,level:90,talent:{auto:10,skill:10,burst:10},conditionals:{[character]:conditions},bonusStats});
const team=(key,conditions={},co=0,bonus={},active='Diluc')=>evaluateWrTeam(e,b(active),[b(key,conditions,co,bonus)]);
const stat=(r,k)=>r.display.basic[k].value;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('Bennett : PV du bénéficiaire, C1, ATQ de base et C2 séparés',()=>{
 const off=team('Bennett'),high=team('Bennett',{activeInArea:'activeInArea'}),low=team('Bennett',{activeInArea:'activeInArea',recipientLowHP:'on'});
 assert.ok(stat(high,'atk')>stat(off,'atk'));close(stat(low,'atk'),stat(off,'atk'));
 close(stat(team('Bennett',{activeInArea:'activeInArea'},1),'atk'),stat(team('Bennett',{activeInArea:'activeInArea',recipientLowHP:'on'},1),'atk'));
 close(stat(team('Bennett',{activeInArea:'activeInArea'},1,{atk:1000}),'atk'),stat(team('Bennett',{activeInArea:'activeInArea'},1),'atk'));
});
test('Furina : plafond C0 et bonus de PV C2',()=>{
 close(team('Furina',{burstFanfare:'400'}).display.normal[0].value,team('Furina',{burstFanfare:'300'}).display.normal[0].value);
 assert.ok(team('Furina',{burstFanfare:'400'},1).display.normal[0].value>team('Furina',{burstFanfare:'300'},1).display.normal[0].value);
 const a=evaluateWrTeam(e,b('Furina',{},2)),z=evaluateWrTeam(e,b('Furina',{c2Overstack:'400'},2));assert.ok(stat(z,'hp')>stat(a,'hp'));
});
test('Kazuha : 0,04 % par ME et C2',()=>{
 const r=team('KaedeharaKazuha',{swirlpyro:'pyro'},0,{eleMas:500});
 const source=Object.values(r.members).find(m=>m.stats?.em>0);assert.ok(source);close(stat(r,'pyro_dmg_'),source.stats.em*.0004);
 close(stat(team('KaedeharaKazuha',{c2p:'c2p'},2),'eleMas'),200);
 close(stat(team('KaedeharaKazuha',{c2p:'c2p'},0),'eleMas'),0);
});
test('Nahida : ME maximale de l’équipe et plafond 250',()=>{
 const r=team('Nahida',{partyInBurst:'on',condA1ActiveInBurst:'on'},0,{eleMas:1500});close(stat(r,'eleMas'),250);
 close(stat(team('Nahida',{partyInBurst:'on',condA1ActiveInBurst:'off'},0,{eleMas:1500}),'eleMas'),0);
});
test('Shenhe : résistance Cryo et physique uniquement, passifs accessibles à C0',()=>{
 const r=team('Shenhe',{burst:'burst'});assert.ok(r.enemyResistances.cryo<.1);assert.ok(r.enemyResistances.physical<.1);close(r.enemyResistances.pyro,.1);
 const a=team('Shenhe',{asc1:'field'},0,{},'Ganyu');close(stat(a,'cryo_dmg_')-stat(team('Shenhe',{},0,{},'Ganyu'),'cryo_dmg_'),.15);
});
test('Sara : ATQ de base, sans transmission de l’ATQ des artéfacts',()=>{
 const c={TenguJuuraiAmbush:'TenguJuuraiAmbush'};assert.ok(stat(team('KujouSara',c),'atk')>stat(team('KujouSara'),'atk'));
 close(stat(team('KujouSara',c,0,{atk:1000}),'atk'),stat(team('KujouSara',c),'atk'));
});
test('Sucrose : 50 ME après Dispersion et 20 % de la ME source',()=>{
 const a=team('Sucrose',{swirlpyro:'on'});close(stat(a,'eleMas'),50);
 const c=team('Sucrose',{skillHit:'hit'},0,{eleMas:500});close(stat(c,'eleMas'),100);
 const self=evaluateWrTeam(e,b('Sucrose',{skillHit:'hit'},0,{eleMas:500}));close(stat(self,'eleMas'),500);
});
test('Mona : Présage et C4 conditionnels',()=>{
 const a=team('Mona',{},4),z=team('Mona',{Omen:'on'},4);close(stat(z,'critRate_')-stat(a,'critRate_'),.15);assert.ok(z.display.normal[0].value>a.display.normal[0].value);
 close(stat(team('Mona',{Omen:'on'},0),'critRate_'),stat(team('Mona',{},0),'critRate_'));
});
test('Yun Jin : bonus de normales uniquement et DÉF source',()=>{
 const a=team('YunJin'),z=team('YunJin',{skill:'on'}),more=team('YunJin',{skill:'on'},0,{def:1000});assert.ok(z.display.normal[0].value>a.display.normal[0].value);assert.ok(more.display.normal[0].value>z.display.normal[0].value);close(z.display.charged.spinningDmg.value,a.display.charged.spinningDmg.value);
});
test('Zhongli : les huit résistances baissent de 20 points',()=>{
 const r=team('Zhongli',{skill:'on'});for(const value of Object.values(r.enemyResistances))close(value,-.1);
 const a=team('Zhongli',{p1:'5'});for(const value of Object.values(a.enemyResistances))close(value,.1);
});
test('les montants source sont réellement consommés par les passifs',()=>{
 const own=(key,c,sourceStats)=>buildWrCharacterData(e,{character:key,constellation:6,conditionals:{[key]:c},sourceStats});
 const withSupport=(key,c,sourceStats,active='Diluc')=>evaluateWrTeam(e,b(active),[own(key,c,sourceStats)]);
 close(stat(withSupport('KaedeharaKazuha',{swirlpyro:'pyro'},{em:1000}),'pyro_dmg_'),.4);
 close(stat(withSupport('Sucrose',{skillHit:'hit'},{em:1000}),'eleMas'),200);
 close(stat(withSupport('Nahida',{partyInBurst:'on',condA1ActiveInBurst:'on'},{em:1000}),'eleMas'),250);
 close(stat(evaluateWrTeam(e,own('Mona',{}, {er:200})),'hydro_dmg_'),.4);
 for(const [key,c,field]of [['Bennett',{activeInArea:'activeInArea'},'baseAtk'],['KujouSara',{TenguJuuraiAmbush:'TenguJuuraiAmbush'},'baseAtk'],['YunJin',{skill:'on'},'def']]){
  assert.ok(withSupport(key,c,{[field]:1000}).display.normal[0].value>withSupport(key,c,{[field]:500}).display.normal[0].value,key);
 }
 const a=withSupport('Shenhe',{quill:'quill'},{atk:1000},'Ganyu'),z=withSupport('Shenhe',{quill:'quill'},{atk:2000},'Ganyu');
 assert.ok(z.display.charged.frostflake.value>a.display.charged.frostflake.value);close(z.display.normal[0].value,a.display.normal[0].value);
 for(const [key,c]of [['Furina',{c6:'on'}],['Zhongli',{}]])assert.ok(evaluateWrTeam(e,own(key,c,{hp:40000})).display.normal[0].value>evaluateWrTeam(e,own(key,c,{hp:20000})).display.normal[0].value,key);
 close(stat(withSupport('Sucrose',{skillHit:'hit'},{em:0}),'eleMas'),0);
});
