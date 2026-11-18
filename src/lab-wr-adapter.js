let enginePromise;
export function loadWrEngine(){return enginePromise??=import('../public/lab-wr-engine.js?v=20261118-conditions-1');}

const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
function flatSheet(source){if(!source)return {};const {sheetData,...data}=source;return data;}
export function buildWrCharacterData(engine,{character,level=90,ascension=6,constellation=0,talent={auto:9,skill:9,burst:9},weapon,artifacts=[],conditionals={},hitMode='avgHit',reaction='none',enemyLevel=100,enemyResistance=10,enemyDefenseReduction=0,enemyDefenseIgnore=0,bonusStats={}}){
 const sourceKey=engine.characters[character]?character:engine.getCharStat(character)?.key,source=engine.characters[sourceKey],characterSheet=flatSheet(source?.sheetData);if(!source?.sheetData)throw new Error(`Fiche WR absente pour ${character}`);character=sourceKey;
 // The pinned source applies Sigewinne C6 unconditionally. Its published text requires healing.
 if(sourceKey==='Sigewinne'){characterSheet.premod={...characterSheet.premod};for(const stat of ['burst_critRate_','burst_critDMG_']){const bonus=characterSheet.premod[stat];if(bonus)characterSheet.premod[stat]={operation:'match',operands:[engine.constant('on'),{operation:'read',operands:[],path:['conditional','Sigewinne','c6AfterHeal'],type:'string'},bonus,engine.constant(0)],emptyOn:'unmatch'};}}
 const char=engine.dataObjForCharacterNew({level:num(level,90),ascension:num(ascension,6),constellation:num(constellation),talent:{auto:num(talent.auto,9),skill:num(talent.skill,9),burst:num(talent.burst,9)},conditional:conditionals,customMultiTargets:[],bonusStats,enemyOverride:{enemyLevel:num(enemyLevel,100),enemyDefRed_:num(enemyDefenseReduction),enemyDefIgn_:num(enemyDefenseIgnore),...Object.fromEntries(['physical','anemo','cryo','dendro','electro','geo','hydro','pyro'].map(key=>[key+'_enemyRes_',num(enemyResistance)]))},hitMode:hitMode==='nonCrit'?'hit':hitMode,reaction},characterSheet);
 const artSlots=Object.fromEntries(['flower','plume','sands','goblet','circlet'].map(slot=>[slot,engine.constant(undefined)]));
 const allArtSets=Object.fromEntries(engine.allArtifactSetKeys.map(key=>[key,engine.constant(artifacts.filter(a=>a.setKey===key).length)]));
 const artLayer={art:artSlots,artSet:allArtSets};
 const weaponSheet=weapon?flatSheet(engine.weapons[weapon.key]?.sheetData):{},weaponData=weapon?engine.dataObjForWeapon({id:'astralis',key:weapon.key,level:num(weapon.level,90),ascension:num(weapon.ascension,6),refinement:num(weapon.refinement,1)}):{};
 const artSetCounts=allArtSets;
 const setData=engine.mergeData(artifacts.reduce((rows,a)=>{const data=flatSheet(engine.artifacts[a.setKey]?.sheetData);if(Object.keys(data).length&&!rows.includes(data))rows.push(data);return rows;},[]));
 const artRows=artifacts.map(a=>engine.dataObjForArtifact({id:String(a.id),slotKey:a.slot,setKey:a.setKey,rarity:num(a.rarity,5),level:num(a.level),mainStatKey:a.mainStatKey,substats:(a.substats||[]).map(s=>({key:s.key,accurateValue:num(s.value??s.accurateValue)}))}));
 const normalizedWeapon=weapon?{...weaponData,weapon:{...(weaponData.weapon||{}),key:engine.constant(weapon.key),type:engine.constant(weapon.type||engine.getCharStat(character).weaponType)}}:{};
 const ownData=[char,...(weapon?[normalizedWeapon]:[]),...artRows,{art:artSlots,artSet:artSetCounts},characterSheet,...(weapon?[weaponSheet]:[]),engine.common,engine.resonanceData,engine.reactionData,setData];
 return {char,weapon:weaponData,artifacts:engine.mergeData([...artRows,artLayer]),sheets:engine.mergeData([characterSheet,weaponData,setData]),common:engine.common,resonance:engine.resonanceData,reactions:engine.reactionData,ownData,input:engine.input,character};
}

export function evaluateWrDisplay(engine,build){
 const calc=engine.uiDataForTeam({[build.character]:build.ownData},'F',build.character)[build.character]?.target;
 if(!calc)throw new Error(`Évaluation WR indisponible pour ${build.character}`);
 const walk=(value,path=[])=>{if(value?.operation===true)return {value:value.value,info:value.info};if(value?.meta?.ops)return {value:value.value,info:value.info};if(!value||typeof value!=='object')return undefined;const out={};for(const [key,child]of Object.entries(value)){const next=walk(child,[...path,key]);if(next!==undefined)out[key]=next;}return out;};
 return {uiData:calc,display:walk(calc.getDisplay()),stats:calc.getCharacterStats(),bonusStats:calc.getBonusStats(),input:build.input};
}

export function wrAttackOptions(engine,character,display,constellation=0){
 const source=engine.characters[character];if(!source)return [];
 const categories={normal:'normal',charged:'charged',plunge:'plunging',skill:'skill',burst:'burst',...Object.fromEntries(Array.from({length:6},(_,i)=>['constellation'+(i+1),'constellation'+(i+1)]))},rows=[];
 for(const [kind,key]of Object.entries(categories)){
  const constellationIndex=Number(kind.replace('constellation',''));if(constellationIndex&&constellation<constellationIndex)continue;
  const entries=source.sheetData?.display?.[key]||{},evaluated=display?.[key]||{};
  for(const [index,node]of Object.entries(entries)){
   const path=key+'.'+index,result=evaluated[index];if(!result||!Number.isFinite(Number(result.value)))continue;let move=node?.data?.hit?.move?.value;if(!move){const matches=Object.entries(node?.data?.hit?.move?.table||{});move=matches.find(([name])=>name===String(index))?.[1]?.value;}const actualKind=kind.startsWith('constellation')?kind:move==='normal'||move==='charged'||move==='plunging_impact'||move==='plunging_collision'||move==='skill'||move==='burst'?move==='plunging_impact'||move==='plunging_collision'?'plunge':move:kind,talentLabel=kind.startsWith('constellation')?'Constellation '+kind.slice(-1):`${kind==='normal'?'Attaque normale':kind==='charged'?'Attaque chargée':kind==='plunge'?'Attaque plongeante':kind==='skill'?'Compétence':kind==='burst'?'Déchaînement':kind} ${Number(index)+1}`,label=node?.info?.name||node?.info?.description||talentLabel;
   rows.push({id:'wr:'+path,wrPath:path,kind:actualKind,label,text:label,parsed:{components:[{talentMultiplier:1,count:1}],hitCount:1,baseStat:'atk'},skill:{}});
  }
 }
 return rows;
}

export function wrConditionControls(engine,character,weaponKey,artifactKeys,p={}){
 const groups=[['characters',character,'Personnage'],['weapons',weaponKey,'Arme'],...artifactKeys.map(key=>['artifacts',key,'Set'])],result=[];
 for(const [group,key,label]of groups){if(!key)continue;for(const path of engine.conditionalPaths?.[group]?.[key]||[]){const value=p.wrConditions?.[key]?.[path]||'off';result.push({id:key+'|'+path,key,path,label,value,options:engine.conditionOptions(key,path)});}}
 return result;
}
export function evaluateWrTeam(engine,activeBuild,teammates=[]){
 const builds=[activeBuild,...teammates.filter(build=>build.character!==activeBuild.character)];
 const team=Object.fromEntries(builds.map(build=>[build.character,build.ownData]));
 const calc=engine.uiDataForTeam(team,'F',activeBuild.character)[activeBuild.character]?.target;
 if(!calc)throw new Error('Évaluation de l’équipe indisponible.');
 const walk=(value,seen=new WeakSet())=>{
  if(value?.operation===true||value?.meta?.ops)return {value:value.value,info:value.info};
  if(!value||typeof value!=='object'||seen.has(value))return undefined;
  seen.add(value);const out={};for(const [key,child]of Object.entries(value)){const next=walk(child,seen);if(next!==undefined)out[key]=next;}return out;
 };
 return {display:walk(calc.getDisplay()),stats:calc.getCharacterStats(),bonusStats:calc.getBonusStats()};
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
  const allowed=engine.conditionOptions(key,path);let value=String(saved[key]?.[path]??'off');if(key==='Furina'&&path==='burstFanfare'&&Number(constellation)<1&&Number(value)>300)value='300';out[path]=allowed.includes(value)?value:'off';
 }
 return {[key]:out};
}

export function wrStatKey(key){
 return ({hpFlat:'hp',atkFlat:'atk',defFlat:'def',hpPct:'hp_',atkPct:'atk_',defPct:'def_',em:'eleMas',er:'enerRech_',critRate:'critRate_',critDmg:'critDMG_',healing:'heal_',physicalDmg:'physical_dmg_'})[key]||(/^(pyro|hydro|cryo|electro|anemo|geo|dendro)Dmg$/.test(key)?key.replace('Dmg','_dmg_'):key);
}
export function wrPlainStats(display){
 const basic=display?.basic||{},get=key=>Number(basic[key]?.value)||0;
 return {hp:get('hp'),atk:get('atk'),def:get('def'),em:get('eleMas'),er:get('enerRech_')*100,critRate:get('critRate_')*100,critDmg:get('critDMG_')*100,dmgBonus:get('dmg_')*100,...Object.fromEntries(['pyro','hydro','cryo','electro','anemo','geo','dendro','physical'].map(element=>[element+'Dmg',get(element+'_dmg_')*100]))};
}
export function sourceScenario(engine,p,{characters=[],weapons=[],sets=[],aliases={},equipped=[],builds=[]}={}){
 const normalize=value=>String(value||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 const resolveEquipment=(catalog,item,group)=>{
  const alias=aliases[group]?.find(row=>String(row.id)===String(item?.id||item?._id));
  const names=[item?._id,item?.name,item?._name,...(alias?.en||[])].filter(Boolean).map(normalize);
  return Object.keys(catalog).find(key=>names.includes(normalize(key)));
 };
 const setKeys={};for(const set of sets){const key=resolveEquipment(engine.artifacts,set,'artifacts');if(key)for(const alias of [set._id,set._labKey,set.id,...(set._labAliases||[])].filter(Boolean))setKeys[String(alias)]=key;}
 const mapArtifact=piece=>({id:String(piece.id),slot:piece.slot,setKey:setKeys[String(piece.setKey||piece.set)],rarity:Number(piece.rarity)||5,level:Number(piece.level)||0,mainStatKey:wrStatKey(piece.mainType),substats:(piece.substats||[]).map(stat=>({key:wrStatKey(stat.type),value:Number(stat.value)||0}))});
 const member=(state,own)=>{
  const character=characters.find(character=>[character._id,character.id].map(String).includes(String(state.character))),key=resolveWrCharacterKey(engine,{...character,elementKey:state.elementKey||character?.elementKey},aliases);if(!key)return null;
  const build=builds.find(build=>String(build.id)===String(state.build)),weaponId=own?(p.weaponOverride??build?.weapon??''):(state.weapon||build?.weapon);
  const weapon=weapons.find(weapon=>[weapon._id,weapon.id].map(String).includes(String(weaponId))),weaponKey=resolveEquipment(engine.weapons,weapon,'weapons');
  const conditionals=wrSavedConditions(engine,key,state.wrConditions,state.constellation);
  for(const [equipmentKey,paths]of Object.entries({...engine.conditionalPaths.weapons,...engine.conditionalPaths.artifacts})){
   const saved=state.wrConditions?.[equipmentKey];if(!saved)continue;conditionals[equipmentKey]={};for(const path of paths){const values=engine.conditionOptions(equipmentKey,path);conditionals[equipmentKey][path]=values.includes(String(saved[path]))?String(saved[path]):'off';}
  }
  return {character:key,level:Number(state.level)||90,ascension:state.ascension??6,constellation:Number(state.constellation)||0,talent:{auto:Number(state.talentAuto||state.talentLevel)||10,skill:Number(state.talentSkill||state.talentLevel)||10,burst:Number(state.talentBurst||state.talentLevel)||10},weapon:weaponKey?{key:weaponKey,level:Number(own?p.weaponLevel:state.weaponLevel)||90,refinement:Number(own?p.weaponRefinement:state.refinement)||1}:undefined,conditionals,artifacts:own?(p.loadout==='equipped'?equipped.filter(Boolean).map(mapArtifact).filter(a=>a.setKey):[]):(build?.pieces||[]).map((piece,i)=>({...piece,id:piece.id||'support-'+key+'-'+i,slot:piece.slot||['flower','plume','sands','goblet','circlet'][i]})).map(mapArtifact).filter(a=>a.setKey),hitMode:p.critMode==='crit'?'critHit':p.critMode==='nonCrit'?'hit':'avgHit',reaction:p.reaction||'none',enemyLevel:Number(p.enemyLevel)||100,enemyResistance:Number(p.resistance)||0,enemyDefenseReduction:Number(p.defReduction)||0,enemyDefenseIgnore:Number(p.defIgnore)||0};
 };
 const active=member(p,true);if(!active)return null;
 return {active,team:(p.allies||[]).filter(state=>state.character).map(state=>member(state,false)).filter(Boolean),setKeys,path:String(p.attackSelection||'').replace(/^wr:/,''),hitCount:Number(p.hitCount)||1};
}
export function createSourceEvaluator(engine,scenario){
 const teammates=scenario.team.map(spec=>buildWrCharacterData(engine,spec));
 return (pieces=null,critMode=null)=>{
  const artifacts=pieces?pieces.filter(Boolean).map(piece=>({id:String(piece.id),slot:piece.slot,setKey:scenario.setKeys[String(piece.setKey)],rarity:Number(piece.rarity)||5,level:Number(piece.level)||0,mainStatKey:wrStatKey(piece.mainType),substats:(piece.substats||[]).map(stat=>({key:wrStatKey(stat.type),value:Number(stat.value)||0}))})).filter(artifact=>artifact.setKey):scenario.active.artifacts;
  const active=buildWrCharacterData(engine,{...scenario.active,artifacts,...(critMode?{hitMode:critMode==='crit'?'critHit':critMode==='nonCrit'?'hit':'avgHit'}:{})});
  const result=evaluateWrTeam(engine,active,teammates),node=scenario.path.split('.').reduce((value,key)=>value?.[key],result.display),total=Number(node?.value)*scenario.hitCount;
  if(!Number.isFinite(total))return {ok:false,error:'Cette attaque de la fiche ne produit pas de valeur de dégâts.'};
  return {ok:true,total,totalHits:scenario.hitCount,stats:wrPlainStats(result.display),warnings:[],wrSource:true,base:total,additive:0,transformative:0,bonusMultiplier:1,critMultiplier:1,defenseMultiplier:1,resistanceMultiplier:1,reactionMultiplier:1};
 };
}
