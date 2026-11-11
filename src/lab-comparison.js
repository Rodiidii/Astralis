const finite=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
export function compareLabScores(reference,candidate){
 if(!finite(reference)||!finite(candidate))return {delta:null,percent:null,status:'unknown',label:'Référence ou résultat indisponible'};
 const before=Number(reference),after=Number(candidate),delta=after-before;
 if(before<=0)return {delta,percent:null,status:'nonpositive',label:'Gain non calculable : référence nulle ou négative'};
 return {delta,percent:delta/before*100,status:'known',label:'Comparaison avec la référence'};
}
export function labReferenceScore(p={},baseline,currentStats={}){
 const objective=p.objective||'damage';
 if(['damage','dps'].includes(objective)){
  if(!baseline?.ok||!finite(baseline.total))return null;
  if(objective==='damage')return Number(baseline.total);
  const duration=Number(p.rotationSeconds);return Number.isFinite(duration)&&duration>0?Number(baseline.total)/duration:null;
 }
 return ['hp','atk','def'].includes(objective)&&finite(currentStats[objective])?Number(currentStats[objective]):null;
}
