import { characterAnimation } from './express-character-effects.js?v=20261124-expedition-3';
import { powerProfile } from './express-power-profiles.js?v=20261124-expedition-3';
const atmospheres=new WeakMap();
const themeProfiles={
 death:{name:'Éclipse de la Mort',seconds:18,color:'#df3e69',glyph:'wing',mood:'Le ciel se voile. Des plumes écarlates encerclent le noyau.'},
 blood:{name:'Le toast d’Obsidian',seconds:16,color:'#d04a78',glyph:'goblet',mood:'Des pierres écarlates gravitent autour d’une coupe nocturne.'},
 abyss:{name:'Le serment de Khaenri’ah',seconds:15,color:'#68bafa',glyph:'rift',mood:'Des failles azurées s’ouvrent entre les fragments d’un sceau étoilé.'},
 time:{name:'Le temps suspend son cours',seconds:16,color:'#a8e6de',glyph:'clock',mood:'Les cadrans tournent à rebours et les poussières remontent vers le ciel.'},
 space:{name:'L’espace se fracture',seconds:14,color:'#e96c62',glyph:'cube',mood:'Des cubes scellent les bords du champ et laissent apparaître des failles.'},
 life:{name:'Le monde reprend vie',seconds:16,color:'#b6dc82',glyph:'leaf',mood:'Des ramifications poussent et des graines lumineuses s’éveillent.'},
 destruction:{name:'Le monde après l’impact',seconds:17,color:'#e9ba76',glyph:'meteor',mood:'Des braises flottent dans une obscurité cendrée. Le sol garde la trace du choc.'},
 storm:{name:'Sous le regard de l’orage',seconds:14,color:'#c3a0fa',glyph:'bolt',mood:'Une couronne électrique tient le champ sous tension.'},
 frost:{name:'Le silence du givre',seconds:14,color:'#a5e8ee',glyph:'snow',mood:'Le gel gagne les bords de la scène et les cristaux tombent lentement.'},
 tide:{name:'Un monde sous les eaux',seconds:14,color:'#77cce9',glyph:'bubble',mood:'Des courants profonds et des bulles traversent le champ.'},
 flame:{name:'Les braises demeurent',seconds:14,color:'#ed9f67',glyph:'flame',mood:'Le champ se réchauffe et les étincelles remontent vers le ciel.'},
 forest:{name:'Une forêt dans la lumière',seconds:15,color:'#afda7c',glyph:'leaf',mood:'Des feuilles et des graines encerclent le noyau.'},
 wind:{name:'Dans l’œil du vent',seconds:13,color:'#99ddc6',glyph:'wind',mood:'Des courants d’air enveloppent le noyau et emportent les particules.'},
 stone:{name:'La promesse du jade',seconds:15,color:'#e7c778',glyph:'diamond',mood:'Des piliers de lumière et des éclats d’ambre gardent le terrain.'},
 quantum:{name:'L’envers du ciel',seconds:14,color:'#b0a0e5',glyph:'cube',mood:'Les fragments du champ deviennent des prismes suspendus.'},
 light:{name:'Une constellation se lève',seconds:14,color:'#ead89c',glyph:'star',mood:'Des rayons dorés et des étoiles dessinent une nouvelle constellation.'},
 rhythm:{name:'Le rappel du spectacle',seconds:14,color:'#d9abe4',glyph:'note',mood:'Les ondes musicales gardent le rythme autour du noyau.'},
 theatre:{name:'Le grand rappel de Furina',seconds:16,color:'#8acfe7',glyph:'hat',mood:'Le rideau d’eau reste ouvert et les projecteurs accompagnent le salut.'},
 physical:{name:'L’écho de la frappe',seconds:12,color:'#bdced8',glyph:'blade',mood:'Des sillages argentés prolongent l’impact.'}
};
const GLYPHS={
 hat:'<path d="M15 4H49L43 43H21ZM16 35H48V44H16M3 45Q32 35 61 45L57 58H7Z"/>',
 eye:'<path d="M3 32Q32 4 61 32 32 60 3 32Z"/><circle cx="32" cy="32" r="13"/><path d="M35 20L25 35H34L30 46 43 29H34Z"/>',
 pillar:'<path d="M18 62V13L32 2 46 13V62M18 13H46M25 21H39V53H25M32 2V62M9 62H55"/>',
 lotus:'<path d="M32 59Q5 52 5 28 22 29 32 46 42 29 59 28 59 52 32 59ZM32 46Q13 24 32 3 51 24 32 46ZM8 16Q24 17 27 31M56 16Q40 17 37 31"/>',
 goblet:'<path d="M18 3H46L43 24Q41 37 32 39 22 37 21 24ZM32 39V56M20 60H44M23 18H42M8 5L18 11M56 5L46 11M16 24L5 31M48 24L59 31"/>',
 rift:'<path d="M32 2L37 24 61 32 38 39 32 62 25 39 3 32 25 25ZM32 18V47M18 32H47M8 6L18 15 15 23M56 6L47 15 50 23M8 57L19 49 15 42M56 57L46 49 50 42"/>',
 wing:'<path d="M31 57C13 52 1 41 2 19Q6 30 14 30Q1 17 10 2Q9 19 22 28Q16 9 26 0Q20 19 31 31ZM33 57C51 52 63 41 62 19Q58 30 50 30Q63 17 54 2Q55 19 42 28Q48 9 38 0Q44 19 33 31Z"/><path d="M29 51Q13 43 6 25M28 42Q17 29 13 11M28 33L26 12M35 51Q51 43 58 25M36 42Q47 29 51 11M36 33L38 12"/>',
 clock:'<circle cx="32" cy="32" r="25"/><path d="M32 11V32L47 43M32 4V8M4 32H8M56 32H60M32 56V60"/>',
 cube:'<path d="M32 3L58 18V47L32 61 6 47V18ZM6 18L32 33 58 18M32 33V61"/>',
 leaf:'<path d="M8 57C-2 16 27 1 60 4 57 38 40 59 8 57ZM8 57L49 15M25 40V21M35 29H53"/>',
 meteor:'<path d="M9 37L25 20 45 25 56 43 38 59 17 55ZM9 37L32 40 45 25M32 40L38 59M2 6L21 23M20 1L34 21M43 2L48 23"/>',
 bolt:'<path d="M39 2L9 36H29L23 61 56 26H36Z"/>',
 snow:'<path d="M32 3V61M7 18L57 46M7 46L57 18M22 8L32 17 42 8M22 56L32 47 42 56M8 30L17 24 17 12M47 52L47 40 56 34"/>',
 bubble:'<circle cx="32" cy="32" r="25"/><path d="M12 29Q15 12 31 11"/>',
 flame:'<path d="M35 2C35 22 62 26 56 45 49 69 8 64 8 42 7 29 19 20 20 9 25 28 31 25 35 2ZM32 35Q48 56 33 60 18 57 32 35Z"/>',
 wind:'<path d="M4 24H46C62 24 63 4 47 4Q38 6 42 13M4 35H59M8 46H38C55 46 55 62 41 62"/>',
 diamond:'<path d="M32 2L54 23 45 48 32 62 18 48 10 23ZM32 2V62M10 23H54M18 48L32 29 45 48"/>',
 star:'<path d="M32 3L40 23 61 32 40 41 32 61 24 41 3 32 24 23Z"/>',
 note:'<path d="M24 48V11L53 4V41M24 19L53 12"/><ellipse cx="16" cy="52" rx="9" ry="6"/><ellipse cx="45" cy="46" rx="9" ry="6"/>',
 blade:'<path d="M30 3H37L45 12 38 43H28L21 12ZM17 42H47V48H17M29 48H37V62H29Z"/>'
};
function svg(name){const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('viewBox','0 0 64 64');el.innerHTML=GLYPHS[name]||GLYPHS.star;return el;}
function quiet(s,stage){return !!(s.reducedMotion||s.clicker?.calmScene||stage.closest('.calm-scene')||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);}
export function aftermathProfile(p,key,world){
 const d=characterAnimation(p,key,world),kit=powerProfile(p,key,world),id=(d.sceneId||key).toLowerCase(),actors=(d.scene?.actions||[]).map(a=>a.actor).join(' ');let theme;
 if(/ronova/.test(id))theme='death';else if(/obsidian/.test(id))theme='blood';else if(/dainsleif/.test(id))theme='abyss';else if(/istaroth/.test(id))theme='time';else if(/asmoday/.test(id))theme='space';else if(/naberius/.test(id))theme='life';else if(kit.special==='phainon'||/ruinmeteor/.test(actors))theme='destruction';
 else if(/instrument|music|mic|speaker|guitar/.test(actors))theme='rhythm';else theme={pyro:'flame',cryo:'frost',hydro:'tide',electro:'storm',dendro:'forest',anemo:'wind',geo:'stone',quantum:'quantum',imaginary:'light',spectro:'light',havoc:'quantum',physical:'physical'}[d.scene?.element||'']||(/Ombre du Temps/.test(p?.elementText)?'time':null);
 if(!theme){const el=String(p?.elementText||p?.element||p?.damageType||'').toLowerCase();theme=/pyro|fire|fusion/.test(el)?'flame':/cryo|ice|glacio|givre/.test(el)?'frost':/hydro/.test(el)?'tide':/electro|lightning|électro/.test(el)?'storm':/dendro/.test(el)?'forest':/anemo|aero|wind/.test(el)?'wind':/geo/.test(el)?'stone':/quantum|havoc/.test(el)?'quantum':/imaginary|spectro/.test(el)?'light':'physical';}
 const personal={'gi:10000052':{glyph:'eye',name:'Le regard de l’éternité'},'gi:10000030':{glyph:'pillar',name:'Le contrat immuable'},'gi:10000073':{glyph:'lotus',name:'Le jardin des rêves'},'gi:10000089':{...themeProfiles.theatre,theme:'theatre'},'gi:10000114':{theme:'abyss',...themeProfiles.abyss,color:'#aaa4f0',name:'Les sept phases du vide'}}[kit.id]||{};
 return {...themeProfiles[theme],theme,...personal,key,world,character:p?._name||p?.name||p?.en||key,sceneId:d.sceneId,signature:d.scene?.title||kit.name};
}
export function startAftermath(s,p,key,now=Date.now()){
 s.clicker??={};s.clicker.atmospheres??={};const profile=aftermathProfile(p,key,s.world),data={...profile,startedAt:now,until:now+profile.seconds*1000,place:s.place};s.clicker.atmospheres[s.world]=data;return data;
}
export function restoreAftermath(stage,s,now=Date.now()){
 if(!stage?.isConnected)return;const data=s.clicker?.atmospheres?.[s.world],previous=atmospheres.get(stage);
 if(!data||data.until<=now||data.place!==s.place){previous?.root.remove();atmospheres.delete(stage);stage.removeAttribute('data-atmosphere');return;}
 const calm=quiet(s,stage);if(previous?.until===data.until&&previous.root.isConnected&&previous.calm===calm)return;
 previous?.root.remove();const root=document.createElement('div');root.className=`cx-aftermath aftermath-${data.theme}${calm?' is-quiet':''}`;root.dataset.aftermath=data.theme;root.setAttribute('aria-hidden','true');root.style.setProperty('--aftermath-color',data.color);root.style.setProperty('--aftermath-life',`${Math.max(1,(data.until-now)/1000)}s`);
 const veil=document.createElement('span');veil.className='cx-aftermath-veil';root.append(veil);
 const seal=document.createElement('span');seal.className='cx-aftermath-seal';seal.append(svg(data.glyph));root.append(seal);
 if(!calm)for(let i=0;i<14;i++){const mote=document.createElement('span');mote.className='cx-aftermath-mote';mote.style.cssText=`--i:${i};--x:${[9,80,18,92,35,64,4,73,48,23,85,56,12,97][i]}%;--size:${i%4===0?26:12+i%5*2}px;--delay:${-i*.57}s;--drift:${(i%2?1:-1)*(18+i*3)}px`;mote.append(svg(data.glyph));root.append(mote);}
 stage.prepend(root);stage.dataset.atmosphere=data.theme;atmospheres.set(stage,{root,until:data.until,calm});
 const label=stage.querySelector('[data-rpg-atmosphere-label]');if(label)label.textContent=`${data.name} · ${Math.ceil((data.until-now)/1000)} s`;
}
export function clearAftermath(stage,s){if(s.clicker?.atmospheres)delete s.clicker.atmospheres[s.world];restoreAftermath(stage,s);}
export function playSkillVFX(stage,s,p,key){
 if(!stage?.isConnected||quiet(s,stage))return;const profile=aftermathProfile(p,key,s.world),kit=powerProfile(p,key,s.world);stage.querySelector('.cx-skill-spectacle')?.remove();
 const root=document.createElement('div');root.className=`cx-skill-spectacle skill-${kit.role} spectacle-${profile.theme}`;root.dataset.skillSpectacle=key;root.setAttribute('aria-hidden','true');root.style.setProperty('--vfx-color',profile.color);
 const disk=document.createElement('span');disk.className='cx-skill-disc';root.append(disk);
 const emblem=document.createElement('span');emblem.className='cx-skill-glyph';emblem.append(svg(profile.glyph));root.append(emblem);
 for(let i=0;i<12;i++){const ray=document.createElement('i');ray.className='cx-skill-ray';ray.style.cssText=`--ray-angle:${i*30+(i%2?8:0)}deg;--i:${i}`;root.append(ray);}
 for(let i=0;i<5;i++){const fragment=document.createElement('span');fragment.className='cx-skill-fragment';fragment.style.cssText=`--angle:${i*72}deg;--i:${i}`;fragment.append(svg(profile.glyph));root.append(fragment);}
 stage.append(root);const motion=stage.animate([{filter:'brightness(1)'},{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:1100,easing:'ease-out'});setTimeout(()=>{motion.cancel();root.remove();},2800);
}
