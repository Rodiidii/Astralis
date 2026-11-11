# Planètes régionales : reconstruction du moteur — 10 novembre 2026

L’ancien rendu CPU avec triangles dessinés sur un second canvas est remplacé, pour les neuf satellites régionaux, par des modèles WebGL. Le globe central conserve la carte fournie et son océan #20638C.

## Direction visuelle

- Mondstadt : vert/bleu, continent boisé, pics saillants, grands courants de vent en volume.
- Liyue : terrain minéral gris et ocre, hautes colonnes rocheuses, cristaux dorés avec scintillements localisés, ceinture de roches en orbite.
- Inazuma : petits archipels, relief violet, arbres roses/verts, nuages en volume, pluie et éclairs ramifiés avec éclairage local.
- Sumeru : séparation forêt/désert, arbres géants dépassant la silhouette, pyramides à quatre faces et bases étagées, lucioles et un vortex de sable attaché au sol.
- Fontaine : grandes montagnes claires, mers/lacs bleus, cascades modélisées avec gouttes qui se déplacent, bancs de nuages.
- Mer Primordiale : océan intégral, vagues géométriques discrètes, pluie sous des nuages et trois anneaux d’eau épais dans des plans inclinés.
- Natlan : savane ocre/émeraude, mesas, grands volcans avec cratères, coulées, éjectas balistiques et panaches de fumée en volume.
- Nod-Krai : taïga, grandes forêts de conifères, reliefs froids, côtes lunaires et trois lunes de tailles/vitesses/plans distincts ; l’une tourne en sens contraire.
- Snezhnaya : banquise blanche/bleue, plaques et pics de glace, tempête de neige 3D et ceinture d’astéroïdes gelés.

Les surfaces sont des maillages déplacés avec couleurs par sommet. Les côtes et reliefs possèdent leur propre géométrie ; les arbres, cascades, nuages, volcans, lunes et précipitations sont des objets 3D distincts. Aucune image IA ni texture photographique ajoutée.

## Intégration et coût du rendu

- Three.js r180, dépendances et licence MIT stockées localement dans `assets/vendor/three/` ; aucune dépendance CDN à l’exécution.
- Un contexte WebGL partagé, copie de la scène rendue vers le canvas de chaque widget. Évite un contexte GPU par planète.
- Végétation et montagnes statiques regroupées dans un seul maillage coloré par scène. Roches, neige et éjectas regroupés ou instanciés.
- Détails, ombres et définition renforcés en consultation ; rendu plus léger dans la vue orbitale. Arrêt hors écran et avec mouvement réduit.
- Les réglages de couleur, vitesse et orbites sont conservés. Les changements de rotation n’obligent plus à reconstruire les scènes ; les modifications d’apparence sont temporisées.
- L’espacement des orbites tient compte des nouveaux volumes dépassant de la sphère.
- Cache v81 : moteur, bibliothèque et données disponibles localement. En absence de WebGL, le rendu local de secours reste disponible.

## Vérifications

- `tests/planet-diorama.test.mjs` : maillage détaillé, extension réelle des volumes, signatures spécifiques des neuf régions et regroupement des objets statiques.
- `tests/planet_diorama_browser.py` : les neuf scènes sont effectivement rendues par WebGL, sans erreur de shader ; capture de contrôle et arrêt du mouvement.
- `tests/voyage_browser.py` : parcours de l’application, portraits, ouverture des fiches, quatre dispositions, mode neutre, mobile, espacement et mouvement réduit.
- Capture de contrôle : `docs/planets-3d-contact-sheet.png` ; journaux `planets-3d-unit.log`, `planets-3d-browser.log`, `planets-3d-voyage.log`, `planets-3d-all-tests.log`.

Le contrôle automatisé du navigateur utilise le rendu logiciel WebGL pour reproductibilité. La fluidité perçue et le coût GPU dépendent du matériel ; aucun score FPS universel n’est revendiqué.
