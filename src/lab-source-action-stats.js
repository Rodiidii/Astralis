// Typed source effects also apply when the active character uses local coefficients.
export function sourceAttackEffects(stats={},kind='skill',element='physical'){
 return {
  bonus:(Number(stats[kind+'Dmg'])||0)+(Number(stats[element+'Dmg'])||0)+(kind==='normal'&&element&&element!=='physical'?(Number(stats.normalElementalDmg)||0):0),
  flat:(Number(stats[kind+'FlatDamage'])||0)+(Number(stats[element+'FlatDamage'])||0),
  stats:{...stats,critRate:(Number(stats.critRate)||0)+(Number(stats[kind+'CritRate'])||0),critDmg:(Number(stats.critDmg)||0)+(Number(stats[element+'CritDmg'])||0)+(Number(stats[kind+'CritDmg'])||0)},
 };
}
export function sourceReactionEffects(reaction,stats={},resistances={},baseResistance=10){
 if(!reaction)return reaction;
 const id=({lunarBloom:'lunarbloom',stellarConduct:'stellarconduct',stellarSwirl:'stellarswirl'})[reaction.id]||reaction.id;
 const element=({bloom:'dendro',hyperbloom:'dendro',burgeon:'dendro',burning:'pyro',overload:'pyro',superconduct:'cryo',electroCharged:'electro',aggravate:'electro',spread:'dendro',lunarbloom:'dendro',stellarconduct:'electro'})[id];
 return {...reaction,bonus:(Number(reaction.bonus)||0)+(Number(stats[id+'Dmg'])||0)/100+(id==='swirl'&&reaction.element==='cryo'?(Number(stats.cryoSwirlDmg)||0)/100:0),...(element&&Number.isFinite(resistances[element])?{enemyResistance:baseResistance/100,resistanceReduction:baseResistance/100-resistances[element]}:{})};
}
