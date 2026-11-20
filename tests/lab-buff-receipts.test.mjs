import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadWrEngine,buildWrCharacterData,evaluateWrTeam,evaluateWrBuffReceipts,wrConditionOptions} from '../src/lab-wr-adapter.js';
import {renderBuffReceipts,labStatValue} from '../src/lab-view.js';
const e=await loadWrEngine(),manifest=JSON.parse(fs.readFileSync(new URL('../data/lab-character-conditions.json',import.meta.url)));
const b=(character,c={},constellation=0,extra={})=>buildWrCharacterData(e,{character,level:90,constellation,talent:{auto:10,skill:10,burst:10},conditionals:{[character]:c},...extra});
const close=(a,z)=>assert.ok(Number.isFinite(a)&&Math.abs(a-z)<1e-5,`${a} != ${z}`);
const source=(r,who,key,kind='kit')=>r.members[who].find(row=>row.key===key&&row.kind===kind);
test('chaque destinataire reçoit le montant de sa source ; la cible garde ses huit baisses de RÉS',()=>{
 const builds=[b('Diluc'),b('Bennett',{activeInArea:'activeInArea'},1,{sourceStats:{baseAtk:1000}}),b('Zhongli',{skill:'on'})],r=evaluateWrBuffReceipts(e,builds);
 assert.ok(source(r,'Diluc','Bennett').effects.find(row=>row.stat==='atk').value>1000);
 assert.equal(source(r,'Bennett','Bennett'),undefined);
 assert.equal(r.enemy.find(row=>row.key==='Zhongli').effects.length,8);
 for(const row of r.enemy.find(row=>row.key==='Zhongli').effects)close(row.value,20);
});
test('base, élévation et statistique secondaire de l’arme ne sont pas présentées comme des buffs',()=>{
 for(const weapon of [undefined,{key:'DullBlade',level:70,ascension:4},{key:'test',snapshotStats:{atk:600,specialized:.4},secondaryType:'critDMG_',type:'claymore'}]){
  const r=evaluateWrBuffReceipts(e,[b('Diluc',{},0,{weapon})]);
  assert.deepEqual(r.members.Diluc,[]);assert.deepEqual(r.enemy,[]);
 }
});
test('les passifs de l’arme et des sets ont des sources distinctes sans retirer les statistiques des pièces',()=>{
 const active=b('Diluc'),support=b('Barbara',{},0,{weapon:{key:'ThrillingTalesOfDragonSlayers',level:90,ascension:6,refinement:5},conditionals:{ThrillingTalesOfDragonSlayers:{Heritage:'on'},NoblesseOblige:{set4:'on'}},artifacts:['flower','plume','sands','goblet'].map((slot,i)=>({id:String(i),slot,setKey:'NoblesseOblige',rarity:5,level:0,mainStatKey:slot==='flower'?'hp':slot==='plume'?'atk':'atk_',substats:[]}))});
 const before=evaluateWrTeam(e,active,[support]),r=evaluateWrBuffReceipts(e,[active,support],before);
 close(source(r,'Diluc','Barbara','weapon').effects.find(row=>row.stat==='atk').value,before.members.Diluc.baseAtk*.48);
 close(source(r,'Diluc','Barbara','artifacts').effects.find(row=>row.stat==='atk').value,before.members.Diluc.baseAtk*.2);
 assert.deepEqual(evaluateWrTeam(e,active,[support]).members,before.members);
});
test('les cinq familles lunaires/stellaires gardent leurs valeurs et leurs sources',()=>{
 for(const [key,conditions,field,stats,others]of [
  ['Ineffa',{c1AfterShield:'on'},'lunarchargedDmg',{atk:3000},[]],
  ['Aino',{c6AfterBurst:'on'},'lunarbloomDmg',{},[]],
  ['Zibai',{c2ShiftMode:'on'},'lunarcrystallizeDmg',{},[]],
  ['Sandrone',{c1Decoding:'on'},'stellarconductDmg',{},[]],
  ['Vodyanitsa',{skillSong:'on'},'stellarswirlElevation',{},[]],
 ]){
  const r=evaluateWrBuffReceipts(e,[b('Diluc'),b(key,conditions,6,{sourceStats:stats}),...others.map(k=>b(k))]);
  assert.ok(source(r,'Diluc',key)?.effects.find(row=>row.stat===field)?.value>0,key+':'+field);
 }
});
test('Xilonen : les éléments, doublons, conversion et C2 déterminent les seuls échantillons disponibles',()=>{
 const choices=['Diluc','Furina','Kaeya','RaidenShogun','Nahida','Venti','Zhongli'];
 // Every element as the active recipient, with zero to three conversions.
 for(const active of choices)for(const others of [[],['Nahida','Venti'],['Furina','Kaeya'],['Diluc','RaidenShogun']])for(const co of [0,2]){
  const keys=[active,...others.filter(k=>k!==active)].slice(0,3),builds=[b(active),b('Xilonen',{sourceActive:'on'},co),...keys.slice(1).map(k=>b(k))],r=evaluateWrTeam(e,builds[0],builds.slice(1));
  const counts=Object.fromEntries(['pyro','hydro','cryo','electro'].map(ele=>[ele,keys.filter(k=>e.characters[k].sheetData.charEle.value===ele).length])),n=Object.values(counts).reduce((a,z)=>a+z,0);
  for(const ele of ['pyro','hydro','cryo','electro'])close(r.enemyResistances[ele],.1-(n>=2&&counts[ele]? .36:0));
  close(r.enemyResistances.geo,.1-(n<3&&(co>=2||n>=2)?.36:0));
  close(r.enemyResistances.anemo,.1);close(r.enemyResistances.dendro,.1);close(r.enemyResistances.physical,.1);
  if(co===2&&e.characters[active].sheetData.charEle.value==='electro'&&n>=2){close(r.members[active].stats.energyRestored,25);close(r.members[active].stats.burstCooldownReduction,6);}
 }
});
test('Xilonen : deux Pyro comptent deux conversions sans doubler la baisse ; trois conversions suppriment le Géo',()=>{
 for(const allies of [['Diluc','Bennett'],['Diluc','Bennett','Amber']]){
  const r=evaluateWrTeam(e,b(allies[0]),[b('Xilonen',{sourceActive:'on'},2),...allies.slice(1).map(k=>b(k))]);
  close(r.enemyResistances.pyro,-.26);close(r.enemyResistances.geo,allies.length===3?.1:-.26);close(r.enemyResistances.hydro,.1);
 }
});
test('la liste et les unités distinguent la réaction, la réserve et les baisses de la cible',()=>{
 const r=evaluateWrBuffReceipts(e,[b('Diluc'),b('Xilonen',{sourceActive:'on'},2),b('Furina')]);
 const html=renderBuffReceipts(r,{characters:['Diluc','Xilonen','Furina'].map(k=>({_id:k,_name:k}))},{character:'Diluc',allies:[{character:'Xilonen'},{character:'Furina'}]},manifest);
 assert.match(html,/Échantillons : Pyro \/ Hydro \/ Géo/);assert.match(html,/En réserve/);assert.match(html,/Baisse de RÉS Hydro/);assert.match(html,/ATQ/);assert.match(html,/PV/);
 assert.equal(labStatValue('burstCooldownReduction',6),'6 s');
});
test('tous les personnages : liste finie avec conditions actives et trois compositions différentes',()=>{
 for(const key of Object.keys(e.characters))for(const allies of [['Diluc','Furina'],['Nahida','Zhongli'],['Kaeya','RaidenShogun']]){
  const conditions=Object.fromEntries((e.conditionalPaths.characters[key]||[]).map(path=>[path,wrConditionOptions(e,'characters',key,path).at(-1)]));
  const builds=[b(key,conditions,6),...allies.filter(k=>k!==key).map(k=>b(k))],r=evaluateWrBuffReceipts(e,builds);
  assert.equal(Object.keys(r.members).length,builds.length,key);
  for(const rows of Object.values(r.members))for(const row of rows)for(const effect of row.effects)assert.ok(Number.isFinite(effect.value),key+':'+effect.stat);
  for(const row of r.enemy)for(const effect of row.effects)assert.ok(Number.isFinite(effect.value),key+':'+effect.element);
 }
});
