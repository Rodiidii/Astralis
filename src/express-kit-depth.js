import { powerProfile } from './express-power-profiles.js?v=20261124-expedition-3';

// Extra rules for the Astralis game: these are playable adaptations, not the
// official games' coefficients. Each action has an executable engine path.
const ROLES={
 assault:['Élan',100,60,15,4,3.8,'breaker','Percée','Le dernier coup du cycle entame fortement la garde. La chargée est plus puissante contre une cible en rupture.'],
 stance:['Ferveur',100,50,15,5,3.4,'stance','Attaques déchaînées','En transformation, le cycle devient plus court. La chargée prolonge la transformation de 3 s.'],
 summoner:['Liens',6,4,1,4,2.2,'summon','Appel coordonné','Le dernier coup du cycle appelle une frappe de l’invocation. La chargée renforce son prochain assaut.'],
 healer:['Douceur',6,3,1,4,1.8,'heal','Vague bienveillante','Le dernier coup soigne. La chargée soigne davantage ; les soins excédentaires deviennent un bouclier.'],
 shield:['Rempart',6,3,1,4,2.5,'guard','Contre-garde','Chaque représaille bloquée apporte une charge. La chargée pose un bouclier et arme une riposte.'],
 battery:['Courant',6,4,1,4,2.1,'battery','Relais d’énergie','Le dernier coup rend de l’énergie aux alliés. La chargée fournit une réserve plus importante.'],
 control:['Emprise',6,3,1,4,2.8,'shatter','Brise-entrave','La chargée brise le gel en infligeant un impact supplémentaire, puis ébranle la garde.'],
 dot:['Tension',6,3,1,4,2.2,'detonate','Détonation','Les pulsations d’altération alimentent la réserve. La chargée fait exploser deux pulsations de chaque altération active.'],
 execute:['Verdicts',6,4,1,4,4,'verdict','Sentence','Les victoires apportent deux charges. La chargée inflige davantage de dégâts à une cible affaiblie.'],
 critical:['Précision',6,4,1,4,3.4,'precision','Point de rupture','Le dernier coup prépare un critique. La chargée bénéficie d’un critique garanti.'],
 combo:['Accords',6,3,1,4,2.7,'relay','Passage de témoin','Le dernier coup prépare le relais : le prochain personnage obtient une frappe d’entrée renforcée.'],
 speed:['Tempo',6,3,1,4,2.1,'tempo','Temps fort','Le dernier coup accélère les attaques automatiques. La chargée fait avancer immédiatement les quatre alliés.'],
 inspirer:['Courage',6,3,1,4,2,'inspire','Cri de ralliement','Le dernier coup encourage l’équipe. La chargée ajoute un bonus d’ATQ aux frappes alliées pendant 8 s.'],
 time:['Instants',6,4,1,4,2.3,'echo','Écho temporel','Les dernières frappes sont mémorisées. La chargée rejoue trois échos de dégâts.'],
 space:['Fractures',6,4,1,4,3.2,'fracture','Faille spatiale','La chargée fragilise la cible et provoque trois impacts convergents.'],
 mark:['Empreintes',6,3,1,4,2.6,'mark','Lien résonant','Le dernier coup grave une marque. La chargée la déclenche et recharge les ultimes alliés.'],
 fortune:['Trouvailles',6,4,1,4,2.4,'treasure','Veine dorée','Le dernier coup fournit des fragments. La chargée prépare une récompense doublée à la prochaine victoire.']
};
const SPECIAL={
 'gi:ronova':{resource:'Plumes écarlates',max:6,cost:4,gain:1,charged:'Sentence des ailes',mode:'verdict',passive:'Le sceau funèbre',description:'La compétence grave un sceau. Chaque fin de cycle renouvelle le sceau ; la chargée le consomme et renforce sa sentence sous 40 % de PV.',mechanic:'death'},
 'gi:istaroth':{resource:'Instants gardés',max:6,cost:4,gain:1,charged:'Les secondes reviennent',mode:'echo',passive:'Mémoire du vent',description:'Conserve les trois dernières frappes. La chargée les rejoue, retarde les représailles et restitue de l’énergie.',mechanic:'time'},
 'gi:naberius':{resource:'Germes de vie',max:5,cost:3,gain:1,charged:'Éclosion primordiale',mode:'heal',passive:'La vie déborde',description:'Les soins excédentaires deviennent un bouclier. La chargée soigne et fait éclore une graine qui frappe pendant 8 s.',mechanic:'life'},
 'gi:asmoday':{resource:'Verrous spatiaux',max:6,cost:4,gain:1,charged:'Effondrement des cubes',mode:'fracture',passive:'Un espace clos',description:'La compétence fragilise l’espace et prépare des frappes coordonnées. La chargée ajoute trois impacts et maintient une vulnérabilité pendant 8 s.',mechanic:'space'},
 'gi:dainsleif':{resource:'Traces abyssales',max:6,cost:4,gain:1,charged:'Rameau étoilé',mode:'mark',passive:'Mémoire de Khaenri’ah',description:'Chaque ultime allié apporte deux traces. La chargée fait éclater la marque et transmet de l’énergie au groupe.',mechanic:'abyss'},
 'gi:capitano':{resource:'Serments de givre',max:5,cost:3,gain:1,charged:'Lame du dernier rempart',mode:'guard',passive:'Le front ne cède pas',description:'Les coups bloqués nourrissent le serment. La chargée pose une garde de givre et prépare une riposte qui ébranle la cible.',mechanic:'frostguard'},
 'hsr:obsidian':{resource:'Gouttes écarlates',max:6,cost:4,gain:1,charged:'Le dernier toast',mode:'drain',passive:'La coupe nocturne',description:'La chargée draine la vitalité et achève les cibles affaiblies. Les victoires remplissent la coupe.',mechanic:'blood'},
 'gi:10000114':{resource:'Ruse serpentine',max:100,cost:50,gain:14,charged:'Faille des sept phases',mode:'stance',passive:'Lame hors du monde',description:'La compétence apporte 28 points de ruse. Les cycles deviennent plus courts en posture et la chargée prolonge cette posture.',mechanic:'skirk',multiplier:4.4},
 'hsr:1408':{resource:'Braises du monde',max:12,cost:6,gain:1,charged:'Météore de l’aube',mode:'meteor',passive:'Un monde à porter',description:'La compétence apporte trois braises. La chargée abat deux météores successifs et ouvre la garde.',mechanic:'phainon',multiplier:5.5},
 'gi:10000089':{resource:'Acclamations',max:6,cost:4,gain:1,charged:'Rappel du Salon',mode:'salon',passive:'Trois invités, un rappel',description:'La compétence invite les trois membres du Salon. La chargée déclenche une salve de leurs trois signatures et soigne le groupe.',mechanic:'furina'},
 'gi:10000073':{resource:'Graines de lien',max:6,cost:3,gain:1,charged:'Purification en réseau',mode:'mark',passive:'Le savoir se propage',description:'La compétence grave le lien. La chargée déclenche les marques, rend de l’énergie et fait apparaître une fleur de purification.',mechanic:'nahida'},
 'gi:10000030':{resource:'Éclats de jade',max:6,cost:3,gain:1,charged:'Résonance du pilier',mode:'guard',passive:'Un contrat de pierre',description:'La compétence érige un pilier qui pulse pendant 12 s. La chargée renforce le bouclier et arme une riposte de jade.',mechanic:'zhongli'},
 'gi:10000052':{resource:'Résolution',max:60,cost:30,gain:6,charged:'Entaille de la volonté',mode:'battery',passive:'Les vœux convergent',description:'Chaque ultime allié apporte douze points de résolution. La chargée transmet une grande quantité d’énergie aux alliés.',mechanic:'raiden',multiplier:3.4},
 'gi:10000006':{resource:'Sceaux conducteurs',max:3,cost:3,gain:1,charged:'Foudre catalysée',mode:'detonate',passive:'Trois sceaux, une décharge',description:'La compétence grave un sceau. La chargée fait exploser les pulsations électriques et consomme les sceaux pour amplifier la décharge.',mechanic:'lisa'},
 'gi:10000021':{resource:'Flèches prêtes',max:6,cost:4,gain:1,charged:'Flèche du guetteur',mode:'precision',passive:'Le guetteur et le lapin',description:'Le Baron Lapin reste visible pendant son invocation. La chargée est critique ; elle rappelle le lapin pour une explosion.',mechanic:'amber'},
 'gi:10000014':{resource:'Notes du chœur',max:6,cost:3,gain:1,charged:'Refrain vivifiant',mode:'heal',passive:'Chaque note compte',description:'Le quatrième coup soigne. La chargée déclenche un refrain de soin dont l’excédent protège le groupe.',mechanic:'barbara'},
 'gi:10000047':{resource:'Courants d’érable',max:4,cost:3,gain:1,charged:'Retour du tourbillon',mode:'shatter',passive:'Un souffle pour le groupe',description:'La compétence prépare un courant. La chargée rassemble les sillages, brise la garde et prépare une accélération alliée.',mechanic:'kazuha'},
 'gi:10000058':{resource:'Lames de foudre',max:6,cost:4,gain:1,charged:'Salve des sanctuaires',mode:'summon',passive:'Trois totems',description:'Chaque compétence ajoute un totem, jusqu’à trois. Leurs pulsations se renforcent ; l’ultime les consomme pour un impact supplémentaire.',mechanic:'yae'},
 'gi:10000087':{resource:'Gouttes anciennes',max:6,cost:3,gain:1,charged:'Torrent des profondeurs',mode:'beam',passive:'Un torrent soutenu',description:'La chargée libère trois vagues de rayon successives. Chaque vague soigne légèrement le groupe et fragilise la garde.',mechanic:'neuvillette',multiplier:4.5},
 'gi:10000046':{resource:'Braises de vitalité',max:6,cost:3,gain:1,charged:'Sillage du papillon',mode:'drain',passive:'La braise et le retour',description:'La compétence consomme un peu de vitalité et infuse les frappes. La chargée transforme cette braise en dégâts et en soin.',mechanic:'hutao'},
 'gi:10000096':{resource:'Dette de sang',max:100,cost:40,gain:12,charged:'Récolte des liens',mode:'drain',passive:'Le fil rouge',description:'La compétence inscrit une dette sur la cible. La chargée consomme la dette pour renforcer son entaille de 50 % et rendre de la vitalité.',mechanic:'arlecchino'},
 'hsr:1005':{resource:'Tension électrique',max:6,cost:3,gain:1,charged:'Accord de détonation',mode:'detonate',passive:'La note persiste',description:'Les pulsations de dégâts continus chargent la tension. La chargée déclenche deux pulsations de chaque altération du groupe.',mechanic:'kafka'},
 'hsr:1304':{resource:'Jetons de riposte',max:7,cost:5,gain:1,charged:'Mise gagnante',mode:'guard',passive:'Une chance bien gardée',description:'Les représailles bloquées apportent deux jetons. La chargée pose une nouvelle garde puis prépare une riposte à 300 % de son ATQ.',mechanic:'aventurine'},
 'hsr:1309':{resource:'Notes harmoniques',max:6,cost:4,gain:1,charged:'Le chœur reprend',mode:'tempo',passive:'Le groupe à l’unisson',description:'Le cycle accélère le groupe. La chargée fait immédiatement avancer les attaques alliées et prépare le prochain relais.',mechanic:'robin'},
 'ww:1402':{resource:'Plumes du vent',max:3,cost:3,gain:1,charged:'Envol des plumes',mode:'battery',passive:'Le vent fait le relais',description:'Chaque cycle rassemble une plume supplémentaire. La chargée libère le souffle et recharge les ultimes des autres membres.',mechanic:'yangyang'},
 'ww:1202':{resource:'Balles thermiques',max:60,cost:30,gain:10,charged:'Salve thermique',mode:'volley',passive:'Une cadence brûlante',description:'La chargée libère six tirs successifs. Le cycle de frappes remplit la réserve ; les tirs s’enchaînent toutes les 0,22 s.',mechanic:'chixia'},
 'ww:1103':{resource:'Échos de You’tan',max:4,cost:3,gain:1,charged:'Retour de You’tan',mode:'heal',passive:'Une présence fidèle',description:'La chargée déclenche une vague de soin et un nouvel écho qui frappe la cible pendant 8 s.',mechanic:'baizhi'},
 'ww:1404':{resource:'Élan du dragon',max:6,cost:4,gain:1,charged:'Assaut du dragon azur',mode:'meteor',passive:'La formation avance',description:'La chargée fait converger deux attaques du dragon et réduit fortement la garde de la cible.',mechanic:'jiyan'},
 'ww:1304':{resource:'Incandescence',max:50,cost:25,gain:5,charged:'Rayon de la sentinelle',mode:'beam',passive:'La lumière s’accumule',description:'Les compétences alliées nourrissent l’incandescence. La chargée déploie un rayon en trois vagues.',mechanic:'jinhsi'},
 'ww:1505':{resource:'Éclats stellaires',max:100,cost:60,gain:15,charged:'Retour stellaire',mode:'tempo',passive:'Trois horizons',description:'Les relais apportent des éclats. La chargée fait avancer l’équipe, soigne et prépare ses critiques.',mechanic:'shorekeeper'},
 'ww:1603':{resource:'Bourgeons écarlates',max:100,cost:50,gain:15,charged:'Éclosion tournoyante',mode:'stance',passive:'Le bourgeon déchaîné',description:'La chargée entretient la transformation. Ses cycles raccourcis dessinent des lianes et renforcent les frappes.',mechanic:'camellya'},
 'ww:1205':{resource:'Plumes de vrai feu',max:4,cost:4,gain:1,charged:'Retour du phénix',mode:'meteor',passive:'Quatre plumes pour renaître',description:'Les compétences et les cycles nourrissent les plumes. La chargée fait retomber deux vagues de feu et ouvre la garde.',mechanic:'changli'}
};
const ACTION_NAMES={
 'gi:ronova':['Sceau funèbre','Ailes de la Mort'],'gi:istaroth':['Seconde suspendue','Retour des instants'],'gi:naberius':['Germe primordial','Jardin de la Vie'],'gi:asmoday':['Cage des principes','Rupture de l’espace'],'gi:dainsleif':['Main du rameau','Sceau de Khaenri’ah'],'gi:capitano':['Garde du Capitaine','Serment de givre'],'hsr:obsidian':['Coupe écarlate','Toast de minuit'],
 'gi:10000021':['Baron Lapin','Pluie ardente'],'gi:10000006':['Arc conducteur','Rose de foudre'],'gi:10000014':['Mélodie vivifiante','Miracle du chœur'],'gi:10000030':['Dominus Lapidis','Chute de la météorite'],'gi:10000089':['Salon solitaire','Que le monde se réjouisse'],'gi:10000073':['Tous les savoirs','Cœur illusoire'],'gi:10000052':['Œil de résolution','Musou no Hitotachi'],'gi:10000114':['Danse des sept phases','Lame du vide'],
 'hsr:1408':['Que la lumière soit','Celui qui porte le monde'],'hsr:1005':['Fil électrique','Détonation du destin'],'hsr:1304':['Mise protectrice','Roulette des ripostes'],'hsr:1309':['Accord des voix','Concerto du groupe'],
 'ww:1402':['Domaine du vent','Spirales du vent'],'ww:1202':['Tirs brûlants','Salve des flammes'],'ww:1103':['Appel de You’tan','Écho de vie'],'ww:1404':['Lance des vents','Dragon azur'],'ww:1304':['Éclat de la sentinelle','Rayon de Jué'],'ww:1505':['Papillons stellaires','Domaine des Rivages']
};
const MODES={nuke:'Impact direct renforcé.',volley:'Plusieurs impacts successifs.',summon:'Invocation persistante qui frappe régulièrement.',orbit:'Projectiles en orbite qui frappent régulièrement.',fanfare:'Les soins et pertes de vitalité alimentent la fanfare et renforcent les dégâts.',sanctuary:'Domaine qui renforce les dégâts des réactions.',meteor:'Météorite et pétrification temporaire.',inspire:'Une portion de son ATQ renforce les frappes du groupe.',expose:'La cible devient plus vulnérable aux attaques.',healingstance:'Transformation avec soins sur les frappes.',drain:'Des dégâts directs restituent de la vitalité au groupe.',delayed:'Une lame accumule les frappes avant une explosion différée.',detonatesummons:'Consomme les invocations pour un impact supplémentaire.',lifemark:'Marque et régénération soutiennent les actions alliées.',battery:'Rend de l’énergie aux autres membres ; la valeur dépend de la recharge.',heal:'Soin immédiat puis régénération régulière.',shield:'Bouclier dont la solidité dépend de l’ATQ et des bonus de soin/protection.',freeze:'Suspend temporairement les représailles.',speed:'Accélère les attaques automatiques du groupe.',dot:'Altération persistante qui inflige des dégâts à intervalles réguliers.',execute:'Fenêtre d’exécution contre les cibles sous 25 % de PV.',critical:'Prépare des frappes critiques garanties.',relay:'Les frappes des autres membres déclenchent des attaques coordonnées.',loot:'Prépare une récompense doublée et améliore le prochain butin.',time:'Suspend les représailles et déclenche immédiatement des attaques alliées.',space:'Fragilise la cible et crée des frappes coordonnées.',mark:'Les réactions alliées déclenchent la marque.',stance:'Transformation temporaire : frappes normales renforcées et cycle plus court.'};

const FINISHERS={
 assault:'Fin de cycle : impact de 140 % de l’ATQ et 15 points de garde supplémentaires retirés.',
 stance:'Une transformation raccourcit le cycle de deux frappes, avec un minimum de deux. Fin de cycle : impact de 90 % de l’ATQ.',
 summoner:'Fin de cycle : impact de 180 % de l’ATQ si son invocation est active, sinon 90 %.',
 healer:'Fin de cycle : soin de 55 % de l’ATQ, multiplié par ses bonus de soin. La moitié du soin excédentaire devient un bouclier de 8 s.',
 shield:'Fin de cycle : bouclier de 60 % de l’ATQ, renforcé par ses bonus de protection. Un blocage apporte deux gains de ressource.',
 battery:'Fin de cycle : 6 points d’énergie aux autres membres, multipliés par sa recharge d’énergie.',
 control:'Fin de cycle : 10 points de garde supplémentaires retirés.',
 dot:'Fin de cycle : altération de 9 s, avec des pulsations de 45 % de l’ATQ. Les pulsations apportent la moitié d’un gain de ressource.',
 execute:'Chaque victoire apporte deux gains de ressource. Fin de cycle : impact de 90 % de l’ATQ.',
 critical:'Fin de cycle : prépare un critique garanti, disponible pendant 7 s.',
 combo:'Fin de cycle : prépare un relais pendant 12 s. L’entrée du prochain personnage passe de 60 % à 200 % de son ATQ.',
 speed:'Fin de cycle : cadence automatique de l’équipe multipliée par 1,45 pendant 5 s.',
 inspirer:'Fin de cycle : encouragement de 6 s, calculé sur 40 % de son ATQ ; 20 % de cette réserve s’ajoute à chaque frappe alliée.',
 time:'Mémorise les trois dernières normales, chacune à 85 % de l’ATQ au moment du coup. La chargée rejoue 80 % de chaque valeur mémorisée.',
 space:'La faille spatiale rend la cible 35 % plus vulnérable. Elle ne se cumule pas avec une autre vulnérabilité plus faible.',
 mark:'Fin de cycle : marque de 9 s dont la puissance est égale à 80 % de l’ATQ. Les réactions de l’équipe peuvent la déclencher.',
 fortune:'Fin de cycle : un fragment d’équipement. Chaque victoire apporte deux gains de ressource.'
};

export function depthProfile(p,key,world){
 const kit=powerProfile(p,key,world),[resource,max,cost,gain,steps,multiplier,mode,charged,description]=ROLES[kit.role]||ROLES.assault,extra=SPECIAL[kit.id]||{};
 const names=ACTION_NAMES[kit.id]||[`${kit.signature} · préparation`,kit.name];
 return {id:kit.id,role:kit.role,resource,max,cost,gain,steps,multiplier,mode,charged,description,passive:'Art du compagnon',passiveDescription:FINISHERS[kit.role]||FINISHERS.assault,mechanic:kit.role,skillName:names[0],burstName:names[1],skillDescription:MODES[kit.skillMode||kit.mode]||MODES.nuke,burstDescription:MODES[kit.burstMode||kit.mode]||MODES.nuke,...extra};
}
export const DEPTH_SIGNATURES=Object.keys(SPECIAL);
