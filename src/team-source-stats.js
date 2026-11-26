import {loadWrEngine,sourceScenario,buildWrCharacterData,evaluateWrTeam,evaluateWrBuffReceipts} from './lab-wr-adapter.js';
import {pieceSubstats} from './build-model.js';
import {LAB_STAT_LABELS} from './lab-view.js';
import {normalizeTeamStats,teamStatOverrides} from './team-stat-overrides.js';

/** Use the same character, weapon, artifact and condition rules as the lab. */
export async function analyzeTeamSources({team,builds,characters,weapons,sets,aliases,sourceSnapshot}){
 const engine=await loadWrEngine();
 const occupied=(team.members||[]).map((slot,index)=>({slot,index})).filter(({slot})=>slot.character);
 if(!occupied.length)return null;
 // An equipped set can be known without imported pieces. Count its effects
 // while contributing zero artifact stats, instead of fabricating equipment.
 builds=builds.map(build=>({...build,pieces:[...(build.pieces||[])]}));
 for(const {slot,index}of occupied){
  let build=builds.find(row=>row.id===slot.buildId);
  if(!build){build={id:'team-base-'+index,character:slot.character,level:90,pieces:[]};builds.push(build);}
  if(slot.set&&!build.pieces.some(piece=>piece.mainType||piece.set))build.pieces=Array.from({length:Number(slot.setPieces)||4},(_,i)=>({id:build.id+'-set-'+i,set:slot.set,setOnly:true}));
 }
 const active=occupied.find(row=>row.index===(Number(team.activeMember)||0))||occupied[0];
 const ordered=[active,...occupied.filter(row=>row!==active)];
 const member=({slot,index})=>{
  const build=builds.find(row=>row.id===slot.buildId)||builds.find(row=>row.id==='team-base-'+index)||{};
  const tc=build.tcSettings||{};
  return {...tc,character:slot.character,build:build.id,level:Number(build.level)||90,ascended:build.ascended!==false,
   constellation:Number(String(slot.constellation??build.constellation??0).replace(/^C/i,'')),
   talentAuto:build.talentNA||10,talentSkill:build.talentSkill||10,talentBurst:build.talentBurst||10,
   weapon:slot.weapon||build.weapon,weaponLevel:build.weaponLevelValue||90,weaponAscended:build.weaponAscended!==false,
   refinement:slot.refinement||build.weaponRefinement||1,wrConditions:slot.wrConditions||tc.wrConditions||{},
   passiveSourceStats:{...tc.passiveSourceStats,...normalizeTeamStats(slot.statOverrides)},
   position:index===active.index?'on':'off'};
 };
 const normalized=builds.map(build=>({...build,pieces:(build.pieces||[]).map((piece,index)=>({...piece,
  id:piece.id||build.id+'-'+index,slot:['flower','plume','sands','goblet','circlet'][index],
  setKey:piece.set||build.set,substats:pieceSubstats(piece)}))}));
 const main=member(active),own=normalized.find(build=>build.id===main.build);
 const p={...main,weaponOverride:main.weapon,weaponRefinement:main.refinement,loadout:'equipped',
  critMode:'average',reaction:'none',resistance:10,enemyLevel:100,radianceMode:'auto',allies:ordered.slice(1).map(member)};
 const scenario=sourceScenario(engine,p,{characters,weapons,sets,aliases,builds:normalized,equipped:own?.pieces||[],sourceSnapshot});
 if(!scenario||scenario.active.localTarget)return null;
 // Do not silently omit an unsupported teammate: use the standard totals instead.
 if(scenario.team.length!==ordered.length-1)return null;
 const specs=[scenario.active,...scenario.team],data=specs.map(spec=>buildWrCharacterData(engine,spec));
 const result=evaluateWrTeam(engine,data[0],data.slice(1));
 const receipts=evaluateWrBuffReceipts(engine,data,result);
 for(const {slot}of occupied){const member=result.members[String(slot.character)];if(member)member.stats=teamStatOverrides(member.stats,slot);}
 return {members:result.members,receipts,active:active.index,statLabels:LAB_STAT_LABELS};
}
