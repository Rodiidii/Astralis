const number=v=>Number.isFinite(Number(v))?Number(v):0;
export const ENERGY_ELEMENTS=['pyro','hydro','cryo','electro','anemo','geo','dendro'];
export function energyElement(value){const text=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return ({feu:'pyro',eau:'hydro',glace:'cryo',foudre:'electro',vent:'anemo'})[text]||ENERGY_ELEMENTS.find(x=>text.includes(x))||'';}
export function profileParticles(profile,events=1){
 if(!profile||!Number.isFinite(Number(profile.particles)))return null;
 const count=Math.max(0,Math.min(profile.maxEvents??Infinity,(profile.unit==='seconds'?number(events):Math.floor(number(events)))));
 return Number(profile.particles)*count;
}
export function favoniusWindow({refinement=1,critRate=0,hits=1,windows=1,cycle=20,confirmed=null}){
 const rank=Math.max(1,Math.min(5,number(refinement)||1)),cooldown=[12,10.5,9,7.5,6][rank-1],proc=[.6,.7,.8,.9,1][rank-1],trials=Math.max(0,Math.floor(number(hits))),available=Math.min(Math.max(0,Math.floor(number(windows))),Math.ceil(Math.max(0,number(cycle))/cooldown)),chance=1-(1-Math.max(0,Math.min(1,number(critRate)/100))*proc)**trials;
 const triggers=confirmed==null?available*chance:Math.min(available,Math.max(0,Math.floor(number(confirmed))));
 return {cooldown,chance,available,triggers,particles:triggers*3};
}

export function energyRequirement({cost,bursts=1,flat=0,particleEnergy}){
 if(cost==null||cost===''||!Number.isFinite(Number(cost))||particleEnergy==null)return null;
 const need=Math.max(0,Number(cost))*Math.max(0,Number(bursts));
 if(need===0)return 0;
 return need<=number(flat)?100:number(particleEnergy)>0?Math.max(100,(need-number(flat))/number(particleEnergy)*100):null;
}
export function favoniusTimeline({refinement=1,critRate=0,hitTimes=[],cycle=20}){
 const rank=Math.max(1,Math.min(5,number(refinement)||1)),cooldown=[12,10.5,9,7.5,6][rank-1],chance=Math.max(0,Math.min(1,number(critRate)/100))*[.6,.7,.8,.9,1][rank-1];
 const times=hitTimes.map(t=>typeof t==='object'?t.active===false?NaN:Number(t.at):Number(t)).filter(t=>Number.isFinite(t)&&t>=0&&t<number(cycle)).sort((a,b)=>a-b);
 let states=new Map([[-Infinity,1]]),triggers=0;
 for(const time of times){const next=new Map(),add=(last,p)=>next.set(last,(next.get(last)||0)+p);for(const[last,p]of states){if(time-last+1e-8<cooldown){add(last,p);continue;}add(time,p*chance);add(last,p*(1-chance));triggers+=p*chance;}states=next;}
 return {cooldown,chance,triggers,particles:triggers*3,hitTimes:times};
}
export function collectionShares(source,members,options={}){
 let values=source.collection;
 if(source.collector==='time')values=members.map((m,i)=>Number(options.onField?.[i]??m.onField??(i===Number(options.active||0)?.6:.4/Math.max(1,members.filter(x=>x.character).length-1))));
 if(Array.isArray(values)){
  values=values.map((value,i)=>members[i]?.character?Math.max(0,number(value)):0);const total=values.reduce((sum,v)=>sum+v,0);
  return total>0?values.map(v=>v/total):values;
 }
 return members.map((m,i)=>m.character&&String(i)===String(source.collector)?1:0);
}
export function energyPlan(members,options={}){
 const occupied=members.filter(m=>m.character),size=Math.max(1,Math.min(4,occupied.length)),offFactor=1-.1*size,sources=[],warnings=[];
 const add=source=>{source.count=Math.max(0,number(source.count));source.shares=collectionShares(source,members,options);sources.push(source);};
 members.forEach((m,i)=>{
  if(!m.character)return;
  if(m.particles===''||m.particles==null)warnings.push('Particules à renseigner : '+m.name);
  if(!m.element)warnings.push('Élément à préciser : '+m.name);
  if(!m.special&&(m.cost===''||m.cost==null))warnings.push('Coût à préciser : '+m.name);
  add({label:m.name,element:m.element,count:m.particles,collector:m.collector??i,collection:m.collection,kind:'skill'});
  if(m.favonius){
   if(options.mode==='expected'&&(m.critRate===''||m.critRate==null))warnings.push('Taux CRIT de Favonius à renseigner : '+m.name);
   const times=Array.isArray(m.hitTimes)?m.hitTimes:String(m.favHitTimes||'').split(/[;\s,]+/).filter(Boolean).map(Number);
   const fav=options.mode==='expected'&&times.length?favoniusTimeline({...m,hitTimes:times,cycle:options.cycle}):favoniusWindow({...m,cycle:options.cycle,confirmed:options.mode==='confirmed'?m.confirmed:null});
   add({label:m.name+' · Favonius',element:'neutral',count:fav.particles,collector:m.favCollector??m.collector??i,collection:m.favCollection,kind:'fav',fav});
  }
 });
 if(number(options.neutral)>0||number(options.neutralOrbs)>0)add({label:'Ennemis · neutres',element:'neutral',count:number(options.neutral)+3*number(options.neutralOrbs),collector:options.collector??'time',collection:options.enemyCollection,kind:'enemy'});
 if(occupied.filter(m=>m.element==='electro').length>=2&&number(options.electroProcs)>0)add({label:'Résonance Électro · réactions',element:'electro',count:Math.min(Math.max(0,number(options.electroProcs)),Math.ceil(Math.max(0,number(options.cycle))/5)),collector:options.electroCollector??'time',collection:options.electroCollection,kind:'resonance'});
 const results=members.map((m,index)=>{
  if(!m.character)return null;
  const parts=sources.map(source=>{const base=source.element==='neutral'?2:source.element===m.element?3:1,mult=offFactor+(1-offFactor)*(source.shares[index]||0);return {label:source.label,energy:source.count*base*mult,kind:source.kind,onFieldShare:source.shares[index]||0};});
  const particleEnergy=parts.reduce((sum,p)=>sum+p.energy,0),flat=number(m.flat),bursts=m.bursts==null||m.bursts===''?1:Math.max(0,number(m.bursts)),cost=m.cost===''||m.cost==null?null:Math.max(0,number(m.cost))*bursts,required=m.special?null:energyRequirement({cost:m.cost,bursts,flat,particleEnergy}),er=m.er==null||m.er===''?null:number(m.er),gained=er==null?null:particleEnergy*er/100+flat;
  return {name:m.name,element:m.element,cost,bursts,required,er,gained,deficit:cost==null||gained==null?null:Math.max(0,cost-gained),particleEnergy,flat,parts,special:!!m.special};
 });
 return {sources,results,warnings,offFactor};
}
