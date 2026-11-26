import { powerProfile } from './express-power-profiles.js?v=20261124-expedition-3';

export const RESEARCH={
 might:{name:'Force des pionniers',description:'ATQ de tous les compagnons ×1,25 par rang.',base:90,factor:1.65},
 haste:{name:'Horlogerie fine',description:'+3 VIT à tous les compagnons par rang.',base:140,factor:1.8},
 recharge:{name:'Circuits d’énergie',description:'+6 % de recharge par rang.',base:110,factor:1.7},
 resonance:{name:'Chœur des compagnons',description:'Résonances automatiques +20 % de dégâts par rang.',base:180,factor:1.8},
 mastery:{name:'Maîtrise des ultimes',description:'Dégâts d’ultime ×1,15 par rang.',base:200,factor:1.8},
 treasure:{name:'Prospection avancée',description:'Récompenses des vagues ×1,2 par rang.',base:100,factor:1.65},
 protection:{name:'Bastion du groupe',description:'Boucliers et soins +12 % par rang.',base:120,factor:1.7},
 precision:{name:'Visée lumineuse',description:'+1 % de taux CRIT et +6 % de DGT CRIT par rang.',base:150,factor:1.85},
 training:{name:'Académie des voyageurs',description:'+20 % d’XP de combat par rang.',base:130,factor:1.8},
 relics:{name:'Trésors oubliés',description:'Stats du nouveau butin +15 % par rang.',base:160,factor:1.8}
};
const ROLE_PASSIVES={
 healer:['Mains bienveillantes','Soins et boucliers +25 %.',{support:.25}],
 shield:['Rempart fidèle','Soins et boucliers +25 %.',{support:.25}],
 battery:['Réserve partagée','Recharge personnelle +25 %.',{er:.25}],
 speed:['Tempo virtuose','VIT personnelle +18.',{spd:18}],
 time:['Instants suspendus','VIT personnelle +18.',{spd:18}],
 critical:['Point faible','Taux CRIT +10 %.',{crit:.1}],
 fortune:['Main heureuse','Récompenses des cibles vaincues +25 %.',{treasure:.25}],
 summoner:['Liens persistants','ATQ personnelle ×1,3.',{attack:1.3}],
 dot:['Patience venimeuse','ATQ personnelle ×1,3.',{attack:1.3}],
 inspirer:['Présence rassurante','ATQ personnelle ×1,3 ; renforce aussi ses encouragements.',{attack:1.3}],
 execute:['Coup décisif','DGT CRIT +40 %.',{critDmg:.4}],
 stance:['Puissance éveillée','Dégâts d’ultime +35 %.',{ultimate:.35}],
 assault:['Frappe souveraine','Dégâts d’ultime +35 %.',{ultimate:.35}],
 control:['Brèche préparée','Recharge personnelle +25 %.',{er:.25}],
 combo:['Relais sans faille','VIT personnelle +18.',{spd:18}],
 mark:['Empreinte durable','ATQ personnelle ×1,3.',{attack:1.3}],
 space:['Faille profonde','DGT CRIT +40 %.',{critDmg:.4}]
};
export function progression(s){s.clicker??={};s.clicker.progression??={};return s.clicker.progression[s.world]??={research:{},heroes:{}};}
export function heroProgress(s,key){const w=progression(s);w.heroes??={};return w.heroes[key]??={xp:0,ascensions:0};}
export const heroLevel=(s,key)=>Math.max(1,Math.min(1000,Number(s.characters?.levels?.[key])||1));
export function rarityOf(p){if(p?.lore)return 6;const n=Number(p?.rarity||p?.rank||p?.star||p?.quality||0);return n>=5?5:n===4?4:4;}
export function heroRarity(s,p,key){return Math.min(6,rarityOf(p)+(heroProgress(s,key).ascensions||0));}
export const rarityName=n=>n>=6?'Mythique':n===5?'Légendaire':'Épique';
export function passivesFor(p,key,world){const role=powerProfile(p,key,world).role,signature=ROLE_PASSIVES[role]||ROLE_PASSIVES.assault;return [
 {level:5,name:'Première étincelle',description:'ATQ ×1,2.',bonus:{attack:1.2}},
 {level:10,name:signature[0],description:signature[1],bonus:signature[2]},
 {level:20,name:'Réserve éveillée',description:'Recharge +20 %.',bonus:{er:.2}},
 {level:35,name:'Élan du compagnon',description:'VIT +15 et DGT CRIT +20 %.',bonus:{spd:15,critDmg:.2}},
 {level:50,name:'Éclat de destinée',description:'ATQ ×1,5 et taux CRIT +5 %.',bonus:{attack:1.5,crit:.05}},
 {level:75,name:'Signature accomplie',description:signature[1],bonus:signature[2]},
 {level:100,name:'Au-delà des limites',description:'ATQ ×2 et dégâts d’ultime +50 %.',bonus:{attack:2,ultimate:.5}}
 ];}
export function progressionBonuses(s,key,p){
 const w=progression(s),r=w.research||{},level=heroLevel(s,key),hero=heroProgress(s,key),bonus={attack:Math.pow(1.065,level-1)*Math.pow(1.25,r.might||0)*Math.pow(1.4,hero.ascensions||0),spd:3*(r.haste||0),er:.06*(r.recharge||0),crit:.01*(r.precision||0),critDmg:.06*(r.precision||0),ultimate:Math.pow(1.15,r.mastery||0),support:1+.12*(r.protection||0),treasure:Math.pow(1.2,r.treasure||0)};
 for(const passive of passivesFor(p,key,s.world).filter(x=>x.level<=level))for(const [k,v] of Object.entries(passive.bonus))if(k==='attack')bonus.attack*=v;else bonus[k]=(bonus[k]||0)+v;
 return bonus;
}
export function researchPrice(s,id){const r=RESEARCH[id];return r?Math.ceil(r.base*Math.pow(r.factor,Math.min(300,progression(s).research[id]||0))):Infinity;}
export function buyResearch(s,id,balance){const cost=researchPrice(s,id);if(balance<cost||!Number.isFinite(cost))return 0;const w=progression(s);if((w.research[id]||0)>=300)return 0;w.research[id]=(w.research[id]||0)+1;return cost;}
export const nextXP=(s,key)=>Math.ceil(5*Math.pow(1.045,heroLevel(s,key)-1));
export function awardHeroXP(s,keys,amount){let unlocked=[];for(const key of keys){const h=heroProgress(s,key);h.xp+=amount*(1+.2*(progression(s).research.training||0));let guard=0;while(h.xp>=nextXP(s,key)&&heroLevel(s,key)<1000&&guard++<1000){h.xp-=nextXP(s,key);s.characters.levels??={};s.characters.levels[key]=heroLevel(s,key)+1;unlocked.push({key,level:s.characters.levels[key]});}}return unlocked;}
export function trainingCost(s,key,count=1){let money=0,xp=0;const n=Math.max(1,Math.min(25,Number(count)||1)),level=heroLevel(s,key);for(let i=0;i<n&&level+i<1000;i++){money+=Math.ceil(12*Math.pow(1.13,level+i-1));xp+=2+Math.floor((level+i-1)/10);}return {money,xp,count:Math.min(n,1000-level)};}
export function trainHero(s,key,balance,count=1){if(!s.characters.owned.includes(key))return null;const cost=trainingCost(s,key,count);if(!cost.count||cost.money>balance||cost.xp>(s.xp||0))return null;s.xp-=cost.xp;s.characters.levels??={};s.characters.levels[key]=heroLevel(s,key)+cost.count;return cost;}
export function ascensionCost(s,key){const n=heroProgress(s,key).ascensions||0;return {level:20+n*30,shards:30*Math.pow(3,n),money:500*Math.pow(6,n)};}
export function ascendHero(s,p,key,balance,shards){const cost=ascensionCost(s,key);if(heroRarity(s,p,key)>=6||heroLevel(s,key)<cost.level||balance<cost.money||shards<cost.shards)return null;heroProgress(s,key).ascensions++;return cost;}
export function recruitPrice(p){return p?.lore?1200:rarityOf(p)>=5?360:120;}
export function dialogueFor(p,key,world,kind='resonance'){
 const kit=powerProfile(p,key,world),role=kit.role;
 const personal={
  'gi:ronova':'Toute vie a son terme. Pour cette épreuve, l’ombre sera de notre côté.',
  'gi:istaroth':'Écoute les secondes. Elles gardent la trace de tous nos possibles.',
  'gi:naberius':'Un germe suffit. Laissons ce petit monde grandir.',
  'gi:asmoday':'L’espace qui nous séparait vient de se refermer.',
  'gi:capitano':'Une promesse mérite qu’on tienne le front jusqu’au bout.',
  'gi:dainsleif':'Les traces du passé ne décideront pas seules de notre avenir.',
  'hsr:obsidian':'Portons un toast à ce qui nous attend dans l’ombre.',
  'gi:10000006':'Une petite expérience, et cette affaire sera réglée.',
  'gi:10000021':'Le Baron Lapin et moi, on prend les devants !',
  'gi:10000015':'Un peu de sang-froid. La prochaine ouverture est pour nous.',
  'gi:10000014':'Encore un refrain, et tout le monde retrouve le sourire !',
  'gi:10000030':'Un contrat se construit sur une fondation qui ne cède pas.',
  'gi:10000089':'Lève le rideau ! Notre expédition mérite une entrée mémorable.',
  'gi:10000073':'Chaque rencontre est une graine de savoir.',
  'gi:10000114':'La lame trace son chemin. Garde les yeux sur la faille.',
  'hsr:1408':'Cette fois encore, je porterai notre lendemain.',
  'hsr:1005':'Laissons cette petite note résonner un peu plus longtemps.',
  'hsr:1309':'Accordons nos voix. Le prochain mouvement commence.',
  'ww:1402':'Le vent a changé. Il nous ouvre un passage.',
  'ww:1404':'Gardons la formation. Personne ne restera en arrière.',
  'ww:1505':'Je suivrai ta lumière, même au-delà de ce rivage.'
 };
 const lines={healer:'Respire. Je veille sur notre équipe.',shield:'Reste près de moi. Nous tiendrons bon.',battery:'L’énergie circule. Prépare ton prochain ultime.',speed:'Trouvons notre rythme !',time:'Chaque instant peut changer notre route.',critical:'Une ouverture. C’est le moment.',fortune:'Un autre trésor nous attend.',summoner:'Mes alliés et moi prenons le relais.',dot:'Patience. L’effet fait son chemin.',inspirer:'Ensemble, nous pouvons aller plus loin.',execute:'Je vais mettre fin à cette épreuve.',stance:'Voici ce que je peux vraiment accomplir.',assault:'Toute ma force dans cette frappe !',control:'Le terrain est à nous.',combo:'À toi de jouer !',mark:'La cible est marquée. À nous de conclure.',space:'Ouvrons un nouveau passage.'};
 return kind==='recruit'?'Je rejoins ton expédition. Allons découvrir ce monde.':kind==='level'?'Ma force grandit. Une nouvelle étape nous attend.':personal[kit.id]||lines[role]||lines.assault;
}
