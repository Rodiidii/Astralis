const KEY='astralis:profile-install-icon:v1',DEFAULT='/assets/pwa/icon-180.png';
let pending;
const valid=data=>data&&/^\/api\/profile-icon(?:\?id=|\/)[a-f0-9]{64}(?:\.png)?$/.test(data.iconUrl||'');
export function profileInstallIconURL(){
 try{const cached=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(cached))return cached.iconUrl;}catch{}
 const id=new URLSearchParams(location.search).get('profile-icon');return /^[a-f0-9]{64}$/.test(id||'')?'/api/profile-icon/'+id+'.png':'';
}
function apply(data){
 for(const rel of ['apple-touch-icon','icon']){
  let links=[...document.querySelectorAll('link[rel="'+rel+'"]')];
  if(!links.length){const link=document.createElement('link');link.rel=rel;document.head.append(link);links=[link];}
  for(const link of links){link.href=data.iconUrl;link.type='image/png';link.setAttribute('sizes','512x512');}
 }
 document.querySelectorAll('link[rel="apple-touch-icon-precomposed"]').forEach(link=>link.href=data.iconUrl);
 const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.href=data.manifestUrl;
}
export function clearProfileInstallIcon(){
 localStorage.removeItem(KEY);const url=new URL(location.href);url.searchParams.delete('profile-icon');history.replaceState(history.state,'',url);document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"],link[rel="icon"]').forEach(link=>{link.href=DEFAULT;link.setAttribute('sizes','180x180');});
 const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.href='/manifest.webmanifest';
}
export async function syncProfileInstallIcon(avatar,name='Astralis'){
 if(!/^data:image\/(png|jpeg|webp);base64,/i.test(avatar||''))return null;
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(avatar)))].map(v=>v.toString(16).padStart(2,'0')).join('');
 let cached;try{cached=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
 if(cached?.hash===hash&&valid(cached)){const id=cached.iconUrl.match(/[a-f0-9]{64}/)[0],result={...cached,installUrl:'/api/profile-icon/install?id='+id};if(!cached.installUrl)localStorage.setItem(KEY,JSON.stringify(result));apply(result);return result;}
 if(pending?.hash===hash)return pending.promise;
 const promise=(async()=>{
  try{
   const image=new Image();image.src=avatar;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#12252b';ctx.fillRect(0,0,512,512);const side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,512,512);
   const response=await fetch('/api/profile-icon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:canvas.toDataURL('image/png'),name:String(name).slice(0,32)})});
   if(!response.ok)throw Error('L’icône ne peut pas être préparée pour le moment. Réessaie dans un instant.');
   const data=await response.json();if(!valid(data))throw Error('Réponse invalide pour l’icône du profil.');
   const id=data.iconUrl.match(/[a-f0-9]{64}/)[0],result={...data,hash,installUrl:'/api/profile-icon/install?id='+id};
   localStorage.setItem(KEY,JSON.stringify(result));apply(result);return result;
  }catch(error){console.warn(error.message);return null;}
  finally{if(pending?.hash===hash)pending=null;}
 })();pending={hash,promise};return promise;
}
const id=new URLSearchParams(location.search).get('profile-icon');
if(/^[a-f0-9]{64}$/.test(id||''))apply({iconUrl:'/api/profile-icon/'+id+'.png',manifestUrl:'/api/profile-icon/manifest?id='+id});
