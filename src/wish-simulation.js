import {normalizeWishTarget} from './wish-targets.js';
// Reproducible estimates. Soft pity and intermediate Radiance rates are community models.
export function simulateWishOrder(targets,state={},trials=6000){
 const rows=targets.map(normalizeWishTarget);
 let seed=721943;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const samples=rows.map(()=>[]),losses=new Map();
 for(let run=0;run<trials;run++){
  let cp=Math.max(0,Math.min(89,+state.characterPity||0)),wp=Math.max(0,Math.min(79,+state.weaponPity||0)),cg=!!state.characterGuarantee,wg=!!state.weaponGuarantee,streak=Math.max(0,Math.min(3,+state.radiance||0)),spent=0,lost=0;
  const nextFive=weapon=>{let p=weapon?wp:cp,pulls=0;while(true){p++;pulls++;const rate=weapon?(p>=80?1:p<63?.007:Math.min(1,.007+.07*(p-62))):(p>=90?1:p<74?.006:Math.min(1,.006+.06*(p-73)));if(random()<rate)break;}if(weapon)wp=0;else cp=0;spent+=pulls;};
  for(let index=0;index<rows.length;index++){
   const row=rows[index];
   for(let copy=0;copy<row.copies;copy++){
    let obtained=false;while(!obtained){nextFive(false);if(cg){cg=false;obtained=true;}else if(random()<[.5,.5,.75,1][streak]){streak=0;obtained=true;}else{lost++;streak=Math.min(3,streak+1);cg=true;}}
   }
   // One Fate Point guarantees the selected weapon on the next 5-star in this banner.
   // A featured-banner guarantee alone is a 50/50 between its two weapons.
   for(let copy=0;copy<row.refinements;copy++){
    nextFive(true);const featured=wg||random()<.75;wg=false;const selected=featured&&random()<.5;
    if(!selected){nextFive(true);wg=false;}
   }
   samples[index].push(spent);
  }
  if(rows.length){const group=losses.get(lost)||[];group.push(spent);losses.set(lost,group);}
 }
 for(let count=0;count<=rows.reduce((sum,row)=>sum+row.copies,0);count++)if(!losses.has(count))losses.set(count,[]);
 const budget=Math.max(0,Math.floor(+state.wishes||0))+Math.floor(Math.max(0,+(state.currentPrimos??state.primos)||0)/160);
 const theory=Math.max(0,Math.floor(+state.wishes||0))+Math.max(0,Math.floor(+state.theoreticalWishes||0))+Math.floor((Math.max(0,+(state.currentPrimos??state.primos)||0)+Math.max(0,+state.theoreticalPrimos||0))/160);
 const chance=(values,n)=>values.filter(x=>x<=n).length/trials*100;
 return {budget,theory,trials,rows:rows.map((row,index)=>{const values=samples[index].sort((a,b)=>a-b);return {...row,chance:chance(values,budget),theoryChance:chance(values,theory),median:values[Math.floor(trials/2)],points:Array.from({length:31},(_,i)=>{const n=Math.round(Math.max(1,theory,values[Math.floor(trials*.95)]||0)*i/30);return [n,chance(values,n)];})};}),losses:[...losses].sort((a,b)=>a[0]-b[0]).map(([count,values])=>({count,frequency:values.length/trials*100,success:values.length?values.filter(x=>x<=budget).length/values.length*100:null,theorySuccess:values.length?values.filter(x=>x<=theory).length/values.length*100:null}))};
}
