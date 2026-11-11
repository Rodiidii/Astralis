import {ARTIFACT_MAIN_BY_SLOT} from './artifact-model.js?v=20261110-builds-3';
const SUBS=new Set(['hpFlat','atkFlat','defFlat','hpPct','atkPct','defPct','em','er','critRate','critDmg']);
export function validateManualArtifact(piece={}){
 const errors=[];
 if(!piece.setKey)errors.push('Choisis un set.');
 if(!ARTIFACT_MAIN_BY_SLOT[piece.slot]?.includes(piece.mainType))errors.push('Stat principale incompatible avec cet emplacement.');
 if(!Number.isInteger(Number(piece.level))||Number(piece.level)<0||Number(piece.level)>20)errors.push('Le niveau doit être un entier entre 0 et 20.');
 if(!Number.isFinite(Number(piece.mainValue))||Number(piece.mainValue)<=0)errors.push('Indique une valeur principale strictement positive.');
 const types=new Set([piece.mainType]);
 for(const sub of piece.substats||[]){
  if(!SUBS.has(sub.type))errors.push('Type de sous-stat inconnu.');
  if(types.has(sub.type))errors.push('Une sous-stat est répétée ou identique à la principale.');types.add(sub.type);
  if(sub.value==null||sub.value===''||!Number.isFinite(Number(sub.value))||Number(sub.value)<=0)errors.push('Chaque sous-stat choisie doit avoir une valeur strictement positive.');
 }
 if((piece.substats||[]).length>4)errors.push('Quatre sous-stats au maximum.');
 return {valid:!errors.length,errors:[...new Set(errors)]};
}
