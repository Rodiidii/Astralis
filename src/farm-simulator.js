
const weekdays=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
export function materialKind(item){
 const text=(item.typeText||'')+' '+(item.sources||[]).join(' ');
 if(/aptitude de personnage/i.test(text))return 'talent';
 if(/produit (de|du|des|d[’'])|produit.*régional|spécialité.*locale|local specialty/i.test(text))return 'specialty';
 if(String(item.id)==='202')return 'mora';
 if(/70\+|hebdomadaire|weekly|trounce/i.test(text))return 'weekly';
 if(/^112/.test(String(item.id)))return 'mob';
 if(/^113/.test(String(item.id)))return 'boss';
 return 'other';
}
export function craftableInventory(requirements,materials,inventory={}){
 const stock={...inventory},groups=new Map(),required=new Map();
 for(const row of requirements)required.set(String(row.id),(required.get(String(row.id))||0)+Number(row.count||0));
 for(const item of materials){const kind=materialKind(item);if(!['talent','mob'].includes(kind))continue;const key=kind+':'+item.sortRank;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 for(const family of groups.values()){
  if(family.length!==3)continue;family.sort((a,b)=>a.rarity-b.rarity);
  for(let tier=0;tier<2;tier++){const id=String(family[tier].id),next=String(family[tier+1].id),surplus=Math.max(0,(Number(stock[id])||0)-(required.get(id)||0)),converted=Math.floor(surplus/3);stock[id]=(Number(stock[id])||0)-converted*3;stock[next]=(Number(stock[next])||0)+converted;}
 }
 return stock;
}
export function simulateFarm({characters,materials,inventory={},start,artifactDays=0,maxDays=730,xp=0,specialties={},reservedDates=[]}){
 const catalog=new Map(materials.map(m=>[String(m.id),m]));
 const stock=craftableInventory(characters.flatMap(c=>c.requirements),materials,inventory),jobs=[],passive=[],dates={},sessions=[];
 for(const character of characters){
  const needs=character.requirements.map(row=>({...row,id:String(row.id),count:Number(row.count)||0}));
  for(const row of needs){
   const item=catalog.get(row.id)||row.item||{id:row.id,name:row.name};
   const use=Math.min(Number(stock[row.id])||0,row.count);stock[row.id]=(Number(stock[row.id])||0)-use;row.count-=use;
   if(row.count<=0)continue;
   const kind=materialKind(item);
   const job={...row,item,kind,person:character.id,rank:character.priority??characters.indexOf(character),days:(item.daysOfWeek||[]).map(day=>weekdays.indexOf(day)).filter(x=>x>=0)};
   if(kind==='talent')job.units=row.count*Math.pow(3,item.rarity-2);
   else job.units=row.count;
   if(['talent','boss','mora','weekly'].includes(kind))jobs.push(job);
   else passive.push(job);
  }
  if(character.xp>0)jobs.push({id:'xp',kind:'xp',units:Math.max(0,character.xp-xp),person:character.id,rank:character.priority??characters.indexOf(character),days:[]});
  xp=Math.max(0,xp-(character.xp||0));
 }
 const groupedJobs=new Map();
 for(const job of jobs){
  const family=job.kind==='talent'?job.item.sortRank:job.kind==='weekly'?(job.item.sources||[]).join('|'):job.id;
  const key=job.person+':'+job.kind+':'+family;
  if(!groupedJobs.has(key))groupedJobs.set(key,{...job,materialIds:[job.id]});
  else {const existing=groupedJobs.get(key);existing.units+=job.units;existing.materialIds.push(job.id);}
 }
 jobs.splice(0,jobs.length,...groupedJobs.values());
 const harvests=passive.filter(job=>job.kind==='specialty').map(job=>{const source=specialties[job.id],capacity=Number(source?.capacity)||0;return {...job,capacity,cycles:capacity?Math.ceil(job.count/capacity):null,source:source?.source};});
 const discounts=new Map(),artifactWeeks=new Map(),weeklySlots=new Map(),reserved=new Set(reservedDates);
 const initial=new Date(start+'T12:00:00');
 if(!Number.isFinite(initial.getTime()))return {sessions:[],dates:{},unresolved:passive};
 const priority={talent:0,boss:1,xp:2,mora:3,weekly:5};
 const weeklyDone=new Set(),weeklyCharacters=new Set();
 for(let offset=0;offset<maxDays;offset++){
  const day=new Date(initial);day.setDate(day.getDate()+offset);
  const date=day.toLocaleDateString('sv-SE'),weekday=(day.getDay()+6)%7,weekStart=new Date(day);weekStart.setDate(day.getDate()-weekday);const week=weekStart.toLocaleDateString('sv-SE');
  for(const harvest of harvests){if(!harvest.ready&&harvest.cycles&&offset>=(harvest.cycles-1)*2)harvest.ready=date;}
  const pending=jobs.filter(job=>job.units>.00001);
  for(const character of characters)if(!dates[character.id]&&!pending.some(job=>job.person===character.id))dates[character.id]=date;
  if(!pending.length)break;
  const eligible=pending.filter(job=>job.kind!=='weekly'&&(!job.days.length||job.days.includes(weekday)));
  eligible.sort((a,b)=>a.rank-b.rank||priority[a.kind]-priority[b.kind]);
  if(!artifactWeeks.has(week)){
   const days=Array.from({length:7},(_,day)=>{const target=new Date(weekStart);target.setDate(target.getDate()+day);const candidates=pending.filter(job=>job.kind!=='weekly'&&(!job.days.length||job.days.includes(day)));return {day,available:target>=initial&&!reserved.has(target.toLocaleDateString('sv-SE')),urgency:candidates.length?Math.min(...candidates.map(job=>job.rank*10+priority[job.kind])):100000};}).filter(row=>row.available);
   days.sort((a,b)=>b.urgency-a.urgency||a.day-b.day);artifactWeeks.set(week,new Set(days.slice(0,Math.max(0,Math.min(4,artifactDays))).map(row=>row.day)));
  }
  if(!weeklySlots.has(week)){
   const days=Array.from({length:7},(_,index)=>{const target=new Date(weekStart);target.setDate(target.getDate()+index);const candidates=pending.filter(job=>job.kind!=='weekly'&&(!job.days.length||job.days.includes(index)));return {day:index,available:target>=initial&&!reserved.has(target.toLocaleDateString('sv-SE')),urgency:artifactWeeks.get(week).has(index)?100001:candidates.length?Math.min(...candidates.map(job=>job.rank*10+priority[job.kind])):100000};}).filter(row=>row.available);
   days.sort((a,b)=>b.urgency-a.urgency||a.day-b.day);const bosses=new Set(pending.filter(job=>job.kind==='weekly').map(job=>job.item?.sources?.[0]||job.id)).size;weeklySlots.set(week,new Set(days.slice(0,bosses).map(row=>row.day)));
  }
  const artifact=artifactWeeks.get(week).has(weekday);
  if(reserved.has(date))continue;const primary=artifact?{kind:'artifact',person:characters[0]?.id}:eligible[0];
  const supplementary=pending.filter(job=>job.kind==='weekly'&&!weeklyCharacters.has(week+':'+job.person)&&!weeklyDone.has(week+':'+(job.item?.sources?.[0]||job.id))).sort((a,b)=>a.rank-b.rank)[0];
  const entry={date,kind:primary?.kind||'rest',characterIds:primary?[primary.person]:[],materialIds:primary?.id&&primary.id!=='xp'?(primary.materialIds||[primary.id]):[],supplements:[],auto:true};
  // Weekly claims accompany the least urgent main activity of the week.
  if(supplementary&&weeklySlots.get(week).has(weekday)){
   let drops=2.5;const boss=supplementary.item?.sources?.[0]||supplementary.id;
   const shared=pending.filter(job=>job.kind==='weekly'&&(job.item?.sources?.[0]||job.id)===boss&&!weeklyCharacters.has(week+':'+job.person)).sort((a,b)=>a.rank-b.rank);
   for(const job of shared){const use=Math.min(drops,job.units);if(use<=0)continue;job.units-=use;drops-=use;weeklyCharacters.add(week+':'+job.person);entry.supplements.push({id:job.id,person:job.person});entry.materialIds.push(...(job.materialIds||[job.id]));entry.characterIds=[...new Set([...entry.characterIds,job.person])];if(drops<=0)break;}
   weeklyDone.add(week+':'+boss);
   entry.materialIds=[...new Set(entry.materialIds)];entry.weeklyResin=(discounts.get(week)||0)<3?30:60;discounts.set(week,(discounts.get(week)||0)+1);
  }
  if(primary&&primary.kind!=='artifact'){
   const scale=entry.supplements.length?(180-entry.weeklyResin)/180:1,capacity={talent:92,boss:15.75,xp:1102500,mora:540000}[primary.kind]*scale;
   let remaining=capacity;
   const sameFamily=job=>job.kind===primary.kind&&(primary.kind==='talent'?job.item.sortRank===primary.item.sortRank:job.id===primary.id);
   for(const job of [primary,...eligible.filter(j=>j!==primary&&sameFamily(j))]){if(remaining<=0)break;const used=Math.min(job.units,remaining);job.units-=used;remaining-=used;if(used>0){entry.characterIds=[...new Set([...entry.characterIds,job.person])];entry.materialIds=[...new Set([...entry.materialIds,...(job.materialIds||[])])];}}

  }
  for(const character of characters)if(!dates[character.id]&&!jobs.some(job=>job.person===character.id&&job.units>.00001))dates[character.id]=date;
  if(primary?.kind==='talent'){
   const talentIds=new Set(materials.filter(item=>materialKind(item)==='talent').map(item=>String(item.id)));
   const philosophy=materials.find(item=>item.sortRank===primary.item.sortRank&&item.rarity===4&&materialKind(item)==='talent');
   if(philosophy)entry.materialIds=[String(philosophy.id),...entry.materialIds.filter(id=>!talentIds.has(String(id)))];
  }
  entry.title=({talent:'Livres d’aptitudes',boss:'Boss d’ascension',xp:'Livres d’EXP',mora:'Mora',artifact:'Artéfacts',rest:'Disponible'})[entry.kind]+(entry.supplements.length?' + boss hebdomadaire':'');if(entry.kind==='rest'&&entry.supplements.length)entry.title='Boss hebdomadaire';
  entry.category=entry.kind==='artifact'?'Artéfacts':entry.title;
  if(primary||entry.supplements.length)sessions.push(entry);
 }
 for(const character of characters)if(!dates[character.id]&&!jobs.some(job=>job.person===character.id&&job.units>.00001)){const last=sessions.at(-1);dates[character.id]=last?.date||start;}
 const gathered=new Map();for(const harvest of harvests){
  const total=(gathered.get(harvest.id)||0)+harvest.count;gathered.set(harvest.id,total);
  if(!harvest.capacity){delete dates[harvest.person];continue;}
  if(harvest.capacity){harvest.cycles=Math.ceil(total/harvest.capacity);const ready=new Date(initial);ready.setDate(ready.getDate()+Math.max(0,harvest.cycles-1)*2);harvest.ready=ready.toLocaleDateString('sv-SE');if(dates[harvest.person]&&dates[harvest.person]<harvest.ready)dates[harvest.person]=harvest.ready;}
 }
 return {sessions,dates,harvests,unresolved:passive,unfinished:jobs.filter(job=>job.units>.00001)};
}
