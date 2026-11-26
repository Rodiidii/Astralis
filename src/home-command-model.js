export const SERVER_OFFSETS={europe:1,america:-5,asia:8};
export function serverTimestamp(value,server='europe'){if(!value)return NaN;const text=String(value),offset=SERVER_OFFSETS[server]??1;return Date.parse(text+(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(text)?(offset>=0?'+':'-')+String(Math.abs(offset)).padStart(2,'0')+':00':''));}
export function gameDay(now=new Date(),server='europe'){return new Date(+new Date(now)+((SERVER_OFFSETS[server]??1)-4)*3600000).toISOString().slice(0,10)}
export function nextMonthlyReset(day,now=new Date(),server='europe'){
 const offset=SERVER_OFFSETS[server]??1,local=new Date(+new Date(now)+offset*3600000);
 let next=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),day,4-offset);
 if(next<=+now)next=Date.UTC(local.getUTCFullYear(),local.getUTCMonth()+1,day,4-offset);
 return new Date(next).toISOString();
}
export function endgameDeadlines(c={},now=new Date(),server='europe'){
 const windows=c.endgameWindows||c.endgameData?.windows||{};
 return [['abyss','Spirale abyssale',16,'cryo'],['theater','Théâtre de l’Imaginarium',1,'anemo'],['onslaught','Carnage chtonien',0,'pyro']].map(([kind,title,day,element])=>{
  const event=(c.events||[]).find(e=>e.kind===kind&&serverTimestamp(e.end,server)>+now),detail=c.endgameData?.[kind]||{},published=windows[kind]?.end||event?.end||detail.end||detail.endDate;
  const end=serverTimestamp(published,server)>+now?new Date(serverTimestamp(published,server)).toISOString():day?nextMonthlyReset(day,now,server):'';
  return {kind,title,image:'/assets/genshin/elements/gi-'+element+'.png',end,source:serverTimestamp(published,server)>+now?'Rotation publiée':day?'Reset mensuel · 4 h serveur':'Date à confirmer',days:end?Math.max(0,Math.ceil((serverTimestamp(end,server)-+now)/86400000)):null};
 });
}
export function farmBrief(rows=[],today=gameDay()){
 const todayRows=rows.filter(r=>r.date===today),pending=todayRows.filter(r=>!r.done);
 return {rows:todayRows,pending,completed:todayRows.length-pending.length,resin:pending.reduce((sum,r)=>sum+Math.max(0,Number(r.resin??r.resinCost??r.cost)||0),0)};
}
export function safeImage(value,fallback=''){const url=String(Array.isArray(value)?value[0]:value||'');return /^(?:\/(?!\/)|\.\/|https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/i.test(url)?url:fallback}
