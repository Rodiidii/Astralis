import {drawPlanetRelief} from './planet-relief.js?v=80';
// Shared CPU sphere renderer: textured surfaces rotate; light and semantic icons stay fixed.
// No remote textures or one-WebGL-context-per-widget limit.
const ElementBase=globalThis.HTMLElement||class {};
const active=new Set(),textures=new Map(),rotations=new Map();let timer;
const photographic=new Map();
let regionalRenderer,regionalLoading;
function loadRegionalRenderer(){return regionalLoading||=(import('./planet-diorama.js?v=86').then(module=>{regionalRenderer=module.drawRegionalModel;return module;}));}
// Replace only the near-white background connected to the image edges; snow stays snow.
export function replaceMapBackground(rgba,w,h){
 const seen=new Uint8Array(w*h),queue=new Uint32Array(w*h);let head=0,tail=0;
 const add=i=>{if(seen[i])return;seen[i]=1;const p=i*4,r=rgba[p],g=rgba[p+1],b=rgba[p+2];if(rgba[p+3]<16||(Math.min(r,g,b)>195&&Math.max(r,g,b)-Math.min(r,g,b)<35))queue[tail++]=i;};
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
 while(head<tail){const i=queue[head++],p=i*4;rgba[p]=32;rgba[p+1]=99;rgba[p+2]=140;rgba[p+3]=255;if(i%w)add(i-1);if(i%w<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w);}
 return rgba;
}
function photoTexture(kind){
 const maps={teyvat:'teyvat-map-v2',terrestrial:'earth-daymap',mars:'mars',venus:'venus',mercury:'mercury',ice:'uranus',neptune:'neptune',gas:'jupiter',saturn:'saturn',lava:'mars',moon:'moon',sun:'sun'};
 const file=maps[kind];
 if(!file)return Promise.resolve(null);
 if(!photographic.has(file))photographic.set(file,new Promise(resolve=>{const image=new Image();image.onload=()=>{
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 {
  const map=document.createElement('canvas');map.width=image.naturalWidth;map.height=image.naturalHeight;const paint=map.getContext('2d',{willReadFrequently:true});paint.drawImage(image,0,0);if(kind==='teyvat'){const pixels=paint.getImageData(0,0,map.width,map.height);replaceMapBackground(pixels.data,map.width,map.height);paint.putImageData(pixels,0,0);}
  ctx.fillStyle=kind==='teyvat'?'#20638C':'#101522';ctx.fillRect(0,0,1024,512);ctx.drawImage(map,0,0,1024,512);
 }
 const rgba=ctx.getImageData(0,0,1024,512).data,bytes=new Uint8ClampedArray(1024*512*3);for(let i=0;i<1024*512;i++){bytes[i*3]=rgba[i*4];bytes[i*3+1]=rgba[i*4+1];bytes[i*3+2]=rgba[i*4+2];}resolve({w:1024,h:512,bytes,file});};image.onerror=()=>resolve(null);image.src='/assets/cosmos/'+file+(file==='teyvat-map-v2'?'.png':'.jpg');}));
 return photographic.get(file);
}
function hash(x,y,seed){let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function smooth(x){return x*x*(3-2*x)}
function noise(x,y,seed){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b);return (hash(a,b,seed)*(1-u)+hash(a+1,b,seed)*u)*(1-v)+(hash(a,b+1,seed)*(1-u)+hash(a+1,b+1,seed)*u)*v;}
function texture(kind,seed,tint){const key=kind+seed+tint;if(textures.has(key))return textures.get(key);const w=512,h=256,bytes=new Uint8ClampedArray(w*h*3),rgb=[1,3,5].map(i=>parseInt(tint.slice(i,i+2),16)||120);
 // Smooth, broad elemental ribbons read as illustrated Genshin-style magic;
 // avoiding high-frequency noise keeps the small spheres clean and polished.
 const palettes={terrestrial:[[21,37,67],[42,123,133],[114,184,143]],mars:[[61,24,43],[202,76,52],[255,173,91]],venus:[[63,43,37],[188,132,65],[247,216,145]],mercury:[[37,31,73],[126,77,180],[224,179,255]],ice:[[23,48,78],[74,157,193],[181,239,247]],neptune:[[20,54,87],[46,147,183],[164,237,241]],gas:[[27,63,55],[71,151,104],[190,220,121]],saturn:[[57,40,77],[151,93,166],[241,190,220]],lava:[[43,23,29],[191,56,36],[255,185,85]],moon:[[39,46,70],[126,145,173],[230,228,211]],sun:[[91,44,34],[237,128,44],[255,225,133]]};
 const [shadow,baseMid,light]=palettes[kind]||[[30,39,67],rgb,[190,213,232]],mid=baseMid.map((value,i)=>value*.84+rgb[i]*.16);const phase=(Math.abs(seed)%997)/997*Math.PI*2;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h;const field=Math.sin(u*8+Math.sin(v*7+phase)*1.4+phase)+.48*Math.sin(u*15-v*8+phase*.7)+.2*Math.cos(v*18+u*5);const band=.5+.5*Math.tanh(field*.72);const glow=Math.max(0,1-Math.abs(v-(.46+.12*Math.sin(u*7+phase)))*5);const c=[0,1,2].map(i=>Math.max(0,Math.min(255,shadow[i]*(1-band)+mid[i]*band+light[i]*glow*.19)));const off=(y*w+x)*3;bytes[off]=c[0];bytes[off+1]=c[1];bytes[off+2]=c[2];}
 const result={w,h,bytes};textures.set(key,result);return result;}
function regionalTexture(region,seed,tint){
 const key='region:'+region+seed+tint;if(textures.has(key))return textures.get(key);
 const colors={mondstadt:['#205d78','#388e74','#8dc896'],liyue:['#344f60','#998252','#d4b66e'],inazuma:['#344968','#77628b','#a5b58c'],sumeru:['#287480','#417c40','#dec084'],fontaine:['#286d91','#679579','#a79bb9'],primordial:['#15516e','#247e96','#6fbdcc'],natlan:['#385f58','#b19a59','#bb6344'],nodkrai:['#465b73','#687b74','#c0b7ce'],snezhnaya:['#244a66','#9ab5c5','#e0e8e8']};
 const palette=(colors[region]||colors.mondstadt).map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))),w=512,h=256,bytes=new Uint8ClampedArray(w*h*3);
 const tintRgb=/^#[a-f0-9]{6}$/i.test(tint||'')?[1,3,5].map(i=>parseInt(tint.slice(i,i+2),16)):null;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/w*2*Math.PI,v=y/h,a=Math.cos(u)*2+4,b=Math.sin(u)*2+4;
  const terrain=noise(a+v*2,b+v*7,seed)*.65+noise(a*3,b*3+v*12,seed)*.25+noise(a*9,b*9+v*31,seed)*.1;
  let color;
  if(region==='primordial'){const t=.5+.5*Math.sin(u*5+Math.sin(v*12));color=palette[0].map((c,i)=>c*(1-t*.75)+palette[2][i]*t*.75);}
  else {const coast=region==='inazuma'?.57:region==='fontaine'?.52:.43;let index=terrain<coast?0:terrain>.63?2:1;
   if(region==='sumeru'&&v>.48&&terrain>coast)index=2;
   if(region==='snezhnaya'&&terrain>.44)index=2;
   if(region==='nodkrai'&&Math.abs(v-.5)>.28&&terrain>coast)index=2;
   const detail=.84+noise(a*19,b*19+v*63,seed)*.3;color=palette[index].map(c=>c*detail);
   if(region==='natlan'&&terrain>.61&&Math.sin(u*22+v*18)>.96)color=[215,94,43];
  }
  const off=(y*w+x)*3;for(let i=0;i<3;i++)bytes[off+i]=tintRgb?color[i]*.7+tintRgb[i]*.3:color[i];
 }
 const result={w,h,bytes};textures.set(key,result);return result;
}
let lastFrame=0;
function schedule(){if(timer||!active.size)return;timer=requestAnimationFrame(now=>{timer=null;if(now-lastFrame>=33){lastFrame=now;for(const planet of active)planet.draw(now);}schedule()});}
class World extends ElementBase{
 connectedCallback(){if(this.canvas)return;this.canvas=document.createElement('canvas');const central=this.tagName==='ASTRALIS-PLANET';this.size=central?384:this.hasAttribute('detail')?320:112;this.canvas.width=this.canvas.height=this.size;this.canvas.setAttribute('aria-hidden','true');this.append(this.canvas);this.ctx=this.canvas.getContext('2d',{alpha:true});this.frame=this.ctx.createImageData(this.size,this.size);this.pixels=[];
 const raw=this.getAttribute('seed')||'astralis',seed=[...raw].reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0)|0,17);this.angle=central?0:this.hasAttribute('region')?({inazuma:-.30,sumeru:-.16,natlan:.14}[this.getAttribute('region')]??.035):(Math.abs(seed)%60)/10;this.kind=this.getAttribute('kind')||(central?'teyvat':'gas');if(!central&&document.documentElement.dataset.game==='gi'){
 const emblems={terrestrial:'mondstadt',gas:'sumeru',saturn:'inazuma',mars:'natlan',lava:'natlan',venus:'liyue',mercury:'inazuma',ice:'snezhnaya',neptune:'fontaine',moon:'nod-krai',sun:'liyue'};
 const region=null;
 if(region){const emblem=document.createElement('img');emblem.className='teyvat-orb-emblem';emblem.src='./assets/relations/regions/'+region+(region==='inazuma'?'.webp':'.png');emblem.alt='';emblem.setAttribute('aria-hidden','true');this.append(emblem);}
 }
 if(this.hasAttribute('region'))loadRegionalRenderer().then(()=>{if(this.isConnected){this.painted=false;this.draw(performance.now());}}).catch(()=>{});
 this.rotationKey=this.tagName+':'+(this.hasAttribute('detail')?'detail:':'')+this.kind+':'+raw;this.angle=this.hasAttribute('phase')&&Number.isFinite(Number(this.getAttribute('phase')))?Number(this.getAttribute('phase')):rotations.get(this.rotationKey)??this.angle;this.tex=this.hasAttribute('region')&&this.getAttribute('custom-surface')!=='true'?regionalTexture(this.getAttribute('region'),seed,this.getAttribute('color-shift')):texture(this.kind,seed,this.getAttribute('tint')||'#83c9d9');
 (central||document.documentElement.dataset.game!=='gi'?photoTexture(this.kind):Promise.resolve(null)).then(tex=>{if(!tex||!this.isConnected)return;this.tex=tex;this.painted=false;this.dataset.texture=tex.file;if(this.kind==='teyvat')this.dataset.ocean='#20638C';this.draw(performance.now());});
 for(let y=0;y<this.size;y++)for(let x=0;x<this.size;x++){const nx=(x+.5)/this.size*2-1,ny=(y+.5)/this.size*2-1,r=nx*nx+ny*ny;if(r>=1)continue;const z=Math.sqrt(1-r),lon=Math.atan2(nx,z)/(2*Math.PI),lat=Math.asin(ny)/Math.PI+.5;const light=Math.max(0,(-nx*.5-ny*.35+z*.9)/1.09);this.pixels.push({offset:(y*this.size+x)*4,lon,lat,light:.22+.83*light,rim:Math.pow(1-z,4)*.12,alpha:Math.min(1,(1-r)*this.size*.65)});}
 this.visible=true;this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting});this.observer.observe(this);this.dataset.ready='true';this.setAttribute('role','img');this.setAttribute('aria-label',central?'Teyvat, surface en rotation':'Surface planétaire en rotation');active.add(this);this.draw(performance.now());schedule();}
 draw(now){if(!this.isConnected)return;const host=this.closest('.dashboard-studio'),paused=host?.dataset.cosmosMotion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;const elapsed=this.last==null?0:Math.min(150,now-this.last);this.last=now;if(!this.visible||document.hidden||(!this.diorama&&this.getClientRects().length===0))return;if(paused&&this.painted)return;const speed=(Number(host?.style.getPropertyValue('--cosmos-speed'))||1)*(Number(this.getAttribute('spin'))||1);if(!paused)this.angle+=elapsed*(this.hasAttribute('region')?.000012:.00004)*speed;if(this.hasAttribute('region')&&regionalRenderer?.(this,now)){this.painted=true;rotations.set(this.rotationKey,this.angle);if(!this.reported||now-this.reported>180){this.dataset.rotation=this.angle.toFixed(5);this.reported=now;}return;}const {w,h,bytes}=this.tex,dest=this.frame.data;
 for(const p of this.pixels){const u=((p.lon+this.angle)%1+1)%1,offset=(Math.min(h-1,Math.floor(p.lat*h))*w+Math.floor(u*w))*3;for(let i=0;i<3;i++)dest[p.offset+i]=Math.min(255,bytes[offset+i]*p.light+p.rim*[80,150,190][i]);dest[p.offset+3]=p.alpha*255;}
 this.ctx.putImageData(this.frame,0,0);drawPlanetRelief(this,now);rotations.set(this.rotationKey,this.angle);this.painted=true;if(!this.reported||now-this.reported>180){this.dataset.rotation=this.angle.toFixed(5);this.reported=now;}}
 disconnectedCallback(){this.diorama?.dispose();this.diorama=null;active.delete(this);this.observer?.disconnect();if(!active.size){cancelAnimationFrame(timer);timer=null;}}
}
if(typeof customElements!=='undefined'){customElements.define('astralis-planet',class extends World{});customElements.define('astralis-world',class extends World{});}
