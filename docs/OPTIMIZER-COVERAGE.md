# Couverture du calculateur — 18 novembre 2026

**La modélisation exhaustive demandée n’est pas terminée.** Les données importées, les composantes explicitement calculées et une validation complète des mécaniques sont trois états différents.

## Relevé reproductible

Exécuter `node tools/audit-lab-coverage.mjs` génère `docs/optimizer-coverage.json`, avec une entrée pour chacun des 124 personnages, chacune des 255 armes (R1 à R5) et chacun des 63 sets. Ce relevé identifie les composantes explicites et les lacunes ; il ne constitue pas une certification indépendante de tous les effets.

## Ajouts de cette intervention

- Tables de coefficients nommés, descriptions des talents et six constellations pour 120 personnages dans `data/lab-kit-snapshot.json`.
- Sept variantes élémentaires du Voyageur, sélectionnées pour Aether/Lumine selon l’élément simulé. Manekin/Manekina ne sont pas assimilés à une variante supposée.
- Sources françaises et paramètres numériques provenant du même commit de genshin-db. Les tableaux compacts de Genshin Optimizer ne sont plus associés directement aux indices des descriptions : cette association était incorrecte pour certains personnages, dont Ayaka.
- Niveaux de talents accordés par les constellations : identification du talent réellement nommé, C3/C5 et variantes qui améliorent l’attaque normale. Vérification sur les 120 kits, Aloy conservant zéro amélioration. Le niveau saisi est le niveau de base ; le résultat est plafonné à 15.
- Une attaque ATQ + maîtrise (ou autres statistiques explicites) est un seul impact additionnant ses coefficients. Elle ne double ni les réactions ni la consommation des quotas de dégâts ajoutés.
- Variantes basse/haute des coefficients de chute séparées.
- 83 armes avec des composantes explicitement décrites, dont Éclazur avec son modèle dédié. Ce chiffre ne signifie pas que leurs effets complets, coups supplémentaires et apports énergétiques sont tous modélisés.
- Conversions PV/maîtrise en ATQ, ajouts de dégâts fondés sur DÉF/PV/maîtrise et taux CRIT propre à une catégorie reliés aux statistiques du candidat de l’optimiseur.
- Buffs explicites supplémentaires pour Lisa, Bennett, Xiangling, Xingqiu, Zhongli, Chongyun, Albedo, Diona, Sucrose, Rosalia, Kazuha, Raiden, Gorou, Sara, Dori, Nahida, Faruzan, Chevreuse et Citlali. Un personnage de cette liste peut encore avoir de nombreuses mécaniques non couvertes.
- Bennett/Sara utilisent l’ATQ de base saisie et le coefficient du talent au niveau sélectionné, avec les améliorations de constellation. Gorou/Faruzan utilisent également leurs tables de talents. Une valeur source indispensable absente bloque le calcul au lieu de devenir silencieusement zéro.
- Bonus de réactions de plusieurs sets, dont Sorcière, Colère de tonnerre, Fleur du paradis perdu et sets astraux. Rêve de la nymphe utilise ses véritables paliers non linéaires.
- Buffs transmissibles de Roche ancienne, Parchemin, Sérénade, Don céleste et Cœur de la fournaise, avec les variantes disponibles et déduplication par set. Les conditions de l’élément/cristal/réaction sont des hypothèses explicitement activées.
- Raffinement lisible, activations dans les blocs d’équipement, normalisation des identifiants d’équipiers et correction du tableau d’attaques vidé après un changement de constellation.

## Réactions lunaires et astrales

Les dégâts directs de Sélénocution, Sélénofleurissement et Sélénocristallisation restent distincts des coups ordinaires. Ajout des dégâts directs d’Astroconduction (coefficient du champ selon 0–12 applications) et d’Astrodispersion.

Le calcul collectif de Sélénocution, Sélénocristallisation et Astrodispersion classe jusqu’à quatre contributions et applique les poids 60/30/5/5. La moyenne énumère les issues CRIT avant de reclasser les contributions : classer seulement les dégâts moyens donne un résultat incorrect lorsque les CRIT changent l’ordre des contributeurs.

Chaque calcul collectif représente un événement distinct, pas une réaction ajoutée à chacun des coups du talent. Le premier contributeur est le personnage optimisé ; les statistiques des autres contributeurs sont saisies. Leur multiplicateur de niveau doit être renseigné. L’interface permet l’impact Anémo initial ou l’explosion Cryo d’Astrodispersion, avec vortex de niveau 1 ou 2.

Ces formules excluent les bonus DGT ordinaires, la DÉF ennemie et les ajouts ordinaires. Elles conservent maîtrise, CRIT, RÉS, bonus de base, bonus de réaction et élévation dans leurs termes respectifs. Les coefficients et images des formules ont été vérifiés dans les travaux originaux de KQM.

## Travail encore nécessaire pour répondre intégralement à la demande

- Audit mécanique complet de chaque personnage C0–C6 : coups supplémentaires, changements de ciblage/scaling, infusions, conversions conditionnelles, formes alternatives, seuils, instantané des statistiques et exceptions.
- Reconnaissance exhaustive de la nature lunaire/astrale de chaque impact du kit. La sélection de réaction directe reste une hypothèse explicite, pas une reconnaissance automatique fiable de tous les talents.
- Passifs complets des 255 armes, y compris événements séparés, probabilités, intervalles, particules, énergie et règles de cumul entre toutes les familles. Les descriptions inconnues ne sont plus transformées en bonus par lecture de leur premier nombre.
- Toutes les mécaniques des 63 sets : effets de soins, énergie, probabilités, quotas, signelune, cumuls interdépendants et conditions encore non exprimées.
- Application automatique de tous les bonus de base et élévations lunaires/astrales issus des personnages et de leurs constellations. Les champs disponibles ne remplacent pas cette modélisation par personnage.
- Simulation des auras/ICD, chronologie des champs et réactions, suivi complet des contributeurs et statistiques propres à chaque impact dans une rotation.
- Moyennes de dégâts collectifs conditionnées à un CRIT du contributeur dominant : les colonnes CRIT/sans CRIT représentent actuellement toutes les contributions critiques/non critiques. La moyenne indépendante est calculée par énumération.
- Les passifs d’élévation nécessitent encore la vérification exhaustive du niveau/déblocage et des variantes d’avatar.

## Sources

- Données et paramètres : https://github.com/theBowja/genshin-db/tree/8e5badd60b5d894284ccc927a56c9683529d2592/src/data
- Formules générales : https://library.keqingmains.com/combat-mechanics/damage/damage-formula
- Réactions lunaires : https://keqingmains.com/misc/lunar/
- Réactions astrales : https://keqingmains.com/misc/stellar-reaction-guide/

Les sources exactes et leurs révisions sont enregistrées dans les instantanés et le relevé JSON.
