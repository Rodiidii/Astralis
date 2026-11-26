const KEY='astralis:energy-dock:v1';
const GAMES={gi:{name:'Genshin Impact',resource:'Résine originale',symbol:'✦',icon:'/assets/ui/game-genshin.png',max:200,minutes:8,color:'#e9bf73'},hsr:{name:'Honkai: Star Rail',resource:'Puissance pionnière',symbol:'✧',icon:'/assets/ui/game-starrail.png',max:300,minutes:6,color:'#c8a3ff'},ww:{name:'Wuthering Waves',resource:'Piles d’ondes',symbol:'◈',icon:'/assets/ui/game-wuthering.png',max:240,minutes:6,color:'#82d8d0'}};
let ticker=0;
let noticeTicker=0;
let activeEnergyView='track';
const num=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
function store(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function save(value){try{localStorage.setItem(KEY,JSON.stringify(value))}catch{}}
function energyAt(row,now=Date.now()){if(!row||row.current==null)return null;const max=num(row.max,1,9999),minutes=num(row.minutes,1,1440),gained=Math.floor(Math.max(0,now-(Number(row.updatedAt)||now))/(minutes*60000));return Math.min(max,num(row.current,0,max)+gained)}
function eta(row,target,now=Date.now()){const current=energyAt(row,now);if(current==null||current>=target)return 0;return (target-current)*num(row.minutes,1,1440)*60000-Math.max(0,now-(Number(row.updatedAt)||now))%(num(row.minutes,1,1440)*60000)}
function duration(ms){if(!ms)return 'Prêt maintenant';const minutes=Math.ceil(ms/60000);return `${Math.floor(minutes/60)} h ${String(minutes%60).padStart(2,'0')}`}
export function energyLocalDateTimeValue(milliseconds){const date=new Date(Number(milliseconds));if(!Number.isFinite(date.getTime()))return '';return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function energyLocalDateTimeTimestamp(value){const timestamp=new Date(String(value||'')).getTime();return Number.isFinite(timestamp)?timestamp:null}
function timeToPoint(row,now=Date.now()){const current=energyAt(row,now);if(current==null||current>=num(row.max,1,9999))return null;return num(row.minutes,1,1440)*60000-Math.max(0,now-(Number(row.updatedAt)||now))%(num(row.minutes,1,1440)*60000)}
export function energyGameForecast(id,row,now=Date.now()){
 const game=GAMES[id]||GAMES.gi,max=num(row?.max??game.max,1,9999),current=energyAt(row,now);
 if(current==null)return {current:null,max,progress:0,label:'Saisis ton stock',state:'setup'};
 const progress=Math.floor(current/max*100);
 if(current>=max)return {current,max,progress:100,label:'Réserve pleine',state:'full'};
 const fullIn=eta(row,max,now),state=fullIn<=4*60*60*1000?'near-cap':'charging';
 return {current,max,progress,label:`+1 dans ${duration(timeToPoint(row,now))} · plein ${duration(fullIn)}`,state};
}
export function energyPortfolioForecast(data = {}, now = Date.now()) {
 const games = Object.entries(GAMES).map(([id, game]) => {
  const row = data?.[id];
  if (!row || row.current == null) return null;
  const forecast = energyGameForecast(id, row, now);
  return { id, name: game.name, current: forecast.current, max: forecast.max, state: forecast.state, fullInMs: forecast.current >= forecast.max ? 0 : eta(row, forecast.max, now) };
 }).filter(Boolean);
 const pending = games.filter(game => game.state !== 'full').sort((a, b) => a.fullInMs - b.fullInMs);
 return { configured: games.length, nearCap: games.filter(game => game.state === 'near-cap').length, full: games.filter(game => game.state === 'full').length, next: pending[0] || null };
}
export function energyAbsenceProjection(row,absenceMinutes,now=Date.now()){
 const max=num(row?.max,1,9999),current=energyAt(row,now),minutes=num(row?.minutes,1,1440),durationMs=num(absenceMinutes,0,10080)*60000;
 if(current==null)return{ready:false,current:null,max,gained:0,recommendedSpend:0,spendNow:0,atReturn:null,unavoidableLoss:0,durationMs};
 const periodMs=minutes*60000,firstPoint=current>=max?periodMs:timeToPoint(row,now),gained=durationMs>=firstPoint?1+Math.floor((durationMs-firstPoint)/periodMs):0,recommendedSpend=Math.max(0,current+gained-max),spendNow=Math.min(current,recommendedSpend),atReturn=Math.min(max,current-spendNow+gained),unavoidableLoss=Math.max(0,current-spendNow+gained-max);
 return{ready:true,current,max,gained,recommendedSpend,spendNow,atReturn,unavoidableLoss,durationMs};
}
export function energyActivitySummary(row, now = Date.now()) {
 const today = new Date(now);
 const key = date => date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
 const entries = (Array.isArray(row?.history) ? row.history : []).filter(item => {
  const date = new Date(Number(item?.at));
  return Number.isFinite(date.getTime()) && key(date) === key(today);
 });
 const spent = entries.reduce((total,item) => total + Math.max(0,-(Number(item?.delta)||0)),0);
 const gained = entries.reduce((total,item) => total + Math.max(0,Number(item?.delta)||0),0);
 const retainedActions = Array.isArray(row?.history) ? row.history.length : 0;
 return { entries: entries.length, spent, gained, net: gained-spent, retainedActions, capped: retainedActions >= 90 };
}
export function energyDailySpendGoal(row,now=Date.now()){
 const summary=energyActivitySummary(row,now),raw=Number(row?.dailyGoal),target=Number.isFinite(raw)&&raw>0?Math.min(9999,Math.floor(raw)):null;
 if(!target)return {configured:false,target:null,spent:summary.spent,remaining:null,progress:0,complete:false};
 return {configured:true,target,spent:summary.spent,remaining:Math.max(0,target-summary.spent),progress:Math.min(100,Math.round(summary.spent/target*100)),complete:summary.spent>=target};
}
export function energyWeeklyActivity(row, now = Date.now()) {
 const today = new Date(now);
 const key = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const days = Array.from({length:7},(_,index)=>{
  const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6+index);
  return {date,key:key(date),label:new Intl.DateTimeFormat('fr-FR',{weekday:'short'}).format(date).replace('.',''),spent:0,gained:0};
 });
 const byDate=new Map(days.map(day=>[day.key,day]));
 for(const item of Array.isArray(row?.history)?row.history:[]){
  const date=new Date(Number(item?.at)),day=Number.isFinite(date.getTime())?byDate.get(key(date)):null;
  if(!day)continue;
  const delta=Number(item?.delta)||0;
  if(delta<0)day.spent+=-delta;else day.gained+=delta;
 }
 return {days,totalSpent:days.reduce((sum,day)=>sum+day.spent,0),totalGained:days.reduce((sum,day)=>sum+day.gained,0),actions:days.reduce((sum,day)=>sum+(day.spent>0||day.gained>0?1:0),0)};
}
export function energyWeeklyComparison(row, now = Date.now()) {
 const today=new Date(now),key=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const currentStart=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6),previousStart=new Date(today.getFullYear(),today.getMonth(),today.getDate()-13),currentKeys=new Set(),previousKeys=new Set();
 for(let offset=0;offset<7;offset++){const current=new Date(currentStart);current.setDate(current.getDate()+offset);currentKeys.add(key(current));const previous=new Date(previousStart);previous.setDate(previous.getDate()+offset);previousKeys.add(key(previous));}
 const totals={current:{spent:0,gained:0,activeDays:new Set()},previous:{spent:0,gained:0,activeDays:new Set()}};
 for(const entry of Array.isArray(row?.history)?row.history:[]){const date=new Date(Number(entry?.at));if(!Number.isFinite(date.getTime()))continue;const day=key(date),period=currentKeys.has(day)?totals.current:previousKeys.has(day)?totals.previous:null;if(!period)continue;const delta=Number(entry?.delta)||0;if(delta<0)period.spent+=-delta;else period.gained+=delta;if(delta)period.activeDays.add(day);}
 const current={spent:totals.current.spent,gained:totals.current.gained,activeDays:totals.current.activeDays.size},previous={spent:totals.previous.spent,gained:totals.previous.gained,activeDays:totals.previous.activeDays.size},available=previous.spent>0;
 return {current,previous,available,change:current.spent-previous.spent,percent:available?Math.round((current.spent-previous.spent)/Math.max(1,previous.spent)*100):null};
}
export function energyMonthlyActivity(row, now = Date.now()) {
 const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const today = new Date(now);
 const days = Array.from({length:28},(_,index)=>{
  const date = new Date(today.getFullYear(),today.getMonth(),today.getDate()-27+index);
  return {date,key:dateKey(date),spent:0,gained:0,actions:0,entries:[]};
 });
 const indexed = new Map(days.map(day=>[day.key,day]));
 for (const entry of Array.isArray(row?.history)?row.history:[]) {
  const date = new Date(Number(entry?.at)), day = Number.isFinite(date.getTime()) ? indexed.get(dateKey(date)) : null;
  if (!day) continue;
  const delta = Number(entry?.delta)||0;
  if (delta < 0) day.spent += -delta; else day.gained += delta;
  day.actions++;
  day.entries.push({at:Number(entry?.at)||0,label:String(entry?.label||'Ajustement'),delta});
 }
 for(const day of days)day.entries.sort((a,b)=>a.at-b.at);
 let currentStreak=0,bestStreak=0,run=0;
 for(const day of days){if(day.actions){run++;bestStreak=Math.max(bestStreak,run)}else run=0;}
 for(let index=days.length-1;index>=0&&days[index].actions;index--)currentStreak++;
 return {days,totalSpent:days.reduce((sum,day)=>sum+day.spent,0),totalGained:days.reduce((sum,day)=>sum+day.gained,0),activeDays:days.filter(day=>day.actions).length,currentStreak,bestStreak};
}
function refreshEnergyGameCards(root,now=Date.now()){
 const data=store();
 for(const card of root.querySelectorAll('[data-energy-game]')){
  const id=card.dataset.energyGame,game=GAMES[id],row=data[id]||{current:null,max:game.max,minutes:game.minutes},forecast=energyGameForecast(id,row,now);
  const stock=card.querySelector('[data-energy-stock]'),line=card.querySelector('[data-energy-forecast]'),meter=card.querySelector('[data-energy-game-meter]');
  card.classList.toggle('is-full',forecast.state==='full');card.classList.toggle('is-near-cap',forecast.state==='near-cap');card.dataset.energyState=forecast.state;
  if(stock)stock.textContent=forecast.current==null?'À renseigner':`${forecast.current} / ${forecast.max}`;
  if(line)line.textContent=forecast.label;
  if(meter){meter.setAttribute('aria-valuenow',String(forecast.current??0));meter.setAttribute('aria-valuemax',String(forecast.max));meter.style.setProperty('--energy-game-progress',`${forecast.progress}%`)}
  const state=card.querySelector('[data-energy-state]');if(state)state.textContent=forecast.state==='full'?'Plein':forecast.state==='near-cap'?'Plafond proche':forecast.state==='charging'?'Récupération':'À configurer';
 }
 const portfolio=root.querySelector('[data-energy-portfolio]');
 if(portfolio){const snapshot=energyPortfolioForecast(data,now),count=portfolio.querySelector('[data-energy-portfolio-count]'),status=portfolio.querySelector('[data-energy-portfolio-status]'),next=portfolio.querySelector('[data-energy-portfolio-next]');if(count)count.textContent=`${snapshot.configured} / 3 jeux suivis`;if(status)status.textContent=`${snapshot.full} pleine${snapshot.full===1?'':'s'} · ${snapshot.nearCap} proche${snapshot.nearCap===1?'':'s'} du plafond`;if(next)next.textContent=snapshot.next?`${snapshot.next.name} · ${duration(snapshot.next.fullInMs)} avant le plein`:'Aucune réserve configurée ou toutes les réserves sont pleines';}
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SESSION_COST={gi:40,hsr:40,ww:60};
export function projectEnergySession(active,row,plan,now=Date.now()){
 const game=GAMES[active]||GAMES.gi,max=num(row?.max??game.max,1,9999),minutes=num(row?.minutes??game.minutes,1,1440),cost=num(plan?.cost,1,max),legacyDelay=num(plan?.afterMinutes,0,10080),startAt=Number(plan?.startAt),scheduledAt=Number.isFinite(startAt)&&startAt>0?startAt:now+legacyDelay*60000,offsetMs=Math.max(0,scheduledAt-now),offsetMinutes=Math.ceil(offsetMs/60000),currentAtStart=row?.current==null?null:energyAt(row,now+offsetMs);
 if(currentAtStart==null)return {ready:false,currentAtStart:null,cost,remainingAfter:null,readyInMs:null,fullInMs:null,max,offsetMs,offsetMinutes,scheduledAt,scheduled:offsetMs===0};
 if(currentAtStart<cost){const readyInMs=eta(row,cost,now);return {ready:false,currentAtStart,cost,remainingAfter:null,readyInMs,fullInMs:null,max,offsetMs,offsetMinutes,scheduledAt,scheduled:offsetMs===0}}
 const remainingAfter=currentAtStart-cost,fullInMs=Math.max(0,max-remainingAfter)*minutes*60000;
 return {ready:true,currentAtStart,cost,remainingAfter,readyInMs:0,fullInMs,max,offsetMs,offsetMinutes,scheduledAt,scheduled:offsetMs===0};
}
function sessionPlanText(active,row,plan,now=Date.now()){
 const projection=projectEnergySession(active,row,plan,now);
 if(projection.currentAtStart==null)return 'Renseigne ton stock actuel pour prévoir cette session.';
 const lead=projection.offsetMs>0?`Dans ${duration(projection.offsetMs)}, `:'Maintenant, ';
 if(!projection.ready){const readyAt=projection.readyInMs==null?'':new Date(now+projection.readyInMs).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});return `${lead}${projection.currentAtStart} / ${projection.max} disponibles · il en manquera ${projection.cost-projection.currentAtStart}. ${readyAt?`Dépense possible vers ${readyAt}.`:''}`}
 return `${lead}${projection.currentAtStart} disponibles · après −${projection.cost}, il restera ${projection.remainingAfter}. Plein à nouveau dans ${duration(projection.fullInMs)}.`;
}
function sendThresholdNotice(active,row,current,target){if(!row?.notifyTarget||!target||current<target)return false;if(row.notifiedThreshold===target)return false;if(typeof Notification==='undefined'||Notification.permission!=='granted')return false;const game=GAMES[active]||GAMES.gi;try{const note=new Notification(`${game.name} · seuil atteint`,{body:`${current} / ${num(row.max,1,9999)} ${game.resource} disponibles.`,icon:'/assets/pwa/icon-192.png',tag:`astralis-energy-${active}-${target}`});note.onclick=()=>{window.focus();note.close()};row.notifiedThreshold=target;return true}catch{return false}}
export function isSessionNoticeDue(session,now=Date.now()){const startAt=Number(session?.startAt);return session?.notifySession===true&&Number.isFinite(startAt)&&startAt>0&&now>=startAt&&Number(session?.notifiedFor)!==startAt}
function sendSessionNotice(active,row,now=Date.now()){const session=row?.sessionPlan;if(!isSessionNoticeDue(session,now)||typeof Notification==='undefined'||Notification.permission!=='granted')return false;const game=GAMES[active],startAt=Number(session.startAt);try{const note=new Notification(`${game.name} · session prévue`,{body:`Ta dépense de ${num(session.cost,1,num(row.max??game.max,1,9999))} ${game.resource} est à confirmer.`,icon:'/assets/pwa/icon-192.png',tag:`astralis-session-${active}-${startAt}`});note.onclick=()=>{window.focus();note.close()};session.notifiedFor=startAt;return true}catch{return false}}
export function checkEnergyNotices(now=Date.now()){if(typeof Notification==='undefined'||Notification.permission!=='granted')return;const data=store();let changed=false;for(const [active,row] of Object.entries(data)){if(!GAMES[active]||!row)continue;if(row.notifyTarget&&row.current!=null){const target=num(row.target??Math.min(160,GAMES[active].max),0,num(row.max??GAMES[active].max,1,9999)),current=energyAt(row,now);if(current<target&&row.notifiedThreshold===target){row.notifiedThreshold=null;changed=true}else if(current>=target&&sendThresholdNotice(active,row,current,target))changed=true}if(sendSessionNotice(active,row,now)){changed=true}}if(changed)save(data)}
function startEnergyNoticeTicker(){if(noticeTicker||typeof document==='undefined')return;checkEnergyNotices();noticeTicker=setInterval(checkEnergyNotices,15000);document.addEventListener('visibilitychange',checkEnergyNotices)}
if(typeof document!=='undefined')startEnergyNoticeTicker();
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startEnergyNoticeTicker,{once:true});else startEnergyNoticeTicker()}

export { renderEnergyTracker, mountEnergyTracker } from './energy-session-optimizer.js';
