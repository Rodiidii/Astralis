# Optimiseur — couverture des recherches complexes

Les effets complexes actifs et les coups pondérés désactivent la borne d’élagage des coups simples. Tous les vecteurs de statistiques sont conservés, même lorsqu’un ancien filtre `relevantStats` était trop restrictif. La stratégie et la raison sont exposées dans le diagnostic.

La recherche rend la main aussi depuis les nœuds intermédiaires ; annulation et progression ne dépendent plus uniquement du passage par une combinaison complète. Une recherche interrompue garde `exact:false`, et la meilleure carte est nommée « meilleur trouvé ».

`tests/optimizer-complex-search.test.mjs` compare le top 5 à 243 combinaisons brutes pour un effet Furina et pour une rotation pondérée. Les deux classements concordent sans perte de statistiques CRIT malgré un filtre volontairement incomplet. Un test annule temporellement une recherche de 3,2 millions de combinaisons et vérifie le résultat partiel.

`tools/benchmark-optimizer.mjs` produit `docs/BENCHMARK-OPTIMISEUR.json` : 1 000 et 5 000 pièces distinctes, sets et sous-stats variés, coups simples et rotation complexe. Les annulations demandées à 350 ms se terminent autour de 380–450 ms lors de cette exécution locale. Ce benchmark mesure débit et réactivité partiels ; il ne prouve PAS l’achèvement des 320 milliards à un million de milliards de combinaisons possibles. Le temps dépend de la machine.

229 tests unitaires réussis. Les exigences globales de P0-LAB-03/05 et RESTE-132 restent ouvertes pour les autres effets, la résolution complète de grands inventaires et la validation étendue.
