# Astralis — points ouverts

Source de travail courante. Un point n’est déplacé vers FAIT.md qu’après réalisation et vérification. Les annexes et anciens suivis restent des références historiques, pas une deuxième liste active.

Règles et détails : [MISSION-AUTONOME-COMPLETE.md](MISSION-AUTONOME-COMPLETE.md). Historique des clôtures : [FAIT.md](FAIT.md).

- [ ] **P0-FARM-04 — Revalider toute la page.** Considérer la page comme non acceptée visuellement. Reprendre les autres exigences de farm ci-dessous : portraits, objectifs compacts, talents individuels, synthèse, priorités, hebdomadaires, calendrier, récoltes, export. Prouver les changements dans la page réellement utilisée, après vérification du serveur et du cache.

- [ ] **P0-BUILD-02 — Cohérence des vues.** Vérifier les mêmes statistiques dans Mes builds, la fiche personnelle, l’équipe, le laboratoire et le PNG ; contrôler les pourcentages/plats, bonus élémentaires et doubles applications. Tester les changements d’arme, de pièce et de build, puis la persistance après rechargement.

- [ ] **P0-QA-01 — Preuves.** Fournir captures comparées de ces quatre pages, inspection des images réellement chargées, résultats numériques de référence, interactions et exports réels. Reprendre les cas qui échouent ; ne pas réutiliser une ancienne capture pour prouver une modification nouvelle.

- [ ] **P0-LAB-01 — Vraie refonte du laboratoire.** Repenser composition, hiérarchie, couleurs du personnage, icônes, densité, panneaux de conditions, choix du coup et résultats. Les choix principaux (personnage/build/arme/coup) doivent être faciles à trouver ; résultats et gain compréhensibles sans parcourir une longue page. Réglages experts dépliables, états vide/chargement/aucun résultat/erreur soignés, desktop et mobile. Fournir des captures avant/après ; une nouvelle couleur seule ne clôture pas ce point.

- [ ] **P0-LAB-02 — Calculs et gains en pourcentage fiables.** Réviser les pourcentages de stats, talent, critique, réactions, bonus, réduction de résistance et gains vs référence. Séparer fractions et pourcentages affichés, bonus additifs et multiplicatifs, valeurs plates et pourcentages. Le gain est calculé sur le même coup, le même ennemi, le même mode CRIT et les mêmes conditions : (candidat − référence) / référence × 100 si la référence est strictement positive. Si la référence est nulle/inconnue : afficher un état explicite, pas Infinity, NaN ou 0 % inventé. Une baisse réelle ne devient pas un gain positif artificiel ; les meilleurs candidats doivent être classés correctement. Afficher clairement la référence utilisée et les gains par action/rotation quand disponibles.

- [ ] **P0-LAB-03 — Meilleur calcul d’optimisation.** Réviser l’objectif optimisé, contraintes, conditions d’armes/sets/passifs, nombre d’impacts, quotas et temporisation des effets. L’évaluation d’un candidat doit utiliser les mêmes formules que la vue de calcul et la rotation. Optimisation exacte lorsqu’annoncée exacte ; toute borne/élagage reste valide pour les effets complexes. Progression, annulation, estimation et filtres doivent rester pratiques, sans blocage de l’interface. Comparer top N à une recherche brute, puis mesurer des inventaires variés de 1 000/5 000 pièces et des rotations complexes ; ne pas se contenter de pièces identiques dédoublonnées.

- [ ] **P0-LAB-04 — Optimisation reliée aux équipes.** Utiliser la vraie équipe de quatre personnages, leurs builds, constellations, armes, sets, buffs/debuffs, conditions sur/hors terrain, résonances et rotation. Calculer les contributions individuelles et le total/DPS cohérent. Permettre d’optimiser une action, un personnage dans l’équipe ou l’objectif d’équipe avec les pièces possédées ; respecter priorités/verrous et ne pas attribuer la même pièce à plusieurs personnages. Ne pas présenter une somme de valeurs saisies comme une simulation complète.

- [ ] **P0-LAB-05 — Vérification croisée.** Tests indépendants des %, cas connus sans buff/avec chaque buff/cumul, expiration/quotas/multi-impacts, référence nulle/inconnue, résultats meilleurs et moins bons, cohérence entre calcul direct, optimiseur, rotation, équipe, build et PNG. Le cas Skirk/Éclazur/Furina C2/Escoffier/Mona C4 reste une référence, à compléter par Yun Jin, Lauma et les autres mécaniques.

- [ ] **P0-TEAM-03 — Design et usage de la page Équipes.** Améliorer aussi la page et les fiches d’équipe : composition, sélection/édition des membres, arme/set/pièces, buffs, rotation, statistiques simplifiées et résultats. Boutons et ouvertures doivent fonctionner durablement, sans scintillement. Conserver sauvegarde, import et export. Les icônes des skills de rotation et les statistiques restent soumises aux P0-TEAM-01/02 ; le gain en % et le total doivent correspondre au laboratoire.

- [ ] **RESTE-001** — Conserver mode spatial et mode normal sans thème espace ; ajout/retrait/masquage/déplacement/redimensionnement des widgets, plusieurs dispositions, réinitialisation discrète, palette de commandes et focus.

- [ ] **RESTE-002** — Scène recentrée. Clic sur une planète : vraie transition orbitale/caméra, planète visible d’un côté et fiche de l’autre ; positions gauche/droite/haut/bas personnalisables, fiches assez grandes, pas de petit bloc qui impose du scroll inutile.

- [ ] **RESTE-003** — Fond procédural bleu/violet, sans image de galaxie ni image IA ; étoiles, constellations, poussières, champs d’astéroïdes et étoiles filantes visibles et fluides.

- [ ] **RESTE-004** — Une planète par région entière, îles incluses ; planète centrale = toute la carte de Teyvat. Agrandir les terres par rapport à la sphère, avec couleurs géographiques cohérentes ; relief en volume, pas seulement dessiné dans la texture.

- [ ] **RESTE-005** — Planètes de tailles/vitesses différentes, rotation propre et révolution autour du centre ; ne pas se toucher. Personnalisation individuelle des surfaces, couleurs, orbites, tailles, vitesses et effets. Les animations restent visibles pendant la consultation.

- [ ] **RESTE-006** — Mondstadt : vert/bleu, vents visibles sans anneaux, reliefs et ville ; Venti.

- [ ] **RESTE-007** — Liyue : roche/mines jaune/gris, davantage de pics de hauteurs variées, pierres brillantes et astéroïdes dorés ; Zhongli.

- [ ] **RESTE-008** — Inazuma : archipel entier, violet/rose/vert, plusieurs orages dans le style initial, cerisier et pétales, ville ; Raiden.

- [ ] **RESTE-009** — Sumeru : forêt tropicale avec bosquets d’arbres, désert, pyramides et grand arbre, lucioles et tornade de sable localisée ; Nahida.

- [ ] **RESTE-010** — Fontaine : terres/eaux, grandes montagnes et lacs, relief/ville et effet aquatique adapté ; Furina.

- [ ] **RESTE-011** — Mer primordiale : eau seule, bleus variés, courants et fronts de tsunami volumétriques, nuages/pluie allégée et anneaux d’eau ; Neuvillette.

- [ ] **RESTE-012** — Natlan : canyons, savanes, gros volcan avec vraie grosse éruption, lave, fumée et cendres ; Mavuika.

- [ ] **RESTE-013** — Nod-Krai : taïga/toundra/archipels/côtes lunaires, grande base fatui, trois lunes de plans/sens différents, aucune neige ; Columbina.

- [ ] **RESTE-014** — Snezhnaya : plaques de glace, blanc/bleu foncé/gris, tempête de neige sphérique et astéroïdes neigeux, pas de neige distribuée en carré ; Tsarine.

- [ ] **RESTE-015** — Icônes des neuf personnages au même format/source que les équipes, pas d’icônes génériques à leur place.

- [ ] **RESTE-016** — Centre : carte fournie ; blanc extérieur remplacé par #20638C. Trois lunes ET les trois objets Vie/Temps/Mort conservés simultanément, sur des orbites inclinées comme un atome, avec profondeur/occlusion. Ne pas confondre les trois lunes avec les trois objets.

- [ ] **RESTE-017** — Villes/monuments reconnaissables à l’échelle ; vérifier toute promesse de fidélité. Si relief estimé ou modèle original indisponible, documenter précisément la limite au lieu de déclarer une reproduction exacte.

- [ ] **RESTE-018** — Supprimer Mémo rotation, Résumé & priorités, Constellation d’activité et Repère du jour selon les demandes successives.

- [ ] **RESTE-019** — Bannières automatiques : personnages/armes/à venir, minuteur à droite, icônes rondes sur une ligne sans noms ni raretés ; vérifier les deux bannières côte à côte et les portraits.

- [ ] **RESTE-020** — Daily Challenge : équipe aléatoire parmi tous les personnages si aucune sélection, sinon seulement parmi ceux choisis. Fusion cohérente avec le défi/boss.

- [ ] **RESTE-021** — Ma session : outil compact et utile. Événements : images/icônes et présentation aérée. Mur de personnage : personnage Enka et build directement visibles. Endgame : composition détaillée par parties et prochaine rotation quand publiée.

- [ ] **RESTE-022** — Référence absolue : docs/reference/cards.html. Cadres, proportions, bordures, raretés et effets préservés ; test visuel côte à côte qui échoue en cas de différence. Ne pas moderniser ce design.

- [ ] **RESTE-023** — Classeur statique ; effets complets seulement consultation individuelle/page/booster. Même rendu dans détail, page, booster et export.

- [ ] **RESTE-024** — Art unique pour chaque carte HSR/Genshin/Wuwa ; sources officielles HoYoverse, Kuro Games (explicitement autorisé) ou images fournies ; pas de fan art, icône ou splash de substitution. Pas de duplication sous prétexte de catalogue incomplet.

- [ ] **RESTE-025** — Audit SHA/pixels/doublons/manquants, crédits, recherche autorisée et liste précise des images réellement encore nécessaires. « Une seule image trouvée » ne prouve pas « une seule image existe ».

- [ ] **RESTE-026** — Bon cadrage/visage, cover sans déformation, résolution, squelette, espace réservé, cache/préchargement booster, diagnostic ?debug=cards.

- [ ] **RESTE-027** — Texte noir à fin contour blanc, cadres fins/ciselés, descriptions sous attaques lisibles, aucun débordement ; règles détaillées des raretés dans les messages initiaux et la référence. Ne pas ajouter néon/grille/motif statique/coins jaunes arrondis.

- [ ] **RESTE-028** — Quantités : 60 Full Art, 30 Groupes, 25 Secrètes, 25 Légendes, 17 Gold, 10 Astrales ; pas de Lauma dans ce catalogue de cartes (cette exclusion ne concerne PAS le laboratoire). Huohuo Gold ; exclusions croisées de personnages entre raretés selon le catalogue demandé, Rhinedottir autorisée.

- [ ] **RESTE-029** — Énergie simple avec emplacement pour images futures ; armes/lightcones ; quatre couvertures de boosters HSR/Genshin/crossover/variante ; Obsidian unique.

- [ ] **RESTE-030** — Textes propres au vrai kit de chaque personnage, noms/effets/coûts et règles de rareté, pas un texte générique commun. Accessibilité, 100+ cartes fluides, effets hors écran suspendus, mouvement réduit.

- [ ] **RESTE-032** — Splashs proportionnés et nets ; statistiques simples et vraies ; sous-stats de toutes les pièces déjà équipées visibles ; artéfacts existants importables dans le build.

- [ ] **RESTE-034** — Propriété : constellation possédée pour chaque personnage et nombre possédé pour chaque arme. Passifs/constellations complets, dont conditions Hexerei ; Aino a son splash adapté.

- [ ] **RESTE-035** — Création de pièce : set/emplacement/principale/sous-stats ; validation structurelle, paliers suspects en diagnostic selon la décision utilisateur, formulaire qui reste ouvert et se réinitialise proprement.

- [ ] **RESTE-036** — Laboratoire : choix NA/CA/plongeante/E/Q et coup précis, multi-impacts corrects, arme directement modifiable, sets autorisés/imposés/exclus et conditions. Inventaire utilisateur par défaut. Liste de priorité pratique avec recherche/position/glisser et option claire. Sauvegarde TC - nom.

- [ ] **RESTE-037** — Cas de validation : Skirk C0 niveau 90, Éclazur R1 niveau 90, Furina C2, Escoffier C0, Mona C4, paramètres modifiables ; tester chaque effet et cumul puis rotation. Inclure Yun Jin, Lauma, Shenhe et toutes les familles de dégâts ajoutés, sans confondre leurs quotas/canaux/conditions.

- [ ] **RESTE-038** — Configs/Team exports JSON fournis et Celestia : téléchargement dans le projet, vérification périodique, badge Nouveau sur ajout/changement jusqu’à consultation, imports persistés et équipe éditable. Les restrictions des sources ne doivent pas effacer les exports valides.





- [ ] **RESTE-044** — Spécialités : capacité du monde sourcée, repousse 48 h, nombre de passages, stocks partagés, pas de capacité inventée.

- [ ] **RESTE-046** — Solde = destinées + floor(primos/160), restes conservés. Solde éditable à son emplacement, gains journaliers crédités une seule fois et historisés.

- [ ] **RESTE-047** — Objectifs : pity/garantie/radiance actualisables, seuils personnels 80 perso/65 arme demandés, copies/constellations/raffinements actuels et cibles, ordre de plusieurs objectifs et déficit de garantie. Dates versions/phases estimées jusqu’à 8.8 clairement signalées.

- [ ] **RESTE-048** — Deux graphes (solde réel / réel + estimation), probabilités par objectif, scénarios de pertes de 50/50 et Capture de radiance documentée, pas de garantie inventée.

- [ ] **RESTE-049** — Revenus période : 60/jour +90 si Faveur ; cycle 42 j depuis 04/11/2026 puis 16/12/2026 ; code live +300 le deuxième vendredi avant prochaine MAJ ; +450 à J7 ; +40 à J20 ; boutique 5 vœux le 1er ; Théâtre le 1er et Abysses le 16 avec montants moyens saisis ; événements troisième dimanche +1000, quatrième dimanche +420, cinquième mercredi après lancement +420 ; autres +140/MAJ, +500 et 2 vœux/MAJ ; cartes environ 3000 selon scénario ; cadeaux/multis/primos libres saisissables ; transfert vers graphe théorique.

- [ ] **RESTE-052** — Actualités officielles séparées des sessions/objectifs de farm ; calendrier compact avec plages événements/bannières/endgames, MAJ, compteurs et rafraîchissement ; historiques/prochaines rotations si vraiment publiés, pas de composition copiée pour remplir.

- [ ] **RESTE-053** — Un seul nœud MC, regroupement des variantes Aether/Lumine ; dernier choix de navigation Voyageur/Paimon selon complément, locuteur original conservé.

- [ ] **RESTE-054** — Régions : Zibai à Liyue ; Sandrone, Vesna, Vodyanista, Mitya, Odette, Danica, Alyosha à Snezhnaya ; Tsarine à Snezhnaya et icône appropriée. Vérifier icônes de Mitya/Valeriy et des PNJ importants.

- [ ] **RESTE-055** — Inclure Alice, Dottore, Dainsleif, Capitano, Ronova, etc., avec preuves de liens et régions cohérentes ; contrôler Archons entre eux, Neuvillette–Archons, Mavuika–Archons, Columbina–Nod-Krai/Snezhnaya.

- [ ] **RESTE-056** — Nœuds assez grands et espacés, aucun personnage hors de son secteur ; icônes identiques aux équipes. Menu interne gauche plus beau et lisible, sans réintroduire le bloc de quatre compteurs que l’utilisateur a demandé de supprimer.

- [ ] **RESTE-057** — Un clic = personnage et liens ; deux clics = modale duo compacte/élégante. Sans lien direct : plus court chemin sourcé visible. Retour sans sélection immédiatement accessible. Transitions au changement de personnage, trois lunes et effets autour de l’anneau.

- [ ] **RESTE-058** — Mention dans le lore, direction des preuves, scènes, voix et modes/rangs documentés ; ne pas transformer un rang de preuve en affection canonique.

- [ ] **RESTE-059** — Fiches lore plus profondes, événements passés classables par région, factions revues, trailers officiels attribués au bon sujet, lecture au clic et youtube-nocookie, repli lien si indisponible, badge Non confirmé pour ce qui n’est pas prouvé.

- [ ] **RESTE-060** — Yun Jin : bonus de dégâts ajoutés, DEF source dynamique, quotas, éléments d’équipe, constellations et interactions.

- [ ] **RESTE-061** — Lauma : bonus spécifiques Bloom/Hyperbloom/Burgeon/Lunar-Bloom et leurs conditions/consommations.

- [ ] **RESTE-062** — Autres sources de dégâts ajoutés hors Shenhe et Escoffier C2 : inventaire exhaustif et implémentation/test de chacune, notamment Xianyun.

- [ ] **RESTE-063** — Tous les effets de tous les personnages, constellations, armes et raffinements : le répertoire de textes n’est pas un moteur complet de leurs effets.

- [ ] **RESTE-064** — Tous les buffs/debuffs des sets, leurs conditions, règles de cumul et fonctionnement sur/hors terrain vérifiés systématiquement.

- [ ] **RESTE-065** — Formules spécifiques Lunar-Charged, Lunar-Bloom, Lunar-Crystallize, Stellar-Conduct et Stellar Swirl : encore TODO_DATA.

- [ ] **RESTE-066** — Simulation automatique des applications élémentaires, auras et ICD ; actuellement les impacts réagissant sont explicitement renseignés.

- [ ] **RESTE-067** — Rotation d’équipe complète : changements de personnage et statistiques de chacun, déclenchement des buffs/debuffs et coordination des attaques hors terrain.

- [ ] **RESTE-068** — Production automatique de la fanfare depuis les variations de PV, soins et invocations ; actuellement c’est une hypothèse saisie.

- [ ] **RESTE-069** — Génération automatique des attaques supplémentaires de toutes les constellations, notamment celles hors du cas Skirk C0 testé.

- [ ] **RESTE-070** — Branchement complet du moteur et des buffs du laboratoire dans la page Équipe pour calculer réellement tous les dégâts des quatre personnages. Un total renseigné/importé n’est pas une simulation.

- [ ] **RESTE-071** — Optimisation multicœur sur plusieurs Workers avec répartition des branches et partage de la meilleure borne ; un Worker est utilisé actuellement.

- [ ] **RESTE-072** — Affinage global de toute la liste de priorité par échanges de pièces : désactivé explicitement dans le code.

- [ ] **RESTE-073** — Analyse garder/améliorer/jeter et simulation Monte-Carlo de montée des artéfacts non terminées selon le cahier complet.

- [ ] **RESTE-074** — Validation exhaustive des recommandations de sets par personnage, arme, équipe et objectif ; les cartes de recommandations ne prouvent pas ce classement global.

- [ ] **RESTE-075** — Élimination de tout besoin de traduction manuelle des conditions importées de GO/Celestia. Certains chemins/bonus restent à mapper.

- [ ] **RESTE-076** — 1 124 illustrations manquantes sur 1 404 cartes ; 280 illustrations attribuées sans réutilisation selon l’audit actuel.

- [ ] **RESTE-077** — 81 kits manquants dans public/card-kits.json ; l’exigence de texte personnalisé complet n’est donc pas satisfaite pour toutes les cartes.

- [ ] **RESTE-078** — Cadrage/point focal vérifiés individuellement pour toutes les illustrations.

- [ ] **RESTE-079** — Véritable modèle visuel propre pour toutes les catégories supplémentaires : Équipement, Énergie, Aeon et Obsidian réutilisent des modèles existants. Ce n’est pas un design distinct validé pour chacune.

- [ ] **RESTE-080** — Validation stricte du catalogue intégral sans images manquantes. Le test de fidélité des modèles et un audit limité au design ne remplissent pas cette exigence.

- [ ] **RESTE-081** — Voix et répliques personnalisées pour tous les personnages des trois jeux ; seulement 15 fichiers de profils Genshin sont présents.

- [ ] **RESTE-082** — Toutes les situations demandées pour chacun : arrivée, matin/soir, ressources pleines, 50/50, Radiance, bannières, fin de farm, etc.

- [ ] **RESTE-083** — Dialogues originaux pour toutes les paires pertinentes, pilotés systématiquement par les preuves du réseau de relations.

- [ ] **RESTE-084** — Audit global d’absence de phrases communes et couverture de toutes les situations.

- [ ] **RESTE-085** — Écran de bienvenue final réunissant grand compagnon, saisie animée, citations, résumé du jour et entrée. L’écran de chargement avec avatar ne constitue pas toute cette demande.

- [ ] **RESTE-086** — Import Akasha complet avec classements/percentiles par attaque, comparaison locale, historique et export. Le hub actuel prépare les liens Akasha/Celestia et importe la vitrine Enka.

- [ ] **RESTE-087** — Récupération de tous les personnages/builds d’un compte non exposés par une source publique.

- [ ] **RESTE-088** — File Valider/Modifier/Rejeter des nouveaux personnages.

- [ ] **RESTE-089** — Synchronisation globale de toutes les familles de données et des trois jeux : les flux sont distincts et plusieurs corpus sont générés par des outils séparés.

- [ ] **RESTE-090** — Régénération automatique de toutes les relations et du lore à chaque arrivée de nouvelles répliques/personnages.

- [ ] **RESTE-091** — Diagnostic et test général démontrant qu’un futur cas analogue au splash de la Tsarine ou au kit de Danica est réparé par la chaîne de sources, sans correctif individuel.

- [ ] **RESTE-092** — Journal exhaustif de toutes les valeurs/descriptions de tous les jeux, par version. Un journal de différences Genshin existe, sans garantir cette couverture intégrale.

- [ ] **RESTE-093** — Fenêtre Quoi de neuf complète, automatique et revoyable, alimentée par changelog.json ; ce fichier n’est pas présent.

- [ ] **RESTE-094** — Téléchargement Celestia périodique lorsque le serveur local est fermé. L’automatisation actuelle fonctionne pendant son ouverture.

- [ ] **RESTE-095** — Garantie de récupérer tous les exports et prochaines rotations malgré des sources indisponibles ; les fichiers précédents sont conservés, mais l’indisponibilité n’est pas résolue.

- [ ] **RESTE-097** — Hébergement gratuit HTTPS déployé pour cette application avec les routes dépendant du serveur.

- [ ] **RESTE-098** — Remplacement/hébergement gratuit des fonctions de server.py nécessaires à l’iPhone.

- [ ] **RESTE-099** — Validation WebKit/iPhone de l’installation, du démarrage autonome et du fonctionnement hors ligne.

- [ ] **RESTE-101** — Parcours complet de sauvegarde/restauration et rappels pour les données locales de l’iPhone.

- [ ] **RESTE-102** — Les archives contiennent 142 profils, 11 régions et 54 entrées d’événements, mais pas des dossiers de profondeur uniforme avec tous les thèmes demandés pour chacun.

- [ ] **RESTE-103** — Histoire, personnalité, objets, anecdotes, citations, voix, chronologie, factions et régions : présence et profondeur à contrôler personnage par personnage.

- [ ] **RESTE-104** — Dossiers de tous les événements passés, Shades, Sinners et autres figures : couverture non exhaustive.

- [ ] **RESTE-105** — Factions : rattachements historiques/actuels et affichage à vérifier intégralement.

- [ ] **RESTE-106** — Trailers : filtrage d’attribution et lecteur au clic présents ; couverture et attribution de tout le catalogue non validées individuellement.

- [ ] **RESTE-107** — Relations : 141 identités, 1 124 paires et 4 989 preuves dans le corpus audité ; cela ne prouve pas l’exhaustivité de tous les dialogues du jeu.

- [ ] **RESTE-108** — Relations/quête : métadonnées précises, témoignages et catégories de quêtes à compléter là où la source ne les fournit pas.

- [ ] **RESTE-109** — Voix et traductions dans toutes les langues sélectionnables : seulement les ressources effectivement présentes sont utilisables.

- [ ] **RESTE-110** — Comparaison finale systématique avec la vidéo et toutes les références, notamment les dix paires de contrôle et le mobile : non clôturée.

- [ ] **RESTE-111** — Un rang de preuve ou une scène commune ne constitue pas une mesure canonique d’affection ; ne pas présenter le classement comme tel.

- [ ] **RESTE-112** — Les cartes complètes et volumes sont intégrés, mais les frontières sont estimées et le relief dérivé des couleurs/sommets ; ce n’est pas le terrain exact du jeu.

- [ ] **RESTE-113** — Villes, monuments et base fatui : représentations simplifiées, placements approximatifs et proportions accentuées ; pas des reproductions fidèles à l’échelle.

- [ ] **RESTE-114** — Objets Vie/Temps/Mort : silhouettes extrudées depuis les images ; modèles originaux non récupérés, les liens ayant répondu 403.

- [ ] **RESTE-115** — Ampleur/qualité finale des effets par région et fluidité sur la machine de l’utilisateur : pas validées exhaustivement dans toutes les personnalisations, tailles, destinations et configurations.

- [ ] **RESTE-117** — Couverture des matériaux, jours de domaine, boss et spécialités pour tous les personnages et futurs ajouts : non certifiée exhaustive.

- [ ] **RESTE-118** — Dates fondées sur des rendements moyens et hypothèses ; mobs/couronnes sont supposés disponibles et certaines conversions hebdomadaires supposées possibles.

- [ ] **RESTE-120** — Les graphes sont basés sur une simulation reproductible de 6 000 essais et des courbes communautaires, pas une énumération exacte de toutes les branches de résultats.

- [ ] **RESTE-123** — Les cinq fiches de la référence HTML sont intégrées et testées. La demande initiale de trois modèles par type, trois orientations et clair/sombre ne coexiste pas entièrement avec ces modèles : plusieurs options sont verrouillées pour respecter la référence.

- [ ] **RESTE-124** — Personnalisation libre de chaque bloc, police et mise en page : pas un éditeur complet.

- [ ] **RESTE-125** — Fonction commune pour tous les exports du site : personnages, équipes, builds, labo et farm couverts ; uniformisation totale des fiches armes/sets et tableaux non certifiée.

- [ ] **RESTE-126** — Calcsheet : personnalisation séparée en-têtes/cellules, bordures/dimensions et export conservant vraiment les couleurs dans Google Sheets non validés selon le cahier complet.

- [ ] **RESTE-127** — Migration totale de toutes les pages vers un design system unique non terminée ; des couches CSS et composants natifs subsistent.

- [ ] **RESTE-128** — Tâches, notes, favoris, médias, compagnon, réglages, profil/import et journal n’ont pas tous reçu une refonte complète validée au niveau demandé.

- [ ] **RESTE-129** — Registre local exhaustif d’icônes officielles de tous les jeux/données non garanti ; des ressources distantes et replis restent utilisés.

- [ ] **RESTE-130** — Virtualisation complète et comportement homogène de tous les catalogues, tous sélecteurs et toutes fiches : vérification finale restante.

- [ ] **RESTE-131** — Audit toutes pages à 390/768/1440 px, thèmes clair/sombre, clavier, lecteur d’écran et mouvement réduit : pas de matrice complète publiée.

- [ ] **RESTE-132** — Performance sur grands inventaires variés et rotations complexes : le benchmark 1 000/5 000 utilise des pièces identiques largement dédoublonnées ; ce n’est pas un stress test représentatif.

- [ ] **RESTE-133** — Audit formel INVENTAIRE initial/final pour prouver qu’aucune fonctionnalité n’a disparu : pas clôturé.

- [ ] **RESTE-134** — SUIVI.md, NOUVEAUTES.md et documentation finale : suivi à réconcilier, NOUVEAUTES.md absent, captures avant/après exhaustives non livrées.
