import { renderGameText } from './character-content.js';
import { cardSlug } from './card-catalog.js';

const payloads=new Map(), imageCache=new Map(), kitCache=new Map(), kitPending=new Map();
const customHashes=new Map();
export let ASTRALIS_CARD_ARTWORKS={};
let kitResolver=null, active=0;
const kitQueue=[];
const fontSheetReady=new Promise(resolve=>{
 const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/card-design/fonts.css';link.onload=link.onerror=resolve;document.head.append(link);
});
const cachedKitsReady=fetch('/public/card-kits.json?v=20261109-cards-2',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).then(data=>{for(const [key,kit] of Object.entries(data.kits||{}))kitCache.set(key,kit);}).catch(()=>{});
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const artworkKey=card=>`${card.game}:${card.artSlug||cardSlug(card.name)}:${card.rarity}`;
const artworkUrl=art=>art?.src?`${art.src}?v=${art.sha256.slice(0,16)}`:'';
export const cardAssetsReady=fetch('/public/card-artworks.json?v=20261109-cards-2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Manifeste des illustrations absent');return r.json()}).catch(error=>({assignments:{},artworks:{},error:error.message}));
cardAssetsReady.then(manifest=>{ASTRALIS_CARD_ARTWORKS=manifest.ASTRALIS_CARD_ARTWORKS||{};window.ASTRALIS_CARD_ARTWORKS=ASTRALIS_CARD_ARTWORKS;});
const designReady=Promise.all([
 fetch('/assets/card-design/reference.json').then(r=>{if(!r.ok)throw Error('Modèles de référence absents');return r.json()}),
 fetch('/assets/card-design/reference.css').then(r=>{if(!r.ok)throw Error('Styles de référence absents');return r.text()}),
 fetch('/styles/card-runtime.css?v=20261109-cards-2').then(r=>{if(!r.ok)throw Error('Styles de consultation absents');return r.text()}),
]).then(([reference,css,runtime])=>{
 // Chromium does not register @property declarations from a shadow stylesheet.
 // Register the reference's angle properties so its edge gradients stay identical.
 for(const [,name,body] of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]+)\}/g)){
  try{CSS.registerProperty({name,syntax:body.match(/syntax:\s*['"]([^'"]+)/)[1],inherits:/inherits:\s*true/.test(body),initialValue:body.match(/initial-value:\s*([^;]+)/)[1].trim()});}catch{}
 }
 const base=new CSSStyleSheet();base.replaceSync(css.replace(/:root/g,':host'));
 const behavior=new CSSStyleSheet();behavior.replaceSync(runtime);
 return {reference,base,behavior,css,runtime};
});
export function configureCardKits(resolver){kitResolver=resolver;}
function refreshKitCards(key){document.querySelectorAll('astralis-card').forEach(node=>{if(node.card&&`${node.card.game}:${node.card.artSlug||cardSlug(node.card.name)}`===key)node.render()});}
function pumpKits(){while(active<4&&kitQueue.length){active++;const task=kitQueue.shift();Promise.resolve().then(task.run).then(task.resolve,task.reject).finally(()=>{active--;pumpKits()});}}
export async function ensureCardKit(card){
 await cachedKitsReady;
 const key=`${card.game}:${card.artSlug||cardSlug(card.name)}`;
 if(kitCache.has(key))return Promise.resolve(kitCache.get(key));
 if(kitPending.has(key))return kitPending.get(key);
 if(!kitResolver||card.kind!=='character'||!card._item)return Promise.resolve([]);
 const pending=new Promise((resolve,reject)=>{kitQueue.push({resolve,reject,run:async()=>{
  const kit=await kitResolver(card);kitCache.set(key,kit||[]);
  refreshKitCards(key);
  return kit;
 }});pumpKits()}).catch(()=>{kitCache.set(key,[]);refreshKitCards(key);return []}).finally(()=>kitPending.delete(key));
 kitPending.set(key,pending);return pending;
}
export function loadCardImage(url){
 if(!url)return Promise.resolve(null);
 if(imageCache.has(url)){const cached=imageCache.get(url);imageCache.delete(url);imageCache.set(url,cached);return cached;}
 imageCache.set(url,new Promise(resolve=>{const image=new Image();image.decoding='async';image.onload=()=>image.decode().catch(()=>{}).then(()=>resolve(image));image.onerror=()=>resolve(null);image.src=url;}));
 // Keep a whole booster plus the current page without retaining every decoded
 // 2K illustration for the lifetime of a long collection session.
 while(imageCache.size>16)imageCache.delete(imageCache.keys().next().value);
 return imageCache.get(url);
}
export async function preloadCards(cards){const manifest=await cardAssetsReady;await Promise.all(cards.map(async card=>{
 const assignment=manifest.assignments[artworkKey(card)],art=manifest.artworks[assignment];
 await loadCardImage(artworkUrl(art));await ensureCardKit(card);
}));}
export function cardMarkup(card,{hp,mode='static',customArt='',fixture='',moves}={}){
 const key=card.id+(fixture?`:${fixture}`:'');payloads.set(key,{card,hp,customArt,fixture,moves});
 return `<astralis-card data-render-key="${escape(key)}" data-card-id="${escape(card.id)}" data-rarity="${escape(card.rarity)}" mode="${escape(mode)}" aria-label="${escape(card.name)}, ${escape(card.rarityLabel)}"></astralis-card>`;
}
function summary(description,move={}){
 const container=document.createElement('div');container.innerHTML=renderGameText(description,{parameters:move.attributes?.parameters||move.params||{},level:10});
 const text=container.textContent.replace(/\s+/g,' ').trim();
 const sentence=text.match(/^.{20,170}?[.!?](?:\s|$)/)?.[0]?.trim();
 if(sentence)return sentence;
 if(text.length<=165)return text;
 return text.slice(0,162).replace(/\s+\S*$/,'')+'…';
}
function movesFor(card){
 const key=`${card.game}:${card.artSlug||cardSlug(card.name)}`;
 const kit=kitCache.get(key)||[];
 if(card.kind==='energy')return [];
 if(card.kind==='group')return card.members.flatMap(name=>{
  const memberKey=`${card.game}:${cardSlug(name)}`;
  const kit=kitCache.get(memberKey)||[...kitCache].find(([key])=>key.startsWith(memberKey+'-'))?.[1]||[];
  const move=kit.find(move=>move.variants?.includes('E'))||kit[0];
  return move?[{...move,name:`${name} · ${move.name}`}]:[];
 }).slice(0,2);
 if(card.kind==='equipment')return [{name:card.skills?.[0]||card.name,description:card.flavor||'',label:'Passif'}];
 // Prefer the documented skill and ultimate; never manufacture damage or costs.
 const relevant=kit.filter(move=>move.variants?.some(code=>code==='E'||code==='Q'));
 return (relevant.length?relevant:kit).slice(0,2);
}
const costAmount=move=>typeof move.cost?.amount==='number'?String(move.cost.amount):typeof move.cost==='number'?String(move.cost):'';
const alias={eternal:'astral',aeon:'legend',equipment:'full',energy:'common'};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduced';
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const node=entry.target;node.toggleAttribute('offscreen',!entry.isIntersecting);if(entry.isIntersecting)node.loadArt();}}, {rootMargin:'160px'});
const resizeObserver=new ResizeObserver(entries=>{for(const entry of entries){const node=entry.target;if(node.lastFitWidth===entry.contentRect.width)continue;node.lastFitWidth=entry.contentRect.width;cancelAnimationFrame(node.fitFrame);node.fitFrame=requestAnimationFrame(()=>node.fitText());}});
class AstralisCard extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.generation=0;}
 connectedCallback(){
  this.card=payloads.get(this.dataset.renderKey)?.card;observer.observe(this);resizeObserver.observe(this);this.render();
  this.onpointermove=event=>{
   if(this.getAttribute('mode')==='static'||reduced()||event.pointerType==='touch')return;
   const rect=this.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
   cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>{
    const card=this.shadowRoot.querySelector('.tcg-card');if(!card)return;
    this.setAttribute('interacting','');card.style.setProperty('--ry',`${(x-.5)*16}deg`);card.style.setProperty('--rx',`${(.5-y)*16}deg`);
    card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);
   });
  };
  this.onpointerleave=this.onpointercancel=this.onblur=()=>this.resetTilt();
 }
 disconnectedCallback(){observer.unobserve(this);resizeObserver.unobserve(this);cancelAnimationFrame(this.frame);cancelAnimationFrame(this.fitFrame);this.generation++;}
 resetTilt(){cancelAnimationFrame(this.frame);this.removeAttribute('interacting');const card=this.shadowRoot.querySelector('.tcg-card');for(const key of ['--rx','--ry','--mx','--my'])card?.style.removeProperty(key);}
 async render(){
  const generation=++this.generation,payload=payloads.get(this.dataset.renderKey);if(!payload)return;
  this.card=payload.card;
  try{
   const [{reference,base,behavior},manifest]=await Promise.all([designReady,cardAssetsReady,cachedKitsReady,fontSheetReady]);
   if(!this.isConnected||generation!==this.generation)return;
   this.shadowRoot.adoptedStyleSheets=payload.fixture?[base]:[base,behavior];
   const rarity=alias[this.card.rarity]||this.card.rarity;
   const template=payload.fixture?reference.cards.find(row=>`${row.slug}:${row.rarity}`===payload.fixture):reference.cards.find(row=>row.rarity===rarity&&row.slug===(this.card.rarity==='eternal'?'obsidian':this.card.artSlug||cardSlug(this.card.name)))||reference.cards.find(row=>row.rarity===rarity);
   if(!template)throw Error(`Modèle absent : ${this.card.rarity}`);
   this.shadowRoot.innerHTML=template.html;
   if(payload.fixture)return;
   const card=this.card,root=this.shadowRoot,article=root.querySelector('.tcg-card');
   const set=(selector,text)=>{const node=root.querySelector(selector);if(node)node.textContent=text;};
   set('.tcg-card__name',card.name);set('.tcg-card__hp',payload.hp?`PV ${payload.hp}`:'');
   if(card.rarity!=='eternal')set('.tcg-ast-ribbon','ASTRALE');
   set('.tcg-card__foot span:first-child',card.rarityLabel);set('.tcg-card__foot span:last-child',card.number);
   const isPlain=card.kind==='energy';article.classList.toggle('tcg-energy',isPlain);article.setAttribute('role','group');article.setAttribute('aria-label',`${card.name} · ${card.rarityLabel}`);
   // Reference illustrations, badges and texts belong to their reference characters only.
   root.querySelectorAll('.tcg-badge img,.tcg-elem-wm').forEach(node=>node.remove());
   const badge=root.querySelector('.tcg-badge');if(badge)badge.textContent=card.element||'';
   const artBox=root.querySelector('.tcg-card__art');artBox.querySelectorAll('img,.tcg-fan-hint,.tcg-gs,.art-fallback').forEach(node=>node.remove());
   const assignment=manifest.assignments[artworkKey(card)],art=manifest.artworks[assignment];
   this.art=payload.customArt?{src:payload.customArt,focal:[50,35],supplied:true}:art?{...art,src:artworkUrl(art)}:null;
   if(payload.customArt&&!customHashes.has(payload.customArt))customHashes.set(payload.customArt,crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload.customArt)).then(buffer=>'custom:'+Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('')));
   this.dataset.artwork=payload.customArt?await customHashes.get(payload.customArt):this.art?.sha256||'';this.dataset.artStatus=this.art?'pending':'missing';
   artBox.classList.toggle('has-art',!!this.art);
   const fallback=document.createElement('span');fallback.className='card-art-placeholder';fallback.innerHTML=`<b>${escape(card.name)}</b><small>${isPlain?'Emplacement pour ton illustration':'Illustration officielle à fournir'}</small>`;artBox.prepend(fallback);
   if(this.art){const img=document.createElement('img');img.className='booster-card-image';img.alt=`Illustration de ${card.name}`;img.loading=this.getAttribute('mode')==='static'?'lazy':'eager';img.decoding='async';img.width=660;img.height=924;img.style.objectPosition=(this.art.focal||[50,35]).map(value=>`${value}%`).join(' ');img.dataset.src=this.art.src;artBox.prepend(img);}
   const skills=root.querySelector('.tcg-skills'),moves=payload.moves||movesFor(card);
   skills.innerHTML=moves.length?moves.map(move=>`<div class="tcg-skill tcg-skill--pk"><div class="tcg-skill__row"><span class="tcg-en"></span><p class="tcg-move-name">${escape(move.name)}</p><em>${escape(costAmount(move))}</em></div><p class="card-move-description" title="${escape(summary(move.description||'',move))}">${renderGameText(summary(move.description||'',move))}</p></div>`).join(''):(isPlain?'':`<p class="card-kit-missing">${card._item&&!kitCache.has(`${card.game}:${card.artSlug||cardSlug(card.name)}`)?'Chargement du kit…':'Kit indisponible dans les sources connectées'}</p>`);
   // No invented Pokémon weaknesses, retreat costs or pseudo-random damage numbers.
   root.querySelector('.tcg-pk-info')?.remove();
   if(!this.hasAttribute('offscreen')||this.getAttribute('mode')!=='static')this.loadArt();
   requestAnimationFrame(()=>this.fitText());
   document.fonts.ready.then(()=>{if(this.isConnected)this.fitText()});
   if(card.kind==='character')ensureCardKit(card);
  }catch(error){this.dataset.renderError=error.message;this.shadowRoot.innerHTML=`<p role="alert">${escape(error.message)}</p>`;}
 }
 async loadArt(){
  const img=this.shadowRoot.querySelector('img[data-src]');if(!img||img.src)return;
  const source=img.dataset.src;const image=await loadCardImage(source);
  if(!this.isConnected||!img.isConnected)return;
  if(image){img.src=source;this.dataset.artStatus='ready';this.shadowRoot.querySelector('.card-art-placeholder')?.remove();}
  else{img.remove();this.dataset.artStatus='missing';this.shadowRoot.querySelector('.tcg-card__art')?.classList.remove('has-art');}
 }
 fitText(){
  if(!this.isConnected||payloads.get(this.dataset.renderKey)?.fixture)return;
  for(const node of this.shadowRoot.querySelectorAll('.tcg-card__name,.tcg-move-name,.card-move-description,.tcg-card__foot span')){
   if(node.classList.contains('card-move-description')){
    const full=node.title||node.textContent;node.textContent=full;node.setAttribute('aria-label',full);node.style.fontSize='';
    const words=node.textContent.replace(/…$/,'').split(/\s+/);
    if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1){
     let low=1,high=words.length;
     while(low<high){const middle=Math.ceil((low+high)/2);node.textContent=words.slice(0,middle).join(' ')+'…';if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)high=middle-1;else low=middle;}
     node.textContent=words.slice(0,low).join(' ')+'…';node.title=full;
    }
    continue;
   }
   node.style.fontSize='';let size=parseFloat(getComputedStyle(node).fontSize);
   if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1){
    let low=6,high=size;
    while(high-low>.25){const middle=(low+high)/2;node.style.fontSize=`${middle}px`;if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)high=middle;else low=middle;}
    node.style.fontSize=`${low}px`;
   }
  }
 }
}
customElements.define('astralis-card',AstralisCard);
export async function exportCardPng(element){
 if(!(element instanceof AstralisCard))throw Error('Choisis une carte à exporter.');
 await element.loadArt();await document.fonts.ready;
 const {css,runtime}=await designReady;
 const original=element.shadowRoot.querySelector('.tcg-card'),copy=original.cloneNode(true);
 const width=Math.round(element.clientWidth),height=Math.round(element.clientHeight);
 for(const image of copy.querySelectorAll('img')){
  if(!image.src){image.remove();continue;}
  const response=await fetch(image.src);if(!response.ok)throw Error('Illustration inaccessible pour l’export.');
  const blob=await response.blob();image.src=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});
 }
 // Freeze the current animation frame, using the exact card DOM and reference CSS.
 const sourceNodes=[original,...original.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
 sourceNodes.forEach((node,index)=>{const style=getComputedStyle(node);for(const property of style)clones[index].style.setProperty(property,style.getPropertyValue(property).replace(/url\(["']?[^)"']*#([^)"']+)["']?\)/g,'url(#$1)'));clones[index].style.setProperty('animation','none');clones[index].style.setProperty('transition','none');});
 copy.style.transform='none';copy.style.margin='0';
 const wrapper=document.createElement('div');wrapper.setAttribute('xmlns','http://www.w3.org/1999/xhtml');wrapper.style.cssText=`width:${width}px;height:${height}px;position:relative;overflow:visible`;
 let fonts=await fetch('/assets/card-design/fonts.css').then(r=>r.text());
 for(const match of [...fonts.matchAll(/url\((\/assets\/fonts\/[^)]+)\)/g)]){
  const blob=await fetch(match[1]).then(r=>r.blob());const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});fonts=fonts.replace(match[1],data);
 }
 const exportRuntime=runtime.replace(/:host\(([^)]+)\)/g,'.export-root$1').replace(/:host/g,'.export-root');
 const style=document.createElement('style');style.textContent=fonts+css.replace(/:root/g,'.export-root')+exportRuntime+'*{animation:none!important;transition:none!important}';wrapper.className='export-root';wrapper.setAttribute('mode',element.getAttribute('mode')||'detail');wrapper.append(style,copy);
 const xml=new XMLSerializer().serializeToString(wrapper);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width*3}" height="${height*3}" viewBox="0 0 ${width} ${height}"><foreignObject width="${width}" height="${height}">${xml}</foreignObject></svg>`;
 const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
 const canvas=document.createElement('canvas');canvas.width=width*3;canvas.height=height*3;canvas.getContext('2d').drawImage(image,0,0);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Export PNG impossible.')),'image/png'));
}
export function cardDiagnostics(){
 const rows=[...document.querySelectorAll('astralis-card')].map(node=>{
  const overflow=[...node.shadowRoot.querySelectorAll('.tcg-card__name,.tcg-move-name,.card-move-description,.tcg-card__foot span')].filter(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1).map(el=>el.textContent);
  return {id:node.dataset.cardId,rarity:node.dataset.rarity,artwork:node.dataset.artwork,status:node.dataset.artStatus,broken:!!node.shadowRoot.querySelector('img[src]')&&[...node.shadowRoot.querySelectorAll('img[src]')].some(img=>img.complete&&!img.naturalWidth),overflow,error:node.dataset.renderError||null};
 });
 const hashes=new Map();for(const row of rows)if(row.artwork){const ids=hashes.get(row.artwork)||new Set();ids.add(row.id);hashes.set(row.artwork,ids);}
 return {rows,duplicates:[...hashes].filter(([,ids])=>ids.size>1).map(([hash,ids])=>({hash,ids:[...ids]})),missing:rows.filter(row=>row.status==='missing'),overflow:rows.filter(row=>row.overflow.length),broken:rows.filter(row=>row.broken)};
}
if(new URLSearchParams(location.search).get('debug')==='cards'){
 window.astralisCards={diagnose:cardDiagnostics,assets:cardAssetsReady,preload:preloadCards};
 const panel=document.createElement('details');panel.id='cards-debug';panel.innerHTML='<summary>Diagnostic cartes</summary><button type="button">Actualiser</button><pre></pre>';document.body.append(panel);
 panel.querySelector('button').onclick=()=>{panel.querySelector('pre').textContent=JSON.stringify(cardDiagnostics(),null,2);};
}
