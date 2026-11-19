import {catalogLevelRow,namedStatKey} from './gi-level-stats.js';
import {effectiveTalentLevel} from './lab-talent-levels.js';
import {publishedWeaponEffects} from './lab-weapon-effects.js';
import {COMPLEX_PARAMS as CD} from './complex-effect-data.js';

import {talentValueRows,parseActionValue} from './lab-actions.js?v=20261110-lab-controls-4';

export const ATTACK_KINDS=[['normal','Normale','NA'],['charged','Chargée','CA'],['plunge','Plongeante','PA'],['skill','Compétence','E'],['burst','Ultime','Q']];
export function attackKind(skillIndex,label='') {
 if(skillIndex===1)return 'skill';
 if(skillIndex===2)return 'burst';
 const text=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return /charg|charged/.test(text)?'charged':/plong|plung|chute/.test(text)?'plunge':'normal';
}
export function attackOptions(context,p) {
 if(context.wrAttacks?.length)return context.wrAttacks;

 if(['10000114','skirk'].includes(String(context.character?.id||context.character?._id||p.character).toLowerCase())){
  let serial=0;const team=p.complexTeamElements||[],c=Number(p.constellation)||0,boost=team.length===4&&team.every(e=>['hydro','cryo'].includes(e))&&team.includes('hydro')&&team.includes('cryo')?1:0,n=Math.max(0,Math.min(14,Number(p.talentLevel||10)-1+boost+(c>=5?3:0))),q=Math.max(0,Math.min(14,Number(p.talentLevel||10)-1+(c>=3?3:0))),make=(id,label,kind,components)=>({id:'99:'+serial++,label,kind,text:label,parsed:{components,hitCount:components.reduce((s,x)=>s+x.count,0),baseStat:'atk'},skill:context.skills?.[kind==='burst'?2:1]||{}});
  return [0,1,3,5,6].map((i,j)=>make('skirk:N'+(j+1),'Sept phases · N'+(j+1),'normal',[{talentMultiplier:CD.Skirk.skill[i][n],count:j===2||j===3?2:1}]))
   .concat(make('skirk:CA','Sept phases · Chargée (3 impacts)','charged',[{talentMultiplier:CD.Skirk.skill[7][n],count:3}]),make('skirk:Q','Déchaînement complet · 5 entailles + finale','burst',[{talentMultiplier:CD.Skirk.burst[0][q],count:5},{talentMultiplier:CD.Skirk.burst[1][q],count:1}]),make('skirk:Q-slash','Déchaînement · une entaille','burst',[{talentMultiplier:CD.Skirk.burst[0][q],count:1}]),make('skirk:Q-final','Déchaînement · entaille finale','burst',[{talentMultiplier:CD.Skirk.burst[1][q],count:1}]));
 }
 return (context.skills||[]).slice(0,3).flatMap((skill,index)=>{
  const source=context.details?.talentValues?.['combat'+(index+1)]||context.details?.skillTalents?.[index]||skill;
  return talentValueRows(source,effectiveTalentLevel(context.details,index,p.talentLevel,p.constellation),skill.values).flatMap((label,row)=>{
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
 if(/soins|healing/i.test(text))return {healing:value};
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
 const text=set.effect2Pc||set.twoPieceBonus||set['2pc']||'';
 // Only unconditional short two-piece descriptions are inferred.
 let two=!/lorsque|quand|si |après|pendant|when|while/i.test(text)?simpleStatBonus(text):{};
 const four=[];
 if(id==='10010')two={hpFlat:1000};
 if(id==='10011')two={defFlat:100};
 if(id==='10006')two={normalDmg:15,chargedDmg:15};
 if(id==='15031')two={normalDmg:15,chargedDmg:15};
 if(id==='15032'){two={skillDmg:20};four.push(effect('skill','Bonus permanent de compétence',{skillDmg:25},1,true),effect('offfield','Personnage hors terrain (+25 % Skill)',{skillDmg:25}));}
 if(id==='14001')four.push(effect('cryo','Ennemi affecté par Cryo',{critRate:20}),effect('frozen','Ennemi gelé · bonus supplémentaire',{critRate:20}));
 if(id==='15025')four.push({...effect('dendro','Compétence ou déchaînement ayant touché · RÉS Dendro −30 %',{resReduction:30}),elements:['dendro']});
 if(id==='15002')four.push({...effect('swirl','Élément simulé dispersé · RÉS −40 %',{resReduction:40}),elements:['pyro','hydro','cryo','electro']});
 if(id==='15040')four.push(effect('normal','Énergie à 0 · bonus NA disponible (pas de Q dans les 6 s)',{normalDmg:60}),effect('burst','Énergie à 0 · bonus Q disponible (pas de NA dans les 6 s)',{burstDmg:60}));
 if(id==='15031')four.push(effect('hpchange','PV augmentés ou diminués · cumuls (+12 % CRIT chacun)',{critRate:12},3));
 if(id==='15038')four.push(effect('nightsoul','Point de noctâme consommé · 6 s',{critRate:40}));
 if(id==='15044')four.push(effect('hit','Ennemi touché · Bénédiction active (6 s)',{atkPct:25}),effect('witch','Devoir de sorcière accompli · bonus CRIT',{critRate:20}));
 if(id==='10005')four.push(effect('lowHP','PV strictement inférieurs à 70 %',{critRate:24}));
 if(id==='10001')four.push(effect('base','Bonus permanent du taux CRIT des attaques chargées',{chargedCritRate:30},1,true));
 if(id==='10006')four.push(effect('skill','Compétence utilisée : 8 s',{normalDmg:25,chargedDmg:25}));
 if(id==='14003')four.push(effect('aura','Ennemi affecté par Pyro',{dmgBonus:35}));
 if(id==='14002')four.push(effect('aura','Ennemi affecté par Électro',{dmgBonus:35}));
 if(id==='15024')four.push(effect('valley','Rituel de la vallée déclenché pour cet impact normal',{normalFlatFromAtk:70}));
 if(id==='15026')four.push(effect('same','Réaction déclenchée : autres équipiers du même élément',{atkPct:14},3),effect('different','Réaction déclenchée : autres équipiers d’un élément différent',{em:50},3));
 if(id==='15029')four.push(effect('nymph','Nymphe reflétée : catégories d’attaques distinctes',{atkPct:[7,16,25],hydroDmg:[4,9,15]},3));
 if(id==='15006')four.push(effect('base','Bonus permanents de réactions',{overloadBonus:40,burningBonus:40,burgeonBonus:40,vaporizeBonus:15,meltBonus:15},1,true),effect('skill','Compétence utilisée : cumuls de 10 s',{pyroDmg:7.5},3));
 if(id==='15005')four.push(effect('base','Bonus permanents de réactions',{overloadBonus:40,electroChargedBonus:40,superconductBonus:40,hyperbloomBonus:40,aggravateBonus:20,lunarChargedBonus:20,stellarConductBonus:20},1,true));
 if(id==='15028')four.push(effect('base','Bonus permanents de réactions',{bloomBonus:40,hyperbloomBonus:40,burgeonBonus:40,lunarBloomBonus:10},1,true),effect('reaction','Réaction du passif déclenchée : cumuls de 10 s',{bloomBonus:10,hyperbloomBonus:10,burgeonBonus:10,lunarBloomBonus:2.5},4));
 if(id==='15046')four.push(effect('base','Bonus permanents de Supraconduction et Astroconduction',{superconductBonus:80,stellarConductBonus:40},1,true),effect('affected','Cible affectée par Supraconduction ou Astroconduction',{critRate:16}));
 if(id==='15047')four.push(effect('stellar','Astrodispersion déclenchée : 10 s',{critRate:16,stellarSwirlBonus:40}));
 if(id==='15048')four.push(effect('stellar','Réaction astrale déclenchée ou dégâts astraux infligés : 12 s',{atkPct:12,stellarConductBonus:50,stellarSwirlBonus:50}));
 if(id==='15043')four.push(effect('offfield','Hors terrain, ou moins de 3 s après le déploiement',{lunarChargedBonus:20,lunarBloomBonus:20,lunarCrystallizeBonus:20}),effect('ascendant','Même condition hors terrain et signelune ascendante : supplément',{lunarChargedBonus:40,lunarBloomBonus:40,lunarCrystallizeBonus:40}));
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
export function resolvedEffectBonuses(option,stacks=1){
 return Object.fromEntries(Object.entries(option?.bonuses||{}).map(([key,value])=>[key,Array.isArray(value)?Number(value[Math.max(0,Math.min(value.length-1,stacks-1))]):Number(value)*stacks]));
}
export function configuredSetEffects(sets,p) {
 const out={};
 for(const set of sets){
  const key=String(set._labKey||set._key||set._id),def=setEffectOptions(set);
  const result={two:{},four:{}};
  for(const tier of ['two','four']){
   const scope='set:'+key+':'+tier;
   for(const option of def[tier]){
    const state=effectSetting(p,scope,option);
    if((option.active||state.enabled)&&(!option.elements||option.elements.includes(p.elementKey)))merge(result[tier],resolvedEffectBonuses(option,state.stacks));
   }
   const custom=p.customEffects?.[scope];
   for(const bonus of [custom,...(custom?.additional||[])]) {
    if(bonus?.enabled&&bonus.type&&Number.isFinite(Number(bonus.value)))
     merge(result[tier],{[bonus.type]:Number(bonus.value)});
   }
  }
  if(String(set.id)==='15044'){const hit=effectSetting(p,'set:'+key+':four',def.four.find(option=>option.id==='hit'));const witch=effectSetting(p,'set:'+key+':four',def.four.find(option=>option.id==='witch'));if(witch.enabled&&!hit.enabled)result.four.critRate=(result.four.critRate||0)-20;}
  if(String(set.id)==='14001'){const frozen=effectSetting(p,'set:'+key+':four',def.four.find(option=>option.id==='frozen'));const cryo=effectSetting(p,'set:'+key+':four',def.four.find(option=>option.id==='cryo'));if(frozen.enabled&&!cryo.enabled)result.four.critRate=(result.four.critRate||0)+20;}
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
 if(!weapon||String(weapon.id)==='11517')return [];
 const rank=Math.max(1,Math.min(5,Number(refinement)||1));
 const published=publishedWeaponEffects(weapon,rank);if(published)return published;
 // Unknown descriptions remain unmodeled; never infer a buff from their first number.
 return [];
}
export function configuredWeaponBonuses(weapon,p) {
 const out={};const scope='weapon:'+String(weapon?._id||weapon?.id||'');
 let melodyApplied=false;const exclusive=new Set();
 const options=weaponEffectOptions(weapon,p.weaponRefinement);
 for(const option of options){
  if(option.characters&&!option.characters.includes(String(p.characterId||p.character)))continue;
  if(option.onfield&&(p.fightPosition||'on')!=='on'||option.offfield&&(p.fightPosition||'on')!=='off')continue;
  if(option.requires?.some(([id,min])=>{const parent=options.find(row=>row.id===id);const state=parent&&effectSetting(p,scope,parent);return !state?.enabled||state.stacks<min;}))continue;
  const state=effectSetting(p,scope,option);if(option.stacksFrom){const parent=options.find(row=>row.id===option.stacksFrom);state.stacks=effectSetting(p,scope,parent).stacks;}if(state.enabled){if(option.exclusiveGroup){if(exclusive.has(option.exclusiveGroup))continue;exclusive.add(option.exclusiveGroup);}if(Number(weapon?.id)===15304&&option.id==='far'&&effectSetting(p,scope,{id:'close',max:1}).enabled)continue;if(Number(weapon?.id)===14402&&melodyApplied)continue;merge(out,resolvedEffectBonuses(option,state.stacks));melodyApplied=true;}
 }
 const requires={12514:['nightsoul','brilliance'],13512:['bond30','bond'],14509:['full','kagura']};
 const dependency=requires[Number(weapon?.id)];
 if(dependency){
  const options=weaponEffectOptions(weapon,p.weaponRefinement),child=options.find(row=>row.id===dependency[0]),parent=options.find(row=>row.id===dependency[1]);
  const parentState=effectSetting(p,scope,parent),childState=effectSetting(p,scope,child);
  if(childState.enabled&&(!parentState.enabled||(Number(weapon.id)===14509&&parentState.stacks<3)))merge(out,child.bonuses,-1);
 }
 const custom=p.customEffects?.[scope];
 for(const bonus of [custom,...(custom?.additional||[])]) {
  if(bonus?.enabled&&bonus.type&&Number.isFinite(Number(bonus.value)))
   merge(out,{[bonus.type]:Number(bonus.value)});
 }
 const native=p.nativeElementKey||p.elementKey;
 if(['pyro','hydro','cryo','electro','anemo','geo','dendro'].includes(native)){
  for(const suffix of ['','FromHp','FromHpCap'])if(Object.hasOwn(out,'nativeDmg'+suffix)){out[native+'Dmg'+suffix]=(out[native+'Dmg'+suffix]||0)+out['nativeDmg'+suffix];}
 }
 for(const key of ['nativeDmg','nativeDmgFromHp','nativeDmgFromHpCap'])delete out[key];
 return out;
}
export function attackCritStats(stats={},bonuses={},kind='skill',reaction=null){
 const special=['lunarDirect','stellarDirect','multiReaction'].includes(reaction?.kind);
 return {...stats,critRate:(Number(stats.critRate)||0)+(special?0:Number(bonuses[kind+'CritRate'])||0),critDmg:(Number(stats.critDmg)||0)+(special?Number(bonuses[reaction.id+'CritDmg'])||0:Number(bonuses[kind+'CritDmg'])||0)};
}
export function typedFlatDamage(bonuses,kind='skill',stats={}){
 return ['atk','hp','def','em'].reduce((sum,key)=>sum+(Number(stats[key])||0)*(Number(bonuses?.[kind+'FlatFrom'+key[0].toUpperCase()+key.slice(1)])||0)/100,0);
}
export function typedAttackBonus(bonuses,kind='skill',stats={}) {
 const flat=Number(bonuses?.[kind+'Dmg'])||0;
 const energy=kind==='burst'?Math.min(75,Number(stats.er||0)*Number(bonuses?.burstErScaling||0)):0;
 const hp=Math.min(Number(bonuses?.[kind+'DmgFromHpCap']??Infinity),(Number(stats.hp)||0)*(Number(bonuses?.[kind+'DmgFromHp'])||0));
 return flat+energy+hp;
}

export function snapshotWeaponStats(snapshot,weapon,level=90,ascended=true) {
 const entry=snapshot?.weapons?.[String(weapon?.id)];
 if(!entry){const row=catalogLevelRow(weapon,level,ascended);return row&&Number.isFinite(Number(row.attack))?{atk:Number(row.attack),specialized:row.specialized,secondaryType:namedStatKey(row.specializedType),source:'Catalogue de niveaux'}:null;}
 if(!Number.isInteger(level)||level<1||level>90||(Number(weapon.rarity)<3&&level>70))return null;
 const factor=snapshot.weaponCurves?.[entry.mainStat.curve]?.[level];
 if(!Number.isFinite(factor))return null;
 const rank=Math.min(entry.ascensionBonus.atk.length-1,6,[20,40,50,60,70,80].filter(bound=>ascended?level>=bound:level>bound).length);
 const atk=entry.mainStat.base*factor+(entry.ascensionBonus.atk?.[rank]||0);
 const sub=entry.subStat;
 const specialized=sub?sub.base*snapshot.weaponCurves?.[sub.curve]?.[level]:null;
 if(weapon.mainStatType&&(!sub||!Number.isFinite(specialized)))return null;
 return {atk,specialized,source:entry.source};
}

export function kitEffectDescriptions(details, constellation, weapon, refinement, set, pieces = 4) {
 const characterEffects = [...(details?.skillTalents || []).map((row,index)=>({...row,kind:'talent',sourceIndex:index})), ...(details?.passives || []).map((row,index)=>({...row,kind:'passive',sourceIndex:index}))]
  .map(row => ({name:row.name, description:row.description || row.desc,kind:row.kind,sourceIndex:row.sourceIndex}));
 const constellations = (details?.constellations || []).map((row,index) => ({
  kind:'constellation',name:'C' + (index + 1) + ' · ' + String(row.name||'').replace(/^(?:C|Constellation )\d+\s*·\s*/i,''),
  description:row.description || row.desc,
  locked:index >= Number(constellation || 0)
 }));
 const rank = Math.max(1, Math.min(5, Number(refinement) || 1));
 const weaponEffects = weapon ? [{
  kind:'weapon',name:(weapon.effectName || weapon._name) + ' · R' + rank,
  description:weapon['r' + rank]?.description || weapon.passiveDesc || weapon.effectDescription
 }] : [];
 const setEffects = set ? [
  {kind:'set',sourceId:String(set.id),pieces:2,name:set._name + ' · 2 pièces', description:set.effect2Pc||set.twoPieceBonus||set['2pc']},
  {kind:'set',sourceId:String(set.id),pieces:4,name:set._name + ' · 4 pièces', description:set.effect4Pc||set.fourPieceBonus||set['4pc'], locked:Number(pieces) < 4}
 ] : [];
 return [...characterEffects.filter(row=>row.kind==='talent'), ...constellations, ...characterEffects.filter(row=>row.kind==='passive'), ...weaponEffects, ...setEffects].filter(row => row.description);
}
