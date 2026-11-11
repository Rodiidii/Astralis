# Mission Astralis — suivi autonome complet

**Consolidation : 11 novembre 2026. Dernière livraison de code connue : d461ae1.**

Ce document réunit les derniers bugs signalés, l’audit des manques, les règles du chat et les demandes originales jointes. Il peut être envoyé seul comme consigne d’une prochaine session, qui travaillera dans le projet indiqué. Les fichiers HTML/images/JSON restent des ressources à lire dans le projet ; ils ne sont pas incorporés artificiellement dans ce texte.

## Message à envoyer avec ce fichier

> Lis ce suivi en entier, vérifie le code réel, puis exécute toute la mission de façon autonome. Commence par les points P0 signalés par l’utilisateur. Ensuite termine les autres chantiers, en réservant le laboratoire à la dernière grande étape fonctionnelle. Conserve les fonctions et données existantes, corrige les causes et teste les vrais parcours/pages/PNG. Mets à jour les cases avec preuves au fur et à mesure. N’annonce pas qu’un point est fini parce qu’un ancien rapport le dit. Les limites de données ou de sources doivent être démontrées et documentées, jamais remplacées par des valeurs inventées.

## Suivi demandé par l’utilisateur

La liste active est désormais **docs/A-FAIRE.md**. Quand un point est réalisé et vérifié, le retirer de ce fichier et inscrire son texte, ses fichiers et ses preuves dans **docs/FAIT.md**. Ne pas supprimer un point partiel ou seulement décrit. Les cases du présent document et de ses annexes sont une référence historique ; elles ne sont pas une seconde liste active.

## Projet et priorité des consignes

- Projet : C:/Users/Ravon/Downloads/Astralis-v96-Genshin/Astralis-v76-Genshin.
- Lire les instructions AGENTS.md applicables et l’état Git courant avant de travailler ; ne pas écraser les changements de l’utilisateur ou une synchronisation automatique.
- Priorité : derniers retours P0 → décisions récentes du chat → référence HTML pour le design concerné → compléments joints → PDF historique. Les rapports sont des preuves à contrôler, pas des autorisations pour ignorer un bug utilisateur.
- Ce suivi ne dit pas que tout manque : repartir de l’existant fonctionnel. Les cases [ ] des annexes anciennes ne sont pas un décompte actuel.
- Ne pas demander le chemin, de confirmation intermédiaire ou des valeurs qu’on peut retrouver. Pour la phrase utilisateur tronquée sur les statistiques, diagnostiquer les données réelles sans inventer la partie absente.
- Les screenshots mentionnés peuvent être temporaires. Leur disparition ne doit pas bloquer une consigne explicite de disposition.
- États : [ ] à traiter ; [~] partiel ; [x] réalisé ET vérifié avec preuve ; [!] impossibilité démontrée et essais documentés. Un manque d’image officielle n’autorise pas un fan art ou un doublon.
- Séparer « décrit dans le répertoire », « implémenté », « testé isolément » et « validé dans l’application ». Aucun de ces états n’implique automatiquement les suivants.
- Conserver les choix récents : Kuro Games officiel autorisé ; absence de Lauma dans le catalogue de cartes, mais Lauma requise dans les calculs du laboratoire ; pas d’image IA pour les planètes.

## Ressources stables du projet

- docs/reference/fiches/fiches-astralis.html : référence des cinq fiches PNG ; originel fourni aussi dans Downloads/fiches-astralis.html.
- docs/reference/cards.html : référence du design des cartes ; provenance cartes-apercu (8).html.
- docs/captures/fiches/ : captures de référence/tests ; ne pas les approuver à nouveau automatiquement pour cacher une régression.
- tests/fixtures/lab-imports/{Skirk,cyno,MavuikaImportMeltTEam}.json : exemples fournis à conserver.
- public/images/farm/{mora-user,hero-exp-user,adventure-exp-user,artifacts-user}.png : icônes de farm fournies.
- docs/AUDIT-CARTES.md, docs/AUDIT-RELATIONS-COUVERTURE.md, docs/TEST-SKIRK.md : audits précédents, à revalider selon les modifications.
- docs/SUIVI.md et docs/RESTE-A-FAIRE.md : historique ; le présent document consolide la reprise et réouvre les corrections signalées depuis.

## Méthode et livraison attendues

1. Inventorier les contrôles/données/options existants avant remplacement ; préserver sauvegardes, pièces et builds.
2. Reproduire chaque P0 dans la vraie application avec le bon serveur et vérifier le cache. Photographier/capturer l’avant.
3. Modifier les fichiers après lecture, traiter les causes d’identifiants/images/calculs/rerendus, pas seulement le symptôme.
4. Donner une vraie refonte aux blocs contestés, avec captures après modification et critères contrôlables.
5. Faire les tests pertinents : moteur/optimiseur/imports, images/overflow, navigation et formulaires, exports PNG téléchargés et presse-papiers, responsive/accessibilité. Ajouter les régressions utiles ; pas de tests qui se contentent de répéter le code.
6. Les données inconnues restent null/Non confirmé ; distinguer estimations/scénarios personnels et faits officiels. Configurer les effets réellement supportés, signaler précisément les autres.
7. Mettre à jour ce suivi par identifiant avec fichiers, résultats, captures et commit. Réconcilier les anciens [x] contredits par un retour utilisateur.
8. Vérifier tous les chantiers hors laboratoire, terminer le laboratoire et ses interactions avec équipes/builds, puis faire la validation globale et publication Git sans force conformément à la demande historique. Ne jamais publier de secrets ou données privées.
9. Bilan final autonome : chaque exigence faite/partielle/non faite avec raison, pas de pourcentage fabriqué à partir de cases dupliquées. Lister les limites réelles et les fichiers à fournir si les sources autorisées ont été épuisées.

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

### P0 — Complément laboratoire, pourcentages, optimisation et équipes

Retour utilisateur ajouté après la consolidation : « meilleur design de la page laboratoire + optimisation des calculs %, meilleur calcul d’optimisation... teams... ».

- [ ] **P0-LAB-01 — Vraie refonte du laboratoire.** Repenser composition, hiérarchie, couleurs du personnage, icônes, densité, panneaux de conditions, choix du coup et résultats. Les choix principaux (personnage/build/arme/coup) doivent être faciles à trouver ; résultats et gain compréhensibles sans parcourir une longue page. Réglages experts dépliables, états vide/chargement/aucun résultat/erreur soignés, desktop et mobile. Fournir des captures avant/après ; une nouvelle couleur seule ne clôture pas ce point.
- [ ] **P0-LAB-02 — Calculs et gains en pourcentage fiables.** Réviser les pourcentages de stats, talent, critique, réactions, bonus, réduction de résistance et gains vs référence. Séparer fractions et pourcentages affichés, bonus additifs et multiplicatifs, valeurs plates et pourcentages. Le gain est calculé sur le même coup, le même ennemi, le même mode CRIT et les mêmes conditions : (candidat − référence) / référence × 100 si la référence est strictement positive. Si la référence est nulle/inconnue : afficher un état explicite, pas Infinity, NaN ou 0 % inventé. Une baisse réelle ne devient pas un gain positif artificiel ; les meilleurs candidats doivent être classés correctement. Afficher clairement la référence utilisée et les gains par action/rotation quand disponibles.
- [ ] **P0-LAB-03 — Meilleur calcul d’optimisation.** Réviser l’objectif optimisé, contraintes, conditions d’armes/sets/passifs, nombre d’impacts, quotas et temporisation des effets. L’évaluation d’un candidat doit utiliser les mêmes formules que la vue de calcul et la rotation. Optimisation exacte lorsqu’annoncée exacte ; toute borne/élagage reste valide pour les effets complexes. Progression, annulation, estimation et filtres doivent rester pratiques, sans blocage de l’interface. Comparer top N à une recherche brute, puis mesurer des inventaires variés de 1 000/5 000 pièces et des rotations complexes ; ne pas se contenter de pièces identiques dédoublonnées.
- [ ] **P0-LAB-04 — Optimisation reliée aux équipes.** Utiliser la vraie équipe de quatre personnages, leurs builds, constellations, armes, sets, buffs/debuffs, conditions sur/hors terrain, résonances et rotation. Calculer les contributions individuelles et le total/DPS cohérent. Permettre d’optimiser une action, un personnage dans l’équipe ou l’objectif d’équipe avec les pièces possédées ; respecter priorités/verrous et ne pas attribuer la même pièce à plusieurs personnages. Ne pas présenter une somme de valeurs saisies comme une simulation complète.
- [ ] **P0-LAB-05 — Vérification croisée.** Tests indépendants des %, cas connus sans buff/avec chaque buff/cumul, expiration/quotas/multi-impacts, référence nulle/inconnue, résultats meilleurs et moins bons, cohérence entre calcul direct, optimiseur, rotation, équipe, build et PNG. Le cas Skirk/Éclazur/Furina C2/Escoffier/Mona C4 reste une référence, à compléter par Yun Jin, Lauma et les autres mécaniques.
- [ ] **P0-TEAM-03 — Design et usage de la page Équipes.** Améliorer aussi la page et les fiches d’équipe : composition, sélection/édition des membres, arme/set/pièces, buffs, rotation, statistiques simplifiées et résultats. Boutons et ouvertures doivent fonctionner durablement, sans scintillement. Conserver sauvegarde, import et export. Les icônes des skills de rotation et les statistiques restent soumises aux P0-TEAM-01/02 ; le gain en % et le total doivent correspondre au laboratoire.

### Note sur les images mentionnées

Ce dernier retour évoque « image 1 / photo 1 » mais n’ajoute pas de nouvelle pièce jointe dans le message reçu. L’instruction d’agencement ci-dessus est explicite et suffit pour avancer. Les captures historiques du chat peuvent aider si elles sont encore présentes ; ne pas prétendre avoir inspecté une nouvelle photo absente. Ne pas bloquer ces corrections pour redemander une image.

## Demandes du chat à conserver en plus du PDF

Le PDF excluait à l’époque tableau de bord/cartes. Les messages distincts du chat les demandent explicitement : ils sont donc inclus dans cette mission globale. Les décisions les plus récentes priment.

### Tableau de bord, widgets et planètes
- [ ] Conserver mode spatial et mode normal sans thème espace ; ajout/retrait/masquage/déplacement/redimensionnement des widgets, plusieurs dispositions, réinitialisation discrète, palette de commandes et focus.
- [ ] Scène recentrée. Clic sur une planète : vraie transition orbitale/caméra, planète visible d’un côté et fiche de l’autre ; positions gauche/droite/haut/bas personnalisables, fiches assez grandes, pas de petit bloc qui impose du scroll inutile.
- [ ] Fond procédural bleu/violet, sans image de galaxie ni image IA ; étoiles, constellations, poussières, champs d’astéroïdes et étoiles filantes visibles et fluides.
- [ ] Une planète par région entière, îles incluses ; planète centrale = toute la carte de Teyvat. Agrandir les terres par rapport à la sphère, avec couleurs géographiques cohérentes ; relief en volume, pas seulement dessiné dans la texture.
- [ ] Planètes de tailles/vitesses différentes, rotation propre et révolution autour du centre ; ne pas se toucher. Personnalisation individuelle des surfaces, couleurs, orbites, tailles, vitesses et effets. Les animations restent visibles pendant la consultation.
- [ ] Mondstadt : vert/bleu, vents visibles sans anneaux, reliefs et ville ; Venti.
- [ ] Liyue : roche/mines jaune/gris, davantage de pics de hauteurs variées, pierres brillantes et astéroïdes dorés ; Zhongli.
- [ ] Inazuma : archipel entier, violet/rose/vert, plusieurs orages dans le style initial, cerisier et pétales, ville ; Raiden.
- [ ] Sumeru : forêt tropicale avec bosquets d’arbres, désert, pyramides et grand arbre, lucioles et tornade de sable localisée ; Nahida.
- [ ] Fontaine : terres/eaux, grandes montagnes et lacs, relief/ville et effet aquatique adapté ; Furina.
- [ ] Mer primordiale : eau seule, bleus variés, courants et fronts de tsunami volumétriques, nuages/pluie allégée et anneaux d’eau ; Neuvillette.
- [ ] Natlan : canyons, savanes, gros volcan avec vraie grosse éruption, lave, fumée et cendres ; Mavuika.
- [ ] Nod-Krai : taïga/toundra/archipels/côtes lunaires, grande base fatui, trois lunes de plans/sens différents, aucune neige ; Columbina.
- [ ] Snezhnaya : plaques de glace, blanc/bleu foncé/gris, tempête de neige sphérique et astéroïdes neigeux, pas de neige distribuée en carré ; Tsarine.
- [ ] Icônes des neuf personnages au même format/source que les équipes, pas d’icônes génériques à leur place.
- [ ] Centre : carte fournie ; blanc extérieur remplacé par #20638C. Trois lunes ET les trois objets Vie/Temps/Mort conservés simultanément, sur des orbites inclinées comme un atome, avec profondeur/occlusion. Ne pas confondre les trois lunes avec les trois objets.
- [ ] Villes/monuments reconnaissables à l’échelle ; vérifier toute promesse de fidélité. Si relief estimé ou modèle original indisponible, documenter précisément la limite au lieu de déclarer une reproduction exacte.
- [ ] Supprimer Mémo rotation, Résumé & priorités, Constellation d’activité et Repère du jour selon les demandes successives.
- [ ] Bannières automatiques : personnages/armes/à venir, minuteur à droite, icônes rondes sur une ligne sans noms ni raretés ; vérifier les deux bannières côte à côte et les portraits.
- [ ] Daily Challenge : équipe aléatoire parmi tous les personnages si aucune sélection, sinon seulement parmi ceux choisis. Fusion cohérente avec le défi/boss.
- [ ] Ma session : outil compact et utile. Événements : images/icônes et présentation aérée. Mur de personnage : personnage Enka et build directement visibles. Endgame : composition détaillée par parties et prochaine rotation quand publiée.

### Cartes : décisions fermes
- [ ] Référence absolue : docs/reference/cards.html. Cadres, proportions, bordures, raretés et effets préservés ; test visuel côte à côte qui échoue en cas de différence. Ne pas moderniser ce design.
- [ ] Classeur statique ; effets complets seulement consultation individuelle/page/booster. Même rendu dans détail, page, booster et export.
- [ ] Art unique pour chaque carte HSR/Genshin/Wuwa ; sources officielles HoYoverse, Kuro Games (explicitement autorisé) ou images fournies ; pas de fan art, icône ou splash de substitution. Pas de duplication sous prétexte de catalogue incomplet.
- [ ] Audit SHA/pixels/doublons/manquants, crédits, recherche autorisée et liste précise des images réellement encore nécessaires. « Une seule image trouvée » ne prouve pas « une seule image existe ».
- [ ] Bon cadrage/visage, cover sans déformation, résolution, squelette, espace réservé, cache/préchargement booster, diagnostic ?debug=cards.
- [ ] Texte noir à fin contour blanc, cadres fins/ciselés, descriptions sous attaques lisibles, aucun débordement ; règles détaillées des raretés dans les messages initiaux et la référence. Ne pas ajouter néon/grille/motif statique/coins jaunes arrondis.
- [ ] Quantités : 60 Full Art, 30 Groupes, 25 Secrètes, 25 Légendes, 17 Gold, 10 Astrales ; pas de Lauma dans ce catalogue de cartes (cette exclusion ne concerne PAS le laboratoire). Huohuo Gold ; exclusions croisées de personnages entre raretés selon le catalogue demandé, Rhinedottir autorisée.
- [ ] Énergie simple avec emplacement pour images futures ; armes/lightcones ; quatre couvertures de boosters HSR/Genshin/crossover/variante ; Obsidian unique.
- [ ] Textes propres au vrai kit de chaque personnage, noms/effets/coûts et règles de rareté, pas un texte générique commun. Accessibilité, 100+ cartes fluides, effets hors écran suspendus, mouvement réduit.

### Équipes, builds et import
- [ ] Corriger durablement scintillement/disparition des équipes, boutons inactifs et listes de sets/pièces qui se referment lors des chargements ; chargements d’images stables, sans boucle placeholder/image/vide.
- [ ] Splashs proportionnés et nets ; statistiques simples et vraies ; sous-stats de toutes les pièces déjà équipées visibles ; artéfacts existants importables dans le build.
- [ ] Import Enka : principales de coupe/sablier/diadème exactes, bonus élémentaires non nuls, sous-stats exactes, pas de double comptage ni ATQ aberrante ; export artifactStatKey et démarrage sans erreur.
- [ ] Propriété : constellation possédée pour chaque personnage et nombre possédé pour chaque arme. Passifs/constellations complets, dont conditions Hexerei ; Aino a son splash adapté.
- [ ] Création de pièce : set/emplacement/principale/sous-stats ; validation structurelle, paliers suspects en diagnostic selon la décision utilisateur, formulaire qui reste ouvert et se réinitialise proprement.
- [ ] Laboratoire : choix NA/CA/plongeante/E/Q et coup précis, multi-impacts corrects, arme directement modifiable, sets autorisés/imposés/exclus et conditions. Inventaire utilisateur par défaut. Liste de priorité pratique avec recherche/position/glisser et option claire. Sauvegarde TC - nom.
- [ ] Cas de validation : Skirk C0 niveau 90, Éclazur R1 niveau 90, Furina C2, Escoffier C0, Mona C4, paramètres modifiables ; tester chaque effet et cumul puis rotation. Inclure Yun Jin, Lauma, Shenhe et toutes les familles de dégâts ajoutés, sans confondre leurs quotas/canaux/conditions.
- [ ] Configs/Team exports JSON fournis et Celestia : téléchargement dans le projet, vérification périodique, badge Nouveau sur ajout/changement jusqu’à consultation, imports persistés et équipe éditable. Les restrictions des sources ne doivent pas effacer les exports valides.

### Farm : règles demandées
- [ ] Stock partagé, priorités par personnage, talents actuels/cibles individuellement ; synthèse 3:1 pour livres et matériaux de monstres APRÈS réservation des besoins de tous les personnages.
- [ ] Priorités : talents, boss normal, EXP, Mora, artéfacts. Hebdomadaires en supplément des journées les moins urgentes, une réclamation par boss/semaine et personnage ; gérer les boss partagés sans inventer des runs supplémentaires.
- [ ] Calendrier : vrais portraits/icônes, philosophies pour les aptitudes, boss normaux/EXP/Mora/artéfacts/hebdomadaires visibles. Plantes hors cases à résine, couronnes non farmables. Repli de liste par défaut, jours valides de talents bleus, jour estimé de fin vert.
- [ ] Scénarios 0–4 jours d’artéfacts/semaine, dates par personnage, recalcul au changement de stock ou de planning manuel ; priorité réordonnable par glisser-déposer.
- [ ] Rendements du scénario utilisateur : 180 résines/jour ; Mora 540 000/jour, EXP environ 1 102 500/jour, boss normal environ 15–16 matériaux/jour ; livres environ 20 verts/18 bleus/2 violets par jour ; hebdomadaire 2–3 matériaux/run, une fois/semaine/boss, coût réel pris en compte.
- [ ] Spécialités : capacité du monde sourcée, repousse 48 h, nombre de passages, stocks partagés, pas de capacité inventée.
- [ ] Coûts exacts d’élévation/EXP et chaque niveau, pas une interpolation depuis la Mora. Les coûts et totaux utilisateur figurent aussi dans l’annexe Buffs/imports/corrections.

Coût d’une aptitude par étape, à vérifier contre les données de jeu :

| Étape | Mora | Livres | Monstres | Hebdo | Couronne |
|---|---:|---|---|---:|---:|
| 1→2 | 12 500 | 3 enseignements | 6 gris | 0 | 0 |
| 2→3 | 17 500 | 2 guides | 3 verts | 0 | 0 |
| 3→4 | 25 000 | 4 guides | 4 verts | 0 | 0 |
| 4→5 | 30 000 | 6 guides | 6 verts | 0 | 0 |
| 5→6 | 37 500 | 9 guides | 9 verts | 0 | 0 |
| 6→7 | 120 000 | 4 philosophies | 4 bleus | 1 | 0 |
| 7→8 | 260 000 | 6 philosophies | 6 bleus | 1 | 0 |
| 8→9 | 450 000 | 12 philosophies | 9 bleus | 2 | 0 |
| 9→10 | 700 000 | 16 philosophies | 12 bleus | 2 | 1 |

Ne pas confondre les totaux talents seuls avec élévation + talents : trois talents 1→10 = 4 957 500 Mora, livres 9/63/114, monstres 18/66/93, 18 hebdo, 3 couronnes.

### Vœux et calendrier
- [ ] Solde = destinées + floor(primos/160), restes conservés. Solde éditable à son emplacement, gains journaliers crédités une seule fois et historisés.
- [ ] Objectifs : pity/garantie/radiance actualisables, seuils personnels 80 perso/65 arme demandés, copies/constellations/raffinements actuels et cibles, ordre de plusieurs objectifs et déficit de garantie. Dates versions/phases estimées jusqu’à 8.8 clairement signalées.
- [ ] Deux graphes (solde réel / réel + estimation), probabilités par objectif, scénarios de pertes de 50/50 et Capture de radiance documentée, pas de garantie inventée.
- [ ] Revenus période : 60/jour +90 si Faveur ; cycle 42 j depuis 04/11/2026 puis 16/12/2026 ; code live +300 le deuxième vendredi avant prochaine MAJ ; +450 à J7 ; +40 à J20 ; boutique 5 vœux le 1er ; Théâtre le 1er et Abysses le 16 avec montants moyens saisis ; événements troisième dimanche +1000, quatrième dimanche +420, cinquième mercredi après lancement +420 ; autres +140/MAJ, +500 et 2 vœux/MAJ ; cartes environ 3000 selon scénario ; cadeaux/multis/primos libres saisissables ; transfert vers graphe théorique.
- [ ] Complément plus récent : exploration un patch sur deux depuis 7.2 (7.3 sans carte, 7.4 avec), multi en 7.4 et deux multis en 8.0. Implémenter comme hypothèses personnelles visibles/modifiables, ne pas les retirer silencieusement sous prétexte qu’elles ne sont pas des annonces officielles.
- [ ] Comparaisons gains semaine/mois avec précédentes périodes et écarts +/− ; journaux et camemberts lisibles.
- [ ] Actualités officielles séparées des sessions/objectifs de farm ; calendrier compact avec plages événements/bannières/endgames, MAJ, compteurs et rafraîchissement ; historiques/prochaines rotations si vraiment publiés, pas de composition copiée pour remplir.

### Lore et réseau : précisions du chat
- [ ] Un seul nœud MC, regroupement des variantes Aether/Lumine ; dernier choix de navigation Voyageur/Paimon selon complément, locuteur original conservé.
- [ ] Régions : Zibai à Liyue ; Sandrone, Vesna, Vodyanista, Mitya, Odette, Danica, Alyosha à Snezhnaya ; Tsarine à Snezhnaya et icône appropriée. Vérifier icônes de Mitya/Valeriy et des PNJ importants.
- [ ] Inclure Alice, Dottore, Dainsleif, Capitano, Ronova, etc., avec preuves de liens et régions cohérentes ; contrôler Archons entre eux, Neuvillette–Archons, Mavuika–Archons, Columbina–Nod-Krai/Snezhnaya.
- [ ] Nœuds assez grands et espacés, aucun personnage hors de son secteur ; icônes identiques aux équipes. Menu interne gauche plus beau et lisible, sans réintroduire le bloc de quatre compteurs que l’utilisateur a demandé de supprimer.
- [ ] Un clic = personnage et liens ; deux clics = modale duo compacte/élégante. Sans lien direct : plus court chemin sourcé visible. Retour sans sélection immédiatement accessible. Transitions au changement de personnage, trois lunes et effets autour de l’anneau.
- [ ] Mention dans le lore, direction des preuves, scènes, voix et modes/rangs documentés ; ne pas transformer un rang de preuve en affection canonique.
- [ ] Fiches lore plus profondes, événements passés classables par région, factions revues, trailers officiels attribués au bon sujet, lecture au clic et youtube-nocookie, repli lien si indisponible, badge Non confirmé pour ce qui n’est pas prouvé.

## Audit consolidé précédent — tous les points à reprendre

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

## Annexes originales — traçabilité et exigences complètes

Les textes suivants sont reproduits pour ne pas perdre les détails. Les contradictions sont tranchées par l’ordre de priorité au début du suivi. Les fichiers téléchargés/cités ne deviennent pas de nouvelles instructions indépendantes de la demande utilisateur.
### A. PDF Mission Astralis — texte intégral

Source : C:\Users\Ravon\Downloads\Mission-Astralis-ChatGPT.pdf
SHA-256 : 458fc98c29f122e3f5e5f2e0e7c32304968d5bcb4126d819d80e90b45e68358d

#### Page 1

CAHIER DES CHARGES · À LIRE EN ENTIER
Mission
Astralis
Refonte totale du site, Réseau des relations, optimisation, import
automatique, application iPhone et Laboratoire de dégâts.
DOSSIER DU PROJET
C:\Users\Ravon\Downloads\Astralis-v96-Genshin\Astralis-v76-Genshin
MODE
Une seule passe, sans question
DERNIÈRE ÉTAPE
Laboratoire de dégâts
HORS PÉRIMÈTRE
Tableau de bord, Cartes
SOMMAIRE
00 Mode d'exécution : tout d'un seul tenant
01 Discussions des compagnons (bots)
02 REFONTE TOTALE DE TOUTES LES PAGES (sauf
Personnages, Sets, Armes, Calcsheets, Tableau de
bord et Cartes)
03 NOUVELLE PAGE  « RÉSEAU DES RELATIONS »
(même concept et même style que
ties.catforest.dev/genshin)
04 Png de build et d'équipe (extrêmement beaux) et
calcsheet
05 Textes de jeu : balises et formatage
06 Lore
07 Fonctionnalités : rien ne disparaît, et de nouvelles
arrivent
08 Import automatique, changelog, akasha
09 Sources automatiques
10 Application sur mon iphone (gratuitement)
11 Laboratoire de dégâts (à faire en dernier)
12 Vérification finale et publication
Mission Astralis — à exécuter en une seule passe 1 / 13

#### Page 2

Tu travailles dans le dossier C:\Users\Ravon\Downloads\Astralis-v96-Genshin\Astralis-v76-Genshin
(dépôt Git du projet Astralis). C'est le bon dossier et le bon dépôt, ne me redemande jamais le chemin.
00Mode d'exécution : tout d'un seul tenant
Ce message est UNE SEULE mission, longue. Tu l'exécutes EN ENTIER, d'une traite, sans t'arrêter entre les
parties, sans me poser de question, sans attendre mon accord et sans me répondre avant la fin. Même si cela
te prend 8 heures ou plus, ce n'est pas un problème : je préfère attendre un travail complet plutôt que recevoir
des morceaux. Il est interdit de livrer « une première partie » ou de t'arrêter sur « il reste à faire ».
ORDRE D'EXÉCUTION : sections 1 à 10 dans l'ordre, puis la section 11 LABORATOIRE DE DÉGÂTS EN
DERNIER, puis la section 12 (vérification finale et publication). Tu finis donc par le laboratoire.
HORS PÉRIMÈTRE : le TABLEAU DE BORD et les CARTES (classeur, boosters, raretés) ne font pas partie de
cette mission (ils ont leurs propres prompts). Tu ne modifies ni leur structure, ni leur contenu ; tu vérifies
seulement qu'ils continuent de fonctionner sans erreur avec le nouveau design system.
Règles :
 Tu AGIS. Aucune excuse, aucun « je ne peux pas », aucune demande de confirmation. Si un point est
ambigu, tu choisis l'option la plus raisonnable, tu la notes dans docs/SUIVI.md , et tu continues.
 Tu ouvres chaque fichier avant de le modifier et tu travailles sur son contenu réel. Si un motif est
introuvable, tu relis le fichier et tu adaptes (réécris le bloc ou la fonction en entier, jamais de remplacement
aveugle).
 MÉMOIRE : tu crées d'abord docs/SUIVI.md  avec CHAQUE point de ce message (sections 1 à 12 en cases
à cocher : [ ]  à faire, [~]  en cours, [x]  fait ET vérifié, [!]  bloqué (raison exacte + ce que tu as
essayé). Tu le relis avant chaque grande étape, tu le mets à jour au fur et à mesure, et tu ne termines pas
tant qu'il reste une case [ ]  ou [~] . Si tu perds le contexte, ce fichier fait foi : « lis docs/SUIVI.md et
reprends à la première case non cochée ».
 Tu NE SUPPRIMES AUCUNE FONCTIONNALITÉ existante. Avant de remplacer une page, tu en fais
l'inventaire (docs/INVENTAIRE.md  : fonctions, boutons, données, options, raccourcis) et tu vérifies à la fin
que tout existe encore, sous une forme identique ou meilleure.
 Aucune donnée de jeu inventée : valeur inconnue = null  + badge « Non confirmé ». Les données
viennent de sources automatiques (voir section 9, jamais écrites à la main dans le code.
 Tu vérifies toi-même (syntaxe, tests automatisés, ouverture réelle de chaque page, console sans erreur,
captures) et tu corriges avant de continuer. Pour chaque bug corrigé, tu ajoutes le test qui l'aurait détecté.
 Tu sauvegardes les fichiers touchés dans _backup_avant_modif/  (dans .gitignore ). Tu respectes la
personnalisation des couleurs par l'utilisateur (variables CSS, accent modifiable).
 Efficacité : lis chaque fichier une fois, applique toutes les modifications qui le concernent d'un coup,
regroupe les commandes, ne répète pas d'explications. Ton code est lui aussi efficace (pas de re-rendus
complets inutiles, caches et index construits une fois).
 GIT : tu fais des commits fréquents (message « type(zone): résumé »), tu pousses (git push , jamais --
force ) après chaque grande section terminée par sécurité, et TU PUBLIES TOUT sur le dépôt GitHub à la
fin (dernier commit + push), sans que je le demande. Jamais de clés, mots de passe ou fichiers inutiles
dans le dépôt. Si le push échoue, donne l'erreur exacte et la commande à lancer, puis continue.
Mission Astralis — à exécuter en une seule passe 2 / 13

#### Page 3

 Ta réponse finale (et seulement elle) contient : le décompte « points faits / total », la liste point par point de
tout ce message avec « fait / pas fait / pourquoi », les fichiers principaux modifiés, comment vérifier en 3
clics, et le hash du dernier commit.
01 Discussions des compagnons (bots)
Personnalise UNE PAR UNE toutes les discussions entre les compagnons (messages à l'arrivée,
conversations à plusieurs voix, réactions aux actions, messages de rappel). Chaque personnage a sa voix
propre, déduite de son lore et de son comportement (ex. un personnage solennel ne parle pas comme un
personnage espiègle), et ses relations propres avec les autres (amitié, rivalité, hiérarchie, taquineries).
Appuie-toi sur les données du « Réseau des relations » (section 3 pour choisir quels personnages se
parlent et de quoi.
Les messages doivent être HUMAINS  ponctuation vivante (points de suspension, tirets, parenthèses,
exclamations mesurées), expressions familières de la langue, hésitations naturelles, longueurs variées,
réactions au contexte (heure, ressources, événements), pas de formules répétitives ni de ton de robot.
Aucune phrase générique identique chez deux personnages. Emojis avec parcimonie ou pas du tout selon
le personnage.
Données : un fichier par personnage (companions/<jeu>/<slug>.json ) avec profil (ton, vocabulaire, tics de
langage, valeurs), banque de phrases par situation (arrivée, matin, soir, ressources pleines, 50/50 perdu,
Capture de radiance, nouvelle bannière, farm terminé, etc.), et dialogues bi-personnages pour chaque
paire pertinente. Tout le contenu est écrit réellement (pas de modèle à trous répété), sans contredire le lore
(ne pas inventer d'événements du jeu).
Un test vérifie : aucun doublon de phrase entre deux personnages, longueur variée, couverture de toutes
les situations, aucune balise non interprétée. Tu me livres docs/COMPAGNONS.md  listant, pour chaque
personnage, le résumé de sa voix et le nombre de répliques.
L'écran d'accueil avec les compagnons est TOTALEMENT redessiné : plus chaleureux, vrai écran de
bienvenue (fond animé aux couleurs du jeu, grand portrait, bulles avec saisie animée, résumé du jour,
citations, bouton « Entrer »).
ÉCRAN DE CHARGEMENT à la connexion : l'ICÔNE DU PROFIL de l'utilisateur est affichée pendant que la
page charge (avatar avec anneau de progression animé, nom du profil, phrases d'attente).
02REFONTE TOTALE DE TOUTES LES PAGES (sauf Personnages, Sets, Armes, Calcsheets, Tableau de bord et Cartes)
Pour TOUTES les pages SAUF Personnages, Sets/Reliques, Armes et Calcsheets (qui gardent leur architecture
mais reçoivent les correctifs listés en section 7, et SAUF le Tableau de bord et les Cartes (hors périmètre), je
veux une REFONTE TOTALE du site : une vraie, pas une petite. Nouvelle architecture visuelle et de navigation,
pas des retouches.
2.1 Nouveau design system complet (fichier unique de tokens + composants)
nouvelle palette vivante et chaleureuse, sans néon, une couleur par jeu et une par personnage, nouvelle
typographie, nouvelles formes et matières, nouveaux mouvements. Composants remplacés : boutons, champs,
listes déroulantes personnalisées (recherche + images), onglets, cartes, tuiles, badges, jauges, graphiques,
Mission Astralis — à exécuter en une seule passe 3 / 13

#### Page 4

panneaux latéraux, tableaux, états vides, squelettes, notifications. L'accent et les couleurs restent
personnalisables, thèmes sombre et clair, prefers-reduced-motion .
2.2 Gabarits
Catalogue, Fiche détail, Outil (saisies à gauche, résultats à droite), Visualisation plein écran (pour le réseau de
relations). Toutes les pages concernées sont migrées.
2.3 Pages concernées (liste à compléter par ton inventaire)
vœux/suivi/épargne, endgame, actualités et calendrier, lore, équipes, builds, plan de farm, matériaux, tâches,
notes, favoris, médias, compagnon, réglages, journal de données, import/profil Akasha, Enka, HoYoLAB,
changelog.
2.4 Gros accent sur le design, l'esthétique et les effets
transitions de pages, micro-interactions, chargements soignés, états vides illustrés, couleurs partout, icônes
partout.
2.5 ICÔNES PARTOUT
icônes officielles des jeux Genshin, Honkai: Star Rail, Wuthering Waves) dans les onglets de jeux ; icônes
d'éléments, d'armes (types), de voies/types HSR, de personnages, de ressources (primogemmes, vœux,
résine et équivalents par jeu), de matériaux, de livres de talents (violets et bleus), d'artéfacts. Enregistre-les en
local dans assets/  et utilise un registre central d'icônes.
2.6 Barre du haut
icône du profil, et à droite les montants primogemmes / vœux / résine (équivalents par jeu, icônes exactes) ;
menu de gauche qui défile facilement, avec sections repliables et recherche Ctrl+K.
2.7 Défilement
toutes les fiches (personnages, armes, sets, matériaux) défilent correctement (molette, tactile, clavier) sans
faire défiler le fond.
2.8 Ajoute du contenu texte utile et de la couleur sur toutes les pages (introductions, aides,
conseils, états vides).
03NOUVELLE PAGE  « RÉSEAU DES RELATIONS » (même concept et même style que ties.catforest.dev/genshin)
Je te joins une capture du site de référence « 原神关系⽹  » (Genshin Relationship Network). Je veux une
nouvelle page d'Astralis EXACTEMENT du même concept et du même style d'effets, en plus complète, plus
exacte et beaucoup plus personnalisable. Tu t'inspires du principe, tu ne copies NI son code, NI ses images, NI
ses textes, NI son nom.
3.1 Concept (d'après la capture et le site de référence) :
Une visualisation en ANNEAU  chaque personnage jouable est un nœud représenté par son icône dans un
cercle, avec un liseré de la couleur de son élément. Les nœuds sont regroupés par région autour du cercle
Mondstadt, Liyue, Inazuma, Sumeru, Fontaine, Natlan, Snezhnaya, Nod-Krai / hors des sept nations), avec
Mission Astralis — à exécuter en une seule passe 4 / 13

#### Page 5

l'icône et le nom de la région en légende sur l'anneau. Fond sombre bleu nuit avec léger scintillement
d'étoiles.
Des LIENS courbes (courbes de Bézier regroupées, façon « edge bundling ») traversent l'intérieur du
cercle, colorés (dégradé entre les couleurs des deux personnages ou de leur élément), semi-transparents,
qui s'allument au survol et à la sélection.
Principe de données : chaque personnage a des répliques vocales sur d'autres personnages (« À propos
de X… »), et les textes d'histoire (quêtes de l'Archon, quêtes de légende, quêtes du monde, événements,
récits de voyageurs, lettres et livres, histoires de personnages) font apparaître des personnages ensemble.
Quand un personnage en mentionne un autre dans ses répliques, un lien est tracé ; les scènes partagées
dans l'histoire créent aussi un lien.
Interactions : cliquer sur UN personnage allume tous ceux qu'il mentionne ; en cliquer un SECOND ouvre la
vue duo (deux avatars face à face, avec ce que chacun dit de l'autre, clips vocaux lisibles quand ils sont
disponibles, et la liste des scènes partagées). Un onglet « Par association » classe, pour un personnage
sélectionné, qui partage le plus de scènes et de répliques avec lui.
Panneau latéral gauche : titre de la page en typographie élégante, champ de recherche (nom ou
surnom/alias, en français et en anglais), texte d'explication, et statistiques calculées automatiquement
(nombre de répliques d'histoire, de quêtes, de personnages jouables, de répliques vocales).
Barre d'outils en haut à droite : partager (lien + export image), réglages, aide, signalement d'erreur de
données.
Chargement animé avec message (« Lecture des répliques… »), état vide, erreurs claires.
3.2 Ce que tu ajoutes (plus complet, plus exact, plus personnalisable) :
MON ÉQUIPE : l'utilisateur choisit une de ses équipes (ou en compose une) et les ICÔNES DE CES
PERSONNAGES sont mises en avant dans le réseau (anneau d'accent, légèrement agrandies, étiquette,
pulsation douce) ; le reste passe en retrait. Un panneau « Entente d'équipe » montre les liens entre les 4
membres (qui parle de qui, nombre de répliques et de scènes), un score de complicité et des citations.
Pour chaque membre, ses liens avec les personnages que l'utilisateur possède.
Mises en page au choix : par région (par défaut), par élément, par type d'arme, par rareté, par version de
sortie, par faction/organisation, ou réseau à forces (force-directed) ; ordre au choix ; taille des nœuds
proportionnelle au nombre de liens ; rayon et espacement réglables.
Filtres : source des liens (répliques vocales / histoire / les deux), direction (qui parle de qui, ou réciproque),
poids minimum, région, élément, version, personnages possédés seulement, masquer les spoilers (cache
les relations issues d'une quête non jouée, au choix de l'utilisateur), langue des citations FR / EN, option «
inclure des PNJ importants » Paimon, Archontes non jouables, etc.).
Apparence personnalisable : thème du fond (nuit étoilée, sombre uni, clair), palette des liens (par élément,
par région, monochrome, couleur d'accent), épaisseur, courbure, opacité, intensité de la lueur, vitesse
d'animation, style des nœuds (icône ronde, hexagone, portrait), affichage ou non des noms et des
légendes de régions. Réglages enregistrés, préréglages nommés, bouton de réinitialisation.
Effets (mêmes que la référence, en plus soignés) : tracé des liens qui s'allument à l'ouverture, éclairage
progressif au survol (le personnage, ses liens et ses voisins se mettent en lumière tandis que le reste
s'atténue), pulsation douce des liens actifs, étoiles en arrière-plan avec léger parallaxe, anneau extérieur
avec graduations, transitions fluides entre mises en page (les nœuds glissent vers leur nouvelle position),
zoom et déplacement à la souris et au tactile.
Fiche personnage intégrée : au clic sur un nœud, un panneau latéral affiche le portrait, l'élément, la région,
la faction, ses relations classées avec citations, un lien vers sa fiche et vers son lore (section 6.
Mission Astralis — à exécuter en une seule passe 5 / 13

#### Page 6

Partage : lien qui conserve l'état (personnages sélectionnés, filtres, mise en page) dans l'adresse, export
PNG de la vue actuelle (avec titre, légende et équipe choisie) enregistré ET copié dans le presse-papiers.
3.3 Exactitude des données (point critique : aucune relation inventée) :
Un lien existe SEULEMENT s'il s'appuie sur une preuve textuelle (réplique vocale, ligne de dialogue de
quête, texte d'histoire). Chaque lien conserve ses preuves : type, citation, identifiant de la source, langue,
quête ou réplique d'origine, et compteur. Aucune relation « devinée ».
Sources : données de jeu ouvertes AnimeGameData, genshin-db, Project Amber, Lunaris/Nanoka), textes
en français quand ils existent. Pipeline automatique tools/build-relations.*  qui génère
data/relations.json  à partir des répliques vocales et des dialogues de quête.
Détection des mentions : dictionnaire d'alias par personnage (noms, surnoms, titres : ex. Childe/Tartaglia,
Le Voyageur/Aether/Lumine, noms de famille ou de faction), correspondance sur des mots entiers,
exclusion des homonymes et mots courants qui ne désignent pas le personnage, gestion de la ponctuation
et des accents. Les titres de répliques « À propos de X » donnent des liens directs fiables.
Scènes partagées : un lien d'histoire ne se crée que si les deux personnages parlent ou sont explicitement
nommés dans la même scène/quête, avec un poids selon le nombre de scènes.
Tests : jeu de relations connues avec preuves vérifiées à la main (ex. paires célèbres) qui doit être retrouvé
; échantillon aléatoire de 50 liens relu et consigné dans docs/AUDIT-RELATIONS.md  (citation + source +
verdict) ; test qui échoue si un lien n'a aucune preuve ; test de non-régression sur les homonymes.
Mise à jour automatique : à chaque synchronisation (section 9, un nouveau personnage ou de nouvelles
répliques apparaissent sur l'anneau et dans les liens sans modification du code, avec badge « Non
confirmé » si les données sont partielles.
3.4 Performance et accessibilité :
Rendu Canvas 2D (ou WebGL avec couche de fond mise en cache, regroupement des courbes précalculé
dans un Web Worker, détection du survol par grille spatiale, 60 images/s avec plus de 150 nœuds et
plusieurs milliers de liens, zoom/déplacement fluides (souris et pincement tactile).
Alternative accessible : vue « liste » équivalente (tableau triable des relations), navigation au clavier entre
les nœuds, libellés pour lecteurs d'écran, prefers-reduced-motion  (animations réduites), contrastes
suffisants, mobile utilisable (panneaux en feuille basse).
Intégration : lien depuis les fiches de personnages et de lore, depuis les équipes (« Voir l'entente d'équipe
»), et données réutilisées par les compagnons (section 1.
04Png de build et d'équipe (extrêmement beaux) et calcsheet
Génère un VRAI design de fiche PNG pour un build personnel ET pour une équipe, extrêmement beau et
stylé (qualité « affiche » à partager) : composition soignée, splash art du personnage en fond, couleurs du
thème du personnage, typographie élégante, icônes d'éléments/armes/sets/stats, pièces d'artéfacts en
images avec leurs stats, arme, constellation, talents, stats finales, dégâts clés, nom du build et signature de
l'utilisateur ; pour l'équipe : les 4 personnages, leurs rôles, la résonance, la rotation en icônes, les dégâts
théoriques. Plusieurs modèles au choix (au moins 3 par type), formats carré, portrait et paysage, mode
sombre/clair, résolution élevée (2x).
Chaque fiche est enregistrée en PNG ET copiée dans le presse-papiers par défaut ; une fonction unique
réutilisable sert à toutes les fiches du site (personnages, armes, sets, équipes, builds, tableaux de calcul).
Le rendu est identique à l'aperçu à l'écran.
Mission Astralis — à exécuter en une seule passe 6 / 13

#### Page 7

Calcsheet (correctifs seulement) : icônes de personnages bien plus grandes, première ligne du tableau
personnalisable séparément des cases (taille de police, police, couleur), bordures et tailles de cases
revues, export qui conserve les couleurs et pensé pour Google Sheets, fiche PNG du tableau.
05Textes de jeu : balises et formatage
Les descriptions de jeu contiennent des balises et des séquences à interpréter correctement. Exemple à gérer
exactement :
<color=#FFD780FF>Attaque normale</color>\nEnchaîne jusqu'à 5 coups d'épée.\n\n<color=#FFD780FF>Attaque
chargée</color>\nConsomme de l'endurance pour déclencher deux lames du vent
Écris un module unique rich-text.js  utilisé partout (kits, fiches, armes, sets, journal de données,
compagnons, relations) qui : applique l'effet de <color=#RRGGBBAA>…</color>  (couleur réelle, avec gestion
du canal alpha et des couleurs du jeu), convertit \n  en saut de ligne et \n\n  en paragraphe, gère les
autres balises usuelles (<b> , <i> , <u> , <size=…> , <br> , <sprite…> ) et les paramètres {param1:F1P}  /
{PARAM}  (remplacés par les valeurs de niveau, avec formatage en pourcentage ou décimales), affiche les
titres de sections (« Attaque normale », « Attaque chargée ») en couleur, et ne laisse JAMAIS apparaître
une balise brute à l'écran.
Sécurité : aucun HTML brut injecté depuis les sources (analyse en nœuds DOM, liste blanche), pas de XSS.
IMPORTANT  le texte est rendu par TON module, selon les données, et non copié tel quel depuis un site
tiers (aucune copie de mise en page ni de HTML d'un autre site).
Tests : le texte d'exemple ci-dessus donne deux titres en couleur or, des retours à la ligne corrects, et
aucune balise visible ; test de balayage de tous les textes de toutes les données qui échoue si une balise
<  ou {…}  non interprétée reste affichée.
06Lore
Chaque personnage a PLUS de lore : histoire, personnalité, relations, citations, objets, voix, anecdotes,
chronologie, factions et régions liées. Continue et enrichis les fiches de lore existantes (personnages ET
régions) en prolongeant ce qui existe (même format, même style, plus de profondeur), pas un simple rajout
d'une ligne. Répare les fiches de lore boguées (image jointe).
Revois les factions des personnages (données et affichage).
TRAILERS  place les bons trailers officiels (démo de personnage, teaser, bande-annonce de région ou de
version) au bon endroit : sur la fiche du personnage ou de la région concernée. Le lien personnage ↔
trailer est établi automatiquement à partir de sources vérifiables (titre, personnage, chaîne officielle) et
vérifié : un trailer n'apparaît jamais sur le mauvais personnage. Intégration respectueuse de la vie privée
(lecture au clic, lecteur sans cookies), repli vers un lien si la vidéo est indisponible.
Si une information de lore n'est pas confirmée par une source, ne l'invente pas : badge « Non confirmé ».
07Fonctionnalités : rien ne disparaît, et de nouvelles arrivent
Aucune fonctionnalité existante n'est supprimée (inventaire + vérification finale).
Mission Astralis — à exécuter en une seule passe 7 / 13

#### Page 8

Ajoute des fonctionnalités pertinentes aux pages existantes ET crée de nouvelles pages utiles (dont le
Réseau des relations), en m'expliquant dans docs/NOUVEAUTES.md  l'utilité de chacune (à quoi ça sert, pour
qui, comment s'en servir). Idées à évaluer : checklist quotidienne avec compteur de résine et resets,
planificateur de primogemmes avec objectif de pity, simulateur de vœux avec probabilités, quêtes et
badges du profil, journal de progression avec courbes, comparateur de personnages et d'armes, quiz de
lore, calendrier d'anniversaires, assistant de session, centre de notifications, mode hors ligne, sauvegarde
et synchronisation entre appareils (export/import chiffré, lien partageable).
Corrections par page :
Vœux : rétablis les couleurs du suivi des personnages selon les pertes de 50/50 et la haute pity ; après
3 50/50 perdus d'affilée, message indiquant que la Capture de radiance est garantie ; l'utilisateur peut
marquer un tirage « 50/50 perdu », « 50/50 gagné » ou « Capture de radiance » (affiché en VIOLET ;
Épargne pleinement fonctionnelle avec graphiques dynamiques, bien proportionnés, qui marchent aussi
pour des jours équivalents ; liste-moi les fonctionnalités utiles que tu y ajoutes.
Endgame : le compteur du Carnage est trop grand et ne fonctionne pas, répare-le, mise à jour
automatique depuis une base publique, bouton par endgame pour afficher le prochain Théâtre,
Abysses, Carnage) dès qu'une base le publie ; supprime les étages 9 et 10 de l'Abîme.
Actualités : redesign complet avec plus de couleurs, calendrier plus compact et 100 % automatique
(événements, bannières, endgames avec barres de début à fin sur plusieurs jours), changement de
base de données d'événements si nécessaire.
Plan de farm : propose aussi de farmer des artéfacts (images d'artéfacts), un personnage ajouté au site
y apparaît automatiquement, liste de sélection claire (image, nom et SA case par personnage), icônes
des livres violets et bleus de Genshin, esthétique améliorée.
Matériaux : reconnais les matériaux de personnages, d'armes et de mobs à farmer ; chaque fiche
affiche les personnages et armes associés (icônes) et les aptitudes concernées ; le texte « Niv. talents
» est aéré, avec de la couleur selon le thème du personnage.
Personnages (correctifs seulement) : cartes plus carrées avec léger zoom centré, bug Aino/Alhaitham
corrigé avec test global, tri du plus récent au plus ancien, contour fin violet 4★) ou orange 5★) à la
place des étoiles, suppression de « Importer une image de skin », fiches personnages/artéfacts/sets
bien plus belles, fiche qui défile. Armes et Reliques : tout affiché par défaut (liste virtualisée), plus de «
Afficher plus », fiches qui défilent.
08Import automatique, changelog, akasha
8.1 Import automatique
le site se met à jour tout seul à l'import (kits, splash arts, icônes, bannières, événements, endgames, valeurs de
talents, textes, répliques et relations). Les personnages nouveaux passent par une file de validation. Cause
racine à corriger : pourquoi la fiche de La Tsarine affiche son icône au lieu de son splash art, et pourquoi le kit
de Danica n'apparaît pas ; corrige le mécanisme (récupération, ordre de repli des sources, cache), sans ajouter
ces personnages à la main, avec autant de tests que nécessaire.
8.2 Journal de données
présentation riche de ce qui a changé (icônes des personnages concernés, listes soignées : rouge =
retiré/modifié, vert = ajouté/nouveau, pour armes, sets, personnages), calcul automatique par comparaison
des anciennes et nouvelles données (stats de base, valeurs d'attaques, passifs de sets, armes, constellations,
descriptions), historique par version, filtres.
Mission Astralis — à exécuter en une seule passe 8 / 13

#### Page 9

8.3 Changelog amélioré
fichier versionné, catégories (nouveautés, améliorations, corrections), icônes, couleurs, animations, et une
fenêtre « Quoi de neuf » après chaque mise à jour (liste de cartes colorées, formes ludiques, revoyable depuis
les réglages).
8.4 Import Akasha
répare-le pour qu'il fonctionne parfaitement, avec de vrais effets (chargement animé et stylé, progression par
étapes, révélation des personnages importés) et plus de fonctionnalités : import par UID, tous les personnages
et leurs builds, classements et percentiles par attaque, comparaison avec mes builds, historique des
importations, export, gestion claire des erreurs (profil privé, UID inconnu, délai dépassé, limite de requêtes). Si
un appel nécessite de contourner les restrictions de navigateur CORS, passe par le serveur local ou une
fonction serverless gratuite.
09Sources automatiques
Tout ce qui est donnée du jeu arrive par importation automatique depuis des bases publiques Lunaris, Nanoka
Gachabase, bases d'événements, Enka, Akasha, données de jeu ouvertes), configurées dans import-
sources.json . Aucun personnage ni événement dans le code. Synchronisation au démarrage (au plus toutes
les 6 h) + bouton « Synchroniser maintenant » + journal. Une source indisponible ne casse jamais l'appli (délai,
nouvelle tentative, message clair). docs/AUTOMATISATION.md  décrit la source de chaque donnée, la fréquence et
le comportement en cas de panne. Les tests utilisent de fausses sources pour prouver chaque automatisme.
10Application sur mon iphone (gratuitement)
Démerde-toi pour que je puisse installer l'application sur mon iPhone, SANS RIEN PAYER (pas de compte
développeur Apple à 99 €. Fais ce qu'il faut :
Transforme l'application en PWA installable sur iOS  icônes PNG 180180 pour apple-touch-icon , 192 et
512 pour le manifeste, car iOS ignore le SVG, manifest.webmanifest  complet, balises apple-mobile-web-
app-* , viewport-fit=cover  et marges de zone sûre (encoche, barre du bas), 100dvh , zones tactiles d'au
moins 44 px, aucune dépendance au survol, menu adapté au pouce, service worker et mode hors ligne,
démarrage plein écran.
Hébergement gratuit en HTTPS. Étudie ces options et mets en place la meilleure : (a) GitHub Pages pour la
partie statique (workflow GitHub Actions de déploiement à chaque push) ; (b) les appels qui dépendent de
server.py  HoYoLAB, lore, import, etc.) passent par une fonction serverless gratuite Cloudflare Workers,
Vercel ou Netlify, niveaux gratuits) ou par un hébergement gratuit Render) ; (c) en secours, accès depuis
le réseau local de mon PC, ou tunnel gratuit Cloudflare Tunnel). Documente les limites (mise en veille,
quotas) et choisis celle qui marche le mieux sans payer.
Vérifie le fonctionnement dans un émulateur d'iPhone Playwright, WebKit) : installation, démarrage, mode
hors ligne, aucune erreur.
Écris docs/INSTALLER-SUR-IPHONE.md  en français, pas à pas pour un débutant : ouvrir l'adresse dans Safari,
Partager, « Sur l'écran d'accueil », comment se mettre à jour, comment sauvegarder ses données
(stockage local de l'iPhone) avec export/import et rappel de sauvegarde, et quoi faire en cas de problème.
Aucune clé secrète ni mot de passe dans le dépôt public (secrets du service ou fichier d'environnement
ignoré).
Mission Astralis — à exécuter en une seule passe 9 / 13

#### Page 10

11 Laboratoire de dégâts (à faire en dernier)
Le « Laboratoire de dégâts » est une page unique qui regroupe trois outils partageant les mêmes données : A
un moteur de dégâts avec rotations et comparaison avant/après, B un optimiseur d'artéfacts à partir de
l'inventaire de l'utilisateur, C une liste de personnages classés par priorité. Le but : être plus exact, plus
transparent, plus rapide et plus beau que Genshin Optimizer et que l'outil de référence « Little Bro » (dont je te
joins des captures). Tu t'inspires du principe d'usage de cet outil, tu ne copies NI son code, NI ses images, NI
son nom, NI sa mise en page à l'identique.
11.1 Ce que montre l'outil de référence (captures) :
Navigation équipes → personnage, avec deux boutons « Loadout » / « Build équipé » et quatre onglets 
Vue d'ensemble, Talents, Optimiser, Amélioration d'artéfacts.
Colonne gauche : portrait, niveau, constellation, étoiles, les 6 pièces d'équipement (arme  5 artéfacts) en
miniatures avec niveau et stat principale, stats de base et bonus, stats bonus modifiables.
Colonne centrale (filtres) : niveau d'artéfact (curseur + compteur), stat principale par emplacement avec
des pastilles de comptage, assistance de niveau de stat principale.
Colonne droite : configuration des sets 2 pièces, 4 pièces, arcs-en-ciel, effets conditionnels),
configuration des artéfacts équipés ailleurs, contraintes minimales, case « exclure des artéfacts », case «
utiliser les artéfacts des builds actifs des coéquipiers », case « autoriser les builds partiels ».
Choix de la cible : une attaque précise du personnage (ex. compétence élémentaire + type de dégâts),
exclusions, bouton « Générer des builds ».
Résultats : plusieurs builds classés, pièces en images, boutons « Nouveau build » / « Équiper au build
actuel », bascule dégâts sans crit / moyens / crit, choix de la réaction (ex. Évaporation), liste des dégâts
par attaque, réactions transformatives, comparaison avec une cible graphique.
Ses défauts à corriger : filtres trop denses, pastilles et chiffres non expliqués, libellés mélangés
anglais/français, menus déroulants rouges peu lisibles, rien n'indique ce qui coûte du temps de calcul, pas
de résumé des filtres actifs.
11.2 Le moteur de dégâts (damage-engine.js , module pur sans DOM, entièrement testé) :
Formule  Dégâts  DégâtsDeBase × 1  Bonus de dégâts)  MultCrit  MultDEF  MultRES  MultRéaction
(+ termes additifs). Chaque terme est calculé séparément et affichable.
Base  % du talent × stat de référence ATQ, PV, DÉF ou MÎ  dégâts plats. Stat finale = base × 1  % 
plat.
Crit : trois cas (sans crit, crit, moyen  1  min(TauxCrit, 1  DgtCrit).
DEF  Nv_perso  100 / Nv_perso  100  Nv_ennemi  100  1  réduction DEF  1  ignorance
DEF.
RES  si RES  0  1  RES/2 ; 0  RES  75 %  1  RES ; RES  75 %  1/4·RES  1.
Réactions amplifiantes Vaporisation, Fonte) : multiplicateur de base × 1  2,78·MÎ/MÎ  1400  bonus de
réaction).
Réactions additives Intensification, Propagation) : ajout aux dégâts de base, avec la table de niveau et la
MÎ.
Réactions transformatives Surcharge, Supraconduction, Électro-Charge, Brisé, Tourbillon, Floraison,
Hyperfloraison, Fleur ardente, Brûlure, et les réactions Lunaires de la version courante) : coefficient × table
de niveau × 1  16·MÎ/MÎ  2000  bonus)  RES, sans crit sauf exception documentée.
Mission Astralis — à exécuter en une seule passe 10 / 13

#### Page 11

Vérifie les mécaniques de la version courante du jeu et signale tout écart avec ce que tu sais.
N'invente JAMAIS une valeur (multiplicateurs de talent, tables de niveau, effets d'armes ou de sets).
Charge les données depuis une source ouverte (genshin-db, Project Amber, AnimeGameData) ou marque
TODO_DATA  visible dans l'interface.
Gère : snapshot vs buffs dynamiques, durées et uptime, stacks, résonances élémentaires, buffs d'équipe
configurables, niveau et RES de l'ennemi réglables avec préréglages (monstre niveau 100, Abîme, boss,
Domaines).
Tests : au moins 15 cas avec valeurs de référence calculées à la main (un par type de réaction, DEF réduite,
RES négative et  75 %, crit/non-crit, stats limites). Tu montres le calcul de référence dans le test.
11.3 Rotation et comparaison avant/après :
Rotation = timeline d'actions représentées par des ICÔNES (attaque normale, chargée, plongeante,
compétence, déflagration, réactions, buffs ON/OFF avec durée), glisser-déposer, répétable N fois, temps
total saisi ou calculé. Un cercle de la couleur du thème du personnage entoure chaque icône. Sortie :
dégâts par action, total, DPS.
Recherche par attaque : une barre de recherche cherche dans les noms d'attaques et de talents de TOUS
les personnages (français et anglais, sans accents ni casse, tolérante aux fautes), affiche l'icône, le nom, le
personnage associé et un bouton « Ajouter à la rotation ». Index construit une seule fois.
Comparaison avant/après : build actuel contre build modifié (une pièce, l'arme, un set). Delta absolu et en
%, barres avant/après, décomposition en cascade des gains par stat.
Sensibilité : valeur marginale de 1 % Taux Crit, 1 % DGT Crit, 10 MÎ, 1 roll, classée par gain.
« Voir le détail » : chaque terme de la formule pour une action, pour pouvoir vérifier le calcul.
Alertes  Recharge d'énergie insuffisante, buffs mal superposés, donnée TODO_DATA .
Bouton « Dégâts théoriques » d'une équipe : calcul sur un monstre niveau 100, une couleur de texte
différente par réaction élémentaire, choix de l'affichage (sans réaction, Fonte, Vaporisation, Intensification,
Propagation…), dégâts d'Hyperfloraison et autres transformatives, bouton Déplier/Replier qui cache les
détails de l'équipe (replié : icônes des personnages + nom de l'équipe).
11.4 Optimiseur d'artéfacts (optimum garanti, recherche optimisée) :
Import de l'inventaire : format GOOD Genshin Optimizer), JSON Astralis, scanners courants, saisie
manuelle ; aperçu avant import, détection des doublons, validation (pièces impossibles signalées  3 ou 4
sous-stats initiales, aucune sous-stat identique à la principale, montées à 4/8/12/16/20.
Tables d'artéfacts 5★ à vérifier contre ta source (la source gagne, tu me signales l'écart) : stats principales
niveau 20 PV 4780, ATQ 311, ATQ/PV % 46,6, DÉF % 58,3, MÎ 187, Recharge 51,8, Taux Crit 31,1, DGT Crit
62,2, bonus élémentaire 46,6, physique 58,3, soins 35,9 ; sous-stats, roll maximal PV 298,75 ; ATQ 19,45 ;
DÉF 23,15 ; PV/ATQ % 5,83 ; DÉF % 7,29 ; MÎ 23,31 ; Recharge 6,48 ; Taux Crit 3,89 ; DGT Crit 7,77 avec les
paliers 70/80/90/100 %.
Objectifs : une rotation, une action unique, DPS, PV effectifs, soins, pondération personnalisée.
Algorithme (recherche exacte mais qui évite tout calcul inutile) :
 pré-filtrage par emplacement : suppression des pièces dominées, conservation des seules stats qui
influencent l'objectif, dédoublonnage des pièces à vecteur de stats identique ;
 regroupement par configuration de set 4 pièces, 22, hors-set) : bonus calculé une seule fois par
configuration ;
Mission Astralis — à exécuter en une seule passe 11 / 13

#### Page 12

 branch and bound : emplacements ordonnés par taille de pool croissante, borne supérieure = stats
partielles + maximum possible des emplacements restants (maxima suffixes précalculés), coupe de la
branche si la borne ≤ k-ième meilleur score ;
 élagage de faisabilité par les contraintes Recharge min., Taux Crit max/min, PV/DÉF/MÎ min.) ;
 démarrage à chaud avec l'équipement actuel comme première borne, tri heuristique des pièces ;
 boucle interne sans allocation (tableaux typés, sommes incrémentales, évaluateur réduit qui prend le
vecteur de stats déjà additionné) ;
 Web Workers (cœurs  1, répartition par blocs du premier emplacement, partage de la meilleure borne,
progression et annulation instantanée ;
 avant lancement : estimation du nombre de combinaisons ; après : nœuds visités, branches élaguées %,
pièces éliminées, temps ;
 tests comparant l'optimiseur élagué à une recherche brute sur de petits inventaires (top N identique) +
banc de performance 1 000 et 5 000 artéfacts.
Résultats : top N, pièces en images, stats finales, gain vs équipement actuel (en % et par action), «
pourquoi cette combinaison » (les 3 stats déterminantes), bouton « Appliquer au build », option « Nouveau
build ».
Analyse d'artéfacts : qualité par pièce, conseil garder/améliorer/jeter justifié, simulation Monte-Carlo à
graine fixe pour les pièces non montées au niveau 20. Aide au farm : quel set et quel Domaine rapportent le
plus.
11.5 FILTRES FACILES (point essentiel
un novice obtient un bon résultat en 3 clics, un expert garde tout) :
Niveau 1 toujours visible : objectif (quelle attaque ou quelle rotation), préréglage « Rapide / Équilibré /
Précis » (chacun décrit en une phrase), bouton « Lancer ».
Niveau 2 « Personnaliser » : niveau des artéfacts (trois boutons : « Niveau 20 seulement », « 16 et plus », «
Tous »), stats principales (seulement pour sablier, coupe, couronne, en icônes à cocher avec le nombre de
pièces), sets (grille d'images à trois états : autorisé / imposé / exclu, triée par pertinence), type de
configuration 4 pièces, 22, arc-en-ciel) en une rangée de boutons, pièces utilisables (non / seulement
celles des personnages classés en dessous dans ma liste / oui), contraintes minimales (curseurs avec
repère de la valeur actuelle et indicateur atteignable/impossible).
Niveau 3 « Avancé » : exclusions fines, pièces verrouillées une par une.
Intelligence par défaut : l'outil sélectionne les stats utiles à l'objectif, masque les inutiles, propose les sets
pertinents, pré-remplit la Recharge minimale d'après la rotation.
Compteur en direct : « X artéfacts retenus sur Y, environ Z combinaisons, durée estimée W s », mis à jour à
chaque changement avec le gain de temps (« exclure les niveaux 0 à 11 retire 120 pièces et divise le temps
par 3 »).
Résumé des filtres actifs en pastilles amovibles + « Tout réinitialiser » + « Annuler ».
Tout en français, info-bulle d'une phrase par réglage, chiffres toujours légendés, boutons segmentés plutôt
que menus quand 2 à 4 choix suffisent.
Diagnostic « aucun résultat » : dis quel filtre bloque et propose « Assouplir ce filtre ».
Mémorisation par personnage + préréglages personnels nommés. Mobile : filtres dans une feuille en bas,
compteur et bouton « Lancer » collés en bas.
Mission Astralis — à exécuter en une seule passe 12 / 13

#### Page 13

11.6 Liste de priorité des personnages :
Liste ordonnée (glisser-déposer + boutons haut/bas, clavier). Option « Respecter la liste de priorité » : en
optimisant le personnage de rang k, l'optimiseur ne peut PAS utiliser les artéfacts équipés sur les
personnages de rang 1 à k−1 ; il peut utiliser les pièces libres et celles des personnages classés en dessous
(avec affichage de l'impact sur eux et proposition de les réoptimiser).
Mode « Optimiser toute la liste » dans l'ordre de priorité, avec passe d'affinage par échanges de pièces.
Réglages par personnage : verrouiller son équipement, exclure des pièces, ignorer la priorité, rotation
propre.
11.7 Équipes et page Équipe
équipes de 4 personnages, rôles, résonance automatique ; les stats du personnage redeviennent des
TABLEAUX ; les compétences sous les splash arts fonctionnent (corrige le bug avec un test) ; les listes («
choisir personnage », « liste… ») utilisent un composant de sélection avec recherche et images ; ne plus
afficher les noms de sets ni d'arme des coéquipiers.
11.8 Visuel du laboratoire
très visuel (portraits, icônes d'armes, de sets, de stats, de talents, d'éléments, pièces d'artéfacts en images,
barres et graphiques maison lisibles), aux couleurs du thème du personnage, avec les composants du design
system du site. États soignés (vide, chargement avec progression, erreur, aucun résultat). Responsive, clavier,
prefers-reduced-motion .
12Vérification finale et publication
Lance toute la suite de tests (moteur de dégâts, optimiseur, rendu de texte, relations, compagnons, import,
PWA, parcours chaque page à plusieurs largeurs 390, 768, 1440 px), thèmes sombre et clair, et corrige
jusqu'à ce que tout passe sans erreur console. Vérifie que le tableau de bord et les cartes (hors périmètre)
fonctionnent toujours.
Compare docs/INVENTAIRE.md  à l'application finale : aucune fonctionnalité perdue.
Mets à jour docs/SUIVI.md  (toutes les cases [x]  ou [!]  avec raison), docs/NOUVEAUTES.md ,
docs/AUTOMATISATION.md , docs/AUDIT-RELATIONS.md , docs/COMPAGNONS.md , docs/INSTALLER-SUR-IPHONE.md ,
ainsi que les captures dans docs/captures/ .
PUBLIE TOUT sur GitHub (commit final + push), puis donne ta réponse finale selon la règle 10 de la section
0.
Commence maintenant par docs/SUIVI.md  et docs/INVENTAIRE.md , puis exécute tout de façon continue
jusqu'à la fin, en terminant par le laboratoire de dégâts.
Mission Astralis — à exécuter en une seule passe 13 / 13

### Réseau des relations initial

Source : C:\Users\Ravon\.codex\attachments\8cdaa071-cf3c-4868-98e7-a369f3197029\Texte collé.txt
SHA-256 : 9d92285544d477de80e4dfcd6947e2a3dcd9073de52e1c1e1b3db61976fb14f3

03 NOUVELLE PAGE   « RÉSEAU DES RELATIONS » (même concept et même style que ties.catforest.dev/genshin)

- [ ] Je te joins une capture du site de référence « 原神关系⽹  » (Genshin Relationship Network). Je veux une nouvelle page d'Astralis EXACTEMENT du même concept et du même style d'effets, en plus complète, plus exacte et beaucoup plus personnalisable. Tu t'inspires du principe, tu ne copies NI son code, NI ses images, NI ses textes, NI son nom.
- [ ] 3.1 Concept (d'après la capture et le site de référence) :
- [ ] Une visualisation en ANNEAU   chaque personnage jouable est un nœud représenté par son icône dans un cercle, avec un liseré de la couleur de son élément. Les nœuds sont regroupés par région autour du cercle
- [ ] Mondstadt, Liyue, Inazuma, Sumeru, Fontaine, Natlan, Snezhnaya, Nod-Krai / hors des sept nations), avec
- [ ] l'icône et le nom de la région en légende sur l'anneau. Fond sombre bleu nuit avec léger scintillement d'étoiles.
- [ ] Des LIENS courbes (courbes de Bézier regroupées, façon « edge bundling ») traversent l'intérieur du cercle, colorés (dégradé entre les couleurs des deux personnages ou de leur élément), semi-transparents, qui s'allument au survol et à la sélection.
- [ ] Principe de données : chaque personnage a des répliques vocales sur d'autres personnages (« À propos de X… »), et les textes d'histoire (quêtes de l'Archon, quêtes de légende, quêtes du monde, événements, récits de voyageurs, lettres et livres, histoires de personnages) font apparaître des personnages ensemble.
- [ ] Quand un personnage en mentionne un autre dans ses répliques, un lien est tracé ; les scènes partagées dans l'histoire créent aussi un lien.
- [ ] Interactions : cliquer sur UN personnage allume tous ceux qu'il mentionne ; en cliquer un SECOND ouvre la vue duo (deux avatars face à face, avec ce que chacun dit de l'autre, clips vocaux lisibles quand ils sont disponibles, et la liste des scènes partagées). Un onglet « Par association » classe, pour un personnage sélectionné, qui partage le plus de scènes et de répliques avec lui.
- [ ] Panneau latéral gauche : titre de la page en typographie élégante, champ de recherche (nom ou surnom/alias, en français et en anglais), texte d'explication, et statistiques calculées automatiquement (nombre de répliques d'histoire, de quêtes, de personnages jouables, de répliques vocales).
- [ ] Barre d'outils en haut à droite : partager (lien + export image), réglages, aide, signalement d'erreur de données.
- [ ] Chargement animé avec message (« Lecture des répliques… »), état vide, erreurs claires.
- [ ] 3.2 Ce que tu ajoutes (plus complet, plus exact, plus personnalisable) :
- [ ] MON ÉQUIPE : l'utilisateur choisit une de ses équipes (ou en compose une) et les ICÔNES DE CES
- [ ] PERSONNAGES sont mises en avant dans le réseau (anneau d'accent, légèrement agrandies, étiquette, pulsation douce) ; le reste passe en retrait. Un panneau « Entente d'équipe » montre les liens entre les 4 membres (qui parle de qui, nombre de répliques et de scènes), un score de complicité et des citations.
- [ ] Pour chaque membre, ses liens avec les personnages que l'utilisateur possède.
- [ ] Mises en page au choix : par région (par défaut), par élément, par type d'arme, par rareté, par version de sortie, par faction/organisation, ou réseau à forces (force-directed) ; ordre au choix ; taille des nœuds proportionnelle au nombre de liens ; rayon et espacement réglables.
- [ ] Filtres : source des liens (répliques vocales / histoire / les deux), direction (qui parle de qui, ou réciproque), poids minimum, région, élément, version, personnages possédés seulement, masquer les spoilers (cache les relations issues d'une quête non jouée, au choix de l'utilisateur), langue des citations  FR / EN , option « inclure des PNJ importants »  Paimon, Archontes non jouables, etc.).
- [ ] Apparence personnalisable : thème du fond (nuit étoilée, sombre uni, clair), palette des liens (par élément, par région, monochrome, couleur d'accent), épaisseur, courbure, opacité, intensité de la lueur, vitesse d'animation, style des nœuds (icône ronde, hexagone, portrait), affichage ou non des noms et des légendes de régions. Réglages enregistrés, préréglages nommés, bouton de réinitialisation.
- [ ] Effets (mêmes que la référence, en plus soignés) : tracé des liens qui s'allument à l'ouverture, éclairage progressif au survol (le personnage, ses liens et ses voisins se mettent en lumière tandis que le reste s'atténue), pulsation douce des liens actifs, étoiles en arrière-plan avec léger parallaxe, anneau extérieur avec graduations, transitions fluides entre mises en page (les nœuds glissent vers leur nouvelle position), zoom et déplacement à la souris et au tactile.
- [ ] Fiche personnage intégrée : au clic sur un nœud, un panneau latéral affiche le portrait, l'élément, la région, la faction, ses relations classées avec citations, un lien vers sa fiche et vers son lore (section 6 .
- [ ] Partage : lien qui conserve l'état (personnages sélectionnés, filtres, mise en page) dans l'adresse, export
- [ ] PNG de la vue actuelle (avec titre, légende et équipe choisie) enregistré ET copié dans le presse-papiers.
- [ ] 3.3 Exactitude des données (point critique : aucune relation inventée) :
- [ ] Un lien existe SEULEMENT s'il s'appuie sur une preuve textuelle (réplique vocale, ligne de dialogue de quête, texte d'histoire). Chaque lien conserve ses preuves : type, citation, identifiant de la source, langue, quête ou réplique d'origine, et compteur. Aucune relation « devinée ».
- [ ] Sources : données de jeu ouvertes  AnimeGameData, genshin-db, Project Amber, Lunaris/Nanoka), textes en français quand ils existent. Pipeline automatique tools/build-relations.*  qui génère data/relations.json  à partir des répliques vocales et des dialogues de quête.
- [ ] Détection des mentions : dictionnaire d'alias par personnage (noms, surnoms, titres : ex. Childe/Tartaglia,
- [ ] Le Voyageur/Aether/Lumine, noms de famille ou de faction), correspondance sur des mots entiers, exclusion des homonymes et mots courants qui ne désignent pas le personnage, gestion de la ponctuation et des accents. Les titres de répliques « À propos de X » donnent des liens directs fiables.
- [ ] Scènes partagées : un lien d'histoire ne se crée que si les deux personnages parlent ou sont explicitement nommés dans la même scène/quête, avec un poids selon le nombre de scènes.
- [ ] Tests : jeu de relations connues avec preuves vérifiées à la main (ex. paires célèbres) qui doit être retrouvé
- [ ] ; échantillon aléatoire de 50 liens relu et consigné dans docs/AUDIT-RELATIONS.md  (citation + source + verdict) ; test qui échoue si un lien n'a aucune preuve ; test de non-régression sur les homonymes.
- [ ] Mise à jour automatique : à chaque synchronisation (section 9 , un nouveau personnage ou de nouvelles répliques apparaissent sur l'anneau et dans les liens sans modification du code, avec badge « Non confirmé » si les données sont partielles.
- [ ] 3.4 Performance et accessibilité :
- [ ] Rendu Canvas 2D (ou WebGL  avec couche de fond mise en cache, regroupement des courbes précalculé dans un Web Worker, détection du survol par grille spatiale, 60 images/s avec plus de 150 nœuds et plusieurs milliers de liens, zoom/déplacement fluides (souris et pincement tactile).
- [ ] Alternative accessible : vue « liste » équivalente (tableau triable des relations), navigation au clavier entre les nœuds, libellés pour lecteurs d'écran, prefers-reduced-motion  (animations réduites), contrastes suffisants, mobile utilisable (panneaux en feuille basse).
- [ ] Intégration : lien depuis les fiches de personnages et de lore, depuis les équipes (« Voir l'entente d'équipe
- [ ] »), et données réutilisées par les compagnons (section 1 .

### Laboratoire initial

Source : C:\Users\Ravon\.codex\attachments\acbe7fbf-9203-4917-b226-d097e1dce55b\Texte collé.txt
SHA-256 : e0179e3e20313de51e083af144cba65cc67d771c2404b41a59f450964039da6b

1. LABORATOIRE DE DÉGÂTS (explication complète)
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

### Complément relations

Source : C:\Users\Ravon\.codex\attachments\f6e6c760-e2e2-40f2-91a8-e82eebfb1d83\Texte collé.txt
SHA-256 : 4590b0002c4410126205ffbb777fb26d05dc6cf336bedb4565e05c61038b7a58

══════════ 3 (COMPLÉMENT À LIRE ET À APPLIQUER) : RÉSEAU DES RELATIONS, VERSION « PLUS BEAU » ══════════
Ce complément précise et remplace la section 3.1. Il est basé sur la vidéo de démonstration de l'outil de référence (Genshin Ties 2.0). Tu t'en inspires pour le concept et les interactions, tu ne copies NI son code, NI ses textes, NI ses images, NI son nom, NI sa mise en page à l'identique. Mon but : la même richesse, en nettement plus beau.

A. ÉCRAN D'ACCUEIL (vue anneau)
- Anneau de nœuds ronds (icône du personnage + liseré de la couleur de son élément), regroupés par région autour du cercle. Légendes de régions avec leur icône sur l'anneau (Mondstadt en haut, puis Liyue, Inazuma, Sumeru, Fontaine, Natlan, Snezhnaya, Nod-Krai et un groupe « Hors des sept nations »).
- Au centre : de fins liens en courbes regroupées, très translucides, qui s'allument au survol. Fond bleu nuit étoilé, graduations discrètes sur l'anneau extérieur.
- Panneau gauche : titre élégant (typographie à empattements), recherche par nom ou surnom (FR/EN), paragraphe d'explication, chiffres animés (répliques d'histoire, quêtes, personnages jouables, répliques vocales) et une ligne de transparence en bas : « Chaque relation s'appuie sur la réplique d'origine : N sources au total ».
- Survol d'un nœud : infobulle « X parle de N personnages, est mentionné par M personnages ».
- Barre d'outils en haut à droite : Partager, Nouveautés, Réglages, Signaler une erreur, Sources.

B. SÉLECTION D'UN PERSONNAGE : LES DEUX MODES
Le personnage choisi passe au centre en grand portrait, avec un nom en typographie à empattements, sa région, son élément et la phrase « parle de N personnages, est mentionné par M ». Deux boutons segmentés :
1. « Par répliques vocales » : l'anneau reste en place et les liens partent du personnage vers ceux qu'il mentionne. Liens colorés = mentionné dans les répliques ; liens blancs = relation officielle (famille, contrat, serment…). La légende est affichée.
2. « Par connexion » : les personnages se réorganisent en ANNEAUX CONCENTRIQUES autour du personnage central, du plus proche au plus lointain, avec une étiquette par anneau : « Relation définie », « Mentionné dans les répliques », « Ont parlé ensemble », « Même scène », « Même groupe », « Aucun recoupement » (petits points en bordure). Les nœuds glissent en douceur vers leur nouvelle position.
- Liste de relations dans le panneau gauche : pour chaque personnage lié, icône, nom, libellé de la relation (« ami », « mère et fille », « ancien partenaire », « sous le décret de… »), rang de la relation en losanges (◆), et compteurs avec icônes (répliques vocales, quêtes d'Archon, quêtes de légende, quêtes du monde, récits de voyageurs, événements, histoires de personnages). Triée par force. Au survol : infobulle avec une citation.
- Les PNJ non jouables importants (ex. une Archonte sans réplique vocale) peuvent être centrés aussi, avec le message « non jouable, pas de répliques vocales : seulement les récits où les autres parlent d'elle ».
- Le Voyageur et Paimon forment un seul nœud (ils sont liés à presque tout le monde : prévoir un affichage lisible avec 100+ liens, en éventail).

C. PAGE DE DUO (clic sur un second personnage) : ELLE DOIT ÊTRE SPLENDIDE
- Plein écran : les deux splash arts des personnages en fond, flous, de chaque côté (un à gauche, un à droite), teintés de la couleur de leur élément. Au centre, une carte « feuille de papier ancien » (crème, texture légère, bord fin doré, ombre douce) qui défile.
- En-tête : deux portraits ronds qui se chevauchent, noms en grande typographie à empattements, rang de la relation en losanges, et libellé (« amis », « mère et fille », « collègues de troupe · meilleure amie »).
- Si l'un des deux ne mentionne pas l'autre dans ses répliques, une ligne le dit avec élégance (« Aucun des deux ne cite l'autre dans une réplique vocale. Arrivée : oct. 2020 ») au lieu de laisser un vide.
- Corps en deux colonnes : « X à propos de Y » et « Y à propos de X » (titre de la réplique + niveau d'amitié, texte, bouton de lecture audio quand disponible), puis une troisième vue « Profil d'une relation » pour les relations complexes en trois colonnes : « Ce qu'ils disent l'un de l'autre dans l'histoire », « Ce qu'ils ont fait », « Ce que disent les autres » (avec le nom de la source).
- Section « Indices » en accordéon par type de source (quêtes d'Archon, de légende, du monde, récits de voyageurs, événements, histoires de personnages) avec le nombre de quêtes ; chaque quête déplie les lignes exactes (qui dit quoi à qui, avec l'étiquette « mentionne / ami / avis ») et un lien vers la source complète.
- Bouton « Les écouter comme une conversation » : enchaîne les répliques des deux personnages comme un dialogue (alternance de bulles + audio si dispo, bouton pause).
- Paroles de chansons : si un personnage chante pour l'autre, afficher un bloc « Une chanson pour… » avec les paroles qui s'éclairent ligne par ligne pendant la lecture (extrait seulement, lien vers la chanson complète, mention du crédit). Respecte le droit d'auteur : seulement les premières lignes, comme dans la source.
- Navigation : « Retour » et « Autre paire → » (tirage d'une autre paire intéressante), flèches clavier.
- Sous-titres de l'entête : un compteur du genre « Zhongli et le Voyageur : 45 quêtes ensemble ».

D. RÉGLAGES, PARTAGE, NOUVEAUTÉS
- Réglages : langue du texte (français, anglais, chinois, japonais, coréen), langue de la voix, volume, Lumine ou Aether pour le Voyageur.
- Partage : aperçu miniature de la vue actuelle, boutons « Copier le lien » et « Partager… », le lien rouvre exactement la même vue.
- « Nouveautés » : liste datée des changements et corrections de la page (réutilise le système de changelog de la section 8.3).
- Signalement : un drapeau qui ouvre un formulaire (erreur de donnée ou demande de fonctionnalité), qui enregistre localement et propose un envoi (e-mail ou issue GitHub).
- Mon équipe (inchangé, section 3.2) : les icônes des personnages de l'équipe sont mises en avant dans TOUTES les vues (anneau, anneaux concentriques, duo).

E. PLUS BEAU : INSTRUCTIONS DE DESIGN
- Deux ambiances cohérentes : la « nuit étoilée » pour les vues de graphe, le « papier ancien » pour les pages de lecture. La transition entre les deux est un fondu cinématographique (le graphe s'assombrit et recule pendant que la carte arrive).
- Nœuds : léger relief et reflet, liseré de l'élément qui brille légèrement, halo lumineux au survol, taille variable selon la connexion. Aucun nom affiché par défaut sur l'anneau complet (trop dense) : le nom apparaît au survol et pour les nœuds mis en avant.
- Liens : dégradés entre les deux couleurs d'élément, épaisseur selon le poids, lueur douce, légère animation de flux sur les liens actifs, réduction de l'opacité des autres jusqu'à les rendre presque invisibles.
- Typographie : titres en empattements raffinés, texte de lecture très lisible, chiffres en police tabulaire. Utilise le design system du site (pas de nouvelle police imposée par ce prompt) mais garde ce contraste entre l'interface sombre et la lecture claire.
- Micro-animations : compteurs qui s'incrémentent, glissement des nœuds entre vues, apparition échelonnée des lignes de la liste, étoiles à parallaxe, parcours au clavier avec focus visible. `prefers-reduced-motion` respecté.
- Mobile : l'anneau devient plein écran avec zoom au pincement, le panneau gauche devient une feuille basse, la page duo passe en une colonne avec onglets (« A à propos de B » / « B à propos de A » / « Profil »).

F. DONNÉES ET PREUVES (rappel strict)
- Chaque relation, chaque citation et chaque compteur doit pouvoir remonter à une source : texte d'origine, identifiant de la quête ou de la réplique, langue. Aucun lien deviné. Les relations officielles (famille, contrat, serment) viennent des données de personnages, pas d'une interprétation.
- Les rangs de relation (définie / mentionnée / ont parlé ensemble / même scène / même groupe / aucun recoupement) sont calculés par une règle écrite dans `docs/RELATIONS-RANGS.md` et testée, pas par intuition.
- Ajoute un accès « Sources » listant les bases utilisées, avec remerciements.

G. À LIVRER EN PLUS
- Une page de test visuel avec 10 paires de référence (dont une relation complexe, une relation sans réplique vocale, un PNJ non jouable, le Voyageur et Paimon) et des captures dans `docs/captures/relations/`.
- Ajoute ces points à `docs/SUIVI.md` (cases à cocher) avant de commencer.

### Complément relations (renvoi)

Identique octet pour octet à « Complément relations » ; SHA-256 4590b0002c4410126205ffbb777fb26d05dc6cf336bedb4565e05c61038b7a58. Ne pas compter deux fois les mêmes exigences.

### Buffs, imports et corrections des pages

Source : C:\Users\Ravon\.codex\attachments\fd36b48d-0aa3-4a3a-b5fd-6e1a000d055c\Texte collé.txt
SHA-256 : 0fa7e2a916ece9ea7139baad687f65103a817854ff3e50cf49028835eab5e18b

Dans le laboratoire de dégâts : 
- je veux que tu me répertorie tous les buffs de personnages possibles, que l'on puisse ou non activer dans le laboratoire de dégâts, Tu feras pareil pour les armes et pareil pour les sets. attention certain d'entre eux ont des conditions, tu afficheras les conditions et l'utilisateur décideras auquel niveau activer ses buffs. Attention es raffinements et constellations d'armesdoivent être compris dedans. Attention aussi au buffs qui dépendent de l'ATK d'un autre perso, il faudra que l'utilisateur indique son effet. Pourquoi tous les sets ne sont pas inclus de base ?
- Ouvrir la page mets beaucoup de temps et me fait même demander de quitter la page
- Pour les persos recherche sur internet les meilleurs sets pour chaque perso en mettant un bouton les sets au moins bon sur les persos
- Dans "Quel coup veux-tu optimiser ?" Mets les icones du personnage approprié 
- On pourra ajouter trois personnages pour afficher leurs buffs possibles, un set d'artéfact, et une arme On pourra choisir le buff/debuff du set de l'arme (attention il faudra vérifier si les /passifs/buffs sets /armes marchent bien on field /off field
- Je veux ma liste de priorité bien faite (faire un on glet Tableau de priorité (bienf aite) et activer ption en haut de la page ou dans la page calcul defaire priorité. On aura une option aussi juste calcul théorique ou ça le fera et fera un build qui commencera forcément par "TC - " et l'utilisateur pourra mettre ce qu'il veut après
-On pourra importer des fichiers json (ou tu pourras les récupérer automatiquement dans https://celestia.cv/leaderboards (je t(envoi quelque exemples (si jamais ça t'aide Paste it into Genshin Optimizer (Character, then Multi-target, then Import custom target): it scores your own artifacts)
Dans l'onglet Team équipe, chaque personnage lors de la création de l'équipeaura une partie buff, qui (avec le travail effectué au laboratoire
- un set ??? sans image répare le. Affiche un % positif de gain dans les résultats au lieu d'un -.
- La page est pas mal mais améliore
- j'aimerai pouvoir importer des configs JSON et que ça les sauvegarde pour pouvoir les utiliser plus tard (voir fichiers que je vais tenvoyer). Quand on importe, il peut aussi y avoir Team Imort qui affiche les équipiers. Pour cela quand ça marchera ça afficera les équipeiers pour le joueur puisse modifier leurs armes ou aute
- Essaie de faire un scipt pour télécharger tous les jsons.

Dans la page TeamBuild
- j'aimerai que ça mette aussi les dégats du perso mais du coup avec les buffs, arme mis par l'utilisateur
- les splash arts des persos (page agrandi), y'a un premier splash art en tout petit net un l'autre en arrière plan est flouté (mais comme je veux). 
- J'aimerai que pour afficher team (rétrécir agrandir) ça soit avec une flèche en haut que un bouton

Dans la page Perso 
- on pourra indiquer jsuq'a la constellation qu'on possède sur chaque perso
- Dans les fiches persos il ny'a pas les passifs des persos et par exemple dans les constellations avec le buff hexerkinzel, les buffs ne sont pas mis
 - Aino a pas son splash art
Dans la page Arme, on pourra indiquer jsuq'a combien de fois on possède l'arme
Dans la page Set, 
- j'aimerai dans la partie mes reliques, des dépliants pour les fleurs,plume etc...
- Pouvoir créer une ièce avec ces substats, mainstat en choisisant son set, si plume, fleurs etc..

Dans la page build perso
- Améliore encore le visuel de la page por que ça soit parfait
- Quand on sélectione quelque chose dans une liste, ça bloque la liste et elle ne s'enlève plus

Dans la page farm : 
- les couronnes ne se farm pas, pas besoin de les mettre dans le planning
- Pour les aptitudes, mettre que les philosophies, l'utilisateur comprendra.
- Utilise les icones des moras et des ivres d'xp mis dans le message.
- Les matériaux de weekly d'un même personnage ne doivent apparaitre qu'une fois par semaine.
- Indiquer combien de fois il faudra farmer les pantes par rapport aux nombres qu'il y'a dans le monde
- Faire une fiche exportable pour les persos comme celle envoyé (il faut rajoter le splash art du perso en haut.
- Le bloc apitude est trop grand. Et j'aimerai que ça soit plus simple genre Mettre un Bloc objectif en ligne avec les peross mis et les choix d'aptitudes mis et tu rajouteras aussi les lvls voulus. De la même manière il faudra calculer les ressouces voulus dynamiquement comme sur le calendrier.

Voici les ressources requises dans Genshin Impact pour augmenter le niveau et élever un personnage de 4 ou 5 étoiles.

### COÛT DÉTAILLÉ PAR PALIER D'ÉLÉVATION (Niveau 1 à 90)

* Élévation Niveau 20 (Niveau max 40) : 20 000 Moras + 1 Éclat de pierre élémentaire + 3 Produits locaux (Plantes) + 3 Matériaux de monstres (Gris 1★)
* Élévation Niveau 40 (Niveau max 50) : 40 000 Moras + 3 Fragments élémentaires + 2 Matériaux de Boss normal + 10 Produits locaux (Plantes) + 15 Matériaux de monstres (Gris 1★)
* Élévation Niveau 50 (Niveau max 60) : 60 000 Moras + 6 Fragments élémentaires + 4 Matériaux de Boss normal + 20 Produits locaux (Plantes) + 12 Matériaux de monstres (Verts 2★)
* Élévation Niveau 60 (Niveau max 70) : 80 000 Moras + 3 Morceaux élémentaires + 8 Matériaux de Boss normal + 30 Produits locaux (Plantes) + 18 Matériaux de monstres (Verts 2★)
* Élévation Niveau 70 (Niveau max 80) : 100 000 Moras + 6 Morceaux élémentaires + 12 Matériaux de Boss normal + 45 Produits locaux (Plantes) + 12 Matériaux de monstres (Bleus 3★)
* Élévation Niveau 80 (Niveau max 90) : 120 000 Moras + 6 Pierres élémentaires (Légendaires) + 20 Matériaux de Boss normal + 60 Produits locaux (Plantes) + 24 Matériaux de monstres (Bleus 3★)

### LEÇONS D'EXPÉRIENCE POUR GRIMPER LES NIVEAUX (Moyenne en Leçons du Héros)
* Niveau 1 à 20 : ~7 Leçons du héros + 24 200 Moras
* Niveau 20 à 40 : ~29 Leçons du héros + 115 600 Moras
* Niveau 40 à 50 : ~29 Leçons du héros + 115 800 Moras
* Niveau 50 à 60 : ~43 Leçons du héros + 170 800 Moras
* Niveau 60 à 70 : ~60 Leçons du héros + 239 200 Moras
* Niveau 70 à 80 : ~81 Leçons du héros + 322 200 Moras
* Niveau 80 à 90 : ~172 Leçons du héros + 684 800 Moras

### TOTAL CUMULÉ POUR UN PERSONNAGE (Niveau 1 à 90)
* Moras d'élévation + d'expérience : 2 093 400
* Livres d'EXP (Équivalent Leçons du Héros Violets) : 421 
* Éclat élémentaire (Vert 2★) : 1
* Fragment élémentaire (Bleu 3★) : 9
* Morceau élémentaire (Violet 4★) : 9
* Pierre élémentaire (Or 5★) : 6
* Matériaux de Boss normal : 46
* Produits locaux (Plantes) : 168
* Mobs Gris (1★) : 18
* Mobs Verts (2★) : 30
* Mobs Bleus (3★) : 36
* Rencontres de la destinée (Pierres bleues de voeux offertes) : 3

- Pouvoir plier la liste en lignes du calendriers (la plier par défaut).
- Changer la liste de priorité (en terme pratique car les flèches c'est pas fou, glisser better).
- beaucoup de eprsnnages, ils manquent de smatériaux comme ceux d'aptitudes

Endgae : Réactualiser les endgames avec ceux en cours et mettre desflèches pour afficher les prochains (TOUT DOIT ETRE AUTOMATISE SANS QUE TU LE FASSEs MANUELLEMENT). (le faire tous les endgames).

Evenements genshin : il manque toujours les informations DANS LE CALENDRIER ENDGAMES, events, bannières change ça


Lore et archives : 
- Revoir le positionnemetn des icones sur les previews des fiches qui est sur Chapitre 
- La barre avec Atlas, personnages ets beuguées et coupées en deux.
- Pour chaque personnage faire un résumé du lore
- RAjouter du contenu pour les régions
- Faire des vraies pages aec du vraies contenu pour les évènements, shades, sinners, dainsleif

Réseau des relations :
- Dans le menu à gauche il y'a la liste des personnages pour sélectionner les liens. Sauf que j'aimerai que ça soit par gion ou ça fait un cercle avec que les persos de la région sélectionné


Voeux et Objectifs : 
- remmetre dans 'ordre les blocs :
- En haut les primos et voeux actuelles avec La pity, la radiance ? nombre de 50/50 perdus
-
- améliorer le système 	de progression d'épargne avec un autre syle de graphe bien mieux et plus utile
- Dans le bloc ou on mets voeux disponibles Pity personnage, 50/50 perdus. je veux que ça convertisse les primos en voeux et que ça ne puisse pas etre modifié l'utilisateur dans ce bloc
- J'aimerai que dans le calendrier pour le compteur de primos (et avec les informations mises au dessus, tu spécifies les jours de majs Dans les objectifs, tu mettras la version estimée du personnage (Jusqu'a 7.8 puis 8.0 jusqu'a 8.8 pour l'instant) et précisera première ou seconde phase).

En sachant qu'en 7.4, on a une multi offerte (a ajouter dans les voeux, 8.0 2 multis). Et que une zone d'exploration tous les 2 patchs (on est actuellement en 7.2, patch d'exploration) le 16 décembre (jour de la 7.3 pas de map d'exploration). 27 janvier 2027 map d'exploration etc... J'aimerai que tu calcules autmatiquements le nombre de primos en fonction des dates d'objectifs (phase 1..) Et dans le grape estimé, mettre les % pour les persos voulus etc...
- Faire une aprtie Primos gagnées dans le smeaine/mois et pouvoir les comparer dans les semaines précédents si +, - pareil pour les mois




FICHES PNG :
6 pour toutes les fiches png  : J'aimerai que tu m'améliore l'aperçu des fiches .png pour pouvoir mieux les customiser, images des persos qu'on pourra choisir...,couleurs de fond etc etc vraiment une customisation de fou
Hormis pour els fiches de farm de matériaux, et d'équipes ou les modifications ont été envoyées auparavant, kje veux que tu me modifes complètement le design des fiches png (font, empcalement de blocs, tailles, images...Vraiment ça doit être magnifique et imprsssionannt. Attention les fiches ne devront pas avoir de scroll horizontal ou vertical

### Fiches PNG et autres corrections

Source : C:\Users\Ravon\.codex\attachments\5206e10b-09d8-485e-8b2f-673f74e70c51\Texte collé.txt
SHA-256 : 06bfd697a1df0913d3e496aa6df80c910e92fa59322464facabb85650594878c

Je veux en plus des troislunes les trois objets d'avant qui tourne masi comme le lunes
Les animations deNatlan,Sumeru,FOntaine;Mer primordiale,Nod krai Snzehaya, la planète ne marche pas (ne torne pas sur elle meme, effets) dans le tableau de bord, mais que on appuie sur la planète ça affiche bien

Dans personnage : 
- Dans une fiche personnage, le bloc pour "Non possédé est trop petit", agrandis le mais rétrécis pour pas que ça fasse trop grand avec les constellations
- Les icones des passifs ne sont pas là
- Afficher les builds de 'lutilisateur dans un onglet

Dans relique : 
- Ajouter un bouton dans le bloc importer reliques pour créer une pièce, ça ouvvira une petite modale ou le joueur pourra créer son artéfact, choisir set, choisir type d'artés (fleurs,plumes etc.. et indiquer les substats (pas de vérificationd es substats). une fois appuyter sur enregistrer ça fermera pas la modale mais effacer le contenu pour pas que l'utilisateur ait à réappuyer sur plusieurs fois. Quand appityer sur enregostrer message pour dire que l'arté a bien été enregistré
- Le bouton dépliant est oche et je préfère "▸" comme symbole

Dans Teams :
- comme sur l'image 1, les splash arts sont tout petits et les bons sont floutées en arrière plan.
- J'aimerai plutot au lieu de voir les degats théoriques un bouton qui export la team en json pour le laboratoire.Json, sauvegarde directement dans le dossier de l'application pour pouvoir être utilisé dans le labo de dégat

Dans Mes builds :
- Enlever les blocs : OPTIMISEUR DE RELIQUES · FORMAT GOOD et OPTIMISEUR LOCAL
- Les blocs pour choisir son artéfacct (surtout importer est trop petit), odifies moi ça pour que els artéfacts (le bloc des artéfacts du build du perso (sur image 2 , les gros blocs). soient affichées en ligne.
- Double cliquer sur une relique imortée pour la mettre ne marche (le émca est beugué (meme chosisir set)
- Toutes les stattiques du perso toujours à "-"

Plan de farm : 

6Dans l'image 3, la partie là est vraiment moche, refais son design
-Dans les tableaux de priorité, je vux l'ione du personnage a gauche de son nom
- Le bloc "Objectifs de niveaux et d’aptitudes · 1 personnage(s)", est trop petit et non voyant, mais en meme temps je veux qu'il soit visible mais aussi pas trop grand, pourquoi pas le mettre ailleurs trouve une solution
- Quand y'a une icone de livre, y'a une étiquette Li, enlève la mi
- On ne peut farmer qu'une seule fois pour un personnage dans un jour le matériau du weekly boss (celui ou il en faut 18) et on peut faire qu'une fois trois boss différents donc pour trois personages dont l'item est différent
6 On acquiecera que pour les livres Xp/ moras on fait 2 jours xp puis 1 jours mora.
- Actuellement si je veux mettre une tache un jour (pas automatique mais rajouté par l'utilisateur, ça met qu'il faut que ça soit un jour vide, alors que je veux que ça mette cette tâche sur ce jour là et trecalcule le calendrier en ginorant ce jour. 
- Pour les taches manuelles, en fonction du personnages choisi, quand je mets aptitudes, dns le jour du calendrier, je veux que ça me emtte en bleu, les jours d'aptitudes pour ce personnage.
- Quand je modifie les items que je possède j'aimerai que ça me modifie aussi le temps estimé dpar rapport au jour que j'ai fini..
- Rajoute bouton pour exporter personnage

Endgame : 
- les flèches pour choisir le calendrier des rotations ne marchent pas (plus essaie de récupérer les prochains endgames (pas ceux actuels dans une bd (de façon automatique...)


Evenements actualités : 

- Actuellement dans le calendrier (quand je aprle de calednrier c'est le calendrier, pas la liste d'actualités en dessous c'est vide, pas les évents, en) dy'a rien dessus, alors que je vex que ça m'affhcie manuellement els amjs, endgames, bannières etc..
- Dans la liste actualités enleve les endgmaes et toutes actualités que tu as toi meme ajouté (volontairement), je veux que les flux officielle d'hoyoverse
-Actualisé pour que les dates de reçues des actualités marchent bien


Lore : 
- Harmonise et améliore l'esthétique des fiches de personnages, nations ect, le etxte est des fois tilles différentes et  pas très beau.

Cercle des relations : 

6Dans l'iage 4, on voit que tu as mis tous les personnages par régions. Ce que je veux c n'est pas affichées les personnages 1 à 1 d'une région c'est un bouton Mondstdtat, un bouton liyue ect etc, qui affiche un nouveau cercle avec seulement les personnages de ces régions. On pourra cocer plusieurs régions à la fois..

Voeux et objectifs : 

Image 5 : j'aimerai plutot qu'en foction des informations de l'utilisateur, ce bloc soit plutot pour savoir quand perso garaantie..
- Je veux que le premier bloc en haut de la page soit l'indicateur, de primos et de voeux de l'utilisateur. Il pourra indiquer son nombre primos et voeux (il pourra les modifier manuellement directement). Il y'a des boutons en fonction de ce qu'il a mis en bas(peutetre a la premiere ouverture lui demander ce qu'il peut clear, si faveur ect...) et ainsi bouton Dailies, Reset, Théatres, Abysse,Carnage,Petit Event, Autre.
- Dans les calculs de primos estimées, je veux juste m'assurer que le calcul du théatre, event (et les informations que je t'ai donné se fasse lejour meme de l'apparition de ça.)

- LE bloc épargne sert à rien, toruve moi un autr ebloc super utile (un bloc épargne mais avec un histogramme dynamique avec les barres + ou -hautes en fonctions des gains affichés par lejoueur (pourra regarder es épargnes précédentes..
Et un bloc statistiques ou on pourra mettre le nombre de 50/50 eprdu avec la stat en %, le joueur pourra indiquer un nombre de 4* (l'un des trois en vedette) qu'il aura eu dans ses pulls (indiquer son nombre depulls effectués et voir)  quel point le joueur s'est fait avoir ou non...

- aboratoire de dégats : 

- Image 6 : La partie importation Json ets moche et sans css, j'aimerai avoir une liste des imports json existant dans l'applications pour deja choisir Team/ou juste perso :
- Je veux que les imports de JSON marcent parfaitement 
- es icones des na,ca,skill,ult sont vides
-  Dans le tableau de priorité, j'aimerai qu'on puisse choisir aussi pour ranger lespersonnages en choisisant la position dans une liste et rechercher le personnage pour le sélectionner. ça le fera directement
- la cocce Protéger  les personnages prioritaires n'ets pas fou
- Dans ma liste de stes importées, beaucoup n'apparaissent pas dans les résulats alors que meilleur
- Faire liste dépliante des sets 
- Comme demandée avant, pouvoir mettre des persos et sélectionner leurs buffs,buff armes, set etc.. Que ça soit perso on field (celui qu'on teste) ou ceux off field
- Voir les sets conseillées : j'aimerai que ça soit un meillur rendu et que  bouton pour appliquer ces informations dans l'optimiseur
-Revois tes calculs aussi car j'ai des doutes
- Ainsi tu feras la liste que peut donner chaque arme/set/constellations personnages ect ect.. Pour pouvoir less mettre autmatiquements



Pour la majeure partie du setvérifie que tout est autatisé correctement car il manque des armes, les nouveaux sets... Et j'ai l'impression que c'est pas vraiment automatisée.....


Pour les fiches png, regarde le .zip et suis les insctructions là,je t'ai envoyé les icones des différentes substats, hp,atq,def,em,energy recharge... (Sacant que la dernière image est l'icone du taux crit, modifie légèrement celle en la dupliquant pour que ça soitc eleld du degats crit. la dernière étant celle des bonus de dégats pysique. Pour les coupes, quand c'est des dégats élémentaires tu mettras les icones des éléments (retouvables dans perosnnages : 





OBJECTIF : refaire entièrement le design des 5 fiches PNG exportables du site (Équipe, Comparatif d'équipe, Laboratoire de dégâts, Build, Plan de farm). Aujourd'hui elles sont ternes, avec de grandes cases vides, des textes tronqués (« Merveilleux v… »), des « Non confirmé » géants, des images d'artéfacts vides, une carte du monde dans l'en-tête et des chiffres faux. Je te joins `fiches-astralis.html` : c'est la RÉFÉRENCE VISUELLE à reproduire fidèlement (mise en page, tailles, espacements, hiérarchie, effets). Ouvre-le dans un navigateur, change d'onglet et d'élément, et lis son code : il contient déjà le générateur de fond, les palettes et les composants. Reprends-le, puis branche-le sur les vraies données du site. Le résultat doit paraître plus travaillé que le fichier de référence, pas moins.

══ 1. FONCTIONNEMENT GÉNÉRAL ══
- Une fonction unique `renderSheet(type, data, options)` pour les 5 fiches (type = team | compare | lab | build | farm). Même rendu à l'écran (aperçu) et dans le PNG.
- Formats natifs (px) : Équipe = 2000×1570 ; Comparatif = 2000×1530 ; Build = 2000×1420 ; Laboratoire = 2000×2000 ; Plan de farm = 1080×1736. Export en 2x, enregistré en PNG ET copié dans le presse-papiers. Si le contenu dépasse, tu AGRANDIS la hauteur de la fiche : tu ne réduis jamais les cartes de personnages.
- Polices : « Cormorant Garamond » 700 pour les titres et les grands chiffres, « Inter » 400–700 pour le reste. Embarque les fichiers woff2 en local (pas de Google Fonts au moment de l'export) et attends `document.fonts.ready` avant de capturer. Chiffres tabulaires et alignés sur la ligne (`font-variant-numeric: tabular-nums lining-nums`). Sépare les milliers avec une espace insécable fine (« 1 284 530 ») et utilise la virgule décimale.
- Évite les fonctions CSS qui cassent l'export selon ta bibliothèque (backdrop-filter, filtres SVG sur éléments HTML). Si besoin, rends en SVG/Canvas ou capture avec Chromium (Playwright). Teste l'export réel, pas seulement l'aperçu.

══ 2. COULEUR ADAPTÉE À L'ÉLÉMENT (OBLIGATOIRE) ══
Chaque fiche prend la palette de l'élément du personnage principal (build, laboratoire, plan de farm), ou du DPS principal de l'équipe (équipe, comparatif). Les liserés individuels des personnages gardent leur propre couleur d'élément. Palettes (e1 = accent, e2 = clair, e3 = fond très sombre, e4 = fond moyen) :
pyro #ff7a45 / #ffd6bd / #170a0a / #6a2616 · hydro #4aa8ff / #c4e3ff / #08111f / #17457a · anémo #4fe0c0 / #c8f7ec / #061617 / #16584f · électro #b27dff / #e5d4ff / #110a21 / #47307f · dendro #93d443 / #dcf2b7 / #0a1409 / #2f5c17 · cryo #7fd6ff / #dcf3ff / #081420 / #25587a · géo #f2b73f / #ffe6a9 / #161008 / #65491a.
Tous les composants (titres, puces, jauges, bordures, lueurs, fond) dérivent de ces 4 variables, pour qu'un changement d'élément recolore toute la fiche. Respecte aussi l'accent personnalisé de l'utilisateur quand il est défini (sans casser la lisibilité : contraste minimum 4,5:1).

══ 3. FOND : MOTIFS UNIQUES, JAMAIS RÉPÉTÉS ══
Aucun motif répété en mosaïque. Chaque fond est GÉNÉRÉ à partir d'une graine (hash du nom de la fiche) puis dessiné : dégradé de base, 3 lueurs floues décalées, 2 rayons de lumière, un astrolabe (cercles concentriques, graduations, arc brillant) placé dans un coin tiré au sort, un grand glyphe d'élément en filigrane, une constellation de 24 points reliés à leur voisin le plus proche, un motif PROPRE À L'ÉLÉMENT (pyro : braises et traînées ; hydro : ondulations et bulles ; anémo : spirales et arcs ; électro : éclairs ; dendro : lianes avec feuilles ; cryo : cristaux hexagonaux et neige ; géo : grappe d'hexagones et éclats), un grain léger, une vignette et un double cadre avec losanges aux coins. Reprends la fonction `backdrop(W, H, element, seed)` du fichier de référence, adapte-la si nécessaire (Canvas ou SVG), et ajoute un test : deux graines différentes donnent deux fonds différents, la même graine donne le même fond.

══ 4. RÈGLES DE DONNÉES ET D'AFFICHAGE (CORRECTIONS DES BUGS ACTUELS) ══
- Aucun texte tronqué avec « … » : passe à la ligne, 2 lignes maximum, puis réduis la taille avant de couper.
- Aucune carte avec un grand vide : les cartes prennent la hauteur de leur contenu, ou le contenu est dimensionné pour remplir.
- « Rôle non renseigné » n'est JAMAIS affiché : si le rôle manque, la pastille est masquée.
- Valeur inconnue : tuile compacte avec un tiret « — » et une petite pastille « Non confirmé » (jamais un grand rectangle vide). Si tout le bloc de dégâts est inconnu, affiche un état vide élégant d'une ligne.
- Les parts de dégâts d'une équipe somment à 100 % (bug actuel : 110 % et −10 %), sans « % % » en double, sans DPS négatif absurde. Un personnage en doublon dans une équipe n'est pas permis dans le comparatif : signale-le.
- La carte du monde ne sert JAMAIS d'illustration de fiche. L'illustration est le splash art du personnage concerné ; en son absence, une silhouette stylisée aux couleurs de l'élément.
- SPLASH ARTS : utilise les vrais splash arts en haute définition (pas les petites vignettes). Prévois un recadrage par personnage (`object-position`) pour que le visage soit toujours visible et que l'image ne soit pas écrasée ou floue.
- Les images d'artéfacts, d'armes et de matériaux sont toujours chargées avant la capture (précharge + attente) ; en cas d'échec, une icône de repli, jamais une case vide.
- Les pourcentages d'artéfacts utilisent le bon libellé (ATQ %, PV %…) et les sous-stats montrent les « rolls » sous forme de petites barres (comme dans le fichier de référence).
- Pas de valeur inventée : toutes les valeurs viennent des données du site.

══ 5. SPÉCIFICATIONS PAR FICHE ══
5.1 ÉQUIPE (2000×1570) : en-tête (fil d'Ariane « ASTRALIS / ÉQUIPE », nom de l'équipe en très grand, puces « Résonance · N éléments » avec les icônes d'éléments + « Rotation de N s »).
 Section Composition : 4 GRANDES cartes verticales (690 px de haut, 4 colonnes) : portrait/splash de 400 px (object-fit: cover, centré sur le visage), pastille d'élément ronde de 62 px en haut à gauche, pastille de rôle en haut à droite, nom en Cormorant 72 px sur dégradé avec un trait de la couleur de l'élément. Dessous : arme, set 4 pièces (avec icônes), 3 tuiles de stats clés (ATQ, CRIT, MÎ ou Recharge) et la ligne « C · talents ». Les cartes doivent rester grandes : ne les réduis jamais pour gagner de la place, agrandis plutôt la hauteur de la fiche.
 Section Rotation : frise horizontale avec une ligne lumineuse et N nœuds ronds (icône de l'action, anneau de la couleur du personnage, pastille numérotée, libellé complet sur 2 lignes, nom du personnage en dessous).
 Bloc Dégâts théoriques : grand nombre, barre segmentée par personnage + légende avec pourcentages. Pied : « Signé · pseudo » et « Astralis · Équipe ».
5.2 COMPARATIF (2000×1530) : en-tête avec le splash du personnage qui fond sur le fond (masque en dégradé à gauche et en bas). Résultats : deux grandes cartes (DPS d'équipe actuel/modifié avec barres et pastille « +N % », la barre « modifiée » dans la couleur de l'accent ; dégâts par rotation actuel/modifié + phrase d'explication du principal gain, générée à partir des données). Répartition : deux barres segmentées (actuelle/modifiée), somme 100 %. Détail par personnage : 4 GRANDES cartes de 372 px (portrait de 210 px avec nom en grand, pastille d'élément, pastille de delta « +N DPS » en accent si positif ou rouge doux si négatif, barres Avant/Après avec valeurs, ligne « Part de l'équipe : x % → y % »).
5.3 LABORATOIRE (2000×2000) : en-tête avec splash en haut à droite (masque en dégradé), nom du personnage, puces élément + « Niveau · Constellation ». Résultat : grande carte avec le nom de l'attaque, le nombre énorme (partie décimale réduite) + « DGT », et à droite du nombre le bloc « Autres attaques du kit » (4 lignes : nom, dégâts, barre). Dessous, 3 sous-cartes Sans crit / Moyen / Crit (Moyen mis en avant) qui ne doivent JAMAIS être coupées : calcule la hauteur de la carte à partir de son contenu. Décomposition du calcul : chaîne de puces Base × Bonus de dégâts × Crit moyen × DEF × RES × Réaction, avec le signe « × » entre chaque. Statistiques : grille de tuiles compactes avec icône, valeur et petite jauge, plus une tuile pointillée « Cible niv. N · RES N % ». Sensibilité : 4 lignes de barres (+1 % Taux CRIT, +1 % DGT CRIT, +10 MÎ, +1 roll d'ATQ %) avec le gain en %.
5.4 BUILD (2000×1420) : panneau gauche pleine hauteur (690 px) avec le splash du personnage éclairci et fondu vers le fond (sans aucun texte de capture d'écran incrusté), titre « Build N » en très grand, nom, puces élément et niveau, 6 losanges de constellation remplis selon le C, signature en bas. À droite : ligne Arme (icône, nom, « Niv. · R ») + 3 anneaux de talents ; 8 tuiles de statistiques finales avec icônes ; 5 cartes d'artéfacts (en-tête avec l'image de la pièce, +20 et étoiles, stat principale en grand, 4 sous-stats avec valeur et barres de rolls) avec la mention « Set 4 pièces · Nom » ; une bande « Bonus de set » (2 pièces / 4 pièces) issue des données du set, texte complet avec retour à la ligne ; bloc Dégâts théoriques (action, Sans crit / Moyen / Crit).
5.5 PLAN DE FARM (1080×1736) : GARDE la mise en page actuelle (puces Niv./Talents, kicker « PLAN DE FARM · ÉLÉMENT », nom, barre de progression, grille à 2 colonnes de matériaux avec icône, nom, « Possédé x / total » et quantité en grand). AJOUTE seulement le splash art du personnage dans le grand rectangle central en haut (x 44 → 1036, y 112 → 430, coins arrondis 30 px, bordure et halo de la couleur de l'élément, dégradé vers le bas pour la lisibilité, puces Niv./Talents et icône d'élément posées dessus). Le splash est recadré en object-fit: cover, centré sur le visage. Vérifie que « Possédé 0 / 5 377 500 » ne se coupe plus (nombres compacts, quantité sur une seule ligne).

══ 6. TESTS ET LIVRABLES ══
- Un script de test génère les 5 fiches pour 7 éléments × 3 jeux de données (complet, partiel avec valeurs inconnues, extrême : noms très longs, 8 étapes de rotation, nombres à 9 chiffres) et vérifie : aucune erreur console, aucune image manquante, aucun texte débordant ou tronqué, contraste suffisant, parts de dégâts = 100 %, cartes de personnages à leur taille nominale.
- Place les captures dans `docs/captures/fiches/` et mets à jour `docs/SUIVI-FICHES.md`.
- Compare avec `fiches-astralis.html` : même hiérarchie, mêmes espacements, mêmes effets.
- Commit par fiche, puis push final. Réponse finale : liste des fiches faites/pas faites, fichiers modifiés, comment vérifier en 3 clics, hash du dernier commit.

- le bloc "Primogemmes gagnées" est pas fou j'aimeraiplutot des diagrammes camembert
- fais un meilleur bloc Scénarions : nombre de 50/50 perdus

