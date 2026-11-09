export const ARTIFACT_SLOTS=['flower','plume','sands','goblet','circlet'];
export const ARTIFACT_SLOT_LABELS=Object.freeze({flower:'Fleur',plume:'Plume',sands:'Sablier',goblet:'Coupe',circlet:'Diadème'});
export const ARTIFACT_MAIN_MAX=Object.freeze({hpFlat:4780,atkFlat:311,hpPct:46.6,atkPct:46.6,defPct:58.3,em:187,er:51.8,critRate:31.1,critDmg:62.2,pyroDmg:46.6,hydroDmg:46.6,cryoDmg:46.6,electroDmg:46.6,anemoDmg:46.6,geoDmg:46.6,dendroDmg:46.6,physicalDmg:58.3,healing:35.9});
export const ARTIFACT_SUBSTAT_MAX=Object.freeze({hpFlat:298.75,atkFlat:19.45,defFlat:23.15,hpPct:5.83,atkPct:5.83,defPct:7.29,em:23.31,er:6.48,critRate:3.89,critDmg:7.77});
export const ARTIFACT_SUBSTAT_ROLLS=Object.freeze(Object.fromEntries(Object.entries(ARTIFACT_SUBSTAT_MAX).map(([key,max])=>[key,[.7,.8,.9,1].map(x=>Math.round(max*x*100)/100)])));
const GOOD_STATS={FIGHT_PROP_HP:'hpFlat',FIGHT_PROP_HP_PERCENT:'hpPct',FIGHT_PROP_ATTACK:'atkFlat',FIGHT_PROP_ATTACK_PERCENT:'atkPct',FIGHT_PROP_DEFENSE:'defFlat',FIGHT_PROP_DEFENSE_PERCENT:'defPct',FIGHT_PROP_ELEMENT_MASTERY:'em',FIGHT_PROP_CHARGE_EFFICIENCY:'er',FIGHT_PROP_CRITICAL:'critRate',FIGHT_PROP_CRITICAL_HURT:'critDmg',FIGHT_PROP_FIRE_ADD_HURT:'pyroDmg',FIGHT_PROP_WATER_ADD_HURT:'hydroDmg',FIGHT_PROP_ICE_ADD_HURT:'cryoDmg',FIGHT_PROP_ELEC_ADD_HURT:'electroDmg',FIGHT_PROP_WIND_ADD_HURT:'anemoDmg',FIGHT_PROP_ROCK_ADD_HURT:'geoDmg',FIGHT_PROP_GRASS_ADD_HURT:'dendroDmg',FIGHT_PROP_PHYSICAL_ADD_HURT:'physicalDmg',FIGHT_PROP_HEAL_ADD:'healing'};
const SLOT_ALIASES={flower:'flower',EQUIP_BRACER:'flower',plume:'plume',feather:'plume',EQUIP_NECKLACE:'plume',sands:'sands',EQUIP_SHOES:'sands',goblet:'goblet',EQUIP_RING:'goblet',circlet:'circlet',EQUIP_DRESS:'circlet'};
const MAIN_BY_SLOT={flower:['hpFlat'],plume:['atkFlat'],sands:['hpPct','atkPct','defPct','em','er'],goblet:['hpPct','atkPct','defPct','em','pyroDmg','hydroDmg','cryoDmg','electroDmg','anemoDmg','geoDmg','dendroDmg','physicalDmg'],circlet:['hpPct','atkPct','defPct','em','critRate','critDmg','healing']};
export const ARTIFACT_MAIN_BY_SLOT=Object.freeze(Object.fromEntries(Object.entries(MAIN_BY_SLOT).map(([slot,stats])=>[slot,Object.freeze([...stats])])));
const statKey=key=>GOOD_STATS[key]||({hp:'hpFlat',atk:'atkFlat',def:'defFlat',critRate_:'critRate'}[key])||key;
const number=value=>Number.isFinite(Number(value))?Number(value):0;
const rollMemo=new Map();
function possibleSubstatValue(type,value,rollCount){
  const rolls=ARTIFACT_SUBSTAT_ROLLS[type];if(!rolls)return false;
  const key=`${type}:${rollCount}:${Math.round(Number(value)*100)}`;if(rollMemo.has(key))return rollMemo.get(key);
  let sums=new Set([0]);for(let i=0;i<rollCount;i++){const next=new Set();for(const sum of sums)for(const roll of rolls)next.add(Math.round((sum+roll)*100)/100);sums=next;}
  const target=Math.round(Number(value)*100),ok=[...sums].some(sum=>Math.abs(Math.round(sum*100)-target)<=6);rollMemo.set(key,ok);return ok;
}
export function normalizeArtifact(row={},index=0){
  const slot=SLOT_ALIASES[String(row.slotKey||row.slot||row.equipType||'').toUpperCase()]||SLOT_ALIASES[String(row.slotKey||row.slot||'').toLowerCase()];
  const main=row.mainStat||{};
  const subs=Array.isArray(row.substats)?row.substats:Array.isArray(row.subStats)?row.subStats:[];
  return {id:String(row.id??row.artifactId??`import-${index}`),setKey:String(row.setKey??row.set??row.setId??''),rarity:number(row.rarity??row.stars),level:number(row.level??row.enhanceLevel),slot,slotIndex:ARTIFACT_SLOTS.indexOf(slot),mainType:statKey(row.mainStatKey??row.mainType??main.key??main.type??''),mainValue:number(row.mainStatValue??row.mainValue??main.value),substats:subs.map(s=>({type:statKey(s.key??s.type??s.stat),value:number(s.value)})),location:String(row.location??row.equip??''),locked:Boolean(row.lock??row.locked),source:row.source||'import'};
}
export function parseArtifactInventory(payload){
  let data=payload;if(typeof data==='string')data=JSON.parse(data);
  const root=Array.isArray(data)?data:data?.artifacts||data?.relics||data?.inventory?.artifacts||data?.data?.artifacts||data?.GOOD?.artifacts||data?.artifactList||data?.data?.artifactList;
  if(!Array.isArray(root))throw new Error('Format non reconnu : attendu un tableau d’artéfacts GOOD ou Astralis.');
  const rows=root.map((row,i)=>normalizeArtifact(row,i));
  const seen=new Set();let duplicates=0;
  for(const row of rows){const sig=[row.setKey,row.slot,row.rarity,row.level,row.mainType,row.mainValue,...row.substats.flatMap(s=>[s.type,s.value])].join('|');if(seen.has(sig)){row.duplicate=true;duplicates++;}else seen.add(sig);}
  return {rows,duplicates,invalid:rows.filter(row=>!validateArtifact(row).valid).length};
}
export const normalizeGoodArtifact=normalizeArtifact;
export function artifactSignature(piece={}){
  const substats=[...(piece.substats||[])].map(row=>[row.type,number(row.value)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||a[1]-b[1]);
  return JSON.stringify([String(piece.setKey||''),String(piece.slot||''),Number(piece.rarity)||0,Number(piece.level)||0,String(piece.mainType||''),number(piece.mainValue),substats]);
}
/** Importer un inventaire complet sans perdre les vrais doublons ni réimporter un fichier déjà traité. */
export function artifactImportDelta(existing=[],incoming=[]){
  const counts=new Map();
  for(const row of existing){const key=artifactSignature(row);counts.set(key,(counts.get(key)||0)+1);}
  const seen=new Map(),additions=[];
  for(const [index,row] of incoming.entries()){
    const key=artifactSignature(row),occurrence=(seen.get(key)||0)+1;seen.set(key,occurrence);
    if(occurrence>(counts.get(key)||0))additions.push({...row});
  }
  const usedIds=new Set(existing.map(row=>String(row.id??'')));
  let suffix=1;
  for(const row of additions){
    const original=String(row.id||`import-${Date.now()}`);
    if(!usedIds.has(original)){row.id=original;usedIds.add(original);continue;}
    let id;do{id=`${original}~${suffix++}`;}while(usedIds.has(id));
    row.id=id;usedIds.add(id);
  }
  return additions;
}
export function validateArtifact(piece={}){
  const issues=[];if(!ARTIFACT_SLOTS.includes(piece.slot))issues.push('Emplacement inconnu.');if(!piece.setKey)issues.push('Set non reconnu.');if(![4,5].includes(Number(piece.rarity)))issues.push('Rareté non valide : seules les pièces 4★ et 5★ sont optimisables.');
  if(!Number.isInteger(Number(piece.level))||piece.level<0||piece.level>20)issues.push('Niveau impossible : une relique peut être entre +0 et +20.');
  if(!piece.mainType||!Number.isFinite(Number(piece.mainValue))||piece.mainValue<=0)issues.push('Stat principale manquante ou invalide.');else if(MAIN_BY_SLOT[piece.slot]&&!MAIN_BY_SLOT[piece.slot].includes(piece.mainType))issues.push('Stat principale impossible pour cet emplacement.');else if(Number(piece.rarity)===5&&Number(piece.level)===20){const maximum=ARTIFACT_MAIN_MAX[piece.mainType];if(!maximum||Math.abs(Number(piece.mainValue)-maximum)>.06)issues.push(`Stat principale incohérente au niveau 20 : maximum attendu ${maximum??'inconnu'}.`);}
  const subs=piece.substats||[];if(subs.length<3||subs.length>4)issues.push('Une pièce doit avoir 3 ou 4 sous-stats initiales.');
  const types=[piece.mainType,...subs.map(s=>s.type)];if(new Set(types).size!==types.length)issues.push('Une stat est répétée ou correspond à la stat principale.');
  const level=Number(piece.level),upgrades=Math.floor(level/4),finalLines=subs.length;
  // GOOD ne conserve généralement pas le nombre de lignes initiales. À +20,
  // une pièce à 4 lignes peut donc avoir 8 rolls (3 initiales) ou 9 (4 initiales).
  const initialCandidates=finalLines===3?(level<4?[3]:[]):finalLines===4?(level>=4?[3,4]:[4]):[];
  if(!initialCandidates.length)issues.push(`Nombre de sous-stats impossible au niveau +${level}.`);
  const totalRollCandidates=initialCandidates.map(initial=>initial+upgrades),possibleCounts=[];
  const maxRolls=Math.max(1,...totalRollCandidates);
  for(const sub of subs){const max=ARTIFACT_SUBSTAT_MAX[sub.type];if(!max||!Number.isFinite(Number(sub.value))||sub.value<=0||sub.value>max*maxRolls+.05){issues.push(`Valeur de sous-stat invalide : ${sub.type||'inconnue'}.`);possibleCounts.push([]);continue;}const counts=[];for(let n=1;n<=maxRolls;n++)if(possibleSubstatValue(sub.type,sub.value,n))counts.push(n);if(!counts.length)issues.push(`Valeur ${sub.value} impossible pour ${sub.type} avec les paliers de sous-stat connus.`);possibleCounts.push(counts);}
  if(possibleCounts.length===subs.length&&possibleCounts.every(row=>row.length)){
    const canSumTo=target=>{let sums=new Set([0]);for(const options of possibleCounts){const next=new Set();for(const sum of sums)for(const n of options)if(sum+n<=target)next.add(sum+n);sums=next;}return sums.has(target);};
    if(!totalRollCandidates.some(canSumTo))issues.push(`Répartition des sous-stats impossible : paliers attendus ${totalRollCandidates.join(' ou ')}.`);
  }
  return {valid:issues.length===0,issues};
}
export function statVector(piece,relevant=null){const vector=Object.create(null),add=(k,v)=>{if(k&&(!relevant||relevant.has(k)))vector[k]=(vector[k]||0)+number(v);};add(piece.mainType,piece.mainValue);for(const s of piece.substats||[])add(s.type,s.value);return vector;}
// Retire seulement les doublons strictement identiques; pas de dominance qui masquerait des résultats top-N.
export function pruneDominatedArtifacts(pieces,relevant=null){const seen=new Set();return pieces.filter(p=>{const v=statVector(p,relevant),sig=[p.slotIndex,p.setKey,p.mainType,...Object.keys(v).sort().flatMap(k=>[k,v[k]])].join('|');if(seen.has(sig))return false;seen.add(sig);return true;});}
