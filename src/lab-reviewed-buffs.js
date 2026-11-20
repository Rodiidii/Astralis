import {FINAL_ROSTER_BUFFS,FINAL_AUTOMATIC_BUFFS} from './lab-reviewed-final-roster.js?v=20261120-radiance-3';
import {LUNAR_STELLAR_REVIEWED_BUFFS,LUNAR_STELLAR_AUTOMATIC_BUFFS} from './lab-reviewed-lunar-stellar.js';
import {THIRD_TWENTY_REVIEWED_BUFFS,THIRD_TWENTY_AUTOMATIC_BUFFS} from './lab-reviewed-third-twenty.js';
import {TWENTY_REVIEWED_BUFFS,TWENTY_AUTOMATIC_BUFFS} from './lab-reviewed-twenty.js?v=20261120-radiance-1';
import {NEXT_TWENTY_REVIEWED_BUFFS,NEXT_TWENTY_AUTOMATIC_BUFFS} from './lab-reviewed-next-twenty.js?v=20261120-radiance-1';
// Reviewed against the pinned French kit text and the calculation sheets.
// A shared condition may activate several talents; do not ask for duplicate toggles.
export const PASSIVE_SOURCE_STATS={Bennett:{baseAtk:'ATQ de base de Bennett · personnage + arme'},Furina:{hp:'PV max de Furina'},KaedeharaKazuha:{em:'Maîtrise élémentaire de Kazuha'},Nahida:{em:'Maîtrise élémentaire de Nahida'},Shenhe:{atk:'ATQ finale de Shenhe'},KujouSara:{baseAtk:'ATQ de base de Sara · personnage + arme'},Sucrose:{em:'Maîtrise élémentaire de Sucrose'},Mona:{er:'Recharge de Mona (%)'},YunJin:{def:'DÉF finale de Yun Jin'},Zhongli:{hp:'PV max de Zhongli'}};
export const AUTOMATIC_PASSIVE_BUFFS={
 Furina:{passive2:'Les membres du salon gagnent 0,7 % de DGT par tranche de 1 000 PV max de Furina, jusqu’à 28 %. Appliqué à leurs attaques, pas à l’impact initial.'},
 Nahida:{passive2:'Chaque point de ME de Nahida au-delà de 200 donne 0,1 % de DGT et 0,03 % de taux CRIT à la purification trikarmique. Plafonds : 80 % de DGT et 24 % de taux CRIT à 1 000 ME.'},
 Mona:{passive2:'Bonus Hydro égal à 20 % de la recharge totale de Mona : 200 % de recharge donnent 40 % de DGT Hydro.'},
 YunJin:{passive2:'La formation ajoute 2,5/5/7,5/11,5 % de la DÉF de Yun Jin selon 1/2/3/4 éléments différents. S’ajoute au coefficient de l’ultime ; agit uniquement sur les normales.'},
 Zhongli:{passive2:'Ajout aux dégâts selon les PV max de Zhongli : 1,39 % pour normales/chargées/plongeantes, 1,9 % pour dorsale/résonance/appui long et 33 % pour le météore.'},
};
export const REVIEWED_BUFFS={
 Bennett:{
  recipientLowHP:['combat3','PV du bénéficiaire à 70 % ou moins','À C0, le champ soigne mais ne donne pas son bonus d’ATQ si le bénéficiaire a 70 % de PV ou moins. À partir de C1, le bonus d’ATQ reste actif.'],
  underHP:['c2','PV de Bennett inférieurs à 70 %','Bennett gagne 30 % de recharge à C2. Ce réglage concerne Bennett, pas les PV du bénéficiaire du champ.'],
  activeInArea:['combat3','Champ vertueux · bonus d’ATQ','Le personnage actif est dans le champ et satisfait la condition de PV à C0. Le bonus utilise uniquement l’ATQ de base de Bennett (personnage + arme). La C1 ajoute 20 % de cette ATQ de base ; la C6 ajoute le bonus Pyro et l’infusion compatibles.',['c1','c6']],
 },
 Furina:{
  burstFanfare:['combat3','Nombre de points de Fanfare','Les variations de PV pendant l’ultime donnent des points. Le bonus de DGT et de soins reçus utilise le niveau de l’ultime. Maximum : 300 points à C0, 400 à partir de C1.',['c1']],
  c2Overstack:['c2','Fanfare excédentaire · bonus de PV','Chaque point au-delà du plafond donne 0,35 % de PV max à Furina, jusqu’à 140 %. Ne pas compter ces points une seconde fois dans la Fanfare de l’ultime.'],
  skillHpConsumeStacks:['combat2','Personnages dont les PV sont consommés','Choisir 0 à 4 personnages ayant plus de 50 % de PV : les attaques des membres du salon infligent 100/110/120/130/140 % des dégâts d’origine. Aucun effet sur l’impact initial.'],
  c6:['c6','Centre d’attention · infusion Hydro','Après la compétence, jusqu’à 6 déclenchements en 10 s : infusion Hydro et ajout de 18 % des PV max aux normales, chargées et plongeantes.'],
  c6Pneuma:['c6','Centre d’attention · mode Pneuma','Avec Centre d’attention actif, ajoute encore 25 % des PV max aux normales (hors Arkhe), chargées et impacts au sol des plongeantes.'],
 },
 KaedeharaKazuha:{
  c2:['c2','Vent d’automne actif · ME de Kazuha','Augmente la ME de Kazuha de 200 pendant son ultime. Cette ME augmente aussi son bonus élémentaire du passif et son bonus C6.'],
  c2p:['c2','Bénéficiaire dans le champ · +200 ME','Le personnage actif se trouve dans le Vent d’automne. Le bonus de 200 ME ne se cumule pas avec celui reçu par Kazuha lui-même.'],
  c6:['c6','Infusion Anémo et bonus des attaques','Après compétence ou ultime : infusion Anémo pendant 5 s et bonus de normales, chargées et plongeantes de 0,2 % par point de ME de Kazuha.'],
  skillAbsorption:['passive1','Absorption de la compétence','L’élément absorbé ajoute un impact élémentaire de 200 % de l’ATQ à la plongeante. Cet effet est distinct du bonus élémentaire après Dispersion.'],
  burstAbsorption:['combat3','Absorption de l’ultime','Active les dégâts élémentaires absorbés de Vent d’automne ; ne déclenche pas à lui seul le passif de bonus après Dispersion.'],
 },
 Nahida:{
  partyInBurst:['combat3','Sanctuaire de Maya actif','L’ultime adapte ses effets au nombre de personnages Pyro, Électro et Hydro de l’équipe. La C1 ajoute un personnage à chaque décompte.',['c1']],
  condA1ActiveInBurst:['passive1','Personnage actif dans le sanctuaire','Transmet 25 % de la ME la plus élevée de l’équipe, au maximum 250 ME, au personnage actif dans le sanctuaire.'],
  c2Bloom:['c2','Ennemi marqué · réactions Dendro critiques','Brûlure, Fleurissement, Exubérance et Bourgeonnement sur l’ennemi marqué peuvent critiquer à 20 % de taux et 100 % de DGT CRIT. Ce bonus ne modifie pas les critiques des attaques ordinaires.'],
  c2QSA:['c2','Ennemi marqué · Stimulation déclenchée','Stimulation, Suractivation ou Propagation sur l’ennemi marqué réduit sa DÉF de 30 % pendant 8 s.'],
  c4Count:['c4','Ennemis marqués par une graine','1/2/3/4 ennemis marqués donnent 100/120/140/160 ME à Nahida.'],
 },
 Shenhe:{
  quill:['combat2','Plumes de glace disponibles','Ajoute aux dégâts Cryo une valeur fondée sur l’ATQ actuelle de Shenhe et le niveau de sa compétence. Appui court : 5 déclenchements, appui long : 7 ; un déclenchement par cible touchée. La C6 ne consomme pas de plume sur les normales et chargées.',['c6']],
  burst:['combat3','Ennemi dans le champ de l’ultime','Réduit les RÉS Cryo et physique selon le niveau de l’ultime, uniquement pour les ennemis dans le champ.'],
  asc1:['passive1','Personnage actif dans le champ','Le personnage actif dans le champ gagne 15 % de DGT Cryo ; à C2, il gagne aussi 15 % de DGT CRIT Cryo.',['c2']],
  asc4:['passive2','Esprit de communion · appui court','Après l’appui court : +15 % de DGT de compétence et d’ultime pendant 10 s.'],
  asc4Hold:['passive2','Esprit de communion · appui long','Après l’appui long : +15 % de DGT de normales, chargées et plongeantes pendant 15 s. Les deux bonus peuvent coexister si leurs durées se chevauchent.'],
  c4:['c4','Cumuls de Mantra consommés','Chaque plume déclenchée par un allié donne un cumul. La prochaine compétence de Shenhe consomme jusqu’à 50 cumuls et gagne 5 % de DGT par cumul.'],
 },
 KujouSara:{
  TenguJuuraiAmbush:['combat2','Bonus d’ATQ de Tengu Juurai','Le bénéficiaire reçoit le Tengu Juurai de la compétence ou de l’ultime. Pendant 6 s, bonus calculé avec l’ATQ de base de Sara et le niveau de sa compétence ; les sources ne se cumulent pas.',['combat3']],
  c6:['c6','Bonus de DGT CRIT Électro','Le bénéficiaire doit avoir reçu le bonus d’ATQ de Tengu Juurai : +60 % de DGT CRIT pour ses dégâts Électro uniquement.'],
 },
 Sucrose:{
  skillHit:['passive2','Compétence ou ultime ayant touché','Transmet 20 % de la ME de Sucrose aux autres personnages pendant 8 s. Sucrose ne reçoit pas son propre partage.'],
  absorption:['c6','Élément absorbé par l’ultime','L’élément absorbé reçoit +20 % de DGT pendant l’ultime. Le supplément Hexerei dépend du passif débloqué et du bénéficiaire héxère.'],
 },
 Mona:{
  Omen:['combat3','Présage actif sur la cible','Bonus de DGT selon le niveau de l’ultime ; à C4, +15 % de taux CRIT contre la cible marquée. Les suppléments Hexerei restent soumis à leurs conditions.',['c4']],
  ProphecyOfSubmersion:['c1','Réaction Hydro sur une cible avec Présage','Pendant 8 s après l’impact sur une cible marquée : bonus aux réactions Hydro concernées. Le bonus de Gel agit sur la durée, pas sur les dégâts.'],
  RhetoricsOfCalamitas:['c6','Cumuls de bonus d’attaque chargée','Chaque cumul donne +60 % de DGT à la prochaine attaque chargée, jusqu’à 180 %.'],
  lockC2Charged:['c2','Attaque chargée ayant touché · partage de ME','Avec l’amélioration correspondante débloquée : +80 ME à l’équipe pendant 12 s après qu’une attaque chargée de Mona touche.'],
 },
 YunJin:{
  skill:['combat3','Formation de bannière de nuagerie','Bonus ajouté uniquement aux dégâts de normales, selon la DÉF de Yun Jin et le niveau de son ultime. Le passif ajoute 2,5/5/7,5/11,5 % de sa DÉF selon 1/2/3/4 éléments dans l’équipe. À C2 : +15 % de DGT de normales ; à C6 : +12 % de vitesse d’attaque. Limite : 30 déclenchements par bénéficiaire, un par cible touchée.',['passive2','c2','c6']],
  c4:['c4','Cristallisation déclenchée · DÉF de Yun Jin','+20 % de DÉF à Yun Jin pendant 12 s ; cette DÉF renforce aussi la formation de l’ultime.'],
 },
 Zhongli:{
  skill:['combat2','Bouclier de jade · ennemi proche','Le bénéficiaire est protégé par le bouclier et l’ennemi est proche : −20 % à toutes les RÉS élémentaires et physique. Non cumulable avec un autre bouclier de jade. La C2 permet aussi d’obtenir ce bouclier par l’ultime.',['c2']],
  p1:['passive1','Cumuls de renforcement du bouclier','Chaque attaque reçue par le bouclier donne +5 % de force de bouclier, jusqu’à 5 cumuls (+25 %). Aucun bonus de dégâts.'],
 },
};

Object.assign(REVIEWED_BUFFS,TWENTY_REVIEWED_BUFFS);
Object.assign(AUTOMATIC_PASSIVE_BUFFS,TWENTY_AUTOMATIC_BUFFS);
Object.assign(REVIEWED_BUFFS,NEXT_TWENTY_REVIEWED_BUFFS);
Object.assign(AUTOMATIC_PASSIVE_BUFFS,NEXT_TWENTY_AUTOMATIC_BUFFS);
Object.assign(PASSIVE_SOURCE_STATS,{Rosaria:{critRate:'Taux CRIT de Rosalia au déclenchement (%)'},Faruzan:{baseAtk:'ATQ de base de Faruzan · personnage + arme'},Layla:{hp:'PV max de Layla'},Thoma:{hp:'PV max de Thomas'},Candace:{hp:'PV max de Candace'},Chevreuse:{hp:'PV max de Chevreuse'},Yaoyao:{hp:'PV max de Yaoyao'},Kirara:{hp:'PV max de Kirara'},Baizhu:{hp:'PV max de Baizhu'},SangonomiyaKokomi:{hp:'PV max de Kokomi',healing:'Bonus de soins de Kokomi (%)'},Nilou:{hp:'PV max de Nilou'},YaeMiko:{em:'Maîtrise élémentaire de Yae Miko'},Noelle:{def:'DÉF finale de Noëlle'}});

Object.assign(REVIEWED_BUFFS,THIRD_TWENTY_REVIEWED_BUFFS);
Object.assign(AUTOMATIC_PASSIVE_BUFFS,THIRD_TWENTY_AUTOMATIC_BUFFS);
Object.assign(PASSIVE_SOURCE_STATS,{Iansan:{atk:"ATQ finale d’Iansan · buffs personnels inclus"},Xilonen:{def:"DÉF finale de Xilonen · buffs inclus"},Citlali:{em:"ME finale de Citlali · 125 ME de C2 inclus"},Clorinde:{atk:"ATQ finale de Clorinde"},Arlecchino:{atk:"ATQ finale d’Arlecchino"},Emilie:{atk:"ATQ finale d’Émilie"},Sethos:{em:"ME finale de Sethos"},Tighnari:{em:"ME finale de Tighnari"},Cyno:{em:"ME finale de Cyno"},Chiori:{def:"DÉF finale de Chiori"},Dehya:{hp:"PV max de Dehya"},Sayu:{atk:"ATQ finale de Sayu",em:"ME finale de Sayu"}});

Object.assign(REVIEWED_BUFFS,LUNAR_STELLAR_REVIEWED_BUFFS);
Object.assign(AUTOMATIC_PASSIVE_BUFFS,LUNAR_STELLAR_AUTOMATIC_BUFFS);
Object.assign(PASSIVE_SOURCE_STATS,{Columbina:{hp:"PV max de Columbina · Éclat lunaire inclus"},Flins:{atk:"ATQ finale de Flins"},Ineffa:{atk:"ATQ finale d’Ineffa"},Lauma:{em:"ME finale de Lauma"},Nefer:{em:"ME finale de Nefer · bonus des voiles inclus"},Zibai:{def:"DÉF finale de Zibai"},Mitya:{em:"ME finale de Mitya"},Valeriy:{atk:"ATQ finale de Valeriy"},Vesna:{atk:"ATQ finale de Vesna"}});

Object.assign(REVIEWED_BUFFS,FINAL_ROSTER_BUFFS);
Object.assign(AUTOMATIC_PASSIVE_BUFFS,FINAL_AUTOMATIC_BUFFS);
for(const key of ['Albedo','Klee','Mona','Sucrose'])REVIEWED_BUFFS[key].lockHomework=['lockedPassive','Devoir de la sorcière accompli','Le devoir propre à ce personnage doit être terminé. Il devient héxère ; au moins deux personnages héxères sont nécessaires au Rituel secret. Les déclenchements du rituel se règlent séparément.'];
Object.assign(REVIEWED_BUFFS.Beidou,{
 lockRevelation:['lockedPassive','Révélation de Beidou débloquée','Débloque l’accumulation de puissance par maintien de la compétence, même sans attaque reçue, ainsi que les effets d’énergie et de recharge de compétence. Ne donne pas de bonus global à l’équipe.'],
 lockStellarRadianceSc:['lockedPassive','Beidou dans une étendue polaris','La Révélation doit être débloquée. Beidou entre en radiance Astroconduction et ses actions concernées utilisent les coefficients de réaction astrale, indiqués dans le tableau.'],
});
Object.assign(REVIEWED_BUFFS.Klee,{
 lockC1:['c1','Étincelles de C1 déclenchées','Après le déclenchement des étincelles, Klee gagne 60 % d’ATQ pendant 12 s. Ce bonus reste personnel ; l’impact supplémentaire se calcule séparément.'],
 lockBadge:['lockedPassive','Boum-badges disponibles','Sous Hexerei, normale, compétence et ultime donnent chacun un badge indépendant. Avec 1/2/3 badges, Frappe boum-boum inflige 115/130/150 % de ses dégâts d’origine. Pas de bonus à toutes les chargées.'],
});
REVIEWED_BUFFS.Mona.lockStacks=['lockedPassive','Lueurs astrales de Mercure consommées','Sous Hexerei, les normales et chargées de Mona donnent jusqu’à trois cumuls. L’Évaporation d’un autre personnage les consomme pour gagner 5 % de dégâts par cumul, maximum 15 %. Ne donne pas 15 % de DGT Hydro universels.'];
Object.assign(REVIEWED_BUFFS.Sucrose,{
 lockAfterSkill:['lockedPassive','Esprit du vent de taille réduite créé','Sous Hexerei : les cinq catégories d’attaques de l’équipe gagnent 5,71428 % de DGT pendant 15 s. Aucun gain de maîtrise élémentaire par ce réglage.'],
 lockAfterBurst:['lockedPassive','Esprit du vent de grande taille créé','Sous Hexerei : les cinq catégories d’attaques des bénéficiaires héxères gagnent 7,14285 % de DGT pendant 20 s. Les personnages non héxères sont exclus.'],
});
for(const [element,label]of Object.entries({hydro:'Hydro',pyro:'Pyro',cryo:'Cryo',electro:'Électro'})){
 REVIEWED_BUFFS.KaedeharaKazuha['swirl'+element]=['passive2','Dispersion '+label+' déclenchée','Après Dispersion ou Astrodispersion de cet élément : l’équipe gagne 0,04 % de DGT '+label+' par point de ME de Kazuha pendant 8 s. Les différents éléments peuvent coexister.'];
 REVIEWED_BUFFS.Sucrose['swirl'+element]=['passive1','Dispersion '+label+' déclenchée','Après Dispersion ou Astrodispersion de cet élément : les autres personnages '+label+' gagnent 50 ME pendant 8 s. Sucrose ne reçoit pas son propre partage et les autres éléments sont exclus.'];
}
Object.assign(PASSIVE_SOURCE_STATS,{AratakiItto:{def:'DÉF finale d’Itto'},Dahlia:{hp:'PV max de Dahlia'},Durin:{atk:'ATQ finale de Durin'},Escoffier:{atk:'ATQ finale d’Escoffier'},Illuga:{em:'ME finale d’Illuga'},Linnea:{def:'DÉF finale de Linnea'},Mualani:{hp:'PV max de Mualani'},Nicole:{atk:'ATQ de Nicole avant son propre partage'},Prune:{atk:'ATQ finale de Prune'},Qiqi:{atk:'ATQ finale de Qiqi'},Sigewinne:{hp:'PV max de Sigewinne'},Somnia:{em:'ME de Somnia avant ses gains multiplicatifs'},Vodyanitsa:{hp:'PV max de Vodyanitsa'},Xianyun:{atk:'ATQ finale de Xianyun'},YumemizukiMizuki:{em:'ME finale de Mizuki'},Alyosha:{er:'Recharge totale d’Alyosha (%)'},Xinyan:{def:'DÉF finale de Xinyan'},Odette:{atk:'ATQ finale d’Odette'},Sandrone:{atk:'ATQ finale de Sandrone'}});
