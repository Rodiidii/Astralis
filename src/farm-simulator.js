// Rendement hebdomadaire moyen retenu : deux matériaux par personnage suivi.
export const FARM_YIELDS=Object.freeze({resin:180,talent:Object.freeze([20,18,2]),weapon:40,xp:1102500,mora:540000,boss:15.75,weekly:2});
const bookFamily=item=>String(item.sortRank??('id:'+item.id));

const weekdayNames=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const weekdayAliases=new Map(weekdayNames.flatMap((name,index)=>[[name,index],[name.slice(0,3),index],[['monday','tuesday','wednesday','thursday','friday','saturday','sunday'][index],index],[['mon','tue','wed','thu','fri','sat','sun'][index],index]]));
export function farmWeekdayIndex(value){
 if(Number.isInteger(value)&&value>=0&&value<7)return value;
 const raw=String(value??'').trim();
 if(/^\d+$/.test(raw)){const numeric=Number(raw);if(numeric>=0&&numeric<7)return numeric;}
 const normalized=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').replace(/[.,]/g,'').trim();
 return weekdayAliases.get(normalized)??-1;
}
export function materialKind(item){
 const name=String(item?.name||item?._name||''),text=(item?.typeText||'')+' '+name+' '+(item?.sources||[]).join(' '),id=String(item?.id??item?._id??''),talent=/aptitude de personnage|character talent|talent level|talent material/i.test(text),weeklySource=/70\+|hebdomadaire|weekly|trounce|domination/i.test(text);
 // La Couronne de la sagesse améliore les talents, mais ne se farm pas dans un domaine.
 // Sans cette exception, son libellé la faisait planifier comme un livre d’aptitude quotidien.
 if(id==='104319'||/couronne de (?:la )?sagesse|crown of insight/i.test(name))return 'other';
 // Les matériaux de boss hebdomadaire sont aussi des matériaux d’aptitude; le type de drop doit primer sur le libellé générique.
 if(weeklySource||(/^113/.test(id)&&talent))return 'weekly';
 if(talent)return 'talent';
 if(/produit (de|du|des|d[’'])|produit.*régional|spécialité.*locale|local specialty/i.test(text))return 'specialty';
 if(id==='202')return 'mora';
 if(/^114/.test(id)||/élévation d'arme|élévation d’arme|weapon ascension/i.test(text))return 'weapon';
 if(/^112/.test(id))return 'mob';
 if(/^113/.test(id))return 'boss';
 return 'other';
}
export function craftableInventory(requirements,materials,inventory={}){
 const stock={...inventory},groups=new Map(),required=new Map();
 for(const row of requirements)required.set(String(row.id),(required.get(String(row.id))||0)+Number(row.count||0));
 for(const item of materials){const kind=materialKind(item);if(!['talent','mob','weapon'].includes(kind))continue;const key=kind+':'+bookFamily(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 for(const family of groups.values()){
  if(family.length<3)continue;family.sort((a,b)=>a.rarity-b.rarity);
  for(let tier=0;tier<family.length-1;tier++){const id=String(family[tier].id),next=String(family[tier+1].id),surplus=Math.max(0,(Number(stock[id])||0)-(required.get(id)||0)),converted=Math.floor(surplus/3);stock[id]=(Number(stock[id])||0)-converted*3;stock[next]=(Number(stock[next])||0)+converted;}
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
export function farmRequirementProgress(requirements=[],allocation={}){
 const rows=(Array.isArray(requirements)?requirements:[]).map(row=>{const id=String(row?.id??row?.name??''),required=Math.max(0,Number(row?.count)||0),owned=Math.min(required,Math.max(0,Number(allocation?.[id])||0));return {...row,id,required,owned,remaining:Math.max(0,required-owned)}}).filter(row=>row.id),required=rows.reduce((sum,row)=>sum+row.required,0),owned=rows.reduce((sum,row)=>sum+row.owned,0),remaining=Math.max(0,required-owned),complete=rows.filter(row=>row.remaining===0).length;
 return {rows,required,owned,remaining,complete,total:rows.length,percent:required?Math.round(owned/required*100):100};
}
export function farmStockDateImpact(withoutStockDate,withStockDate){
 const parse=value=>{const text=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return null;const date=new Date(text+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===text?date:null;};
 const baseline=parse(withoutStockDate),actual=parse(withStockDate);
 if(!baseline||!actual)return {daysSaved:null,status:'unknown'};
 const daysSaved=Math.round((baseline-actual)/86400000);
 return {daysSaved,status:daysSaved>0?'earlier':daysSaved<0?'later':'same'};
}
export function simulateFarm({characters,materials,inventory={},start,artifactDays=0,weeklyDay=null,maxDays=730,xp=0,specialties={},reservedDates=[]}){
 const weeklyDayIndex=weeklyDay==null||weeklyDay===''?null:Number(weeklyDay),hasWeeklyDay=Number.isInteger(weeklyDayIndex)&&weeklyDayIndex>=0&&weeklyDayIndex<7;
 characters=characters.map((character,index)=>({...character,priority:character.priority??index})).sort((a,b)=>a.priority-b.priority);
 const catalog=new Map(materials.map(m=>[String(m.id),m])),bookFamilies=new Map();
 for(const item of materials)if(materialKind(item)==='talent'){const family=bookFamily(item);if(!bookFamilies.has(family))bookFamilies.set(family,[]);bookFamilies.get(family).push(item);}
 const prepared=allocateFarmInventory(characters,materials,inventory),stock=prepared.unallocated,jobs=[],passive=[],dates={},sessions=[];
 for(const character of characters){
  const needs=prepared.remaining[character.id];
  for(const row of needs){
   const item=catalog.get(row.id)||row.item||{id:row.id,name:row.name};
   if(row.count<=0)continue;
   const kind=materialKind(item);
   const job={...row,item,kind,person:character.id,isWeapon:Boolean(character.isWeapon),rank:character.priority??characters.indexOf(character),days:[...new Set((item.daysOfWeek||[]).map(farmWeekdayIndex).filter(x=>x>=0))]};
   if(kind==='talent'||kind==='weapon'){job.units=row.count*Math.pow(3,Math.max(0,Number(item.rarity)-2));if(kind==='talent')job.bookNeed={[row.id]:row.count};}
   else job.units=row.count;
   if(['talent','boss','weapon','mora','weekly'].includes(kind))jobs.push(job);
   else passive.push(job);
  }
  if(character.xp>0)jobs.push({id:'xp',kind:'xp',units:Math.max(0,character.xp-xp),person:character.id,rank:character.priority??characters.indexOf(character),days:[]});
  xp=Math.max(0,xp-(character.xp||0));
 }
 const groupedJobs=new Map(),bookBanks=new Map();
 for(const job of jobs){
  const family=job.kind==='talent'?bookFamily(job.item):job.kind==='weapon'?(job.item.dropDomainName||bookFamily(job.item)):job.kind==='weekly'?(job.item.sources||[]).join('|'):job.id;
  const key=job.kind==='weapon'?'weapon:'+family:job.person+':'+job.kind+':'+family;
  if(!groupedJobs.has(key))groupedJobs.set(key,{...job,materialIds:[job.id],weaponIds:job.isWeapon?[job.person]:[],...(job.kind==='weekly'?{weeklyNeed:{[job.id]:job.units}}:{})});
  else {const existing=groupedJobs.get(key);existing.units+=job.units;existing.materialIds.push(job.id);if(job.isWeapon)existing.weaponIds=[...new Set([...(existing.weaponIds||[]),job.person])];if(job.bookNeed)for(const[id,count]of Object.entries(job.bookNeed))existing.bookNeed[id]=(existing.bookNeed[id]||0)+count;if(job.kind==='weekly')existing.weeklyNeed[job.id]=(existing.weeklyNeed[job.id]||0)+job.units;}
 }
 jobs.splice(0,jobs.length,...groupedJobs.values());
 const harvests=passive.filter(job=>job.kind==='specialty').map(job=>{const source=specialties[job.id],capacity=Number(source?.capacity)||0;return {...job,capacity,cycles:capacity?Math.ceil(job.count/capacity):null,source:source?.source};});
 const artifactWeeks=new Map(),reserved=new Set(reservedDates);
 const initial=new Date(start+'T12:00:00');
 if(!Number.isFinite(initial.getTime()))return {sessions:[],dates:{},unresolved:passive};
 const priority={talent:0,weapon:1,boss:2,xp:3,mora:4,weekly:5},isSundayPriority=job=>job.kind==='talent'||job.kind==='weapon',canFarmDay=(job,day)=>!job.days.length||job.days.includes(day)||(day===6&&isSundayPriority(job)),sortDayJobs=(a,b,day)=>{if(day===6){const preferred=Number(isSundayPriority(b))-Number(isSundayPriority(a));if(preferred)return preferred;if(isSundayPriority(a)&&isSundayPriority(b))return a.rank-b.rank||priority[a.kind]-priority[b.kind];}return priority[a.kind]-priority[b.kind]||a.rank-b.rank;};let xpMoraTurn=0;
 for(let offset=0;offset<maxDays;offset++){
  const day=new Date(initial);day.setDate(day.getDate()+offset);
  const date=day.toLocaleDateString('sv-SE'),weekday=(day.getDay()+6)%7,weekStart=new Date(day);weekStart.setDate(day.getDate()-weekday);const week=weekStart.toLocaleDateString('sv-SE');
  for(const harvest of harvests){if(!harvest.ready&&harvest.cycles&&offset>=(harvest.cycles-1)*2)harvest.ready=date;}
  const pending=jobs.filter(job=>job.units>.00001);
  for(const character of characters)if(!dates[character.id]&&!pending.some(job=>job.person===character.id))dates[character.id]=date;
  if(!pending.length)break;
  const eligible=pending.filter(job=>job.kind!=='weekly'&&canFarmDay(job,weekday));
  // Le dimanche, les domaines d’aptitudes et d’armes passent avant les autres activités.
  eligible.sort((a,b)=>sortDayJobs(a,b,weekday));
  if(!artifactWeeks.has(week)){
   const days=Array.from({length:7},(_,day)=>{const target=new Date(weekStart);target.setDate(target.getDate()+day);const candidates=pending.filter(job=>job.kind!=='weekly'&&canFarmDay(job,day)).sort((a,b)=>sortDayJobs(a,b,day)),primary=candidates[0],protectSunday=day===6&&pending.some(isSundayPriority);return {day,available:target>=initial&&!reserved.has(target.toLocaleDateString('sv-SE')),urgency:protectSunday?-100000:primary?(priority[primary.kind]*1000+primary.rank):100000};}).filter(row=>row.available);
   days.sort((a,b)=>b.urgency-a.urgency||a.day-b.day);artifactWeeks.set(week,new Set(days.slice(0,Math.max(0,Math.min(4,artifactDays))).map(row=>row.day)));
  }
  const artifact=artifactWeeks.get(week).has(weekday);
  const reservedDate=reserved.has(date),isWeeklyDay=hasWeeklyDay&&weekday===weeklyDayIndex;
  if(reservedDate&&!isWeeklyDay)continue;
  let primary;
  if(reservedDate)primary=null;
  else if(artifact&&!eligible.some(job=>job.kind==='talent'||job.kind==='weapon'))primary={kind:'artifact',person:characters[0]?.id};
  else{
   const priorityJobs=eligible.filter(job=>!['xp','mora'].includes(job.kind)),xpJob=eligible.find(job=>job.kind==='xp'),moraJob=eligible.find(job=>job.kind==='mora');
   if(priorityJobs.length)primary=priorityJobs[0];
   else if(xpJob&&moraJob){primary=xpMoraTurn%3===2?moraJob:xpJob;xpMoraTurn++;}
   else primary=eligible[0];
  }
  const entry={date,kind:primary?.kind||'rest',characterIds:primary&&!primary.isWeapon?[primary.person]:[],weaponIds:primary?.isWeapon?(primary.weaponIds||[primary.person]):[],materialIds:primary?.id&&primary.id!=='xp'?(primary.materialIds||[primary.id]):[],supplements:[],auto:true};
  let weeklyResinToday=0;
  if(isWeeklyDay){
   const bossGroups=new Map();
   for(const job of pending.filter(row=>row.kind==='weekly')){const boss=job.item?.sources?.[0]||job.id;if(!bossGroups.has(boss))bossGroups.set(boss,[]);bossGroups.get(boss).push(job);}
   const weeklyEntry={date,kind:'weekly',characterIds:[],materialIds:[],supplements:[],auto:true},bossNames=[];let claims=0;
   for(const[boss,group]of bossGroups){let usedForBoss=0;group.sort((a,b)=>a.rank-b.rank);
    // Chaque progression de personnage reçoit une estimation indépendante de deux drops par semaine.
    for(const job of group){let drops=FARM_YIELDS.weekly,personUsed=0;for(const[id,need]of Object.entries(job.weeklyNeed||{[job.id]:job.units})){if(drops<=0)break;const use=Math.min(drops,need);if(use<=0)continue;job.weeklyNeed[id]-=use;job.units-=use;drops-=use;personUsed+=use;usedForBoss+=use;weeklyEntry.supplements.push({id,person:job.person,count:use});weeklyEntry.materialIds.push(id);}if(personUsed>0)weeklyEntry.characterIds.push(job.person);}
    if(usedForBoss>0){claims++;const source=String(boss);bossNames.push(source.replace(/^Défi de /i,'').replace(/\s*\(Niv\..*$/i,'').trim());}
   }
   if(claims){weeklyResinToday=Math.min(3,claims)*30+Math.max(0,claims-3)*60;weeklyEntry.materialIds=[...new Set(weeklyEntry.materialIds)];weeklyEntry.characterIds=[...new Set(weeklyEntry.characterIds)];weeklyEntry.title='Boss hebdomadaires · '+bossNames.join(' · ');weeklyEntry.category='Boss hebdomadaires';weeklyEntry.weeklyResin=weeklyResinToday;weeklyEntry.resin=weeklyResinToday;weeklyEntry.weeklyDay=weeklyDayIndex;sessions.push(weeklyEntry);}
  }
  if(primary?.kind==='artifact')entry.resin=Math.max(0,FARM_YIELDS.resin-weeklyResinToday);
  if(primary&&primary.kind!=='artifact'){
   const resin=Math.max(0,FARM_YIELDS.resin-weeklyResinToday),scale=resin/FARM_YIELDS.resin;
   entry.resin=resin;
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
    for(const job of [primary,...eligible.filter(j=>j!==primary&&j.kind===primary.kind&&j.id===primary.id)]){if(remaining<=0)break;const used=Math.min(job.units,remaining);job.units-=used;remaining-=used;if(used>0){if(job.isWeapon)entry.weaponIds=[...new Set([...entry.weaponIds,...(job.weaponIds||[job.person])])];else entry.characterIds=[...new Set([...entry.characterIds,job.person])];entry.materialIds=[...new Set([...entry.materialIds,...(job.materialIds||[])])];}}
   }

  }
  for(const character of characters)if(!dates[character.id]&&!jobs.some(job=>job.person===character.id&&job.units>.00001))dates[character.id]=date;
  const baseTitle=({talent:'Livres d’aptitudes',weapon:'Matériaux d’armes',boss:'Boss d’ascension',xp:'Livres d’EXP',mora:'Mora',artifact:'Artéfacts',rest:'Disponible'})[entry.kind],materialLabel=['talent','weapon'].includes(primary?.kind)?(primary.item?.dropDomainName||primary.item?.name||''):primary?.kind==='boss'?(primary.item?.name||''):'';
  entry.title=baseTitle+(materialLabel?' · '+materialLabel:'');
  entry.category=entry.kind==='artifact'?'Artéfacts':entry.title;
  if(primary)sessions.push(entry);
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
  const awaitingWeeklyDay=weeklyDayIndex===null&&pending.some(row=>row.kind==='weekly');
  completion[character.id]={estimatedDate:dates[character.id]||null,status:pending.some(row=>row.kind!=='weekly')?'horizon-exceeded':awaitingWeeklyDay?'awaiting-weekly-day':pending.length?'horizon-exceeded':missingHarvest.length?'missing-harvest-data':manual.length?'manual-stock-needed':'estimated',manualIds:manual.map(row=>row.id),unknownHarvestIds:missingHarvest.map(row=>row.id)};
 }
 return {sessions,dates,harvests,completion,unresolved:passive,unfinished};
}
