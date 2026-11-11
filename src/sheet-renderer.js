import {EL,backdrop} from './sheet-backdrop.js';
import {referenceMarkup,shares} from './sheet-reference-templates.js';
export {shares};
export const SHEET_FORMATS={team:[2000,1570],compare:[2000,1530],build:[2000,1420],lab:[2000,2000],farm:[1080,1736]};
export function sheetElement(value){const key=String(value||'').toLowerCase();return ({'anémo':'anemo','électro':'electro','géo':'geo',ice:'cryo',wind:'anemo',fire:'pyro',lightning:'electro'})[key]||(EL[key]?key:'cryo');}
export function sheetSeed(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function readableAccent(value,background){
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const luminance=values=>values.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const base=luminance(rgb(background));let colour=rgb(value);
 for(let step=0;step<100;step++){
  const light=luminance(colour);if((Math.max(light,base)+.05)/(Math.min(light,base)+.05)>=4.5)break;
  colour=colour.map(v=>Math.min(255,v+3));
 }
 return '#'+colour.map(v=>v.toString(16).padStart(2,'0')).join('');
}
const fallback=el=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="900" viewBox="0 0 1000 900"><defs><radialGradient id="f"><stop stop-color="'+EL[el].e4+'"/><stop offset="1" stop-color="'+EL[el].e3+'"/></radialGradient></defs><rect width="1000" height="900" fill="url(#f)"/><path d="M500 100a110 110 0 1 0 0 220 110 110 0 0 0 0-220M210 900c0-340 90-520 290-520s290 180 290 520" fill="'+EL[el].e2+'" opacity=".25"/></svg>');
let fontPromise,libraryPromise,cssPromise;
const imageCache=new Map();
async function fontCSS(){
 return fontPromise ||= (async()=>{
  const rules=[];
  await Promise.all([['Sheet Cormorant','700','cormorant-0'],...['400','500','600','700'].map((weight,i)=>['Sheet Inter',weight,'inter-'+i])].map(async([family,weight,file])=>{
   const response=await fetch(new URL('../assets/fonts/sheets/'+file+'.woff2',import.meta.url));
   if(!response.ok)throw new Error('Police locale indisponible : '+family);
   const uri=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);response.blob().then(blob=>reader.readAsDataURL(blob));});
   const face=new FontFace(family,'url('+uri+')',{weight});await face.load();document.fonts.add(face);
   rules.push('@font-face{font-family:"'+family+'";font-weight:'+weight+';src:url('+uri+') format("woff2")}');
  }));await document.fonts.ready;return rules.join('');
 })();
}
async function captureLibrary(){
 return libraryPromise ||=new Promise((resolve,reject)=>{if(globalThis.htmlToImage)return resolve(globalThis.htmlToImage);const script=document.createElement('script');script.src=new URL('../assets/vendor/html-to-image.js',import.meta.url).href;script.onload=()=>resolve(globalThis.htmlToImage);script.onerror=()=>reject(new Error('Moteur PNG local indisponible.'));document.head.append(script);});
}
async function resolveImage(sources,el,loadImage){
 const candidates=(Array.isArray(sources)?sources:[sources]).filter(src=>typeof src==='string'&&src&&!/teyvat|earth.daymap|world.?map/i.test(src));
 const key=JSON.stringify(candidates);if(imageCache.has(key))return imageCache.get(key);
 const promise=(async()=>{const bitmap=await loadImage(candidates);if(!bitmap)return null;const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);return c.toDataURL('image/png');})();
 imageCache.set(key,promise);return promise;
}
function number(value){if(value==null||value==='')return null;const n=Number(String(value).replace(/[^\d,.\-]/g,'').replace(',','.'));return Number.isFinite(n)?n:null;}
export function adaptSheetData(type,input){
 if(!input.sections&&!input.sheetModel)return input;
 if(input.sheetModel)return {...input.sheetModel,title:input.sheetModel.title||input.title,signature:input.sheetModel.signature||input.signature};
 const section=pattern=>input.sections?.find(s=>pattern.test(s.title))?.tiles||[],stats={};
 const statMap={'PV':'hp','ATQ':'atk','DÉF':'def','Maîtrise':'em','Taux CRIT':'critRate','DGT CRIT':'critDmg','Recharge':'er','Bonus élémentaire':'dmgBonus'};
 for(const tile of section(/Statistiques/))stats[statMap[tile.title]||tile.title]=number(tile.lines?.[0]);
 const members=section(/Composition|personnage/i).map((tile,i)=>({id:String(i),name:tile.title,image:tile.image,element:sheetElement(input.element),role:tile.lines?.[0]==='Rôle non renseigné'?'':tile.lines?.[0],weapon:{name:tile.lines?.[1]},set:{name:tile.lines?.[2]}}));
 const items=section(/Arme et talents/);
 return {title:input.title,name:input.title,image:input.image,element:sheetElement(input.element||input.subtitle?.split(' · ').find(x=>EL[sheetElement(x)])),signature:input.signature,stats,members,weapon:items[0]?{name:items[0].title,image:items[0].image,detail:items[0].lines?.join(' · ')}:null,talents:items.slice(1,4).map(t=>number(t.lines?.[0])),rotation:section(/Rotation/).map(t=>({name:t.title,image:t.image})),artifacts:section(/Artéfacts/).map((p,i)=>({slot:p.title,image:p.image,setName:p.lines?.[0]})),damage:{}};
}
async function prepare(data,el,loadImage){
 const d=structuredClone(data);
 d.members=Array.from({length:4},(_,i)=>d.members?.[i]||{});
 const tasks=[];
 function asset(object,key){if(!object)return;tasks.push(resolveImage(object[key],sheetElement(object.element||el),loadImage).then(uri=>object[key]=uri||(key==='image'&&(object===d||d.members.includes(object))?fallback(el):null)));}
 asset(d,'image');for(const m of d.members){m.element=sheetElement(m.element||el);asset(m,'image');asset(m.weapon,'image');asset(m.set,'image');}
 asset(d.weapon,'image');for(const p of d.artifacts||[])asset(p,'image');for(const m of d.materials||[])asset(m,'image');
 for(const a of d.rotation||[])if(a.image)asset(a,'image');
 await Promise.all(tasks);return d;
}
function reflow(root,type){
 const content=root.querySelector('.in');
 function flow(container,nodes,padding,top,bottom){
  const groups=new Map();
  for(const node of nodes){const y=parseFloat(node.style.top)||0;if(!groups.has(y))groups.set(y,[]);groups.get(y).push(node);}
  const rows=[...groups].sort((a,b)=>a[0]-b[0]).map(([y,list])=>({y,list,height:Math.max(...list.map(n=>n.getBoundingClientRect().height))}));
  container.style.cssText='position:relative;padding:'+top+'px '+padding+'px '+bottom+'px;display:flex;flex-direction:column;gap:0';
  let previous=top,previousHeight=0;
  for(const row of rows){
   const wrapper=document.createElement('div');wrapper.style.cssText='position:relative;min-width:0;flex-shrink:0;margin-top:'+Math.max(0,row.y-previous-previousHeight)+'px';
   if(row.list.length>1)wrapper.style.cssText+=';display:flex;gap:24px;align-items:stretch';
   container.append(wrapper);
   for(const node of row.list){node.style.position='relative';node.style.top='auto';node.style.left='auto';node.style.right='auto';node.style.width='auto';if(row.list.length>1)node.style.flex='1';wrapper.append(node);}
   previous=row.y;previousHeight=row.height;
  }
 }
 if(type==='build'){
  const right=document.createElement('main'),nodes=[...content.children].filter(n=>parseFloat(n.style.left)>=700);
  right.className='sheet-build-right';content.append(right);flow(right,nodes,0,62,32);right.style.marginLeft='740px';right.style.marginRight='70px';return;
 }
 const nodes=[...content.children].filter(n=>!n.classList.contains('foot')&&n.tagName!=='IMG');
 flow(content,nodes,type==='farm'?44:type==='lab'?90:78,type==='farm'?112:type==='lab'?80:62,type==='farm'?72:74);
}
function fitText(root){
 for(const node of root.querySelectorAll('[style*="font:700 72px"],[style*="font:700 52px"]')){
  const limit=root.classList.contains('sheet-compare')?100:150;
  let size=parseFloat(getComputedStyle(node).fontSize);
  while(node.scrollHeight>limit&&size>18)node.style.fontSize=(--size)+'px';
 }
 for(const node of root.querySelectorAll('.ttl,.sub,.num,[data-fit],.pn b,[style*="font:700 72px"],[style*="font:700 52px"]')){
  if(!node.clientWidth)continue;
  let size=parseFloat(getComputedStyle(node).fontSize)||20;
  while(node.scrollWidth>node.clientWidth+1&&size>9){size-=1;node.style.fontSize=size+'px';}
 }
 for(const node of root.querySelectorAll('div,span,b')){
  if(node.children.length||!node.textContent.trim()||!node.clientWidth)continue;
  node.style.overflowWrap='anywhere';
  let size=parseFloat(getComputedStyle(node).fontSize)||20;
  while(node.scrollWidth>node.clientWidth+2&&size>14){node.style.fontSize=(--size)+'px';}
 }
 // A larger amount of text grows the card and the sheet, never shrinks portraits.
 for(const node of [...root.querySelectorAll('.pn,[data-grow]')].reverse()){
  if(node.scrollHeight>node.clientHeight+2){node.style.minHeight=node.scrollHeight+'px';node.style.height='auto';}
 }
}
export async function mountSheet(type,input,options={}){
 if(!SHEET_FORMATS[type])throw new Error('Type de fiche inconnu.');
 const d={...adaptSheetData(type,input)},el=sheetElement(options.element||d.element),[width,minHeight]=SHEET_FORMATS[type];
 if(options.artwork)d.image=options.artwork;
 if(type==='compare'){const ids=(d.members||[]).map(m=>m.id).filter(Boolean);if(new Set(ids).size!==ids.length)throw new Error('Un personnage apparaît plusieurs fois dans le comparatif.');}
 await fontCSS();const loader=options.loadImage||(await import('./poster-export.js')).posterBitmap,data=await prepare(d,el,loader);
 const host=document.createElement('div');host.style.cssText='position:fixed;left:-25000px;top:0;pointer-events:none;z-index:-20';
 const shadow=host.attachShadow({mode:'open'}),style=document.createElement('style');
 cssPromise ||=fetch(new URL('../assets/sheet-reference.css',import.meta.url)).then(r=>r.text());style.textContent=(await cssPromise)+EXTRA_CSS;shadow.append(style);
 const root=document.createElement('article');root.className='sheet sheet-'+type;root.style.cssText='position:relative;width:'+width+'px;min-height:'+minHeight+'px;transform:none;--e1:'+EL[el].e1+';--e2:'+EL[el].e2+';--e3:'+EL[el].e3+';--e4:'+EL[el].e4+';--serif:"Sheet Cormorant",Georgia,serif;--sans:"Sheet Inter",sans-serif';
 const customAccent=/^#[a-f0-9]{6}$/i.test(options.accent||d.accent||'')?readableAccent(options.accent||d.accent,EL[el].e3):null;
 if(customAccent)root.style.setProperty('--e1',customAccent);
 root.innerHTML='<div class="bgsvg"></div>'+referenceMarkup(type,data,el);shadow.append(root);document.body.append(host);
 try{
  if(type==='farm'){
   const hero=root.querySelector('.in>div');hero.querySelector(':scope>svg')?.remove();const art=document.createElement('img');art.className='art';art.src=data.image;art.style.cssText='inset:0;width:100%;height:100%;object-fit:cover;object-position:'+ (data.focal||'50% 25%');hero.prepend(art);
   const complete=(data.materials||[]).filter(m=>m.owned>=m.total).length,total=data.materials?.length||0;
   for(const n of root.querySelectorAll('.pn'))if(n.textContent.includes('matériaux au complet')){n.innerHTML='<div style="display:flex;justify-content:space-between;font:500 25px var(--sans)"><span>'+complete+' / '+total+' matériaux au complet</span><b>'+Math.round(complete/Math.max(1,total)*100)+' %</b></div><div style="margin-top:15px;height:9px;background:#ffffff18;border-radius:5px"><div style="height:100%;width:'+(complete/Math.max(1,total)*100)+'%;background:var(--e1)"></div></div>';}
  }
  root.querySelectorAll('img').forEach(img=>{if(img.classList.contains('art')){img.style.objectPosition=d.focal||(options.focal?'50% '+Number(options.focal)*100+'%':img.style.objectPosition||'50% 25%');img.style.objectFit=options.crop||'cover';}img.removeAttribute('loading');});
  await Promise.all([...root.querySelectorAll('img')].map(async img=>{try{await img.decode()}catch{img.src=fallback(el);await img.decode()}}));
  for(const node of root.querySelectorAll('div,b,span'))if(!node.children.length&&node.textContent.trim()==='—'){
   const badge=document.createElement('small');badge.textContent='Non confirmé';badge.className='sheet-unknown';node.append(badge);
  }
  for(const n of root.querySelectorAll('div,span'))if(n.children.length===0&&(n.textContent==='Rôle non renseigné'||(!n.textContent.trim()&&n.style.right==='18px'&&n.style.top==='22px')))n.remove();
  if(type==='team'){
   const damage=root.querySelector('.pn.glow');
   damage.style.cssText+=';display:grid;grid-template-columns:1fr 1.5fr;gap:32px;padding:18px 32px;height:auto;min-height:126px';
   for(const child of damage.children)child.style.cssText='position:relative;min-width:0';
   const legend=damage.lastElementChild.lastElementChild;
   legend.style.cssText='display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;font:600 18px var(--sans)';
   for(const span of legend.children){span.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap';span.querySelector('i').style.flexShrink='0';}
  }
  if(type==='lab'){
   const result=root.querySelector('.pn.glow'),number=result.querySelector('.num');
   if(data.otherAttacks?.length)number.style.maxWidth='calc(100% - 700px)';
   else result.querySelector('[style*="width:640px"]')?.remove();
  }
  for(const node of root.querySelectorAll('.num')){
   if(parseFloat(getComputedStyle(node).fontSize)<60||node.firstChild?.nodeType!==Node.TEXT_NODE)continue;
   const match=node.firstChild.textContent.match(/^([\d\s\u202f]+),(\d+)(.*)$/);
   if(match){const decimal=document.createElement('span');decimal.style.fontSize='.55em';decimal.textContent=','+match[2];node.firstChild.replaceWith(document.createTextNode(match[1]),decimal,document.createTextNode(match[3]));}
  }
  if(['team','build'].includes(type)&&!Object.values(data.damage||{}).some(v=>typeof v==='number'&&Number.isFinite(v))){
   const panel=type==='team'?root.querySelector('.pn.glow'):[...root.querySelectorAll('.pn.glow')].at(-1);
   panel.innerHTML='<span>Dégâts à calculer dans le laboratoire</span><small class="sheet-unknown">Non confirmé</small>';
   panel.style.cssText+=';display:flex;gap:16px;align-items:center;height:auto;min-height:64px;padding:18px 28px;font:500 22px var(--sans)';
  }
  reflow(root,type);fitText(root);
  const height=Math.max(minHeight,Math.ceil(root.querySelector('.in').scrollHeight));root.style.height=height+'px';
  const background=backdrop(width,height,el,sheetSeed(d.seed??d.title??d.name??type));
  root.querySelector('.bgsvg').innerHTML=customAccent?background.replaceAll(EL[el].e1,customAccent):background;
  const bounds=root.getBoundingClientRect(),overflows=[];
  for(const node of root.querySelectorAll('div,span,b,em,p')){
   if(node.children.length||!node.textContent.trim()||!node.clientWidth)continue;
   const box=node.getBoundingClientRect();
   if(box.right>bounds.right+2||box.left<bounds.left-2||node.scrollWidth>node.clientWidth+2)overflows.push(node.textContent.slice(0,100));
  }
  const audit={width,height,element:el,missingImages:[...root.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).length,overflows};
  root.sheetAudit=audit;return {root,host,data,audit,dispose:()=>host.remove()};
 }catch(error){host.remove();throw error;}
}
export async function renderSheet(type,data,options={}){
 const sheet=await mountSheet(type,data,options);
 try{const library=await captureLibrary();const canvas=await library.toCanvas(sheet.root,{pixelRatio:options.pixelRatio??2,skipAutoScale:true,fontEmbedCSS:await fontCSS(),cacheBust:false});canvas.sheetAudit=sheet.audit;return canvas;}finally{sheet.dispose();}
}
const EXTRA_CSS='.sheet-unknown{display:inline-block;margin-left:8px;font:500 12px/1.3 var(--sans);padding:3px 6px;border:1px solid #ffffff45;border-radius:6px;vertical-align:middle;color:#f6f1e7}.sheet{color:#f6f1e7}.sheet *{box-sizing:border-box;min-width:0}.sheet .in{font-family:var(--sans)}.sheet .art{object-fit:cover}.sheet-item-image{width:78px;height:78px;object-fit:contain}.sheet .ttl,.sheet .sub{white-space:normal;overflow-wrap:anywhere}.sheet .num{font-variant-numeric:tabular-nums lining-nums}.sheet .pn{flex-shrink:0}.sheet .mut{color:var(--e2)}.sheet .foot{bottom:30px}.sheet-build .in>div[style*="left:70px"]{max-width:550px}.sheet-build .in>div[style*="width:690px"] .art{height:100%!important}.sheet .ico>.sheet-item-image{width:90%;height:90%}.sheet-build .in{position:relative;inset:auto;min-height:1420px}.sheet-farm .sheet-item-image{width:72px;height:72px}.sheet-farm .pn{min-height:100px}.sheet-farm .pn b.num{font-size:34px!important;white-space:nowrap}.sheet .pn [style*="white-space:nowrap"]{white-space:normal!important;overflow:visible!important}.sheet .pn p{overflow-wrap:anywhere}.sheet .pn div[style*="font:600 25px"]{overflow-wrap:anywhere}.sheet .pn>div[style*="height:400px"]{min-height:400px}.sheet .pn>div[style*="height:210px"]{min-height:210px}';
