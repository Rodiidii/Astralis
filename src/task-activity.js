const DAY_MS=86400000;
const localDate=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

/** Fourteen-day completion history, week-over-week delta and current streak. */
export function taskActivitySummary(tasks=[],now=Date.now()){
 const today=new Date(now),days=Array.from({length:7},(_,index)=>{
  const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-(6-index));
  const key=localDate(date),count=(Array.isArray(tasks)?tasks:[]).filter(task=>task?.done&&Number(task.completedAt)>0&&localDate(new Date(Number(task.completedAt)))===key).length;
  return {date:key,label:new Intl.DateTimeFormat('fr-FR',{weekday:'short'}).format(date).replace('.',''),day:date.getDate(),count};
 });
 const valid=(Array.isArray(tasks)?tasks:[]).filter(task=>task?.done&&Number(task.completedAt)>0&&Number.isFinite(Number(task.completedAt))),byDate=new Set(valid.map(task=>localDate(new Date(Number(task.completedAt)))));
 let cursor=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 if(!byDate.has(localDate(cursor)))cursor.setDate(cursor.getDate()-1);
 let streak=0;
 while(byDate.has(localDate(cursor))&&streak<365){streak++;cursor.setDate(cursor.getDate()-1);}
 const total=days.reduce((sum,row)=>sum+row.count,0),peak=Math.max(0,...days.map(row=>row.count)),previousStart=new Date(today.getFullYear(),today.getMonth(),today.getDate()-13),previousEnd=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6),previousTotal=valid.filter(task=>{const date=new Date(Number(task.completedAt));return date>=previousStart&&date<previousEnd;}).length,delta=total-previousTotal;
 return {days,total,peak,streak,average:Math.round(total/7*10)/10,previousTotal,delta,trend:delta>0?'up':delta<0?'down':'steady'};
}
