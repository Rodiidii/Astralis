# Audit et optimisation des performances

Date : 16 novembre 2026

## Résultats mesurés

Mesure du démarrage à froid sur le tableau de bord Genshin, dans Chromium via Playwright, sur le serveur local du projet. Chaque mesure utilise un nouveau contexte de navigateur et bloque le service worker afin d'observer le coût réel des ressources chargées par l'application.

| Indicateur | Avant | Après (médiane de 3 lancements) | Évolution |
| --- | ---: | ---: | ---: |
| Application prête (`appReady`) | 34,4 s | 8,7 s | 3,97× plus rapide, soit 74,8 % de temps d'attente en moins |
| DOM chargé | 24,6 s | 3,9 s | 6,28× plus rapide |
| Ressources transférées | 12,67 MB | 6,66 MB | 47,4 % de données en moins |

Les trois temps `appReady` après changement étaient 8,2 s, 12,4 s et 8,7 s. Les variations viennent surtout du démarrage du rendu 3D et des longues tâches JavaScript. Le gain indiqué utilise leur médiane, comparée à la mesure de référence prise avant les changements, sur la même machine et avec le même scénario. Il décrit ce scénario de démarrage, pas toutes les pages ni tous les appareils.

## Nouveau tableau de bord Genshin

Le tableau de bord planétaire a été remplacé par un carnet d’expédition illustré : une carte schématique de Teyvat relie sept repères cliquables aux tâches, au farm, aux équipes, aux personnages, aux événements, à l’endgame et aux vœux. La page conserve aussi une tournée de farm interactive, une session chronométrée, le solde global des vœux, les échéances et la préparation du roster. Les globes, la scène orbitale et leurs mises à jour d’animation ne sont plus créés sur cette page. L’ancien HTML caché du tableau de bord ne déclenche plus non plus la préparation des cartes inutilisées.

Avant l’ajout de la carte, une mesure froide avait relevé `appReady` à 2,85 s et 5,04 MB transférés. Après l’ajout des sept repères régionaux, le dernier relevé était à 8,14 s et 5,78 MB. Les temps des audits isolés varient fortement selon les longues tâches du navigateur ; je ne présente donc pas le relevé rapide précédent comme la performance actuelle. Par rapport au contrôle précédent à 8,7 s et 6,66 MB, ce dernier relevé est proche en temps et transfère environ 13 % de données en moins. À confirmer par plusieurs lancements avant d’annoncer un gain de vitesse stable.

Le dernier contrôle d’animation a relevé une médiane de 16,7 ms entre images ; 12 mesures sur 28 dépassaient 33 ms et le p95 était de 766,7 ms pendant les tâches de chargement. Cet échantillon est trop court et trop variable pour conclure que l’animation reste fluide en continu. La page n’anime plus les planètes, mais des tâches globales peuvent encore provoquer des à-coups.

## Changements réalisés

- Le catalogue Pokémon complet (environ 6,28 MB) n'est plus téléchargé au démarrage. Il arrive à la première ouverture du classeur ou des boosters.
- Le profil Honkai: Star Rail n'est chargé que lorsqu'une page HSR en a besoin.
- Le module et les données de la page des relations, ainsi que le laboratoire de dégâts, sont chargés à l'ouverture de leur page, avec un état de chargement et une option de réessai en cas d'échec.
- Le service worker ne précharge plus le grand catalogue Pokémon ni toutes les couvertures des boosters. Ces ressources sont mises en cache lorsqu'elles sont réellement demandées. La version du cache a été renouvelée.
- Les trois icônes de jeu du bandeau ont été redimensionnées à la taille réellement affichée. Leur poids cumulé passe d'environ 1,77 MB à 284 KB, soit près de 84 % de moins.
- Ajout d'un outil reproductible `tools/performance-audit.py`, qui mesure les temps de démarrage, les transferts, les ressources principales, les tâches longues et les erreurs JavaScript.

## Coûts qui restent

Le tableau de bord Genshin n’utilise plus Three.js ni de scène de planètes. Le script principal approche 906 KB et les feuilles CSS chargées globalement environ 1,54 MB ; ils sont désormais les principaux coûts fixes du démarrage. Un découpage plus large du JavaScript et du CSS pourrait encore réduire le temps de chargement, mais demande une passe de vérification sur toutes les pages.

Le scénario d'audit bloque les accès Internet externes. Les fonctions qui en dépendent (comme les informations météo du lancement) peuvent donc afficher leur solution de repli pendant cette mesure.

## Vérifications

- Contrôles de syntaxe JavaScript : réussis.
- Tests ciblés relations, comparaisons et checklist endgame : 22 réussis.
- Vérification navigateur des relations : réussie.
- Vérification navigateur du laboratoire de dégâts : réussie.
- Vérification navigateur du nouveau tableau de bord : farm du jour cochable, gains quotidiens ajoutés au solde global, événements visibles, aucun globe planétaire, aucun débordement sur 1920×1080 ou 390×844, aucune erreur JavaScript.
- Aucune erreur JavaScript détectée dans les trois mesures finales.

Pour refaire la mesure : `python tools/performance-audit.py`.
