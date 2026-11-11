import test from 'node:test';
import assert from 'node:assert/strict';
import {complexEffects} from '../src/complex-effects.js';
import {calculateAction} from '../src/damage-engine.js';
import {evaluateDamageStats} from '../src/optimizer.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const context={character:'receiver',elementKey:'pyro',actionKind:'normal',teamElements:['pyro','geo','hydro','anemo'],elapsed:0};
const config={yunjin:{enabled:true,def:2500,talentLevel:10,constellation:0}};
const hit={stats:{atk:1000},talentMultiplier:2,attackerLevel:90,enemyLevel:90,enemyResistance:0,critMode:'nonCrit',elementKey:'pyro',actionKind:'normal'};
test('Yun Jin : DÉF, diversité, C3 et C2 indépendants',()=>{
 const base=complexEffects(config,context);near(base.pools[0].flatDamage,1734.7);assert.equal(base.pools[0].charges,30);
 near(complexEffects(config,{...context,teamElements:['geo','geo','geo','geo']}).pools[0].flatDamage,1509.7);
 const c3=complexEffects({yunjin:{...config.yunjin,constellation:3}},context);near(c3.pools[0].flatDamage,1996);near(c3.bonuses.normalDmg,15);
 near(complexEffects({yunjin:{...config.yunjin,passive2:false}}, {...context,teamElements:[]}).pools[0].flatDamage,1447.2);
});
test('Yun Jin : attaques normales seulement, trente déclenchements par cible et expiration',()=>{
 const effects=complexEffects(config,context),pool=effects.pools[0];
 const out=calculateAction({...hit,hitCount:16,targetCount:2,additivePools:effects.pools});near(out.total,(32*2000+30*1734.7)*.5);assert.equal(out.poolState[pool.id],0);
 near(calculateAction({...hit,additivePools:effects.pools,poolState:out.poolState}).total,1000);
 for(const actionKind of ['charged','plunge','skill','burst'])assert.equal(complexEffects(config,{...context,actionKind}).pools.length,0);
 assert.equal(complexEffects(config,{...context,elapsed:12}).pools.length,0);
});
test('les quotas sont propres au bénéficiaire et renouvelés lors d’un nouveau lancement',()=>{
 for(const [name,source,ctx] of [['yunjin',config.yunjin,context],['shenhe',{enabled:true,atk:3000},{...context,elementKey:'cryo'}],['escoffier',{enabled:true,atk:2500,constellation:2},{...context,elementKey:'cryo'}]]){
  const first=complexEffects({[name]:source},ctx).pools[0],other=complexEffects({[name]:source},{...ctx,character:'other'}).pools[0];assert.notEqual(first.id,other.id);
  const refreshed=complexEffects({[name]:{...source,startedAt:1}},{...ctx,elapsed:1}).pools[0];assert.notEqual(first.id,refreshed.id);
  const out=calculateAction({...hit,elementKey:ctx.elementKey,elapsed:1,additivePools:[refreshed],poolState:{[first.id]:0}});assert.equal(out.poolState[refreshed.id],refreshed.charges-1);
 }
});
test('Shenhe C6 : normales et chargées renforcées même après épuisement par le Q',()=>{
 const effects=complexEffects({shenhe:{enabled:true,atk:3000,constellation:6}},{...context,elementKey:'cryo'}),pool=effects.pools[0];
 for(const actionKind of ['normal','charged']){const out=calculateAction({...hit,elementKey:'cryo',actionKind,additivePools:effects.pools,poolState:{[pool.id]:0}});near(out.total,(2000+pool.flatDamage)*.5);assert.equal(out.poolState[pool.id],0);}
 const burst=calculateAction({...hit,elementKey:'cryo',actionKind:'burst',additivePools:effects.pools,poolState:{[pool.id]:0}});near(burst.total,1000);
});
test('optimiseur : même résultat Yun Jin C2 que le calcul indépendant',()=>{
 const cfg={yunjin:{...config.yunjin,constellation:2}},input={baseStats:{atk:1000},hit:{...hit,stats:undefined,hitCount:31,complexEffects:cfg,complexContext:context}};
 near(evaluateDamageStats(input,{}).total,(31*2000+30*1734.7)*1.15*.5);
});
test('données source manquantes ou infinies : calcul refusé, sans classement fictif',()=>{
 for(const def of [0,NaN,Infinity]){const out=evaluateDamageStats({baseStats:{atk:1000},hit:{...hit,complexEffects:{yunjin:{...config.yunjin,def}},complexContext:context}},{});assert.equal(out.ok,false);assert.match(out.error,/DÉF finale/);}
 const out=evaluateDamageStats({baseStats:{atk:1000},hit:{...hit,complexEffects:config,complexContext:{...context,teamElements:[]}}},{});assert.equal(out.ok,false);assert.match(out.error,/composition/);
});
