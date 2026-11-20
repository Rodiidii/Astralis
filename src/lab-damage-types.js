const reactions={
 lunarcharged:['lunarCharged','Sélénocution','Lunar-Charged'],lunarbloom:['lunarBloom','Sélénofleurissement','Lunar-Bloom'],lunarcrystallize:['lunarCrystallize','Sélénocristallisation','Lunar-Crystallize'],stellarconduct:['stellarConduct','Astroconduction','Stellar Conduct'],stellarswirl:['stellarSwirl','Astrodispersion','Stellar Swirl'],stellarswirl_vortex1:['stellarSwirl','Astrodispersion · vortex 1','Stellar Swirl'],stellarswirl_vortex2:['stellarSwirl','Astrodispersion · vortex 2','Stellar Swirl'],
};
const elements={physical:'Physiques',pyro:'Pyro',hydro:'Hydro',cryo:'Cryo',electro:'Électro',anemo:'Anémo',geo:'Géo',dendro:'Dendro'};
export function damageTypeInfo(info={}){
 const reaction=reactions[info.variant];
 if(reaction)return {id:reaction[0],label:reaction[1],english:reaction[2],isReaction:true,element:elements[info.subVariant]?info.subVariant:null};
 const element=elements[info.variant]?info.variant:elements[info.subVariant]?info.subVariant:null;
 return {id:element||'unknown',label:elements[element]||'À préciser',isReaction:false,element};
}
export function attackDamageType(row={},result={},element=''){
 if(row.utility)return {id:'utility',label:'Activation · sans dégâts',isReaction:false};
 return result.damageType||row.damageType||damageTypeInfo({variant:element});
}
