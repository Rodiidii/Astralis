# Planètes : cartographie et volumes

Une planète régionale utilise la carte complète de sa région, îles comprises. Teyvat utilise l’ensemble de la carte publiée. La Mer primordiale est un monde aquatique distinct, sans territoire terrestre.

## Sources et limites

- Cartographie : tuiles du service public de la [carte interactive officielle HoYoLAB](https://act.hoyolab.com/ys/app/interactive-map/index.html), métadonnées `bd70cde160dbd523926208d9fa8961a1`. Assemblage original conservé dans `assets/cosmos/map/official-atlas.webp`.
- Les délimitations régionales sont estimées à partir des positions des points d’intérêt et d’enveloppes géographiques. Elles ne sont pas des frontières officielles polygonales.
- Les hauteurs sont estimées à partir des couleurs de la carte et de sommets identifiés. Ce ne sont pas des données altimétriques du jeu. Les monuments, villes et la base fatui sont des volumes simplifiés, avec placements approximatifs ; les dimensions sont accentuées pour rester visibles.
- Les terres sont recentrées et agrandies sur le globe par projection stéréographique, sans suppression des bords de la carte. Cette projection accentue la surface terrestre visible et déforme les distances sur la sphère. La rotation révèle les parties latérales : la carte n’est pas recadrée sur un fragment.
- Objets de Vie, Temps et Mort : silhouettes et couleurs issues des trois références fournies par l’utilisateur, extrudées en géométrie 3D. Les archives des [modèles de référence](https://models.spriters-resource.com/pc_computer/genshinimpact/asset/592365/) renvoyaient HTTP 403 ; il ne s’agit donc pas des modèles originaux du jeu.
- Aucune image générée par IA.

## Effets

Rafales courtes indépendantes (sans anneaux de vent), averses et éclairs localisés, tempête de neige à Snezhnaya (aucune neige à Nod-Krai), neuf foyers d’orage dans le style initial, tornade au désert, courants et fronts de vagues. Natlan possède une colonne éruptive, des projections de lave, douze nappes de fumée et des cendres. Les objets centraux suivent trois ellipses inclinées, avec occlusion par la planète.

Un contexte WebGL est partagé. Les villes statiques sont regroupées, les nuages utilisent des instances ; le rendu logiciel est limité en cadence. Les scènes sont suspendues hors écran et les animations respectent la réduction des mouvements.

## Vérification

- `node --test tests/planet-diorama.test.mjs` : cartes complètes, sites, relief neigeux, signatures régionales, géométrie des trois objets.
- `python tests/planet_diorama_browser.py` : chargement réel des neuf cartes, dix scènes, absence d’erreur, capture comparée, mouvement réduit et repli sans WebGL.
- `python tests/voyage_browser.py` : parcours du tableau de bord, fiches gauche/droite et verticales, absence de collision des corps, mode normal et mobile.

Aperçus : `docs/planets-3d-contact-sheet.png` et `docs/region-maps-contact.jpg`.

Le fond contient cinq constellations vectorielles, des poussières, des voiles cosmiques et des comètes. Taille globale des planètes régionales et constellations réglables dans Apparence.

Dernier ajustement : pluie allégée, massifs secondaires de hauteurs variées, villes principales agrandies en volume ; neige distribuée sphériquement, sans boîte rectangulaire.

Végétation : bosquets tropicaux en volume dans la partie forestière de Sumeru ; cerisier et pétales animés au sanctuaire d’Inazuma ; pics et crêtes supplémentaires à Liyue.

Finition : montagnes sculptées par profils irréguliers et crêtes, coloration progressive de la neige ; troncs courbes, branches et couronnes feuillues déformées et ombrées. Les couleurs par sommet sont conservées lors du regroupement des géométries.

Teyvat : trois lunes rétablies par défaut, avec cratères en volume et trois orbites inclinées. Les objets de Vie, Temps et Mort restent activables séparément dans Apparence. Survol et focus ne bloquent que la piste concernée ; les autres pistes continuent leur révolution.
