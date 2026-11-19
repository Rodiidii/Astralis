// Buffs exposed by a support must benefit the simulated character.
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function hasUsefulBuff(row,{own=false,native=false,configured=false}={}) {
 if(row.locked)return false;
 if(native||configured)return true;
 if(['weapon','set'].includes(row.kind))return false;
 const text=fold(row.description).replace(/<[^>]*>/g,' ');
 const stat=/(?:atq|atk|attaque|attack|def|defense|pv max|hp|maitrise|mastery|recharge|energy recharge|crit|bonus.{0,25}(?:dgt|dmg|degats)|(?:dgt|dmg|degats).{0,25}bonus|resistance|res\b)/;
 const modifies=/(?:augmente|augmentent|augmentees?|augmentes?|bonus|diminue|diminuent|reduit|reduisent|reduction|increase|bonus|decrease|reduce|shred)/;
 if(!stat.test(text)||!modifies.test(text)||/(?:augmente le niveau|increases the level)/.test(text))return false;
 const enemyRes=/(?:res|resistance).{0,100}(?:ennemi|adversaire|opponent)|(?:ennemi|adversaire|opponent).{0,100}(?:res|resistance)/;
 if(enemyRes.test(text))return true;
 if(own)return true;
 return /(?:tous les|autres|nearby|other|all).{0,65}(?:personnages|membres|characters|party)|(?:personnage|character).{0,35}(?:actif|deploye|active|on.field)|(?:equipe|party).{0,100}(?:bonus|augmente|increase)/.test(text);
}
export function supportWeaponEffects(weapon,refinement=1,sourceEM=0) {
 const rank=Math.max(1,Math.min(5,Number(refinement)||1));
 const v=(weapon?.['r'+rank]?.values||weapon?.r1?.values||[]).map(value=>Number(String(value).replace('{NON_BREAK_SPACE}','').replace(',','.').match(/[\d.]+/)?.[0]));
 const make=(id,label,condition,bonuses,extra={})=>({id,label,condition,bonuses,...extra});
 const stats=typeof sourceEM==='object'&&sourceEM?sourceEM:{em:sourceEM};
 const em=Math.max(0,Number(stats.em)||0),hp=Math.max(0,Number(stats.hp)||0),atk=Math.max(0,Number(stats.atk)||0),def=Math.max(0,Number(stats.def)||0);
 const rows={
  14523:()=>[make('guidance','Lumière de l’éclaireur','Bouclier créé : bonus du personnage déployé pendant 20 s, selon l’ATQ finale du porteur.',{dmgBonus:Math.min(v[2],atk/1000*v[1])},{sourceStat:'atk',position:'on',stackGroup:'guidance'}),make('hexerei','Lumière pour les héxères','Bouclier créé : personnage optimisé héxère et hors terrain, moitié du bonus.',{dmgBonus:Math.min(v[2],atk/1000*v[1])*.5},{sourceStat:'atk',position:'off',stackGroup:'guidance'})],
  11518:()=>[make('daylight','Lame du jour transmise','Déchaînement ayant touché : personnage optimisé déployé, autre que le porteur, 3 s.',{atkPct:v[2]},{position:'on',stackGroup:'daylight'}),make('hexerei','Lame du jour sous Hexerei','Même bonus transmis avec Hexerei : Rituel secret actif, 3 s.',{atkPct:v[2]*1.75},{position:'on',stackGroup:'daylight'})],
  12503:()=>[make('anthem','Hymne du drapeau','Quatre charmes consommés : ATQ de l’équipe pendant 12 s.',{atkPct:v[2]},{stackGroup:'millennial'})],
  14515:()=>[make('plunge','Écho de la grue','Attaque plongeante du porteur ayant touché : bonus de l’équipe, 20 s.',{plungeDmg:v[0]},{stackGroup:'crane'})],
  13515:()=>[make('edict','Édit électrifiant','Compétence ou déchaînement, puis bouclier créé par le porteur : Sélénocution de l’équipe, 20 s.',{lunarChargedBonus:v[1]},{stackGroup:'fracturedHalo'})],
  15516:()=>[make('mischief','Malice de la nivéole glacée','Faveur du porteur active et voile lunaire proche : bonus aux autres personnages, 6 s.',{geoDmg:v[3],lunarCrystallizeBonus:v[4]},{stackGroup:'goldenFrost'})],
  11511:()=>[make('rhapsody','Rhapsodie partagée','Trois cumuls de Rhapsodie obtenus ou actualisés : maîtrise de l’équipe selon les PV max du porteur, 20 s.',{em:hp*v[2]/100},{sourceStat:'hp',stackGroup:'key'})],
  11516:()=>[make('ode','Ode aux fleurs partagée','Deux cumuls d’ode obtenus ou actualisés : bonus élémentaires de l’équipe selon la DÉF finale du porteur, 15 s.',Object.fromEntries(['pyro','hydro','cryo','electro','anemo','geo','dendro'].map(element=>[element+'Dmg',Math.min(v[3],def/1000*v[2])])),{sourceStat:'def',stackGroup:'peakPatrol'})],
  14520:()=>[make('both','Prière et Verset simultanés','Prière du grand nord et Verset de la nouvelle lune actifs sur le porteur : bonus de réactions d’équipe, non cumulable.',{bloomBonus:v[2],hyperbloomBonus:v[3],burgeonBonus:v[3],lunarBloomBonus:v[4]},{stackGroup:'nightweaver'})],
  14517:()=>[make('mirror','Miroir nocturne','Bouclier créé par le porteur : personnage optimisé déployé et ennemi proche, 15 s.',{dmgBonus:v[1]},{position:'on',stackGroup:'starcaller'})],
  13514:()=>[make('healing','Doux écho transmis','Le personnage optimisé a reçu les soins du porteur et bénéficie de Doux écho : 3 s.',{atkPct:v[2]},{stackGroup:'scent'})],
  14302:()=>[make('handoff','Passage de relais','Le personnage optimisé entre en scène juste après le porteur : bonus pendant 10 s, déclenchement toutes les 20 s.',{atkPct:v[0]},{recipient:'next',stackGroup:'ttds'})],
  12502:()=>[make('lowEnemy','Traque du loup','Le porteur a touché un ennemi sous 30 % de PV : bonus de l’équipe pendant 12 s.',{atkPct:v[1]},{stackGroup:'wolf'})],
  11503:()=>[make('ode','Ode à la révolte','Deux talismans consommés : bonus de l’équipe pendant 12 s.',{normalDmg:v[1],chargedDmg:v[1],plungeDmg:v[1],atkPct:v[2]},{stackGroup:'millennial'})],
  15503:()=>[make('farewell','Chant d’adieu','Quatre talismans consommés : bonus de l’équipe pendant 12 s.',{em:v[1],atkPct:v[2]},{stackGroup:'millennial'})],
  14511:()=>[make('dreams','Rêves partagés','Le porteur fait partie de l’équipe ; la maîtrise bénéficie aux autres personnages.',{em:v[2]})],
  14416:()=>[make('starlight','Étoile partagée','Effet de 12 s actif : les autres personnages obtiennent 30 % du bonus d’ATQ calculé sur la maîtrise du porteur.',{atkFlat:em*v[0]/100*.3},{sourceStat:'em'})],
  12415:()=>[make('aquamarine','Éclat partagé','Effet de 12 s actif : les autres personnages obtiennent 30 % du bonus d’ATQ calculé sur la maîtrise du porteur.',{atkFlat:em*v[0]/100*.3},{sourceStat:'em'})],
  11418:()=>[make('moonlight','Clair de lune partagé','Effet de 12 s actif : les autres personnages obtiennent 30 % du bonus de recharge calculé sur la maîtrise du porteur.',{er:em*v[0]*.3},{sourceStat:'em'})]
 };
 return (rows[Number(weapon?.id)]?.()||[]).filter(row=>Object.values(row.bonuses).every(Number.isFinite));
}
export function partyWeaponBonuses(p,weapons=[],ownWeapon=null,sourceStatsForAlly=ally=>supportWeaponSourceStats(ally)) {
 const out={},groups=new Map();
 for(const ally of p.allies||[]){
  if(!ally.character||String(ally.character)===String(p.character))continue;
  const weapon=weapons.find(w=>[w._id,w.id].map(String).includes(String(ally.weapon)));
  for(const effect of supportWeaponEffects(weapon,ally.refinement,sourceStatsForAlly(ally))){
   const saved=ally.activeWeaponEffects?.[String(weapon.id)+':'+effect.id];
   if(!saved?.enabled||(effect.recipient==='next'&&String(saved.target)!==String(p.character))||(effect.position&&effect.position!==(p.fightPosition||'on')))continue;
   if(effect.stackGroup){
    const previous=groups.get(effect.stackGroup)||{};
    for(const [key,value]of Object.entries(effect.bonuses))previous[key]=Math.max(previous[key]||0,value);
    groups.set(effect.stackGroup,previous);
   }else for(const [key,value]of Object.entries(effect.bonuses))out[key]=(out[key]||0)+value;
  }
 }
 if(Number(ownWeapon?.id)===12502&&p.effectStates?.['weapon:'+String(ownWeapon._id||ownWeapon.id)+':lowEnemy']?.enabled){
  const group=groups.get('wolf');
  if(group){const own=supportWeaponEffects(ownWeapon,p.weaponRefinement).find(effect=>effect.id==='lowEnemy');group.atkPct=Math.max(0,group.atkPct-(own?.bonuses.atkPct||0));}
 }
 for(const bonuses of groups.values())for(const [key,value]of Object.entries(bonuses))if(value)out[key]=(out[key]||0)+value;
 return out;
}
export function supportWeaponSourceStats(ally={}){
 return {em:ally.weaponSourceEM,hp:ally.weaponSourceHP,atk:ally.weaponSourceATK,def:ally.weaponSourceDEF};
}
export function partyWeaponWarnings(p,weapons=[],sourceStatsForAlly=ally=>supportWeaponSourceStats(ally)){
 const warnings=[];
 for(const ally of p.allies||[]){
  if(!ally.character||String(ally.character)===String(p.character))continue;
  const weapon=weapons.find(w=>[w._id,w.id].map(String).includes(String(ally.weapon))),stats=sourceStatsForAlly(ally);
  for(const effect of supportWeaponEffects(weapon,ally.refinement,stats)){
   const saved=ally.activeWeaponEffects?.[String(weapon.id)+':'+effect.id];
   if(!saved?.enabled||!effect.sourceStat||effect.position&&effect.position!==(p.fightPosition||'on'))continue;
   const value=stats[effect.sourceStat];
   if(value==null||value===''||!Number.isFinite(Number(value))||Number(value)<0)warnings.push('Renseigne la statistique '+effect.sourceStat.toUpperCase()+' du porteur de '+(weapon._name||weapon.name)+'.');
  }
 }
 return [...new Set(warnings)];
}
export function azurelightSummary(config={},refinement=1){
 const rank=Math.max(1,Math.min(5,Number(refinement)||1)),atk=24+6*(rank-1),crit=40+10*(rank-1);
 return {atkPct:config.enabled?atk*(config.zeroEnergy?2:1):0,critDmg:config.enabled&&config.zeroEnergy?crit:0,skillGain:atk,zeroGain:atk,critGain:crit};
}
