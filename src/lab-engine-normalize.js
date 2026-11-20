import {applyFinalRosterBuffs} from './lab-final-roster-engine.js';
import {applyLunarStellarBuffs} from './lab-lunar-stellar-engine.js';
import {applyThirdReviewedBuffs} from './lab-reviewed-third-engine.js';
import {registerRadianceCharacters} from './lab-radiance-characters.js?v=20261120-radiance-3';
const normalized=new WeakSet();
// Traveler sheets use an element owner while the roster keys also include gender.
// Clone each sheet so changing one variant cannot change the other variants.
export function normalizeLabEngine(engine){
 if(normalized.has(engine))return engine;
 normalized.add(engine);
 registerRadianceCharacters(engine);
 const readFlag=(key,path)=>({operation:'read',operands:[],path:['conditional',key,path],type:'string'});
 const when=(key,path,on,off)=>({operation:'match',operands:[readFlag(key,path),engine.constant('on'),on,off],emptyOn:'unmatch'});
 const atConstellation=(rank,on,off)=>({operation:'threshold',operands:[engine.input.constellation,engine.constant(rank),on,off],emptyOn:'l'});
 const kokomi=engine.characters.SangonomiyaKokomi?.sheetData;
 if(kokomi?.premod){
  if(kokomi.premod.atkSPD_)kokomi.premod.atkSPD_=when('SangonomiyaKokomi','burst',kokomi.premod.atkSPD_,engine.constant(0));
  const seen=new WeakSet(),gate=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path[1]==='SangonomiyaKokomi'&&node.path[2]==='c6'){const guarded=when('SangonomiyaKokomi','burst',{...node},engine.constant('off'));Object.keys(node).forEach(key=>delete node[key]);Object.assign(node,guarded);return;}for(const child of Object.values(node))if(child&&typeof child==='object')gate(child);};gate(kokomi.premod.hydro_dmg_);
 }
 // The consumed-Grimheart debuff belongs to the enemy, so every teammate benefits.
 const eula=engine.characters.Eula?.sheetData;
 if(eula?.premod){for(const stat of ['cryo_enemyRes_','physical_enemyRes_']){if(!eula.premod[stat])continue;eula.teamBuff||={};eula.teamBuff.premod||={};eula.teamBuff.premod[stat]=eula.premod[stat];delete eula.premod[stat];}}
 // Fischl's ritual doubling is a C6 effect, even if an old save contains its flag.
 const fischl=engine.characters.Fischl?.sheetData;
 if(fischl){
  const seen=new WeakSet(),gate=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path[1]==='Fischl'&&node.path[2]==='lockC6Oz'){const guarded=atConstellation(6,{...node},engine.constant('off'));Object.keys(node).forEach(key=>delete node[key]);Object.assign(node,guarded);return;}for(const child of Object.values(node))if(child&&typeof child==='object')gate(child);};gate(fischl);
  const extra=fischl.display?.constellation1?.dmg;
  if(extra){for(const [key,original]of Object.entries(fischl.display.normal))fischl.display.normal[key]=engine.sum(original,when('Fischl','c1OzAbsent',atConstellation(1,extra,engine.constant(0)),engine.constant(0)));engine.conditionalPaths.characters.Fischl.push('c1OzAbsent');}
 }
 const diona=engine.characters.Diona?.sheetData;
 if(diona?.teamBuff?.premod){for(const stat of ['superconduct_dmg_','stellarconduct_dmg_','swirl_dmg_','stellarswirl_dmg_']){const original=diona.teamBuff.premod[stat];if(!original)continue;const choice=readFlag('Diona','Constellation6');diona.teamBuff.premod[stat]={operation:'match',operands:[choice,engine.constant('higher'),original,{operation:'match',operands:[choice,engine.constant('lower'),original,engine.constant(0)],emptyOn:'unmatch'}],emptyOn:'unmatch'};}}
 if(diona?.teamBuff?.premod){
  const token=(key,label)=>engine.input.nonStacking[key]={operation:'read',operands:[],path:['nonStacking',key],accu:'max',type:'number',info:{name:label,unit:'%'}};
  const cryoSwirl=token('dionaCryoSwirl','DGT de Dispersion Cryo');
  token('dionaEnemyAttackReduction','Baisse d’ATQ ennemie');
  diona.teamBuff.nonStacking||={};
  diona.teamBuff.nonStacking.dionaCryoSwirl=diona.teamBuff.premod.swirl_dmg_;
  delete diona.teamBuff.premod.swirl_dmg_;
  diona.teamBuff.nonStacking.dionaEnemyAttackReduction={operation:'threshold',operands:[engine.input.asc,engine.constant(4),when('Diona','a4EnemyInMist',engine.constant(.1),engine.constant(0)),engine.constant(0)],emptyOn:'l'};
  engine.conditionalPaths.characters.Diona.push('a4EnemyInMist');
  // Diona's radiance boosts Cryo Swirl specifically, not Pyro/Hydro/Electro Swirl.
  const copies=new WeakMap(),copy=node=>{if(!node||typeof node!=='object')return node;if(copies.has(node))return copies.get(node);if(node.operation==='read'&&node.path?.join('.')==='total.swirl_dmg_')return engine.sum(node,cryoSwirl);const out=Array.isArray(node)?[]:{};copies.set(node,out);for(const[key,value]of Object.entries(node))out[key]=copy(value);return out;};
  for(const character of Object.values(engine.characters)){const display=character.sheetData?.display?.reaction;if(display?.cryoSwirl)display.cryoSwirl=copy(display.cryoSwirl);}
 }
 const klee=engine.characters.Klee?.sheetData;
 if(klee?.display?.passive1?.dmg&&klee.display.charged?.dmg){klee.display.charged.dmg=when('Klee','a1Spark',{operation:'threshold',operands:[engine.input.asc,engine.constant(1),klee.display.passive1.dmg,klee.display.charged.dmg],emptyOn:'l'},klee.display.charged.dmg);engine.conditionalPaths.characters.Klee.push('a1Spark');}
 const diluc=engine.characters.Diluc?.sheetData;
 if(diluc?.display?.constellation4){for(const [normal,boosted]of [['secondHit','secondHitBoost'],['thirdHit','thirdHitBoost']]){const original=diluc.display.skill[normal];if(original&&diluc.display.constellation4[boosted])diluc.display.skill[normal]=when('Diluc','c4Rhythm',atConstellation(4,diluc.display.constellation4[boosted],original),original);}engine.conditionalPaths.characters.Diluc.push('c4Rhythm');}
 const beidou=engine.characters.Beidou?.sheetData;
 if(beidou?.display?.constellation4?.skillDmg){const extra=when('Beidou','c4AfterDamage',atConstellation(4,beidou.display.constellation4.skillDmg,engine.constant(0)),engine.constant(0));for(const [key,original]of Object.entries(beidou.display.normal))beidou.display.normal[key]=engine.sum(original,extra);engine.conditionalPaths.characters.Beidou.push('c4AfterDamage');}
 const bennett=engine.characters.Bennett?.sheetData;
 // C4 excludes the source Raiden, not whichever teammate is currently active.
 const raiden=engine.characters.RaidenShogun?.sheetData;
 if(raiden?.teamBuff?.premod?.atk_){
  const bonus=structuredClone(raiden.teamBuff.premod.atk_);
  const replaceSource=node=>{if(!node||typeof node!=='object')return;if(node.operation==='read'&&node.path?.length===1&&node.path[0]==='activeCharKey'){Object.assign(node,engine.constant('RaidenShogun'));return;}for(const child of Object.values(node))if(child&&typeof child==='object')replaceSource(child);};
  replaceSource(bonus);raiden.teamBuff.premod.atk_=bonus;
 }
 if(bennett?.teamBuff?.total?.atk){
  const original=bennett.teamBuff.total.atk;
  const low={operation:'read',operands:[],path:['conditional','Bennett','recipientLowHP'],type:'string'};
  const blocked={operation:'match',operands:[low,engine.constant('on'),engine.constant(0),original],emptyOn:'unmatch'};
  bennett.teamBuff.total.atk={operation:'threshold',operands:[engine.input.constellation,engine.constant(1),original,blocked],emptyOn:'l',info:original.info};
  engine.conditionalPaths.characters.Bennett.push('recipientLowHP');
 }
 applyThirdReviewedBuffs(engine);
 applyLunarStellarBuffs(engine);
 for(const [key,character]of Object.entries(engine.characters)){
  if(!/^Traveler.+[MF]$/.test(key))continue;
  const owner=key.slice(0,-1),sheet=structuredClone(character.sheetData),paths=new Set(),seen=new WeakSet();
  const visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);
   if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path[1]===owner){node.path=[...node.path];node.path[1]=key;paths.add(node.path[2]);}
   for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);
  };visit(sheet);
  sheet.charKey=engine.constant(key);
  character.sheetData=sheet;
  engine.conditionalPaths.characters[key]=[...paths];
 }
 applyFinalRosterBuffs(engine);
 return engine;
}
