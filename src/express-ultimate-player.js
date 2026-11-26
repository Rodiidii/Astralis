import { characterAnimation } from './express-character-effects.js?v=20261124-expedition-3';
import { playCharacterScene, findCharacterScene } from './express-character-cinematics.js?v=20261124-expedition-3';
import { powerProfile } from './express-power-profiles.js?v=20261124-expedition-3';
let manifest={},preload,playing=null,generation=0,audioContext,warmStamp='';
const warmVideos=new Map();
function releaseVideo(video){video.pause();video.removeAttribute('src');video.load();}
function firstFrameReady(video){return new Promise(resolve=>{if(video.readyState>=2){resolve(true);return;}let timer;const done=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',done);video.removeEventListener('error',done);resolve(video.readyState>=2);};video.addEventListener('loadeddata',done,{once:true});video.addEventListener('error',done,{once:true});timer=setTimeout(done,5000);});}
export function releaseUltimatePreloads(){warmStamp='';for(const video of warmVideos.values())releaseVideo(video);warmVideos.clear();}
export function warmUltimateClips(persons,world){
 const ids=persons.slice(0,4).map(p=>mediaId(p,world)),stamp=ids.join('|');if(stamp===warmStamp)return;warmStamp=stamp;
 return preloadUltimateMedia().then(()=>{if(warmStamp!==stamp)return;const clips=ids.map(id=>manifest[id]).filter(e=>e?.kind==='video'),urls=new Set(clips.map(e=>e.url));
  for(const [url,video] of warmVideos)if(!urls.has(url)){releaseVideo(video);warmVideos.delete(url);}
  for(const clip of clips){if(warmVideos.has(clip.url)||playing?.clipURL===clip.url)continue;const video=document.createElement('video');video.preload='auto';video.playsInline=true;video.muted=true;video.src=clip.url;warmVideos.set(clip.url,video);video.load();}
  return Promise.all([...warmVideos.values()].map(firstFrameReady));
 });
}
export function preloadUltimateMedia(){return preload??=fetch('/assets/express-ultimates/manifest.json?v=20261124-expedition-3').then(r=>{if(!r.ok)throw Error('manifest');return r.json()}).then(d=>manifest=d).catch(()=>({}));}
const qualityLabel=clip=>clip?.height?`${clip.height}p · ${Math.round(clip.fps||0)} i/s`:'';
export function ultimateMediaStatus(person,world){const item=manifest[mediaId(person,world)];return item?.kind==='video'?`${item.sceneKind==='lore'?'Scène du lore':item.sceneKind==='gameplay'?`Capture de gameplay${item.betaCapture?' · bêta':''}`:'Aperçu du talent'} · ${Math.min(5,item.seconds||5).toLocaleString('fr-FR',{maximumFractionDigits:1})} s${qualityLabel(item)?' · '+qualityLabel(item):''}`:item?.kind==='audio'?'Scène Astralis + voix intégrée':'Scène Astralis · vidéo intégrée indisponible';}
const mediaId=(p,w)=>{const scene=findCharacterScene(p,p?._name||p?.name||p?.en,w);if(scene)return scene.id;const id=String(p?.id||p?._id||'');return `${w}:${w==='gi'?(id.match(/100\d{5}/)?.[0]||id):id}`;};
function database(){return new Promise((resolve,reject)=>{const req=indexedDB.open('astralis-express-ultimate-media',1);req.onupgradeneeded=()=>req.result.createObjectStore('clips');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function stored(id){const db=await database();try{return await new Promise((resolve,reject)=>{const req=db.transaction('clips').objectStore('clips').get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}finally{db.close();}}
export async function storeUltimateClip(person,world,file){
 if(!file||!(/\.(mp4|webm)$/i.test(file.name)||/^video\/(mp4|webm)$/.test(file.type)))throw Error('Choisis une vidéo MP4 ou WebM.');
 if(file.size>30*1024*1024)throw Error('La vidéo doit faire moins de 30 Mo.');if(!file.size)throw Error('Cette vidéo est vide.');
 const db=await database();try{await new Promise((resolve,reject)=>{const tx=db.transaction('clips','readwrite');tx.objectStore('clips').put({blob:file,name:file.name},mediaId(person,world));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}
export async function removeUltimateClip(person,world){const db=await database();try{await new Promise((resolve,reject)=>{const tx=db.transaction('clips','readwrite');tx.objectStore('clips').delete(mediaId(person,world));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
export function stopUltimateMedia(){generation++;playing?.dispose();playing=null;}
function resonanceSound(kit){
 // Original Astralis sound design; never described as an official voice line.
 try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});const nodes=[],now=audioContext.currentTime;
 const bass=['assault','execute','stance','shield'].includes(kit.role),freq=bass?85:['healer','time','speed'].includes(kit.role)?440:220;
 for(let i=0;i<3;i++){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=bass?'triangle':'sine';osc.frequency.setValueAtTime(freq*(1+i*.5),now+i*.14);osc.frequency.exponentialRampToValueAtTime(freq*.45,now+.8+i*.14);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.055,now+.03+i*.14);gain.gain.exponentialRampToValueAtTime(.001,now+1+i*.14);osc.connect(gain);gain.connect(audioContext.destination);osc.start(now+i*.14);osc.stop(now+1.1+i*.14);nodes.push(osc);}
 return ()=>nodes.forEach(n=>{try{n.stop();}catch{}});
 }catch{return ()=>{};}
}
export function playUltimateMedia(stage,person,key,world,{muted=false,reduced=false,buffLabel='',onComplete}={}){
 stopUltimateMedia();if(!stage?.isConnected)return;const ticket=generation,descriptor=characterAnimation(person,key,world),kit=powerProfile(person,key,world);
 const root=document.createElement('div');root.className='cx-ultimate-fullframe';root.dataset.ultimateCharacter=descriptor.sceneId||mediaId(person,world);root.dataset.mediaKey=mediaId(person,world);root.setAttribute('aria-label',`Ultime de ${descriptor.name}`);
 const preview=document.createElement('div');preview.className='cx-ultimate-scene';root.append(preview);
 const heading=document.createElement('div');heading.className='cx-ultimate-title';const tag=document.createElement('small'),title=document.createElement('b'),description=document.createElement('span');tag.textContent=person.lore?'POUVOIR DU TYCOON · LORE':'DÉCHAÎNEMENT';title.textContent=kit.name;description.textContent=buffLabel||kit.description;heading.append(tag,title,description);root.append(heading);
 const skip=document.createElement('button');skip.className='cx-ultimate-skip';skip.textContent='Passer · Échap';skip.setAttribute('aria-label','Passer l’ultime');root.append(skip);stage.append(root);
 const record={root,media:null,url:null,timer:0,observer:null,soundStop:null,dispose(){clearTimeout(record.timer);record.observer?.disconnect();record.soundStop?.();if(record.media){record.media.pause();record.media.removeAttribute('src');record.media.load();}if(record.url)URL.revokeObjectURL(record.url);stage.classList.remove('cx-media-playing');warmStamp='';root.remove();}};playing=record;
 const current=()=>ticket===generation&&root.isConnected,finish=()=>{if(!current())return;stopUltimateMedia();onComplete?.();};record.finish=finish;skip.onclick=finish;record.observer=new MutationObserver(()=>{if(!root.isConnected&&playing===record)stopUltimateMedia();});record.observer.observe(document.body,{childList:true,subtree:true});
 const arm=(ms)=>{clearTimeout(record.timer);record.timer=setTimeout(finish,ms);};
 function original(){
  if(!current())return;preview.replaceChildren();const scene=descriptor.scene||{id:mediaId(person,world),title:kit.name,actions:[{actor:'star',motion:'open',at:0},{actor:'blade',motion:'cross',at:450},{actor:'star',motion:'explode',at:950}]};
  playCharacterScene(preview,descriptor,{...scene,amplified:true,duration:3600,actorDuration:1700,actions:scene.actions.map((a,i)=>({...a,at:[100,650,1300][i]}))},{reduced});
  if(!muted)record.soundStop=resonanceSound(kit);arm(reduced?1300:4000);
 }
 function unlock(media){if(!current())return;const button=document.createElement('button');button.className='cx-ultimate-sound';button.textContent='Activer le son';button.onclick=()=>{media.muted=false;media.play().then(()=>button.remove()).catch(()=>{});};root.append(button);}
 function video(clip){
  if(!current())return;if(record.media){record.media.onplaying=null;record.media.onended=null;record.media.onerror=null;releaseVideo(record.media);record.media.remove();}record.soundStop?.();record.soundStop=null;const v=warmVideos.get(clip.url)||document.createElement('video');warmVideos.delete(clip.url);record.media=v;record.clipURL=clip.url;v.preload='auto';v.disablePictureInPicture=true;v.disableRemotePlayback=true;v.playbackRate=1;if(v.getAttribute('src')!==clip.url)v.src=clip.url;v.autoplay=true;v.playsInline=true;v.muted=muted;v.volume=.7;v.controls=false;v.style.opacity='0';v.setAttribute('aria-hidden','true');v.setAttribute('controlslist','nodownload noremoteplayback');root.prepend(v);tag.textContent=clip.custom?'TA CINÉMATIQUE':clip.sceneKind==='lore'?`SCÈNE DU LORE · ${clip.audioLanguage||'EN'}`:clip.sceneKind==='gameplay'?`CAPTURE${clip.betaCapture?' BÊTA':' DE GAMEPLAY'}${clip.hasAudio===false?' · SON ASTRALIS':''}`:`APERÇU DU TALENT · ${clip.hasAudio===false?'SON ASTRALIS':clip.audioLanguage||'EN'}`;
  v.onplaying=()=>{if(!current()||record.media!==v)return;const reveal=()=>{if(!current()||record.media!==v)return;stage.classList.add('cx-media-playing');root.classList.add('has-video');preview.getAnimations({subtree:true}).forEach(a=>a.cancel());preview.replaceChildren();preview.style.opacity='0';v.style.opacity='1';stage.getAnimations().forEach(a=>a.cancel());for(const n of stage.querySelectorAll('.cx-kit-proc,.cx-proc-callout,.cx-character-scene,.cx-skill-spectacle'))if(!root.contains(n)){n.getAnimations({subtree:true}).forEach(a=>a.cancel());n.remove();}};if(v.requestVideoFrameCallback){v.requestVideoFrameCallback(reveal);setTimeout(()=>{if(v.style.opacity==='0')reveal();},100);}else reveal();if(clip.hasAudio===false&&!muted){record.soundStop?.();record.soundStop=resonanceSound(kit);}arm(5350);};v.ontimeupdate=()=>{if(v.currentTime>=5)finish();};v.onended=finish;v.onerror=()=>{if(!current()||record.media!==v)return;stage.classList.remove('cx-media-playing');root.classList.remove('has-video');v.remove();record.media=null;preview.style.opacity='1';tag.textContent='CINÉMATIQUE ASTRALIS';original();};
  v.onloadedmetadata=()=>{if(!current())return;root.dataset.videoHeight=String(v.videoHeight);root.dataset.videoFps=String(clip.fps||'');};
  v.play().catch(()=>{if(!current())return;v.muted=true;v.play().then(()=>{if(!muted)unlock(v);}).catch(()=>{v.remove();preview.style.opacity='1';original();});});arm(6500);
 }
 function voice(clip){if(!current())return;record.soundStop?.();record.soundStop=null;const a=document.createElement('audio');record.media=a;a.src=clip.url;a.volume=.7;a.muted=muted;tag.textContent=`SCÈNE ASTRALIS · VOIX ${clip.audioLanguage||'ORIGINALE'}`;root.append(a);a.play().catch(()=>{if(!muted)unlock(a);});arm(5300);a.onended=()=>arm(600);}
 // A prepared native clip does not need a second animation behind its first frame.
 if(reduced||manifest[mediaId(person,world)]?.kind!=='video')original();
 if(!reduced){
  const id=mediaId(person,world),startClip=clip=>{if(!current()||!clip)return;if(clip.kind==='video')video(clip);else if(clip.kind==='audio')voice(clip);};
  // A local-storage lookup must never delay a known bundled video.
  if(manifest[id])startClip(manifest[id]);
  else preloadUltimateMedia().then(()=>{if(!record.url)startClip(manifest[id]);});
  stored(id).catch(()=>null).then(custom=>{if(!current()||!custom?.blob)return;record.url=URL.createObjectURL(custom.blob);video({url:record.url,custom:true});});
 }

 return record;
}
