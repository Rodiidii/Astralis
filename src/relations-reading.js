import {mountKnowledgeWorkbench} from './knowledge-workbench.js?v=20261126-reading-studio-2';

import {relationRank,relationEvidenceProfile,RELATION_RANKS,proofsForMode,sharedVoiceTargets} from './relation-ranks.js?v=20261115-evidence-strength-1';
import {summarizeRelationInsights} from './relation-insights.js?v=20261115-network-insights-1';
import {summarizeRelationSources} from './relation-source-audit.js?v=20261115-source-audit-1';
import {referenceAuditSnapshot} from './relation-reference-audit.js?v=20261115-reference-audit-2';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=url=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
let stickyUtilityView='';
export function renderReferenceTeaser(){
 const reference=referenceAuditSnapshot();
 return '<div><span class="relations-kicker">INDEX DE RÉFÉRENCE · '+esc(reference.checkedAt)+'</span><b>Le corpus publié par Ties</b></div><div class="relations-reference-teaser-counts"><span><b>'+reference.counts.storyLines.toLocaleString('fr-FR')+'</b><small>passages d’histoire</small></span><span><b>'+reference.counts.voiceLines.toLocaleString('fr-FR')+'</b><small>lignes vocales</small></span><span><b>'+reference.counts.quests.toLocaleString('fr-FR')+'</b><small>quêtes</small></span><span><b>'+reference.counts.playableCharacters.toLocaleString('fr-FR')+'</b><small>personnages jouables</small></span></div><p>Chiffres annoncés par le site source; ils ne sont pas importés dans les preuves locales d’Astralis.</p><a href="'+esc(reference.url)+'" target="_blank" rel="noopener noreferrer">Consulter la référence ↗</a>';
}
export function enhanceRelations(g) {
 mountKnowledgeWorkbench(g,{route:{kind:'relations'},edges:g.edges||[],entities:[...(g.characters?.values?.()||[])].map(c=>({id:String(c.id||c._id),name:c.name||c._name,kind:'character'})),open:e=>document.dispatchEvent(new CustomEvent('astralis:knowledge-character',{detail:e.id})),openRoute:r=>document.dispatchEvent(new CustomEvent('astralis:knowledge-route',{detail:r}))});

 if(g.readingBound)return;g.readingBound=true;
 const referenceTeaser=document.createElement('section');
 referenceTeaser.className='relations-reference-teaser';referenceTeaser.setAttribute('aria-label','Compteurs annoncés par le site de référence');
 referenceTeaser.innerHTML=renderReferenceTeaser();
 g.querySelector('.relations-sidebar>p')?.insertAdjacentElement('afterend',referenceTeaser);
 const tools=g.querySelector('.relations-tools');
 tools.insertAdjacentHTML('beforeend','<button type="button" data-reading="graph" aria-pressed="false">Carte seule (H)</button><button type="button" data-reading="random">Duo au hasard</button>');
 tools.insertAdjacentHTML('beforeend','<button data-reading="share">Partager…</button><button data-reading="news">Nouveautés</button><button data-reading="evidence-search">Rechercher dans les preuves</button><button data-reading="sources">Sources</button>');
 const dialog=document.createElement('dialog');dialog.className='relations-utility';dialog.innerHTML='<button data-reading="close" aria-label="Fermer">×</button><div data-utility-body></div>';g.append(dialog);g.utility=dialog;
 dialog.addEventListener('click',e=>{
  const result=e.target.closest('[data-reading="evidence-result"]');if(!result)return;
  e.preventDefault();e.stopPropagation();
  const [a,b]=String(result.dataset.pair||'').split('|');
  if(!a||!b)return;
  stickyUtilityView='';dialog.close();g.selected=[a,b];g.dismissedDuo='';g.update();
 });
 dialog.addEventListener('close',()=>{stickyUtilityView='';});
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();stickyUtilityView='';dialog.close();}});
 g.addEventListener('click',e=>{
  const b=e.target.closest('[data-reading]');if(!b)return;
  const action=b.dataset.reading;
  if(action==='graph'){
   const active=g.classList.toggle('relations-graph-only');
   b.setAttribute('aria-pressed',String(active));
   b.textContent=active?'Afficher le panneau (H)':'Carte seule (H)';
   g.schedule();
  }
  if(action==='random'){
   const edges=g.visibleEdges;
   if(edges.length){const edge=edges[Math.floor(Math.random()*edges.length)];g.selected=[edge.a,edge.b];g.dismissedDuo='';g.update();}
  }
  if(action==='close'){stickyUtilityView='';dialog.close();}
  if(action==='sources'){stickyUtilityView='sources';showSources(g);}
  if(action==='evidence-search')showEvidenceSearch(g);
  if(action==='evidence-kind'){g.utility.dataset.evidenceKind=b.dataset.kind||'all';g.utility.querySelectorAll('[data-reading="evidence-kind"]').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));const input=g.utility.querySelector('[data-evidence-query]'),host=g.utility.querySelector('[data-evidence-results]');if(host)host.innerHTML=renderEvidenceResults(g,input?.value||'');}
  if(action==='evidence-result'){
   const [a,b]=String(b.dataset.pair||'').split('|');
   if(a&&b){stickyUtilityView='';g.utility.close();g.selected=[a,b];g.dismissedDuo='';g.update();}
  }
  if(action==='news')open(g,'<h2>Nouveautés</h2><time>10 novembre 2026</time><h3>Les archives prennent vie</h3><ul><li>Rangs explicites et anneaux de connexion.</li><li>Lecture des duos sur papier ancien et preuves regroupées.</li><li>Partage de la vue, signalements locaux et lecture alternée.</li></ul>');
  if(action==='share')showShare(g);
  if(action==='report')showReport(g);
  if(action==='next')nextPair(g,1);
  if(action==='previous')nextPair(g,-1);
  if(action==='conversation')conversation(g);
  if(action==='pause'){g.readingPaused=!g.readingPaused;g.readingAudio?.pause();b.textContent=g.readingPaused?'Reprendre':'Pause';if(!g.readingPaused){if(g.readingAudio&&!g.readingAudio.ended)g.readingAudio.play().catch(()=>{});else g.readNext?.();}}
  if(action==='duotab'){g.duoDialog.dataset.tab=b.dataset.tab;if(innerWidth>700)g.duoDialog.querySelector('[data-reading-panel="'+b.dataset.tab+'"]').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});g.duoDialog.querySelectorAll('[data-reading=duotab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));}
 });
 dialog.addEventListener('input',e=>{
  if(!e.target.matches('[data-evidence-query]'))return;
  const host=dialog.querySelector('[data-evidence-results]');
  if(host)host.innerHTML=renderEvidenceResults(g,e.target.value);
 });
 g.addEventListener('keydown',e=>{if(g.duoDialog.open&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();nextPair(g,e.key==='ArrowLeft'?-1:1);}});
 g.duoDialog.addEventListener('close',()=>{g.readingToken=(g.readingToken||0)+1;g.readingAudio?.pause();});
 g.addEventListener('keydown',event=>{
  if(event.key.toLowerCase()==='h'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable]')&&!g.duoDialog.open&&!g.utility.open){
   event.preventDefault();g.querySelector('[data-reading="graph"]').click();
  }
 });
 g.addEventListener('change',e=>{
  if(e.target.dataset.relSetting==='volume')g.querySelectorAll('audio').forEach(a=>a.volume=Number(g.settings.volume)/100);
 });
 const original=g.renderInfo.bind(g);
 g.renderInfo=()=>{original();renderReading(g);if(stickyUtilityView==='sources'&&!g.utility.querySelector('.relations-reference-audit'))showSources(g);};
 g.renderInfo();
}
const normalizeEvidence=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
export function searchRelationEvidence(edges,query,limit=30,kind='all'){
 const q=normalizeEvidence(query);if(!q||q.length<2)return [];
 const terms=q.split(/\s+/).filter(Boolean),results=[];
 for(const edge of Array.isArray(edges)?edges:[]){
  for(const proof of Array.isArray(edge?.proofs)?edge.proofs:[]){
   const category=proof.kind==='voice'?'voice':proof.quest?'quest':proof.kind==='story'?'story':'other';
   if(kind!=='all'&&category!==kind)continue;
   const haystack=normalizeEvidence([proof.title,proof.quest,proof.summary,proof.quote,proof.reply,proof.sourceType].join(' '));
   if(terms.every(term=>haystack.includes(term)))results.push({edge,proof});
  }
 }
 return results.slice(0,Math.max(1,Math.min(100,Number(limit)||30)));
}
function renderEvidenceResults(g,query){
 const kind=g.utility?.dataset.evidenceKind||'all',rows=searchRelationEvidence(g.edges,query,30,kind);
 if(normalizeEvidence(query).length<2)return '<p>Saisis au moins deux lettres pour chercher dans les titres, quêtes, résumés et preuves locales.</p>';
 if(!rows.length)return '<p>Aucune preuve locale ne correspond à cette recherche.</p>';
 return '<p class="relations-evidence-search-count">'+rows.length+' résultat'+(rows.length===1?'':'s')+' affiché'+(rows.length===1?'':'s')+' · corpus local vérifiable</p>'+rows.map(({edge,proof})=>{
  const a=g.characters.get(edge.a),b=g.characters.get(edge.b),title=proof.title||proof.quest||'Preuve sans titre';
  const quote=String(proof.summary||proof.quote||proof.reply||'');
  const excerpt=quote.length>220?quote.slice(0,217).trimEnd()+'…':quote;
  const category=proof.kind==='voice'?'Réplique vocale':proof.quest?'Quête · '+proof.quest:proof.kind==='story'?'Lore / histoire':'Autre source';
  return '<button type="button" class="relations-evidence-result" data-reading="evidence-result" data-pair="'+esc(edge.a)+'|'+esc(edge.b)+'"><span class="relations-evidence-result-pair">'+portrait(g,a)+portrait(g,b)+'<b>'+esc(a?.name||edge.a)+' ↔ '+esc(b?.name||edge.b)+'</b></span><span class="relations-evidence-result-meta">'+esc(category)+' · '+esc(title)+' · '+esc(String(proof.lang||'').toUpperCase())+'</span>'+(excerpt?'<span class="relations-evidence-result-excerpt">'+esc(excerpt)+'</span>':'')+'<span class="relations-evidence-result-open">Ouvrir le duo ↗</span></button>';
 }).join('');
}
function showEvidenceSearch(g){
 stickyUtilityView='evidence-search';
 g.utility.dataset.evidenceKind='all';
 open(g,'<section class="relations-evidence-search"><span class="relations-kicker">ARCHIVES LOCALES · RECHERCHE TRANSVERSALE</span><h2>Explorer les preuves</h2><p>Recherche dans les éléments indexés par Astralis. Les résultats ouvrent directement la fiche du duo et conservent les filtres du réseau.</p><div class="relations-evidence-filters" role="group" aria-label="Filtrer par type de preuve"><button type="button" data-reading="evidence-kind" data-kind="all" aria-pressed="true">Tout</button><button type="button" data-reading="evidence-kind" data-kind="voice" aria-pressed="false">Voix</button><button type="button" data-reading="evidence-kind" data-kind="story" aria-pressed="false">Histoire</button><button type="button" data-reading="evidence-kind" data-kind="quest" aria-pressed="false">Quêtes</button></div><label>Personnage, quête ou extrait<input type="search" data-evidence-query placeholder="Ex. Furina, procès, voix…" autocomplete="off"></label><div data-evidence-results aria-live="polite"><p>Saisis au moins deux lettres pour lancer la recherche.</p></div></section>');
}
function open(g,html){g.utility.querySelector('[data-utility-body]').innerHTML=html;if(!g.utility.open)g.utility.showModal();}
function sourceRows(g){return [...new Map(g.edges.flatMap(e=>e.proofs).map(p=>[p.id+'|'+p.lang,p])).values()];}
function counts(g,id){
 const rows=g.readingSourceRows||sourceRows(g).filter(p=>p.kind==='voice');
 return {out:new Set(rows.filter(p=>p.from===id).map(p=>p.to)).size,in:new Set(rows.filter(p=>p.to===id).map(p=>p.from)).size};
}
function portrait(g,c){return '<img src="'+esc(safe(c?.portrait||c?.image))+'" alt="" loading="lazy">';}
function renderReading(g){
 g.readingToken=(g.readingToken||0)+1;
 g.readingAudio?.pause();
 const rows=sourceRows(g),info=g.querySelector('[data-rel-info]');g.readingSourceRows=g.visibleEdges.flatMap(e=>e.proofs).filter(p=>p.kind==='voice');
 for(const node of g.querySelectorAll('[data-rel-nodes] button')){
  const c=g.characters.get(node.dataset.relSelect),n=counts(g,c.id);
  node.title=c.name+' parle de '+n.out+' personnages, est mentionné par '+n.in+' personnages';
 }
 if(!g.selected.length){
  const stats=[['Répliques d’histoire',rows.filter(p=>p.kind==='story').length],['Quêtes documentées',new Set(rows.map(p=>p.quest).filter(Boolean)).size],['Personnages jouables',[...g.characters.values()].filter(c=>!c.npc).length],['Répliques vocales',rows.filter(p=>p.kind==='voice').length]];
  const insight=summarizeRelationInsights([...g.characters.values()],rows);
  const insightCard=(label,person,detail,extra='')=>person?'<button type="button" class="relations-insight-card" '+(person.id?'data-rel-select="'+esc(person.id)+'"':'data-rel-insight-pair="'+esc(person.a)+'|'+esc(person.b)+'"')+'>'+(person.id?portrait(g,g.characters.get(person.id)):'<span class="relations-insight-duo">'+portrait(g,g.characters.get(person.a))+portrait(g,g.characters.get(person.b))+'</span>')+'<span><small>'+label+'</small><b>'+esc(person.name||g.characters.get(person.a)?.name+' ↔ '+g.characters.get(person.b)?.name)+'</b><em>'+detail(person)+'</em></span>'+extra+'</button>':'';
  const insights='<section class="relations-insight-grid" aria-label="Repères calculés depuis les relations">'+insightCard('LE PLUS MENTIONNÉ',insight.mostMentioned,p=>'Par '+p.value+' personnages')+insightCard('PARLE DU PLUS DE MONDE',insight.mostSpeaks,p=>'Mentionne '+p.value+' personnages')+insightCard('DUO LE PLUS RÉCIPROQUE',insight.mostReciprocal,p=>p.forward+' / '+p.reverse+' répliques')+insightCard('SANS LIEN INDEXÉ',insight.isolated,p=>insight.isolatedCount+' personnage'+(insight.isolatedCount===1?'':'s')+' à explorer','<span class="relations-insight-mark" aria-hidden="true">＋</span>')+'</section>';
  info.insertAdjacentHTML('afterbegin','<div class="relations-counters">'+stats.map(([label,n])=>'<div><strong data-counter="'+n+'">'+n+'</strong><span>'+label+'</span></div>').join('')+'</div>'+insights+'<p class="relations-transparency">Données locales vérifiables : '+insight.evidenceCount+' preuves indexées · '+new Set(rows.map(p=>p.source)).size+' sources identifiées.</p>');
  const reciprocalCard=info.querySelector('[data-rel-insight-pair]');
  if(reciprocalCard)reciprocalCard.onclick=()=>{g.selected=[reciprocalCard.dataset.relInsightPair.split('|')].flat();g.dismissedDuo='';g.update();};
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const start=performance.now(),nodes=[...info.querySelectorAll('[data-counter]')];
   const tick=now=>{if(!nodes[0]?.isConnected)return;const t=Math.min(1,(now-start)/650);for(const n of nodes)n.textContent=Math.round(Number(n.dataset.counter)*(1-(1-t)**3));if(t<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);
  }
 }else{
  const c=g.characters.get(g.selected[0]),n=counts(g,c.id);
  const connected=g.visibleEdges.filter(edge=>edge.a===c.id||edge.b===c.id);
  const list=info.querySelector('.relations-link-list');
  if(list && g.selected.length===1){
   const sections=new Map();
   for(const button of [...list.querySelectorAll('[data-rel-select]')]){
    const id=button.dataset.relSelect;
    const edge=connected.find(edge=>edge.a===id||edge.b===id);
    if(!edge)continue;
    const proofs=proofsForMode(edge.proofs,g.settings.connectionMode);
    const outgoing=proofs.some(p=>p.kind==='voice'&&p.from===c.id);
    const incoming=proofs.some(p=>p.kind==='voice'&&p.to===c.id);
    const title=g.settings.connectionMode==='voice'
     ? (outgoing&&incoming?'Mentions réciproques':outgoing?'En parle':'Parlent de ce personnage')
     : relationRank(proofs).label;
    if(!sections.has(title))sections.set(title,[]);
    sections.get(title).push(button);
   }
   for(const [title,buttons] of sections){
    const section=document.createElement('section');
    section.className='relations-link-group';
    const heading=document.createElement('h4');
    heading.textContent=title+' · '+buttons.length;
    section.append(heading,...buttons);
    list.append(section);
   }
  }
  const modes=[['voice','voiceMode','Répliques'],['lore','loreMode','Lore'],['connection','connectionMode','Degré']];
  const controls=modes.map(([mode,action,label])=>{
   const count=connected.filter(edge=>proofsForMode(edge.proofs,mode).length).length;
   return '<button type="button" data-rel-action="'+action+'" aria-pressed="'+(g.settings.connectionMode===mode)+'">'+label+' <small>'+count+'</small></button>';
  }).join('');
  const legend=g.settings.connectionMode==='connection'?'<p class="relations-rank-legend"><strong>Force des preuves</strong><br>'+RELATION_RANKS.slice().reverse().map((label,i)=>'◆'.repeat(5-i)+' '+label).join('<br>')+'</p>':'';
  const npc=c.npc&&!n.out?'<p class="relations-npc-note">Aucune réplique vocale émise dans le corpus.</p>':'';
  info.insertAdjacentHTML('afterbegin','<p class="relations-mention-summary">'+n.out+' mentions vocales émises · '+n.in+' reçues</p>'+npc+'<div class="relations-mode-switch" aria-label="Mode de relation">'+controls+'</div>'+legend);
 }
 let roster=g.querySelector('[data-reading-roster]');
 if(!roster){roster=document.createElement('section');roster.dataset.readingRoster='';g.querySelector('.relations-regions').before(roster);}
 const regions=new Map();
 for(const {c} of g.points.values()){
  const region=c.region||'Autres';
  if(!regions.has(region))regions.set(region,[]);
  regions.get(region).push(c);
 }
 const linked=new Set(g.visibleEdges.flatMap(edge=>[edge.a,edge.b]));
 roster.innerHTML='<h3>Régions à afficher</h3><div class="reading-region-options"><button type="button" data-rel-region="">Toutes les régions</button>'+[...regions].map(([region,characters])=>{const connected=characters.filter(person=>linked.has(person.id)).length,isolated=characters.length-connected;return '<button type="button" data-rel-region="'+esc(region)+'" aria-label="'+esc(region)+' · '+connected+' profils reliés sur '+characters.length+', '+isolated+' sans preuve locale" title="'+connected+'/'+characters.length+' profils reliés · '+isolated+' sans preuve locale" aria-pressed="'+String((g.settings.regions||[g.settings.region]).includes(region))+'"><span>'+esc(region)+'</span><small>'+connected+'/'+characters.length+' reliés</small></button>';}).join('')+'</div>';
 if(g.selected.length!==2)return;
 const [a,b]=g.selected,ca=g.characters.get(a),cb=g.characters.get(b);
 const edge=g.visibleEdges.find(e=>[e.a,e.b].includes(a)&&[e.a,e.b].includes(b));
 const proofs=edge?g.localProofs(edge):[],rank=relationRank(proofs),profile=relationEvidenceProfile(proofs);
 const hiddenStory=g.settings.spoilers&&g.edges.some(e=>[e.a,e.b].includes(a)&&[e.a,e.b].includes(b)&&e.proofs.some(p=>p.kind==='story'&&!p.public&&!g.settings.played.includes(p.quest)));
 const content=g.duoDialog.querySelector('[data-rel-duo-content]');
 if(!g.relationPathBound){g.duoDialog.addEventListener('click',event=>{const button=event.target.closest('[data-rel-action="nextPath"]');if(!button)return;event.preventDefault();event.stopPropagation();g.action('nextPath');});g.relationPathBound=true;}
 const existingPath=content.querySelector('.relations-path')?.outerHTML||'';
 const nextPathButton=!edge&&g.paths?.length>1?'<button type="button" class="relations-next-path" data-rel-action="nextPath" aria-label="Afficher l’itinéraire suivant">Autre itinéraire <span>'+(g.pathIndex+1)+'/'+g.paths.length+'</span> ↗</button>':'';
 const relationship=proofs.find(p=>p.explicitRelation&&p.relationType)?.relationType;
 const voices=[proofs.filter(p=>p.kind==='voice'&&p.from===a),proofs.filter(p=>p.kind==='voice'&&p.from===b)];
 const stories=proofs.filter(p=>p.kind==='story');
 const groups=new Map();
 for(const p of stories){const type=p.sourceType||'Quêtes et récits · type non renseigné';if(!groups.has(type))groups.set(type,[]);groups.get(type).push(p);}
 const show=p=>g.proof(p);
 const indices=[...groups].map(([type,list])=>{
  const quests=new Map();
  for(const row of list){
   const id=row.quest||row.id;
   if(!quests.has(id))quests.set(id,[]);
   quests.get(id).push(row);
  }
  const entries=[...quests.values()].map(lines=>'<details class="relations-quest-entry"><summary>'+esc(lines[0].title.split(' · ')[0])+' <small>'+lines.length+' extrait(s)</small></summary>'+lines.map(show).join('')+'</details>').join('');
  return '<details class="relations-evidence-group"><summary>'+esc(type)+' <small>'+quests.size+' entrées</small></summary>'+entries+'</details>';
 }).join('');
 const empty='<p class="relations-no-voice">Aucune réplique vocale disponible dans les sources et filtres actuels. Cela ne démontre pas une absence de relation.</p>';
 g.duoDialog.dataset.tab||='a';
 const stage=g.duoDialog.querySelector('.relations-duo-stage')||document.createElement('div');
 stage.className='relations-duo-stage';stage.setAttribute('aria-hidden','true');stage.replaceChildren();
 for(const [index,c] of [ca,cb].entries()){
  const side=document.createElement('div');
  const palette={pyro:'#b34430',hydro:'#246e9c',cryo:'#537caa',electro:'#684798',dendro:'#47723d',geo:'#936728',anemo:'#357b70'};
  const element=String(c.element||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  side.style.setProperty('--duo-tint',palette[element]||'#555779');
  side.className='relations-stage-art '+(index?'is-right':'is-left');
  const illustrations=[...new Set([c.splash,...(c.splashFallbacks||[])].filter(Boolean).map(safe).filter(Boolean))];
  const sources=[...illustrations,...[c.dossierPortrait,c.portrait].filter(Boolean).map(safe).filter(Boolean)];
  const setSource=index=>{side.classList.toggle('is-portrait',index>=illustrations.length);return sources[index];};
  if(sources.length){
   const art=new Image();art.alt='';art.decoding='async';
   let i=0;
   art.onerror=()=>{if(++i<sources.length)art.src=setSource(i);else art.remove();};
   art.src=setSource(0);side.append(art);
  }
  stage.append(side);
 }
 if(!stage.isConnected)g.duoDialog.prepend(stage);
 content.innerHTML='<div class="relations-paper"><header class="relations-pair-heading"><div class="relations-pair-portraits">'+'<span class="relations-pair-name">'+esc(ca.name)+'</span>'+portrait(g,ca)+portrait(g,cb)+'<span class="relations-pair-name">'+esc(cb.name)+'</span>'+'</div><h2>'+esc(ca.name)+' <span>&</span> '+esc(cb.name)+'</h2><p>'+rank.diamonds+' · '+esc(relationship||rank.label)+'</p><small>'+new Set(stories.map(p=>p.quest).filter(Boolean)).size+' quêtes documentées · '+proofs.length+' preuves'+(g.teamIds.has(a)||g.teamIds.has(b)?' · Dans mon équipe':'')+'</small><section class="relations-strength" aria-label="Proximité documentée"><div><span>Proximité documentée</span><b>'+profile.rank+' / 5 · '+esc(profile.label)+'</b></div><div class="relations-strength-meter" role="progressbar" aria-label="Niveau des preuves relationnelles" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+profile.rank+'">'+Array.from({length:5},(_,i)=>'<i class="'+(i<profile.rank?'is-filled':'')+'" aria-hidden="true"></i>').join('')+'</div><small>'+esc(profile.details)+' · Niveau de preuve, pas mesure canonique de l’affection.</small></section></header>'+
 (!edge&&existingPath?'<section class="relations-reading-path"><h3>Chemin le plus court · '+(g.path.length-1)+' liens</h3><p>Itinéraire '+(g.pathIndex+1)+' sur '+g.paths.length+' · Choisis une étape pour explorer les liens attestés.</p>'+nextPathButton+existingPath+'</section>':'')+
 (hiddenStory?'<p class="relations-hidden-story">Des preuves d’histoire sont masquées. <button type="button" data-rel-action="revealStory">Afficher les spoilers</button></p>':'')+
 '<nav class="relations-reading-tabs" role="tablist">'+[['a',ca.name+' à propos de '+cb.name],['b',cb.name+' à propos de '+ca.name],['profile','Profil']].map(([id,label])=>'<button role="tab" data-reading="duotab" data-tab="'+id+'" aria-selected="'+(g.duoDialog.dataset.tab===id)+'">'+esc(label)+'</button>').join('')+'</nav>'+
 '<div class="relations-reading-columns"><section data-reading-panel="a"><h3>'+esc(ca.name)+' à propos de '+esc(cb.name)+'</h3>'+(voices[0].map(show).join('')||empty)+'</section><section data-reading-panel="b"><h3>'+esc(cb.name)+' à propos de '+esc(ca.name)+'</h3>'+(voices[1].map(show).join('')||empty)+'</section></div>'+
 '<section data-reading-panel="profile"><h3>Profil d’une relation</h3><div class="relations-profile-columns">'+[['Ce qu’ils disent dans l’histoire',stories.filter(p=>!p.action&&!p.thirdParty)],['Ce qu’ils ont fait',stories.filter(p=>p.action)],['Ce que disent les autres',stories.filter(p=>p.thirdParty)]].map(([title,list])=>'<section><h4>'+title+'</h4>'+(list.slice(0,3).map(show).join('')||'<p>Aucune preuve explicitement classée dans cette catégorie.</p>')+'</section>').join('')+'</div>'+
 (!edge&&!existingPath?'<p>Aucun chemin attesté avec les filtres actuels.</p>':'')+'<h3>Mentions et scènes dans le lore</h3>'+indices+'</section>'+
 '<div class="relations-conversation-controls"><button data-reading="conversation">Les écouter comme une conversation</button><button data-reading="pause">Pause</button></div><div class="relations-conversation" aria-live="polite"></div><footer><button data-reading="previous">← Paire précédente</button><button data-reading="next">Autre paire →</button></footer></div>';
 content.querySelector('.relations-next-path')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();g.action('nextPath');});
 g.readingVoices=voices;
 const shared=sharedVoiceTargets(g.visibleEdges,a,b);
 if(shared.length){
  const section=document.createElement('section');
  section.className='relations-shared';
  section.innerHTML='<h3>Ils parlent tous les deux de</h3>'+shared.map(id=>'<button type="button" data-rel-focus="'+esc(id)+'">'+portrait(g,g.characters.get(id))+esc(g.characters.get(id)?.name||id)+'</button>').join('');
  content.querySelector('.relations-conversation-controls').before(section);
 }
 const lorePanel=content.querySelector('[data-reading-panel="profile"]');
 if(stories.length){
  const label=document.createElement('label');
  label.className='relations-lore-search';
  label.textContent='Rechercher dans les preuves du lore';
  const input=document.createElement('input');
  input.type='search';input.placeholder='Quête, personnage, extrait…';
  label.append(input);lorePanel.prepend(label);
  const status=document.createElement('p');status.setAttribute('role','status');label.after(status);
  input.addEventListener('input',()=>{
   const query=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
   let found=0;
   for(const group of lorePanel.querySelectorAll('.relations-evidence-group')){
    let visible=0;
    for(const entry of group.querySelectorAll('.relations-quest-entry')){
     const matches=entry.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query);
     entry.hidden=!matches;
     if(matches)visible++;
     entry.open=!!query&&matches;
    }
    group.hidden=!visible;group.open=!!query&&!!visible;found+=visible;
   }
   status.textContent=query?found+' entrée(s) trouvée(s)':'';
  });
 }
 content.querySelectorAll('.relations-reading-path [data-rel-select]').forEach(button=>{button.dataset.relFocus=button.dataset.relSelect;delete button.dataset.relSelect;});
 const songs=proofs.filter(p=>p.song?.source&&p.song?.credit&&Array.isArray(p.song?.lines));
 for(const proof of songs){
  const song=proof.song;
  // Lyrics are optional attributed excerpts capped at ten words; never synthesize them.
  let remaining=10;const lines=[];
  for(const line of song.lines){const words=String(line.text||'').split(/\s+/).filter(Boolean).slice(0,remaining);remaining-=words.length;if(words.length)lines.push({...line,text:words.join(' ')});if(!remaining)break;}
  const block=document.createElement('section');block.className='relations-song';
  block.innerHTML='<h3>Une chanson pour…</h3>'+lines.map(line=>'<p data-song-time="'+Number(line.time||0)+'">'+esc(line.text)+'</p>').join('')+'<small>'+esc(song.credit)+'</small><a target="_blank" rel="noopener" href="'+esc(safe(song.source))+'">Chanson complète</a>';
  if(song.audio&&safe(song.audio)){const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.src=safe(song.audio);audio.ontimeupdate=()=>block.querySelectorAll('[data-song-time]').forEach((line,i,all)=>line.classList.toggle('active',audio.currentTime>=Number(line.dataset.songTime)&&(i===all.length-1||audio.currentTime<Number(all[i+1].dataset.songTime))));block.append(audio);}
  content.querySelector('.relations-paper').append(block);
 }

 g.duoDialog.querySelectorAll('audio').forEach(audio=>audio.volume=Math.max(0,Math.min(100,Number(g.settings.volume??70)))/100);
}
function nextPair(g,step){
 const edges=g.visibleEdges.filter(e=>e.proofs.length>1);if(!edges.length)return;
 const index=edges.findIndex(e=>g.selected.includes(e.a)&&g.selected.includes(e.b));
 const edge=edges[(index+step+edges.length)%edges.length];
 g.selected=[edge.a,edge.b];g.dismissedDuo='';g.update();
}
function conversation(g){
 g.readingAudio?.pause();const token=g.readingToken=(g.readingToken||0)+1;g.readingPaused=false;
 const sides=g.readingVoices||[[],[]],rows=[];
 for(let i=0;i<Math.max(...sides.map(x=>x.length));i++)for(const side of sides)if(side[i])rows.push(side[i]);
 const host=g.querySelector('.relations-conversation');host.innerHTML='';
 if(!rows.length){host.textContent='Aucune réplique vocale disponible pour cette paire.';return;}
 let index=0;
 g.readNext=()=>{
  if(token!==g.readingToken||g.readingPaused||!g.duoDialog.open)return;
  if(index>=rows.length)return;
  const p=rows[index++],bubble=document.createElement('div');bubble.className='relations-bubble';
  bubble.innerHTML='<b>'+esc(g.characters.get(p.from)?.name)+'</b><p>'+esc(p.quote)+'</p><a target="_blank" rel="noopener" href="'+esc(safe(p.source))+'">Source</a>';host.append(bubble);
  const voice=p.audioByLanguage?.[g.settings.voiceLang]||(g.settings.voiceLang==='en'?p.audio:null);
  const fallback=()=>{
   if(token!==g.readingToken||!bubble.isConnected||bubble.querySelector('button'))return;
   bubble.insertAdjacentHTML('beforeend','<small>Lecture audio indisponible.</small>');
   const next=document.createElement('button');next.textContent='Réplique suivante';
   next.onclick=()=>{next.remove();g.readNext();};bubble.append(next);
  };
  if(voice&&safe(voice)){
   const audio=new Audio(safe(voice));
   audio.volume=Math.max(0,Math.min(100,Number(g.settings.volume??70)))/100;
   g.readingAudio=audio;audio.onended=g.readNext;audio.onerror=fallback;
   audio.play().catch(fallback);
  }
  else{bubble.insertAdjacentHTML('beforeend','<small>Audio indisponible dans la langue choisie.</small>');const next=document.createElement('button');next.textContent='Réplique suivante';next.onclick=()=>{next.remove();g.readNext();};bubble.append(next);}
 };
 g.readNext();
 if(stickyUtilityView==='sources')showSources(g);
}
function showSources(g){
 const rows=sourceRows(g),groups=summarizeRelationSources(rows),sources=[...new Set(rows.map(p=>p.source).filter(Boolean))];
 const cards=groups.map((group,index)=>'<article class="relations-source-card"><div><b>'+esc(group.host)+'</b><span>'+esc(group.dataset)+'</span></div><strong>'+group.total.toLocaleString('fr-FR')+'</strong><small>'+group.story+' lore · '+group.voice+' voix · '+(group.languages.join(', ')||'langue non précisée')+'</small><details data-source-group="'+index+'"><summary>'+group.urls.length+' lien(s) source</summary><div data-source-links></div></details></article>').join('');
 const reference=referenceAuditSnapshot(),count=reference.counts;
 const referenceCard='<section class="relations-reference-audit"><div><span class="relations-kicker">COMPARAISON · SITE DE RÉFÉRENCE</span><a href="'+esc(reference.url)+'" target="_blank" rel="noopener noreferrer">Ties CatForest · vérifié le '+esc(reference.checkedAt)+'</a></div><div class="relations-reference-counts"><b data-reference-stat="storyLines">'+count.storyLines.toLocaleString('fr-FR')+'<small>passages d’histoire annoncés</small></b><b data-reference-stat="voiceLines">'+count.voiceLines.toLocaleString('fr-FR')+'<small>lignes vocales annoncées</small></b><b data-reference-stat="quests">'+count.quests.toLocaleString('fr-FR')+'<small>quêtes · '+count.playableCharacters+' personnages jouables</small></b><b data-reference-stat="originalReferences">'+count.originalReferences.toLocaleString('fr-FR')+'<small>références d’origine annoncées</small></b></div><p>La page annonce <strong>233 308</strong> passages d’histoire; les lignes vocales sont comptées séparément. Son graphe est livré dans une ressource JavaScript; les récits sont chargés en JSON public, personnage et langue par personnage. Aucun export global ni API de téléchargement documentée n’a été trouvé. Ces chiffres ne sont pas ajoutés au corpus Astralis.</p><a class="relations-reference-sample" href="'+esc(reference.delivery.sample)+'" target="_blank" rel="noopener noreferrer">Voir un JSON public d’exemple ↗</a></section>';
 open(g,'<h2>Sources & audit du corpus</h2><p>Les preuves Astralis et les compteurs de la référence restent séparés. Les chiffres locaux sont calculés depuis les extraits réellement chargés; chaque extrait conserve sa langue et sa source consultable.</p>'+referenceCard+'<div class="relations-source-audit-summary"><b>'+rows.length.toLocaleString('fr-FR')+' preuves indexées dans Astralis</b><span>'+sources.length.toLocaleString('fr-FR')+' URL d’origine</span><button type="button" data-source-export>Exporter l’inventaire JSON</button></div><div class="relations-source-audit-grid">'+cards+'</div>');
 const grid=g.utility.querySelector('.relations-source-audit-grid');
 grid.addEventListener('toggle',event=>{const details=event.target.closest('details[data-source-group]');if(!details?.open||details.dataset.loaded)return;const group=groups[Number(details.dataset.sourceGroup)];details.querySelector('[data-source-links]').innerHTML=(group?.urls||[]).map(url=>'<a href="'+esc(safe(url))+'" target="_blank" rel="noopener">'+esc(url)+'</a>').join('');details.dataset.loaded='true';},true);
 g.utility.querySelector('[data-source-export]').onclick=()=>{const blob=new Blob([JSON.stringify({generatedAt:new Date().toISOString(),evidenceCount:rows.length,sourceUrlCount:sources.length,reference:referenceAuditSnapshot(),groups:groups.map(group=>({...group,languages:group.languages,urls:group.urls}))},null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='astralis-audit-sources-relations.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1500);};
}
async function showShare(g){
 await g.action('share');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=700;g.draw(canvas,true);
 open(g,'<h2>Partager cette vue</h2><div data-share-preview></div><label>Lien exact<input readonly value="'+esc(location.href)+'"></label><button data-copy-view>Copier le lien</button><button data-native-share>Partager…</button><p data-share-status></p>');
 g.utility.querySelector('[data-share-preview]').append(canvas);
 g.utility.querySelector('[data-copy-view]').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);g.utility.querySelector('[data-share-status]').textContent='Lien copié.';}catch{g.utility.querySelector('input').select();}};
 g.utility.querySelector('[data-native-share]').onclick=async()=>{if(navigator.share)try{await navigator.share({title:'Astralis · Relations',url:location.href});}catch{}else g.utility.querySelector('[data-share-status]').textContent='Partage système indisponible ; utilise Copier le lien.';};
}
export function showReport(g){
 open(g,'<h2>Signaler une erreur ou proposer une idée</h2><form data-report-form><label>Type<select name="kind"><option>Erreur de donnée</option><option>Demande de fonctionnalité</option></select></label><label>Description<textarea name="description" required minlength="5" rows="5"></textarea></label><button>Enregistrer localement</button></form><div data-report-result></div>');
 g.utility.querySelector('form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target),report={id:crypto.randomUUID(),date:new Date().toISOString(),kind:data.get('kind'),description:data.get('description'),characters:g.selected,url:location.href};
 let saved=[];try{saved=JSON.parse(localStorage.getItem('astralis:relation-reports')||'[]');}catch{}saved.push(report);localStorage.setItem('astralis:relation-reports',JSON.stringify(saved));
 const text=JSON.stringify(report,null,2);g.utility.querySelector('[data-report-result]').innerHTML='<p>Signalement enregistré sur cet appareil.</p><a href="mailto:?subject='+encodeURIComponent('Astralis · '+report.kind)+'&body='+encodeURIComponent(text)+'">Préparer un e-mail</a><button data-copy-report>Copier pour une issue GitHub</button>';
 g.utility.querySelector('[data-copy-report]').onclick=()=>navigator.clipboard.writeText(text);};
}
