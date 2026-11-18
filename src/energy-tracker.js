const KEY='astralis:energy-dock:v1';
const GAMES={gi:{name:'Genshin Impact',resource:'Résine originale',symbol:'✦',max:200,minutes:8,color:'#e9bf73'},hsr:{name:'Honkai: Star Rail',resource:'Puissance pionnière',symbol:'✧',max:300,minutes:6,color:'#c8a3ff'},ww:{name:'Wuthering Waves',resource:'Piles d’ondes',symbol:'◈',max:240,minutes:6,color:'#82d8d0'}};
let ticker=0;
let noticeTicker=0;
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

export function renderEnergyTracker(active='gi'){
 const data=store(),game=GAMES[active]||GAMES.gi,row=data[active]||{current:null,max:game.max,minutes:game.minutes,target:Math.min(160,game.max)},history=Array.isArray(row.history)?row.history.slice(-6).reverse():[];
 const current=energyAt(row),max=num(row.max??game.max,1,9999),target=num(row.target??Math.min(160,max),0,max),quickSpends=(Array.isArray(row.quickSpends)?row.quickSpends:[20,40,60]).slice(0,3).map(amount=>num(amount,1,max)),pct=current==null?0:Math.round(current/max*100),remaining=current==null?null:Math.max(0,max-current),ready=current!=null&&current>=max,activity=energyActivitySummary(row);
 const cards=Object.entries(GAMES).map(([id,g])=>{const r=data[id]||{current:null,max:g.max,minutes:g.minutes,target:Math.min(160,g.max)},forecast=energyGameForecast(id,r);return `<button type="button" class="energy-game ${id===active?'is-active':''} ${forecast.state==='full'?'is-full':''} ${forecast.state==='near-cap'?'is-near-cap':''}" data-energy-game="${id}" data-energy-state="${forecast.state}" style="--energy-accent:${g.color}"><span>${g.symbol}</span><b>${g.name}</b><small data-energy-stock>${forecast.current==null?'À renseigner':`${forecast.current} / ${forecast.max}`}</small><small class="energy-state" data-energy-state>${forecast.state==='full'?'Plein':forecast.state==='near-cap'?'Plafond proche':forecast.state==='charging'?'Récupération':'À configurer'}</small><em data-energy-forecast>${forecast.label}</em><i class="energy-game-meter" data-energy-game-meter role="progressbar" aria-label="${g.name} · énergie récupérée" aria-valuemin="0" aria-valuemax="${forecast.max}" aria-valuenow="${forecast.current??0}" style="--energy-game-progress:${forecast.progress}%"><i></i></i></button>`}).join('');
 const portfolio=energyPortfolioForecast(data);
 const portfolioPanel=portfolio.configured>=2?`<section class="energy-portfolio" data-energy-portfolio aria-label="Vue globale des reserves"><span class="energy-portfolio-mark" aria-hidden="true">*</span><div><small>VEILLE MULTI-UNIVERS</small><b data-energy-portfolio-count>${portfolio.configured} / 3 jeux suivis</b></div><div><small>ETAT DES RESERVES</small><b data-energy-portfolio-status>${portfolio.full} pleine${portfolio.full===1?"":"s"} - ${portfolio.nearCap} proche${portfolio.nearCap===1?"":"s"} du plafond</b></div><div><small>PROCHAIN PLAFOND</small><b data-energy-portfolio-next>${portfolio.next?`${portfolio.next.name} - ${duration(portfolio.next.fullInMs)} avant le plein`:"Toutes les reserves sont pleines"}</b></div></section>`:'';
 return `<main class="energy-page" data-energy-tracker data-energy-active="${active}" style="--energy-accent:${game.color}"><header class="energy-hero"><div><span class="energy-kicker">CENTRE DE RÉCUPÉRATION · ${game.name.toUpperCase()}</span><h1>Garde ton énergie<br><em>au bon moment.</em></h1><p>Un compteur vivant pour planifier tes dépenses, éviter le plafond et savoir quand revenir.</p></div><div class="energy-orbit" aria-hidden="true"><i></i><b>${game.symbol}</b></div></header><nav class="energy-games" aria-label="Choisir un jeu">${cards}</nav>${portfolioPanel}<section class="energy-main"><div class="energy-meter" style="--energy-progress:${pct}%"><div class="energy-meter-core"><span>${current==null?'—':current}</span><small>/ ${max} ${esc(game.resource)}</small></div></div><div class="energy-detail"><span class="energy-kicker">TON RÉSERVOIR</span><h2>${current==null?'Entre ton stock actuel':ready?'Réserve pleine':`${remaining} points avant le plafond`}</h2><p data-energy-clock>${current==null?'La récupération automatique commencera à partir de la valeur saisie.':ready?'Tout est récupéré. Dépense un peu pour relancer le compteur.':`Prochain point dans ${duration(timeToPoint(row))} · plein dans ${duration(remaining*num(row.minutes,1,1440)*60000)}`}</p><div class="energy-actions"><form data-energy-value><label for="energy-current">Stock actuel</label><div><input id="energy-current" name="current" inputmode="numeric" type="number" min="0" max="${max}" value="${current??''}" placeholder="ex. 120" required><button class="energy-primary" type="submit">Actualiser</button></div></form><div class="energy-stepper"><button type="button" data-energy-step="-1" aria-label="Dépenser un point">−1</button><span>Ajustement manuel</span><button type="button" data-energy-step="1" aria-label="Ajouter un point">+1</button></div><section class="energy-spend"><header><b>Dépense rapide</b><small>Raccourcis ou montant personnalisé</small></header><div class="energy-spend-presets">${quickSpends.map(amount=>`<button type="button" data-energy-spend="${amount}">−${amount}</button>`).join('')}</div><form data-energy-spend-form><label for="energy-spend-value">Autre montant</label><div><input id="energy-spend-value" name="amount" type="number" inputmode="numeric" min="1" max="${max}" value="20" required><button type="submit">Déduire</button></div></form></section></div><details class="energy-settings"><summary>Régénération et seuil d’alerte</summary><form data-energy-settings><label>Capacité max.<input name="max" type="number" min="1" max="9999" value="${max}"></label><label>Minutes par point<input name="minutes" type="number" min="1" max="1440" value="${num(row.minutes??game.minutes,1,1440)}"></label><label>Me prévenir à<input name="target" type="number" min="0" max="${max}" value="${target}"></label>${[0,1,2].map((index)=>`<label>Dépense rapide ${index+1}<input name="quickSpend${index+1}" type="number" min="1" max="${max}" value="${quickSpends[index]??[20,40,60][index]}"></label>`).join('')}<label class="energy-notice-toggle"><input name="notifyTarget" type="checkbox" ${row.notifyTarget?'checked':''}><span>Alerte bureau quand le seuil est atteint</span></label><p class="energy-notice-help" data-energy-notice-status role="status">${row.notifyTarget?'Alerte activée · Astralis doit rester ouvert.':esc(row.noticeStatus||'Optionnelle · demande l’autorisation du système au moment de l’activation.')}</p><button type="submit">Enregistrer</button></form></details></div></section><section class="energy-forecast"><header><div><span class="energy-kicker">PROCHAINS REPÈRES</span><h2>La suite de ta journée</h2></div><span class="energy-live"><i></i> Calcul local en temps réel</span></header><div class="energy-milestones">${[...new Set([Math.max(1,target),Math.ceil(max*.75),max])].sort((a,b)=>a-b).map(value=>`<article class="${current!=null&&current>=value?'is-ready':''}" data-energy-milestone-target="${value}"><span>${current!=null&&current>=value?'✓':'◷'}</span><small>${value===max?'RÉSERVE PLEINE':`SEUIL ${value}`}</small><b data-energy-milestone-eta>${current==null?'—':duration(eta(row,value))}</b><time data-energy-milestone-at>${current==null?'':current>=value?'Disponible':new Date(Date.now()+eta(row,value)).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</time></article>`).join('')}</div><div class="energy-log"><header><div><span class="energy-kicker">JOURNAL DES DÉPENSES</span><h3>Mes dernières actions</h3></div>${history.length?'<button type="button" data-energy-undo>Annuler la dernière</button>':''}</header>${history.length?`<ol>${history.map(item=>`<li><span>${esc(item.label||'Ajustement')}</span><b>${Number(item.delta)<0?'−':'+'}${Math.abs(Number(item.delta)||0)}</b><time>${new Date(Number(item.at)||Date.now()).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</time></li>`).join('')}</ol>`:'<p>Les prochaines dépenses ou corrections apparaîtront ici.</p>'}</div><div class="energy-note">Le compteur avance sur cet appareil à partir de ta dernière saisie. Tu peux corriger la capacité et le rythme si ton compte utilise une règle différente.</div></section></main>`;
}

function refreshEnergyPage(root,active,onGameChange){const holder=document.createElement('div');holder.innerHTML=renderEnergyTracker(active);const replacement=holder.firstElementChild;if(replacement){root.replaceWith(replacement);mountEnergyTracker(replacement,active,onGameChange)}}
function updateSessionPlanPreview(root,active){const form=root.querySelector('[data-energy-plan-form]'),output=root.querySelector('[data-energy-plan-result]');if(!form||!output)return;const data=store(),row=data[active]||{current:null,max:GAMES[active].max,minutes:GAMES[active].minutes},formData=new FormData(form),saved=row.sessionPlan,custom=form.elements.afterMinutes.value==='custom',customField=form.querySelector('[data-energy-custom-start]'),customLabel=customField?.closest('label'),dirty=form.dataset.dirty==='true',startAt=dirty?(custom?energyLocalDateTimeTimestamp(customField?.value):null):saved?.startAt,plan={cost:num(formData.get('cost'),1,num(row.max??GAMES[active].max,1,9999)),afterMinutes:num(formData.get('afterMinutes'),0,10080),startAt};if(customLabel)customLabel.hidden=!custom;const invalidCustom=dirty&&custom&&(!startAt||startAt<=Date.now());output.textContent=invalidCustom?'Choisis une date et une heure dans le futur.':sessionPlanText(active,row,plan);const action=form.querySelector('[data-energy-plan-spend]'),projection=projectEnergySession(active,row,plan);if(action){const due=Boolean(saved)&&!dirty&&projection.scheduled;action.hidden=!due;action.disabled=!due||!projection.ready;action.textContent=projection.ready?`Enregistrer la dépense · −${projection.cost}`:due?`Pas encore assez · ${projection.currentAtStart==null?'stock à renseigner':`encore ${projection.cost-projection.currentAtStart}`}`:'Enregistrer la dépense';action.setAttribute('aria-label',projection.ready?`Enregistrer une dépense de ${projection.cost}`:'Dépense indisponible');}}
function mountSessionPlanner(root,active,onGameChange){
 const actions=root.querySelector('.energy-actions');
 if(!actions||root.querySelector('[data-energy-plan-form]'))return;
 const data=store(),row=data[active]||{current:null,max:GAMES[active].max,minutes:GAMES[active].minutes},saved=row.sessionPlan||null,plan=saved||{cost:SESSION_COST[active]||40,afterMinutes:120},delayChoices=[0,30,60,120,240,480,720,1440],remaining=saved?.startAt?Math.max(0,Math.ceil((Number(saved.startAt)-Date.now())/60000)):Number(plan.afterMinutes),customSaved=Boolean(saved?.startAt&&!delayChoices.includes(remaining)),selectedDelay=customSaved?'custom':delayChoices.reduce((best,value)=>Math.abs(value-remaining)<Math.abs(best-remaining)?value:best,delayChoices[0]),plannedStart=saved?.startAt||Date.now()+(Number(plan.afterMinutes)||120)*60000,card=document.createElement('section');
 card.className='energy-session-planner';
 card.innerHTML=`<header><div><span class="energy-kicker">PRÉPARER MA SESSION</span><h3>Estimer une dépense</h3></div><span class="energy-plan-mark" aria-hidden="true">◷</span></header><p>Projette ta réserve à l’heure prévue, sans modifier ton stock.</p><form data-energy-plan-form><label>Coût prévu<input name="cost" type="number" inputmode="numeric" min="1" max="${num(row.max??GAMES[active].max,1,9999)}" value="${num(plan.cost,1,num(row.max??GAMES[active].max,1,9999))}" required></label><label>Départ<select name="afterMinutes">${delayChoices.map(value=>`<option value="${value}" ${selectedDelay===value?'selected':''}>${value===0?'Maintenant':value<60?`Dans ${value} min`:value%60?`Dans ${Math.floor(value/60)} h ${value%60} min`:`Dans ${value/60} h`}</option>`).join('')}<option value="custom" ${selectedDelay==='custom'?'selected':''}>Choisir une heure précise…</option></select></label><label class="energy-plan-custom-label" ${selectedDelay==='custom'?'':'hidden'}>Date et heure locales<input type="datetime-local" name="customStart" data-energy-custom-start value="${energyLocalDateTimeValue(plannedStart)}" min="${energyLocalDateTimeValue(Date.now()+60000)}" aria-label="Date et heure de la session"></label><button type="submit">${saved?'Mettre à jour':'Mémoriser l’estimation'}</button><button type="button" class="energy-plan-reset" data-energy-plan-reset>Effacer</button><label class="energy-plan-notify"><input type="checkbox" name="notifySession" ${saved?.notifySession?'checked':''}><span>Me prévenir à l’heure prévue</span></label><small class="energy-plan-notice-status" data-session-notice-status role="status">${saved?.notifySession?'Alerte active · Astralis doit rester ouvert.':'Option facultative · demande l’autorisation du système à l’activation.'}</small><output data-energy-plan-result role="status">${esc(sessionPlanText(active,row,plan))}</output><button type="button" data-energy-plan-spend hidden>Enregistrer la dépense</button></form>`;
 actions.after(card);
 const form=card.querySelector('[data-energy-plan-form]');
 if(saved&&!Number(saved.startAt)){saved.startAt=Date.now()+num(saved.afterMinutes,0,10080)*60000;row.sessionPlan=saved;data[active]=row;save(data)}
 form.addEventListener('input',()=>{form.dataset.dirty='true';updateSessionPlanPreview(root,active)});
 form.addEventListener('change',()=>{form.dataset.dirty='true';updateSessionPlanPreview(root,active)});
 form.onsubmit=async event=>{
  event.preventDefault();const current=store(),source=current[active]||{current:null,max:GAMES[active].max,minutes:GAMES[active].minutes},formData=new FormData(form),custom=formData.get('afterMinutes')==='custom',customStart=custom?energyLocalDateTimeTimestamp(formData.get('customStart')):null;if(custom&&(!customStart||customStart<=Date.now())){form.querySelector('[data-energy-custom-start]')?.reportValidity();form.querySelector('[data-energy-plan-result]').textContent='Choisis une date et une heure dans le futur.';return;}const startAt=custom?customStart:Date.now()+num(formData.get('afterMinutes'),0,10080)*60000,afterMinutes=Math.max(0,Math.ceil((startAt-Date.now())/60000)),noticeStatus=card.querySelector('[data-session-notice-status]');let notifySession=formData.get('notifySession')==='on';
  if(notifySession){if(typeof Notification==='undefined'){notifySession=false;noticeStatus.textContent='Les notifications système ne sont pas disponibles ici.'}else{let permission=Notification.permission;try{if(permission==='default')permission=await Notification.requestPermission()}catch{permission='denied'}notifySession=permission==='granted';noticeStatus.textContent=notifySession?'Alerte activée · Astralis doit rester ouvert.':permission==='denied'?'Autorisation refusée dans les réglages du système.':'Autorisation non accordée.'}}
  else noticeStatus.textContent='Alerte désactivée.';
  const previous=source.sessionPlan;source.sessionPlan={cost:num(formData.get('cost'),1,num(source.max??GAMES[active].max,1,9999)),afterMinutes,startAt,notifySession,notifiedFor:previous?.startAt===startAt?previous.notifiedFor:null};current[active]=source;save(current);form.elements.notifySession.checked=notifySession;form.dataset.dirty='false';form.querySelector('[type="submit"]').textContent='Mettre à jour';updateSessionPlanPreview(root,active);if(notifySession)checkEnergyNotices();
 };
 card.querySelector('[data-energy-plan-spend]').onclick=()=>{const current=store(),source=current[active],session=source?.sessionPlan;if(!session)return;const projection=projectEnergySession(active,source,session);if(!projection.scheduled||!projection.ready)return;delete source.sessionPlan;current[active]=source;save(current);spendEnergy(active,session.cost,root,onGameChange)};
 card.querySelector('[data-energy-plan-reset]').onclick=()=>{const current=store();if(current[active]){delete current[active].sessionPlan;save(current)}form.dataset.dirty='false';form.elements.cost.value=SESSION_COST[active]||40;form.elements.afterMinutes.value='120';form.elements.notifySession.checked=false;card.querySelector('[data-session-notice-status]').textContent='Option facultative · demande l’autorisation du système à l’activation.';form.querySelector('[type="submit"]').textContent='Mémoriser l’estimation';updateSessionPlanPreview(root,active)};
}
function refreshEnergyActivity(root,active,now=Date.now()){
 const summary=energyActivitySummary(store()[active],now);
 const panel=root.querySelector('[data-energy-today]');
 if(!panel)return;
 panel.querySelector('[data-energy-spent]').textContent='−'+summary.spent;
 panel.querySelector('[data-energy-gained]').textContent='+'+summary.gained;
 panel.querySelector('[data-energy-count]').textContent=String(summary.entries);
 panel.querySelector('[data-energy-net]').textContent=(summary.net<0?'−':'+')+Math.abs(summary.net);
 panel.querySelector('[data-energy-activity-note]').textContent=summary.capped?'Calculé sur les 90 dernières actions conservées':'Journal local · actualisé en direct';
 panel.dataset.energyDate=new Date(now).toLocaleDateString('fr-FR');
 refreshEnergySpendGoal(root,active,now);
}
function mountEnergyActivity(root,active){
 const before=root.querySelector('.energy-log');
 if(!before||root.querySelector('[data-energy-today]'))return;
 const panel=document.createElement('section');
 panel.className='energy-today';
 panel.dataset.energyToday='';
 panel.setAttribute('aria-label','Bilan énergétique du jour');
 panel.innerHTML='<header><div><span class="energy-kicker">BILAN DU JOUR</span><b>Ton activité aujourd’hui</b></div><small data-energy-activity-note></small></header><div><article><small>DÉPENSÉ</small><b data-energy-spent>−0</b></article><article><small>AJOUTÉ</small><b data-energy-gained>+0</b></article><article><small>ACTIONS</small><b data-energy-count>0</b></article><article><small>ÉVOLUTION NETTE</small><b data-energy-net>+0</b></article></div><section class="energy-daily-goal" data-energy-daily-goal><header><span><small>CAP PERSONNEL</small><b>Mon objectif de dépense</b></span><strong data-energy-goal-label>Choisis ton rythme</strong></header><form data-energy-goal-form><label>Énergie à dépenser aujourd’hui<input type="number" name="dailyGoal" min="1" max="9999" step="1" inputmode="numeric" placeholder="Ex. 160" aria-label="Objectif de dépense énergétique pour aujourd’hui"></label><div><button type="submit">Enregistrer</button><button type="button" data-energy-goal-clear>Effacer</button></div></form><div class="energy-goal-progress" data-energy-goal-progress><i role="progressbar" aria-label="Progression de l’objectif énergétique du jour" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><b></b></i><span data-energy-goal-message role="status" aria-live="polite">Les dépenses notées dans Astralis feront progresser cette jauge.</span></div></section>';
 before.before(panel);
 const goalForm=panel.querySelector('[data-energy-goal-form]');goalForm.onsubmit=event=>{event.preventDefault();const value=Math.floor(Number(new FormData(goalForm).get('dailyGoal')));if(!Number.isFinite(value)||value<1)return;const data=store(),game=GAMES[active],row=data[active]||{current:null,max:game.max,minutes:game.minutes};row.dailyGoal=Math.min(9999,value);data[active]=row;save(data);refreshEnergyActivity(root,active)};
 panel.querySelector('[data-energy-goal-clear]').onclick=()=>{const data=store(),row=data[active];if(row)delete row.dailyGoal;if(row)data[active]=row;save(data);refreshEnergyActivity(root,active)};
 refreshEnergyActivity(root,active);
}
function refreshEnergySpendGoal(root,active,now=Date.now()){
 const panel=root.querySelector('[data-energy-daily-goal]');if(!panel)return;
 const row=store()[active],goal=energyDailySpendGoal(row,now),input=panel.querySelector('[name="dailyGoal"]'),label=panel.querySelector('[data-energy-goal-label]'),progress=panel.querySelector('[data-energy-goal-progress]'),meter=progress?.querySelector('[role="progressbar"]'),message=panel.querySelector('[data-energy-goal-message]'),clear=panel.querySelector('[data-energy-goal-clear]');
 if(input&&document.activeElement!==input)input.value=goal.target??'';
 panel.classList.toggle('is-complete',goal.complete);panel.classList.toggle('is-configured',goal.configured);
 if(label)label.textContent=goal.configured?`${goal.spent} / ${goal.target}`:'Choisis ton rythme';
 if(progress)progress.hidden=!goal.configured;
 if(meter){meter.setAttribute('aria-valuenow',String(goal.progress));meter.style.setProperty('--energy-goal-progress',`${goal.progress}%`)}
 if(message)message.textContent=goal.complete?`Objectif du jour atteint · ${goal.spent} dépensés. Bien joué !`:goal.configured?`Encore ${goal.remaining} à dépenser pour atteindre ton objectif.`:'Les dépenses notées dans Astralis feront progresser cette jauge.';
 if(clear)clear.hidden=!goal.configured;
}
function mountEnergyWeeklyTrend(root,active){
 const anchor=root.querySelector('.energy-today')||root.querySelector('.energy-log');
 if(!anchor||root.querySelector('[data-energy-week]'))return;
 const panel=document.createElement('section');panel.className='energy-week';panel.dataset.energyWeek='';panel.setAttribute('aria-label','Dépenses d’énergie sur les sept derniers jours');
  panel.innerHTML='<header><div><span class="energy-kicker">RYTHME RÉCENT</span><h3>Cette semaine</h3></div><b data-energy-week-total>0 dépensé</b></header><div class="energy-week-bars" role="list" aria-label="Énergie dépensée chaque jour"></div><p data-energy-week-note></p><small class="energy-week-comparison" data-energy-week-comparison aria-live="polite"></small>';
 anchor.after(panel);refreshEnergyWeeklyTrend(root,active);
}
function refreshEnergyWeeklyTrend(root,active,now=Date.now()){
 const panel=root.querySelector('[data-energy-week]');if(!panel)return;
  const row=store()[active],snapshot=energyWeeklyActivity(row,now),comparison=energyWeeklyComparison(row,now),bars=panel.querySelector('.energy-week-bars'),maximum=Math.max(1,...snapshot.days.map(day=>day.spent));
 panel.querySelector('[data-energy-week-total]').textContent=`−${snapshot.totalSpent} dépensé · +${snapshot.totalGained} ajouté`;
 bars.innerHTML=snapshot.days.map(day=>`<div class="energy-week-day" role="listitem" aria-label="${esc(day.label)} ${day.date.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} : ${day.spent} dépensés, ${day.gained} ajoutés" title="${day.spent} dépensés · ${day.gained} ajoutés"><b>${day.spent||'·'}</b><span style="--energy-day-height:${Math.round(day.spent/maximum*100)}%"></span><small>${esc(day.label)}</small></div>`).join('');
 panel.querySelector('[data-energy-week-note]').textContent=snapshot.actions?`${snapshot.actions} jour(s) avec une action · historique conservé sur cet appareil.`:'Tes dépenses et corrections apparaîtront ici au fil de la semaine.';
  panel.querySelector('[data-energy-week-comparison]').textContent=comparison.available?`${comparison.change===0?'Dépenses stables':`${comparison.change<0?'−':'+'}${Math.abs(comparison.change)} dépensés (${comparison.percent>0?'+':''}${comparison.percent} %)`} vs les 7 jours précédents · ${comparison.current.activeDays} jour(s) actif(s).`:'La comparaison hebdomadaire apparaîtra après ta première semaine de dépenses enregistrées.';
}
function mountEnergyMonthlyHeatmap(root,active){
 const anchor=root.querySelector('[data-energy-week]')||root.querySelector('.energy-today')||root.querySelector('.energy-log');
 if(!anchor||root.querySelector('[data-energy-month]'))return;
 const panel=document.createElement('section');panel.className='energy-month';panel.dataset.energyMonth='';panel.setAttribute('aria-label','Activité énergétique des vingt-huit derniers jours');
 panel.innerHTML='<header><div><span class="energy-kicker">RÉGULARITÉ</span><h3>Mes 28 derniers jours</h3></div><b data-energy-month-summary>—</b></header><div class="energy-month-grid" role="group" aria-label="Choisir un jour dans la carte d’activité"></div><section class="energy-month-detail" data-energy-month-detail aria-live="polite"></section><footer><span>Moins</span><i></i><i></i><i></i><i></i><span>Plus</span><small data-energy-month-note></small></footer>';
 anchor.after(panel);refreshEnergyMonthlyHeatmap(root,active);
 panel.addEventListener('click',event=>{const day=event.target.closest('[data-energy-month-date]');if(!day)return;panel.dataset.selectedDate=day.dataset.energyMonthDate;refreshEnergyMonthlyHeatmap(root,active)});
}
function refreshEnergyMonthlyHeatmap(root,active,now=Date.now()){
 const panel=root.querySelector('[data-energy-month]');if(!panel)return;
 const snapshot=energyMonthlyActivity(store()[active],now),peak=Math.max(1,...snapshot.days.map(day=>day.spent)),grid=panel.querySelector('.energy-month-grid'),todayKey=snapshot.days.at(-1)?.key,selectedKey=snapshot.days.some(day=>day.key===panel.dataset.selectedDate)?panel.dataset.selectedDate:todayKey,selected=snapshot.days.find(day=>day.key===selectedKey)||snapshot.days.at(-1);
 panel.dataset.selectedDate=selectedKey||'';
 panel.querySelector('[data-energy-month-summary]').textContent=`${snapshot.activeDays} jours actifs · série ${snapshot.currentStreak} j · record ${snapshot.bestStreak} j · −${snapshot.totalSpent}`;
 grid.innerHTML=snapshot.days.map((day,index)=>{
  const level=day.spent?Math.min(4,Math.ceil(day.spent/peak*4)):0;
  const label=`${day.date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} : ${day.spent} dépensés, ${day.gained} ajoutés, ${day.actions} action${day.actions===1?'':'s'}`;
  return `<button type="button" class="energy-month-day" data-energy-month-date="${day.key}" data-energy-level="${level}" data-energy-today="${day.key===todayKey}" aria-pressed="${day.key===selectedKey}" aria-label="${esc(label)}" title="${esc(label)}"><b>${day.date.getDate()}</b><i>${index===27?'Aujourd’hui':''}</i></button>`;
 }).join('');
 const detail=panel.querySelector('[data-energy-month-detail]');
 if(detail&&selected){const title=selected.date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});detail.innerHTML=`<header><b>${esc(title)}</b><span>−${selected.spent} dépensés · +${selected.gained} ajoutés</span></header>${selected.entries.length?`<ol>${selected.entries.map(entry=>`<li><time>${entry.at?new Date(entry.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'—'}</time><span>${esc(entry.label)}</span><b class="${entry.delta<0?'is-spent':'is-gained'}">${entry.delta<0?'−':'+'}${Math.abs(entry.delta)}</b></li>`).join('')}</ol>`:'<p>Aucune action enregistrée ce jour-là.</p>'}`;}
 panel.querySelector('[data-energy-month-note]').textContent=snapshot.activeDays?`${snapshot.totalGained} point(s) ajouté(s) · les jours calmes restent visibles.`:'Ton historique d’activité se remplira ici.';
}
export function mountEnergyTracker(root,active='gi',onGameChange=()=>{}){
 if(!root)return;clearInterval(ticker);ticker=0;startEnergyNoticeTicker();mountEnergyActivity(root,active);mountEnergyWeeklyTrend(root,active);mountEnergyMonthlyHeatmap(root,active);mountSessionPlanner(root,active,onGameChange);mountEnergyAbsencePlanner(root,active,onGameChange);
 for(const button of root.querySelectorAll('[data-energy-game]'))button.onclick=()=>onGameChange(button.dataset.energyGame);
 for(const button of root.querySelectorAll('[data-energy-step]'))button.onclick=()=>{const data=store(),g=GAMES[active],row=data[active]||{current:null,max:g.max,minutes:g.minutes,target:Math.min(160,g.max)},current=energyAt(row);if(current==null)return;const now=Date.now();row.current=num(current+Number(button.dataset.energyStep),0,num(row.max,1,9999));row.updatedAt=now;pushHistory(row,{at:now,before:current,after:row.current,delta:row.current-current,label:Number(button.dataset.energyStep)<0?'Dépense manuelle':'Ajout manuel'});data[active]=row;save(data);refreshEnergyPage(root,active,onGameChange)};

 for(const button of root.querySelectorAll('[data-energy-spend]'))button.onclick=()=>spendEnergy(active,num(button.dataset.energySpend,1,9999),root,onGameChange);
 const spendForm=root.querySelector('[data-energy-spend-form]');if(spendForm)spendForm.onsubmit=event=>{event.preventDefault();spendEnergy(active,num(new FormData(spendForm).get('amount'),1,9999),root,onGameChange)};
 const valueForm=root.querySelector('[data-energy-value]');if(valueForm)valueForm.onsubmit=event=>{event.preventDefault();const data=store(),g=GAMES[active],row=data[active]||{max:g.max,minutes:g.minutes,target:Math.min(160,g.max)};row.current=num(new FormData(valueForm).get('current'),0,num(row.max??g.max,1,9999));row.updatedAt=Date.now();data[active]=row;save(data);refreshEnergyPage(root,active,onGameChange)};
 const settingsForm=root.querySelector('[data-energy-settings]');if(settingsForm)settingsForm.onsubmit=async event=>{event.preventDefault();const data=store(),g=GAMES[active],previous=data[active]||{current:null,updatedAt:Date.now()},form=new FormData(settingsForm),max=num(form.get('max'),1,9999),status=root.querySelector('[data-energy-notice-status]'),wantsNotice=form.get('notifyTarget')==='on';previous.max=max;previous.minutes=num(form.get('minutes'),1,1440);previous.target=num(form.get('target'),0,max);previous.quickSpends=[1,2,3].map(index=>num(form.get(`quickSpend${index}`),[20,40,60][index-1],max));if(previous.current!=null)previous.current=Math.min(previous.current,max);if(wantsNotice){if(typeof Notification==='undefined'){previous.notifyTarget=false;previous.noticeStatus='Les notifications système ne sont pas disponibles dans cet environnement.'}else{let permission=Notification.permission;try{if(permission==='default')permission=await Notification.requestPermission()}catch{permission='denied'}previous.notifyTarget=permission==='granted';previous.noticeStatus=previous.notifyTarget?'Alerte activée · Astralis doit rester ouvert.':permission==='denied'?'Autorisation refusée dans les réglages du système.':'Autorisation non accordée.';if(status)status.textContent=previous.noticeStatus}}else{previous.notifyTarget=false;previous.notifiedThreshold=null;previous.noticeStatus='Optionnelle · demande l’autorisation du système au moment de l’activation.'}const current=energyAt(previous);if(previous.notifyTarget&&current!=null)sendThresholdNotice(active,previous,current,previous.target);data[active]=previous;save(data);refreshEnergyPage(root,active,onGameChange)};
 const undo=root.querySelector('[data-energy-undo]');if(undo)undo.onclick=()=>{const data=store(),row=data[active],last=row?.history?.at(-1);if(!last)return;const now=Date.now(),minutes=num(row.minutes??GAMES[active].minutes,1,1440),restored=Math.min(num(row.max??GAMES[active].max,1,9999),num(last.before,0,9999)+Math.floor(Math.max(0,now-Number(last.at))/(minutes*60000)));row.current=restored;row.updatedAt=now;row.history.pop();data[active]=row;save(data);refreshEnergyPage(root,active,onGameChange)};
 ticker=setInterval(()=>{if(!root.isConnected)return;const node=root.querySelector('[data-energy-clock]');if(node){const data=store(),g=GAMES[active],row=data[active]||{current:null,max:g.max,minutes:g.minutes};if(row.current!=null){const current=energyAt(row),remaining=Math.max(0,num(row.max??g.max,1,9999)-current);node.textContent=current>=num(row.max??g.max,1,9999)?'Tout est récupéré. Dépense un peu pour relancer le compteur.':`Prochain point dans ${duration(timeToPoint(row))} · plein dans ${duration(remaining*num(row.minutes??g.minutes,1,1440)*60000)}`}}refreshEnergyGameCards(root);refreshEnergyMilestones(root,active);updateSessionPlanPreview(root,active);refreshEnergyAwayPlan(root,active)},1000);
}

function mountEnergyAbsencePlanner(root,active,onGameChange){
 const anchor=root.querySelector('.energy-forecast');
 if(!anchor||root.querySelector('[data-energy-away]'))return;
 const data=store(),game=GAMES[active],row=data[active]||{current:null,max:game.max,minutes:game.minutes},selected=num(row.awayMinutes??480,60,1440),panel=document.createElement('section');
 panel.className='energy-away';panel.dataset.energyAway='';
 panel.innerHTML=`<header><div><span class="energy-kicker">AVANT DE PARTIR</span><h2>Protéger ma réserve</h2><p>Estime le stock à ton retour et dépense juste assez pour ne pas laisser de récupération se perdre.</p></div><label>Absence prévue<select data-energy-away-duration>${[[120,'2 heures'],[240,'4 heures'],[480,'8 heures'],[720,'12 heures'],[1440,'24 heures']].map(([value,label])=>`<option value="${value}" ${selected===value?'selected':''}>${label}</option>`).join('')}</select></label></header><div class="energy-away-result"><article><small>À DÉPENSER MAINTENANT</small><b data-energy-away-spend>—</b></article><article><small>STOCK ESTIMÉ AU RETOUR</small><b data-energy-away-return>—</b></article><p data-energy-away-message role="status" aria-live="polite"></p></div><button type="button" class="energy-away-apply" data-energy-away-apply>Appliquer la dépense conseillée</button>`;
 anchor.before(panel);
 const durationField=panel.querySelector('[data-energy-away-duration]');
 durationField.onchange=()=>{const current=store(),saved=current[active]||{current:null,max:game.max,minutes:game.minutes};saved.awayMinutes=num(durationField.value,60,1440);current[active]=saved;save(current);refreshEnergyAwayPlan(root,active)};
 panel.querySelector('[data-energy-away-apply]').onclick=()=>{const projection=energyAbsenceProjection(store()[active],Number(durationField.value));if(!projection.ready||projection.spendNow<1)return;spendEnergy(active,projection.spendNow,root,onGameChange,'Protection avant absence')};
 refreshEnergyAwayPlan(root,active);
}
function refreshEnergyAwayPlan(root,active,now=Date.now()){
 const panel=root.querySelector('[data-energy-away]');if(!panel)return;
 const row=store()[active]||{current:null,max:GAMES[active].max,minutes:GAMES[active].minutes},projection=energyAbsenceProjection(row,panel.querySelector('[data-energy-away-duration]')?.value,now),spend=panel.querySelector('[data-energy-away-spend]'),stock=panel.querySelector('[data-energy-away-return]'),message=panel.querySelector('[data-energy-away-message]'),button=panel.querySelector('[data-energy-away-apply]');
 if(spend)spend.textContent=projection.ready?(projection.spendNow?`−${projection.spendNow}`:'0'):'—';
 if(stock)stock.textContent=projection.ready?`${projection.atReturn} / ${projection.max}`:'—';
 if(message)message.textContent=!projection.ready?'Saisis ton stock actuel pour obtenir une estimation.':projection.spendNow===0?'Aucune dépense nécessaire : ta réserve restera sous le plafond.':projection.unavoidableLoss>0?`Même après avoir dépensé toute ta réserve, ${projection.unavoidableLoss} point(s) de récupération seront perdus.`:`Dépense ${projection.spendNow} maintenant. Tu devrais revenir à ${projection.atReturn} / ${projection.max}.`;
 if(button){button.disabled=!projection.ready||projection.spendNow<1;button.textContent=projection.spendNow?`Appliquer −${projection.spendNow} et noter dans le journal`:'Aucune dépense à appliquer';}
}

function refreshEnergyMilestones(root,active,now=Date.now()){const game=GAMES[active],data=store(),row=data[active]||{current:null,max:game.max,minutes:game.minutes};for(const card of root.querySelectorAll('[data-energy-milestone-target]')){const target=num(card.dataset.energyMilestoneTarget,0,num(row.max??game.max,1,9999)),current=energyAt(row,now),ready=current!=null&&current>=target,delay=current==null?null:ready?0:eta(row,target,now),etaNode=card.querySelector('[data-energy-milestone-eta]'),timeNode=card.querySelector('[data-energy-milestone-at]');card.classList.toggle('is-ready',ready);const icon=card.querySelector(':scope>span');if(icon)icon.textContent=ready?'✓':'◷';if(etaNode)etaNode.textContent=delay==null?'—':duration(delay);if(timeNode)timeNode.textContent=delay==null?'':ready?'Disponible':new Date(now+delay).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}}
function pushHistory(row,entry){row.history=Array.isArray(row.history)?row.history:[];row.history.push(entry);row.history=row.history.slice(-90)}
function spendEnergy(active,amount,root,onGameChange,label){const data=store(),g=GAMES[active],row=data[active]||{current:null,max:g.max,minutes:g.minutes,target:Math.min(160,g.max)},current=energyAt(row);if(current==null)return;const now=Date.now();row.current=num(current-amount,0,num(row.max,1,9999));row.updatedAt=now;pushHistory(row,{at:now,before:current,after:row.current,delta:row.current-current,label:label||`Dépense · ${amount}`});data[active]=row;save(data);refreshEnergyPage(root,active,onGameChange)}
