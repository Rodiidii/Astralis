const SCHEMA='astralis.arcade-passport',MAX_BYTES=1_000_000;
export const ARCADE_PASSPORT_KEYS=[
 {key:'astralis:arcade:tetris:v1',title:'Tetris astral'},
 {key:'astralis:arcade:dodge:v1',title:'Esquive des astres'},
 {key:'astralis:arcade:memory:v1',title:'Mémoire des constellations'},
 {key:'astralis:arcade:reactions:v1',title:'Réactions en chaîne'},
 {key:'astralis:arcade:rhythm:v1',title:'Rythme astral'},
 {key:'astralis:pinball:v1',title:'Flipper astral'},
 {key:'astralis:constellation-path:v1',title:'Tracé stellaire'},
 {key:'astralis:arcade:cipher:v1',title:'Décodeur astral'},
 {key:'astralis:arcade:gravity:v1',title:'Gravité zéro'},
 {key:'astralis:arcade:lander:v1',title:'Atterrissage lunaire'},
 {key:'astralis:arcade:prospect:v1',title:'Prospection d’astéroïdes'},
 {key:'astralis:arcade:achievements:v1',title:'Insignes'},
 {key:'astralis:arcade:daily-contracts:v1',title:'Contrats quotidiens'}
];
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const safeJson=value=>{try{return JSON.stringify(value)}catch{return''}};
const byteLength=value=>new TextEncoder().encode(value).length;
export function collectArcadePassport(storage=globalThis.localStorage){
 const records={};for(const {key} of ARCADE_PASSPORT_KEYS){try{const raw=storage?.getItem(key);if(raw!==null&&raw!==undefined){const value=JSON.parse(raw);if(value&&typeof value==='object')records[key]=value}}catch{}}
 return {schema:SCHEMA,version:1,exportedAt:new Date().toISOString(),records};
}
export function validateArcadePassport(data){
 if(!isObject(data)||data.schema!==SCHEMA||data.version!==1||!isObject(data.records))return {ok:false,error:'Ce fichier n’est pas un Passeport stellaire reconnu.'};
 const fullPayload=safeJson(data);if(!fullPayload||byteLength(fullPayload)>MAX_BYTES)return {ok:false,error:'Le fichier dépasse la limite de 1 Mo ou ne peut pas être lu.'};
 const allowed=new Set(ARCADE_PASSPORT_KEYS.map(x=>x.key)),records={};for(const [key,value] of Object.entries(data.records)){if(!allowed.has(key))continue;if(!value||typeof value!=='object')continue;const encoded=safeJson(value);if(!encoded||byteLength(encoded)>MAX_BYTES)return {ok:false,error:'Le fichier contient une donnée trop volumineuse ou illisible.'};records[key]=value}
 if(!Object.keys(records).length)return {ok:false,error:'Aucune progression d’arcade reconnue dans ce fichier.'};
 return {ok:true,records,ignored:Object.keys(data.records).length-Object.keys(records).length};
}
function mergeValue(current,incoming){
 if(current===undefined||current===null)return incoming;
 if(incoming===undefined||incoming===null)return current;
 if(typeof current==='number'&&typeof incoming==='number')return Math.max(current,incoming);
 if(typeof current==='boolean'&&typeof incoming==='boolean')return current||incoming;
 if(Array.isArray(current)&&Array.isArray(incoming)){const out=[...current],seen=new Set(current.map(safeJson));for(const value of incoming){const sig=safeJson(value);if(!seen.has(sig)){out.push(value);seen.add(sig)}}return out.slice(-300)}
 if(isObject(current)&&isObject(incoming)){const out={...current};for(const [key,value] of Object.entries(incoming)){if(key==='__proto__'||key==='constructor'||key==='prototype')continue;out[key]=mergeValue(current[key],value)}return out}
 if(typeof current==='string'&&typeof incoming==='string'){const a=Date.parse(current),b=Date.parse(incoming);if(Number.isFinite(a)&&Number.isFinite(b))return b>a?incoming:current;return incoming||current}
 return incoming;
}
export function mergeArcadePassport(current,incoming){
 const checked=validateArcadePassport(incoming);if(!checked.ok)throw new Error(checked.error);
 for(const [key,value] of Object.entries(checked.records)){let existing;try{existing=JSON.parse(current.getItem(key)||'null')}catch{}current.setItem(key,safeJson(mergeValue(existing,value)))}
 return {keys:Object.keys(checked.records),ignored:checked.ignored};
}
function countValues(value){if(Array.isArray(value))return value.reduce((n,x)=>n+countValues(x),0);if(isObject(value))return Object.values(value).reduce((n,x)=>n+countValues(x),0);return value===null||value===undefined?0:1}
export function renderArcadePassport(){
 return `<section class="arcade-game-view passport-view" data-arcade-view="passport" role="tabpanel" aria-label="Passeport stellaire" hidden><header class="passport-heading"><div><small>ARCHIVE PORTABLE · LOCALE · HORS LIGNE</small><h2>Passeport stellaire</h2><p>Emporte tes records et insignes d’arcade vers une autre installation. Aucun profil ni fichier extérieur à l’arcade n’est inclus.</p></div><div class="passport-seal" aria-hidden="true">✧<small>ASTRALIS</small></div></header><div class="passport-summary"><div><small>JEUX AVEC PROGRESSION</small><b data-passport-games>0</b></div><div><small>ÉLÉMENTS ARCHIVÉS</small><b data-passport-records>0</b></div><div><small>TAILLE ESTIMÉE</small><b data-passport-size>0 Ko</b></div></div><div class="passport-actions"><button type="button" data-passport-export>↓ Exporter mon passeport</button><label class="passport-import-button">↑ Choisir un passeport<input type="file" data-passport-file accept="application/json,.json"></label><button type="button" data-passport-merge disabled>Fusionner la progression</button></div><p class="passport-status" data-passport-status aria-live="polite">Le passeport ne contient que les records et insignes listés ci-dessous.</p><div class="passport-list" data-passport-list></div><small class="passport-footnote">La fusion conserve la meilleure valeur numérique et réunit les historiques. Les autres données de l’application ne sont pas importées.</small></section>`;
}
export function mountArcadePassport(root){
 const panel=root.querySelector('[data-arcade-view="passport"]');if(!panel)return()=>{};
 const status=panel.querySelector('[data-passport-status]'),fileInput=panel.querySelector('[data-passport-file]'),mergeButton=panel.querySelector('[data-passport-merge]');let pending=null;
 const refresh=()=>{const data=collectArcadePassport(),rows=ARCADE_PASSPORT_KEYS.map(meta=>{const value=data.records[meta.key],raw=value?safeJson(value):'',count=value?countValues(value):0;return `<article class="passport-row ${value?'has-data':''}"><span class="passport-row-icon">${value?'✦':'◇'}</span><span><b>${meta.title}</b><small>${value?`${count} valeur(s) · ${(byteLength(raw)/1024).toFixed(1)} Ko`:'Aucune donnée locale'}</small></span><em>${value?'ARCHIVÉ':'VIDE'}</em></article>`}).join('');panel.querySelector('[data-passport-list]').innerHTML=rows;const active=Object.keys(data.records).length,total=Object.values(data.records).reduce((n,v)=>n+countValues(v),0),bytes=byteLength(safeJson(data));panel.querySelector('[data-passport-games]').textContent=String(active);panel.querySelector('[data-passport-records]').textContent=String(total);panel.querySelector('[data-passport-size]').textContent=`${(bytes/1024).toFixed(1)} Ko`};
 const onMode=()=>{if(!panel.hidden)refresh()};const onClick=async e=>{if(e.target.closest('[data-passport-export]')){try{const blob=new Blob([JSON.stringify(collectArcadePassport(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`astralis-passeport-arcade-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);status.textContent='Passeport exporté · conserve le fichier pour le réimporter sur une autre installation.'}catch{status.textContent='Export indisponible dans ce navigateur.'}return}if(e.target.closest('[data-passport-merge]')&&pending){try{const result=mergeArcadePassport(localStorage,pending);pending=null;mergeButton.disabled=true;fileInput.value='';status.textContent=`Fusion terminée · ${result.keys.length} catégorie(s) importée(s). Les meilleurs records ont été conservés.`;refresh();window.dispatchEvent(new Event('astralis:arcade-passport-imported'))}catch(error){status.textContent=error.message}}};
 const onFile=async()=>{const file=fileInput.files?.[0];pending=null;mergeButton.disabled=true;if(!file)return;if(file.size>MAX_BYTES){status.textContent='Fichier trop volumineux (limite : 1 Mo).';fileInput.value='';return}try{const parsed=JSON.parse(await file.text()),checked=validateArcadePassport(parsed);if(!checked.ok)throw new Error(checked.error);pending=parsed;mergeButton.disabled=false;status.textContent=`Aperçu prêt · ${Object.keys(checked.records).length} catégorie(s) reconnue(s)${checked.ignored?` · ${checked.ignored} ignorée(s)`:''}. La fusion ne démarre qu’après ton clic.`}catch(error){status.textContent=error instanceof SyntaxError?'Le fichier JSON est invalide.':error.message;fileInput.value=''}};
 panel.addEventListener('click',onClick);fileInput.addEventListener('change',onFile);root.addEventListener('arcade:modechange',onMode);refresh();return()=>{panel.removeEventListener('click',onClick);fileInput.removeEventListener('change',onFile);root.removeEventListener('arcade:modechange',onMode)};
}
