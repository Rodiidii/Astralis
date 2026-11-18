// KQM original TC research: https://keqingmains.com/misc/stellar-reaction-guide/
// https://keqingmains.com/misc/lunar/ . Percent inputs here are fractions.
export const SPECIAL_EM_BONUS=em=>6*Math.max(0,Number(em)||0)/(2000+Math.max(0,Number(em)||0));
export function stellarConductField(hits=0){
 const count=Math.max(0,Math.min(12,Math.floor(Number(hits)||0)));
 const coefficient=count?1.4+.05*count:1;
 return {count,coefficient,cryoDmg:20*coefficient,electroDmg:20*coefficient,physicalResReduction:40};
}
const resMultiplier=res=>res<0?1-res/2:res<.75?1-res:1/(4*res+1);
export function calculateContributorReaction({id,contributors=[],critMode='average',phase='initial',vortexLevel=1,enemyResistance=.1,resistanceReduction=0}={}){
 const coefficients={lunarCharged:3,lunarCrystallize:1.6,stellarSwirl:phase==='initial'?.75:Number(vortexLevel)===2?3:2};
 const coefficient=coefficients[id];
 if(!coefficient)return {ok:false,error:'Cette réaction ne produit pas de dégâts collectifs modélisés.',warnings:['TODO_DATA']};
 if(!['average','crit','nonCrit'].includes(critMode)||!contributors.length||contributors.length>4)return {ok:false,error:'Sélectionne de 1 à 4 contributeurs et un mode CRIT valide.',warnings:['TODO_DATA']};
 if(contributors.some(member=>!Number.isFinite(Number(member.levelMultiplier))||Number(member.levelMultiplier)<=0||['em','critRate','critDmg'].some(key=>!Number.isFinite(Number(member[key]))||member[key]<0)))return {ok:false,error:'TODO_DATA: niveau, maîtrise et CRIT requis pour chaque contributeur.',warnings:['TODO_DATA']};
 if(critMode==='average'){
  let total=0,last;const averages=new Map();
  for(let mask=0;mask<(1<<contributors.length);mask++){
   let probability=1;
   const outcome=contributors.map((member,index)=>{
    const critical=!!(mask&(1<<index)),rate=Math.min(100,member.critRate)/100;
    probability*=critical?rate:1-rate;
    return {...member,critDmg:critical?member.critDmg:0};
   });
   if(!probability)continue;
   last=calculateContributorReaction({id,contributors:outcome,critMode:'crit',phase,vortexLevel,enemyResistance,resistanceReduction});
   if(!last.ok)return last;
   total+=last.total*probability;
   for(const row of last.contributions){const previous=averages.get(row.id)||{id:row.id,damage:0,weighted:0};previous.damage+=row.damage*probability;previous.weighted+=row.weighted*probability;averages.set(row.id,previous);}
  }
  const contributions=[...averages.values()].sort((a,b)=>b.weighted-a.weighted);
  return {...last,total,transformative:total,contributions,terms:{...last.terms,contributions,expectedCrit:true,formula:'Moyenne exacte des issues CRIT : classement et pondération recalculés pour chaque issue'}};
 }
 const contributions=[];
 for(const member of contributors){
  if(!Number.isFinite(Number(member.levelMultiplier))||Number(member.levelMultiplier)<=0||['em','critRate','critDmg'].some(key=>!Number.isFinite(Number(member[key]))||member[key]<0))return {ok:false,error:'TODO_DATA: niveau, maîtrise et CRIT requis pour chaque contributeur.',warnings:['TODO_DATA']};
  const crit=critMode==='nonCrit'?1:critMode==='crit'?1+member.critDmg/100:1+Math.min(100,member.critRate)/100*member.critDmg/100;
  const base=coefficient*member.levelMultiplier*(1+Number(member.baseBonus||0));
  const damage=(base*(1+SPECIAL_EM_BONUS(member.em)+Number(member.bonus||0))+Number(member.flatDamage||0))*crit*(1+Number(member.elevation||0))*resMultiplier(enemyResistance-resistanceReduction);
  if(!Number.isFinite(damage)||damage<0)return {ok:false,error:'Paramètres de réaction invalides.',warnings:['TODO_DATA']};
  contributions.push({id:member.id,damage});
 }
 // Rank each outcome before applying the 60/30/5/5 contribution weights.
 const weights=[.6,.3,.05,.05];
 contributions.sort((a,b)=>b.damage-a.damage);
 contributions.forEach((row,index)=>{row.weight=weights[index];row.weighted=row.damage*row.weight;});
 const total=contributions.reduce((sum,row)=>sum+row.weighted,0);
 return {ok:true,total,direct:0,base:0,additive:0,transformative:total,bonusMultiplier:1,critMultiplier:1,defenseMultiplier:1,resistanceMultiplier:resMultiplier(enemyResistance-resistanceReduction),reactionMultiplier:coefficient,reactionName:id,warnings:[],contributions,terms:{formula:'Somme des contributions classées × poids 60 %, 30 %, 5 %, 5 %',contributions,phase,vortexLevel}};
}
