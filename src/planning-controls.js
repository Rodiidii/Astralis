let specialtyCache;
import {simulateWishOrder} from './wish-simulation.js?v=80';
import {simulateFarm} from './farm-simulator.js?v=82';

import {periodIncome,orderedGuarantees,forecastVersions,forecastBannerDate} from './planning-rules.js?v=82';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}}
class TalentTargets extends (globalThis.HTMLElement||class {}){
 connectedCallback(){
  const characters=JSON.parse(this.dataset.characters||'[]'),goals=read('astralis:gi:talent-targets');
  const input=(id,key,label,value,max,skill='')=>'<label>'+label+'<input type="number" min="1" max="'+max+'" value="'+value+'" data-person="'+escape(id)+'" data-level="'+key+'" data-skill="'+skill+'"></label>';
  this.innerHTML='<details open><summary>Objectifs de niveaux et d’aptitudes · '+characters.length+' personnage(s)</summary>'+characters.map(c=>{
   const value=goals[c.id]||{};
   return '<article class="farm-goal-row"><h4><img class="farm-priority-avatar" src="'+escape(c.portrait||'')+'" alt="">'+escape(c.name)+'</h4><div>'+input(c.id,'levelFrom','Niveau actuel',value.levelFrom||1,90)+input(c.id,'levelTo','Niveau visé',value.levelTo||90,90)+'</div>'+['Normale','Compétence','Déchaînement'].map((name,i)=>'<div><b>'+name+'</b>'+input(c.id,'from','Actuel',value.from?.[i]||1,10,i)+input(c.id,'to','Cible',value.to?.[i]||10,10,i)+'</div>').join('')+'</article>';
  }).join('')+'</details>';

  this.onchange=event=>{
   const input=event.target;if(!input.dataset.person)return;
   const all=read('astralis:gi:talent-targets'),id=input.dataset.person;
   all[id]||={from:[1,1,1],to:[10,10,10]};
   const field=input.dataset.level,value=Math.max(1,Math.min(Number(input.max),Math.floor(Number(input.value)||1)));
   if(field==='levelFrom'||field==='levelTo')all[id][field]=value;
   else (all[id][field]||=[field==='from'?1:10,field==='from'?1:10,field==='from'?1:10])[Number(input.dataset.skill)]=value;
   localStorage.setItem('astralis:gi:talent-targets',JSON.stringify(all));
   document.dispatchEvent(new CustomEvent('astralis:planning-changed'));
  };
 }
}
class WishObjectives extends (globalThis.HTMLElement||class {}){
 connectedCallback(){const defaults={start:new Date().toISOString().slice(0,10),end:'2026-12-16',theatre:1000,abyss:800,autoMaps:true,versionGifts:true};this.data=read('astralis:gi:objectives-v2',{targets:[],income:defaults});this.data.income={...defaults,...this.data.income};this.data.targets=Array.isArray(this.data.targets)?this.data.targets:[];if(!localStorage.getItem('astralis:gi:objectives-v2')){const plan=read('astralis:gi:wish-plan');if(plan.targetName)this.data.targets.push({name:plan.targetName,copies:Math.max(1,Number(plan.targetCopies)||1),refinements:plan.targetWeapon?1:0});this.save();}this.render();}
 render(){
  const value=this.data,income=value.income;
  this.innerHTML='<section class="wish-objectives-panel"><h2>Mes objectifs dans l’ordre</h2><p>Le plafond de garantie consomme les ressources dans l’ordre des objectifs.</p><div class="ordered-targets">'+value.targets.map((row,index)=>'<article><input data-target="'+index+'" data-field="name" value="'+escape(row.name)+'" placeholder="Personnage ou arme"><label>Copies à obtenir (C0 : 1 · C6 : 7 si non possédé)<input type="number" min="0" max="7" data-target="'+index+'" data-field="copies" value="'+row.copies+'"></label><label>Copies d’arme à obtenir (R1 : 1 · R5 : 5)<input type="number" min="0" max="5" data-target="'+index+'" data-field="refinements" value="'+row.refinements+'"></label><button data-move="'+index+'" data-direction="-1" '+(!index?'disabled':'')+'>↑</button><button data-move="'+index+'" data-direction="1" '+(index===value.targets.length-1?'disabled':'')+'>↓</button><button data-remove="'+index+'">×</button><details class="goal-ownership"><summary>Définir les constellations et raffinements</summary><div><label>Version estimée<select data-target="'+index+'" data-field="version"><option value="">Sans date</option>'+forecastVersions.map(version=>'<option '+(row.version===version?'selected':'')+'>'+version+'</option>').join('')+'</select></label><label>Phase<select data-target="'+index+'" data-field="phase"><option value="1">Première</option><option value="2" '+(Number(row.phase)===2?'selected':'')+'>Seconde</option></select></label>'+[['currentC','Constellation actuelle (−1 : non possédé)',-1,6,row.currentC??-1],['targetC','Constellation visée',0,6,row.targetC??Math.max(0,(row.copies||1)-1)],['currentR','Raffinement actuel (0 : non possédée)',0,5,row.currentR??0],['targetR','Raffinement visé (0 : sans arme)',0,5,row.targetR??row.refinements??0]].map(([field,label,min,max,value])=>'<label>'+label+'<input type="number" min="'+min+'" max="'+max+'" data-target="'+index+'" data-field="'+field+'" value="'+value+'"></label>').join('')+'</div></details></article>').join('')+'</div><button data-add>Ajouter un objectif</button><div data-guarantees></div><div data-order-graphs></div><h3>Atteindre un seuil de pity</h3><label>Bannière<select data-soft><option value="80">Personnage · 80</option><option value="65">Arme · 65</option></select></label><p data-soft-result></p><h3>Revenus sur une période</h3><div class="income-fields">'+[['start','Début','date'],['end','Fin','date'],['theatre','Théâtre moyen','number'],['abyss','Abysses moyens','number'],['freeWishes','Vœux offerts','number'],['freeMultis','Multis offertes','number'],['extraPrimos','Primogemmes supplémentaires','number'],['maps','Versions avec une nouvelle carte','number']].map(([key,label,type])=>'<label>'+label+'<input type="'+type+'" min="0" data-income="'+key+'" value="'+escape(income[key]??(type==='number'?0:''))+'"></label>').join('')+'<label><input type="checkbox" data-income="autoMaps" '+(income.autoMaps?'checked':'')+'> Scénario : nouvelle zone un patch sur deux depuis 7.2 (+3 000 primos)</label><label><input type="checkbox" data-income="versionGifts" '+(income.versionGifts?'checked':'')+'> Scénario : 10 vœux en 7.4, 20 en 8.0</label><p class="income-scenario-note">Hypothèses personnelles modifiables, pas des annonces officielles. Désactive le scénario de cartes pour saisir leur nombre manuellement.</p><label><input type="checkbox" data-income="welkin" '+(income.welkin?'checked':'')+'> Faveur active chaque jour de la période</label></div><div data-income-result></div><button data-apply-theory>Utiliser dans le budget théorique</button><details><summary>Détail des revenus</summary><div data-income-ledger></div></details></section>';
  this.onchange=event=>{
   const input=event.target;
   if(input.dataset.target!==undefined){const row=this.data.targets[Number(input.dataset.target)],field=input.dataset.field;row[field]=input.type==='number'?Number(input.value):input.value;if(['currentC','targetC'].includes(field)){row.currentC=Math.max(-1,Math.min(6,row.currentC??-1));row.targetC=Math.max(0,Math.min(6,row.targetC??0));row.copies=Math.max(0,row.targetC-row.currentC);this.querySelector('[data-target="'+input.dataset.target+'"][data-field="copies"]').value=row.copies;}if(['currentR','targetR'].includes(field)){row.currentR=Math.max(0,Math.min(5,row.currentR??0));row.targetR=Math.max(0,Math.min(5,row.targetR??0));row.refinements=Math.max(0,row.targetR-row.currentR);this.querySelector('[data-target="'+input.dataset.target+'"][data-field="refinements"]').value=row.refinements;}}
   if(input.dataset.income)this.data.income[input.dataset.income]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
   this.save();this.update();if(input.dataset.income){const plan=read('astralis:gi:wish-plan'),key={theatre:'theatreGain',abyss:'abyssGain',welkin:'welkin'}[input.dataset.income];if(key){plan[key]=input.type==='checkbox'?input.checked:Number(input.value);localStorage.setItem('astralis:gi:wish-plan',JSON.stringify(plan));document.querySelector('wish-wallet')?.render();}}
  };
  this.onclick=event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.hasAttribute('data-add')){this.data.targets.push({name:'',copies:1,refinements:0});this.save();this.render();}
   if(button.dataset.remove!==undefined){this.data.targets.splice(Number(button.dataset.remove),1);this.save();this.render();}
   if(button.dataset.move!==undefined){const from=Number(button.dataset.move),to=from+Number(button.dataset.direction);if(to>=0&&to<this.data.targets.length){const [row]=this.data.targets.splice(from,1);this.data.targets.splice(to,0,row);this.save();this.render();}}
   if(button.hasAttribute('data-apply-theory')){
    const result=periodIncome(this.data.income);
    if(!result.error){this.data.theoreticalPrimos=result.primos;this.data.theoreticalWishes=result.wishes;this.save();button.textContent='Budget théorique enregistré';this.update();}
   }
  };
  this.update();
 }
 save(){localStorage.setItem('astralis:gi:objectives-v2',JSON.stringify(this.data));}
 update(){
  const maps=this.querySelector('[data-income=maps]');if(maps)maps.disabled=!!this.data.income.autoMaps;
  const plan=read('astralis:gi:wish-plan');
  const rows=orderedGuarantees(this.data.targets,{...plan,primos:plan.currentPrimos??plan.primos});
  this.querySelector('[data-guarantees]').innerHTML=rows.map(row=>'<p><b>'+escape(row.name||'Objectif')+'</b> · '+row.wishes+' vœux au plus · manque '+row.missing+' vœux / '+row.missingPrimos+' primogemmes pour garantir cet objectif dans cet ordre.</p>').join('');
  const schedule=this.data.targets.map((target,index)=>{
   const end=forecastBannerDate(target.version,target.phase);
   if(!end)return '';
   const income=periodIncome({...this.data.income,end});
   if(income.error)return '<p>'+escape(target.name||'Objectif')+' · '+end+' · date avant la période choisie.</p>';
   const result=simulateWishOrder(this.data.targets.slice(0,index+1),{...plan,theoreticalPrimos:income.primos,theoreticalWishes:income.wishes},2000);
   return '<p>'+escape(target.name||'Objectif')+' · '+end+' · '+income.primos.toLocaleString('fr-FR')+' primos et '+income.wishes+' vœux estimés · '+result.rows.at(-1).theoryChance.toFixed(1)+' % de réussite cumulative</p>';
  }).join('');
  this.querySelector('[data-guarantees]').insertAdjacentHTML('beforeend',schedule);
  const simulation=simulateWishOrder(this.data.targets,{...plan,...this.data});
  const graph=(theory)=>'<figure class="wish-order-graph"><figcaption>'+ (theory?'Avec les revenus de la période':'Avec le solde actuel')+' · '+(theory?simulation.theory:simulation.budget)+' vœux</figcaption><svg viewBox="0 0 600 210" role="img" aria-label="Probabilité cumulée par objectif"><path d="M40 15V180H580" fill="none" stroke="currentColor"/><text x="0" y="22">100%</text><text x="10" y="180">0%</text>'+simulation.rows.map((row,index)=>{const maximum=Math.max(1,...simulation.rows.flatMap(r=>r.points.map(p=>p[0]))),color=['#90d9ce','#d3b576','#b5a4ed','#ef9da9'][index%4];return '<polyline fill="none" stroke="'+color+'" stroke-width="2.5" points="'+row.points.map(([x,y])=>(40+x/maximum*540)+','+(180-y*1.6)).join(' ')+'"/><line x1="'+(40+Math.min(maximum,theory?simulation.theory:simulation.budget)/maximum*540)+'" y1="20" x2="'+(40+Math.min(maximum,theory?simulation.theory:simulation.budget)/maximum*540)+'" y2="180" stroke="'+color+'" stroke-dasharray="4 4"/>';}).join('')+'</svg>'+simulation.rows.map(row=>'<p>'+escape(row.name||'Objectif')+' : <b>'+ (theory?row.theoryChance:row.chance).toFixed(1)+'%</b> · médiane cumulative '+row.median+' vœux</p>').join('')+'</figure>';
  this.querySelector('[data-order-graphs]').innerHTML='<div class="wish-order-graphs">'+graph(false)+graph(true)+'</div><section class="wish-loss-scenarios"><header><h3>Scénarios · nombre de 50/50 perdus</h3><small>Réussite de tous les objectifs dans l’ordre</small></header><div>'+simulation.losses.map(row=>'<article><header><b>'+row.count+'</b><span>50/50 perdu'+(row.count>1?'s':'')+'</span><small>'+row.frequency.toFixed(1)+' % des simulations</small></header><label>Solde actuel <b>'+(row.success===null?'Non observé':row.success.toFixed(1)+' %')+'</b><progress max="100" value="'+(row.success||0)+'"></progress></label><label>Avec mes revenus <b>'+(row.theorySuccess===null?'Non observé':row.theorySuccess.toFixed(1)+' %')+'</b><progress max="100" value="'+(row.theorySuccess||0)+'"></progress></label></article>').join('')+'</div><details><summary>Tableau des scénarios</summary><table><thead><tr><th>Pertes</th><th>Fréquence</th><th>Solde actuel</th><th>Avec revenus</th></tr></thead><tbody>'+simulation.losses.map(row=>'<tr><td>'+row.count+'</td><td>'+row.frequency.toFixed(1)+' %</td><td>'+(row.success===null?'—':row.success.toFixed(1)+' %')+'</td><td>'+(row.theorySuccess===null?'—':row.theorySuccess.toFixed(1)+' %')+'</td></tr>').join('')+'</tbody></table></details></section><small>6 000 simulations reproductibles. Les objectifs suivants supposent les précédents obtenus. Modèle communautaire : soft pity 74/63, Radiance 50/50 → 50/50 → 75/25 → 100%. Ces taux intermédiaires ne sont pas publiés par HoYoverse ; le plafond de garantie ci-dessus reste conservateur. Les points de destin ne sont pas transférés entre bannières. <a href="https://www.hoyolab.com/article/32168979" target="_blank" rel="noopener">Règles publiques de Radiance</a></small>';
  const threshold=Number(this.querySelector('[data-soft]').value),pity=Number(threshold===80?plan.characterPity:plan.weaponPity)||0,need=Math.max(0,threshold-pity),budget=Math.max(0,Number(plan.wishes)||0)+Math.floor(Math.max(0,Number(plan.currentPrimos??plan.primos)||0)/160),missing=Math.max(0,need-budget);
  this.querySelector('[data-soft-result]').textContent=need+' vœux jusqu’au seuil choisi · manque '+missing+' vœux ('+Math.max(0,(need-Math.max(0,Number(plan.wishes)||0))*160-Math.max(0,Number(plan.currentPrimos??plan.primos)||0))+' primogemmes).';
  const result=periodIncome(this.data.income);
  this.querySelector('[data-income-result]').textContent=result.error||result.primos.toLocaleString('fr-FR')+' primogemmes + '+result.wishes+' vœux · '+result.patches+' versions commencées dans la période · événements le 3e et le 4e dimanche, puis le 5e mercredi après lancement (J18/J25/J35).';
  this.querySelector('[data-income-ledger]').innerHTML=result.ledger.map(row=>'<p>'+row.date+' · '+escape(row.label)+' · '+row.primos+' primogemmes + '+row.wishes+' vœux</p>').join('');
 }
}
if(typeof customElements!=='undefined'){customElements.define('farm-talent-targets',TalentTargets);customElements.define('wish-objectives',WishObjectives);}

class FarmForecasts extends (globalThis.HTMLElement||class {}){
 connectedCallback(){
  if(!specialtyCache){fetch('./data/local-specialties.json').then(r=>r.json()).then(data=>{specialtyCache=data.items||{};if(this.isConnected)this.connectedCallback();}).catch(()=>{specialtyCache={};});}

  const data=JSON.parse(this.dataset.plan||'{}');data.reservedDates=read('astralis:gi:farm-calendar',[]).filter(r=>!r.auto&&!r.simulated).map(r=>r.date);data.specialties=specialtyCache||{};const config=read('astralis:gi:farm-simulation',{artifactDays:0});
  const order=read('astralis:gi:farm-priority',[]);
  data.characters.sort((a,b)=>{const rank=id=>order.includes(id)?order.indexOf(id):order.length+data.characters.findIndex(c=>c.id===id);return rank(a.id)-rank(b.id);});
  data.characters.forEach((c,index)=>c.priority=index);
  const options=[0,1,2,3,4].map(artifactDays=>simulateFarm({...data,start:[config.start||'',new Date().toLocaleDateString('sv-SE')].sort().at(-1),artifactDays}));
  const selected=options[Math.max(0,Math.min(4,Number(config.artifactDays)||0))],projectionDates=selected.dates;
  localStorage.setItem('astralis:gi:farm-projections',JSON.stringify(projectionDates));
  this.innerHTML='<section class="farm-projections"><h3>Ordre de priorité et dates estimées</h3><ol>'+data.characters.map((c,index)=>'<li draggable="true" tabindex="0" title="Glisser pour changer la priorité · Alt + flèches au clavier" data-farm-rank="'+index+'" data-farm-person="'+escape(c.id)+'"><span aria-hidden="true">⠿</span><img class="farm-priority-avatar" src="'+escape(c.portrait||'')+'" alt=""> '+escape(c.name)+' <button data-priority="'+index+'" data-offset="-1" '+(!index?'disabled':'')+'>↑</button><button data-priority="'+index+'" data-offset="1" '+(index===data.characters.length-1?'disabled':'')+'>↓</button></li>').join('')+'</ol><label>Commencer le <input type="date" data-start value="'+(config.start||new Date().toLocaleDateString('sv-SE'))+'"></label><div class="farm-projection-options">'+options.map((result,index)=>'<button data-artifact-days="'+index+'" aria-pressed="'+(Number(config.artifactDays)===index)+'"><header><span class="farm-scenario-number">'+index+'</span><span>jour'+(index>1?'s':'')+' d’artéfacts<small>par semaine</small></span><i aria-hidden="true">'+(Number(config.artifactDays)===index?'✓':'')+'</i></header><div class="farm-scenario-people">'+data.characters.map(c=>'<span><img src="'+escape(c.portrait||'')+'" alt=""><span>'+escape(c.name)+'<time>'+escape(result.dates[c.id]||'Date à confirmer')+'</time></span></span>').join('')+'</div><footer>'+['Priorité aux matériaux','Une pause artéfacts','Rythme équilibré','Davantage d’artéfacts','Artéfacts prioritaires'][index]+'</footer></button>').join('')+'</div><p>Estimation sur les rendements moyens indiqués, au plus 730 jours. Les stocks et la synthèse 3 pour 1 sont pris en compte. La date verte est une fin hypothétique des activités à résine et des récoltes connues, hors artéfacts. Les monstres et couronnes restent à posséder. Les boss hebdomadaires utilisent la moyenne de 2,5 matériaux et supposent les conversions disponibles.</p><div class="farm-gathering">'+(selected.harvests||[]).map(h=>'<p>'+escape(data.characters.find(c=>c.id===h.person)?.name)+' · '+escape(h.item.name)+' : '+(h.capacity?h.capacity+' par récolte · '+h.cycles+' passage(s), espacés de 48 h':'Capacité à confirmer')+(h.source?' · <a href="'+escape(h.source)+'" target="_blank" rel="noopener">Carte officielle</a>':'')+'</p>').join('')+'</div><button data-apply-farm>Afficher cette simulation dans le calendrier</button></section>';
  const apply=()=>{
   const manual=read('astralis:gi:farm-calendar',[]).filter(row=>!row.simulated&&!row.auto);
   const rows=selected.sessions.map(row=>({...row,id:crypto.randomUUID(),simulated:true,planId:'simulation-current',character:row.characterIds.map(id=>data.characters.find(c=>c.id===id)?.name).filter(Boolean).join(', ')}));
   localStorage.setItem('astralis:gi:farm-calendar',JSON.stringify([...manual,...rows]));
   config.enabled=true;config.signature=JSON.stringify(data)+config.start+config.artifactDays;localStorage.setItem('astralis:gi:farm-simulation',JSON.stringify(config));
   document.dispatchEvent(new CustomEvent('astralis:planning-changed'));
  };
  this.onclick=event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.dataset.priority!==undefined){const ids=data.characters.map(c=>c.id),from=Number(button.dataset.priority),to=from+Number(button.dataset.offset);if(to<0||to>=ids.length)return;[ids[from],ids[to]]=[ids[to],ids[from]];localStorage.setItem('astralis:gi:farm-priority',JSON.stringify(ids));document.dispatchEvent(new CustomEvent('astralis:planning-changed'));}
   if(button.dataset.artifactDays!==undefined){config.artifactDays=Number(button.dataset.artifactDays);localStorage.setItem('astralis:gi:farm-simulation',JSON.stringify(config));document.dispatchEvent(new CustomEvent('astralis:planning-changed'));}
   if(button.hasAttribute('data-apply-farm'))apply();
  };
  this.onchange=event=>{if(event.target.hasAttribute('data-start')){config.start=event.target.value;localStorage.setItem('astralis:gi:farm-simulation',JSON.stringify(config));document.dispatchEvent(new CustomEvent('astralis:planning-changed'));}};
  const move=(from,to)=>{if(from===to||from<0||to<0||from>=data.characters.length||to>=data.characters.length)return;const ids=data.characters.map(c=>c.id),[id]=ids.splice(from,1);ids.splice(to,0,id);localStorage.setItem('astralis:gi:farm-priority',JSON.stringify(ids));document.dispatchEvent(new CustomEvent('astralis:planning-changed'));};
  let dragging=-1;
  this.ondragstart=e=>{const row=e.target.closest('[data-farm-rank]');if(row){dragging=Number(row.dataset.farmRank);e.dataTransfer.setData('text/plain',String(dragging));}};
  this.ondragover=e=>{if(e.target.closest('[data-farm-rank]'))e.preventDefault();};
  this.ondrop=e=>{const row=e.target.closest('[data-farm-rank]');if(row){e.preventDefault();move(dragging,Number(row.dataset.farmRank));}};
  this.onkeydown=e=>{const row=e.target.closest('[data-farm-rank]');if(row&&e.altKey&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const from=Number(row.dataset.farmRank);move(from,from+(e.key==='ArrowUp'?-1:1));}};
  const signature=JSON.stringify(data)+config.start+config.artifactDays;
  if(config.enabled&&config.signature!==signature)queueMicrotask(()=>{if(this.isConnected)apply();});
 }
}
if(typeof customElements!=='undefined')customElements.define('farm-forecasts',FarmForecasts);
