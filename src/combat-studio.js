import {STAT_NAMES,SLOTS,copy,num,artifactAudit,goalGaps,compareStats,weightedScore,critBalance,energyBudget,sharedPieces,swapPiece,validateBuildImport,overlap,teamReadiness,expandedRotation,rotationTimeline,cooldownSchedule,trialSummary,hitEstimate,critDistribution,resultDiff,safeScenario} from './combat-studio-model.js';
import {enhanceCombatLayout} from './combat-layout.js?v=20261126-reading-studio-2';
import {mountTeamEnergy} from './team-energy-view.js?v=20261126-reading-studio-2';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v==null?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:2});
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback;}catch{return fallback;}};
const id=()=>globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2);
const buildKey='astralis:gi:builds';
const field=(name,label,value='',type='number',extra='')=>`<label>${esc(label)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const area=(name,label,value='')=>`<label class="cs-wide">${esc(label)}<textarea name="${esc(name)}" rows="3">${esc(value)}</textarea></label>`;
const select=(name,label,rows,value='')=>`<label>${esc(label)}<select name="${esc(name)}">${rows.map(([key,label])=>`<option value="${esc(key)}" ${String(key)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
const table=(heads,rows)=>`<div class="cs-table-scroll"><table><thead><tr>${heads.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const notice=t=>`<p class="cs-notice">${esc(t)}</p>`;
const tiles=rows=>`<div class="cs-metrics">${rows.map(([label,value])=>`<div><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('')}</div>`;
function plot(rows){if(rows.length<2)return '';const minX=Math.min(...rows.map(r=>r[0])),maxX=Math.max(...rows.map(r=>r[0])),maxY=Math.max(1,...rows.map(r=>r[1])),points=rows.map(([x,y])=>({x:35+(x-minX)/(maxX-minX||1)*360,y:150-y/maxY*115,value:y,label:x}));return `<figure class="cs-plot"><figcaption>Dégâts selon le paramètre testé</figcaption><svg viewBox="0 0 430 190" role="img" aria-label="Courbe des dégâts ; les valeurs exactes figurent dans le tableau"><path class="cs-plot-grid" d="M35 35H400M35 92H400M35 150H400"/><polyline points="${points.map(p=>p.x+','+p.y).join(' ')}"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4"><title>${esc(p.label)} : ${esc(fmt(p.value))} dégâts</title></circle>`).join('')}<text x="35" y="178">${esc(minX)}</text><text x="385" y="178">${esc(maxX)}</text><text x="35" y="23">${esc(fmt(maxY))} DGT</text></svg></figure>`;}
const definitions={
 builds:[
  ['progress','Objectifs de statistiques','Fixe plusieurs seuils et mesure ce qu’il reste à obtenir.','Enregistrer les objectifs'],
  ['progress','Priorités d’amélioration','Choisis les pièces à travailler et envoie les actions au planificateur.','Créer les tâches'],
  ['progress','Pièces réservées','Protège les pièces que tu souhaites conserver lors des échanges ici.','Enregistrer les réservations'],
  ['progress','Budget d’évolution','Prépare ton budget de Mora et d’EXP avec tes propres montants.','Enregistrer le budget'],
  ['progress','Checklist de finition','Suis les niveaux, talents et équipements à terminer.','Enregistrer la checklist'],
  ['analysis','Contrôle des cinq artéfacts','Repère les données manquantes et calcule la valeur CRIT des sous-stats.','Examiner les pièces'],
  ['analysis','Comparaison chiffrée','Compare les statistiques finales de deux builds enregistrés.','Comparer les builds'],
  ['analysis','Équilibre CRIT','Mesure le multiplicateur moyen et la répartition optimale à budget constant.','Étudier le CRIT'],
  ['analysis','Score personnalisé','Définis tes coefficients pour comparer une stat à une autre.','Calculer le score'],
  ['analysis','Besoin de recharge','Estime la recharge requise à partir du coût et de l’énergie reçue.','Calculer la recharge'],
  ['equipment','Échange de pièce','Prévisualise les deux pièces, puis échange-les entre deux builds.','Prévisualiser l’échange'],
  ['equipment','Conflits d’artéfacts','Détecte les pièces portant le même identifiant dans plusieurs builds.','Chercher les conflits'],
  ['equipment','Variante indépendante','Crée un build distinct pour tester une autre configuration.','Créer la variante'],
  ['equipment','Associer à une équipe','Équipe ce build sur un membre compatible d’une équipe sauvegardée.','Associer le build'],
  ['equipment','Tester au laboratoire','Ouvre ce build comme point de départ du laboratoire.','Ouvrir le laboratoire'],
  ['journal','Point de restauration','Capture le build complet avant une modification et restaure-le au besoin.','Créer un point'],
  ['journal','Carnet du build','Conserve les hypothèses et les décisions propres à cette configuration.','Enregistrer le carnet'],
  ['journal','Archivage réversible','Marque une ancienne version comme archivée tout en la conservant.','Archiver / réactiver'],
  ['journal','Exporter un build','Télécharge une copie JSON complète de ce build.','Exporter le JSON'],
  ['journal','Importer une variante','Ajoute une copie indépendante depuis un fichier de build validé.','Importer le fichier']
 ],
 teams:[
  ['planning','Variante d’équipe','Duplique la composition, les builds et la rotation pour préparer un autre combat.','Créer la variante'],
  ['planning','Banc de remplacement','Enregistre un remplaçant et permute-le avec un membre de l’équipe.','Enregistrer le remplaçant'],
  ['planning','Ordre de déploiement','Déplace un personnage avec son build et son rôle.','Appliquer le déplacement'],
  ['planning','Association des builds','Choisis un build compatible pour chaque membre en une seule fois.','Enregistrer les builds'],
  ['planning','Objectif de combat','Prépare une cible, un temps visé et une consigne de jeu.','Enregistrer l’objectif'],
  ['analysis','Deux équipes simultanées','Détecte les personnages communs entre deux compositions.','Vérifier la paire'],
  ['analysis','Équipement partagé','Repère les mêmes artéfacts dans les builds des deux escouades.','Vérifier les artéfacts'],
  ['analysis','Contrôle de préparation','Repère les emplacements, rôles, armes et builds à renseigner.','Analyser la préparation'],
  ['analysis','Plan d’énergie','Estime le seuil de recharge de chacun à partir de ton cycle.','Évaluer les besoins'],
  ['analysis','Fenêtres de compétences','Place les retours de compétence et leurs durées sur une ligne de temps.','Construire les fenêtres'],
  ['rotation','Chronologie détaillée','Attribue une durée à chaque action et déroule les répétitions de combos.','Tracer la chronologie'],
  ['rotation','Ouverture alternative','Déplace le début de la rotation sur une étape choisie.','Prévisualiser l’ouverture'],
  ['rotation','Script de répétition','Exporte la séquence complète avec les combos déjà déroulés.','Télécharger le script'],
  ['rotation','Carte de consignes','Prépare une fiche concise avec les consignes de chaque rôle.','Enregistrer les consignes'],
  ['rotation','Répétition chronométrée','Lance un chronomètre local pour mesurer ton exécution.','Démarrer le chronomètre'],
  ['journal','Historique des essais','Enregistre un temps, la réussite et une note pour suivre ta régularité.','Enregistrer cet essai'],
  ['journal','Tâches de préparation','Transforme les points manquants de l’équipe en tâches à accomplir.','Créer les tâches'],
  ['journal','Plan de match','Conserve les priorités, la survie et les variantes du combat.','Enregistrer le plan'],
  ['journal','Sauvegarde d’escouade','Crée un point complet puis restaure-le après des essais.','Créer un point'],
  ['journal','Export d’équipe portable','Télécharge la composition, les builds liés et la rotation.','Exporter l’équipe']
 ],
 lab:[
  ['experiments','Mesure enregistrée','Calcule le scénario courant et garde le résultat avec son contexte.','Enregistrer une mesure'],
  ['experiments','Scénarios nommés','Sauvegarde tous les paramètres puis recharge un scénario choisi.','Sauvegarder le scénario'],
  ['experiments','Référence A / B','Fige une mesure de référence et chiffre le gain de la configuration actuelle.','Fixer la référence'],
  ['experiments','Duel de scénarios','Recalcule deux scénarios sauvegardés avec le même moteur.','Comparer les scénarios'],
  ['experiments','Journal d’expériences','Ajoute une conclusion et des hypothèses aux essais enregistrés.','Enregistrer les notes'],
  ['sweeps','Niveaux ennemis','Mesure les dégâts pour plusieurs niveaux de cible.','Lancer la série'],
  ['sweeps','Courbe de résistance','Observe la variation pour cinq résistances ennemies.','Lancer la série'],
  ['sweeps','Nombre de coups','Compare plusieurs nombres de coups pour la même attaque.','Lancer la série'],
  ['sweeps','Baisse de DÉF','Mesure une série de réductions de défense.','Lancer la série'],
  ['sweeps','Raffinements d’arme','Compare R1 à R5 avec l’arme et les conditions actuelles.','Lancer la série'],
  ['mechanics','Trois modes CRIT','Calcule les dégâts sans CRIT, avec CRIT et en moyenne.','Calculer les trois modes'],
  ['mechanics','Contribution des alliés','Recalcule une copie du scénario sans alliés et mesure la différence.','Mesurer les alliés'],
  ['mechanics','Contribution des bonus saisis','Compare avec et sans les bonus personnalisés du scénario.','Mesurer les bonus'],
  ['mechanics','Dispersion CRIT','Calcule la moyenne et l’écart-type d’un coup, sans réaction transformatrice.','Étudier la dispersion'],
  ['mechanics','Lecture de la formule','Affiche les facteurs réellement retournés par le moteur de calcul.','Décomposer le résultat'],
  ['targets','Coups pour vaincre','Estime les coups et le temps requis selon les PV et ta cadence.','Estimer le combat'],
  ['targets','Projection multicible','Projette le total si chaque cible reçoit les mêmes dégâts indépendants.','Calculer la projection'],
  ['targets','Disponibilité d’un buff','Pondère les résultats avec et sans alliés selon la disponibilité saisie.','Calculer la moyenne pondérée'],
  ['targets','Exporter les mesures','Télécharge le journal des mesures en CSV pour ton tableur.','Exporter le CSV'],
  ['targets','Échanger un scénario','Exporte ou importe les paramètres complets dans un fichier JSON.','Exporter le scénario']
 ]
};
const pages={builds:{title:'Mes builds',tag:'ATELIER D’ÉQUIPEMENT',intro:'Construis, compare et fais évoluer tes configurations.',groups:[['progress','Progression'],['analysis','Analyse'],['equipment','Équipement'],['journal','Carnet']]},teams:{title:'Mes équipes',tag:'SALLE DES TACTIQUES',intro:'Quatre personnages, un plan de jeu qui tient ensemble.',groups:[['planning','Composition'],['analysis','Synergies'],['rotation','Exécution'],['journal','Suivi']]},lab:{title:'Laboratoire de dégâts',tag:'BANC D’ESSAI',intro:'Pose une hypothèse. Mesure son effet. Garde ce qui fonctionne.',groups:[['experiments','Expériences'],['sweeps','Séries de tests'],['mechanics','Mécaniques'],['targets','Projections']]}};
export const COMBAT_FEATURES=definitions;

function download(name,data,type='application/json'){const blob=new Blob([type==='application/json'?JSON.stringify(data,null,2):data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
export function mountCombatStudio(host,context){
  const page=context.section;if(!pages[page]||!host||host.querySelector(':scope > .combat-studio'))return;
  const native=host.querySelector(page==='teams'?'.teams-studio':page==='builds'?'.builds-hub':'[data-damage-lab]');if(!native)return;
  if(!document.querySelector('[data-combat-studio-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/styles/combat-studio.css?v=20261125-combat-2';link.dataset.combatStudioStyle='';document.head.append(link);}
  if(!document.querySelector('[data-combat-visual-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/styles/combat-visual.css?v=20261126-reading-studio-2';link.dataset.combatVisualStyle='';document.head.append(link);}
  if(!document.querySelector('[data-combat-practical-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/styles/combat-practical.css?v=20261126-reading-studio-2';link.dataset.combatPracticalStyle='';document.head.append(link);}
  const game=page==='teams'?context.game:'gi',key=`astralis:${game}:combat-studio:${page}:v1`,saved=read(key,{tab:'workspace',selected:'',records:{}}),config={...pages[page],groups:page==='teams'&&context.game==='gi'?[['energy','Recharge']]:[]};
  if(!['workspace',...config.groups.map(g=>g[0])].includes(saved.tab))saved.tab='workspace';
  const studio=document.createElement('section');studio.className='combat-studio combat-visual cs-'+page;studio.dataset.game=game;
  const groupIcons={energy:'bolt',workspace:'grid',progress:'target',analysis:'sliders',equipment:'sword',journal:'notebook',planning:'users',rotation:'refresh',experiments:'database',sweeps:'sliders',mechanics:'hex',targets:'target'};
  studio.innerHTML=`<header class="cs-hero"><div class="cs-hero-copy"><div class="cs-hero-breadcrumb">${context.icon(game)}<span>ASTRALIS</span><i></i><span>${config.tag}</span></div><h1>${config.title}</h1><p>${config.intro}</p><div class="cs-hero-caption"><span>20 outils de préparation</span><span>Ton espace personnel</span></div></div><div class="cs-hero-side"><div class="cs-hero-art" data-cs-hero-art aria-hidden="true"></div>${page==='teams'?'<button type="button" class="cs-primary" data-action="new-team">Créer une équipe</button>':page==='builds'?'<button type="button" class="cs-primary" data-action="build-new">Nouveau build</button>':''}</div></header><nav class="cs-nav" aria-label="Outils de ${config.title}">${[['workspace',page==='lab'?'Simulation':'Atelier'],...config.groups].map(([k,label])=>`<button type="button" data-cs-tab="${k}">${context.icon(groupIcons[k]||'layers')}<span>${esc(label)}</span></button>`).join('')}</nav><div class="cs-native"></div><div class="cs-tools" hidden></div><p class="cs-status" role="status" aria-live="polite"></p>`;
  host.insertBefore(studio,native);studio.querySelector('.cs-native').append(native);
  enhanceCombatLayout(native,page);
  const buildRows=()=>page==='teams'&&game!=='gi'?(context.builds?.()||[]):read(buildKey,[]);
  const list=()=>page==='teams'?context.teams():page==='builds'?buildRows():[{id:'current',name:'Scénario courant'}];
  const selection=()=>{const rows=list();return rows.find(x=>String(x.id)===String(saved.selected))||rows[0];};
  if(page==='builds'&&saved.tab==='workspace'){const active=native.querySelector('[data-build-id]')?.dataset.buildId;if(active)saved.selected=active;}
  if(page==='teams'&&saved.tab==='workspace'){const active=native.querySelector('[data-team-id]')?.dataset.teamId;if(active)saved.selected=active;}
  saved.selected=String(selection()?.id||'');
  const store=()=>localStorage.setItem(key,JSON.stringify(saved));
  const meta=()=>{const k=selection()?.id||'empty';saved.records||={};return saved.records[k]||={forms:{},scenarios:[],trials:[],measures:[]};};
  const values=i=>meta().forms?.[i]||{};
  const nameOf=id=>context.character(id)?.name||String(id||'Libre');
  function updateHero(){
    const record=selection(),ids=page==='teams'?(record?.members||[]).map(m=>m.character):[page==='lab'?context.lab?.read()?.character:record?.character];
    const people=ids.filter(Boolean).map(id=>context.character(id)).filter(c=>c?.portrait).slice(0,3);
    const art=studio.querySelector('[data-cs-hero-art]');
    art.innerHTML=people.length?people.map((c,i)=>`<span class="cs-portrait-frame" style="--portrait-order:${i}"><img src="${esc(c.portrait)}" alt="" loading="eager" onerror="this.parentElement.hidden=true"></span>`).join(''):`<span class="cs-hero-monogram">${context.icon(page==='teams'?'users':page==='builds'?'layers':'target')}</span>`;
    art.classList.toggle('has-portraits',people.length>0);
  }
  const buildOptions=()=>buildRows().map(b=>[b.id,b.name||nameOf(b.character)]);
  const teamOptions=()=>context.teams().map(t=>[t.id,t.name||'Équipe']);
  const memberOptions=()=>Array.from({length:4},(_,i)=>[i,`${i+1} · ${nameOf(selection()?.members?.[i]?.character)}`]);
  const check=(name,label,on)=>`<label class="cs-check"><input type="checkbox" name="${esc(name)}" ${on?'checked':''}>${esc(label)}</label>`;
  const tools=studio.querySelector('.cs-tools'),status=studio.querySelector('.cs-status');
  let timer=null,started=0,running=false,needsReload=false;
  const report=t=>{status.textContent=t;};
  function persistBuilds(next){meta().undoBuilds=read(buildKey,[]);store();localStorage.setItem(buildKey,JSON.stringify(next));needsReload=true;}
  function persistTeam(team){meta().undoTeam=copy(context.teams().find(t=>t.id===team.id));store();context.saveTeam(team);needsReload=true;}
  const requireRecord=()=>{const record=selection();if(!record)throw Error('Crée ou importe un élément dans l’atelier pour utiliser cet outil.');return record;};
  const stats=b=>context.buildStats?.(b)||{};
  const scenarios=()=>meta().scenarios||[];
  function inputPanel(i){const v=values(i),record=selection()||{},m=meta(),members=record.members||[],bopts=buildOptions(),sopts=scenarios().map(s=>[s.id,s.name]);
    if(page==='builds')switch(i){
      case 0:return Object.entries(STAT_NAMES).map(([k,l])=>field(k,l,v[k]??'', 'number','min="0" step="any"')).join('');
      case 1:return SLOTS.map((s,n)=>check('slot'+n,s,v['slot'+n])).join('')+field('due','À faire avant',v.due,'date');
      case 2:return SLOTS.map((s,n)=>check('slot'+n,s+' · conserver',v['slot'+n])).join('');
      case 3:return field('mora','Mora nécessaires',v.mora,'number','min="0"')+field('owned','Mora disponibles',v.owned,'number','min="0"')+field('xp','Livres d’EXP nécessaires',v.xp,'number','min="0"')+field('books','Livres disponibles',v.books,'number','min="0"');
      case 4:return ['Personnage au niveau visé','Arme au niveau visé','Talents au niveau visé','Cinq pièces vérifiées','Conditions du set vérifiées'].map((t,n)=>check('todo'+n,t,v['todo'+n])).join('');
      case 5:case 11:return notice(i===5?'La valeur CRIT additionne 2 × TC et DGT CRIT des sous-stats, sans juger les besoins du personnage.':'Seuls les identifiants des pièces sont utilisés. Une pièce sans identifiant ne peut pas être reconnue de façon fiable.');
      case 6:return select('other','Comparer avec',bopts,v.other);
      case 7:return notice('Budget constant : 1 point de taux CRIT équivaut à 2 points de DGT CRIT. Le taux utile est plafonné à 100 %.');
      case 8:return Object.entries(STAT_NAMES).map(([k,l])=>field(k,'Poids · '+l,v[k]??(k==='critRate'?2:k==='critDmg'?1:0),'number','step="any"')).join('');
      case 9:return field('cost','Coût du déchaînement',v.cost??60)+field('flat','Énergie fixe rendue',v.flat??0)+field('base','Énergie reçue à 100 % de recharge',v.base??30);
      case 10:return select('other','Autre build',bopts,v.other)+select('slot','Pièce à échanger',SLOTS.map((s,n)=>[n,s]),v.slot)+notice('Les pièces réservées sont bloquées. Un échange invalide la référence Enka et utilise le calcul théorique.');
      case 12:return field('name','Nom de la variante',v.name||((record.name||'Build')+' · variante'),'text');
      case 13:return select('team','Équipe',teamOptions(),v.team);
      case 14:case 17:case 18:return notice(i===17?(m.archived?'Ce build est archivé. Réactive-le ici.':'Ce build est actif. L’archivage ajoute un statut, sans supprimer le build.'):'Utilise le build enregistré. Enregistre tes modifications de l’atelier avant cette action.');
      case 15:return field('name','Nom du point',v.name||'Avant mes essais','text')+(m.snapshot?`<button type="button" data-cs-secondary="restore-build">Restaurer « ${esc(m.snapshot.name)} »</button>`:'');
      case 16:return area('notes','Notes privées',v.notes);
      case 19:return '<label class="cs-wide">Fichier de build<input name="file" type="file" accept="application/json,.json"></label>';
    }
    if(page==='teams')switch(i){
      case 0:return field('name','Nom de la variante',v.name||((record.name||'Équipe')+' · variante'),'text');
      case 1:return select('character','Personnage de réserve',context.characters().map(c=>[c.id,c.name]),v.character)+select('slot','Membre à remplacer',memberOptions(),v.slot)+(m.bench?notice('Réserve actuelle : '+nameOf(m.bench.character))+'<button type="button" data-cs-secondary="swap-bench">Permuter la réserve</button>':'');
      case 2:return select('from','Déplacer',memberOptions(),v.from)+select('to','Vers la place',memberOptions(),v.to);
      case 3:return members.map((slot,n)=>select('member'+n,nameOf(slot.character),[['','Sans build'],...buildRows().filter(b=>String(b.character)===String(slot.character)).map(b=>[b.id,b.name||'Build'])],v['member'+n]??slot.buildId)).join('');
      case 4:return field('target','Cible / défi',v.target,'text')+field('seconds','Temps visé (secondes)',v.seconds,'number','min="1"')+area('instructions','Consigne prioritaire',v.instructions);
      case 5:case 6:return select('other','Seconde escouade',teamOptions(),v.other);
      case 7:case 16:return notice('Le contrôle se base sur les associations enregistrées. Il ne suppose pas le niveau des talents ou la maîtrise du combat.');
      case 8:return members.map((m,n)=>`<fieldset><legend>${esc(nameOf(m.character))}</legend>${field('cost'+n,'Coût en énergie',v['cost'+n]??60)}${field('flat'+n,'Énergie fixe',v['flat'+n]??0)}${field('base'+n,'Énergie reçue à 100 %',v['base'+n]??30)}</fieldset>`).join('');
      case 9:return field('duration','Cycle observé (secondes)',v.duration??40)+members.map((m,n)=>`<fieldset><legend>${esc(nameOf(m.character))}</legend>${field('cd'+n,'Temps de recharge (s)',v['cd'+n]??15)}${field('up'+n,'Durée de l’effet (s)',v['up'+n]??8)}${field('start'+n,'Première utilisation (s)',v['start'+n]??n)}</fieldset>`).join('');
      case 10:return [...new Map((record.rotation||[]).filter(a=>!['comboStart','comboEnd'].includes(a.type)).map(a=>[a.key||a.id||a.code||a.name,a])).entries()].map(([k,a])=>field(k,a.name||a.code,v[k]??1,'number','min="0.1" step="0.1"')).join('')||notice('Ajoute des actions dans l’atelier.');
      case 11:return select('index','Commencer à l’étape',(record.rotation||[]).filter(a=>!['comboStart','comboEnd'].includes(a.type)).map((a,n)=>[n,`${n+1} · ${a.name||a.code}`]),v.index);
      case 12:return notice('Le fichier texte contient les actions et toutes les répétitions de combos.');
      case 13:return members.map((m,n)=>area('role'+n,nameOf(m.character)+' · consigne',v['role'+n])).join('');
      case 14:return '<output class="cs-stopwatch" data-cs-clock>00:00.0</output><button type="button" data-cs-secondary="stop-clock">Arrêter et garder le temps</button>';
      case 15:return field('seconds','Temps (secondes)',v.seconds??m.lastTime,'number','min="0.1" step="0.1"')+check('success','Combat réussi',v.success)+area('notes','Ce qui a changé',v.notes)+table(['Essai','Temps','Résultat'],(m.trials||[]).slice(-8).map((r,n)=>[n+1,fmt(r.seconds)+' s',r.success?'Réussi':'À reprendre']));
      case 17:return area('priorities','Priorités de cible',v.priorities)+area('survival','Survie / esquives / soin',v.survival)+area('variant','Plan si le cycle est interrompu',v.variant);
      case 18:return field('name','Nom du point',v.name||'Avant mes essais','text')+(m.snapshot?'<button type="button" data-cs-secondary="restore-team">Restaurer le point</button>':'');
      case 19:return notice('Inclut les builds enregistrés liés aux membres ; les données de tes autres équipes restent privées.');
    }
    if(page==='lab')switch(i){
      case 0:return field('label','Nom de la mesure',v.label||'Mesure '+((m.measures?.length||0)+1),'text')+table(['Mesure','Dégâts','Date'],(m.measures||[]).slice(-6).map(r=>[r.label,fmt(r.total),new Date(r.at).toLocaleString('fr-FR')]));
      case 1:return field('name','Nom du scénario',v.name||'Mon scénario','text')+select('scenario','Recharger',sopts,v.scenario)+(sopts.length?'<button type="button" data-cs-secondary="restore-scenario">Charger ce scénario</button>':'');
      case 2:return (m.baseline?tiles([['Référence',fmt(m.baseline.total)],['Date',new Date(m.baseline.at).toLocaleString('fr-FR')]])+'<button type="button" data-cs-secondary="compare-baseline">Comparer au scénario actuel</button>':notice('Fixe d’abord une mesure A. Modifie ensuite ton scénario pour mesurer B.'));
      case 3:return select('a','Scénario A',sopts,v.a)+select('b','Scénario B',sopts,v.b);
      case 4:return area('notes','Hypothèses et conclusions',v.notes);
      case 5:return field('values','Niveaux séparés par une virgule',v.values||'80,90,100,110,120','text');
      case 6:return field('values','Résistances (%) séparées par une virgule',v.values||'-20,0,10,30,50','text');
      case 7:return field('values','Nombres de coups',v.values||'1,2,3,5,10','text');
      case 8:return field('values','Réductions de DÉF (%)',v.values||'0,10,20,30,40','text');
      case 9:return notice('Seul le raffinement change. Les conditions d’activation et l’arme restent celles du scénario.');
      case 10:case 11:case 12:return notice('Le scénario principal reste intact ; chaque calcul porte sur une copie de ses paramètres.');
      case 13:return field('rate','Taux CRIT effectif du coup (%)',v.rate??50,'number','min="0" max="100"')+notice('Renseigne le taux effectif après buffs. L’écart-type est calculé pour un coup à deux issues CRIT / non-CRIT.');
      case 14:return notice('Les facteurs disponibles dépendent du moteur et de l’attaque. Une fiche sourcée peut ne pas exposer chaque intermédiaire.');
      case 15:return field('hp','PV de la cible',v.hp??1000000,'number','min="1"')+field('frequency','Coups identiques par seconde',v.frequency??1,'number','min="0.01" step="any"');
      case 16:return field('targets','Nombre de cibles identiques',v.targets??3,'number','min="1" max="100"')+notice('Projection sans partage de dégâts, limite de cibles, baisse de résistance supplémentaire ou scaling multicible.');
      case 17:return field('uptime','Disponibilité des buffs alliés (%)',v.uptime??70,'number','min="0" max="100"')+field('duration','Durée du cycle (s)',v.duration??20,'number','min="1"')+field('hits','Nombre de coups identiques dans ce cycle',v.hits??10,'number','min="1"');
      case 18:return notice((m.measures?.length||0)+' mesures disponibles pour le fichier CSV.');
      case 19:return '<label class="cs-wide">Importer un scénario<input name="file" type="file" accept="application/json,.json"></label><button type="button" data-cs-secondary="import-scenario">Importer et charger</button>';
    }
    return '';
  }
  function showTool(index){
    saved.toolByGroup||={};saved.toolByGroup[saved.tab]=index;store();
    tools.querySelectorAll('[data-cs-tool-panel]').forEach(el=>{const active=Number(el.dataset.csToolPanel)===index;el.hidden=!active;el.open=active;});
    tools.querySelectorAll('[data-cs-tool-target]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.csToolTarget)===index)));
  }
  function renderTools(){
    if(saved.tab==='energy'){tools.innerHTML='<p class="cs-notice">Préparation du calcul de recharge…</p>';mountTeamEnergy(tools,context);return;}
    const record=selection(),m=meta(),available=definitions[page].map((row,index)=>({row,index})).filter(({row,index})=>row[0]===saved.tab&&(record||page==='lab'||index===19));
    const selectedIndex=available.some(x=>x.index===saved.toolByGroup?.[saved.tab])?saved.toolByGroup[saved.tab]:available[0]?.index;
    const iconFor=i=>['target','tasks','shield','layers','check','sliders','layers','target','sliders','bolt','refresh','users','copy','notebook','play','database','tasks','notebook','download','upload'][i];
    tools.innerHTML=`<header class="cs-tool-context"><div><span class="cs-eyebrow">${esc(config.groups.find(g=>g[0]===saved.tab)?.[1]||'OUTILS')}</span><h2>${esc(page==='lab'?'Explorer une hypothèse':record?.name||'Sélectionne un dossier')}</h2><p>${page==='lab'?'Mesure, compare et conserve tes résultats.':'Ton dossier, tes objectifs et tes décisions réunis au même endroit.'}</p></div>${page==='lab'?'':select('record','Dossier actif',list().map(r=>[r.id,r.name||nameOf(r.character)]),record?.id)}</header>${available.length?`<div class="cs-tools-layout"><aside class="cs-tool-index"><span class="cs-index-label">DANS CET ESPACE</span><nav aria-label="Choisir un outil">${available.map(({row:[,title],index})=>`<button type="button" data-cs-tool-target="${index}" aria-controls="cs-tool-${page}-${index}" aria-pressed="${index===selectedIndex}">${context.icon(iconFor(index))}<span>${esc(title)}</span><i aria-hidden="true"></i></button>`).join('')}</nav><p>Les réglages et les notes sont conservés sur cet appareil.</p></aside><div class="cs-tool-grid">${available.map(({row:[,title,description,button],index})=>`<details class="cs-tool" id="cs-tool-${page}-${index}" data-cs-tool-panel="${index}" ${index===selectedIndex?'open':'hidden'}><summary tabindex="-1"><span>${context.icon(iconFor(index))}</span><div><small class="cs-eyebrow">${esc(config.groups.find(g=>g[0]===saved.tab)?.[1]||'OUTIL')}</small><h3>${title}</h3><p>${description}</p></div></summary><form data-cs-form="${index}"><div class="cs-fields">${inputPanel(index)}</div><div class="cs-tool-actions"><button class="cs-primary" type="submit">${button}</button></div><div class="cs-result" data-cs-result role="status" aria-live="polite"></div></form></details>`).join('')}</div></div>`:notice('Crée un build ou une équipe dans l’atelier pour commencer.')}<footer class="cs-tools-footer"><span>Enregistré sur cet appareil${m.archived?' · Build archivé':''}</span>${m.undoBuilds?'<button type="button" data-cs-secondary="undo-builds">Annuler la dernière modification de builds</button>':''}${m.undoTeam?'<button type="button" data-cs-secondary="undo-team">Annuler la dernière modification d’équipe</button>':''}</footer>`;
    updateHero();
  }
  function tab(value){saved.tab=['workspace',...config.groups.map(g=>g[0])].includes(value)?value:'workspace';store();if(saved.tab==='workspace'&&needsReload){context.reload();return;}studio.querySelector('.cs-native').hidden=saved.tab!=='workspace';tools.hidden=saved.tab==='workspace';studio.querySelectorAll('[data-cs-tab]').forEach(b=>{b.setAttribute('aria-current',b.dataset.csTab===saved.tab?'page':'false');});if(saved.tab!=='workspace')renderTools();}
  function saveForm(form){const i=Number(form.dataset.csForm),v={};for(const el of form.elements)if(el.name&&el.type!=='file')v[el.name]=el.type==='checkbox'?el.checked:el.value;meta().forms||={};meta().forms[i]=v;store();return v;}
  function statTable(a,b){return table(['Statistique','A','B','Variation'],compareStats(a,b).map(r=>[STAT_NAMES[r.key],fmt(r.a),fmt(r.b),r.delta==null?'—':(r.delta>0?'+':'')+fmt(r.delta)]));}
  async function measure(p){const result=await context.lab.evaluate(p);if(!result.ok||!Number.isFinite(result.total))throw Error(result.error||'Le moteur ne fournit pas de résultat pour ces paramètres.');return result;}
  const currentScenario=()=>copy(context.lab.read());
  async function run(i,v,form){const record=page==='builds'&&i===19?(selection()||{}):requireRecord(),m=meta(),builds=buildRows(),out=form.querySelector('[data-cs-result]');const done=t=>{out.innerHTML=notice(t);report(t);};
    if(page==='builds')switch(i){
      case 0:{const rows=goalGaps(stats(record),v);out.innerHTML=table(['Objectif','Actuel','Cible','À gagner'],rows.map(r=>[STAT_NAMES[r.key],fmt(r.value),fmt(r.target),fmt(r.gap)]));return;}
      case 1:{let count=0;SLOTS.forEach((s,n)=>{if(v['slot'+n]&&context.task({id:id(),title:`${record.name||nameOf(record.character)} · améliorer ${s}`,category:'Build',due:v.due||'',done:false,notes:'Créé depuis Mes builds'})!==false)count++;});done(count+' tâches ajoutées au planificateur.');return;}
      case 2:done('Réservations enregistrées. Les échanges de cet atelier les respectent.');return;
      case 3:out.innerHTML=tiles([['Mora à acquérir',fmt(Math.max(0,num(v.mora)-num(v.owned)))],['Livres à acquérir',fmt(Math.max(0,num(v.xp)-num(v.books)))]]);return;
      case 4:done(Object.values(v).filter(Boolean).length+' / 5 étapes terminées.');return;
      case 5:out.innerHTML=table(['Pièce','Niveau','Valeur CRIT','Contrôle'],artifactAudit(record).map(r=>[r.slot,r.level==null?'Non saisi':r.level,fmt(r.cv),r.issues.join(' · ')||'Données cohérentes']));return;
      case 6:{const b=builds.find(b=>b.id===v.other);if(!b||b.id===record.id)throw Error('Choisis un autre build.');out.innerHTML=statTable(stats(record),stats(b));return;}
      case 7:{const s=stats(record);if(s.critRate==null||s.critDmg==null)throw Error('Statistiques CRIT indisponibles.');const r=critBalance(s.critRate,s.critDmg);out.innerHTML=tiles([['Multiplicateur moyen','×'+fmt(r.current)],['Répartition théorique',fmt(r.idealRate)+' TC / '+fmt(r.idealDmg)+' DC'],['Taux au-delà de 100 %',fmt(r.wastedRate)+' %']])+notice('Ne tient pas compte des besoins de recharge ni des buffs conditionnels non saisis.');return;}
      case 8:{const score=weightedScore(stats(record),v);if(score==null)throw Error('Choisis au moins un poids et un build dont les statistiques sont disponibles.');out.innerHTML=tiles([['Score selon tes poids',fmt(score)]]);return;}
      case 9:{const r=energyBudget(v.cost,v.flat,v.base);if(r==null)throw Error('Renseigne un coût et une énergie reçue strictement positifs.');out.innerHTML=tiles([['Recharge estimée',fmt(r)+' %']])+notice('L’énergie fixe ne profite pas de la recharge. Les particules saisies sont déjà converties en énergie de base.');return;}
      case 10:{const b=builds.find(b=>b.id===v.other),n=Number(v.slot);if(!b)throw Error('Choisis le second build.');if(values(2)['slot'+n]||saved.records[b.id]?.forms?.[2]?.['slot'+n])throw Error('Cette pièce est réservée.');const [a1,b1]=swapPiece(record,b,n);out.innerHTML=statTable(stats(record),stats(a1))+notice('A : '+(record.name||'Build')+' · B : '+(b.name||'Build'))+table(['Build','Avant : principale','Après : principale'],[[record.name,record.pieces?.[n]?.mainType,a1.pieces?.[n]?.mainType],[b.name,b.pieces?.[n]?.mainType,b1.pieces?.[n]?.mainType]])+'<button type="button" data-cs-secondary="apply-swap">Appliquer cet échange</button>';form._swap={source:JSON.stringify([record,b]),next:[a1,b1]};return;}
      case 11:{const rows=sharedPieces(builds);out.innerHTML=rows.length?table(['Identifiant','Builds concernés'],rows.map(r=>[r.id,r.users.join(' · ')])):notice('Aucun identifiant partagé détecté. Les pièces sans identifiant ne sont pas vérifiables.');return;}
      case 12:{const clone={...copy(record),id:id(),name:v.name||'Variante'};persistBuilds([...builds,clone]);done('Variante créée. Disponible dans la sélection de dossier et dans l’atelier.');return;}
      case 13:{const t=context.teams().find(t=>t.id===v.team);if(!t)throw Error('Choisis une équipe.');const n=t.members.findIndex(x=>String(x.character)===String(record.character));if(n<0)throw Error('Cette équipe ne contient pas le personnage du build.');const next=copy(t);next.members[n]={...next.members[n],buildId:record.id,weapon:record.weapon,set:record.set};persistTeam(next);done('Build associé à '+t.name+'.');return;}
      case 14:done('Build transmis au laboratoire.');context.openLab(record);return;
      case 15:m.snapshot={name:v.name||'Sauvegarde',at:Date.now(),data:copy(record)};store();done('Point de restauration créé. Rouvre cet outil pour le restaurer.');return;
      case 16:done('Carnet enregistré.');return;
      case 17:m.archived=!m.archived;store();done(m.archived?'Build marqué comme archivé.':'Build réactivé.');return;
      case 18:download('astralis-build.json',{format:'astralis-build',version:1,build:record});done('Build exporté.');return;
      case 19:{const f=form.elements.file.files[0];if(!f)throw Error('Choisis un fichier JSON.');if(f.size>5e6)throw Error('Fichier limité à 5 Mo.');const b=validateBuildImport(JSON.parse(await f.text()));if(!context.character(b.character))throw Error('Personnage non présent dans le catalogue chargé.');b.id=id();b.name=(b.name||'Build')+' · import';persistBuilds([...builds,b]);done('Variante importée sans remplacer les builds existants.');return;}
    }
    if(page==='teams')switch(i){
      case 0:context.saveTeam({...copy(record),id:id(),name:v.name||'Variante'});needsReload=true;done('Variante d’équipe créée.');return;
      case 1:if(!v.character)throw Error('Choisis un personnage.');m.bench={character:v.character};store();done('Remplaçant enregistré. Rouvre cet outil pour le faire entrer.');return;
      case 2:{const a=num(v.from),b=num(v.to);if(a===b)throw Error('Choisis deux places différentes.');const next=copy(record);[next.members[a],next.members[b]]=[next.members[b]||{},next.members[a]||{}];persistTeam(next);done('Ordre de déploiement enregistré.');return;}
      case 3:{const next=copy(record);next.members=next.members.map((slot,n)=>{const b=builds.find(b=>b.id===v['member'+n]);if(b&&String(b.character)!==String(slot.character))throw Error('Build incompatible avec le personnage.');return {...slot,buildId:b?.id||'',...(b?{weapon:b.weapon,set:b.set}:{})};});persistTeam(next);done('Associations enregistrées.');return;}
      case 4:done('Objectif de combat enregistré.');return;
      case 5:case 6:{const other=context.teams().find(t=>t.id===v.other);if(!other||other.id===record.id)throw Error('Choisis une autre équipe.');if(i===5){const common=overlap(record,other);out.innerHTML=common.length?notice('Personnages communs : '+common.map(nameOf).join(', ')):notice('Les deux équipes peuvent être déployées sans personnage commun.');}else{const assigned=[record,other].flatMap(t=>(t.members||[]).map((m,i)=>{const b=builds.find(b=>b.id===m.buildId);return b?{...b,id:t.id+':'+i,name:t.name+' · '+(b.name||'Build')}:null})).filter(Boolean),rows=sharedPieces(assigned);out.innerHTML=rows.length?table(['Pièce','Builds'],rows.map(r=>[r.id,r.users.join(' · ')])):notice('Aucun identifiant d’artéfact partagé. Les pièces sans identifiant ne sont pas vérifiables.');}return;}
      case 7:out.innerHTML=table(['Place','Personnage','À préparer'],teamReadiness(record,builds).map(r=>[r.index+1,nameOf(r.character),r.issues.join(' · ')||'Associations complètes']));return;
      case 8:out.innerHTML=table(['Personnage','Recharge estimée'],record.members.map((s,n)=>[nameOf(s.character),energyBudget(v['cost'+n],v['flat'+n],v['base'+n])==null?'Énergie de base à préciser':fmt(energyBudget(v['cost'+n],v['flat'+n],v['base'+n]))+' %']));return;
      case 9:{if(num(v.duration)<1||num(v.duration)>600)throw Error('Durée entre 1 et 600 secondes.');const rows=cooldownSchedule(v.duration,record.members.map((s,n)=>({name:nameOf(s.character),cooldown:v['cd'+n],duration:v['up'+n],start:v['start'+n]})));out.innerHTML=table(['Compétence de','Disponible à','Fin de l’effet'],rows.map(r=>[r.name,fmt(r.at)+' s',fmt(r.at+r.duration)+' s']));return;}
      case 10:{const rows=rotationTimeline(record,v);out.innerHTML=table(['Début','Fin','Action','Personnage'],rows.map(r=>[fmt(r.start)+' s',fmt(r.end)+' s',r.name||r.code,nameOf(r.character)]))+tiles([['Durée du cycle',fmt(rows.at(-1)?.end||0)+' s']]);return;}
      case 11:{if((record.rotation||[]).some(a=>['comboStart','comboEnd'].includes(a.type)))throw Error('Enregistre une variante sans marqueurs de combo pour changer son ouverture.');const n=num(v.index),next=copy(record);next.rotation=[...next.rotation.slice(n),...next.rotation.slice(0,n)];form._opening={source:JSON.stringify(record),next};out.innerHTML=notice(next.rotation.map(a=>a.name||a.code).join(' · '))+'<button type="button" data-cs-secondary="apply-opening">Enregistrer cette ouverture</button>';return;}
      case 12:{const rows=expandedRotation(record);download('rotation-astralis.txt',[record.name,...rows.map((r,n)=>`${n+1}. ${nameOf(r.character)} · ${r.name||r.code} ×${r.count||1}`)].join('\n'),'text/plain');done('Script téléchargé.');return;}
      case 13:done('Consignes enregistrées pour les quatre membres.');return;
      case 14:{if(timer)clearInterval(timer);started=performance.now();const clock=form.querySelector('[data-cs-clock]');timer=setInterval(()=>{if(!clock.isConnected){clearInterval(timer);timer=null;return;}const t=(performance.now()-started)/1000;clock.textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(1).padStart(4,'0');},100);done('Chronomètre en cours.');return;}
      case 15:{if(num(v.seconds)<=0)throw Error('Renseigne un temps positif.');m.trials||=[];m.trials.push({seconds:num(v.seconds),success:!!v.success,notes:v.notes,at:Date.now()});m.trials=m.trials.slice(-100);store();const s=trialSummary(m.trials);out.innerHTML=tiles([['Essais',s.count],['Réussites',s.wins],['Meilleur succès',s.best==null?'—':fmt(s.best)+' s'],['Temps moyen',fmt(s.average)+' s']]);return;}
      case 16:{let n=0;for(const row of teamReadiness(record,builds))for(const issue of row.issues){if(context.task({id:id(),title:record.name+' · place '+(row.index+1)+' · '+nameOf(row.character)+' · '+issue,category:'Équipe',done:false})!==false)n++;}done(n+' tâches de préparation créées.');return;}
      case 17:done('Plan de match enregistré.');return;
      case 18:m.snapshot={name:v.name,at:Date.now(),data:copy(record)};store();done('Sauvegarde de l’équipe créée. Rouvre cet outil pour restaurer.');return;
      case 19:download('astralis-equipe.json',{format:'astralis-team',version:1,team:record,builds:builds.filter(b=>record.members.some(m=>m.buildId===b.id))});done('Équipe exportée avec ses builds liés.');return;
    }
    if(page==='lab'){
      const p=currentScenario();
      if(i===1){const scenario=safeScenario(p);m.scenarios||=[];m.scenarios.push({id:id(),name:v.name||'Scénario',at:Date.now(),p:scenario});m.scenarios=m.scenarios.slice(-30);store();done('Scénario sauvegardé. Rouvre cet outil pour le recharger.');return;}
      if(i===4){done('Journal enregistré.');return;}
      if(i===18){if(!m.measures?.length)throw Error('Enregistre au moins une mesure.');const csv=rows=>rows.map(r=>r.map(c=>'"'+String(c??'').replaceAll('"','""')+'"').join(';')).join('\r\n');download('mesures-astralis.csv','\ufeff'+csv([['Mesure','Date','Dégâts','Personnage','Attaque'],...m.measures.map(r=>[r.label,new Date(r.at).toISOString(),r.total,r.p.character,r.p.targetName||r.p.attackSelection])]),'text/csv;charset=utf-8');done('Mesures exportées.');return;}
      if(i===19){download('scenario-astralis.json',{format:'astralis-lab-scenario',version:1,scenario:safeScenario(p)});done('Scénario exporté.');return;}
      if(i===3){const a=scenarios().find(s=>s.id===v.a),b=scenarios().find(s=>s.id===v.b);if(!a||!b||a.id===b.id)throw Error('Sauvegarde puis choisis deux scénarios différents.');const ra=await measure(a.p),rb=await measure(b.p),diff=resultDiff(ra.total,rb.total);out.innerHTML=tiles([[a.name,fmt(ra.total)],[b.name,fmt(rb.total)],['Écart',fmt(diff.delta)],['Variation',fmt(diff.percent)+' %']]);return;}
      if(i>=5&&i<=9){const keys={5:'enemyLevel',6:'resistance',7:'hitCount',8:'defReduction',9:'weaponRefinement'},series=i===9?[1,2,3,4,5]:String(v.values||'').split(',').map(s=>Number(s.trim()));if(!series.length||series.length>12||series.some(x=>!Number.isFinite(x)))throw Error('Indique 1 à 12 nombres séparés par des virgules.');if(i===7&&series.some(x=>x<1||x>1000||!Number.isInteger(x)))throw Error('Le nombre de coups doit être un entier entre 1 et 1 000.');if((i===5&&series.some(x=>x<1||x>200))||(i===8&&series.some(x=>x<0||x>100)))throw Error('Valeur hors des limites de cette série.');const rows=[],samples=[];for(const x of series){report('Calcul '+(rows.length+1)+' / '+series.length);const next={...copy(p),[keys[i]]:x};if(i===7)next.reactingHits=Math.min(num(next.reactingHits),x);const r=await measure(next);samples.push([x,r.total]);rows.push([x,fmt(r.total),r.warnings?.join(' · ')||'']);}out.innerHTML=plot(samples)+table(['Paramètre','Dégâts','Remarque'],rows);report('Série terminée : '+series.length+' mesures.');return;}
      if(i===10){const rows=[];for(const mode of ['nonCrit','crit','average']){const r=await measure({...copy(p),critMode:mode});rows.push([({nonCrit:'Sans CRIT',crit:'CRIT',average:'Moyenne'})[mode],fmt(r.total)]);}out.innerHTML=table(['Mode','Dégâts'],rows);return;}
      const r=await measure(p);
      if(i===0){m.measures||=[];m.measures.push({id:id(),label:v.label||'Mesure',at:Date.now(),total:r.total,p,result:r});m.measures=m.measures.slice(-100);store();out.innerHTML=tiles([['Dégâts enregistrés',fmt(r.total)]])+notice(r.warnings?.join(' · ')||'Mesure conservée avec ses paramètres.');return;}
      if(i===2){m.baseline={total:r.total,at:Date.now(),p};store();done('Référence A enregistrée. Rouvre cet outil après avoir modifié le scénario.');return;}
      if(i===11||i===12||i===17){const other=copy(p);if(i===12){other.buffs=[];other.importBonuses={};}else{other.allies=[];other.characterBuffTeam=null;}const base=await measure(other),diff=resultDiff(base.total,r.total);if(i===17){const uptime=num(v.uptime)/100;if(uptime<0||uptime>1||num(v.duration)<=0||num(v.hits)<1)throw Error('Vérifie la disponibilité, la durée et le nombre de coups.');const weighted=base.total*(1-uptime)+r.total*uptime;out.innerHTML=tiles([['Coup moyen pondéré',fmt(weighted)],['Total du cycle',fmt(weighted*num(v.hits))],['DPS projeté',fmt(weighted*num(v.hits)/num(v.duration))]])+notice('Projection de coups identiques. Les fenêtres réelles et temps de déplacement ne sont pas simulés.');}else out.innerHTML=tiles([['Avec',fmt(r.total)],['Sans',fmt(base.total)],['Contribution',fmt(diff.delta)],['Gain',fmt(diff.percent)+' %']]);return;}
      if(i===13){if(num(p.hitCount)!==1||num(r.transformative)>0)throw Error('Choisis une attaque à un seul coup sans dégâts transformateurs pour cette analyse.');const a=await measure({...copy(p),critMode:'nonCrit'}),b=await measure({...copy(p),critMode:'crit'}),d=critDistribution(a.total,b.total,v.rate);out.innerHTML=tiles([['Moyenne',fmt(d.average)],['Écart-type',fmt(d.deviation)],['Sans CRIT',fmt(a.total)],['CRIT',fmt(b.total)]]);return;}
      if(i===14){const factors=['base','additive','transformative','bonusMultiplier','critMultiplier','defenseMultiplier','resistanceMultiplier','reactionMultiplier'];out.innerHTML=notice(r.terms?.formula||'Cette fiche sourcée ne détaille pas la formule intermédiaire.')+table(['Facteur renvoyé par le moteur','Valeur'],factors.filter(k=>r[k]!=null).map(k=>[({base:'Dégâts de base',additive:'Ajout de dégâts',transformative:'Dégâts de réaction',bonusMultiplier:'Multiplicateur de bonus',critMultiplier:'Multiplicateur CRIT',defenseMultiplier:'Multiplicateur de défense',resistanceMultiplier:'Multiplicateur de résistance',reactionMultiplier:'Multiplicateur de réaction'})[k],fmt(r[k])]))+notice(r.warnings?.join(' · ')||'');return;}
      if(i===15){const e=hitEstimate(r.total,v.hp,v.frequency);if(!e)throw Error('Les PV, dégâts et cadence doivent être positifs.');out.innerHTML=tiles([['Coups requis',e.hits],['Temps théorique',fmt(e.seconds)+' s'],['Dégâts excédentaires',fmt(e.overkill)]])+notice('Les coups sont supposés identiques, sans déplacement, changement de phase ni temps de recharge.');return;}
      if(i===16){if(num(v.targets)<1||num(v.targets)>100||!Number.isInteger(num(v.targets)))throw Error('Choisis entre 1 et 100 cibles.');out.innerHTML=tiles([['Par cible',fmt(r.total)],['Total indépendant',fmt(r.total*num(v.targets))]]);return;}
    }
  }
  studio.addEventListener('change',e=>{if(e.target.name==='record'&&e.target.closest('.cs-tool-context')){saved.selected=e.target.value;store();renderTools();return;}const form=e.target.closest('[data-cs-form]');if(form)saveForm(form);});
  studio.addEventListener('submit',async e=>{const form=e.target.closest('[data-cs-form]');if(!form)return;e.preventDefault();e.stopPropagation();if(running)return;const button=form.querySelector('[type="submit"]');running=true;button.disabled=true;form.setAttribute('aria-busy','true');try{const v=saveForm(form),i=Number(form.dataset.csForm);await run(i,v,form);store();const refresh={builds:[12,15,17,19],teams:[0,1,15,18],lab:[0,1,2]};if(refresh[page].includes(i)&&studio.isConnected){const result=form.querySelector('[data-cs-result]').innerHTML;renderTools();const replacement=tools.querySelector(`[data-cs-form="${i}"]`);if(replacement){replacement.closest('details').open=true;replacement.querySelector('[data-cs-result]').innerHTML=result;}}}catch(error){form.querySelector('[data-cs-result]').innerHTML=notice(error.message||String(error));report(error.message||String(error));}finally{button.disabled=false;running=false;form.removeAttribute('aria-busy');}});
  studio.addEventListener('click',async e=>{const btn=e.target.closest('button');if(!btn)return;if(btn.dataset.csTab){if(timer){clearInterval(timer);timer=null;}tab(btn.dataset.csTab);return;}const action=btn.dataset.csSecondary;if(!action)return;e.preventDefault();const m=meta(),form=btn.closest('form'),v=form?saveForm(form):{};try{
    if(action==='restore-build'){if(!m.snapshot)throw Error('Aucun point.');const next=read(buildKey,[]).map(b=>b.id===selection().id?copy(m.snapshot.data):b);persistBuilds(next);report('Build restauré.');}
    if(action==='restore-team'){if(!m.snapshot)throw Error('Aucun point.');persistTeam(copy(m.snapshot.data));report('Équipe restaurée.');}
    if(action==='undo-builds'){localStorage.setItem(buildKey,JSON.stringify(m.undoBuilds));delete m.undoBuilds;needsReload=true;store();report('Dernière modification annulée.');}
    if(action==='undo-team'){const previous=copy(m.undoTeam);delete m.undoTeam;needsReload=true;store();context.saveTeam(previous);report('Dernière modification annulée.');}
    if(action==='apply-swap'){const current=read(buildKey,[]),pending=form._swap;if(!pending)throw Error('Recommence la prévisualisation.');const a=current.find(b=>b.id===pending.next[0].id),b=current.find(b=>b.id===pending.next[1].id);if(JSON.stringify([a,b])!==pending.source)throw Error('Un build a changé. Recommence la prévisualisation.');persistBuilds(current.map(b=>pending.next.find(n=>n.id===b.id)||b));btn.disabled=true;report('Échange enregistré.');}
    if(action==='swap-bench'){const next=copy(requireRecord()),n=num(v.slot);if(!m.bench)throw Error('Aucun remplaçant.');if(next.members.some((s,index)=>index!==n&&String(s.character)===String(m.bench.character)))throw Error('Ce personnage figure déjà dans l’équipe.');const previous=copy(next.members[n]||{});next.members[n]=copy(m.bench);m.bench=previous;persistTeam(next);report('Remplaçant déployé, ancien membre conservé sur le banc.');}
    if(action==='apply-opening'){if(!form._opening||JSON.stringify(requireRecord())!==form._opening.source)throw Error('L’équipe a changé. Recommence la prévisualisation.');persistTeam(form._opening.next);btn.disabled=true;report('Ouverture enregistrée.');}
    if(action==='stop-clock'){if(!timer)throw Error('Démarre le chronomètre.');m.lastTime=Number(((performance.now()-started)/1000).toFixed(1));clearInterval(timer);timer=null;store();report('Temps conservé : '+fmt(m.lastTime)+' s. Il est proposé dans le prochain essai.');}
    if(action==='restore-scenario'){const scenario=scenarios().find(s=>s.id===v.scenario);if(!scenario)throw Error('Choisis un scénario.');context.lab.restore(safeScenario(scenario.p));}
    if(action==='compare-baseline'){const r=await measure(currentScenario()),d=resultDiff(m.baseline.total,r.total);form.querySelector('[data-cs-result]').innerHTML=tiles([['A',fmt(m.baseline.total)],['B',fmt(r.total)],['Écart',fmt(d.delta)],['Gain',fmt(d.percent)+' %']]);}
    if(action==='import-scenario'){const f=form.elements.file.files[0];if(!f)throw Error('Choisis un fichier.');if(f.size>5e6)throw Error('Fichier limité à 5 Mo.');const data=JSON.parse(await f.text());context.lab.restore(safeScenario(data.scenario||data));}
  }catch(error){report(error.message||String(error));}});
  studio.addEventListener('click',event=>{const button=event.target.closest('[data-cs-tool-target]');if(button)showTool(Number(button.dataset.csToolTarget));if(event.target.closest('.cs-tool>summary'))event.preventDefault();if(event.target.closest('[data-lab-character-choice]'))setTimeout(()=>{if(studio.isConnected)updateHero();},0);});
  updateHero();tab(saved.tab);
}
