# Astralis — suivi des 400 améliorations

**Règle de travail :** améliorer les pages existantes uniquement, avancer par page puis changer de page; aucun nouveau Tetris. Une case n’est cochée qu’après implémentation et vérification.

**Progression : 186 / 400**
*(Progression réconciliée avec les entrées de vérification du registre.)*

## Tableau de bord

- [x] 001 — Résumer plusieurs personnages dans une session de farm avec avatars et compteur de débordement.
- [x] 002 — Afficher sous la session les matériaux associés, avec détail accessible au survol.
- [x] 003 — Distinguer visuellement les sessions de farm terminées dans le calendrier.
- [x] 004 — Afficher la progression de farm individuelle par personnage dans le widget du jour et terminer la session seulement quand tous sont cochés.
- [x] 005 — Filtrer la préparation du tableau de bord par personnage; le tableau reste séparé par univers et conserve le filtre pour chacun.
- [x] 006 — Montrer les récompenses et dates des événements qui se terminent sous trois jours.
- [x] 007 — Préremplir le relevé de gains depuis le solde global et la Faveur lunaire; afficher une projection en direct des primos converties et vœux après saisie.
- [x] 008 — Transformer les priorités locales en actions directes, avec données à jour; terminer une tâche ou valider un rituel sans quitter le widget.
- [x] 009 — Rendre les rappels urgents retrouvables dans la Boîte de bord via recherche et filtres combinables avec compteurs.
- [x] 010 — Rendre les raccourcis du tableau de bord personnalisables et réordonnables.
- [x] 011 — Mémoriser plusieurs dispositions, avec duplication et renommage.
- [x] 012 — Ajouter une commande « reprendre ma dernière action ».
- [x] 013 — Afficher les jauges de progression des objectifs suivis.
- [x] 014 — Signaler dans le suivi multi-jeux quand le plafond d’énergie approche ou est atteint, avec une jauge par univers mise à jour en direct.
- [x] 015 — Présenter une synthèse des commissions, événements et activités du jour.
- [x] 016 — Ajouter des états vides guidés avec liens directs vers les pages pertinentes.
- [x] 017 — Renforcer l’affichage des icônes de jeu et de personnages sur petit écran.
- [x] 018 — Ajouter un mode compact 1920 × 1080 sans scroll horizontal.
- [x] 019 — Ajouter un mode contraste doux et une réduction des animations.
- [x] 020 — Améliorer le chargement progressif des widgets et leurs squelettes : l’état `chargement` n’est affiché que pendant un chargement réel du roster ou des événements; les états vides apparaissent ensuite, les erreurs restent gérées à part, et les zones gardent une taille stable.

## Studio de session

- [x] 021 — Préparer une routine à partir d’une équipe sauvegardée.
- [x] 022 — Proposer une checklist créée depuis le plan de farm.
- [x] 023 — Lors de la fermeture de la page, mettre en pause la session active et le minuteur de concentration. À la prochaine ouverture, conserver les étapes et proposer « Reprendre », sans compter le temps passé application fermée.
- [x] 024 — Réordonner les étapes par boutons accessibles au clavier ou à la souris; conserver immédiatement le nouvel ordre et le restaurer après rechargement.
- [x] 025 — Garder visibles les étapes terminées d’une rotation ou d’une checklist de farm dans « Ma session », avec leur état validé, au lieu de les retirer de la liste.
- [x] 026 — À la fin du sprint choisi, arrêter le compte à rebours, mettre automatiquement la session en pause et afficher une seule notification dans l’application, sans notification système intrusive.
- [x] 027 — Ajouter des pauses planifiées aux sprints : choix de 5, 10 ou 15 minutes, démarrage à la demande après la fin du sprint, compte à rebours et reprise fiable après fermeture.
- [x] 028 — Comparer chaque session terminée à la moyenne des précédentes portant le même objectif, la même activité et le même jeu; afficher l’écart avec une indication plus rapide ou plus long.
- [x] 029 — Trier et filtrer l’historique par jeu, activité et durée.
- [x] 030 — Exporter l’historique en JSON versionné et le réimporter par fusion; doublons par identifiant ou empreinte ignorés, lignes invalides rejetées, limite locale de 300 sessions respectée.
- [x] 031 — Associer chaque session à un personnage du roster et conserver une note modifiable pendant la session, dans l’historique, les exports/imports et la recherche.
  - Vérifications : les tests unitaires bornent les champs et rejettent les URL d’image non sûres; le parcours navigateur mobile démarre, modifie, recharge, termine et recherche une session liée à Furina.
- [ ] 032 — Ajouter un résumé hebdomadaire du temps par activité.
- [ ] 033 — Ajouter un minuteur de farm avec décompte des passages.
- [ ] 034 — Ajouter un mode plein écran sans quitter l’application.
- [ ] 035 — Améliorer le contraste et l’état pause/en cours.
- [ ] 036 — Ajouter des commandes clavier accessibles et visibles.
- [ ] 037 — Ajouter une confirmation de fin avec progrès et prochaines étapes.
- [ ] 038 — Préserver les routines lors d’une sauvegarde/restauration Astralis.
- [x] 039 — Sauvegarder, filtrer par jeu, restaurer et supprimer les routines personnelles.
- [x] 040 — Rechercher rapidement une routine enregistrée par son nom.

## Plan de farm

- [x] 041 — Afficher les besoins restants séparément pour chaque personnage sélectionné; l’allocation respecte l’ordre de priorité et le stock n’est jamais compté deux fois.
- [x] 042 — Regrouper les besoins identiques sans perdre le détail par personnage; chaque ligne de stock détaille visuellement la part attribuée et le manque de chacun.
- [x] 043 — Montrer, pour chaque personnage et scénario, les jours gagnés grâce au stock; comparer au même planning recalculé avec un inventaire vide.
- [x] 044 — Rendre les jours du calendrier filtrables par matériau et personnage.
- [x] 045 — Permettre de cocher ou rétablir une session depuis la fiche du jour.
- [x] 046 — Synchroniser l’état terminé avec le résumé du tableau de bord.
- [ ] 047 — Séparer les matériaux de boss hebdomadaire des domaines quotidiens.
- [ ] 048 — Calculer visiblement le surplus de synthèse des matériaux de talents.
- [ ] 049 — Ajouter un éditeur de niveaux distinct pour chaque aptitude.
- [ ] 050 — Prioriser les matériaux selon l’ordre défini par le joueur.
- [ ] 051 — Recalculer les dates lorsque les personnages changent d’ordre.
- [ ] 052 — Exclure du calendrier les matériaux déjà possédés.
- [ ] 053 — Afficher les jours de disponibilité des livres de talents par région.
- [ ] 054 — Ajouter une estimation de résine par objectif.
- [ ] 055 — Ajouter un scénario d’utilisation quotidienne de la résine.
- [ ] 056 — Rendre les options de jours d’artéfacts comparables côte à côte.
- [ ] 057 — Afficher les matériaux de boss et leurs icônes dans chaque fiche personnage.
- [ ] 058 — Ajouter une vue imprimable des besoins restants.
- [ ] 059 — Ajouter un rappel de réapparition des spécialités locales.
- [ ] 060 — Ajouter une vérification des données de matériaux manquantes.

## Réseau des relations

- [x] 133 — Rechercher dans les deux personnages d’un lien, ses citations, quêtes, sources et références depuis la vue liste.

## Planificateur intelligent

- [ ] 061 — Ajouter une vue quotidienne avec glisser-déposer.
- [x] 062 — Afficher les conflits de tâches sur une même journée, avec un indicateur renforcé quand plus de trois objectifs se cumulent.
- [ ] 063 — Proposer un planning selon les jours de disponibilité des domaines.
- [x] 064 — Estimer la durée des tâches à partir de l’historique personnel, en n’utilisant que les sessions terminées du même jeu et au titre identique; afficher la médiane par tâche et le total estimé du jour sans inventer de durée si aucune session comparable n’existe.
- Vérifications : tests de correspondance, médiane résistante aux valeurs atypiques, couverture partielle, tâches terminées et formatage; contrôle navigateur du rendu et du repli sans historique.
- Progression du registre : 169/400.
- [x] 068 — Replanifier les tâches en retard en un clic.
- [ ] 071 — Ajouter une recherche dans les tâches planifiées.
- [x] 072 — Ajouter une progression de semaine et des objectifs atteints, ventilés sur les sept jours.
- [x] 074 — Ajouter l’export calendrier standard des tâches ouvertes et datées.
- [ ] 075 — Ajouter l’import d’un calendrier déjà exporté.
- [ ] 076 — Ajouter des notes et liens aux tâches.
- [x] 077 — Montrer le retard ou le délai restant avant chaque échéance, avec une date exacte accessible.
- [ ] 078 — Ajouter des suggestions à partir des objectifs actifs.

## Équipes

- [ ] 081 — Réparer et vérifier chaque action des cartes d’équipe.
- [ ] 082 — Ajouter une comparaison visuelle entre deux équipes.
- [ ] 083 — Afficher les rôles des personnages avec icônes cohérentes.
- [x] 084 — Ajouter la résonance élémentaire calculée automatiquement sur les équipes Genshin.
- [ ] 085 — Montrer les armes, reliques et niveaux de chaque membre.
- [x] 086 — Signaler visuellement les places de personnage encore libres dans une équipe.
- [x] 087 — Réordonner une rotation avec glisser-déposer et boutons accessibles au clavier; les combos se déplacent comme un bloc.
- [x] 088 — Enregistrer plusieurs variantes nommées par équipe, les recharger, les actualiser et revenir à la rotation manuelle.
- [ ] 089 — Ajouter des variantes de rotation selon la recharge disponible.
- [ ] 090 — Montrer les buffs d’équipe actifs dans l’ordre d’exécution.
- [ ] 091 — Comparer les dégâts par personnage et par fenêtre.
- [ ] 092 — Ajouter une estimation de confort et de difficulté d’exécution.
- [ ] 093 — Filtrer les équipes par contenu de combat.
- [ ] 094 — Ajouter la recherche rapide de personnage dans l’éditeur.
- [ ] 095 — Simplifier les statistiques de la fiche d’équipe.
- [ ] 096 — Ajouter des images de compétences à la rotation.
- [ ] 097 — Ajouter une prévisualisation d’export avant téléchargement.
- [ ] 098 — Ajouter des modèles d’équipe privés et partageables.
- [ ] 099 — Détecter les personnages dupliqués ou incompatibles.
- [ ] 100 — Ajouter un historique des changements d’équipe.

## Mes builds

- [ ] 101 — Afficher les statistiques calculées même avant l’équipement de reliques.
- [x] 102 — Distinguer les statistiques de base des bonus d’équipement.
- [ ] 103 — Montrer les sous-statistiques de chaque relique équipée.
- [ ] 104 — Améliorer la sélection de reliques avec images cadrées et chargement fiable.
- [x] 105 — Réduire la hauteur des listes de reliques importées, avec défilement contenu et repères de ligne.
- [ ] 106 — Trier les reliques par score et pertinence pour le personnage.
- [ ] 107 — Ajouter un aperçu immédiat des changements de statistiques.
- [ ] 108 — Ajouter comparaison entre deux armes sans sauvegarder.
- [ ] 109 — Ajouter comparaison entre deux ensembles d’artéfacts.
- [ ] 110 — Montrer les bonus conditionnels séparément.
- [ ] 111 — Permettre de restaurer la dernière version sauvegardée du build.
- [ ] 112 — Ajouter duplication, renommage et archivage plus visibles.
- [ ] 113 — Ajouter des notes de build et un historique.
- [ ] 114 — Permettre la sélection d’artéfacts importés depuis l’éditeur compact.
- [ ] 115 — Afficher les valeurs principales selon l’emplacement.
- [ ] 116 — Ajouter la validation des valeurs de sous-statistiques.
- [ ] 117 — Signaler les statistiques incohérentes sans empêcher l’édition.
- [ ] 118 — Améliorer la fiche de combat exportée en PNG.
- [ ] 119 — Rendre l’aperçu PNG fidèle au rendu final.
- [ ] 120 — Ajouter des filtres de builds par personnage et rôle.

## Bibliothèque de personnages
- Complément réalisé — Ajouter des raccourcis visuels par élément, synchronisés avec le filtre du catalogue et accessibles au clavier.

## Équipes
- Complément réalisé — Filtrer la bibliothèque par équipes à compléter ou favorites, combiner le filtre avec l’équipe ciblée et proposer un retour direct quand aucun résultat ne correspond.

## Tâches & objectifs
- Complément réalisé — Reporter une échéance dépassée à demain en un geste; mettre à jour les repères de date selon le calendrier local.

## Laboratoire de dégâts

- [ ] 121 — Simplifier le choix de personnage, niveau et constellation.
- [ ] 122 — Réparer le calcul des statistiques finales importées depuis Enka.
- [ ] 123 — Corriger les valeurs principales des coupes, sabliers et diadèmes.
- [ ] 124 — Corriger le calcul des sous-statistiques importées.
- [ ] 125 — Ajouter le choix d’une attaque et de ses coups séparément.
- [ ] 126 — Ajouter une sélection de cible et de résistances explicites.
- [ ] 127 — Expliquer les hypothèses et formules utilisées par un résultat.
- [ ] 128 — Séparer les dégâts moyens, critiques et non critiques.
- [ ] 129 — Ajouter les réactions aux calculs avec multiplicateurs vérifiables.
- [ ] 130 — Ajouter les buffs de sets avec conditions par pièce.
- [ ] 131 — Ajouter activation/désactivation des passifs d’armes.
- [ ] 132 — Ajouter des buffs personnalisés par statistique et durée.
- [ ] 133 — Ajouter comparaison de builds dans la même cible.
- [ ] 134 — Ajouter un tableau de priorité des statistiques transparent.
- [ ] 135 — Ajouter des profils de cible réutilisables.
- [ ] 136 — Permettre de modifier l’arme depuis le laboratoire.
- [ ] 137 — Permettre de rechercher les artéfacts possédés par défaut.
- [ ] 138 — Ajouter un résumé d’équipe et buffs appliqués.
- [ ] 139 — Exporter résultats et hypothèses sans erreur.
- [ ] 140 — Ajouter des scénarios enregistrés et rejouables.

## Personnages, armes et reliques

- [ ] 141 — Réparer les icônes manquantes avec des replis adaptés au jeu.
- [ ] 142 — Unifier le cadrage des portraits avec les équipes.
- [x] 143 — Améliorer la barre de recherche et filtres sur une ligne, avec remise à zéro ciblée de tous les filtres actifs.
- [ ] 144 — Ajouter les personnages possédés comme filtre rapide.
- [ ] 145 — Ajouter les aperçus des matériaux associés à une fiche.
- [ ] 146 — Ajouter des filtres de reliques par emplacement et set.
- [ ] 147 — Afficher les artéfacts importés dans leur bon emplacement.
- [ ] 148 — Ajouter l’aperçu image des ensembles dans les listes.
- [ ] 149 — Détecter les reliques sans image et proposer un repli.
- [ ] 150 — Ajouter un panneau de comparaison des armes.
- [ ] 151 — Mieux afficher les passifs d’armes conditionnels.
- [ ] 152 — Ajouter des favoris et filtres personnalisés.
- [ ] 153 — Ajouter une vue compacte pour les écrans étroits.
- [ ] 154 — Ajouter un tri par date d’obtention et niveau.
- [ ] 155 — Ajouter des badges de possession sans cacher le nom.
- [ ] 156 — Améliorer le chargement progressif des portraits.
- [ ] 157 — Ajouter une vérification de liens vers les matériaux.
- [ ] 158 — Réparer les fiches de personnages annoncés.
- [ ] 159 — Améliorer l’affichage des talents et constellations.
- [ ] 160 — Ajouter une comparaison des niveaux d’aptitude.

## Vœux, événements et actualités

- [x] 161 — Unifier le solde de primogemmes entre les pages et rendre les gains annulables une seule fois depuis le journal.
- [ ] 162 — Améliorer les scénarios de pity et garantie.
- [ ] 163 — Calculer des objectifs multiples en respectant leur ordre.
- [ ] 164 — Afficher les pertes/gains de chaque scénario de 50/50.
- [ ] 165 — Montrer les événements qui se terminent prochainement sur le tableau de bord.
- [ ] 166 — Réduire la place du calendrier tout en gardant l’information utile.
- [ ] 167 — Éliminer les doublons dans les événements importés.
- [ ] 168 — Rendre le rafraîchissement des actualités explicite et fiable.
- [ ] 169 — Ajouter une source et une date de mise à jour par événement.
- [ ] 170 — Ajouter des rappels par bannière et fin d’événement.
- [ ] 171 — Ajouter une estimation de gains sur période personnalisée.
- [ ] 172 — Montrer séparément primogemmes, vœux et faveurs.
- [ ] 173 — Ajouter plusieurs scénarios de gains personnalisés.
- [ ] 174 — Exporter un calendrier des événements lisible.
- [ ] 175 — Ajouter les icônes officielles aux événements connus.
- [ ] 176 — Signaler une donnée estimée ou non confirmée.
- [ ] 177 — Ajouter une vue par version du jeu.
- [ ] 178 — Ajouter des filtres par type d’événement.
- [ ] 179 — Ajouter une action rapide pour marquer un événement comme terminé.
- [ ] 180 — Améliorer l’affichage des bannières futures.

## Lore, relations, accessibilité et mobile

- [ ] 181 — Mieux séparer faits confirmés et hypothèses dans les fiches de lore.
- [ ] 182 — Ajouter les sources au niveau de chaque passage de lore.
- [x] 183 — Améliorer le panneau latéral du réseau des relations avec les preuves entrantes/sortantes visibles et les liens réciproques.
- [ ] 184 — Agrandir les portraits sans chevauchement des nœuds.
- [ ] 185 — Simplifier le retour à la vue globale du réseau.
- [x] 186 — Ajouter un degré de proximité fondé sur les preuves visibles, sans prétendre mesurer l’affection canonique.
- [ ] 187 — Ajouter un filtre de région et de faction au graphe.
- [ ] 188 — Améliorer les animations de transition avec réduction de mouvement.
- [ ] 189 — Réparer les images et vidéos intégrées des fiches.
- [ ] 190 — Adapter les panneaux à une largeur de 1920 × 1080.
- [ ] 191 — Améliorer la navigation mobile sans barre haute encombrante.
- [x] 192 — Ajouter au quiz quotidien des raccourcis clavier visibles (1 à 4), sans intercepter la saisie dans un champ.
- [ ] 193 — Ajouter des états de chargement cohérents et courts.
- [ ] 194 — Réduire les déplacements de mise en page au chargement des images.
- [ ] 195 — Suspendre les animations hors écran.
- [ ] 196 — Uniformiser les icônes par jeu et par catégorie.
- [x] 197 — Améliorer les messages d’erreur avec une action de récupération, y compris quand la requête locale ne fournit aucune erreur.
- [x] 198 — Filtrer le carnet historique par recherche, univers et type de trace, avec un état vide et une remise à zéro.
- [ ] 199 — Ajouter une vérification des débordements à différentes tailles d’écran.
- [ ] 200 — Faire une revue finale inter-pages et retirer les régressions visuelles.

## Améliorations complémentaires

- [x] Quiz quotidien — Afficher une série active exacte, le prochain jalon (3, 7, 14, 30 jours et suivants), sa progression et le rappel de jouer aujourd’hui; les séries expirées se réinitialisent proprement par univers.
- [x] Calendrier Genshin — Corriger la référence aux rappels lors de l’ouverture d’un événement; la fiche s’ouvre sans erreur et reflète les rappels enregistrés localement.
- [x] Studio de session — Suggérer une durée de sprint à partir des sessions terminées du même univers et de la même activité, tout en laissant le choix modifiable; les anciennes sessions sans durée restent compatibles.
- [x] Planificateur — Rendre la progression journalière accessible aux lecteurs d’écran et afficher directement le nombre de tâches restant à faire.
- [x] Vœux — Faire ressortir le nombre de 50/50 perdus le plus fréquent dans les résultats de simulation, sans masquer les autres cas.
- [x] Boîte de bord — Permettre de différer chaque rappel pendant 1 heure, 24 heures ou 7 jours.
- [x] Atlas — Composer un circuit quotidien de trois zones selon les échéances, les progrès en cours et les zones encore inexplorées; le circuit se recalcule en direct.

### Énergie & récupération — raccourcis configurables
- La page Énergie accepte maintenant trois raccourcis de dépense distincts pour chacun des univers. Ils sont personnalisables au même endroit que le plafond et le seuil d’alerte; le calcul réutilise le journal et le stock existants.
- Vérifié : la configuration 30/70/100 est sauvegardée; le bouton −70 réduit bien un stock de 190 à 120 et ajoute la ligne au journal.

- [x] Énergie & récupération — Configurer trois raccourcis de dépense distincts pour chaque univers et les appliquer au stock avec journalisation.

### Plan de farm — retrouver rapidement un personnage
- La recherche peut se combiner avec trois états de roster : tous, déjà suivis ou à ajouter. Les compteurs et le choix mémorisé sont visibles; l’affichage applique aussi ce choix dès le chargement initial.
- Vérifié dans Chromium : les états et les comptes restent cohérents avec les deux personnages de test, y compris après une recherche et un changement de filtre.

- [x] Plan de farm — Filtrer la liste par personnage déjà suivi ou à ajouter, avec recherche et compteurs combinables.

### Studio de session — ordre des étapes modifiable
- Chaque étape d’une session active dispose maintenant de commandes compactes pour monter ou descendre. Elles conservent la progression et l’ordre reste sauvegardé quand on ferme ou recharge l’application.
- Vérifié au clavier : déplacement de « Beta » devant « Alpha », persistance au rechargement, limites de liste désactivées et aucune erreur de script.

- [x] Studio de session — Réordonner les étapes d’une session au clavier et à la souris, avec sauvegarde immédiate.


### Boîte de bord — portefeuille responsive et progression du farm
- Le récapitulatif de vœux se replie selon la largeur réelle de sa colonne, afin que les montants, champs et date estimée restent lisibles dans la fenêtre.
- Chaque portrait de personnage associé à une session de farm est maintenant une case interactive dans la Boîte de bord. La progression individuelle et la validation complète suivent le même état sauvegardé que le tableau de bord.
- Vérifié : modules JavaScript parsés sans erreur; les fonctions de complétion individuelles sont réutilisées pour éviter deux systèmes de sauvegarde concurrents.

- [x] Boîte de bord — adapter le portefeuille de vœux à la largeur de la colonne et prévenir les chevauchements.
- [x] Boîte de bord — voir et cocher le farm de chaque personnage d’une session directement dans le panneau, avec état partagé avec le tableau de bord.


### Galerie des personnages — filtre visuel par arme
- Ajouter une rangée compacte d’icônes rondes pour filtrer les personnages par épée, claymore, lance, arc ou catalyseur; « Tous » rétablit le roster complet.
- Le raccourci reste synchronisé avec le rendu, le compteur de fiches et le bouton d’effacement des filtres.
- Les icônes utilisent les ressources locales déjà présentes, avec libellés accessibles et animation réduite si l’utilisateur le demande.

- [x] Galerie des personnages — filtrer par type d’arme depuis des icônes dédiées et réinitialiser ce filtre avec les autres.


### Équipes — recherche par nom et personnages
- Ajout d’une recherche dans la bibliothèque existante, combinée au filtre actuel et au focus sélectionné. Les résultats et le nombre visible changent en direct; la recherche est mémorisée par univers.
- La recherche trouve les noms des équipes, leurs étiquettes et les noms des personnages; elle ignore les accents. Le bouton d’effacement et un état vide rendent la récupération immédiate.
- Vérifié dans Chromium : recherche, filtre par favoris, sélection d’équipe, état vide puis effacement.

- [x] Équipes — rechercher par nom de composition ou personnage, combiner avec les filtres et conserver le choix par univers.


### Équipes — copier une rotation lisible
- Chaque équipe possède une action de copie accessible qui exporte son nom, les personnages présents, la séquence d’actions, les codes et les répétitions des combos. Une rotation vide est signalée comme « À composer ».
- La copie utilise l’API presse-papiers sécurisée et un repli navigateur quand cette API est indisponible; un retour confirme le résultat.
- Vérifié dans Chromium avec le presse-papiers simulé et une équipe sans rotation.

- [x] Équipes — copier le roster et la rotation dans un format texte partageable.


### Vœux & objectifs

- [x] 041 — Ajouter deux jauges de pity distinctes pour les bannières personnage et arme, avec état de garantie, compteurs bornés, progression animée et repères communautaires clairement indiqués comme non officiels.

- [x] 042 — Ajuster les quantités de l’inventaire de farm avec des commandes +/− accessibles, recalculant aussitôt le manque et les matériaux synthétisables.

- [x] 043 — Trier les repères de récupération, afficher l’heure locale prévue et actualiser leur compte à rebours sans recharger la page.

- [x] 044 — Faire apparaître le formulaire de gains de vœux sur le tableau de bord uniquement quand une bannière active se termine sous trois jours, avec le solde réel et l’accès direct à l’événement.


## Fiches personnage

- [x] 045 — Parcourir le roster depuis une fiche avec précédent/suivant alphabétiques, position dans le catalogue, limites désactivées et commandes adaptées au clavier.

## Équipes

- [x] 046 — Ouvrir la fiche d’un personnage depuis son portrait compact de composition, avec bouton accessible au clavier et repère visuel au survol/focus.


## Tableau de bord — filtre de préparation

- [x] 047 — Filtrer le widget de progression par personnage possédé ou avec build; retenir le choix indépendamment pour chaque univers et permettre le retour à « Tous ».


## Tâches & objectifs

- [x] 048 — Terminer d’un geste toutes les étapes encore ouvertes d’un objectif, enregistrer leur état et mettre à jour sa progression.

## Studio de session

- [x] 049 — Ouvrir une session active en mode plein écran immersif, avec sortie par Échap, commandes accessibles et repli visuel si l’API native n’est pas disponible.

## Bibliothèque d’armes

- [x] 050 — Filtrer les armes Genshin par famille en un geste à l’aide des icônes de type, sans perdre le filtre de recherche.

## Événements Genshin

- [x] 051 — Parcourir le calendrier mensuel avec précédent/suivant et revenir immédiatement au mois actuel, y compris aux changements d’année.

## Fiches personnage

## Actualités Genshin

- [x] 052 — Filtrer le flux entre toutes les annonces, les non lues et les éléments enregistrés, en conservant les filtres de catégorie, de source et la recherche.

## Tâches & objectifs — échéances proches

- [x] 053 — Filtrer les objectifs dont l’échéance tombe aujourd’hui ou dans les sept prochains jours, sans inclure les retards ni les tâches terminées.

## Équipes — rotations à composer

- [x] 054 — Filtrer les équipes qui n’ont pas encore de rotation utilisable, avec compteur et état vide clair.

## Mes builds — tri des reliques importées

- [x] 055 — Trier les reliques d’un emplacement par score indicatif CRIT/ATQ, niveau, rareté ou ordre d’import, sans réordonner l’inventaire sauvegardé.

## Tâches & objectifs — backlog sans échéance

- [x] 056 — Isoler les objectifs actifs qui n’ont pas de date, avec compteur, recherche conservée et état vide expliquant que les autres tâches sont déjà planifiées.

## Vœux & objectifs — date locale du journal

- [x] 057 — Enregistrer les gains quotidiens selon la date locale de l’application, afin qu’un gain saisi avant minuit ne soit pas attribué au lendemain UTC.

## Planificateur intelligent — export calendrier robuste

- [x] 058 — Replier les lignes longues de l’export ICS à 75 octets UTF-8, sans couper les accents ni les caractères multioctets.
## Planificateur intelligent — identifiants ICS sans collision

- [x] 059 — Garantir un identifiant unique par tâche exportée, même si une sauvegarde contient des identifiants en double.
## Carnet — export lisible et portable

- [x] 060 — Exporter les notes de l’univers actif en Markdown, en conservant les titres, catégories, personnages liés, épingles et sauts de ligne.
## Favoris — tri adapté aux fiches

- [x] 061 — Trier les fiches épinglées par ordre enregistré, nom, rareté ou élément, avec choix mémorisé séparément par univers et filtres/recherche conservés.
## Tableau de bord — réorganisation au clavier

- [x] 062 — Réordonner les widgets en mode édition avec ↑ / ↓ depuis leur poignée, en plus du glisser-déposer; le focus revient sur le même widget.
- [x] C-033 — Filtrer les archives de lore par catégorie et recherche accent-insensible, avec compteurs et état vide (tests).

- [x] C-034 — Trier la bibliothèque d’équipes par ordre enregistré, nom, roster le plus complet ou rotation prête; choix conservé par jeu et ordre source intact (tests).

- [x] C-035 — Filtrer les objectifs par catégorie et combiner ce choix aux filtres temporels et à la recherche; catégories accentuées normalisées (tests).

- [x] C-036 — Afficher la prochaine réserve multi-jeux à atteindre son plafond, l’état proche/plein et le nombre de jeux renseignés, sans comparer les unités entre elles (tests).

- [x] C-037 — Verrouiller la récompense quotidienne du Tetris (+5 boosters au-delà de 1 500 points) dans une fonction testée : seuil strict, idempotence du jour local, reprise le jour suivant.
- [x] C-038 — Exporter le journal des vœux en CSV UTF-8 pour tableur, avec gains, corrections, soldes après entrée et indication des gains annulés.
- [x] C-039 — Répartir le backlog ouvert du planificateur sur les jours futurs les moins chargés de la semaine affichée, sans déplacer les tâches terminées ou déjà planifiées.
- [x] C-040 — Ajouter au Tetris une option de vibrations tactiles mobile, enregistrée avec les réglages, pour les combos, tuiles spéciales et fins de partie; intensité ajustée au nombre de lignes et absence de vibration si l’appareil ne la prend pas en charge.
- [x] C-041 — Proposer trois difficultés au jeu de mémoire (4, 6 ou 8 paires), enregistrées par univers, avec records distincts, graines quotidiennes cohérentes, partage correct du résultat et seuil de réussite rapide adapté.

## Équipes — commandes groupées

- [x] C-042 — Développer ou réduire en un clic les détails des équipes actuellement visibles, en synchronisant les boutons individuels et leurs états accessibles.


## Carnet — recherche et épingles

- [x] C-043 — Filtrer les notes épinglées avec un choix mémorisé par univers et combiner ce filtre aux recherches accent-insensibles et catégories.

## Énergie — horaire personnalisé

- [x] C-044 — Programmer une dépense à une date et heure locales précises (au-delà des délais prédéfinis), projeter la réserve à cet instant et retrouver le rendez-vous après rechargement.
- [x] C-045 — Ajouter au résultat du quiz quotidien une commande de copie partageable qui indique l’univers, la date, le score et la série sans divulguer les réponses; retour visuel après copie et solution de repli pour les navigateurs sans Clipboard API.
- [x] C-046 — Ajouter au studio de session une frise d’activité des sept derniers jours, avec durées, nombre de sessions, intensité relative et repère du jour, consultable rapidement sur mobile.
- [x] C-047 — Compacter la hauteur des fiches de personnage dans le constructeur d’équipe et adapter le cadrage du portrait aux fenêtres desktop, 1920 × 1080, tablette et téléphone.
- [x] C-048 — Exporter en CSV les liens relationnels actuellement visibles, avec les deux personnages, type de lien, identifiants de preuve, langue, quête et URL source; ignorer proprement les résultats vides.
- [x] C-049 — Remplacer les symboles génériques du quiz quotidien par les emblèmes de jeu présents dans Astralis (Genshin, Star Rail, Wuthering), avec taille et contraste adaptés aux trois univers.
- [x] C-050 — Garder les filtres du classeur d’armes, sets et matériaux compacts sur ordinateur, puis les faire défiler dans leur barre sur téléphone au lieu d’élargir la page.


## Planificateur — validation directe dans l’agenda

- [x] C-051 — Afficher les objectifs terminés dans leur journée, les placer après les tâches actives et permettre de terminer/réactiver une tâche depuis l’agenda; progression globale et charge du jour se mettent à jour immédiatement.


## Équipes — cartes plus compactes en densité réduite

- [x] C-052 — Réduire l’encombrement vertical des fiches d’équipe quand l’interface est réglée sur « Compacte » : commandes, portraits, progression et espaces sont resserrés sans réduire l’éditeur détaillé.


## Vœux — aperçu des objectifs

- [x] C-053 — Afficher l’icône du personnage ou de l’arme reconnu dans les objectifs ordonnés, actualiser l’aperçu immédiatement à la saisie, signaler explicitement une absence de correspondance et remplacer proprement une image en échec par un pictogramme de secours.
- Vérifications : tests de synthèse des objectifs (7/7) et parcours navigateur des objectifs réussis; le parcours dédié contrôle l’aperçu, la persistance, les changements de constellations, la sensibilité des scénarios et leur application au budget. Le parcours de site complet s’interrompt sur une erreur Windows d’écriture d’une capture de diagnostic, avant les assertions suivantes.
- Progression du registre : 83/400.


## Carnet de voyage — supprimer une note isolément

- [x] C-054 — Ajouter à chaque note personnelle une commande de suppression dédiée avec confirmation, sans toucher aux visites du carnet; conserver une commande distincte pour vider l’ensemble du journal.
- Vérifications : parcours navigateur des filtres et de l’état vide, annulation de suppression, suppression confirmée, préservation d’une visite et visibilité de l’action sur un écran de 390 px sans débordement.
- Progression du registre : 84/400.


## Studio de session — ajouter une étape en cours de route

- [x] C-055 — Ajouter une étape à une session active sans l’arrêter, la sauvegarder avec son état et son ordre, conserver une limite de 12 étapes et permettre l’ajout au clavier comme au toucher.
- Vérifications : 6 tests unitaires du Studio; parcours Chromium réordonne une étape, ajoute une étape sur téléphone, atteint la limite de 12, puis vérifie l’ordre et les étapes après rechargement, sans débordement à 390 px.
- Progression du registre : 85/400.


## Énergie — bilan réel des dépenses du jour

- [x] C-056 — Résumer les points dépensés, ajoutés, le net et le nombre d’actions du jour depuis le journal de ressources, avec avertissement quand la limite d’historique rend le bilan partiel.
- Vérifications : 10 tests unitaires couvrent les changements de date, les ajouts et dépenses; parcours Chromium confirme l’actualisation après dépense, l’estimation mémorisée et l’affichage mobile à 390 px sans débordement.
- Progression du registre : 86/400.


## Réseau des relations — repères de connexion vivants

- [x] C-057 — Ajouter à l’accueil du réseau les personnages les plus mentionnés, celui qui parle du plus de monde, le duo le plus réciproque et un personnage sans preuve indexée; chaque repère s’ouvre sur la fiche ou la comparaison concernée.
- Vérifications : tests unitaires des calculs avec traductions dupliquées, liens réciproques, cibles absentes et profil isolé; parcours Chromium contrôle l’apparition, la sélection d’un personnage, l’ouverture du duo et le retour sans sélection.
- Progression du registre : 87/400.


## Tâches — planifier une échéance sans ouvrir l’éditeur

- [x] C-058 — Ajouter des commandes compactes « Aujourd’hui » et « Demain » aux objectifs sans date. Les actions enregistrent l’échéance immédiatement, puis le libellé et les filtres se recalculent.
- Vérifications : parcours Chromium reporte les retards, planifie les deux dates rapides, relit les échéances enregistrées, complète une liste d’étapes et ne relève aucune erreur d’interface.
- Progression du registre : 88/400.


## Réseau des relations — audit exportable des preuves

- [x] C-059 — Remplacer la liste brute des sources par un audit regroupé par domaine et corpus, avec volumes lore/voix, langues, URL d’origine et export JSON complet. Les milliers de liens sont créés uniquement quand un groupe est ouvert.
- Vérifications : agrégats unitaires sur plusieurs domaines, corpus, types et langues; test navigateur ouvre le panneau réel, contrôle l’export JSON et vérifie l’absence de débordement à 390 px. `docs/REVUE-REFERENCE-RELATIONS.md` garde séparés les compteurs du site source et le corpus local.
- Progression du registre : 89/400.


## Arcade astrale — carnet local des parties

- [x] C-060 — Ajouter à l’écran Tetris un historique privé des dix dernières parties, une mini-courbe des cinq derniers scores et les détails lignes/niveau. Les historiques restent séparés entre Genshin, HSR et Wuthering Waves; les données restent dans le stockage local.
- Vérifications : tests unitaires sur la limite, le tri, les données invalides et les univers distincts; parcours Chromium déclenche une fin de partie, relit le stockage, contrôle l’isolation des jeux, le nettoyage du listener et l’affichage mobile sans débordement.
- Progression du registre : 90/400.


## Réseau des relations — comparer les chiffres et inspecter la livraison des sources

- [x] C-061 — Séparer dans « Sources » les compteurs vérifiés de Ties CatForest (233 308 lignes d’histoire, 1 203 lignes vocales, 1 626 quêtes, 122 personnages) du corpus Astralis; exposer le mécanisme de livraison découvert et un exemple JSON par personnage. Inclure les mêmes métadonnées dans l’export d’audit.
- Vérifications : capture HTTP réelle de la page et du JSON public d’Amber; tests de l’instantané, des URL par langue/nom; test navigateur vérifie la séparation du compteur 2,33 M non confirmé, l’export et le rendu mobile.
- Progression du registre : 91/400.


## Réseau des relations — vérifier à nouveau les métriques du site source

- [x] C-062 — Ajouter une commande de contrôle réseau reproductible qui relit les statistiques visibles, teste un JSON narratif représentatif et s’arrête clairement si le balisage ou le service change.
- Vérifications : tests unitaires de lecture des compteurs valides/absents; contrôle réseau exécuté sur la page et le JSON d’Amber (HTTP 200). Le script ne copie pas le corpus ni les dialogues.
- Progression du registre : 92/400.


## Équipes — repères audio pour répéter une rotation

- [x] C-063 — Ajouter au répétiteur de rotation une option sonore désactivée par défaut : note douce à chaque action et accord distinct à la fin, avec préférence mémorisée sur l’appareil et repli silencieux si Web Audio n’est pas disponible.
- Vérifications : tests de la gamme des repères; navigateur avec moteur audio simulé contrôle l’activation, la fin, l’enregistrement de la préférence et le mode muet; vérifie l’absence d’erreur JavaScript.
- Progression du registre : 93/400.

## Carnet de voyage — retrouver une journée précise

- [x] C-064 — Rendre les cases des six semaines interactives : sélectionner une date filtre les visites et notes de cette journée, la date active est mise en évidence, et un contrôle réaffiche le carnet complet. Le clavier et les lecteurs d’écran peuvent utiliser les cases comme boutons.
- Vérifications : tests unitaires du filtre par date; parcours navigateur avec trois traces sur deux journées, sélection/désélection, remise à zéro, filtres croisés et affichage mobile; `node --check` sur le module et l’application; `git diff --check`.
- Progression du registre : 94/400.

## Arcade — navigation clavier entre les modes

- [x] C-065 — Ajouter le parcours des onglets de l’arcade avec les flèches gauche/droite et haut/bas, avec bouclage, Début/Fin, activation du mode et contour de focus visible. Le focus reste sur l’onglet même lorsque le mode Tetris donne normalement le focus au plateau.
- Vérifications : tests de navigation et de bouclage; navigateur à 390 px contrôle le focus, l’état sélectionné, les touches Début/Fin, le nettoyage du gestionnaire et l’absence de débordement; vérification syntaxique et `git diff --check`.
- Progression du registre : 95/400.

## Quiz quotidien — rejouer les erreurs

- [x] C-066 — Conserver localement jusqu’à 40 indices ratés par univers et proposer une session de révision depuis le résultat quotidien. Les portraits et réponses sont mémorisés; une réponse juste retire l’erreur, une nouvelle erreur reste à réviser. La pratique est explicitement séparée du score, du record, des récompenses et de la série du défi.
- Vérifications : tests unitaires sur le stockage et la résolution des erreurs; scénario navigateur avec deux erreurs révisées correctement et contrôles du score, du record, de la série et du carnet d’erreurs; vérification syntaxique, mobile et `git diff --check`.
- Progression du registre : 96/400.

## Énergie — protéger sa réserve avant une absence

- [x] C-067 — Ajouter une estimation locale de dépense avant une absence de 2 à 24 heures. L’utilisateur voit le gain d’énergie attendu, le montant minimal à dépenser, le stock au retour et la perte qui resterait inévitable si le temps d’absence dépasse la capacité disponible. Le raccourci applique la dépense et l’inscrit au journal; sa durée est mémorisée par univers.
- Vérifications : projection mathématique pour un stock proche du plafond et pour une absence trop longue; navigateur mobile valide le calcul, la dépense enregistrée, l’état après application et l’absence de débordement. `node --check` et `git diff --check` passent.
- Progression du registre : 97/400.

## Studio de session — objectif hebdomadaire de concentration

- [x] C-068 — Ajouter un objectif de concentration réglable de 1 h à 10 h par semaine, une jauge accessible, le temps restant et un état de réussite. La progression est calculée sur les sept jours affichés, inclut la session en cours et la préférence reste locale à l’appareil.
- Vérifications : tests unitaires sur progression vide, seuil atteint, dépassement et valeurs bornées; navigateur vérifie le changement d’objectif, la jauge, la persistance et les filtres de l’historique; contrôle syntaxique et `git diff --check`.
- Progression du registre : 98/400.

## Réseau des relations — garder le panneau Sources ouvert pendant l’actualisation

- [x] C-069 — Préserver le panneau « Sources & audit » quand la page Relations est remontée après un rafraîchissement de ses données; le contenu et le bouton d’export restent accessibles au lieu de disparaître.
- Vérifications : test navigateur mobile ouvre l’audit, contrôle les métriques de référence et l’absence de débordement, exporte un JSON contenant le corpus local et l’audit de référence; tests unitaires des compteurs et URL, syntaxe et diff vérifiés.
- Progression du registre : 99/400.

## Cabine des connaisseurs — apprendre après chaque réponse

- [x] C-070 — Après chaque réponse, révéler jusqu’à trois autres caractéristiques réelles du personnage cible (arme, région, voie ou attribut), sans répéter l’indice courant. Les détails proviennent du profil déjà chargé et s’affichent avec une transition réduite si l’appareil demande moins d’animations.
- Vérifications : tests unitaires pour les trois univers et l’indice retiré; navigateur mobile vérifie le retour après une mauvaise réponse, les détails du profil, l’absence de débordement et d’erreur JavaScript; syntaxe et diff vérifiés.
- Progression du registre : 100/400.

## Équipes — expliquer les résonances au lieu de seulement les nommer

- [x] C-071 — Rendre chaque résonance de Genshin consultable au clavier et lisible par lecteur d’écran; son infobulle indique aussi le bonus de jeu correspondant, sans alourdir la fiche d’équipe.
- Vérifications : lecture du rendu, des libellés d’accessibilité et des sept descriptions; syntaxe JavaScript et diff vérifiés.
- Progression du registre : 101/400.

## Énergie — visualiser les dépenses sur sept jours

- [x] C-072 — Ajouter une mini-frise hebdomadaire des dépenses et ajouts d’énergie, avec totaux distincts et repères par jour. Étendre l’historique local à 90 actions pour éviter que le graphique ne se vide après quelques sessions; les anciens journaux restent lisibles.
- Vérifications : tests unitaires sur l’agrégation par date locale, les gains et les limites de semaine; navigateur vérifie les sept barres, l’actualisation après une dépense et l’absence de débordement mobile; syntaxe et diff contrôlés.
- Progression du registre : 102/400.

## Boîte de bord — retrouver et rétablir les rappels différés

- [x] C-073 — Ajouter une liste repliable des rappels mis en attente, avec leur délai restant et une action « Réafficher » pour les restaurer immédiatement. Les rappels différés restent exclus du compteur et des filtres actifs jusqu’à leur réactivation.
- Vérifications : parcours navigateur diffère une tâche, la retrouve dans la liste, la réactive et vérifie son retour au compte actif; filtres et console restent sains; syntaxe et diff contrôlés.
- Progression du registre : 103/400.

## Planificateur — répartir le backlog en respectant la priorité

- [x] C-074 — Lors de la répartition automatique, planifier d’abord les objectifs urgents et hauts, puis les priorités normales et basses; à priorité égale, placer les plus anciens en premier et continuer à équilibrer la charge des jours. Les tâches terminées ne bougent pas.
- Vérifications : tests du modèle pour l’ordre et l’équilibrage; navigateur applique la répartition, vérifie les dates enregistrées, la conservation d’une tâche terminée et le retour de confirmation; syntaxe et diff contrôlés.
- Progression du registre : 104/400.

## Arcade — une série quotidienne dans la Mémoire des constellations

- [x] C-075 — Compter une réussite quotidienne par univers, afficher la série et signaler le défi déjà résolu. Rejouer la même constellation améliore toujours le record mais ne gonfle pas la série; une journée manquée la remet à un.
- Vérifications : tests du calcul de série (première réussite, jour consécutif, rejeu, absence); navigateur termine puis rejoue la grille, vérifie l’affichage, la sauvegarde et le déblocage des difficultés; animations de victoire désactivées avec `prefers-reduced-motion`.
- Progression du registre : 105/400.

## Réseau des relations — exposer les références annoncées

- [x] C-106 — Afficher séparément les 68 012 références d’origine annoncées par Ties, en plus des passages d’histoire, voix et quêtes. Les quatre indicateurs se replient en deux colonnes sur tablette puis une sur téléphone; les chiffres externes restent explicitement distincts des preuves locales.
- Vérifications : audit réseau relancé (page HTTP 200, métriques et JSON témoin conformes); parcours navigateur vérifie le nouveau compteur et l’absence de débordement mobile.
- Progression du registre : 106/400.

## Réseau des relations — rechercher dans toutes les preuves locales

- [x] C-107 — Ajouter une recherche transversale dans les titres, quêtes, résumés et extraits déjà indexés. Les résultats montrent les deux portraits, la catégorie et la langue, puis ouvrent directement l’association correspondante. La recherche tolère les accents, accepte plusieurs mots et plafonne l’affichage à 30 résultats.
- Vérifications : tests unitaires sur accents, requêtes multi-mots, extraits et limite; parcours navigateur complet vérifie qu’une recherche Amber ouvre le duo, ainsi que le réseau, les sources, l’export PNG/CSV et le mobile; audit Ties relancé; syntaxe JavaScript et diff contrôlés.
- Progression du registre : 107/400.

## Tableau de bord — dates et récompenses des échéances

- [x] C-108 — Dans le widget de vœux, afficher aussi la date et l’heure locales de fin d’une bannière sous trois jours et les primogemmes uniquement si le calendrier les fournit. Le formulaire de gains global se déclenche toujours sur cette échéance.
- Vérifications : tests vérifient la date, l’accessibilité de la valeur `datetime`, la présence d’une récompense connue et l’absence de récompense inventée; syntaxe et diff contrôlés.
- Progression du registre : 108/400.

## Tableau de bord — synchroniser les gains du journal global

- [x] C-109 — Chaque ajout manuel dans le widget de vœux met à jour le solde global et ajoute une entrée complète au même historique que « Vœux & objectifs », avec date, montant et soldes après ajout.
- Vérifications : test unitaire contrôle gains, conservation des données et soldes après saisie; tests du widget et syntaxe passent.
- Progression du registre : 109/400.

## Tableau de bord — enregistrer les commissions en un geste

- [x] C-110 — Ajouter l’action quotidienne adaptée au réglage de Faveur lunaire (+150 ou +60), avec l’icône de primogemme du jeu et un état désactivé après l’enregistrement. Le journal et le solde sont synchronisés avec la page des vœux; une même journée ne peut pas être ajoutée deux fois.
- Vérifications : tests unitaires couvrent les deux montants, le journal, l’idempotence et l’état du widget; navigateur réel vérifie le clic, l’icône, l’écriture unique et l’absence de débordement mobile.
- Progression du registre : 110/400.

## Réseau des relations — filtrer les preuves par nature

- [x] C-111 — Dans la recherche transversale, séparer les preuves vocales, les passages d’histoire et les preuves associées à une quête. Identifier précisément la catégorie et le titre du résultat pour éviter de regrouper chaque preuve non vocale sous « Lore ».
- Vérifications : tests unitaires sur les trois catégories; parcours navigateur vérifie le filtre Voix, son état accessible, le retour à Tout et l’ouverture d’un duo; la suite réseau confirme partage, liste, PNG et mise en page mobile.
- Progression du registre : 111/400.

## Studio de session — répéter la rotation d’une équipe

- [x] C-112 — Sélectionner une équipe enregistrée et convertir sa rotation en étapes d’entraînement avec portraits, touches, répétitions et barre de progression. Les marqueurs de groupe de combos ne deviennent pas des actions; les compositions sans rotation reçoivent une vérification par personnage. L’avancement reste enregistré localement par univers.
- Vérifications : tests couvrent l’association des portraits, les combos ignorés, les répétitions, le repli sans rotation et le rendu du sélecteur; parcours Playwright mobile confirme la préparation, les portraits chargés, la sauvegarde, la réinitialisation et l’absence de débordement.
- Progression du registre : 112/400.

## Réseau des relations — naviguer au clavier

- [x] C-113 — Ajouter des raccourcis accessibles au réseau : `/` pour la recherche, `+` et `−` pour le zoom, `0` pour recentrer et Échap pour effacer la sélection. Les raccourcis de navigation ne capturent pas la saisie dans les champs; l’aide de la carte les présente.
- Vérifications : test du mapping de chaque touche; la suite de recherche relationnelle vérifie aussi les exports et filtres existants.
- Progression du registre : 113/400.

## Tableau de bord — agir depuis les priorités

- [x] C-114 — Terminer une tâche urgente ou valider un rituel quotidien directement depuis « Les 3 actions les plus utiles ». Les suggestions se recalculent après l’action; les séries ne sont enregistrées qu’une fois les rituels du jour tous terminés, et la validation hebdomadaire reste indépendante.
- Vérifications : tests couvrent le calcul des jours et séries; parcours Playwright mobile termine la tâche puis un rituel sans quitter le tableau, confirme l’écriture locale et l’absence de débordement ou d’erreur JavaScript.
- Progression du registre : 114/400.

## Énergie — visualiser sa régularité sur quatre semaines

- [x] C-115 — Ajouter une carte de chaleur des 28 derniers jours au suivi d’énergie. Elle distingue l’intensité des dépenses, indique les ajouts, les jours actifs et le total dépensé, avec une infobulle détaillée par date. L’historique reste local et la présentation se replie sur téléphone.
- Vérifications : test unitaire des 28 dates locales, des totaux et du filtrage hors période; test navigateur mobile contrôle les 28 cases et l’absence de débordement.
- Progression du registre : 115/400.

## Réseau des relations — voir les compteurs de référence dès l’ouverture

- [x] C-116 — Afficher dans le panneau d’introduction les quatre compteurs annoncés par Ties, avec leurs libellés, la date de contrôle et un accès direct à la source. Le texte précise qu’ils ne sont pas importés dans le corpus local, afin de distinguer les 233 308 passages d’histoire annoncés des preuves vérifiées par Astralis.
- Vérifications : test du rendu confirme les quatre indicateurs et la séparation du corpus local; parcours navigateur mobile et 1920×1080 contrôle les compteurs, le lien source et l’absence de débordement.
- Progression du registre : 116/400.

## Carnet de voyage — exporter la sélection ou toute l’archive

- [x] C-117 — Séparer l’export du résultat filtré de l’archive complète. La sélection applique recherche, univers, type et date à toutes les 600 traces conservées, même celles qui ne figurent pas parmi les 70 entrées affichées.
- Vérifications : test unitaire du filtrage combiné et du texte de note; parcours navigateur compare le JSON téléchargé aux résultats de recherche puis contrôle l’export complet.
- Progression du registre : 117/400.


## Planificateur — dérouler toutes les tâches d’une journée chargée

- [x] C-118 — Garder l’agenda hebdomadaire compact avec trois tâches, puis permettre d’afficher toutes les tâches d’une journée ou de replier la liste. L’action est accessible au clavier, conserve les cases de validation et évite de perdre de vue les objectifs qui dépassaient l’aperçu.
- Vérifications : 9 tests unitaires et parcours navigateur passés à 1440 px puis 390 px; le test affiche et replie la liste sans erreur JavaScript ni débordement horizontal.
- Progression du registre : 118/400.

## Tâches — agir sur plusieurs objectifs à la fois

- [x] C-119 — Sélectionner des objectifs visibles ou individuellement, conserver la sélection par univers et terminer ou planifier pour demain tous les objectifs ouverts sélectionnés. Une sélection filtrée n’efface pas les tâches déjà sélectionnées hors filtre; les tâches terminées restent protégées des actions groupées.
- Vérifications : tests unitaires de sélection, déduplication, tâches supprimées/terminées et validation stricte de date; parcours navigateur valide le report groupé pour demain, la clôture groupée et l’effacement de la sélection; syntaxe vérifiée.
- Progression du registre : 119/400.

## Lore — suivre sa lecture des personnages

- [x] C-120 — Ajouter aux dossiers un bouton « Lu » et une liste « À lire plus tard ». Le roster dispose d’une progression globale et de filtres Tous, À lire, Lus et Enregistrés. Les préférences restent enregistrées localement et les recherches s’appliquent aussi aux filtres.
- Vérifications : quatre tests unitaires couvrent la normalisation, les bascules, les compteurs et les filtres. Syntaxe JavaScript vérifiée. Parcours navigateur vérifie l’enregistrement d’un dossier, la persistance, les filtres et l’affichage mobile.
- Progression du registre : 120/400.

## Défi quotidien — enchaîner les bonnes réponses

- [x] C-121 — Afficher une chaîne de bonnes réponses avec paliers à 3 et 5, progression animée et record personnel. Une erreur remet la chaîne courante à zéro; le meilleur enchaînement reste mémorisé séparément pour chaque univers. Le score quotidien reste inchangé, et les sessions de révision ne modifient pas le record.
- Vérifications : tests unitaires des ruptures et paliers; parcours navigateur clavier vérifie la chaîne, le record, l’isolement de la révision, l’absence d’erreur JavaScript et l’absence de débordement mobile.
- Progression du registre : 121/400.

## Équipes — comparer les compositions enregistrées

- [x] C-122 — Sélectionner jusqu’à trois équipes et comparer leurs quatre emplacements, personnages communs, éléments, résonances Genshin, étapes de rotation et places libres. La sélection est conservée par univers; retirer une équipe ou vider le comparatif est possible depuis le panneau. La grille se replie sur mobile.
- Vérifications : tests unitaires de sélection et de calcul; parcours Playwright valide l’ajout/retrait, le personnage commun, les rotations, l’effacement et l’absence de débordement à 390 px. Vérification de syntaxe et diff propres.
- Progression du registre : 122/400.

## Tableau de bord — projeter les gains depuis le solde global

- [x] C-123 — Le widget vœux montre le compte Genshin global (vœux, primos et Faveur) et prévisualise en direct le solde après les gains saisis, avec la conversion par tranches de 160. Cette projection ne modifie pas le compte; l’enregistrement passe toujours par l’action dédiée et le journal partagé.
- Vérifications : tests unitaires couvrant 159/160 et le solde global; parcours mobile vérifie le calcul après saisie, le bouton quotidien avec Faveur et l’écriture unique dans le journal.
- Progression du registre : 123/400.

## Réseau des relations — lire la proximité documentée sans surinterprétation

- [x] C-124 — La fiche d’association affiche une jauge animée de proximité sur cinq niveaux et détaille voix, extraits de lore et quêtes visibles. Le libellé précise que ce rang mesure les preuves documentées, pas l’affection des personnages.
- Vérifications : tests unitaires sur les niveaux, les types de preuves, les quêtes dédupliquées et les données non sourcées; assertions navigateur de la modale et de la jauge passées. Le parcours complet s’est arrêté uniquement à l’écriture d’une capture PNG préexistante (erreur Windows Errno 22).
- Progression du registre : 125/400.

## Réseau des relations — résumer l’activité d’un personnage

- [x] C-125 — Le panneau de personnage indique les preuves entrantes et sortantes ainsi que le nombre de liens réciproques, recalculés depuis les relations et filtres visibles.
- Vérifications : contrôle syntaxique et assertions navigateur du panneau (3 indicateurs) passés avant l’étape de capture PNG; tests unitaires du rang relationnel passés.
- Progression du registre : 126/400.

## Lore et relations — ouvrir les fiches narratives de référence

- [x] C-126 — Depuis la fiche d’un personnage jouable, ouvrir son JSON narratif public Ties en anglais. Astralis ne copie pas les 233 308 extraits : l’accès reste à la source, personnage par personnage, conformément à la livraison observée.
- Vérifications : test de génération d’URL et assertion navigateur sur Amber; aucun chargement automatique ni tentative d’import global.
- Progression du registre : 127/400.

## Cabine des connaisseurs — rendre les indices réellement utiles

- [x] C-158 — L’indice bonus choisit désormais la caractéristique qui réduit le plus le nombre de portraits encore possibles, et indique combien restent compatibles.
- Vérifications : tests unitaires couvrant le choix du meilleur indice et l’identifiant absent; tests du quiz (9/9), syntaxe du module et `git diff --check` validés.
- Progression du registre : 158/400.

## Réseau des relations — repérer les régions peu documentées

- [x] C-159 — Le sélecteur régional affiche maintenant les personnages ayant des preuves locales, le total de la région et ceux sans preuve; les filtres voix/histoire et spoilers sont pris en compte dans le calcul visible.
- Vérifications : tests unitaires de couverture régionale et des relations (23/23); la vérification navigateur complète reste bloquée par un parcours qui ne termine pas à temps.
- Progression du registre : 159/400.

## Réseau des relations — parcourir les portraits au clavier

- [x] C-160 — Les flèches déplacent le focus vers le portrait visible le plus proche dans la direction choisie; Entrée et Espace conservent l’ouverture native de la fiche. L’aide explique les commandes.
- Vérifications : tests unitaires des quatre directions, d’un identifiant absent et d’une touche non directionnelle; syntaxe JavaScript vérifiée.
- Progression du registre : 160/400.

## Réseau des relations — proposer des pistes voisines sans inventer de lien

- [x] C-161 — Quand deux personnages n’ont aucun chemin visible sous les filtres actifs, le comparatif propose pour chacun son voisin documenté le plus fort. La présentation précise explicitement qu’il s’agit de pistes séparées, pas d’une relation entre le duo.
- Vérifications : tests unitaires sur la priorité des preuves, l’exclusion de l’autre personnage et l’absence de résultats; suites quiz/réseau (21/21), modules valides et diff propre.
- Progression du registre : 161/400.

## Réseau des relations — contrôler l’élargissement du comparatif

- [x] C-162 — Le comparatif sans chemin propose une action pour élargir les filtres du réseau en conservant la langue, le thème et le réglage anti-spoiler; les changements sont annoncés avant l’action.
- Vérifications : test unitaire des filtres supprimés et de ceux préservés; suites quiz/réseau (22/22), syntaxe des modules et diff propres.
- Progression du registre : 162/400.

## Réseau des relations — résumer les preuves d’un duo

- [x] C-163 — Une relation directe présente séparément les voix de chaque personnage, les identifiants de répliques réellement communs et les scènes d’histoire distinctes. Les versions traduites ne gonflent pas les comptes.
- Vérifications : tests unitaires sur les deux sens, les preuves répétées, les mentions collectives et les scènes uniques; suites quiz/réseau (23/23).
- Progression du registre : 163/400.

## Bibliothèque — comprendre et retirer chaque filtre isolément

- [x] C-164 — La barre du catalogue affiche des pastilles pour les filtres actifs (recherche, élément, arme, rareté, possession, tri); chaque pastille retire uniquement son propre filtre et conserve les autres.
- Vérifications : tests unitaires de libellés, suppression ciblée, conservation des autres critères; 47 tests ciblés passent, syntaxe de `app.js` et `git diff --check` validés.
- Progression du registre : 164/400.


## Réseau des relations — comparer les itinéraires équivalents

- [x] C-174 — Si deux personnages n’ont pas de relation directe, le comparatif propose jusqu’à huit chemins documentés de longueur minimale. Le lecteur peut passer d’un itinéraire à un autre; les trajets restent composés exclusivement de liens attestés et visibles selon les filtres actifs.
- Vérifications : tests des chemins alternatifs, du classement par preuves, du plafonnement et des sommets absents.
- Progression du registre : 166/400.


## Planificateur — distinguer la charge par priorité

- [x] C-175 — Les jours de la semaine distinguent maintenant une journée légère, chargée ou très chargée à partir de la priorité des objectifs ouverts, en ignorant les tâches terminées. Une journée avec deux urgences ressort davantage qu’une journée avec deux tâches de routine.
- Vérifications : tests des pondérations, niveaux visuels et tâches clôturées; test navigateur du calendrier hebdomadaire.
- Progression du registre : 167/400.

## Équipes — retrouver les compositions répétées

- [x] C-176 — La bibliothèque repère les équipes ayant exactement les mêmes personnages, quel que soit l’ordre des places, et permet de filtrer ces doublons. Les équipes incomplètes sans composition comparable restent ignorées.
- Vérifications : tests unitaires sur l’ordre des emplacements, les membres absents, les équipes partielles et le filtre.
- Progression du registre : 168/400.


- [x] C-177 — Depuis chaque fiche de personnage, ouvrir les récits Ties dans les quatre langues disponibles (EN, 中文, 日本語, 한국어), en gardant les données à la source et les métriques Ties séparées du corpus local.
  - Vérifications : parcours navigateur confirme les quatre URL et les libellés; les réponses HTTP 200 ont été contrôlées pour Amber, Furina, Neuvillette et Columbina dans les quatre langues.

## Équipes — conserver les fiches ouvertes

- [x] C-178 — Mémoriser les détails d’équipe ouverts par univers afin qu’un tri, un filtre ou un nouveau rendu ne referme pas la composition consultée. L’action groupée ne modifie que les équipes visibles et reste synchronisée avec chaque bouton individuel.
- Vérifications : tests du modèle sur données invalides et équipes supprimées; parcours navigateur ouvre plusieurs fiches, change le tri et confirme qu’elles restent ouvertes.
- Progression : 173/400.

## Arcade — suspendre les chutes inactives

- [x] C-179 — Arrêter le minuteur de chute du Tetris quand le joueur passe à un autre mini-jeu, masque l’application, met le jeu en pause ou termine la partie; le redémarrer seulement au retour sur un plateau actif.
- Vérifications : tests de chaque porte d’activité; test navigateur des onglets et contrôle du code de pause/reprise après changement de mode.
- Progression : 174/400.

## Puzzle élémentaire — résonateur temporaire

- [x] C-180 — Un alignement de quatre éléments ou plus active un bonus de score ×2 pendant huit secondes. Le compte à rebours animé se rafraîchit sur un nouvel alignement long, le multiplicateur s’applique aux réactions suivantes et la partie neuve/nettoyée retire le bonus.
- Vérifications : tests unitaires des scores, chaînes, durée et renouvellement; parcours navigateur déclenche le bonus sur le plateau, observe la jauge décroître, puis confirme sa remise à zéro.
- Progression : 175/400.

## Puzzle élémentaire — éclats de réaction

- [x] C-181 — Les cases retirées libèrent un bref éclat et des particules assorties à leur élément; l’animation reste confinée au plateau, son nettoyage est garanti et elle respecte la préférence de réduction des animations.
- Vérifications : parcours navigateur déclenchant une réaction de quatre cases, présence puis disparition des particules, nettoyage au démontage; contrôles ciblés de syntaxe et de diff.
- Progression : 176/400.

## Arcade — aperçu du plateau Tetris

- [x] C-182 — Les choix de largeur et hauteur dessinent un aperçu fidèle du plateau avant redémarrage; les dimensions restent sauvegardées et l’étiquette explique quand elles seront appliquées.
- Vérifications : Chromium sélectionne 12 × 24, confirme l’aperçu accessible et la sauvegarde, puis relance la partie et mesure le vrai canvas à 360 × 720 sans erreur JavaScript.
- Progression : 177/400.

## Arcade — fonctionnement sans personnage chargé

- [x] C-183 — Prévoir un portrait de jeu par défaut lorsque le roster est vide; l’arcade ne déclenche plus d’erreur JavaScript et le plateau reste jouable pendant le chargement des données.
- Vérifications : le parcours navigateur lance Astralis avec un roster vide, détecte l’absence d’erreur puis confirme l’aperçu et le redimensionnement du Tetris.
- Progression : 178/400.

## Arcade — profils rapides de partie

- [x] C-184 — Ajouter trois profils de Tetris cohérents — Voie calme, Classique et Défi astral — qui règlent ensemble les dimensions, la vitesse, les tuiles spéciales, le fantôme et le quadrillage. La sélection manuelle reste libre et retire l’état « actif » des profils lorsqu’elle s’en écarte.
- Vérifications : Chromium applique chaque profil, compare les valeurs persistées, vérifie l’état accessible des boutons, modifie manuellement le profil et lance le plateau 12 × 24.
- Progression : 179/400.

## Arcade — indice de mémoire limité

- [x] C-185 — Ajouter deux indices optionnels par partie au jeu de mémoire. Chacun révèle brièvement une paire encore cachée et coûte deux coups; l’action est indisponible avant le début, pendant une animation ou après la victoire. Le compteur et l’éclat visuel rendent le coût et l’indice visibles.
- Vérifications : parcours Chromium vérifiant les états désactivés, le coût de deux coups, la révélation temporaire, le quota restant et l’absence d’erreur JavaScript; tests de modèle de mémoire réussis.
- Progression : 180/400.

## Arcade — navigation clavier dans la mémoire stellaire

- [x] C-186 — Parcourir les cartes avec les flèches directionnelles; la grille empêche de passer directement de fin de ligne à la ligne suivante. Entrée et Espace retournent la carte, Échap relance, et le focus reste sur la bonne carte après le rendu. Les instructions sont annoncées aux lecteurs d’écran.
- Vérifications : parcours Chromium pour déplacement horizontal, retournement au clavier, conservation du focus, réinitialisation, puis scénario des indices et complétion des défis; aucune erreur de navigateur.
- Progression : 181/400.

## Arcade — annonces vocales du jeu de mémoire

- [x] C-187 — Annoncer les actions utiles avec une région de statut accessible : carte retournée, paire trouvée, échec, indice et victoire. La grille n’est plus une région live qui rediffuse tout son contenu à chaque coup.
- Vérifications : parcours Chromium vérifiant le rôle status, la suppression du live sur la grille, le texte de l’indice, la fermeture de l’indice et la victoire; contrôles syntaxiques réussis.
- Progression : 182/400.

## Arcade — célébration des paires

- [x] C-188 — Chaque paire juste déclenche une brève animation de constellation sur les deux portraits, avec éclat et rebond contenu dans les cartes. Les animations se nettoient automatiquement, s’annulent au redémarrage et respectent `prefers-reduced-motion`.
- Vérifications : Chromium constate les deux cartes animées puis leur retour à l’état normal; parcours complet du jeu, indices, progression quotidienne et absence d’erreur navigateur.
- Progression : 183/400.
