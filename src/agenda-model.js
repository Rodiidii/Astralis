export function newsDate(value){
 if(value==null||value==='')return '';
 const time=typeof value==='number'?value*(value<1e12?1000:1):Date.parse(value);
 return Number.isFinite(time)?new Date(time).toISOString():'';
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
