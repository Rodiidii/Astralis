const n=(v,max=Number.MAX_SAFE_INTEGER)=>Math.min(max,Math.max(0,Math.floor(Number(v)||0)));
export function fiveStarDistribution(kind='character',pity=0){
 const cap=kind==='weapon'?80:90,p=n(pity,cap-1),out=Array(cap-p+1).fill(0);let alive=1;
 for(let pull=1;pull<=cap-p;pull++){const at=p+pull,rate=kind==='weapon'?(at>=80?1:at<63?.007:Math.min(1,.007+.07*(at-62))):(at>=90?1:at<74?.006:Math.min(1,.006+.06*(at-73)));out[pull]=alive*rate;alive*=1-rate;}
 return out;
}
export function convolveWish(a,b){const out=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)if(a[i])for(let j=0;j<b.length;j++)if(b[j])out[i+j]+=a[i]*b[j];return out;}
export function targetWishDistribution(kind='character',state={}){
 const weapon=kind==='weapon',first=fiveStarDistribution(kind,weapon?state.weaponPity:state.characterPity),full=fiveStarDistribution(kind),guaranteed=weapon?!!state.weaponFatePoint:!!state.characterGuarantee;
 const win=guaranteed?1:weapon?(state.weaponGuarantee?.5:.375):.5;
 if(win===1)return first;
 const miss=convolveWish(first,full),out=miss.map(v=>v*(1-win));for(let i=0;i<first.length;i++)out[i]=(out[i]||0)+first[i]*win;return out;
}
export function wishDecision(plan={},scenario={},today=new Date().toLocaleDateString('sv-SE')){
 const kind=scenario.kind==='weapon'?'weapon':'character',copies=n(scenario.copies??1,kind==='weapon'?5:7),state={...plan,weaponFatePoint:!!scenario.weaponFatePoint};
 let pdf=[1];for(let i=0;i<copies;i++)pdf=convolveWish(pdf,targetWishDistribution(kind,i===0?state:{}));
 let cumulative=0,mean=0;const cdf=pdf.map((p,i)=>{mean+=p*i;return cumulative+=p;});
 const quantile=q=>{const index=cdf.findIndex(p=>p+1e-12>=q);return index<0?cdf.length-1:index;},primos=n(plan.currentPrimos??plan.primos),wishes=n(plan.wishes),available=wishes+Math.floor(primos/160),reserve=n(scenario.reserve),budget=Math.max(0,available-reserve),spend=n(scenario.limit??Number.MAX_SAFE_INTEGER),usable=Math.min(budget,spend);
 const start=Date.parse(today+'T00:00:00Z'),end=Date.parse(String(scenario.end||today)+'T00:00:00Z'),days=Number.isFinite(end)?Math.max(0,Math.floor((end-start)/86400000)):0,daily=n(scenario.daily),extra=n(scenario.extra),forecastPrimos=primos+days*daily+(Number.isFinite(end)&&end>=start?extra:0),forecast=wishes+Math.floor(forecastPrimos/160),futureUsable=Math.min(Math.max(0,forecast-reserve),spend),hard=copies?((kind==='weapon'?(state.weaponFatePoint?80:160)-n(plan.weaponPity,79):(state.characterGuarantee?90:180)-n(plan.characterPity,89))+(copies-1)*(kind==='weapon'?160:180)):0,missing=Math.max(0,hard-usable),chance=value=>(cdf[Math.min(cdf.length-1,n(value))]||0)*100;
 const thresholds=[.5,.75,.9,.95,.99].map(q=>({confidence:q*100,pulls:quantile(q),missing:Math.max(0,quantile(q)-usable)}));
 return {kind,copies,available,reserve,budget,usable,spend,remainingPrimos:primos%160,days,daily,extra,forecast,futureUsable,hard,missing,missingPrimos:Math.max(0,(hard+reserve-wishes)*160-primos),chance:chance(usable),futureChance:chance(futureUsable),chancePlusTen:chance(usable+10),mean,thresholds,quantile,points:Array.from({length:31},(_,i)=>{const pulls=Math.round(hard*i/30);return {pulls,chance:chance(pulls)}}),dailyNeeded:days?Math.ceil(Math.max(0,(hard+reserve-wishes)*160-primos-extra)/days):null,stopAfterWin:Math.max(0,usable-quantile(.5)),covered:hard===0?100:Math.min(100,usable/hard*100)};
}
