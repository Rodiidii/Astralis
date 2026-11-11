import {COMPLEX_PARAMS as D,COMPLEX_REVISION} from './complex-effect-data.js';
export {COMPLEX_REVISION};
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const level=(table,value)=>table[Math.floor(clamp(value||10,1,table.length))-1];
const active=(config,time,duration)=>config?.enabled&&time>=Number(config.startedAt||0)&&time<Number(config.startedAt||0)+duration;
const characterId=value=>String(value?.id||value?._id||value||'');
export function furinaFanfare(config={}){
 const c=clamp(config.constellation,0,6),base=c>=1?D.Furina.constellation1[0]:0,cap=D.Furina.burst[3][0]+(c>=1?D.Furina.constellation1[1]:0),gain=clamp(config.hpChangePercent,0,100000)*(c>=2?1+D.Furina.constellation2[3]:1);
 const total=config.mode==='manual'?clamp(config.fanfare,0,cap)+clamp(config.excess,0,400):base+gain;
 const fanfare=Math.min(cap,total),excess=Math.max(0,total-cap),hpPct=c>=2?Math.min(D.Furina.constellation2[4],excess*D.Furina.constellation2[1])*100:0;
 const talent=clamp(config.talentLevel||10,1,13)+(c>=3&&config.includeConstellationLevels!==false?3:0);
 return {fanfare,cap,excess,hpPct,dmgBonus:fanfare*level(D.Furina.burst[4],talent)*100,incomingHealing:fanfare*level(D.Furina.burst[5],talent)*100};
}
export function complexEffects(config={},context={}){
 const bonuses={},pools=[],details=[],warnings=[],time=Number(context.elapsed)||0,id=characterId(context.character),element=context.elementKey||'physical',kind=context.actionKind||'skill',team=context.teamElements||[],isCryo=element==='cryo';let talentScale=1,flatDamage=0;
 const add=(values,name)=>{for(const [key,value]of Object.entries(values))bonuses[key]=(bonuses[key]||0)+value;details.push({name,bonuses:values});};
 const azure=config.azurelight;
 if(active(azure,time,12)){
  if(String(context.weaponId)!=='11517')warnings.push('Éclazur : cette arme doit être équipée pour appliquer son passif.');
  else{const rank=clamp(azure.refinement||context.refinement||1,1,5),attack=24+6*(rank-1);add({atkPct:attack*(azure.zeroEnergy?2:1),...(azure.zeroEnergy?{critDmg:40+10*(rank-1)}:{})},'Éclazur · après E'+(azure.zeroEnergy?' · énergie nulle':''));}
 }
 const furina=config.furina;
 if(active(furina,time,D.Furina.burst[1][0])){
  const state=furinaFanfare(furina);add({dmgBonus:state.dmgBonus,...(id==='10000089'?{hpPct:state.hpPct}:{})},'Furina · '+state.fanfare+' / '+state.cap+' fanfare');
  details.push({name:'Furina · excédent C2 réservé à Furina',fanfare:state.fanfare,hpPct:state.hpPct});
 }
 const esco=config.escoffier;
 if(active(esco,time,D.Escoffier.passive2[4][0])){
  const count=team.filter(el=>el==='hydro'||el==='cryo').length;
  if(!team.length)warnings.push('Escoffier : composition à renseigner pour déterminer la réduction de RES.');
  else if(isCryo||element==='hydro')add({resReduction:(D.Escoffier.passive2[Math.min(4,count)-1]?.[0]||0)*100},'Escoffier · '+count+' personnages Hydro/Cryo');
 }
 if(esco?.enabled&&Number(esco.constellation)>=1&&active(esco,time,D.Escoffier.constellation1[1])&&team.length===4&&team.every(el=>['hydro','cryo'].includes(el))&&isCryo)add({critDmg:D.Escoffier.constellation1[0]*100},'Escoffier C1 · DGT CRIT Cryo');
 if(esco?.enabled&&Number(esco.constellation)>=2&&id!=='10000112'&&isCryo&&active(esco,time,D.Escoffier.constellation2[0])){
  if(!(Number(esco.atk)>0)||!Number.isFinite(Number(esco.atk)))warnings.push('Escoffier C2 : ATQ finale source requise.');
  else pools.push({id:'escoffier-c2:'+id+':'+Number(esco.startedAt||0),flatDamage:Number(esco.atk)*D.Escoffier.constellation2[1],charges:D.Escoffier.constellation2[2],element:'cryo',expiresAt:Number(esco.startedAt||0)+D.Escoffier.constellation2[0]});
 }
 const mona=config.mona;
 if(active(mona,time,level(D.Mona.burst[3],mona?.talentLevel||10)+clamp(mona?.freezeExtension,0,30))){add({dmgBonus:level(D.Mona.burst[6],mona.talentLevel||10)*100,...(Number(mona.constellation)>=4?{critRate:Math.abs(D.Mona.constellation4[0])*100}:{})},'Mona · Présage'+(Number(mona.constellation)>=4?' · C4':''));}
 const shenhe=config.shenhe,hold=shenhe?.cast==='hold',shenheLevel=clamp(shenhe?.talentLevel||10,1,13)+(Number(shenhe?.constellation)>=3&&shenhe?.includeConstellationLevels!==false?3:0),shenheDuration=D.Shenhe.skill[hold?4:3][0];
 if(active(shenhe,time,shenheDuration)){
  if(isCryo){
   if(!(Number(shenhe.atk)>0)||!Number.isFinite(Number(shenhe.atk)))warnings.push('Shenhe : ATQ finale source requise pour les plumes de glace.');
   else pools.push({id:'shenhe-quill:'+id+':'+Number(shenhe.startedAt||0),flatDamage:Number(shenhe.atk)*level(D.Shenhe.skill[2],shenheLevel),charges:D.Shenhe.skill[hold?6:5][0],element:'cryo',expiresAt:Number(shenhe.startedAt||0)+shenheDuration,unlimitedKinds:Number(shenhe.constellation)>=6?['normal','charged']:[]});
  }
  if((hold&&['normal','charged','plunge'].includes(kind))||(!hold&&['skill','burst'].includes(kind)))add({[kind+'Dmg']:D.Shenhe.passive2[hold?2:0][0]*100},'Shenhe · passif après '+(hold?'appui long':'appui court'));
 }
 const burstDuration=D.Shenhe.burst[3][0]+(Number(shenhe?.constellation)>=2?D.Shenhe.constellation2[0]:0);
 if(shenhe?.enabled&&shenhe.burst&&time>=Number(shenhe.burstStartedAt??shenhe.startedAt??0)&&time<Number(shenhe.burstStartedAt??shenhe.startedAt??0)+burstDuration){
  if(isCryo||element==='physical')add({resReduction:level(D.Shenhe.burst[1],shenhe.burstLevel||10)*100},'Shenhe · réduction de RES du déchaînement');
  if(isCryo&&context.fightPosition!=='off'&&shenhe.insideField!==false)add({cryoDmg:D.Shenhe.passive1[0][0]*100,...(Number(shenhe.constellation)>=2?{critDmg:D.Shenhe.passive1[0][0]*100}:{})},'Shenhe · dans le champ du déchaînement');
 }
 const yunjin=config.yunjin;
 if(active(yunjin,time,D.YunJin.burst[2][0])&&kind==='normal'){
  const sourceDef=Number(yunjin.def),diversity=new Set(team.filter(el=>['pyro','hydro','cryo','electro','anemo','geo','dendro'].includes(el))).size;
  const talent=clamp(yunjin.talentLevel||10,1,13)+(Number(yunjin.constellation)>=3&&yunjin.includeConstellationLevels!==false?3:0);
  if(!(sourceDef>0)||!Number.isFinite(sourceDef))warnings.push('Yun Jin : DÉF finale source requise pour la formation.');
  else if(yunjin.passive2!==false&&!diversity)warnings.push('Yun Jin : composition à renseigner pour le passif de diversité élémentaire.');
  else{
   const ratio=level(D.YunJin.burst[1],talent)+(yunjin.passive2!==false?D.YunJin.passive2[Math.min(diversity,4)-1][0]:0);
   pools.push({id:'yunjin-banner:'+id+':'+Number(yunjin.startedAt||0),flatDamage:sourceDef*ratio,charges:D.YunJin.burst[5][0],kinds:['normal'],expiresAt:Number(yunjin.startedAt||0)+D.YunJin.burst[2][0]});
   details.push({name:'Yun Jin · formation · '+diversity+' élément(s) · 30 déclenchements / 12 s',flatDamage:sourceDef*ratio,sourceDef,ratio,diversity,charges:30});
  }
  if(Number(yunjin.constellation)>=2)add({normalDmg:D.YunJin.constellation2[0]*100},'Yun Jin C2 · DGT attaques normales');
  if(Number(yunjin.constellation)>=6)details.push({name:'Yun Jin C6 · vitesse des attaques normales +12 % ; ajuster la durée de rotation manuellement'});
 }
 const skirk=config.skirk;
 if(skirk?.enabled&&id==='10000114'){
  const stacks=active({...skirk,startedAt:skirk.deathStacksAt||0},time,20)?Math.floor(clamp(skirk.deathStacks,0,3)):0,c=Math.floor(clamp(context.constellation??skirk.constellation,0,6));
  if(stacks&&isCryo&&((kind==='normal'&&skirk.sevenPhase)||kind==='burst'))talentScale=1+D.Skirk.passive2[(kind==='burst'?4:1)+stacks-1][0];
  if(stacks&&c>=4)add({atkPct:D.Skirk.constellation4[stacks-1]*100},'Skirk C4 · ATQ');
  if(kind==='normal'&&skirk.sevenPhase&&isCryo&&skirk.afterSpecialBurst&&active({...skirk,startedAt:skirk.specialBurstAt||0},time,D.Skirk.skill[12][0]))add({normalDmg:level(D.Skirk.burst[3+Math.floor(clamp(skirk.voidRifts,0,3))],skirk.burstLevel||10)*100},'Skirk · Failles du néant absorbées');
  if(c>=2&&skirk.afterSpecialBurst&&kind==='normal'&&skirk.sevenPhase&&active({...skirk,startedAt:skirk.specialBurstAt||0},time,D.Skirk.constellation2[1]))add({atkPct:D.Skirk.constellation2[2]*100},'Skirk C2 · après déchaînement spécial');
  if(kind==='burst'&&skirk.serpentExtra>0){const excess=clamp(skirk.serpentExtra,0,c>=2?22:12);flatDamage=excess*level(D.Skirk.burst[2],Number(skirk.burstLevel||10)+(c>=3?3:0))*talentScale*(Number(context.stats?.atk)||0);details.push({name:'Skirk · Serpentine excédentaire',flatDamage,excess,talentScale});}
 }
 return {bonuses,pools,talentScale,flatDamage,details,warnings};
}
