// Moteur pur de dégâts Genshin. Les coefficients de kit et tables de niveau viennent
// des données publiées; toute valeur absente est refusée avec TODO_DATA.
export const DAMAGE_FORMULA_VERSION = 'genshin-damage-v5';
export const RESISTANCE_MULTIPLIER = res => res < 0 ? 1 - res / 2 : res < .75 ? 1 - res : 1 / (4 * res + 1);
export const DEFENSE_MULTIPLIER = (attackerLevel, enemyLevel, reduction = 0, ignore = 0) => {
  const a=Number(attackerLevel),e=Number(enemyLevel);
  if(!Number.isFinite(a)||!Number.isFinite(e)||a<1||e<1)return null;
  const r=Math.max(0,Math.min(.9,Number(reduction)||0)),i=Math.max(0,Math.min(1,Number(ignore)||0));
  return (a+100)/((a+100)+(e+100)*(1-r)*(1-i));
};
export const amplifyingReactionMultiplier=(em,bonus=0)=>1+2.78*Math.max(0,em)/(Math.max(0,em)+1400)+bonus;
export const transformativeReactionMultiplier=(em,bonus=0)=>1+16*Math.max(0,em)/(Math.max(0,em)+2000)+bonus;
export const ADDITIVE_REACTION_EM_MULTIPLIER=em=>1+5*Math.max(0,em)/(Math.max(0,em)+1200);
// Coefficients des réactions standards; le multiplicateur dépendant du niveau
// doit être fourni par la base de données correspondant à la version du jeu.
export const TRANSFORMATIVE_REACTION_COEFFICIENTS=Object.freeze({overload:2.75,superconduct:1.5,electroCharged:2,shatter:3,bloom:2,hyperbloom:3,burgeon:3,burning:.25,swirl:.6});
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
export function finalStats(base={},bonuses={}){
  const out={};
  for(const stat of ['hp','atk','def'])out[stat]=finite(base[stat])*(1+finite(bonuses[`${stat}Pct`])/100)+finite(bonuses[`${stat}Flat`]);
  for(const stat of ['em','critRate','critDmg','dmgBonus','er','healing','defReduction','defIgnore'])out[stat]=finite(base[stat])+finite(bonuses[stat]);
  for(const element of ['pyro','hydro','cryo','electro','anemo','geo','dendro','physical'])out[`${element}Dmg`]=finite(base[`${element}Dmg`])+finite(bonuses[`${element}Dmg`]);
  return out;
}
export function calculateHit(input={}){
  const {stats={},baseStat='atk',talentMultiplier,flatDamage=0,attackerLevel,enemyLevel=100,enemyResistance=.1,enemyDefenseReduction=0,defenseIgnore=0,damageBonus=0,damageReduction=0,resistanceReduction=0,critMode='average',reaction=null}=input;
  const warnings=[];
  if(!Number.isFinite(Number(talentMultiplier))||Number(talentMultiplier)<=0)return {ok:false,error:'TODO_DATA: multiplicateur du talent absent ou invalide.',warnings:['TODO_DATA']};
  if(!['atk','def','hp','em'].includes(baseStat)||!Number.isFinite(Number(stats[baseStat]))||Number(stats[baseStat])<=0)return {ok:false,error:`TODO_DATA: stat de référence ${baseStat||'du personnage'} absente ou invalide.`,warnings:['TODO_DATA']};
  if(!Number.isFinite(Number(attackerLevel))||attackerLevel<1||attackerLevel>100)return {ok:false,error:'Niveau du personnage requis (1–100).',warnings};
  if(!Number.isFinite(Number(enemyLevel))||enemyLevel<1)return {ok:false,error:'Niveau de l’ennemi invalide.',warnings};
  if(!['average','crit','nonCrit'].includes(critMode))return {ok:false,error:'Mode CRIT inconnu.',warnings};
  const base=Number(stats[baseStat])*Number(talentMultiplier)*finite(input.talentScale,1)+finite(flatDamage),def=DEFENSE_MULTIPLIER(attackerLevel,enemyLevel,enemyDefenseReduction,defenseIgnore);
  const effectiveResistance=Math.max(-1,Math.min(10,finite(enemyResistance)-finite(resistanceReduction))),res=RESISTANCE_MULTIPLIER(effectiveResistance);
  const rate=Math.max(0,finite(stats.critRate))/100,cd=Math.max(0,finite(stats.critDmg))/100;
  const crit=critMode==='nonCrit'?1:critMode==='crit'?1+cd:1+Math.min(rate,1)*cd;
  let additive=0,reactionMultiplier=1,reactionName='',transformCoefficient=null,transformLevel=null,transformEm=1,transformRes=res;
  const em=Math.max(0,finite(stats.em)),reactionBonus=finite(reaction?.bonus); // fraction, e.g. 0.20 = +20%
  if(reaction){
    reactionName=reaction.name||'Réaction';
    if(reaction.kind==='amplifying'){
      const amp=Number(reaction.baseMultiplier);
      if(![1.5,2].includes(amp))warnings.push('TODO_DATA: sélectionne le multiplicateur amplifiant vérifié (1,5 ou 2).');
      else reactionMultiplier=amp*amplifyingReactionMultiplier(em,reactionBonus);
    }else if(reaction.kind==='additive'){
      const coefficient=Number(reaction.coefficient),level=Number(reaction.levelMultiplier);
      if(!Number.isFinite(coefficient)||coefficient<=0||!Number.isFinite(level)||level<=0)warnings.push('TODO_DATA: coefficient de réaction ou multiplicateur de niveau manquant.');
      else additive=coefficient*level*(ADDITIVE_REACTION_EM_MULTIPLIER(em)+reactionBonus);
    }else if(reaction.kind==='transformative'){
      const coefficient=Number(reaction.coefficient??TRANSFORMATIVE_REACTION_COEFFICIENTS[reaction.id]),level=Number(reaction.levelMultiplier);
      if(!Number.isFinite(coefficient)||coefficient<=0||!Number.isFinite(level)||level<=0)warnings.push('TODO_DATA: multiplicateur de niveau de réaction manquant.');
      else{transformCoefficient=coefficient;transformLevel=level;transformEm=transformativeReactionMultiplier(em,reactionBonus);transformRes=RESISTANCE_MULTIPLIER(Math.max(-1,Math.min(10,finite(reaction.enemyResistance,finite(enemyResistance))-finite(reaction.resistanceReduction,finite(resistanceReduction)))));}
    }else warnings.push('TODO_DATA: type de réaction non reconnu.');
  }
  if(warnings.length)return {ok:false,error:warnings.join(' '),warnings};
  const elementBonus=finite(stats[`${input.elementKey||'physical'}Dmg`]);
  // La réduction des dégâts est une mécanique défensive entrante : elle ne réduit
  // pas les dégâts infligés par cette attaque.
  const totalBonus=(finite(stats.dmgBonus)+elementBonus+finite(damageBonus))/100,bonusMultiplier=Math.max(0,1+totalBonus);
  const direct=(base+additive)*bonusMultiplier*crit*def*res*reactionMultiplier;
  // Les dégâts transformateurs sont un événement séparé: ils ne critiquent pas,
  // n'utilisent pas la DEF ni les bonus DGT classiques. Ils restent séparés du direct.
  const transformative=transformCoefficient==null?0:transformCoefficient*transformLevel*transformEm*transformRes;
  return {ok:true,total:direct+transformative,direct,base,additive,transformative,bonusMultiplier,critMultiplier:crit,defenseMultiplier:def,resistanceMultiplier:res,reactionMultiplier,reactionName,elementBonusPercent:elementBonus,warnings,
    terms:{formula:'(stat finale × multiplicateur du talent + dégâts plats + additif) × bonus DGT × CRIT × DEF × RÉS × amplification ; dégâts transformateurs séparés',baseStat,referencedStat:finite(stats[baseStat]),talentMultiplier:Number(talentMultiplier),talentScale:finite(input.talentScale,1),flatDamage:finite(flatDamage),enemyLevel:Number(enemyLevel),enemyResistance:effectiveResistance,transformativeCoefficient:transformCoefficient,transformativeLevelMultiplier:transformLevel,reactionBonusFraction:reactionBonus,damageBonusPercent:totalBonus*100,critMode,additiveEmMultiplier:reaction?.kind==='additive'?ADDITIVE_REACTION_EM_MULTIPLIER(em):null,transformativeEmMultiplier:transformCoefficient==null?null:transformEm}};
}

/** Resolve separate hit groups with an explicit number of reaction-triggering hits. */
export function calculateAction(input={}) {
  const parts=input.components?.length?input.components:[{talentMultiplier:input.talentMultiplier,count:input.hitCount??1}];
  const totalHits=parts.reduce((sum,part)=>sum+Number(part.count??1),0);
  if(!Number.isInteger(totalHits)||totalHits<1||totalHits>1000)return {ok:false,error:'Nombre de coups invalide.',warnings:[]};
  let reacting=input.reaction?Math.max(0,Math.min(totalHits,Number(input.reactingHits??totalHits))):0;
  if(!Number.isInteger(reacting))return {ok:false,error:'Nombre de coups avec réaction invalide.',warnings:[]};
  let result;
  const poolState={...(input.poolState||{})},triggered={};
  const targets=Math.max(1,Math.min(100,Math.floor(Number(input.targetCount)||1)));
  for(const part of parts){
    const count=Number(part.count??1);
    if(!Number.isInteger(count)||count<1)return {ok:false,error:'Groupe de coups invalide.',warnings:[]};
    for(let index=0;index<count;index++){
      const reaction=reacting-->0?input.reaction:null;
      for(let target=0;target<targets;target++){
        let extra=0;
        for(const pool of input.additivePools||[]){
          if(pool.element&&pool.element!==input.elementKey||pool.kinds&&!pool.kinds.includes(input.actionKind)||Number(input.elapsed||0)>=Number(pool.expiresAt??Infinity))continue;
          const remaining=poolState[pool.id]??Number(pool.charges||0),unlimited=pool.unlimitedKinds?.includes(input.actionKind);
          if(remaining<=0)continue;
          extra+=Number(pool.flatDamage)||0;
          poolState[pool.id]=unlimited?remaining:remaining-1;
          triggered[pool.id]=(triggered[pool.id]||0)+1;
        }
        const hit=calculateHit({...input,flatDamage:finite(input.flatDamage)+extra,talentMultiplier:part.talentMultiplier,baseStat:part.baseStat||input.baseStat,reaction});
        if(!hit.ok)return hit;
        if(!result)result={...hit,total:0,direct:0,base:0,additive:0,transformative:0,totalHits,poolState,triggered};
        for(const key of ['total','direct','base','additive','transformative'])result[key]+=hit[key];
      }
    }
  }
  return {...result,terms:{...result.terms,hitGroups:parts,totalHits,reactingHits:Number(input.reactingHits??totalHits)}};
}
