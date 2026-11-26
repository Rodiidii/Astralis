import { CHARACTER_PORTRAITS } from './character-portrait-assets.js?v=20261124-expedition-3';
import { findCharacterScene, createSceneActor } from './express-character-cinematics.js?v=20261124-expedition-3';

// Illustrative art direction, shared by app themes and the game; no combat rules.
export const LORE_VISUALS={
 ronova:{world:'gi',name:'Ronova',title:'L’Ombre de la Mort',portrait:'/assets/media/lore-characters/ronova-portrait.png',art:'/assets/media/lore-characters/ronova.png',accent:'#ee7b94',secondary:'#c4a7df',family:'eclipse'},
 istaroth:{world:'gi',name:'Istaroth',title:'Kairos · L’Ombre du Temps',portrait:'/assets/media/lore-characters/istaroth-portrait.png',art:'/assets/media/lore-characters/istaroth.jpg',accent:'#aadbd8',secondary:'#e1c58d',family:'clockwork'},
 naberius:{world:'gi',name:'Naberius',title:'L’Ombre de la Vie',portrait:'/assets/media/lore-characters/naberius-portrait.png',art:'/assets/express-lore/naberius.jpg',accent:'#b6d99b',secondary:'#dfc787',family:'botanical'},
 asmoday:{world:'gi',name:'Asmoday',title:'L’Ombre de l’Espace',portrait:'/assets/media/lore-characters/asmoday-portrait.png',art:'/assets/express-lore/asmoday.png',accent:'#ed7d78',secondary:'#e0bc81',family:'lattice'},
 capitano:{world:'gi',name:'Capitano',title:'Premier Exécuteur des Fatui',portrait:'/assets/media/lore-characters/capitano-source-official.png',art:'/assets/media/lore-characters/capitano.webp',accent:'#9ccfe1',secondary:'#b7b7ce',family:'heraldic'},
 dainsleif:{world:'gi',name:'Dainsleif',title:'Gardien du rameau · Khaenri’ah',portrait:'/assets/media/lore-characters/dainsleif-portrait.png',art:'/assets/relations/lore/dainsleif.webp',accent:'#80bdec',secondary:'#ceb58d',family:'constellation'},
 // Explicit user preference: keep this exact existing profile image.
 obsidian:{world:'hsr',name:'Obsidian',title:'Dix Cœurs de pierre',portrait:'/assets/express-lore/obsidian.png',art:'/assets/express-lore/obsidian.png',accent:'#e9799b',secondary:'#bfa3d7',family:'gothic',portraitFit:'cover'}
};
const SIGNATURES={
 'gi:10000089':['#93c5e9','#cbc1f1','theatre'], 'gi:10000073':['#b8d891','#f0d998','botanical'],
 'gi:10000030':['#d8b77b','#9eaeb9','heraldic'], 'gi:10000052':['#b5a0ea','#e8b8d5','storm'],
 'gi:10000114':['#a5a7ed','#a6dbf0','constellation'], 'gi:10000087':['#91c9e7','#c4b7ec','tides'],
 'gi:10000046':['#ec9c83','#d8b5d1','eclipse'], 'gi:10000096':['#e58b92','#cec4cd','gothic'],
 'gi:10000006':['#b6a0dc','#dcc19a','arcane'], 'gi:10000021':['#edaa82','#ddc395','flame'],
 'gi:10000058':['#e0a3c4','#bea2db','botanical'], 'gi:10000047':['#b0d2c0','#da9b85','wind'],
 'gi:10000022':['#a1cfb7','#e5d49b','wind'], 'gi:10000014':['#b2d8eb','#e6c9cb','rhythm'],
 'gi:10000041':['#afbae9','#d9b5db','arcane'], 'gi:10000033':['#a4c7dc','#dc9b8c','tides'],
 'gi:10000075':['#a9bde4','#b3d5ce','wind'], 'gi:10000060':['#96b5ed','#d5d9ed','lattice'],
 'gi:10000049':['#edbf85','#e58d8d','flame'], 'gi:10000002':['#b7d4ed','#d4b9e7','frost'],
 'gi:10000106':['#ecab75','#e3d2a5','flame'], 'gi:10000078':['#a5c9a2','#dcc995','botanical'],
 'gi:10000038':['#a6bfd7','#d9a58c','botanical'], 'gi:10000042':['#bca8e2','#e4bcda','storm'],
 'hsr:1408':['#e7bd83','#c3d7eb','cataclysm'], 'hsr:1005':['#d3a4cd','#b49edb','gothic'],
 'hsr:1304':['#8fc6b5','#dfc785','lattice'], 'hsr:1309':['#b2bbeb','#e9cdb7','rhythm'],
 'hsr:1308':['#b3a6e6','#e594b3','eclipse'], 'hsr:1406':['#d9abda','#bca6df','gothic'],
 'hsr:1310':['#b9dccc','#d4c58d','flame'], 'hsr:1213':['#c2b9df','#a9d5ed','constellation'],
 'hsr:1208':['#dcb1c2','#e6c992','heraldic'], 'hsr:1220':['#a6d5c7','#c6d7ed','wind'],
 'hsr:1405':['#a2c8c1','#dfc78e','arcane'], 'hsr:1401':['#e3b4cf','#afd6c1','botanical'],
 'ww:1304':['#c0d7d4','#e4d7a8','tides'], 'ww:1404':['#97ccc3','#d5c194','wind'],
 'ww:1505':['#afc7ea','#ded9ac','constellation'], 'ww:1603':['#dba2b4','#9ec5b2','botanical'],
 'ww:1205':['#eab393','#e2bfca','flame'], 'ww:1107':['#b2cce9','#d0b4d5','frost'],
 'ww:1402':['#a8c9db','#cbd6df','wind'], 'ww:1202':['#e7a896','#e4ce96','flame'],
 'ww:1103':['#c7dbdb','#c0b8df','frost'], 'ww:1503':['#b9d68d','#e9d7a0','botanical']
};
const PALETTES={pyro:['#e8a88c','#dec18d','flame'],cryo:['#b0d2e5','#c7bfdd','frost'],hydro:['#9dc9e6','#bbc3e5','tides'],electro:['#b8a7df','#d4b4db','storm'],dendro:['#b3cd97','#dac995','botanical'],anemo:['#a5d3c2','#cad6c3','wind'],geo:['#d3bc8e','#bec8c6','heraldic'],quantum:['#b6ace5','#e0b0ce','lattice'],imaginary:['#dfcd99','#b5cbdc','constellation'],spectro:['#ded6a6','#add6cf','constellation'],havoc:['#c9a3d6','#e5a6b8','eclipse'],physical:['#c4c8d6','#b5cbd0','heraldic']};
const motifCache=new Map();
const canonical=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function elementOf(p){const text=canonical(p?.elementText||p?.element||p?.damageType||p?.vision);return /pyro|fire|fusion/.test(text)?'pyro':/cryo|ice|glacio/.test(text)?'cryo':/hydro/.test(text)?'hydro':/electro|thunder|lightning/.test(text)?'electro':/dendro/.test(text)?'dendro':/anemo|wind|aero/.test(text)?'anemo':/geo/.test(text)?'geo':/quantum/.test(text)?'quantum':/imaginary/.test(text)?'imaginary':/spectro/.test(text)?'spectro':/havoc/.test(text)?'havoc':'physical';}
export function visualIdentity(p,key,world='gi'){
 const raw=String(p?.id||p?._id||key||'').replace(/^lore-/,'').replace(/^(gi|hsr|ww):/,'');
 const lore=LORE_VISUALS[raw]||Object.values(LORE_VISUALS).find(x=>x.world===world&&canonical(x.name)===canonical(p?._name||p?.name||key));
 const scene=findCharacterScene({...p,...(lore?{id:Object.keys(LORE_VISUALS).find(k=>LORE_VISUALS[k]===lore)}:{})},key,world);
 const id=scene?.id||`${world}:${raw}`,palette=SIGNATURES[id]||PALETTES[elementOf(p)];
 const actors=(scene?.actions||[]).map(a=>a.actor);
 return {id,accent:lore?.accent||palette[0],secondary:lore?.secondary||palette[1],family:lore?.family||palette[2],
  signature:scene?.title||p?.title||p?._name||p?.name||String(key||''),
  actors:actors.length?actors:['star','blade','star'],portrait:lore?.portrait||p?._themePortrait||CHARACTER_PORTRAITS[id]||(world==='ww'&&/^\d+$/.test(raw)?`/assets/express-roster/ww/${raw}.webp`:''),
  art:lore?.art||p?._themeArt||'',portraitFit:lore?.portraitFit||'contain',authored:!!scene};
}
export function identityMotif(actor){
 if(motifCache.has(actor))return motifCache.get(actor);
 const svg=createSceneActor(actor);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('fill','none');svg.setAttribute('stroke','#fff');svg.setAttribute('stroke-width','1.25');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 const data=`url("data:image/svg+xml,${encodeURIComponent(svg.outerHTML)}")`;motifCache.set(actor,data);return data;
}
export function decorateCharacterTheme(frame,p,key,world,prefs={}){
 if(!frame)return;const identity=visualIdentity(p,key,world);frame.dataset.identity=identity.id;frame.dataset.identityFamily=identity.family;
 const intensity=Math.max(0,Math.min(100,Number(prefs.characterThemeIntensity??55)))/100;
 frame.style.setProperty('--identity-strength',intensity);frame.style.setProperty('--identity-accent',identity.accent);frame.style.setProperty('--identity-secondary',identity.secondary);
 identity.actors.forEach((actor,i)=>frame.style.setProperty(`--identity-motif-${i}`,identityMotif(actor)));
 frame.dataset.identityMotion=prefs.reducedMotion?'reduced':'full';frame.dataset.identityPortrait=prefs.characterThemePortrait!==false?'on':'off';
 const old=frame.querySelector(':scope>.character-identity-scene');old?.remove();
 if(prefs.characterThemeMotifs!==false){const decor=document.createElement('div');decor.className='character-identity-scene';decor.setAttribute('aria-hidden','true');decor.innerHTML='<i class="identity-halo"></i><i class="identity-orbit"></i><i class="identity-mark mark-0"></i><i class="identity-mark mark-1"></i><i class="identity-mark mark-2"></i><i class="identity-dust"></i>';frame.prepend(decor);}
 if(identity.portrait)frame.style.setProperty('--identity-portrait',`url("${identity.portrait}")`);else frame.style.removeProperty('--identity-portrait');
 const ribbon=frame.querySelector('.character-theme-ribbon');if(ribbon){ribbon.dataset.identityFamily=identity.family;const badges=ribbon.querySelector('.character-theme-sigils');if(badges){badges.replaceChildren();for(const actor of identity.actors){const icon=document.createElement('span');icon.className='identity-signature-badge';icon.style.setProperty('--identity-badge',identityMotif(actor));icon.setAttribute('aria-hidden','true');badges.append(icon);}}}
 return identity;
}
const stageIdentities=new WeakMap();
export function restoreCharacterIdentity(stage,s,p,key,portrait=''){
 if(!stage?.isConnected)return;const profile=visualIdentity(p,key,s.world),calm=s.reducedMotion||s.clicker?.calmScene||document.documentElement.dataset.motion==='reduced'||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches,stamp=profile.id+'|'+!!calm,previous=stageIdentities.get(stage);
 if(previous?.stamp===stamp&&previous.root.isConnected)return;
 previous?.root.remove();const root=document.createElement('div');root.className='cx-personal-identity'+(calm?' is-quiet':'');root.setAttribute('aria-hidden','true');root.dataset.identityFamily=profile.family;stage.dataset.characterIdentity=profile.id;
 stage.style.setProperty('--identity-accent',profile.accent);stage.style.setProperty('--identity-secondary',profile.secondary);
 const image=profile.portrait||portrait;
 if(image){const img=document.createElement('img');img.className='cx-identity-portrait';img.src=image;img.alt='';img.addEventListener('error',()=>img.remove(),{once:true});root.append(img);}
 const seal=document.createElement('span');seal.className='cx-identity-seal';seal.append(createSceneActor(profile.actors[0]));root.append(seal);
 for(let i=1;i<3;i++){const mark=document.createElement('span');mark.className=`cx-identity-ornament ornament-${i}`;mark.append(createSceneActor(profile.actors[i]));root.append(mark);}
 const border=document.createElement('i');border.className='cx-identity-frame';root.append(border);stage.prepend(root);stageIdentities.set(stage,{stamp,root});
}
export const IDENTITY_SIGNATURE_COUNT=Object.keys(SIGNATURES).length;
