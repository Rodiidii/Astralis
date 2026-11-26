import assert from 'node:assert/strict';
import fs from 'node:fs';
import { POWER_PROFILES,powerProfile } from '../src/express-power-profiles.js';
import { teamKeys,setTeamSlot } from '../src/express-team.js';
import { adventure,castPower,combatHit,combatStats,tickAdventure,switchCombatCharacter,activeEffects } from '../src/express-adventure-engine.js';
import { gearState,createGear,equipGear,unequipGear,upgradeGear,salvageGear,buildStats } from '../src/express-builds.js';
import { regionScenery } from '../src/express-scenery.js';
import { regionalObject,REGIONAL_OBJECTS } from '../src/express-regional-objects.js';
const people=[{id:10000021,name:'Amber',elementText:'Pyro'},{id:10000015,name:'Kaeya',elementText:'Cryo'},{id:10000006,name:'Lisa',elementText:'Électro'},{id:10000014,name:'Barbara',elementText:'Hydro'},{id:10000030,name:'Zhongli',elementText:'Geo'},{id:10000073,name:'Nahida',elementText:'Dendro'},{id:10000089,name:'Furina',elementText:'Hydro'},{id:1408,name:'Phainon',elementText:'Physical'},{id:1002,name:'Dan Heng',elementText:'Wind'}];
const keyOf=p=>p.name.toLowerCase().replace(/[^a-z0-9]/g,'');
function make(world='gi',keys=['amber','kaeya','lisa','barbara']){const s={world,place:world==='gi'?'mondstadt':world==='hsr'?'herta':'jinzhou',characters:{active:keys[0],owned:keys,levels:{}},clicker:{teams:{[world]:keys},energy:{}},combo:0};teamKeys(s);adventure(s);return s;}
function ready(s,key,p){s.clicker.energy[`${s.world}:${key}`]=powerProfile(p,key,s.world).cost;}
let scenes=0;const modes=new Set();
for(const [id,kit] of Object.entries(POWER_PROFILES)){
 const [world,pid]=id.split(':'),p={id:pid,name:id,elementText:'Physical'},s=make(world,[id]);ready(s,id,p);adventure(s).partyHP=400;
 const out=castPower(s,p,id,'burst',[p],x=>x.name,{now:1000,rng:()=>.99});assert.ok(out.ok,id);assert.ok(Number.isFinite(out.damage),id);assert.ok(Number.isFinite(adventure(s).hp),id);assert.ok(kit.description&&kit.chargeLabel,id);modes.add(kit.mode);scenes++;
 assert.equal(castPower(s,p,id,'burst',[p],x=>x.name,{now:1001,rng:()=>.99}).ok,false,`Double ult ${id}`);
}
const s=make(),amber=people[0];const before=combatStats(s,amber,'amber'),base=combatHit(s,amber,'amber',people,keyOf,{now:1000,rng:()=>.99}).damage;
const gear=createGear(s,{rng:()=>0});assert.ok(equipGear(s,'amber',gear.id));assert.ok(combatStats(s,amber,'amber').atk>before.atk);
adventure(s).hp=500;const armed=combatHit(s,amber,'amber',people,keyOf,{now:1100,rng:()=>.99}).damage;assert.ok(armed>base);
assert.equal(salvageGear(s,gear.id),false);gearState(s).shards=100;assert.ok(upgradeGear(s,gear.id));assert.ok(combatStats(s,amber,'amber').atk>before.atk+12);
assert.ok(equipGear(s,'kaeya',gear.id));assert.equal(gearState(s).equipped.amber.weapon,undefined);assert.ok(unequipGear(s,'kaeya','weapon'));assert.ok(salvageGear(s,gear.id));
const healer=make();adventure(healer).partyHP=100;ready(healer,'barbara',people[3]);castPower(healer,people[3],'barbara','burst',people,keyOf,{now:1000,rng:()=>.99});assert.ok(adventure(healer).partyHP>100);assert.ok(activeEffects(healer,1001).some(e=>e.type==='regen'));
const shield=make('gi',['zhongli','amber']);ready(shield,'zhongli',people[4]);castPower(shield,people[4],'zhongli','skill',people,keyOf,{now:1000,rng:()=>.99});assert.ok(adventure(shield).shield>0);tickAdventure(shield,people,keyOf,{now:1000});adventure(shield).nextCounter=2000;tickAdventure(shield,people,keyOf,{now:2000,rng:()=>.99});assert.equal(adventure(shield).partyHP,1000);
const combo=make();castPower(combo,amber,'amber','skill',people,keyOf,{now:1000,rng:()=>.99});switchCombatCharacter(combo,'kaeya',people,keyOf,1100);ready(combo,'kaeya',people[1]);const chain=castPower(combo,people[1],'kaeya','burst',people,keyOf,{now:1200,rng:()=>.99});assert.equal(chain.combo,'Relais parfait');
const reaction=make();combatHit(reaction,amber,'amber',people,keyOf,{now:1000,rng:()=>.99});switchCombatCharacter(reaction,'kaeya',people,keyOf,1100);assert.equal(combatHit(reaction,people[1],'kaeya',people,keyOf,{now:1200,rng:()=>.99}).combo,'Fonte');
const heavy=make('hsr',['phainon','danheng']);for(let i=0;i<10;i++)combatHit(heavy,people[7],'phainon',people,keyOf,{now:1000+i,rng:()=>.99});assert.ok(heavy.clicker.energy['hsr:phainon']<powerProfile(people[7],'phainon','hsr').cost);assert.equal(powerProfile(people[7],'phainon','hsr').cost,240);
const loot=make();adventure(loot).hp=1;const won=combatHit(loot,amber,'amber',people,keyOf,{now:1000,rng:()=>.99});assert.equal(won.kills,1);assert.equal(won.items.length,1);assert.equal(adventure(loot).wave,2);assert.ok(won.money>0);
const auto=make();tickAdventure(auto,people,keyOf,{now:1000,rng:()=>.99});const health=adventure(auto).hp;tickAdventure(auto,people,keyOf,{now:4500,rng:()=>.99});assert.ok(adventure(auto).hp<health);
const fresh=JSON.parse(JSON.stringify(combo));assert.deepEqual(teamKeys(fresh),teamKeys(combo));assert.equal(adventure(fresh).wave,adventure(combo).wave);
// Important differences between the two actions of the same character.
const zhongli=make('gi',['zhongli','amber']);ready(zhongli,'zhongli',people[4]);const meteor=castPower(zhongli,people[4],'zhongli','burst',people,keyOf,{now:1000,rng:()=>.99});assert.ok(meteor.damage>0);assert.equal(adventure(zhongli).shield,0);assert.ok(activeEffects(zhongli,1001).some(e=>e.type==='freeze'));
const fan=make('gi',['furina','barbara']);adventure(fan).partyHP=300;castPower(fan,people[6],'furina','skill',people,keyOf,{now:1000,rng:()=>.99});ready(fan,'furina',people[6]);const fanOut=castPower(fan,people[6],'furina','burst',people,keyOf,{now:1100,rng:()=>.99});assert.equal(fanOut.damage,0);assert.ok(activeEffects(fan,1101).some(e=>e.type==='fanfare'));castPower(fan,people[3],'barbara','skill',people,keyOf,{now:1200,rng:()=>.99});assert.ok(activeEffects(fan,1201).find(e=>e.type==='fanfare').fanfare>0);
const barbara=make();adventure(barbara).partyHP=100;ready(barbara,'barbara',people[3]);assert.equal(castPower(barbara,people[3],'barbara','burst',people,keyOf,{now:1000,rng:()=>.99}).damage,0);
const eula={id:10000051,name:'Eula',elementText:'Cryo'},delayed=make('gi',['eula']);ready(delayed,'eula',eula);castPower(delayed,eula,'eula','burst',[eula],keyOf,{now:1000,rng:()=>.99});combatHit(delayed,eula,'eula',[eula],keyOf,{now:1200,rng:()=>.99});assert.equal(activeEffects(delayed,1201).find(e=>e.type==='lightblade').charges,1);assert.ok(tickAdventure(delayed,[eula],keyOf,{now:11500,rng:()=>.99}).damage>0);
assert.equal(Object.keys(REGIONAL_OBJECTS).length,18);assert.equal(new Set(Object.values(REGIONAL_OBJECTS).map(x=>x.motif)).size,18);assert.match(regionalObject({world:'gi',place:'mondstadt'}).html,/cx-object-render/);assert.match(regionalObject({world:'ww',place:'jinzhou'}).html,/element-aero/);
for(const object of Object.values(REGIONAL_OBJECTS)){assert.ok(fs.existsSync(new URL('..'+object.image,import.meta.url)),object.image);assert.ok(object.ambience);}
for(const [world,places] of Object.entries({gi:['mondstadt','liyue','inazuma','sumeru','fontaine','natlan','nod-krai'],hsr:['herta','jarilo','xianzhou','amphoreus','planarcadia','penacony'],ww:['jinzhou','mt-firmament','black-shores','rinascita','lahai-roi']}))for(const place of places){const path=regionScenery({world,place});assert.ok(fs.existsSync(new URL('..'+path,import.meta.url)),`${world}:${place} ${path}`);}
console.log(JSON.stringify({charactersWithWorkingUlt:scenes,distinctMechanicFamilies:modes.size,gearAffectsRealDamage:true,healing:true,shield:true,rotationCombo:true,reaction:true,heavyCharge:true,automaticAttacks:true,guaranteedLoot:true,save:true,regionalImages:true,distinctRegionalObjects:18,separateSkillsAndUltimates:true,fanfareScalesOnHealing:true,delayedBlade:true},null,2));
