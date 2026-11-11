export const FARM_YIELDS=Object.freeze({resin:180,talent:Object.freeze([20,18,2]),xp:1102500,mora:540000,boss:15.75,weekly:2.5});
const bookFamily=item=>String(item.sortRank??('id:'+item.id));

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
 for(const item of materials){const kind=materialKind(item);if(!['talent','mob'].includes(kind))continue;const key=kind+':'+bookFamily(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 for(const family of groups.values()){
  if(family.length!==3)continue;family.sort((a,b)=>a.rarity-b.rarity);
  for(let tier=0;tier<2;tier++){const id=String(family[tier].id),next=String(family[tier+1].id),surplus=Math.max(0,(Number(stock[id])||0)-(required.get(id)||0)),converted=Math.floor(surplus/3);stock[id]=(Number(stock[id])||0)-converted*3;stock[next]=(Number(stock[next])||0)+converted;}
 }
 return stock;
}
export function allocateFarmInventory(characters,materials,inventory={}){
 const ordered=characters.map((character,index)=>({...character,priority:character.priority??index})).sort((a,b)=>a.priority-b.priority);
 const normalized=Object.fromEntries(Object.entries(inventory).map(([id,value])=>[id,Math.max(0,Number(value)||0)]));
 const stock=craftableInventory(ordered.flatMap(character=>character.requirements||[]),materials,normalized),allocation={},remaining={};
 for(const character of ordered){
  const merged=new Map();for(const row of character.requirements||[]){const id=String(row.id??row.name),previous=merged.get(id);merged.set(id,{...row,id,count:(previous?.count||0)+Math.max(0,Number(row.count)||0)});}
  allocation[character.id]={};remaining[character.id]=[];
  for(const row of merged.values()){const used=Math.min(Number(stock[row.id])||0,row.count);stock[row.id]=(Number(stock[row.id])||0)-used;allocation[character.id][row.id]=used;remaining[character.id].push({...row,count:row.count-used});}
 }
 return {allocation,remaining,unallocated:stock};
}
export function simulateFarm({characters,materials,inventory={},start,artifactDays=0,maxDays=730,xp=0,specialties={},reservedDates=[]}){
 characters=characters.map((character,index)=>({...character,priority:character.priority??index})).sort((a,b)=>a.priority-b.priority);
 const catalog=new Map(materials.map(m=>[String(m.id),m])),bookFamilies=new Map(),talentIds=new Set(),philosophies=new Map();
 for(const item of materials)if(materialKind(item)==='talent'){const family=bookFamily(item);if(!bookFamilies.has(family))bookFamilies.set(family,[]);bookFamilies.get(family).push(item);talentIds.add(String(item.id));if(Number(item.rarity)===4)philosophies.set(family,item);}
 const prepared=allocateFarmInventory(characters,materials,inventory),stock=prepared.unallocated,jobs=[],passive=[],dates={},sessions=[];
 for(const character of characters){
  const needs=prepared.remaining[character.id];
  for(const row of needs){
   const item=catalog.get(row.id)||row.item||{id:row.id,name:row.name};
   if(row.count<=0)continue;
   const kind=materialKind(item);
   const job={...row,item,kind,person:character.id,rank:character.priority??characters.indexOf(character),days:(item.daysOfWeek||[]).map(day=>weekdays.indexOf(day)).filter(x=>x>=0)};
   if(kind==='talent'){job.units=row.count*Math.pow(3,item.rarity-2);job.bookNeed={[row.id]:row.count};}
   else job.units=row.count;
   if(['talent','boss','mora','weekly'].includes(kind))jobs.push(job);
   else passive.push(job);
  }
  if(character.xp>0)jobs.push({id:'xp',kind:'xp',units:Math.max(0,character.xp-xp),person:character.id,rank:character.priority??characters.indexOf(character),days:[]});
  xp=Math.max(0,xp-(character.xp||0));
 }
 const groupedJobs=new Map(),bookBanks=new Map();
 for(const job of jobs){
  const family=job.kind==='talent'?bookFamily(job.item):job.kind==='weekly'?(job.item.sources||[]).join('|'):job.id;
  const key=job.person+':'+job.kind+':'+family;
  if(!groupedJobs.has(key))groupedJobs.set(key,{...job,materialIds:[job.id]});
  else {const existing=groupedJobs.get(key);existing.units+=job.units;existing.materialIds.push(job.id);if(job.bookNeed)for(const[id,count]of Object.entries(job.bookNeed))existing.bookNeed[id]=(existing.bookNeed[id]||0)+count;}
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
   let drops=FARM_YIELDS.weekly;const boss=supplementary.item?.sources?.[0]||supplementary.id;
   const shared=pending.filter(job=>job.kind==='weekly'&&(job.item?.sources?.[0]||job.id)===boss&&!weeklyCharacters.has(week+':'+job.person)).sort((a,b)=>a.rank-b.rank);
   for(const job of shared){const use=Math.min(drops,job.units);if(use<=0)continue;job.units-=use;drops-=use;weeklyCharacters.add(week+':'+job.person);entry.supplements.push({id:job.id,person:job.person});entry.materialIds.push(...(job.materialIds||[job.id]));entry.characterIds=[...new Set([...entry.characterIds,job.person])];if(drops<=0)break;}
   weeklyDone.add(week+':'+boss);
   entry.materialIds=[...new Set(entry.materialIds)];entry.weeklyResin=(discounts.get(week)||0)<3?30:60;discounts.set(week,(discounts.get(week)||0)+1);
  }
  if(primary&&primary.kind!=='artifact'){
   const resin=FARM_YIELDS.resin-(entry.weeklyResin||0),scale=resin/FARM_YIELDS.resin;
   if(primary.kind==='talent'){
    const family=bookFamily(primary.item),familyItems=[...(bookFamilies.get(family)||[])];
    if(!familyItems.some(item=>String(item.id)===String(primary.item.id)))familyItems.push(primary.item);
    const shared=pending.filter(job=>job.kind==='talent'&&bookFamily(job.item)===family).sort((a,b)=>a.rank-b.rank);
    let bank=bookBanks.get(family)||Object.fromEntries(familyItems.map(item=>[String(item.id),Number(stock[String(item.id)])||0]));
    const drops=familyItems.map(item=>({id:String(item.id),count:(FARM_YIELDS.talent[Number(item.rarity)-2]||0)*scale}));
    for(const drop of drops)bank[drop.id]=(bank[drop.id]||0)+drop.count;
    const remaining=shared.flatMap(job=>Object.entries(job.bookNeed).map(([id,count])=>({id,count})));
    bank=craftableInventory(remaining,familyItems,bank);
    for(const job of shared){let used=0;for(const[id,count]of Object.entries(job.bookNeed)){const take=Math.min(count,bank[id]||0);job.bookNeed[id]-=take;bank[id]=(bank[id]||0)-take;used+=take;}
     job.units=Object.entries(job.bookNeed).reduce((sum,[id,count])=>sum+count*Math.pow(3,Number(catalog.get(id)?.rarity||job.item.rarity)-2),0);
     if(used>0){entry.characterIds=[...new Set([...entry.characterIds,job.person])];entry.materialIds=[...new Set([...entry.materialIds,...job.materialIds])];}
    }
    bookBanks.set(family,bank);entry.expectedDrops=drops;entry.resin=resin;
   }else{
    let remaining=FARM_YIELDS[primary.kind]*scale;
    for(const job of [primary,...eligible.filter(j=>j!==primary&&j.kind===primary.kind&&j.id===primary.id)]){if(remaining<=0)break;const used=Math.min(job.units,remaining);job.units-=used;remaining-=used;if(used>0){entry.characterIds=[...new Set([...entry.characterIds,job.person])];entry.materialIds=[...new Set([...entry.materialIds,...(job.materialIds||[])])];}}
   }

  }
  for(const character of characters)if(!dates[character.id]&&!jobs.some(job=>job.person===character.id&&job.units>.00001))dates[character.id]=date;
  if(primary?.kind==='talent'){
   const philosophy=philosophies.get(bookFamily(primary.item));
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
 const unfinished=jobs.filter(job=>job.units>.00001),completion={};
 for(const character of characters){
  const missingHarvest=harvests.filter(row=>row.person===character.id&&!row.capacity),manual=passive.filter(row=>row.person===character.id&&row.kind!=='specialty'&&row.count>0),pending=unfinished.filter(row=>row.person===character.id);
  if(missingHarvest.length||pending.length)delete dates[character.id];
  completion[character.id]={estimatedDate:dates[character.id]||null,status:pending.length?'horizon-exceeded':missingHarvest.length?'missing-harvest-data':manual.length?'manual-stock-needed':'estimated',manualIds:manual.map(row=>row.id),unknownHarvestIds:missingHarvest.map(row=>row.id)};
 }
 return {sessions,dates,harvests,completion,unresolved:passive,unfinished};
}
