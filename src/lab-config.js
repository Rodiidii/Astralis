
import {talentValueRows,parseActionValue} from './lab-actions.js?v=20261110-lab-controls-4';

export const ATTACK_KINDS=[['normal','Normale','NA'],['charged','Chargée','CA'],['plunge','Plongeante','PA'],['skill','Compétence','E'],['burst','Ultime','Q']];
export function attackKind(skillIndex,label='') {
 if(skillIndex===1)return 'skill';
 if(skillIndex===2)return 'burst';
 const text=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return /charg|charged/.test(text)?'charged':/plong|plung|chute/.test(text)?'plunge':'normal';
}
export function attackOptions(context,p) {
 return (context.skills||[]).slice(0,3).flatMap((skill,index)=>{
  const source=context.details?.talentValues?.['combat'+(index+1)]||context.details?.skillTalents?.[index]||skill;
  return talentValueRows(source,Number(p.talentLevel)||10,skill.values).flatMap((label,row)=>{
   const parsed=parseActionValue(label);
   return parsed?[{id:index+':'+row,kind:attackKind(index,label),label:label.split(/·\s*Niv\./)[0].trim(),text:label,parsed,skill}]:[];
  });
 });
}
const effect=(id,label,bonuses,max=1,active=false)=>({id,label,bonuses,max,active});
export function simpleStatBonus(text='') {
 const value=Number(text.match(/(\d+(?:[.,]\d+)?)\s*(?:%|pts?\b)/i)?.[1]?.replace(',','.'));
 if(!Number.isFinite(value))return {};
 const lower=text.toLowerCase();
 if(/(?:attaque[s]? plongeante|plunging attack)/i.test(text))return {plungeDmg:value};
 if(/(?:attaque[s]? chargée|charged attack)/i.test(text))return {chargedDmg:value};
 if(/(?:attaque[s]? normale|normal attack)/i.test(text))return {normalDmg:value};
 if(/(?:compétence[s]? élémentaire|elemental skill)/i.test(text))return {skillDmg:value};
 if(/(?:déchaînement[s]? élémentaire|elemental burst)/i.test(text))return {burstDmg:value};
 if(/(?:l'atq|atq|atk|attaque|attack).*%/i.test(text))return {atkPct:value};
 if(/(?:pv|points de vie|hp).*%/i.test(text))return {hpPct:value};
 if(/(?:déf|defense|défense).*%/i.test(text))return {defPct:value};
 if(/maîtrise élémentaire|elemental mastery/i.test(text))return {em:value};
 if(/recharge|energy recharge/i.test(text))return {er:value};
 if(/taux crit|crit rate/i.test(text))return {critRate:value};
 if(/dgt crit|crit dmg/i.test(text))return {critDmg:value};
 for(const [name,key]of [['pyro','pyro'],['hydro','hydro'],['cryo','cryo'],['électro','electro'],['anémo','anemo'],['géo','geo'],['dendro','dendro'],['physique','physical']]){
  if(lower.includes(name)&&/bonus.*dgt|dgt.*bonus/i.test(text))return {[key+'Dmg']:value};
 }
 return {};
}
export function setEffectOptions(set) {
 const id=String(set.id);
 const text=set.effect2Pc||'';
 // Only unconditional short two-piece descriptions are inferred.
 let two=!/lorsque|quand|si |après|pendant|when|while/i.test(text)?simpleStatBonus(text):{};
 const four=[];
 if(id==='15031')two={normalDmg:15,chargedDmg:15};
 if(id==='15032'){two={skillDmg:20};four.push(effect('skill','Bonus permanent de compétence',{skillDmg:25},1,true),effect('offfield','Personnage hors terrain (+25 % Skill)',{skillDmg:25}));}
 if(id==='15040')four.push(effect('normal','Énergie à 0 · bonus NA disponible (pas de Q dans les 6 s)',{normalDmg:60}),effect('burst','Énergie à 0 · bonus Q disponible (pas de NA dans les 6 s)',{burstDmg:60}));
 if(id==='15031')four.push(effect('hpchange','PV augmentés ou diminués · cumuls (+12 % CRIT chacun)',{critRate:12},3));
 if(id==='15038')four.push(effect('nightsoul','Point de noctâme consommé · 6 s',{critRate:40}));
 if(id==='15044')four.push(effect('hit','Ennemi touché · Bénédiction active (6 s)',{atkPct:25}),effect('witch','Devoir de sorcière accompli · bonus CRIT',{critRate:20}));
 const published = {
  '10002':[['healthy','Ennemi à plus de 50 % de ses PV',{dmgBonus:30}]],
  '10007':[['reaction','Réaction élémentaire déclenchée · 8 s',{em:120}]],
  '15007':[['burst','Déchaînement utilisé · équipe, non cumulable · 12 s',{atkPct:20}]],
  '15008':[['kill','Ennemi vaincu · 10 s',{chargedDmg:50}]],
  '15015':[['shield','Personnage protégé par un bouclier',{normalDmg:40,chargedDmg:40}]],
  '15016':[['skill','Compétence utilisée · 15 s',{normalDmg:30,chargedDmg:30}]],
  '15017':[['skill','Compétence ayant touché · sur ou hors terrain · 3 s',{atkPct:20}]],
  '15018':[['hit','Compétence ayant touché · 7 s',{atkPct:9},2]],
  '15020':[['energy','Bonus de déchaînement · 25 % de la recharge, plafond 75 %',{burstErScaling:.25},1,true]],
  '15019':[['energy','15 pts d’énergie consommés après E · 10 s',{normalDmg:50,chargedDmg:50,plungeDmg:50}]],
  '15021':[['curiosity','Curiosité · sur ou hors terrain',{defPct:6,geoDmg:6},4]],
  '15023':[['burst','Lumière latente après Q · sur le terrain · 16 s',{atkPct:8}],
           ['hpchange','Perte de PV pendant Lumière latente',{atkPct:10},4]],
  '15027':[['charged','Attaque chargée ayant touché · 15 s',{normalDmg:40,chargedDmg:40,plungeDmg:40}]],
  '15030':[['base','Bonus permanent de compétence et déchaînement',{skillDmg:10,burstDmg:10},1,true],
           ['damage','Dégâts reçus · sur ou hors terrain · 5 s',{skillDmg:8,burstDmg:8},5]],
  '15034':[['skill','Compétence utilisée · 10 s',{geoDmg:20}],
           ['crystal','Bonus supplémentaire sous protection de Cristallisation',{geoDmg:30}]],
  '15035':[['bond','Engagement vital modifié · 6 s',{dmgBonus:18},3]],
  '15036':[['burning','Bonus conservé face à un ennemi en Brûlure · 10 % par palier',{dmgBonus:10},5]],
  '15039':[['radiance','Radiance éternelle · 6 s par cumul',{plungeDmg:15},5]]
 };
 for (const row of published[id] || []) four.push(effect(...row));
 if(id==='15001')four.push(effect('melee','Épée, claymore ou lance équipée',{normalDmg:35}));
 if(id==='15003')four.push(effect('ranged','Arc ou catalyseur équipé',{chargedDmg:35}));
 const twoOptions=Object.keys(two).length?[effect('base','Bonus 2 pièces',two,1,true)]:[];
 if(id==='15038')twoOptions.push(effect('blessing','Bénédiction noctâme et personnage sur le terrain',{dmgBonus:15}));
 return {two:twoOptions,four};
}
export function effectSetting(p,scope,option) {
 const saved=p.effectStates?.[scope+':'+option.id];
 return {enabled:saved?.enabled??option.active,stacks:Math.max(1,Math.min(option.max,Number(saved?.stacks)||1))};
}
function merge(out,source,factor=1) {for(const [key,value]of Object.entries(source||{}))out[key]=(out[key]||0)+Number(value)*factor;return out;}
export function configuredSetEffects(sets,p) {
 const out={};
 for(const set of sets){
  const key=String(set._labKey||set._key||set._id),def=setEffectOptions(set);
  const result={two:{},four:{}};
  for(const tier of ['two','four']){
   const scope='set:'+key+':'+tier;
   for(const option of def[tier]){
    const state=effectSetting(p,scope,option);
    if(state.enabled)merge(result[tier],option.bonuses,state.stacks);
   }
   const custom=p.customEffects?.[scope];
   for(const bonus of [custom,...(custom?.additional||[])]) {
    if(bonus?.enabled&&bonus.type&&Number.isFinite(Number(bonus.value)))
     merge(result[tier],{[bonus.type]:Number(bonus.value)});
   }
  }
  if(String(set.id)==='15018'){
   const hit=def.four.find(option=>option.id==='hit');
   const state=hit&&effectSetting(p,'set:'+key+':four',hit);
   if(state?.enabled&&state.stacks===2)merge(result.four,{physicalDmg:25});
  }
  // A set can have different keys in equipped builds and imported GOOD inventories.
  for(const alias of [key,String(set._id),String(set.id)])out[alias]=result;
 }
 return out;
}
export function weaponEffectOptions(weapon,refinement=1) {
 if(!weapon)return [];
 const tier=weapon['r'+Math.max(1,Math.min(5,Number(refinement)||1))];
 const text=tier?.description||'';
 const first=text.split(/\.\s/)[0];
 // Keep the full passive visible; only a simple unconditional first sentence is automatic.
 const bonus=!/lorsque|quand|si |après|pendant|par |when|while/i.test(first)?simpleStatBonus(first):{};
 return Object.keys(bonus).length?[effect('base',weapon.effectName||'Passif de l’arme',bonus,1,true)]:[];
}
export function configuredWeaponBonuses(weapon,p) {
 const out={};const scope='weapon:'+String(weapon?._id||weapon?.id||'');
 for(const option of weaponEffectOptions(weapon,p.weaponRefinement)){
  const state=effectSetting(p,scope,option);if(state.enabled)merge(out,option.bonuses,state.stacks);
 }
 const custom=p.customEffects?.[scope];
 for(const bonus of [custom,...(custom?.additional||[])]) {
  if(bonus?.enabled&&bonus.type&&Number.isFinite(Number(bonus.value)))
   merge(out,{[bonus.type]:Number(bonus.value)});
 }
 return out;
}
export function typedAttackBonus(bonuses,kind='skill',stats={}) {
 const flat=Number(bonuses?.[kind+'Dmg'])||0;
 const energy=kind==='burst'?Math.min(75,Number(stats.er||0)*Number(bonuses?.burstErScaling||0)):0;
 return flat+energy;
}

export function snapshotWeaponStats(snapshot,weapon,level=90,ascended=true) {
 const entry=snapshot?.weapons?.[String(weapon?.id)];
 if(!entry||!Number.isInteger(level)||level<1||level>90||(Number(weapon.rarity)<3&&level>70))return null;
 const factor=snapshot.weaponCurves?.[entry.mainStat.curve]?.[level];
 if(!Number.isFinite(factor))return null;
 const rank=Math.min(6,[20,40,50,60,70,80].filter(bound=>ascended?level>=bound:level>bound).length);
 const atk=entry.mainStat.base*factor+(entry.ascensionBonus.atk?.[rank]||0);
 const sub=entry.subStat;
 const specialized=sub?sub.base*snapshot.weaponCurves?.[sub.curve]?.[level]:null;
 if(weapon.mainStatType&&(!sub||!Number.isFinite(specialized)))return null;
 return {atk,specialized,source:entry.source};
}

export function kitEffectDescriptions(details, constellation, weapon, refinement, set, pieces = 4) {
 const characterEffects = [...(details?.skillTalents || []), ...(details?.passives || [])]
  .map(row => ({name:row.name, description:row.description || row.desc}));
 const constellations = (details?.constellations || []).map((row,index) => ({
  name:'C' + (index + 1) + ' · ' + String(row.name||'').replace(/^(?:C|Constellation )\d+\s*·\s*/i,''),
  description:row.description || row.desc,
  locked:index >= Number(constellation || 0)
 }));
 const rank = Math.max(1, Math.min(5, Number(refinement) || 1));
 const weaponEffects = weapon ? [{
  name:(weapon.effectName || weapon._name) + ' · R' + rank,
  description:weapon['r' + rank]?.description || weapon.passiveDesc
 }] : [];
 const setEffects = set ? [
  {name:set._name + ' · 2 pièces', description:set.effect2Pc},
  {name:set._name + ' · 4 pièces', description:set.effect4Pc, locked:Number(pieces) < 4}
 ] : [];
 return [...characterEffects, ...constellations, ...weaponEffects, ...setEffects].filter(row => row.description);
}
