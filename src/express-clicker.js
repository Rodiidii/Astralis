import {industryBonuses} from './express-industry-model.js?v=20261126-portal-play-1';
import { combatStats, activeEffects } from './express-adventure-engine.js?v=20261126-portal-play-1';
import { renderAdventureClicker } from './express-adventure-view.js?v=20261126-portal-play-1';
// Economy and presentation for the expedition clicker. Bonuses belong to this
// tycoon, rather than reproducing the original games' combat multipliers.
export const REGIONS = {
 mondstadt:['Souffle de liberté','Fleur sucrante','Les moulins entraînent les récoltes de la guilde.','anemo','#8fbc78','#c66c9c','Moulins de Favonius',1,.10],
 liyue:['Contrats dorés','Cor lapis','Les comptoirs du port valorisent chaque minerai.','geo','#dfaa48','#cc7354','Comptoir de jade',1.2,.06],
 inazuma:['Orage des îles','Fleur de cerisier','Les sanctuaires canalisent la foudre des îles.','electro','#ac8bd5','#7257a0','Sanctuaire des îles',1.3,.08],
 sumeru:['Jardin du savoir','Lotus nilotpal','Les serres et les chercheurs cultivent une même découverte.','dendro','#82bf6c','#347c8e','Serre de l’Akademiya',1.25,.16],
 fontaine:['Mécanique des eaux','Romaritime','Les aqueducs alimentent les ateliers de la cité.','hydro','#7acfe0','#5666a7','Aqueduc mécanique',1.4,.12],
 natlan:['Braise des tribus','Fleur de braise','Les forges récompensent une récolte énergique.','pyro','#ef9a53','#a34c54','Forge des tribus',1.6,.08],
 'nod-krai':['Lueur des confins','Cristal lunaire','La lumière des nuits septentrionales nourrit les ateliers.','cryo','#92ced4','#44598d','Observatoire lunaire',1.5,.18],
 herta:['Jardin orbital','Fragment stellaire','Les laboratoires de la station multiplient les expériences.','quantum','#b49ce7','#465487','Laboratoire orbital',1,.14],
 jarilo:['Sous la neige','Géomœlle','Les chaudières de Belobog soutiennent la production.','cryo','#adcddd','#506b95','Chaudière de Belobog',1.2,.18],
 xianzhou:['Voiles de jade','Pousse de jade','Les jardins du Luofu accompagnent les convois.','anemo','#7bc5b0','#427876','Jardin du Luofu',1.3,.12],
 penacony:['Heure des rêves','Bulle onirique','Les hôtels de rêve donnent de l’éclat aux récoltes.','imaginary','#e1bf69','#8263a6','Atelier des rêves',1.5,.10],
 amphoreus:['Épopée dorée','Éclat d’ambroisie','Les artisans bâtissent sous une lumière mythique.','imaginary','#e4c485','#8b705e','Atelier chryséen',1.6,.14],
 planarcadia:['La grande scène','Prisme de scène','Les projecteurs rythment le travail des équipes.','quantum','#dfa0ce','#647aa5','Théâtre des étoiles',1.55,.18],
 jinzhou:['Éveil des échos','Écho résonant','Les balises de Jinzhou amplifient chaque résonance.','anemo','#94b8aa','#4c698b','Balise de Jinzhou',1,.12],
 'mt-firmament':['L’île hors du temps','Cristal de givre','Les ateliers du mont recueillent la lumière du givre.','cryo','#b0d4dc','#687fa6','Atelier du Firmament',1.35,.15],
 'black-shores':['Au bord du son','Fleur astrale','Les serres des Rivages noirs suivent les courants de données.','spectro','#a5b3da','#4b4373','Serre des Rivages',1.5,.18],
 rinascita:['Mascarade des marées','Perle de marée','Les artisans de Ragunna travaillent au rythme des canaux.','hydro','#83ccd5','#ad7c9f','Comptoir de Ragunna',1.6,.12],
 'lahai-roi':['Horizon de résonance','Noyau de relais','Les relais du territoire entretiennent un réseau de production.','electro','#93b8e4','#596f92','Relais de résonance',1.7,.15]
};
export const EFFECTS = {
 pyro:['Braise récoltante','#ff925e','Flammes',.30,.08],cryo:['Pétales de givre','#a5eaff','Cristaux',.18,.16],hydro:['Rosée généreuse','#71cfff','Bulles',.20,.14],electro:['Surtension','#c0a0ff','Éclairs',.26,.10],dendro:['Germination','#a7dc68','Feuilles',.16,.20],anemo:['Vent porteur','#8fe1c7','Spirales',.22,.14],geo:['Contrat minéral','#f3ce77','Éclats',.32,.06],quantum:['Floraison quantique','#c3a5ff','Prismes',.24,.12],imaginary:['Lueur imaginaire','#ffe09b','Rayons',.28,.08],spectro:['Résonance lumineuse','#eee4a1','Rayons',.20,.18],havoc:['Onde de chaos','#ec96bc','Fractures',.30,.10],physical:['Élan des voyageurs','#d0dce6','Étincelles',.20,.12]
};
export function elementOf(p){const s=String(p?.elementText||p?.element||p?.damageType||'').toLowerCase();for(const [key,re] of Object.entries({pyro:/pyro|fire|fusion/,cryo:/cryo|ice|glacio/,hydro:/hydro|water/,electro:/electro|lightning|électro/,dendro:/dendro/,anemo:/anemo|wind|aero|anémo/,geo:/geo|géo/,quantum:/quantum/,imaginary:/imaginary/,spectro:/spectro/,havoc:/havoc/}))if(re.test(s))return key;return 'physical'}
export const TRACKS=[['click','Geste précis','Puissance du clic',20],['auto','Atelier automatisé','Production automatique',45],['combo','Cadence parfaite','Bonus de série',75],['fortune','Récolte dorée','Récolte exceptionnelle',140]];
export const TIERS=['Apprenti','Artisan','Expert','Maître','Virtuose','Légendaire','Mythique','Astral'];
const SIGNATURES={
 amber:['Escorte du Baron Lapin','Braises'],kaeya:['Valse des pétales gelés','Glaçons'],lisa:['Récolte sous tension','Arcs violets'],barbara:['Chœur de la rosée','Notes et bulles'],
 nahida:['Jardin des rêves','Graines lumineuses'],furina:['Salon des merveilles','Bulles de spectacle'],zhongli:['Contrat de prospérité','Fragments de jade'],raiden:['Éclair de l’éternité','Traits de foudre'],raidenshogun:['Éclair de l’éternité','Traits de foudre'],
 venti:['Ballade des récoltes','Courants de vent'],kazuha:['Feuilles dans la brise','Feuilles tournoyantes'],kaedeharakazuha:['Feuilles dans la brise','Feuilles tournoyantes'],neuvillette:['Marée d’abondance','Gouttes anciennes'],
 klee:['Jardin explosif','Étincelles rouges'],diluc:['Aube écarlate','Plumes de feu'],bennett:['Une récolte chanceuse','Étincelles dorées'],sucrose:['Expérience fertile','Spirales vertes'],xiao:['Danse des nuages','Vents de jade'],
 skirk:['Reflets du vide','Éclats abyssaux'],ayaka:['Cerisier de givre','Pétales cristallins'],kamisatoayaka:['Cerisier de givre','Pétales cristallins'],ganyu:['Rosée des montagnes','Cristaux de rosée'],
 mavuika:['Soleil des tribus','Flammes solaires'],xilonen:['Rythme des artisans','Pulsations dorées'],alhaitham:['Prismes du savoir','Miroirs verts'],tighnari:['Botanique de terrain','Pousses'],nilou:['Ronde des lotus','Fleurs aquatiques'],
 himeko:['Café sous les étoiles','Braises stellaires'],asta:['Observatoire productif','Étoiles filantes'],danheng:['Lance du vent','Spirales de jade'],march7th:['Souvenir de givre','Cristaux roses'],
 kafka:['Fil de récolte','Fils violets'],seele:['Papillons du crépuscule','Papillons'],bronya:['Marche des artisans','Rafales d’argent'],welt:['Orbites du jardin','Prismes sombres'],sparkle:['Mascarade scintillante','Confettis'],
 yangyang:['Plumes dans le vent','Plumes'],jiyan:['Souffle du dragon','Courants de jade'],verina:['Serre de lumière','Jeunes feuilles'],changli:['Plumes de braise','Plumes ardentes'],jinhsi:['Résonance céleste','Rayons blancs'],
 camellya:['Racines du crépuscule','Pétales pourpres'],shorekeeper:['Papillons des Rivages','Papillons bleus'],carlotta:['Éclats de marée','Cristaux'],yinlin:['Fil conducteur','Arcs de foudre'],baizhi:['Écho de cristal','Cristaux de glace']
};
export function initialize(s){s.clicker??={};const c=s.clicker;c.upgrades??={};c.regionClicks??={};c.energy??={};c.cooldowns??={};c.effects??={};c.totalEarned??=0;c.lastGain??=0;c.lastCritical??=false;return c}
export function profile(p,key){const el=elementOf(p),e=EFFECTS[el];let hash=0;for(const ch of key)hash=(hash*31+ch.charCodeAt(0))>>>0;const named=p?.signature?[p.signature,p.motifs]:SIGNATURES[key]||[`${e[0]} · ${String(p?._name||p?.name||'Voyageur')}`,e[2]];return {el,color:p?.effectColor||e[1],name:named[0],particles:named[1],click:e[3]+(hash%5)*.02,auto:e[4]+(hash%4)*.02,duration:20+(hash%4)*5,cooldown:40+(hash%3)*5,burst:8+hash%9,signature:hash%360,visual:/papillon/i.test(named[1])?'butterfly':/note/i.test(named[1])?'notes':/plume/i.test(named[1])?'feather':/graine|pousse/i.test(named[1])?'seed':'element'}}
export function region(s){return REGIONS[s.place]||REGIONS[s.world==='hsr'?'herta':s.world==='ww'?'jinzhou':'mondstadt']}
export function upgrades(s,type){return initialize(s).upgrades[`${s.world}:${s.place}:${type}`]||0}
export function price(s,type){const track=TRACKS.find(t=>t[0]===type);return Math.ceil(track[3]*Math.pow(3.4,upgrades(s,type)))}
export function economy(s,p,key,now=Date.now()){
 const stats=combatStats(s,p,key),c=initialize(s),team={entries:activeEffects(s,now),click:0,auto:0,crit:0},r=region(s),kit=profile(p,key),active=c.effects[s.world],on=active&&active.until>now,boost=on?active.power:0;
 const industry=industryBonuses(s,key,p);const clickUpgrade=Math.pow(2,upgrades(s,'click')),autoUpgrade=Math.pow(2,upgrades(s,'auto'));const level=Number(s.characters.levels[key]||1),training=1+(level-1)*.02;
 const combo=1+Math.min(s.combo||0,25)*(.01+upgrades(s,'combo')*.005),prestige=1+(s.prestiges||0)*.10;
 return {click:industry.click*r[7]*(stats.atk/100)*(1+kit.click)*(1+boost)*(1+team.click)*clickUpgrade*combo*prestige*training,auto:(1+r[8]+kit.auto)*(1+boost)*(1+team.auto)*autoUpgrade*prestige*training,training,critChance:Math.min(.95,stats.crit+upgrades(s,'fortune')*.02),critPower:1+stats.critDmg+upgrades(s,'fortune')*.1,kit,team,active:on?active:null,combo,r,clickUpgrade,autoUpgrade};
}
export function renderClicker(s,people,h){initialize(s);return renderAdventureClicker(s,people,{...h,economy,tracks:TRACKS,upgrades,price});}
