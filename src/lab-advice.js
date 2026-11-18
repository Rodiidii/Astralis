// Counterfactual suggestions for the current attack, not promises of obtainable rolls.
export async function artifactAdvice(stats,evaluate,reference={}) {
 const baseline=await evaluate(stats);
 if(!baseline.ok||!(baseline.total>0))return {ok:false,rows:[],error:baseline.error};
 const trials=[
  {label:'+30 maîtrise élémentaire',changes:{em:30}},
  {label:'+2 % DGT CRIT',changes:{critDmg:2}},
  {label:'+3,89 % taux CRIT (un jet maximal)',changes:{critRate:3.89}},
  {label:'+7,77 % DGT CRIT (un jet maximal)',changes:{critDmg:7.77}},
  {label:'+23,31 maîtrise élémentaire (un jet maximal)',changes:{em:23.31}},
  ...['atk','hp','def'].filter(key=>Number(reference[key])>0).map(key=>({label:'+5,83 % '+({atk:'ATQ',hp:'PV',def:'DÉF'})[key]+' de base (un jet maximal)',changes:{[key]:Number(reference[key])*.0583}})),
  {label:'Remplacer 7,77 % DGT CRIT par 23,31 maîtrise élémentaire',changes:{critDmg:-7.77,em:23.31}},
  {label:'Remplacer 23,31 maîtrise élémentaire par 7,77 % DGT CRIT',changes:{em:-23.31,critDmg:7.77}},
  {label:'Remplacer 7,77 % DGT CRIT par 3,89 % taux CRIT',changes:{critDmg:-7.77,critRate:3.89}},
  {label:'Remplacer 3,89 % taux CRIT par 7,77 % DGT CRIT',changes:{critRate:-3.89,critDmg:7.77}}
 ];
 const rows=[];
 for(const trial of trials){
  if(Object.entries(trial.changes).some(([key,value])=>Number(stats[key]||0)+value<0))continue;
  const next={...stats};for(const [key,value]of Object.entries(trial.changes))next[key]=Number(next[key]||0)+value;
  const result=await evaluate(next);
  if(result.ok)rows.push({...trial,damage:result.total,delta:result.total-baseline.total,percent:(result.total/baseline.total-1)*100});
 }
 rows.sort((a,b)=>b.percent-a.percent);
 return {ok:true,baseline:baseline.total,rows};
}
