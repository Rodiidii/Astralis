import {kitEffectDescriptions,setEffectOptions,weaponEffectOptions} from './lab-config.js';
export function effectCatalog(context={},characterDetails={},constellation=0){
 const rows=[];
 const add=(type,id,name,effects,source)=>{for(const effect of effects)rows.push({type,id:String(id??''),owner:name,name:effect.name||effect.label,description:effect.description||'',bonuses:effect.bonuses||{},locked:!!effect.locked,source});};
 for(const weapon of context.weapons||[]){
  for(let rank=1;rank<=5;rank++){
   const options=weaponEffectOptions(weapon,rank),descriptions=kitEffectDescriptions(null,0,weapon,rank,null);
   add('weapon',weapon._id||weapon.id,weapon._name||weapon.name,descriptions.map(row=>({...row,bonuses:options.length===1?options[0].bonuses:{}})),weapon.sourceUrl||'https://github.com/theBowja/genshin-db');
  }
 }
 for(const set of context.sets||[]){const options=setEffectOptions(set);add('set',set._id||set.id,set._name||set.name,kitEffectDescriptions(null,0,null,1,set).map((row,index)=>({...row,bonuses:index===0?Object.assign({},...options.two.filter(o=>o.active).map(o=>o.bonuses)):{ }})),set.sourceUrl||'https://github.com/theBowja/genshin-db');}
 add('character',characterDetails.id||characterDetails._id,characterDetails._name||characterDetails.name,kitEffectDescriptions(characterDetails,constellation,null,1,null),characterDetails.sourceUrl||'https://github.com/theBowja/genshin-db');
 return rows;
}
