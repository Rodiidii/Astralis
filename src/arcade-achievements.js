const STORAGE_KEY='astralis:arcade:achievements:v1';

export const ARCADE_ACHIEVEMENTS=[
  {id:'first-line',icon:'✦',title:'Première étincelle',hint:'Compléter une ligne au Tetris.'},
  {id:'score-500',icon:'☄',title:'Cartographe du ciel',hint:'Atteindre 500 points au Tetris.'},
  {id:'lines-20',icon:'✧',title:'Voie lactée',hint:'Compléter 20 lignes au total dans une partie.'},
  {id:'dodge-10',icon:'◇',title:'Pilote du vide',hint:'Survivre 10 secondes aux astéroïdes.'},
  {id:'dodge-30',icon:'✺',title:'Chasseur d’étoiles',hint:'Survivre 30 secondes aux astéroïdes.'},
  {id:'dodge-60',icon:'♆',title:'Au-delà des étoiles',hint:'Survivre 60 secondes aux astéroïdes.'},
  {id:'memory-win',icon:'☼',title:'Mémoire stellaire',hint:'Associer les huit paires du mémory.'},
  {id:'memory-quick',icon:'✧',title:'Esprit de l’Express',hint:'Terminer le mémory en 20 coups ou moins.'},
  {id:'reaction-500',icon:'⚗',title:'Réaction en chaîne',hint:'Marquer 500 points dans le puzzle élémentaire.'},
  {id:'reaction-chain',icon:'✺',title:'Alchimiste stellaire',hint:'Déclencher une chaîne de quatre réactions.'},
  {id:'rhythm-90',icon:'♫',title:'Chef de convoi',hint:'Finir un morceau avec au moins 90 % de précision.'},
  {id:'rhythm-perfect',icon:'♬',title:'Tempo absolu',hint:'Réussir les 18 pulsations sans faute.'},
  {id:'pinball-first-bumper',icon:'◉',title:'Première collision',hint:'Toucher un bumper au flipper astral.'},
  {id:'pinball-score-5000',icon:'✦',title:'Orbite parfaite',hint:'Marquer 5 000 points au flipper astral.'},
  {id:'pinball-daily',icon:'♆',title:'Maître du cosmos',hint:'Atteindre l’objectif quotidien au flipper astral.'}
  ,{id:'path-first',icon:'⌁',title:'Cartographe des étoiles',hint:'Terminer un tracé stellaire quotidien.'}
  ,{id:'path-quick',icon:'✧',title:'Trait de lumière',hint:'Réussir un tracé avec un score de 900 points ou plus.'}
  ,{id:'arena-first-win',icon:'⚔',title:'Tacticien astral',hint:'Vaincre un boss dans l’arène des échos.'}
];

export function readArcadeAchievements(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return{}}}

export function unlockArcadeAchievement(id,root=document.querySelector('[data-astral-arcade]')){
  const achievement=ARCADE_ACHIEVEMENTS.find(item=>item.id===id);if(!achievement)return false;
  const saved=readArcadeAchievements();if(saved[id])return false;
  saved[id]=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved))}catch{return false;}
  root?.dispatchEvent(new CustomEvent('astral:achievement-unlocked',{detail:{id}}));return true;
}
