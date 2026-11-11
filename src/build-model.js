import { artifactStatKey, ARTIFACT_SLOTS, statVector } from './artifact-model.js?v=20261110-builds-3';

export function normalizeEnkaArtifact(item,index=0) {
  const flat=item?.flat||{};
  const raw=flat.reliquaryMainstat||{};
  // The numeric mainPropId in reliquary is an internal configuration ID.
  const type=[raw.mainPropId,raw.mainPropID,raw.appendPropId,raw.appendPropID,item?.reliquary?.mainPropId]
    .map(artifactStatKey).find(key=>typeof key==='string'&&!/^\d+$/.test(key))||'';
  const substats=(flat.reliquarySubstats||[]).map(row=>({
    type:artifactStatKey(row.appendPropId??row.appendPropID??row.statType),
    value:row.statValue??row.propValue,
  })).filter(row=>row.type&&row.value!=null&&row.value!==''&&Number.isFinite(Number(row.value))).map(row=>({...row,value:Number(row.value)}));
  const slot={EQUIP_BRACER:'flower',EQUIP_NECKLACE:'plume',EQUIP_SHOES:'sands',EQUIP_RING:'goblet',EQUIP_DRESS:'circlet'}[flat.equipType]||ARTIFACT_SLOTS[index];
  const level=Number(item?.reliquary?.level);
  const rawMain=raw.statValue??raw.propValue,mainValue=rawMain==null||rawMain===''?NaN:Number(rawMain);
  const piece={
    slot,slotIndex:ARTIFACT_SLOTS.indexOf(slot),mainType:type,mainValue:Number.isFinite(mainValue)?mainValue:'',
    rarity:Number(flat.rankLevel)||5,level:Number.isFinite(level)?Math.max(0,level-1):'',
    substats,image:flat.icon?'https://enka.network/ui/'+flat.icon+'.png':'',source:'enka',
  };
  for(let i=0;i<4;i++){
    piece['sub'+i+'Type']=substats[i]?.type||'';
    piece['sub'+i+'Value']=substats[i]?.value??'';
  }
  return piece;
}

export function levelStatRow(data,level=90,ascended=true) {
  if(!data||!Number.isInteger(Number(level)))return null;
  const source=data.stats||data;
  let candidates;
  if(Array.isArray(source)){
    candidates=source.filter(row=>Number(row?.level)===Number(level));
  }else{
    const keyed=source[String(level)+(ascended?'+':'')]||source[String(level)];
    candidates=keyed?[keyed]:Object.values(source).filter(row=>Number(row?.level)===Number(level));
  }
  if(!candidates.length)return null;
  const ordered=candidates.slice().sort((a,b)=>Number(a.ascension??a.promoteLevel??0)-Number(b.ascension??b.promoteLevel??0));
  const row=ascended?ordered.at(-1):ordered[0];
  return {...row,hp:row.hp??row.baseHP,attack:row.attack??row.atk??row.baseATK,defense:row.defense??row.def??row.baseDEF};
}

export function pieceSubstats(piece={}) {
  // Editable fields have precedence over a source snapshot.
  if([0,1,2,3].some(i=>Object.hasOwn(piece,'sub'+i+'Type'))){
    return [0,1,2,3].map(i=>({type:piece['sub'+i+'Type'],value:piece['sub'+i+'Value']}))
      .filter(row=>row.type&&row.value!=null&&row.value!==''&&Number.isFinite(Number(row.value))).map(row=>({...row,value:Number(row.value)}));
  }
  return (piece.substats||[]).filter(row=>row.type&&row.value!=null&&row.value!==''&&Number.isFinite(Number(row.value))).map(row=>({...row,value:Number(row.value)}));
}

export function equippedStatVector(pieces=[]) {
  const stats={};
  for(const piece of pieces){
    if(!piece)continue;
    for(const [key,value] of Object.entries(statVector({...piece,substats:pieceSubstats(piece)}))){
      stats[key]=(stats[key]||0)+value;
    }
  }
  return stats;
}

export function enkaStatReference(avatar,pieces) {
  const props=avatar?.fightPropMap||{};
  const get=(key)=>Number.isFinite(Number(props[key]))?Number(props[key]):null;
  if([1,4,7].some(key=>!(get(key)>0)))return null;
  const gear=equippedStatVector(pieces);
  const base={hp:get(1),atk:get(4),def:get(7),em:(get(28)||0)-(gear.em||0),
    critRate:(get(20)||0)*100-(gear.critRate||0),critDmg:(get(22)||0)*100-(gear.critDmg||0),
    er:(get(23)||1)*100-(gear.er||0),dmgBonus:0,healing:(get(26)||0)*100-(gear.healing||0)};
  const bonuses={};
  for(const [key,flat,percent] of [['hp',2,3],['atk',5,6],['def',8,9]]){
    if(get(flat)!=null)bonuses[key+'Flat']=get(flat)-(gear[key+'Flat']||0);
    if(get(percent)!=null)bonuses[key+'Pct']=get(percent)*100-(gear[key+'Pct']||0);
  }
  for(const [element,prop] of [['pyro',40],['electro',41],['hydro',42],['dendro',43],['anemo',44],['geo',45],['cryo',46],['physical',30]]){
    base[element+'Dmg']=(get(prop)||0)*100-(gear[element+'Dmg']||0);
  }
  return {base,bonuses};
}


export function applyTeamStatBonuses(totals, bonuses = {}) {
  const result = {...totals};
  const bases = {hp:totals.base?.hp, atk:totals.baseAtk ?? totals.base?.atk,
    def:totals.base?.defense ?? totals.base?.def};
  for (const stat of ['hp','atk','def']) {
    result[stat] = Number(totals[stat] || 0) + Number(bases[stat] || 0) * Number(bonuses[stat] || 0) / 100 +
      Number(bonuses[stat + 'Flat'] || 0);
  }
  for (const [stat, key] of [['em','em'],['critRate','critRate'],['critDmg','critDmg'],['er','energy']]) {
    result[stat] = Number(totals[stat] || 0) + Number(bonuses[key] || 0);
  }
  result.dmgBonus = Number(totals.dmgBonus || 0) + Number(bonuses.dmg || 0) + Number(bonuses.elemental || 0);
  return result;
}

/** Values sent to both the team UI and its export; includes each applicable buff once. */
export function teamCombatStats(totals,buffs=[]){
 if(!totals)return null;
 const bonuses={};for(const row of buffs){if(row.active===false||!row.type||!Number.isFinite(Number(row.value)))continue;bonuses[row.type]=(bonuses[row.type]||0)+Number(row.value);}
 return applyTeamStatBonuses(totals,bonuses);
}

function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
/** An observed Enka total is valid only for the combat configuration it describes. */
export function enkaReferenceConfiguration(build={}){
 return JSON.stringify(canonical({character:String(build.character??''),weapon:String(build.weapon??''),
  level:Number(build.level)||90,weaponLevel:Number(build.weaponLevelValue)||90,ascended:build.ascended!==false,
  weaponAscended:build.weaponAscended!==false,refinement:Number(build.weaponRefinement)||1,
  constellation:String(build.constellation??'C0'),set:String(build.set??''),set2:String(build.set2??''),setMode:build.setMode||'four',
  sets:(build.pieces||[]).map(piece=>String(piece?.set??'')),gear:equippedStatVector(build.pieces||[]),conditions:build.tcSettings||{}}));
}
export function enkaReferenceValid(build={}){
 return !!build.enkaBaseStats&&['hp','atk','def'].every(key=>Number.isFinite(Number(build.enkaBaseStats[key]))&&Number(build.enkaBaseStats[key])>0)&&
  typeof build.enkaReference?.configuration==='string'&&build.enkaReference.configuration===enkaReferenceConfiguration(build);
}
