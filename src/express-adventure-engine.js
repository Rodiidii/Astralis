import {industryBonuses} from './express-industry-model.js?v=20261126-portal-play-1';
import { powerProfile } from './express-power-profiles.js?v=20261124-expedition-3';
import { buildStats, createGear, gearState } from './express-builds.js?v=20261124-expedition-3';
import { awardHeroXP, progression } from './express-progression.js?v=20261124-expedition-3';
import { depthProfile } from './express-kit-depth.js?v=20261124-expedition-3';

const cap=(x,a,b)=>Math.min(b,Math.max(a,Number(x)||0));
export function adventure(s){s.clicker??={};const r=s.clicker.adventure??={zones:{},serial:0};r.zones??={};const id=`${s.world}:${s.place}`;r.zones[id]??={wave:1,kills:0,hp:500,maxHp:500,partyHP:1000,shield:0,effects:[],sequence:[],auras:[],auto:{},nextCounter:0,lastAt:0,log:[],lastDamage:0,lastCombo:'',comboUntil:0,lootPity:0,focus:0};return r.zones[id];}
const team=s=>(s.clicker?.teams?.[s.world]||[]).filter(k=>k&&s.characters.owned.includes(k));
const name=p=>p?._name||p?.name||p?.en||'Voyageur';
const find=(people,keyOf,key)=>people.find(p=>keyOf(p)===key);
export function combatStats(s,p,key){const kit=powerProfile(p,key,s.world);const stats=buildStats(s,key,{atk:kit.atk,spd:kit.spd,crit:.05,critDmg:.5,er:1},p),bonus=industryBonuses(s,key,p);return {...stats,atk:stats.atk*bonus.attack,spd:stats.spd+bonus.speed,crit:Math.min(.95,stats.crit+bonus.crit),er:stats.er*bonus.energy};}
export function elementalType(p){const t=String(p?.elementText||p?.element||p?.damageType||'').toLowerCase();return /pyro|fire|fusion/.test(t)?'pyro':/cryo|ice|glacio/.test(t)?'cryo':/hydro|water/.test(t)?'hydro':/électro|electro|lightning/.test(t)?'electro':/dendro/.test(t)?'dendro':/anemo|aero|wind/.test(t)?'anemo':/geo/.test(t)?'geo':/spectro|imaginary/.test(t)?'light':/havoc|quantum/.test(t)?'dark':'physical';}
function log(z,text,now){z.log.unshift({text,at:now});z.log=z.log.slice(0,12);}
export function activeEffects(s,now=Date.now()){return adventure(s).effects.filter(e=>e.until>now&&team(s).includes(e.owner));}
export function combatBonuses(s,now=Date.now()){
 const effects=activeEffects(s,now),z=adventure(s);
 return {effects,attack:effects.filter(e=>e.type==='inspire').reduce((n,e)=>n+e.power,0),speed:effects.some(e=>e.type==='speed')?1.45:1,crit:effects.some(e=>e.type==='precision')?.25:0,critCharges:effects.filter(e=>e.type==='critical').reduce((n,e)=>n+(e.charges||0),0),vulnerable:1+effects.filter(e=>['space','expose'].includes(e.type)).reduce((n,e)=>Math.max(n,e.type==='expose'&&e.power>=0&&e.power<=.5?e.power:.35),0),guard:effects.some(e=>e.type==='freeze'||e.type==='time'),shield:z.shield};
}
function addEffect(s,type,key,p,power,seconds,now,extra={}){const z=adventure(s);z.effects=z.effects.filter(e=>!(e.type===type&&e.owner===key));z.effects.push({type,owner:key,person:name(p),special:powerProfile(p,key,s.world).special||'',power,until:now+seconds*1000,nextAt:now+1000,...extra});}
export function energyEvent(s,event,actor,people,keyOf,now=Date.now()){
 const c=s.clicker;c.energy??={};const z=adventure(s);
 for(const k of team(s)){
  const p=find(people,keyOf,k);if(!p)continue;const kit=powerProfile(p,k,s.world),stats=combatStats(s,p,k);let gain=0;
  if(event==='hit'&&k===actor)gain=kit.charge==='onfield'?kit.gain:3;
  if(event==='hit'&&k!==actor&&kit.charge==='team')gain=3;
  if(event==='auto'&&k===actor&&kit.charge!=='onfield')gain=kit.charge==='auto'?kit.gain:2;
  if(event==='skill'&&k===actor)gain=kit.gain+5;
  if(event==='skill'&&k!==actor&&kit.special==='phainon')gain=12;
  if(event==='burst'&&k!==actor&&kit.charge==='team')gain=12;
  if(event==='burst'&&k!==actor&&kit.special==='raiden'){gain=18;z.focus=Math.min(60,(z.focus||0)+10);}
  if(event==='heal'&&kit.charge==='heal')gain=kit.gain;
  if(event==='block'&&kit.charge==='block')gain=kit.gain*2;
  if(event==='kill')gain=kit.charge==='kill'?kit.gain*3:kit.charge==='onfield'?0:2;
  if(event==='crit'&&kit.charge==='crit'&&k===actor)gain=kit.gain;
  if(event==='dot'&&kit.charge==='dot'&&k===actor)gain=kit.gain;
  if(event==='reaction'&&kit.charge==='reaction')gain=kit.gain;
  if(event==='combo'&&kit.charge==='combo')gain=kit.gain*2;
  if(event==='swap'&&kit.charge==='swap')gain=kit.gain*2;
  const sets=stats.sets;if(event==='auto'&&k===actor)gain+=stats.autoEnergy;
  c.energy[`${s.world}:${k}`]=cap((c.energy[`${s.world}:${k}`]||0)+gain*stats.er,0,kit.cost);
 }
}
function rewardKill(s,key,p,people,keyOf,now,rng){
 const z=adventure(s),boss=z.wave%5===0,stats=combatStats(s,p,key),effects=activeEffects(s,now);z.kills++;z.lootPity++;
 let money=(boss?30:6)*Math.pow(1.12,Math.min(z.wave,1600))*stats.treasureMult,item=null;
 s.xp=(s.xp||0)+(boss?3:1);const levels=awardHeroXP(s,team(s),boss?8:2);
 if(z.kills===1||boss||z.lootPity>=3||effects.some(e=>e.type==='fortune')){item=createGear(s,{boss,wave:z.wave,rng,qualityBonus:boss?stats.lootQuality:0});if(!item)gearState(s).shards+=3;z.lootPity=0;}
 if(effects.some(e=>e.type==='fortune')){money*=2;z.effects=z.effects.filter(e=>e.type!=='fortune');}
 for(const member of team(s)){const ally=find(people,keyOf,member),d=depthProfile(ally,member,s.world);if(d.role==='execute'||d.role==='fortune')kitGain(s,ally,member,d.gain*2);}
 z.wave++;z.maxHp=Math.round(500*Math.pow(1.18,Math.min(1600,z.wave-1))*(z.wave%5===0?2.5:1));z.hp=z.maxHp;z.auras=[];z.nextCounter=now+10000;
 energyEvent(s,'kill',key,people,keyOf,now);log(z,`${boss?'Gardien vaincu':'Vague terminée'} · +${Math.round(money)} · ${item?'nouvelle pièce':'prochaine vague'}`,now);
 return {money,item,kills:1,boss,levels};
}
function merge(a,b){a.damage+=(b.damage||0);a.money+=(b.money||0);a.kills+=(b.kills||0);a.critical||=!!b.critical;if(b.item)a.items.push(b.item);if(b.items)a.items.push(...b.items);if(b.levels)(a.levels??=[]).push(...b.levels);if(b.vfx)(a.vfx??=[]).push(...b.vfx.slice(0,20));if(b.combo)a.combo=b.combo;return a;}
const result=()=>({damage:0,money:0,kills:0,items:[],critical:false,combo:null});
function deal(s,amount,key,p,people,keyOf,now,rng,kind='hit'){
 const z=adventure(s),out=result(),stats=combatStats(s,p,key),bonuses=combatBonuses(s,now);let forced=activeEffects(s,now).find(e=>e.type==='critical'&&e.charges>0);
 const critical=!!forced||rng()<Math.min(.95,stats.crit+bonuses.crit);if(forced)forced.charges--;
 let damage=Math.max(1,(amount+bonuses.attack*.2)*bonuses.vulnerable*(critical?1+stats.critDmg:1))*(z.resonanceUntil>now?1.12:1)*(z.guard?.wave===z.wave&&z.guard.brokenUntil>now?1.35:1);
 if(kind==='burst')damage*=stats.ultimateMult;
 const fanfare=activeEffects(s,now).filter(e=>e.type==='fanfare').reduce((n,e)=>Math.max(n,e.fanfare||0),0);damage*=1+fanfare*.005;if(kind==='reaction'&&activeEffects(s,now).some(e=>e.type==='sanctuary'))damage*=1.5;
 const execute=activeEffects(s,now).some(e=>e.type==='execute');if(execute&&z.hp/z.maxHp<.25)damage=Math.max(damage,z.hp);
 out.damage=Math.min(z.hp,damage);z.hp=Math.max(0,z.hp-damage);z.lastDamage=out.damage;out.critical=critical;
 if(critical){energyEvent(s,'crit',key,people,keyOf,now);if(powerProfile(p,key,s.world).special==='chixia')addEffect(s,'speed',key,p,0,4,now);}
 if(z.hp<=0){const drop=rewardKill(s,key,p,people,keyOf,now,rng);out.money=drop.money;out.kills=1;out.levels=drop.levels;if(drop.item)out.items.push(drop.item);}
 return out;
}
function reaction(s,p,key,people,keyOf,now,rng){
 const z=adventure(s),el=elementalType(p),last=z.auras.find(a=>a.until>now&&a.element!==el),out=result();z.auras=z.auras.filter(a=>a.until>now&&a.element!==el);z.auras.push({element:el,until:now+7000});if(!last||el==='physical')return out;
 const pair=[el,last.element].sort().join('+'),stats=combatStats(s,p,key);
 const recipes={'cryo+pyro':['Fonte',2],'hydro+pyro':['Vaporisation',1.5],'electro+hydro':['Électrocution',1.1],'dendro+hydro':['Floraison',1.4],'dendro+electro':['Stimulation',1.4],'electro+pyro':['Surcharge',1.6],'cryo+hydro':['Gel',.7],'anemo+pyro':['Dispersion Pyro',1.2],'anemo+electro':['Dispersion Électro',1.2],'anemo+hydro':['Dispersion Hydro',1.2],'anemo+cryo':['Dispersion Cryo',1.2],'geo+pyro':['Cristallisation',.6],'dark+light':['Convergence',1.4]};
 const recipe=recipes[pair];if(!recipe)return out;merge(out,deal(s,stats.atk*recipe[1],key,p,people,keyOf,now,rng,'reaction'));out.combo=recipe[0];z.lastCombo=recipe[0];z.comboUntil=now+5000;energyEvent(s,'reaction',key,people,keyOf,now);
 visual(out,'reaction',key,recipe[0],out.damage);const q=heroKitState(s,p,key);if(now-q.lastReactionAt>=900){kitGain(s,p,key,depthProfile(p,key,s.world).gain*.5);q.lastReactionAt=now;}
 if(pair==='cryo+hydro')addEffect(s,'freeze',key,p,0,4,now);if(pair==='geo+pyro')z.shield+=stats.atk;
 for(const effect of activeEffects(s,now).filter(e=>e.type==='mark').slice(0,4)){const ally=find(people,keyOf,effect.owner);if(ally)merge(out,deal(s,effect.power,effect.owner,ally,people,keyOf,now,rng,'coordinated'));}
 return out;
}
function heroKitState(s,p,key){const z=adventure(s),profile=depthProfile(p,key,s.world);z.kits??={};const state=z.kits[key]??={resource:0,chain:0,lastNormal:0,lastCharged:0,echoes:[],totems:0,lastReactionAt:0,introAt:0};state.resource=cap(state.resource,0,profile.max);state.echoes??=[];return state;}
function kitGain(s,p,key,amount){const q=heroKitState(s,p,key),d=depthProfile(p,key,s.world);q.resource=cap(q.resource+amount,0,d.max);return q.resource;}
export function kitMechanics(s,p,key,now=Date.now()){
 const profile=depthProfile(p,key,s.world),state=heroKitState(s,p,key),stance=activeEffects(s,now).some(e=>e.type==='stance'&&e.owner===key),steps=stance?Math.max(2,profile.steps-2):profile.steps;
 return {profile,resource:state.resource,chain:now-state.lastNormal>5000?0:state.chain,steps,ready:state.resource>=profile.cost,cooldown:Math.max(0,Math.ceil((state.lastCharged+900-now)/1000)),totems:state.totems||0};
}
export function enemyGuard(s,now=Date.now()){
 const z=adventure(s),max=z.wave%5===0?180:100;
 if(!z.guard||z.guard.wave!==z.wave)z.guard={wave:z.wave,value:max,max,brokenUntil:0};
 if(z.guard.brokenUntil&&z.guard.brokenUntil<=now){z.guard.value=max;z.guard.brokenUntil=0;}
 return z.guard;
}
function visual(out,type,key,label,amount=0,extra={}){(out.vfx??=[]).push({type,key,label,amount,...extra});}
function guardDamage(s,amount,key,out,now){const z=adventure(s),g=enemyGuard(s,now);if(g.brokenUntil>now)return;g.value=Math.max(0,g.value-amount);if(g.value===0){g.brokenUntil=now+4500;z.nextCounter=Math.max(z.nextCounter||0,g.brokenUntil);visual(out,'break',key,'RUPTURE · DGT ×1,35',amount);log(z,'Garde brisée · dégâts ×1,35 pendant 4,5 s',now);}}
function restoreHealth(s,p,key,amount,out,people,keyOf,now){
 const z=adventure(s),restored=Math.min(1000-z.partyHP,amount),overflow=Math.max(0,amount-restored);z.partyHP=Math.min(1000,z.partyHP+amount);if(overflow){z.shield=Math.min(3000,z.shield+overflow*.5);addEffect(s,'shield',key,p,overflow*.5,8,now,{visual:'overflow'});}
 if(restored>0)energyEvent(s,'heal',key,people,keyOf,now);for(const fan of activeEffects(s,now).filter(e=>e.type==='fanfare'))fan.fanfare=Math.min(100,(fan.fanfare||0)+restored/10);
 visual(out,'heal',key,overflow?'SOIN · SURPLUS EN BOUCLIER':'VAGUE DE SOIN',Math.round(restored));return restored;
}
function teamRecharge(s,p,key,value,people,keyOf){for(const member of team(s)){if(member===key)continue;const ally=find(people,keyOf,member);s.clicker.energy??={};const token=`${s.world}:${member}`;s.clicker.energy[token]=cap((s.clicker.energy[token]||0)+value,0,powerProfile(ally,member,s.world).cost);}}
function cycleFinisher(s,p,key,people,keyOf,now,rng,out){
 const d=depthProfile(p,key,s.world),stats=combatStats(s,p,key),q=heroKitState(s,p,key);let mult=.9;
 switch(d.role){
  case'healer':restoreHealth(s,p,key,stats.atk*.55*stats.supportMult,out,people,keyOf,now);break;
  case'shield':zShield();break;
  case'battery':teamRecharge(s,p,key,6*stats.er,people,keyOf);visual(out,'energy',key,'ÉNERGIE PARTAGÉE',6);break;
  case'dot':addEffect(s,'dot',key,p,stats.atk*.45,9,now,{interval:1800});break;
  case'summoner':if(activeEffects(s,now).some(e=>e.type==='summon'&&e.owner===key))mult=1.8;visual(out,'summon',key,'ASSAUT COORDONNÉ');break;
  case'critical':addEffect(s,'critical',key,p,0,7,now,{charges:1});break;
  case'speed':addEffect(s,'speed',key,p,0,5,now);visual(out,'energy',key,'CADENCE ACCÉLÉRÉE');break;
  case'inspirer':addEffect(s,'inspire',key,p,stats.atk*.4,6,now);visual(out,'buff',key,'ENCOURAGEMENT');break;
  case'combo':adventure(s).relayReady={owner:key,until:now+12000};visual(out,'relay',key,'RELAIS PRÉPARÉ');break;
  case'mark':addEffect(s,'mark',key,p,stats.atk*.8,9,now);break;
  case'fortune':gearState(s).shards++;visual(out,'treasure',key,'FRAGMENT TROUVÉ',1);break;
  case'assault':mult=1.4;guardDamage(s,15,key,out,now);break;
  case'control':guardDamage(s,10,key,out,now);break;
 }
 if(d.mechanic==='death'){addEffect(s,'mark',key,p,stats.atk*1.1,12,now);mult=1.5;}
 if(d.mechanic==='phainon'&&activeEffects(s,now).some(e=>e.type==='stance'&&e.owner===key)){mult=3;visual(out,'meteor',key,'BRAISE DU MONDE');}
 merge(out,deal(s,stats.atk*mult,key,p,people,keyOf,now,rng,'finisher'));kitGain(s,p,key,d.gain);visual(out,'finisher',key,'FIN DE CYCLE',stats.atk*mult,{mechanic:d.mechanic});
 function zShield(){adventure(s).shield=Math.min(3000,adventure(s).shield+stats.atk*.6*stats.supportMult);addEffect(s,'shield',key,p,stats.atk*.6,6,now);visual(out,'shield',key,'GARDE RENFORCÉE');}
}
function normalKit(s,p,key,people,keyOf,now,rng,out,auto){
 const q=heroKitState(s,p,key),m=kitMechanics(s,p,key,now),stats=combatStats(s,p,key);if(auto){if(m.profile.role!=='assault'&&m.profile.role!=='stance')kitGain(s,p,key,m.profile.gain*.25);return;}
 if(now-q.lastNormal>5000)q.chain=0;q.lastNormal=now;q.chain++;kitGain(s,p,key,m.profile.gain);q.echoes.push(stats.atk*.85);q.echoes=q.echoes.slice(-3);guardDamage(s,5,key,out,now);
 if(q.chain>=m.steps){q.chain=0;cycleFinisher(s,p,key,people,keyOf,now,rng,out);}
}
function castKit(s,p,key,kind,people,keyOf,now,rng,out){
 const d=depthProfile(p,key,s.world),q=heroKitState(s,p,key),stats=combatStats(s,p,key),z=adventure(s);kitGain(s,p,key,d.gain*(kind==='skill'?2:1));
 if(kind==='skill'){
  if(d.mechanic==='death')addEffect(s,'mark',key,p,stats.atk*1.1,12,now);
  if(d.mechanic==='zhongli'){addEffect(s,'summon',key,p,stats.atk*.35,12,now,{interval:2200,actors:['column'],visual:'pillar'});visual(out,'pillar',key,'PILIER DE JADE');}
  if(d.mechanic==='yae'){q.totems=Math.min(3,q.totems+1);addEffect(s,'summon',key,p,stats.atk*.35*q.totems,18,now,{interval:1600,actors:['fox'],entities:q.totems,visual:'totem'});visual(out,'summon',key,`${q.totems} TOTEM(S)`);}
  if(d.mechanic==='furina'){const salon=z.effects.find(e=>e.type==='summon'&&e.owner===key);if(salon){salon.actors=['crab','octopus','seahorse'];salon.entities=3;}}
  if(d.mechanic==='hutao'){z.partyHP=Math.max(1,z.partyHP-100);addEffect(s,'stance',key,p,stats.atk,12,now,{healOnHit:false});visual(out,'infusion',key,'INFUSION · −100 VITALITÉ');}
  if(d.mechanic==='lisa'){q.seals=Math.min(3,(q.seals||0)+1);visual(out,'mark',key,`${q.seals} SCEAU(X) CONDUCTEUR(S)`);}
  if(d.mechanic==='arlecchino'){q.debt=true;addEffect(s,'mark',key,p,stats.atk,14,now);}
  if(d.mechanic==='phainon')kitGain(s,p,key,1);
 }
 if(kind==='burst'){
  if(d.mechanic==='yae'&&q.totems){merge(out,deal(s,stats.atk*q.totems*2.5,key,p,people,keyOf,now,rng,'burst'));visual(out,'detonate',key,'TOTEMS CONSUMÉS');q.totems=0;}
  if(d.mechanic==='jinhsi'&&q.resource){merge(out,deal(s,stats.atk*q.resource*.08,key,p,people,keyOf,now,rng,'burst'));q.resource=0;visual(out,'beam',key,'INCANDESCENCE LIBÉRÉE');}
  for(const member of team(s))if(member!==key){const ally=find(people,keyOf,member),other=depthProfile(ally,member,s.world);if(other.mechanic==='raiden')kitGain(s,ally,member,12);if(other.mechanic==='abyss')kitGain(s,ally,member,2);}
 }
 if(kind==='skill')for(const member of team(s))if(member!==key){const ally=find(people,keyOf,member),other=depthProfile(ally,member,s.world);if(other.mechanic==='jinhsi')kitGain(s,ally,member,2);}
 guardDamage(s,kind==='burst'?30:18,key,out,now);
}
export function chargedAttack(s,p,key,people,keyOf,{now=Date.now(),rng=Math.random}={}){
 const out=result(),z=adventure(s),d=depthProfile(p,key,s.world),q=heroKitState(s,p,key),stats=combatStats(s,p,key);
 if(!team(s).includes(key)||s.characters.active!==key)return {...out,ok:false,reason:'La chargée est réservée au personnage sur le terrain.'};
 if(q.resource<d.cost)return {...out,ok:false,reason:`${Math.floor(q.resource)}/${d.cost} ${d.resource}`};
 if(now-q.lastCharged<900)return {...out,ok:false,reason:'La frappe chargée se termine.'};
 q.resource-=d.cost;q.lastCharged=now;q.chain=0;let mult=d.multiplier;
 switch(d.mode){
  case'heal':restoreHealth(s,p,key,stats.atk*2*stats.supportMult,out,people,keyOf,now);if(d.mechanic==='life'||d.mechanic==='baizhi')addEffect(s,'summon',key,p,stats.atk*.5,8,now,{interval:2000});break;
  case'guard':z.shield=Math.min(3000,z.shield+stats.atk*2.5*stats.supportMult);addEffect(s,'shield',key,p,stats.atk*2.5,10,now);addEffect(s,'riposte',key,p,stats.atk*3,10,now,{charges:1});visual(out,'shield',key,'RIPOSTE ARMÉE');break;
  case'battery':teamRecharge(s,p,key,22*stats.er,people,keyOf);visual(out,'energy',key,'ULTIMES RECHARGÉS',22);break;
  case'summon':{const pet=activeEffects(s,now).find(e=>e.type==='summon'&&e.owner===key);if(pet){merge(out,deal(s,pet.power*2,key,p,people,keyOf,now,rng,'summon'));pet.until=Math.max(pet.until,now+6000);}else addEffect(s,'summon',key,p,stats.atk*.5,10,now,{interval:1800});break;}
  case'salon':for(let i=0;i<3;i++)merge(out,deal(s,stats.atk*.9,key,p,people,keyOf,now,rng,'summon'));restoreHealth(s,p,key,stats.atk*.8,out,people,keyOf,now);visual(out,'summon',key,'RAPPEL DES TROIS INVITÉS');break;
  case'detonate':{const dots=activeEffects(s,now).filter(e=>e.type==='dot');for(const dot of dots){const ally=find(people,keyOf,dot.owner);if(ally)merge(out,deal(s,dot.power*2,dot.owner,ally,people,keyOf,now,rng,'detonation'));}if(d.mechanic==='lisa'){mult+=q.seals||0;q.seals=0;}visual(out,'detonate',key,'ALTÉRATIONS DÉCLENCHÉES');break;}
  case'precision':addEffect(s,'critical',key,p,0,1,now,{charges:1});if(d.mechanic==='amber'){const pet=activeEffects(s,now).find(e=>e.type==='summon'&&e.owner===key);if(pet){mult+=2;z.effects=z.effects.filter(e=>e!==pet);visual(out,'detonate',key,'BARON LAPIN EXPLOSE');}}break;
  case'echo':for(const amount of q.echoes)merge(out,deal(s,amount*.8,key,p,people,keyOf,now,rng,'echo'));z.nextCounter=Math.max(now+4000,z.nextCounter+2000);teamRecharge(s,p,key,5,people,keyOf);visual(out,'echo',key,`${q.echoes.length} ÉCHOS REJOUÉS`);break;
  case'fracture':addEffect(s,'space',key,p,0,8,now);for(let i=0;i<3;i++)merge(out,deal(s,stats.atk*.6,key,p,people,keyOf,now,rng,'fracture'));break;
  case'shatter':{const frozen=activeEffects(s,now).some(e=>e.type==='freeze');if(frozen){mult+=3;z.effects=z.effects.filter(e=>e.type!=='freeze');visual(out,'shatter',key,'BRISE-GLACE');}guardDamage(s,25,key,out,now);if(d.mechanic==='kazuha')addEffect(s,'speed',key,p,0,6,now);break;}
  case'verdict':if(z.hp/z.maxHp<.4)mult*=2;if(activeEffects(s,now).some(e=>e.type==='mark'&&e.owner===key)){mult+=1.8;z.effects=z.effects.filter(e=>!(e.type==='mark'&&e.owner===key));}visual(out,'verdict',key,'SENTENCE');break;
  case'drain':mult*=q.debt?1.5:1;restoreHealth(s,p,key,stats.atk*1.2,out,people,keyOf,now);q.debt=false;visual(out,'drain',key,'VITALITÉ RÉCUPÉRÉE');break;
  case'stance':{const stance=activeEffects(s,now).find(e=>e.type==='stance'&&e.owner===key);if(stance)stance.until=Math.min(now+20000,stance.until+3000);else addEffect(s,'stance',key,p,stats.atk,8,now);visual(out,'infusion',key,'POSTURE PROLONGÉE');break;}
  case'mark':{const mark=activeEffects(s,now).find(e=>e.type==='mark'&&e.owner===key);if(mark)merge(out,deal(s,mark.power*2,key,p,people,keyOf,now,rng,'mark'));addEffect(s,'mark',key,p,stats.atk,10,now);teamRecharge(s,p,key,8,people,keyOf);visual(out,'mark',key,'LIENS DÉCLENCHÉS');break;}
  case'inspire':addEffect(s,'inspire',key,p,stats.atk*.9,8,now);visual(out,'buff',key,'RALLIEMENT · 8 s');break;
  case'relay':z.relayReady={owner:key,until:now+12000};addEffect(s,'relay',key,p,stats.atk*.7,8,now);visual(out,'relay',key,'RELAIS RENFORCÉ');break;
  case'tempo':for(const member of team(s))z.auto[member]=now;addEffect(s,'speed',key,p,0,6,now);if(d.mechanic==='robin')z.relayReady={owner:key,until:now+12000};if(d.mechanic==='shorekeeper'){restoreHealth(s,p,key,stats.atk,out,people,keyOf,now);addEffect(s,'critical',key,p,0,8,now,{charges:3});}visual(out,'energy',key,'L’ÉQUIPE AVANCE');break;
  case'treasure':addEffect(s,'fortune',key,p,0,30,now);gearState(s).shards+=2;visual(out,'treasure',key,'BUTIN PRÉPARÉ');break;
  case'beam':case'volley':case'meteor':{const count=d.mode==='beam'?3:d.mode==='volley'?6:2,interval=d.mode==='volley'?220:650;addEffect(s,'barrage',key,p,stats.atk*mult/count,(count*interval+1200)/1000,now,{remaining:count,nextAt:now,nextShot:now,interval,visual:d.mode,heal:d.mode==='beam'?stats.atk*.12:0});mult=0;visual(out,d.mode,key,d.charged);break;}
  case'breaker':if(enemyGuard(s,now).brokenUntil>now)mult*=1.6;break;
 }
 if(mult>0)merge(out,deal(s,stats.atk*mult,key,p,people,keyOf,now,rng,'charged'));
 guardDamage(s,d.mode==='breaker'||d.mode==='meteor'?45:25,key,out,now);energyEvent(s,'hit',key,people,keyOf,now);merge(out,reaction(s,p,key,people,keyOf,now,rng));merge(out,recordAction(s,'charged',key,p,people,keyOf,now,rng));
 visual(out,'charged',key,d.charged,out.damage,{mechanic:d.mechanic});log(z,`${name(p)} · ${d.charged} · ${d.cost} ${d.resource}`,now);return {...out,ok:true,profile:d};
}
export function recordAction(s,type,key,p,people,keyOf,now=Date.now(),rng=Math.random){
 const z=adventure(s),out=result();z.sequence=z.sequence.filter(a=>now-a.at<10000);z.sequence.push({type,key,at:now});z.sequence=z.sequence.slice(-6);
 const sequence=z.sequence.slice(-3),pattern=sequence.map(a=>a.type).join('>');let combo='';
 if(pattern==='skill>swap>burst'&&sequence[0].key!==sequence[2].key){combo='Relais parfait';addEffect(s,'expose',key,p,0,8,now);for(const member of team(s))s.clicker.energy[`${s.world}:${member}`]=Math.min(powerProfile(find(people,keyOf,member),member,s.world).cost,(s.clicker.energy[`${s.world}:${member}`]||0)+15);}
 if(pattern==='burst>swap>burst'&&sequence[0].key!==sequence[2].key){combo='Convergence des ultimes';addEffect(s,'critical',key,p,0,10,now,{charges:5});}
 if(pattern==='skill>hit>burst'){combo='Frappe préparée';merge(out,deal(s,combatStats(s,p,key).atk*3,key,p,people,keyOf,now,rng,'combo'));}
 if(pattern==='skill>charged>burst'&&sequence.every(a=>a.key===key)){combo='Art signature';const role=powerProfile(p,key,s.world).role,stats=combatStats(s,p,key);if(['healer','shield','inspirer','battery','speed','time'].includes(role)){restoreHealth(s,p,key,stats.atk,out,people,keyOf,now);teamRecharge(s,p,key,12,people,keyOf);visual(out,'buff',key,'ART SIGNATURE · SOUTIEN');}else{merge(out,deal(s,stats.atk*3.5,key,p,people,keyOf,now,rng,'combo'));visual(out,'finisher',key,'ART SIGNATURE');}}
 if(pattern==='hit>charged>swap'){combo='Passage d’élan';z.relayReady={owner:sequence[1].key,until:now+12000};visual(out,'relay',key,'PASSAGE D’ÉLAN');}
 if(pattern==='charged>swap>burst'&&sequence[0].key!==key){combo='Cascade résonante';addEffect(s,'critical',key,p,0,8,now,{charges:3});teamRecharge(s,p,key,10,people,keyOf);visual(out,'energy',key,'CASCADE RÉSONANTE');}
 if(combo){z.lastCombo=combo;z.comboUntil=now+6000;energyEvent(s,'combo',key,people,keyOf,now);out.combo=combo;log(z,combo,now);z.sequence=[];}
 return out;
}
export function switchCombatCharacter(s,key,people,keyOf,now=Date.now()){
 if(!team(s).includes(key)||s.characters.active===key)return false;const z=adventure(s),previous=s.characters.active,p=find(people,keyOf,key);s.characters.active=key;energyEvent(s,'swap',key,people,keyOf,now);const out=recordAction(s,'swap',key,p,people,keyOf,now),q=heroKitState(s,p,key);
 if(!q.introAt||now-q.introAt>=8000){q.introAt=now;const prepared=z.relayReady?.until>now&&z.relayReady.owner===previous;merge(out,deal(s,combatStats(s,p,key).atk*(prepared?2:.6),key,p,people,keyOf,now,Math.random,'intro'));kitGain(s,p,key,depthProfile(p,key,s.world).gain);if(prepared)z.relayReady=null;visual(out,'relay',key,prepared?'ENTRÉE RENFORCÉE':'FRAPPE D’ENTRÉE');}
 z.pendingKitResult??=result();merge(z.pendingKitResult,out);return true;
}
export function combatHit(s,p,key,people,keyOf,{now=Date.now(),rng=Math.random,auto=false}={}){
 const out=result(),stats=combatStats(s,p,key),z=adventure(s),stance=activeEffects(s,now).find(e=>e.type==='stance'&&e.owner===key);
 merge(out,deal(s,stats.atk*(auto?.55:.85)*(stance?2.5:1),key,p,people,keyOf,now,rng));
 energyEvent(s,auto?'auto':'hit',key,people,keyOf,now);if(!auto)merge(out,recordAction(s,'hit',key,p,people,keyOf,now,rng));
 if(stance?.healOnHit){const healed=Math.min(1000-z.partyHP,stats.atk*.2);z.partyHP+=healed;if(healed>0)energyEvent(s,'heal',key,people,keyOf,now);}
 for(const blade of activeEffects(s,now).filter(e=>e.type==='lightblade'&&e.owner===key))blade.charges=Math.min(20,(blade.charges||0)+1);
 if(!auto||stance)merge(out,reaction(s,p,key,people,keyOf,now,rng));
 for(const mark of activeEffects(s,now).filter(e=>e.type==='relay'&&e.owner!==key)){if(mark.nextAt<=now){const ally=find(people,keyOf,mark.owner);if(ally)merge(out,deal(s,mark.power,mark.owner,ally,people,keyOf,now,rng));mark.nextAt=now+2000;}}
 if(stance&&stance.special==='phainon'&&stance.nextMeteor<=now){merge(out,deal(s,stats.atk*6,key,p,people,keyOf,now,rng,'burst'));stance.nextMeteor=now+3500;out.meteor=true;}
 normalKit(s,p,key,people,keyOf,now,rng,out,auto);if(auto&&key===s.characters.active)visual(out,'auto',key,'FRAPPE AUTOMATIQUE',out.damage);
 return out;
}
export function castPower(s,p,key,kind,people,keyOf,{now=Date.now(),rng=Math.random}={}){
 const z=adventure(s),out=result(),rawKit=powerProfile(p,key,s.world),kit={...rawKit,mode:kind==='burst'?(rawKit.burstMode||rawKit.mode):(rawKit.skillMode||rawKit.mode)},stats=combatStats(s,p,key),c=s.clicker,token=`${s.world}:${key}`;
 if(!team(s).includes(key)||!s.characters.owned.includes(key))return {...out,ok:false,reason:'Ajoute ce personnage à l’équipe.'};
 c.energy??={};c.cooldowns??={};
 if(kind==='burst'&&(c.energy[token]||0)<kit.cost)return {...out,ok:false,reason:`${Math.floor(c.energy[token]||0)}/${kit.cost} énergie`};
 if(kind==='skill'&&(c.cooldowns[token]||0)>now)return {...out,ok:false,reason:'Compétence en recharge.'};
 if(kind==='burst')c.energy[token]=0;else c.cooldowns[token]=now+Math.round(10000*100/stats.spd);
 const full=kind==='burst',duration=full?14:7,power=stats.atk*(full?1:.4)*(['heal','shield','lifemark','healingstance'].includes(kit.mode)?stats.supportMult:1);let impact=full?2:1.1;
 switch(kit.mode){
  case'nuke':impact=full?11:2.5;break;
  case'volley':for(let i=0;i<(full?6:3);i++)merge(out,deal(s,stats.atk*.8,key,p,people,keyOf,now,rng,kind));impact=0;break;
  case'orbit':addEffect(s,'summon',key,p,power*.8,duration,now,{interval:1300});impact=full?2:1;break;
  case'fanfare':addEffect(s,'fanfare',key,p,0,20,now,{fanfare:0});impact=0;break;
  case'sanctuary':addEffect(s,'sanctuary',key,p,0,18,now);impact=0;break;
  case'meteor':addEffect(s,'freeze',key,p,0,4,now);impact=9;break;
  case'inspire':addEffect(s,'inspire',key,p,power*.65,duration,now);impact=0;break;
  case'expose':{const eligible=team(s).map(k=>find(people,keyOf,k)).filter(a=>a&&['pyro','cryo','hydro','electro'].includes(elementalType(a))).length;addEffect(s,'expose',key,p,kit.special==='xilonen'?Math.min(.45,eligible*.15):.35,duration,now);impact=0;break;}
  case'healingstance':addEffect(s,'stance',key,p,power,duration,now,{healOnHit:true});z.partyHP=Math.min(1000,z.partyHP+power);impact=.5;break;
  case'drain':impact=full?8:2;break;
  case'delayed':addEffect(s,'lightblade',key,p,power,10,now,{charges:0});impact=full?3:1;break;
  case'detonatesummons':{const count=activeEffects(s,now).filter(e=>e.type==='summon'&&e.owner===key).length;z.effects=z.effects.filter(e=>e.type!=='summon'||e.owner!==key);impact=4+count*4;break;}
  case'lifemark':addEffect(s,'mark',key,p,power,duration,now);addEffect(s,'regen',key,p,power*.5,duration,now);if(kit.special==='naberius')addEffect(s,'summon',key,p,power,duration,now,{interval:1800});impact=0;break;
  case'summon':addEffect(s,'summon',key,p,power,full?18:9,now,{interval:kit.special==='furina'?1600:2200,actors:kit.actors});impact=.7;break;
  case'battery':for(const k of team(s))if(k!==key){const ally=find(people,keyOf,k),cost=powerProfile(ally,k,s.world).cost;c.energy[`${s.world}:${k}`]=Math.min(cost,(c.energy[`${s.world}:${k}`]||0)+(full?30:12)*stats.er);}impact=kit.id==='hsr:1217'||kit.id==='hsr:1313'?0:full?3.5:1;break;
  case'heal':{const restored=Math.min(1000-z.partyHP,power*3);z.partyHP=Math.min(1000,z.partyHP+power*3);addEffect(s,'regen',key,p,power*.3,duration,now);if(kit.special==='bennett')addEffect(s,'inspire',key,p,stats.atk*.6,duration,now);if(kit.special==='naberius')addEffect(s,'summon',key,p,power*.8,duration,now,{interval:1800});if(restored>0){energyEvent(s,'heal',key,people,keyOf,now);for(const e of activeEffects(s,now).filter(e=>(e.special==='furina'||e.type==='fanfare')))e.fanfare=Math.min(100,(e.fanfare||0)+restored/10);}log(z,`${name(p)} · ${Math.round(restored)} vitalité restaurée`,now);impact=0;break;}
  case'shield':z.shield=Math.min(3000,z.shield+power*(full?6:3));addEffect(s,'shield',key,p,power,duration,now);if(kit.special==='zhongli')addEffect(s,'expose',key,p,0,duration,now);impact=0;break;
  case'freeze':addEffect(s,'freeze',key,p,0,full?9:4,now);if(kit.special==='kaeya')addEffect(s,'summon',key,p,power*.5,duration,now,{interval:2000});impact=full?2.5:1;break;
  case'speed':addEffect(s,'speed',key,p,0,duration,now);for(const k of team(s))z.auto[k]=Math.min(z.auto[k]||now,now);if(kit.special==='shorekeeper')addEffect(s,'precision',key,p,0,duration,now);impact=0;break;
  case'dot':if(kit.special==='kafka')for(const dot of activeEffects(s,now).filter(e=>e.type==='dot'))merge(out,deal(s,dot.power*5,key,p,people,keyOf,now,rng,'detonation'));addEffect(s,'dot',key,p,power*.7,duration,now,{interval:1500});if(kit.special==='lisa')addEffect(s,'expose',key,p,0,duration,now);impact=1;break;
  case'execute':addEffect(s,'execute',key,p,power,duration,now);impact=full?(z.hp/z.maxHp<.4?13:5):1.5;if(kit.special==='obsidian'){z.partyHP=Math.min(1000,z.partyHP+power*2);energyEvent(s,'heal',key,people,keyOf,now);}break;
  case'critical':addEffect(s,'critical',key,p,0,duration,now,{charges:full?6:2});impact=full?4:1.2;break;
  case'relay':addEffect(s,'relay',key,p,power*1.4,duration,now);energyEvent(s,'swap',key,people,keyOf,now);impact=1;break;
  case'loot':addEffect(s,'fortune',key,p,0,40,now);impact=full?4:1;break;
  case'time':addEffect(s,'time',key,p,0,duration,now);for(const k of team(s)){const ally=find(people,keyOf,k);if(ally)for(let i=0;i<(full?3:1);i++)merge(out,combatHit(s,ally,k,people,keyOf,{auto:true,now,rng}));}impact=0;break;
  case'space':addEffect(s,'space',key,p,0,duration,now);addEffect(s,'relay',key,p,power,duration,now);impact=full?5:1;break;
  case'mark':addEffect(s,'mark',key,p,power*1.5,duration,now);impact=1;break;
  case'stance':addEffect(s,'stance',key,p,power,duration,now,{special:kit.special,nextMeteor:now+2500});if(kit.special==='capitano')z.shield+=stats.atk*3;impact=full?(kit.special==='phainon'?8:5):1.2;break;
 }
 if(kit.special==='raiden'&&full){impact+=(z.focus||0)*.1;z.focus=0;}
 if(impact>0)merge(out,deal(s,stats.atk*impact,key,p,people,keyOf,now,rng,kind));if(kit.mode==='drain'){const healed=Math.min(1000-z.partyHP,out.damage*.25);z.partyHP+=healed;if(healed>0)energyEvent(s,'heal',key,people,keyOf,now);}
 if(impact>0)merge(out,reaction(s,p,key,people,keyOf,now,rng));
 energyEvent(s,kind,key,people,keyOf,now);merge(out,recordAction(s,kind,key,p,people,keyOf,now,rng));
 if(full)for(const mark of activeEffects(s,now).filter(e=>e.type==='mark'&&e.special==='dainsleif'&&e.owner!==key)){const ally=find(people,keyOf,mark.owner);if(ally)merge(out,deal(s,mark.power*2,mark.owner,ally,people,keyOf,now,rng,'coordinated'));}
 if(full&&stats.teamEnergy)for(const k of team(s))if(k!==key){const ally=find(people,keyOf,k);c.energy[`${s.world}:${k}`]=Math.min(powerProfile(ally,k,s.world).cost,(c.energy[`${s.world}:${k}`]||0)+stats.teamEnergy);}
 castKit(s,p,key,kind,people,keyOf,now,rng,out);
 log(z,`${name(p)} · ${full?'ultime':'compétence'} · ${kit.name}`,now);
 return {...out,ok:true,kit,duration};
}
export function tickAdventure(s,people,keyOf,{now=Date.now(),rng=Math.random}={}){
 const z=adventure(s),out=result();enemyGuard(s,now);if(z.pendingKitResult){merge(out,z.pendingKitResult);delete z.pendingKitResult;}for(const expired of z.effects.filter(e=>e.type==='lightblade'&&e.until<=now&&team(s).includes(e.owner))){const p=find(people,keyOf,expired.owner);if(p){merge(out,deal(s,expired.power*(5+(expired.charges||0)*.8),expired.owner,p,people,keyOf,now,rng,'burst'));visual(out,'detonate',expired.owner,'LAME DE LUMIÈRE');}}
 z.effects=z.effects.filter(e=>e.until>now&&team(s).includes(e.owner));
 if(!z.lastAt){z.lastAt=now;z.nextCounter=now+10000;for(const k of team(s))z.auto[k]=now+3000;return out;}
 // No hidden offline combat catch-up; camp production is handled separately.
 if(now-z.lastAt>5000){z.nextCounter=now+10000;for(const k of team(s))z.auto[k]=now+3000;}z.lastAt=now;
 const bonuses=combatBonuses(s,now);if(!activeEffects(s,now).some(e=>e.type==='shield'||e.special==='capitano'&&e.type==='stance'))z.shield=0;
 for(const k of team(s)){const p=find(people,keyOf,k);if(!p)continue;const stats=combatStats(s,p,k);if((z.auto[k]||0)<=now){merge(out,combatHit(s,p,k,people,keyOf,{auto:true,now,rng}));z.auto[k]=now+8000*100/stats.spd/bonuses.speed;}}
 for(const e of [...activeEffects(s,now)])if(e.nextAt<=now){const p=find(people,keyOf,e.owner);if(!p)continue;e.nextAt=now+(e.interval||2000);
  if(e.type==='summon'||e.type==='dot'){merge(out,deal(s,e.power*((e.special==='furina'||e.type==='fanfare')?1+(e.fanfare||0)/100:1),e.owner,p,people,keyOf,now,rng,e.type));energyEvent(s,e.type==='dot'?'dot':'auto',e.owner,people,keyOf,now);if(e.type==='summon')merge(out,reaction(s,p,e.owner,people,keyOf,now,rng));else kitGain(s,p,e.owner,depthProfile(p,e.owner,s.world).gain*.5);visual(out,e.type,e.owner,e.type==='summon'?'FRAPPE DE L’INVOCATION':'PULSATION D’ALTÉRATION',e.power);}
  if(e.type==='regen'){const restored=Math.min(1000-z.partyHP,e.power);z.partyHP=Math.min(1000,z.partyHP+e.power);if(restored>0){energyEvent(s,'heal',e.owner,people,keyOf,now);kitGain(s,p,e.owner,depthProfile(p,e.owner,s.world).gain*.5);visual(out,'heal',e.owner,'RÉGÉNÉRATION',restored);for(const fan of activeEffects(s,now).filter(f=>(f.special==='furina'||f.type==='fanfare')))fan.fanfare=Math.min(100,(fan.fanfare||0)+restored/10);}}
  if(e.type==='barrage'){let catchup=0;while(e.remaining>0&&e.nextShot<=now&&catchup++<6){merge(out,deal(s,e.power,e.owner,p,people,keyOf,now,rng,'charged'));visual(out,e.visual||'beam',e.owner,'VAGUE CHARGÉE',e.power);if(e.heal)restoreHealth(s,p,e.owner,e.heal,out,people,keyOf,now);guardDamage(s,8,e.owner,out,now);e.remaining--;e.nextShot+=(e.interval||650);}if(!e.remaining)e.until=now;}
 }
 if(z.nextCounter<=now){z.nextCounter=now+10000;if(!bonuses.guard&&!(z.guard.brokenUntil>now)){let hit=z.wave%5===0?180:75;const blocked=Math.min(hit,z.shield);z.shield-=blocked;hit-=blocked;z.partyHP=Math.max(0,z.partyHP-hit);if(blocked){energyEvent(s,'block','',people,keyOf,now);visual(out,'shield',s.characters.active,'REPRÉSAILLE BLOQUÉE',blocked);for(const member of team(s)){const ally=find(people,keyOf,member),d=depthProfile(ally,member,s.world);if(d.role==='shield'||d.mechanic==='frostguard')kitGain(s,ally,member,d.gain*2);}for(const riposte of activeEffects(s,now).filter(e=>e.type==='riposte'&&e.charges>0)){const ally=find(people,keyOf,riposte.owner);if(ally){merge(out,deal(s,riposte.power,riposte.owner,ally,people,keyOf,now,rng,'riposte'));riposte.charges--;riposte.until=now;guardDamage(s,25,riposte.owner,out,now);visual(out,'riposte',riposte.owner,'RIPOSTE');}}}if(hit){visual(out,'incoming',s.characters.active,'REPRÉSAILLE',hit);for(const e of activeEffects(s,now).filter(e=>e.type==='fanfare'||e.type==='summon'&&e.special==='furina'))e.fanfare=Math.min(100,(e.fanfare||0)+hit/10);}
   if(z.partyHP<=0){z.partyHP=1000;z.hp=z.maxHp;z.effects=[];z.shield=0;s.combo=0;log(z,'L’équipe reprend son souffle. Soigne ou protège-la avant les prochaines représailles.',now);}
  }}
 // One shared queue for the entire owned roster. At most one visual/power per
 // four seconds, and at least thirty seconds between two visits by one hero.
 z.resonances??={nextAt:now+8000,cursor:0,last:{}};
 if(z.resonances.nextAt<=now){
  z.resonances.nextAt=now+4000;const owned=s.characters.owned.filter(k=>find(people,keyOf,k));
  for(let i=0;i<owned.length;i++){const index=(z.resonances.cursor+i)%owned.length,key=owned[index];if(now-(z.resonances.last[key]??-Infinity)<30000)continue;
   const person=find(people,keyOf,key),stats=combatStats(s,person,key);z.resonances.cursor=(index+1)%owned.length;z.resonances.last[key]=now;z.resonanceUntil=now+4500;
   merge(out,deal(s,stats.atk*.75*(1+.2*(progression(s).research.resonance||0)),key,person,people,keyOf,now,rng,'resonance'));out.resonance={key,person:name(person)};log(z,`${name(person)} · résonance du compagnon`,now);break;
  }
 }
 return out;
}
export function mechanicSummary(s,p,key,now=Date.now()){const kit=powerProfile(p,key,s.world),stats=combatStats(s,p,key),energy=s.clicker?.energy?.[`${s.world}:${key}`]||0;return {kit,stats,energy,cost:kit.cost,progress:cap(energy/kit.cost*100,0,100),cooldown:Math.max(0,Math.ceil(((s.clicker?.cooldowns?.[`${s.world}:${key}`]||0)-now)/1000))};}
