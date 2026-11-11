# Fiches Astralis — référence HTML du 11 novembre 2026

Référence originale conservée dans `docs/reference/fiches/fiches-astralis.html`, avec les cinq aperçus du ZIP. Les cinq onglets et les sept éléments ont été ouverts dans Chromium. Les palettes, le générateur de fond et les compositions viennent de ce fichier.

| Fiche | État | Données utilisées |
| --- | --- | --- |
| Équipe | Implémentée | Composition enregistrée, builds associés, équipement, rôles, constellation, niveaux de talents renseignés, rotation et signature |
| Comparatif | Implémentée | Valeurs avant/après de la feuille de calcul, contributions individuelles et dégâts par rotation lorsqu’ils sont renseignés |
| Laboratoire | Implémentée | Résultat du moteur pour les trois modes de critique, paramètres de la cible, décomposition, autres actions interprétables du kit et sensibilité recalculée |
| Build | Implémentée | Statistiques calculées, arme et raffinement, pièces équipées et sous-stats, textes des sets, constellation, niveaux de talents renseignés |
| Plan de farm | Implémentée | Objectif de niveau et d’aptitudes, besoins de matériaux, stock possédé, progression et illustration du personnage |

## Rendu commun

`src/sheet-renderer.js` expose `renderSheet(type, data, options)`. Les cinq compositions se trouvent dans `src/sheets/`. Le même canvas sert à l’aperçu, au téléchargement et à la copie dans le presse-papiers.

Formats de base : équipe 2000×1570, comparatif 2000×1530, laboratoire 2000×2000, build 2000×1420 et farm 1080×1736. Le PNG est rendu à l’échelle 2. La hauteur augmente si le contenu l’exige ; les portraits et les cartes ne sont pas comprimés pour rentrer dans une page.

Cormorant Garamond 700 et Inter 400–700 sont embarquées en WOFF2 avec leurs licences. Le moteur attend les polices et les images. Il utilise une bibliothèque locale, sans chargement de Google Fonts pendant l’export. Les icônes de statistiques fournies sont conservées dans `assets/sheet-icons/`.

La palette dépend du personnage principal. Les personnages gardent leurs liserés individuels. L’aperçu permet de choisir parmi les sept palettes et de régler le cadrage et l’ancrage. Un accent personnalisé transmis par le build est éclairci si nécessaire pour atteindre un contraste de 4,5:1 sur le fond de la palette.

Les valeurs absentes restent inconnues : tiret, petite pastille « Non confirmé », ou ligne compacte pour un bloc entier de dégâts non calculés. Un build sans résultat du laboratoire n’obtient pas de dégâts fictifs. Les niveaux de talents peuvent être saisis dans l’atelier de builds. Une répartition n’est pas une simulation de combat : elle représente les contributions renseignées. Un doublon de personnage bloque l’export comparatif.

## Vérification

- `python tests/sheets_browser.py` : 105 rendus DOM (5 fiches × 7 éléments × 3 jeux de données), contrôle des images, des débordements horizontaux et des valeurs invalides ; cinq encodages et téléchargements PNG réels à l’échelle 2.
- `python tests/poster_browser.py` : navigation dans l’application, aperçu, changement de palette, égalité SHA-256 entre le canvas et le PNG téléchargé, copie PNG dans le presse-papiers, exports équipe/build/personnage.
- `python tests/lab_browser.py` : laboratoire, inventaire, buffs, rotation, sauvegarde TC et téléchargement du PNG du laboratoire.
- `node --test tests/sheets-data.test.mjs` : sommes de parts, valeurs invalides, graines déterministes et import des équipes natives/GO.
- `python tests/test_team_export.py` : sauvegarde JSON locale, nom de fichier indépendant du nom de l’équipe, validation du format et de l’origine.

Les 140 tests unitaires passent. Les parcours réels `poster_browser.py`, `lab_browser.py`, `site_planning_browser.py` et `voyage_browser.py` passent également. Le dernier contrôle du voyage inclut les icônes chargées et le rendu des planètes visibles ; le focus est conservé après un changement d’apparence.

Captures de référence et rendus intégrés : `docs/captures/fiches/`. Le fichier `validation.json` contient les résultats des 105 cas. Les données synthétiques de la matrice de test sont explicitement des fixtures ; elles ne sont pas enregistrées dans les comptes utilisateurs.

En trois clics : **Équipes → Exporter PNG → Enregistrer le PNG**. La copie est cochée par défaut. Les autres accès sont dans Mes builds, Laboratoire, Calc Sheets et l’export du personnage dans le plan de farm.

## Corrections associées

- Les bonus d’artéfacts s’ajoutent aux bonus d’élévation au lieu de les écraser.
- Les choix d’artéfacts sont traités au clic ; le formulaire de création reste ouvert et se vide après enregistrement.
- Les équipes peuvent être exportées en JSON et rechargées au laboratoire. Le serveur enregistre aussi une copie dans `data/lab-user-exports/`, dossier exclu de Git. Un serveur lancé avant cette modification doit être relancé pour disposer de la nouvelle route.
- Les portraits d’équipe, l’atelier de builds et les projections de farm ont des styles dédiés. Les messages du compagnon ne bloquent plus les clics sur le contenu.
- Les filtres de régions du réseau permettent plusieurs régions. Les trois objets orbitaux sont réactivés à la migration des anciens réglages ; la file de rendu des planètes évite de toujours servir les premières planètes.

## Suite des travaux

Le portefeuille, le calendrier, les priorités du laboratoire et plusieurs mécaniques complexes ont été traités dans la révision suivante. Voir [SUIVI-AUTRES-POINTS.md](SUIVI-AUTRES-POINTS.md) et [TEST-SKIRK.md](TEST-SKIRK.md), qui précisent les validations et les limites restantes.
