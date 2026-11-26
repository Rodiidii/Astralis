import {damageTypeInfo} from './lab-damage-types.js';
import {catalogLevelRow,namedStatKey} from './gi-level-stats.js';
import {normalizeLabEngine} from './lab-engine-normalize.js?v=20261120-radiance-3';
import {snapshotWeaponStats} from './lab-config.js';
let enginePromise;
export function loadWrEngine(){return enginePromise??=import('../public/lab-wr-engine.js?v=20261118-character-talent-buffs-6').then(normalizeLabEngine);}

const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
export function levelAscension(level=90,ascended=true,max=6){return Math.min(max,[20,40,50,60,70,80].filter(bound=>ascended?Number(level)>=bound:Number(level)>bound).length);}
function flatSheet(source){if(!source)return {};const {sheetData,...data}=source;return data;}
export function buildWrCharacterData(engine,{sourceId,character,localTarget,level=90,ascension,constellation=0,talent={auto:9,skill:9,burst:9},weapon,artifacts=[],conditionals={},sourceStats={},hitMode='avgHit',reaction='none',enemyLevel=100,enemyResistance=10,enemyDefenseReduction=0,enemyDefenseIgnore=0,bonusStats={}}){
 ascension=num(ascension,levelAscension(level));
 let localSheet;
 if(localTarget){
  const stats=localTarget.stats,sheet={charKey:engine.constant(character),charEle:engine.constant(localTarget.element),weaponType:engine.constant(localTarget.weaponType||'sword'),base:Object.fromEntries(['hp','atk','def'].map(key=>[key,engine.constant(num(stats[key]))])),premod:{eleMas:engine.constant(num(stats.em)),critRate_:engine.constant((num(stats.critRate,5)-5)/100),critDMG_:engine.constant((num(stats.critDmg,50)-50)/100),enerRech_:engine.constant((num(stats.er,100)-100)/100),all_dmg_:engine.constant(num(stats.dmgBonus)/100)},teamBuff:{tally:{[localTarget.element]:engine.constant(1),maxEleMas:engine.input.premod.eleMas}},display:{basic:Object.fromEntries(['hp','atk','def','eleMas','enerRech_','critRate_','critDMG_','all_dmg_',...['physical','anemo','geo','electro','dendro','hydro','pyro','cryo'].map(key=>key+'_dmg_')].map(key=>[key,engine.input.total[key]]))}};
  if(localTarget.bonuses)for(const [key,value]of Object.entries(localTarget.bonuses)){const field=wrStatKey(key);sheet.premod[field]=engine.sum(sheet.premod[field]||engine.constant(0),engine.constant(Number(value)/(field.endsWith('_')?100:1)));}
  localSheet=sheet;
 }
 const sourceKey=localTarget?character:engine.characters[character]?character:engine.getCharStat(character)?.key,source=engine.characters[sourceKey];let characterSheet=localSheet||flatSheet(source?.sheetData);if(!localSheet&&!source?.sheetData)throw new Error(`Fiche WR absente pour ${character}`);character=sourceKey;
 const sourcePaths={em:['eleMas',1],hp:['hp',1],atk:['atk',1],def:['def',1],er:['enerRech_',.01],baseAtk:['atk',1],critRate:['critRate_',.01],critDmg:['critDMG_',.01],dmgBonus:['all_dmg_',.01],healing:['heal_',.01]};
 const overrides=Object.entries(sourceStats).filter(([key,value])=>sourcePaths[key]&&value!==''&&value!=null&&Number.isFinite(Number(value))&&Number(value)>=0);
 if(overrides.length){const seen=new WeakMap();const copy=node=>{if(!node||typeof node!=='object')return node;if(seen.has(node))return seen.get(node);if(node.operation==='read'){const match=overrides.find(([key])=>node.path?.length===2&&node.path[1]===sourcePaths[key][0]&&(key==='baseAtk'?node.path[0]==='base':['premod','total'].includes(node.path[0])));if(match)return engine.constant(Number(match[1])*sourcePaths[match[0]][1]);}const out=Array.isArray(node)?[]:{};seen.set(node,out);for(const[key,value]of Object.entries(node))out[key]=copy(value);return out;};characterSheet=copy(characterSheet);}
 if(/^Traveler.+[MF]$/.test(character)&&conditionals[character])conditionals={...conditionals,[character.slice(0,-1)]:conditionals[character]};
 if(character==='Sucrose'&&conditionals.Sucrose){const values={...conditionals.Sucrose};for(const ele of ['pyro','hydro','cryo','electro'])if(values['swirl'+ele]==='on')values['swirl'+ele]=ele;conditionals={...conditionals,Sucrose:values};}
 if(character==='Furina'&&conditionals.Furina){const values={...conditionals.Furina};if(Number(values.burstFanfare)>(num(constellation)>=1?400:300))values.burstFanfare=String(num(constellation)>=1?400:300);conditionals={...conditionals,Furina:values};}
 // The pinned source applies Sigewinne C6 unconditionally. Its published text requires healing.
 if(sourceKey==='Sigewinne'){characterSheet.premod={...characterSheet.premod};for(const stat of ['burst_critRate_','burst_critDMG_']){const bonus=characterSheet.premod[stat];if(bonus)characterSheet.premod[stat]={operation:'match',operands:[engine.constant('on'),{operation:'read',operands:[],path:['conditional','Sigewinne','c6AfterHeal'],type:'string'},bonus,engine.constant(0)],emptyOn:'unmatch'};}}
 const char=engine.dataObjForCharacterNew({level:num(level,90),ascension:num(ascension,6),constellation:num(constellation),talent:{auto:num(talent.auto,9),skill:num(talent.skill,9),burst:num(talent.burst,9)},conditional:conditionals,customMultiTargets:[],bonusStats,enemyOverride:{enemyLevel:num(enemyLevel,100),enemyDefRed_:num(enemyDefenseReduction),enemyDefIgn_:num(enemyDefenseIgnore),...Object.fromEntries(['physical','anemo','cryo','dendro','electro','geo','hydro','pyro'].map(key=>[key+'_enemyRes_',num(enemyResistance)]))},hitMode:hitMode==='nonCrit'?'hit':hitMode,reaction},characterSheet);
 const artSlots=Object.fromEntries(['flower','plume','sands','goblet','circlet'].map(slot=>[slot,engine.constant(undefined)]));
 // dataObjForArtifact already contributes one artSet count per artifact.
 // Adding the aggregate count here double-counted every piece and activated
 // 2-piece/4-piece effects with too few artifacts.
 const artLayer={art:artSlots};
 if(weapon&&['HuntersBow','SeasonedHuntersBow','ApprenticesNotes','PocketGrimoire','OldMercsPal','WasterGreatsword','BeginnersProtector','IronPoint','DullBlade','SilverSword'].includes(weapon.key))weapon={...weapon,level:Math.min(70,num(weapon.level,70)),ascension:Math.min(4,num(weapon.ascension,levelAscension(weapon.level,true,4)))};
 const weaponSheet=weapon?.snapshotStats?{base:{atk:engine.constant(weapon.snapshotStats.atk)},premod:weapon.secondaryType?{[weapon.secondaryType]:engine.constant(weapon.snapshotStats.specialized||0)}:{},weapon:{key:engine.constant(weapon.key),type:engine.constant(weapon.type||'sword')}}:weapon?flatSheet(engine.weapons[weapon.key]?.sheetData):{},weaponData=weapon&&!weapon.snapshotStats?engine.dataObjForWeapon({id:'astralis',key:weapon.key,level:num(weapon.level,90),ascension:num(weapon.ascension,levelAscension(weapon.level)),refinement:num(weapon.refinement,1)}):{};
 const includedSets=new Set(),setData=engine.mergeData(artifacts.reduce((rows,a)=>{if(includedSets.has(a.setKey))return rows;includedSets.add(a.setKey);const data=flatSheet(engine.artifacts[a.setKey]?.sheetData);if(Object.keys(data).length)rows.push(data);return rows;},[]));
 const artRows=artifacts.map(a=>a.setOnly?{artSet:{[a.setKey]:engine.constant(1)}}:engine.dataObjForArtifact({id:String(a.id),slotKey:a.slot,setKey:a.setKey,rarity:num(a.rarity,5),level:num(a.level),mainStatKey:a.mainStatKey,substats:(a.substats||[]).map(s=>({key:s.key,accurateValue:num(s.value??s.accurateValue)}))}));
 const normalizedWeapon=weapon?weaponData:{};
 const ownData=[char,...(weapon?[normalizedWeapon]:[]),...artRows,artLayer,characterSheet,...(weapon?[weaponSheet]:[]),engine.common,engine.resonanceData,engine.reactionData,setData];
 return {sourceId,char,weapon:weaponData,artifacts:engine.mergeData([...artRows,artLayer]),sheets:engine.mergeData([characterSheet,weaponData,setData]),common:engine.common,resonance:engine.resonanceData,reactions:engine.reactionData,ownData,input:engine.input,character,receiptLayers:{kit:characterSheet,weapon:weapon?.snapshotStats?null:weaponSheet,artifacts:setData,resonance:engine.resonanceData}};
}

// Keep level/ascension, equipment main stats, talents and composition identical.
// Only remove the chosen source's effects to measure what each recipient receives.
export function evaluateWrBuffReceipts(engine,builds,current=evaluateWrTeam(engine,builds[0],builds.slice(1))){
 const findRead=(node,path,seen=new WeakSet())=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.join('.')===path)return node;for(const value of Object.values(node)){const found=findRead(value,path,seen);if(found)return found;}};
 const muted=(layer,kind)=>{
  const premod={};
  for(const [key,value]of Object.entries(layer.premod||{})){
   if(/^(?:auto|skill|burst)Boost$/.test(key)){premod[key]=value;continue;}
   const inherent=kind==='kit'?findRead(value,'special'):kind==='weapon'?findRead(value,'weapon.sub'):undefined;
   if(inherent)premod[key]=inherent;
  }
  const teamBuff={...layer.teamBuff,premod:{},total:{},nonStacking:Object.fromEntries(Object.entries(layer.teamBuff?.nonStacking||{}).filter(([key,node])=>key==='moonsignascend'||node.type==='string'))};
  const display={...layer.display,passive1:{},constellation6:{}};
  const copyBase=(node,seen=new WeakMap())=>{if(!node||typeof node!=='object')return node;if(seen.has(node))return seen.get(node);if(node.operation==='read'&&node.path?.[0]==='conditional')return engine.constant('off');const out=Array.isArray(node)?[]:{};seen.set(node,out);for(const [key,value]of Object.entries(node))out[key]=copyBase(value,seen);return out;};
  return {...layer,base:kind==='kit'?copyBase(layer.base):layer.base,premod,total:{},teamBuff,display};
 };
 const sources=builds.flatMap((build,index)=>['kit','weapon','artifacts'].filter(kind=>build.receiptLayers?.[kind]&&Object.keys(build.receiptLayers[kind]).length).map(kind=>({index,kind,owner:build.sourceId||build.character,key:build.character}))).concat({index:-1,kind:'resonance',owner:'resonance',key:'resonance'});
 const members=Object.fromEntries(Object.keys(current.members).map(key=>[key,[]])),enemy=[];
 for(const source of sources){
  const variants=builds.map((build,index)=>{
   if(source.index!==-1&&source.index!==index)return build;
   const layer=build.receiptLayers?.[source.kind];if(!layer)return build;
   return {...build,ownData:build.ownData.map(value=>value===layer?muted(layer,source.kind):value)};
  });
  const baseline=evaluateWrTeam(engine,variants[0],variants.slice(1));
  for(const [key,member]of Object.entries(current.members)){
   const effects=Object.entries(member.stats).flatMap(([stat,value])=>{const delta=value-baseline.members[key]?.stats?.[stat];return Number.isFinite(delta)&&Math.abs(delta)>.005&&stat!=='dmgAllBonus'?[{stat,value:delta}]:[];});
   if(effects.length)members[key].push({...source,effects});
  }
  const effects=Object.entries(current.enemyResistances).flatMap(([element,value])=>{const delta=(baseline.enemyResistances[element]-value)*100;return Number.isFinite(delta)&&Math.abs(delta)>.005?[{element,value:delta}]:[];});
  if(effects.length)enemy.push({...source,effects});
 }
 const composition=builds.filter(build=>build.character==='Xilonen').map(build=>{const converted=builds.filter(other=>other!==build).map(other=>other.receiptLayers?.kit?.charEle?.value??engine.characters[other.character]?.sheetData.charEle?.value).filter(ele=>['pyro','hydro','cryo','electro'].includes(ele));return {owner:build.sourceId||build.character,samples:[...converted,...Array(3-converted.length).fill('geo')],converted:converted.length};});
 return {members,enemy,composition};
}

export function evaluateWrDisplay(engine,build){
 const result=evaluateWrTeam(engine,build);
 return {uiData:result,display:result.display,stats:result.stats,bonusStats:result.bonusStats,input:build.input};
}

export function wrAttackOptions(engine,character,display,constellation=0,kit={}){
 const source=engine.characters[character];if(!source)return [];
 const findHit=(node,seen=new WeakSet())=>{if(!node||typeof node!=='object'||seen.has(node))return null;seen.add(node);if(node.data?.hit)return node.data.hit;for(const child of Object.values(node)){const found=findHit(child,seen);if(found)return found;}return null;};
 const categories={normal:'normal',charged:'charged',plunge:'plunging',skill:'skill',burst:'burst',passive:'passive',passive0:'passive0',passive1:'passive1',passive2:'passive2',passive3:'passive3',passive4:'passive4',lockedPassive:'lockedPassive',...Object.fromEntries(Array.from({length:6},(_,i)=>['constellation'+(i+1),'constellation'+(i+1)]))},rows=[];
 for(const [kind,key]of Object.entries(categories)){
  const constellationIndex=Number(kind.replace('constellation',''));if(constellationIndex&&constellation<constellationIndex)continue;
  const entries=source.sheetData?.display?.[key]||{},evaluated=display?.[key]||{};
  for(const [index,node]of Object.entries(entries)){
   const path=key+'.'+index,result=evaluated[index];if(!result||!Number.isFinite(Number(result.value))||Number(result.value)<=0)continue;if((!findHit(node)&&!damageTypeInfo(result.info).isReaction)||result.info?.variant==='heal'||result.info?.unit==='%'||/shield|heal|regen|inheritedHp/i.test(index))continue;let move=findHit(node)?.move?.value;if(!move){const matches=Object.entries(node?.data?.hit?.move?.table||{});move=matches.find(([name])=>name===String(index))?.[1]?.value;}const actualKind=move==='normal'||move==='charged'||move==='plunging_impact'||move==='plunging_collision'||move==='skill'||move==='burst'?move==='plunging_impact'||move==='plunging_collision'?'plunge':move:['normal','charged','plunge','skill','burst'].includes(kind)?kind:'skill',talentLabel=kind.startsWith('constellation')?'Constellation '+kind.slice(-1):`${kind==='normal'?'Attaque normale':kind==='charged'?'Attaque chargée':kind==='plunge'?'Attaque plongeante':kind==='skill'?'Compétence':kind==='burst'?'Déchaînement':kind} ${Number.isFinite(Number(index))?Number(index)+1:String(index).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/Dmg/gi,'DGT')}`,talentName=kit.talents?.[kind==='normal'||kind==='charged'||kind==='plunge'?'combat1':kind==='skill'?'combat2':kind==='burst'?'combat3':kind.startsWith('passive')||kind==='lockedPassive'?kind:'c'+kind.slice(-1)]?.name,label=node?.info?.name||node?.info?.description||(talentName?talentName+' · '+talentLabel:talentLabel);
   rows.push({id:'wr:'+path,wrPath:path,kind:actualKind,sourceTalent:kind,damageKind:actualKind,damageType:damageTypeInfo(result.info),label,text:label+(damageTypeInfo(result.info).isReaction?' · '+damageTypeInfo(result.info).label:''),parsed:{components:[{talentMultiplier:1,count:1}],hitCount:1,baseStat:'atk'},skill:{}});
  }
 }
 for(const kind of ['skill','burst'])if(!rows.some(row=>row.kind===kind))rows.push({id:'wr:utility.'+kind,wrPath:'utility.'+kind,kind,utility:true,label:kind==='skill'?'Activer la compétence · sans dégâts directs':'Activer le déchaînement · sans dégâts directs',text:kind==='skill'?'Activation de compétence (posture, infusion ou bonus)':'Activation du déchaînement (posture ou bonus)',parsed:{components:[],hitCount:0,baseStat:'atk'},skill:{}});
 return rows;
}

export function wrConditionControls(engine,character,weaponKey,artifactKeys,p={}){
 const groups=[['characters',character,'Personnage'],['weapons',weaponKey,'Arme'],...artifactKeys.map(key=>['artifacts',key,'Set'])],result=[];
 for(const [group,key,label]of groups){if(!key)continue;for(const path of engine.conditionalPaths?.[group]?.[key]||[]){const value=p.wrConditions?.[key]?.[path]||'off';result.push({id:key+'|'+path,key,path,label,value,options:wrConditionOptions(engine,group,key,path)});}}
 return result;
}
export function wrConditionOptions(engine,group,key,path){
 const sheet=engine[group]?.[key]?.sheetData,values=new Set(),lookupValues=new Set(),seen=new WeakSet();let elementSelector=false;
 // A guarded selector returns its value branches. Its predicates are other
 // controls and must not inherit the options of the guarded control.
 const readsConditional=(node,visited=new WeakSet())=>{if(!node||typeof node!=='object'||visited.has(node))return false;visited.add(node);if(node.operation==='read')return node.path?.join('.')===`conditional.${key}.${path}`;const values=['match','threshold'].includes(node.operation)?node.operands.slice(2):node.operation==='lookup'?Object.values(node.table||{}):[];return values.some(child=>readsConditional(child,visited));};
 const visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);const element=node.data?.hit?.ele;if(element?.operation==='read'&&element.path?.[0]==='conditional'&&element.path?.[1]===key&&element.path?.[2]===path)elementSelector=true;
  if(node.operation==='match'&&Array.isArray(node.operands)){const input=node.operands.slice(0,2).find(value=>readsConditional(value)),option=node.operands.find(value=>value!==input&&value?.operation==='const'&&typeof value.value==='string'&&value.value!=='off');if(input&&option)values.add(option.value);}
  if(node.operation==='lookup'&&readsConditional(node.operands?.[0]))for(const value of Object.keys(node.table||{}))if(value!=='off')lookupValues.add(value);
  for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);
 };
 visit(sheet);
 const generated=engine.conditionOptions(key,path),explicit=[...new Set([...lookupValues,...values])].sort((a,b)=>Number.isFinite(Number(a))&&Number.isFinite(Number(b))?Number(a)-Number(b):0);
 if(key==='Mitya'&&path==='coreType')return ['off','steady','overloaded'];
 return elementSelector?['off','hydro','pyro','cryo','electro']:explicit.length?['off',...explicit]:generated;
}
export function evaluateWrTeam(engine,activeBuild,teammates=[]){
 const builds=[activeBuild,...teammates.filter(build=>build.character!==activeBuild.character)],run=rows=>engine.uiDataForTeam(Object.fromEntries(rows.map(build=>[build.character,build.ownData])),'F',activeBuild.character);
 const hasSourceStats=builds.some(build=>{const seen=new WeakSet(),visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return false;seen.add(node);if(node.operation==='read'&&node.path?.[0]==='labSourceStat')return true;return Object.values(node).some(value=>value&&typeof value==='object'&&visit(value));};return build.ownData.some(layer=>visit(layer));});
 const resolveSourceStats=(rows,stats)=>rows.map(build=>{const seen=new WeakMap(),copy=node=>{if(!node||typeof node!=='object')return node;if(node.operation==='read'&&node.path?.[0]==='labSourceStat')return engine.constant(Number(stats[node.path[1]]?.[node.path[2]])||0);if(seen.has(node))return seen.get(node);const out=Array.isArray(node)?[]:{};seen.set(node,out);for(const[key,value]of Object.entries(node))out[key]=copy(value);return out;};return {...build,ownData:build.ownData.map(copy)};});
 let evalBuilds=builds,evaluated;
 if(hasSourceStats){
  const basePass=run(resolveSourceStats(builds,{})),baseStats=Object.fromEntries(builds.map(build=>[build.character,{baseAtk:Number(basePass[build.character]?.target?.get(engine.input.base.atk)?.value)||0}]));
  const atkPass=run(resolveSourceStats(builds,baseStats)),atkStats=Object.fromEntries(builds.map(build=>[build.character,{...baseStats[build.character],atk:Number(atkPass[build.character]?.target?.get(engine.input.total.atk)?.value)||0}]));
  evalBuilds=resolveSourceStats(builds,atkStats);evaluated=run(evalBuilds);
 }else evaluated=run(builds);
 const calc=evaluated[activeBuild.character]?.target;
 if(!calc)throw new Error('Évaluation de l’équipe indisponible.');
 const walk=(value,seen=new WeakSet())=>{
  if(value?.operation===true||value?.meta?.ops)return {value:value.value,info:value.info};
  if(!value||typeof value!=='object'||seen.has(value))return undefined;
  seen.add(value);const out={};for(const [key,child]of Object.entries(value)){const next=walk(child,seen);if(next!==undefined)out[key]=next;}return out;
 };
 const members=Object.fromEntries(builds.map(build=>{const target=evaluated[build.character]?.target;if(!target)return [String(build.sourceId||build.character),{}];const display=walk(target.getDisplay());return [String(build.sourceId||build.character),{stats:{...wrPlainStats(display),dmgBonus:Number(target.get(engine.input.total.all_dmg_)?.value||0)*100,dmgAllBonus:Number(target.get(engine.input.total.all_dmg_)?.value||0)*100,...Object.fromEntries(Object.entries({electroChargedDmg:'electrocharged_dmg_',geoCritRate:'geo_critRate_',geoFlatDamage:'geo_dmgInc',hydroFlatDamage:'hydro_dmgInc',swirlCritRate:'swirl_critRate_',swirlCritDmg:'swirl_critDMG_',swirlFlatDamage:'swirl_dmgInc',vaporizeDmg:'vaporize_dmg_',meltDmg:'melt_dmg_',plungeImpactFlatDamage:'plunging_impact_dmgInc',normalCritRate:'normal_critRate_',normalCritDmg:'normal_critDMG_',chargedCritDmg:'charged_critDMG_',plungeCritRate:'plunging_critRate_',plungeCritDmg:'plunging_critDMG_',burstCritRate:'burst_critRate_',burstCritDmg:'burst_critDMG_',pyroResistance:'pyro_res_',hydroResistance:'hydro_res_',cryoResistance:'cryo_res_',electroResistance:'electro_res_',anemoResistance:'anemo_res_',geoResistance:'geo_res_',dendroResistance:'dendro_res_',physicalResistance:'physical_res_',geoCritDmg:'geo_critDMG_',chargedCritRate:'charged_critRate_',skillCritRate:'skill_critRate_',skillCritDmg:'skill_critDMG_',staminaReduction:'staminaDec_',physicalCritDmg:'physical_critDMG_',anemoCritDmg:'anemo_critDMG_',anemoFlatDamage:'anemo_dmgInc',normalElementalDmg:'normalEle_dmg_',bloomDmg:'bloom_dmg_',burningDmg:'burning_dmg_',burgeonDmg:'burgeon_dmg_',hyperbloomDmg:'hyperbloom_dmg_',aggravateDmg:'aggravate_dmg_',spreadDmg:'spread_dmg_',lunarbloomDmg:'lunarbloom_dmg_',superconductDmg:'superconduct_dmg_',stellarconductDmg:'stellarconduct_dmg_',swirlDmg:'swirl_dmg_',stellarswirlDmg:'stellarswirl_dmg_',movementSpeed:'moveSPD_',chargedStamina:'staminaChargedDec_',normalTalentBonus:'autoBoost',healing:'heal_',incomingHealing:'incHeal_',damageReduction:'dmgRed_',attackSpeed:'atkSPD_',normalDmg:'normal_dmg_',chargedDmg:'charged_dmg_',plungeDmg:'plunging_dmg_',skillDmg:'skill_dmg_',burstDmg:'burst_dmg_',normalFlatDamage:'normal_dmgInc',chargedFlatDamage:'charged_dmgInc',plungeFlatDamage:'plunging_dmgInc',skillFlatDamage:'skill_dmgInc',burstFlatDamage:'burst_dmgInc',cryoFlatDamage:'cryo_dmgInc',electroCritDmg:'electro_critDMG_',cryoCritDmg:'cryo_critDMG_',physicalDmg:'physical_dmg_',pyroDmg:'pyro_dmg_',hydroDmg:'hydro_dmg_',cryoDmg:'cryo_dmg_',electroDmg:'electro_dmg_',anemoDmg:'anemo_dmg_',geoDmg:'geo_dmg_',dendroDmg:'dendro_dmg_'}).map(([key,field])=>[key,Number(target.get(engine.input.total[field])?.value||0)*(key.endsWith('FlatDamage')||key==='normalTalentBonus'?1:100)])),chargedAttackBonus:num(display.constellation6?.chargedAtk?.value),electroNormalFlatDamage:num(display.passive1?.a1Reactions_normal_dmgInc?.value),...Object.fromEntries(['lunarcharged','lunarbloom','lunarcrystallize','stellarconduct','stellarswirl'].flatMap(reaction=>[['Dmg','_dmg_',100],['BaseBonus','_baseDmg_',100],['Elevation','_specialDmg_',100],['CritRate','_critRate_',100],['CritDmg','_critDMG_',100],['FlatDamage','_dmgInc',1]].map(([suffix,field,scale])=>[reaction+suffix,num(target.get(engine.input.total[reaction+field])?.value)*scale]))),hydroCritDmg:num(target.get(engine.input.total.hydro_critDMG_)?.value)*100,dendroCritDmg:num(target.get(engine.input.total.dendro_critDMG_)?.value)*100,energyRestored:num(target.get(engine.input.nonStacking.xilonenElectroEnergy)?.value),burstCooldownReduction:num(target.get(engine.input.nonStacking.xilonenElectroBurstCooldown)?.value),enemyAnemoDamageReduction:num(target.get(engine.input.nonStacking.vodyAnemoEnemyDamageReduction)?.value)*100,cryoSwirlDmg:(num(target.get(engine.input.nonStacking.dionaCryoSwirl)?.value)+num(target.get(engine.input.nonStacking.qiqiCryoSwirl)?.value))*100,enemyAttackReduction:(num(target.get(engine.input.nonStacking.dionaEnemyAttackReduction)?.value)+num(target.get(engine.input.nonStacking.qiqiEnemyAttackReduction)?.value))*100,shieldStrength:Number(target.get(engine.input.total.shield_)?.value||0)*100,defReduction:Number(target.get(engine.input.premod.enemyDefRed_)?.value||0)*100,defIgnore:Number(target.get(engine.input.premod.enemyDefIgn_)?.value||0)*100},baseAtk:Number(target.get(engine.input.base.atk)?.value)}];}));
 const enemyResistances=Object.fromEntries(['physical','anemo','cryo','dendro','electro','geo','hydro','pyro'].map(element=>[element,Number(calc.get(engine.input.premod?.[element+'_enemyRes_'])?.value)]));
 return {display:walk(calc.getDisplay()),stats:calc.getCharacterStats(),bonusStats:calc.getBonusStats(),members,enemyResistances};
}
export function resolveWrCharacterKey(engine,character,aliases={}){
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 if(['10000005','10000007','aether','lumine'].includes(String(character?.id||character?._id))){
  const raw=String(character?.elementKey||character?.elementText||character?.elementType||'anemo').replace(/^ELEMENT_/,'').toLowerCase(),element=({'anémo':'anemo','électro':'electro','géo':'geo'})[raw]||raw;
  const key='Traveler'+(element==='none'||element==='aucun'?'Anemo':element.charAt(0).toUpperCase()+element.slice(1))+(String(character?.id||character?._id)==='10000007'||character?._id==='lumine'?'F':'M');if(engine.characters[key])return key;
 }
 const row=aliases.characters?.find(row=>String(row.id)===String(character?.id||character?._id));
 const names=[character?.name,character?._name,character?._id,...(row?.en||[])].filter(Boolean).map(normalize);
 return Object.keys(engine.characters).find(key=>names.includes(normalize(key)));
}
export function wrSavedConditions(engine,key,saved={},constellation=0){
 const out={};for(const path of engine.conditionalPaths.characters[key]||[]){
  const allowed=wrConditionOptions(engine,'characters',key,path);let value=String(saved[key]?.[path]??'off');if(key==='Furina'&&path==='burstFanfare'&&Number(constellation)<1&&Number(value)>300)value='300';out[path]=allowed.includes(value)?value:'off';
 }
 return {[key]:out};
}

export function wrStatKey(key){
 return ({dmgBonus:'all_dmg_',normalDmg:'normal_dmg_',chargedDmg:'charged_dmg_',plungeDmg:'plunging_dmg_',skillDmg:'skill_dmg_',burstDmg:'burst_dmg_',normalFlatDamage:'normal_dmgInc',chargedFlatDamage:'charged_dmgInc',skillFlatDamage:'skill_dmgInc',burstFlatDamage:'burst_dmgInc',shieldStrength:'shield_',incomingHealing:'incHeal_',damageReduction:'dmgRed_',attackSpeed:'atkSPD_',hpFlat:'hp',atkFlat:'atk',defFlat:'def',hpPct:'hp_',atkPct:'atk_',defPct:'def_',em:'eleMas',er:'enerRech_',critRate:'critRate_',critDmg:'critDMG_',electroChargedDmg:'electrocharged_dmg_',geoCritRate:'geo_critRate_',geoFlatDamage:'geo_dmgInc',hydroFlatDamage:'hydro_dmgInc',swirlCritRate:'swirl_critRate_',swirlCritDmg:'swirl_critDMG_',swirlFlatDamage:'swirl_dmgInc',vaporizeDmg:'vaporize_dmg_',meltDmg:'melt_dmg_',plungeImpactFlatDamage:'plunging_impact_dmgInc',normalCritRate:'normal_critRate_',normalCritDmg:'normal_critDMG_',chargedCritDmg:'charged_critDMG_',plungeCritRate:'plunging_critRate_',plungeCritDmg:'plunging_critDMG_',burstCritRate:'burst_critRate_',burstCritDmg:'burst_critDMG_',pyroResistance:'pyro_res_',hydroResistance:'hydro_res_',cryoResistance:'cryo_res_',electroResistance:'electro_res_',anemoResistance:'anemo_res_',geoResistance:'geo_res_',dendroResistance:'dendro_res_',physicalResistance:'physical_res_',geoCritDmg:'geo_critDMG_',chargedCritRate:'charged_critRate_',skillCritRate:'skill_critRate_',skillCritDmg:'skill_critDMG_',staminaReduction:'staminaDec_',physicalCritDmg:'physical_critDMG_',anemoCritDmg:'anemo_critDMG_',anemoFlatDamage:'anemo_dmgInc',normalElementalDmg:'normalEle_dmg_',bloomDmg:'bloom_dmg_',burningDmg:'burning_dmg_',burgeonDmg:'burgeon_dmg_',hyperbloomDmg:'hyperbloom_dmg_',aggravateDmg:'aggravate_dmg_',spreadDmg:'spread_dmg_',lunarbloomDmg:'lunarbloom_dmg_',superconductDmg:'superconduct_dmg_',stellarconductDmg:'stellarconduct_dmg_',swirlDmg:'swirl_dmg_',stellarswirlDmg:'stellarswirl_dmg_',movementSpeed:'moveSPD_',chargedStamina:'staminaChargedDec_',normalTalentBonus:'autoBoost',healing:'heal_',physicalDmg:'physical_dmg_'})[key]||(/^(pyro|hydro|cryo|electro|anemo|geo|dendro)Dmg$/.test(key)?key.replace('Dmg','_dmg_'):key);
}
export function wrPlainStats(display){
 const basic=display?.basic||{},get=key=>Number(basic[key]?.value)||0;
 return {hp:get('hp'),atk:get('atk'),def:get('def'),em:get('eleMas'),er:get('enerRech_')*100,critRate:get('critRate_')*100,critDmg:get('critDMG_')*100,dmgBonus:get('dmg_')*100,...Object.fromEntries(['pyro','hydro','cryo','electro','anemo','geo','dendro','physical'].map(element=>[element+'Dmg',get(element+'_dmg_')*100]))};
}
const referenceStatsCache=new Map();
export function sourceScenario(engine,p,{characters=[],weapons=[],sets=[],aliases={},equipped=[],builds=[],sourceSnapshot={},combatBonuses={}}={}){
 const normalize=value=>String(value||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 const resolveEquipment=(catalog,item,group)=>{
  const alias=aliases[group]?.find(row=>String(row.id)===String(item?.id||item?._id));
  const names=[item?._id,item?.name,item?._name,...(alias?.en||[])].filter(Boolean).map(normalize);
  return Object.keys(catalog).find(key=>names.includes(normalize(key)));
 };
 const setKeys={};for(const set of sets){const key=resolveEquipment(engine.artifacts,set,'artifacts');if(key)for(const alias of [set._id,set._labKey,set.id,...(set._labAliases||[])].filter(Boolean))setKeys[String(alias)]=key;}
 const mapArtifact=piece=>({id:String(piece.id),slot:piece.slot,setKey:setKeys[String(piece.setKey||piece.set)]||'__unassigned__',setOnly:!!piece.setOnly,rarity:Number(piece.rarity)||5,level:Number(piece.level)||0,mainStatKey:wrStatKey(piece.mainType),substats:(piece.substats||[]).map(stat=>({key:wrStatKey(stat.type),value:Number(stat.value)||0}))});
 const member=(state,own)=>{
  const character=characters.find(character=>[character._id,character.id].map(String).includes(String(state.character)));let key=resolveWrCharacterKey(engine,{...character,elementKey:state.elementKey||character?.elementKey},aliases);
  let localTarget;
  if(!key&&own){
   const level=Number(state.level)||90,profile=state.referenceBaseProfile;
   const valid=profile&&String(profile.character)===String(character?.id||state.character)&&Number(profile.level)===level;
   const row=catalogLevelRow(character,level,state.ascended!==false),base=valid?profile.base:row&&{hp:Number(row.hp),atk:Number(row.attack),def:Number(row.defense)};
   const realBase=base&&['hp','atk','def'].every(stat=>Number.isFinite(base[stat]));
   const type=String(character?.weaponType||'sword').replace(/^WEAPON_/,'').toLowerCase();
   localTarget={base:realBase?base:undefined,element:String(character?.elementType||character?.element||state.elementKey||'physical').replace(/^ELEMENT_/,'').toLowerCase(),weaponType:({sword_one_hand:'sword',claymore:'claymore',sword_two_hand:'claymore',pole:'polearm'})[type]||type,bonuses:realBase?(valid?profile.bonuses:row.bonuses)||{}:{},stats:realBase?{...base,em:0,critRate:5,critDmg:50,er:100,dmgBonus:0}:{hp:num(state.hp),atk:num(state.atk),def:num(state.def),em:num(state.em),critRate:num(state.critRate),critDmg:num(state.critDmg),er:num(state.er,100),dmgBonus:num(state.bonus)}};
   key='AstralisLocalTarget';
  }
  if(!key)return null;
  const build=builds.find(build=>String(build.id)===String(state.build)),weaponId=own?(p.weaponOverride??build?.weapon??''):(state.weapon||build?.weapon);
  const weapon=weapons.find(weapon=>[weapon._id,weapon.id].map(String).includes(String(weaponId))),weaponKey=resolveEquipment(engine.weapons,weapon,'weapons');
  const weaponLevel=Math.min(Number(weapon?.rarity)<3?70:90,Number(own?p.weaponLevel:state.weaponLevel)||90);
  let fallbackStats=weapon&&!weaponKey?snapshotWeaponStats(sourceSnapshot,weapon,weaponLevel,state.weaponAscended!==false):null;
  if(weapon&&!weaponKey&&!fallbackStats){const saved=state.referenceWeaponProfile,profile=saved&&String(saved.id)===String(weapon.id||weapon._id)&&Number(saved.level)===weaponLevel?saved:null,row=profile||catalogLevelRow(weapon,weaponLevel,state.weaponAscended!==false);if(row&&Number.isFinite(Number(row.atk??row.attack))){const kind=Object.keys(row.bonuses||{})[0]||namedStatKey(row.secondaryType||row.specializedType||weapon.mainStatType||weapon.substatType);fallbackStats={atk:Number(row.atk??row.attack),specialized:row.specialized,secondaryType:kind?wrStatKey(kind):null};}}

  const conditionals=wrSavedConditions(engine,key,state.wrConditions,state.constellation);
  const radianceMode=String(p.radianceMode||'auto');
  if(radianceMode!=='auto'){
   const values=conditionals[key]||={};
   for(const path of engine.conditionalPaths.characters[key]||[]){
    const allowed=wrConditionOptions(engine,'characters',key,path);let value=null;
    if(path==='a0StellarRadiance')value=radianceMode==='off'?'off':radianceMode;
    else if(path==='a0StellarRadianceSc')value=radianceMode==='sc'?(allowed.includes('sc')?'sc':allowed.includes('on')?'on':'off'):'off';
    else if(path==='lockStellarRadianceSc')value=radianceMode==='off'?'off':radianceMode==='ss'&&allowed.includes('ss')?'ss':allowed.includes('sc')?'sc':'on';
    else if(path==='lockStellarRadiance'||path==='QiqiLk')value=radianceMode==='off'?'off':'on';
    if(value!==null)values[path]=allowed.includes(value)?value:'off';
   }
  }
  for(const [equipmentKey,paths]of Object.entries({...engine.conditionalPaths.weapons,...engine.conditionalPaths.artifacts})){
   const saved=state.wrConditions?.[equipmentKey];if(!saved)continue;conditionals[equipmentKey]={};const group=engine.weapons[equipmentKey]?'weapons':'artifacts';for(const path of paths){const values=wrConditionOptions(engine,group,equipmentKey,path);conditionals[equipmentKey][path]=values.includes(String(saved[path]))?String(saved[path]):'off';}
  }
  let supportPieces=(build?.pieces||[]).map((piece,i)=>({...piece,id:piece.id||'support-'+key+'-'+i,slot:piece.slot||['flower','plume','sands','goblet','circlet'][i]}));
  if(!own&&state.set&&(!supportPieces.length||supportPieces.every(piece=>String(piece.setKey||piece.set)!==String(state.set)))){
   const refs=state.setMode==='2+2'?[state.set,state.set,state.setSecond,state.setSecond]:Array(4).fill(state.set);
   supportPieces=refs.filter(Boolean).map((set,i)=>({id:'support-set-'+key+'-'+i,slot:['flower','plume','sands','goblet'][i],setKey:set,setOnly:true}));
  }
  return {sourceId:String(state.character),character:key,localTarget,bonusStats:{...(build?.tcAggregateSubstats||{}),...(state.bonusStats||{})},level:Number(state.level)||90,ascension:state.ascension??levelAscension(state.level,state.ascended!==false),constellation:Number(state.constellation)||0,talent:{auto:Number(state.talentAuto||state.talentLevel)||10,skill:Number(state.talentSkill||state.talentLevel)||10,burst:Number(state.talentBurst||state.talentLevel)||10},weapon:weaponKey?{key:weaponKey,level:weaponLevel,ascension:levelAscension(weaponLevel,state.weaponAscended!==false),refinement:Number(own?p.weaponRefinement:state.refinement)||1}:fallbackStats?{key:'AstralisWeapon_'+weapon.id,type:localTarget?.weaponType||String(weapon.weaponType||'sword').replace(/^WEAPON_/,'').toLowerCase(),snapshotStats:fallbackStats,secondaryType:fallbackStats.secondaryType?wrStatKey(namedStatKey(fallbackStats.secondaryType)||fallbackStats.secondaryType):sourceSnapshot.weapons?.[String(weapon.id)]?.subStat?.type}:undefined,conditionals,sourceStats:state.passiveSourceStats||{},artifacts:own?(p.loadout==='equipped'?equipped.filter(Boolean).map(mapArtifact).filter(a=>a.setKey):[]):supportPieces.map(mapArtifact).filter(a=>a.setKey),hitMode:p.critMode==='crit'?'critHit':p.critMode==='nonCrit'?'hit':'avgHit',reaction:p.reaction||'none',enemyLevel:Number(p.enemyLevel)||100,enemyResistance:(Number(p.resistance)||0)-(own?(Number(p.resReduction)||0):0),enemyDefenseReduction:Number(p.defReduction)||0,enemyDefenseIgnore:Number(p.defIgnore)||0};
 };
 const active=member(p,true);if(!active)return null;
 const manual=p.manualStatOverrides||{};
 if((!active.localTarget||active.localTarget.base)&&Object.values(manual).some(value=>value!==null&&value!==''&&Number.isFinite(Number(value)))){
  const reference={...active,conditionals:{...active.conditionals,[active.character]:Object.fromEntries((engine.conditionalPaths.characters[active.character]||[]).map(path=>[path,'off']))}};
  const signature=JSON.stringify(reference);let baseline=referenceStatsCache.get(signature);
  if(!baseline){baseline=evaluateWrTeam(engine,buildWrCharacterData(engine,reference)).members[String(active.sourceId||active.character)]?.stats;referenceStatsCache.set(signature,baseline);if(referenceStatsCache.size>48)referenceStatsCache.delete(referenceStatsCache.keys().next().value);}
  active.bonusStats={...active.bonusStats};
  const fields={atk:'atk',hp:'hp',def:'def',em:'eleMas',er:'enerRech_',critRate:'critRate_',critDmg:'critDMG_',bonus:'all_dmg_'};
  for(const [key,value]of Object.entries(manual)){if(!fields[key]||value===null||value===''||!Number.isFinite(Number(value)))continue;const base=Number(baseline?.[key==='bonus'?'dmgBonus':key]);if(Number.isFinite(base))active.bonusStats[fields[key]]=(Number(active.bonusStats[fields[key]])||0)+Number(value)-base;}
 }
 active.bonusStats={...active.bonusStats};for(const[key,value]of Object.entries(combatBonuses)){const field=wrStatKey(key);if(engine.input.total[field]&&Number.isFinite(Number(value)))active.bonusStats[field]=(Number(active.bonusStats[field])||0)+Number(value);}
 return {active,team:(p.allies||[]).filter(state=>state.character).map(state=>member(state,false)).filter(Boolean),setKeys,path:String(p.attackSelection||'').replace(/^wr:/,''),hitCount:Number(p.hitCount)||1};
}
export function createSourceEvaluator(engine,scenario){
 const teammates=scenario.team.map(spec=>buildWrCharacterData(engine,spec));
 return (pieces=null,critMode=null)=>{
  const artifacts=pieces?pieces.filter(Boolean).map(piece=>({id:String(piece.id),slot:piece.slot,setKey:scenario.setKeys[String(piece.setKey)],rarity:Number(piece.rarity)||5,level:Number(piece.level)||0,mainStatKey:wrStatKey(piece.mainType),substats:(piece.substats||[]).map(stat=>({key:wrStatKey(stat.type),value:Number(stat.value)||0}))})).filter(artifact=>artifact.setKey):scenario.active.artifacts;
  const active=buildWrCharacterData(engine,{...scenario.active,artifacts,...(critMode?{hitMode:critMode==='crit'?'critHit':critMode==='nonCrit'?'hit':'avgHit'}:{})});
  const result=evaluateWrTeam(engine,active,teammates),node=scenario.path.split('.').reduce((value,key)=>value?.[key],result.display),total=Number(node?.value)*scenario.hitCount;
  if(scenario.path.startsWith('utility.'))return {ok:true,total:0,totalHits:0,stats:result.members[String(scenario.active.sourceId||scenario.active.character)]?.stats||wrPlainStats(result.display),enemyResistances:result.enemyResistances,warnings:['Ce talent est une activation sans dégâts directs. Ses buffs sont configurés dans l’onglet Buffs.'],wrSource:true,base:0,additive:0,transformative:0,bonusMultiplier:1,critMultiplier:1,defenseMultiplier:1,resistanceMultiplier:1,reactionMultiplier:1};
  if(!Number.isFinite(total))return {ok:false,error:'Cette attaque de la fiche ne produit pas de valeur de dégâts.'};
  return {ok:true,total,totalHits:scenario.hitCount,damageType:damageTypeInfo(node.info),stats:result.members[String(scenario.active.sourceId||scenario.active.character)]?.stats||wrPlainStats(result.display),enemyResistances:result.enemyResistances,warnings:[],wrSource:true,base:total,additive:0,transformative:0,bonusMultiplier:1,critMultiplier:1,defenseMultiplier:1,resistanceMultiplier:1,reactionMultiplier:1};
 };
}

export function auditSourceScenario(engine,scenario){
 const evaluate=createSourceEvaluator(engine,scenario),nonCrit=evaluate(null,'nonCrit'),average=evaluate(null,'average'),crit=evaluate(null,'crit'),plain=createSourceEvaluator(engine,{...scenario,active:{...scenario.active,reaction:'none'}})(null,'average');
 return {reaction:scenario.active.reaction||'none',nonCrit:nonCrit.total,average:average.total,crit:crit.total,withoutReaction:plain.total,amplification:plain.total?average.total/plain.total:1,averageCritMultiplier:nonCrit.total?average.total/nonCrit.total:1};
}
