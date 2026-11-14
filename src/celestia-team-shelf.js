import {labConfigurations,parseLabConfiguration} from './lab-import-config.js?v=84';

const INDEX='./data/celestia-exports/manifest.json';
const SEEN='astralis:gi:celestia-seen';
const STORAGE='astralis:gi:lab-configurations';
const safe=value=>{try{return JSON.parse(value||'{}')}catch{return {}}};

class CelestiaTeamShelf extends (globalThis.HTMLElement||class {}){
 connectedCallback(){
  if(this.dataset.ready)return;
  this.dataset.ready='true';
  this.innerHTML='<details class="celestia-team-shelf"><summary><span><b>Équipes de la communauté</b><small>Exports Celestia déjà récupérés dans ce projet</small></span><span data-count>Recherche…</span></summary><div class="celestia-team-shelf-body"><label class="celestia-team-search">Filtrer les exports<input type="search" data-search placeholder="Personnage, équipe, style…"></label><p data-status role="status">Chargement des exports locaux…</p><div class="celestia-team-rows" data-rows></div></div></details>';
  this.querySelector('[data-search]').addEventListener('input',()=>this.draw());
  this.load();
 }
 async load(){
  try{
   const response=await fetch(INDEX,{cache:'no-store'});
   if(!response.ok)throw Error('Index Celestia indisponible.');
   this.manifest=await response.json();this.rows=[];
   const aliases=await fetch('./public/gi-name-aliases.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
   const setNames=new Map((aliases.artifacts||[]).map(set=>[String(set.id),set.fr?.[0]||set.en?.[0]]));
   for(const entry of this.manifest.entries||[])for(const variant of [entry,...(entry.variants||[])]){
    const result=variant.exports?.team,file=result?.file,name=entry.slug||variant.slug||entry.name||'Équipe',set=variant.setId==null?'':` · ${setNames.get(String(variant.setId))||`Set ${variant.setId}`}`;
    if(file&&/^team\/[a-z0-9-]+\.json$/i.test(file))this.rows.push({label:String(name).replaceAll('-',' ')+set,file,revision:result.sha256||'initial'});
   }
   this.querySelector('[data-status]').textContent=this.rows.length?'Choisis un export pour l’ouvrir dans l’éditeur d’équipe.':'Aucune équipe exportée disponible pour le moment.';
   this.draw();
  }catch(error){this.querySelector('[data-status]').textContent=error.message;this.querySelector('[data-count]').textContent='hors ligne';}
 }
 draw(){
  if(!this.rows)return;
  const host=this.querySelector('[data-rows]'),query=this.querySelector('[data-search]').value.trim().toLocaleLowerCase('fr'),seen=safe(localStorage.getItem(SEEN));
  const filtered=this.rows.filter(row=>row.label.toLocaleLowerCase('fr').includes(query)),fresh=filtered.filter(row=>seen[row.file]!==row.revision);
  this.querySelector('[data-count]').textContent=`${filtered.length} équipe${filtered.length===1?'':'s'}${fresh.length?` · ${fresh.length} nouvelle${fresh.length===1?'':'s'}`:''}`;
  host.replaceChildren();
  for(const row of filtered.slice(0,60)){
   const button=document.createElement('button'),mark=document.createElement('span'),copy=document.createElement('span'),name=document.createElement('b'),meta=document.createElement('small'),badge=document.createElement(fresh.includes(row)?'i':'span');
   button.type='button';button.className='celestia-team-row';mark.className='celestia-team-mark';mark.setAttribute('aria-hidden','true');mark.textContent='✦';
   name.textContent=row.label;meta.textContent='Composition Celestia · fichier local';copy.append(name,meta);
   if(fresh.includes(row))badge.textContent='Nouveau';else{badge.className='celestia-team-open';badge.textContent='Ouvrir ↗';}
   button.append(mark,copy,badge);button.addEventListener('click',()=>this.open(row,button));host.append(button);
  }
  if(filtered.length>60){const more=document.createElement('p');more.textContent=`60 premiers résultats affichés sur ${filtered.length}. Affine ta recherche pour retrouver une autre composition.`;host.append(more);}
 }
 async open(row,button){
  const status=this.querySelector('[data-status]');button.disabled=true;
  try{
   const response=await fetch(`./data/celestia-exports/${row.file}`,{cache:'no-store'});
   if(!response.ok)throw Error('Ce fichier local est introuvable.');
   const parsed=parseLabConfiguration(await response.text());
   if(parsed.kind!=='team')throw Error('Cet export ne contient pas une équipe compatible.');
   const saved=labConfigurations();let existing=saved.find(item=>JSON.stringify(item.original)===JSON.stringify(parsed.original));
   if(!existing){existing={...parsed,id:crypto.randomUUID()};saved.push(existing);localStorage.setItem(STORAGE,JSON.stringify(saved));}
   const seen=safe(localStorage.getItem(SEEN));seen[row.file]=row.revision;localStorage.setItem(SEEN,JSON.stringify(seen));
   status.textContent=`${parsed.original.name} · prêt dans l’éditeur d’équipe`;this.draw();
   this.dispatchEvent(new CustomEvent('astralis:open-imported-team',{bubbles:true,detail:existing}));
  }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
 }
}
if(globalThis.customElements&&!customElements.get('celestia-team-shelf'))customElements.define('celestia-team-shelf',CelestiaTeamShelf);
