import {normalizeWishTarget} from './wish-targets.js';
import {CHARACTER_LEVEL_EXP} from './character-level-costs.js';

const DAY=86400000;
const dateNumber=value=>Date.parse(String(value).slice(0,10)+'T00:00:00Z');
export function craftDeficits(required,owned){
 const missing=[0,0,0],surplus=[0,0,0];
 let carry=0;
 for(let tier=0;tier<3;tier++){
  const available=Math.max(0,Math.floor(Number(owned[tier])||0))+carry;
  const need=Math.max(0,Math.floor(Number(required[tier])||0));
  missing[tier]=Math.max(0,need-available);
  surplus[tier]=Math.max(0,available-need);
  carry=Math.floor(surplus[tier]/3);
 }
 return {missing,surplus};
}
export function incomeBreakdown(ledger=[]){
 const groups=new Map();
 for(const row of ledger){const label=/Commissions/.test(row.label)?'Quotidiennes et Faveur':/Exploration/.test(row.label)?'Exploration':/Ajouts personnels|offerte/.test(row.label)?'Ajouts et cadeaux':/Théâtre|Abysses/.test(row.label)?'Endgames':/Boutique/.test(row.label)?'Boutique':/récompenses|Récompenses|Codes/.test(row.label)?'Versions et codes':'Événements';const group=groups.get(label)||{label,primos:0,wishes:0};group.primos+=Number(row.primos)||0;group.wishes+=Number(row.wishes)||0;groups.set(label,group);}
 return [...groups.values()].filter(row=>row.primos||row.wishes);
}
export function periodIncome(options){
 const start=dateNumber(options.start),end=dateNumber(options.end);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||end-start>DAY*3650)return {error:'Choisis une période valide de dix ans maximum.',primos:0,wishes:0,ledger:[]};
 const ledger=[],anchor=dateNumber('2026-11-04'),patches=[];
 const add=(time,label,primos=0,wishes=0)=>{if(time>=start&&time<=end)ledger.push({date:new Date(time).toISOString().slice(0,10),label,primos,wishes});};
 for(let time=start;time<=end;time+=DAY){
  const d=new Date(time);
  add(time,'Commissions quotidiennes',60+(options.welkin?90:0));
  if(d.getUTCDate()===1){add(time,'Boutique mensuelle',0,5);add(time,'Théâtre',Math.max(0,Math.min(1000,Number(options.theatre)||0)));}
  if(d.getUTCDate()===16)add(time,'Abysses',Math.max(0,Math.min(800,Number(options.abyss)||0)));
 }
 for(let k=Math.floor((start-anchor)/DAY/42)-1;k<=Math.ceil((end-anchor)/DAY/42)+1;k++){
  const patch=anchor+k*42*DAY;
  if(patch>=start&&patch<=end)patches.push(patch);
  const version=forecastVersions[k];
  add(patch,version?'Version '+version+' · récompenses':'Récompenses de version',640,2);
  if(options.autoMaps&&k>=0&&k%2===0)add(patch,'Exploration · version '+(version||'future'),3000);
  if(options.versionGifts&&version==='7.4')add(patch,'Multi offerte · 7.4',0,10);
  if(options.versionGifts&&version==='8.0')add(patch,'Deux multis offertes · 8.0',0,20);
  add(patch+7*DAY,'Événement semaine 2',450);
  add(patch+20*DAY,'Échéance du mardi',40);
  add(patch+18*DAY,'Troisième dimanche',1000);
  add(patch+25*DAY,'Quatrième dimanche',420);
  add(patch+35*DAY,'Cinquième mercredi après le lancement',420);
  add(patch-12*DAY,'Codes du programme spécial',300);
 }
 const maps=options.autoMaps?0:Math.max(0,Math.min(patches.length,Math.floor(Number(options.maps)||0)));
 add(end,'Exploration · '+maps+' carte(s)',maps*3000);
 add(end,'Ajouts personnels',Math.max(0,Number(options.extraPrimos)||0),Math.max(0,Math.floor(Number(options.freeWishes)||0))+10*Math.max(0,Math.floor(Number(options.freeMultis)||0)));
 ledger.sort((a,b)=>a.date.localeCompare(b.date));
 return {ledger,patches:patches.length,primos:ledger.reduce((n,x)=>n+x.primos,0),wishes:ledger.reduce((n,x)=>n+x.wishes,0)};
}
export function orderedGuarantees(targets,state={}){
 let characterPity=Math.max(0,Math.min(89,Number(state.characterPity)||0));
 let weaponPity=Math.max(0,Math.min(79,Number(state.weaponPity)||0));
 let characterGuarantee=!!state.characterGuarantee;
 const wishCount=Math.max(0,Math.floor(Number(state.wishes)||0)),primoCount=Math.max(0,Math.floor(Number(state.primos)||0));
 let budget=wishCount+Math.floor(primoCount/160),spent=0;
 return targets.map(normalizeWishTarget).map(target=>{
  const copies=target.copies;
  const refinements=target.refinements;
  const characterCost=copies?90*(copies*2-(characterGuarantee?1:0))-characterPity:0;
  const weaponCost=refinements?160*refinements-weaponPity:0;
  if(copies){characterPity=0;characterGuarantee=false;}if(refinements)weaponPity=0;
  spent+=characterCost+weaponCost;
  return {...target,wishes:characterCost+weaponCost,cumulative:spent,missing:Math.max(0,spent-budget),missingPrimos:Math.max(0,(spent-wishCount)*160-primoCount)};
 });
}

const LEVEL_STOPS=[1,20,40,50,60,70,80,90];


export function farmLevelGoal(goal={}) {
 const from=Math.max(1,Math.min(90,Math.floor(Number(goal.levelFrom)||1)));
 const to=Math.max(from,Math.min(90,Math.floor(Number(goal.levelTo)||90)));
 const xp=CHARACTER_LEVEL_EXP.slice(from,to).reduce((sum,value)=>sum+value,0),mora=xp/5;
 const ascensions=LEVEL_STOPS.slice(1,-1).map((level,i)=>({level,stage:i+1})).filter(row=>row.level>=from&&row.level<to).map(row=>row.stage);
 return {from,to,ascensions,mora:Math.ceil(mora),xp};
}

export const forecastVersions=[...Array.from({length:7},(_,i)=>'7.'+(i+2)),...Array.from({length:9},(_,i)=>'8.'+i)];
export function forecastBannerDate(version,phase=1){
 const index=forecastVersions.indexOf(version);
 return index<0?'':new Date(dateNumber('2026-11-04')+(index*42+(Number(phase)===2?21:0))*DAY).toISOString().slice(0,10);
}
