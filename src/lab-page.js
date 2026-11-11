import {compareLabScores} from './lab-comparison.js';
import {complexEffects} from './complex-effects.js';
import {effectCatalog} from './lab-effect-catalog.js';
import {drawPoster, posterBitmap, previewPng} from './poster-export.js?v=84';
import {attackOptions,attackKind,configuredSetEffects,configuredWeaponBonuses,typedAttackBonus,kitEffectDescriptions} from './lab-config.js?v=84';
import { LAB_REACTIONS, talentValueRows, parseActionValue, activeBuffBonuses } from './lab-actions.js?v=84';
import { pieceSubstats } from './build-model.js?v=20261110-builds-3';
import { prepareArtifactPools } from './optimizer.js';
import { renderLabWorkspace, renderLabResults, LAB_STAT_LABELS, labStatValue } from './lab-view.js?v=84';
import { renderGameText, skillValuesAtLevel } from './character-content.js?v=20261109-rich-text-1';
import { ARTIFACT_SLOTS, ARTIFACT_SLOT_LABELS, normalizeGoodArtifact, validateArtifact, usableArtifact, parseArtifactInventory, artifactSignature, artifactImportDelta, ARTIFACT_SUBSTAT_ROLLS, statVector } from './artifact-model.js?v=20261110-builds-3';
import { getCharacterPriority, setCharacterPriority, movePriority, positionPriority, priorityArtifactPool, getPriorityConfig, setPriorityConfig } from './priority-list.js';
import { characterDetails, skillList } from './data.js?v=84';
import { finalStats } from './damage-engine.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('fr-FR',{maximumFractionDigits:2}) : '—';
const KEY='astralis:gi:damage-lab:v1';
const defaults={tab:'overview',controlsVersion:1,effectStates:{},customEffects:{},weaponOverride:null,weaponRefinement:1,weaponLevel:90,attackSelection:'',characterLevel:90,constellation:0,buffs:[],referenceBonuses:{},statSchema:3,hitCount:1,reactingHits:1,simulationMode:'single',components:[],actionKind:'skill',loadout:'equipped',searchPreset:'balanced',talentLevel:10,targetName:'',referenceBuild:'',character:'',build:'',level:'',enemyLevel:100,atk:'',hp:'',def:'',em:'',critRate:'',critDmg:'',er:'',bonus:'',elementBonus:0,resistance:10,resReduction:0,defReduction:0,defIgnore:0,talent:'',baseStat:'atk',flat:0,critMode:'average',reaction:'none',reactionCoeff:'',reactionLevel:'',reactionBonus:0,ampBase:'',rotations:[],savedOptimizations:[],setEffects:'{}',topN:5,respectPriority:false,includeLocked:true,artifactLevelPreset:'0',configuration:'any',objective:'damage',mainStats:{sands:[],goblet:[],circlet:[]},minimums:{},allowedSets:[],requiredSets:[],excludedSets:[],excludedIds:[],rotationSeconds:'',repeatRotation:1};
const read=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}};
const write=data=>{localStorage.setItem(KEY,JSON.stringify(data));return data};
const field=(label,key,value,step='any',min='0')=>`<label class="lab-field"><span>${label}</span><input data-lab="${key}" type="number" step="${step}" min="${min}" value="${esc(value)}"></label>`;
const statNames={hp:'PV',atk:'ATQ',def:'DÉF',em:'Maîtrise élémentaire',critRate:'Taux CRIT (%)',critDmg:'DGT CRIT (%)',er:'Recharge (%)',bonus:'Bonus DGT (%)'};
let attackIndex=null, attackIndexPromise=null, attackCharacters=[];
export const foldAttackQuery=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/[^a-z0-9 ]/g,' ').trim();
function editDistance(a,b){if(Math.abs(a.length-b.length)>2)return 3;let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}return row[b.length];}
export function buildAttackSearchIndex(entries){return entries.map(entry=>{const search=foldAttackQuery([entry.character?._name,entry.name,entry.nameEn,entry.kind,entry.description,entry.descriptionEn].filter(Boolean).join(' '));return {...entry,search,tokens:[...new Set(search.split(/\s+/).filter(Boolean))]};});}
async function getAttackIndex(chars){if(attackIndex)return attackIndex;if(attackIndexPromise)return attackIndexPromise;attackCharacters=chars;attackIndexPromise=(async()=>{const results=[];let next=0;await Promise.all(Array.from({length:5},async()=>{while(next<chars.length){const c=chars[next++];try{const detail=await characterDetails('gi',c);results.push({status:'fulfilled',value:{c,skills:skillList('gi',c,detail||c)}});}catch{}}}));return results;})().then(rows=>{const entries=[];for(const row of rows)if(row.status==='fulfilled')for(const [i,s] of row.value.skills.entries()){const name=s.name||s.title||s.label;if(name)entries.push({id:`${row.value.c._id}:${i}`,character:row.value.c,name,nameEn:s.nameEn||s.name_en||'',kind:s.label||'Talent',icon:s.image||'',description:s.description||'',descriptionEn:s.descriptionEn||s.description_en||''});}attackIndex=buildAttackSearchIndex(entries);return attackIndex;}).catch(()=>[]);return attackIndexPromise;}
export function attackMatches(index,q){const query=foldAttackQuery(q);if(!query)return [];const parts=query.split(/\s+/),scored=[];for(const x of index){const exact=x.search.includes(query);let misses=0;for(const part of parts){let found=false;for(const token of x.tokens){if(token.startsWith(part)||part.length>=4&&editDistance(part,token)<=Math.min(2,Math.floor(part.length/4))){found=true;break;}}if(!found){misses++;break;}}if(exact||misses===0)scored.push({...x,score:exact?0:1});}return scored.sort((a,b)=>a.score-b.score||a.name.localeCompare(b.name)).slice(0,12);}
export function summarizeRotation(rows=[],repeatCount=1,durationOverride=0){
 const repeat=Math.max(1,Math.min(99,Number(repeatCount)||1)),known=rows.filter(row=>typeof row.damage==='number'&&Number.isFinite(row.damage)&&(row.damageKnown===true||!row.attackId)),unknown=rows.length-known.length;
 const knownTotal=known.reduce((sum,row)=>sum+(row.cycleDamages?.length===repeat?row.cycleDamages.reduce((a,b)=>a+b,0):row.damage*repeat),0),measuredDuration=Number(durationOverride)||rows.reduce((sum,row)=>sum+(Number(row.duration)||0),0),duration=measuredDuration*repeat;
 return {repeat,unknown,knownTotal,total:unknown?null:knownTotal,duration,dps:unknown||duration<=0?null:knownTotal/duration};
}

export function renderDamageLab(context={}) {
  labContext={characters:[],builds:[],inventory:[],sets:[],weapons:[],...context};
  labContext.inventory=normalizeLabInventory(labContext.inventory);
  labContext.invalidCount=labContext.inventory.filter(row=>!validateArtifact(row).valid).length;
  labContext.builds=labContext.builds.map(build=>({...build,character:canonicalLabCharacter(build.character)}));
  attackCharacters=labContext.characters;
  const p=read();
  p.character=canonicalLabCharacter(p.character);
  if(p.inventoryDefaultsVersion!==1){p.inventoryDefaultsVersion=1;p.artifactLevelPreset='0';p.respectPriority=false;p.configuration='any';p.referenceCharacter='';}
  write(p);
  if (!p.character && labContext.builds.length) {
    p.build=labContext.builds[0].id;
    p.character=String(labContext.builds[0].character);
    write(p);
  }
  return renderLabWorkspace(viewContext(p),p);
}
let labWorker=null,labJob=0,labDragId='',labLastResults=[],pendingInventory=[],filterSnapshot=null;
const jsonRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
function getForm(){const root=document.querySelector('[data-damage-lab]');if(!root)return read();const out={...read()},mainStats={sands:[],goblet:[],circlet:[]},minimums={};for(const el of root.querySelectorAll('[data-lab]')){const key=el.dataset.lab;out[key]=el.type==='checkbox'?el.checked:el.type==='number'?(el.value.trim()===''?'':Number(el.value)):el.value;if(key.startsWith('minimum-')&&el.value!=='')minimums[key.slice(8)]=Number(el.value);}for(const el of root.querySelectorAll('[data-lab-main]:checked')){const [slot,key]=el.dataset.labMain.split(':');if(mainStats[slot])mainStats[slot].push(key);}out.mainStats=mainStats;out.minimums=minimums;return out;}
function persist(){const p=getForm();write(p);return p;}
function statFromForm(p){return {hp:Number(p.hp)||0,atk:Number(p.atk)||0,def:Number(p.def)||0,em:Number(p.em)||0,critRate:Number(p.critRate)||0,critDmg:Number(p.critDmg)||0,er:Number(p.er)||0,dmgBonus:Number(p.bonus)||0};}
function reactionFromForm(p) {
  const id=p.reaction==='vapeur'?'vaporize':p.reaction;
  const definition=LAB_REACTIONS.find(row=>row[0]===id);
  if(!definition||id==='none')return null;
  const bonus=(Number(p.reactionBonus)||0)/100;
  if(definition[2]==='special')return {kind:'unavailable',name:definition[1]};
  if(definition[2]==='amplifying')return {kind:'amplifying',name:definition[1],baseMultiplier:p.ampBase===''?undefined:Number(p.ampBase),bonus};
  return {kind:definition[2],id,name:definition[1],coefficient:p.reactionCoeff===''?undefined:Number(p.reactionCoeff),
    levelMultiplier:p.reactionLevel===''?undefined:Number(p.reactionLevel),bonus,
    enemyResistance:Number(p.resistance)/100,resistanceReduction:Number(p.resReduction)/100};
}

async function calculate(p,overrides={}) {
  const {calculateAction}=await import('./damage-engine.js');
  const stats=overrides.stats||statsForCalculation(p);
  const buffs=activeBuffBonuses(p,p.elapsed||0);
  const allEffects={...(p.loadout==='equipped'&&p.build?equippedBonuses(p):p.referenceBonuses)};
  for(const source of [buffs,configuredWeaponBonuses(activeWeapon(p),p),p.importBonuses||{}])for(const [key,value]of Object.entries(source||{}))allEffects[key]=(allEffects[key]||0)+value;
  const complex=resolveComplex(p,stats);
  if(complex.warnings.some(w=>/ATQ finale|composition à renseigner/.test(w)))return {ok:false,error:complex.warnings.join(" · "),warnings:complex.warnings,stats};
  for(const [key,value]of Object.entries(complex.bonuses))allEffects[key]=(allEffects[key]||0)+value;
  const attackBonus=typedAttackBonus(allEffects,p.actionKind,stats);
  const result=calculateAction({
    stats,baseStat:p.baseStat,talentMultiplier:p.talent===''?NaN:Number(p.talent),
    talentScale:complex.talentScale,additivePools:complex.pools,poolState:overrides.poolState,targetCount:Number(p.targetCount)||1,elapsed:p.elapsed||0,actionKind:p.actionKind,
    flatDamage:(Number(p.flat)||0)+(allEffects.flatDamage||0)+complex.flatDamage,damageBonus:(Number(p.elementBonus)||0)+attackBonus,
    hitCount:Number(p.hitCount)||1,components:p.components?.length?p.components:undefined,reactingHits:Number(p.reactingHits)||0,
    attackerLevel:Number(p.level),enemyLevel:Number(p.enemyLevel),enemyResistance:Number(p.resistance)/100,
    resistanceReduction:((Number(p.resReduction)||0)+(allEffects.resReduction||0))/100,enemyDefenseReduction:((Number(p.defReduction)||0)+(allEffects.defReduction||0))/100,
    defenseIgnore:((Number(p.defIgnore)||0)+(allEffects.defIgnore||0))/100,critMode:overrides.critMode||p.critMode,
    reaction:Object.hasOwn(overrides,'reaction')?overrides.reaction:reactionFromForm(p),elementKey:p.elementKey||'',
  });
  return {...result,stats,warnings:[...(result.warnings||[]),...complex.warnings],complexDetails:complex.details};
}
function showResult(result){const root=document.querySelector('[data-damage-lab]');if(!root)return;root.querySelector('[data-lab-result-title]').textContent='Dégâts de l’attaque · '+(result.totalHits||1)+' coup(s)';const damage=root.querySelector('[data-lab-damage]'),warn=root.querySelector('[data-lab-warning]'),breakdown=root.querySelector('[data-lab-breakdown]');if(!result.ok){damage.textContent='TODO_DATA';warn.textContent=result.error;breakdown.innerHTML='<p>Calcul interrompu : complète les valeurs signalées TODO_DATA.</p>';return;}damage.textContent=fmt(result.total);warn.textContent=result.warnings.join(' · ')||`Niveau personnage ${getForm().level} · ennemi ${getForm().enemyLevel} · hypothèses éditables`;const rows=[['Base talent',result.base],['Terme additif',result.additive],['Bonus dégâts',`× ${fmt(result.bonusMultiplier)}`],['CRIT',`× ${fmt(result.critMultiplier)}`],['Défense',`× ${fmt(result.defenseMultiplier)}`],['Résistance',`× ${fmt(result.resistanceMultiplier)}`],['Multiplicateur amplifiant',`× ${fmt(result.reactionMultiplier)}`],['Réaction transformative',result.transformative],['Total',result.total]];if(result.complexDetails?.length)rows.push(...result.complexDetails.map(row=>[row.name,row.flatDamage!=null?row.flatDamage:JSON.stringify(row.bonuses||{hpPct:row.hpPct})]));if(result.triggered&&Object.keys(result.triggered).length)rows.push(['Plumes consommées',JSON.stringify(result.triggered)]);breakdown.innerHTML=`<div class="lab-breakdown-table">${rows.map(([k,v])=>`<div><span>${k}</span><b>${typeof v==='number'?fmt(v):esc(v)}</b></div>`).join('')}</div>`;}
function updateRotationSummary(root,p) {
  const summary=summarizeRotation(p.rotations||[],p.repeatRotation,p.rotationSeconds);
  const damage=summary.total==null?fmt(summary.knownTotal)+' connus · données manquantes':fmt(summary.total);
  const dps=summary.dps==null?'Durée à renseigner pour le DPS':fmt(summary.dps)+' DPS';
  root.querySelector('[data-lab-rotation-total]').textContent=(p.rotations||[]).length+' actions · ×'+summary.repeat+' · '+damage+' DGT · '+dps;
}

function displayRotation() {
  const root=document.querySelector('[data-damage-lab]');
  if(!root)return;
  const p=read(),context=viewContext(p);
  const choices=attackOptions(context,p);
  root.querySelector('[data-lab-rotation-list]').innerHTML=(p.rotations||[]).map((row,index)=>
    '<li class="lab-rotation-step" draggable="true" data-rotation-index="'+index+'">'+
    '<span class="lab-rotation-step-icon rotation-icon">'+(row.icon?'<img src="'+esc(row.icon)+'" alt="" onerror="this.hidden=true">':'<b>'+esc(row.code||row.params?.actionKind?.[0]?.toUpperCase()||'A')+'</b>')+'</span>'+
    '<div class="lab-rotation-step-label"><b>'+esc(row.label||row.name||'Action à sélectionner')+'</b><select data-lab-rotation-attack="'+index+'" aria-label="Attaque de l’étape '+(index+1)+'"><option value="">Choisir une attaque précise…</option>'+choices.map(choice=>'<option value="'+choice.id+'" '+(row.params?.attackSelection===choice.id?'selected':'')+'>'+esc(choice.label)+'</option>').join('')+'</select>'+
    '<small>'+(row.params?.hitCount||'—')+' coup(s) par attaque · '+esc(row.params?.reaction||'none')+'</small></div>'+
    '<label class="lab-action-duration">×<input type="number" min="1" max="100" step="1" value="'+esc(row.count||1)+'" data-lab-action-count="'+index+'" aria-label="Répétitions de l’action '+(index+1)+'"></label>'+
    '<label class="lab-action-duration"><input type="number" min="0" step="0.1" value="'+esc(row.duration||0)+'" data-lab-duration="'+index+'" aria-label="Durée de l’action '+(index+1)+'"> s</label>'+
    '<b data-lab-rotation-damage="'+index+'">'+(row.damageKnown?fmt(row.damage):'À compléter')+'</b>'+
    '<button class="quiet-btn" type="button" data-lab-rotation-shift="-1" data-index="'+index+'" '+(index===0?'disabled':'')+' aria-label="Avancer l’action">←</button>'+
    '<button class="quiet-btn" type="button" data-lab-rotation-shift="1" data-index="'+index+'" '+(index===(p.rotations||[]).length-1?'disabled':'')+' aria-label="Reculer l’action">→</button>'+
    '<button class="quiet-btn" type="button" data-lab-action="remove-hit" data-index="'+index+'" aria-label="Retirer l’action">×</button></li>').join('')||
    '<li class="lab-empty"><h4>Choisis une attaque ou compose une rotation</h4><p>Sélectionne une valeur dans les talents puis ajoute-la ici.</p></li>';
  updateRotationSummary(root,p);
  recomputeRotation(root,p);
}

function move(id,delta) {
  const list=document.querySelector('[data-lab-priority]');
  if(!list)return;
  setCharacterPriority([...list.querySelectorAll('[data-priority-id]')].map(row=>row.dataset.priorityId));
  movePriority(id,delta);
  refreshLab('[data-priority-id="'+CSS.escape(id)+'"]');
}

function setCycle(button) {
  const states=['allow','required','exclude'];
  const next=states[(states.indexOf(button.dataset.state)+1)%states.length];
  button.dataset.state=next;
  button.className='lab-set-choice is-'+next;
  const label={allow:'Autorisé',required:'Imposé',exclude:'Exclu'}[next];
  button.querySelector('small').textContent=label;
  button.setAttribute('aria-label',button.querySelector('b').textContent+' · '+label);
  const p=syncSetFilterArrays(getForm());
  write(p);
}
function filterSummary(root,p) {
  const chips=[];
  if(Number(p.artifactLevelPreset)>0)chips.push(['Niv. '+p.artifactLevelPreset+' et plus','level']);
  for(const state of ['excludedSets','requiredSets']) {
    for(const key of p[state]||[]) {
      const set=labContext.sets.find(s=>String(s._labKey||s._key||s._id)===String(key));
      chips.push([(state==='requiredSets'?'Imposé':'Exclu')+' · '+(set?._name||key),'set:'+key]);
    }
  }
  for(const [slot,values] of Object.entries(p.mainStats||{})) {
    for(const value of values)chips.push([ARTIFACT_SLOT_LABELS[slot]+' · '+(LAB_STAT_LABELS[value]||value),'main:'+slot+':'+value]);
  }
  for(const [key,value] of Object.entries(p.minimums||{}))chips.push([(LAB_STAT_LABELS[key]||key)+' ≥ '+value,'min:'+key]);
  root.querySelector('[data-lab-active-filters]').innerHTML=chips.map(([label,key])=>'<button class="lab-filter-chip" data-remove-filter="'+esc(key)+'" type="button">'+esc(label)+'<span aria-hidden="true">×</span></button>').join('')||'<small>Toutes les pièces compatibles sont autorisées.</small>';
}
function syncSetFilterArrays(p) {
 const boxes=[...document.querySelectorAll('[data-lab-allow-set]')];
 if(boxes.length){p.allowedSets=[];p.excludedSets=boxes.filter(box=>!box.checked).map(box=>box.dataset.labAllowSet);}
 p.requiredSets=[...document.querySelectorAll('[data-lab-require-set]:checked')].map(box=>box.dataset.labRequireSet);
 return p;
}
function inventoryAnalysis(p) {
  const inventory=normalizeLabInventory(jsonRead('astralis:gi:owned-artifacts',[]));
  const valid=inventory.filter(piece=>usableArtifact(piece));
  const source=p.respectPriority&&p.character
    ? priorityArtifactPool(valid,String(p.character),{enabled:true,characters:labContext.characters})
    : valid;
  const prepared=prepareArtifactPools(source,{
    includeLocked:p.includeLocked!==false,minLevel:Number(p.artifactLevelPreset)||0,allowedSets:p.allowedSets,requiredSets:p.requiredSets,
    excludedSets:p.excludedSets,excludedIds:p.excludedIds,mainStats:p.mainStats,
  });
  return {inventory,valid,...prepared};
}

function updateEstimate(root,p) {
  const analysis=inventoryAnalysis(p);
  const missing=ARTIFACT_SLOTS.filter(slot=>!analysis.counts[slot]);
  const label=root.querySelector('[data-lab-metrics]');
  if(!label.dataset.running) {
    label.textContent=analysis.source.length+' pièces retenues sur '+analysis.valid.length+' utilisables · '+
      analysis.combinations.toLocaleString('fr-FR')+' assemblages'+
      (missing.length?' · Manque '+missing.map(slot=>ARTIFACT_SLOT_LABELS[slot]).join(', '):' avant élagage');
  }
  filterSummary(root,p);
}
function bind(){if(document.documentElement.dataset.labBound)return;document.documentElement.dataset.labBound='1';let searchTimer=0;document.addEventListener('input',e=>{const root=e.target.closest?.('[data-damage-lab]');if(root&&e.target.matches('[data-lab]')){const p=persist();if(['talent','hitCount'].includes(e.target.dataset.lab)){p.components=[];write(p);}updateEstimate(root,p);displayRotation();}if(e.target.matches('[data-attack-search]')){clearTimeout(searchTimer);searchTimer=setTimeout(()=>renderAttackResults(e.target),50);}});document.addEventListener('change',e=>{const root=e.target.closest?.('[data-damage-lab]');if(root&&e.target.matches('[data-lab], [data-lab-main]')){const p=persist();updateEstimate(root,p);displayRotation();if(e.target.dataset.lab==='character')saveCharacterMemo(p);}});document.addEventListener('click',async e=>{const root=e.target.closest?.('[data-damage-lab]');if(!root)return;const hit=e.target.closest('[data-attack-hit]');if(hit){const row=attackIndex?.find(x=>x.id===hit.dataset.attackHit);if(row)addAttackToRotation(row);return;}const b=e.target.closest('[data-lab-action]');if(b){const action=b.dataset.labAction,p=syncSetFilterArrays(getForm());write(p);if(action==='save'){root.querySelector('[data-lab-status]').textContent='Paramètres enregistrés localement.';saveCharacterMemo(p);}if(action==='calculate'){if(p.simulationMode==='rotation')await showRotationResult(root,p);else showResult(await calculate(p));}if(action==='compare')await compareCurrent(root,p);if(action==='sensitivity')await showSensitivity(root,p);if(action==='add-hit'){const result=await calculate(p);if(result.ok){p.rotations=[...(p.rotations||[]),{label:p.targetName||'Attaque · '+p.baseStat.toUpperCase(),damage:result.total,damageKnown:true,params:captureTarget(p),characterId:p.character,count:1,icon:p.targetIcon||'',duration:0}];write(p);displayRotation();}}if(action==='clear-rotation'){p.rotations=[];write(p);displayRotation();}if(action==='remove-hit'){p.rotations.splice(Number(b.dataset.index),1);write(p);displayRotation();}if(action==='priority-up')move(b.dataset.id,-1);if(action==='priority-down')move(b.dataset.id,1);if(action==='optimize')runOptimizer(root,p);if(action==='apply-result')applyResult(root,p,Number(b.dataset.index));if(action==='cancel'&&labWorker){labWorker.terminate();labWorker=null;delete root.querySelector('[data-lab-metrics]').dataset.running;root.querySelector('[data-lab-metrics]').textContent='Recherche annulée.';b.disabled=true;}if(action==='commit-import')commitInventory(root);if(action==='reset-filters')resetFilters(root);if(action==='undo-filters')undoFilters(root);if(action==='apply-preset')applyPreset(root);return;}const level=e.target.closest('[data-lab-preset]');if(level){const p=persist();filterSnapshot={...p};p.artifactLevelPreset=level.dataset.labPreset;write(p);root.querySelectorAll('[data-lab-preset]').forEach(x=>x.classList.toggle('active',x===level));updateEstimate(root,p);return;}const config=e.target.closest('[data-lab-config]');if(config){const p=persist();p.configuration=config.dataset.labConfig;write(p);root.querySelectorAll('[data-lab-config]').forEach(x=>{const yes=x===config;x.classList.toggle('active',yes);x.setAttribute('aria-pressed',String(yes));});return;}const set=e.target.closest('[data-lab-set]');if(set){setCycle(set);updateEstimate(root,read());return;}const remove=e.target.closest('[data-remove-filter]');if(remove){removeFilter(root,remove.dataset.removeFilter);return;}} ,true);document.addEventListener('dragstart',e=>{const priority=e.target.closest?.('[data-priority-id]'),rotation=e.target.closest?.('[data-rotation-index]');if(priority){labDragId=`priority:${priority.dataset.priorityId}`;e.dataTransfer?.setData('text/plain',labDragId);}else if(rotation){labDragId=`rotation:${rotation.dataset.rotationIndex}`;e.dataTransfer?.setData('text/plain',labDragId);}});document.addEventListener('dragover',e=>{if(e.target.closest?.('[data-priority-id],[data-rotation-index]'))e.preventDefault();});document.addEventListener('drop',e=>{const row=e.target.closest?.('[data-priority-id],[data-rotation-index]');if(!row||!labDragId)return;e.preventDefault();const [kind,index]=labDragId.split(':');if(kind==='priority'&&row.dataset.priorityId){const ids=getCharacterPriority(),from=ids.indexOf(index),to=ids.indexOf(row.dataset.priorityId);if(from>=0&&to>=0){ids.splice(to,0,ids.splice(from,1)[0]);setCharacterPriority(ids);refreshLab();}}else if(kind==='rotation'&&row.dataset.rotationIndex!==undefined){const p=read(),from=Number(index),to=Number(row.dataset.rotationIndex);p.rotations.splice(to,0,p.rotations.splice(from,1)[0]);write(p);displayRotation();}labDragId='';});document.addEventListener('keydown',e=>{const row=e.target.closest?.('[data-priority-id]');if(!row||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();move(row.dataset.priorityId,e.key==='ArrowUp'?-1:1);});document.addEventListener('change',e=>{if(!e.target.matches('[data-lab-import]'))return;previewInventory(e.target);});}
function saveCharacterMemo(p){if(!p.character)return;const all=jsonRead('astralis:gi:lab-character-settings:v1',{});all[p.character]={...p,rotations:undefined};localStorage.setItem('astralis:gi:lab-character-settings:v1',JSON.stringify(all));}
function previewInventory(input){const root=input.closest('[data-damage-lab]'),box=root.querySelector('[data-lab-import-preview]'),status=root.querySelector('[data-lab-import-status]'),commit=root.querySelector('[data-lab-action="commit-import"]'),file=input.files?.[0];pendingInventory=[];commit.disabled=true;if(!file){box.hidden=true;return;}if(file.size>25*1024*1024){status.textContent='Fichier supérieur à 25 Mo : aperçu refusé.';return;}const reader=new FileReader();reader.onload=()=>{try{const result=parseArtifactInventory(String(reader.result||''));pendingInventory=result.rows.filter(x=>usableArtifact(x));const validCopies=pendingInventory.length,invalid=result.invalid,existing=jsonRead('astralis:gi:owned-artifacts',[]).map((x,i)=>normalizeGoodArtifact(x,i)),delta=artifactImportDelta(existing,pendingInventory);status.textContent=`${validCopies} exemplaires utilisables · ${delta.length} nouveaux à ajouter · ${invalid} avec avertissement(s) de paliers · doublons conservés comme exemplaires`;box.hidden=false;box.innerHTML=`<b>Aperçu local · ${esc(file.name)}</b><div class="lab-import-counts">${ARTIFACT_SLOTS.map(s=>`<span>${ARTIFACT_SLOT_LABELS[s]} · ${pendingInventory.filter(x=>x.slot===s).length}</span>`).join('')}</div><ul>${result.rows.slice(0,8).map(x=>`<li class="${validateArtifact(x).valid?'':'is-invalid'}">${esc(x.setKey)} · ${ARTIFACT_SLOT_LABELS[x.slot]||'Emplacement inconnu'} · niv. ${x.level} · ${x.mainType} ${fmt(x.mainValue)}${x.duplicate?' · exemplaire répété conservé':''}${!validateArtifact(x).valid?` · ${esc(validateArtifact(x).issues[0])}`:''}</li>`).join('')}</ul>${result.rows.length>8?`<small>${result.rows.length-8} ligne(s) supplémentaires omises de l’aperçu.</small>`:''}`;commit.disabled=!delta.length;}catch(error){box.hidden=true;status.textContent=String(error.message||error);}};reader.onerror=()=>status.textContent='Lecture impossible. Le fichier local est peut-être endommagé.';reader.readAsText(file);}
function commitInventory(root){const stored=jsonRead('astralis:gi:owned-artifacts',[]),existing=stored.map((x,i)=>normalizeGoodArtifact(x,i)),fresh=artifactImportDelta(existing,pendingInventory),saved=[...stored,...fresh];localStorage.setItem('astralis:gi:owned-artifacts',JSON.stringify(saved));pendingInventory=[];root.querySelector('[data-lab-action="commit-import"]').disabled=true;root.querySelector('[data-lab-import-status]').textContent=`${fresh.length} nouvelle(s) relique(s) ajoutée(s) · ${saved.length} exemplaires au total`;root.querySelector('[data-lab-import-preview]').hidden=true;updateEstimate(root,read());}
function removeFilter(root,key){const p=getForm();if(key==='level')p.artifactLevelPreset='0';else if(key.startsWith('set:')){const id=key.slice(4);p.excludedSets=p.excludedSets.filter(x=>x!==id);p.requiredSets=p.requiredSets.filter(x=>x!==id);p.allowedSets=p.allowedSets.filter(x=>x!==id);const button=root.querySelector(`[data-lab-set="${CSS.escape(id)}"]`);if(button){button.dataset.state='allow';button.className='lab-set-choice is-allow';button.querySelector('small').textContent='Autorisé';}}else if(key.startsWith('main:')){const [,slot,value]=key.split(':');p.mainStats[slot]=p.mainStats[slot].filter(x=>x!==value);const cb=root.querySelector(`[data-lab-main="${CSS.escape(`${slot}:${value}`)}"]`);if(cb)cb.checked=false;}else if(key.startsWith('min:')){delete p.minimums[key.slice(4)];const field=root.querySelector(`[data-lab="minimum-${CSS.escape(key.slice(4))}"]`);if(field)field.value='';}write(p);updateEstimate(root,p);}
function resetFilters(root){filterSnapshot=getForm();const p={...read(),artifactLevelPreset:'0',mainStats:{sands:[],goblet:[],circlet:[]},minimums:{},allowedSets:[],requiredSets:[],excludedSets:[],excludedIds:[]};write(p);root.querySelectorAll('[data-lab-main]').forEach(x=>x.checked=false);root.querySelectorAll('[data-lab-allow-set]').forEach(x=>x.checked=true);root.querySelectorAll('[data-lab-require-set]').forEach(x=>x.checked=false);root.querySelectorAll('[data-lab-set]').forEach(x=>{x.dataset.state='allow';x.className='lab-set-choice is-allow';x.querySelector('small').textContent='Autorisé';});root.querySelectorAll('[data-lab^="minimum-"]').forEach(x=>x.value='');root.querySelectorAll('[data-lab-preset]').forEach(x=>x.classList.toggle('active',x.dataset.labPreset==='0'));updateEstimate(root,p);}
function undoFilters(root){if(!filterSnapshot){root.querySelector('[data-lab-status]').textContent='Aucun changement de filtre à annuler.';return;}write(filterSnapshot);refreshLab();}
function applyPreset(root){const mode=root.querySelector('[data-lab-preset-select]').value,p=getForm();filterSnapshot={...p};p.configuration=mode==='quick'?'any':'standard';p.artifactLevelPreset=mode==='quick'?'20':mode==='precise'?'0':'16';if(mode==='quick')p.topN=3;if(mode==='precise')p.topN=10;write(p);refreshLab();}
function renderAttackResults(input){const box=input.closest('[data-damage-lab]')?.querySelector('[data-attack-results]'),q=input.value.trim();if(!box)return;if(!q){box.hidden=true;return;}box.hidden=false;if(!attackIndex){box.innerHTML='<div class="lab-search-loading">Index des talents en cours de préparation…</div>';getAttackIndex(attackCharacters).then(()=>{if(input.isConnected&&input.value.trim())renderAttackResults(input);});return;}const rows=attackMatches(attackIndex,q);box.innerHTML=rows.length?rows.map(x=>`<article class="lab-attack-result"><div class="lab-attack-icon">${x.icon?`<img src="${esc(x.icon)}" alt="" onerror="this.remove();this.parentElement.textContent='✦'">`:'✦'}</div><div><b>${esc(x.name)}</b><small>${esc(x.character._name)} · ${esc(x.kind)}</small></div><button class="quiet-btn" data-attack-hit="${esc(x.id)}">Ajouter à la rotation</button></article>`).join(''):'<p class="lab-search-empty">Aucun talent correspondant dans les données chargées.</p>';}
function estimateText(pool,p){const counts=ARTIFACT_SLOTS.map(s=>pool.filter(x=>x.slot===s).length);const n=counts.reduce((a,b)=>a*b,1);const measured=Number(localStorage.getItem('astralis:gi:lab-speed:v1'))||0;return {n,seconds:measured?Math.ceil(n/measured):null,counts};}
function optimizerHit(p){
 return {targetCount:Number(p.targetCount)||1,complexEffects:p.complexEffects,complexContext:{character:labContext.characters.find(c=>String(c._id)===String(p.character))?.id||p.character,weaponId:activeWeapon(p)?.id,refinement:p.weaponRefinement,constellation:p.constellation,teamElements:p.complexTeamElements||[],elapsed:p.elapsed||0,fightPosition:p.fightPosition},actionKind:p.actionKind,hitCount:Number(p.hitCount)||1,components:p.components?.length?p.components:undefined,
  reactingHits:Number(p.reactingHits)||0,talentMultiplier:p.talent===''?NaN:Number(p.talent),baseStat:p.baseStat,flatDamage:Number(p.flat)||0,
  attackerLevel:Number(p.level),enemyLevel:Number(p.enemyLevel),enemyResistance:Number(p.resistance)/100,
  resistanceReduction:(Number(p.resReduction)||0)/100,enemyDefenseReduction:(Number(p.defReduction)||0)/100,
  defenseIgnore:Number(p.defIgnore)/100,critMode:p.critMode,reaction:reactionFromForm(p),
  elementKey:p.elementKey||'',damageBonus:Number(p.elementBonus)||0};
}
async function runOptimizer(root,p,weighted=[]) {
  const analysis=inventoryAnalysis(p);
  const missing=ARTIFACT_SLOTS.filter(slot=>!analysis.counts[slot]);
  const metrics=root.querySelector('[data-lab-metrics]');
  if(missing.length) {
    metrics.textContent='Aucune combinaison · '+missing.map(slot=>ARTIFACT_SLOT_LABELS[slot]).join(', ')+
      ' sans pièce admissible. Retire un filtre de niveau, de stat ou de set.';
    return;
  }
  if(!p.character) {metrics.textContent='Choisis un personnage pour cette optimisation.';return;}
  if(['damage','dps'].includes(p.objective)) {
    const check=await calculate(weighted[0]?.params||p);
    if(!check.ok) {metrics.textContent='Complète l’attaque cible et ses paramètres dans la vue d’ensemble.';return;}
    if(p.objective==='dps' && !(Number(p.rotationSeconds)>0)) {
      metrics.textContent='Renseigne la durée dans l’onglet Rotation pour calculer un DPS.';
      return;
    }
  }
  let effects;
  try {effects=configuredSetEffects(labContext.sets,p);}
  catch {metrics.textContent='Impossible de lire les conditions des sets.';return;}
  const resultBox=root.querySelector('[data-lab-results]');
  const cancel=root.querySelector('[data-lab-action="cancel"]');
  const currentIds=equippedPieces(p).filter(Boolean).map(piece=>piece.id);
  const valid=analysis.valid;
  labWorker?.terminate();
  labWorker=new Worker(new URL('./optimizer.worker.js?v=83',import.meta.url),{type:'module'});
  const id=++labJob;
  cancel.disabled=false;
  metrics.dataset.running='1';
  metrics.textContent='Recherche en cours · '+analysis.combinations.toLocaleString('fr-FR')+' assemblages avant élagage';
  resultBox.innerHTML='<div class="lab-empty"><h4>Recherche des meilleurs assemblages</h4><p>Tu peux continuer à consulter tes talents ou interrompre la recherche.</p></div>';
  const finish=()=>{
    if(id!==labJob)return;
    delete metrics.dataset.running;
    cancel.disabled=true;
    labWorker?.terminate();
    labWorker=null;
  };
  labWorker.onmessage=async event=>{
    const message=event.data;
    if(message.id!==id||!root.isConnected)return;
    if(message.type==='progress') {
      const progress=message.progress;
      root.querySelector('[data-lab-progress]').value=progress.combinations?Math.min(99,progress.visited/progress.combinations*100):0;
      metrics.textContent=progress.visited.toLocaleString('fr-FR')+' configurations évaluées · '+progress.pruned.toLocaleString('fr-FR')+' branches élaguées';
    }
    if(message.type==='result') {
      const out=message.result;
      labLastResults=out.results||[];
      root.querySelector('[data-lab-progress]').value=out.exact?100:99;
      metrics.textContent=(out.exact?'Recherche exacte terminée':'Recherche interrompue')+' · '+out.visited.toLocaleString('fr-FR')+
        ' évaluées · '+out.pruned.toLocaleString('fr-FR')+' élaguées · '+fmt(out.elapsedMs)+' ms';
      if(out.elapsedMs>0)localStorage.setItem('astralis:gi:lab-speed:v1',String(Math.max(1,out.visited/(out.elapsedMs/1000))));
      const baseline=weighted.length?{ok:true,total:(await Promise.all(weighted.map(async row=>(await calculate(row.params)).total*row.weight))).reduce((a,b)=>a+b,0)}:await calculate(p);
      resultBox.innerHTML=renderLabResults(viewContext(p),{...p,weightedResult:weighted.length>0},labLastResults,baseline,out.error);
      finish();
    }
    if(message.type==='error') {metrics.textContent='Erreur de recherche · '+message.error;finish();}
  };
  labWorker.onerror=event=>{metrics.textContent='Le calcul a rencontré une erreur · '+event.message;finish();};
  labWorker.postMessage({type:'optimize',id,options:{
    inventory:p.respectPriority?priorityArtifactPool(valid,String(p.character),{enabled:true,characters:labContext.characters}):valid,
    currentIds,input:{
      level:Number(p.level),baseStats:statFromForm(p),bonuses:optimizerBonuses(p),setEffects:effects,
      hit:optimizerHit(p),weightedHits:weighted.map(row=>({hit:optimizerHit(row.params),weight:row.weight,bonuses:row.params.importBonuses})),
      rotationDuration:Number(p.rotationSeconds)||0,
    },
    topN:Number(p.topN)||5,objective:p.objective,filters:{
      configuration:p.configuration,includeLocked:p.includeLocked!==false,minLevel:Number(p.artifactLevelPreset)||0,allowedSets:p.allowedSets,
      requiredSets:p.requiredSets,excludedSets:p.excludedSets,mainStats:p.mainStats,minimums:p.minimums,excludedIds:p.excludedIds,
    },
  }});
}
async function compareCurrent(root,p) {
  const current=await calculate(p);
  if(!current.ok){showResult(current);return;}
  if(!p.referenceStats) {
    root.querySelector('[data-lab-comparison]').innerHTML='<p class="lab-note">Charge un build pour conserver une référence, puis modifie les statistiques ou les conditions de l’attaque.</p>';
    showResult(current);
    return;
  }
  const reference=await calculate(p,{stats:p.referenceStats});
  if(!reference.ok){showResult(reference);return;}
  renderComparison(root,reference,current);
  showResult(current);
}

function renderComparison(root,before,after) {
  const delta=after.total-before.total,max=Math.max(1,before.total,after.total);
  const comparison=compareLabScores(before.total,after.total),gain=comparison.percent;
  root.querySelector('[data-lab-comparison]').innerHTML=
    [['Build de référence',before.total],['Configuration comparée',after.total]].map(([label,value],index)=>
      '<div class="lab-compare-row '+(index?'is-after':'')+'"><span>'+label+'</span><div><i style="--bar:'+Math.max(1,value/max*100)+'%"></i></div><b>'+fmt(value)+'</b></div>').join('')+
    '<strong class="lab-delta">'+(delta>=0?'+':'')+fmt(delta)+(gain==null?' · '+esc(comparison.label):' · '+(gain>=0?'+':'')+fmt(gain)+' %')+'</strong>'+
    '<div class="lab-stat-cascade">'+['hp','atk','def','em','critRate','critDmg','er'].map(key=>{
      const a=before.stats?.[key],b=after.stats?.[key];
      if(a==null||b==null||Math.abs(a-b)<.001)return '';
      return '<div><span>'+esc(LAB_STAT_LABELS[key])+'</span><b>'+esc(labStatValue(key,a))+' → '+esc(labStatValue(key,b))+'</b></div>';
    }).join('')+'</div>'+
    '<small>Même attaque, même réaction et même ennemi. Les différences viennent des statistiques des deux configurations.</small>';
}
async function showSensitivity(root,p) {
  const base=await calculate(p);
  if(!base.ok){showResult(base);return;}
  const stats=statsForCalculation(p);
  const trials=[['+1 % Taux CRIT','critRate',1],['+1 % DGT CRIT','critDmg',1],['+10 maîtrise','em',10],
    ['1 roll Taux CRIT','critRate',3.89],['1 roll DGT CRIT','critDmg',7.77],['1 roll maîtrise','em',23.31]];
  const rows=[];
  for(const [label,key,value] of trials) {
    const next=await calculate(p,{stats:{...stats,[key]:stats[key]+value}});
    if(next.ok)rows.push({label,delta:next.total-base.total});
  }
  rows.sort((a,b)=>b.delta-a.delta);
  root.querySelector('[data-lab-sensitivity]').innerHTML='<h4>Ce qui rapporte le plus</h4>'+rows.map(row=>
    '<div><span>'+row.label+'</span><b>'+(row.delta>=0?'+':'')+fmt(row.delta)+'</b></div>').join('')+
    '<small>Gain marginal pour cette attaque. Un roll utilise le palier maximal 5★.</small>';
  showResult(base);
}
function applyResult(root,p,index,createNew=false) {
  const result=labLastResults[index];
  if(!result)return;
  const builds=jsonRead('astralis:gi:builds',[]);
  let build=builds.find(row=>String(row.id)===String(p.build));
  if(createNew) {
    build={...build,id:crypto.randomUUID(),character:String(p.character),
      name:(build?.name||labContext.characters.find(c=>String(c._id)===String(p.character))?._name||'Build')+' · optimisé',
      pieces:build?.pieces?.map(piece=>({...piece}))||[]};
  }
  if(!build) {root.querySelector('[data-lab-status]').textContent='Choisis un build ou crée un nouveau build depuis ce résultat.';return;}
  const pieces=result.rows.map(id=>labContext.inventory.find(piece=>String(piece.id)===String(id)));
  if(pieces.length!==5||pieces.some(piece=>!piece)) {root.querySelector('[data-lab-status]').textContent='Une des cinq pièces n’est plus disponible dans l’inventaire.';return;}
  build.pieces=ARTIFACT_SLOTS.map((slot,index)=>{
    const piece=pieces.find(row=>row.slot===slot);
    const set=labContext.sets.find(row=>[row._id,row._key,row._labKey].map(String).includes(String(piece.setKey)));
    const selected={...build.pieces?.[index],set:set?._id||piece.setKey,ownedArtifactId:piece.id,mainType:piece.mainType,
      mainValue:piece.mainValue,rarity:piece.rarity,level:piece.level,substats:piece.substats};
    for(let n=0;n<4;n++) {selected['sub'+n+'Type']=piece.substats[n]?.type||'';selected['sub'+n+'Value']=piece.substats[n]?.value??'';}
    return selected;
  });
  if(createNew)builds.push(build);
  localStorage.setItem('astralis:gi:builds',JSON.stringify(builds));
  write({...read(),build:build.id});
  refreshLab();
  document.querySelector('[data-lab-status]').textContent=createNew?'Nouveau build enregistré avec les cinq pièces.':'Les cinq pièces du build ont été remplacées par ce résultat.';
}
export function initDamageLab() {
  bind();bindWorkspace();checkLabSync();
  const root=document.querySelector('[data-damage-lab]');
  if (!root) return;
  displayRotation();updateEstimate(root,read());
  loadActiveKit();
  const p=read();
  if(p.character&&(p.referenceCharacter!==p.character||p.statSchema!==3||p.atk===''))loadActiveBuild(root,p);
}

let buildRequestKey='';
let labContext = {characters:[], builds:[], inventory:[], sets:[], weapons:[]};
const kitCache = new Map();
const kitRequests = new Map();

function canonicalLabCharacter(id) {
  return String(labContext.characters.find(c=>String(c._id)===String(id)||String(c.id)===String(id))?._id||id||'');
}

function selectedBuild(p) {
  return labContext.builds.find(build => String(build.id)===String(p.build));
}

function activeWeapon(p) {
 const build=selectedBuild(p);
 const id=p.weaponOverride??build?.weapon??'';
 return (labContext.weapons||[]).find(row=>String(row._id)===String(id)||String(row.id)===String(id));
}
function effectiveBuild(p) {
 const saved=selectedBuild(p);
 return {...saved,character:p.character,level:Number(p.level)||Number(saved?.level)||90,constellation:p.constellation??saved?.constellation??0,
   weapon:p.weaponOverride??saved?.weapon??'',weaponRefinement:Number(p.weaponRefinement)||Number(saved?.weaponRefinement)||1,
   weaponLevelValue:Number(p.weaponLevel)||Number(saved?.weaponLevelValue)||90,
   forceTheory:true,pieces:saved?.pieces||[]};
}
function equippedPieces(p) {
  const build = selectedBuild(p);
  return ARTIFACT_SLOTS.map((slot,index) => {
    const piece = build?.pieces?.[index];
    if (!piece) return null;
    const imported = labContext.inventory.find(row=>String(row.id)===String(piece.ownedArtifactId));
    if (imported) return imported;
    if (!piece.mainType) return null;
    return normalizeGoodArtifact({
      ...piece, slot, setKey:labContext.sets.find(set=>[set._id,String(set.id),...(set._labAliases||[])].includes(piece.set))?._labKey||piece.set, rarity:piece.rarity,
      substats:pieceSubstats(piece),
    },index);
  });
}

function equippedBonuses(p) {
  const bonuses = {...p.referenceBonuses};
  const counts = new Map();
  for (const piece of equippedPieces(p).filter(Boolean)) {
    for (const [key,value] of Object.entries(statVector(piece))) bonuses[key]=(bonuses[key]||0)+value;
    counts.set(piece.setKey,(counts.get(piece.setKey)||0)+1);
  }
  let effects = {};
  effects=configuredSetEffects(labContext.sets,p);
  for (const [key,count] of counts) {
    for (const tier of [2,4]) {
      if (count < tier) continue;
      for (const [stat,value] of Object.entries(effects[key]?.[tier===2?'two':'four']||{})) {
        bonuses[stat]=(bonuses[stat]||0)+Number(value||0);
      }
    }
  }
  return bonuses;
}

function resolveComplex(p,stats={}) {
 return complexEffects(p.complexEffects||{},{character:labContext.characters.find(c=>String(c._id)===String(p.character))?.id||p.character,weaponId:activeWeapon(p)?.id,refinement:p.weaponRefinement,constellation:p.constellation,elementKey:p.elementKey,actionKind:p.actionKind,elapsed:p.elapsed||0,fightPosition:p.fightPosition,teamElements:p.complexTeamElements||[],stats});
}
function statsForCalculation(p) {
  const base=statFromForm(p);
  const bonuses=p.loadout==='equipped'&&p.build?equippedBonuses(p):{...p.referenceBonuses};
  for(const source of [activeBuffBonuses(p,p.elapsed||0),configuredWeaponBonuses(activeWeapon(p),p),p.importBonuses||{}])for(const [key,value]of Object.entries(source))bonuses[key]=(bonuses[key]||0)+value;
  for(const [key,value]of Object.entries(resolveComplex(p).bonuses))bonuses[key]=(bonuses[key]||0)+value;
  return finalStats(base,bonuses);
}

function viewContext(p) {
  const character = labContext.characters.find(c=>String(c._id)===String(p.character));
  const cached=kitCache.get(String(p.character));
  const details=String(character?.id)==='10000114'&&labContext.sourceSnapshot?.skirkTalents?{...cached,skillTalents:['combat1','combat2','combat3'].map((key,index)=>({...labContext.sourceSnapshot.skirkTalents[key],icon:'https://enka.network/ui/'+labContext.sourceSnapshot.skirkTalents.images?.['filename_combat'+(index+1)]+'.png'})),talentValues:labContext.sourceSnapshot.skirkTalents}:cached;
  const saved = [...new Set(getCharacterPriority().map(canonicalLabCharacter))];
  const priority = [...saved,...labContext.characters.map(c=>String(c._id)).filter(id=>!saved.includes(id))];
  const currentStats = p.referenceCharacter!==p.character && !p.referenceStats ? {} : statsForCalculation(p);
  if (currentStats.dmgBonus != null) currentStats.dmgBonus += (Number(p.elementBonus)||0)+(currentStats[(p.elementKey||'')+'Dmg']||0);
  return {...labContext,character,inventory:normalizeLabInventory(labContext.inventory||[]),priority,activeBuild:effectiveBuild(p),activeWeapon:activeWeapon(p),equipped:equippedPieces(p),currentStats,details,
    skills:details ? skillList('gi',character,details) : [],
    detailError:details?.error,invalidCount:labContext.invalidCount??0};
}

function refreshLab(focus) {
  const root = document.querySelector('[data-damage-lab]');
  if (!root) return;
  const saved = jsonRead('astralis:gi:builds',null);
  if (Array.isArray(saved)) labContext.builds=saved.map(build=>({...labContext.builds.find(b=>b.id===build.id),...build,_labWeapon:labContext.builds.find(b=>b.weapon===build.weapon)?._labWeapon,character:canonicalLabCharacter(build.character)}));
  labContext.inventory=normalizeLabInventory(jsonRead('astralis:gi:owned-artifacts',labContext.inventory));
  if(labWorker){labWorker.terminate();labWorker=null;labJob++;}
  const disclosureState=new Map([...root.querySelectorAll('details')].map(el=>[el.querySelector(':scope > summary')?.textContent.trim(),el.open]));
  root.outerHTML=renderLabWorkspace(viewContext(read()),read());
  for(const el of document.querySelectorAll('[data-damage-lab] details')){const key=el.querySelector(':scope > summary')?.textContent.trim();if(disclosureState.has(key))el.open=disclosureState.get(key);}
  initDamageLab();
  if (focus) document.querySelector(focus)?.focus({preventScroll:true});
}

function setLabTab(tab,focus=false) {
  const root=document.querySelector('[data-damage-lab]');
  if (!root) return;
  const p=read();
  p.tab=tab;
  write(p);
  root.querySelectorAll('[role="tabpanel"]').forEach(panel=>panel.hidden=panel.id!=='lab-view-'+tab);
  root.querySelectorAll('[role="tab"]').forEach(button=>{
    const selected=button.dataset.labTab===tab;
    button.setAttribute('aria-selected',String(selected));
    button.tabIndex=selected?0:-1;
  });
  if (focus) root.querySelector('#lab-tab-'+tab)?.focus({preventScroll:true});
}

async function loadActiveKit() {
  const p=read();
  const id=String(p.character);
  const character=labContext.characters.find(c=>String(c._id)===id);
  if (!character || kitCache.has(id)) return;
  if (kitRequests.has(id)) return kitRequests.get(id);
  const request=characterDetails('gi',character).then(details=>kitCache.set(id,details||{error:true}))
    .catch(()=>kitCache.set(id,{error:true}))
    .finally(()=>{
      kitRequests.delete(id);
      if (String(read().character)===id && document.querySelector('[data-damage-lab]') && !labWorker) refreshLab();
    });
  kitRequests.set(id,request);
  return request;
}

async function loadActiveBuild(root,p) {
  const saved=selectedBuild(p);
  if(p.weaponSettingsBuild!==p.build){
    p.weaponSettingsBuild=p.build;p.weaponLevel=Number(saved?.weaponLevelValue)||90;p.weaponRefinement=Number(saved?.weaponRefinement)||1;
    if(saved){p.level=Number(saved.level)||90;p.constellation=Number(String(saved.constellation||0).replace(/^C/i,''))||0;}
    write(p);
  }
  const build=effectiveBuild(p);
  const requestKey=String(p.character)+':'+String(p.build||'tc')+':'+String(build.level)+':'+String(build.weapon)+':'+String(build.weaponLevelValue);
  if(!p.character||!labContext.resolveBuild||buildRequestKey===requestKey)return;
  buildRequestKey=requestKey;
  root.querySelector('[data-lab-status]').textContent='Chargement des statistiques du personnage et de son arme…';
  try {
    const data=await labContext.resolveBuild(build);
    if (!document.querySelector('[data-damage-lab]') || String(read().build)!==String(p.build) || String(read().character)!==String(p.character)||effectiveBuild(read()).weapon!==build.weapon||Number(effectiveBuild(read()).weaponLevelValue)!==Number(build.weaponLevelValue)) return;
    if (!data) throw new Error('Les statistiques de niveau sont indisponibles. Tu peux compléter les valeurs de référence.');
    const tc=p.tcSettingsLoadedBuild!==p.build?(build.tcSettings||{}):{};
    const updated={...read(),...tc,referenceBonuses:{},...data,tcSettingsLoadedBuild:p.build,weaponOverride:p.weaponOverride,weaponLevel:build.weaponLevelValue,weaponRefinement:build.weaponRefinement,character:p.character,build:p.build,statSchema:3,referenceCharacter:p.character,referenceBuild:p.build,loadout:p.build?'equipped':'manual'};
    if(build.rotation?.length)updated.rotations=build.rotation;
    updated.constellation=Number(String(build.constellation||tc.constellation||p.constellation||0).replace(/^C/i,''))||0;
    updated.referenceStats=statsForCalculation(updated);
    write(updated);
    refreshLab();
    document.querySelector('[data-lab-status]').textContent='Statistiques du build chargées. Les cinq artéfacts sont inclus dans la simulation.';
  } catch (error) {
    const active=document.querySelector('[data-damage-lab]');
    if (active) active.querySelector('[data-lab-status]').textContent=error.message||'Chargement impossible.';
  } finally {
    if (buildRequestKey===requestKey) buildRequestKey='';
  }
}

function updateLiveStats(root,p) {
  const stats=p.referenceCharacter===p.character?statsForCalculation(p):{};
  stats.dmgBonus=(stats.dmgBonus||0)+(Number(p.elementBonus)||0)+(stats[(p.elementKey||'')+'Dmg']||0);
  root.querySelectorAll('[data-lab-live-stat]').forEach(cell=>cell.textContent=labStatValue(cell.dataset.labLiveStat,stats[cell.dataset.labLiveStat]));
  root.querySelector('[data-lab-enemy-level]').textContent=p.enemyLevel;
}

function chooseLabCharacter(id) {
  const current=persist();
  saveCharacterMemo(current);
  const memo=jsonRead('astralis:gi:lab-character-settings:v1',{})[id]||{};
  const build=labContext.builds.find(row=>String(row.character)===String(id));
  write({...defaults,...memo,character:String(id),build:memo.build||build?.id||'',tab:current.tab||'overview',rotations:current.rotations||[],referenceBuild:''});
  refreshLab();
  const root=document.querySelector('[data-damage-lab]');
  loadActiveBuild(root,read());
}

function useTalentValue(index,rowIndex) {
  const p=persist();
  const context=viewContext(p);
  if(index===99){const definition=actionDefinition(index,rowIndex,p);if(!definition)return;write({...p,...definition});refreshLab();setLabTab('overview');return;}
  const skill=context.skills[index];
  const source=context.details?.talentValues?.['combat'+(index+1)]||context.details?.skillTalents?.[index]||skill;
  const value=String(talentValueRows(source,Number(p.talentLevel)||10,skill?.values)[rowIndex]||'');
  const label=value.split(/·\s*Niv\.|[:：]/)[0].trim();
  const parsed=parseActionValue(value);
  p.targetName=skill.name+' · '+label;
  p.targetIcon=skill.image||'';
  p.targetSource=value;
  p.actionKind=attackKind(index,label);p.attackSelection=index+':'+rowIndex;
  p.components=parsed?.components||[];
  p.hitCount=parsed?.hitCount||1;
  p.reactingHits=p.reaction==='none'?0:1;
  p.talent=parsed?.components[0]?.talentMultiplier??'';
  if(parsed?.baseStat)p.baseStat=parsed.baseStat;
  write(p);
  refreshLab();
  setLabTab('overview');
  const status=document.querySelector('[data-lab-status]');
  status.textContent=parsed?'Attaque cible sélectionnée · vérifie les conditions de déclenchement.':'Cette valeur nécessite une formule spécifique. Renseigne son multiplicateur vérifié dans la simulation.';
}

const IMPORT_BONUSES = {
 hp:'hpFlat',hp_:'hpPct',atk:'atkFlat',atk_:'atkPct',def:'defFlat',def_:'defPct',
 eleMas:'em',enerRech_:'er',critRate_:'critRate',critDMG_:'critDmg',all_dmg_:'dmgBonus',
 normal_dmg_:'normalDmg',charged_dmg_:'chargedDmg',plunging_dmg_:'plungeDmg',
 skill_dmg_:'skillDmg',burst_dmg_:'burstDmg',enemyDefRed_:'defReduction',enemyDefIgn_:'defIgnore'
};
const IMPORT_CRIT = {avgHit:'average',critHit:'crit',nonCritHit:'nonCrit'};
function convertImportBonuses(raw,element){
 const bonuses={},unsupported=[];
 for(const [key,value] of Object.entries(raw||{})){
  if(!Number.isFinite(value)){unsupported.push(key);continue;}
  if(key===element+'_enemyRes_'||key==='enemyRes_'){
   bonuses.resReduction=(bonuses.resReduction||0)-value;continue;
  }
  if(key.endsWith('_enemyRes_')&&/^(pyro|hydro|cryo|electro|anemo|geo|dendro|physical)_/.test(key))continue;
  const stat=IMPORT_BONUSES[key]||(/^(pyro|hydro|cryo|electro|anemo|geo|dendro|physical)_dmg_$/.test(key)?key.split('_')[0]+'Dmg':null);
  if(!stat){unsupported.push(key);continue;}
  bonuses[stat]=(bonuses[stat]||0)+value;
 }
 return {bonuses,unsupported};
}

function openConfigMapping({host,group,key}){
 const p=persist(),context=viewContext(p),options=attackOptions(context,p);
 host.replaceChildren();
 if(group.member){
  const owner=labContext.characters.find(c=>[c._id,c.id,c._name,c.name,c.enName].some(value=>foldAttackQuery(value).replaceAll(' ','')===foldAttackQuery(group.member).replaceAll(' ','')));
  if(!owner||String(owner._id)!==String(p.character)){host.textContent='Cette cible appartient à '+group.member+'. Charge ce personnage avant d’associer ses attaques ; le calcul sur un autre kit est bloqué.';return;}
 }
 if(!options.length){host.textContent='Sélectionne le personnage et attends le chargement de son kit.';return;}
 const id='astralis:gi:lab-config-mapping:'+key+':'+p.character;
 const saved=jsonRead(id,{}),paths=[...new Set(group.targets.map(row=>JSON.stringify(row.path)))],selectors=new Map();
 const note=document.createElement('p');
 note.textContent='Calcul sur le personnage, le build et l’ennemi actifs dans Astralis. Associe chaque chemin Celestia à une attaque précise. Évite d’activer deux fois les buffs déjà inclus dans la configuration.';
 host.append(note);
 if (group.member) {
  const subject = document.createElement('p');
  subject.textContent = 'Personnage de référence : '+group.member;
  host.append(subject);
 }
 const assumptions = document.createElement('details');
 const assumptionsTitle = document.createElement('summary');
 assumptionsTitle.textContent = 'Hypothèses de la configuration';
 assumptions.append(assumptionsTitle);
 for (const [name, value] of Object.entries(group.conditions||{})) {
  if (!value || typeof value !== 'object') continue;
  const line = document.createElement('p');
  line.textContent = name+' · '+Object.entries(value).map(([key,state])=>key+' = '+state).join(' · ');
  assumptions.append(line);
 }
 const useEnemy = document.createElement('input');
 useEnemy.type = 'checkbox';
 useEnemy.checked = Boolean(group.enemy);
 if (group.enemy) {
  const label = document.createElement('label');
  label.append(useEnemy,' Utiliser le niveau, la défense et la résistance de référence');
  assumptions.append(label);
 }
 if (assumptions.children.length>1) host.append(assumptions);
 for(const path of paths){
  const label=document.createElement('label'),select=document.createElement('select');
  label.textContent=JSON.parse(path).join(' / ');
  select.add(new Option('Choisir le coup', ''));
  for(const option of options)select.add(new Option(option.skill.name+' · '+option.label,option.id));
  select.value=saved[path]||'';
  select.addEventListener('change',()=>{saved[path]=select.value;localStorage.setItem(id,JSON.stringify(saved));});
  label.append(select);host.append(label);selectors.set(path,select);
 }
 const run=document.createElement('button'),output=document.createElement('div');
 run.type='button';run.textContent='Calculer la somme pondérée';output.setAttribute('role','status');host.append(run,output);
 run.addEventListener('click',async()=>{
  run.disabled=true;output.textContent='Calcul en cours…';
  try{
   const current=persist();
   if(current.character!==p.character||current.talentLevel!==p.talentLevel)throw new Error('Le kit actif a changé. Rouvre la configuration.');
   let total=0,complete=true;const lines=[],weighted=[];
   for(const row of group.targets){
    const path=JSON.stringify(row.path),attack=options.find(item=>item.id===selectors.get(path)?.value);
    const reaction=row.reaction||'none',crit=IMPORT_CRIT[row.hitMode||'avgHit'];
    const importStats = {...group.memberBonusStats};
    for (const [key, value] of Object.entries(row.bonusStats||{})) importStats[key]=(importStats[key]||0)+value;
    const {bonuses,unsupported}=convertImportBonuses(importStats,current.elementKey);
    if(!attack||!crit||unsupported.length||!LAB_REACTIONS.some(item=>item[0]===reaction)){
     complete=false;lines.push(row.path.join(' / ')+' · '+(unsupported.length?'Bonus à traduire : '+unsupported.join(', '):'Coup ou mode à compléter'));continue;
    }
    const amp=reaction==='melt'?(current.elementKey==='pyro'?2:current.elementKey==='cryo'?1.5:''):
      reaction==='vaporize'?(current.elementKey==='hydro'?2:current.elementKey==='pyro'?1.5:''):'';
    const enemy = useEnemy.checked ? group.enemy : null;
    const params={...current,importBonuses:bonuses,actionKind:attack.kind,
     enemyLevel:enemy?.enemyLevel ?? current.enemyLevel,
     resistance:enemy?.[current.elementKey+'_enemyRes_'] ?? current.resistance,
     defReduction:enemy?.enemyDefRed_ ?? current.defReduction,
     defIgnore:enemy?.enemyDefIgn_ ?? current.defIgnore,
     baseStat:attack.parsed.baseStat||current.baseStat,talent:attack.parsed.components[0].talentMultiplier,
     components:attack.parsed.components,hitCount:attack.parsed.hitCount,critMode:crit,flat:0,
     reaction,ampBase:amp,reactingHits:reaction==='none'?0:1};
    const result=await calculate(params);
    if(!result.ok){complete=false;lines.push(row.path.join(' / ')+' · '+result.error);continue;}
    const damage=result.total*(row.weight??1);
    weighted.push({params,weight:row.weight??1});
    total+=damage;lines.push(row.path.join(' / ')+' · '+fmt(damage)+' DGT pondérés');
   }
   const summary=document.createElement('strong');
   summary.textContent=(complete?'Total pondéré : ':'Total partiel : ')+fmt(total)+' DGT';
   const list=document.createElement('ul');
   for(const line of lines){const item=document.createElement('li');item.textContent=line;list.append(item);}
   output.replaceChildren(summary,list);
   if(complete&&weighted.length){
    const optimize=document.createElement('button');
    optimize.type='button';optimize.textContent='Optimiser mon inventaire pour cette configuration';
    optimize.addEventListener('click',()=>{
      const root=host.closest('[data-damage-lab]');
      if(!root)return;
      const settings={...persist(),objective:'damage'};
      write(settings);
      const field=root.querySelector('[data-lab="objective"]');
      if(field)field.value='damage';
      setLabTab('optimizer');
      runOptimizer(root,settings,weighted);
    });
    output.append(optimize);
   }
  }catch(error){output.textContent=error.message;}
  finally{run.disabled=false;}
 });
}

let setGuideRequest;
function renderSetRecommendations(rows){
 const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 return '<div class="lab-recommended-cards">'+rows.map(row=>{
  const matches=[...new Set((row.sets||[]).flatMap(name=>labContext.sets.filter(set=>[set._name,set.name,set.enName,set.id,set._id,...(set._labAliases||[])].some(alias=>fold(alias)===fold(name)))) )];
  return '<article><header><b>'+esc(row.role||'Build conseillé')+'</b><a href="'+esc(row.url||'https://genshin.gg/builds/')+'" target="_blank" rel="noopener">Guide ↗</a></header><ul>'+row.sets.map(name=>'<li>'+esc(name)+'</li>').join('')+'</ul>'+(matches.length?'<button type="button" class="quiet-btn" data-lab-apply-recommended="'+esc(JSON.stringify(matches.map(s=>String(s._labKey||s._id))))+'">Limiter la recherche à ces sets</button>':'<small>Correspondance à confirmer dans le catalogue.</small>')+'</article>';
 }).join('')+'</div>';
}
async function showSetGuide(root,p){
 const host=root.querySelector('[data-lab-guide-output]'),character=labContext.characters.find(c=>c._id===p.character);
 if(!character){host.textContent='Choisis un personnage.';return;}
 host.textContent='Chargement des guides…';
 try{
  const remote=await fetch('/api/gi/build-guide?name='+encodeURIComponent(character._id),{signal:AbortSignal.timeout(8000)}).then(response=>response.ok?response.json():null).catch(()=>null);
  const recommendations=(remote?.builds||[]).map(build=>{
    const names=(build.artifacts||[]).flatMap(group=>group?.items||[group]).map(item=>typeof item==='string'?item:item?.name?.fr||item?.name?.en||item?.name||item?.id).filter(value=>typeof value==='string');
    return {role:build.role,sets:names,url:remote.sourceUrl};
  }).filter(row=>row.sets.length);
  if(recommendations.length){
    host.innerHTML=renderSetRecommendations(recommendations);
    return;
  }
  setGuideRequest ||= fetch('./public/gi-build-reverse-fallback.json').then(response=>{if(!response.ok)throw new Error();return response.json();}).catch(error=>{setGuideRequest=null;throw error;});
  const data=await setGuideRequest;
  const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
  const names=new Set([character._name,character.name,character._id].map(fold));
  const rows=(data.characters||[]).filter(row=>names.has(fold(row.name)));
  if(!rows.length){host.textContent='Aucun set conseillé dans le guide disponible pour ce personnage.';return;}
  host.innerHTML=renderSetRecommendations(rows.map(row=>({...row,url:row.url||data.sourceUrl})));
 }catch{host.textContent='Guides temporairement indisponibles.';}
}
async function showAllyEffects(root,p,index){
 const own = index === -1;
 const host = root.querySelector('[data-lab-ally-effects="'+index+'"]');
 const ally = own ? p : p.allies?.[index] || {};
 const character = labContext.characters.find(c => c._id === ally.character);
 const weapon = own ? activeWeapon(p) : labContext.weapons.find(w => w._id === ally.weapon);
 const set = own ? (equippedPieces(p).map(piece=>labContext.sets.find(row=>String(row._labKey||row._id)===String(piece.setKey)||String(row._id)===String(piece.set))).find(Boolean)) : labContext.sets.find(row => row._id === ally.set);
 host.textContent = 'Chargement des effets…';
 let details;
 if (character) {
  try { details = await characterDetails('gi',character); } catch { details = character; }
 }
 if (!host.isConnected) return;
 const rows = kitEffectDescriptions(details, ally.constellation, weapon, own ? p.weaponRefinement : ally.refinement, own?null:set);
 if(own){const counts=new Map();for(const piece of equippedPieces(p).filter(Boolean)){const selected=labContext.sets.find(s=>[s._labKey,s._id,s.id,...(s._labAliases||[])].map(String).includes(String(piece.setKey)));if(selected)counts.set(selected,(counts.get(selected)||0)+1);}for(const [selected,count]of counts)if(count>=2)rows.push(...kitEffectDescriptions(null,0,null,1,selected,count));}
 host.innerHTML = rows.map(row =>
  '<details><summary>'+esc(row.name)+(row.locked?' · verrouillé':'')+'</summary><div class="lab-effect-description">'+renderGameText(row.description)+'</div>'+
  (row.locked?'':'<button type="button" data-lab-add-source-buff="'+esc(row.name)+'" data-buff-description="'+esc(row.description)+'" data-buff-owner="'+esc(own?p.character:ally.character)+'" data-source-position="'+esc(own?(p.fightPosition||'on'):(ally.position||'off'))+'">Configurer ce buff</button>')+
  '</details>').join('') || '<p>Aucun effet publié pour ces choix.</p>';
}
function bindWorkspace() {
  if (document.documentElement.dataset.labWorkspaceBound) return;
  document.documentElement.dataset.labWorkspaceBound='1';
  document.addEventListener('astralis:lab-config-map',event=>openConfigMapping(event.detail));
  document.addEventListener('change',event=>{
    if(!event.target.matches('[data-lab-ally]'))return;
    const p=persist(),index=Number(event.target.dataset.labAlly);
    p.allies ||= [];
    p.allies[index]={...p.allies[index],[event.target.dataset.allyField]:event.target.value};
    write(p);
  });
  document.addEventListener('change',event=>{
    if(!event.target.matches('[data-lab-inspect-set]'))return;
    write({...persist(),inspectSet:event.target.value});
    refreshLab('[data-lab-inspect-set]');
  });
  document.addEventListener('click',async event=>{
    const root=event.target.closest?.('[data-damage-lab]');
    if (!root) return;
    const guide=event.target.closest('[data-lab-guide-sets]');
    if(guide){await showSetGuide(root,read());return;}
    const ally=event.target.closest('[data-lab-read-ally]');
    if(ally){await showAllyEffects(root,read(),Number(ally.dataset.labReadAlly));return;}
    if(event.target.closest('[data-lab-save-tc]')){saveTcBuild(root);return;}
    const attackKindButton=event.target.closest('[data-lab-attack-kind]');
    if(attackKindButton){
      const p=persist();p.actionKind=attackKindButton.dataset.labAttackKind;
      p.attackSelection='';p.targetName='';p.targetSource='';p.components=[];p.talent='';p.hitCount=1;
      write(p);
      await loadActiveKit();
      const current=read();
      if(current.character!==p.character||current.actionKind!==p.actionKind||!document.querySelector('[data-damage-lab]'))return;
      const first=attackOptions(viewContext(current),current).find(row=>row.kind===current.actionKind);
      if(first)useTalentValue(...first.id.split(':').map(Number));else refreshLab();
      return;
    }
    if(event.target.closest('[data-lab-export]')){exportLaboratory(read());return;}
    if(event.target.closest('[data-lab-demo]')){
      const example=labContext.builds.find(build=>build.demo);
      if(!example)return;
      saveCharacterMemo(persist());
      write({...defaults,character:canonicalLabCharacter(example.character),build:example.id,level:Number(example.level),tab:'overview'});
      refreshLab();return;
    }
    const addEffect=event.target.closest('[data-lab-add-effect]');
    const removeEffect=event.target.closest('[data-lab-remove-effect]');
    if (addEffect || removeEffect) {
      const p=persist(),scope=addEffect?.dataset.labAddEffect||removeEffect.dataset.labRemoveEffect;
      p.customEffects||={};
      const custom=p.customEffects[scope]||={};
      custom.additional||=[];
      if(addEffect)custom.additional.push({enabled:true,type:'',value:''});
      else custom.additional.splice(Number(removeEffect.dataset.effectIndex)-1,1);
      write(p);refreshLab();return;
    }
    const sourceBuff=event.target.closest('[data-lab-add-source-buff]');
    if(sourceBuff||event.target.closest('[data-lab-add-buff]')){
      const p=persist();p.buffs=[...(p.buffs||[]),{type:'atkPct',value:sourceBuff?0:20,stacks:1,duration:0,active:!sourceBuff,source:sourceBuff?.dataset.labAddSourceBuff,description:sourceBuff?.dataset.buffDescription||'',sourceCharacter:sourceBuff?.dataset.buffOwner||'',sourcePosition:sourceBuff?.dataset.sourcePosition||'off'}];
      write(p);refreshLab();return;
    }
    const removeBuff=event.target.closest('[data-lab-remove-buff]');
    if(removeBuff){const p=persist();p.buffs.splice(Number(removeBuff.dataset.labRemoveBuff),1);write(p);refreshLab();return;}
    const simulation=event.target.closest('[data-lab-simulation]');
    if(simulation){const p=persist();p.simulationMode=simulation.dataset.labSimulation;write(p);refreshLab();return;}
    if(event.target.closest('[data-lab-evaluate-rotation]')){await showRotationResult(root,persist());return;}
    if(event.target.closest('[data-lab-load-rotation]')){
      const p=persist(),build=selectedBuild(p);
      p.rotations=(build?.rotation||[]).map(row=>({...row,label:row.label||row.name,icon:row.icon||row.image}));
      write(p);displayRotation();return;
    }
    const tab=event.target.closest('[data-lab-tab]');
    if (tab) { persist();setLabTab(tab.dataset.labTab);return; }
    const character=event.target.closest('[data-lab-character-choice]');
    if (character) { chooseLabCharacter(character.dataset.labCharacterChoice);return; }
    const edit=event.target.closest('[data-lab-edit-reference]');
    if (edit) {
      setLabTab('overview');
      const details=root.querySelector('[data-lab-reference]');
      details.open=true;
      details.querySelector('input')?.focus();
      return;
    }
    const target=event.target.closest('[data-lab-talent-value]');
    if (target) { useTalentValue(...target.dataset.labTalentValue.split(':').map(Number));return; }
    const mode=event.target.closest('[data-lab-mode]');
    if (mode) {
      const p=persist();p[mode.dataset.labMode]=mode.dataset.value;write(p);
      root.querySelector('[data-lab="'+mode.dataset.labMode+'"]').value=mode.dataset.value;
      root.querySelectorAll('[data-lab-mode="'+mode.dataset.labMode+'"]').forEach(button=>{
        button.classList.toggle('active',button===mode);button.setAttribute('aria-pressed',String(button===mode));
      });
      showResult(await calculate(p));
      return;
    }
    const preset=event.target.closest('[data-lab-search-preset]');
    if (preset) {
      const p=persist();filterSnapshot=structuredClone(p);p.searchPreset=preset.dataset.labSearchPreset;
      p.artifactLevelPreset=p.searchPreset==='quick'?'20':p.searchPreset==='precise'?'0':'16';
      p.topN=p.searchPreset==='quick'?3:p.searchPreset==='precise'?10:5;write(p);refreshLab();return;
    }
    const compared=event.target.closest('[data-lab-compare-result]');
    if(compared){const p=persist(),before=await calculate(p),after=labLastResults[Number(compared.dataset.labCompareResult)]?.result;if(before.ok&&after?.ok){setLabTab('overview');renderComparison(root,before,after);showResult(after);}return;}
    const action=event.target.closest('[data-lab-action]');
    if (action?.dataset.labAction==='load-build') { await loadActiveBuild(root,persist());return; }
    if (action?.dataset.labAction==='new-result') { applyResult(root,persist(),Number(action.dataset.index),true);return; }
    const shift=event.target.closest('[data-lab-rotation-shift]');
    if (shift) {
      const p=persist(),index=Number(shift.dataset.index),next=index+Number(shift.dataset.labRotationShift);
      if(next<0||next>=p.rotations.length)return;
      [p.rotations[index],p.rotations[next]]=[p.rotations[next],p.rotations[index]];write(p);displayRotation();
    }
  });
  document.addEventListener('change',event=>{
    const root=event.target.closest?.('[data-damage-lab]');
    if (!root) return;
    if(event.target.matches('[data-lab-weapon],[data-lab-weapon-level],[data-lab-weapon-refinement]')){
      const p=persist();
      if(event.target.matches('[data-lab-weapon]')){p.weaponOverride=event.target.value;p.weaponEffectsChanged=true;
        const weapon=activeWeapon(p);if(Number(weapon?.rarity)<3)p.weaponLevel=Math.min(70,p.weaponLevel);
      }
      if(event.target.matches('[data-lab-weapon-level]'))p.weaponLevel=Number(event.target.value);
      if(event.target.matches('[data-lab-weapon-refinement]'))p.weaponRefinement=Number(event.target.value);
      p.referenceCharacter='';p.atk='';p.hp='';p.def='';p.referenceBonuses={};write(p);
      refreshLab();return;
    }
    if(event.target.matches('[data-lab-target-attack]')){
      if(event.target.value)useTalentValue(...event.target.value.split(':').map(Number));
      return;
    }
    if(event.target.matches('[data-lab-target-level]')){
      const p=persist();p.talentLevel=Number(event.target.value);write(p);
      if(p.attackSelection)useTalentValue(...p.attackSelection.split(':').map(Number));else refreshLab();
      return;
    }
    if(event.target.matches('[data-lab-allow-set],[data-lab-require-set]')){
      const cb=event.target;
      if(cb.dataset.labRequireSet&&cb.checked){
        const allow=[...root.querySelectorAll('[data-lab-allow-set]')].find(box=>box.dataset.labAllowSet===cb.dataset.labRequireSet);
        if(allow)allow.checked=true;
      }
      if(cb.dataset.labAllowSet&&!cb.checked){
        const require=[...root.querySelectorAll('[data-lab-require-set]')].find(box=>box.dataset.labRequireSet===cb.dataset.labAllowSet);
        if(require)require.checked=false;
      }
      const p=syncSetFilterArrays(persist());write(p);updateEstimate(root,p);return;
    }
    if(event.target.matches('[data-lab-effect],[data-lab-custom-effect]')){
      const p=persist(),custom=event.target.dataset.labCustomEffect,key=custom||event.target.dataset.labEffect;
      const field=event.target.dataset.effectField;
      const value=event.target.type==='checkbox'?event.target.checked:field==='type'?event.target.value:Number(event.target.value);
      const prop=custom?'customEffects':'effectStates';
      const setting=structuredClone(p[prop]?.[key]||{});
      const index=Number(event.target.dataset.effectIndex)||0;
      if(custom&&index){
        setting.additional||=[];
        setting.additional[index-1]={...setting.additional[index-1],[field]:value};
      }else setting[field]=value;
      p[prop]={...p[prop],[key]:setting};
      write(p);updateLiveStats(root,p);recomputeRotation(root,p);return;
    }
    if(event.target.matches('[data-lab-buff]')){
      const p=read(),index=Number(event.target.dataset.labBuff),key=event.target.dataset.field;
      if(!p.buffs[index])return;
      p.buffs[index][key]=key==='maximum'&&event.target.value===''?'':event.target.type==='checkbox'?event.target.checked:['type','position','sourcePosition','sourceCondition','condition'].includes(key)?event.target.value:Number(event.target.value);
      write(p);updateLiveStats(root,p);recomputeRotation(root,p);
      return;
    }
    if(event.target.matches('[data-lab-character-level]')){
      const p=persist();p.level=Number(event.target.value);p.referenceCharacter='';write(p);refreshLab();loadActiveBuild(document.querySelector('[data-damage-lab]'),read());return;
    }
    if(event.target.matches('[data-lab-rotation-attack]')){
      const p=persist(),index=Number(event.target.dataset.labRotationAttack);
      const [skill,row]=event.target.value.split(':').map(Number),params=actionDefinition(skill,row,p);
      if(!params||!p.rotations[index])return;
      p.rotations[index]={...p.rotations[index],params,label:params.targetName,icon:params.targetIcon,characterId:p.character};
      write(p);displayRotation();return;
    }
    if(event.target.matches('[data-lab-action-count]')){
      const p=read();p.rotations[Number(event.target.dataset.labActionCount)].count=Math.max(1,Math.min(100,Number(event.target.value)||1));write(p);recomputeRotation(root,p);return;
    }
    const key=event.target.dataset.lab;
    if (key==='build') { const p=persist();p.weaponOverride=null;const build=selectedBuild(p);p.weaponLevel=Number(build?.weaponLevelValue)||90;p.weaponRefinement=Number(build?.weaponRefinement)||1;p.referenceCharacter='';write(p);loadActiveBuild(root,p); }
    if (key==='talentLevel') { persist();refreshLab(); }
    if(key==='constellation'){const p=persist();if(p.attackSelection?.startsWith('99:'))useTalentValue(...p.attackSelection.split(':').map(Number));else refreshLab();}
    if(key==='reaction'){const p=read();p.reactingHits=p.reaction==='none'?0:Math.max(1,Number(p.reactingHits)||1);if(['vaporize','melt'].includes(p.reaction))p.ampBase=p.reaction==='melt'?(p.elementKey==='pyro'?2:1.5):(p.elementKey==='hydro'?2:1.5);write(p);refreshLab();}
    if (key) updateLiveStats(root,read());
    if (event.target.matches('[data-lab-duration]')) {
      const p=read();p.rotations[Number(event.target.dataset.labDuration)].duration=Math.max(0,Number(event.target.value)||0);write(p);updateRotationSummary(root,p);recomputeRotation(root,p);
    }
  });
  document.addEventListener('input',event=>{
    if (!event.target.matches('[data-lab-character-query]')) return;
    const query=foldAttackQuery(event.target.value);
    const root=event.target.closest('[data-damage-lab]');
    root.querySelectorAll('[data-lab-character-choice]').forEach(button=>button.hidden=!foldAttackQuery(button.textContent).includes(query));
  });
  document.addEventListener('keydown',event=>{
    const tab=event.target.closest?.('[role="tab"][data-lab-tab]');
    if (!tab) return;
    const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')];
    const current=tabs.indexOf(tab);
    let next;
    if(event.key==='ArrowRight')next=(current+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(current+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next==null)return;
    event.preventDefault();setLabTab(tabs[next].dataset.labTab,true);
  });
}


function addAttackToRotation(row) {
  if(String(read().character)!==String(row.character._id)) chooseLabCharacter(row.character._id);
  const p=read();
  p.rotations=[...(p.rotations||[]),{label:row.name,damage:null,damageKnown:false,attackId:row.id,
    characterId:String(row.character._id),icon:row.icon||'',duration:0}];
  p.tab='rotation';
  write(p);
  refreshLab();
  document.querySelector('[data-lab-status]').textContent=row.name+' ajouté. Sélectionne une valeur dans les talents pour définir son calcul.';
}

function actionDefinition(skillIndex,valueIndex,p=read()) {
  const context=viewContext(p);
  if(skillIndex===99){const row=attackOptions(context,p).find(r=>r.id===skillIndex+':'+valueIndex);if(!row)return null;return {attackSelection:row.id,targetName:row.label,targetSource:row.text,targetIcon:row.skill?.image||'',components:row.parsed.components,hitCount:row.parsed.hitCount,talent:row.parsed.components[0].talentMultiplier,baseStat:'atk',elementKey:'cryo',actionKind:row.kind,reactingHits:0,reaction:'none',flat:0,characterId:p.character};}
  const skill=context.skills[skillIndex];
  if(!skill)return null;
  const source=context.details?.talentValues?.['combat'+(skillIndex+1)]||context.details?.skillTalents?.[skillIndex]||skill;
  const text=talentValueRows(source,Number(p.talentLevel)||10,skill.values)[valueIndex];
  const parsed=parseActionValue(text);
  if(!parsed)return null;
  return {attackSelection:skillIndex+':'+valueIndex,targetName:skill.name+' · '+String(text).split(/·\s*Niv\./)[0].trim(),targetIcon:skill.image||'',
    targetSource:text,components:parsed.components,hitCount:parsed.hitCount,talent:parsed.components[0].talentMultiplier,
    baseStat:parsed.baseStat||p.baseStat,elementKey:p.elementKey,actionKind:attackKind(skillIndex,text),
    reactingHits:p.reaction==='none'?0:1,reaction:p.reaction,ampBase:p.ampBase,
    reactionCoeff:p.reactionCoeff,reactionLevel:p.reactionLevel,reactionBonus:p.reactionBonus,
    flat:Number(p.flat)||0,characterId:p.character};
}

function captureTarget(p) {
  return Object.fromEntries(['attackSelection','targetName','targetIcon','targetSource','components','hitCount','talent','baseStat','elementKey',
    'actionKind','reactingHits','reaction','ampBase','reactionCoeff','reactionLevel','reactionBonus','flat'].map(key=>[key,p[key]]));
}

let rotationEvaluation=0;
async function recomputeRotation(root,p=read()) {
  const revision=++rotationEvaluation;
  const rows=(p.rotations||[]).map(row=>({...row}));
  let elapsed=0,poolState={};
  const repeat=Math.max(1,Math.min(99,Number(p.repeatRotation)||1)),cycleDuration=Number(p.rotationSeconds)||rows.reduce((sum,row)=>sum+Math.max(0,Number(row.duration)||0),0);
  for(const row of rows){row.cycleDamages=[];row.damageKnown=true;}
  for(let cycle=0;cycle<repeat;cycle++){
    elapsed=cycle*cycleDuration;
    for(const row of rows){
      const count=Math.max(1,Math.min(100,Number(row.count)||1));
      if(row.params&&(!row.characterId||canonicalLabCharacter(row.characterId)===canonicalLabCharacter(p.character))){
        let damage=0,ok=true;
        for(let i=0;i<count;i++){
          const result=await calculate({...p,...row.params,elapsed:elapsed+i*(Number(row.duration)||0)/count},{poolState});
          poolState=result.poolState||poolState;
          if(!result.ok){ok=false;row.error=result.error;break;}
          damage+=result.total;
        }
        row.cycleDamages.push(ok?damage:0);row.damageKnown&&=ok;if(cycle===0)row.damage=ok?damage:null;
      }else{row.damage=null;row.damageKnown=false;}
      elapsed+=Math.max(0,Number(row.duration)||0);
    }
  }
  if(revision!==rotationEvaluation||!root.isConnected)return null;
  write({...read(),rotations:rows});
  for(const [index,row]of rows.entries()){
    const label=root.querySelector('[data-lab-rotation-damage="'+index+'"]');
    if(label)label.textContent=row.damageKnown?fmt(row.damage):'À compléter';
  }
  updateRotationSummary(root,{...read(),rotations:rows});
  return summarizeRotation(rows,p.repeatRotation,p.rotationSeconds);
}

async function showRotationResult(root,p=read()) {
  const summary=await recomputeRotation(root,p);
  if(!summary)return;
  root.querySelector('[data-lab-damage]').textContent=summary.total==null?'TODO_DATA':fmt(summary.total);
  root.querySelector('[data-lab-result-title]').textContent='Dégâts de la rotation';
  root.querySelector('[data-lab-warning]').textContent=summary.total==null?'Sélectionne une attaque précise pour chaque étape.':
    (summary.dps==null?'Renseigne une durée pour obtenir le DPS.':fmt(summary.dps)+' DPS · '+fmt(summary.duration)+' s');
  root.querySelector('[data-lab-breakdown]').innerHTML='<div class="lab-breakdown-table">'+(read().rotations||[]).map(row=>
    '<div><span>'+esc(row.label)+'</span><b>'+(row.damageKnown?fmt(row.damage):'TODO_DATA')+'</b></div>').join('')+'</div>';
  setLabTab('overview');
}

function saveTcBuild(root) {
  const p=persist();
  if(!p.character){root.querySelector('[data-lab-status]').textContent='Choisis un personnage.';return;}
  const current=effectiveBuild(p);
  const character=labContext.characters.find(row=>String(row._id)===String(p.character));
  const label=root.querySelector('[data-lab-tc-name]')?.value.trim()||p.tcName||character?._name||'Build';
  const name='TC - '+label.replace(/^TC\s*[-–]\s*/i,'');
  const builds=jsonRead('astralis:gi:builds',[]);
  const id=current?.tc&&!current.demo?current.id:crypto.randomUUID();
  const tcSettings={...p,tcName:name};
  delete tcSettings.rotations;delete tcSettings.build;delete tcSettings.referenceBuild;
  const build={...current,id,character:p.character,name,tc:true,demo:false,tcSettings,level:Number(p.level)||90,
    constellation:'C'+(Number(p.constellation)||0),rotation:p.rotations||[],
    pieces:current?.pieces?.map(piece=>({...piece}))||[],notes:current?.notes||'Build de théorie enregistré depuis le laboratoire.'};
  const index=builds.findIndex(row=>row.id===id);
  if(index<0)builds.push(build);else builds[index]=build;
  localStorage.setItem('astralis:gi:builds',JSON.stringify(builds));
  write({...p,build:id,tcName:name,tcSettingsLoadedBuild:id});
  refreshLab();
  document.querySelector('[data-lab-status]').textContent='Build TC « '+name+' » enregistré avec les buffs et la rotation.';
}

function optimizerBonuses(p) {
 const out={...p.referenceBonuses};
 for(const source of [activeBuffBonuses(p),configuredWeaponBonuses(activeWeapon(p),p)])for(const [key,value]of Object.entries(source))out[key]=(out[key]||0)+value;
 return out;
}

function normalizeLabInventory(rows) {
 const setsByAlias=new Map();
 for(const set of labContext.sets)for(const alias of [set._id,set.id,set._name,set.name,set.enName,set._labKey,set._key,...(set._labAliases||[])].filter(Boolean))setsByAlias.set(String(alias).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase(),set);
 return rows.map((raw,index)=>{
  const row=normalizeGoodArtifact(raw,index),set=setsByAlias.get(String(row.setKey).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase());
  return set?{...row,setKey:String(set._labKey||set._id)}:row;
 });
}

async function exportLaboratory(p) {
 const result=await calculate(p);
 if(!result.ok){showResult(result);return;}
 const [nonCrit,average,crit]=await Promise.all(['nonCrit','average','crit'].map(critMode=>calculate(p,{critMode})));
 const otherAttacks=await Promise.all(attackOptions(viewContext(p),p).filter(row=>row.id!==p.attackSelection).slice(0,4).map(async row=>{
  const [skill,value]=row.id.split(':').map(Number),definition=actionDefinition(skill,value,p),calculation=definition?await calculate({...p,...definition},{critMode:'average'}):null;
  return {name:definition?.targetName||row.label,value:calculation?.ok?calculation.total:null};
 }));
 const sensitivity=await Promise.all([['+1 % Taux CRIT','critRate',1],['+1 % DGT CRIT','critDmg',1],['+10 Maîtrise','em',10],['+10 ATQ','atk',10]].map(async([label,key,delta])=>{
  const stats={...average.stats,[key]:(average.stats[key]||0)+delta},changed=await calculate(p,{critMode:'average',stats});
  return [label,changed.ok&&average.total>0?(changed.total/average.total-1)*100:null];
 }));
 const character = labContext.characters.find(row => row._id === p.character);
 const name = character?._name || 'Personnage';
 const mode = {average:'Dégâts moyens', crit:'Critique', nonCrit:'Sans CRIT'}[p.critMode] || 'Sans CRIT';
 const data = {
  kind:'Laboratoire de dégâts', title:name, sheetModel:{title:name,name,image:[character?._labSplash,character?._labImage],element:p.elementKey||character?.elementText||character?.element,level:p.level,constellation:p.constellation,attack:p.targetName,result:average,stats:average.stats,sensitivity,otherAttacks,damage:{nonCrit:nonCrit.ok?nonCrit.total:null,average:average.total,crit:crit.ok?crit.total:null},enemy:{level:p.enemyLevel,resistance:p.resistance}},
  subtitle:'Niveau ' + p.level + ' · C' + p.constellation,
  image:[character?._labSplash, character?._labImage],
  sections:[
   {title:'Résultat · ' + mode, columns:1, weight:1.55, tiles:[{
    title:fmt(result.total) + ' DGT',
    lines:[p.targetName || 'Attaque personnalisée', (result.totalHits || 1) + ' coup(s)']
   }]},
   {title:'Statistiques du calcul', columns:4, portraitColumns:3,
    tiles:['hp','atk','def','em','critRate','critDmg','er'].map(key => ({
     title:LAB_STAT_LABELS[key], lines:[labStatValue(key, result.stats[key])]
    }))}
  ]
 };
 previewPng({
  title:'Astralis · ' + name + ' · Laboratoire',
  defaultFormat:'square',lockedLayout:true,
  artworks:character?._labImage ? [{label:'Portrait', image:character._labImage}] : [],
  render:options => drawPoster(data, options, posterBitmap)
 });
}

globalThis.document?.addEventListener('input',event=>{if(!event.target.matches('[data-priority-search]'))return;const term=foldAttackQuery(event.target.value);for(const row of document.querySelectorAll('[data-priority-id]'))row.hidden=!!term&&!foldAttackQuery(row.textContent).includes(term);});
globalThis.document?.addEventListener('change',event=>{const field=event.target;if(!field.matches('[data-priority-position]'))return;positionPriority(field.dataset.priorityPosition,field.value,labContext.characters.map(c=>c._id));refreshLab();});

globalThis.document?.addEventListener('click',event=>{const button=event.target.closest?.('[data-lab-apply-recommended]');if(!button)return;const p=persist();p.allowedSets=JSON.parse(button.dataset.labApplyRecommended);p.excludedSets=[];p.requiredSets=[];write(p);refreshLab();});

globalThis.document?.addEventListener('click',async event=>{
 const button=event.target.closest?.('[data-effect-catalog]');if(!button)return;
 const dialog=document.createElement('dialog');dialog.className='lab-effects-catalog';dialog.innerHTML='<header><h2>Répertoire des effets publiés</h2><button type="button" data-close aria-label="Fermer">×</button></header><p>Descriptions des armes (R1 à R5), sets et kit chargé. Un effet complexe demande une configuration explicite ; son texte n’est pas converti en bonus inventé.</p><input type="search" data-search aria-label="Rechercher un effet" placeholder="Arme, set, personnage, effet…"><select data-kind aria-label="Type de source"><option value="">Toutes les sources</option><option value="weapon">Armes</option><option value="set">Sets</option><option value="character">Personnage actif</option></select><button type="button" data-download>Télécharger le répertoire JSON</button><p role="status"></p><div data-rows></div>';
 const p=read(),context=viewContext(p),rows=effectCatalog(context,context.details||{},p.constellation);
 const draw=()=>{const term=foldAttackQuery(dialog.querySelector('[data-search]').value),kind=dialog.querySelector('[data-kind]').value,shown=rows.filter(row=>(!kind||row.type===kind)&&(!term||foldAttackQuery(row.owner+' '+row.name+' '+row.description).includes(term)));dialog.querySelector('[role=status]').textContent=shown.length+' effets publiés · '+shown.filter(r=>Object.keys(r.bonuses).length).length+' effets simples interprétés';dialog.querySelector('[data-rows]').innerHTML=shown.slice(0,100).map(row=>'<details><summary>'+esc(row.owner)+' · '+esc(row.name)+(row.locked?' · verrouillé':'')+'</summary><div>'+renderGameText(row.description)+'</div><small>'+esc(Object.keys(row.bonuses).length?'Bonus simple disponible : '+JSON.stringify(row.bonuses):'Conditions ou coefficients à configurer explicitement')+'</small></details>').join('')+(shown.length>100?'<p>Affichage limité à 100 résultats. Affine la recherche ou télécharge le répertoire complet.</p>':'');};
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.querySelector('[data-search]').oninput=draw;dialog.querySelector('[data-kind]').onchange=draw;dialog.querySelector('[data-download]').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:new Date().toISOString(),effects:rows},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='astralis-effets-publies.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};document.body.append(dialog);dialog.showModal();draw();
});

let labSyncTimer;
async function checkLabSync(force=false){
 const host=document.querySelector('[data-lab-sync-status]');if(!host)return;clearTimeout(labSyncTimer);
 try{const response=await fetch('/api/lab/data-status'+(force?'?refresh=1':''),{cache:'no-store'});if(!response.ok)throw new Error();const data=await response.json();if(!host.isConnected)return;
 host.textContent=data.state==='running'?'Mise à jour des tables en arrière-plan · tu peux continuer à calculer':data.state==='error'?'Actualisation indisponible · tables locales conservées':data.state==='ready'?'Tables vérifiées · '+data.characters+' personnages · '+data.weapons+' armes · '+String(data.revision||'').slice(0,8):'Tables numériques locales disponibles';
 if(data.state==='running')labSyncTimer=setTimeout(()=>checkLabSync(),5000);
 if(data.changed&&data.revision!==labContext.sourceSnapshot?.revision){const source=await fetch('./data/lab-source-snapshot.json',{cache:'no-store'}).then(r=>r.json());labContext.sourceSnapshot=source;document.dispatchEvent(new CustomEvent('astralis:lab-snapshot-updated',{detail:source}));host.textContent+=' · nouvelles données chargées';}
 }catch{host.textContent='Tables numériques locales · relance le serveur pour activer la vérification automatique';}
}
globalThis.document?.addEventListener('click',event=>{if(event.target.closest?.('[data-lab-sync-refresh]'))checkLabSync(true);});

globalThis.document?.addEventListener('click',async event=>{if(!event.target.closest?.('[data-complex-effects]'))return;const p=persist(),{editComplexEffects}=await import('./complex-controls.js'),result=await editComplexEffects(p.complexEffects,p.complexTeamElements);if(result){p.complexEffects=result.config;p.complexTeamElements=result.elements;if(p.complexEffects.skirk)p.complexEffects.skirk.constellation=Number(p.constellation)||0;write(p);if(p.attackSelection?.startsWith('99:'))useTalentValue(...p.attackSelection.split(':').map(Number));else refreshLab();}});
