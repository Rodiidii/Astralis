import { progressionBonuses, progression } from './express-progression.js?v=20261124-expedition-3';
export const GEAR_SLOTS={weapon:'Plume',core:'Fleur',gloves:'Coupe',boots:'Sablier',sigil:'Couronne'};
export const GEAR_STATS={atk:'ATQ',spd:'VIT',crit:'Taux CRIT',critDmg:'DGT CRIT',er:'Recharge'};
export const GEAR_SETS={striker:['Avant-garde','2 pièces : +25 ATQ','4 pièces : +25 % de dégâts d’ultime'],clockwork:['Mécaniste','2 pièces : +12 VIT','4 pièces : les attaques automatiques rendent 2 énergie'],conduit:['Conducteur','2 pièces : +20 % recharge','4 pièces : lancer un ultime donne 6 énergie aux alliés'],fortune:['Éclaireur','2 pièces : +8 % taux CRIT','4 pièces : +1 niveau de rareté au butin de boss']};
const MIN={atk:12,spd:4,crit:.025,critDmg:.08,er:.08};
const POOLS={weapon:['atk'],core:['atk','er'],gloves:['atk','crit','critDmg'],boots:['spd','atk'],sigil:['crit','critDmg','er']};
export function gearState(s){s.clicker??={};const g=s.clicker.gear??={};g[s.world]??={inventory:[],equipped:{},shards:0,serial:0};const w=g[s.world];w.inventory??=[];w.equipped??={};w.shards??=0;w.serial??=0;return w;}
export function createGear(s,{boss=false,wave=1,rng=Math.random,qualityBonus=0}={}){
 const g=gearState(s);if(g.inventory.length>=160)return null;
 const keys=Object.keys(GEAR_SLOTS),slot=keys[Math.min(keys.length-1,Math.floor(rng()*keys.length))],set=Object.keys(GEAR_SETS)[Math.floor(rng()*4)%4];
 const quality=Math.min(5,(boss?3:1)+Math.floor(rng()*(boss?3:3))+qualityBonus),main=POOLS[slot][Math.floor(rng()*POOLS[slot].length)%POOLS[slot].length],stats={[main]:MIN[main]*quality*(1+Math.min(50,wave)*.025)};
 const subs=Object.keys(MIN).filter(k=>k!==main);for(let i=0;i<Math.min(3,quality-1);i++){const at=Math.floor(rng()*subs.length)%subs.length,k=subs.splice(at,1)[0];stats[k]=MIN[k]*(.4+quality*.18);}
 for(const k of Object.keys(stats))stats[k]*=1+.15*(progression(s).research.relics||0);
 const item={id:`${s.world}-gear-${++g.serial}`,slot,set,quality,main,stats,level:0,wave};g.inventory.push(item);return item;
}
export function itemStats(item){return Object.fromEntries(Object.entries(item.stats).map(([k,v])=>[k,v*(1+item.level*.15)]));}
export function equipGear(s,key,itemId){const g=gearState(s),item=g.inventory.find(i=>i.id===itemId);if(!item||!s.characters.owned.includes(key))return false;for(const e of Object.values(g.equipped))for(const slot of Object.keys(e))if(e[slot]===itemId)delete e[slot];g.equipped[key]??={};g.equipped[key][item.slot]=itemId;return true;}
export function unequipGear(s,key,slot){const g=gearState(s);if(!GEAR_SLOTS[slot]||!g.equipped[key]?.[slot])return false;delete g.equipped[key][slot];return true;}
export function salvageGear(s,id){const g=gearState(s),i=g.inventory.findIndex(p=>p.id===id);if(i<0||Object.values(g.equipped).some(e=>Object.values(e).includes(id)))return false;const [item]=g.inventory.splice(i,1);g.shards+=item.quality*3+item.level*2;return true;}
export function upgradeGear(s,id){const g=gearState(s),item=g.inventory.find(i=>i.id===id);if(!item||item.level>=10||g.shards<upgradeCost(item))return false;g.shards-=upgradeCost(item);item.level++;return true;}
export const upgradeCost=item=>4+item.level*3;
export function buildStats(s,key,base={},person=null){
 const g=gearState(s),equipped=g.equipped[key]||{},stats={atk:100,spd:100,crit:.05,critDmg:.5,er:1,...base},sets={};
 for(const id of Object.values(equipped)){const item=g.inventory.find(i=>i.id===id);if(!item)continue;sets[item.set]=(sets[item.set]||0)+1;for(const [k,v] of Object.entries(itemStats(item)))stats[k]=(stats[k]||0)+v;}
 if(sets.striker>=2)stats.atk+=25;if(sets.clockwork>=2)stats.spd+=12;if(sets.conduit>=2)stats.er+=.2;if(sets.fortune>=2)stats.crit+=.08;
 const growth=progressionBonuses(s,key,person);stats.atk*=growth.attack;stats.spd+=growth.spd;stats.er+=growth.er;stats.crit+=growth.crit;stats.critDmg+=growth.critDmg;
 return {...stats,crit:Math.min(.95,stats.crit),spd:Math.min(400,stats.spd),er:Math.min(5,stats.er),sets,supportMult:growth.support,treasureMult:growth.treasure,ultimateMult:(sets.striker>=4?1.25:1)*growth.ultimate,autoEnergy:sets.clockwork>=4?2:0,teamEnergy:sets.conduit>=4?6:0,lootQuality:sets.fortune>=4?1:0};
}
export function compareGear(s,key,itemId,base={},person=null){
 const g=gearState(s),item=g.inventory.find(i=>i.id===itemId);if(!item)return null;
 const before=buildStats(s,key,base,person),equipped=Object.fromEntries(Object.entries(g.equipped).map(([k,v])=>[k,{...v}]));
 const preview={...s,clicker:{...s.clicker,gear:{...s.clicker.gear,[s.world]:{...g,equipped}}}};
 preview.clicker.gear[s.world].equipped[key]??={};preview.clicker.gear[s.world].equipped[key][item.slot]=itemId;
 const after=buildStats(preview,key,base,person),score=x=>x.atk*(1+x.crit*x.critDmg)*(x.spd/100),delta=score(after)/score(before)-1;
 return {before,after,delta,previous:g.inventory.find(i=>i.id===g.equipped[key]?.[item.slot])||null,item,deltas:Object.fromEntries(Object.keys(GEAR_STATS).map(k=>[k,after[k]-before[k]]))};
}
export const statText=(key,value)=>['crit','critDmg','er'].includes(key)?`${Math.round(value*100)} %`:`${Math.round(value)}`;
