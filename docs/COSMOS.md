# Cosmos

Le fond actuel est dessiné en CSS, en bleu nuit et violet, avec étoiles, étoiles filantes et astéroïdes. Les petites planètes utilisent des textures générées et colorées. La planète centrale conserve la carte de Teyvat. Les crédits photographiques ci-dessous concernent les anciens rendus.

**Apparence** règle l’ambiance, les couleurs, l’intensité, la vitesse, les étoiles filantes, la taille de la planète et les apparences de widgets. **Vue** choisit entre orbites et blocs classiques. Ces choix sont conservés par jeu dans `astralis:cosmos:<jeu>`, indépendamment des dispositions.

## Planètes et icônes

La nouvelle carte fournie est conservée dans `assets/cosmos/teyvat-map-v2.png` et affichée sur la planète centrale. Le blanc de fond connexe aux bords devient exactement **#20638C** pendant la préparation de la texture ; la neige isolée reste blanche. La carte est ajustée sans déformation. Les autres sphères utilisent les cartes de la Terre, de Jupiter, de Saturne, de la Lune, du Soleil, de Mars, de Neptune, d’Uranus, de Vénus ou de Mercure. Un monde volcanique utilise une surface procédurale. Ces cartes sont projetées sur des sphères éclairées : leur longitude change avec le temps, tandis que l’éclairage et les pictogrammes restent fixes.

Le rendu utilise des canvas 2D avec une boucle partagée synchronisée par `requestAnimationFrame` et plafonnée à 30 images/seconde, des textures décodées partagées et une géométrie pré-calculée par sphère. Il ne nécessite pas un contexte WebGL pour chaque widget. Un rendu procédural sert uniquement de repli si une texture ne charge pas. Les surfaces hors écran ou dans un onglet masqué ne sont pas redessinées. La réduction des animations et l’interrupteur d’ambiance figent la rotation.

Un pictogramme SVG associé au métier du widget est superposé à la planète : calendrier pour la semaine, groupe pour l’équipe, cible pour les vœux, épée pour l’endgame, portrait pour Enka, etc. Les variantes de personnages réutilisent les portraits de l’équipe; si une image manque, ses initiales restent visibles.

Les trois satellites décoratifs restent un hommage aux lunes anciennes Aria, Canon et Sonnet, et non une représentation scientifique du ciel actuel de Genshin. Référence : [Canon — HoYoWiki](https://wiki.hoyolab.com/pc/genshin/entry/9340?lang=en-us). Leurs teintes sont personnalisables.

## Fond et lisibilité

Le fond Galaxie utilise le panorama photographique de la Voie lactée **ESO/S. Brunier**, [eso0932a](https://www.eso.org/public/images/eso0932a/). Le crédit est visible dans l’interface. L’ancienne teinte bleue par défaut est migrée une fois vers un noir neutre; un nouveau choix explicite est conservé.

Sur ordinateur, la roue est à gauche et le contenu à droite. Les widgets ont leur hauteur naturelle, sans défilement interne; le document défile lorsque le contenu est long. Sur mobile, le panneau suit la roue en pleine largeur. Le mode focus dispose du défilement nécessaire pour les contenus dépassant l’écran.

**Commandes / Ctrl J** permet de rechercher des widgets et d’ouvrir les vraies pages de l’application.

## Crédits des fichiers livrés

- Photographie galactique : **ESO/S. Brunier** — [source et conditions](https://www.eso.org/public/images/eso0932a/).
- Textures planétaires : **Solar System Scope**, basées sur des données NASA — [source](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Les fichiers téléchargés ne sont pas modifiés; le cadrage, la projection et l’éclairage sont calculés dans l’interface.

Les URL, empreintes et crédits sont conservés dans `assets/cosmos/astronomy-credits.json` et affichés en bas de l’accueil.

## Vérification

`tests/cosmos_browser.py` contrôle la présence de la texture Teyvat et le chargement des six types photographiques supplémentaires, la rotation effective de la planète et d’un satellite, les pictogrammes, l’absence de défilement interne, les réglages, la persistance, le mode blocs, la navigation des commandes, la pause et le rendu mobile. Les positions orbitales, réglages et migrations sont testés dans `tests/dashboard-studio.test.mjs`.

Les pistes sont séparées par défaut ; les orbites libres sont optionnelles. La vue destination conserve une planète agrandie en face de son panneau gauche/droite, avec un côté personnalisable par widget. Le Mémo de rotations est retiré. Voir `docs/VOYAGE.md` pour les détails et les tests.
