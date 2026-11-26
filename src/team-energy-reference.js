import {energyRequirement} from './team-energy.js';
export function checkEnergyReference(data){
 return (data.cases||[]).map(row=>({...row,name:row.members.map(m=>m.name).join(' / '),members:row.members.map(member=>{
  const computed=energyRequirement({cost:member.cost,flat:member.flat,particleEnergy:member.ledger.reduce((sum,value)=>sum+value,0)});
  return {...member,computed,error:Math.abs(computed-member.expected)};
 })}));
}
