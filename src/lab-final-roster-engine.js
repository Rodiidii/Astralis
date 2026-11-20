export function applyFinalRosterBuffs(e){
 const C=e.constant,Z=C(0),flag=(key,path)=>({operation:'read',operands:[],path:['conditional',key,path],type:'string'});
 const match=(a,b,on,off=Z)=>({operation:'match',operands:[a,b,on,off],emptyOn:'unmatch'});
 const on=(key,path,value,off=Z)=>match(flag(key,path),C('on'),value,off);
 const rank=(n,value)=>({operation:'threshold',operands:[e.input.constellation,C(n),value,Z],emptyOn:'l'});
 const active={operation:'read',operands:[],path:['activeCharKey'],type:'string'},target={operation:'read',operands:[],path:['target','charKey'],type:'string'};
 const guard=(sheet,key,path,wrap)=>{const seen=new WeakSet();const visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.join('.')===`conditional.${key}.${path}`){const raw={...node};Object.keys(node).forEach(k=>delete node[k]);Object.assign(node,wrap(raw));return;}for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);};visit(sheet);};
 const add=(key,...paths)=>{for(const path of paths)if(!e.conditionalPaths.characters[key].includes(path))e.conditionalPaths.characters[key].push(path);};
 const sheet=key=>e.characters[key].sheetData;
 const mul=(...operands)=>({operation:'mul',operands}),asc=(n,value)=>({operation:'threshold',operands:[e.input.asc,C(n),value,Z],emptyOn:'l'});
 guard(sheet('Aloy'),'Aloy','A4',node=>match(flag('Aloy','coil'),C('rush'),node,C('off')));
 const skirk=sheet('Skirk');skirk.premod.dmgRed_=rank(6,on('Skirk','skillActive',on('Skirk','c6Protection',C(.8))));add('Skirk','c6Protection');
 skirk.premod.normal_dmg_=on('Skirk','skillActive',skirk.premod.normal_dmg_);
 // Keep the ordinary normal attack selection in sync with Seven-Phase Flash.
 skirk.flags||={};skirk.flags.skillActive=flag('Skirk','skillActive');add('Skirk','skillActive');
 for(const key of Object.keys(skirk.display.normal))if(skirk.display.skill[key])skirk.display.normal[key]=on('Skirk','skillActive',skirk.display.skill[key],skirk.display.normal[key]);
 if(skirk.display.skill.chargedDmg)skirk.display.charged.dmg=on('Skirk','skillActive',skirk.display.skill.chargedDmg,skirk.display.charged.dmg);
 guard(skirk,'Skirk','c2AfterBurst',node=>on('Skirk','skillActive',node,C('off')));
 const mualani=sheet('Mualani');
 if(mualani.display.constellation1?.surgingDmg){const original=mualani.display.skill.surgingDmg,enhanced=mualani.display.constellation1.surgingDmg;mualani.display.skill.surgingDmg={operation:'threshold',operands:[e.input.constellation,C(6),enhanced,on('Mualani','c1FirstBite',enhanced,original)],emptyOn:'l'};add('Mualani','c1FirstBite');}
 const sig=sheet('Sigewinne');
 // C6 was guarded in buildWrCharacterData already, but lacked an actual control.
 sig.flags||={};sig.flags.c6AfterHeal=flag('Sigewinne','c6AfterHeal');add('Sigewinne','c6AfterHeal');
 sig.teamBuff.premod.skill_dmgInc=match(target,C('Sigewinne'),Z,match(active,target,Z,on('Sigewinne','a1BedRest',sig.teamBuff.premod.skill_dmgInc)));
 const chasca=sheet('Chasca');
 for(const [path,node]of Object.entries(chasca.display.skill))if(path==='shellDmg'||path.startsWith('shiningShellDmg_')){
  node.data.premod||={};node.data.premod.critDMG_=rank(6,asc(1,on('Chasca','c6FatalRounds',C(1.2))));
 }
 const somnia=sheet('Somnia');
 guard(somnia,'Somnia','lessThan3',node=>on('Somnia','cycloneActive',on('Somnia','subtraction',node,C('off')),C('off')));
 guard(somnia,'Somnia','a4EnemiesHit',node=>on('Somnia','cycloneActive',node,C('off')));
 guard(somnia,'Somnia','c2Prime',node=>on('Somnia','superposition',node,C('off')));
 const ifa=sheet('Ifa');ifa.flags||={};ifa.flags.nsActive=flag('Ifa','nsActive');add('Ifa','nsActive');
 guard(ifa,'Ifa','a1Essentials',node=>on('Ifa','nsActive',node,C('off')));
 // This branch exists in the pinned source kit but was absent from the bundled engine.
 ifa.teamBuff.premod.lunarcharged_dmg_=structuredClone(ifa.teamBuff.premod.swirl_dmg_);
 const lunarSeen=new WeakSet(),lunarCoefficient=node=>{if(!node||typeof node!=='object'||lunarSeen.has(node))return;lunarSeen.add(node);if(node.operation==='const'&&node.value===.015)node.value=.002;for(const child of Object.values(node))lunarCoefficient(child);};lunarCoefficient(ifa.teamBuff.premod.lunarcharged_dmg_);
 const mizuki=sheet('YumemizukiMizuki');
 guard(mizuki,'YumemizukiMizuki','a4Phec',node=>on('YumemizukiMizuki','skillDream',node,C('off')));
 guard(mizuki,'YumemizukiMizuki','c1Awaiting',node=>on('YumemizukiMizuki','skillDream',node,C('off')));
 // Flotte-rêves affects nearby teammates; C2 expressly excludes Mizuki herself.
 const rewrite=(root,fn)=>{const seen=new WeakSet(),visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(fn(node))return;for(const child of Object.values(node))visit(child);};visit(root);};
 for(const stat of ['swirl_dmg_','stellarswirl_dmg_','swirl_critRate_','swirl_critDMG_','stellarswirl_critRate_','stellarswirl_critDMG_'])rewrite(mizuki.teamBuff.premod[stat],node=>{if(node.operation==='match'&&node.operands[0]?.path?.[0]==='activeCharKey'&&node.operands[1]?.value==='YumemizukiMizuki'){Object.assign(node,node.operands[2]);return true;}});
 for(const ele of ['hydro','pyro','cryo','electro'])mizuki.teamBuff.premod[ele+'_dmg_']=rank(2,on('YumemizukiMizuki','skillDream',match(target,C('YumemizukiMizuki'),Z,mul(C(.0004),e.input.total.eleMas))));
 for(const ele of ['hydro','pyro','cryo','electro','anemo'])mizuki.teamBuff.premod[ele+'_enemyRes_']=rank(2,on('YumemizukiMizuki','skillDream',C(-.2)));
 for(const stat of ['critRate_','critDMG_'])guard({value:mizuki.total[stat]},'YumemizukiMizuki','lockRevelation',()=>C('on'));
 // Pinned French text describes enemy Anemo damage reduction, not enemy resistance reduction.
 const vody=sheet('Vodyanitsa');delete vody.teamBuff.premod.anemo_enemyRes_;
 e.input.nonStacking.vodyAnemoEnemyDamageReduction={operation:'read',operands:[],path:['nonStacking','vodyAnemoEnemyDamageReduction'],accu:'max',type:'number',info:{unit:'%'}};
 vody.teamBuff.nonStacking.vodyAnemoEnemyDamageReduction={operation:'threshold',operands:[e.input.asc,C(1),on('Vodyanitsa','skillSong',on('Vodyanitsa','a1Vortex',C(.35))),Z],emptyOn:'l'};
 for(const path of ['a4LeadVocal','a4Chorus','c1Heal','c2State','c4State'])guard(vody,'Vodyanitsa',path,node=>on('Vodyanitsa','skillSong',node,C('off')));
 const venti=sheet('Venti');
 venti.premod.anemo_dmg_=Z;
 venti.premod.critDMG_=rank(6,match(flag('Venti','c6'),C('takeDmg'),C(1)));
 venti.teamBuff.premod.anemo_dmg_=rank(4,on('Venti','lockC4SkillBurst',C(.25),match(target,C('Venti'),match(flag('Venti','c4'),C('pickup'),C(.25)))));
 for(const stat of ['anemo_enemyRes_','physical_enemyRes_']){
  const c6=stat==='anemo_enemyRes_'?rank(6,match(flag('Venti','c6'),C('takeDmg'),C(-.2))):Z;
  venti.teamBuff.premod[stat]=e.sum(rank(2,{operation:'lookup',operands:[flag('Venti','c2'),Z],table:{hit:C(-.24),launched:C(-.24)}}),c6);
 }
 const nicole=sheet('Nicole');nicole.flags||={};nicole.flags.c6Guidance=flag('Nicole','c6Guidance');add('Nicole','c6Guidance');
 const collective=rank(6,on('Nicole','c6Guidance',C(1)));
 const guided=match(collective,C(1),C(1),match(target,C('Nicole'),on('Nicole','a4NicoleGuidance',C(1)),match(active,target,on('Nicole','a1GuidanceActive',C(1)))));
 const grace=nicole.display.skill.skillGraceActive_atk;
 nicole.total.atk=Z;
 nicole.teamBuff.total.atk=e.sum(grace,rank(2,on('Nicole','skillGraceActive',C(300))),asc(1,on('Nicole','skillGraceActive',match(guided,C(1),C(300)))));
 nicole.teamBuff.premod.enemyDefIgn_=rank(6,on('Nicole','skillGraceActive',match(guided,C(1),C(.4))));
 guard(nicole,'Nicole','c4Pathfinder',node=>on('Nicole','skillGraceActive',match(guided,C(1),node,C('off')),C('off')));
 const linnea=sheet('Linnea');linnea.premod.def_=rank(4,on('Linnea','c4Moondrift',C(.25)));
 const ayaka=sheet('KamisatoAyaka');ayaka.premod.cryo_dmg_=asc(4,match(flag('KamisatoAyaka','afterApplySprint'),C('afterApplySprint'),C(.18)));
 const qiqi=sheet('Qiqi');qiqi.premod.atk_=rank(2,on('Qiqi','lockRevelation',match(flag('Qiqi','lockStellarRadianceSc'),C('on'),C(.5),match(flag('Qiqi','lockStellarRadianceSc'),C('ss'),C(.5)))));
 e.input.nonStacking.qiqiCryoSwirl={operation:'read',operands:[],path:['nonStacking','qiqiCryoSwirl'],accu:'max',type:'number',info:{unit:'%'}};
 qiqi.teamBuff.nonStacking.qiqiCryoSwirl=qiqi.teamBuff.premod.swirl_dmg_;delete qiqi.teamBuff.premod.swirl_dmg_;
 e.input.nonStacking.qiqiEnemyAttackReduction={operation:'read',operands:[],path:['nonStacking','qiqiEnemyAttackReduction'],accu:'max',type:'number',info:{unit:'%'}};
 qiqi.teamBuff.nonStacking.qiqiEnemyAttackReduction=rank(4,on('Qiqi','c4Talisman',C(.2)));add('Qiqi','c4Talisman');
 const copies=new WeakMap(),copyCryo=node=>{if(!node||typeof node!=='object')return node;if(copies.has(node))return copies.get(node);if(node.operation==='read'&&node.path?.join('.')==='total.swirl_dmg_')return e.sum(node,e.input.nonStacking.qiqiCryoSwirl);const out=Array.isArray(node)?[]:{};copies.set(node,out);for(const[k,v]of Object.entries(node))out[k]=copyCryo(v);return out;};
 for(const ch of Object.values(e.characters))if(ch.sheetData.display.reaction?.cryoSwirl)ch.sheetData.display.reaction.cryoSwirl=copyCryo(ch.sheetData.display.reaction.cryoSwirl);
 guard(somnia,'Somnia','multiplication',node=>on('Somnia','cycloneActive',node,C('off')));
 guard(somnia,'Somnia','subtraction',node=>match(flag('Somnia','multiplication'),C('on'),C('off'),node));
 guard(sheet('Varesa'),'Varesa','c4Diligent',node=>match(flag('Varesa','c4FpApex'),C('on'),C('off'),node));
 guard(sheet('Mavuika'),'Mavuika','c2RingForm',node=>match(flag('Mavuika','c2FlameForm'),C('on'),C('off'),node));
 guard(sheet('Mavuika'),'Mavuika','a4TimeSinceBurst',node=>({operation:'lookup',operands:[flag('Mavuika','burstSpirit'),C('off')],table:Object.fromEntries(Array.from({length:11},(_,i)=>[String(100+i*10),node]))}));
 const mavuika=sheet('Mavuika'),points={operation:'lookup',operands:[flag('Mavuika','burstSpirit'),Z],table:Object.fromEntries(Array.from({length:11},(_,i)=>[String(100+i*10),C(100+i*10)]))};
 const phase={operation:'lookup',operands:[flag('Mavuika','a4TimeSinceBurst'),Z],table:Object.fromEntries(Array.from({length:20},(_,i)=>[String(i),{operation:'threshold',operands:[e.input.constellation,C(4),e.sum(mul(points,C(.002)),C(.1)),mul(points,C(.002*(20-i)/20))],emptyOn:'l'}]))};
 mavuika.teamBuff.premod.all_dmg_=match(active,target,asc(4,{operation:'lookup',operands:[flag('Mavuika','burstSpirit'),Z],table:Object.fromEntries(Array.from({length:11},(_,i)=>[String(100+i*10),phase]))}));
 mavuika.teamBuff.premod.enemyDefRed_=e.sum(mavuika.teamBuff.premod.enemyDefRed_,rank(6,on('Mavuika','c2FlameForm',C(.2))));
 const xinyan=sheet('Xinyan'),chargedAtk=xinyan.premod.atk;delete xinyan.premod.atk;
 for(const node of Object.values(xinyan.display.charged)){node.data.total||={};node.data.total.atk=e.sum(node.data.total.atk||Z,chargedAtk);}
 xinyan.display.constellation6||={};xinyan.display.constellation6.chargedAtk=chargedAtk;
 for(const gender of ['F','M']){
  const key='TravelerAnemo'+gender,s=sheet(key);s.premod.dmgRed_=rank(4,on(key,'c4SkillActive',C(.1)));add(key,'c4SkillActive');
  const cryoKey='TravelerCryo'+gender,cryo=sheet(cryoKey);
  for(const stat of ['stellarconduct_dmg_','stellarswirl_dmg_'])cryo.teamBuff.premod[stat]=match(target,C(cryoKey),Z,cryo.teamBuff.premod[stat]);
  for(const element of ['Anemo','Geo','Electro','Dendro','Hydro','Pyro','Cryo']){
   const travelerKey='Traveler'+element+gender,traveler=sheet(travelerKey);
   rewrite(traveler,node=>{if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path[1]==='Traveler'){node.path=[...node.path];node.path[1]=travelerKey;add(travelerKey,node.path[2]);}});
  }
 }
 // Each token has exactly one possible owner in a team. Additive accumulation
 // gives zero when that owner is absent; max on an empty set gave -Infinity.
 const uniqueTokens=new Set(['dionaCryoSwirl','dionaEnemyAttackReduction','qiqiCryoSwirl','qiqiEnemyAttackReduction','vodyAnemoEnemyDamageReduction']);
 for(const key of uniqueTokens)e.input.nonStacking[key].accu='add';
 for(const character of Object.values(e.characters))rewrite(character.sheetData,node=>{if(node.operation==='read'&&node.path?.[0]==='nonStacking'&&uniqueTokens.has(node.path[1]))node.accu='add';});
}
