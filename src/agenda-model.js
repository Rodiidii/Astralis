export function newsDate(value){
 if(value==null||value==='')return '';
 const time=typeof value==='number'?value*(value<1e12?1000:1):Date.parse(value);
 return Number.isFinite(time)?new Date(time).toISOString():'';
}
export function localAgendaDay(value){
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return '';
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function mergeEndgameCalendarRows(calendarRows=[],windows={},details={}){
 const labels={abyss:'Spirale abyssale',theater:'Théâtre de l’Imaginarium',onslaught:'Carnage chtonien'};
 const current=Object.entries(labels).flatMap(([kind,title])=>{
  const window=windows?.[kind];
  if(!window?.start||!window?.end)return [];
  const detail=details?.[kind]||{};
  return [{id:`astralis:endgame:${kind}:${window.start}`,kind,title,start:window.start,end:window.end,category:'endgame',description:detail.title||detail.period||'Rotation actuellement publiée.',source:{title:'Rotation endgame Genshin',url:'https://genshinflex.com/en/calendar/'}}];
 });
 const keys=new Set(current.map(row=>`${row.kind}|${localAgendaDay(row.start)}`));
 return [...calendarRows.filter(row=>!keys.has(`${row.kind}|${localAgendaDay(row.start)}`)),...current];
}
export function characterBirthdayCalendarRows(characters=[],today=new Date()){
 const rows=[];
 for(const character of characters||[]){
  const raw=String(character?.birthdaymmdd||character?.birthday||'').trim();
  const numbers=raw.match(/\d+/g)?.map(Number)||[];
  let month=0,day=0;
  if(numbers.length>=2)[month,day]=numbers.length>=3?numbers.slice(-2):numbers;
  else{
   const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
   const normalized=raw.toLocaleLowerCase('en').replace(/[.]/g,'');
   const index=months.findIndex(name=>normalized.includes(name.slice(0,3)));
   if(index>=0){month=index+1;day=numbers[0]||0;}
  }
  if(month<1||month>12||day<1||day>31)continue;
  const name=String(character?._name||character?.name||'').trim();
  if(!name)continue;
  for(const year of [today.getFullYear(),today.getFullYear()+1]){
   const startDate=new Date(year,month-1,day,0,0,0,0);
   if(startDate.getFullYear()!==year||startDate.getMonth()!==month-1||startDate.getDate()!==day)continue;
   if(startDate<new Date(today.getFullYear(),today.getMonth(),today.getDate()))continue;
   const endDate=new Date(year,month-1,day,23,59,59,999);
   rows.push({id:`birthday:${character._id||character.id||name}:${year}`,kind:'birthday',category:'birthday',title:`Anniversaire · ${name}`,characterId:String(character._id||character.id||''),characterName:name,start:startDate.toISOString(),end:endDate.toISOString(),description:`Anniversaire de ${name}.`,source:{title:'Fiche de personnage Genshin Impact'}});
  }
 }
 return rows.sort((a,b)=>a.start.localeCompare(b.start));
}
export function shiftAgendaMonth(value, delta){
 const match=String(value||'').match(/^(\d{4})-(\d{2})$/);
 if(!match)return '';
 const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1+Number(delta||0),1));
 return Number.isNaN(date.getTime())?'':`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
}
export function filterNewsRows(rows=[],{category='all',query='',source='all',view='all',readKeys=[],savedKeys=[]}={}){
 const read=new Set(readKeys),saved=new Set(savedKeys),needle=String(query).trim().toLocaleLowerCase('fr');
 return rows.filter(row=>{
  const key=String(row.id||row.link||row.title||''),text=`${row.title||''} ${row.description||''} ${row.source||''}`.toLocaleLowerCase('fr');
  const matchesSource=source==='all'||(source==='hoyolab'&&String(row.feed||'').toLowerCase().includes('hoyolab'))||(source==='community'&&!!row.kind)||(source==='official'&&!row.kind&&!String(row.feed||'').toLowerCase().includes('hoyolab'));
  const matchesView=view==='all'||(view==='unread'&&!read.has(key))||(view==='saved'&&saved.has(key));
  return (category==='all'||row.category===category)&&(!needle||text.includes(needle))&&matchesSource&&matchesView;
 });
}
export function officialNews(rows=[]){
 const seen=new Set();
 return rows.filter(row=>{
  if(row.kind||row.auto||row.simulated||row.category==='endgame')return false;
  if(/spiral abyss|abyssal moon|imaginarium theat|théâtre de l.imaginarium|carnage chtonien|stygian onslaught/i.test(row.title||''))return false;
  let official=false;
  try{const host=new URL(row.link||row.url).hostname;official=['hoyoverse.com','hoyolab.com'].some(domain=>host===domain||host.endsWith('.'+domain));}catch{}
  if(!official)return false;
  const key=row.id||row.link;if(seen.has(key))return false;seen.add(key);return true;
 }).map(row=>({...row,date:newsDate(row.date||row.publishedAt||row.published_at)}));
}
export function agendaEntries(calendar=[],announcements=[]){
 const seen=new Set();
 return [...calendar,...announcements.filter(row=>row.start)].filter(row=>{
  if(/farm|objectif|objective/i.test(row.kind||row.category||''))return false;
  const from=newsDate(row.start||row.startDate),to=newsDate(row.end||row.endDate||row.start||row.startDate);
  if(!from||!to)return false;
  const key=[row.kind||row.category,row.title,from,to].join('|');if(seen.has(key))return false;seen.add(key);return true;
 }).map(row=>({...row,start:newsDate(row.start||row.startDate),end:newsDate(row.end||row.endDate||row.start||row.startDate),category:['char-banner','weapon-banner','banner'].includes(row.kind||row.category)?'banner':['version','update'].includes(row.kind||row.category)?'update':['abyss','theater','onslaught','endgame'].includes(row.kind||row.category)?'endgame':row.category||'event'}));
}
export function versionCalendar(month){
 const start=Date.parse(month+'-01T00:00:00Z');if(!Number.isFinite(start))return [];
 const anchor=Date.parse('2026-11-04T00:00:00Z'),cycle=42*86400000,end=new Date(start);end.setUTCMonth(end.getUTCMonth()+1);
 const rows=[];for(let index=Math.floor((start-anchor)/cycle);index<=Math.ceil((end-anchor)/cycle);index++){
  const date=anchor+index*cycle;if(date<start||date>=+end)continue;
  rows.push({id:'estimated-version:'+date,kind:'version',title:'Mise à jour · date estimée',start:new Date(date).toISOString(),end:new Date(date+86400000-1).toISOString(),estimated:true,description:'Cycle de 42 jours selon l’ancrage du 4 novembre 2026. À confirmer par l’annonce officielle.'});
 }return rows;
}
