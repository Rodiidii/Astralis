const types={hpPct:'FIGHT_PROP_HP_PERCENT',atkPct:'FIGHT_PROP_ATTACK_PERCENT',defPct:'FIGHT_PROP_DEFENSE_PERCENT',critRate:'FIGHT_PROP_CRITICAL',critDmg:'FIGHT_PROP_CRITICAL_HURT',er:'FIGHT_PROP_CHARGE_EFFICIENCY',em:'FIGHT_PROP_ELEMENT_MASTERY',physicalDmg:'FIGHT_PROP_PHYSICAL_ADD_HURT',healing:'FIGHT_PROP_HEAL_ADD'};
export function namedStatKey(name){
 const field=Object.entries(types).find(([,type])=>type===name)?.[0];if(field)return field;
 const key=String(name).toUpperCase().replace(/[ _%-]/g,'');
 return ({HP:'hpPct',ATK:'atkPct',DEF:'defPct',CRITRATE:'critRate',CRITDMG:'critDmg',ENERGYRECHARGE:'er',ELEMENTALMASTERY:'em',EM:'em',PHYSICALDMGBONUS:'physicalDmg',HEALINGBONUS:'healing'})[key]||(['pyro','hydro','cryo','electro','anemo','geo','dendro'].find(ele=>key.startsWith(ele.toUpperCase()))?.concat('Dmg'));
}
export function levelRowBonuses(row={}){
 row||={};
 const baseFields=new Set(['hp','atk','def','attack','defense','em','elementalMastery','critRate','critDmg','er','healing']);
 return Object.fromEntries(Object.entries(row).filter(([key,value])=>!baseFields.has(key)&&namedStatKey(key)&&Number.isFinite(Number(value))).map(([key,value])=>[namedStatKey(key),Number(value)]));
}
export function normalizeGiLevelRow(row={}){
 row||={};
 const bonuses=levelRowBonuses(row),entry=Object.entries(bonuses)[0];
 return {...row,hp:row.hp??row.baseHP,attack:row.attack??row.atk??row.baseATK,defense:row.defense??row.def??row.baseDEF,bonuses,...(entry?{specializedType:types[entry[0]]||'FIGHT_PROP_'+entry[0].replace('Dmg','').toUpperCase()+'_ADD_HURT',specialized:Number(entry[1])/(entry[0]==='em'?1:100)}:{})};
}
export function catalogLevelRow(item={},level=90,ascended=true){
 const source=item.levelStats?.stats||item.levelStats||item.statsAtMilestones||item.stats;
 let rows=Array.isArray(source)?source.filter(row=>Number(row.level)===Number(level)):source?[source[String(level)+(ascended?'+':'')]||source[String(level)]].filter(Boolean):[];
 if(rows.length){rows=rows.slice().sort((a,b)=>Number(a.ascension||0)-Number(b.ascension||0));return normalizeGiLevelRow(ascended?rows.at(-1):rows[0]);}
 if(Number(level)===90&&item.ascensionStats)return normalizeGiLevelRow(item.ascensionStats);
 return null;
}
