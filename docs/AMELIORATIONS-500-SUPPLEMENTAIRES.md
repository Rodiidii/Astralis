# 500 améliorations supplémentaires — pages hors jeux

Compteur de cette série distinct du suivi historique : **89 / 500**.

## Centre de pilotage — solde des vœux

- [x] R-001 — Corriger l’affichage du solde dans la boîte de bord : titres de champs explicitement balisés, quatre informations disposées dans des cartes lisibles, champs qui restent dans leur colonne, et mise en pile lorsque le panneau devient trop étroit.
- [x] R-002 — Vérifier les limites de la grille et l’absence de chevauchement sur grand écran et sur téléphone dans le test navigateur du centre de pilotage.


## Studio de session — répartition hebdomadaire

- [x] R-003 — Ajouter la répartition du temps de la semaine par activité, calculée depuis les sessions achevées des sept jours locaux : durée, nombre de sessions et part visuelle, avec état vide et exclusion des anciennes entrées invalides.
- Vérification : test unitaire des regroupements, de la période, du tri et de l’état vide; test navigateur de la boîte de bord déjà passé après le correctif du portefeuille.

## Planificateur intelligent — report hebdomadaire

- [x] R-004 — Ajouter la copie des objectifs ouverts de la semaine précédente vers les mêmes jours de la semaine courante; préserver les détails et priorités, ignorer les tâches terminées et reconnaître les doublons même si la casse ou les accents diffèrent.
- Vérification : 10 tests unitaires réussis, test navigateur réel réussi sur copie, second clic sans doublon et affichage mobile, vérifications de syntaxe JavaScript et `git diff --check`.


## Planificateur intelligent — fiche hebdomadaire

- [x] R-005 — Imprimer ou enregistrer l’agenda de la semaine en PDF : mise en page paysage à fort contraste, commandes et navigation masquées, tâches conservées.
- Vérification : Chromium confirme que la fiche reste visible dans le mode impression et que le reste de la page est masqué; test complet du navigateur, syntaxe JavaScript et contrôle diff passés.

## Planificateur intelligent — charge multi-jeux

- [x] R-006 — Repérer dans chaque journée les objectifs encore ouverts de plusieurs jeux, avec leur répartition par univers; les objectifs terminés sont exclus du signal.
- Vérification : 11 tests unitaires et deux parcours Chromium réussis, dont mobile et impression; syntaxe de l’application et contrôle diff validés.

## Carnet — tri personnalisé des notes

- [x] R-007 — Trier les notes par date récente, date ancienne, titre ou personnage; garder les notes épinglées en tête et mémoriser le choix pour chaque univers. Replier les commandes proprement sur téléphone.
- Vérification : 4 tests unitaires et parcours Chromium couvrant les quatre tris, filtres combinés, mémorisation et absence de débordement à 390 px; syntaxe JS et contrôle diff valides.


## Tâches & objectifs — récurrence à la demande

- [x] R-008 — Ajouter des tâches quotidiennes, hebdomadaires ou mensuelles. La prochaine occurrence apparaît uniquement après la complétion; les étapes repartent à zéro, les détails et le personnage restent associés, les dates de fin de mois sont gérées, et la même occurrence ne peut être créée deux fois. Une récurrence exige une échéance.
- Vérification : cinq tests unitaires couvrent les cycles, les mois courts et bissextiles, les dates invalides, la remise à zéro de la checklist et la prévention des doublons; syntaxe et intégration contrôlées.

## Planificateur — tâches fixes, flexibles et optionnelles

- [x] R-009 — Attribuer un mode de planification à chaque tâche. La répartition automatique préserve les dates fixes, planifie les tâches flexibles en priorité puis les tâches optionnelles; les tâches anciennes sans mode restent flexibles.
- Vérification : tests du tri par mode et priorité, exclusion des tâches fixes, maintien des dates et édition navigateur du choix sauvegardé.

## Planificateur — prochain créneau libre

- [x] R-010 — Calculer le premier créneau où une session tient dans les disponibilités quotidiennes réglées. Le calcul compte les objectifs datés ouverts de Genshin, Star Rail et Wuthering Waves, privilégie les durées renseignées puis l’historique personnel, et indique quand la durée de session choisie sert d’estimation. L’utilisateur peut réserver le créneau dans son agenda.
- Vérification : 5 tests unitaires réussis; parcours Chromium réel réussi pour la charge Genshin/Star Rail, le réglage persistant, la réservation dans l’agenda, le rendu mobile à 390 px et l’absence d’erreur JavaScript.

## Planificateur — filtres croisés de l’agenda

- [x] R-011 — Filtrer la semaine par univers, personnage et type d’objectif, avec filtres combinables, options tirées des tâches présentes et préférences locales mémorisées. Le résumé de charge général reste global pour ne pas masquer les journées chargées.
- Vérification : tests unitaires des combinaisons, options, catégories absentes et identités de personnage séparées par jeu; parcours navigateur du filtre multi-jeux, de sa persistance et du rendu mobile.

## Planificateur — vue agenda compacte

- [x] R-012 — Ajouter un affichage liste compact en complément de la grille hebdomadaire, avec choix mémorisé, commandes accessibles et adaptation aux écrans étroits.
- Vérification : parcours Chromium de l’alternance grille/liste, de la mémorisation locale et de l’absence de débordement à 390 px.

## Tâches & objectifs — lancer une session depuis un objectif

- [x] R-013 — Ajouter « Faire une session » sur chaque objectif ouvert. Le Studio de session reprend l’univers, le titre, le personnage lié et les étapes encore ouvertes; il choisit un type d’activité cohérent avec la catégorie et laisse les valeurs modifiables avant le lancement. Une session déjà active masque ces raccourcis.
- Vérification : 3 tests unitaires; parcours Chromium du transfert de la tâche jusqu’au lancement réel du chrono, y compris la résolution d’un identifiant de personnage historique par son nom; aucune erreur JavaScript.

## Studio de session — retour à l’objectif d’origine

- [x] R-014 — Une session lancée depuis une tâche conserve son lien d’origine. Un bouton ramène directement à cette tâche, la centre dans la liste et la met brièvement en évidence; il reste utilisable après changement de page puisque la session est persistée.
- Vérification : parcours Chromium du retour depuis une session active à la tâche d’origine, CTA masqué tant qu’une session tourne, et absence d’erreur JavaScript.

## Tâches & objectifs — progression synchronisée avec le Focus Studio

- [x] R-015 — Quand une session est créée depuis une tâche, chaque étape transférée garde son identifiant d’origine. Cocher une étape dans le Focus Studio coche immédiatement la même étape sur la tâche; les étapes déjà terminées restent exclues du transfert.
- Vérification : test Chromium de la sauvegarde de la progression dans les deux vues; tests unitaires de conservation des liens d’étapes.

## Tâches & objectifs — capture clavier depuis toute page

- [x] R-016 — Ajouter `Alt + Maj + T` pour ouvrir immédiatement la création d’objectif depuis les pages de l’application, avec le jeu et le personnage courant préremplis quand un personnage est sélectionné. Le raccourci est ignoré quand l’utilisateur écrit déjà ou qu’une modale est ouverte; son rappel apparaît dans la fiche.
- Vérification : parcours Chromium réel depuis la page des tâches, ouverture de la modale et présence de l’aide clavier; aucune erreur JavaScript.

## Carnet de voyage — restaurer et fusionner une sauvegarde

- [x] R-017 — Ajouter l’import des exports JSON du carnet, avec fusion des visites et souvenirs existants, détection des doublons, alias historiques Wuwa, dates de repli, limites de taille et rejet des lignes mal formées. Le flux de restauration fonctionne au sélecteur de fichier et conserve les entrées locales.
- Vérification : 4 tests unitaires d’import, tests unitaires des filtres du carnet; parcours Chromium du sélecteur réel et de la persistance sans doublon; syntaxe JS validée.

## Recherche rapide globale — accents et ligatures françaises

- [x] R-018 — Rendre la palette sensible aux accents et ligatures (« voeux » trouve « Vœux »), aux mots partiels et aux termes saisis sans espace (« starrail » trouve « Star Rail »); les termes d’une requête combinée doivent tous correspondre.
- Vérification : tests unitaires de normalisation/recherche et parcours Chromium réel sur « voeux ».

## Recherche rapide globale — navigation clavier accessible

- [x] R-019 — La touche Tab parcourt le champ et les résultats, Maj+Tab remonte le parcours et les deux bouclent dans la palette au lieu de piéger le focus dans le champ de recherche.
- Vérification : parcours Chromium de Tab, Maj+Tab, fermeture Échap, résultat de recherche et affichage mobile; aucune erreur JavaScript.

## Navigation générale — transitions de page

- [x] R-020 — Animer brièvement l’arrivée d’une nouvelle page avec une transition discrète, accélérée par le compositeur; les rafraîchissements à l’intérieur de la même page ne scintillent pas et `prefers-reduced-motion` désactive le mouvement.
- Vérification : Chromium confirme l’animation au changement de page, son nettoyage, le respect de la réduction des animations et l’absence de débordement à 1920×1080 et 390 px.

## Navigation générale — retrouver sa position de lecture

- [x] R-021 — Garder en mémoire la position de défilement propre à chaque page visitée. Revenir à une vue reprend l’endroit quitté, y compris après être passé par une autre page; les pages avec formulaires conservent aussi leurs protections existantes.
- Vérification : Chromium quitte le Carnet après défilement, remet la page suivante en haut puis revient au Carnet à la position précédente; vues 1920×1080 et 390 px sans débordement.

## Boîte de bord — garder la recherche et le filtre pendant une action

- [x] R-022 — Après avoir différé, réaffiché ou actualisé un rappel, conserver la recherche tapée et le filtre actif, puis recalculer les résultats et les compteurs. Le filtre sélectionné reste aussi annoncé correctement aux lecteurs d’écran.
- Vérification : test Chromium filtre les tâches, cherche un rappel, le diffère puis le restaure; recherche, filtre, résultat et état accessible restent cohérents.

## Studio de session — indicateur de régularité sans pression

- [x] R-023 — Afficher la série de jours avec une session terminée et le meilleur record, à côté des statistiques de concentration. Le calcul suit les jours locaux, ignore les séances vides et futures, et garde la série active jusqu’à la fin de la journée suivant la dernière session.
- Vérification : tests unitaires des jours consécutifs, interruption, activité du jour, entrée future et historique vide; Chromium vérifie la carte Focus et son affichage mobile.

## Carnet — annuler une suppression

- [x] R-024 — Après la suppression d’une note, proposer une action d’annulation au clavier pendant quelques secondes. La note complète est restaurée dans le bon univers; si une nouvelle note porte déjà le même identifiant, elle n’est pas écrasée.
- Vérification : Chromium supprime puis restaure une note avec son contenu et son épingle, vérifie le refus d’écrasement d’une version concurrente et l’affichage téléphone.

## Objectifs — report flexible des échéances

- [x] R-025 — Une tâche en retard peut être reportée à demain, dans 3 jours, une semaine ou deux semaines. Les dates restent calculées sur le jour local pour éviter le décalage d’un jour près de minuit.
- Vérification : Chromium confirme le report à demain et à une semaine, le stockage de la date, l’affichage Aujourd’hui/Demain, et le parcours existant des échéances, listes et étapes; tests unitaires des dates valides.

## Objectifs — échéance à la carte

- [x] R-026 — Les tâches sans échéance peuvent recevoir une date directement depuis leur carte, en plus des choix rapides Aujourd’hui et Demain. La sélection enregistre aussitôt la date et confirme le jour retenu.
- Vérification : Chromium choisit une date future et contrôle le stockage; les chemins des échéances rapides et des reports différés restent validés.

## Arcade commune — raccourcis de modes favoris

- [x] R-027 — Ajouter ou retirer le mode actif des favoris et retrouver les modes épinglés en raccourcis. La sélection est conservée localement entre les ouvertures; boutons, libellés accessibles et disposition mobile sont inclus.
- Vérification : Chromium en 390 px ajoute, ouvre, conserve au rechargement et retire un favori; navigation clavier existante et absence de débordement vérifiées.

## Arcade commune — mémoriser les effets sonores

- [x] R-028 — Le choix des effets sonores est conservé entre les ouvertures de l’arcade. Si l’audio est autorisé, son contexte ne se réactive qu’au premier geste de l’utilisateur, conformément aux restrictions du navigateur; le bouton reste synchro avec la préférence.
- Vérification : Chromium active le son, recharge l’arcade, confirme l’état et le stockage, puis désactive le son; la configuration du Tetris et l’absence d’erreur JS restent vérifiées.

## Arcade commune — volume indépendant des effets

- [x] R-029 — Ajouter un curseur de volume des effets sonores de 0 à 100 %, mémorisé localement. Le niveau 0 coupe réellement les sons; la commande reste utilisable au clavier et sur téléphone.
- Vérification : Chromium règle 35 %, contrôle l’indicateur et le stockage après rechargement, puis vérifie le contrôle visible en 390 px sans débordement.

## Arcade commune — volume de la musique officielle

- [x] R-030 — Ajouter un réglage de volume de musique distinct des effets, mémorisé et appliqué au lecteur officiel même après rechargement. Contrôle clavier et affichage mobile inclus.
- Vérification : Chromium règle la musique à 40 %, confirme l’indicateur, le stockage et le niveau du lecteur après rechargement; fenêtre mobile sans débordement.

## Arcade commune — commandes à la manette

- [x] R-031 — Ajouter la manette au Tetris astral : déplacement, accélération, rotation, chute rapide, réserve et pause. Une indication affiche la connexion et la dernière commande; le maintien des directions se répète progressivement.
- Vérification : Chromium avec manette simulée confirme la connexion, rotation et déplacement. La désinstallation coupe aussi la boucle de lecture de la manette.

## Navigation globale — destinations épinglées

- [x] R-032 — Épingler jusqu’à 12 pages ou actions dans la palette de recherche. Les favoris restent en haut des résultats dans l’ordre où ils ont été épinglés; la commande est utilisable au clavier, sans modifier la navigation habituelle.
- Vérification : Chromium épingle la page Vœux, vérifie le stockage, l’ordre de tabulation et le rendu mobile.

## Application entière — état de connexion visible

- [x] R-033 — Afficher dans le menu latéral si une connexion internet est disponible, sans laisser croire que les données sont fraîches. Hors ligne, préciser que les sauvegardes locales restent disponibles; rétablir automatiquement l’état au retour du réseau. Annonce accessible et signal visuel discret inclus.
- Vérification : Chromium passe en mode hors ligne puis en ligne, contrôle les textes d’état et le repli local.

## Sauvegardes — aperçu avant import

- [x] R-034 — Avant l’import, afficher la date d’export et le nombre d’éléments repérés par univers, ainsi que les données partagées. L’utilisateur confirme ou annule; annuler ne touche à aucune donnée locale. Le dialogue reste adapté au mobile et accessible au clavier.
- Vérification : navigateur exporte une vraie sauvegarde, affiche l’aperçu, annule sans restauration, puis confirme et vérifie les objectifs, matériaux et priorités restaurés. Tests unitaires de validation/récupération inchangés et réussis.

## Navigation globale — capture rapide de tâche et de note

- [x] R-035 — Ajouter « Créer une tâche » et « Écrire une note » aux commandes globales de la palette, disponibles même depuis une page qui ne montre pas ces boutons. La création reprend l’univers actif et le personnage sélectionné, le cas échéant.
- Vérification : Chromium depuis le Carnet de voyage ouvre les deux formulaires, puis valide aussi les favoris de navigation, l’état réseau, l’ordre clavier et la palette mobile.

## Navigation globale — démarrer un sprint de concentration

- [x] R-036 — Ajouter à la palette une action globale qui démarre immédiatement un sprint de 25 minutes dans le Studio de session, depuis n’importe quelle page commune. Le sprint reprend le jeu actif et empêche de lancer un doublon si une session est déjà en cours.
- Vérification : Chromium lance le sprint depuis le Carnet, contrôle la durée enregistrée, met en pause, reprend et termine la session; l’historique contient la session terminée.
- [x] R-037 — Quand une session est active, remplacer l’action de création de sprint dans la palette par un accès direct à cette session. L’accès disparaît dès qu’il n’y a plus de session et restaure l’univers associé.
- Vérification : pendant un sprint lancé depuis le Carnet, ouvrir une autre page puis retrouver la session dans la palette; même identifiant de session, puis pause, reprise et fin normales.
- [x] R-038 — Ajouter le raccourci global Alt+Maj+F : il démarre un sprint de 25 minutes s’il n’y a pas de session, ou rouvre la session active sans la dupliquer. Le raccourci est annoncé dans la palette.
- Vérification : le navigateur lance puis rouvre le même sprint depuis une autre page; durée et identifiant conservés.

## Boîte de bord — préparer l’affichage du farm du jour

- [x] R-039 — À l’ouverture de la Boîte de bord dans Genshin, charger à la demande le roster et le catalogue de matériaux s’ils ne sont pas encore disponibles. Les sessions du jour peuvent ainsi afficher les portraits, le suivi individuel et les ressources après une navigation qui n’a pas ouvert ces catalogues.
- Vérification : ouverture depuis le Carnet, deux personnages affichés pour une session, progression individuelle 0/2 → 1/2; tests de recherche et de persistance multi-personnages réussis.

## Objectifs — annulation fiable des suppressions

- [x] R-040 — Les suppressions d’un objectif ou d’une sélection entière dans la liste des tâches proposent maintenant une action « Annuler ». La restauration conserve le contenu, les étapes et les échéances, sans écraser un objectif qui aurait réutilisé le même identifiant entre-temps.
- Vérification : test navigateur supprime puis restaure une tâche individuelle et une sélection de deux tâches; échéance intacte, éléments réapparus et aucun doublon.

## Studio de session — reprise immédiate des minuteurs

- [x] R-041 — Au retour sur l’application, le Studio de session recalcule immédiatement le sprint ou la pause planifiée. Cela compense le ralentissement des minuteurs en arrière-plan et affiche tout de suite l’état terminé, au lieu d’attendre le prochain rafraîchissement périodique.
- Vérification : scénario navigateur rend un sprint échu puis déclenche le retour au premier plan; la session passe immédiatement en pause et affiche une seule notification. Les 11 tests unitaires du Studio passent.

## Navigation — historique cohérent sur mobile

- [x] R-042 — Les pages ouvertes depuis la barre de navigation mobile et les onglets de jeu du haut sont maintenant mémorisées comme destinations récentes, au même titre que celles ouvertes depuis le menu latéral.
- Vérification : scénario Chromium en largeur mobile ouvre le tableau de bord depuis la barre du bas, puis le retrouve dans la palette avec le statut « Récemment ouvert »; le reste des contrôles clavier et mobiles passe.

## Carnet de voyage — annuler la suppression d’un souvenir

- [x] R-043 — Après confirmation, supprimer une note du carnet propose désormais « Annuler » pendant quelques secondes. La restauration remet le texte et sa date à leur place, sans toucher aux visites ou aux autres notes.
- Vérification : navigateur refuse d’abord la confirmation, confirme ensuite la suppression, restaure le texte exact via l’action, puis re-confirme une suppression et vérifie qu’une visite adjacente reste intacte. Six tests unitaires du carnet passent.

## Planificateur — annuler le déplacement d’une tâche

- [x] R-044 — Le déplacement d’un objectif dans l’agenda peut être annulé, que l’utilisateur le fasse au clavier (Alt + flèche) ou par glisser-déposer. L’annulation restaure l’échéance précédente, y compris l’absence d’échéance, et refuse d’écraser une modification plus récente.
- Vérification : scénario Chromium déplace puis annule une tâche, puis simule un changement concurrent et confirme que l’annulation conserve la nouvelle échéance.

## Liste d’objectifs — annuler une planification ou un report

- [x] R-045 — Les commandes rapides « Aujourd’hui », « Demain », les dates choisies au calendrier et les reports d’échéance proposent elles aussi une annulation. Une échéance concurrente plus récente reste protégée.
- Vérification : navigateur planifie une tâche sans date, restaure son état sans échéance, reporte une tâche échue puis restaure sa date d’origine; aucun message d’erreur JavaScript.

## Objectifs — annuler une planification groupée

- [x] R-046 — Planifier plusieurs objectifs sélectionnés affiche une action d’annulation. Chaque échéance antérieure est restaurée indépendamment; si l’un des objectifs a changé depuis, sa nouvelle date est préservée et les autres restent annulables.
- Vérification : scénario navigateur planifie deux objectifs, change la date de l’un en parallèle, puis confirme que l’autre revient à son échéance initiale tandis que la modification récente est conservée.

## Objectifs — annuler une complétion

- [x] R-047 — Les complétions individuelles, depuis l’agenda, et groupées peuvent être annulées. Pour une tâche répétitive, l’annulation réactive l’objectif terminé et retire l’occurrence suivante uniquement si elle n’a pas été modifiée depuis.
- Vérification : Chromium couvre les tâches simples, les occurrences quotidiennes et hebdomadaires, les étapes conservées, la sélection groupée et la protection d’une occurrence retouchée. Les 5 tests unitaires et le scénario navigateur de récurrence passent.

## Boîte de bord — annuler une tâche sans fermer la fenêtre

- [x] R-048 — Quand on termine une tâche depuis la Boîte de bord, une commande « Annuler » apparaît dans la fenêtre elle-même. Elle reste accessible malgré la modale, restaure le rappel et expire après quelques secondes.
- Vérification : Chromium termine une tâche locale, constate sa disparition, l’annule depuis la modale, puis vérifie son retour et l’absence d’erreur JavaScript. Le suivi individuel de farm de deux personnages reste fonctionnel.

## Vœux & objectifs — trajectoire des gains

- [x] R-049 — Ajouter une courbe quotidienne de budget prévisionnel qui part du solde réel, cumule les gains configurés, affiche les plafonds des objectifs dans leur ordre et place les dates de bannière estimées. Elle se recalcule avec les réglages de période, signale les dates invalides et distingue visuellement les récompenses ponctuelles des commissions quotidiennes.
- Vérification : test Chromium contrôle l’apparition du graphe, sa mise à jour après une modification de revenu, la conservation des graphes de probabilité et l’état invalide; les 13 tests unitaires de vœux passent.

## Studio de session — bilan filtrable

- [x] R-050 — Filtrer l’historique sur les 7 derniers jours, les 30 derniers jours ou toute la période. Le bilan recalcule le nombre de sessions, le temps total, la durée moyenne et la part d’étapes terminées.
- Vérification : tests unitaires sur les bornes de dates locales et le calcul du bilan; Chromium confirme les trois périodes, les filtres combinés et le rendu mobile.

## Studio de session — recherche dans les notes

- [x] R-051 — La recherche d’historique retrouve maintenant aussi le personnage associé et la note personnelle de la session, en complément du titre et du type d’activité.
- Vérification : Chromium retrouve une session par une expression présente seulement dans sa note; les tests unitaires et le contrôle de syntaxe passent.

## Carnet de voyage — souvenirs classés

- [x] R-052 — Classer chaque nouveau souvenir comme Souvenir, Build, Farm, Équipe ou Idée; filtrer le carnet par catégorie, retrouver son étiquette dans la liste, et conserver cette catégorie lors des sauvegardes importées ou exportées.
- Vérification : tests unitaires couvrent le filtrage et la validation des catégories importées; Chromium crée une note classée, filtre les différentes catégories et vérifie la mise en page mobile.

## Carnet de voyage — corriger le classement d’une note

- [x] R-053 — Modifier la catégorie d’un souvenir déjà sauvegardé directement depuis son entrée. Le texte, la date et les autres traces restent inchangés; le filtre reflète immédiatement le nouveau classement.
- Vérification : test unitaire confirme la mise à jour isolée et le rejet des identifiants ou catégories invalides; Chromium vérifie la sauvegarde, le nouveau filtre et le rendu mobile.


## Planificateur — démarrer une session depuis une tâche de la semaine

- [x] R-054 — Ajouter sur chaque tâche ouverte de l’agenda hebdomadaire un raccourci vers le Studio de session. Il reprend le jeu, le personnage, le titre et les étapes non terminées; une session déjà active empêche le remplacement accidentel.
- Vérification : Chromium démarre la session depuis le Planificateur, confirme les champs préremplis et vérifie qu’une étape cochée dans le Studio est enregistrée sur la tâche d’origine; tests de charge du calendrier et syntaxe JavaScript validés.


## Vœux & objectifs — dates estimées de financement

- [x] R-055 — Le graphique de revenus indique, pour chaque objectif ordonné, la première date où le budget projeté couvre son plafond de garantie. Si la période ne suffit pas, il affiche le nombre de vœux manquants à sa fin. Les repères restent liés au solde, à la pity et aux revenus configurés.
- Vérification : Chromium confirme une date de financement à partir du solde et de la période fournis; l’aperçu garde ses plafonds de garantie, ses courbes de probabilité et son affichage téléphone.


## Défi quotidien — progression de maîtrise par thème

- [x] R-056 — Ajouter une carte qui suit la précision par type d’indice (élément, arme, région; type de combat, Voie; attribut selon l’univers). Chaque bonne ou mauvaise réponse du défi quotidien compte une fois; l’entraînement des erreurs est exclu. Les thèmes non joués restent explicitement « À découvrir ».
- Vérification : tests unitaires des thèmes, compteurs et précision; Chromium vérifie la sauvegarde d’une bonne et d’une mauvaise réponse, l’affichage des résultats par thème et l’absence de débordement sur téléphone.

## Suivi d’énergie — définir un cap de dépense pour aujourd’hui

- [x] R-057 — Ajouter une cible journalière facultative par jeu. La jauge compte les dépenses réellement enregistrées aujourd’hui, ignore les jours précédents, plafonne à 100 %, confirme l’objectif atteint et permet de modifier ou d’effacer la cible.
- Vérification : tests unitaires des dates locales, progression et dépassement; Chromium enregistre une cible, effectue deux dépenses, constate 50 % puis 100 %, et efface la cible.

## Planificateur — répartir le retard selon le temps réel estimé

- [x] R-058 — La répartition des tâches sans date ou en retard équilibre désormais les minutes par journée, et non le simple nombre de tâches. Elle tient compte des durées saisies, puis de l’historique personnel des sessions, et utilise la durée de session choisie en dernier recours; tâches terminées et tâches fixes restent intactes.
- Vérification : tests unitaires de répartition par durée et de priorité, ainsi que de conservation des tâches fixes; vérification syntaxique de l’application.

## Carnet — transformer une note en tâche

- [x] R-059 — Chaque note peut ouvrir un brouillon de tâche modifiable. Le jeu, le personnage associé, le titre et les cases à cocher rédigées dans la note sont repris; le texte libre n’est pas transformé en étapes arbitraires. La note d’origine reste intacte.
- Vérification : tests unitaires de conversion des catégories, du personnage, des cases terminées/non terminées, du plafond d’étapes et des univers autorisés.

## Tâches & objectifs — rythme de progression hebdomadaire

- [x] R-060 — Ajouter un graphique des tâches terminées sur les sept derniers jours, la moyenne quotidienne, le meilleur jour et une série de jours consécutifs. Les données viennent des dates réelles de complétion; le graphique garde un état vide clair et fonctionne sur petit écran.
- Vérification : 3 tests couvrent les jours locaux, la série en cours ou reprise hier, les tâches non terminées et les dates absentes; syntaxe du module et de l’application contrôlée.

## Carnet — filtrer les notes par personnage

- [x] R-061 — Ajouter un filtre persistant qui liste uniquement les personnages réellement présents dans le carnet. Il se combine à la recherche, au type, au tri et aux notes épinglées; les notes générales restent dans « Tous les personnages ».
- Vérification : tests existants du carnet validés pour la recherche, les filtres combinés, l’épinglage et le tri; contrôle syntaxique de l’application; valeur mémorisée séparément par univers.

## Planificateur — comparer la charge aux disponibilités quotidiennes

- [x] R-062 — Le calendrier hebdomadaire additionne maintenant les durées saisies, les médianes des sessions personnelles et une estimation prudente pour les objectifs sans historique. Chaque jour affiche sa charge face au temps disponible configuré; les journées dépassant le cap sont signalées avec une jauge dédiée.
- [x] R-063 — La tendance de la page Énergie compare les dépenses, les gains et les jours actifs des sept derniers jours aux sept jours précédents. La variation en valeur et en pourcentage n’est affichée que si l’historique précédent contient des dépenses, afin d’éviter un pourcentage trompeur; le panneau reste lisible sur mobile.
- Vérification : tests unitaires des périodes locales, variations, gains, jours actifs et historique insuffisant; vérification syntaxique et contrôle des changements.
- [x] R-064 — Le défi quotidien de mémoire mélange désormais une liste de compagnons triée de façon stable avant son tirage déterministe. Deux joueurs avec le même roster, la même difficulté et la même date obtiennent les mêmes paires, même si le catalogue s’est chargé dans un ordre différent.
- Vérification : test unitaire sur roster inversé et contrôle navigateur du jeu de mémoire.
- [x] R-065 — Le record du défi de mémoire compare maintenant le nombre de coups puis le temps; un temps plus rapide départage une égalité de coups, et le meilleur duo apparaît ensemble dans le panneau des records.
- Vérification : tests unitaires des records gagnants, perdants et invalides; test navigateur du défi quotidien.
- [x] R-066 — Dans le choix du compagnon de l’Arcade, survoler ou parcourir les portraits au clavier affiche l’intitulé et l’effet exacts de leur passif sans changer le compagnon actif; le clic confirme le choix. Le panneau annonce les changements aux technologies d’assistance et reste animé sans forcer les animations réduites.
- Vérification : navigateur teste l’aperçu initial, le focus du clavier sans sélection, puis le choix au clic et le passif correspondant.
- [x] R-067 — Chaque contrat de l’Arcade dispose maintenant d’un bouton « Jouer » qui ouvre directement le mode requis (Tetris, Mémoire ou Arène) et place le focus sur son onglet; les objectifs restent dans leur page existante.
- Vérification : Chromium parcourt Mémoire et Arène depuis leurs contrats, revient à Tetris et vérifie l’absence de débordement sur téléphone.
- [x] R-068 — Le Lunar Lander dispose d’une pause/reprise explicite par bouton, P ou Échap. La pause conserve l’état de vol, bloque les commandes de pilotage et se réinitialise proprement au redémarrage.
- Vérification : Chromium confirme que le carburant ne diminue pas durant la pause, que P reprend/arrête le vol et que « Recommencer » réactive la partie.
- [x] R-069 — Vœux & objectifs affiche un graphique des gains réellement saisis sur les 30 derniers jours et projette le délai pour couvrir le plafond théorique de pity selon ce rythme. Les vœux sont convertis à 160 primogemmes; sans historique, l’interface ne prétend pas connaître la cadence.
- Vérification : tests couvrent les dates futures ignorées, le cumul de vœux et primogemmes, le calcul de pity garantie et les cas sans historique; navigateur et contrôles syntaxiques validés.
- [x] R-070 — Énergie : la carte d’activité mensuelle est maintenant interactive. Choisir un jour affiche le détail de chaque dépense et gain, son heure et son montant; les jours sont sélectionnables au clavier et le détail se réorganise sur téléphone.
- Vérification : 7 tests du modèle Énergie et Chromium valide la sélection du jour courant, la navigation clavier vers un autre jour, les entrées affichées et l’absence de débordement mobile.
- [x] R-071 — Défi quotidien : les erreurs peuvent être révisées par thème depuis la jauge de maîtrise. Une réponse correcte retire seulement l’erreur concernée; la révision ne modifie ni le score quotidien ni le record.
- Vérification : 11 tests du quiz; Chromium valide la révision d’un thème, la suppression ciblée d’une erreur, l’intégrité du score et l’affichage mobile.
- [x] R-072 — Studio de session : l’objectif hebdomadaire peut maintenant suivre le temps concentré ou le nombre de sessions terminées. Chaque mode garde sa propre cible mémorisée; la jauge et son annonce accessible changent d’unité avec le choix.
- Vérification : calculs unitaires des cibles, limites et progression; Chromium change le mode, ajuste la cible, revient au temps sans perte de réglage et contrôle le format téléphone.
- [x] R-073 — Carnet de voyage : ajout d’un bilan vivant des sept derniers jours, comparé à la semaine précédente, avec nombre de jours actifs, visites, souvenirs notés et activité par jour. Le bilan propose un raccourci vers la page visitée le plus souvent cette semaine.
- Vérification : tests du calcul local, comparaison, données futures exclues et sélection de l’escale; Chromium confirme le bilan, le raccourci, le calendrier et l’absence de débordement mobile.
- Vérification : 4 tests des estimations et des entrées manquantes; Chromium vérifie le total combiné, l’état sous le cap et l’absence de débordement sur téléphone; contrôle syntaxique et `git diff --check` passés.


## Planificateur intelligent

- [x] R-074 — Répartition du backlog avec aperçu de confirmation : prévisualisation des tâches déplacées par jour, durée estimée par historique ou durée de session, charge existante face à la disponibilité quotidienne et signalement des journées trop chargées. Les échéances ne changent qu’après validation ; les tâches fixes et terminées sont préservées. Fenêtre adaptée au mobile, clavier natif et prise en compte de la réduction des animations.
- Vérification : Chromium confirme que l’aperçu ne modifie rien avant validation, que les priorités sont respectées et qu’il ne déborde pas à 390 px; 30 tests unitaires du Planificateur passent.


## Vœux & objectifs

- [x] R-075 — Le graphique de budget devient exploratoire : un curseur jour par jour déplace un repère sur la courbe et donne le solde estimé à cette date. Le contrôle est utilisable au tactile et avec les flèches du clavier, annonce sa valeur aux lecteurs d’écran et tient sur mobile.
- Vérification : navigateur Chromium fait parcourir toute la période, contrôle la mise à jour de la valeur annoncée et du repère, puis vérifie l’absence de débordement à 390 px; contrôles syntaxiques passés.


## Carnet de voyage

- [x] R-076 — Ajout d’un profil de rythme sur huit semaines : jours d’activité uniques par jour de la semaine, visites observées, jour le plus régulier et plage horaire la plus fréquentée. Le calcul exclut notes, entrées futures et traces hors période; il reste local et signale la quantité réellement observée.
- Vérification : tests unitaires couvrant doublons journaliers, fenêtre exacte, données hors plage et période vide; Chromium contrôle les sept jours et le rendu mobile.


## Tâches & objectifs

- [x] R-077 — Le bilan de tâches compare les objectifs terminés sur les sept derniers jours à la semaine locale précédente, avec évolution lisible (hausse, baisse ou stable), total de référence et streak conservé. Les données hors période ne faussent pas la comparaison.
- Vérification : tests des limites entre semaines, absence d’historique précédent, hausse et stabilité; contrôle de syntaxe et affichage adapté aux petits écrans.


## Vœux & objectifs

- [x] R-078 — Les récompenses annulées sont maintenant exclues du total de gains, de l’historique graphique, des répartitions mensuelles et des comparaisons de période. L’annulation reste visible dans le journal d’audit, sans gonfler les gains réellement obtenus.
- Vérification : tests d’annulation, de répartition par source et de total hebdomadaire; contrôles syntaxiques et `git diff --check`.


## Personnages, armes & sets

- [x] R-079 — Les filtres des trois bibliothèques peuvent être enregistrés sous des noms distincts et réappliqués plus tard. Une disposition conserve recherche, élément, type d’arme, rareté, possession, tri et vue; chaque jeu et chaque bibliothèque garde ses propres presets. Les doublons de nom remplacent l’ancien preset et la suppression est disponible.
- Vérification : tests des filtres mémorisés, des limites, de l’isolation par bibliothèque et du remplacement/suppression; contrôles syntaxiques et adaptation mobile.

## Lore

- [x] R-080 — Les archives d’événements et les fiches de régions ont leur propre suivi « lu » et « à lire plus tard ». Les compteurs du journal suivent la sélection filtrée, tandis que les états régionaux et les biographies restent séparés; l’enregistrement demeure local.
- Vérification : tests de compteurs par collection et d’isolation événements/régions; contrôles syntaxiques et règles CSS adaptatives.

## Équipes

- [x] R-081 — Chaque emplacement de personnage peut recevoir un rôle explicite (DPS principal, DPS secondaire, support, soin/protection ou flex). La carte de l’équipe résume les rôles renseignés, les doublons et les emplacements à classer, sans imposer une composition type.
- Vérification : tests de couverture pour équipes partielles, rôles répétés et slots vides; Chromium confirme sélection, sauvegarde et résumé; contrôles syntaxiques et styles adaptatifs.

## Endgame — checklist des ennemis par moitié

- [x] R-082 — Chaque ennemi des rotations de l’Abîme peut être marqué vaincu indépendamment pour chaque étage, chambre et moitié. La progression est visible immédiatement, enregistrée localement et les nouvelles compositions repartent sans cases cochées si leurs ennemis diffèrent.
- Vérification : tests unitaires d’identité, d’isolation des moitiés, de rotation et de progression; Chromium confirme le cochage, l’indépendance des moitiés et la persistance après rechargement; syntaxe JavaScript et `git diff --check`.

## Compteur courant

- Avancement des améliorations supplémentaires : **89 / 500**.
- Derniers ajouts : lecture des archives de lore, rôles d’équipe, checklist de combat Endgame, comparaison des armes, aperçu des reliques possédées et comparaison du roster.

## Armes — comparaison côte à côte

- [x] R-083 — Le catalogue permet de comparer jusqu’à trois armes à la fois. La sélection est conservée localement; l’utilisateur compare le type, la rareté, l’ATQ de base fournie par la source, la stat secondaire et le texte du passif au raffinement choisi. Les données absentes sont signalées au lieu d’être estimées.
- Vérification : tests unitaires de sélection, limite, normalisation, choix de raffinement et données affichées; syntaxe JavaScript et `git diff --check`.

## Sets & reliques — aperçu de l’inventaire

- [x] R-084 — Le catalogue des sets affiche maintenant le nombre de reliques par emplacement, les sets les plus représentés et les huit dernières pièces ajoutées avec icône, stat principale et niveau. Le panneau reste compact et s’adapte aux écrans étroits.
- Vérification : syntaxe JavaScript, tests ciblés d’inventaire et contrôle du diff.

## Personnages — comparaison rapide du roster

- [x] R-085 — La bibliothèque permet de comparer jusqu’à trois personnages à partir des métadonnées réellement fournies : rareté, élément, arme, région et affiliation. La sélection se retire depuis les cartes ou se vide en un clic; elle est conservée localement.
- Vérification : tests de normalisation, limite de sélection, métadonnées manquantes et parcours Chromium sur le roster.

## Vœux & objectifs — progression de possession

- [x] R-086 — Chaque objectif montre maintenant l’état de possession réel (C et R actuels → visés) avec une jauge de progression accessible. Les anciens objectifs sans données de possession ne reçoivent pas de progression inventée.
- Vérification : tests des cas connus/inconnus, affichage Chromium et contrôle du calcul de progression.


## Lore — reprise des derniers dossiers

- [x] R-087 — Le lore conserve les six derniers dossiers consultés (personnages, régions et événements) et propose une reprise directe depuis l’atlas et le carnet de lecture. La liste reste locale et dédupliquée.
- Vérification : tests du modèle de reprise, parcours Chromium du lore, syntaxe JavaScript et contrôle du diff.

## Équipes — conseil de composition fondé sur les rôles saisis

- [x] R-088 — La fiche d’équipe signale les rôles manquants et quelques répartitions à revoir (DPS principal absent ou doublé, survie non indiquée), puis confirme une couverture générale quand DPS, soutien et survie sont renseignés. Le conseil se fonde uniquement sur les rôles saisis manuellement.
- Vérification : tests des états neutre, incomplet, à revoir et complet; parcours Chromium depuis l’éditeur d’équipe.

## Endgame — score d’étoiles par moitié

- [x] R-089 — Chaque moitié de chambre d’Abîme permet d’enregistrer 0 à 3 étoiles. Le résultat reste indépendant par rotation, étage, chambre et moitié, se conserve localement et se relit après rechargement.
- Vérification : tests d’identité et de normalisation des scores, plus parcours Chromium avec persistance après rechargement.
