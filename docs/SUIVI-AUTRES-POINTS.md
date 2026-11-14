# Suite des demandes Astralis — 11 novembre 2026

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
