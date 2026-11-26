import {ATLAS_PHOTOS} from './exploration-atlas-photos.js';
import {openIdleArcade,closeIdleArcade} from './idle-arcade-view.js?v=20261126-portal-play-1';

export const ARCADE_GAMES=[
 ['tetris','Tetris astral','Un classique, des réactions en plus.','Réflexion','10000030','liyue'],
 ['meteor','Esquive des astres','Garde le cap au milieu des météores.','Réflexes','10000026','liyue'],
 ['memory','Mémoire céleste','Retrouve les portraits avant de perdre le fil.','Mémoire','10000073','sumeru'],
 ['reactions','Alchimie élémentaire','Transforme les combinaisons en réactions.','Puzzle','10000043','mondstadt'],
 ['rhythm','Rythme astral','Suis les pulsations de ta prochaine partie.','Musique','10000022','mondstadt'],
 ['pinball','Flipper astral','Des rebonds, du contrôle, un dernier sauvetage.','Adresse','10000029','mondstadt'],
 ['path','Tracé stellaire','Relie les étoiles sans perdre ta trajectoire.','Parcours','10000060','liyue'],
 ['boss','Arène des échos','Choisis le bon moment pour attaquer.','Combat','10000106','natlan'],
 ['cipher','Décodeur astral','Comprends les indices, révèle le code.','Logique','10000059','inazuma'],
 ['deckrun','Expédition de cartes','Un itinéraire qui dépend de tes choix.','Stratégie','10000071','sumeru'],
 ['expedition','Missions d’équipage','Prépare les départs et retrouve tes récompenses.','Gestion','10000032','mondstadt'],
 ['gravity','Gravité zéro','Apprivoise l’inertie et dessine ton orbite.','Physique','10000075','sumeru'],
 ['lander','Atterrissage lunaire','Dose le moteur et pose-toi en douceur.','Pilotage','10000063','liyue'],
 ['prospect','Prospection stellaire','Un peu de risque, de bons choix, du butin.','Exploration','10000036','liyue'],
 ['passport','Passeport stellaire','Les souvenirs de toutes tes parties.','Collection','10000054','inazuma']
];
const IDLE=['idle','Genshin Idle','Une équipe, des régions et des ressources qui progressent même pendant ton absence.','AVENTURE IDLE','','mondstadt'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountArcadeLobby(root){
 if(!root||root.dataset.lobbyBound)return;root.dataset.lobbyBound='1';
 const games=[IDLE,...ARCADE_GAMES],lobby=document.createElement('section'),idleHost=document.createElement('section');lobby.className='al-library';idleHost.className='arcade-idle-host';idleHost.hidden=true;
 let recent;try{recent=localStorage.getItem('astralis:arcade:last-mode')||'tetris'}catch{recent='tetris'}if(!games.some(g=>g[0]===recent))recent='tetris';
 lobby.innerHTML=`<header><span>LES JEUX D’ASTRALIS / UNE FENÊTRE SUR TEYVAT</span><h2>Un autre monde.<em>Juste le temps d’une partie.</em></h2><div><button type="button" data-al-resume>Reprendre ${esc(games.find(g=>g[0]===recent)[1])}</button><button type="button" data-al-random>Surprends-moi ↗</button></div></header><div class="al-game-grid">${games.map(([id,name,description,tag,person,region],i)=>{const landscape='/'+(ATLAS_PHOTOS['gi:'+region]||ATLAS_PHOTOS['gi:mondstadt']),src=person?'/assets/genshin/splashes/'+person+'.webp':landscape;return `<button type="button" data-al-play="${id}" class="al-game-card ${id==='idle'?'al-featured-idle':''}" style="--al-i:${i}"><div class="al-game-art" style="background-image:url('${esc(landscape)}')!important;background-size:cover!important"><img class="al-genshin-cover" src="${esc(src)}" data-al-fallback="${esc(landscape)}" alt="${person?'Illustration de personnage Genshin Impact':'Paysage de Mondstadt dans Genshin Impact'}" loading="lazy" decoding="async"><small>${id==='idle'?'IDLE':String(i).padStart(2,'0')}</small></div><span>${tag}</span><b>${name}</b><p>${description}</p><em>${id==='passport'?'Ouvrir ma collection':'Entrer dans le jeu'} <span>↗</span></em></button>`}).join('')}</div><footer>Illustrations Genshin Impact · scores et progression conservés sur cet appareil.</footer>`;
 const layout=root.querySelector('.arcade-layout');layout.before(lobby,idleHost);
 const back=document.createElement('button');back.type='button';back.className='al-back';back.textContent='← Tous les jeux';root.querySelector('.arcade-console-top').before(back);
 const pause=()=>{const b=root.querySelector('[data-arcade-pause]');if(b&&/pause/i.test(b.textContent)&&!/reprendre/i.test(b.textContent))b.click();root.dispatchEvent(new CustomEvent('arcade:modechange',{detail:{mode:'lobby'}}));};
 const returnToLobby=()=>{pause();closeIdleArcade(idleHost);root.classList.remove('arcade-idle-open');root.classList.add('arcade-lobby-open');root.querySelectorAll('[data-arcade-view]').forEach(v=>v.hidden=true);lobby.scrollIntoView({block:'start'});};
 const open=id=>{if(!games.some(g=>g[0]===id))return;pause();root.classList.remove('arcade-lobby-open');try{localStorage.setItem('astralis:arcade:last-mode',id)}catch{}recent=id;lobby.querySelector('[data-al-resume]').textContent='Reprendre '+games.find(g=>g[0]===id)[1];if(id==='idle'){root.classList.add('arcade-idle-open');openIdleArcade(idleHost,returnToLobby);idleHost.scrollIntoView({block:'start'});return;}closeIdleArcade(idleHost);root.classList.remove('arcade-idle-open');root.querySelector('[data-arcade-mode="'+id+'"]')?.click();if(id==='tetris'){const b=root.querySelector('[data-arcade-pause]');if(b&&/reprendre/i.test(b.textContent))b.click();}root.querySelector('.arcade-console').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});};
 lobby.addEventListener('error',e=>{const img=e.target;if(img.matches?.('[data-al-fallback]')&&img.getAttribute('src')!==img.dataset.alFallback)img.src=img.dataset.alFallback;},true);
 lobby.onclick=e=>{const b=e.target.closest('button');if(b?.dataset.alPlay)open(b.dataset.alPlay);else if(b?.hasAttribute('data-al-resume'))open(recent);else if(b?.hasAttribute('data-al-random')){const playable=games.filter(g=>g[0]!=='passport');open(playable[Math.floor(Math.random()*playable.length)][0]);}};
 back.onclick=returnToLobby;pause();root.classList.add('arcade-lobby-open');
}
