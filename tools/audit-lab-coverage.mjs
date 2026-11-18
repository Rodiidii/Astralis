import {readFileSync,writeFileSync} from 'node:fs';
import {publishedWeaponEffects} from '../src/lab-weapon-effects.js';
import {weaponEffectOptions,setEffectOptions} from '../src/lab-config.js';
import {talentValueRows} from '../src/lab-actions.js';
import {EXTENDED_BUFFS} from '../src/lab-extended-buffs.js';
import {CHARACTER_BUFF_IDS} from '../src/lab-character-buffs.js';
const read=name=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url)));
const kits=read('data/lab-kit-snapshot.json');
const native=new Set(Object.values(CHARACTER_BUFF_IDS));
const characters=read('assets/data/gi-characters.json').map(row=>{
 const entry=kits.characters[String(row.id)];
 const incomplete=[];
 if(entry)for(let n=1;n<=3;n++)for(const value of talentValueRows(entry.talents['combat'+n],10))if(value.includes('TODO_DATA'))incomplete.push(value);
 return {id:String(row.id),name:row.name,sourceData:!!entry,numericTableGaps:incomplete,
  constellations:entry?[1,2,3,4,5,6].map(c=>({level:c,source:!!entry.constellations['c'+c],mechanicsStatus:'not-exhaustively-verified'})):[],
  nativeDetailedBuffs:native.has(String(row.id)),additionalExplicitBuffs:(EXTENDED_BUFFS[String(row.id)]||[]).map(row=>row.id),
  mechanicsStatus:'not-exhaustively-verified',sources:entry?.sources||[]};
});
const weapons=read('assets/data/gi-weapons.json').map(row=>{
 const ranks=[1,2,3,4,5].map(rank=>{
  const explicit=publishedWeaponEffects(row,rank),options=weaponEffectOptions(row,rank);
  return {rank,description:!!row['r'+rank]?.description,explicitEffects:explicit?.map(effect=>({id:effect.id,bonuses:effect.bonuses,max:effect.max}))||[],
   inferredEffects:explicit===null?options.map(effect=>effect.id):[],
   finite:options.every(effect=>Object.values(effect.bonuses).every(value=>Array.isArray(value)?value.every(Number.isFinite):Number.isFinite(value)))};
 });
 return {id:String(row.id),name:row.name,rarity:row.rarity,ranks,
  mechanicsStatus:row.rarity<=2?'no-passive':String(row.id)==='11517'?'dedicated-model':ranks.some(rank=>rank.explicitEffects.length)?'explicit-components-only':'not-explicitly-modeled'};
});
const sets=read('assets/data/gi-artifacts.json').map(row=>{
 const options=setEffectOptions(row);
 return {id:String(row.id),name:row.name,two:options.two,four:options.four,mechanicsStatus:'not-exhaustively-verified'};
});
const result={generatedAt:new Date().toISOString(),revisions:kits.revisions,
 summary:{characters:characters.length,characterSourceData:characters.filter(row=>row.sourceData).length,travelerVariants:Object.keys(kits.travelerVariants||{}),weapons:weapons.length,explicitWeapons:weapons.filter(row=>row.mechanicsStatus==='explicit-components-only'||row.mechanicsStatus==='dedicated-model').length,sets:sets.length,exhaustivelyVerified:false},
 characters,weapons,sets};
if(weapons.some(row=>row.ranks.some(rank=>!rank.finite)))throw new Error('Non-finite weapon effect');
writeFileSync(new URL('../docs/optimizer-coverage.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.summary,null,2));
