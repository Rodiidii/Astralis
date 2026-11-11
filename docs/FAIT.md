# Astralis — points terminés et vérifiés

Chaque entrée reprend le point retiré de A-FAIRE.md, la date, les fichiers, les vérifications et les limites éventuelles. Les réalisations historiques ne sont pas recopiées ici sans nouvelle vérification.

## P0-ART-01 · 2026-11-11T13:40:46+01:00

- [x] **P0-ART-01 — Artéfacts en lignes.** Dans l’éditeur de build, les cinq emplacements ne doivent plus former cinq longues colonnes. Faire une ligne horizontale par emplacement (Fleur, Plume, Sablier, Coupe, Diadème) ; la pièce choisie, son image, sa principale et ses sous-stats se lisent dans cette ligne. Conserver les pièces alternatives accessibles sans allonger cinq colonnes côte à côte.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.

## P0-ART-02 · 2026-11-11T13:40:46+01:00

- [x] **P0-ART-02 — Listes de sets en colonnes.** Les listes/sélecteurs de sets restent verticaux, lisibles, avec recherche et images. Ne pas les transformer en bande horizontale. L’erreur signalée est précisément l’inversion : les sets ont été mis en ligne pendant que les artéfacts sont restés en colonnes.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.

## P0-ART-03 · 2026-11-11T13:40:46+01:00

- [x] **P0-ART-03 — Vérification de l’agencement.** Capturer avant/après, vérifier les cinq lignes d’artéfacts et les listes verticales de sets sur desktop ; repli mobile cohérent, sans débordement ni perte de sélection.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.

## P0-FARM-01 · 2026-11-11T13:40:46+01:00

- [x] **P0-FARM-01 — Portraits manquants.** L’icône réelle du personnage doit remplacer le placeholder dans le plan de farm : objectifs, priorités, scénarios 0–4 jours et calendrier. Réutiliser les sources d’icônes fiables des équipes ; diagnostiquer URL/identifiant/cache/cadrage, pas masquer le problème par un autre placeholder.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.

## P0-FARM-02 · 2026-11-11T13:40:46+01:00

- [x] **P0-FARM-02 — Refaire les cartes 0/1/2/3/4 jours d’artéfacts.** L’utilisateur dit que leur design n’a pas changé. Nouvelle composition visible et pratique, choix actif net, portraits, dates lisibles par personnage et comparaison compréhensible. Ne pas annoncer une refonte sur la seule base de variables CSS.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.

## P0-FARM-03 · 2026-11-11T13:40:46+01:00

- [x] **P0-FARM-03 — Refaire les blocs EXP/Mora.** L’utilisateur signale également l’absence de changement sur ces blocs. Utiliser ses icônes de livres et Mora, simplifier les champs de stock/besoin/reste et la lecture des sessions. Vérifier les chiffres et leur recalcul.

Fichiers : src/app.js, src/planning-controls.js, assets/recovery-workshop.css et tests/recovery_browser.py.

Vérifications : parcours navigateur avant/après et mobile ; cinq rangées horizontales de plus de 700 px ; portraits décodés sans placeholder ; scénarios 0–4 illustrés ; variation réelle des stocks EXP et Mora ; ordre par glisser-déposer persisté.

Captures : docs/captures/recovery/before-build.png, after-build.png, before-farm.png, after-farm.png et after-farm-mobile.png.

Commande : python tests/recovery_browser.py --after-only — réussie. Les anciens documents demeurent historiques ; aucun autre point non vérifié n’est clôturé.
