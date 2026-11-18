import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {effectiveTalentLevel,mergeKitSnapshot} from '../src/lab-talent-levels.js';
import {parseActionValue,talentValueRows} from '../src/lab-actions.js';
import {calculateHit,calculateAction} from '../src/damage-engine.js';
import {extendedBuffOptions,extendedBuffBonuses} from '../src/lab-extended-buffs.js';
import {stellarConductField,calculateContributorReaction} from '../src/special-reactions.js';
import {evaluateDamageStats} from '../src/optimizer.js';
import {configuredWeaponBonuses,configuredSetEffects,typedFlatDamage} from '../src/lab-config.js';
import {finalStats} from '../src/damage-engine.js';
const snapshot=JSON.parse(readFileSync(new URL('../data/lab-kit-snapshot.json',import.meta.url)));
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
test('pinned sources supply numeric talents and all six constellations for 120 kits',()=>{
 assert.equal(Object.keys(snapshot.characters).length,120);
 for(const entry of Object.values(snapshot.characters)){
  assert.equal(entry.sources.length,3);
  for(let c=1;c<=6;c++)assert.ok(entry.constellations['c'+c]?.description,entry.name+' C'+c);
  for(let skill=1;skill<=3;skill++){
   const source=entry.talents['combat'+skill];
   assert.ok(source?.attributes?.parameters,entry.name+' '+skill);
   assert.ok(talentValueRows(source,10).every(row=>!row.includes('TODO_DATA')),entry.name+' '+skill);
  }
 }
});
test('C3/C5 upgrade the named talent, including Neuvillette C3 normal attacks',()=>{
 const neuv=mergeKitSnapshot({},snapshot.characters['10000087']);
 assert.equal(effectiveTalentLevel(neuv,0,10,2),10);
 assert.equal(effectiveTalentLevel(neuv,0,10,3),13);
 assert.equal(effectiveTalentLevel(neuv,2,10,5),13);
 assert.equal(effectiveTalentLevel(neuv,1,10,6),10);
 const nahida=mergeKitSnapshot({},snapshot.characters['10000073']);
 assert.equal(effectiveTalentLevel(nahida,1,10,3),13);
 assert.equal(effectiveTalentLevel(nahida,2,10,5),13);
 assert.equal(effectiveTalentLevel(nahida,1,15,6),15);
 for(const [id,entry]of Object.entries(snapshot.characters)){
  const details=mergeKitSnapshot({},entry);
  const levels=[0,1,2].map(i=>effectiveTalentLevel(details,i,10,6));
  assert.equal(levels.reduce((sum,level)=>sum+level-10,0),id==='10000062'?0:6,entry.name);
 }
});
test('collective mean enumerates CRIT outcomes before ranking contributors',()=>{
 const result=calculateContributorReaction({id:'lunarCharged',enemyResistance:0,contributors:[{id:'a',levelMultiplier:100,em:0,critRate:50,critDmg:300},{id:'b',levelMultiplier:200,em:0,critRate:0,critDmg:0}]});
 close(result.total,675);
 assert.equal(result.terms.expectedCrit,true);
});
test('Homa and Redhorn use final HP/DEF; extra damage is additive, not DMG%',()=>{
 const weapons=JSON.parse(readFileSync(new URL('../assets/data/gi-weapons.json',import.meta.url)));
 const homa={...weapons.find(w=>w.id===13501),_id:'homa'};
 const bonuses=configuredWeaponBonuses(homa,{weaponRefinement:1,effectStates:{'weapon:homa:lowHP':{enabled:true}}});
 const stats=finalStats({atk:1000,hp:10000,def:1000},bonuses);
 close(stats.hp,12000);close(stats.atk,1000+12000*.018);
 const redhorn={...weapons.find(w=>w.id===12510),_id:'redhorn'};
 const rb=configuredWeaponBonuses(redhorn,{weaponRefinement:1}),rs=finalStats({atk:1000,def:1000},rb);
 close(rs.def,1280);close(typedFlatDamage(rb,'normal',rs),512);close(typedFlatDamage(rb,'skill',rs),0);
});
test('Nymph uses 7/16/25 ATK and 4/9/15 Hydro, not linear stack approximations',()=>{
 const set={id:15029,_id:'nymph'};
 const result=configuredSetEffects([set],{effectStates:{'set:nymph:four:nymph':{enabled:true,stacks:3}}});
 assert.equal(result.nymph.four.atkPct,25);assert.equal(result.nymph.four.hydroDmg,15);
});
test('mixed ATK/EM is one impact, one reaction, one additive quota',()=>{
 const parsed=parseActionValue('Purification : 200% ATQ + 400% Maîtrise élémentaire');
 assert.equal(parsed.hitCount,1);
 const input={stats:{atk:1000,em:200,critRate:0,critDmg:50},baseStat:parsed.baseStat,talentMultiplier:1,components:parsed.components,attackerLevel:90,enemyLevel:90,enemyResistance:0,additivePools:[{id:'quill',flatDamage:100,charges:3}]};
 const result=calculateAction(input);
 assert.equal(result.ok,true);close(result.total,(2000+800+100)*.5);
 assert.equal(result.triggered.quill,1);assert.equal(result.totalHits,1);
 assert.equal(parseActionValue('Compétence : 10% PV max').baseStat,'hp');
});
test('direct stellar damage uses field stacks, crit and EM, excludes DEF and ordinary bonuses',()=>{
 assert.equal(stellarConductField(0).coefficient,1);close(stellarConductField(1).coefficient,1.45);assert.equal(stellarConductField(12).coefficient,2);
 const input={stats:{atk:1000,em:200,critRate:50,critDmg:100,dmgBonus:999,electroDmg:999},baseStat:'atk',talentMultiplier:2,attackerLevel:90,enemyLevel:90,enemyResistance:.1,damageBonus:999,flatDamage:999,reaction:{kind:'stellarDirect',id:'stellarConduct',fieldHits:12,baseBonus:.14,bonus:.2,elevation:.1,flatDamage:100}};
 const result=calculateHit(input);assert.equal(result.ok,true);
 close(result.total,(2*1000*2*1.14*(1+1200/2200+.2)+100)*1.1*1.5*.9);
 const action=calculateAction({...input,hitCount:3,reactingHits:0,additivePools:[{id:'ordinary',flatDamage:999,charges:3}]});
 close(action.total,result.total*3);assert.deepEqual(action.triggered,{});
});
test('collective reaction ranks contributions and does not multiply by talent hit count',()=>{
 const members=[100,400,200,300].map((n,i)=>({id:String(i),levelMultiplier:n,em:0,critRate:0,critDmg:0}));
 const result=calculateContributorReaction({id:'stellarSwirl',contributors:members,enemyResistance:0,phase:'explosion',vortexLevel:2});
 close(result.total,3*(400*.6+300*.3+200*.05+100*.05));
 assert.deepEqual(result.contributions.map(r=>r.id),['1','3','2','0']);
 const hit=calculateAction({stats:members[0],hitCount:20,enemyResistance:0,reaction:{kind:'multiReaction',id:'lunarCharged',levelMultiplier:100,contributors:members.slice(1)}});
 close(hit.total,1.8*(400+300/2+200/12+100/12));
 assert.equal(calculateContributorReaction({id:'stellarSwirl',contributors:[{em:0}]}).ok,false);
});
test('extended buffs respect recipient, constellation, element, caps and team restrictions',()=>{
 assert.equal(extendedBuffOptions('10000043',{own:true,constellation:0,elementKey:'pyro'}).length,0);
 const config={elementKey:'cryo',fightPosition:'on',members:[{id:'10000045',constellation:6,effects:{a4:{enabled:true,sourceValue:150},c6:{enabled:true}}},{id:'10000073',constellation:1,effects:{a1:{enabled:true,sourceValue:1200},c2:{enabled:true}}}]};
 assert.deepEqual(extendedBuffBonuses(config),{critRate:15,em:250});
 config.elementKey='physical';config.members[1].constellation=2;
 assert.deepEqual(extendedBuffBonuses(config),{resReduction:20,defReduction:30,critRate:15,em:250});
 assert.equal(extendedBuffOptions('10000090',{elementKey:'pyro',teamElements:['pyro','electro','anemo']}).some(r=>r.id==='a1'),false);
});
test('optimizer recalculates own Kazuha EM conversion for each candidate',()=>{
 const config={elementKey:'pyro',fightPosition:'on',members:[{id:'10000047',own:true,constellation:2,effects:{a4:{enabled:true},c2:{enabled:true}}}]};
 const hit={extendedKit:config,baseStat:'atk',talentMultiplier:1,attackerLevel:90,enemyLevel:90,enemyResistance:0,elementKey:'pyro',actionKind:'skill',critMode:'nonCrit'};
 const input={baseStats:{atk:1000,em:0},hit};
 const a=evaluateDamageStats(input,{}),b=evaluateDamageStats(input,{em:100});
 close(a.total,500*1.08);close(b.total,500*1.12);
});
