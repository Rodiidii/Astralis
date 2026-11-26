import {artifactStatKey,artifactMainValue,ARTIFACT_SLOTS} from './artifact-model.js';
const token=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function lookup(catalog,key,aliases,group){
 const alias=(aliases[group]||[]).find(row=>(row.en||[]).some(name=>token(name)===token(key))||String(row.id)===String(key));
 return (catalog||[]).find(row=>(alias&&String(row.id)===String(alias.id))||[row._id,row.id,row.name,row._name,row.key].some(name=>token(name)===token(key)));
}
/** Imports exact aggregate substats, without inventing a distribution of rolls. */
export function celestiaToLab(original,{characters,weapons,sets,aliases={},mode='team',activeIndex=0,id=()=>crypto.randomUUID()}={}){
 const loadouts=original?.loadoutData;
 if(!Array.isArray(loadouts)||!loadouts.some(Boolean))throw Error('Ce fichier ne contient pas les statistiques d’un personnage. Choisis son export Team Celestia.');
 const builds=[],members=[],missing=[],originalIndices=[];
 const chosen=loadouts[Number(activeIndex)]?Number(activeIndex):loadouts.findIndex(Boolean);
 for(const [index,member]of loadouts.entries()){
  if(!member||(mode==='character'&&index!==chosen))continue;
  const source=member.buildTcs?.[0];if(!source)throw Error('Build de référence absent pour '+member.key);
  const character=lookup(characters,member.key,aliases,'characters'),weapon=lookup(weapons,source.weapon?.key,aliases,'weapons');
  if(!character)missing.push(member.key);if(source.weapon?.key&&!weapon)missing.push(source.weapon.key);
  const counts=Object.entries(source.artifact?.sets||{}),setRows=counts.map(([key,count])=>({key,count:Number(count),row:lookup(sets,key,aliases,'artifacts')}));
  for(const set of setRows)if(!set.row)missing.push(set.key);
  const assigned=setRows.flatMap(set=>Array(Math.max(0,Math.min(5,set.count))).fill(set.row?._id));
  const pieces=ARTIFACT_SLOTS.map((slot,i)=>{const p=source.artifact?.slots?.[slot];if(!p)return {};const type=artifactStatKey(p.statKey),rarity=Number(p.rarity)||5,level=Number(p.level)||0;return {id:id(),slot,set:assigned[i]||'',level,rarity,mainType:type,mainValue:artifactMainValue(type,level,rarity)};});
  const characterData=source.character||{},buildId=id();
  const build={id:buildId,character:character?._id,name:'Celestia · '+(character?._name||member.key)+' · '+original.name,tc:true,level:characterData.level||90,ascended:true,constellation:'C'+(characterData.constellation||0),talentNA:characterData.talent?.auto||10,talentSkill:characterData.talent?.skill||10,talentBurst:characterData.talent?.burst||10,weapon:weapon?._id||'',weaponLevelValue:source.weapon?.level||90,weaponRefinement:source.weapon?.refinement||1,weaponAscended:true,set:setRows[0]?.row?._id||'',set2:setRows[1]?.row?._id||'',setMode:(setRows[0]?.count||0)>=4?'four':'two-two',pieces,
   tcAggregateSubstats:{...(source.artifact?.substats?.stats||{})},tcSettings:{wrConditions:structuredClone(member.conditional||{})},celestiaReference:{characterKey:member.key,targets:structuredClone(member.customMultiTargets||[]),sourceBuild:structuredClone(source)},notes:'Build théorique Celestia. Sous-stats globales exactes ; la répartition entre les cinq pièces n’est pas fournie. Les bonus figés des cibles ne sont pas ajoutés aux buffs calculés de l’équipe.'};
  builds.push(build);originalIndices.push(index);members.push({character:build.character,build:build.id,buildId:build.id,level:build.level,constellation:characterData.constellation||0,weapon:build.weapon,weaponLevel:build.weaponLevelValue,refinement:build.weaponRefinement,set:build.set,wrConditions:build.tcSettings.wrConditions,talentAuto:build.talentNA,talentSkill:build.talentSkill,talentBurst:build.talentBurst});
 }
 if(missing.length)throw Error('Éléments absents du catalogue : '+[...new Set(missing)].join(', '));
 const selected=mode==='character'?0:Math.max(0,originalIndices.indexOf(chosen)),active=members[selected],build=builds[selected];
 const targets=build.celestiaReference.targets.flatMap(group=>group.targets||[]),target=targets.find(t=>t.reaction==='melt'&&t.path?.[0]==='burst')||targets.find(t=>t.path?.[0]==='burst')||targets[0];
 const scenario={...build.tcSettings,...active,referenceBuild:build.id,referenceCharacter:active.character,characterLevel:build.level,talentLevel:10,weaponOverride:build.weapon,weaponRefinement:build.weaponRefinement,loadout:'equipped',critMode:'average',hitCount:1,reaction:target?.reaction||'none',attackSelection:target?.path?'wr:'+target.path.join('.'):'',actionKind:target?.path?.[0]||'burst',targetName:original.name+' · '+(target?.path?.join(' / ')||'Choisir une attaque'),enemyLevel:original.enemyOverride?.enemyLevel||100,resistance:10,defReduction:original.enemyOverride?.enemyDefRed_||0,defIgnore:original.enemyOverride?.enemyDefIgn_||0,tab:'overview',radianceMode:'auto',allies:members.filter((_,i)=>i!==selected).map(m=>({...m,position:'off'})),inventoryDefaultsVersion:1,setRequirementsVersion:2,celestiaName:original.name};
 build.tcSettings={...scenario};delete build.tcSettings.build;delete build.tcSettings.referenceBuild;
 return {builds,scenario,name:original.name,source:'Celestia'};
}
export function applyMavuikaMeltPreset(pack,{characters,weapons}){
 const next=structuredClone(pack),weapon=weapons.find(row=>String(row.id)==='12502');
 if(!weapon)throw Error('Mort-du-loup absente du catalogue.');
 const build=next.builds[0];build.weapon=weapon._id;build.weaponRefinement=1;next.scenario.weaponOverride=weapon._id;next.scenario.weapon=weapon._id;next.scenario.weaponRefinement=1;next.scenario.refinement=1;
 next.scenario.wrConditions={Mavuika:{a1NsBurst:'on',burstSpirit:'200',a4TimeSinceBurst:'0'},ObsidianCodex:{'2NightsoulBlessing':'on','4NightsoulConsume':'on'}};
 for(const member of next.scenario.allies){
  const id=String(characters.find(c=>c._id===member.character)?.id);
  if(id==='10000110'){member.constellation=6;member.wrConditions={Iansan:{a1Precise:'on',burstNs:'42',c6Extreme:'on'},ScrollOfTheHeroOfCinderCity:{react_pyro:'pyro',react_electro:'electro',nightsoul_pyro:'pyro',nightsoul_electro:'electro'}};}
  if(id==='10000032')member.wrConditions={Bennett:{activeInArea:'activeInArea'},NoblesseOblige:{set4:'on'}};
  if(id==='10000107')member.wrConditions={Citlali:{a1NsFreezeMelt:'on'},Instructor:{set4:'on'},StarcallersWatch:{shield:'on'}};
 }
 next.scenario.tcName='Mavuika Fonte · Iansan C6 · Mort-du-loup';next.scenario.celestiaPreset='mavuika-wgs';next.scenario.targetName='Impact initial du déchaînement · Fonte';build.name=next.scenario.tcName;
 build.tcSettings=structuredClone(next.scenario);delete build.tcSettings.build;delete build.tcSettings.referenceBuild;
 return next;
}
