# Suite des demandes Astralis — 11 novembre 2026

## Palette globale — recherche française et clavier accessible — 15 novembre 2026

- Les recherches globales ignorent désormais les accents et comprennent les ligatures; les mots partiels et les noms compactés sont trouvés.
- Tab et Maj+Tab parcourent en boucle les contrôles de la fenêtre de navigation rapide, sans bloquer l’utilisateur dans le champ.
- Vérification : tests unitaires de normalisation et recherche, parcours Chromium du résultat « voeux » → « Vœux », circulation clavier, Échap et écran mobile; aucune erreur JavaScript.
- Suivi supplémentaire : 19/500.

## Carnet de voyage : import et fusion des sauvegardes — 15 novembre 2026

- Ajout du rétablissement des archives JSON exportées depuis le Carnet de voyage. L’import fusionne les appareils, ignore les doublons et entrées invalides, et préserve les traces locales.
- Vérifications : tests unitaires des formats, dates, limites et doublons; parcours Chromium réel avec sélection du fichier et persistance; syntaxe JS validée.
- Suivi supplémentaire : 17/500.

## Transitions de navigation — 16 novembre 2026

- Un changement de page reçoit une arrivée courte et fluide; les actualisations au sein d’une page ne sont pas animées. Le réglage système « réduire les animations » est respecté.
- Vérification : Chromium valide la transition, son nettoyage, le mode réduit et les formats 1920×1080 / 390 px.
- Suivi supplémentaire : 20/500.

## Position de lecture par page — 16 novembre 2026

- Le défilement est mémorisé pour chaque page visitée. En revenant à une vue, l’utilisateur retrouve son emplacement précédent.
- Vérification : parcours Chromium du Carnet vers les tâches puis retour au défilement mémorisé; affichage desktop et mobile sans débordement.
- Suivi supplémentaire : 21/500.

## Boîte de bord : préserver la recherche pendant les actions — 16 novembre 2026

- Un rappel différé ou réaffiché ne remet plus la recherche à zéro et ne désactive plus le filtre choisi; les résultats et compteurs sont recalculés avec les critères toujours visibles.
- Vérification : parcours Chromium recherche → filtre → différer → réafficher, avec résultat exact et état du filtre accessible.
- Suivi supplémentaire : 22/500.

## Studio de session : série de régularité — 16 novembre 2026

- Ajout d’une carte indiquant les jours consécutifs avec une session terminée et le record historique. Le calcul ne pénalise pas les jours sans session et écarte les données invalides ou datées dans le futur.
- Vérification : cas unitaires de série active, interruption, meilleure série, session du jour et historique vide; parcours Chromium et contrôle du débordement mobile.
- Suivi supplémentaire : 23/500.

## Carnet : annulation sûre d’une suppression — 16 novembre 2026

- Après avoir supprimé une note, une action « Annuler » reste disponible quelques secondes. Elle restaure la note et ses détails dans son univers; une note du même identifiant ajoutée entre-temps n’est jamais écrasée.
- Vérification : parcours Chromium suppression → restauration, contrôle du contenu/épingle, collision sans perte et largeur mobile; syntaxe JS et contrôle diff validés.
- Suivi supplémentaire : 24/500.

## Polissage du planificateur — 15 novembre 2026

- L’agenda de progression calcule désormais le nombre de tâches terminées sur la semaine et par jour, avec barres de progression accessibles. Les dates affichées suivent la semaine sélectionnée et les tâches déjà terminées restent comptées.
- Vérifications : tests de calcul semaine/jours, rendu navigateur avec tâches mélangées terminées et ouvertes, export ICS, aucune erreur JavaScript.

## Polissage des équipes et du calendrier — 15 novembre 2026

- Les équipes Genshin affichent maintenant les résonances détectées à partir des éléments réellement présents : résonance doublée et Voile protecteur si les quatre éléments diffèrent. Les emplacements vides et éléments inconnus ne déclenchent pas de faux résultat.
- La fiche d’un événement Genshin lisait une variable hors de sa portée et provoquait une erreur au clic. La liste des rappels est maintenant relue localement à l’ouverture de la fiche.
- Vérifications : tests unitaires des résonances, parcours navigateur des équipes et du calendrier, ouverture de la fiche événement, aucune erreur JavaScript.

## Suivi de farm individuel au tableau de bord — 15 novembre 2026

- Le widget de farm Genshin est maintenant disponible dans la disposition du tableau de bord. Pour une session partagée, chaque portrait est une case individuelle; le résumé passe de 0/N à N/N, et la session entière n’est terminée qu’après la dernière coche. Les sessions à un seul personnage conservent leur bouton « Fait ».
- Vérifications : tests des états partiels, complets et rétablis; parcours navigateur réel 0/2 → 1/2 → 2/2; aucune erreur JavaScript.

## Livraison Star Rail — 13 novembre 2026

- Ajout d’un espace HSR séparé avec un tableau de bord Star Rail dédié et Currency Wars, en plus des pages de builds à six reliques, laboratoire de dégâts, Calc Sheets, farm, endgames, Warp, agenda et archives.
- Le tableau de bord HSR présente les trois ressources de Warp, une checklist quotidienne qui se renouvelle à 04:00 local, les équipes Star Rail enregistrées, le roster et les raccourcis vers les outils du jeu.
- Currency Wars possède un suivi de saison 4.7 : roster personnel limité à dix employés, bonds à surveiller, points hebdomadaires et d’ascension, historique des runs, premières victoires et rappels de reset configurables. Les compteurs se remettent automatiquement à zéro lors du reset hebdomadaire local choisi; les données de jeu restent saisies/confirmées manuellement.
- Réparation des icônes HSR : les slugs internes des personnages ne sont plus traités comme des chemins. Les portraits de personnages, cônes, reliques et objets pointent vers les catégories d’assets valides, avec un fallback visuel.
- Les reliques proposent des statistiques principales cohérentes avec chacun des six emplacements. Les builds, comparaisons, objectifs, sessions d’endgame, agendas, rotations, pity et ressources sont enregistrés localement et inclus dans la sauvegarde Astralis.
- Le laboratoire expose les entrées du calcul, les résultats CRIT/non-CRIT, la défense et résistance ennemies, pénétration, réduction, vulnérabilité, rupture et séquences à plusieurs impacts. Les champs de calcul restent éditables et leurs résultats sont recalculés à la saisie.
- Les nouvelles pages ont une navigation et une feuille de style propres à Star Rail ; elles n’emploient pas les coûts de farm, pièces ou formules de Genshin.
- Vérifications effectuées : analyse syntaxique des modules app/HSR, contrôle des espaces du diff, rendu de fumée des dix routes avec un catalogue simulé et vérification HTTP des chemins d’icônes personnage, cône, relique et matériau.

### Limites HSR à poursuivre

- Les multiplicateurs de talents sont saisis par l’utilisateur ; ils ne sont pas encore reliés automatiquement au niveau, au kit et aux Eidolons du personnage.
- Les stats du build HSR sont des valeurs observées saisies manuellement. Il reste à les recalculer depuis niveaux, cône, six reliques, sets, buffs et passifs.
- Les conditions de sets/cônes, buffs d’équipe, debuffs, déclenchements, ordres de vitesse et rotations complètes ne sont pas encore simulés dans le laboratoire.
- Les dates d’événements/endgame et la progression de farm sont des suivis locaux saisis par l’utilisateur, sans flux automatique ni calendrier de disponibilité des Calices.
- Calc Sheets conserve les résultats et comparaisons de base, mais n’a pas encore l’éditeur/export complet ni l’ensemble des vues spécialisées de la page Genshin.

## Livré dans cette révision

- Portefeuille de vœux éditable : primogemmes et destinées séparées, journal des gains, raccourcis de récompenses, protection contre les doubles crédits, graphiques 7/30/90 jours et répartition mensuelle. Les ajustements de solde ne sont pas pris pour des revenus.
- Date de garantie calculée avec les récompenses à leur date ; cartes de scénarios de pertes, paramètres d’exploration et cadeaux explicites. Aucun cadeau de carte inventé automatiquement.
- Actualités réservées aux sources officielles HoYoverse/HoYoLAB ; le calendrier est indépendant du fil. Versions estimées signalées, endgames et bannières séparés des objectifs de farm.
- Navigation datée des rotations endgame, conservation des compositions publiées et archivage local. Une composition absente n’est pas copiée depuis une autre rotation.
- Objectifs d’aptitudes avec portraits ; jours de domaine valides surlignés ; réservation des jours manuels ; trois boss hebdomadaires différents peuvent accompagner une semaine de farm.
- Fiches de personnages : icônes des passifs et onglet des builds enregistrés. Lore : typographie, couleurs, vidéos et absence de débordement horizontal harmonisées.
- Répertoire des descriptions des armes R1–R5, sets et kit chargé ; recherche et téléchargement JSON.
- Optimiseur : inventaire utilisateur par défaut, pièces verrouillées incluses sauf exclusion explicite, recherche/position directe dans les priorités, application des sets recommandés.
- Les paliers de sous-stats suspects restent un diagnostic et ne rendent plus inutilisable une pièce structurellement exploitable.
- Trois JSON fournis par l’utilisateur conservés comme fixtures de régression.
- Actualisation des tables numériques chaque jour, exports Celestia toutes les six heures, pendant l’ouverture du serveur local. Échec réseau : conservation des fichiers précédents. Les nouveaux exports gardent le badge Nouveau jusqu’à consultation.

## Validation

163 tests unitaires JavaScript et 5 tests Python passent. Les parcours navigateur `rest_workshop_browser.py`, `site_planning_browser.py`, `relations_browser.py`, `lore_browser.py` et `lab_browser.py` ont été exécutés. Le dernier inclut la sauvegarde TC, le calcul et le téléchargement PNG. Les tests Python couvrent les routes d’export, l’archivage daté et l’intervalle de maintenance. Les tests unitaires couvrent aussi les conversions de matériaux, réactions et inventaires GOOD/Enka.

Pour les mécaniques avancées de Skirk et des plumes, voir [TEST-SKIRK.md](TEST-SKIRK.md).

## Limites explicites

- L’archive publique historique peut répondre HTTP 403. Les dates/compositions non récupérées sont indisponibles, sans composition inventée.
- L’actualisation Celestia et des tables nécessite le serveur Python ouvert et le réseau. Les tests de maintenance vérifient son déclenchement ; ils ne garantissent pas la disponibilité permanente des services distants.
- Le répertoire des effets est plus large que la liste des mécaniques automatiquement calculées. Les descriptions complexes non modélisées demandent des buffs personnalisés explicites. Cette livraison ne certifie pas l’exhaustivité de tous les kits et constellations du jeu.
- L’exhaustivité de toutes les relations de lore dépend des preuves disponibles. Ce travail de présentation ne transforme pas une hypothèse en relation attestée.

Relancer le serveur local pour charger les nouvelles routes Python ; le cache de l’application est renouvelé automatiquement.
## Arcade créative — 14 novembre 2026

Objectif du chantier continu : ajouter au moins 100 fonctionnalités nouvelles, concrètes et distinctes, dont au moins 20 chantiers majeurs. Le décompte portera sur des fonctions réellement intégrées, pas sur des variantes de présentation.


- Le compagnon interstellaire propose trois jeux intégrés : Tetris avec les portraits du roster actif, et une esquive d’astéroïdes pilotable au clavier, à la souris ou au tactile.
- L’arcade suit le jeu actif (Genshin, Honkai: Star Rail ou Wuthering Waves), conserve les records et l’ambiance choisie, et propose un défi quotidien avec progression locale.
- Trois ciels sont disponibles : Nébuleuse, Aurore et Voie dorée. L’esquive se met automatiquement en pause lorsqu’on revient au Tetris ou que l’onglet de jeu est masqué.
- Cabinet de huit insignes persistants partagé par les trois jeux : lignes et score au Tetris, temps de survie en esquive. Chaque insigne se débloque une seule fois et la collection est rechargée à la réouverture de l’arcade.
- Le Tetris et l’ambiance sonore se suspendent quand l’application passe en arrière-plan ; le jeu reprend à l’ouverture si la pause était automatique. La pause manuelle reste intacte.
- L’ambiance musicale procédurale reste coupée par défaut et s’active à la demande. Les impacts, les lignes complétées, les commandes maintenues sur écran tactile et la réduction des effets hors écran sont raccordés aux interactions du jeu.
- Vérification interactive Chromium : mouvements/rotation Tetris, activation audio, changement d’ambiance, esquive au clavier, pause/reprise automatique, progression du défi, rendu Wuthering Waves et roster compagnon ; les parcours ont passé le contrôle.

- Nouveau mini-jeu quotidien de mémoire des constellations : plateau déterministe par univers et date, portraits des personnages, chronomètre, record sauvegardé, pause en arrière-plan et deux insignes déblocables.

- Nouveau carnet de voyage général : journal local des pages explorées dans les trois univers, série de jours actifs, carte d’activité sur six semaines, insignes de découverte, notes personnelles et export JSON. L’effacement reste local et laisse le carnet réellement vide.
- Nouveau studio de session : minutage persistant entre les pages et après fermeture, sessions par univers/type (farm, boss, build, équipe, exploration ou libre), liste d’étapes cochables, pause/reprise, historique privé, statistiques du jour/semaine et export JSON.
- Nouvelle cabine des connaisseurs : quiz quotidien distinct pour chacun des trois jeux, questions générées depuis les éléments réellement présents au catalogue, portraits cliquables, explication de la réponse, scores par jeu, meilleur score et série de jours en stockage local. Une question exclut les autres personnages qui partagent le même indice afin que les quatre choix n’aient pas plusieurs réponses justes.
- Nouveau centre Énergie & récupération : suivi privé des réserves de Résine, Puissance pionnière et Piles d’ondes, récupération minute par minute, jauge circulaire, estimation du prochain point et du plafond, réglage de la capacité/vitesse/seuil par jeu et correction rapide après une dépense.
- Vérification du quiz : génération contrôlée de cinq questions et vingt choix au total pour Genshin, Star Rail et Wuthering Waves. Parcours navigateur complet Star Rail terminé avec 5/5 et résultat conservé après rechargement.
- Vérification du centre d’énergie : analyse syntaxique des deux nouveaux modules, contrôle d’intégration navigation/rendu/cache, à compléter par un parcours interactif.
- Nouveau puzzle élémentaire quotidien à 7 × 7 dans l’arcade : associations de trois éléments, échanges voisins, cascades avec multiplicateur, objectif de score, records locaux par univers, redémarrage quotidien identique, commandes clavier et icônes d’éléments propres à chaque jeu. Deux insignes supplémentaires portent le cabinet à dix.
- Vérification navigateur sur l’application servie par `server.py` : 49 cases rendues, onglet et vue activés, échange valide détecté et joué (+150 points, 18 → 17 coups), sélection au clic, redémarrage réinitialisé, 10 insignes affichés, aucune erreur JavaScript.
- Nouveau jeu « Pulse de l’ultime » dans l’arcade : 18 pulsations quotidiennes déterministes, tempo distinct selon l’univers, quatre voies jouables au clavier ou au toucher, jugements de timing, combo multiplicateur, précision, records par jeu et pause conservée lors d’un changement de mode. Deux insignes complètent le cabinet à 14.
- Vérification interactive complète sur Wuthering Waves : morceau terminé à 100 % de précision, combo ×18, 1 912,5 points, résultat de maîtrise visible. Le profil local a été restauré après le test.
- Nouvelle palette de commandes universelle (Ctrl+K / Cmd+K et bouton visible) : recherche des destinations réelles présentes dans la navigation, changement direct d’univers, filtre immédiat, destinations récentes mémorisées localement, déplacement haut/bas, validation Entrée, fermeture Échap et focus clavier. Le module évite les listes de routes dupliquées en les lisant directement dans le menu courant.
- Nouveau poster de résultat du défi rythmique : génération d’une carte PNG haute résolution aux couleurs du jeu actif, avec score, précision circulaire, meilleur combo et date du défi. Après la partie, un seul bouton télécharge la carte et tente aussi de la copier dans le presse-papiers; si l’accès presse-papiers est refusé, le téléchargement reste disponible.

- Nouveau mode focus pour les widgets du tableau de bord : agrandissement plein écran, déplacement du widget vivant (ses boutons et son état restent actifs), fermeture par Échap ou clic extérieur, retour clavier à la bonne commande, navigation mobile et respect de la réduction des animations.

## Nouvelle fonctionnalité — Refuge interstellaire du compagnon

- Ajout d’un refuge animé au profil Compagnon : portrait du personnage sélectionné, humeur selon l’heure locale, niveau d’affection, série quotidienne et meilleur score.
- Mini-jeu « Attrape les étoiles » jouable à la souris, au tactile ou au clavier. Une partie de 20 secondes par jour peut apporter jusqu’à 30 XP ; les parties suivantes servent à battre son record sans récompenser davantage.
- Progression stockée uniquement sur l’appareil, mise en page adaptée aux petits écrans et animations réduites si le système le demande.
- Vérification interactive terminée dans l’application : le profil sélectionné s’affiche, la partie démarre, une étoile capturée incrémente le score, le résultat termine le rituel, met à jour le niveau/XP et désactive la récompense quotidienne. Aucun erreur JavaScript dans la console.

## Nouveau mini-jeu — Flipper astral

- Ajout d’un flipper spatial jouable dans l’arcade, avec table dessinée en canvas, bumpers à rebond, palettes contrôlables au clavier et au toucher, trois billes, combo jusqu’à ×8, effets de collision, score et records locaux par univers.
- Défi quotidien à 4 200 points et trois insignes liés aux collisions, au score et à l’objectif quotidien. La partie est mise en pause quand on quitte l’onglet du jeu ou que l’application passe en arrière-plan.
- Vérification interactive terminée dans Chromium isolé : ouverture de la table, lancement, rebonds détectés, score monté à 590, vies mises à jour de 3 à 2, pause et reprise validées. Aucune erreur console. Le contrôle initial a aussi permis de corriger un import d’arcade déclaré deux fois.

## Nouveau studio — Paysages sonores interstellaires

- Ajout d’un studio global accessible depuis la barre supérieure, avec quatre profils sonores (Teyvat, Express, Mer de résonance et profil personnel) et six couches indépendantes : drone cosmique, vent, pluie de météores, poussière lumineuse, moteur et carillons.
- Chaque couche et le volume général se règlent en direct. Les profils, niveaux et arrêt programmé (15, 30 ou 60 minutes) sont conservés localement. Le son reste coupé tant que l’utilisateur ne le lance pas; la fenêtre prend en charge Échap, le focus clavier et les petits écrans.
- Vérification interactive Chromium : les quatre préréglages, le réglage d’une couche, le passage au profil personnel, la mémorisation après fermeture/réouverture, le lancement audio avec minuterie et l’arrêt ont été parcourus. Aucun avertissement ni erreur dans le module corrigé.

## Nouveau jeu — Tracé stellaire
- Défi quotidien de logique ajouté à l’arcade : relier 12 étoiles en un chemin continu, sans revisiter un nœud, du point de départ à l’arrivée. Le graphe reste identique pour les trois univers pendant la journée et change à la date locale suivante.
- Chronomètre avec pause automatique quand l’onglet du jeu ou l’application est masqué, trois indices, retour d’un pas, parcours tactile et clavier, score pénalisant le temps et les indices, records locaux et deux insignes.
- Le panneau explique les règles, met en évidence les étoiles traversées, marque le départ et l’arrivée, et affiche le résultat de victoire sans animation si la réduction des mouvements est active.
- Vérification interactive Chromium : route hamiltonienne trouvée sur le plateau affiché, victoire à 12 étoiles, score et record enregistrés, défi verrouillé après victoire, aide et annulation du premier pas. Aucune erreur console durant le nouveau parcours. Les données temporaires de test ont été effacées.


- Nouveau contrat astral quotidien en trois objectifs jouables : effacer 3 lignes au Tetris, résoudre une constellation et vaincre un boss. Les événements de fin réels mettent à jour la progression locale; compléter les trois actes ajoute une seule fois 10 boosters au portefeuille, par jeu et par date.
- Vérification Chromium : panneau présent pour Genshin, objectifs progressant avec les événements de jeu, récompense remise une seule fois, cache hors ligne mis à jour. Vérifications syntaxiques et contrôles du diff réussis.


- La Mémoire des constellations peut maintenant produire une fiche PNG de résultat partageable : coups, temps, taux de réussite et paires réunies. L’export réutilise le moteur commun des fiches Arcade, télécharge l’image et la copie dans le presse-papiers lorsque le navigateur l’autorise.
- Vérification Chromium : partie réelle terminée, bouton activé à la victoire, PNG générée dans les téléchargements et confirmation de copie presse-papiers affichée.


- Nouveau mini-jeu logique dans l’Arcade : le Décodeur astral demande de retrouver un code de quatre sceaux en six essais. Les indices distinguent les sceaux bien placés, déplacés ou absents; doublons autorisés et traitement exact des occurrences répétées. Le code est déterministe par date et univers, avec historique de partie, révélation finale, score et série de victoires sauvegardés localement.
- Vérification Chromium : onglet sélectionnable, panneau visible, six sceaux et quatre cases accessibles, sélection et effacement clavier fonctionnels, animation orbitale chargée. Vérifications logiques : stabilité du code quotidien et calcul d’indices avec doublons. Aucun essai n’a été soumis, donc le défi quotidien du profil est resté intact.

## Deux nouveaux modes d’arcade — 14 novembre 2026

- « La voie des reliques » : roguelite quotidien de trois combats, main de cartes, énergie, garde, intention ennemie annoncée, récompense à choisir entre les étages et record par univers. Le défi du jour reste identique pendant la journée et sa progression est enregistrée localement après les actions du joueur.
- « Hangar d’expéditions » : sélection d’une route et d’un équipage de 1 à 3 personnages du roster; la durée réelle avance même application fermée, avec compteur de progression, bonus pour la diversité de l’équipe, récompenses d’arcade locales et journal récent.
- Vérification Chromium : onglets sélectionnables, rendu des deux nouveaux panneaux, cartes de la main, itinéraires, portraits et listes de personnages; vérification syntaxique des modules concernés. Le cycle complet d’une expédition chronométrée reste à parcourir jusqu’à une récompense.

## Observatoire de progression
- Ajout d’un observatoire général accessible depuis le menu latéral, commun à Genshin, Star Rail et Wuthering Waves.
- Relevés quotidiens gardés uniquement sur cet appareil : roster possédé, équipes et builds sauvegardés, objectifs terminés, énergie estimée et ressources associées. Les relevés s’actualisent à l’ouverture, aux changements locaux et au passage du jour; l’historique est limité aux 180 derniers jours et commence à l’installation de cette fonctionnalité, sans données historiques inventées.
- Courbe consultable sur 7, 30, 90 ou 180 jours, sélection de l’indicateur, jalons personnels avec progression et export CSV des relevés.
- Fenêtre responsive, commandes clavier, fermeture Échap, réduction des animations et prise en charge hors ligne.

## Nouveau jeu — Gravité zéro · 14 novembre 2026
- Défi orbital jouable ajouté à l’arcade : ajuster un cap et une impulsion, suivre une trajectoire soumise à l’attraction d’un astre, récupérer trois fragments puis rejoindre la station. Le parcours est déterministe par univers et jour; le record et les essais restent enregistrés localement.
- Le tracé pointillé donne une prévision avant le lancement; les commandes sont verrouillées pendant le vol, puis libérées au résultat. Le vol peut être mis en pause en changeant de mode ou en masquant l’application, et reprend au retour. Raccourcis : Espace pour lancer, R pour recentrer.
- Le module et son style sont ajoutés au cache hors ligne; les versions de cache navigateur sont distinctes pour que l’onglet apparaisse après mise à jour. L’en-tête classe maintenant le jeu comme défi quotidien.
- Vérifications : 30 parcours générés (10 jours × 3 univers), chacun atteint la station et les trois fragments avec les paramètres solution; `node --check` passe sur le jeu, l’arcade, l’application et le service worker. Les paramètres d’ouverture n’emportent aucun défi d’emblée (0/30 réussites).

## Nouveau jeu — Atterrissage lunaire · 14 novembre 2026
- Pilotage manuel distinct des autres jeux : incliner la navette, gérer poussée et inertie, surveiller le carburant et poser l’appareil sur une plateforme étroite. La gravité, un léger vent quotidien et la position de la plateforme varient selon l’univers et la date.
- Commandes clavier et tactiles, vitesse/carburant/angle lisibles en vol, limites de sécurité explicites, records de poses conservés par univers. Le vol se met en pause lorsque l’application ou l’onglet est masqué.
- Intégré aux onglets de l’arcade, aux consignes de mode, au nettoyage des animations et au cache hors ligne (v168).
- Vérifications : monde quotidien reproductible, différence entre univers, accélération gravitationnelle, poussée, consommation de carburant, atterrissage valide, crash à vitesse excessive et rendu de l’interface; syntaxe vérifiée pour les modules touchés.

## Nouveau jeu — Prospection d’astéroïdes · 14 novembre 2026
- Plateau quotidien de 30 cases et génération déterministe distincte par univers; le joueur extrait cinq filons avec 14 charges de forage et une coque à trois points. Les poches instables endommagent la foreuse.
- Deux outils ont des coûts et informations différents : le forage révèle minerai, roche ou danger; le scanner dépense deux charges et affiche les filons voisins. Score local, meilleur score par univers, redémarrage du même secteur, commandes accessibles et prise en charge tactile.
- Intégré comme mode indépendant de l’arcade, aux textes d’aide, au nettoyage du montage et au cache hors ligne (v169), avec animations de découverte réduites selon la préférence système.
- Vérifications : distribution sans recouvrement (5 filons + 5 dangers), stabilité quotidienne, différence d’univers, indices et coût du scanner, refus d’un scan doublé, extraction gagnante, destruction de la coque, rendu du panneau et syntaxe des modules liés.

## Passeport stellaire — transfert des records · 14 novembre 2026
- Ajout d’un panneau d’archive à l’arcade qui répertorie les catégories de records/insignes effectivement présentes, le nombre de valeurs et la taille estimée.
- Export JSON local et import sur une autre installation avec aperçu puis fusion volontaire. Le format n’accepte qu’une liste de clés d’arcade autorisées, limite la taille à 1 Mo, ignore les clés externes et conserve le meilleur nombre ainsi que les historiques combinés. Aucun profil ni contenu extérieur à l’arcade n’est exporté.
- Intégration au menu, au cache hors ligne v170 et à la mise à jour des records lors de l’ouverture du panneau.
- Vérifications isolées : collecte via stockage simulé, allowlist, données étrangères ignorées, schéma invalide refusé, fusion des meilleurs résultats et insignes, génération du panneau; syntaxe et références d’intégration/cache vérifiées. Les vérifications n’ont pas touché aux données du profil réel.
- Contrôle navigateur supplémentaire : une erreur de syntaxe dans la nouvelle chaîne de textes empêchait le démarrage de l’application. Elle est corrigée; le parseur ESM charge maintenant l’arcade et son rendu contient les modes Atterrissage, Prospection et Passeport. Rechargement Chromium : l’application revient au tableau de bord sans écran d’erreur.

## Mode diffusion — présentation et confidentialité
- Nouveau bouton transversal dans la barre supérieure, avec raccourci Ctrl + Maj + B.
- Trois commandes indépendantes et mémorisées localement : flouter le profil/les ressources/UID pendant la diffusion, masquer le rail pour une scène épurée, et afficher un indicateur « En direct ». Le plein écran et le retour à l’affichage normal sont accessibles depuis la fenêtre.
- Aucun profil ni compteur n’est modifié : le masquage est uniquement visuel et s’enlève en désactivant l’option. Fenêtre native accessible, utilisable au clavier, adaptée au mobile et compatible avec prefers-reduced-motion.
- Vérifications : parsing ESM du module et de l’application, syntaxe du service worker, présence du module et de son style dans le cache hors ligne v171.


## Atlas d’exploration personnel
- Nouvelle page commune aux trois univers : relevé de progression par zone, catégories de collecte adaptées à chaque jeu, repère personnel, suppression/ajout de zones et historique daté avec courbe de progression.
- Les données restent locales et séparées par jeu. Les régions préremplies servent de points de départ et peuvent être complétées par des zones personnalisées.
- Affichage responsive, curseurs avec mise à jour immédiate, cases accessibles et réduction des animations; module et style ajoutés au cache hors ligne v175.
- Vérifications : parsing des modules, rendu des trois univers, ajout et suppression de zone, progression au curseur, repère personnel, relevé daté et journal contrôlés dans le navigateur.

- Extension de l’Atlas : filtre instantané des zones, sauvegarde JSON par univers, import validé contre le schéma et l’univers choisis, et effacement de l’historique. Un même clic ne peut plus dupliquer un relevé.
- Vérification navigateur : ajout/retrait, progression, relevé unique et recherche testés; parsing ESM et service worker valides. Les deux relevés créés pendant le test ont été nettoyés via la nouvelle commande d’historique.

- Nouvel outil d’objectif par zone : cible d’exploration et échéance personnalisées, estimation du pourcentage à gagner par jour, statut atteint ou retardé. Les champs sont inclus dans l’export/import JSON.
- Contrôles statiques après cette extension : analyse ESM de l’application et des modules, cache hors ligne v176 et rendu des commandes Atlas pour les trois jeux.

## Boîte de bord locale — centre de rappels
- Nouvelle entrée dans la barre supérieure, avec compteur de rappels proches, filtres par type et fenêtre responsive accessible.
- Regroupe les tâches datées des trois jeux, événements Genshin épinglés (et échéances endgame imminentes), objectifs d’exploration à échéance et seuils d’énergie bientôt atteints ou prêts.
- Actions directes : terminer une tâche, ouvrir le calendrier/l’atlas/le centre d’énergie, ou reporter un rappel de 24 h. Tout est calculé et stocké localement; aucune permission de notification système n’est demandée.
- Module et style ajoutés au cache hors ligne v177.
- Vérifications finales : parsing ESM de `app.js` et du module, syntaxe du service worker et `git diff --check` valides. Test isolé avec stockage fictif : tâches, événement suivi, objectif Atlas, énergie proche du seuil, échéance endgame filtrée hors fenêtre, compteur et état vide vérifiés.
- Vérification dans l’application rechargée : le tableau de bord affiche `Boîte de bord · 1 rappel(s) proche(s)`, la fenêtre liste l’échéance Spiral Abyss, le filtre « Prioritaires » répond et le bouton « Calendrier » ouvre la page Actualités & événements. Aucun profil ni tâche réelle n’a été modifié.

## Rituels & objectifs personnels — 14 novembre 2026
- Ajout d’un widget facultatif au tableau de bord : rituels quotidiens et hebdomadaires par univers, jauges distinctes, série de jours validés et objectifs personnalisés.
- Les tâches préremplies sont modifiables; l’utilisateur peut ajouter jusqu’à 20 objectifs, choisir leur fréquence et les retirer. Les validations quotidiennes/hebdomadaires se réinitialisent selon la date locale; les données restent séparées par jeu et sur l’appareil.
- Le widget s’ajoute depuis le catalogue du mode édition pour ne pas écraser une disposition existante. La checklist HSR dédiée reste disponible dans son espace personnalisé.
- Vérification en navigateur : widget ajouté puis retiré via le catalogue, objectif de test créé et supprimé, compteurs recalculés, éditeur refermé; la disposition utilisateur a retrouvé son état antérieur. Vérifications de syntaxe ESM et de cohérence du diff effectuées après modification.

## Tableau de bord HSR — objectifs hebdomadaires personnalisables · 14 novembre 2026
- Extension du poste de commandement Star Rail : ajout d’une route hebdomadaire avec objectifs de boss, endgame et Currency Wars, barre de progression, objectifs personnels ajoutables (libellé et détail), retrait de tâches et sauvegarde locale.
- Les coches de la semaine se réinitialisent le lundi à 04:00, sur la base de l’heure locale, en cohérence avec le reset défini dans l’espace Star Rail. La checklist quotidienne actuelle reste intacte.
- Vérification en navigateur : l’objectif temporaire est apparu dans le panneau, la progression est passée à 25 % puis revenue à 0 % après décochage; l’objectif a ensuite été supprimé et le compteur est revenu à 0/3. Les données de test ont été nettoyées.
- Modules vérifiés : parsing de l’espace HSR, de l’application et du service worker; cache avancé à v179; `git diff --check` passe.

## Historique des builds · 14 novembre 2026
- Dans Mes builds, ajout d’instantanés manuels avant les changements importants, d’une comparaison champ par champ avec le build actuel et d’une restauration en un clic.
- L’historique garde jusqu’à 8 versions par build et 80 au total. Les images de fond et images personnelles des pièces ne sont pas recopiées dans les instantanés; elles sont conservées lors d’une restauration.
- Ressource ajoutée au cache hors ligne; version du cache avancée à v180.

## Centre de récupération · dépenses rapides · 14 novembre 2026
- Ajout de raccourcis de dépense de 20, 40 et 60 points dans le compteur d’énergie, plus un montant personnalisé. Les trois jeux sont concernés; la dépense reste plafonnée à zéro et relance la régénération depuis l’heure de l’ajustement.
- Cache hors ligne avancé à v181; ressource et style ajoutés au précache.
- Vérifié au démarrage dans Astralis : les raccourcis et le formulaire sont visibles. Contrôle fonctionnel isolé : 100 → 60 (raccourci −40) → 45 (montant personnalisé 15). Syntaxe des modules et git diff --check validés.

### Historique des builds — précision de comparaison · 14 novembre 2026
- Les instantanés contiennent désormais les noms lisibles d’armes/sets et les statistiques calculées du build, en plus des valeurs saisies; la comparaison expose les changements de set 2 + 2.
- Avant une restauration, l’état courant est automatiquement conservé comme nouvel instantané. L’identifiant du build est conservé pour que les équipes enregistrées et exports continuent de le référencer.
- Cache avancé à v182.

- Nettoyage lié : supprimer un build supprime aussi ses instantanés, sans toucher à ceux des autres fiches.

## Centre de récupération — journal et annulation · 14 novembre 2026
- Les dépenses rapides et ajustements ±1 sont maintenant consignés dans un journal local compact, séparé pour chaque jeu et limité aux huit dernières actions.
- « Annuler la dernière » restaure le stock qu’il aurait atteint si cette dernière opération n’avait pas eu lieu, en tenant compte de la régénération écoulée et du plafond. Aucun historique du compte n’est envoyé ni créé pour les mises à jour manuelles du stock.
- Vérification isolée du module : dépense −40 journalisée, annulation après 16 minutes de régénération restaurant le stock corrigé de +2, historique vidé, autre univers intact. Le rendu contient le journal; `node --check` et `git diff --check` passent.

## Palette universelle — actions directes · 14 novembre 2026
- Ctrl+K recherche aussi les actions qui sont réellement disponibles sur la page active : créer tâche/note/équipe/build/calcsheet ou tirer une équipe aléatoire. Chaque résultat appelle le bouton existant; aucune action cachée ou non disponible n’est inventée.
- Les mots-clés (« objectif », « mémo », « reliques », « dégâts », « hasard »…) donnent des entrées naturelles. Les actions sont visuellement différenciées des pages et restent accessibles au clavier avec Entrée.
- Cache hors ligne et paramètres de chargement actualisés en v185.
- Vérification navigateur : depuis « Tâches & objectifs », Ctrl+K affiche « Créer une tâche »; recherche du mot-clé « objectif » puis activation ouvre bien l’éditeur. Fermeture par « Annuler » : le compteur reste à 0, aucune tâche de test n’a été sauvegardée.

## Mes builds — duplication de variantes · 14 novembre 2026
- Ajout de « Dupliquer le build » : la variante reprend les statistiques, arme, reliques, notes, réglages visuels et données de chaque pièce, puis reçoit un identifiant et un nom uniques. Les modifications de la copie restent indépendantes.
- La commande est aussi accessible via Ctrl+K quand l’éditeur d’un build est ouvert.
- Les actions principales de l’éditeur sont traitées dès la capture du clic pour rester fiables après les rerendus; création, sauvegarde, suppression et export passent par le même flux.
- Cache hors ligne avancé en v188; références de chargement actualisées.
- Vérification dans l’application : création d’un build témoin, ajout d’un nom et d’une note, duplication. La copie a reçu le nom « Contrôle copie (copie) » et conservé la note; suppression des deux fiches de test puis retour confirmé à zéro build. `node --check` passe pour les modules touchés et `git diff --check` passe.

## Mes builds — comparaison côte à côte · 14 novembre 2026
- Pour un personnage ayant plusieurs builds, un panneau compare les statistiques calculées et l’équipement, avec sélection d’une référence. Il affiche les écarts PV/ATQ/DÉF/maîtrise/Recharge/CRIT/bonus de dégâts et repère les différences de pièces, de sous-stats, d’arme et de sets.
- La comparaison reste descriptive : elle ne prétend pas qu’une valeur supérieure est meilleure pour chaque rotation. Si des statistiques d’arme manquent, elles sont chargées comme dans l’éditeur de build.
- Cache hors ligne avancé à v190 et chargement des styles mis à jour.
- Vérification dans l’application : deux builds temporaires comparés; 15,0 % contre 20,0 % de taux CRIT affiche correctement −5,0 %, et la différence de sous-stat de la Fleur est identifiée. Les deux builds témoins ont ensuite été supprimés; le sélecteur est revenu à « Nouveau build » uniquement. `node --check src/app.js` et `git diff --check` passent.

## Équipes — répétiteur de rotation · 14 novembre 2026
- Ajout d’un panneau d’entraînement dans chaque rotation sauvegardée : étape courante, portrait et icône de compétence, progression, précédent/suivant, recommencer, lecture automatique et tempo réglable de 0,5 à 4 secondes.
- Les séquences encadrées comme combo sont déroulées selon leur nombre de répétitions, sans dépasser 180 actions. Le tempo choisi est conservé localement. Clavier : Espace pour avancer, flèches pour naviguer, Échap pour mettre en pause.
- Le rendu ne réinitialise pas les images à chaque rafraîchissement de la barre de progression ; prise en charge du mouvement réduit et petite mise en page mobile.
- Vérification locale dédiée : affichage des deux étapes, tempo 0,5 s, progression automatique jusqu’à « Rotation terminée », raccourci clavier, absence d’erreurs console. `node --check` sur les modules touchés et `git diff --check` passent.
- Le cache hors ligne passe en v191 et précharge le composant et son style.

## Equipes — répétiteur guidé et rayon Celestia · 14 novembre 2026
- Ajout d’un répétiteur de rotation à chaque fiche d’équipe : lecture automatique, tempo réglable, navigation manuelle, raccourcis clavier, progression et répétition des segments de combo.
- La page Équipes Genshin expose maintenant les 382 équipes locales Celestia sous un rayon repliable, filtrable, avec étiquette « Nouveau » par fichier et nom de set lorsqu’il est connu. Un clic enregistre l’export dans les configurations du laboratoire puis ouvre l’éditeur d’équipe ; les équipes personnelles restent séparées.
- Vérification dans le navigateur : répétiteur à deux étapes, tempo 0,5 s et progression automatique jusqu’à la fin ; rayon local chargé avec 382 éléments et nouveaux repères. Aucun export n’a été importé pendant le contrôle.
- `node --check` sur les modules touchés et `git diff --check` passent. Le cache hors ligne est avancé à v192.

## Carnet — capture rapide depuis toutes les pages · 14 novembre 2026
- `Alt + Maj + N` ouvre directement une note du jeu actif, sans quitter la page ; si une fiche de personnage est sélectionnée, la note lui est associée automatiquement.
- Le raccourci ignore les champs de saisie et ne s’active pas par-dessus une modale ouverte. Le carnet et l’action de note rapide sur le tableau de bord affichent le raccourci.
- `node --check src/app.js` et `git diff --check` passent. Le cache hors ligne passe en v193.

## Palette universelle — personnages récents · 14 novembre 2026
- La recherche Ctrl+K conserve maintenant les huit dernières fiches de personnages ouvertes, tous univers confondus, et les propose en tête de la palette vide (cinq affichées). Les données restent dans le stockage local.
- Contrôle navigateur : recherche « Furina » affiche une seule destination identifiée Genshin; activation ouvre bien la fiche. Après fermeture et rechargement de l’application, Furina réapparaît en tête comme personnage récent. Aucun changement de collection ni de build.
- Cache hors ligne avancé à v195; références de chargement actualisées.
- Contrôles : node --check sur src/app.js et src/command-palette.js, puis git diff --check sur les fichiers modifiés; tout passe.

## Navigation mobile compacte · 14 novembre 2026
- Ajout d’une barre fixe à cinq accès rapides (Accueil, personnages, équipes, planifier et exploration de toutes les pages). Sur mobile, les deux longues listes de la barre latérale sont remplacées par cette navigation compacte; la palette donne accès au reste du site.
- Le dock tient compte des zones de sécurité iOS, garde les cibles tactiles larges et l’état actif visible; la zone de contenu conserve une marge basse pour éviter qu’un bouton soit masqué.
- Cache hors ligne avancé à v196. Contrôle navigateur à 390 × 844 : le dock contient cinq accès et reste dans la fenêtre; « Persos » ouvre le catalogue de personnages et « Explorer » ouvre la palette. La palette et le dock ont été fermés après vérification.

## Énergie — alertes de seuil · 14 novembre 2026
- Le seuil « Me prévenir à » déclenche désormais une notification système facultative, après activation explicite et autorisation du système. La vérification reste active après avoir quitté la page Énergie tant qu’Astralis est ouvert; elle reprend au retour de l’application et ne répète pas la même alerte avant une nouvelle dépense sous le seuil.
- Les réglages et l’état de notification sont conservés séparément pour Genshin, Star Rail et Wuthering Waves. Le refus d’autorisation laisse le compteur utilisable et affiche la raison dans les réglages.
- Cache hors ligne avancé à v197; références du module et de son style actualisées.
- Vérification navigateur : les réglages affichent le nouveau choix accessible, l’application recharge sans erreur console. Vérification du déclenchement avec notification simulée : alerte au seuil, aucune répétition, réarmement après dépense sous le seuil, nouvelle alerte au prochain franchissement. `node --check` et `git diff --check` passent.

## Énergie — projection d’une prochaine session · 14 novembre 2026
- Ajout d’un estimateur par jeu : coût prévu, départ immédiat ou dans 30 min, 1/2/4/8/12/24 h. Il estime la réserve régénérée à l’heure choisie, le solde après la dépense et le temps jusqu’au plein. Si le coût ne sera pas couvert, il indique le manque et l’heure à laquelle le coût sera atteint.
- La projection se met à jour lorsque les champs changent et chaque seconde, puis le plan peut être gardé ou effacé. Aucun point d’énergie n’est déduit par cette estimation.
- Les coûts préremplis sont des valeurs de départ modifiables (Genshin 40, Star Rail 40, Wuthering Waves 60), pas des règles de jeu imposées.
- Cache hors ligne avancé à v198; module et styles versionnés.
- Contrôle navigateur à 495 px : estimateur visible, aucun débordement horizontal, aucun message d’erreur console. Calculs déterministes vérifiés pour la régénération future, le solde après dépense, le délai de retour au plein, le manque à l’heure choisie et le stock non renseigné. Les champs de test n’ont pas été mémorisés.
- `node --check` sur le module, l’application et le service worker; `git diff --check` passent.

## Énergie — échéance mémorisée et dépense confirmée · 14 novembre 2026
- Le plan de session enregistre désormais une heure de départ précise. Le compte à rebours continue après navigation ou fermeture, et une estimation passée revient à « Maintenant » au lieu de repartir de son délai initial.
- À l’échéance, l’action « Enregistrer la dépense » apparaît. Elle reste désactivée tant que le stock renseigné ne couvre pas le coût. Un clic volontaire inscrit alors la dépense dans l’historique et actualise le compteur; aucune dépense automatique n’est faite.
- L’aperçu tient compte du compte à rebours restant et les modifications non enregistrées ne peuvent pas déclencher l’action. Les anciens plans en délai relatif restent lisibles.
- Cache hors ligne avancé à v199; versions du module et du style actualisées.
- Vérifications : syntaxe des modules, scénarios déterministes avec date simulée (2 h restantes, 1 h restante, échéance passée). Le navigateur confirme l’affichage de l’estimateur sans erreur; l’automatisation de cette session n’a pas pu accéder au stockage du site pour simuler la confirmation de dépense, donc ce clic n’est pas déclaré vérifié en navigateur.
- À la réouverture, les anciennes estimations relatives sont converties en échéance fixe; les délais non standards gardent leur valeur exacte au lieu d’être arrondis au choix le plus proche.

## Tableau de bord — historique visuel des rituels · 14 novembre 2026
- Le widget « Rituels & objectifs » montre maintenant une carte de chaleur sur 35 jours : journées complètes, progression du jour et jours sans validation. Les infobulles donnent les dates et statuts précis; aucune donnée historique nouvelle n’est inventée.
- L’historique repose sur les journées déjà enregistrées par les rituels quotidiens. L’accent visuel suit la couleur de l’univers actif.
- Références de chargement actualisées; cache hors ligne avancé à v201.
- Vérification : la page d’accueil rend un seul historique, affiche les 35 jours et la légende; aucune erreur de console. Le calcul pur renvoie 35 jours consécutifs, distingue une journée partielle et marque les journées complètes à leurs dates exactes. `node --check` et `git diff --check` passent.

## Boîte de bord — rappel des sessions planifiées · 14 novembre 2026
- Les dépenses de session mémorisées dans « Énergie & récupération » apparaissent maintenant dans la boîte de bord, avec l’univers, le coût, l’heure, une estimation de réserve si les données permettent de la calculer, et un accès direct à la page Énergie.
- Les sessions dues ou prévues dans les trois prochaines heures sont prioritaires; les sessions futures restent filtrables parmi les rappels. Le rappel suit le mécanisme de report existant.
- Cache hors ligne avancé à v202; module et styles de la boîte de bord versionnés.
- Vérifications : sessions prévues et échues, rang de priorité, estimation bornée par l’heure de saisie, report masquant uniquement le rappel correspondant, présence du bouton de navigation; `node --check` et `git diff --check` passent.

## Énergie — alerte facultative pour la session · 14 novembre 2026
- L’estimateur permet maintenant d’activer un rappel système à l’heure du plan. La permission est demandée seulement après activation explicite et validation du formulaire; le plan reste utilisable si la permission est indisponible ou refusée.
- Le contrôle démarre au lancement d’Astralis et surveille les trois univers pendant que l’application reste ouverte. Une alerte est envoyée une seule fois par heure de session; modifier l’horaire crée une nouvelle échéance. Les notifications de seuil existantes gardent leur comportement.
- Cache hors ligne avancé à v203; module et style versionnés.
- Vérifications : notification absente avant l’échéance, unique à l’heure prévue, anti-doublon après persistance, nouvel envoi après changement d’heure. Dans l’application rafraîchie, l’option accessible est visible dans l’estimateur et la console reste sans erreur; `node --check` et `git diff --check` passent.

## Version téléphone Genshin et menu latéral · 14 novembre 2026
- Priorité mobile : barre supérieure réduite à l’univers actif et aux raccourcis utiles; musique, import/export, monnaies et installation restent hors de la barre étroite. Barre de navigation inférieure avec Accueil, Personnages, Équipes, Planification et recherche rapide. Le menu complet de bureau ne monopolise plus l’écran mobile.
- Un éditeur du menu Genshin permet de réordonner les liens par boutons haut/bas, masquer/afficher les pages et rétablir la disposition initiale; la configuration est locale et ne modifie pas les autres univers. Le bouton reste accessible dans la barre de marque sur téléphone et près des catégories sur grand écran.
- Les icônes d’élément des cartes sont contraintes dans leur pastille avec centrage et object-fit contain, pour éviter recadrage et débordement. Les marques Genshin ont une arrivée/interaction animée avec respect de prefers-reduced-motion.
- Chaque fiche de région Lore propose aussi un accès direct à la carte interactive officielle HoYoverse; les emblèmes régionaux du site restent ceux de la bibliothèque locale.
- Vérifications effectuées : aperçu Chrome 390×844; navigation mobile et écrans larges; contrôles de syntaxe des modules modifiés et `git diff --check`. Le cadrage mobile du tableau de bord orbital et l’audit visuel des cartes/régions restent à poursuivre.

## Studio de session — routines rapides · 14 novembre 2026
- Ajout de cinq modèles de session par univers (Genshin, Star Rail, Wuthering Waves). Chaque choix remplit le type d’activité, l’objectif et les étapes; l’utilisateur peut ensuite modifier librement chaque champ.
- Vérification : `node --check` sur `src/focus-station.js` et `src/app.js`; rendu module testé pour les trois univers, avec cinq routines chacun. La vérification visuelle automatisée a expiré sur l’onglet local; le clic réel dans le navigateur reste à confirmer.

## Atlas d’exploration — prochaine expédition suggérée · 14 novembre 2026
- L’Atlas recommande une zone à reprendre : les cibles avec date sont prioritaires, puis les zones commencées, puis la prochaine zone vierge. Si toutes les zones suivies sont terminées, il affiche un état complété.
- Le bouton « Reprendre » efface au besoin le filtre, fait défiler jusqu’à la zone, met en évidence sa fiche et place le focus sur le curseur de progression. La recommandation se recalcule en direct quand le curseur change; la date de dernière modification est alors mise à jour.
- Vérification : rendu testé pour zone vierge, échéance prioritaire et atlas terminé; `node --check` sur les modules concernés et `git diff --check` réussis. L’onglet local n’a pas répondu à l’automatisation d’aperçu, donc la présentation réelle et le clic restent à confirmer dans l’interface.

## Défi quotidien — indice bonus vérifié · 14 novembre 2026
- Chaque question permet de demander un indice complémentaire, tiré des données catalogue du personnage cible (ou, si aucune seconde caractéristique n’existe, de l’initiale et de la longueur de son nom). L’indice est mémorisé pour la journée et le bouton devient un panneau de révélation animé; la réduction des animations respecte la préférence système.
- Vérification : rendu avec indice disponible/mémorisé sur les trois univers, clic simulé de bout en bout et persistance de la caractéristique révélée; `node --check` et `git diff --check` réussis.

## Carnet de voyage — capsule de mémoire · 14 novembre 2026
- Une capsule remonte chaque jour un souvenir antérieur : note personnelle ou page visitée. Pour une visite, « Revisiter » ouvre directement la destination dans le bon univers; le texte des notes est échappé avant affichage.
- État vide tant qu’il n’existe pas d’entrée d’un jour précédent. Présentation animée avec orbites discrètes, adaptation téléphone et prise en compte de la réduction des animations.
- Au passage, suppression des préfixes `+` qui rendaient invalides les anciennes règles d’animation/média du CSS de cette page.
- Vérifications : états vide, note et visite avec bouton, échappement HTML, `node --check` sur les modules et `git diff --check` réussis. Aperçu visuel dans le navigateur non effectué.

## Planificateur intelligent — déplacement direct des tâches · 14 novembre 2026
- L’agenda hebdomadaire accepte maintenant le glisser-déposer d’une tâche vers n’importe quel jour affiché. Les objectifs du backlog peuvent aussi être déposés dans la semaine.
- Alternative clavier : focaliser une tâche puis utiliser Alt + ← / → pour la déplacer d’un jour. Les jours ciblés s’illuminent pendant le glisser; les tâches terminées ne sont pas modifiables par ces gestes.
- Vérifications : décalage de dates avant/après, validation des dates calendaires (dont rejet du 31 février), syntaxe des modules et `git diff --check` réussis. Le glisser-déposer dans le navigateur n’a pas été visuellement exercé.

## Studio sonore — arrêt programmé en fondu · 14 novembre 2026
- À la fin de la minuterie, les couches sonores diminuent progressivement pendant huit secondes avant la fermeture audio. Le bouton d’arrêt manuel reste immédiat.
- Modifier la minuterie pendant le fondu annule celui-ci et reprogramme l’arrêt; désactiver la minuterie conserve l’ambiance en cours. Le statut annonce le fondu puis la fin de la session.
- Vérifications : fonction de fondu exercée avec un AudioParam simulé (valeur de départ, durée et cible zéro), rejet d’une entrée audio absente, syntaxe et `git diff --check` réussis. Le flux complet dans l’interface et l’aperçu visuel restent à confirmer.

## Cabine des connaisseurs — historique des sept jours · 14 novembre 2026
- La page affiche maintenant une bande de progression sur les sept derniers jours, avec les scores terminés, le défi du jour en cours et les journées sans partie. L’historique conserve jusqu’à 90 résultats par univers sur cet appareil.
- Vérifications : calcul des bornes calendaires, rendu des résultats antérieurs, état « aujourd’hui » en cours et semaine vide; `node --check` et `git diff --check` réussis. Le rendu visuel dans l’application reste à confirmer.

## Studio de session — sprint de concentration · 14 novembre 2026
- Une session peut démarrer un compte à rebours de 15, 25, 45 ou 60 minutes, ou rester en chronomètre libre. Le sprint continue à travers les changements de page; pause/reprise conserve le temps restant.
- À zéro, la session est mise en pause et l’utilisateur reçoit un rappel. La jauge et le compteur sont accessibles aux technologies d’assistance.
- Vérifications : calcul du temps restant en cours, en pause et à expiration; rendu du formulaire et du compteur actif; `node --check` et `git diff --check` réussis. Rendu visuel en navigateur à confirmer.

## Tableau de bord — suivi direct des sessions de farm · 14 novembre 2026
- Les sessions planifiées pour aujourd’hui apparaissent avec les portraits de tous les personnages concernés et leurs matériaux. « Fait » les coche sans quitter le tableau de bord; une section repliable conserve l’historique du jour et permet de rétablir une session.
- Les anciennes entrées sans identifiant reçoivent un identifiant local lors de l’affichage; une donnée de calendrier mal formée est traitée comme une liste vide. Le calendrier et les personnages sélectionnés restent enregistrés comme avant.
- Vérifications : partition des tâches selon la date, complétion et rétablissement sans altérer les autres entrées, identification manquante, données invalides, syntaxe JavaScript et `git diff --check`. L’aperçu visuel dans le navigateur n’a pas été exercé.

## Équipes — compétence guidée pendant la répétition · 14 novembre 2026
- La répétition de rotation met en évidence le bouton de compétence correspondant au personnage et à l’action en cours, directement dans la composition. La cible suit les étapes, reste visible en pause et disparaît quand le composant est retiré; `aria-current="step"` annonce l’étape active.
- L’accent reprend la couleur de l’élément et pulse doucement, avec animation coupée selon `prefers-reduced-motion`. Les compétences homonymes d’un autre membre ne sont pas ciblées.
- Vérifications : ciblage par personnage + action, rejet des étapes/personnages sans correspondance, syntaxe des modules et `git diff --check`. Le parcours visuel dans l’application n’a pas été exercé.

## Plan de farm — cocher une session depuis son jour · 14 novembre 2026
- La fenêtre d’une journée du calendrier présente un bouton « Fait » / « Rétablir » sur chaque session et le compteur du jour. Le même état local est lu par le tableau de bord, qui réaffiche les tâches terminées dans son historique repliable.
- Les entrées anciennes reçoivent un identifiant à l’ouverture du jour, et le calendrier se rouvre après chaque changement pour refléter le nouveau total. La fenêtre utilise une entrée animée légère et respecte la réduction des animations.
- Vérifications : logique commune de complétion/rétablissement, syntaxe de l’application, balise de cache et `git diff --check`. Le serveur local est arrêté, donc le dialogue n’a pas été contrôlé dans un navigateur.

## Tâches & objectifs — listes d’étapes intégrées · 14 novembre 2026
- Une tâche peut contenir des étapes facultatives, cochables directement sur sa carte. Une jauge et un compteur indiquent l’avancement; les étapes persistent dans les données locales de la tâche.
- En éditant une tâche, les cases déjà cochées restent cochées pour les étapes conservées. Une duplication reprend les mêmes étapes mais les remet toutes à faire. Les tâches existantes sans étapes gardent leur affichage compact.
- Vérifications : conservation des états à la modification, progression vide/partielle/complète, duplication réinitialisée, syntaxe JavaScript et `git diff --check` réussis. Contrôle visuel navigateur à confirmer.

## Événements Genshin — rappels réellement consultables · 14 novembre 2026
- « Me rappeler » conserve désormais une fiche locale du rappel (titre, dates, catégorie), en plus de son identifiant. Les rappels enregistrés apparaissent dans une étagère dédiée au-dessus de l’agenda et peuvent être retirés depuis cette liste.
- Les anciens rappels enregistrés comme simples identifiants restent reconnus et retirables; leur intitulé est résolu avec les événements visibles. Le message confirme maintenant l’ajout à l’agenda, sans annoncer une intégration au tableau de bord qui n’existait pas.
- Vérifications : migration ancien identifiant / fiche enrichie, retrait et réajout, syntaxe JavaScript et `git diff --check` réussis. Rendu visuel navigateur à confirmer.

## Tableau de bord — avancer les sous-étapes depuis Ma session · 14 novembre 2026
- Le widget « Ma session » affiche la progression des tâches découpées en étapes et propose la prochaine case à cocher. La progression se met à jour dans le widget sans quitter le tableau de bord; la case principale conserve son rôle de terminaison complète de la tâche.
- Les objectifs sans sous-étapes gardent leur présentation et leur action de complétion habituelles. La jauge suit la préférence de réduction des animations.
- Vérifications : tests unitaires de conservation, progressions 50/100 %, copie réinitialisée, anciennes données et génération du widget réussis; parcours navigateur avec une tâche d’essai confirme la sauvegarde de l’étape, le passage à la suivante et la jauge; syntaxe des modules et `git diff --check` réussis.

## Planificateur intelligent — parcourir les semaines · 14 novembre 2026
- L’agenda permet de passer à la semaine précédente ou suivante, puis de revenir directement à aujourd’hui. Chaque vue montre les dates exactes; les tâches restent attachées à leur date et le glisser-déposer continue de les déplacer.
- La navigation est bornée à un an dans chaque direction et reste adaptée aux petits écrans. La feuille de style du Planificateur est explicitement chargée dans la page.
- Vérifications : dates consécutives avant/après les changements de mois et d’année, limites et dates invalides; parcours navigateur avec une tâche planifiée la semaine suivante, retour à aujourd’hui et absence d’erreur JavaScript; syntaxe et `git diff --check` réussis.

## Atlas d’exploration — destination surprise · 14 novembre 2026
- Un bouton « Destination surprise » choisit une zone encore inachevée, efface le filtre temporaire si nécessaire, fait défiler jusqu’à la zone et la met en évidence. Une annonce accessible confirme le nom et le niveau d’exploration; les zones terminées ne sont jamais tirées.
- L’animation de boussole et l’arrivée lumineuse respectent `prefers-reduced-motion`. Si tout l’atlas est terminé, le bouton explique qu’il faut ajouter une zone.
- Vérifications : tirage déterministe, exclusion des zones terminées, atlas vide et générateur aléatoire invalide; parcours navigateur avec filtre actif confirmant la destination, son affichage et l’absence d’erreur JavaScript; syntaxe et `git diff --check` réussis.

## Énergie & récupération — prévisions des trois jeux · 14 novembre 2026
- Les trois choix de jeu montrent maintenant en continu le stock, le temps avant le prochain point et l’estimation du plein. Les prévisions utilisent la capacité et le rythme personnalisés de chaque compteur et se rafraîchissent chaque seconde, même sans ouvrir son onglet.
- Les jeux sans stock saisi invitent à le renseigner; un réservoir plein est signalé clairement. Le basculement vers un autre jeu continue d’ouvrir son compteur habituel.
- Vérifications : tests de stock absent, réserve pleine, capacité personnalisée et récupération partielle; navigateur avec les trois jeux, prévisions visibles et changement de jeu sans erreur JavaScript; syntaxe et `git diff --check` réussis.

## Cabine des connaisseurs — revoir ses réponses · 14 novembre 2026
- Après une partie, un volet « Revoir mes réponses » récapitule chaque indice, le personnage attendu et le résultat. Les erreurs montrent aussi le personnage sélectionné; les portraits officiels déjà associés aux choix sont réutilisés.
- Les réponses de partie mémorisent désormais le choix effectué. Les anciennes sauvegardes restent lisibles, avec un libellé clair si le choix historique n’avait pas été conservé.
- Vérifications : rapprochement indice/réponse correcte/choix, migration d’anciennes réponses, ouverture réelle du récapitulatif dans le navigateur, syntaxe JavaScript et `git diff --check` réussis.

## Carnet — trames de notes de jeu · 14 novembre 2026
- L’éditeur de note propose cinq trames prêtes à compléter : build, rotation, test de dégâts, personnage et farm. Chaque trame inclut les champs adaptés et choisit automatiquement la catégorie correspondante.
- Si une note contient déjà du texte, la trame est ajoutée à la suite; elle ne remplace ni le titre déjà saisi ni le contenu existant. Les champs restent synchronisés avec le brouillon si un rendu intervient pendant l’édition. Une note liée à un personnage peut recevoir son nom dans le titre par défaut.
- Vérifications : catégories, contenus, personnalisation du titre, insertion sans écrasement et texte vide; parcours navigateur réel avec titre et texte préexistants, démarrage sans erreur JavaScript; syntaxe des modules et `git diff --check` réussis.

## Équipes — records de répétition de rotation · 14 novembre 2026
- Chaque répétition automatique terminée enregistre son temps pour l’équipe concernée. La meilleure marque et le nombre d’essais restent visibles dans la zone d’entraînement; un nouveau record est mis en évidence brièvement. Les pauses ne comptent pas dans le chrono actif.
- Les résultats restent locaux à l’appareil et séparés par équipe; les rotations vides ou les essais non terminés ne créent pas de résultat.
- Vérifications : premier record, conservation de la meilleure marque, comptage des nouveaux essais, durée invalide et formatage; parcours du composant dans Chromium avec fin automatique, sauvegarde du résultat et aucune erreur JavaScript; syntaxe et `git diff --check` réussis.

## Studio de session — routines réutilisables · 14 novembre 2026
- Les routines personnelles sont enregistrées localement, limitées à 12, filtrées par univers, sélectionnables puis supprimables. Une routine reprend son activité, son objectif et ses étapes; le plafond retire la plus ancienne de manière prévisible.
- Correction d’un bug navigateur découvert en test : le lecteur des routines consultait le stockage des sessions, ce qui empêchait la sauvegarde. Il lit maintenant sa propre clé locale. Le test couvre également la navigation entre univers et la restauration du contenu.
- Vérifications : cinq tests unitaires passés et parcours Chromium complet de sauvegarde, filtre, réutilisation et suppression réussi; aucun `pageerror`.

## Studio de session — recherche de routines · 15 novembre 2026
- Une recherche filtre les routines rapides, y compris les routines personnelles avec leur bouton de suppression. Un état vide s’affiche quand rien ne correspond; le changement d’univers efface le filtre afin de ne pas masquer les routines du jeu choisi.
- Vérifications : recherche correspondante, résultat vide, réinitialisation et parcours sauvegarde/restauration/suppression dans Chromium; aucun `pageerror`.

## Tableau de bord — résumé de farm multi-personnages · 14 novembre 2026
- Le widget du jour présente les icônes de jusqu’à quatre personnages, un compteur pour les groupes plus nombreux, puis les matériaux concernés. La ligne reste compacte et montre les noms et matériaux sous forme abrégée, avec le détail complet au survol.
- Les dispositions bureau et mobile ont été réajustées pour ne plus tronquer les commandes ni confondre les avatars avec les ressources.
- Vérifications : tests des groupes vides, d’un seul personnage et d’une équipe de cinq; syntaxe JavaScript et diff contrôlés. Test visuel du tableau de bord à faire.

## Plan de farm — sessions terminées dans le calendrier · 15 novembre 2026
- Les journées indiquent maintenant quelles sessions sont terminées avec une bordure et un repère « fait » sur l’étiquette de farm. La même information reste dans les données locales et le résumé du tableau de bord.
- Vérifications : états planifié/terminé testés, six tests unitaires passés, syntaxe JavaScript et diff contrôlés. Capture visuelle du calendrier à faire.

## Équipes — composition complète au premier regard · 15 novembre 2026
- Chaque carte d’équipe montre maintenant une jauge accessible 0–4, le nombre de places remplies et un état « équipe complète ». La jauge passe au vert à quatre personnages et s’adapte au mouvement réduit.
- Vérifications : syntaxe et diff contrôlés. Parcours visuel d’une équipe vide, partielle et complète à faire.

## Programme des améliorations inter-pages
- Le registre `docs/AMELIORATIONS-400.md` suit désormais 400 objectifs concrets à travers les pages existantes. 82/400 sont réalisés; les prochains 300 comprennent aussi une passe visuelle, des icônes du jeu et des contrôles sur téléphone, petit PC et 1920 × 1080. L’objectif reste actif.
- Le test complet `tests/dashboard_browser.py` n’a pas fini son parcours : selon les exécutions, l’animation orbitale rend un bouton instable ou le tableau ne monte pas dans le délai prévu. Les contrôles unitaires du nouveau rendu de farm passent; revue visuelle du tableau de bord à poursuivre séparément.

## Mes builds — liste de reliques importées compacte · 15 novembre 2026
- La liste des pièces importées est limitée à une hauteur adaptative avec une zone de défilement stable. Les images et sous-statistiques restent visibles sans pousser les cinq emplacements d’équipement hors écran; la navigation par molette reste contenue dans la liste.
- Vérifications : règles responsive et préférence de mouvement réduit présentes, version de cache dédiée,
ode --check src/app.js et git diff --check réussis.

## Bibliothèque — effacement des filtres de personnage · 15 novembre 2026
- Un bouton discret apparaît quand une recherche ou un filtre est actif. Il efface recherche, élément, rareté et possession, puis revient à la première page sans changer de jeu, d’onglet ni de mode d’affichage.
- Vérifications : fonction pure couverte par test (préservation du contexte de navigation), bouton limité à l’état actif, état clavier visible et réduction de mouvement respectée.

## Plan de farm — terminer ou rétablir une session depuis sa journée · 15 novembre 2026
- Le bouton « Fait » de la fenêtre du jour est maintenant relié au gestionnaire de clics de l’application. La fenêtre était auparavant montée en dehors de ce conteneur, ce qui rendait le contrôle inerte; elle est désormais montée dedans. Le même bouton permet de rétablir la session et la progression de la journée se recalcule.
- Vérifications : test navigateur a confirmé l’enregistrement done, le compteur de progression et le retour à l’état planifié sur un premier parcours. Le parcours complet a ensuite été intermittent au démarrage (sélecteur du plan absent); ajout de tests unitaires pour l’horodatage, la restauration et le filtrage des sessions. Le point de synchro d’affichage du tableau de bord reste ouvert.
- Progression du registre : 9/200.

## HoYoLAB — erreur de connexion sans exception · 15 novembre 2026
- Une réponse HTTP en échec ne rejetait aucune erreur, puis le gestionnaire lisait `message` sur `undefined` à chaque rendu. L’échec porte maintenant un message explicite et le repli accepte un motif absent; l’état déconnecté reste affichable sans erreur JavaScript.
- Vérification : erreur reproduite par le parcours navigateur du planificateur avec serveur HoYoLAB indisponible, source localisée dans `loadHoyolabStatus`; un parcours navigateur de validation après correction est inclus au test du planificateur.
- Progression du registre : 11/200.

## Planificateur — export des objectifs datés · 15 novembre 2026
- Un bouton exporte les tâches ouvertes ayant une échéance dans un fichier `.ics` lisible par les calendriers courants. Les objectifs terminés et sans date sont exclus; l’action se désactive quand rien n’est exportable.
- Le format gère correctement virgules, points-virgules, retours à la ligne, journées entières et fin exclusive au lendemain.
- Vérifications : tests de format et échappement, téléchargement réel Chromium avec quatre événements, date et titre vérifiés; aucune erreur JavaScript.
- Progression du registre : 12/200.

## Planificateur — surcharge quotidienne · 15 novembre 2026
- Une journée avec plusieurs tâches affiche son nombre d’objectifs; au-delà de trois, un signal plus fort aide à repérer une charge trop concentrée.
- Vérifications : test de rendu Chromium sur une journée à quatre objectifs, libellé accessible et aucune erreur JavaScript. Tests unitaires sur les seuils 0, 2 et 4.
- Progression du registre : 12/200.


## Vœux & objectifs — annulation sûre d’un gain · 15 novembre 2026
- Le journal permet d’annuler un gain ajouté par erreur. Le solde est recalculé sans supprimer la trace; le même gain ne peut pas être annulé deux fois. Si le solde courant ne permet plus le retour exact, l’interface explique la correction nécessaire.
- Le contrôle reste au niveau de chaque entrée, avec retour annoncé aux lecteurs d’écran et présentation compacte sur mobile.
- Vérifications : tests du solde et des cas limites; parcours Chromium avec clic réel, solde restauré, journal conservé et aucune erreur JavaScript. Progression : 13/200.


## Énergie & récupération — alerte visuelle avant le plafond · 15 novembre 2026
- Les cartes des trois univers indiquent maintenant « Récupération », « Plafond proche », « Plein » ou « À configurer ». Le seuil d’alerte visuel correspond aux quatre prochaines heures; il est recalculé en direct et utilise le plafond et le rythme personnalisés.
- Le style distingue doucement l’énergie bientôt plafonnée et l’énergie pleine, sans animation supplémentaire permanente.
- Vérifications : tests unitaires des quatre états et test Chromium sur les trois cartes, classes et libellés visibles, aucune erreur JavaScript. Progression : 14/200.


## Carnet de voyage — recherche et filtres croisés · 15 novembre 2026
- L’historique se filtre maintenant par mots recherchés (pages et notes), univers et type de trace; le nombre de résultats se recalcule à chaque saisie.
- Une réinitialisation efface les trois critères et un état vide explique comment retrouver des entrées. Le filtre combine les critères au lieu de les appliquer séparément.
- Vérifications : test unitaire insensible à la casse et tests Chromium de recherche, filtres croisés, résultat vide et reset, aucune erreur JavaScript. Progression : 15/200.


## Tâches — repères relatifs d’échéance · 15 novembre 2026
- Les tâches affichent maintenant le retard exact en jours, « aujourd’hui », « demain », les échéances de la semaine et les dates futures, avec des couleurs d’urgence cohérentes. La date précise reste disponible dans l’infobulle.
- Vérifications : tests unitaires de dates fixes, gestion des dates invalides et test Chromium de tâches en retard/aujourd’hui/demain. Progression : 16/200.

## Cabine des connaisseurs — réponses clavier 1–4 · 15 novembre 2026
- Les choix affichent leur touche, déclarent le raccourci aux technologies d’assistance et répondent aux touches numériques du clavier et du pavé numérique. La saisie dans les champs reste exclue.
- Vérifications : parcours Chromium avec deux questions, réponse clavier et passage à la suivante; test sans erreur JavaScript. Progression : 17/200.

### 2026-11-15 — Historique filtrable du Studio de session
- Ajout d’une recherche par objectif et de filtres combinables par univers et activité dans les sessions terminées; compteur dynamique et message clair si aucun résultat.
- Vérification : test unitaire des combinaisons et parcours Chromium sur les trois filtres, y compris l’état vide, sans erreur JavaScript. Progression : 18/200.

### 2026-11-15 — Jauges d’énergie multi-jeux
- Ajout d’une jauge de réserve pour chaque univers dans le sélecteur du suivi d’énergie; le pourcentage, l’accessibilité et l’état plein suivent les valeurs calculées en temps réel.
- Vérification : tests de calcul sur les réserves pleines et partielles; contrôle de syntaxe et diff. Cette amélioration complète le point 014 déjà suivi.

### 2026-11-15 — Recherche dans la Boîte de bord
- Ajout d’une recherche en direct qui se combine avec les filtres de type et de priorité; les compteurs par catégorie et le nombre de résultats se mettent à jour, avec effacement rapide et état vide.
- Vérification : tests unitaires de recherche et de filtres croisés, parcours Chromium de recherche, filtres, compteurs, effacement et état vide, sans erreur JavaScript. Progression : 19/200.

### 2026-11-15 — Jalons de série du quiz quotidien
- La série affichée tient maintenant compte du dernier jour réellement joué, avec une fenêtre pour continuer aujourd’hui, des jalons progressifs (3, 7, 14, 30, 60, 100, 365 jours), une jauge et un état propre après une journée manquée. Chaque jeu conserve son propre parcours.
- Vérification : tests unitaires pour la progression, le jour de complétion et la remise à zéro; parcours Chromium du quiz terminé et affichage du premier jalon sans erreur JavaScript. Progression : 20/200.
### Studio de session — durée de sprint adaptée · 15 novembre 2026
- Le formulaire choisit maintenant une durée suggérée à partir de la médiane des derniers sprints terminés pour le même jeu et le même type d’activité; la personne garde la main pour choisir une autre durée ou désactiver le minuteur.
- Le changement de jeu, d’activité ou de routine recalcule la suggestion. L’historique enregistre la durée choisie pour améliorer les prochaines suggestions; les anciennes entrées sont ignorées proprement.
- Vérification : tests unitaires sur la valeur de départ, la médiane et l’isolation entre univers/activités; syntaxe du module vérifiée.

### Planificateur — état journalier plus lisible · 15 novembre 2026
- Chaque jour de l’agenda annonce maintenant le nombre d’objectifs terminés et restants, ainsi que sa progression sous forme de barre accessible; les lecteurs d’écran reçoivent un libellé complet par date.
- Vérification : parcours navigateur sur un jour avec objectifs terminés et ouverts, comparaison des libellés et valeurs de progression.

### Objectifs de vœux — scénario le plus fréquent · 15 novembre 2026
- La simulation met en évidence le cas de pertes de 50/50 le plus fréquent, tout en conservant l’accès aux résultats des autres scénarios et aux deux budgets.
- Vérification : distribution reproductible contrôlée sur un scénario à deux personnages, tests du modèle et parcours navigateur de la page Vœux.

### Boîte de bord — rappels différés à la carte · 15 novembre 2026
- Le menu de rappel propose maintenant une heure, un jour ou une semaine; les rappels reviennent automatiquement à l’échéance choisie et les durées sont bornées pour éviter les valeurs invalides.
- Vérification : tests des durées et limites, parcours navigateur de report à sept jours, disparition du rappel courant et présence de la date enregistrée.

### Atlas d’exploration — circuit quotidien · 15 novembre 2026
- L’Atlas présente un itinéraire de trois régions : échéances proches d’abord, zones déjà commencées ensuite, régions encore vierges pour finir. Les barres montrent l’état de chaque zone.
- Modifier une progression ou une échéance actualise le circuit sans recharger la page; les régions terminées en sortent immédiatement.
- Vérification : tri déterministe avec échéances passées et futures, tests sur les zones complètes, parcours Chromium avec recalcul à 100 %.

### Bibliothèque de personnages — raccourcis d’éléments · 15 novembre 2026
- Le catalogue Genshin propose une rangée de filtres visuels par élément, avec les icônes locales du jeu. Le filtre rapide reste synchronisé avec le menu déroulant existant, conserve la recherche et la rareté déjà choisies, et affiche son état sélectionné aux technologies d’assistance.
- Sur téléphone, les boutons d’élément deviennent des icônes compactes avec leur nom accessible et leur infobulle. Les raccourcis ont un état de focus clavier visible et respectent la réduction des animations.
- Vérification : parcours Chromium du catalogue et de la fiche personnage; changement d’élément synchronisé, remise sur « Tous », navigation des onglets, conservation de la sélection et vue mobile vérifiés. Le parcours global du catalogue passe également.
- Progression du registre : 30/200.

### Équipes — filtres par état et favoris · 15 novembre 2026
- La bibliothèque d’équipes distingue maintenant toutes les compositions, celles encore à compléter et les favorites, avec un compteur pour chaque filtre. Le filtre reste combinable avec le choix d’une équipe précise.
- Si les deux critères ne donnent aucun résultat, un état vide explique le cas et propose de revenir à toutes les équipes. Le filtre choisi reste mémorisé pour chaque univers.
- Vérification : Chromium a filtré des compositions de test partielles et complètes, appliqué les favoris, combiné les deux critères et utilisé le retour aux résultats; aucun problème JavaScript pendant ces interactions.
- Progression du registre : 31/200.

### Tâches & objectifs — reporter une échéance · 15 novembre 2026
- Une tâche en retard propose maintenant « Reporter à demain » directement à côté de sa date. L’action conserve ses étapes et sa priorité, met à jour la date, rafraîchit les compteurs et apparaît ensuite comme échéance du lendemain.
- Le calcul des retards et des tâches du jour utilise la date locale, pour éviter le décalage d’un jour autour de minuit selon le fuseau.
- Vérification : test Chromium avec une tâche en retard, clic sur le report, nouvelle date visible, valeur persistée et aucune erreur JavaScript.
- Progression du registre : 32/200.

### Énergie & récupération — raccourcis de dépense personnalisés · 15 novembre 2026
- Les trois boutons de dépense rapide se règlent maintenant par jeu, dans les paramètres du compteur. Chaque univers conserve ses montants localement; les valeurs sont bornées à la capacité de son réservoir.
- Les montants configurés réapparaissent comme actions rapides et alimentent le journal de dépenses existant, avec annulation conservée.
- Vérification : parcours Chromium isolé des états « plafond proche / plein / à configurer », réglage des valeurs 30/70/100, persistance après rendu, dépense de 70 et entrée de journal correspondante.
- Progression du registre : 33/200.

### Plan de farm — filtre de sélection des personnages · 15 novembre 2026
- La liste des personnages peut se parcourir selon « Tous », « Dans mon plan » et « À ajouter », avec le nombre de personnages dans chaque état. Les filtres restent combinables avec la recherche et l’état choisi persiste après réouverture.
- Le filtre s’applique dès le premier affichage, y compris lorsque la préférence mémorisée n’est pas « Tous ». Les boutons exposent leur état actif et restent utilisables au clavier.
- Vérification : le parcours navigateur a contrôlé la recherche Bennett, les deux personnages du plan, l’exclusion des personnages déjà actifs dans « À ajouter », le retour à tous et la combinaison recherche/filtre. Le parcours a ensuite rencontré un rappel de sauvegarde qui recouvrait l’action d’export PNG, puis un chargement initial intermittent sur les relances; les interactions des filtres elles-mêmes ont passé.
- Progression du registre : 34/200.

### Studio de session — réordonner les étapes · 15 novembre 2026
- Une session active peut réordonner ses étapes avec les commandes monter/descendre, sans quitter le minuteur ni perdre l’état des cases cochées. Les boutons aux extrémités sont désactivés; noms accessibles, focus clavier et appui sur Entrée sont pris en charge.
- Vérification : parcours Chromium sur trois étapes, activation au clavier, ordre conservé dans le stockage local après rechargement et commandes de bordure correctement désactivées.
- Progression du registre : 35/200.


### Boîte de bord — portefeuille et farm individuel
- Le portefeuille des vœux suit désormais la largeur de sa colonne; une seule colonne de données est utilisée lorsque l’espace est étroit.
- Les portraits de chaque personnage d’une session sont cochables dans le panneau. Le compteur d’avancement et la fin de session sont synchronisés avec le tableau de bord via le stockage existant.
- Les actions directes fonctionnent aussi pour les sessions multi-personnages sans modifier les anciennes entrées du calendrier.


### Galerie des personnages — accès rapide par type d’arme
- Ajout d’une ligne de filtres illustrés Épée, Claymore, Lance, Arc et Catalyseur. Les contrôles suivent le même état que la bibliothèque et le bouton « Effacer ».
- Adaptation mobile, indication accessible du type choisi et prise en compte de la réduction des animations.


### Équipes — recherche mémorisée dans la bibliothèque
- La nouvelle recherche de compositions interroge aussi les noms de personnages et les étiquettes, sans distinguer les accents.
- Le filtre courant et l’équipe sélectionnée sont conservés; l’état vide et le bouton d’effacement permettent de revenir vite à la liste complète.


### Équipes — partage rapide du roster et de la rotation
- Le bouton « Copier la rotation » copie les personnages, les actions et les répétitions de combo dans un texte simple à partager. Une alternative de copie est prévue si le navigateur refuse l’accès direct au presse-papiers.


### Vœux & objectifs — lecture rapide de la pity
- Deux jauges distinguent maintenant les bannières personnage et arme, montrent la pity actuelle, le plafond, la garantie et le repère indicatif de pity élevée.
- Les repères 74/63 sont explicitement présentés comme des estimations communautaires et non comme des seuils officiels. Les valeurs restent bornées aux plafonds 90/80.
- Adaptation mobile et animation de progression respectant la préférence de réduction des mouvements.


### Plan de farm — mise à jour du stock en un geste
- Des commandes +/− sont disponibles sur chaque matériau consolidé; les quantités ne peuvent pas passer sous zéro.
- Chaque commande réutilise la sauvegarde d’inventaire déjà en place et déclenche le recalcul des besoins restants et de la synthèse.
- Vérifié dans le parcours navigateur du planificateur après saisie manuelle et recette de synthèse.


### Énergie & récupération — repères horaires vivants
- Les seuils de retour apparaissent dans l’ordre chronologique, même si le seuil personnel précède ou suit le repère des 75 %.
- Chaque palier indique son heure locale prévue et son compte à rebours se met à jour en continu; lorsqu’il est atteint, il devient « Disponible ».
- Vérifié dans le parcours navigateur multi-jeux : ordre 150 → 160 → 200, nombre de paliers et états de réservoir conservés.


### Tableau de bord — rappel des bannières qui finissent bientôt
- Le widget Vœux repère automatiquement une bannière active dont la fin approche sous 72 heures. Il indique son titre, le délai restant et propose de saisir les gains avant la fin.
- En dehors de cette fenêtre, le formulaire conserve son intitulé normal et aucune alerte d’échéance n’encombre le tableau. Les champs restent raccordés au portefeuille global de Vœux & objectifs.
- Vérifié par tests unitaires : échéance proche, bannière plus lointaine, bannière à venir et rendu des ressources du compte.


### Fiche personnage — navigation dans le roster
- Ajout de commandes précédent/suivant directement sous l’illustration; les personnages sont parcourus dans l’ordre alphabétique du jeu actif. Les limites du catalogue désactivent le bouton correspondant.
- L’indicateur de position annonce le rang courant, les boutons ont des libellés accessibles et l’affichage se replie sur mobile. La préférence de réduction des mouvements est respectée.
- Vérifié dans Chromium : déplacement au personnage suivant puis retour exact, sans perdre l’état de la fiche; contrôles clavier, focus, onglets et largeur mobile conservés.

### Équipes — fiches personnage accessibles depuis les portraits
- Les portraits compacts des quatre emplacements sont maintenant des boutons qui ouvrent la fiche du personnage choisi, sans ouvrir ou fermer le panneau détaillé de la composition.
- Les emplacements vides restent de simples repères. Les portraits reçoivent un focus visible, un libellé vocalisé et un retour visuel au survol; l’animation est coupée si la réduction des mouvements est active.


### Tableau de bord — préparation ciblée par personnage
- Le widget « Préparation des personnages » propose un filtre compact pour les personnages possédés ou déjà présents dans les builds. Le mode « Tous » reste disponible.
- Le choix est mémorisé séparément par univers; les cartes et leurs accès vers Farm/Builds sont filtrés ensemble. Un état explicite apparaît si le filtre ne retourne aucun résultat.
- Vérifié dans Chromium : deux personnages suivis, filtre sur Aether (une carte), retour à Tous (deux cartes), puis parcours existant du tableau de bord et vue mobile.


### Tâches & objectifs — terminer une checklist en un geste
- Sur les tâches avec checklist, un bouton indique exactement le nombre d’étapes restantes. Il disparaît lorsque toutes les étapes sont cochées.
- L’action passe uniquement les étapes restantes à l’état terminé, réutilise la sauvegarde habituelle de la tâche et actualise la jauge immédiatement.
- Vérifié dans Chromium : tâche avec une étape déjà faite et deux ouvertes, action groupée, données persistées et compteur à 3/3.


### Studio de session — mode de concentration plein écran
- Une session active peut être isolée dans une vue plein écran, avec chronomètre agrandi, checklist et commandes principales au centre.
- Le navigateur utilise son plein écran natif quand il est disponible; sinon un panneau superposé équivalent prend le relais. Échap et le bouton de sortie ferment les deux modes, et la réduction des mouvements reste respectée.
- Vérifié dans Chromium : démarrer une session, activer le plein écran, vérifier l’état accessible, puis quitter avec Échap.


### Bibliothèque d’armes — raccourcis par type
- La bibliothèque Genshin propose désormais des raccourcis illustrés pour épée, épée à deux mains, lance, arc et catalyseur, ainsi qu’un retour à toutes les armes.
- Le filtre s’ajoute à la recherche courante et signale son état avec `aria-pressed`; les types inconnus sont exclus proprement au lieu de produire une liste trompeuse.
- Vérifié par test unitaire : mode « Tous », sélection isolée d’un type et type non reconnu.


### Calendrier Genshin — navigation mensuelle rapide
- Ajout de commandes précédent/suivant et d’un raccourci « Ce mois-ci » autour du sélecteur de date natif.
- Le passage de décembre à janvier (et inversement) change correctement l’année; le contrôle se replie sur mobile et reste utilisable au clavier.
- Vérifié par test unitaire sur le changement d’année, le mois courant, le décalage nul et une valeur invalide.

### Actualités Genshin — vues « non lues » et « enregistrées »
- Ajout de trois vues du flux : toutes les annonces, celles qui ne sont pas marquées comme lues, et celles gardées en favoris.
- Les vues se combinent avec la catégorie, la source et la recherche. Les compteurs des non lues et des éléments enregistrés restent synchronisés aux données locales.
- Les filtres sont accessibles au clavier et se réorganisent sur petit écran.
- Vérifié par test unitaire sur les états lus/enregistrés et les filtres combinés.

### Tâches & objectifs — fenêtre des sept prochains jours
- Un raccourci liste les échéances à venir jusqu’à une semaine, avec le nombre correspondant sur le bouton.
- Le filtre exclut les tâches terminées et les retards, garde la recherche existante et respecte la date locale de l’application.
- Vérifié par test unitaire sur échéance aujourd’hui, limite du septième jour, échéance lointaine, retard, tâche terminée et absence de date.

### Équipes — repérer les rotations manquantes
- Ajout d’un filtre « À planifier » dans la bibliothèque d’équipes, avec compteur en direct.
- Une composition n’est considérée prête que si elle contient une action de rotation; les marqueurs de fermeture de combo seuls ne masquent pas une rotation manquante.
- L’état vide explique lorsque toutes les compositions ont déjà une rotation. Test unitaire sur équipe vide, marqueur seul, action réelle et favoris.

### Mes builds — tri des pièces importées
- Dans chaque emplacement de relique, le joueur peut choisir un tri rapide par score CRIT/ATQ, niveau, rareté ou ordre d’import.
- Le score est explicitement présenté comme un repère de tri; il ne prétend pas prédire les dégâts ni remplacer le calcul conditionnel du build. Le tri ne modifie pas les données importées.
- Vérifié par tests sur les quatre modes, la priorité offensive et l’intégrité de l’ordre source.

### Tâches — objectifs à planifier
- Un filtre « À planifier » donne accès aux objectifs actifs sans échéance, en conservant la recherche. Son compteur et son état vide indiquent clairement le travail restant.
- Test unitaire sur les dates vides et tâches terminées.

### Vœux — date cohérente avec le fuseau local
- Les gains ajoutés au journal utilisent maintenant la date locale, cohérente avec le tableau de bord et le planificateur. Le libellé du jour est construit à midi local pour éviter un basculement de date autour de minuit UTC.

### Planificateur — export ICS
- Les longues lignes sont repliées au seuil RFC 5545 de 75 octets UTF-8. Le test couvre accents, caractères multioctets et continuation des lignes.- Le calendrier exporté rend aussi les identifiants uniques si des objectifs importés ont un même ID; test sur deux UID concurrents.
### Carnet — export Markdown
- Le bouton « Exporter le carnet » télécharge toutes les notes de l’univers actif dans un fichier Markdown lisible, avec titres, catégories, personnages liés, état épinglé et contenu. Le rendu Markdown est couvert par un test unitaire.
### Favoris — ordre de consultation
- Ajout d’un tri stable par nom, rareté ou élément, en plus de l’ordre enregistré. Le choix est conservé par univers et n’altère jamais l’ordre des données sources.
- Test sur les tris, leur stabilité et l’absence de mutation.
### Tableau de bord — déplacement accessible
- En mode édition, les poignées de widget annoncent les raccourcis ↑ / ↓; chaque pression déplace le bloc et replace le focus après le rendu. Le déplacement par souris reste en place.
- Test unitaire sur l’ordre, les limites, les identifiants inconnus et l’intégrité de la liste source.
### Archives de lore — filtres de navigation
- Ajout de filtres par catégorie avec le nombre de notices et combinaison avec la recherche existante, sans recharger les données.
- Recherche insensible aux accents/casse et état vide conservé. Couvert par tests unitaires.

### Équipes — retrouver une composition
- Ajout d’un tri mémorisé par univers : ordre enregistré, nom, nombre de personnages ou présence d’une rotation.
- Les tris restent stables, ne modifient pas la sauvegarde et s’utilisent avec les filtres/recherche existants; test unitaire pour les quatre modes.

### Objectifs — navigation par catégorie
- Ajout de puces de catégorie avec compteurs qui se combinent à la recherche et aux filtres existants (jour, semaine, retard, terminées…).
- Les accents n’engendrent pas de doublons de catégorie; test unitaire de comptage et de filtrage.

### Énergie & récupération — veille multi-univers
- La page signale maintenant quel jeu atteindra son plafond en premier, les réserves pleines ou proches et le nombre de jeux suivis, seulement quand au moins deux stocks sont renseignés.
- Chaque compteur conserve son unité indépendante; la synthèse se met à jour avec les jauges en temps réel et s’adapte au mobile. Vérifié par tests de prévision.

### Arcade — récompense quotidienne du Tetris
- La récompense de cinq boosters au-delà de 1 500 points passe par une fonction idempotente : un second événement dans la même journée ne crédite rien, le jour suivant peut à nouveau être réclamé.
- Vérifié au seuil exact, juste au-dessus, avec double événement, jour suivant et scores/jours invalides.

### Vœux — export du journal personnel
- Ajout d’un export CSV encodé en UTF-8 avec BOM, séparateur compatible tableur, guillemets échappés et historique complet des gains/corrections.
- L’export indique le solde après chaque écriture et marque les gains annulés; l’action est disponible depuis l’historique des vœux.

### Planificateur — répartition du backlog
- Nouveau raccourci dans l’agenda hebdomadaire pour répartir les objectifs non datés ou en retard sur les jours futurs les moins chargés.
- Les échéances déjà planifiées et les objectifs terminés restent en place; la distribution est stable et testée sur semaine partielle et jours saturés.

### Arcade — retour tactile
- Ajout d’une option désactivée par défaut dans les réglages du Tetris; elle mémorise le choix et ne déclenche rien si le navigateur ne prend pas en charge les vibrations.
- Les petits alignements, combos, tuiles spéciales et fins de partie ont des motifs distincts. Les motifs sont testés sans dépendre d’un téléphone précis.

### Arcade — difficulté de la Mémoire des constellations
- Choix mémorisé par univers entre 4 paires pour une partie rapide, 6 en classique et 8 en stellaire.
- Chaque niveau garde son propre record; l’énigme du jour reste reproductible à difficulté identique, et l’export/insigne tient compte du nombre réel de paires.

- Équipes : ajout d’une commande globale pour développer/réduire les détails des compositions filtrées, en gardant les contrôles individuels cohérents.

- Carnet : ajout d’un filtre « Épinglées uniquement » mémorisé séparément pour chaque univers; recherche sans distinction d’accents dans les titres, contenus, catégories et personnages associés.
- Suivi d’énergie : le planificateur de session accepte maintenant une date et heure locales précises, calcule le stock attendu et conserve le rendez-vous au redémarrage.

- Quiz quotidien : le résultat peut être copié sous forme courte et sans spoiler, avec l’univers, la date, le score et la série; confirmation visuelle et repli de copie local.
- Studio de session : ajout d’un aperçu d’activité hebdomadaire local, avec barres proportionnelles aux minutes, nombre de sessions par jour et mise en évidence du jour courant.
- Constructeur d’équipe : fiches portrait moins hautes et plus denses, avec tailles adaptées aux grands écrans, petits PC et téléphones pour éviter le long défilement sans écraser les images.
- Réseau des relations : ajout d’un export CSV filtré des liens et de leurs références vérifiables, sans inclure les longues citations du jeu.
- Quiz quotidien : les trois univers ont maintenant leurs emblèmes locaux dans l’indice, l’en-tête et l’illustration centrale, sans dépendre d’un chargement externe.
- Catalogues Armes, Sets et Matériaux : recherche et filtres tiennent en une ligne sur ordinateur; sur téléphone, seule la bande de filtres défile et la page conserve sa largeur.


## Planificateur — validation depuis la semaine

- Ajout de cases d’action accessibles dans les cartes quotidiennes : terminer ou réactiver sans quitter l’agenda. Les tâches finies restent visibles et passent après les tâches ouvertes; le compteur de charge ne compte que ce qui reste à faire.
- Vérifications : 7 tests unitaires du calendrier passent; parcours Chromium vérifie la persistance, les compteurs et l’export après complétion, ainsi que l’absence de débordement à 390 px.
- Progression du registre : 81/400.


## Équipes — densité compacte

- Les fiches de la bibliothèque d’équipes s’adaptent maintenant au réglage « Compacte » : ligne de commandes et portraits raccourcis, espacements réduits, constructeur détaillé conservé à sa taille lisible.
- Vérification Chromium : la fiche compacte est plus courte que la fiche confortable; recherche, filtres, ouverture groupée et copie de rotation restent opérationnels.
- Progression du registre : 82/400.


## Vœux — aperçu du personnage ou de l’arme visée

- Chaque objectif peut maintenant reconnaître un personnage ou une arme du classeur dès la saisie et montrer son icône. Une saisie inconnue ou une image indisponible reste lisible avec un état de repli. L’aperçu se met à jour sans attendre la validation du champ.
- Vérifié : 7 tests unitaires des objectifs, parcours Chromium dédié, persistance, calcul d’objectifs et budget théorique. Le test navigateur global est interrompu par l’enregistrement d’une capture sous Windows.
- Progression : 83/400.


## Carnet de voyage — suppression individuelle des notes

- Chaque note dispose maintenant d’un bouton Supprimer distinct. La confirmation permet d’annuler sans perte, et la suppression ne touche qu’à la note concernée; les visites et les autres notes restent conservées. La commande Effacer le carnet reste indépendante.
- Vérifié en Chromium sur desktop et téléphone : filtres et états vides, action accessible à 390 px, annulation puis suppression confirmée, conservation d’une visite sans rapport.
- Progression : 84/400.


## Studio de session — étapes ajoutables pendant le sprint

- Il est désormais possible d’ajouter un objectif sans terminer ni mettre en pause la session. L’étape est enregistrée immédiatement, limitée à 120 caractères et 12 étapes par session; après l’ajout, le focus revient au champ pour poursuivre au clavier. Sur téléphone, la commande passe sous le champ et ne déborde pas.
- Vérifié : 6 tests unitaires et parcours Chromium incluant l’ajout, la limite maximale, le rechargement et l’affichage à 390 px.
- Progression : 85/400.


## Centre d’énergie — résumé quotidien

- Ajout d’un bilan visible qui sépare les points dépensés et ajoutés, affiche le solde net et compte les actions datées d’aujourd’hui. Il s’actualise avec les opérations et évite de présenter comme complet un résultat limité aux huit entrées conservées.
- Vérifié avec les tests de calcul, le parcours navigateur après une dépense et un affichage mobile à 390 px.
- Progression : 86/400.


## Réseau des relations — repères de popularité et réciprocité

- L’accueil du graphe présente maintenant quatre repères interactifs calculés depuis les preuves locales : le personnage le plus mentionné, celui qui parle du plus de monde, le duo le plus réciproque et un personnage sans preuve indexée. Les portraits proviennent des fiches déjà chargées; le duo ouvre directement la comparaison.
- Le compte des répliques reste lié aux données locales. Le compteur externe corrigé est de 233 308 extraits d’histoire; le site affiche séparément 1 203 lignes vocales. Il ne fournit pas de base exportable ou d’API documentée dans l’interface.
- Vérifié : tests des agrégats et scénario navigateur du réseau incluant repères, dialogue à deux et effacement de la sélection.
- Progression : 87/400.


## Objectifs — fixer rapidement une date

- Les tâches sans échéance ont maintenant deux commandes directement sur leur ligne : aujourd’hui ou demain. Elles apparaissent seulement tant qu’aucune date n’est fixée et disparaissent après l’enregistrement, avec une mise en page mobile qui les replie sous les métadonnées.
- Vérifié : navigateur reporte aussi une tâche en retard, règle les deux dates rapides, contrôle les valeurs sauvegardées et termine une checklist existante.
- Progression : 88/400.


## Réseau des relations — audit des sources et export

- Le panneau « Sources » détaille les preuves par domaine et dataset, avec le nombre de voix et de passages de lore, les langues trouvées et les liens officiels/transcriptions conservés. L’inventaire complet s’exporte en JSON; les liens ne sont construits qu’à l’ouverture d’un groupe pour préserver la fluidité.
- La page de référence consultée affiche 233 308 extraits d’histoire. Ce total a été corrigé par l’utilisateur; il reste distinct des lignes vocales, et aucune base/API publique documentée n’est disponible pour un export global.
- Vérifié par tests unitaires et navigateur : export valide et panneau sans débordement sur mobile.
- Progression : 89/400.


## Arcade astrale — suivre ses dernières parties

- Le panneau Tetris montre les dix scores les plus récents et trace les cinq derniers sur une mini-courbe. Chaque entrée garde les lignes et le niveau; les scores de Genshin, HSR et Wuthering Waves ne sont jamais mélangés.
- L’historique est local à l’appareil. Une fin de partie met à jour le panneau sans rechargement; son écouteur est retiré quand l’arcade se ferme.
- Vérifié : tests des données, parcours navigateur sur 390 px, isolation entre univers et nettoyage du listener.
- Progression : 90/400.

## Réseau des relations — compteur de références du site source

Le panneau Sources affiche désormais les 68 012 références annoncées par le site consulté, à côté des volumes de récits, voix et quêtes. Cette statistique est étiquetée comme externe et ne gonfle pas le nombre de preuves présentes dans Astralis. L’audit actif confirme toujours que l’interface n’offre pas de base globale ou d’API documentée pour importer le corpus de 233 308 passages.

\n
## Réseau des relations — proximité attestée et activité directionnelle

- Les modales de duo montrent une jauge animée à cinq niveaux, ventilée par voix, lore et quêtes. Une note visible précise que le rang est un niveau de preuve, pas une mesure canonique d’affection.
- Le panneau de personnage indique les preuves entrantes, les preuves émises et les liens réciproques, selon les filtres courants.
- Le site Ties affiche 233 308 extraits d’histoire, 1 203 lignes vocales et 1 626 quêtes; aucun corpus exportable ni API de téléchargement global n’a été trouvé. Astralis garde ces statistiques externes distinctes de ses preuves locales.
- Vérifié : 8 tests unitaires passés et assertions navigateur de la jauge et du panneau passées. Le parcours navigateur long a ensuite échoué lors de l’écriture Windows d’une capture PNG déjà présente (Errno 22), avant la fin de ses contrôles.
- Progression : 126/400.

## Tableau de bord — édition mobile des dispositions

- [x] C-128 — Tester l’édition des widgets sur téléphone : masquer puis réafficher un widget, ajouter un widget absent, renommer la disposition et enregistrer une copie. Les contrôles d’édition se replient maintenant en deuxième ligne sur petit écran; le champ de nom enregistre sans reconstruire le DOM pendant la saisie.
- Vérifications : test navigateur Playwright à 390 px; ajout, masquage, restauration, renommage et copie persistée; aucune erreur JavaScript ni barre horizontale.
- Progression du registre : 128/400.

## Studio de session — préparer une équipe enregistrée

- [x] C-129 — Construire depuis une équipe sauvegardée les étapes de sa rotation et les portraits correspondants. La progression est conservée lorsqu’on prépare à nouveau la même équipe.
- Vérifications : parcours navigateur mobile; sélection, lancement, validation, progression, réinitialisation et chargement des portraits.
- Progression du registre : 129/400.

## Studio de session — suivre le plan de farm du jour

- [x] C-130 — Présenter la prochaine date de farm et convertir chaque session partagée en cases séparées par personnage. Les sessions déjà cochées restent visibles; la progression est sauvegardée dans le même calendrier que la page Farm et passe automatiquement au prochain jour ouvert.
- Vérifications : tests unitaires pour dates passées/futures, sessions faites, sessions multi-personnages et liste vide; parcours navigateur mobile coche les deux personnages d’une session, termine une autre, confirme les écritures locales et l’absence de débordement.
- Progression du registre : 130/400.

## Tableau de bord — garder plusieurs espaces personnels

- [x] C-131 — Ajouter, masquer, restaurer, déplacer, redimensionner et réordonner au clavier les widgets; enregistrer une copie, la renommer ou supprimer une disposition. Les actions restent accessibles en mode mobile.
- Vérifications : tests unitaires d’ordre et de normalisation; parcours mobile valide ajout, masquage, restauration, renommage et copie; contrôles syntaxiques.
- Progression du registre : 131/400.

## Plan de farm — partager les validations avec le tableau de bord

- [x] C-132 — Une validation depuis la checklist du tableau de bord met à jour le calendrier du plan de farm; les sessions à plusieurs personnages ne sont terminées qu’après validation de chacun.
- Vérifications : parcours navigateur constate chaque état dans le stockage partagé et met à jour la jauge après chaque clic; tests des helpers multi-personnages passés.
- Progression du registre : 132/400.

## Réseau des relations — chercher dans les liens et leurs preuves

- [x] C-133 — Dans la vue liste, rechercher sans distinction de casse ou d’accents dans les noms des deux personnages, le titre et texte des citations, les quêtes et les références de source. Le filtre de personnages sélectionnés reste combiné à la recherche; un résultat vide explique qu’aucune preuve locale ne correspond.
- Vérifications : tests unitaires de recherche (accents, noms, quêtes, filtre duo, requête vide); scénario navigateur vérifie résultat et état vide; CSS mobile et cache bust actualisés.
- Progression du registre : 133/400.

## Tableau de bord — reprendre la dernière page visitée

- [x] C-134 — Ajouter le widget « Reprendre » à la disposition initiale. Les boutons de navigation mémorisent la destination et un libellé court par univers; le widget rouvre cette page après un retour au tableau de bord. Le premier usage propose des accès directs au farm et aux équipes.
- Vérifications : tests unitaires du stockage par jeu, du nettoyage des libellés, des destinations invalides et des données corrompues; scénario navigateur à 390 px clique la destination, vérifie sa persistance et contrôle le rendu dans le widget.
- Progression du registre : 134/400.

## Tableau de bord — jauge de préparation par personnage

- [x] C-135 — Afficher une progression accessible fondée sur les informations réellement connues : build enregistré, arme et set renseignés, et farm planifié terminé. L’absence de plan de farm reste « non planifié » et ne compte pas comme un farm achevé; les critères affichés donnent le détail du pourcentage.
- Vérifications : tests des cas sans farm, farm restant et farm terminé; test navigateur contrôle les pourcentages, le changement d’état après validation et le filtre par personnage.
- Progression du registre : 135/400.

## Tableau de bord — synthèse du jour

- [x] C-136 — Le widget de semaine réunit les événements qui chevauchent aujourd’hui, ceux en cours, les objectifs échus ou dus aujourd’hui, et l’avancement des rituels quotidiens du jeu choisi. Chaque indicateur ouvre sa page correspondante; les dates invalides et l’absence de données restent des états vides neutres.
- Vérifications : tests unitaires sur événements multi-jours, à venir, actifs et invalides; échéances ouvertes/terminées; bornage de la progression rituelle. Le parcours navigateur mobile vérifie présence, liens et barre de progression; les tests du filtre et du farm restent verts.
- Progression du registre : 136/400.

## Tableau de bord — transformer les états vides en actions

- [x] C-137 — Les widgets sans bannière, événement, rotation, farm, favori, objectif ou profil affichent une explication courte et un bouton qui ouvre directement la page utile. Les destinations sont limitées à une liste interne sûre, le texte utilisateur est échappé, et le style s’adapte au mobile et à la réduction des animations.
- Vérifications : 23 tests unitaires du tableau de bord passés; parcours navigateur de disposition mobile passé avec ajout, masquage, restauration et copie; contrôles de syntaxe et diff à vérifier avant livraison.
- Progression du registre : 137/400.

## Tableau de bord — identité et portraits adaptés au téléphone

- [x] C-138 — La scène du tableau de bord affiche l’icône officielle du jeu actif et conserve les portraits du roster sur petit écran dans une rangée ronde, défilable et accessible. La zone reste compacte et respecte la réduction des animations.
- Vérifications : parcours navigateur Playwright à 390 px, icône de jeu attendue, deux portraits rendus et visibles, absence de débordement horizontal notable; contrôles syntaxe et diff.
- Progression du registre : 138/400.

## Tableau de bord — disposition large 1920 × 1080

- [x] C-139 — À partir de 1600 px, le tableau de bord centre sa scène, limite la largeur utile, passe les widgets sur quatre colonnes et conserve les zones de contenu à l’intérieur de leur carte.
- Vérifications : parcours navigateur à 390 px puis 1920 × 1080; aucun débordement horizontal et grille quatre colonnes confirmés; 23 tests unitaires du tableau de bord, syntaxe JS et contrôle diff.
- Progression du registre : 139/400.

## Tableau de bord — confort visuel et animations réduites

- [x] C-140 — Le panneau Apparence propose un contraste doux et une réduction des animations. Les choix sont enregistrés par jeu; l’option animations réduites suspend aussi les animations cosmiques, tandis que la préférence système « réduire les animations » reste appliquée. Le mode contraste calme les fonds et les lueurs sans toucher aux visuels des personnages.
- Vérifications : tests unitaires de normalisation des préférences; test navigateur qui active les deux options, vérifie l’état visuel et le stockage par univers; parcours responsive conservé.
- Progression du registre : 140/400.

## Tableau de bord — chargement progressif sans faux états vides

- [x] C-141 — Les widgets personnages et événements affichent des squelettes uniquement tant que leur source locale charge réellement. Les squelettes réservent leur place sur mobile; dès la réponse, le tableau de bord passe aux données ou à l’état vide guidé. Les erreurs ne sont pas masquées en faux chargement.
- Vérifications : 28 tests unitaires ciblés passés; parcours navigateur à 390 px et 1920 × 1080, chargement simulé puis résolu, squelettes retirés et portrait visible; vérifications de syntaxe JavaScript.
- Progression du registre : 141/400.

## Réseau des relations — contrôler aussi le bundle de référence

- [x] C-142 — Le contrôle relit les compteurs visibles de Ties, inspecte les scripts statiques chargés par la page, retrouve les agrégats de corpus, compare lignes d’histoire et quêtes, puis vérifie le JSON public d’un personnage. Il n’aspire pas le corpus narratif.
- Vérifications : la page et le JSON Amber répondent HTTP 200; compteurs concordants (233 308 passages d’histoire, 1 203 lignes vocales, 1 626 quêtes, 122 personnages, 68 012 références); quatre tests de l’audit passés.
- Progression du registre : 142/400.

## Studio de session — reprendre proprement après fermeture

- [x] C-143 — À la fermeture de l’application, une session en cours est sauvegardée en pause avec son temps écoulé, son compte à rebours restant et sa checklist. Au retour, elle n’ajoute pas les heures où Astralis était fermé et peut être reprise depuis le bouton existant.
- Vérifications : 10 tests unitaires ciblés passés; parcours navigateur qui simule `pagehide`, recharge l’application, vérifie l’état en pause puis reprend la session; syntaxe du module contrôlée.
- Progression du registre : 143/400.

## Studio de session — réordonner la checklist à la souris

- [x] C-144 — Vérifier et renforcer le réordonnancement par les contrôles monter/descendre : le clavier active le même mécanisme, le clic souris réordonne aussi, et l’ordre est immédiatement persistant.
- Vérifications : parcours navigateur réordonne par Entrée, recharge, puis réordonne par clic; les étapes sont affichées dans l’ordre enregistré.
- Progression du registre : 144/400.

## Tableau de bord — conserver les étapes déjà validées

- [x] C-145 — Dans « Ma session », les étapes de rotation terminées restent affichées avec une coche et leur état accessible; les étapes non terminées restent actives. Le farm du jour suit la même règle.
- Vérifications : test navigateur sur téléphone avec une rotation contenant une étape terminée et une étape à faire; compte, libellé, état `aria-pressed` et liste conservés.
- Progression du registre : 145/400.

## Studio de session — alerte de fin de sprint

- [x] C-146 — À expiration, le sprint sauvegarde zéro temps restant, met la session en pause, garde les étapes et affiche une unique notification locale. La session peut ensuite reprendre.
- Vérifications : parcours navigateur avec un sprint de 1 seconde; pause, compte à rebours nul, horodatage en cours supprimé et notification contrôlés.
- Progression du registre : 146/400.

## Studio de session — pauses planifiées

- [x] C-147 — Ajouter une pause optionnelle de 5, 10 ou 15 minutes à la création d’une session. À la fin du sprint, le choix de pause reste à la main du joueur; son compte à rebours n’inclut pas le temps où l’application est fermée.
- Vérifications : tests unitaires ciblés (10/10) et parcours navigateur vérifiant la pause proposée après le sprint, son démarrage, la sauvegarde du temps restant à la fermeture et la disponibilité de la reprise au retour; syntaxe JS contrôlée.
- Progression du registre : 147/400.


## Studio de session — comparer les sessions d’un même objectif

- [x] C-148 — L’historique compare une session à la moyenne des sessions précédentes du même objectif, pour le même jeu et la même activité. Il affiche la durée de l’écart, la moyenne et le nombre de références; les autres activités, titres et sessions futures sont exclus.
- Vérifications : test unitaire des critères de correspondance et de l’écart; tests ciblés du studio relancés; le rendu mobile garde la comparaison avec l’objectif.
- Progression du registre : 148/400.


## Studio de session — sauvegarde et transfert de l’historique

- [x] C-149 — L’historique se télécharge en JSON versionné et peut être importé depuis le même panneau. L’import valide les univers, activités, durées et dates, fusionne les enregistrements, évite les doublons par identifiant et par empreinte, ignore les entrées invalides et conserve les 300 sessions les plus récentes.
- Vérifications : 13 tests unitaires du studio passés; parcours navigateur importe un fichier avec doublons et entrée invalide, vérifie le stockage après rechargement puis le téléchargement JSON.
- Progression du registre : 149/400.
## Plan de farm — reste à farmer par personnage

- C-150 — Chaque fiche de personnage affiche désormais ses matériaux couverts, son manque restant et sa progression après répartition du stock selon l’ordre de priorité.
- C-151 — Le stock agrégé se développe en répartition par personnage, avec avatars, quantité attribuée, besoin et manque. Les matériaux partagés restent dédupliqués dans la saisie globale.
- C-152 — Chaque scénario de farm montre combien de jours l’inventaire réel fait gagner pour chaque personnage, avec comparaison au scénario identique sans stock. Les dates manquantes ou invalides restent « à confirmer ».
- Vérifications : 15/15 tests ciblés de synthèse, priorités et progression passés; vérifications de syntaxe JS et `git diff --check` réussies; parcours navigateur complet du plan de farm réussi, y compris le rendu du gain par stock et une ressource partagée entre Bennett et Diluc.
- Le réseau des relations a également été réaudité : le site tiers annonce 233 308 lignes d’histoire, 1 203 lignes vocales, 1 626 quêtes et 68 012 références; il livre les données par ressources statiques et fiches JSON individuelles, sans base globale exportable ni API documentée. Ces volumes externes ne sont pas présentés comme le corpus local d’Astralis.
- Progression du registre : 152/400.

## Plan de farm — filtrer le calendrier

- C-153 — Le calendrier et sa liste se filtrent par personnage et matériau, seuls ou combinés. Les sessions multi-personnages restent visibles si le personnage choisi en fait partie; les anciennes sessions qui ne conservent que le nom restent compatibles. Les filtres sont mémorisés localement.
- Vérifications : tests unitaires (2/2), syntaxe de l’application, parcours navigateur complet du plan de farm avec filtrage combiné calculé depuis le calendrier réel, puis remise à zéro vérifiée.
- Progression du registre : 153/400.

## Planificateur intelligent — répartir le retard

- C-154 — Le bouton de répartition reprogramme en un geste les tâches échues et non datées sur la semaine affichée. Il traite les priorités fortes d’abord, équilibre la charge entre jours libres et laisse intactes les tâches terminées.
- Vérifications : parcours navigateur avec objectifs urgents, hauts, normaux, bas, datés, sans date et déjà terminés; l’ordre de priorité, les échéances futures et l’état terminé sont contrôlés.
- Progression du registre : 154/400.

## Mes builds — décomposer les statistiques affichées

- C-155 — Un volet repliable détaille, pour chaque statistique calculée, la base issue des tables de niveau ou de la référence Enka, les ajouts modélisés et le total. Les totaux de la fiche et des builds importés restent inchangés; les effets conditionnels sont signalés comme séparés.
- Vérifications : tests unitaires (4/4), syntaxe JS et parcours navigateur Enka contrôlant les huit lignes de décomposition, leur cohérence base + ajouts = total, le changement d’arme et la persistance après rechargement.
- Progression du registre : 155/400.

## Équipes — réordonner les rotations

- C-156 — Les étapes de rotation se déplacent par glisser-déposer ou avec des commandes haut/bas accessibles au clavier et aux lecteurs d’écran. Les combos restent groupés même si l’utilisateur saisit une étape qui se trouve à l’intérieur.
- Vérifications : tests unitaires (2/2) sur les mouvements simples, limites et combos; parcours navigateur confirme l’enregistrement local après déplacement clavier puis glisser-déposer; syntaxe JS et `git diff --check` validés.
- Progression du registre : 156/400.

## Équipes — conserver plusieurs séquences

- C-157 — Une équipe peut garder plusieurs rotations nommées. On peut les charger, les mettre à jour, les supprimer et revenir à son brouillon manuel. Les changements de séquence sont synchronisés avec la sauvegarde locale de l’équipe.
- Vérifications : tests unitaires (2/2) sur création, mise à jour, bascule, brouillon manuel et suppression; parcours navigateur couvre l’enregistrement, le changement d’ordre, le retour manuel et la synchronisation au stockage local.
- Progression du registre : 157/400.

## Cabine des connaisseurs — mieux cibler les indices

- C-158 — L’indice bonus choisit la caractéristique la plus discriminante parmi les quatre portraits proposés et précise combien de portraits restent compatibles.
- Vérifications : test unitaire du meilleur indice et du personnage absent; suite du quiz (9/9), vérification syntaxique et diff propres.
- Progression du registre : 158/400.

## Réseau des relations — rendre visibles les trous de couverture

- C-159 — Chaque région indique les personnages reliés sur le total, avec un libellé accessible et une infobulle qui précise combien restent sans preuve locale. Le chiffre suit les preuves visibles avec les filtres courants.
- Vérifications : tests unitaires de couverture (profils reliés et isolés) et suites du réseau/quiz (23/23). Le parcours navigateur de cette longue page n’a pas terminé dans le délai; il n’est pas déclaré réussi.
- Progression du registre : 159/400.

## Réseau des relations — navigation spatiale au clavier

- C-160 — Depuis un portrait du graphe, les flèches donnent le focus au nœud visible le plus proche dans cette direction. Entrée/Espace ouvrent les portraits comme les boutons natifs; les commandes sont précisées dans l’aide.
- Vérifications : tests unitaires couvrant les quatre directions, l’absence de cible et les touches ignorées; modules syntaxiquement valides.
- Progression du registre : 160/400.

## Réseau des relations — pistes documentées à proximité

- C-161 — Si aucun chemin n’est visible entre deux personnages, afficher le meilleur lien sourcé adjacent de chacun, sans suggérer qu’ils sont eux-mêmes liés.
- Vérifications : tests ciblés (21/21) sur le tri des preuves et l’exclusion du personnage comparé; pas de résultat navigateur déclaré.
- Progression du registre : 161/400.

## Réseau des relations — tester les filtres sans spoilers

- C-162 — Depuis un comparatif sans chemin visible, élargir les filtres région, élément, version, possession, source et direction; conserver la langue, le thème, la vue et la protection anti-spoiler.
- Vérifications : test unitaire des préférences préservées et des filtres élargis; suites quiz/réseau (22/22). La vérification navigateur complète n’est pas déclarée.
- Progression du registre : 162/400.

## Réseau des relations — bilan lisible des preuves du duo

- C-163 — Ajouter quatre compteurs dédupliqués dans la relation directe : voix A→B, voix B→A, répliques présentes dans les deux sens et scènes d’histoire uniques.
- Vérifications : test unitaire des doublons de traduction et des mentions collectives; suites quiz/réseau (23/23).
- Progression du registre : 163/400.

## Bibliothèque — filtres actifs visibles

- C-164 — Afficher sous la barre les filtres actifs sous forme de pastilles accessibles; on peut supprimer un seul filtre sans perdre les autres critères.
- Vérifications : test unitaire des six familles de filtres, du retrait ciblé et de la conservation d’état; 47 tests ciblés passent.
- Progression du registre : 164/400.

## Planificateur — aperçu de la charge hebdomadaire

- C-165 — Ajouter le nombre de tâches ouvertes, les journées encore libres et la date la plus chargée, sans compter les tâches terminées.
- Vérifications : tests unitaires des calendriers valides et vides et de l’exclusion des tâches terminées; 50 tests ciblés passent.
- Progression du registre : 165/400.

## Réseau des relations — séparer les sources par région

- C-166 — Le roster des régions indique maintenant la couverture des preuves vocales et des scènes d’histoire, et le nombre de profils couverts par les deux types.
- Vérifications : test unitaire des profils ayant voix, histoire, les deux et aucun; suites ciblées (29/29), syntaxe et diff propres.
- Progression du registre : 166/400.

## Tâches — visualiser l’avancement par catégorie

- C-167 — Les filtres de catégorie affichent le total, les objectifs encore ouverts et le nombre terminé; les catégories restent sélectionnables avec les filtres de tâches existants.
- Vérifications : tests des accents, catégories vides et taux de progression; suites ciblées (59/59), syntaxe `app.js` et `git diff --check` propres.
- Progression du registre : 167/400.

## Carnet — aperçu de l’activité des notes

- C-168 — Le carnet indique le total de notes, celles liées à un personnage, les notes épinglées et celles modifiées dans les sept derniers jours.
- Vérifications : test unitaire couvrant notes anciennes, récentes, futures, sans personnage et liste vide; syntaxe et diff validés.
- Progression du registre : 168/400.

## Réseau des relations — copier une preuve avec sa provenance

- C-169 — Chaque preuve vocale ou narrative peut copier une citation structurée avec direction, langue, extrait et URL source; l’action est annoncée dans le bouton.
- Vérifications : test unitaire du format avec et sans métadonnées; syntaxe des modules et diff validés.

## Planificateur — faire ressortir les objectifs urgents

- C-170 — Le résumé hebdomadaire distingue maintenant les tâches urgentes et hautement prioritaires du volume global, sans compter les tâches terminées.
- Vérifications : test unitaire du comptage global, du jour de pointe, des priorités et des tâches clôturées; suite ciblée carnet/planificateur/réseau (9/9), vérifications de syntaxe et `git diff --check` propres.

## Vœux — afficher une plage de dépenses simulée

- C-171 — Pour chaque objectif ordonné, la simulation expose les quantiles de 10 %, 50 % (médiane) et 90 % des vœux cumulés; le graphe distingue désormais la plage de dépense plutôt qu’une seule médiane.
- Vérifications : scénarios de garantie, ordre d’objectifs, déterminisme et valeur de nombre de tirages invalide couverts par les tests de simulation.

## Équipes — repérer les personnages partagés dans une comparaison

- C-172 — Le comparatif des équipes montre les portraits et noms des personnages présents dans toutes les compositions sélectionnées, au lieu de ne fournir qu’une liste textuelle.
- Vérifications : test de sélection et calcul des membres partagés; contrôle navigateur du parcours de comparaison des équipes.

## Énergie — suivre la régularité sur 28 jours

- C-173 — La carte mensuelle indique la série d’activité en cours et le meilleur enchaînement, en plus des jours actifs et de l’énergie dépensée.
- Vérifications : tests unitaires d’une série active aujourd’hui, d’une pause aujourd’hui et de l’exclusion des jours sans action.

## Réseau des relations — consulter des itinéraires de même longueur

- C-174 — Le comparatif propose jusqu’à huit itinéraires documentés ayant le même nombre minimal de liens. Le bouton « Autre itinéraire » met à jour la liste des portraits et les liaisons accentuées, tout en respectant les filtres de preuve actifs.
- Vérifications : les tests unitaires couvrent chemins multiples, priorité aux preuves les plus fortes, plafond de résultats et paire non connectée. Le corpus n’est ni complété par des liens supposés ni gonflé par des dialogues non audités.

## Planificateur — distinguer la charge par priorité

- C-175 — L’agenda hebdomadaire calcule maintenant une pression de charge à partir des tâches ouvertes : urgente (3), haute (2), normale (1), basse (0,5). Les tâches terminées ne pèsent pas sur le score. Les jours chargés et très chargés sont marqués clairement, y compris sur petit écran.
- Vérifications : tests unitaires des quatre poids, seuils, accents et tâches terminées; parcours navigateur de l’agenda des conflits; contrôle syntaxique et diff propre.

## Équipes — retrouver les compositions répétées

- C-176 — La bibliothèque repère les équipes ayant exactement les mêmes personnages, quel que soit l’ordre des places, et permet de filtrer ces doublons. Les équipes incomplètes sans composition comparable restent ignorées.
- Vérifications : tests unitaires sur l’ordre des emplacements, les membres absents, les équipes partielles et le filtre.

## Planificateur — estimer la durée depuis les sessions personnelles

- Point 064 — Chaque tâche du calendrier peut afficher une durée médiane issue des sessions terminées de même jeu et de même intitulé. Le jour additionne seulement les tâches ouvertes pour lesquelles une correspondance existe; les tâches sans historique comparable n’obtiennent aucune estimation.
- Vérifications : tests du calcul médian, de l’isolation par jeu, des valeurs invalides, du total partiel et du format; parcours navigateur avec historique local semé, contrôle des tâches terminées, des absences de correspondance, du total journalier et du rendu mobile.


## Studio de session — annotations de personnage

- Le formulaire associe une session à un personnage du jeu actif; son nom et son portrait restent liés à la session.
- Une note facultative est enregistrée automatiquement en cours de session, puis conservée dans l’historique et les exports JSON.
- La recherche d’historique couvre le personnage et la note; les champs importés sont bornés et les sources d’image non sûres sont ignorées.
- Vérifications : 14 tests unitaires du Studio/rythme hebdomadaire et parcours navigateur mobile complet.


## Réseau des relations — récits publics multilingues

- Les fiches des personnages jouables donnent accès aux récits Ties publics EN, chinois, japonais et coréen directement depuis le dossier, sans mélanger ces pages sources avec les preuves relationnelles locales.
- La collecte confirmée distingue 233 308 passages d’histoire et 1 203 lignes vocales; aucun export de base global n’est disponible.
- Vérifications : les quatre liens ont été ouverts pour Amber, Furina, Neuvillette et Columbina (HTTP 200), et le parcours navigateur vérifie les liens d’Amber.

## Équipes — conserver les fiches ouvertes

- Les fiches d’équipe ouvertes sont mémorisées séparément pour chaque univers et restaurées après tri, filtre ou nouveau rendu. « Tout développer/réduire » ne change que les équipes actuellement visibles; les choix individuels restent synchronisés.
- Vérifications : tests unitaires sur identifiants supprimés et données corrompues; Chromium confirme l’état après changement de tri, sans erreur JavaScript.

## Arcade — suspendre les chutes inactives

- Le minuteur du Tetris est annulé en quittant son mode et ne planifie aucun nouveau tick si le plateau est en pause, fini, masqué ou démonté. Le retour au Tetris et la reprise relancent un seul minuteur.
- Vérifications : tests unitaires des états actifs/inactifs et parcours navigateur des onglets de l’arcade.

## Puzzle élémentaire — résonateur temporaire

- Aligner au moins quatre éléments charge le score ×2 pendant huit secondes; une nouvelle grande réaction renouvelle le bonus. La jauge indique le temps restant, et une nouvelle partie ou la fin efface le compte à rebours.
- Vérifications : calculs de score et de chaîne testés; Chromium a créé le bonus par échange, observé la jauge décroître puis vérifié le reset sans erreur de script.

## Puzzle élémentaire — particules de réaction

- Les cases effacées produisent un éclat et trois particules teintées par élément. Elles restent dans le cadre du plateau, sont supprimées après leur animation et ne sont pas jouées avec `prefers-reduced-motion`.
- Vérifications : parcours navigateur sur réaction de quatre cases et nettoyage des effets.
- Progression du registre : 176/400.

## Arcade — prévisualiser la grille Tetris

- La largeur et la hauteur choisies dessinent maintenant une miniature proportionnelle et accessible dans les réglages. Elle se met à jour immédiatement; les dimensions sont persistées et appliquées au plateau réel au prochain redémarrage.
- Vérifications : Chromium vérifie la miniature 12 × 24, son libellé accessible, la sauvegarde locale, puis le canvas de partie redimensionné en 360 × 720.
- Progression du registre : 177/400.

## Arcade — repli sans roster

- Un portrait d’univers sert de repli quand aucun personnage n’est chargé. La personnalisation et le jeu restent utilisables sans exception JavaScript.
- Vérifications : Chromium démarre avec une liste de personnages vide, puis modifie et applique le plateau sans erreur.
- Progression du registre : 178/400.

## Arcade — profils rapides Tetris

- « Voie calme », « Classique » et « Défi astral » règlent la grille, la cadence et les options de plateau d’un seul geste. Les boutons reflètent le profil exact sélectionné; toute personnalisation manuelle les désactive visuellement. Les réglages restent enregistrés et s’appliquent au redémarrage.
- Vérifications : parcours Chromium pour les trois profils, valeurs locales, états `aria-pressed`, écart manuel et taille finale du canevas.
- Progression du registre : 179/400.

## Arcade — indice de mémoire

Le jeu de mémoire offre deux indices par manche. Un indice montre une paire non trouvée pendant un court instant et ajoute deux coups au compteur. Il ne peut pas interrompre une animation ou une manche terminée.

- Vérifications : parcours Chromium contrôlant le quota, l’état disponible après une erreur, les deux cartes révélées et leur fermeture, le coût de coups et les états du bouton. Les tests de modèle passent.
- Total du registre d’améliorations : 180/400.
- Compteur de référence du réseau Ties : 233 308 passages d’histoire; les 1 203 lignes vocales restent un indicateur distinct.

## Arcade — commandes clavier du jeu de mémoire

Le jeu de mémoire se parcourt au clavier avec les flèches; Entrée ou Espace retourne la carte et Échap recommence. Après chaque actualisation du plateau, le focus reste sur la carte utilisée. La grille annonce ses commandes aux technologies d’assistance.

- Vérification : Chromium confirme le déplacement, l’activation, la conservation du focus et la remise à zéro, puis repasse le scénario des indices.
- Total du registre d’améliorations : 181/400.

## Arcade — annonces accessibles et ciblées

Les actions du jeu de mémoire sont annoncées dans une région `status` dédiée; les lecteurs d’écran n’ont plus à réentendre toute la grille après chaque carte. Les messages couvrent les cartes retournées, les paires, les erreurs, les indices et la victoire.

- Vérification : parcours navigateur sur les rôles ARIA et les annonces en plus du jeu complet; syntaxe JavaScript contrôlée.
- Total du registre d’améliorations : 182/400.

## Arcade — célébration visuelle d’une paire

Une paire trouvée fait brièvement rebondir les deux portraits avec une lueur douce. L’effet s’arrête tout seul, reste sur les cartes, se nettoie si la partie redémarre et est désactivé pour les personnes ayant réduit les animations.

- Vérification : Chromium observe l’apparition et la fin de l’effet, puis termine une partie; aucun problème navigateur.
- Total du registre d’améliorations : 183/400.


## Planificateur intelligent — semaine duplicable et imprimable

Les objectifs encore ouverts de la semaine précédente peuvent être reportés sur les mêmes jours; les tâches terminées et doublons sont ignorés. L’agenda courant peut aussi être imprimé ou enregistré en PDF sur une page paysage lisible.

- Vérification : test navigateur de la copie (métadonnées, doublons, second clic et téléphone), test des styles d’impression en Chromium, 10 tests unitaires de planification et vérification de syntaxe.
- Points terminés retirés du registre restant : 073 et 080. Progression cumulée du registre : 186/400.


## Planificateur intelligent — charge croisée des jeux

Les jours qui cumulent des objectifs ouverts sur plusieurs jeux affichent un repère concis avec le nombre d’objectifs Genshin, Star Rail et Wuthering Waves. Les tâches terminées ne gonflent pas le signal.

- Vérification : test unitaire des combinaisons, compteurs et tâches terminées; test navigateur de la copie, du repère multi-jeux, du rendu imprimable et de la page sans erreur; parcours navigateur de la charge, progression et export calendrier.
- Point terminé retiré du registre restant : 069. Progression cumulée du registre : 186/400.


## Carnet — tri personnalisé des notes

Le carnet peut être trié par date récente ou ancienne, par titre ou par personnage. Les notes épinglées restent en haut de la liste et le choix est mémorisé pour chaque univers. Les contrôles se replient sur téléphone sans élargir la page.

- Vérification : quatre tests unitaires et parcours Chromium pour les tris, les filtres croisés, la mémorisation et l’affichage à 390 px.
- Suivi supplémentaire : 7/500.


## Tâches & objectifs — récurrence personnalisable

Le formulaire de tâche propose maintenant une répétition quotidienne, hebdomadaire ou mensuelle. La nouvelle tâche n'est créée qu'une fois l'occurrence terminée; elle reprend catégorie, priorité, personnage et étapes, avec une checklist réinitialisée. Les dates mensuelles en fin de mois sont ajustées au dernier jour disponible. Les complétions depuis la liste, le traitement groupé et le tableau de bord suivent la même règle.

- Vérification : tests unitaires pour les dates, le saut d'année, les années bissextiles, les étapes, les données conservées et les doublons; contrôles de syntaxe JavaScript et du diff.
- Point 065 retiré du registre restant; registre historique : 187/400. Suivi supplémentaire : 8/500.


## Planificateur — modes d’engagement des tâches

Chaque objectif peut être marqué fixe, flexible ou optionnel. L’outil de répartition laisse intactes les dates fixes, place les tâches flexibles d’abord et ne propose les optionnelles qu’après. Les objectifs déjà enregistrés sans ce réglage restent flexibles par défaut.

- Vérification : tests unitaires du mode par défaut, de la priorité entre flexibles et optionnelles et de la conservation des dates fixes; parcours navigateur de l’éditeur, du badge et de la persistance du mode avec une tâche récurrente; syntaxe JS et diff contrôlés.
- Point 066 retiré du registre restant; registre historique : 188/400. Suivi supplémentaire : 9/500.


## Planificateur — prochain créneau libre

Le planificateur estime le premier créneau où une session tient dans le temps quotidien disponible. Il cumule les tâches ouvertes datées de Genshin, Star Rail et Wuthering Waves, utilise d’abord leurs durées renseignées puis l’historique personnel de sessions; sans données comparables, il utilise la durée de session réglée et le signale. L’heure de début et la capacité quotidienne sont personnalisables. Un bouton réserve le créneau comme objectif daté dans l’agenda.

- Vérification : 5 tests unitaires et parcours Chromium réel réussis pour la charge Genshin/Star Rail, le réglage persistant, la réservation dans l’agenda, l’affichage mobile à 390 px et l’absence d’erreur JavaScript.
- Point 067 retiré du registre restant; registre historique : 189/400. Suivi supplémentaire : 10/500.


## Planificateur — filtres croisés de l’agenda

La semaine peut maintenant se concentrer sur un univers, un personnage ou une catégorie d’objectif, avec combinaison des trois filtres et mémorisation locale. La charge hebdomadaire et les conflits multi-jeux restent calculés sur l’ensemble des objectifs, même quand l’affichage est filtré, afin de conserver le contexte global.

- Vérification : tests unitaires des combinaisons de critères, des catégories vides, des options triées et de personnages homonymes dans des jeux différents; parcours Chromium du filtre, de sa persistance et du mobile.
- Point 070 retiré du registre restant; registre historique : 190/400. Suivi supplémentaire : 11/500.


## Planificateur — vue agenda compacte

L’agenda propose maintenant deux présentations : grille hebdomadaire et liste compacte. Le choix est mémorisé sur cet appareil, les commandes restent accessibles au clavier et la liste passe en deux colonnes jour/contenu sur téléphone pour limiter le défilement et garder chaque tâche lisible.

- Vérification : parcours Chromium pour le changement grille/liste, sa persistance et l’absence de débordement horizontal à 390 px.
- Point 079 retiré du registre restant; registre historique : 191/400. Suivi supplémentaire : 12/500.

## Tâches & objectifs — raccourci vers une session

Depuis une tâche ouverte, « Faire une session » prépare le Studio de session avec le titre, le jeu, le personnage et les étapes qui restent à faire. La catégorie choisit un type de session adapté; les champs restent éditables avant le démarrage. Le raccourci disparaît lorsqu'une session est déjà active.

- Vérification : tests du transfert et test Chromium du flux complet jusqu’au lancement effectif; contrôle du stockage de la session et absence d’erreur JavaScript.
- Suivi supplémentaire : 13/500.

## Retour à l’objectif depuis une session — 15 novembre 2026

- Une session lancée depuis une tâche conserve l’identifiant de cette tâche. Son panneau actif permet d’y revenir, la carte est centrée et brièvement soulignée, et le raccourci « Faire une session » reste masqué pendant que le chrono tourne.
- Vérification : test Chromium complet de la tâche vers le Focus Studio puis retour ciblé; tests unitaires et syntaxe JavaScript valides.
- Suivi supplémentaire : 14/500.

## Progression de tâche synchronisée au Focus Studio — 15 novembre 2026

- Les étapes ouvertes sont transférées avec leur identifiant. Une coche dans le Focus Studio met immédiatement à jour l’étape correspondante de la tâche d’origine, sans recopier les étapes déjà faites.
- Vérification : test Chromium du transfert, de la mise à jour locale et du retour à la tâche; tests unitaires, syntaxe JS et contrôle diff valides.
- Suivi supplémentaire : 15/500.

## Création rapide d’objectif au clavier — 15 novembre 2026

- `Alt + Maj + T` ouvre la fiche de création de tâche depuis n’importe quelle page quand aucun champ ou dialogue n’est actif. Le jeu courant et le personnage consulté sont repris; le rappel du raccourci est visible dans la fiche.
- Vérification : test Chromium du raccourci, rendu de l’aide et absence d’erreur JavaScript.
- Suivi supplémentaire : 16/500.

## Carnet de voyage : import et fusion des sauvegardes — 15 novembre 2026

- Ajout du rétablissement des archives JSON exportées depuis le Carnet de voyage. L’import fusionne les appareils, ignore les doublons et entrées invalides, et préserve les traces locales.
- Vérifications : tests unitaires des formats, dates, limites et doublons; parcours Chromium réel avec sélection du fichier et persistance; syntaxe JS validée.
- Suivi supplémentaire : 17/500.

## Objectifs — choix de report en retard

Les tâches échues gardent l’action rapide « Demain » et proposent aussi 3 jours, une semaine ou deux semaines. Le calcul des échéances relatives utilise désormais la date locale, cohérente avec le calendrier et les reports, ce qui supprime le décalage d’un jour autour de minuit.

- Vérification : test Chromium du report rapide et du report à une semaine, plus validation des échéances et des fonctions de progression des listes.
- Suivi supplémentaire : 25/500.

## Objectifs — choisir une date sans ouvrir l’éditeur

Les cartes sans échéance proposent un calendrier compact intégré. Choisir un jour suffit à enregistrer et afficher la date, tout en gardant les raccourcis Aujourd’hui et Demain. Le contrôle reste utilisable au clavier et s’adapte aux petits écrans.

- Vérification : Chromium choisit une date à dix jours et vérifie la persistance; reports et dates relatives vérifiés dans le même parcours.
- Suivi supplémentaire : 26/500.

## Arcade commune — épingler ses modes préférés

La barre de l’arcade affiche désormais les modes favoris au-dessus de la liste complète. Le bouton étoile ajoute ou retire le mode actuellement ouvert; les raccourcis reviennent directement à ce mode. La liste est stockée localement, supporte les commandes clavier et se replie sur petit écran.

- Vérification : Chromium ajoute le troisième mode, le rouvre depuis le raccourci, recharge la page pour confirmer sa conservation, puis le retire; contrôle mobile sans débordement.
- Suivi supplémentaire : 27/500.

## Arcade commune — préférence sonore conservée

Le bouton des effets sonores garde maintenant son état d’une visite à l’autre. Après rechargement, l’audio reste soumis au geste utilisateur exigé par le navigateur : un clic ou une touche réveille le contexte, sans lecture audio forcée au démarrage.

- Vérification : Chromium active, recharge et désactive les effets, vérifie l’état accessible et la préférence locale, sans erreur de page.
- Suivi supplémentaire : 28/500.

## Arcade commune — curseur de volume des effets

Un curseur compact permet de régler les effets sonores indépendamment de la musique officielle. Son niveau est restauré à la prochaine ouverture; zéro coupe complètement les tons. L’affichage et les commandes sont adaptés aux petits écrans.

- Vérification : Chromium règle le curseur à 35 %, vérifie son libellé et sa persistance après rechargement, puis contrôle sa visibilité et l’absence de défilement horizontal à 390 px.
- Suivi supplémentaire : 29/500.

## Arcade commune — volume musique indépendant

Le lecteur de musique officielle dispose de son propre curseur, séparé du volume des effets. Le niveau choisi est appliqué au lecteur et conservé entre les sessions; le contrôle s’adapte aussi au téléphone.

- Vérification : Chromium règle 40 %, recharge, rouvre le lecteur et confirme que l’élément audio utilise encore le même niveau; pas de débordement horizontal en 390 px.
- Suivi supplémentaire : 30/500.

## Arcade commune — commandes à la manette

Le Tetris astral accepte désormais une manette : déplacement, descente, rotation, chute rapide, réserve et pause. Le statut de connexion et la dernière action sont annoncés sans interrompre le jeu. La lecture des entrées est arrêtée quand l’arcade est quittée ou détruite.

- Vérification : navigateur Chromium avec manette simulée; connexion, rotation, déplacement et arrêt de la boucle au démontage contrôlés.
- Suivi supplémentaire : 31/500.

## Navigation globale — destinations épinglées

La palette de recherche permet maintenant d’épingler les destinations fréquentes. Jusqu’à douze pages et actions peuvent être gardées en tête des résultats dans l’ordre où elles ont été épinglées, avec un bouton accessible et une préférence locale.

- Vérification : parcours navigateur pour épingler Vœux, persistance, ordre clavier et largeur mobile.
- Suivi supplémentaire : 32/500.

## Application entière — état de connexion visible

L’indicateur du menu latéral suit maintenant l’état réseau du navigateur. Il distingue la disponibilité internet du mode hors ligne, sans prétendre que les contenus sont fraîchement synchronisés et rappelle que les sauvegardes locales restent disponibles. Il se met à jour après chaque changement de connexion et à chaque recréation du menu.

- Vérification : parcours Chromium hors ligne → en ligne, libellé accessible et navigation globale testés.
- Suivi supplémentaire : 33/500.

## Sauvegardes — aperçu avant import

L’import affiche maintenant la date et un aperçu des volumes par univers, préférences, favoris et données partagées. L’utilisateur peut annuler sans rien modifier, ou confirmer la restauration. La fenêtre est conçue pour rester lisible sur téléphone.

- Vérification : export réel → aperçu → annulation sans écriture → nouvel aperçu → confirmation → vérification des données restaurées; tests unitaires de la sauvegarde validés.
- Suivi supplémentaire : 34/500.

## Navigation globale — capture rapide de tâche et de note

La palette permet maintenant de démarrer une tâche ou une note depuis n’importe quelle page. L’action reprend le jeu actif et, si une fiche de personnage est ouverte, lie le nouvel élément à ce personnage.

- Vérification : parcours Chromium depuis le Carnet de voyage, où les boutons de création sont absents; les deux modales s’ouvrent correctement. État réseau, épingles, clavier et mobile restent également testés.
- Suivi supplémentaire : 35/500.

## Navigation globale — sprint de concentration immédiat

La palette lance désormais une session de concentration de 25 minutes sans passer par le formulaire. Elle ouvre le Studio de session, garde le jeu actif, et refuse un second lancement tant qu’une session existe déjà. Pause, reprise et fin restent celles du minuteur normal.

- Vérification : scénario Chromium depuis le Carnet de voyage : démarrage, durée de 25 minutes, pause, reprise, fin et présence dans l’historique; aucune erreur JavaScript, avec contrôles clavier et mobile du reste de la palette.
- Suivi supplémentaire : 36/500.

## Palette contextuelle — retrouver une session active

Pendant un sprint, la palette remplace le lancement d’une nouvelle session par « Ouvrir ma session en cours ». L’action apparaît uniquement lorsqu’une session est enregistrée, revient sur le bon univers et conserve le minuteur existant.

- Vérification : sprint démarré depuis le Carnet, navigation vers une autre page, recherche et réouverture via la palette; identifiant inchangé, puis pause, reprise et fin validées dans le même parcours Chromium.
- Suivi supplémentaire : 37/500.

## Raccourci global — lancer ou retrouver le sprint

Alt+Maj+F démarre un sprint de 25 minutes depuis une page commune, ou rouvre la session existante si le minuteur tourne déjà. Le rappel est affiché dans la palette de navigation.

- Vérification : scénario Chromium valide les deux comportements et confirme que l’identifiant de session ne change pas lors de la réouverture.
- Suivi supplémentaire : 38/500.

## Boîte de bord — roster prêt pour le farm du jour

Quand les catalogues ne sont pas encore présents, l’ouverture de la Boîte de bord charge le roster et les matériaux nécessaires à ses lignes de farm. Une session avec plusieurs personnages peut donc afficher leurs portraits et enregistrer leur progression séparément.

- Vérification : ouverture depuis le Carnet, deux membres affichés, puis 0/2 → 1/2 sans erreur; tests de l’inbox et du suivi multi-personnages passés.
- Suivi supplémentaire : 39/500.

## Objectifs — restauration après suppression

La suppression individuelle et l’effacement de plusieurs tâches proposent une annulation. La restauration récupère leurs étapes et leurs échéances et évite d’écraser une tâche existante.

- Vérification : scénario navigateur supprime/restaure une tâche puis deux tâches sélectionnées; échéance persistée et aucune erreur JavaScript.
- Suivi supplémentaire : 40/500.

## Studio de session — minuteur réconcilié au retour

Au retour dans Astralis, le sprint ou la pause est recalculé immédiatement, sans dépendre du rythme auquel le navigateur a laissé tourner l’onglet en arrière-plan.

- Vérification : scénario navigateur force le retour au premier plan à l’échéance; passage immédiat en pause et notification unique. 11 tests unitaires réussis.
- Suivi supplémentaire : 41/500.

## Palette — destinations récentes sur mobile

La palette enregistre désormais les destinations ouvertes depuis la barre mobile et les onglets de jeu en haut. Une page consultée sur téléphone peut donc être retrouvée dans les destinations récentes.

- Vérification : scénario navigateur à 390 px ouvre le tableau de bord avec la barre mobile et le retrouve dans la palette; vérifications de navigation et clavier réussies.
- Suivi supplémentaire : 42/500.

## Carnet de voyage — restaurer une note supprimée

La confirmation de suppression d’un souvenir est suivie d’une action temporaire « Annuler ». Le texte et sa date sont restaurés sans remplacer une note existante ni supprimer les traces voisines.

- Vérification : annulation de confirmation, suppression puis restauration exacte, suppression définitive, visite voisine conservée; six tests unitaires réussis.
- Suivi supplémentaire : 43/500.

## Planificateur — annuler un déplacement

Le déplacement d’une tâche par glisser-déposer ou Alt + flèche affiche maintenant une action temporaire « Annuler ». Elle remet l’échéance antérieure et protège une échéance changée depuis le déplacement.

- Vérification : annulation normale et conflit d’échéance simulé en Chromium; syntaxe JavaScript et vérification Git propres.
- Suivi supplémentaire : 44/500.

## Objectifs — annuler une date rapide ou un report

Les boutons de planification et de report, y compris le choix d’une date, partagent maintenant l’annulation sûre du Planificateur. Une tâche auparavant sans date revient sans date; le report d’une échéance ancienne peut aussi être annulé.

- Vérification : navigation réelle dans le Planificateur et la liste des tâches, planification rapide, report, restauration et protection contre une modification ultérieure.
- Suivi supplémentaire : 45/500.

## Objectifs — annuler la planification groupée

La commande « Planifier demain » pour une sélection propose une annulation qui restaure les dates une par une. Toute nouvelle date saisie après l’opération est préservée.

- Vérification : test Chromium avec deux tâches, dont une échéance modifiée entre la planification et l’annulation; restauration partielle attendue et aucune erreur JS.
- Suivi supplémentaire : 46/500.

## Objectifs — annuler une complétion individuelle ou groupée

Terminer un objectif propose une action temporaire « Annuler », depuis la liste, l’agenda ou une sélection. L’objectif retrouve son état ouvert; une prochaine occurrence créée par la récurrence est retirée uniquement si personne ne l’a modifiée.

- Vérification : navigateur réactive les tâches terminées, conserve les étapes, restaure les sélections récurrentes et garde une occurrence suivante retouchée; 5 tests unitaires et le parcours existant de récurrence réussis.
- Suivi supplémentaire : 47/500.

## Boîte de bord — annuler une tâche dans la modale

L’annulation de complétion est intégrée à la Boîte de bord : le rappel revient dans la liste sans quitter la fenêtre. L’action expire automatiquement et reste disponible même si les notifications flottantes sont bloquées par la modale.

- Vérification : navigateur Chromium termine puis restaure une tâche; l’objectif revient dans la liste et le suivi multi-personnages de farm conserve son état.
- Suivi supplémentaire : 48/500.

## Vœux & objectifs — courbe quotidienne des gains

Une nouvelle courbe cumule le solde, les commissions et les revenus configurés, puis les compare aux plafonds des objectifs. Les récompenses ponctuelles sont marquées séparément; les dates de bannières estimées apparaissent sur la période choisie. La courbe se met à jour avec le formulaire et reste distincte du graphe de probabilité.

- Vérification : navigateur contrôle la mise à jour des gains, les repères de garantie, les graphes existants et l’affichage d’une période invalide; 13 tests unitaires vœux passent.
- Suivi supplémentaire : 49/500.

## Studio de session — bilan de l’historique par période

L’historique propose trois fenêtres temporelles : 7 jours, 30 jours ou tout l’historique. Une synthèse se recalcule à chaque filtre et donne le nombre de sessions, le temps cumulé, la moyenne et la part d’étapes terminées.

- Vérification : tests unitaires sur les dates locales et les agrégats; navigateur Chromium couvre les périodes, leur combinaison avec les autres filtres et le mobile.
- Suivi supplémentaire : 50/500.

## Studio de session — recherche étendue

La recherche peut retrouver une session par son personnage ou le contenu de sa note, en plus de son titre et de son activité.

- Vérification : scénario Chromium retrouve la bonne session via un mot présent uniquement dans une note; aucune erreur JavaScript.
- Suivi supplémentaire : 51/500.

## Carnet de voyage — classer et retrouver les souvenirs

Les nouvelles notes peuvent être classées en Souvenir, Build, Farm, Équipe ou Idée. Un filtre dédié facilite le tri, et la catégorie reste dans les sauvegardes fusionnées et exportées.

- Vérification : test unitaire de filtrage et de validation à l’import; navigateur crée et classe une note, filtre les catégories et contrôle l’affichage sur téléphone.
- Suivi supplémentaire : 52/500.

## Carnet de voyage — corriger la catégorie d’un souvenir existant

Chaque note peut désormais être reclassée depuis son entrée. La modification est enregistrée immédiatement et met à jour le filtre sans toucher aux autres traces.

- Vérification : tests unitaires de mise à jour et de validation; Chromium contrôle la sauvegarde locale, le filtre et l’affichage mobile.
- Suivi supplémentaire : 53/500.


## Planificateur — lancer une session depuis l’agenda

Chaque tâche ouverte de la semaine propose désormais un raccourci vers une session de concentration. Le jeu, le personnage et la checklist restante sont repris automatiquement; une session en cours ne peut pas être remplacée par inadvertance.

- Vérification : scénario Chromium complet, synchronisation d’une étape vers la tâche source, tests du calendrier hebdomadaire et contrôle de syntaxe.
- Suivi supplémentaire : 54/500.


## Vœux & objectifs — estimer quand chaque plafond sera financé

Le graphique de revenus marque désormais la date à laquelle le budget projeté atteint le coût plafond de chaque objectif. Si le budget reste insuffisant, le panneau indique les vœux manquants à la fin de la période.

- Vérification : test navigateur avec solde, objectif et période contrôlés; affichage mobile et contrôles de syntaxe validés.
- Suivi supplémentaire : 55/500.


## Défi quotidien — voir les thèmes à renforcer

Une carte de progression détaille maintenant la précision de chaque type d’indice, séparément pour chaque univers. Les réponses du défi quotidien l’alimentent; le mode révision reste séparé afin de ne pas gonfler les résultats. Les thèmes encore jamais rencontrés sont marqués « À découvrir ».

- Vérification : tests modèle et navigateur, enregistrement des réponses justes/fausses et contrôle mobile.
- Suivi supplémentaire : 57/500.

## Planificateur — étaler les tâches selon leur durée prévue

La répartition du backlog compare maintenant la durée des objectifs déjà posés et la durée des nouvelles tâches. Elle préfère la durée saisie, reprend l’estimation personnelle quand elle existe, puis utilise la session choisie comme solution de repli. Les tâches fixes ou terminées ne sont pas déplacées.

- Vérification : tests unitaires de l’équilibrage pondéré, des priorités et des modes d’échéance; syntaxe de l’application vérifiée.
- Suivi supplémentaire : 59/500.

## Carnet — créer une tâche à partir d’une note

Le carnet propose maintenant de préparer une tâche depuis une note, en gardant le personnage, l’univers et les cases de checklist déjà écrites. Le brouillon s’ouvre dans l’éditeur afin d’ajouter une date ou de corriger ses étapes avant sauvegarde; la note originale n’est pas modifiée.

- Vérification : tests unitaires de la conversion de note en brouillon, des cases cochées, des catégories et des limites.
- Suivi supplémentaire : 59/500.

## Suivi d’énergie — objectif de dépense quotidien

Chaque jeu peut avoir un cap journalier de dépense énergétique. Les actions de dépense consignées font avancer une jauge du jour; la progression confirme l’objectif et se remet naturellement à zéro au changement de date locale. La cible peut être changée ou retirée.

- Vérification : calculs unitaires couvrant le changement de jour et les dépassements; scénario Chromium avec sauvegarde, deux dépenses successives et effacement.
- Suivi supplémentaire : 57/500.

## Compteur courant

- Avancement des améliorations supplémentaires : **83 / 500**.

## Sets & reliques — aperçu de l’inventaire — 16 novembre 2026

- Le catalogue des sets résume les pièces possédées par emplacement, classe les sets présents et montre les huit reliques les plus récemment ajoutées avec leur icône et leurs statistiques principales.
- Vérification : tests de tri de l’inventaire, syntaxe JavaScript et contrôle du diff.
- Avancement des améliorations supplémentaires : **84 / 500**.
- Derniers points réalisés : détail quotidien d’Énergie, objectifs du Studio et du Planificateur, progression du Carnet, suivi des gains de vœux, filtres mémorisés des catalogues, suivi de lecture du Lore, rôles par personnage d’équipe et checklist Endgame par moitié.

Les nouveaux ajouts vérifiés sont consignés dans `AMELIORATIONS-500-SUPPLEMENTAIRES.md` : R-070 pour le détail quotidien d’Énergie, R-071 pour la révision thématique du quiz, R-072 pour les deux modes de cible hebdomadaire du Studio, R-073 pour le bilan du Carnet de voyage, R-074 pour l’aperçu de répartition du Planificateur, R-075 pour le curseur du graphique de budget des Vœux, R-076 pour le profil de rythme du Carnet, R-077 pour la comparaison hebdomadaire des tâches, R-078 pour l’exclusion des récompenses annulées des totaux du journal de vœux et R-079 pour les filtres enregistrés dans les bibliothèques. Les points R-068 et R-069 restent décrits dans le registre.

## Lore — suivi des archives — 16 novembre 2026

- Le carnet de lecture gère désormais les événements passés et les régions, avec compteurs propres aux fiches visibles, sans mélanger ces états avec les biographies des personnages.
- Vérification : tests unitaires des états et compteurs par catégorie; contrôles syntaxiques et affichage mobile.
- Avancement des améliorations supplémentaires : **80 / 500**.

## Équipes — rôles par emplacement — 16 novembre 2026

- Ajout de cinq rôles facultatifs dans le compositeur. La carte récapitule le nombre attribué et les rôles répétés; les emplacements vides ne comptent pas comme des manques.
- Vérification : tests de couverture des rôles; Chromium sélectionne le rôle, enregistre l'équipe et confirme le résumé; syntaxe JavaScript et styles adaptés.
- Avancement des améliorations supplémentaires : **81 / 500**.

## Endgame — checklist des ennemis — 16 novembre 2026

- Chaque ennemi de l’Abîme peut être marqué comme vaincu dans sa moitié. L’état est conservé localement et séparé entre les étages, chambres, moitiés et rotations; les nouvelles compositions ne reprennent pas de coches d’ennemis différents.
- Vérification : tests unitaires d’identité et de progression; Chromium confirme les deux moitiés indépendantes et l’état après rechargement; syntaxe JavaScript et `git diff --check`.
- Avancement des améliorations supplémentaires : **83 / 500**.

## Armes — comparaison de catalogue — 16 novembre 2026

- Sélection persistante de trois armes maximum, comparaison de leurs données de base et passifs, raffinement ajustable; aucune performance n’est extrapolée à partir de données manquantes.
- Vérification : tests unitaires de sélection/limite/normalisation et de comparaison R1–R5; syntaxe et contrôle du diff.
- Avancement des améliorations supplémentaires : **83 / 500**.

## Sets & reliques — aperçu de l’inventaire — 16 novembre 2026

- Le catalogue des sets résume les reliques par emplacement, classe les sets présents et montre huit pièces récentes avec leur visuel et leurs principales statistiques.
- Vérification : Chromium confirme l’agrégation multi-emplacements, les groupes de sets, la liste récente et l’absence d’erreurs JavaScript; tests ciblés d’inventaire et syntaxe validés.
- Avancement des améliorations supplémentaires : **84 / 500**.

## Personnages — comparaison rapide du roster — 16 novembre 2026

- Comparaison côte à côte de trois personnages maximum : rareté, élément, arme, région et affiliation renseignées par la source. Sélection et retrait possibles directement sur les cartes, avec effacement rapide et conservation locale.
- Vérification : tests du modèle et parcours Chromium depuis la bibliothèque, limite à trois, effacement et contrôle des erreurs d’exécution.
- Avancement des améliorations supplémentaires : **85 / 500**.


## Vœux & objectifs — progression des constellations et raffinements — 16 novembre 2026

- Les objectifs affichent une jauge C/R fondée sur la possession connue, avec un état neutre lorsque les anciennes données ne précisent pas la possession.
- Vérification : 8 tests du modèle et parcours Chromium `wish_targets_browser.py`.
- Avancement : 86 / 500.

## Lore — reprise des dossiers consultés — 16 novembre 2026

- Historique local des six dernières fiches/personnages, régions ou archives consultés, accessible en raccourci depuis l’atlas et le carnet de lecture.
- Vérification : tests du modèle de reprise et parcours Chromium `lore_browser.py`.
- Avancement : 87 / 500.

## Équipes — bilan manuel des rôles — 16 novembre 2026

- L’aperçu d’une équipe signale les rôles qui n’ont pas encore été renseignés, les compositions sans DPS principal ou sans rôle de survie, et confirme une couverture générale quand les rôles principaux sont représentés. Aucune capacité n’est devinée depuis le nom du personnage.
- Vérification : tests unitaires des différents états et parcours Chromium de l’éditeur d’équipe.
- Avancement : 88 / 500.

## Endgame — score d’étoiles par moitié — 16 novembre 2026

- Saisie des 0–3 étoiles pour chacune des moitiés, avec une clé distincte par rotation, étage, chambre et moitié. Le résultat est sauvegardé localement.
- Vérification : tests unitaires de portée de la clé et des limites, test Chromium de persistance après rechargement.
- Avancement : 89 / 500.
