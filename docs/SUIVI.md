# Suivi des chantiers Astralis

États : `[ ]` à faire · `[~]` en cours · `[x]` fait et vérifié (hash requis) · `[!]` bloqué (raison + essai requis).

## C — Chantier 0 : architecture visuelle et design system
- [~] **Toutes pages ·** Fondation CSS à tokens sémantiques et contrôles communs ajoutée; migration visuelle complète encore en cours.
- [x] **Toutes pages ·** Accent du jeu actif utilisé par défaut; accent du personnage prioritaire dans son thème, et accent personnalisé toujours respecté. Vérifié par tests de contrat. `2991dd6`.
- [~] **Toutes pages ·** Les styles ajoutés suivent les tokens configurables, le thème clair/sombre et `prefers-reduced-motion`; vérification visuelle globale à faire.
- [~] **Design system ·** Boutons, champs, sélecteurs, onglets, cartes, panneaux et états ont des contrats documentés; composants graphiques restants à migrer.
- [ ] **Toutes pages ·** Remplacer les composants natifs visuellement incohérents.
- [~] **Architecture ·** Classification catalogue + grille fluide ajoutée; migration de toutes les pages en cours.
- [~] **Architecture ·** Classification des fiches détail ajoutée; migration des fiches en cours.
- [~] **Architecture ·** Classification outil ajoutée; migration des outils en cours.
- [~] **Architecture ·** Classification tableau de bord ajoutée; gabarit et migration en cours.
- [~] **Toutes fiches ·** Défilement contenu ajouté aux panneaux/modales et verrouillage du fond; vérification visuelle par type de fiche restante.
- [~] **Navigation ·** Défilement tactile, recherche rapide Ctrl+K et sections repliables ajoutés; contrôle visuel réel restant.
- [ ] **Toutes pages ·** Ajouter introductions, aides, conseils et états vides utiles et mis en forme.
- [ ] **Toutes pages ·** Migrer les pages vers les nouveaux gabarits.
- [ ] **Qualité ·** Aucune erreur console après migration.
- [ ] **Qualité ·** Vérifier le défilement sur toutes les fiches.
- [ ] **Documentation ·** Captures avant/après de chaque page dans `docs/captures/` et liste exhaustive des pages migrées.

## D — Chantier 1 : coque, accueil et tableau de bord
- [ ] **Barre supérieure ·** Afficher l'icône du profil.
- [ ] **Barre supérieure ·** Aligner à droite les compteurs de ressources du jeu actif.
- [ ] **Barre supérieure ·** Utiliser les icônes exactes et locales des ressources Genshin, HSR et Wuthering Waves.
- [ ] **Barre supérieure ·** Changer les ressources affichées selon le jeu actif.
- [ ] **Navigation ·** Utiliser les icônes officielles des trois jeux pour leurs onglets.
- [ ] **Bienvenue ·** Refaire l'écran de connexion en écran chaleureux distinctif.
- [ ] **Bienvenue ·** Fond animé adapté au jeu.
- [ ] **Bienvenue ·** Portrait du compagnon et bulles à saisie animée.
- [ ] **Bienvenue ·** Résumé du jour : vœux, résine, événements.
- [ ] **Bienvenue ·** Citations et bouton Entrer.
- [ ] **Mises à jour ·** Afficher une fenêtre « Quoi de neuf » après mise à jour/première ouverture.
- [ ] **Mises à jour ·** Présenter les fonctions en cartes, avec formes ludiques, icônes, animations et fermeture.
- [ ] **Mises à jour ·** Permettre de revoir les nouveautés depuis les réglages.
- [ ] **Mises à jour ·** Charger le contenu depuis `changelog.json` versionné.
- [ ] **Tableau de bord ·** Réduire et adapter les blocs au contenu, réduire les titres et le bloc endgame.
- [ ] **Tableau de bord ·** Ajouter la section Bannières.
- [ ] **Tableau de bord ·** Afficher la bannière personnage active avec compteur de fin ou de début.
- [ ] **Tableau de bord ·** Afficher les portraits de personnages sur une seule ligne, grands, sans nom ni rareté.
- [ ] **Tableau de bord ·** Afficher les deux bannières de personnages sur une ligne dédiée.
- [ ] **Tableau de bord ·** Afficher les bannières d'armes dans la même structure.
- [ ] **Tableau de bord ·** Afficher automatiquement les prochaines bannières.
- [ ] **Tableau de bord ·** Réparer et réduire le bloc Objectifs de vœux.
- [ ] **Tableau de bord ·** Fusionner équipe aléatoire et équipe aléatoire du boss avec portraits alignés et boss dessous.
- [ ] **Tableau de bord ·** Refaire Ma session pour qu'elle soit compacte et utile.
- [ ] **Tableau de bord ·** Refaire le bloc Compagnon.
- [ ] **Tableau de bord ·** Aérer et réduire Événements à venir.
- [ ] **Tableau de bord ·** Supprimer Repère du jour.
- [ ] **Tableau de bord ·** Afficher tous les personnages et builds de la vitrine Enka.
- [ ] **Tableau de bord ·** Ajouter un vrai mode d'édition : ajout, retrait, déplacement, redimensionnement et masquage par glisser-déposer.
- [ ] **Tableau de bord ·** Gérer plusieurs dispositions et réinitialisation discrète.

## E — Chantier 2 : personnages, armes, reliques, matériaux
- [ ] **Personnages ·** Cartes plus carrées, splash centré avec zoom modéré.
- [ ] **Personnages ·** Diagnostiquer la cause racine du mélange de fiche Aino/Alhaitham.
- [ ] **Personnages ·** Ajouter un test qui ouvre toutes les fiches et vérifie la correspondance nom/fiche.
- [ ] **Personnages ·** Trier par défaut du plus récent au plus ancien.
- [ ] **Personnages ·** Retirer les étoiles en haut à gauche.
- [ ] **Personnages ·** Contour fin violet pour 4★ et orange pour 5★.
- [ ] **Personnages ·** Rendre la fiche défilable.
- [ ] **Personnages ·** Retirer l'import d'image de skin.
- [ ] **Personnages, artefacts, sets ·** Refaire les fiches pour une lecture plus agréable.
- [ ] **Armes ·** Afficher toutes les armes par défaut et supprimer « Afficher plus ».
- [ ] **Armes ·** Virtualiser la liste pour conserver la fluidité.
- [ ] **Armes ·** Rendre la fiche défilable.
- [ ] **Reliques ·** Tout afficher par défaut sans « Afficher plus ».
- [ ] **Reliques ·** Virtualiser la liste.
- [ ] **Reliques ·** Rendre la fiche de set défilable.
- [ ] **Matériaux ·** Reconnaître matériaux de personnages, armes et ennemis pour l'élévation.
- [ ] **Matériaux ·** Montrer dans chaque fiche les personnages, armes et aptitudes associés avec leurs icônes depuis les sources.
- [ ] **Matériaux ·** Rendre la fiche défilable.
- [ ] **Matériaux ·** Aérer « Niv. talents » des fiches de farm et appliquer l'accent du personnage.

## F — Chantier 3 : équipes et dégâts théoriques
- [ ] **Équipes ·** Corriger les compétences sous les splash arts et ajouter un test de régression.
- [ ] **Équipes ·** Restaurer les statistiques du personnage sous forme de tableaux.
- [ ] **Équipes ·** Remplacer les sélecteurs de listes par le composant recherchable illustré.
- [ ] **Équipes ·** Retirer les noms d'armes et sets des coéquipiers.
- [ ] **Équipes ·** Entourer chaque icône de rotation d'un cercle teinté par le personnage.
- [ ] **Équipes ·** Calculer les dégâts contre un ennemi niveau 100 avec base, bonus, critique, défense et résistance.
- [ ] **Équipes ·** Afficher `TODO_DATA` quand une donnée requise manque, sans inventer de valeurs.
- [ ] **Équipes ·** Colorer séparément les réactions et permettre de filtrer leurs dégâts.
- [ ] **Équipes ·** Afficher les dégâts d'Hyperfloraison et des autres réactions transformatives.
- [ ] **Équipes ·** Ajouter le repli/dépli de détails (replié : icônes + nom d'équipe).
- [ ] **Qualité ·** Tester le moteur avec des valeurs de référence calculées à la main et montrer le calcul.
- [ ] **Qualité ·** Capturer les vues équipe repliée et dépliée.

## G — Chantier 4 : vœux, endgame, actualités, journal
- [ ] **Vœux ·** Restaurer les couleurs de pity selon les pertes de 50/50 et la haute pity.
- [ ] **Vœux ·** Après trois pertes consécutives, annoncer Capture de radiance garantie.
- [ ] **Vœux ·** Autoriser les états perdu, gagné et Capture de radiance, cette dernière en violet.
- [ ] **Épargne ·** Réparer graphiques dynamiques et proportionnels, y compris plusieurs entrées le même jour.
- [ ] **Épargne ·** Ajouter prévisions de primogemmes, calendrier de gains, objectif de pity et historique, puis les lister au rapport.
- [ ] **Endgame ·** Réparer et réduire le compteur Carnage.
- [ ] **Endgame ·** Synchroniser automatiquement depuis une source publique.
- [ ] **Endgame ·** Ajouter un bouton pour afficher la prochaine rotation de chaque mode quand publiée.
- [ ] **Abîme ·** Supprimer les étages 9 et 10.
- [ ] **Actualités ·** Refaire la page avec plus de couleurs et un calendrier compact.
- [ ] **Actualités ·** Synchroniser automatiquement événements, bannières et endgames avec dates début/fin en barres multi-jours.
- [ ] **Lore ·** Diagnostiquer et corriger les fiches boguées d'après la capture jointe.
- [ ] **Toutes pages ·** Enrichir les textes avec couleur et mise en forme utile.
- [ ] **Personnages ·** Revoir les données et l'affichage des factions.
- [ ] **Journal ·** Présenter les changements avec icônes, listes, rouge pour retrait/modification et vert pour ajout.
- [ ] **Journal ·** Comparer automatiquement snapshots avant/après pour personnages, armes, sets et toutes leurs valeurs/descriptions.
- [ ] **Journal ·** Conserver l'historique et filtrer par type et version.

## H — Chantier 5 : calcsheet, farm, fiches PNG
- [ ] **Calcsheet ·** Agrandir nettement les icônes de personnages.
- [ ] **Calcsheet ·** Personnaliser séparément en-tête (taille, police, couleur) et cellules.
- [ ] **Calcsheet ·** Revoir bordures et dimensions de cellules.
- [ ] **Calcsheet ·** Préserver les couleurs dans un export adapté à Google Sheets.
- [ ] **Exports ·** Créer une fonction PNG commune qui sauvegarde et copie dans le presse-papiers les fiches de tableaux, personnages, armes, sets, équipes et builds.
- [ ] **Farm ·** Ajouter la recommandation de farm d'artefacts avec leurs images.
- [ ] **Farm ·** Faire apparaître automatiquement chaque personnage nouvellement synchronisé.
- [ ] **Farm ·** Remplacer le choix ambigu par une liste distincte avec image, nom et case par personnage.
- [ ] **Farm ·** Obtenir localement les icônes des livres d'EXP violets et bleus et améliorer cette section.

## I — Chantier 6 : automatisation globale et tests finaux
- [ ] **Sources ·** Configurer les sources de données publiques dans `import-sources.json`.
- [ ] **Synchronisation ·** Synchroniser au démarrage au plus toutes les 6 h et via un bouton manuel.
- [ ] **Synchronisation ·** Journaliser les résultats et gérer délais, reprises et indisponibilités sans casser l'application.
- [ ] **Validation ·** Placer les personnages détectés en file Valider/Modifier/Rejeter.
- [ ] **Sources ·** Ajouter des fausses sources de test qui prouvent les automatismes sans données de jeu codées en dur.
- [ ] **Personnages ·** Diagnostiquer le repli splash vers icône de la Tsarine et l'absence du kit de Danica, sans les injecter manuellement.
- [ ] **Personnages ·** Tester l'ordre des sources, récupération splash/kit, cache et statut « Non confirmé » sur données partielles.
- [ ] **Documentation ·** Créer `docs/AUTOMATISATION.md` avec sources, fréquences et panne.
- [ ] **Qualité ·** Lancer la suite complète, corriger et archiver les captures correspondantes.
- [ ] **Rapport ·** Rendre le bilan point par point fait/pas fait/raison et le décompte final ici.


## Journal d'avancement
- Chantier 0 tranche 1 : ajout du design system tokenisé, classification sémantique des pages, recherche du menu Ctrl+K, scroll tactile du rail et des fiches. Vérifications : node --check src/design-system.js, 9 tests Node et 2 tests Python réussis. Commit initial: d41aadfb5e6fb7c7e658a74091c8d34139082593.

- Chantier 0 tranche 2 : groupes latéraux repliables et tests de contrat de navigation, gabarits, scroll et mouvement réduit; vérification d’intégration navigateur à poursuivre.

- Chantier 0/Équipes · Correctif cache ajouté : les ressources avec ?v= sont recherchées par URL exacte, le cache hors ligne ne sert d’ancienne version qu’en secours; cache shell incrémenté et requêtes CSS/JS versionnées renouvelées. Tests de contrat ajoutés; vérification navigateur après rechargement encore à faire.
- Chantier 0 · Accents du jeu et du personnage appliqués au thème global et aux composants sémantiques; changement de jeu réapplique les préférences et la version/cache passent à 1.0.32/v29. Vérification : `node --check` sur les modules concernés et 20 tests Node réussis. Commit code : `2991dd6`.

- Tranche de stabilisation 1.0.33 : corrigé le rendu des lignes du suivi de vœux qui utilisait un `result` hors portée; centralisé la classification de pity dans `src/wish-pulls.js`. Renforcé les règles d’alignement responsive des ressources de la barre et la stabilité des cartes d’équipe; cache shell v30 et ressources versionnées. Vérifié : `node --check src/app.js`, `node --check src/wish-pulls.js`, 24 tests Node et 2 tests Python réussis, `git diff --check` propre. Commit code : `98cf407`. Aucune des cases du cahier large n’est déclarée terminée sur la seule base de tests structurels.
