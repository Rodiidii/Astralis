export const THEME_STUDIO_KEY = 'astralis:theme-studio:v1';
const groups = [];
function group(id, label, rows) { groups.push({id,label,fields:rows.map(([key,label,type,value,min,max,step,options])=>({key,label,type,value,min,max,step,options,group:id}))}); }
const r=(key,label,value,min,max,step=1)=>[key,label,'range',value,min,max,step];
const b=(key,label,value)=>[key,label,'toggle',value];
const s=(key,label,value,options)=>[key,label,'select',value,0,0,1,options];
group('palette','Couleurs',[
 ['background','Fond général','color','#0c1019'],['surface','Surface principale','color','#151b27'],['surface2','Surface secondaire','color','#222b3a'],['ink','Texte principal','color','#f4f2ed'],['muted','Texte secondaire','color','#b5bfd0'],['accent','Accent principal','color','#e8c788'],['secondary','Accent secondaire','color','#a992ff'],['line','Bordures','color','#414d60'],['success','Réussite','color','#83d8ae'],['warning','Avertissement','color','#f0ca7a'],['danger','Erreur et suppression','color','#ff91a2'],['link','Liens','color','#a9caff'],['selection','Sélection du texte','color','#51466f'],['focus','Contour du clavier','color','#d7c9ff'],['overlay','Voile des modales','color','#070910'],['scrollbar','Barre de défilement','color','#8f79df'],
]);
group('layout','Espace et disposition',[
 r('maxWidth','Largeur du contenu',1660,720,2200,20),r('pagePadding','Marges de la page',32,8,72),r('sectionGap','Espace entre sections',30,8,64),r('railWidth','Largeur du menu',254,190,330),r('topHeight','Hauteur de la barre du haut',76,56,112),r('gridGap','Espacement des grilles',20,4,40),r('panelPadding','Marges des panneaux',26,8,48),r('modalWidth','Largeur des fenêtres',720,320,1100,20),r('modalPadding','Marges des fenêtres',28,12,48),r('readingWidth','Largeur des paragraphes',76,35,110),
]);
group('type','Typographie',[
 s('bodyFont','Police du texte','system',[['system','Système'],['inter','Inter'],['serif','Georgia'],['mono','Monospace']]),s('titleFont','Police des titres','inter',[['system','Système'],['inter','Inter'],['serif','Georgia'],['mono','Monospace']]),r('bodySize','Taille du texte',14,12,20),r('titleSize','Échelle des titres',1,0.8,1.5,.05),r('bodyWeight','Graisse du texte',400,300,700,100),r('titleWeight','Graisse des titres',700,400,900,100),r('lineHeight','Interligne',1.55,1.2,2,.05),r('letterSpacing','Espacement du texte',0,-.3,1.5,.1),r('titleTracking','Espacement des titres',-.5,-1.5,3,.1),r('navSize','Taille des libellés du menu',13,11,18),
]);
group('surfaces','Surfaces et commandes',[
 r('radius','Arrondi des panneaux',20,0,40),r('borderWidth','Épaisseur des bordures',1,0,3,.5),r('shadow','Ombre des panneaux',30,0,70),r('blur','Flou des surfaces',16,0,32),r('opacity','Opacité des surfaces',96,50,100),r('buttonRadius','Arrondi des boutons',13,0,32),r('buttonHeight','Hauteur des boutons',42,30,60),r('inputHeight','Hauteur des champs',44,30,64),r('inputRadius','Arrondi des champs',12,0,28),r('focusWidth','Épaisseur du focus clavier',2,1,5),
]);
group('navigation','Navigation',[
 r('railOpacity','Opacité du menu',98,50,100),r('activeGlow','Halo de la page active',22,0,40),r('navIcon','Taille des icônes du menu',21,14,32),r('navGap','Écart entre les entrées',6,0,16),r('navHeight','Hauteur des entrées',44,32,64),r('navWeight','Graisse du menu',600,400,800,100),r('dividerOpacity','Visibilité des séparateurs',52,0,100),r('topBlur','Flou de la barre supérieure',18,0,40),r('breadcrumbOpacity','Visibilité du fil de navigation',86,25,100),r('pinnedSize','Taille des raccourcis',40,26,56),
]);
group('cards','Cartes et tableaux',[
 r('cardRadius','Arrondi des cartes',18,0,36),r('cardPadding','Marges des cartes',19,8,36),r('cardGap','Écart interne des cartes',13,4,28),r('hoverLift','Élévation au survol',4,0,12),r('imageBrightness','Luminosité des images',102,50,140),r('imageSaturation','Saturation des images',112,0,180),r('imageContrast','Contraste des images',105,60,150),r('hoverZoom','Zoom des images au survol',1.035,1,1.12,.005),r('badgeRadius','Arrondi des badges',9,0,24),r('tableRow','Hauteur des lignes de tableau',46,30,72),
]);
group('motion','Animations',[
 r('duration','Durée des transitions',240,0,900,10),r('entrance','Durée d’apparition des pages',420,0,1600,20),r('stagger','Décalage d’apparition des cartes',28,0,150,5),r('drift','Vitesse de déplacement du décor',32,10,120),b('pulse','Respiration du halo',true),b('ripple','Ondes au clic',true),b('particles','Particules flottantes',true),b('sparkle','Lueur sur les accents',true),b('parallax','Décor réactif au pointeur',true),r('hoverRotate','Inclinaison au survol',0,0,3,.1),
]);
group('ambience','Ambiance du personnage',[
 r('artOpacity','Présence de l’illustration',14,0,55),r('artBlur','Flou de l’illustration',1,0,25),r('artScale','Zoom de l’illustration',1,1,1.8,.05),r('artX','Position horizontale',85,0,100),r('artY','Position verticale',35,0,100),r('vignette','Ombre sur les bords',35,0,85),r('grain','Texture du fond',2,0,15),r('motifOpacity','Présence des motifs du personnage',12,0,40),r('starCount','Nombre de particules',12,0,40),r('gradientAngle','Direction du dégradé',135,0,360,5),
]);
group('details','Finitions',[
 r('glowSize','Étendue du halo',500,100,900,10),r('glowOpacity','Intensité du halo',21,0,50),r('scrollWidth','Largeur du défilement',8,3,16),r('scrollRadius','Arrondi du défilement',8,0,16),r('selectionOpacity','Intensité de sélection',86,20,100),r('focusOffset','Distance du focus clavier',3,0,8),r('progressHeight','Épaisseur de progression',6,2,16),r('avatarRadius','Arrondi des portraits du compagnon',50,0,50),r('tooltipOpacity','Opacité des infobulles',98,60,100),r('dialogBackdrop','Intensité du voile des fenêtres',68,10,95),
]);
group('companion','Compagnon du thème',[
 b('companionEnabled','Invoquer le personnage du thème',true),r('talkEvery','Intervalle entre les interventions (secondes)',100,20,600,10),r('bubbleTime','Durée d’une bulle (secondes)',14,4,45),r('companionScale','Taille du compagnon',64,36,110),s('companionSide','Position du compagnon','right',[['right','À droite'],['left','À gauche']]),b('companionText','Afficher les bulles',true),b('voiceEnabled','Lire avec la voix du navigateur',false),b('greeting','Message à l’ouverture',true),b('contextLines','Commentaires selon la page',true),b('helpTips','Conseils pratiques',true),r('voicePitch','Hauteur de la voix',1,.5,1.7,.1),r('voiceRate','Vitesse de la voix',1,.6,1.6,.1),r('voiceVolume','Volume de la voix',65,0,100),b('companionQuiet','Discrétion pendant une session',true),
]);
group('audio','Musique et sons',[
 b('audioEnabled','Ambiance après le premier clic',true),r('musicVolume','Volume de la musique',25,0,100),s('ambientTone','Ambiance de secours','identity',[['identity','Selon le personnage'],['celestial','Céleste'],['forest','Forêt'],['ocean','Océan'],['ember','Braise'],['silence','Silence']]),r('lowpass','Douceur de l’ambiance de secours (Hz)',850,200,2500,50),r('detune','Largeur de l’ambiance de secours',4,0,20),b('musicLoop','Boucler la piste',true),r('audioFade','Fondu sonore (secondes)',2,0,8,.5),b('pauseHidden','Suspendre le son en arrière-plan',true),b('clickChime','Son discret au clic',false),r('chimeVolume','Volume du son au clic',10,0,50),
]);
export const THEME_GROUPS=groups;
export const THEME_FIELDS=groups.flatMap(g=>g.fields);
export const THEME_DEFAULTS=Object.fromEntries(THEME_FIELDS.map(f=>[f.key,f.value]));
const DEFAULT_REVISION_KEY='astralis:theme-studio-default-revision';
const PREVIOUS_DEFAULTS={background:'#11161d',surface:'#1a222c',surface2:'#242e39',ink:'#edf2f8',muted:'#a8b5c6',accent:'#98b5ef',secondary:'#cdb3e9',line:'#3c4858',success:'#8ed2ad',warning:'#e9c887',danger:'#f0a3ad',link:'#b6cffe',selection:'#3c5679',focus:'#c1d9ff',overlay:'#080b10',scrollbar:'#62758e',maxWidth:1600,pagePadding:28,sectionGap:26,railWidth:248,gridGap:18,panelPadding:24,modalWidth:680,modalPadding:26,radius:22,shadow:24,blur:14,opacity:94,buttonRadius:12,buttonHeight:40,inputHeight:42,railOpacity:96,activeGlow:14,navIcon:20,navGap:5,navHeight:42,dividerOpacity:40,breadcrumbOpacity:80,pinnedSize:38,cardPadding:18,cardGap:12,hoverLift:3,imageBrightness:100,imageSaturation:105,imageContrast:100,hoverZoom:1.025,badgeRadius:8,tableRow:44,duration:220,entrance:480,stagger:35,drift:30,sparkle:false,glowSize:450,glowOpacity:16,scrollWidth:7,selectionOpacity:80,tooltipOpacity:97,dialogBackdrop:65};
const DYNAMIC_DEFAULTS=new Set(['accent','secondary']);
export const THEME_PRESETS={
 signature:{label:'Signature',description:'Les couleurs du personnage, une présence douce.',values:{artOpacity:18,motifOpacity:16,glowOpacity:19,particles:true,pulse:true}},
 atelier:{label:'Atelier',description:'Lisible, net et calme pour préparer ses objectifs.',values:{artOpacity:3,motifOpacity:3,particles:false,pulse:false,shadow:6,radius:12,railOpacity:100,pagePadding:32}},
 cinema:{label:'Cinéma',description:'Illustration ample, halos et apparitions lentes.',values:{artOpacity:32,artScale:1.15,artBlur:0,vignette:65,glowOpacity:28,entrance:800,drift:55,pagePadding:36}},
 glass:{label:'Verre',description:'Surfaces translucides et couleurs diffuses.',values:{opacity:72,railOpacity:78,blur:25,topBlur:28,radius:26,artOpacity:24,glowOpacity:25}},
 paper:{label:'Carnet',description:'Un carnet clair aux accents du personnage.',values:{background:'#eae7df',surface:'#f7f4ed',surface2:'#e1ddd3',ink:'#252f37',muted:'#52606b',line:'#b2b4b4',titleFont:'serif',artOpacity:5,particles:false,grain:4,shadow:4}},
 neon:{label:'Néon',description:'Contrastes nocturnes et accents lumineux.',values:{background:'#070b14',surface:'#101729',surface2:'#1c2540',glowOpacity:32,activeGlow:28,sparkle:true,motifOpacity:22,radius:14}},
 zen:{label:'Zen',description:'Du silence et de grands espaces.',values:{pagePadding:44,sectionGap:40,gridGap:26,artOpacity:7,particles:false,pulse:false,companionEnabled:false,duration:300,entrance:400}},
 compact:{label:'Stratégie',description:'Une interface dense, avec des repères nets.',values:{bodySize:13,navHeight:36,railWidth:220,panelPadding:16,gridGap:12,cardPadding:12,tableRow:34,radius:12,artOpacity:4,particles:false}},
 accessible:{label:'Lecture',description:'Texte large, focus marqué et mouvements réduits.',values:{bodySize:17,lineHeight:1.8,focusWidth:4,focusOffset:4,duration:0,entrance:0,particles:false,parallax:false,pulse:false,sparkle:false,artOpacity:3}},
 dream:{label:'Rêverie',description:'Une atmosphère vivante aux mouvements légers.',values:{artOpacity:22,particles:true,starCount:26,drift:60,pulse:true,motifOpacity:20,glowSize:650,radius:28,entrance:700}},
};
export function normalizeThemeValues(values={}){
 const result={};for(const f of THEME_FIELDS){if(!Object.hasOwn(values,f.key))continue;const v=values[f.key];if(f.type==='color'&&/^#[0-9a-f]{6}$/i.test(v))result[f.key]=v;if(f.type==='toggle'&&typeof v==='boolean')result[f.key]=v;if(f.type==='range'&&Number.isFinite(Number(v)))result[f.key]=Math.min(f.max,Math.max(f.min,Number(v)));if(f.type==='select'&&f.options.some(([id])=>id===v))result[f.key]=v;}return result;
}
export function readThemeStudio(storage=globalThis.localStorage){
 let data;try{data=validateThemeStudio(JSON.parse(storage.getItem(THEME_STUDIO_KEY)||'{}'));}catch{return {version:1,global:{},characters:{},presets:[]};}
 try{if(storage.getItem(DEFAULT_REVISION_KEY)!=='2'){
  let changed=false;const update=values=>{for(const [key,oldValue]of Object.entries(PREVIOUS_DEFAULTS)){if(values[key]!==oldValue)continue;if(DYNAMIC_DEFAULTS.has(key))delete values[key];else values[key]=THEME_DEFAULTS[key];changed=true;}};
  update(data.global);for(const values of Object.values(data.characters))update(values);
  if(changed)storage.setItem(THEME_STUDIO_KEY,JSON.stringify(data));storage.setItem(DEFAULT_REVISION_KEY,'2');
 }}catch{/* Le thème reste lisible si le stockage local est plein ou verrouillé. */}
 return data;
}
export function validateThemeStudio(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Thème invalide.');
 const characters={};for(const [id,value]of Object.entries(raw.characters||{}).slice(0,500))if(/^(gi|hsr|ww):[^<>]{1,100}$/.test(id))characters[id]=normalizeThemeValues(value);
 const presets=(Array.isArray(raw.presets)?raw.presets:[]).slice(0,50).filter(p=>p&&typeof p.name==='string').map(p=>({id:String(p.id||p.name).slice(0,80),name:p.name.slice(0,60),values:normalizeThemeValues(p.values)}));
 return {version:1,global:normalizeThemeValues(raw.global),characters,presets};
}
export function themeValues(data,key,identity,base={}){
 const palette=identity?{accent:identity.accent,secondary:identity.secondary,link:identity.accent,focus:identity.secondary,background:mix(identity.accent,'#080d15',.12),surface:mix(identity.accent,'#151c26',.16),surface2:mix(identity.secondary,'#222b37',.20),line:mix(identity.accent,'#3a4350',.34)}:{};
 const atmosphere={eclipse:{vignette:58,artOpacity:19,starCount:16,gradientAngle:165},clockwork:{drift:55,grain:1,motifOpacity:19,gradientAngle:110},botanical:{drift:48,grain:3,motifOpacity:17,gradientAngle:145},lattice:{drift:25,motifOpacity:20,gradientAngle:45},heraldic:{vignette:45,particles:false,artOpacity:16},constellation:{starCount:26,glowOpacity:21,drift:65},gothic:{vignette:55,artOpacity:21,gradientAngle:170},theatre:{glowSize:650,glowOpacity:22,artOpacity:20}}[identity?.family]||{};
 const result={...THEME_DEFAULTS,...base,...palette,...atmosphere,...data.global,...(data.characters[key]||{})};
 if(/^#[\da-f]{6}$/i.test(result.background)&&[1,3,5].reduce((sum,i)=>sum+parseInt(result.background.slice(i,i+2),16),0)>540){for(const field of ['accent','secondary','link','focus'])if(!Object.hasOwn(data.global,field)&&!Object.hasOwn(data.characters[key]||{},field))result[field]=mix(result[field],'#18252d',.18);}
 return result;
}
export function mix(a,b,weight=.5){if(!/^#[\da-f]{6}$/i.test(a||''))return b;const nums=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*weight+parseInt(b.slice(i,i+2),16)*(1-weight)));return '#'+nums.map(n=>n.toString(16).padStart(2,'0')).join('');}
