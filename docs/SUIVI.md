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

- Tranche publiée 1.0.32 : corrigé le rendu des lignes du suivi de vœux qui utilisait un `result` hors portée; centralisé la classification de pity dans `src/wish-pulls.js`. Renforcé les règles d’alignement responsive des ressources de la barre et la stabilité des cartes d’équipe; cache shell v30 et ressources versionnées. Vérifié : `node --check src/app.js`, `node --check src/wish-pulls.js`, 24 tests Node et 2 tests Python réussis, `git diff --check` propre. Commit code : `98cf407`. Aucune des cases du cahier large n’est déclarée terminée sur la seule base de tests structurels.

## Correctif ciblé 1.0.33 — 2026-11-08
- [x] Vœux & objectifs · Le titre et le compteur sont définis pour la navigation directe; cache applicatif renouvelé. Vérifié par tests et suite de régression. Commit code : `eaf943d`.
- [x] Équipes · Les clics des commandes de la modale sont relayés au gestionnaire d’actions délégué. Vérifié par contrat de test et suite de régression. Commit code : `eaf943d`.
- [x] Fiches personnage · Les balises couleur sûres et sauts de ligne sont rendus; les multiplicateurs sont filtrés au niveau 10. Vérifié par tests unitaires. Commit code : `eaf943d`.


## Cahier des charges joint — suivi point par point (2026-11-08)
Source : pièce jointe de l’utilisateur et référence cartes-apercu (8).html. Les états restent ouverts jusqu’à vérification. Les sous-points numérotés sont individualisés.

### 0. MODE D'EXÉCUTION : TOUT D'UN SEUL TENANT
- [ ] 0. MODE D'EXÉCUTION : TOUT D'UN SEUL TENANT · Ce message est UNE SEULE mission, longue. Tu l'exécutes EN ENTIER, d'une traite, sans t'arrêter entre les parties, sans me poser de question, sans attendre mon accord et sans me répondre avant la fin. Même si cela te prend 8 heures ou plus, ce n'est pas un problème : je préfère attendre un travail complet plutôt que recevoir des morceaux. Il est interdit de livrer « une première partie » ou de t'arrêter sur « il reste à faire ».
- [ ] Règle de travail · 1. Tu AGIS. Aucune excuse, aucun « je ne peux pas », aucune demande de confirmation. Si un point est ambigu, tu choisis l'option la plus raisonnable, tu la notes dans `docs/SUIVI.md`, et tu continues.
- [ ] Règle de travail · 2. Tu ouvres chaque fichier avant de le modifier et tu travailles sur son contenu réel. Si un motif est introuvable, tu relis le fichier et tu adaptes (réécris le bloc ou la fonction en entier, jamais de remplacement aveugle).
- [ ] Règle de travail · 3. MÉMOIRE : tu crées d'abord `docs/SUIVI.md` avec CHAQUE point de ce message (sections 1 à 13) en cases à cocher : `[ ]` à faire, `[~]` en cours, `[x]` fait ET vérifié, `[!]` bloqué (raison exacte + ce que tu as essayé). Tu le relis avant chaque grande étape, tu le mets à jour au fur et à mesure, et tu ne termines pas tant qu'il reste une case `[ ]` ou `[~]`. Si tu perds le contexte, ce fichier fait foi : « lis docs/SUIVI.md et reprends à la première case non cochée ».
- [ ] Règle de travail · 4. Tu NE SUPPRIMES AUCUNE FONCTIONNALITÉ existante. Avant de remplacer une page, tu en fais l'inventaire (`docs/INVENTAIRE.md` : fonctions, boutons, données, options, raccourcis) et tu vérifies à la fin que tout existe encore, sous une forme identique ou meilleure.
- [ ] Règle de travail · 5. Aucune donnée de jeu inventée : valeur inconnue = `null` + badge « Non confirmé ». Les données viennent de sources automatiques (voir section 11), jamais écrites à la main dans le code.
- [ ] Règle de travail · 6. Tu vérifies toi-même (syntaxe, tests automatisés, ouverture réelle de chaque page, console sans erreur, captures) et tu corriges avant de continuer. Pour chaque bug corrigé, tu ajoutes le test qui l'aurait détecté.
- [ ] Règle de travail · 7. Tu sauvegardes les fichiers touchés dans `_backup_avant_modif/` (dans `.gitignore`). Tu respectes la personnalisation des couleurs par l'utilisateur (variables CSS, accent modifiable).
- [ ] Règle de travail · 8. Efficacité : lis chaque fichier une fois, applique toutes les modifications qui le concernent d'un coup, regroupe les commandes, ne répète pas d'explications. Ton code est lui aussi efficace (pas de re-rendus complets inutiles, caches et index construits une fois).
- [ ] Règle de travail · 9. GIT : tu fais des commits fréquents (message « type(zone): résumé »), tu pousses (`git push`, jamais `--force`) après chaque grande section terminée par sécurité, et TU PUBLIES TOUT sur le dépôt GitHub à la fin (dernier commit + push), sans que je le demande. Jamais de clés, mots de passe ou fichiers inutiles dans le dépôt. Si le push échoue, donne l'erreur exacte et la commande à lancer, puis continue.
- [ ] 0. MODE D'EXÉCUTION : TOUT D'UN SEUL TENANT · 10. Ta réponse finale (et seulement elle) contient : le décompte « points faits / total », la liste point par point de tout ce message avec « fait / pas fait / pourquoi », les fichiers principaux modifiés, comment vérifier en 3 clics, et le hash du dernier commit.

### 1. LABORATOIRE DE DÉGÂTS (explication complète)
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Le « Laboratoire de dégâts » est une page unique qui regroupe trois outils partageant les mêmes données : (A) un moteur de dégâts avec rotations et comparaison avant/après, (B) un optimiseur d'artéfacts à partir de l'inventaire de l'utilisateur, (C) une liste de personnages classés par priorité. Le but : être plus exact, plus transparent, plus rapide et plus beau que Genshin Optimizer et que l'outil de référence « Little Bro » (dont je te joins des captures). Tu t'inspires du principe d'usage de cet outil de référence, tu ne copies NI son code, NI ses images, NI son nom, NI sa mise en page à l'identique.

#### 1.1 Ce que montre l'outil de référence (captures) :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Navigation équipes → personnage, avec deux boutons « Loadout » / « Build équipé » et quatre onglets : Vue d'ensemble, Talents, Optimiser, Amélioration d'artéfacts.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Colonne gauche : portrait, niveau, constellation, étoiles, les 6 pièces d'équipement (arme + 5 artéfacts) en miniatures avec niveau et stat principale, stats de base et bonus, stats bonus modifiables.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Colonne centrale (filtres) : niveau d'artéfact (curseur + compteur), stat principale par emplacement avec des pastilles de comptage, assistance de niveau de stat principale.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Colonne droite : configuration des sets (2 pièces, 4 pièces, arcs-en-ciel, effets conditionnels), configuration des artéfacts équipés ailleurs, contraintes minimales, case « exclure des artéfacts », case « utiliser les artéfacts des builds actifs des coéquipiers », case « autoriser les builds partiels ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Choix de la cible : une attaque précise du personnage (ex. compétence élémentaire + type de dégâts), exclusions, bouton « Générer des builds ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Résultats : plusieurs builds classés, pièces en images, boutons « Nouveau build » / « Équiper au build actuel », bascule dégâts sans crit / moyens / crit, choix de la réaction (ex. Évaporation), liste des dégâts par attaque, réactions transformatives, comparaison avec une cible graphique.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Ses défauts à corriger : filtres trop denses, pastilles et chiffres non expliqués, libellés mélangés anglais/français, menus déroulants rouges peu lisibles, rien n'indique ce qui coûte du temps de calcul, pas de résumé des filtres actifs.

#### 1.2 Le moteur de dégâts (`damage-engine.js`, module pur sans DOM, entièrement testé) :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Formule : Dégâts = DégâtsDeBase × (1 + Bonus de dégâts) × MultCrit × MultDEF × MultRES × MultRéaction (+ termes additifs). Chaque terme est calculé séparément et affichable.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Base = % du talent × stat de référence (ATQ, PV, DÉF ou MÎ) + dégâts plats. Stat finale = base × (1 + %) + plat.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Crit : trois cas (sans crit, crit, moyen = 1 + min(TauxCrit, 1) × DgtCrit).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · DEF : (Nv_perso + 100) / ((Nv_perso + 100) + (Nv_ennemi + 100) × (1 − réduction DEF) × (1 − ignorance DEF)).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · RES : si RES < 0 → 1 − RES/2 ; 0 ≤ RES < 75 % → 1 − RES ; RES ≥ 75 % → 1/(4·RES + 1).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Réactions amplifiantes (Vaporisation, Fonte) : multiplicateur de base × (1 + 2,78·MÎ/(MÎ + 1400) + bonus de réaction).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Réactions additives (Intensification, Propagation) : ajout aux dégâts de base, avec la table de niveau et la MÎ.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Réactions transformatives (Surcharge, Supraconduction, Électro-Charge, Brisé, Tourbillon, Floraison, Hyperfloraison, Fleur ardente, Brûlure, et les réactions Lunaires de la version courante) : coefficient × table de niveau × (1 + 16·MÎ/(MÎ + 2000) + bonus) × RES, sans crit sauf exception documentée.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Vérifie les mécaniques de la version courante du jeu et signale tout écart avec ce que tu sais.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · N'invente JAMAIS une valeur (multiplicateurs de talent, tables de niveau, effets d'armes ou de sets). Charge les données depuis une source ouverte (genshin-db, Project Amber, AnimeGameData) ou marque `TODO_DATA` visible dans l'interface.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Gère : snapshot vs buffs dynamiques, durées et uptime, stacks, résonances élémentaires, buffs d'équipe configurables, niveau et RES de l'ennemi réglables avec préréglages (monstre niveau 100, Abîme, boss, Domaines).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Tests : au moins 15 cas avec valeurs de référence calculées à la main (un par type de réaction, DEF réduite, RES négative et ≥ 75 %, crit/non-crit, stats limites). Tu montres le calcul de référence dans le test.

#### 1.3 Rotation et comparaison avant/après :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Rotation = timeline d'actions représentées par des ICÔNES (attaque normale, chargée, plongeante, compétence, déflagration, réactions, buffs ON/OFF avec durée), glisser-déposer, répétable N fois, temps total saisi ou calculé. Un cercle de la couleur du thème du personnage entoure chaque icône. Sortie : dégâts par action, total, DPS.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Recherche par attaque : une barre de recherche cherche dans les noms d'attaques et de talents de TOUS les personnages (français et anglais, sans accents ni casse, tolérante aux fautes), affiche l'icône, le nom, le personnage associé et un bouton « Ajouter à la rotation ». Index construit une seule fois.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Comparaison avant/après : build actuel contre build modifié (une pièce, l'arme, un set). Delta absolu et en %, barres avant/après, décomposition en cascade des gains par stat.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Sensibilité : valeur marginale de +1 % Taux Crit, +1 % DGT Crit, +10 MÎ, +1 roll, classée par gain.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · « Voir le détail » : chaque terme de la formule pour une action, pour pouvoir vérifier le calcul.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Alertes : Recharge d'énergie insuffisante, buffs mal superposés, donnée `TODO_DATA`.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Bouton « Dégâts théoriques » d'une équipe : calcul sur un monstre niveau 100, une couleur de texte différente par réaction élémentaire, choix de l'affichage (sans réaction, Fonte, Vaporisation, Intensification, Propagation…), dégâts d'Hyperfloraison et autres transformatives, bouton Déplier/Replier qui cache les détails de l'équipe (replié : icônes des personnages + nom de l'équipe).

#### 1.4 Optimiseur d'artéfacts (optimum garanti, recherche optimisée) :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Import de l'inventaire : format GOOD (Genshin Optimizer), JSON Astralis, scanners courants, saisie manuelle ; aperçu avant import, détection des doublons, validation (pièces impossibles signalées : 3 ou 4 sous-stats initiales, aucune sous-stat identique à la principale, montées à +4/+8/+12/+16/+20).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Tables d'artéfacts 5★ à vérifier contre ta source (la source gagne, tu me signales l'écart) : stats principales niveau 20 (PV 4780, ATQ 311, ATQ/PV % 46,6, DÉF % 58,3, MÎ 187, Recharge 51,8, Taux Crit 31,1, DGT Crit 62,2, bonus élémentaire 46,6, physique 58,3, soins 35,9) ; sous-stats, roll maximal (PV 298,75 ; ATQ 19,45 ; DÉF 23,15 ; PV/ATQ % 5,83 ; DÉF % 7,29 ; MÎ 23,31 ; Recharge 6,48 ; Taux Crit 3,89 ; DGT Crit 7,77) avec les paliers 70/80/90/100 %.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Objectifs : une rotation, une action unique, DPS, PV effectifs, soins, pondération personnalisée.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Algorithme (recherche exacte mais qui évite tout calcul inutile) :
- [ ] Règle de travail · 1. pré-filtrage par emplacement : suppression des pièces dominées, conservation des seules stats qui influencent l'objectif, dédoublonnage des pièces à vecteur de stats identique ;
- [ ] Règle de travail · 2. regroupement par configuration de set (4 pièces, 2+2, hors-set) : bonus calculé une seule fois par configuration ;
- [ ] Règle de travail · 3. branch and bound : emplacements ordonnés par taille de pool croissante, borne supérieure = stats partielles + maximum possible des emplacements restants (maxima suffixes précalculés), coupe de la branche si la borne ≤ k-ième meilleur score ;
- [ ] Règle de travail · 4. élagage de faisabilité par les contraintes (Recharge min., Taux Crit max/min, PV/DÉF/MÎ min.) ;
- [ ] Règle de travail · 5. démarrage à chaud avec l'équipement actuel comme première borne, tri heuristique des pièces ;
- [ ] Règle de travail · 6. boucle interne sans allocation (tableaux typés, sommes incrémentales, évaluateur réduit qui prend le vecteur de stats déjà additionné) ;
- [ ] Règle de travail · 7. Web Workers (cœurs − 1), répartition par blocs du premier emplacement, partage de la meilleure borne, progression et annulation instantanée ;
- [ ] Règle de travail · 8. avant lancement : estimation du nombre de combinaisons ; après : nœuds visités, branches élaguées (%), pièces éliminées, temps ;
- [ ] Règle de travail · 9. tests comparant l'optimiseur élagué à une recherche brute sur de petits inventaires (top N identique) + banc de performance 1 000 et 5 000 artéfacts.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Résultats : top N, pièces en images, stats finales, gain vs équipement actuel (en % et par action), « pourquoi cette combinaison » (les 3 stats déterminantes), bouton « Appliquer au build », option « Nouveau build ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Analyse d'artéfacts : qualité par pièce, conseil garder/améliorer/jeter justifié, simulation Monte-Carlo à graine fixe pour les pièces non montées au niveau 20. Aide au farm : quel set et quel Domaine rapportent le plus.

#### 1.5 FILTRES FACILES (point essentiel : un novice obtient un bon résultat en 3 clics, un expert garde tout) :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Niveau 1 toujours visible : objectif (quelle attaque ou quelle rotation), préréglage « Rapide / Équilibré / Précis » (chacun décrit en une phrase), bouton « Lancer ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Niveau 2 « Personnaliser » : niveau des artéfacts (trois boutons : « Niveau 20 seulement », « 16 et plus », « Tous »), stats principales (seulement pour sablier, coupe, couronne, en icônes à cocher avec le nombre de pièces), sets (grille d'images à trois états : autorisé / imposé / exclu, triée par pertinence), type de configuration (4 pièces, 2+2, arc-en-ciel) en une rangée de boutons, pièces utilisables (non / seulement celles des personnages classés en dessous dans ma liste / oui), contraintes minimales (curseurs avec repère de la valeur actuelle et indicateur atteignable/impossible).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Niveau 3 « Avancé » : exclusions fines, pièces verrouillées une par une.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Intelligence par défaut : l'outil sélectionne les stats utiles à l'objectif, masque les inutiles, propose les sets pertinents, pré-remplit la Recharge minimale d'après la rotation.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Compteur en direct : « X artéfacts retenus sur Y, environ Z combinaisons, durée estimée W s », mis à jour à chaque changement avec le gain de temps (« exclure les niveaux 0 à 11 retire 120 pièces et divise le temps par 3 »).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Résumé des filtres actifs en pastilles amovibles + « Tout réinitialiser » + « Annuler ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Tout en français, info-bulle d'une phrase par réglage, chiffres toujours légendés, boutons segmentés plutôt que menus quand 2 à 4 choix suffisent.
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Diagnostic « aucun résultat » : dis quel filtre bloque et propose « Assouplir ce filtre ».
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Mémorisation par personnage + préréglages personnels nommés. Mobile : filtres dans une feuille en bas, compteur et bouton « Lancer » collés en bas.

#### 1.6 Liste de priorité des personnages :
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Liste ordonnée (glisser-déposer + boutons haut/bas, clavier). Option « Respecter la liste de priorité » : en optimisant le personnage de rang k, l'optimiseur ne peut PAS utiliser les artéfacts équipés sur les personnages de rang 1 à k−1 ; il peut utiliser les pièces libres et celles des personnages classés en dessous (avec affichage de l'impact sur eux et proposition de les réoptimiser).
- [ ] 1. LABORATOIRE DE DÉGÂTS (explication complète) · Mode « Optimiser toute la liste » dans l'ordre de priorité, avec passe d'affinage par échanges de pièces. Réglages par personnage : verrouiller son équipement, exclure des pièces, ignorer la priorité, rotation propre.

#### 1.7 Équipes et page Équipe : équipes de 4 personnages, rôles, résonance automatique ; les stats du personnage redeviennent des TABLEAUX ; les compétences sous les splash arts fonctionnent (corrige le bug avec un test) ; les listes (« choisir personnage », « liste… ») utilisent un composant de sélection avec recherche et images ; ne plus afficher les noms de sets ni d'arme des coéquipiers.

#### 1.8 Visuel du laboratoire : très visuel (portraits, icônes d'armes, de sets, de stats, de talents, d'éléments, pièces d'artéfacts en images, barres et graphiques maison lisibles), aux couleurs du thème du personnage, avec les composants du design system du site. États soignés (vide, chargement avec progression, erreur, aucun résultat). Responsive, clavier, `prefers-reduced-motion`.

### 2. CARTES (HSR, WUWA, GENSHIN)
- [ ] 2. CARTES (HSR, WUWA, GENSHIN) · Je te joins `cards.html` : c'est la RÉFÉRENCE ABSOLUE du design des cartes.

#### 2.1 Fidélité : les effets, bordures, cadres, proportions et design de chaque rareté restent EXACTEMENT identiques à `cards.html` (rien n'est « amélioré » ni modernisé). Compare chaque rareté côte à côte avec la référence, avec un test visuel (captures comparées) qui échoue en cas de différence.

#### 2.2 Effets visibles seulement à la consultation : dans le classeur, les cartes sont affichées de façon statique (sans effets animés). Les effets complets (holographique, lueurs, reflets, révélation) ne sont visibles que dans la vue « Visualiser la page » / vue détail, à l'ouverture d'un booster et en consultation individuelle. Ne change pas ce comportement.

#### 2.3 Une illustration DIFFÉRENTE par carte, pour toutes les cartes de Honkai: Star Rail, Wuthering Waves et Genshin : aucune illustration dupliquée entre deux cartes (sauf si un personnage n'a vraiment qu'une seule image disponible : dans ce cas tu me le listes). Construis un audit automatique qui calcule l'empreinte de chaque image, détecte les doublons et les images manquantes, et fournit le rapport `docs/AUDIT-CARTES.md`. Source : `ASTRALIS_CARD_ARTWORKS` (`assets/card-art/<jeu>/<slug>-<n>.webp`). Si des illustrations manquent, cherche-les automatiquement dans les sources autorisées, sinon liste ce qu'il me reste à fournir.

#### 2.4 Images bien formées : cadrage correct dans le cadre de chaque rareté (`object-fit: cover`, point focal sur le visage, proportions respectées, jamais déformées ni étirées ni coupées au mauvais endroit), bonne résolution, repli élégant en cas d'image manquante (jamais d'icône cassée ni de zone vide), réserve d'espace pour éviter les sauts de mise en page, chargement paresseux avec squelette, pré-chargement pendant l'ouverture d'un booster, cache pour éviter les rechargements lors des re-rendus du DOM. Outil de diagnostic `?debug=cards`.

#### 2.5 Mes règles de style (décisions fermes) : texte noir avec fin contour blanc façon Pokémon ; cadres fins et ciselés ; aucun néon, aucun coin arrondi jaune, aucune grille ou motif statique ; effets à l'extérieur de la carte ou sur les bords ; cartes grandes, une ou deux lignes de description sous chaque attaque/talent, sans débordement. Raretés : Common, Super Common, Rare (motifs brillants sur toute la face mais pas dehors, étoiles statiques sans éclat, peu d'étoiles), Epic (effet plus stylé et léger, peu d'étoiles), Full Art (reflets), Groupe, Secrète (contours façon carte Mew full art, effet élégant sans pulsation, aucune faiblesse ni recul), Gold (full art transformée en or), Légende, Astrale, Aeon (style divinité), Armes/Lightcones, et la carte unique « Légende Astrale Éternelle » (Obsidian). Full Art, Secrète, Gold, Légende, Groupe : jamais de splash art. Illustrations : uniquement de vrais artworks officiels HoYoverse ou fournis par moi (jamais de fan arts, ni icônes, ni splash arts comme art de carte). Cartes Énergie simples (éléments Genshin, types et voies HSR), avec un emplacement pour mes images futures. Boosters : 4 couvertures (HSR, Genshin, crossover Genshin/HSR/Wuwa, une variante) avec image au centre et contour de booster.
- [ ] 2. CARTES (HSR, WUWA, GENSHIN) · 2.5bis Quantités visées : 60 Full Art, 30 Groupes, 25 Secrètes, 25 Légendes, 17 Gold, 10 Astrales ; pas de Lauma ; secrètes et légendes sans personnage des gold/astrales/légendes (Rhinedottir est autorisée) ; Huohuo en Gold.

#### 2.6 Vraie customisation de chaque carte : chaque carte a SES attaques, talents et descriptions issus du kit réel du personnage (noms, effets, coûts, faiblesses/résistances selon la règle de la rareté), pas de texte générique commun. Les textes sont générés automatiquement à partir des données du kit (section 11) et passent par le rendu de texte riche (section 7).

#### 2.7 Zéro bug : texte sans débordement (noms longs gérés), effets limités au rectangle de la carte, inclinaison 3D fluide et remise à zéro propre, clavier et lecteurs d'écran, grille de 100+ cartes fluide (`will-change` seulement pendant l'interaction, effets suspendus hors écran et avec `prefers-reduced-motion`), rendu identique dans le classeur, la vue détail, l'ouverture de booster et l'export d'image. Test Playwright : échoue si une image est cassée ou dupliquée, ou si du texte déborde.

### 3. DISCUSSIONS DES COMPAGNONS (BOTS)
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · Personnalise UNE PAR UNE toutes les discussions entre les compagnons (messages à l'arrivée, conversations à plusieurs voix, réactions aux actions, messages de rappel). Chaque personnage a sa voix propre, déduite de son lore et de son comportement (ex. un personnage solennel ne parle pas comme un personnage espiègle), et ses relations propres avec les autres (amitié, rivalité, hiérarchie, taquineries).
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · Les messages doivent être HUMAINS : ponctuation vivante (points de suspension, tirets, parenthèses, exclamations mesurées), expressions familières de la langue, hésitations naturelles, longueurs variées, réactions au contexte (heure, ressources, événements), pas de formules répétitives ni de ton de robot. Aucune phrase générique identique chez deux personnages. Utilise des emojis avec parcimonie ou pas du tout selon le personnage.
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · Données : un fichier par personnage (`companions/<jeu>/<slug>.json`) avec profil (ton, vocabulaire, tics de langage, valeurs), banque de phrases par situation (arrivée, matin, soir, ressources pleines, 50/50 perdu, Capture de radiance, nouvelle bannière, farm terminé, etc.), et dialogues bi-personnages pour chaque paire pertinente. Tout le contenu est écrit réellement (pas de modèle à trous répété), sans contredire le lore (ne pas inventer d'événements du jeu).
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · Un test vérifie : aucun doublon de phrase entre deux personnages, longueur variée, couverture de toutes les situations, aucune balise non interprétée. Tu me livres `docs/COMPAGNONS.md` listant, pour chaque personnage, le résumé de sa voix et le nombre de répliques.
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · L'écran d'accueil avec les compagnons est TOTALEMENT redessiné : plus chaleureux, vrai écran de bienvenue (fond animé aux couleurs du jeu, grand portrait, bulles avec saisie animée, résumé du jour, citations, bouton « Entrer »).
- [ ] 3. DISCUSSIONS DES COMPAGNONS (BOTS) · ÉCRAN DE CHARGEMENT à la connexion : l'ICÔNE DU PROFIL de l'utilisateur est affichée pendant que la page charge (avatar avec anneau de progression animé, nom du profil, phrases d'attente).

### 4. REFONTE TOTALE DE TOUTES LES PAGES (sauf Personnages, Sets, Armes, Calcsheets)
- [ ] 4. REFONTE TOTALE DE TOUTES LES PAGES (sauf Personnages, Sets, Armes, Calcsheets) · Pour TOUTES les pages SAUF Personnages, Sets/Reliques, Armes et Calcsheets (qui gardent leur architecture, mais reçoivent seulement les correctifs listés plus bas), je veux une REFONTE TOTALE du site : une vraie, pas une petite. Nouvelle architecture visuelle et de navigation, pas des retouches.

#### 4.1 Nouveau design system complet (fichier unique de tokens + composants) : nouvelle palette vivante et chaleureuse, sans néon, une couleur par jeu et une par personnage, nouvelle typographie, nouvelles formes et matières, nouveaux mouvements. Composants remplacés : boutons, champs, listes déroulantes personnalisées (recherche + images), onglets, cartes, tuiles, badges, jauges, graphiques, panneaux latéraux, tableaux, états vides, squelettes, notifications. L'accent et les couleurs restent personnalisables, thèmes sombre et clair, `prefers-reduced-motion`.

#### 4.2 Gabarits : Catalogue, Fiche détail, Outil (saisies à gauche, résultats à droite), Tableau de bord (modulaire). Toutes les pages concernées sont migrées.

#### 4.3 Pages concernées (liste à compléter par ton inventaire) : tableau de bord, boosters, classeur, vœux/suivi/épargne, endgame, actualités et calendrier, lore, équipes, builds, laboratoire, plan de farm, matériaux, tâches, notes, favoris, médias, compagnon, réglages, journal de données, import/profil (Akasha, Enka, HoYoLAB), changelog.

#### 4.4 Gros accent sur le design, l'esthétique et les effets : transitions de pages, micro-interactions, chargements soignés, états vides illustrés, couleurs partout, icônes partout.

#### 4.5 ICÔNES PARTOUT : icônes officielles des jeux (Genshin, Honkai: Star Rail, Wuthering Waves) dans les onglets de jeux et le tableau de bord ; icônes d'éléments, d'armes (types), de voies/types HSR, de personnages, de ressources (primogemmes, vœux, résine et équivalents par jeu), de matériaux, de livres de talents (violets et bleus), d'artéfacts. Enregistre-les en local dans `assets/` et utilise un registre central d'icônes.

#### 4.6 Barre du haut : icône du profil, et à droite les montants primogemmes / vœux / résine (équivalents par jeu, icônes exactes) ; menu de gauche qui défile facilement, avec sections repliables et recherche Ctrl+K.

#### 4.7 Défilement : toutes les fiches (personnages, armes, sets, matériaux) défilent correctement (molette, tactile, clavier) sans faire défiler le fond.

#### 4.8 Ajoute du contenu texte utile et de la couleur sur toutes les pages (introductions, aides, conseils, états vides).

### 5. TABLEAU DE BORD SUPER INNOVANT
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Je veux quelque chose de réellement innovant, qui ne ressemble pas à un tableau de bord classique de blocs rectangulaires. Principes obligatoires :
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Mode édition complet : l'utilisateur ajoute, retire, déplace, redimensionne et masque les widgets comme il veut (glisser-déposer), plusieurs dispositions enregistrées. Remplace « Réinitialiser l'accueil » par ce vrai système (réinitialisation discrète).
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Blocs plus petits et dynamiques (taille adaptée au contenu), titres plus petits, bloc « Prochain endgame » réduit.
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Section « Bannières » : « Bannières de personnage » (minuteur de fin à droite, ou minuteur de début si elle n'est pas disponible), dessous les icônes des personnages sur UNE ligne, grandes, sans rareté ni nom ; deux bannières sur une ligne suivante ; même structure pour la bannière d'armes et la bannière à venir. 100 % automatique.
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Objectifs de vœux : réparé et petit. Équipe aléatoire + équipe aléatoire du boss fusionnées (icônes dans des ronds alignés, boss en dessous). « Ma session » et « Compagnon » repensés, plus petits et plus utiles. « Événements à venir » aéré, plus beau. Supprime « Repère du jour ». Vitrine Enka : tous les personnages et leurs builds.
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Idées d'innovation à concevoir (choisis les meilleures, ajoutes-en d'autres) : une scène d'ambiance vivante aux couleurs du jeu et de l'heure ; une frise de la semaine interactive (événements, resets, bannières, endgames) ; un « radar de progression » (collection, vœux, builds, farm) ; une carte de chaleur d'activité ; un assistant qui propose les 3 actions les plus utiles du jour ; widgets d'objectifs avec jauges animées ; un mode « focus » plein écran pour un seul widget ; un mur de personnages réactif ; raccourcis clavier et palette de commandes.
- [ ] 5. TABLEAU DE BORD SUPER INNOVANT · Icônes de jeux, d'éléments, d'armes et de personnages partout dans les widgets.

### 6. PNG DE BUILD ET D'ÉQUIPE (EXTRÊMEMENT BEAUX)
- [ ] 6. PNG DE BUILD ET D'ÉQUIPE (EXTRÊMEMENT BEAUX) · Génère un VRAI design de fiche PNG pour un build personnel ET pour une équipe, extrêmement beau et stylé (qualité « affiche » à partager) : composition soignée, splash art du personnage en fond (ou illustration adaptée), couleurs du thème du personnage, typographie élégante, icônes d'éléments/armes/sets/stats, pièces d'artéfacts en images avec leurs stats, arme, constellation, talents, stats finales, dégâts clés, nom du build et signature de l'utilisateur ; pour l'équipe : les 4 personnages, leurs rôles, la résonance, la rotation en icônes, les dégâts théoriques. Plusieurs modèles au choix (au moins 3 par type), format carré, portrait et paysage, mode sombre/clair, résolution élevée (2x).
- [ ] 6. PNG DE BUILD ET D'ÉQUIPE (EXTRÊMEMENT BEAUX) · Chaque fiche est enregistrée en PNG ET copiée dans le presse-papiers par défaut ; une fonction unique réutilisable sert à toutes les fiches du site (personnages, armes, sets, équipes, builds, tableaux de calcul). Le rendu doit être identique à l'aperçu à l'écran.
- [ ] 6. PNG DE BUILD ET D'ÉQUIPE (EXTRÊMEMENT BEAUX) · Calcsheet (correctifs seulement) : icônes de personnages bien plus grandes, première ligne du tableau personnalisable séparément des cases (taille de police, police, couleur), bordures et tailles de cases revues, export qui conserve les couleurs et pensé pour Google Sheets, fiche PNG du tableau.

### 7. TEXTES DE JEU : BALISES ET FORMATAGE
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · Les descriptions de jeu contiennent des balises et des séquences à interpréter correctement. Exemple à gérer exactement :
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · `<color=#FFD780FF>Attaque normale</color>\nEnchaîne jusqu'à 5 coups d'épée.\n\n<color=#FFD780FF>Attaque chargée</color>\nConsomme de l'endurance pour déclencher deux lames du vent`
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · Écris un module unique `rich-text.js` utilisé partout (kits, cartes, fiches, armes, sets, journal de données, compagnons) qui : applique l'effet de `<color=#RRGGBBAA>…</color>` (couleur réelle, avec gestion du canal alpha et des couleurs du jeu), convertit `\n` en saut de ligne et `\n\n` en paragraphe, gère les autres balises usuelles (`<b>`, `<i>`, `<u>`, `<size=…>`, `<br>`, `<sprite…>`) et les paramètres `{param1:F1P}` / `{PARAM}` (remplacés par les valeurs de niveau, avec formatage en pourcentage ou décimales), affiche les titres de sections (« Attaque normale », « Attaque chargée ») en couleur, et ne laisse JAMAIS apparaître une balise brute à l'écran.
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · Sécurité : aucun HTML brut injecté depuis les sources (analyse en nœuds DOM, liste blanche), pas de XSS.
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · IMPORTANT : le texte doit être rendu par TON module, selon les données, et non copié tel quel depuis un site tiers (aucune copie de mise en page ni de HTML d'un autre site).
- [ ] 7. TEXTES DE JEU : BALISES ET FORMATAGE · Tests : le texte d'exemple ci-dessus donne deux titres en couleur or, des retours à la ligne corrects, et aucune balise visible ; test de balayage de tous les textes de toutes les données qui échoue si une balise `<` ou `{…}` non interprétée reste affichée.

### 8. LORE
- [ ] 8. LORE · Chaque personnage a PLUS de lore : histoire, personnalité, relations, citations, objets, voix, anecdotes, chronologie, factions et régions liées. Continue et enrichis les fiches de lore existantes (personnages ET régions) en prolongeant ce qui existe (même format, même style, plus de profondeur), pas un simple rajout d'une ligne. Répare les fiches de lore boguées (image jointe).
- [ ] 8. LORE · Revois les factions des personnages (données et affichage).
- [ ] 8. LORE · TRAILERS : place les bons trailers officiels (démo de personnage, teaser, bande-annonce de région ou de version) au bon endroit : sur la fiche du personnage concerné ou de la région concernée. Le lien entre personnage et trailer est établi automatiquement à partir de sources vérifiables (titre, personnage, chaîne officielle) et vérifié : le trailer ne doit jamais apparaître sur le mauvais personnage. Intégration respectueuse de la vie privée (lecture au clic, lecteur sans cookies), repli vers un lien si la vidéo est indisponible.
- [ ] 8. LORE · Si une information de lore n'est pas confirmée par une source, ne l'invente pas : badge « Non confirmé ».

### 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · Aucune fonctionnalité existante n'est supprimée (inventaire + vérification finale).
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · Ajoute des fonctionnalités pertinentes aux pages existantes ET crée de nouvelles pages utiles, en m'expliquant dans `docs/NOUVEAUTES.md` l'utilité de chacune (à quoi ça sert, pour qui, comment s'en servir). Idées à évaluer : checklist quotidienne avec compteur de résine et resets, planificateur de primogemmes avec objectif de pity, simulateur de vœux avec probabilités, quêtes et badges du profil, journal de progression avec courbes, comparateur de personnages et d'armes, quiz de lore, calendrier d'anniversaires, assistant de session, échange de cartes entre amis, centre de notifications, mode hors ligne, sauvegarde et synchronisation entre appareils (export/import chiffré, lien partageable).
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · Pages existantes à compléter selon les corrections suivantes :
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Vœux : rétablis les couleurs du suivi des personnages selon les pertes de 50/50 et la haute pity ; après 3 50/50 perdus d'affilée, message indiquant que la Capture de radiance est garantie ; l'utilisateur peut marquer un tirage « 50/50 perdu », « 50/50 gagné » ou « Capture de radiance » (affiché en VIOLET) ; Épargne pleinement fonctionnelle avec graphiques dynamiques, bien proportionnés, qui marchent aussi pour des jours équivalents ; liste-moi les fonctionnalités utiles que tu y ajoutes.
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Endgame : le compteur du Carnage est trop grand et ne fonctionne pas, répare-le, mise à jour automatique depuis une base publique, bouton par endgame pour afficher le prochain (Théâtre, Abysses, Carnage) dès qu'une base le publie ; supprime les étages 9 et 10 de l'Abîme.
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Actualités : redesign complet avec plus de couleurs, calendrier plus compact et 100 % automatique (événements, bannières, endgames avec barres de début à fin sur plusieurs jours), changement de base de données d'événements si nécessaire.
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Plan de farm : propose aussi de farmer des artéfacts (images d'artéfacts), un personnage ajouté au site y apparaît automatiquement, liste de sélection claire (image, nom et SA case par personnage), icônes des livres violets et bleus de Genshin, esthétique améliorée.
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Matériaux : reconnais les matériaux de personnages, d'armes et de mobs à farmer ; chaque fiche affiche les personnages et armes associés (icônes) et les aptitudes concernées ; le texte « Niv. talents » est aéré, avec de la couleur selon le thème du personnage.
- [ ] 9. FONCTIONNALITÉS : RIEN NE DISPARAÎT, ET DE NOUVELLES ARRIVENT · • Personnages (correctifs seulement) : cartes plus carrées avec léger zoom centré, bug Aino/Alhaitham corrigé avec test global, tri du plus récent au plus ancien, contour fin violet (4★) ou orange (5★) à la place des étoiles, suppression de « Importer une image de skin », fiches personnages/artéfacts/sets bien plus belles, fiche qui défile. Armes et Reliques : tout affiché par défaut (liste virtualisée), plus de « Afficher plus », fiches qui défilent.

### 10. IMPORT AUTOMATIQUE, CHANGELOG, AKASHA

#### 10.1 Import automatique : le site se met à jour tout seul à l'import (kits, splash arts, icônes, bannières, événements, endgames, valeurs de talents, textes). Les personnages nouveaux passent par une file de validation. Cause racine à corriger : pourquoi la fiche de La Tsarine affiche son icône au lieu de son splash art, et pourquoi le kit de Danica n'apparaît pas ; corrige le mécanisme (récupération, ordre de repli des sources, cache), sans ajouter ces personnages à la main, avec autant de tests que nécessaire.

#### 10.2 Journal de données : présentation riche de ce qui a changé (icônes des personnages concernés, listes soignées : rouge = retiré/modifié, vert = ajouté/nouveau, pour armes, sets, personnages), calcul automatique par comparaison des anciennes et nouvelles données (stats de base, valeurs d'attaques, passifs de sets, armes, constellations, descriptions), historique par version, filtres.

#### 10.3 Changelog amélioré : fichier versionné, catégories (nouveautés, améliorations, corrections), icônes, couleurs, animations, et une fenêtre « Quoi de neuf » après chaque mise à jour (liste de cartes colorées, formes ludiques, revoyable depuis les réglages).

#### 10.4 Import Akasha : répare-le pour qu'il fonctionne parfaitement, avec de vrais effets (chargement animé et stylé, progression par étapes, révélation des personnages importés) et plus de fonctionnalités : import par UID, tous les personnages et leurs builds, classements et percentiles par attaque, comparaison avec mes builds, historique des importations, export, gestion claire des erreurs (profil privé, UID inconnu, délai dépassé, limite de requêtes) avec message utile. Si un appel nécessite de contourner les restrictions de navigateur (CORS), passe par le serveur local ou une fonction serverless gratuite.

### 11. SOURCES AUTOMATIQUES
- [ ] 11. SOURCES AUTOMATIQUES · Tout ce qui est donnée du jeu arrive par importation automatique depuis des bases publiques (Lunaris, Nanoka Gachabase, bases d'événements, Enka, Akasha, API publiques), configurées dans `import-sources.json`. Aucun personnage ni événement dans le code. Synchronisation au démarrage (au plus toutes les 6 h) + bouton « Synchroniser maintenant » + journal. Une source indisponible ne casse jamais l'appli (délai, nouvelle tentative, message clair). `docs/AUTOMATISATION.md` décrit la source de chaque donnée, la fréquence et le comportement en cas de panne. Les tests utilisent de fausses sources pour prouver chaque automatisme.

### 12. APPLICATION SUR MON IPHONE (GRATUITEMENT)
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Démerde-toi pour que je puisse installer l'application sur mon iPhone, maintenant, SANS RIEN PAYER (pas de compte développeur Apple à 99 €). Fais ce qu'il faut :
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Transforme l'application en PWA installable sur iOS : icônes PNG (180×180 pour `apple-touch-icon`, 192 et 512 pour le manifeste, car iOS ignore le SVG), `manifest.webmanifest` complet, balises `apple-mobile-web-app-*`, `viewport-fit=cover` et marges de zone sûre (encoche, barre du bas), `100dvh`, zones tactiles d'au moins 44 px, aucune dépendance au survol, menu adapté au pouce, service worker et mode hors ligne, démarrage plein écran.
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Hébergement gratuit : l'appli doit être accessible en HTTPS depuis l'iPhone. Étudie ces options gratuites et mets en place la meilleure : (a) GitHub Pages pour la partie statique (workflow GitHub Actions de déploiement automatique à chaque push) ; (b) les appels qui dépendent de `server.py` (HoYoLAB, lore, import, etc.) passent par une fonction serverless gratuite (Cloudflare Workers, Vercel ou Netlify, niveaux gratuits) ou par un hébergement gratuit (Render) ; (c) en secours, accès depuis le réseau local de mon PC, ou tunnel gratuit (Cloudflare Tunnel). Documente les limites de chaque option (mise en veille, quotas) et choisis celle qui fonctionne le mieux sans payer.
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Vérifie le fonctionnement dans un émulateur d'iPhone (Playwright, WebKit) : installation, démarrage, mode hors ligne, aucune erreur.
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Écris `docs/INSTALLER-SUR-IPHONE.md` en français, pas à pas pour un débutant : ouvrir l'adresse dans Safari, Partager, « Sur l'écran d'accueil », comment se mettre à jour, comment sauvegarder ses données (stockage local de l'iPhone) avec export/import et rappel de sauvegarde, et quoi faire en cas de problème.
- [ ] 12. APPLICATION SUR MON IPHONE (GRATUITEMENT) · Aucune clé secrète ni mot de passe dans le dépôt public (utilise les secrets du service ou le fichier d'environnement ignoré).

### 13. VÉRIFICATION FINALE ET PUBLICATION
- [ ] 13. VÉRIFICATION FINALE ET PUBLICATION · Lance toute la suite de tests (moteur de dégâts, optimiseur, rendu de texte, cartes, compagnons, import, PWA), parcours chaque page à plusieurs largeurs (390, 768, 1440 px), thèmes sombre et clair, et corrige jusqu'à ce que tout passe sans erreur console.
- [ ] 13. VÉRIFICATION FINALE ET PUBLICATION · Compare `docs/INVENTAIRE.md` à l'application finale : aucune fonctionnalité perdue.
- [ ] 13. VÉRIFICATION FINALE ET PUBLICATION · Mets à jour `docs/SUIVI.md` (toutes les cases `[x]` ou `[!]` avec raison), `docs/NOUVEAUTES.md`, `docs/AUTOMATISATION.md`, `docs/AUDIT-CARTES.md`, `docs/COMPAGNONS.md`, `docs/INSTALLER-SUR-IPHONE.md`, ainsi que les captures dans `docs/captures/`.
- [ ] 13. VÉRIFICATION FINALE ET PUBLICATION · PUBLIE TOUT sur GitHub (commit final + push), puis donne ta réponse finale selon la règle 10 de la section 0.

## Correctif ciblé 1.0.42 — 8 novembre 2026
- [x] Catalogue Genshin · Le splash remplit le cadre sans liseré droit visible; cadrage du visage conservé. Vérifié par test de contrat CSS/DOM. `da422c59cfc200bca75c1539a99f0ded9ec9eb62`.
- [x] Fiche d'arme · Le type d'arme est représenté par l'icône locale correspondante, avec repli texte si le type ne peut être reconnu. Vérifié par test de contrat. `da422c59cfc200bca75c1539a99f0ded9ec9eb62`.
- [x] Guides et compatibilité Genshin · Parsing des builds Genshin.gg/GenshinFlex tolérant à l'ordre des attributs HTML, normalisation accents/ponctuation, recommandations multi-sources, cache disque et indication honnête de couverture. Vérifié par 7 tests Python et parsing réel (128 entrées Genshin.gg, Mualani GenshinFlex). `da422c59cfc200bca75c1539a99f0ded9ec9eb62`.
- Limite connue : « 100 % » des combinaisons n'est pas garanti par les sites sources; seules leurs recommandations publiées sont affichées, sans inventer de compatibilités.


### Avancement 2026-11-09 — rendu des descriptions de kit
- [~] **Textes de jeu ·** Module src/rich-text.js ajouté avec liste de balises autorisées, échappement du HTML non autorisé, couleurs alpha, retours à la ligne, sprites et substitution des paramètres de niveau 10. La fiche de personnage lui transmet désormais les paramètres du kit; intégration aux autres pages et balayage complet des données restent à faire. Vérification : 36 tests Node et 9 tests Python passent.

### Avancement 2026-11-09 — laboratoire de dégâts, recherche d'attaques
- [~] **Laboratoire ·** Recherche indexée une seule fois dans les talents chargés, accents/casse normalisés, alias anglais et fautes courantes tolérées; ajout direct à la rotation avec icône et sélection du personnage. Styles responsifs et mouvement réduit. Tests ciblés à valider sur vraies données et interface avant de cocher le critère global.
- Version 1.0.44 préparée; les autres chantiers du cahier restent ouverts.
