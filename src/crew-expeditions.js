const KEY='astralis:arcade:crew-expeditions:v1';
const ROUTES=[
  {id:'comet',icon:'☄',name:'Traque aux comètes',place:'Ceinture de cendres',duration:15*60*1000,base:28,copy:'Une sortie brève pour récupérer des éclats égarés.'},
  {id:'archive',icon:'⌘',name:'Archives dérivantes',place:'Bibliothèque du Vide',duration:60*60*1000,base:74,copy:'Des journaux anciens attendent une équipe attentive.'},
  {id:'nebula',icon:'✧',name:'Traversée de la nébuleuse',place:'Frontière d’Andromède',duration:4*60*60*1000,base:180,copy:'Une longue route, des rencontres et des trouvailles rares.'},
];
const scopeFor=game=>game==='hsr'?'hsr':['ww','wuwa'].includes(game)?'ww':'gi';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const save=data=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
const fmt=ms=>{const minutes=Math.max(0,Math.ceil(ms/60000));if(minutes<60)return `${minutes} min`;const hours=Math.floor(minutes/60),rest=minutes%60;return rest?`${hours} h ${rest} min`:`${hours} h`};
const remain=ms=>{const seconds=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`};
export function expeditionProgress(mission,now=Date.now()){
 if(!mission||!Number.isFinite(mission.startedAt)||!Number.isFinite(mission.duration)||mission.duration<=0)return null;
 const left=Math.max(0,mission.startedAt+mission.duration-now);
 return {left,percent:Math.min(100,Math.max(0,(now-mission.startedAt)/mission.duration*100)),ready:left===0};
}
export function expeditionReward(routeId,crew=[]){
 const route=ROUTES.find(item=>item.id===routeId)||ROUTES[0];
 const elements=new Set(crew.map(c=>c.element||c.elementType||c.combatType).filter(Boolean)).size;
 const bonus=Math.min(28,Math.max(0,crew.length-1)*7+Math.max(0,elements-1)*5);
 return route.base+bonus;
}
export function claimExpedition(profile,now=Date.now()){
 const mission=profile?.active,status=expeditionProgress(mission,now);
 if(!mission||!status?.ready)return null;
 const route=ROUTES.find(item=>item.id===mission.route)||ROUTES[0],reward=Math.max(0,Number(mission.reward)||0);
 profile.shards=(Number(profile.shards)||0)+reward;profile.completed=(Number(profile.completed)||0)+1;
 profile.discoveries=(Number(profile.discoveries)||0)+(reward>=150?1:0);
 profile.history=Array.isArray(profile.history)?profile.history:[];
 profile.history.unshift({route:route.id,at:now,reward,crew:(mission.crew||[]).map(c=>c.name)});
 profile.history=profile.history.slice(0,12);profile.active=null;
 return {route,reward};
}

export function renderCrewExpeditions(){return `<section class="arcade-game-view crew-expeditions" data-arcade-view="expedition" role="tabpanel" aria-label="Missions d’équipage" hidden>
 <header class="crew-expedition-head"><div><small>MISSIONS LOCALES · RETOUR HORS LIGNE</small><h2>Hangar d’expéditions</h2><p>Compose un équipage avec tes personnages. La mission continue à l’heure réelle, même quand Astralis est fermé.</p></div><div class="crew-expedition-vault"><small>ÉCLATS ASTRAUX</small><b data-crew-shards>0</b><span>archives trouvées <i data-crew-discoveries>0</i></span></div></header>
 <div class="crew-expedition-layout"><section class="crew-expedition-compose"><div class="crew-expedition-label"><span>01</span><div><b>Choisis une route</b><small>La durée détermine le butin local.</small></div></div><div class="crew-routes" data-crew-routes></div><div class="crew-expedition-label crew-roster-label"><span>02</span><div><b>Forme l’équipage <small data-crew-selected-count>0 / 3</small></b><small>Un à trois personnages. Les éléments distincts ajoutent un bonus.</small></div></div><div class="crew-roster-picker" data-crew-roster></div><button class="crew-launch" type="button" data-crew-launch disabled>Lancer l’expédition <span>↗</span></button><p class="crew-expedition-feedback" data-crew-feedback aria-live="polite">Choisis une route et au moins un personnage.</p></section>
 <aside class="crew-expedition-active"><div class="crew-expedition-label"><span>03</span><div><b>Équipage en route</b><small>Progression conservée sur cet appareil.</small></div></div><div data-crew-active></div><div class="crew-expedition-log"><header><b>Dernières missions</b><small>Journal local</small></header><div data-crew-history></div></div><div class="crew-expedition-record"><span>MISSIONS TERMINÉES</span><b data-crew-completed>0</b><small>Les récompenses sont propres à l’arcade.</small></div></aside></div>
 </section>`}

export function mountCrewExpeditions(root,game){
 const panel=root.querySelector('[data-arcade-view="expedition"]');if(!panel)return()=>{};
 let roster=[];try{roster=JSON.parse(decodeURIComponent(root.dataset.roster||'%5B%5D'))}catch{}
 const scope=scopeFor(game),data=read();data.profiles||={};data.profiles[scope]||={shards:0,discoveries:0,completed:0,active:null,history:[]};const profile=data.profiles[scope];profile.history=Array.isArray(profile.history)?profile.history:[];
 let route='comet',selected=new Set(),timer=0;const el=s=>panel.querySelector(s);
 el('[data-crew-shards]').textContent=profile.shards;el('[data-crew-discoveries]').textContent=profile.discoveries;el('[data-crew-completed]').textContent=profile.completed;
 el('[data-crew-routes]').innerHTML=ROUTES.map(item=>`<button type="button" class="crew-route ${item.id===route?'selected':''}" data-crew-route="${item.id}" aria-pressed="${item.id===route}"><i>${item.icon}</i><span><b>${item.name}</b><small>${item.place}</small><small>${fmt(item.duration)} · ${item.base} à ${item.base+28} éclats</small><em>${item.copy}</em></span><strong>↗</strong></button>`).join('');
 const characters=roster.slice(0,60);el('[data-crew-roster]').innerHTML=characters.map((c,i)=>`<button type="button" class="crew-character" data-crew-character="${i}" aria-pressed="false" title="${c.name}"><img loading="lazy" src="${c.icon}" alt=""><span>${c.name}</span><i>＋</i></button>`).join('')||'<p class="crew-empty-roster">Le roster apparaît ici dès qu’il est chargé.</p>';
 const paint=()=>{el('[data-crew-history]').innerHTML=profile.history.length?profile.history.slice(0,4).map(entry=>{const item=ROUTES.find(r=>r.id===entry.route)||ROUTES[0],crew=(entry.crew||[]).slice(0,3).join(' · ');return `<article class="crew-history-row"><i>${item.icon}</i><span><b>${item.name}</b><small>${crew||'Équipage astral'}</small></span><strong>+${entry.reward}</strong></article>`}).join(''):'<p class="crew-history-empty">Tes itinéraires terminés apparaîtront ici.</p>';const mission=profile.active;if(!mission){el('[data-crew-active]').innerHTML='<div class="crew-empty"><span>✧</span><b>Le hangar est libre.</b><small>Choisis une route et prépare ton équipe pour partir.</small></div>';el('[data-crew-launch]').hidden=false;return}
  const routeInfo=ROUTES.find(x=>x.id===mission.route)||ROUTES[0],status=expeditionProgress(mission),left=status?.left??0,progress=status?.percent??0;
  el('[data-crew-active]').innerHTML=`<article class="crew-active-card ${status?.ready?'ready':''}"><div class="crew-active-route"><i>${routeInfo.icon}</i><span><small>${routeInfo.place}</small><b>${routeInfo.name}</b></span><strong>${left?remain(left):'PRÊT'}</strong></div><div class="crew-active-avatars">${(mission.crew||[]).map(c=>`<img src="${c.icon}" alt="${c.name}" title="${c.name}">`).join('')}</div><div class="crew-progress"><i style="width:${progress}%"></i></div><small class="crew-progress-note">${left?`Retour estimé dans ${fmt(left)} · ${Math.floor(progress)} % parcourus`:'L’équipage est de retour avec son butin.'}</small><button type="button" class="crew-claim" data-crew-claim ${left?'disabled':''}>${left?'En route…':`Récupérer ${mission.reward} éclats`}</button></article>`;el('[data-crew-launch]').hidden=true;
 };
 const onClick=e=>{const routeButton=e.target.closest('[data-crew-route]'),charButton=e.target.closest('[data-crew-character]');if(routeButton){route=routeButton.dataset.crewRoute;panel.querySelectorAll('[data-crew-route]').forEach(b=>{const yes=b===routeButton;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});return}
  if(charButton){const index=Number(charButton.dataset.crewCharacter),c=characters[index];if(!c)return;if(selected.has(index)){selected.delete(index);charButton.classList.remove('selected')}else if(selected.size<3){selected.add(index);charButton.classList.add('selected')}else{el('[data-crew-feedback]').textContent='Trois personnages au maximum par équipage.';return}charButton.setAttribute('aria-pressed',String(selected.has(index)));el('[data-crew-selected-count]').textContent=`${selected.size} / 3`;el('[data-crew-launch]').disabled=!selected.size||!!profile.active;el('[data-crew-feedback]').textContent=selected.size?'Équipage prêt. Les éléments variés bonifient les trouvailles.':'Choisis au moins un personnage.';return}
  if(e.target.closest('[data-crew-launch]')){if(profile.active||!selected.size)return;const info=ROUTES.find(x=>x.id===route)||ROUTES[0],crew=[...selected].map(i=>characters[i]);profile.active={route,startedAt:Date.now(),duration:info.duration,crew:crew.map(c=>({name:c.name,icon:c.icon,element:c.element||c.elementType||c.combatType})),reward:expeditionReward(route,crew)};save(data);selected.clear();panel.querySelectorAll('[data-crew-character]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false')});el('[data-crew-selected-count]').textContent='0 / 3';el('[data-crew-feedback]').textContent='Mission lancée. Tu peux fermer Astralis et revenir plus tard.';el('[data-crew-launch]').disabled=true;paint();return}
  if(e.target.closest('[data-crew-claim]')){const claimed=claimExpedition(profile);if(!claimed)return;save(data);el('[data-crew-shards]').textContent=profile.shards;el('[data-crew-discoveries]').textContent=profile.discoveries;el('[data-crew-completed]').textContent=profile.completed;el('[data-crew-feedback]').textContent=`Récompense récupérée · +${claimed.reward} éclats astraux.`;el('[data-crew-launch]').disabled=!selected.size;paint();}
 };
 const tick=()=>{paint();if(expeditionProgress(profile.active)?.ready)el('[data-crew-feedback]').textContent='L’équipage est revenu. Son butin est prêt dans le hangar.'};
 panel.addEventListener('click',onClick);paint();timer=setInterval(tick,15000);const onVisible=()=>{if(!document.hidden)tick()};document.addEventListener('visibilitychange',onVisible);
 return()=>{clearInterval(timer);panel.removeEventListener('click',onClick);document.removeEventListener('visibilitychange',onVisible)};
}
