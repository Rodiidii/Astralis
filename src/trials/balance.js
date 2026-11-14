export const TRIALS_BALANCE = Object.freeze({
  party: Object.freeze({ energyMode: 5, noHealMode: 4, favoriteSlots: 2, highRarityLimit: 1, recruitCapEnergy: 6, recruitCapNoHeal: 5, startingActivity: 100, participationCost: 12, skillCost: 5, burstCost: 14, burstEnergy: 60 }),
  map: Object.freeze({ floorsPerZone: 6, easyZones: 5, sanctuariesPerRun: 3, floorBoosters: 10 }),
  combat: Object.freeze({ autoAttackPerSecond: 13, enemyAttackEvery: 4, enemyAttackDamage: 16, skillMultiplier: 3.2, burstMultiplier: 5.8, skillCooldown: 7, speedChoices: Object.freeze([1, 2, 3]) }),
  enemy: Object.freeze({ hpPerZone: 1.22, attackPerZone: 1.14, noHealPressure: Object.freeze([.95,1,.65,.65,.9]), infiniteHpAfterZone5: 1.01, infiniteAttackAfterZone5: 1.01, normalEncounterMultiplier: 2.8, bossHpMultiplier: 6.2, weeklyBossMultiplier: 2.2, weeklyBossInfiniteMultiplier: 1.3, eliteHpMultiplier: 1.45 }),
  rewards: Object.freeze({ healTeam: 24, healPair: 55, infiniteZoneHeal: 15, energyRestore: 22, eliteRecruitBonus: 1, baseScore: 100 }),
  targets: Object.freeze({ easyWinsByZone: Object.freeze([.92, .82, .68, .52, .38]), noHealMargin: .12, infiniteMedianZone: 7.5 }),
});

export function damageFormula({ attack = 100, multiplier = 1, defense = 100, resistance = 0.1, bonus = 0, reaction = 1 } = {}) {
  const defenseMultiplier = 190 / (190 + Math.max(0, defense));
  const resistanceMultiplier = resistance < 0 ? 1 - resistance / 2 : resistance < .75 ? 1 - resistance : 1 / (4 * resistance + 1);
  return Math.max(0, attack * multiplier * (1 + bonus) * defenseMultiplier * resistanceMultiplier * reaction);
}

export function bossHp(zone, base, boss = false, elite = false, infinite = false, weekly = false) {
  const earlyZones=Math.min(Math.max(0,zone-1),4),afterFifth=Math.max(0,zone-5),growth=TRIALS_BALANCE.enemy.hpPerZone**earlyZones*(infinite?TRIALS_BALANCE.enemy.infiniteHpAfterZone5:TRIALS_BALANCE.enemy.hpPerZone)**afterFifth;
  const encounterScale=weekly?(infinite?TRIALS_BALANCE.enemy.weeklyBossInfiniteMultiplier:TRIALS_BALANCE.enemy.weeklyBossMultiplier):boss?TRIALS_BALANCE.enemy.bossHpMultiplier:elite?TRIALS_BALANCE.enemy.eliteHpMultiplier:TRIALS_BALANCE.enemy.normalEncounterMultiplier;
  return Math.round(base * growth * encounterScale);
}
export function enemyAttackScale(zone,infinite=false){const earlyZones=Math.min(Math.max(0,zone-1),4),afterFifth=Math.max(0,zone-5);return TRIALS_BALANCE.enemy.attackPerZone**earlyZones*(infinite?TRIALS_BALANCE.enemy.infiniteAttackAfterZone5:TRIALS_BALANCE.enemy.attackPerZone)**afterFifth;}
export function sanctuaryZonesInCycle(){const count=TRIALS_BALANCE.map.sanctuariesPerRun;if(count===2)return [2,TRIALS_BALANCE.map.easyZones];if(count===3)return [2,4,TRIALS_BALANCE.map.easyZones];return Array.from({length:count},(_,index)=>Math.ceil((index+1)*TRIALS_BALANCE.map.easyZones/count));}

export function expeditionCost(kind, casts = 1) {
  const costs = { participation: TRIALS_BALANCE.party.participationCost, skill: TRIALS_BALANCE.party.skillCost, burst: TRIALS_BALANCE.party.burstCost };
  return Math.max(0, (costs[kind] || 0) * Math.max(0, casts));
}
