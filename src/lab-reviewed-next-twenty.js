// Second batch: French kit descriptions are kept in the generated manifest.
export const NEXT_TWENTY_REVIEWED_BUFFS={
 Jean:{
  c1:['c1','Compétence maintenue plus d’une seconde','À C1, Épée de tourbillon gagne 40 % de DGT après le maintien requis. Ne renforce ni les normales ni l’ultime.'],
  c2:['c2','Jean a ramassé une particule ou un orbe','Tous les personnages de l’équipe gagnent 15 % de vitesse d’attaque et de déplacement pendant 15 s.'],
  c4:['c4','Cible dans le champ de pissenlits','La cible perd 40 % de RÉS Anémo tant qu’elle est dans le champ. Les autres résistances ne diminuent pas.'],
  c6:['c6','Personnage protégé par le champ de pissenlits','Réduit les dégâts subis de 35 %. Après sortie du champ : jusqu’à 3 attaques subies ou 10 s. Ce bonus ne renforce pas les dégâts infligés.'],
 },
 Diona:{
  a4EnemyInMist:['passive2','Cible entrée dans le champ de vapeur d’alcool','L’ATQ de la cible diminue de 10 % pendant 15 s. Ce malus réduit sa capacité offensive ; il ne donne pas d’ATQ au personnage actif et ne diminue ni la DÉF ni les RÉS de la cible.'],
  Ascension1:['passive1','Personnage protégé par Griffes Cryo','Sous le bouclier : +10 % de vitesse de déplacement et consommation d’endurance réduite de 10 %.'],
  Constellation6:['c6','PV du bénéficiaire dans le champ de l’ultime','Au-dessus de 50 % de PV : +200 ME. À 50 % ou moins : +30 % de soins reçus. Les deux effets ne se cumulent pas. Le gain permanent de 25 % de PV de Diona est automatique.'],
  lockRevelation:['lockedPassive','Révélation de Diona débloquée','Active le kit amélioré lié à la Révélation ; les griffes coordonnées et les réactions astrales ont leurs actions propres.'],
  lockStellarRadianceSc:['lockedPassive','Radiance astrale dans le champ de l’ultime','Avec la Révélation et la C6 : +40 % aux réactions de la radiance choisie. La radiance Astroconduction renforce Supraconduction/Astroconduction ; Astrodispersion renforce les dispersions Cryo correspondantes.',['c6']],
 },
 Layla:{
  a1Stacks:['passive1','Cumuls de Sommeil profond du bouclier','Chaque étoile vespérale obtenue accorde 6 % de force du bouclier au personnage protégé, jusqu’à 4 cumuls (24 %).'],
  c4Active:['c4','Étoile d’aube disponible après le tir des étoiles','Ajoute aux normales et chargées 5 % des PV max de Layla. Dure 3 s et disparaît après le premier impact concerné ; aucun bonus aux compétences ou ultimes.'],
 },
 Thoma:{
  p1BarrierStacks:['passive1','Renouvellements de la barrière brûlante','Chaque obtention ou renouvellement donne 5 % de force du bouclier pendant 6 s, jusqu’à 5 cumuls (25 %).'],
  c6AfterBarrier:['c6','Barrière obtenue ou renouvelée','Les personnages de l’équipe gagnent 15 % de DGT de normales, chargées et plongeantes pendant 6 s. Aucun bonus aux compétences ni aux ultimes.'],
 },
 Candace:{
  c2AfterSkillHit:['c2','Compétence de Candace ayant touché','Candace gagne 20 % de PV max pendant 15 s. Ce gain améliore aussi le bonus de son passif qui utilise ses PV ; il ne donne pas 20 % de PV aux alliés.'],
  afterBurst:['combat3','Prière de couronne cramoisie active','Les normales élémentaires gagnent le bonus de l’ultime, plus 0,5 % par tranche de 1 000 PV max de Candace après élévation 4. Les épées, espadons et lances compatibles reçoivent une infusion Hydro. Aucun bonus aux normales physiques ni aux chargées.',['passive2']],
 },
 Rosaria:{
  RosariaA1:['passive1','Compétence ayant touché le dos de la cible','Rosalia gagne 12 % de taux CRIT pendant 5 s. Ce taux peut contribuer au partage de son passif 2 si celui-ci est actif.'],
  RosariaA4:['passive2','Sacrement mortel utilisé · partage de taux CRIT','Les autres personnages gagnent 15 % du taux CRIT de Rosalia pendant 10 s, avec un plafond de 15 points de taux CRIT. Rosalia est exclue. Le montant source peut être renseigné ci-dessus.'],
  RosariaC1:['c1','Rosalia vient d’infliger un coup CRIT','Rosalia gagne 10 % de vitesse d’attaque et 10 % de DGT de normales pendant 4 s. Effet personnel.'],
  DilucC6:['c6','Cible touchée par Sacrement mortel','Les attaques de l’ultime réduisent la RÉS physique de la cible de 20 % pendant 10 s.'],
 },
 Mika:{
  inSoulwind:['combat2','Spirivent actif sur le personnage déployé','La vitesse d’attaque dépend du niveau de compétence de Mika. Cet état est nécessaire pour les bonus physiques de Localisation et les DGT CRIT physiques de C6.',['c1']],
  a1DetectorStacks:['passive1','Cumuls de Localisation sous Spirivent','Chaque cumul donne 10 % de DGT physiques. Maximum 3, puis 4 après élévation 4 ou à C6, et 5 avec les deux. Le passif 2 et la C2 facilitent l’obtention des cumuls, sans ajouter de bonus séparé.',['passive2','c2','c6']],
  c6Crit:['c6','Spirivent · bonus de DGT CRIT physiques','À C6, le personnage actif sous Spirivent gagne 60 % de DGT CRIT physiques. Aucun bonus de DGT CRIT élémentaires.'],
 },
 Faruzan:{
  burstBenefit:['combat3','Vent de prière reçu','Accorde le bonus de DGT Anémo de l’ultime, calculé au niveau de talent de Faruzan. La baisse de RÉS de la cible est un réglage distinct.'],
  burstHit:['combat3','Cible affectée par Calamité de vent','Réduit la RÉS Anémo de 30 %. Peut aussi être appliqué par le vortex de compétence après déblocage du passif 1.',['passive1']],
  a4Active:['passive2','Protection venteuse disponible','Sous Vent de prière, le prochain impact Anémo concerné ajoute 32 % de l’ATQ de base de Faruzan (personnage + arme). L’ATQ des artéfacts n’entre pas dans ce montant.'],
  c6Crit:['c6','Vent de prière · DGT CRIT Anémo','Les personnages bénéficiant de Vent de prière gagnent 40 % de DGT CRIT Anémo. Aucun bonus aux autres éléments.'],
 },
 Chevreuse:{
  a1AfterOverload:['passive1','Surcharge déclenchée · équipe Pyro/Électro','La cible perd 40 % de RÉS Pyro et Électro pendant 6 s. Exige exclusivement des personnages Pyro/Électro et au moins un de chaque ; ajouter un troisième élément désactive cet effet.'],
  a4AfterBall:['passive2','Cartouche surchargée tirée','Les personnages Pyro et Électro gagnent 1 % d’ATQ par tranche de 1 000 PV max de Chevreuse, pendant 30 s. Plafond : 40 % d’ATQ à 40 000 PV. Les personnages d’autres éléments ne reçoivent pas ce bonus.'],
  c6AfterHealStacks:['c6','Soins de Chevreuse reçus · cumuls','Chaque soin reçu donne 20 % de DGT Pyro et Électro pendant 8 s, jusqu’à 3 cumuls (60 %). Les durées sont indépendantes ; aucune restriction de composition pour ce bonus.'],
 },
 Charlotte:{
  c2Hit:['c2','Nombre de cibles touchées par la compétence','Charlotte gagne 10/20/30 % d’ATQ pour 1/2/3 cibles ou plus, pendant 12 s. Augmente ses dégâts et les soins qui utilisent son ATQ. Aucun partage d’ATQ.'],
  c4Marked:['c4','Ultime ayant touché une cible marquée','L’ultime inflige 10 % de DGT supplémentaires à la cible portant Silhouette instantanée ou Impression ciblée. Aucun bonus global aux autres attaques.'],
 },
 Yaoyao:{
  adeptalLegacy:['combat3','Héritage adeptal actif','Les radis de l’ultime utilisent le multiplicateur renforcé défini par son niveau. L’état appartient à Yaoyao et se termine lorsqu’elle quitte le terrain.'],
  c1Explode:['c1','Personnage dans l’explosion d’un radis','Le bénéficiaire gagne 15 % de DGT Dendro pendant 8 s. Le radis restaure aussi 15 points d’endurance, au maximum une fois toutes les 5 s.'],
  c4AfterSkillBurst:['c4','Compétence ou ultime utilisé · ME personnelle','Yaoyao gagne une ME égale à 0,3 % de ses PV max pendant 8 s, plafonnée à 120 ME à 40 000 PV. Ce bonus ne se transmet pas aux alliés.'],
 },
 Kirara:{
  c6AfterSkillBurst:['c6','Compétence ou ultime de Kirara utilisé','Tous les personnages proches gagnent 12 % de DGT dans les sept éléments pendant 15 s. Aucun bonus de DGT physiques.'],
 },
 Baizhu:{
  a1HpStatus:['passive1','PV du personnage actif · effet sur Baizhu','Si le bénéficiaire a moins de 50 % de PV : Baizhu gagne 20 % de bonus de soins. À partir de 50 % : Baizhu gagne 25 % de DGT Dendro. Ces bonus restent personnels.'],
  a4AfterHeal:['passive2','Soin d’un bouclier aseptique reçu','Pendant 6 s, pour chaque tranche de 1 000 PV de Baizhu (maximum 50 000) : +2 % aux réactions Brûlure/Fleurissement/Exubérance/Bourgeonnement, +0,8 % aux ajouts de Suractivation/Propagation et +0,7 % à Sélénofleurissement. Aucun bonus général de DGT Dendro.'],
  c4AfterBurst:['c4','Ultime utilisé · +80 ME à l’équipe','Tous les personnages proches, Baizhu compris, gagnent 80 ME pendant 15 s.'],
 },
 SangonomiyaKokomi:{
  burst:['combat3','Parure cérémoniale active','Ajoute des dégâts selon les PV max de Kokomi aux normales, chargées et à la méduse. Le passif 2 ajoute aux normales/chargées un coefficient de PV égal à 15 % de son bonus de soins. À C4 : +10 % de vitesse d’attaque. Tous ces effets sont personnels.',['passive2','c4']],
  c2:['c2','Cible soignée à 50 % de PV ou moins','Ajoute aux soins de la méduse 4,5 % des PV max de Kokomi, et aux soins des normales/chargées sous parure 0,6 % de ses PV. Ce n’est pas un bonus aux dégâts.'],
  c6:['c6','Soin par normale/chargée sur une cible à 80 % de PV ou plus','Sous Parure cérémoniale, Kokomi gagne 40 % de DGT Hydro pendant 4 s après le soin requis. Ne s’active pas à partir d’un soin de la méduse seule.'],
 },
 Nilou:{
  a1AfterSkill:['passive1','Troisième pas terminé · Prime du calice d’or','Exige une équipe composée uniquement d’Hydro et Dendro, avec au moins un de chaque. Active les noyaux d’abondance et leur bonus selon les PV max de Nilou. Les effets disparaissent si la composition devient incompatible.',['passive2']],
  a1AfterHit:['passive1','Personnage sous Prime ayant subi des dégâts Dendro','Après avoir subi une attaque Dendro sous Prime du calice d’or, tous les personnages proches gagnent 100 ME pendant 10 s. Exige aussi la composition Hydro/Dendro valide.'],
  c2Hydro:['c2','Cible touchée par Hydro sous Prime','La cible perd 35 % de RÉS Hydro pendant 10 s après l’impact requis. Nécessite Prime du calice d’or.'],
  c2Dendro:['c2','Cible touchée par Fleurissement sous Prime','La cible perd 35 % de RÉS Dendro pendant 10 s après Fleurissement ou Sélénofleurissement. Nécessite Prime du calice d’or.'],
  c4AfterPirHit:['c4','Troisième pas de Pirouette ayant touché','Nilou gagne 50 % de DGT d’ultime pendant 8 s et récupère 15 points d’énergie. Aucun bonus de dégâts transmis à l’équipe.'],
 },
 YaeMiko:{
  c4:['c4','Éclair de sakura ayant touché','L’équipe gagne 20 % de DGT Électro pendant 5 s. Avec la Révélation, le bonus personnel d’ultime de Yae est pris en compte selon son kit amélioré.'],
  c1:['c1','Réaction de Supraconduction/Astroconduction déclenchée','Avec la Révélation et la C1, les personnages proches gagnent 50 % de DGT Électro et d’Astroconduction pendant 10 s après la réaction requise.'],
  c2:['c2','Niveau du sakura présent · partage de ME','Avec la Révélation et la C2, un sakura de niveau 1/2/3/4 donne 60/90/120/200 ME à Yae et au personnage actif. Les niveaux disponibles dépendent de la constellation.'],
  lockRevelation:['lockedPassive','Révélation de Yae Miko débloquée','Active les améliorations du kit. Après Supraconduction/Astroconduction, le prochain éclair renforcé ajoute 80 % de l’ATQ de Yae ; les actions de radiance sont proposées séparément.'],
  lockStellarRadianceSc:['lockedPassive','Radiance Astroconduction active','L’éclair renforcé peut déclencher l’impact d’Astroconduction supplémentaire égal à 200 % de l’ATQ de Yae. Ce n’est pas un bonus de 200 % à toutes ses attaques.'],
 },
 Fischl:{
  c1OzAbsent:['c1','Oz absent · regard du corbeau','Lorsque Oz est absent, les normales de Fischl déclenchent un impact physique supplémentaire égal à 22 % de son ATQ. Cet impact conserve ses propres bonus et ne renforce pas les normales des alliés.'],
  lockHomework:['lockedPassive','Devoir de la sorcière accompli','Débloque Fischl héxère. Les bonus d’ATQ et de ME exigent au moins deux personnages héxères dans l’équipe, Oz présent et la réaction correspondante.'],
  lockOverload:['lockedPassive','Oz présent · Surcharge déclenchée','Avec Hexerei actif : +22,5 % d’ATQ à Fischl et au personnage actif pendant 10 s. Le renforcement de C6 porte ce bonus à 45 %.'],
  lockEcLc:['lockedPassive','Oz présent · Électrocution/Sélénocution déclenchée','Avec Hexerei actif : +90 ME à Fischl et au personnage actif pendant 10 s ; +180 ME avec le renforcement de C6.'],
  lockC6Oz:['c6','Oz a effectué une attaque coordonnée','Avec Hexerei actif à C6, double les bonus d’ATQ et de ME du rituel pendant 10 s. Il faut toujours activer la réaction correspondante.'],
 },
 Tartaglia:{},
 Eula:{
  Grimheart:['combat2','Cumuls de cœur de glace conservés','Chaque cumul donne 30 % de DÉF à Eula, maximum 2 cumuls (60 %), et augmente sa résistance à l’interruption. Les cumuls consommés ne doivent plus être comptés comme conservés.'],
  grimheartConsumed:['combat2','Cœurs de glace consommés par l’appui long','L’ennemi perd de la RÉS physique et Cryo selon le niveau de compétence d’Eula pendant 7 s. Le passif 1 déclenche en plus une petite épée si deux cumuls ont été consommés.',['passive1']],
  TidalIllusion:['c1','Cœur de glace consommé · bonus physique','Eula gagne 30 % de DGT physiques. La durée augmente avec les cumuls consommés (6 à 18 s), mais le montant reste 30 %.'],
  LightfallSword:['combat3','Cumuls d’énergie de l’épée de lumière','Choisir le total réel de cumuls pour l’explosion, jusqu’à 30. À C6, inclure les 5 cumuls initiaux et les cumuls supplémentaires obtenus ; ils ne sont pas ajoutés une seconde fois.',['c6']],
  LightfallSwordC4:['c4','Cible de l’épée à moins de 50 % de PV','L’explosion de l’épée de lumière gagne 25 % de DGT. Aucun bonus global aux normales ni à la compétence.'],
 },
 Noelle:{
  SweepingTime:['combat3','Grand ménage actif','Convertit ses attaques en Géo et ajoute de l’ATQ selon la DÉF de Noëlle et le niveau de l’ultime. À C6, ajoute 50 % de sa DÉF au coefficient de conversion. Aucun transfert à l’équipe.',['c6']],
 },
};
export const NEXT_TWENTY_AUTOMATIC_BUFFS={
 Jean:{passive1:'Les soins des normales utilisent 15 % de l’ATQ de Jean ; ce soin ne donne pas d’ATQ au personnage actif.'},
 Diona:{c2:'À C2, +15 % aux DGT de Griffes Cryo et à l’absorption de son bouclier. Les boucliers partagés ont la moitié de son absorption.',c6:'Le kit amélioré ajoute automatiquement 25 % de PV max à Diona quand la Révélation est débloquée.'},
 Layla:{passive2:'Chaque étoile filante ajoute 1,5 % des PV max de Layla à ses dégâts.',c6:'+40 % de DGT aux étoiles filantes et rayons de l’ultime. Ne renforce pas l’impact initial de compétence.'},
 Thoma:{passive2:'L’effondrement ardent ajoute 2,2 % des PV max de Thomas. Aucun ajout à l’impact initial de l’ultime.'},
 Candace:{c6:'Impact Hydro coordonné : 15 % des PV max de Candace, considéré comme des DGT d’ultime, déclenché par les normales élémentaires d’un autre personnage sous Prière.'},
 Charlotte:{passive2:'Par autre personnage fontainois : +5 % de bonus de soins à Charlotte ; par autre personnage non-fontainois : +5 % de DGT Cryo à Charlotte, jusqu’à 15 % de chaque. La composition est lue automatiquement.'},
 Yaoyao:{passive2:'Le soin continu après l’explosion d’un radis utilise 0,8 % des PV max de Yaoyao par déclenchement.'},
 Kirara:{passive1:'Chaque cumul d’emballage renforcé ajoute un bouclier égal à 20 % de l’absorption initiale, jusqu’à 3 cumuls. Ce cumul d’absorption est distinct d’un bonus de force du bouclier.',passive2:'Par tranche de 1 000 PV max : +0,4 % de DGT de compétence et +0,3 % de DGT d’ultime à Kirara.'},
 Baizhu:{c6:'La veine d’aura ajoute 8 % des PV max de Baizhu à ses dégâts.'},
 SangonomiyaKokomi:{passive4:'Stratégie sans faille : +25 % de bonus de soins et −100 % de taux CRIT. Effet permanent inclus dans le calcul.',passive2:'Sous Parure : les normales/chargées gagnent un coefficient de PV supplémentaire égal à 15 % du bonus de soins. Le bonus de soins peut être renseigné ci-dessus.'},
 Nilou:{passive2:'Sous Prime du calice d’or : +9 % de DGT de noyaux d’abondance par tranche de 1 000 PV au-dessus de 30 000, jusqu’à 400 % (environ 74 444 PV).',c6:'Par 1 000 PV max : +0,6 % de taux CRIT et +1,2 % de DGT CRIT. Plafonds personnels : 30 % et 60 % à 50 000 PV.'},
 YaeMiko:{passive2:'Chaque point de ME donne 0,15 % de DGT aux sakura. Aucun bonus aux normales ni à l’ultime.',c6:'Les sakura ignorent 60 % de DÉF ennemie. Avec la Révélation, les DGT CRIT personnels d’Astroconduction augmentent aussi de 200 %.'},
 Fischl:{passive2:'L’impact du passif après une réaction Électro du personnage actif utilise 80 % de l’ATQ de Fischl. C’est une action distincte.',c1:'L’impact coordonné hors présence d’Oz utilise 22 % de l’ATQ de Fischl ; disponible comme action distincte.',c6:'L’attaque coordonnée d’Oz utilise 30 % de l’ATQ de Fischl. Elle ne donne pas 30 % d’ATQ au personnage actif.'},
 Tartaglia:{passive3:'+1 niveau d’attaque normale à toute l’équipe, Tartaglia compris. Automatique, sans condition de compétence ou d’ultime ; les multiplicateurs des talents sont recalculés.'},
 Noelle:{c2:'+15 % de DGT aux chargées de Noëlle et consommation d’endurance réduite de 20 %. Effets personnels automatiques.'},
};
