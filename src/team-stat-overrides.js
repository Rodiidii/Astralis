export const TEAM_EDITABLE_STATS=['hp','atk','def','em','er','critRate','critDmg','dmgBonus','baseAtk'];
export function normalizeTeamStats(value={}){
 return Object.fromEntries(TEAM_EDITABLE_STATS.flatMap(key=>{
  const raw=value[key],number=Number(raw);
  return raw!==''&&raw!=null&&Number.isFinite(number)&&number>=0?[[key,number]]:[];
 }));
}
export function teamStatOverrides(stats,slot={}){
 return stats?{...stats,...normalizeTeamStats(slot.statOverrides)}:stats;
}
