let last='',pending='';
export async function syncProfileInstallIcon(avatar,name='Astralis'){
 if(!avatar||!/^data:image\/(png|jpeg|webp);base64,/i.test(avatar))return;
 const bytes=new TextEncoder().encode(avatar),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
 if(hash===pending)return;const key='astralis:profile-install-icon:v1';let cached={};try{cached=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
 const apply=data=>{document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(link=>{link.href=data.iconUrl;link.setAttribute('sizes','512x512')});const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.href=data.manifestUrl;last=hash;};
 if(cached.hash===hash&&cached.iconUrl){apply(cached);return}if(last===hash)return;pending=hash;
 try{const image=new Image();image.src=avatar;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#12252b';ctx.fillRect(0,0,512,512);const side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,512,512);const response=await fetch('/api/profile-icon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:canvas.toDataURL('image/png'),name:String(name).slice(0,32)})});if(!response.ok)throw Error('Icône du profil non disponible.');const data=await response.json();if(!/^\/api\/profile-icon\?id=[a-f0-9]{64}$/.test(data.iconUrl))throw Error('Icône invalide');localStorage.setItem(key,JSON.stringify({...data,hash}));apply(data)}catch(error){console.warn(error.message)}finally{pending=''}
}


const installId=new URLSearchParams(location.search).get('profile-icon');
if(installId&&/^[a-f0-9]{64}$/.test(installId)){
 document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(link=>{link.href='/api/profile-icon?id='+installId;link.setAttribute('sizes','512x512')});
 const manifest=document.querySelector('link[rel="manifest"]');if(manifest)manifest.href='/api/profile-icon/manifest?id='+installId;
}
