const bounded=(value,min,max,fallback=0)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Math.floor(Number(value)))):fallback;
export function normalizeWishTarget(target={}){
 const hasC=target.currentC!=null||target.targetC!=null,hasR=target.currentR!=null||target.targetR!=null;
 const currentC=bounded(target.currentC??-1,-1,6,-1),targetC=bounded(target.targetC??Math.max(0,Number(target.copies||1)-1),0,6);
 const currentR=bounded(target.currentR??0,0,5),targetR=bounded(target.targetR??target.refinements??0,0,5);
 return {...target,...(hasC?{currentC,targetC}:{}),...(hasR?{currentR,targetR}:{}),copies:hasC?Math.max(0,targetC-currentC):bounded(target.copies,0,7),refinements:hasR?Math.max(0,targetR-currentR):bounded(target.refinements,0,5)};
}

export function theoreticalBudgetStatus(data={},estimate={}){
 const applied=Number.isFinite(Number(data.theoreticalPrimos))&&data.theoreticalPrimos!=null||Number.isFinite(Number(data.theoreticalWishes))&&data.theoreticalWishes!=null;
 const snapshot=data.theoreticalPeriod,changed=applied&&(!snapshot||snapshot.start!==data.income?.start||snapshot.end!==data.income?.end||Number(data.theoreticalPrimos)!==Number(estimate.primos)||Number(data.theoreticalWishes)!==Number(estimate.wishes));
 return {applied,changed,invalid:!!estimate.error,primos:applied?Number(data.theoreticalPrimos)||0:0,wishes:applied?Number(data.theoreticalWishes)||0:0,start:snapshot?.start||null,end:snapshot?.end||null};
}
