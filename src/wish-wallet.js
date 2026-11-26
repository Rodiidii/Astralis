import {periodIncome} from './planning-rules.js';
const KEY='astralis:gi:wish-plan';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number(v||0).toLocaleString('fr-FR',{maximumFractionDigits:1});
export const localDay=(date=new Date())=>date.toLocaleDateString('sv-SE');
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const integer=v=>Number.isFinite(Number(v))?Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(Number(v)))):0;
export function walletBalance(plan={}){const primos=integer(plan.currentPrimos??plan.primos),wishes=integer(plan.wishes);return {primos,wishes,converted:Math.floor(primos/160),remaining:primos%160,available:wishes+Math.floor(primos/160)};}
export function rewardConfig(plan={}){return {welkin:!!plan.welkin,theatre:integer(plan.theatreGain),abyss:integer(plan.abyssGain),carnage:integer(plan.carnageGain),smallEvent:plan.smallEventGain==null?420:integer(plan.smallEventGain)};}
export function claimReward(plan,type,date=localDay(),custom={}){
 const config=rewardConfig(plan),rewards={daily:[60+(config.welkin?90:0),0,'Dailies'+(config.welkin?' + Faveur':'')],reset:[0,5,'Boutique mensuelle'],theatre:[config.theatre,0,'Théâtre'],abyss:[config.abyss,0,'Abysses'],carnage:[config.carnage,0,'Carnage'],small:[config.smallEvent,0,'Petit événement'],other:[integer(custom.primos),integer(custom.wishes),custom.label||'Autre gain']};
 const reward=rewards[type];if(!reward)throw new Error('Récompense inconnue.');
 const period=type==='daily'?date:type==='reset'||type==='theatre'||type==='abyss'?date.slice(0,7):type==='carnage'?String(custom.period||date):null;
 const history=[...(plan.history||[])];
 if(period&&history.some(row=>row.rewardType===type&&row.rewardPeriod===period))throw new Error('Cette récompense est déjà enregistrée pour cette période.');
 const [primos,wishes,label]=reward;if(!primos&&!wishes)throw new Error('Indique le montant de cette récompense dans tes réglages.');
 const currentPrimos=integer(plan.currentPrimos??plan.primos)+primos,totalWishes=integer(plan.wishes)+wishes;
 history.push({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),date,label,primos,count:wishes,rewardType:type,rewardPeriod:period,balancePrimos:currentPrimos,balanceWishes:totalWishes});
 return {...plan,currentPrimos,primos:currentPrimos,currentPrimosExplicit:true,wishes:totalWishes,history};
}
export function undoReward(plan,id,date=localDay()){
 const history=[...(plan.history||[])],entry=history.find(row=>row.id===id);
 if(!entry||entry.kind==='adjustment')throw new Error('Ce gain ne peut pas être annulé.');
 if(history.some(row=>row.undoOf===id))throw new Error('Ce gain a déjà été annulé.');
 const primos=integer(entry.primos),wishes=integer(entry.count),currentPrimos=integer(plan.currentPrimos??plan.primos),currentWishes=integer(plan.wishes);
 if(currentPrimos<primos||currentWishes<wishes)throw new Error('Le solde a changé depuis ce gain; corrige le solde avant de l’annuler.');
 const nextPrimos=currentPrimos-primos,nextWishes=currentWishes-wishes;
 history.push({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),date,label:'Annulation · '+String(entry.label||'gain'),kind:'adjustment',undoOf:id,primos:-primos,count:-wishes,balancePrimos:nextPrimos,balanceWishes:nextWishes});
 return {...plan,currentPrimos:nextPrimos,primos:nextPrimos,currentPrimosExplicit:true,wishes:nextWishes,history};
}
export function guaranteeDate(plan,income={},now=localDay()){
 const pity=Math.min(89,integer(plan.characterPity)),cost=(plan.characterGuarantee?90:180)-pity,required=cost*160;
 let budget=integer(plan.currentPrimos??plan.primos)+integer(plan.wishes)*160;
 if(budget>=required)return {date:now,cost,missing:0};
 const end=new Date(now+'T12:00:00');end.setDate(end.getDate()+730);
 const config=rewardConfig({...plan,theatreGain:plan.theatreGain??income.theatre,abyssGain:plan.abyssGain??income.abyss,welkin:plan.welkin??income.welkin}),forecast=periodIncome({...income,maps:0,freeWishes:0,freeMultis:0,extraPrimos:0,start:now,end:localDay(end),welkin:config.welkin,theatre:config.theatre,abyss:config.abyss});
 const personal=income.start&&income.end?periodIncome({...income,autoMaps:false,versionGifts:false,maps:income.autoMaps?0:income.maps}).ledger.filter(r=>/^Exploration|Ajouts personnels/.test(r.label)&&r.date>=now):[];forecast.ledger.push(...personal);forecast.ledger.sort((a,b)=>a.date.localeCompare(b.date));
 for(const row of forecast.ledger){
  const kind=/Commissions/.test(row.label)?'daily':/Boutique/.test(row.label)?'reset':row.label==='Théâtre'?'theatre':row.label==='Abysses'?'abyss':'';
  if(kind&&(plan.history||[]).some(h=>h.rewardType===kind&&h.rewardPeriod===(kind==='daily'?row.date:row.date.slice(0,7))))continue;
  budget+=row.primos+row.wishes*160;if(budget>=required)return {date:row.date,cost,missing:Math.max(0,required-integer(plan.currentPrimos??plan.primos)-integer(plan.wishes)*160)};
 }
 return {date:null,cost,missing:Math.max(0,required-budget)};
}
export function effectiveWishIncome(history=[]){
 const rows=Array.isArray(history)?history:[],undone=new Set(rows.map(row=>row?.undoOf).filter(Boolean));
 return rows.filter(row=>row&&row.kind!=='adjustment'&&!undone.has(row.id)&&/^\d{4}-\d{2}-\d{2}$/.test(String(row.date||'')));
}
export function incomeGroups(history=[]){
 const groups=new Map();for(const row of effectiveWishIncome(history)){const amount=Math.max(0,Number(row.primos)||0)+160*Math.max(0,Number(row.count)||0);if(!amount)continue;const label=({daily:'Quotidiennes',reset:'Boutique',theatre:'Théâtre',abyss:'Abysses',carnage:'Carnage',small:'Événements',other:'Autres'})[row.rewardType]||row.label||'Autres';groups.set(label,(groups.get(label)||0)+amount);}
 return [...groups].map(([label,value])=>({label,value}));
}
/** Compare equal elapsed periods: this week/month so far against the same previous days. */
export function incomeComparisons(history=[],day=localDay()){
 const now=new Date(day+'T12:00:00'),weekday=(now.getDay()+6)%7,start=new Date(now);start.setDate(now.getDate()-weekday);
 const previous=new Date(start);previous.setDate(start.getDate()-7);const previousEnd=new Date(previous);previousEnd.setDate(previous.getDate()+weekday);
 const monthStart=new Date(now.getFullYear(),now.getMonth(),1),oldStart=new Date(now.getFullYear(),now.getMonth()-1,1),oldLast=new Date(now.getFullYear(),now.getMonth(),0),oldEnd=new Date(oldStart);oldEnd.setDate(Math.min(now.getDate(),oldLast.getDate()));
 const effective=effectiveWishIncome(history),sum=(from,to)=>effective.filter(h=>h.date>=localDay(from)&&h.date<=localDay(to)).reduce((total,h)=>total+Math.max(0,Number(h.primos)||0)+160*Math.max(0,Number(h.count)||0),0);
 return [['week','Cette semaine',start,now,previous,previousEnd],['month','Ce mois',monthStart,now,oldStart,oldEnd]].map(([id,label,from,to,before,until])=>{const current=sum(from,to),previous=sum(before,until),delta=current-previous;return {id,label,current,previous,delta,percent:previous>0?delta/previous*100:null,from:localDay(from),to:localDay(to),previousFrom:localDay(before),previousTo:localDay(until)};});
}
const csvCell=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
export function wishLedgerCsv(history=[]){
 const rows=[['Date','Origine','Type','Primos','Vœux','Solde primos après écriture','Solde vœux après écriture','Annule']];
 for(const entry of history){const undone=history.some(row=>row.undoOf===entry.id);rows.push([entry.date,entry.label,entry.kind==='adjustment'?'Correction':entry.rewardType||'Gain',entry.primos,entry.count,entry.balancePrimos,entry.balanceWishes,undone?'Oui':'Non']);}
 return '\uFEFF'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');
}
function downloadWishLedger(){
 const csv=wishLedgerCsv(read().history||[]),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),anchor=document.createElement('a');
 anchor.href=url;anchor.download=`astralis-journal-voeux-${localDay()}.csv`;anchor.hidden=true;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function observedStats(value={}){
 const attempts=integer(value.fiftyAttempts),lost=Math.min(attempts,integer(value.fiftyLost)),pulls=integer(value.pulls),featured=Math.min(pulls,integer(value.fourFeatured));
 return {attempts,lost,pulls,featured,lossRate:attempts?lost/attempts*100:null,featuredRate:pulls?featured/pulls*100:null,every:featured?pulls/featured:null};
}
function save(plan,message=''){localStorage.setItem(KEY,JSON.stringify(plan));document.dispatchEvent(new CustomEvent('astralis:wallet-changed',{detail:{message}}));}
class WishWallet extends (globalThis.HTMLElement||class {}){
 connectedCallback(){const plan=read();let goals={};try{goals=JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')||'{}')}catch{};for(const [key,source]of [['theatreGain','theatre'],['abyssGain','abyss'],['welkin','welkin']])if(plan[key]==null&&goals.income?.[source]!=null)plan[key]=goals.income[source];localStorage.setItem(KEY,JSON.stringify(plan));this.render();this.onchange=e=>{
  const field=e.target.dataset.wallet;if(!field)return;const plan=read();
  if(field==='currentPrimos'||field==='wishes'){
   const before=integer(plan[field]??(field==='currentPrimos'?plan.primos:0)),after=integer(e.target.value);if(before===after)return;plan[field]=after;
   if(field==='currentPrimos'){plan.primos=after;plan.currentPrimosExplicit=true;}
   if(before!==after)(plan.history||=[]).push({id:crypto.randomUUID(),date:localDay(),label:'Solde corrigé',kind:'adjustment',primos:field==='currentPrimos'?after-before:0,count:field==='wishes'?after-before:0,balancePrimos:integer(plan.currentPrimos??plan.primos),balanceWishes:integer(plan.wishes)});
  }else{plan[field]=e.target.type==='checkbox'?e.target.checked:integer(e.target.value);plan.rewardSetup=true;let goals={};try{goals=JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')||'{}')}catch{};const key={theatreGain:'theatre',abyssGain:'abyss',welkin:'welkin'}[field];if(key){goals.income||={};goals.income[key]=plan[field];localStorage.setItem('astralis:gi:objectives-v2',JSON.stringify(goals));}}
  const openDetails=[...this.querySelectorAll('details')].map(node=>node.open);save(plan);this.scheduleRender(openDetails);
 };this.onclick=e=>{
  const button=e.target.closest('[data-reward]');if(!button)return;
  try{const type=button.dataset.reward,form=this.querySelector('[data-other-gain]'),custom={primos:form.elements.primos.value,wishes:form.elements.wishes.value,label:form.elements.label.value},openDetails=[...this.querySelectorAll('details')].map(node=>node.open),message='Gain enregistré dans le solde et le journal.';save(claimReward(read(),type,localDay(),custom),message);this.scheduleRender(openDetails,message);}catch(error){const status=this.querySelector('[role=status]');if(status)status.textContent=error.message;}
 };}
 scheduleRender(openDetails=[],message=''){cancelAnimationFrame(this._walletFrame||0);this._walletFrame=requestAnimationFrame(()=>{this._walletFrame=0;if(!this.isConnected)return;this.render();this.querySelectorAll('details').forEach((node,index)=>node.open=!!openDetails[index]);if(message){const status=this.querySelector('[role=status]');if(status)status.textContent=message;}});}
 disconnectedCallback(){cancelAnimationFrame(this._walletFrame||0);}
 render(){const p=read(),{primos,wishes,available}=walletBalance(p),config=rewardConfig(p);let income={};try{income=JSON.parse(localStorage.getItem('astralis:gi:objectives-v2')||'{}').income||{}}catch{}
 const guarantee=guaranteeDate(p,income),date=guarantee.date?new Date(guarantee.date+'T12:00:00').toLocaleDateString('fr-FR'):'Au-delà de deux ans';
 this.innerHTML='<section class="wish-account-hero"><header><span class="eyebrow">MON COMPTE · SOLDE RÉEL</span><span>1 vœu = 160 primogemmes</span></header><div class="wish-account-grid"><label><span class="wish-field-label">Primogemmes</span><input type="number" min="0" step="1" data-wallet="currentPrimos" value="'+primos+'"></label><label><span class="wish-field-label">Destinées entrelacées</span><input type="number" min="0" step="1" data-wallet="wishes" value="'+wishes+'"></label><div><small>Total disponible</small><strong>'+fmt(available)+' <span>vœux</span></strong><small>'+fmt(primos%160)+' primos après conversion</small></div><div class="wish-guarantee-date"><small>Personnage vedette · plafond financé</small><strong>'+date+'</strong><small>'+guarantee.cost+' vœux au plus · '+(primos+wishes*160>=guarantee.cost*160?'budget déjà disponible':'estimation selon tes gains et échéances')+'</small></div></div><nav class="wish-reward-shortcuts" aria-label="Enregistrer une récompense">'+[['daily','Dailies'],['reset','Reset · 5 vœux'],['theatre','Théâtre'],['abyss','Abysses'],['carnage','Carnage'],['small','Petit événement']].map(([key,label])=>'<button type="button" data-reward="'+key+'">'+label+'</button>').join('')+'</nav><details '+(!p.rewardSetup?'open':'')+'><summary>Mes gains habituels et ma Faveur</summary><div class="wish-reward-settings"><label><input type="checkbox" data-wallet="welkin" '+(config.welkin?'checked':'')+'> Faveur active · +90/jour</label>'+[['theatreGain','Théâtre moyen',config.theatre],['abyssGain','Abysses moyens',config.abyss],['carnageGain','Carnage moyen',config.carnage],['smallEventGain','Petit événement',config.smallEvent]].map(([key,label,value])=>'<label>'+label+'<input type="number" min="0" data-wallet="'+key+'" value="'+value+'"></label>').join('')+'</div></details><details><summary>Autre gain</summary><form data-other-gain onsubmit="return false"><input name="label" aria-label="Origine du gain" placeholder="Exploration, code…"><input type="number" min="0" name="primos" aria-label="Primogemmes du gain" placeholder="Primos"><input type="number" min="0" name="wishes" aria-label="Vœux du gain" placeholder="Vœux"><button type="button" data-reward="other">Ajouter le gain</button></form></details><p role="status" aria-live="polite"></p></section>';
 }
}
const COLOURS=['#8bddcc','#b4a2ef','#eac27b','#ef9db9','#82baff','#b8d976','#cdbb9d'];
function donut(history,title){const groups=incomeGroups(history),total=groups.reduce((s,g)=>s+g.value,0);let cursor=0;const gradient=groups.map((row,i)=>{const from=cursor;cursor+=row.value/Math.max(1,total)*100;return COLOURS[i%COLOURS.length]+' '+from+'% '+cursor+'%'}).join(',')||'#ffffff12 0% 100%';return '<article class="wish-income-donut"><h3>'+title+'</h3><div class="wish-donut" style="--segments:conic-gradient('+gradient+')" role="img" aria-label="'+esc(groups.map(g=>g.label+' '+fmt(g.value)).join(', ')||'Aucun gain enregistré')+'"><div><strong>'+fmt(total)+'</strong><small>primos équivalentes</small></div></div><ul>'+groups.map((g,i)=>'<li><i style="background:'+COLOURS[i%COLOURS.length]+'"></i><span>'+esc(g.label)+'</span><b>'+fmt(g.value)+' · '+fmt(g.value/total*100)+' %</b></li>').join('')+'</ul></article>';}
class WishJournal extends (globalThis.HTMLElement||class {}){
 connectedCallback(){this.range=30;this.render();this.onclick=e=>{if(e.target.closest('[data-export-wish-ledger]')){downloadWishLedger();const status=this.querySelector('[role=status]');if(status)status.textContent='Journal téléchargé en CSV, prêt à ouvrir dans un tableur.';return;}const undo=e.target.closest('[data-undo-reward]');if(undo){let message;try{save(undoReward(read(),undo.dataset.undoReward));message='Gain annulé; le solde et le journal ont été recalculés.';}catch(error){message=error.message;}setTimeout(()=>{const status=document.querySelector('wish-journal [role=status]');if(status)status.textContent=message;},0);return;}const button=e.target.closest('[data-journal-range]');if(button){this.range=Number(button.dataset.journalRange);this.render();}};this.onchange=e=>{if(e.target.dataset.wishStat){const p=read();(p.observedStats||={})[e.target.dataset.wishStat]=integer(e.target.value);if(p.observedStats.fiftyLost>p.observedStats.fiftyAttempts)p.observedStats.fiftyLost=p.observedStats.fiftyAttempts;if(p.observedStats.fourFeatured>p.observedStats.pulls)p.observedStats.fourFeatured=p.observedStats.pulls;save(p);}if(e.target.matches('[data-history-month]')){this.month=e.target.value;this.render();}};}
 render(){const p=read(),history=p.history||[],incomeHistory=effectiveWishIncome(history),today=localDay(),first=new Date(today+'T12:00:00');first.setDate(first.getDate()-this.range+1);const from=localDay(first),filtered=incomeHistory.filter(h=>h.date>=from&&h.date<=today),month=this.month||today.slice(0,7),previous=new Date(month+'-01T12:00:00');previous.setMonth(previous.getMonth()-1);const previousMonth=localDay(previous).slice(0,7),stats=observedStats(p.observedStats);
 const bars=Array.from({length:this.range},(_,i)=>{const d=new Date(first);d.setDate(d.getDate()+i);const date=localDay(d),rows=incomeHistory.filter(h=>h.date===date),amount=rows.reduce((sum,h)=>sum+(Number(h.primos)||0)+160*(Number(h.count)||0),0);return {date,amount};}),max=Math.max(1,...bars.map(b=>b.amount));
 this.innerHTML='<section class="wish-journal"><header><div><span class="eyebrow">MES GAINS · HISTORIQUE</span><h2>Le chemin vers le prochain personnage</h2></div><nav>'+[7,30,90].map(n=>'<button type="button" data-journal-range="'+n+'" aria-pressed="'+(n===this.range)+'">'+n+' jours</button>').join('')+'<button type="button" data-export-wish-ledger>Exporter CSV</button></nav></header><p class="wish-journal-status" role="status" aria-live="polite"></p><div class="wish-period-comparisons">'+incomeComparisons(history,today).map(row=>'<article><header><b>'+row.label+'</b><small>'+row.from+' → '+row.to+'</small></header><strong>'+fmt(row.current)+'<small>primos équivalentes</small></strong><p class="'+(row.delta<0?'negative':'positive')+'">'+(row.delta>0?'+':'')+fmt(row.delta)+' · '+(row.percent==null?'Pas de base précédente':(row.percent>0?'+':'')+fmt(row.percent)+' %')+'</p><small>Précédent : '+fmt(row.previous)+' · '+row.previousFrom+' → '+row.previousTo+'</small></article>').join('')+'</div><figure class="wish-history-chart"><figcaption>'+fmt(filtered.reduce((n,h)=>n+(Number(h.primos)||0)+160*(Number(h.count)||0),0))+' primos équivalentes sur la période</figcaption><svg viewBox="0 0 1000 220" role="img" aria-label="Gains enregistrés par jour"><path d="M20 180H990" stroke="#ffffff40"/>'+bars.map((b,i)=>{const width=960/this.range,x=25+i*width,h=b.amount/max*140;return '<rect x="'+x+'" y="'+(180-h)+'" width="'+Math.max(2,width-3)+'" height="'+Math.max(1,h)+'" rx="3" fill="#98d8d0"><title>'+b.date+' · '+fmt(b.amount)+' primos équivalentes</title></rect>'}).join('')+'<text x="20" y="211">'+from+'</text><text x="860" y="211">'+today+'</text></svg></figure><label class="wish-month-selector">Comparer mes mois<input type="month" data-history-month value="'+month+'"></label><div class="wish-donut-grid">'+donut(incomeHistory.filter(h=>h.date?.startsWith(month)),month)+donut(incomeHistory.filter(h=>h.date?.startsWith(previousMonth)),previousMonth)+'</div><section class="wish-observed-stats"><header><h3>Mes statistiques de tirage</h3><small>Compte les 50/50 réellement tentés ; les 5★ garantis ne sont pas des 50/50.</small></header><div>'+[['fiftyAttempts','50/50 tentés'],['fiftyLost','50/50 perdus'],['pulls','Vœux effectués'],['fourFeatured','4★ vedettes obtenus']].map(([key,label])=>'<label>'+label+'<input type="number" min="0" data-wish-stat="'+key+'" value="'+integer(p.observedStats?.[key])+'"></label>').join('')+'</div><p><b>'+(stats.lossRate==null?'—':fmt(stats.lossRate)+' %')+'</b> de 50/50 perdus · <b>'+(stats.featuredRate==null?'—':fmt(stats.featuredRate)+' %')+'</b> de 4★ vedettes par vœu'+(stats.every?' · une vedette tous les '+fmt(stats.every)+' vœux':'')+'</p></section><details><summary>Mes entrées · '+history.length+'</summary><ol class="wish-ledger-rows">'+history.slice().reverse().map(h=>'<li><time>'+esc(h.date)+'</time><b>'+esc(h.label)+'</b><span>'+fmt(h.primos)+' primos · '+fmt(h.count)+' vœux</span><small>'+esc(h.kind==='adjustment'?'Correction manuelle du solde':'Gain enregistré')+'</small>'+(h.kind!=='adjustment'&&!history.some(row=>row.undoOf===h.id)?'<button type="button" data-undo-reward="'+esc(h.id)+'" aria-label="Annuler '+esc(h.label)+'">Annuler ce gain</button>':'')+'</li>').join('')+'</ol></details></section>';
 }
}
if(globalThis.customElements){customElements.define('wish-wallet',WishWallet);customElements.define('wish-journal',WishJournal);}
