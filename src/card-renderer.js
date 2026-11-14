import { cardSlug } from './card-catalog.js';

const payloads=new Map(), imageCache=new Map();
const customHashes=new Map();
let unifiedCardTemplate=null;
const fallbackArtworkByKey=new Map(),duplicateAssignments=new Set();
export let ASTRALIS_CARD_ARTWORKS={};
const fontSheetReady=new Promise(resolve=>{
 const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/card-design/fonts.css';link.onload=link.onerror=resolve;document.head.append(link);
});
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cardText=value=>String(value??'').replace(/<\/?[a-z][^>]*>/gi,'').replace(/\s+/g,' ').trim();
export const artworkKey=card=>`${card.game}:${card.artSlug||cardSlug(card.name)}:${card.rarity}`;
const artworkUrl=art=>art?.src?`${art.src.startsWith('/')?art.src:`/${art.src}`}?v=${art.sha256.slice(0,16)}`:'';
const fallbackRarityOrder={'eternal':0,'astral':1,'gold':2,'secret':3,'legend':4,'full':5,'group':6,'aeon':7,'epic':8,'rare':9,'super':10,'common':11,'equipment':12,'energy':13};
const noPromoRarities=new Set(['full','group','secret','gold','legend','astral','eternal','aeon']);
function restrictedArtwork(card,path,manifest){
 if(!noPromoRarities.has(card.rarity))return false;
 const art=manifest.artworks?.[path];if(!art)return false;
 return ['official-character-poster','official-character-promo','splash-art'].includes(art.artType)||/\b(?:splash(?:\s*art)?|character\s*poster|character\s*promo)\b/i.test(art.title||'');
}
function elementIcon(card){
 const element=String(card.element||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const aliases={lightning:'thunder',electro:'thunder',ice:'ice',cryo:'ice',pyro:'fire',fire:'fire',hydro:'hydro',water:'hydro',anemo:'anemo',wind:'wind',aero:'wind',geo:'geo',dendro:'dendro',physical:'physical',quantum:'quantum',imaginary:'imaginary'};
 const key=aliases[element];if(!key)return null;
 if(card.game==='gi'&&['anemo','cryo','dendro','electro','geo','hydro','pyro'].includes(element))return `/assets/genshin/elements/gi-${element}.png`;
 if(card.game==='hsr'&&['fire','ice','imaginary','physical','quantum','thunder','wind'].includes(key))return `/assets/elements/hsr-${key}.png`;
 return null;
}
function artworkSourceKeys(card){
 const name=cardSlug(cardText(card.name)),aliases=card.game==='hsr'&&['aha','aha-forme-nihilux'].includes(name)?['aeon-aha']:card.game==='hsr'&&name.startsWith('silver-wolf')?['silver-wolf']:[];
 return [...new Set([`${card.game}:${card.artSlug||name}`,`${card.game}:${name}`,...aliases.map(slug=>`${card.game}:${slug}`)])];
}
function planFallbackArtwork(catalog,manifest,lowRarityFallbacks={}){
 fallbackArtworkByKey.clear();duplicateAssignments.clear();const groups=new Map(),reserved=new Set();
 const artworkIds=path=>{const art=manifest.artworks?.[path];return new Set([art?.sourcePixelSha256,art?.pixelSha256,art?.sha256,path].filter(Boolean));};
 const isReserved=ids=>[...ids].some(id=>reserved.has(id)),reserve=ids=>ids.forEach(id=>reserved.add(id));
 const artworkId=path=>artworkIds(path).values().next().value;
 const ordered=[...catalog].sort((a,b)=>(fallbackRarityOrder[a.rarity]??99)-(fallbackRarityOrder[b.rarity]??99)||String(a.id).localeCompare(String(b.id)));
 for(const card of ordered){const key=artworkKey(card),path=manifest.assignments?.[key];if(!path)continue;const ids=artworkIds(path);if(isReserved(ids))duplicateAssignments.add(key);else reserve(ids);}
 for(const card of catalog){const identity=`${card.game}:${card.artSlug||cardSlug(cardText(card.name))}`;if(!groups.has(identity))groups.set(identity,[]);groups.get(identity).push(card);}
 for(const [identity,cards] of groups){
  const sourceKeys=[...new Set(cards.flatMap(artworkSourceKeys))],pool=[...new Set(sourceKeys.flatMap(key=>manifest.ASTRALIS_CARD_ARTWORKS?.[key]||[]))],
   poolByImage=new Map();
  for(const path of pool){const imageId=artworkId(path);if(!poolByImage.has(imageId))poolByImage.set(imageId,path);}
  const available=[...poolByImage].filter(([,path])=>!isReserved(artworkIds(path))).map(([,path])=>path);
  cards.sort((a,b)=>(fallbackRarityOrder[a.rarity]??99)-(fallbackRarityOrder[b.rarity]??99)||String(a.id).localeCompare(String(b.id)));
  for(const card of cards){const key=artworkKey(card);if(manifest.assignments?.[key]&&!duplicateAssignments.has(key))continue;
   let path;
   const index=available.findIndex(candidate=>!restrictedArtwork(card,candidate,manifest));if(index>=0)path=available.splice(index,1)[0];
   if(path){fallbackArtworkByKey.set(key,{path});reserve(artworkIds(path));}
  }
 }
 for(const card of ordered){const key=artworkKey(card),candidate=lowRarityFallbacks[card.id],ids=new Set([candidate?.sourcePixelSha256,candidate?.pixelSha256,candidate?.sha256].filter(Boolean));if(candidate&&['common','super','rare','epic'].includes(card.rarity)&&(!manifest.assignments?.[key]||duplicateAssignments.has(key))&&!fallbackArtworkByKey.has(key)&&ids.size&&!isReserved(ids)){fallbackArtworkByKey.set(key,{art:candidate});reserve(ids);}}
}
function resolveCardArtwork(card,manifest){
 const key=artworkKey(card),assignment=duplicateAssignments.has(key)?null:manifest.assignments?.[key],planned=fallbackArtworkByKey.get(key),art=assignment?manifest.artworks[assignment]:planned?.art||manifest.artworks[planned?.path];
 if(!art)return null;
 return {...art,src:artworkUrl(art)};
}
export const cardAssetsReady=fetch('/public/card-artworks.json?v=20261112-full-art-9',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Manifeste des illustrations absent');return r.json()}).catch(error=>({assignments:{},artworks:{},error:error.message}));
cardAssetsReady.then(manifest=>{ASTRALIS_CARD_ARTWORKS=manifest.ASTRALIS_CARD_ARTWORKS||{};window.ASTRALIS_CARD_ARTWORKS=ASTRALIS_CARD_ARTWORKS;});
const artworkPlanReady=Promise.all([cardAssetsReady,fetch('/public/card-catalog.json?v=20261112-cards-3',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Catalogue des cartes absent');return r.json()}).catch(()=>({cards:[]})),fetch('/public/card-low-rarity-fallbacks.json?v=20261112-cards-1',{cache:'no-cache'}).then(r=>r.ok?r.json():{fallbacks:{}}).catch(()=>({fallbacks:{}}))]).then(([manifest,catalog,lowFallbacks])=>{planFallbackArtwork(catalog.cards||[],manifest,lowFallbacks.fallbacks||{});return manifest;});
const runtimeCssReady=fetch('/styles/card-runtime.css?v=20261114-icon-fit-1').then(r=>{if(!r.ok)throw Error('Styles de consultation absents');return r.text()});
const unifiedCssReady=fetch('/styles/card-unified.css?v=20261112-full-art-8').then(r=>{if(!r.ok)throw Error('Styles Full Art absents');return r.text()});
const designReady=Promise.all([runtimeCssReady,unifiedCssReady]).then(([runtime,unifiedCss])=>{
 const behavior=new CSSStyleSheet();behavior.replaceSync(runtime);
 const unified=new CSSStyleSheet();unified.replaceSync(unifiedCss);
 return {behavior,unified};
});
let referenceDesignReady;
function loadReferenceDesign(){
 if(!referenceDesignReady)referenceDesignReady=Promise.all([
  fetch('/assets/card-design/reference.json').then(r=>{if(!r.ok)throw Error('Modèles de référence absents');return r.json()}),
  fetch('/assets/card-design/reference.css').then(r=>{if(!r.ok)throw Error('Styles de référence absents');return r.text()}),
 ]).then(([reference,css])=>{
  for(const [,name,body] of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]+)\}/g)){
   try{CSS.registerProperty({name,syntax:body.match(/syntax:\s*['"]([^'"]+)/)[1],inherits:/inherits:\s*true/.test(body),initialValue:body.match(/initial-value:\s*([^;]+)/)[1].trim()});}catch{}
  }
  const base=new CSSStyleSheet();base.replaceSync(css.replace(/:root/g,':host'));
  return {reference,base};
 });
 return referenceDesignReady;
}
export function configureCardKits(){/* Les cartes sont maintenant des portraits Full Art sans panneau de talents. */}
function getUnifiedCardTemplate(){
 if(unifiedCardTemplate)return unifiedCardTemplate;
 const template=document.createElement('template');template.innerHTML='<article class="tcg-card tcg-card--full tcg-card--unified"><div class="tcg-card__art"></div><div class="tcg-card__inner"><header class="tcg-card__head"><div class="lft"><span class="tcg-badge"></span><span class="tcg-card__name"></span></div><span class="tcg-card__hp"></span></header><footer class="tcg-card__foot"><span></span><span></span></footer></div></article>';
 unifiedCardTemplate=template;return template;
}
export async function ensureCardKit(){return [];}
export function loadCardImage(url){
 if(!url)return Promise.resolve(null);
 if(imageCache.has(url)){const cached=imageCache.get(url);imageCache.delete(url);imageCache.set(url,cached);return cached;}
 imageCache.set(url,new Promise(resolve=>{const image=new Image();image.decoding='async';image.onload=()=>image.decode().catch(()=>{}).then(()=>resolve(image));image.onerror=()=>resolve(null);image.src=url;}));
 // Keep a whole booster plus the current page without retaining every decoded
 // 2K illustration for the lifetime of a long collection session.
 while(imageCache.size>24)imageCache.delete(imageCache.keys().next().value);
 return imageCache.get(url);
}
export async function preloadCards(cards){const manifest=await artworkPlanReady;await Promise.all(cards.map(async card=>{
 const art=resolveCardArtwork(card,manifest);await loadCardImage(art?.src||'');
}));}
export function cardMarkup(card,{hp,mode='static',customArt='',fixture='',moves}={}){
 const key=card.id+(fixture?`:${fixture}`:'');payloads.delete(key);payloads.set(key,{card,hp,customArt,fixture,moves});
 while(payloads.size>512)payloads.delete(payloads.keys().next().value);
 return `<astralis-card data-render-key="${escape(key)}" data-card-id="${escape(card.id)}" data-game="${escape(card.game)}" data-rarity="${escape(card.rarity)}" mode="${escape(mode)}" aria-label="${escape(cardText(card.name))}, ${escape(card.rarityLabel)}"></astralis-card>`;
}
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduced';
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const node=entry.target;node.toggleAttribute('offscreen',!entry.isIntersecting);if(entry.isIntersecting)node.loadArt();}}, {rootMargin:'160px'});
class AstralisCard extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.generation=0;}
 connectedCallback(){
  this.card=payloads.get(this.dataset.renderKey)?.card;observer.observe(this);this.render();
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
 disconnectedCallback(){observer.unobserve(this);cancelAnimationFrame(this.frame);cancelAnimationFrame(this.fitFrame);this.generation++;}
 resetTilt(){cancelAnimationFrame(this.frame);this.removeAttribute('interacting');const card=this.shadowRoot.querySelector('.tcg-card');for(const key of ['--rx','--ry','--mx','--my'])card?.style.removeProperty(key);}
 async render(){
  const generation=++this.generation,payload=payloads.get(this.dataset.renderKey);if(!payload)return;
  this.card=payload.card;
  try{
   if(payload.fixture){
    const [{reference,base}]=await Promise.all([loadReferenceDesign(),fontSheetReady]);
    if(!this.isConnected||generation!==this.generation)return;
    const template=reference.cards.find(row=>`${row.slug}:${row.rarity}`===payload.fixture);
    if(!template)throw Error(`Modèle absent : ${this.card.rarity}`);
    this.shadowRoot.adoptedStyleSheets=[base];this.shadowRoot.innerHTML=template.html;return;
   }
   const [{behavior,unified},manifest]=await Promise.all([designReady,artworkPlanReady,fontSheetReady]);
   if(!this.isConnected||generation!==this.generation)return;
   this.shadowRoot.adoptedStyleSheets=[unified,behavior];
   this.shadowRoot.replaceChildren(getUnifiedCardTemplate().content.cloneNode(true));
   const card=this.card,root=this.shadowRoot,article=root.querySelector('.tcg-card'),displayName=cardText(card.name);
   const set=(selector,text)=>{const node=root.querySelector(selector);if(node)node.textContent=text;};
    const colors={common:'#9aa0a8',super:'#6dcc8b',rare:'#63a9ff',epic:'#a778ed',full:'#9aa0a8',group:'#9aa0a8',secret:'#9aa0a8',gold:'#9aa0a8',legend:'#9aa0a8',astral:'#9aa0a8',eternal:'#9aa0a8',aeon:'#9aa0a8',equipment:'#9aa0a8',energy:'#9aa0a8'};
   const fnv=Array.from(`${card.game}:${card.id}`).reduce((hash,char)=>Math.imul(hash^char.charCodeAt(0),16777619)>>>0,2166136261);
   const bands={common:[[40,82,78],[83,108,20],[109,130,2]],super:[[55,100,58],[101,135,34],[136,160,8]],rare:[[70,120,35],[121,160,48],[161,190,17]],epic:[[90,145,18],[146,190,52],[191,230,30]]}[card.rarity]||[[60,120,60],[121,160,32],[161,200,8]];
   const roll=fnv%100;let total=0;const band=bands.find(([, ,weight])=>{total+=weight;return roll<total})||bands[0];
   const hp=Number(payload.hp)||Number(card.hp)||band[0]+((fnv>>>8)%(band[1]-band[0]+1));
    set('.tcg-card__name',displayName);set('.tcg-card__hp',`PV ${hp}`);
   article.classList.add('tcg-card--unified');article.dataset.cardRarity=card.rarity;article.style.setProperty('--unified-border',colors[card.rarity]||colors.full);
   set('.tcg-card__foot span:first-child',card.rarityLabel);set('.tcg-card__foot span:last-child',card.number);
   this.dataset.game=card.game;
    const isPlain=card.kind==='energy';article.classList.toggle('tcg-energy',isPlain);article.setAttribute('role','group');article.setAttribute('aria-label',`${displayName} · ${card.rarityLabel}`);
   // Reference illustrations, badges and texts belong to their reference characters only.
   root.querySelectorAll('.tcg-badge img,.tcg-elem-wm').forEach(node=>node.remove());
    const badge=root.querySelector('.tcg-badge');if(badge){badge.textContent='';const icon=elementIcon(card);if(icon){const image=document.createElement('img');image.src=icon;image.alt=card.element;image.loading='lazy';image.decoding='async';badge.append(image);}else{badge.textContent=card.element||'—';badge.setAttribute('aria-label',card.element||'Élément inconnu');}}
   const artBox=root.querySelector('.tcg-card__art');artBox.querySelectorAll('img,.tcg-fan-hint,.tcg-gs,.art-fallback').forEach(node=>node.remove());
   this.art=payload.customArt?{src:payload.customArt,focal:[50,35],supplied:true}:resolveCardArtwork(card,manifest);
   if(payload.customArt&&!customHashes.has(payload.customArt)){customHashes.set(payload.customArt,crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload.customArt)).then(buffer=>'custom:'+Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('')));while(customHashes.size>8)customHashes.delete(customHashes.keys().next().value);}
   this.dataset.artwork=payload.customArt?await customHashes.get(payload.customArt):this.art?.pixelSha256||this.art?.sourcePixelSha256||this.art?.sha256||this.art?.src||'';this.dataset.artSource=this.art?.src||payload.customArt||'';this.dataset.artIdentity=`${card.game}:${card.artSlug||cardSlug(card.name)}`;this.dataset.artStatus=this.art?'pending':'missing';if(this.art?.sharedFallback)this.dataset.artFallback='same-character';else delete this.dataset.artFallback;
   artBox.classList.toggle('has-art',!!this.art);
   const fallback=document.createElement('span');fallback.className='card-art-placeholder';fallback.innerHTML=`<b>${escape(displayName)}</b><small>${isPlain?'Emplacement pour ton illustration':'Illustration officielle à fournir'}</small>`;artBox.prepend(fallback);
   if(this.art){const img=document.createElement('img');img.className='booster-card-image';img.alt=`Illustration de ${displayName}`;img.loading=this.getAttribute('mode')==='static'?'lazy':'eager';img.decoding='async';img.width=660;img.height=924;img.style.objectPosition=(this.art.focal||[50,35]).map(value=>`${value}%`).join(' ');img.dataset.src=this.art.src;artBox.prepend(img);}
   // Les données de combat sont omises : chaque carte montre uniquement son illustration et son identité.
   if(this.getAttribute('mode')!=='static')this.loadArt();
  }catch(error){this.dataset.renderError=error.message;this.shadowRoot.innerHTML=`<p role="alert">${escape(error.message)}</p>`;}
 }
 async loadArt(){
  const img=this.shadowRoot.querySelector('img[data-src]');if(!img||img.src)return;
  const candidates=this.art?[this.art]:[];
  for(const candidate of candidates){
   const source=candidate.src,image=await loadCardImage(source);
   if(!this.isConnected||!img.isConnected)return;
   if(!image)continue;
   this.art=candidate;this.dataset.artwork=candidate.pixelSha256||candidate.sourcePixelSha256||candidate.sha256||candidate.src;this.dataset.artSource=source;img.dataset.src=source;img.src=source;this.dataset.artStatus='ready';this.shadowRoot.querySelector('.card-art-placeholder')?.remove();return;
  }
  img.remove();this.dataset.artStatus='missing';this.shadowRoot.querySelector('.tcg-card__art')?.classList.remove('has-art');
 }
 fitText(){
  if(!this.isConnected||payloads.get(this.dataset.renderKey)?.fixture||this.shadowRoot.querySelector('.tcg-card--unified'))return;
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
 const [runtime,unifiedCss]=await Promise.all([runtimeCssReady,unifiedCssReady]);
 const original=element.shadowRoot.querySelector('.tcg-card'),copy=original.cloneNode(true);
 const width=Math.round(element.clientWidth),height=Math.round(element.clientHeight);
 for(const image of copy.querySelectorAll('img')){
  if(!image.src){image.remove();continue;}
  const response=await fetch(image.src);if(!response.ok)throw Error('Illustration inaccessible pour l’export.');
  const blob=await response.blob();image.src=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});
 }
 // Freeze the current animation frame with the same styles as the on-screen card.
 const sourceNodes=[original,...original.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
 sourceNodes.forEach((node,index)=>{const style=getComputedStyle(node);for(const property of style)clones[index].style.setProperty(property,style.getPropertyValue(property).replace(/url\(["']?[^)"']*#([^)"']+)["']?\)/g,'url(#$1)'));clones[index].style.setProperty('animation','none');clones[index].style.setProperty('transition','none');});
 copy.style.transform='none';copy.style.margin='0';
 const wrapper=document.createElement('div');wrapper.setAttribute('xmlns','http://www.w3.org/1999/xhtml');wrapper.style.cssText=`width:${width}px;height:${height}px;position:relative;overflow:visible`;
 let fonts=await fetch('/assets/card-design/fonts.css').then(r=>r.text());
 for(const match of [...fonts.matchAll(/url\((\/assets\/fonts\/[^)]+)\)/g)]){
  const blob=await fetch(match[1]).then(r=>r.blob());const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});fonts=fonts.replace(match[1],data);
 }
 const exportUnified=unifiedCss.replace(/:host\(([^)]+)\)/g,'.export-root$1').replace(/:host/g,'.export-root');
 const exportRuntime=runtime.replace(/:host\(([^)]+)\)/g,'.export-root$1').replace(/:host/g,'.export-root');
 const style=document.createElement('style');style.textContent=fonts+exportUnified+exportRuntime+'*{animation:none!important;transition:none!important}';wrapper.className='export-root';wrapper.setAttribute('mode',element.getAttribute('mode')||'detail');wrapper.dataset.game=element.dataset.game||'';wrapper.append(style,copy);
 const xml=new XMLSerializer().serializeToString(wrapper);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width*3}" height="${height*3}" viewBox="0 0 ${width} ${height}"><foreignObject width="${width}" height="${height}">${xml}</foreignObject></svg>`;
 const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
 const canvas=document.createElement('canvas');canvas.width=width*3;canvas.height=height*3;canvas.getContext('2d').drawImage(image,0,0);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Export PNG impossible.')),'image/png'));
}
export function cardDiagnostics(){
 const rows=[...document.querySelectorAll('astralis-card')].map(node=>{
  const overflow=[...node.shadowRoot.querySelectorAll('.tcg-card__name,.tcg-move-name,.card-move-description,.tcg-card__foot span')].filter(el=>{const style=getComputedStyle(el),clamped=el.matches('.tcg-card--unified .tcg-card__name')&&style.webkitLineClamp!=='none';return el.scrollWidth>el.clientWidth+1||(!clamped&&el.scrollHeight>el.clientHeight+1)}).map(el=>el.textContent);
  return {id:node.dataset.cardId,rarity:node.dataset.rarity,identity:node.dataset.artIdentity,fallback:node.dataset.artFallback||'',artwork:node.dataset.artwork,source:node.dataset.artSource||'',status:node.dataset.artStatus,broken:!!node.shadowRoot.querySelector('img[src]')&&[...node.shadowRoot.querySelectorAll('img[src]')].some(img=>img.complete&&!img.naturalWidth),overflow,error:node.dataset.renderError||null};
 });
 const hashes=new Map();for(const row of rows)if(row.artwork){const group=hashes.get(row.artwork)||[];group.push(row);hashes.set(row.artwork,group);}
 const duplicates=[];for(const [hash,entries] of hashes){const group=[...new Map(entries.map(row=>[row.id,row])).values()];if(group.length<2)continue;duplicates.push({hash,identity:group[0].identity,ids:group.map(row=>row.id)});}
 return {rows,duplicates,missing:rows.filter(row=>row.status==='missing'),overflow:rows.filter(row=>row.overflow.length),broken:rows.filter(row=>row.broken)};
}
if(new URLSearchParams(location.search).get('debug')==='cards'){
 window.astralisCards={diagnose:cardDiagnostics,assets:cardAssetsReady,preload:preloadCards};
 const panel=document.createElement('details');panel.id='cards-debug';panel.innerHTML='<summary>Diagnostic cartes</summary><button type="button">Actualiser</button><pre></pre>';document.body.append(panel);
 panel.querySelector('button').onclick=()=>{panel.querySelector('pre').textContent=JSON.stringify(cardDiagnostics(),null,2);};
}
