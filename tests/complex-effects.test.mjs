import {summarizeRotation} from '../src/lab-page.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {complexEffects,furinaFanfare} from '../src/complex-effects.js';
import {calculateAction,calculateHit,finalStats} from '../src/damage-engine.js';
import {evaluateDamageStats} from '../src/optimizer.js';
import {attackOptions,typedAttackBonus} from '../src/lab-config.js';
const context={character:'10000114',weaponId:'11517',refinement:1,elementKey:'cryo',actionKind:'burst',teamElements:['cryo','hydro','cryo','hydro'],elapsed:0};
const config={azurelight:{enabled:true,zeroEnergy:true},skirk:{enabled:true,deathStacks:3,sevenPhase:true,serpentExtra:12,burstLevel:10},furina:{enabled:true,constellation:2,talentLevel:10,hpChangePercent:100},escoffier:{enabled:true,constellation:0},mona:{enabled:true,constellation:4,talentLevel:10}};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Furina C2 : fanfare 400, gain x3,5 et PV excédentaires réservés à Furina',()=>{
 const state=furinaFanfare(config.furina);near(state.fanfare,400);near(state.dmgBonus,100);near(state.hpPct,35);
 near(complexEffects(config,context).bonuses.hpPct||0,0);
 near(complexEffects(config,{...context,character:'10000089'}).bonuses.hpPct,35);
 near(furinaFanfare({...config.furina,hpChangePercent:1000}).hpPct,140);
 near(furinaFanfare({...config.furina,constellation:0}).fanfare,100);
});
test('Éclazur R1/R5, énergie et fenêtre de 12 secondes',()=>{
 const resolve=(rank,zero,time=0)=>complexEffects({azurelight:{enabled:true,zeroEnergy:zero}},{...context,refinement:rank,elapsed:time}).bonuses;
 near(resolve(1,true).atkPct,48);near(resolve(1,true).critDmg,40);near(resolve(5,true).atkPct,96);near(resolve(5,true).critDmg,80);near(resolve(1,false).atkPct,24);assert.equal(resolve(1,true,12).atkPct,undefined);
 assert.equal(complexEffects(config,{...context,weaponId:'11516'}).bonuses.atkPct,undefined);
});
test('Escoffier : réduction 55 %, C1 séparée, Mona C4 : bonus 60 % et CRIT 15 %',()=>{
 const effects=complexEffects(config,context);near(effects.bonuses.resReduction,55);near(effects.bonuses.critRate,15);near(effects.bonuses.dmgBonus,160);
 near(complexEffects({escoffier:{enabled:true,constellation:1}},context).bonuses.critDmg,60);
 near(complexEffects({escoffier:{enabled:true}},{...context,teamElements:['cryo','hydro','anemo','pyro']}).bonuses.resReduction,10);
 assert.equal(complexEffects(config,{...context,elapsed:12}).bonuses.resReduction,undefined);
 assert.equal(complexEffects(config,{...context,elapsed:5}).bonuses.critRate,undefined);
});
test('Skirk : 5+1 impacts Q, N3/N4 doubles et CA triple, catégories exactes',()=>{
 const rows=attackOptions({character:{id:'10000114'}},{talentLevel:10});
 assert.equal(rows.find(x=>x.label.startsWith('Déchaînement complet')).parsed.hitCount,6);
 assert.equal(attackOptions({}, {character:'skirk',talentLevel:10})[2].id,'99:2');
 assert.equal(rows[2].parsed.hitCount,2);assert.equal(rows[3].parsed.hitCount,2);assert.equal(rows[5].parsed.hitCount,3);assert.equal(rows[0].kind,'normal');assert.equal(rows[5].kind,'charged');
 near(complexEffects(config,context).talentScale,1.6);near(complexEffects(config,{...context,actionKind:'normal'}).talentScale,1.7);near(complexEffects(config,{...context,actionKind:'charged'}).talentScale,1);
});
const baseHit={stats:{atk:1000,critRate:0,critDmg:50},talentMultiplier:2,attackerLevel:90,enemyLevel:90,enemyResistance:0,elementKey:'cryo',actionKind:'burst',critMode:'nonCrit'};
test('plumes : cinq charges sur six impacts, cumul de deux sources et état conservé',()=>{
 const pools=[{id:'shenhe',flatDamage:100,charges:5,element:'cryo'},{id:'esco',flatDamage:200,charges:5,element:'cryo'}];
 const result=calculateAction({...baseHit,hitCount:6,additivePools:pools});near(result.total,(6*2000+5*300)*.5);assert.deepEqual(result.poolState,{shenhe:0,esco:0});assert.deepEqual(result.triggered,{shenhe:5,esco:5});
 near(calculateAction({...baseHit,hitCount:2,additivePools:pools,poolState:result.poolState}).total,2000);
 assert.equal(pools[0].charges,5);
});
test('plumes : par cible, expiration, bonne catégorie/élément, C6 sans consommation NA/CA',()=>{
 const pool={id:'q',flatDamage:100,charges:5,element:'cryo',expiresAt:10};
 const result=calculateAction({...baseHit,hitCount:3,targetCount:2,additivePools:[pool]});near(result.total,(6*2000+5*100)*.5);
 assert.equal(calculateAction({...baseHit,elapsed:10,additivePools:[pool]}).triggered.q,undefined);
 assert.equal(calculateAction({...baseHit,elementKey:'hydro',additivePools:[pool]}).triggered.q,undefined);
 assert.equal(calculateAction({...baseHit,actionKind:'normal',hitCount:8,additivePools:[{...pool,unlimitedKinds:['normal','charged']}]}).poolState.q,5);
});
test('Shenhe et Escoffier C2 : coefficients source et quota exacts',()=>{
 const x=complexEffects({shenhe:{enabled:true,atk:3000,talentLevel:10},escoffier:{enabled:true,atk:2500,constellation:2}},context);
 near(x.pools[0].flatDamage,6000);near(x.pools[1].flatDamage,2465.424);assert.equal(x.pools[1].charges,5);
 const hold=complexEffects({shenhe:{enabled:true,atk:3000,talentLevel:10,cast:'hold'}},context);assert.equal(hold.pools[0].charges,7);assert.equal(hold.pools[0].expiresAt,15);
});
test('le multiplicateur A4 ne multiplie jamais les plumes',()=>{
 near(calculateHit({...baseHit,talentScale:1.6,flatDamage:100}).total,(1000*2*1.6+100)*.5);
});
test('équipe complète : calcul indépendant et même résultat dans l’optimiseur',()=>{
 const base={atk:1000,critRate:50,critDmg:100,cryoDmg:46.6},e=complexEffects(config,context),stats=finalStats(base,e.bonuses),resolved=complexEffects(config,{...context,stats});
 const components=[{talentMultiplier:2.20968,count:5},{talentMultiplier:3.6828,count:1}];
 const flat=1480*12*.34782*1.6,expected=(1480*(2.20968*5+3.6828)*1.6+flat*6)*(1+.466+1.6)*(1+.65*1.4)*(190/390)*1.225;
 const hit={...baseHit,enemyLevel:100,enemyResistance:.1,critMode:'average',components,complexEffects:config,complexContext:context};
 const optimized=evaluateDamageStats({baseStats:base,hit},{});near(optimized.total,expected);
 const direct=calculateAction({...hit,stats,talentScale:resolved.talentScale,flatDamage:resolved.flatDamage,resistanceReduction:.55,damageBonus:typedAttackBonus(e.bonuses,'burst',stats)});near(direct.total,expected);
 assert.ok(expected>100000);
});

test('Skirk : mentorat +1 E Hydro/Cryo, C3 Q et expiration A4',()=>{
 const rows=attackOptions({character:{id:'10000114'}},{talentLevel:10,complexTeamElements:context.teamElements});near(rows[0].parsed.components[0].talentMultiplier,2.810935);
 const c3=attackOptions({character:{id:'10000114'}},{talentLevel:10,constellation:3});near(c3[6].parsed.components[0].talentMultiplier,2.60865);
 near(complexEffects(config,{...context,elapsed:20}).talentScale,1);
 const special={skirk:{enabled:true,sevenPhase:true,afterSpecialBurst:true,voidRifts:0,burstLevel:10}};near(complexEffects(special,{...context,actionKind:'normal'}).bonuses.normalDmg,8);assert.equal(complexEffects(special,{...context,actionKind:'normal',elapsed:12.5}).bonuses.normalDmg,undefined);
});
test('les répétitions utilisent les cycles réellement recalculés, sans dupliquer les plumes',()=>{
 const result=summarizeRotation([{damage:120,damageKnown:true,duration:3,cycleDamages:[120,100]}],2);near(result.total,220);near(result.duration,6);
});
