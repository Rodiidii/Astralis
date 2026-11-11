import { skillValuesAtLevel } from './character-content.js?v=20261109-rich-text-1';

export const LAB_REACTIONS=[
  ['none','None','none'],['vaporize','Vaporize','amplifying'],['melt','Melt','amplifying'],
  ['aggravate','Aggravate','additive'],['spread','Spread','additive'],
  ['overload','Overloaded','transformative'],['superconduct','Superconduct','transformative'],
  ['electroCharged','Electro-Charged','transformative'],['shatter','Shatter','transformative'],
  ['swirl','Swirl','transformative'],['bloom','Bloom','transformative'],['hyperbloom','Hyperbloom','transformative'],
  ['burgeon','Burgeon','transformative'],['burning','Burning','transformative'],
  ['lunarCharged','Lunar-Charged','special'],['lunarBloom','Lunar-Bloom','special'],
  ['lunarCrystallize','Lunar-Crystallize','special'],['stellarConduct','Stellar-Conduct','special'],
  ['stellarSwirl','Stellar Swirl','special'],['transformative','Other transformative reaction','transformative'],
];

export function talentValueRows(skill,level=10,fallback=[]) {
  const attributes=skill?.attributes;
  const parameters=attributes?.parameters;
  if(!parameters||!attributes?.labels)return skillValuesAtLevel(skill,fallback,level);
  return attributes.labels.map(label=>{
    const [name,...parts]=String(label).split('|');
    const value=parts.join('|').replace(/\{(param\d+)(?::([^}]+))?\}/g,(token,key,format='')=>{
      const table=parameters[key];
      const raw=Array.isArray(table)?table[level-1]:table?.[level]??table;
      if(!Number.isFinite(Number(raw)))return 'TODO_DATA';
      const percentage=format.includes('P');
      const number=Number(raw)*(percentage?100:1);
      return Number(number.toFixed(3))+(percentage?'%':'');
    });
    return name+' · Niv. '+level+' : '+value;
  });
}

export function parseActionValue(value) {
  const colon=String(value).lastIndexOf(':');
  const text=(colon>=0?String(value).slice(colon+1):String(value)).trim().replace(/,/g,'.');
  if(!text||/TODO_DATA|\/|per|par point|stack|cumul/i.test(text))return null;
  const pieces=text.split(/\s*\+\s*/);
  const components=[];
  let baseStat;
  for(const piece of pieces){
    const match=piece.trim().match(/^(\d+(?:\.\d+)?)\s*%(?:\s*(ATK|ATQ|HP|PV|DEF|DÉF))?\s*(?:[×x*]\s*(\d+))?$/i);
    if(!match)return null;
    const type=match[2]?(/HP|PV/i.test(match[2])?'hp':/DEF|DÉF/i.test(match[2])?'def':'atk'):null;
    if(type&&baseStat&&type!==baseStat)return null;
    baseStat=type||baseStat;
    components.push({talentMultiplier:Number(match[1])/100,count:Number(match[3]||1)});
  }
  if(components.some(part=>part.count<1||part.count>100))return null;
  return {components,baseStat,hitCount:components.reduce((sum,part)=>sum+part.count,0)};
}

export function snapshotCharacterStats(snapshot,id,level=90,ascended=true) {
  const entry=snapshot?.characters?.[String(id)];
  if(!entry)return null;
  const rank=Math.min(6,[20,40,50,60,70,80].filter(bound=>ascended?level>=bound:level>bound).length);
  const base={hp:0,atk:0,def:0,em:0,critRate:5,critDmg:50,er:100,dmgBonus:0};
  const bonuses={};
  for(const curve of entry.curves){
    const factor=snapshot.curves[curve.curve]?.[level];
    if(!Number.isFinite(factor))return null;
    base[curve.key]=curve.base*factor+(entry.ascensionBonus[curve.key]?.[rank]||0);
  }
  const aliases={critDMG_:'critDmg',critRate_:'critRate',eleMas:'em',enerRech_:'er',hp_:'hpPct',atk_:'atkPct',def_:'defPct',heal_:'healing'};
  for(const [key,values]of Object.entries(entry.ascensionBonus)){
    if(['hp','atk','def'].includes(key))continue;
    const type=aliases[key]||key.replace('_dmg_','Dmg');
    const value=(values[rank]||0)*(key.endsWith('_')?100:1);
    if(Object.hasOwn(base,type))base[type]+=value;else bonuses[type]=value;
  }
  return {base,bonuses,source:entry.source};
}


export const LAB_BUFF_TYPES=[
  ['atkPct','ATQ %'],['atkFlat','ATQ fixe'],['hpPct','PV %'],['hpFlat','PV fixes'],
  ['defPct','DÉF %'],['defFlat','DÉF fixe'],['em','Maîtrise élémentaire'],['er','Recharge %'],
  ['critRate','CRIT Rate %'],['critDmg','CRIT DMG %'],['dmgBonus','Tous les dégâts %'],
  ['pyroDmg','Pyro DMG %'],['hydroDmg','Hydro DMG %'],['cryoDmg','Cryo DMG %'],
  ['electroDmg','Electro DMG %'],['anemoDmg','Anemo DMG %'],['geoDmg','Geo DMG %'],['dendroDmg','Dendro DMG %'],
  ['normalDmg','Normal Attack DMG %'],['chargedDmg','Charged Attack DMG %'],['plungeDmg','Plunging Attack DMG %'],['skillDmg','Skill DMG %'],['burstDmg','Burst DMG %'],
  ['resReduction','Réduction de RES %'],['defReduction','Réduction de DEF %'],['defIgnore','DEF ignorée %'],['physicalDmg','Physical DMG %'],['flatDamage','Dégâts ajoutés au coup'],
];

export function activeBuffBonuses(p,elapsed=0) {
  const out={};
  for(const buff of p.buffs||[]){
    if(buff.active===false||(Number(buff.duration)>0&&elapsed>=Number(buff.duration)))continue;
    if(buff.position&&buff.position!=='any'&&buff.position!==(p.fightPosition||'on'))continue;
    const sourcePosition=buff.sourceCharacter?String(buff.sourceCharacter)===String(p.character)?(p.fightPosition||'on'):(p.allies||[]).find(ally=>String(ally.character)===String(buff.sourceCharacter))?.position||buff.sourcePosition||'off':buff.sourcePosition||'off';
    if(buff.sourceCondition && buff.sourceCondition!=='any' && buff.sourceCondition!==sourcePosition)continue;
    const scaling=Number(buff.sourceStat||0)*Number(buff.sourcePercent||0)/100;
    const amount=(Number(buff.value||0)+scaling)*Math.max(1,Math.min(100,Number(buff.stacks)||1));
    const maximum=buff.maximum===''||buff.maximum==null?null:Number(buff.maximum);
    const value=Number.isFinite(maximum)&&maximum!==null?Math.min(amount,maximum):amount;
    if(!Number.isFinite(value))continue;
    out[buff.type]=(out[buff.type]||0)+value;
  }
  return out;
}
