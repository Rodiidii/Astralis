import {compareLabScores,labReferenceScore} from './lab-comparison.js';
import './lab-import-config.js?v=84';
import {ATTACK_KINDS,attackOptions,setEffectOptions,effectSetting,weaponEffectOptions} from './lab-config.js?v=84';
import { LAB_REACTIONS, LAB_BUFF_TYPES, talentValueRows } from './lab-actions.js?v=84';
import { ic } from './icons.js?v=20261107-stability-6';
import { ARTIFACT_MAIN_BY_SLOT, ARTIFACT_SLOT_LABELS, ARTIFACT_SLOTS } from './artifact-model.js?v=20261110-builds-3';
import { renderGameText, skillValuesAtLevel } from './character-content.js?v=20261109-rich-text-1';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('fr-FR', {maximumFractionDigits:1}) : '—';
export const LAB_STAT_LABELS = {
  atk:'ATQ', hp:'PV', def:'DÉF', em:'Maîtrise élémentaire', er:'Recharge', critRate:'Taux CRIT', critDmg:'DGT CRIT', dmgBonus:'Bonus de DGT',
  hpFlat:'PV', atkFlat:'ATQ', defFlat:'DÉF', hpPct:'PV %', atkPct:'ATQ %', defPct:'DÉF %',
  pyroDmg:'Bonus Pyro', hydroDmg:'Bonus Hydro', cryoDmg:'Bonus Cryo', electroDmg:'Bonus Électro',
  anemoDmg:'Bonus Anémo', geoDmg:'Bonus Géo', dendroDmg:'Bonus Dendro', physicalDmg:'Bonus physique', healing:'Bonus de soin',
};
const statIcon = key => ic(({hp:'heart',hpPct:'heart',hpFlat:'heart',atk:'sword',atkPct:'sword',atkFlat:'sword',def:'shield',defPct:'shield',em:'sparkle',er:'refresh',critRate:'target',critDmg:'sparkle'})[key] || 'sparkle');
const field = (label,key,value,step='any',min='0') => '<label class="lab-field"><span>'+label+'</span><input data-lab="'+key+'" type="number" step="'+step+'" min="'+min+'" value="'+esc(value)+'"></label>';
const image = (source, className='', alt='') => {
  const sources=(Array.isArray(source)?source:[source]).filter(Boolean);
  return sources.length
    ? '<img src="'+esc(sources[0])+'" data-sources="'+esc(JSON.stringify(sources))+'" data-index="0" class="'+className+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" onerror="if(window.astralisFallback){window.astralisFallback(this)}else{this.hidden=true}">'
    : '<span class="lab-art-placeholder '+className+'" aria-hidden="true">'+ic('sparkle')+'</span>';
};
const section = (label, title, content, className='') => '<section class="lab-panel '+className+'"><header class="lab-panel-head"><span class="eyebrow">'+label+'</span><h3>'+title+'</h3></header>'+content+'</section>';
const elementColors = {pyro:'#ee9b83',hydro:'#81bde6',cryo:'#a8dbe7',electro:'#c1a4ef',anemo:'#91d7bc',geo:'#e5c187',dendro:'#b2d384'};
const elementKey = character => ({'pyro':'pyro','hydro':'hydro','cryo':'cryo','électro':'electro','electro':'electro','anémo':'anemo','anemo':'anemo','géo':'geo','geo':'geo','dendro':'dendro'})[String(character?.elementText||character?.element||'').toLowerCase()] || '';
const percentStats = new Set(['hpPct','atkPct','defPct','critRate','critDmg','er','dmgBonus','pyroDmg','hydroDmg','cryoDmg','electroDmg','anemoDmg','geoDmg','dendroDmg','physicalDmg','healing']);
export const labStatValue = (key,value) => value == null || value === '' ? '—' : fmt(value)+(percentStats.has(key)?' %':'');

function selector(context,p) {
  const filtered = context.characters.filter(c => !context.characterQuery || String(c._name).toLocaleLowerCase('fr').includes(context.characterQuery));
  const selected = context.characters.find(c => String(c._id)===String(p.character));
  const builds = context.builds.filter(build => String(build.character)===String(p.character));
  return '<div class="lab-context-bar"><details class="lab-character-picker"><summary>'+image(selected?._labImage)+
    '<span><small>Personnage actif</small><b>'+esc(selected?._name||'Choisir un personnage')+'</b></span>'+ic('arrowRight',{cls:'lab-icon-down'})+'</summary>'+
    '<div class="lab-picker-pop"><input type="search" data-lab-character-query aria-label="Rechercher un personnage" placeholder="Rechercher un personnage…" value="'+esc(context.characterQuery||'')+'">'+
    '<div class="lab-character-options">'+filtered.map(c => '<button type="button" data-lab-character-choice="'+esc(c._id)+'" aria-pressed="'+(String(c._id)===String(p.character))+'">'+image(c._labImage,'',c._name)+'<span>'+esc(c._name)+'</span></button>').join('')+'</div></div></details>'+
    '<label class="lab-build-select"><span>Build de référence</span><select data-lab="build"><option value="">Saisie libre</option>'+builds.map(build => '<option value="'+esc(build.id)+'" '+(String(p.build)===String(build.id)?'selected':'')+'>'+esc(build.name||'Build personnel')+'</option>').join('')+'</select></label>'+
    '<button type="button" class="quiet-btn lab-reload-build" data-lab-action="load-build" '+(!p.build?'disabled':'')+' title="Charger les statistiques du personnage et de son arme">'+ic('refresh')+' Charger le build</button>'+
    '<div class="lab-local-count">'+ic('notebook')+'<span><b>'+context.inventory.length+'</b> reliques<small>sur cet appareil</small></span></div>'+
    '<input type="hidden" data-lab="character" value="'+esc(p.character)+'"><input type="hidden" data-lab="level" value="'+esc(p.level||90)+'"></div>'+
    '<div class="lab-tc-toolbar"><label>Niveau<select data-lab-character-level>'+[1,20,40,50,60,70,80,90,95,100].map(level=>'<option value="'+level+'" '+(Number(p.level||90)===level?'selected':'')+'>'+level+'</option>').join('')+'</select></label><label>Constellation<select data-lab="constellation">'+[0,1,2,3,4,5,6].map(n=>'<option value="'+n+'" '+(Number(p.constellation||0)===n?'selected':'')+'>C'+n+'</option>').join('')+'</select></label><label class="lab-tc-name">Nom du build TC<input data-lab-tc-name value="'+esc(p.tcName||'')+'" placeholder="Mon essai de build…"></label><button class="button-primary" type="button" data-lab-save-tc>Enregistrer le build TC</button><button class="quiet-btn" type="button" data-lab-export>Exporter le calcul PNG</button><button class="quiet-btn" type="button" data-lab-demo>Essayer Skirk</button></div>';
}

function equipmentPiece(piece,context,index) {
  const set = context.sets.find(s => [s._key,s._id,s._name,s._labKey].map(String).includes(String(piece?.setKey||piece?.set)));
  const src = set?._labPieces?.[index] || set?._image;
  const subs = piece?.substats || [];
  return '<div class="lab-gear-piece '+(!piece?'is-empty':'')+'" tabindex="0" title="'+esc(piece ? (set?._name||piece.setKey)+' · '+ARTIFACT_SLOT_LABELS[ARTIFACT_SLOTS[index]] : ARTIFACT_SLOT_LABELS[ARTIFACT_SLOTS[index]]+' à équiper')+'">'+
    '<span class="lab-gear-level">'+(piece?.level!=null?'+'+piece.level:ARTIFACT_SLOT_LABELS[ARTIFACT_SLOTS[index]])+'</span>'+
    image(src,'lab-gear-art','')+'<strong>'+esc(piece?labStatValue(piece.mainType,piece.mainValue):'—')+'</strong>'+
    '<small>'+esc(LAB_STAT_LABELS[piece?.mainType]||'Non équipée')+'</small>'+
    (subs.length?'<div class="lab-gear-tooltip">'+subs.map(s=>'<span>'+esc(LAB_STAT_LABELS[s.type]||s.type)+' <b>'+esc(labStatValue(s.type,s.value))+'</b></span>').join('')+'</div>':'')+'</div>';
}

export function renderEquipment(context,p,pieces=context.equipped||[]) {
  const build = context.builds.find(b => String(b.id)===String(p.build));
  const weapon = context.activeWeapon?{name:context.activeWeapon._name||context.activeWeapon.name,image:context.activeWeapon._labImage}:build?._labWeapon;
  return '<div class="lab-loadout-strip"><div class="lab-gear-piece lab-gear-weapon"><span class="lab-gear-level">'+(build?'Niv. '+(context.activeBuild?.weaponLevelValue||build.weaponLevelValue||'—'):'Arme')+'</span>'+
    image(weapon?.image,'lab-gear-art','')+'<strong>'+esc(weapon?.name||'À équiper')+'</strong><small>'+esc(build?'R'+(p.weaponRefinement||build.refinement||build.weaponRefinement||1):'Build personnel')+'</small></div>'+
    ARTIFACT_SLOTS.map((_,index)=>equipmentPiece(pieces[index],context,index)).join('')+'</div>';
}

function sidebar(context,p) {
  const character = context.characters.find(c => String(c._id)===String(p.character));
  const build = context.builds.find(b => String(b.id)===String(p.build));
  const stats = context.currentStats || {};
  const basic = ['hp','atk','def','em','er','critRate','critDmg'];
  const selectedElement = p.elementKey || elementKey(character);
  return '<aside class="lab-identity"><div class="lab-portrait">'+image([character?._labSplash,character?._labImage],'lab-portrait-art',character?._name||'')+
    '<div class="lab-portrait-vignette"></div><span class="lab-portrait-index">ASTRALIS / ANALYSE</span>'+
    (selectedElement?'<img class="lab-portrait-element" src="./assets/genshin/elements/gi-'+selectedElement+'.png" alt="'+esc(character?.elementText)+'">':'')+
    '<div class="lab-portrait-caption"><span>'+esc(character?.title||'Ton espace de théorie')+'</span><h2>'+esc(character?._name||'À toi de jouer')+'</h2><p>'+esc(build?'Niv. '+(p.level||build.level||'—')+' · C'+String(p.constellation??build.constellation??0).replace(/^C/i,'')+' · '+(build.name||'Build personnel'):'Niv. '+(p.level||90)+' · C'+(p.constellation||0)+' · Build TC')+'</p></div></div>'+
    '<div class="lab-reference-label"><span class="lab-status-dot"></span>'+esc(p.loadout==='equipped'&&p.build?'Stats finales · équipement inclus':'Stats du personnage + buffs')+'</div>'+
    '<table class="lab-stat-table"><caption>Statistiques finales de combat</caption><tbody>'+basic.map(key=>'<tr><th scope="row">'+statIcon(key)+' '+LAB_STAT_LABELS[key]+'</th><td data-lab-live-stat="'+key+'">'+esc(labStatValue(key,stats[key]))+'</td></tr>').join('')+
    '<tr class="lab-element-stat"><th scope="row">'+statIcon('dmgBonus')+' Bonus de DGT</th><td data-lab-live-stat="dmgBonus">'+esc(labStatValue('dmgBonus',stats.dmgBonus))+'</td></tr></tbody></table>'+
    '<button class="quiet-btn lab-edit-reference" type="button" data-lab-edit-reference>'+ic('pencil')+' Modifier les valeurs</button>'+
    '<p class="lab-sidebar-note">Les résultats suivent le build, l’attaque et les hypothèses que tu sélectionnes.</p></aside>';
}

function actionEditor(p) {
  return '<div class="lab-action-editor"><div class="lab-attack-target"><span class="lab-target-icon">'+ic('target')+'</span><div><span class="eyebrow">ATTAQUE CIBLE</span><strong data-lab-target-name>'+esc(p.targetName||'Définir une attaque')+'</strong><small>Choisis un talent ou renseigne son multiplicateur.</small></div><button type="button" class="quiet-btn" data-lab-tab="talents">Choisir '+ic('arrow')+'</button></div>'+
    (p.components?.length?'<p class="lab-hit-groups"><strong>Coups du talent</strong> '+p.components.map(part=>esc(part.count)+' × '+esc(Number((part.talentMultiplier*100).toFixed(3)))+' %').join(' + ')+'<small>Modifier le multiplicateur ou le nombre de coups remplace cette décomposition par des coups identiques.</small></p>':'')+
    '<details class="lab-disclosure lab-coefficients"><summary>Ajuster les coefficients <span>Coups, multiplicateur et stat utilisée</span></summary><div class="lab-fields"><label class="lab-field"><span>Stat utilisée</span><select data-lab="baseStat">'+[['atk','ATQ'],['hp','PV'],['def','DÉF'],['em','Maîtrise élémentaire']].map(([key,label])=>'<option value="'+key+'" '+(p.baseStat===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
    field('Multiplicateur du talent','talent',p.talent,.001)+field('Dégâts plats par coup','flat',p.flat)+field('Nombre de coups','hitCount',p.hitCount||1,1,1)+field('Coups avec réaction','reactingHits',p.reactingHits||0,1,0)+
    '<label class="lab-field"><span>Élément des dégâts</span><select data-lab="elementKey"><option value="">Physique</option>'+Object.keys(elementColors).map(key=>'<option value="'+key+'" '+(p.elementKey===key?'selected':'')+'>'+esc({electro:'Électro',anemo:'Anémo',geo:'Géo'}[key]||key[0].toUpperCase()+key.slice(1))+'</option>').join('')+'</select></label></div></details>'+
    '<div class="lab-segmented lab-crit-switch" role="group" aria-label="Affichage critique">'+[['nonCrit','Sans CRIT'],['average','Dégâts moyens'],['crit','Critique']].map(([key,label])=>'<button type="button" data-lab-mode="critMode" data-value="'+key+'" class="'+(p.critMode===key?'active':'')+'" aria-pressed="'+(p.critMode===key)+'">'+label+'</button>').join('')+'</div>'+
    '<input type="hidden" data-lab="critMode" value="'+esc(p.critMode)+'"><input type="hidden" data-lab="loadout" value="'+esc(p.loadout)+'">'+
    '<div class="lab-reaction-row"><label class="lab-field"><span>Réaction élémentaire</span><select data-lab="reaction">'+LAB_REACTIONS.map(([key,label])=>'<option value="'+key+'" '+(p.reaction===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
    '<span class="lab-target-condition">'+ic('shield')+' Ennemi niv. <b data-lab-enemy-level>'+esc(p.enemyLevel)+'</b></span></div>'+
    (LAB_REACTIONS.find(row=>row[0]===p.reaction)?.[2]==='special'?'<p class="lab-data-note">Formule spécifique '+esc(LAB_REACTIONS.find(row=>row[0]===p.reaction)[1])+' · TODO_DATA tant que ses paramètres ne sont pas vérifiés.</p>':'')+'<details class="lab-disclosure" '+(p.reaction!=='none'?'open':'')+'><summary>Réaction et ennemi <span>Paramètres du calcul</span></summary><div class="lab-fields">'+
    field('Ennemis touchés par chaque impact','targetCount',p.targetCount||1,1,1)+field('Temps depuis le début (s)','elapsed',p.elapsed||0,.1,0)+field('Niveau ennemi','enemyLevel',p.enemyLevel,1,1)+field('Résistance ennemie (%)','resistance',p.resistance,1,-100)+field('Réduction de RÉS (%)','resReduction',p.resReduction)+field('Réduction de DÉF (%)','defReduction',p.defReduction)+field('Ignore DÉF (%)','defIgnore',p.defIgnore)+
    field('Amplification · 1,5 ou 2','ampBase',p.ampBase,.1)+field('Coefficient de réaction vérifié','reactionCoeff',p.reactionCoeff,.001)+field('Multiplicateur de niveau vérifié','reactionLevel',p.reactionLevel,.001)+field('Bonus de réaction (%)','reactionBonus',p.reactionBonus,.1)+'</div></details>'+
    '<details class="lab-disclosure" data-lab-reference><summary>Statistiques et bonus <span>Avant les cinq artéfacts</span></summary><p class="lab-note">Le build charge les stats du personnage et de son arme. Les bonus conditionnels restent à renseigner lorsqu’ils sont actifs.</p><div class="lab-fields">'+
    ['hp','atk','def','em','critRate','critDmg','er'].map(key=>field(LAB_STAT_LABELS[key]+(percentStats.has(key)?' (%)':''),key,p[key])).join('')+
    field('Bonus DGT général (%)','bonus',p.bonus)+field('Bonus DGT de l’élément (%)','elementBonus',p.elementBonus)+'</div><button class="quiet-btn" type="button" data-lab-action="save">Enregistrer les paramètres</button></details>'+
    '<div class="lab-inline-actions"><button type="button" class="button-primary" data-lab-action="calculate">'+ic('sparkle')+' Calculer l’attaque</button>'+
    '<button type="button" class="quiet-btn" data-lab-action="compare">Comparer au build</button><button type="button" class="quiet-btn" data-lab-action="sensitivity">Gains par stat</button></div></div>';
}

function output(p) {
  return section('RÉSULTAT', 'Ce que change ton build', '<div class="lab-result-main"><span data-lab-result-title>Dégâts de l’attaque sélectionnée</span><strong data-lab-damage>—</strong><small data-lab-warning>Le résultat apparaîtra après le calcul.</small></div>'+
    '<div class="lab-result-comparison" data-lab-comparison></div><div data-lab-sensitivity class="lab-sensitivity"></div>'+
    '<details class="lab-disclosure"><summary>Voir le calcul <span>Chaque terme de la formule</span></summary><div data-lab-breakdown><p class="lab-note">Sélectionne une attaque pour afficher sa décomposition.</p></div></details>','lab-output');
}

function talents(context,p) {
  const rows = context.skills || [];
  return section('KIT DU PERSONNAGE', 'Les talents, au bon niveau',
    '<div class="lab-talent-toolbar"><p>Choisis une valeur pour la définir comme cible du calcul.</p><label class="lab-field"><span>Niveau du talent</span><select data-lab="talentLevel">'+Array.from({length:15},(_,i)=>'<option '+(Number(p.talentLevel)===i+1?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div></details>'+
    '<div class="lab-talent-grid">'+(rows.length?rows.map((skill,index)=>{
      const source = context.details?.talentValues?.['combat'+(index+1)] || context.details?.skillTalents?.[index] || skill;
      const values = talentValueRows(source,Number(p.talentLevel)||10,skill.values);
      return '<article class="lab-talent-card"><header>'+image(skill.image,'','')+'<div><small>'+esc(['Attaque normale','Compétence élémentaire','Déchaînement élémentaire'][index]||'Talent')+'</small><h4>'+esc(skill.name)+'</h4></div></header>'+
        '<details><summary>Description du talent</summary><div class="lab-talent-description">'+renderGameText(skill.description||'Description indisponible.')+'</div></details>'+
        '<div class="lab-talent-values">'+values.map((value,row)=>'<button type="button" data-lab-talent-value="'+index+':'+row+'" title="Utiliser cette valeur comme cible">'+esc(value)+ic('arrow')+'</button>').join('')+'</div>'+
        (!values.length?'<p class="lab-data-note">Valeurs de talent indisponibles · TODO_DATA</p>':'')+'</article>';
    }).join(''):'<div class="lab-empty">'+ic('notebook')+'<h4>'+(!p.character?'Choisis un personnage':'Les talents se préparent')+'</h4><p>'+(!p.character?'Son kit et ses valeurs apparaîtront ici.':context.detailError?'La source de talents est indisponible. Tu peux saisir une valeur vérifiée dans la simulation.':'Chargement du kit depuis les sources du jeu…')+'</p></div>')+'</div>');
}

function optimizer(context,p) {
  const states = new Map([...(p.allowedSets||[]).map(id=>[id,'allow']),...(p.requiredSets||[]).map(id=>[id,'required']),...(p.excludedSets||[]).map(id=>[id,'exclude'])]);
  const present = new Set(context.inventory.map(piece=>String(piece.setKey)));
  const sets = context.sets.filter(set=>present.has(String(set._labKey||set._key||set._id)));
  return section('INVENTAIRE → MEILLEUR ASSEMBLAGE', 'Trouver mon meilleur build',
    '<label class="lab-check"><input type="checkbox" data-lab="respectPriority" '+(p.respectPriority?'checked':'')+'> <span><b>Protéger les personnages prioritaires</b><small>Les pièces des personnages placés avant celui-ci restent réservées.</small></span></label>'+
    '<div class="lab-inventory-banner">'+ic('notebook')+'<div><b>Mes artéfacts uniquement</b><span>'+context.inventory.length+' pièces sur cet appareil · aucune pièce théorique générée</span></div></div><div class="lab-optimizer-start"><div class="lab-goal"><label class="lab-field"><span>Objectif de la recherche</span><select data-lab="objective">'+[['damage','Dégâts de l’attaque'],['dps','DPS sur la durée indiquée'],['hp','Points de vie'],['atk','Attaque'],['def','Défense']].map(([key,label])=>'<option value="'+key+'" '+(p.objective===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div></details>'+
    '<div class="lab-search-presets" role="group" aria-label="Précision de recherche">'+[['quick','Rapide','Niv. 20 · 3 résultats'],['balanced','Équilibré','Niv. 16+ · 5 résultats'],['precise','Précis','Tous niveaux · 10 résultats']].map(([key,label,description])=>'<button type="button" data-lab-search-preset="'+key+'" aria-pressed="'+(p.searchPreset===key)+'" class="'+(p.searchPreset===key?'active':'')+'"><b>'+label+'</b><small>'+description+'</small></button>').join('')+'</div></div>'+
    '<div class="lab-import-row"><label class="quiet-btn">'+ic('upload')+' Importer mes reliques<input type="file" accept="application/json,.json" data-lab-import hidden></label><button type="button" class="quiet-btn" data-lab-action="commit-import" disabled>Confirmer l’import</button><span data-lab-import-status role="status">'+context.inventory.length+' pièces · '+context.invalidCount+' à vérifier</span></div><div data-lab-import-preview class="lab-import-preview" hidden></div>'+
    '<details class="lab-disclosure lab-personalize" open><summary>Personnaliser les filtres <span>Niveaux, stats, sets et contraintes</span></summary>'+
    '<label class="lab-check"><input type="checkbox" data-lab="includeLocked" '+(p.includeLocked!==false?'checked':'')+'> Inclure les pièces marquées verrouillées dans mon inventaire</label><fieldset class="lab-filter-group"><legend>Niveau des artéfacts</legend><div class="lab-segmented">'+[['20','Niv. 20'],['16','Niv. 16 et plus'],['0','Tous les niveaux']].map(([v,label])=>'<button type="button" data-lab-preset="'+v+'" aria-pressed="'+(p.artifactLevelPreset===v)+'" class="'+(p.artifactLevelPreset===v?'active':'')+'">'+label+'</button>').join('')+'</div></fieldset>'+
    '<fieldset class="lab-filter-group"><legend>Stats principales</legend>'+['sands','goblet','circlet'].map(slot=>'<div class="lab-main-stat-row"><b>'+ARTIFACT_SLOT_LABELS[slot]+'</b><div>'+ARTIFACT_MAIN_BY_SLOT[slot].map(key=>'<label class="lab-chip"><input type="checkbox" data-lab-main="'+slot+':'+key+'" '+(p.mainStats?.[slot]?.includes(key)?'checked':'')+'><span>'+statIcon(key)+esc(LAB_STAT_LABELS[key]||key)+'</span><small>'+context.inventory.filter(piece=>piece.slot===slot&&piece.mainType===key).length+'</small></label>').join('')+'</div></div>').join('')+'</fieldset>'+
    '<fieldset class="lab-filter-group"><legend>Configuration des sets</legend><div class="lab-segmented">'+[['standard','4 pièces ou 2 + 2'],['4pc','4 pièces'],['2+2','2 + 2'],['rainbow','Arc-en-ciel'],['any','Toute combinaison']].map(([v,n])=>'<button type="button" data-lab-config="'+v+'" aria-pressed="'+(p.configuration===v)+'" class="'+(p.configuration===v?'active':'')+'">'+n+'</button>').join('')+'</div>'+
    '<div class="lab-set-guide"><button type="button" data-lab-guide-sets>Voir les sets conseillés pour ce personnage</button><div data-lab-guide-output role="status"></div></div><p class="lab-note">Tous les sets de ton inventaire sont autorisés par défaut. Décoche ceux à exclure ; « Imposer 2 pièces » exige au moins deux pièces du set.</p><details class="lab-disclosure lab-inventory-sets" open><summary>Sets de mon inventaire · '+sets.length+'</summary><div class="lab-set-grid">'+sets.map(set=>{
      const id=String(set._labKey||set._key||set._id),allowed=!(p.excludedSets||[]).includes(id)&&(!(p.allowedSets||[]).length||p.allowedSets.includes(id));
      return '<article class="lab-set-check-card">'+image([...(Array.isArray(set._image)?set._image:[set._image]),...(set._labPieces||[]).flat()],'lab-set-thumb',set._name)+'<div><b>'+esc(set._name)+'</b><small>'+context.inventory.filter(piece=>String(piece.setKey)===id).length+' pièces possédées</small><label><input type="checkbox" data-lab-allow-set="'+esc(id)+'" '+(allowed?'checked':'')+'> Autoriser ce set</label><label><input type="checkbox" data-lab-require-set="'+esc(id)+'" '+(p.requiredSets?.includes(id)?'checked':'')+'> Imposer 2 pièces</label></div></article>';
    }).join('')+'</div></details></fieldset>'+
    '<fieldset class="lab-filter-group"><legend>Statistiques finales minimales</legend><div class="lab-fields">'+['hp','atk','def','em','er','critRate','critDmg'].map(key=>field(LAB_STAT_LABELS[key], 'minimum-'+key,p.minimums?.[key]??'',1)).join('')+'</div></fieldset></details>'+
    '<details class="lab-disclosure"><summary>Réglages avancés <span>Priorités, exclusions et effets conditionnels</span></summary>'+

    '<label class="lab-field"><span>Nombre de résultats</span><select data-lab="topN">'+[1,3,5,10].map(n=>'<option '+(Number(p.topN)===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
    '<p class="lab-note">Les passifs et conditions se règlent dans « Effets de sets » ci-dessous. Les effets suivent le nombre de pièces de chaque build testé.</p></details>'+setEffectsEditor(context,p)+
    '<div class="lab-filter-chips" data-lab-active-filters></div><div class="lab-inline-actions"><button type="button" class="quiet-btn" data-lab-action="reset-filters">Réinitialiser les filtres</button><button type="button" class="quiet-btn" data-lab-action="undo-filters">Annuler le changement</button></div>'+
    '<div class="lab-run-bar"><div><strong>Prêt à chercher ?</strong><p class="lab-metrics" data-lab-metrics aria-live="polite">Analyse de l’inventaire…</p></div><button type="button" class="button-primary" data-lab-action="optimize">'+ic('sparkle')+' Générer les builds</button><button type="button" class="quiet-btn" data-lab-action="cancel" disabled>Arrêter</button></div>'+
    '<progress class="lab-progress" data-lab-progress max="100" value="0" aria-label="Progression de la recherche"></progress><div data-lab-results class="lab-results"><div class="lab-empty lab-empty-results">'+ic('sparkle')+'<h4>Ton prochain build commence ici</h4><p>Choisis ton objectif, ajuste les filtres si nécessaire et lance la recherche.</p></div></div>');
}

function rotation(p) {
  return section('ENCHAÎNEMENT D’ACTIONS', 'Composer une rotation',
    '<div class="lab-rotation"><div class="lab-segmented"><button type="button" data-lab-simulation="single" class="'+(p.simulationMode==='single'?'active':'')+'">Une attaque</button><button type="button" data-lab-simulation="rotation" class="'+(p.simulationMode==='rotation'?'active':'')+'">Rotation complète</button></div><p class="lab-note">Une attaque peut contenir plusieurs coups. Le nombre de coups et le nombre de répétitions sont distincts.</p><div class="lab-inline-actions"><button class="quiet-btn" type="button" data-lab-action="add-hit">'+ic('plus')+' Ajouter l’attaque cible</button>'+
    field('Répétitions','repeatRotation',p.repeatRotation,1,1)+field('Durée d’une rotation (s)','rotationSeconds',p.rotationSeconds,.1,.1)+
    '<button class="quiet-btn" type="button" data-lab-load-rotation>Rotation du build</button><button class="quiet-btn" type="button" data-lab-evaluate-rotation>Calculer la rotation</button><button class="quiet-btn" type="button" data-lab-action="clear-rotation">Vider</button></div><div class="lab-rotation-summary" data-lab-rotation-total></div><p class="lab-note">Glisse une action pour la déplacer. Les flèches permettent aussi de changer son ordre au clavier.</p><ol data-lab-rotation-list></ol></div>','lab-rotation-panel');
}

function priority(context,p) {
  return section('PRÊTER LES BONNES PIÈCES', 'Tes personnages prioritaires',
    '<p class="lab-note">Les personnages en haut de la liste gardent leurs artéfacts. Glisse leurs portraits ou utilise les flèches pour changer leur rang.</p>'+
    '<label class="lab-field"><span>Rechercher un personnage</span><input type="search" data-priority-search placeholder="Nom du personnage…"></label><ol class="lab-priority-list" data-lab-priority>'+context.priority.map((id,index)=>{const c=context.characters.find(c=>String(c._id)===id);return c?'<li class="lab-priority-row" draggable="true" data-priority-id="'+esc(id)+'" tabindex="0"><span class="lab-priority-rank">'+String(index+1).padStart(2,'0')+'</span>'+image(c._labImage,'lab-priority-avatar','')+'<span>'+esc(c._name)+'</span><label class="priority-position">Position<input type="number" min="1" max="'+context.priority.length+'" value="'+(index+1)+'" data-priority-position="'+esc(id)+'"></label><div><button type="button" class="quiet-btn" data-lab-action="priority-up" data-id="'+esc(id)+'" aria-label="Monter '+esc(c._name)+'">'+ic('arrowRight',{cls:'lab-icon-up'})+'</button><button type="button" class="quiet-btn" data-lab-action="priority-down" data-id="'+esc(id)+'" aria-label="Descendre '+esc(c._name)+'">'+ic('arrowRight',{cls:'lab-icon-down'})+'</button></div></li>':'';}).join('')+'</ol>');
}

export function renderLabWorkspace(context,p) {
  const character=context.characters.find(c=>String(c._id)===String(p.character));
  const tab = ['overview','talents','optimizer','rotation','priority'].includes(p.tab)?p.tab:'overview';
  const tabs=[['overview','Vue d’ensemble','compass'],['talents','Talents','sparkle'],['optimizer','Optimiser','sliders'],['rotation','Rotation','refresh'],['priority','Tableau de priorité','users']];
  const jsonAttrs=' data-characters="'+esc(JSON.stringify(context.characters.map(c=>({_id:c._id,_name:c._name}))))+'" data-sets="'+esc(JSON.stringify(context.sets.map(s=>({_id:s._id,_key:s._key,_labKey:s._labKey,_name:s._name}))))+'"';
  return '<div class="lab-page lab-workbench" data-damage-lab'+jsonAttrs+' style="--lab-accent:'+(elementColors[elementKey(character)]||'#cdbb92')+'">'+
    '<aside class="lab-data-sync"><span data-lab-sync-status>Tables numériques locales · vérification automatique quotidienne</span><button type="button" data-lab-sync-refresh>Vérifier maintenant</button></aside><header class="lab-masthead"><div><span class="eyebrow">ATELIER DE THÉORIE / GENSHIN IMPACT</span><h1>Ton build. <em>À l’épreuve.</em></h1><p>Choisis un coup, ajuste tes conditions, trouve les meilleures pièces de ton inventaire.</p></div><span class="lab-masthead-mark" aria-hidden="true">'+ic('target')+'</span></header>'+
    selector(context,p)+'<lab-configurations></lab-configurations>'+weaponEditor(context,p)+attackChooser(context,p)+'<div class="lab-workspace">'+sidebar(context,p)+'<div class="lab-main"><details class="lab-current-equipment"><summary>'+ic('notebook')+' Équipement actuel <span>Arme, cinq artéfacts et sous-stats</span></summary>'+renderEquipment(context,p)+equippedDetails(context)+'</details>'+
    '<nav class="lab-tabs" role="tablist" aria-label="Vues du laboratoire">'+tabs.map(([id,label,icon])=>'<button type="button" role="tab" id="lab-tab-'+id+'" aria-controls="lab-view-'+id+'" aria-selected="'+(tab===id)+'" tabindex="'+(tab===id?'0':'-1')+'" data-lab-tab="'+id+'">'+ic(icon)+label+'</button>').join('')+'</nav>'+
    '<details class="lab-attack-search"><summary>Rechercher dans tous les personnages</summary><label class="lab-search-field">'+ic('search')+'<input type="search" data-attack-search aria-label="Rechercher un talent ou une attaque" placeholder="Un talent, une attaque, un personnage…"><kbd>Tous les talents</kbd></label><div class="lab-attack-results" data-attack-results hidden></div></details>'+
    '<div class="lab-workspace-status" data-lab-status role="status"></div>'+
    '<div id="lab-view-overview" role="tabpanel" aria-labelledby="lab-tab-overview" '+(tab==='overview'?'':'hidden')+' class="lab-overview-grid">'+section('HYPOTHÈSES', 'Réaction & conditions',actionEditor(p)+allyEditor(context,p)+buffEditor(p),'lab-simulation')+output(p)+'</div>'+
    '<div id="lab-view-talents" role="tabpanel" aria-labelledby="lab-tab-talents" '+(tab==='talents'?'':'hidden')+'>'+talents(context,p)+'</div>'+
    '<div id="lab-view-optimizer" role="tabpanel" aria-labelledby="lab-tab-optimizer" '+(tab==='optimizer'?'':'hidden')+'>'+optimizer(context,p)+'</div>'+
    '<div id="lab-view-rotation" role="tabpanel" aria-labelledby="lab-tab-rotation" '+(tab==='rotation'?'':'hidden')+'>'+rotation(p)+'</div>'+
    '<div id="lab-view-priority" role="tabpanel" aria-labelledby="lab-tab-priority" '+(tab==='priority'?'':'hidden')+'>'+priority(context,p)+'</div>'+
    '</div></div><footer class="lab-footer">'+ic('shield')+' Les données manquantes restent signalées. Ouvre le détail d’un calcul pour en vérifier les hypothèses.</footer></div>';
}


export function renderLabResults(context,p,results,baseline,error) {
  if(!results.length) return '<div class="lab-empty"><h4>Aucun assemblage compatible</h4><p>'+esc(error||'Les contraintes écartent toutes les combinaisons. Retire une contrainte minimale ou assouplis les filtres.')+'</p></div>';
  const scoreUnit={damage:'DGT',dps:'DPS',hp:'PV',atk:'ATQ',def:'DÉF'}[p.objective]||'';
  const reference=labReferenceScore(p,baseline,context.currentStats);
  return results.map((result,index)=>{
    const pieces=ARTIFACT_SLOTS.map(slot=>result.rows.map(id=>context.inventory.find(piece=>String(piece.id)===String(id))).find(piece=>piece?.slot===slot));
    const comparison=compareLabScores(reference,result.score),gain=comparison.percent;
    const stats=result.result?.stats||result.stats;
    const counts=new Map();
    for(const piece of pieces.filter(Boolean))counts.set(piece.setKey,(counts.get(piece.setKey)||0)+1);
    let effects={};
    try { effects=JSON.parse(p.setEffects||'{}'); } catch {}
    const missingEffects=[...counts].filter(([key,count])=>count>=2&&!effects[key]);
    return '<article class="lab-build-result"><header><div><span class="lab-result-rank">'+String(index+1).padStart(2,'0')+'</span><div><span class="eyebrow">'+(index===0?(p.searchComplete===false?'MEILLEUR TROUVÉ · RECHERCHE INTERROMPUE':'MEILLEUR ASSEMBLAGE'):'ALTERNATIVE')+'</span><h4>'+fmt(result.score)+' <small>'+scoreUnit+'</small></h4></div></div>'+
      (gain==null?'<span class="lab-result-gain is-unknown">'+esc(comparison.label)+'</span>':'<span class="lab-result-gain">'+(gain>=0?'+':'')+fmt(gain)+' %<small>référence : '+fmt(reference)+' '+scoreUnit+'</small></span>')+'</header>'+
      renderEquipment(context,p,pieces)+
      (stats?'<div class="lab-result-stat-grid">'+['hp','atk','def','em','critRate','critDmg','er'].map(key=>'<div><span>'+statIcon(key)+esc(LAB_STAT_LABELS[key])+'</span><b>'+esc(labStatValue(key,stats[key]))+'</b></div>').join('')+'</div>':'')+
      (missingEffects.length?'<p class="lab-note lab-result-caveat">Effets de sets à renseigner · le classement utilise les statistiques des pièces et les bonus saisis.</p>':'')+
      '<footer><button type="button" class="button-primary" data-lab-action="apply-result" data-index="'+index+'" '+(!p.build?'disabled':'')+'>Équiper ce build</button>'+
      '<button type="button" class="quiet-btn" data-lab-action="new-result" data-index="'+index+'">Enregistrer une copie</button>'+
      (!p.weightedResult&&['damage','dps'].includes(p.objective)?'<button type="button" class="quiet-btn" data-lab-compare-result="'+index+'">Comparer</button>':'')+'</footer></article>';
  }).join('');
}

function allyEditor(context,p){
 return '<details class="lab-disclosure" data-lab-allies><summary>Équipiers et sources de buffs</summary><button type="button" class="button-primary" data-complex-effects>Effets complexes · équipe et plumes</button><button type="button" class="quiet-btn" data-effect-catalog>Répertoire des armes, sets et effets publiés</button><p>Choisis jusqu’à trois équipiers. Consulte leurs talents, constellations et effets d’équipement. Configure les mécaniques prises en charge dans Effets complexes ; les buffs personnalisés servent aux autres conditions.</p><article class="lab-ally"><h4>Personnage simulé</h4><button type="button" data-lab-read-ally="-1">Consulter les effets du personnage</button><div data-lab-ally-effects="-1" role="status"></div></article>'+Array.from({length:3},(_,index)=>{
  const ally=p.allies?.[index]||{};
  const select=(key,label,rows)=>'<label>'+label+'<select data-lab-ally="'+index+'" data-ally-field="'+key+'"><option value="">Aucun</option>'+rows.map(row=>'<option value="'+esc(row._id)+'" '+(ally[key]===row._id?'selected':'')+'>'+esc(row._name)+'</option>').join('')+'</select></label>';
  return '<article class="lab-ally"><h4>Équipier '+(index+1)+'</h4>'+select('character','Personnage',context.characters.filter(c=>c._id!==p.character))+select('weapon','Arme',context.weapons)+select('set','Set',context.sets)+'<label>Terrain<select data-lab-ally="'+index+'" data-ally-field="position"><option value="off" '+(ally.position!=='on'?'selected':'')+'>Hors terrain</option><option value="on" '+(ally.position==='on'?'selected':'')+'>Sur le terrain</option></select></label><label>Constellation<select data-lab-ally="'+index+'" data-ally-field="constellation">'+[0,1,2,3,4,5,6].map(c=>'<option value="'+c+'" '+(Number(ally.constellation||0)===c?'selected':'')+'>C'+c+'</option>').join('')+'</select></label><label>Raffinement<select data-lab-ally="'+index+'" data-ally-field="refinement">'+[1,2,3,4,5].map(r=>'<option value="'+r+'" '+(Number(ally.refinement||1)===r?'selected':'')+'>R'+r+'</option>').join('')+'</select></label><button type="button" data-lab-read-ally="'+index+'">Consulter les effets</button><div data-lab-ally-effects="'+index+'" role="status"></div></article>';
 }).join('')+'</details>';
}
function buffEditor(p) {
  const rows=p.buffs||[];
  const fightPosition='<label>Personnage simulé<select data-lab="fightPosition"><option value="on" '+(p.fightPosition!=='off'?'selected':'')+'>Sur le terrain</option><option value="off" '+(p.fightPosition==='off'?'selected':'')+'>Hors terrain</option></select></label>';
  return '<section class="lab-buff-panel"><header><div><span class="eyebrow">HYPOTHÈSES ACTIVES</span><h3>Buffs personnalisés</h3></div><button class="quiet-btn" type="button" data-lab-add-buff>'+ic('plus')+' Ajouter</button></header>'+
    '<p>Choisis la nature, la valeur et les cumuls. Une durée de 0 garde le buff actif sur toute la rotation.</p>'+fightPosition+
    '<div class="lab-buff-list">'+rows.map((buff,index)=>'<div class="lab-buff-row"><input type="checkbox" data-lab-buff="'+index+'" data-field="active" aria-label="Activer le buff '+(index+1)+'" '+(buff.active!==false?'checked':'')+'>'+
      '<label>Nature<select data-lab-buff="'+index+'" data-field="type">'+LAB_BUFF_TYPES.map(([key,label])=>'<option value="'+key+'" '+(key===buff.type?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label>'+
      '<label>Valeur<input type="number" step="any" data-lab-buff="'+index+'" data-field="value" value="'+esc(buff.value||0)+'"></label>'+
      '<label>Cumuls<input type="number" min="1" max="100" step="1" data-lab-buff="'+index+'" data-field="stacks" value="'+esc(buff.stacks||1)+'"></label>'+
      '<label>Durée (s)<input type="number" min="0" step="0.1" data-lab-buff="'+index+'" data-field="duration" value="'+esc(buff.duration||0)+'"></label>'+
      '<details class="lab-buff-condition"><summary>'+esc(buff.source||'Condition et stat source')+'</summary>'+(buff.description?'<div class="lab-effect-description">'+renderGameText(buff.description)+'</div>':'')+'<label>Condition<input type="text" data-lab-buff="'+index+'" data-field="condition" value="'+esc(buff.condition||'')+'" placeholder="Déclenchement à respecter"></label><label>Position du destinataire<select data-lab-buff="'+index+'" data-field="position">'+[['any','Indifférent'],['on','Sur le terrain'],['off','Hors terrain']].map(([id,label])=>'<option value="'+id+'" '+((buff.position||'any')===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Stat de l’équipier<input type="number" min="0" step="any" data-lab-buff="'+index+'" data-field="sourceStat" value="'+esc(buff.sourceStat||0)+'"></label><label>% de cette stat ajouté au bonus<input type="number" step="any" data-lab-buff="'+index+'" data-field="sourcePercent" value="'+esc(buff.sourcePercent||0)+'"></label><label>Plafond total<input type="number" step="any" data-lab-buff="'+index+'" data-field="maximum" value="'+esc(buff.maximum??'')+'" placeholder="Sans plafond"></label><label>Position de la source<select data-lab-buff="'+index+'" data-field="sourcePosition">'+[['off','Hors terrain'],['on','Sur le terrain']].map(([key,label])=>'<option value="'+key+'" '+((buff.sourcePosition||'off')===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Condition de position sur la source<select data-lab-buff="'+index+'" data-field="sourceCondition">'+[['any','Indifférent'],['off','Hors terrain'],['on','Sur le terrain']].map(([key,label])=>'<option value="'+key+'" '+((buff.sourceCondition||'any')===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label></details>'+
      '<button class="quiet-btn" type="button" data-lab-remove-buff="'+index+'" aria-label="Retirer le buff '+(index+1)+'">×</button></div>').join('')+
      (!rows.length?'<div class="lab-buff-empty">Aucun bonus ajouté. Ajoute par exemple 20 % ATQ ou 15 % CRIT Rate.</div>':'')+'</div></section>';
}

function equippedDetails(context) {
  const pieces=context.equipped||[];
  if(!pieces.some(Boolean))return '';
  return '<details class="lab-equipped-detail"><summary>Sous-stats de l’équipement <span>Voir les cinq pièces</span></summary><div class="lab-equipped-grid">'+pieces.map((piece,index)=>{
    if(!piece)return '';
    return '<article><h4>'+ARTIFACT_SLOT_LABELS[ARTIFACT_SLOTS[index]]+' <small>+'+piece.level+'</small></h4><strong>'+esc(LAB_STAT_LABELS[piece.mainType])+' '+esc(labStatValue(piece.mainType,piece.mainValue))+'</strong>'+
      '<dl>'+(piece.substats||[]).map(sub=>'<div><dt>'+esc(LAB_STAT_LABELS[sub.type]||sub.type)+'</dt><dd>'+esc(labStatValue(sub.type,sub.value))+'</dd></div>').join('')+'</dl></article>';
  }).join('')+'</div></details>';
}


function attackChooser(context,p) {
 const options=attackOptions(context,p),kind=p.actionKind||'skill';
 const choices=options.filter(row=>row.kind===kind);
 const chosen=choices.find(row=>row.id===p.attackSelection)||choices.find(row=>row.text===p.targetSource);
 const skill=context.skills?.[kind==='skill'?1:kind==='burst'?2:0];
 const icons={normal:context.skills?.[0]?.image,charged:context.skills?.[0]?.image,plunge:context.skills?.[0]?.image,skill:context.skills?.[1]?.image,burst:context.skills?.[2]?.image};
 const fallbackIcons={normal:'sword',charged:'sword',plunge:'arrowRight',skill:'sparkle',burst:'target'};const actionIcon=key=>'<span class="lab-kind-visual">'+ic(fallbackIcons[key])+(icons[key]?'<img class="lab-kind-icon" src="'+esc(icons[key])+'" alt="" loading="lazy" onerror="this.remove()">':'')+'</span>';
 return '<section class="lab-target-dock" aria-label="Attaque à tester"><header><div><span class="eyebrow">01 / CE QUE TU VEUX TESTER</span><h2>Quel coup veux-tu optimiser ?</h2></div><label>Niveau du talent<select data-lab-target-level>'+Array.from({length:15},(_,i)=>'<option value="'+(i+1)+'" '+(Number(p.talentLevel)===i+1?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></header>'+
  '<div class="lab-attack-kinds" role="group" aria-label="Type d’attaque">'+ATTACK_KINDS.map(([key,label,code])=>'<button type="button" data-lab-attack-kind="'+key+'" aria-pressed="'+(kind===key)+'" class="'+(kind===key?'active':'')+'"><span>'+actionIcon(key)+'</span><b>'+label+'</b></button>').join('')+'</div>'+
  '<div class="lab-precise-attack">'+actionIcon(kind)+'<label><span>Coup précis · '+esc(skill?.name||'kit du personnage')+'</span><select data-lab-target-attack><option value="">'+(choices.length?'Choisir le coup à tester…':'Coefficients indisponibles pour cette catégorie')+'</option>'+choices.map(row=>'<option value="'+row.id+'" '+(chosen?.id===row.id?'selected':'')+'>'+esc(row.text)+'</option>').join('')+'</select></label><div class="lab-target-readout"><small>CIBLE ACTUELLE</small><strong>'+esc(p.targetName||'Aucune attaque sélectionnée')+'</strong><span>'+esc(p.hitCount||1)+' coup(s) · '+esc(p.critMode==='average'?'Dégâts moyens':p.critMode==='crit'?'Critique':'Sans CRIT')+'</span></div></div>'+
  (!choices.length?'<p class="lab-data-note">Cette catégorie n’a pas de coefficient simple disponible dans le kit chargé. Sélectionne une autre catégorie ou renseigne les coefficients dans les conditions du calcul.</p>':'')+'</section>';
}
function effectControls(p,scope,options) {
 return options.map(option=>{
  const state=effectSetting(p,scope,option),id=scope+':'+option.id;
  return '<div class="lab-effect-toggle"><label><input type="checkbox" data-lab-effect="'+esc(id)+'" data-effect-field="enabled" '+(state.enabled?'checked':'')+'><span>'+esc(option.label)+'</span></label>'+(option.max>1?'<label class="lab-effect-stacks">Cumuls<select data-lab-effect="'+esc(id)+'" data-effect-field="stacks">'+Array.from({length:option.max},(_,i)=>'<option '+(state.stacks===i+1?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label>':'')+'</div>';
 }).join('');
}
function customEffectEditor(p,scope) {
 const value=p.customEffects?.[scope]||{};
 const rows=[value,...(value.additional||[])];
 const field=(index,name)=>'data-lab-custom-effect="'+esc(scope)+'" data-effect-index="'+index+'" data-effect-field="'+name+'"';
 return '<details class="lab-custom-effect" '+(rows.some(row=>row.enabled)?'open':'')+'><summary>Configurer des bonus supplémentaires</summary>'+
  rows.map((row,index)=>'<div><label class="lab-check"><input type="checkbox" '+field(index,'enabled')+' '+(row.enabled?'checked':'')+'> Activer</label>'+
   '<label>Nature<select '+field(index,'type')+'>'+[['','Choisir un effet'],...LAB_BUFF_TYPES].map(([key,label])=>'<option value="'+key+'" '+(row.type===key?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label>'+
   '<label>Valeur totale<input type="number" step="any" '+field(index,'value')+' value="'+esc(row.value??'')+'"></label>'+
   (index?'<button type="button" data-lab-remove-effect="'+esc(scope)+'" data-effect-index="'+index+'">Retirer</button>':'')+'</div>').join('')+
  '<button type="button" data-lab-add-effect="'+esc(scope)+'">Ajouter une composante</button></details>';
}
function setEffectsEditor(context,p) {
 const present=new Set([...context.inventory,...context.equipped.filter(Boolean)].map(row=>String(row.setKey)));
 const sets=context.sets.filter(set=>[set._labKey,set._id,String(set.id)].some(key=>present.has(String(key)))||String(set._labKey||set._id)===String(p.inspectSet));
 return '<section class="lab-sets-effects"><header><span class="eyebrow">PASSIFS / CONDITIONS DE LA RECHERCHE</span><h3>Effets de sets</h3><p>Les bonus cochés s’appliquent seulement si le build possède 2 ou 4 pièces. Les conditions sont tes hypothèses de combat.</p></header><label>Consulter un set du catalogue<select data-lab-inspect-set><option value="">Sets de ton inventaire</option>'+context.sets.map(set=>{const id=String(set._labKey||set._id);return '<option value="'+esc(id)+'" '+(String(p.inspectSet)===id?'selected':'')+'>'+esc(set._name)+'</option>';}).join('')+'</select></label><div class="lab-set-effects-grid">'+sets.map(set=>{
  const key=String(set._labKey||set._id),def=setEffectOptions(set);
  return '<details class="lab-set-effect-card"><summary>'+image([...(Array.isArray(set._image)?set._image:[set._image]),...(set._labPieces||[]).flat()],'lab-set-thumb',set._name)+'<span><b>'+esc(set._name)+'</b><small>Bonus 2 pièces · conditions 4 pièces</small></span>'+ic('sliders')+'</summary>'+['two','four'].map((tier,index)=>'<div class="lab-set-effect-tier"><b>'+(index?4:2)+' PIÈCES</b><div class="lab-effect-description">'+renderGameText(index?set.effect4Pc||'Description indisponible':set.effect2Pc||'Description indisponible')+'</div>'+effectControls(p,'set:'+key+':'+tier,def[tier])+(!def[tier].length?'<p class="lab-data-note">Pas de formule automatique pour cet effet. Configure sa nature et sa valeur ci-dessous pour le simuler.</p>':'')+customEffectEditor(p,'set:'+key+':'+tier)+'</div>').join('')+'</details>';
 }).join('')+'</div></section>';
}
function weaponEditor(context,p) {
 const character=context.characters.find(row=>String(row._id)===String(p.character)),weapon=context.activeWeapon;
 const compatible=context.weapons.filter(row=>!character?.weaponType||row.weaponType===character.weaponType);
 const scope='weapon:'+String(weapon?._id||weapon?.id||'');
 const description=weapon?.['r'+(Number(p.weaponRefinement)||1)]?.description;
 return '<section class="lab-weapon-bench"><div class="lab-weapon-heading"><span class="eyebrow">ÉQUIPEMENT / MODIFIABLE ICI</span><strong>Choisis ton arme</strong></div>'+image(weapon?._labImage,'lab-weapon-preview','')+'<label class="lab-weapon-choice"><span>Arme du personnage</span><select data-lab-weapon><option value="">Sans arme</option>'+compatible.map(row=>'<option value="'+esc(row._id)+'" '+(weapon?._id===row._id?'selected':'')+'>'+esc(row._name||row.name)+' · '+row.rarity+'★</option>').join('')+'</select></label><label>Niveau<select data-lab-weapon-level>'+[1,20,40,50,60,70,80,90].map(level=>'<option '+(Number(p.weaponLevel)===level?'selected':'')+'>'+level+'</option>').join('')+'</select></label><label>Raffinement<select data-lab-weapon-refinement>'+[1,2,3,4,5].map(n=>'<option value="'+n+'" '+(Number(p.weaponRefinement)===n?'selected':'')+'>R'+n+'</option>').join('')+'</select></label>'+
  '<details class="lab-weapon-passive"><summary>Passif de l’arme '+ic('sliders')+'</summary>'+(weapon?'<h4>'+esc(weapon.effectName||'Effets de l’arme')+'</h4><div class="lab-effect-description">'+renderGameText(description||'Description indisponible.')+'</div>'+effectControls(p,scope,weaponEffectOptions(weapon,p.weaponRefinement))+customEffectEditor(p,scope):'<p>Équipe une arme pour régler ses effets.</p>')+'</details></section>';
}
