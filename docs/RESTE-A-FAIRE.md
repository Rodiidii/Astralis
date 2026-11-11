# Ce qui n’est pas terminé — audit du 11 novembre 2026

Périmètre : demandes de ce chat, PDF Mission Astralis et compléments joints. Dernière livraison de code contrôlée : d461ae1. Cet audit ne modifie pas l’application.

Les anciennes cases de SUIVI.md ne sont pas un décompte fiable : certaines sont répétées ou n’ont pas été actualisées après les livraisons. Aucun pourcentage global d’achèvement n’est revendiqué.

## Manques confirmés

### Laboratoire et calculs
- [ ] Yun Jin : bonus de dégâts ajoutés, DEF source dynamique, quotas, éléments d’équipe, constellations et interactions.
- [ ] Lauma : bonus spécifiques Bloom/Hyperbloom/Burgeon/Lunar-Bloom et leurs conditions/consommations.
- [ ] Autres sources de dégâts ajoutés hors Shenhe et Escoffier C2 : inventaire exhaustif et implémentation/test de chacune, notamment Xianyun.
- [ ] Tous les effets de tous les personnages, constellations, armes et raffinements : le répertoire de textes n’est pas un moteur complet de leurs effets.
- [ ] Tous les buffs/debuffs des sets, leurs conditions, règles de cumul et fonctionnement sur/hors terrain vérifiés systématiquement.
- [ ] Formules spécifiques Lunar-Charged, Lunar-Bloom, Lunar-Crystallize, Stellar-Conduct et Stellar Swirl : encore TODO_DATA.
- [ ] Simulation automatique des applications élémentaires, auras et ICD ; actuellement les impacts réagissant sont explicitement renseignés.
- [ ] Rotation d’équipe complète : changements de personnage et statistiques de chacun, déclenchement des buffs/debuffs et coordination des attaques hors terrain.
- [ ] Production automatique de la fanfare depuis les variations de PV, soins et invocations ; actuellement c’est une hypothèse saisie.
- [ ] Génération automatique des attaques supplémentaires de toutes les constellations, notamment celles hors du cas Skirk C0 testé.
- [ ] Branchement complet du moteur et des buffs du laboratoire dans la page Équipe pour calculer réellement tous les dégâts des quatre personnages. Un total renseigné/importé n’est pas une simulation.
- [ ] Optimisation multicœur sur plusieurs Workers avec répartition des branches et partage de la meilleure borne ; un Worker est utilisé actuellement.
- [ ] Affinage global de toute la liste de priorité par échanges de pièces : désactivé explicitement dans le code.
- [ ] Analyse garder/améliorer/jeter et simulation Monte-Carlo de montée des artéfacts non terminées selon le cahier complet.
- [ ] Validation exhaustive des recommandations de sets par personnage, arme, équipe et objectif ; les cartes de recommandations ne prouvent pas ce classement global.
- [ ] Élimination de tout besoin de traduction manuelle des conditions importées de GO/Celestia. Certains chemins/bonus restent à mapper.

La livraison actuelle teste explicitement Éclazur, Furina C2, Escoffier, Mona C4, Shenhe et plusieurs conditions de Skirk. Elle ne certifie pas tous les kits.

### Cartes
- [ ] 1 124 illustrations manquantes sur 1 404 cartes ; 280 illustrations attribuées sans réutilisation selon l’audit actuel.
- [ ] 81 kits manquants dans public/card-kits.json ; l’exigence de texte personnalisé complet n’est donc pas satisfaite pour toutes les cartes.
- [ ] Cadrage/point focal vérifiés individuellement pour toutes les illustrations.
- [ ] Véritable modèle visuel propre pour toutes les catégories supplémentaires : Équipement, Énergie, Aeon et Obsidian réutilisent des modèles existants. Ce n’est pas un design distinct validé pour chacune.
- [ ] Validation stricte du catalogue intégral sans images manquantes. Le test de fidélité des modèles et un audit limité au design ne remplissent pas cette exigence.

### Compagnons et accueil
- [ ] Voix et répliques personnalisées pour tous les personnages des trois jeux ; seulement 15 fichiers de profils Genshin sont présents.
- [ ] Toutes les situations demandées pour chacun : arrivée, matin/soir, ressources pleines, 50/50, Radiance, bannières, fin de farm, etc.
- [ ] Dialogues originaux pour toutes les paires pertinentes, pilotés systématiquement par les preuves du réseau de relations.
- [ ] Audit global d’absence de phrases communes et couverture de toutes les situations.
- [ ] Écran de bienvenue final réunissant grand compagnon, saisie animée, citations, résumé du jour et entrée. L’écran de chargement avec avatar ne constitue pas toute cette demande.

### Akasha, mises à jour et données
- [ ] Import Akasha complet avec classements/percentiles par attaque, comparaison locale, historique et export. Le hub actuel prépare les liens Akasha/Celestia et importe la vitrine Enka.
- [ ] Récupération de tous les personnages/builds d’un compte non exposés par une source publique.
- [ ] File Valider/Modifier/Rejeter des nouveaux personnages.
- [ ] Synchronisation globale de toutes les familles de données et des trois jeux : les flux sont distincts et plusieurs corpus sont générés par des outils séparés.
- [ ] Régénération automatique de toutes les relations et du lore à chaque arrivée de nouvelles répliques/personnages.
- [ ] Diagnostic et test général démontrant qu’un futur cas analogue au splash de la Tsarine ou au kit de Danica est réparé par la chaîne de sources, sans correctif individuel.
- [ ] Journal exhaustif de toutes les valeurs/descriptions de tous les jeux, par version. Un journal de différences Genshin existe, sans garantir cette couverture intégrale.
- [ ] Fenêtre Quoi de neuf complète, automatique et revoyable, alimentée par changelog.json ; ce fichier n’est pas présent.
- [ ] Téléchargement Celestia périodique lorsque le serveur local est fermé. L’automatisation actuelle fonctionne pendant son ouverture.
- [ ] Garantie de récupérer tous les exports et prochaines rotations malgré des sources indisponibles ; les fichiers précédents sont conservés, mais l’indisponibilité n’est pas résolue.

### iPhone
- [ ] Icônes PNG iOS 180/192/512 : le manifeste actuel n’utilise qu’un SVG.
- [ ] Hébergement gratuit HTTPS déployé pour cette application avec les routes dépendant du serveur.
- [ ] Remplacement/hébergement gratuit des fonctions de server.py nécessaires à l’iPhone.
- [ ] Validation WebKit/iPhone de l’installation, du démarrage autonome et du fonctionnement hors ligne.
- [ ] Guide docs/INSTALLER-SUR-IPHONE.md : absent.
- [ ] Parcours complet de sauvegarde/restauration et rappels pour les données locales de l’iPhone.

## Réalisations partielles ou conformité intégrale non démontrée

### Lore et relations
- [~] Les archives contiennent 142 profils, 11 régions et 54 entrées d’événements, mais pas des dossiers de profondeur uniforme avec tous les thèmes demandés pour chacun.
- [~] Histoire, personnalité, objets, anecdotes, citations, voix, chronologie, factions et régions : présence et profondeur à contrôler personnage par personnage.
- [~] Dossiers de tous les événements passés, Shades, Sinners et autres figures : couverture non exhaustive.
- [~] Factions : rattachements historiques/actuels et affichage à vérifier intégralement.
- [~] Trailers : filtrage d’attribution et lecteur au clic présents ; couverture et attribution de tout le catalogue non validées individuellement.
- [~] Relations : 141 identités, 1 124 paires et 4 989 preuves dans le corpus audité ; cela ne prouve pas l’exhaustivité de tous les dialogues du jeu.
- [~] Relations/quête : métadonnées précises, témoignages et catégories de quêtes à compléter là où la source ne les fournit pas.
- [~] Voix et traductions dans toutes les langues sélectionnables : seulement les ressources effectivement présentes sont utilisables.
- [~] Comparaison finale systématique avec la vidéo et toutes les références, notamment les dix paires de contrôle et le mobile : non clôturée.
- [~] Un rang de preuve ou une scène commune ne constitue pas une mesure canonique d’affection ; ne pas présenter le classement comme tel.

### Planètes et tableau de bord
- [~] Les cartes complètes et volumes sont intégrés, mais les frontières sont estimées et le relief dérivé des couleurs/sommets ; ce n’est pas le terrain exact du jeu.
- [~] Villes, monuments et base fatui : représentations simplifiées, placements approximatifs et proportions accentuées ; pas des reproductions fidèles à l’échelle.
- [~] Objets Vie/Temps/Mort : silhouettes extrudées depuis les images ; modèles originaux non récupérés, les liens ayant répondu 403.
- [~] Ampleur/qualité finale des effets par région et fluidité sur la machine de l’utilisateur : pas validées exhaustivement dans toutes les personnalisations, tailles, destinations et configurations.

### Farm
- [~] Progression de niveau : XP/Mora intermédiaires encore interpolées ; farmLevelGoal calcule l’XP depuis la Mora. Table exacte par niveau à substituer.
- [~] Couverture des matériaux, jours de domaine, boss et spécialités pour tous les personnages et futurs ajouts : non certifiée exhaustive.
- [~] Dates fondées sur des rendements moyens et hypothèses ; mobs/couronnes sont supposés disponibles et certaines conversions hebdomadaires supposées possibles.
- [~] Réordonnancement pratique par glisser-déposer des personnages du planning : conformité à la dernière demande à finaliser ; les flèches et le classement existent.

### Vœux
- [~] Les graphes sont basés sur une simulation reproductible de 6 000 essais et des courbes communautaires, pas une énumération exacte de toutes les branches de résultats.
- [~] Gains : histogrammes et comparaison mensuelle en camemberts présents ; comparaison hebdomadaire explicite et écarts +/− semaine/mois non finalisés.
- [~] Les cartes d’exploration alternées et cadeaux de versions demandés comme hypothèse personnelle ne sont plus activés automatiquement ; leur nombre est saisi explicitement. Ce choix diffère de la dernière règle d’autocalcul demandée.

### PNG et calcsheets
- [~] Les cinq fiches de la référence HTML sont intégrées et testées. La demande initiale de trois modèles par type, trois orientations et clair/sombre ne coexiste pas entièrement avec ces modèles : plusieurs options sont verrouillées pour respecter la référence.
- [~] Personnalisation libre de chaque bloc, police et mise en page : pas un éditeur complet.
- [~] Fonction commune pour tous les exports du site : personnages, équipes, builds, labo et farm couverts ; uniformisation totale des fiches armes/sets et tableaux non certifiée.
- [~] Calcsheet : personnalisation séparée en-têtes/cellules, bordures/dimensions et export conservant vraiment les couleurs dans Google Sheets non validés selon le cahier complet.

### Design et validation globale
- [~] Migration totale de toutes les pages vers un design system unique non terminée ; des couches CSS et composants natifs subsistent.
- [~] Tâches, notes, favoris, médias, compagnon, réglages, profil/import et journal n’ont pas tous reçu une refonte complète validée au niveau demandé.
- [~] Registre local exhaustif d’icônes officielles de tous les jeux/données non garanti ; des ressources distantes et replis restent utilisés.
- [~] Virtualisation complète et comportement homogène de tous les catalogues, tous sélecteurs et toutes fiches : vérification finale restante.
- [~] Audit toutes pages à 390/768/1440 px, thèmes clair/sombre, clavier, lecteur d’écran et mouvement réduit : pas de matrice complète publiée.
- [~] Performance sur grands inventaires variés et rotations complexes : le benchmark 1 000/5 000 utilise des pièces identiques largement dédoublonnées ; ce n’est pas un stress test représentatif.
- [~] Audit formel INVENTAIRE initial/final pour prouver qu’aucune fonctionnalité n’a disparu : pas clôturé.
- [~] SUIVI.md, NOUVEAUTES.md et documentation finale : suivi à réconcilier, NOUVEAUTES.md absent, captures avant/après exhaustives non livrées.

Les idées additionnelles du PDF (quiz, badges, comparateurs, synchronisation chiffrée entre appareils, etc.) étaient proposées à évaluer ; elles ne sont pas toutes livrées et ne doivent pas être annoncées comme telles.

## Ce que les tests existants établissent

Les 163 tests JavaScript, 5 tests Python et parcours navigateur exécutés valident les cas qu’ils couvrent. Ils ne constituent ni une garantie de zéro bug ni une certification de toutes les demandes ci-dessus. Cet audit ne reclasse pas comme manquants les correctifs déjà démontrés : Enka, coupes élémentaires, sous-stats, aperçu/export PNG commun des cinq fiches, boutons d’équipe, types de planètes, lunes/objets orbitaux, sélection duo et filtres de régions, notamment.

## Derniers retours utilisateur — suivi de reprise

La version complète à transmettre est [MISSION-AUTONOME-COMPLETE.md](MISSION-AUTONOME-COMPLETE.md). Elle réouvre les corrections artéfacts, farm, rotations/statistiques d’équipe, statistiques du build et luminosité/style de la fiche personnage.

## P0 — Derniers retours utilisateur : corrections à rouvrir en priorité

Ces points priment sur les anciens comptes rendus de livraison. Une case historique cochée ou un test ancien réussi ne suffit pas à les fermer.

- [ ] **P0-ART-01 — Artéfacts en lignes.** Dans l’éditeur de build, les cinq emplacements ne doivent plus former cinq longues colonnes. Faire une ligne horizontale par emplacement (Fleur, Plume, Sablier, Coupe, Diadème) ; la pièce choisie, son image, sa principale et ses sous-stats se lisent dans cette ligne. Conserver les pièces alternatives accessibles sans allonger cinq colonnes côte à côte.
- [ ] **P0-ART-02 — Listes de sets en colonnes.** Les listes/sélecteurs de sets restent verticaux, lisibles, avec recherche et images. Ne pas les transformer en bande horizontale. L’erreur signalée est précisément l’inversion : les sets ont été mis en ligne pendant que les artéfacts sont restés en colonnes.
- [ ] **P0-ART-03 — Vérification de l’agencement.** Capturer avant/après, vérifier les cinq lignes d’artéfacts et les listes verticales de sets sur desktop ; repli mobile cohérent, sans débordement ni perte de sélection.
- [ ] **P0-FARM-01 — Portraits manquants.** L’icône réelle du personnage doit remplacer le placeholder dans le plan de farm : objectifs, priorités, scénarios 0–4 jours et calendrier. Réutiliser les sources d’icônes fiables des équipes ; diagnostiquer URL/identifiant/cache/cadrage, pas masquer le problème par un autre placeholder.
- [ ] **P0-FARM-02 — Refaire les cartes 0/1/2/3/4 jours d’artéfacts.** L’utilisateur dit que leur design n’a pas changé. Nouvelle composition visible et pratique, choix actif net, portraits, dates lisibles par personnage et comparaison compréhensible. Ne pas annoncer une refonte sur la seule base de variables CSS.
- [ ] **P0-FARM-03 — Refaire les blocs EXP/Mora.** L’utilisateur signale également l’absence de changement sur ces blocs. Utiliser ses icônes de livres et Mora, simplifier les champs de stock/besoin/reste et la lecture des sessions. Vérifier les chiffres et leur recalcul.
- [ ] **P0-FARM-04 — Revalider toute la page.** Considérer la page comme non acceptée visuellement. Reprendre les autres exigences de farm ci-dessous : portraits, objectifs compacts, talents individuels, synthèse, priorités, hebdomadaires, calendrier, récoltes, export. Prouver les changements dans la page réellement utilisée, après vérification du serveur et du cache.
- [ ] **P0-TEAM-01 — Icônes de rotation dans la fiche/image d’équipe.** Les vraies icônes NA/CA/E/Q de chaque personnage doivent charger dans la page, l’aperçu et le PNG téléchargé. Distinguer cela de l’icône du personnage. Vérifier le bon personnage/talent ; précharger les fichiers avant capture. En cas d’indisponibilité réelle, repli propre et explicitement testé, sans icône cassée ni emplacement vide.
- [ ] **P0-TEAM-02 — Statistiques plus simples.** Simplifier/améliorer leur présentation dans la fiche d’équipe : statistiques essentielles mises en avant, unités et valeurs cohérentes, grille compacte, détails secondaires dépliables si utile, pas une accumulation de grosses tuiles. Préserver les vraies données et les détails accessibles.
- [ ] **P0-BUILD-01 — Statistiques toujours erronées.** Le dernier message dit exactement « Statistiques du personnage dans son build toujours à » ; la valeur finale n’a pas été écrite. Ne pas inventer « 0 », « 14 k ATQ » ou une autre valeur comme nouvelle observation. Reproduire les anomalies de statistiques déjà signalées, comparer base/arme/artéfacts/sets/buffs/Enka et corriger la cause. Aucun zéro fictif si une donnée manque.
- [ ] **P0-BUILD-02 — Cohérence des vues.** Vérifier les mêmes statistiques dans Mes builds, la fiche personnelle, l’équipe, le laboratoire et le PNG ; contrôler les pourcentages/plats, bonus élémentaires et doubles applications. Tester les changements d’arme, de pièce et de build, puis la persistance après rechargement.
- [ ] **P0-PERSO-01 — Splash trop lumineux.** Réduire l’exposition apparente avec le traitement de la fiche (fond, dégradé, voile, contraste), préserver le visage et l’illustration ; éviter l’effet brûlé/blanchi. Ne pas remplacer par une icône ni retoucher arbitrairement l’art officiel.
- [ ] **P0-PERSO-02 — Finitions visuelles.** Améliorer aussi le reste de la fiche : hiérarchie, tailles de textes, espacements, couleurs, séparations, informations utiles et défilement. Pas seulement assombrir l’image.
- [ ] **P0-QA-01 — Preuves.** Fournir captures comparées de ces quatre pages, inspection des images réellement chargées, résultats numériques de référence, interactions et exports réels. Reprendre les cas qui échouent ; ne pas réutiliser une ancienne capture pour prouver une modification nouvelle.

### Note sur les images mentionnées

Ce dernier retour évoque « image 1 / photo 1 » mais n’ajoute pas de nouvelle pièce jointe dans le message reçu. L’instruction d’agencement ci-dessus est explicite et suffit pour avancer. Les captures historiques du chat peuvent aider si elles sont encore présentes ; ne pas prétendre avoir inspecté une nouvelle photo absente. Ne pas bloquer ces corrections pour redemander une image.

### P0 — Complément laboratoire, pourcentages, optimisation et équipes

Retour utilisateur ajouté après la consolidation : « meilleur design de la page laboratoire + optimisation des calculs %, meilleur calcul d’optimisation... teams... ».

- [ ] **P0-LAB-01 — Vraie refonte du laboratoire.** Repenser composition, hiérarchie, couleurs du personnage, icônes, densité, panneaux de conditions, choix du coup et résultats. Les choix principaux (personnage/build/arme/coup) doivent être faciles à trouver ; résultats et gain compréhensibles sans parcourir une longue page. Réglages experts dépliables, états vide/chargement/aucun résultat/erreur soignés, desktop et mobile. Fournir des captures avant/après ; une nouvelle couleur seule ne clôture pas ce point.
- [ ] **P0-LAB-02 — Calculs et gains en pourcentage fiables.** Réviser les pourcentages de stats, talent, critique, réactions, bonus, réduction de résistance et gains vs référence. Séparer fractions et pourcentages affichés, bonus additifs et multiplicatifs, valeurs plates et pourcentages. Le gain est calculé sur le même coup, le même ennemi, le même mode CRIT et les mêmes conditions : (candidat − référence) / référence × 100 si la référence est strictement positive. Si la référence est nulle/inconnue : afficher un état explicite, pas Infinity, NaN ou 0 % inventé. Une baisse réelle ne devient pas un gain positif artificiel ; les meilleurs candidats doivent être classés correctement. Afficher clairement la référence utilisée et les gains par action/rotation quand disponibles.
- [ ] **P0-LAB-03 — Meilleur calcul d’optimisation.** Réviser l’objectif optimisé, contraintes, conditions d’armes/sets/passifs, nombre d’impacts, quotas et temporisation des effets. L’évaluation d’un candidat doit utiliser les mêmes formules que la vue de calcul et la rotation. Optimisation exacte lorsqu’annoncée exacte ; toute borne/élagage reste valide pour les effets complexes. Progression, annulation, estimation et filtres doivent rester pratiques, sans blocage de l’interface. Comparer top N à une recherche brute, puis mesurer des inventaires variés de 1 000/5 000 pièces et des rotations complexes ; ne pas se contenter de pièces identiques dédoublonnées.
- [ ] **P0-LAB-04 — Optimisation reliée aux équipes.** Utiliser la vraie équipe de quatre personnages, leurs builds, constellations, armes, sets, buffs/debuffs, conditions sur/hors terrain, résonances et rotation. Calculer les contributions individuelles et le total/DPS cohérent. Permettre d’optimiser une action, un personnage dans l’équipe ou l’objectif d’équipe avec les pièces possédées ; respecter priorités/verrous et ne pas attribuer la même pièce à plusieurs personnages. Ne pas présenter une somme de valeurs saisies comme une simulation complète.
- [ ] **P0-LAB-05 — Vérification croisée.** Tests indépendants des %, cas connus sans buff/avec chaque buff/cumul, expiration/quotas/multi-impacts, référence nulle/inconnue, résultats meilleurs et moins bons, cohérence entre calcul direct, optimiseur, rotation, équipe, build et PNG. Le cas Skirk/Éclazur/Furina C2/Escoffier/Mona C4 reste une référence, à compléter par Yun Jin, Lauma et les autres mécaniques.
- [ ] **P0-TEAM-03 — Design et usage de la page Équipes.** Améliorer aussi la page et les fiches d’équipe : composition, sélection/édition des membres, arme/set/pièces, buffs, rotation, statistiques simplifiées et résultats. Boutons et ouvertures doivent fonctionner durablement, sans scintillement. Conserver sauvegarde, import et export. Les icônes des skills de rotation et les statistiques restent soumises aux P0-TEAM-01/02 ; le gain en % et le total doivent correspondre au laboratoire.

