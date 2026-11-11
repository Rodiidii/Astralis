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

## P0-TEAM-01 · 2026-11-11T14:10:28+01:00

- [x] **P0-TEAM-01 — Icônes de rotation dans la fiche/image d’équipe.** Les vraies icônes NA/CA/E/Q de chaque personnage doivent charger dans la page, l’aperçu et le PNG téléchargé. Distinguer cela de l’icône du personnage. Vérifier le bon personnage/talent ; précharger les fichiers avant capture. En cas d’indisponibilité réelle, repli propre et explicitement testé, sans icône cassée ni emplacement vide.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## P0-TEAM-02 · 2026-11-11T14:10:28+01:00

- [x] **P0-TEAM-02 — Statistiques plus simples.** Simplifier/améliorer leur présentation dans la fiche d’équipe : statistiques essentielles mises en avant, unités et valeurs cohérentes, grille compacte, détails secondaires dépliables si utile, pas une accumulation de grosses tuiles. Préserver les vraies données et les détails accessibles.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## P0-PERSO-01 · 2026-11-11T14:10:28+01:00

- [x] **P0-PERSO-01 — Splash trop lumineux.** Réduire l’exposition apparente avec le traitement de la fiche (fond, dégradé, voile, contraste), préserver le visage et l’illustration ; éviter l’effet brûlé/blanchi. Ne pas remplacer par une icône ni retoucher arbitrairement l’art officiel.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-050 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-050** — Complément plus récent : exploration un patch sur deux depuis 7.2 (7.3 sans carte, 7.4 avec), multi en 7.4 et deux multis en 8.0. Implémenter comme hypothèses personnelles visibles/modifiables, ne pas les retirer silencieusement sous prétexte qu’elles ne sont pas des annonces officielles.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-051 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-051** — Comparaisons gains semaine/mois avec précédentes périodes et écarts +/− ; journaux et camemberts lisibles.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-096 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-096** — Icônes PNG iOS 180/192/512 : le manifeste actuel n’utilise qu’un SVG.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-100 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-100** — Guide docs/INSTALLER-SUR-IPHONE.md : absent.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-116 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-116** — Progression de niveau : XP/Mora intermédiaires encore interpolées ; farmLevelGoal calcule l’XP depuis la Mora. Table exacte par niveau à substituer.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## RESTE-121 · 2026-11-11T14:10:28+01:00

- [x] **RESTE-121** — Gains : histogrammes et comparaison mensuelle en camemberts présents ; comparaison hebdomadaire explicite et écarts +/− semaine/mois non finalisés.

# Validation — reprise du 11 novembre 2026

## Équipe et personnage

- `python tests/recovery_browser.py --after-only` : réussi. Cinq artéfacts en lignes, identifiants numériques de build, ATQ de référence calculée indépendamment depuis les tables, portraits de farm, stock EXP/Mora, changement de priorité et viewport 390 px.
- Équipe Skirk / Éclazur : ATQ affichée = ATQ équipée + 20 % de la base personnage + arme ; taux CRIT et DGT CRIT conservent leurs décimales. Même fonction de statistiques utilisée par la page et le modèle d’export.
- `node --test tests/team-combat-stats.test.mjs tests/skill-icons.test.mjs` : 4 tests réussis.
- `python tests/rotation_export_browser.py` : NA/CA/E/Q sourcés et cas d’icône absente, repli vectoriel vérifié, aucune image cassée. Les attaques normales et chargées utilisent l’icône normale du kit.
- Le test recovery monte l’aperçu avec huit véritables icônes locales puis télécharge réellement le PNG à 2×.
- 109 personnages disposent de leurs trois icônes sourcées (221 fichiers uniques). 109 splashes haute résolution enregistrés localement. Correspondance par identifiant de jeu depuis le registre public Enka, URLs et empreintes dans `assets/genshin/skills/sources.json` et `assets/genshin/splashes/sources.json`. Aucune génération d’image.
- Fiche Skirk : splash original avec traitement CSS, luminosité .72 vérifiée dans le navigateur, visage conservé. Capture `docs/captures/recovery/after-character.png`.
- Captures d’équipe : `docs/captures/recovery/after-team-stats.png`, `docs/captures/recovery/team-after.png`.

## Vœux et progression

- `node --test tests/wish-comparisons.test.mjs` : quatre tests réussis : semaine à jours égaux, mois de durées différentes, absence de division par zéro, scénarios 7.2/7.4/8.0, absence de double crédit d’exploration dans la garantie.
- `python tests/rest_workshop_browser.py` : réussi. Comparaisons semaine/mois, journal et camemberts ; cases de scénarios visibles et persistantes ; champ de cartes activé en mode manuel ; crédit de récompenses et blocage du double clic.
- `node --test tests/farm-level.test.mjs` : table d’EXP exacte, besoins intermédiaires et Mora d’entraînement. Source et total 1→90 documentés dans `src/character-level-costs.js`. Les coûts d’élévation sont distincts.

## Installation mobile

- `python tests/pwa_browser.py` : réussi. PNG 180/192/512, manifeste, lancement WebKit 390×844 sans débordement, service worker et rechargement hors ligne Chromium.
- Le cache conserve les ressources disponibles même si une ressource facultative échoue.
- Guide `docs/INSTALLER-SUR-IPHONE.md` créé ; aucune installation physique ni URL HTTPS déployée n’est annoncée. Hébergement, backend permanent et essai sur appareil demeurent ouverts.

## Limites conservées dans A-FAIRE

La simulation complète des équipes, l’optimisation et les effets complexes du laboratoire ne sont pas validés par ces tests de présentation/statistiques. Les exigences globales de la page farm et les vérifications croisées de toutes les vues restent ouvertes. Les fiches de personnages non publiés peuvent ne pas avoir d’art officiel disponible dans le registre sourcé.

## P0-PERSO-02 · 2026-11-11T14:21:51+01:00

- [x] **P0-PERSO-02 — Finitions visuelles.** Améliorer aussi le reste de la fiche : hiérarchie, tailles de textes, espacements, couleurs, séparations, informations utiles et défilement. Pas seulement assombrir l’image.

# Validation — fiche personnage et règles de farm

## Fiche

`python tests/character_detail_browser.py` passe sur la page réelle : bandeau 310 px sur desktop, portrait officiel local, actions conservées, toutes les rubriques accessibles, onglets ARIA, flèches/Home/End, conservation de l’onglet après ajout aux favoris, focus contenu dans la fenêtre, fermeture Escape et largeur 390 px sans débordement. Le bandeau est à 260 px sur mobile. Espacements, cartes de talents, textes, informations élément/arme/rareté et navigation ont été repris, au-delà de la luminosité. La couleur d’élément pilote les accents des nouvelles rubriques.

Avant : `docs/captures/character-dossier/before.png` (capture du commit 5447e49). Après : `docs/captures/character-dossier/desktop.png`, `mobile.png`, `mobile-kit.png`. Le contenu de talent distant de cette vérification est une fixture ; le splash local est bien celui de Skirk.

## Farm

`node --test tests/farm-priorities.test.mjs tests/planning-simulation.test.mjs tests/farm-level.test.mjs tests/rest-workshop.test.mjs` : 18 tests réussis.

Corrections : suppression de l’alternance EXP/Mora, rendements de boss partagé répartis suivant la priorité, un seul prélèvement de résine pour une réclamation partagée, quatrième boss hebdomadaire permis à 60 résines après trois réductions à 30, rendement de l’activité principale réduit à la résine restante. Les boss restent limités à une réclamation par semaine ; les jours sont choisis parmi les activités les moins urgentes.

Table exacte d’EXP 1–90 et calcul par niveau déjà validés dans `tests/farm-level.test.mjs`. Coûts d’élévation et de talents distincts. Les rendements et dates demeurent des estimations et les conversions de matériaux hebdomadaires restent une hypothèse explicite.

Le glisser-déposer de la priorité est testé par `tests/recovery_browser.py --after-only` : l’ordre persiste en stockage. Les portraits, scénarios 0–4, stocks EXP/Mora et mobile sont également vérifiés. Les anciens gestionnaires de glisser-déposer qui étaient écrasés ont été retirés.

## Suivi sans doublons

RESTE-119 recouvre le glisser-déposer vérifié. RESTE-122 recouvre les scénarios automatiques visibles et désactivables de RESTE-050, déjà validés dans `tests/wish-comparisons.test.mjs` et `tests/rest_workshop_browser.py`. Ces doublons sont déplacés avec leurs preuves, sans déclarer achevé le reste des pages farm, vœux ou laboratoire.

## RESTE-040 · 2026-11-11T14:21:51+01:00

- [x] **RESTE-040** — Priorités : talents, boss normal, EXP, Mora, artéfacts. Hebdomadaires en supplément des journées les moins urgentes, une réclamation par boss/semaine et personnage ; gérer les boss partagés sans inventer des runs supplémentaires.

# Validation — fiche personnage et règles de farm

## Fiche

`python tests/character_detail_browser.py` passe sur la page réelle : bandeau 310 px sur desktop, portrait officiel local, actions conservées, toutes les rubriques accessibles, onglets ARIA, flèches/Home/End, conservation de l’onglet après ajout aux favoris, focus contenu dans la fenêtre, fermeture Escape et largeur 390 px sans débordement. Le bandeau est à 260 px sur mobile. Espacements, cartes de talents, textes, informations élément/arme/rareté et navigation ont été repris, au-delà de la luminosité. La couleur d’élément pilote les accents des nouvelles rubriques.

Avant : `docs/captures/character-dossier/before.png` (capture du commit 5447e49). Après : `docs/captures/character-dossier/desktop.png`, `mobile.png`, `mobile-kit.png`. Le contenu de talent distant de cette vérification est une fixture ; le splash local est bien celui de Skirk.

## Farm

`node --test tests/farm-priorities.test.mjs tests/planning-simulation.test.mjs tests/farm-level.test.mjs tests/rest-workshop.test.mjs` : 18 tests réussis.

Corrections : suppression de l’alternance EXP/Mora, rendements de boss partagé répartis suivant la priorité, un seul prélèvement de résine pour une réclamation partagée, quatrième boss hebdomadaire permis à 60 résines après trois réductions à 30, rendement de l’activité principale réduit à la résine restante. Les boss restent limités à une réclamation par semaine ; les jours sont choisis parmi les activités les moins urgentes.

Table exacte d’EXP 1–90 et calcul par niveau déjà validés dans `tests/farm-level.test.mjs`. Coûts d’élévation et de talents distincts. Les rendements et dates demeurent des estimations et les conversions de matériaux hebdomadaires restent une hypothèse explicite.

Le glisser-déposer de la priorité est testé par `tests/recovery_browser.py --after-only` : l’ordre persiste en stockage. Les portraits, scénarios 0–4, stocks EXP/Mora et mobile sont également vérifiés. Les anciens gestionnaires de glisser-déposer qui étaient écrasés ont été retirés.

## Suivi sans doublons

RESTE-119 recouvre le glisser-déposer vérifié. RESTE-122 recouvre les scénarios automatiques visibles et désactivables de RESTE-050, déjà validés dans `tests/wish-comparisons.test.mjs` et `tests/rest_workshop_browser.py`. Ces doublons sont déplacés avec leurs preuves, sans déclarer achevé le reste des pages farm, vœux ou laboratoire.

## RESTE-045 · 2026-11-11T14:21:51+01:00

- [x] **RESTE-045** — Coûts exacts d’élévation/EXP et chaque niveau, pas une interpolation depuis la Mora. Les coûts et totaux utilisateur figurent aussi dans l’annexe Buffs/imports/corrections.

# Validation — fiche personnage et règles de farm

## Fiche

`python tests/character_detail_browser.py` passe sur la page réelle : bandeau 310 px sur desktop, portrait officiel local, actions conservées, toutes les rubriques accessibles, onglets ARIA, flèches/Home/End, conservation de l’onglet après ajout aux favoris, focus contenu dans la fenêtre, fermeture Escape et largeur 390 px sans débordement. Le bandeau est à 260 px sur mobile. Espacements, cartes de talents, textes, informations élément/arme/rareté et navigation ont été repris, au-delà de la luminosité. La couleur d’élément pilote les accents des nouvelles rubriques.

Avant : `docs/captures/character-dossier/before.png` (capture du commit 5447e49). Après : `docs/captures/character-dossier/desktop.png`, `mobile.png`, `mobile-kit.png`. Le contenu de talent distant de cette vérification est une fixture ; le splash local est bien celui de Skirk.

## Farm

`node --test tests/farm-priorities.test.mjs tests/planning-simulation.test.mjs tests/farm-level.test.mjs tests/rest-workshop.test.mjs` : 18 tests réussis.

Corrections : suppression de l’alternance EXP/Mora, rendements de boss partagé répartis suivant la priorité, un seul prélèvement de résine pour une réclamation partagée, quatrième boss hebdomadaire permis à 60 résines après trois réductions à 30, rendement de l’activité principale réduit à la résine restante. Les boss restent limités à une réclamation par semaine ; les jours sont choisis parmi les activités les moins urgentes.

Table exacte d’EXP 1–90 et calcul par niveau déjà validés dans `tests/farm-level.test.mjs`. Coûts d’élévation et de talents distincts. Les rendements et dates demeurent des estimations et les conversions de matériaux hebdomadaires restent une hypothèse explicite.

Le glisser-déposer de la priorité est testé par `tests/recovery_browser.py --after-only` : l’ordre persiste en stockage. Les portraits, scénarios 0–4, stocks EXP/Mora et mobile sont également vérifiés. Les anciens gestionnaires de glisser-déposer qui étaient écrasés ont été retirés.

## Suivi sans doublons

RESTE-119 recouvre le glisser-déposer vérifié. RESTE-122 recouvre les scénarios automatiques visibles et désactivables de RESTE-050, déjà validés dans `tests/wish-comparisons.test.mjs` et `tests/rest_workshop_browser.py`. Ces doublons sont déplacés avec leurs preuves, sans déclarer achevé le reste des pages farm, vœux ou laboratoire.

## RESTE-119 · 2026-11-11T14:21:51+01:00

- [x] **RESTE-119** — Réordonnancement pratique par glisser-déposer des personnages du planning : conformité à la dernière demande à finaliser ; les flèches et le classement existent.

# Validation — fiche personnage et règles de farm

## Fiche

`python tests/character_detail_browser.py` passe sur la page réelle : bandeau 310 px sur desktop, portrait officiel local, actions conservées, toutes les rubriques accessibles, onglets ARIA, flèches/Home/End, conservation de l’onglet après ajout aux favoris, focus contenu dans la fenêtre, fermeture Escape et largeur 390 px sans débordement. Le bandeau est à 260 px sur mobile. Espacements, cartes de talents, textes, informations élément/arme/rareté et navigation ont été repris, au-delà de la luminosité. La couleur d’élément pilote les accents des nouvelles rubriques.

Avant : `docs/captures/character-dossier/before.png` (capture du commit 5447e49). Après : `docs/captures/character-dossier/desktop.png`, `mobile.png`, `mobile-kit.png`. Le contenu de talent distant de cette vérification est une fixture ; le splash local est bien celui de Skirk.

## Farm

`node --test tests/farm-priorities.test.mjs tests/planning-simulation.test.mjs tests/farm-level.test.mjs tests/rest-workshop.test.mjs` : 18 tests réussis.

Corrections : suppression de l’alternance EXP/Mora, rendements de boss partagé répartis suivant la priorité, un seul prélèvement de résine pour une réclamation partagée, quatrième boss hebdomadaire permis à 60 résines après trois réductions à 30, rendement de l’activité principale réduit à la résine restante. Les boss restent limités à une réclamation par semaine ; les jours sont choisis parmi les activités les moins urgentes.

Table exacte d’EXP 1–90 et calcul par niveau déjà validés dans `tests/farm-level.test.mjs`. Coûts d’élévation et de talents distincts. Les rendements et dates demeurent des estimations et les conversions de matériaux hebdomadaires restent une hypothèse explicite.

Le glisser-déposer de la priorité est testé par `tests/recovery_browser.py --after-only` : l’ordre persiste en stockage. Les portraits, scénarios 0–4, stocks EXP/Mora et mobile sont également vérifiés. Les anciens gestionnaires de glisser-déposer qui étaient écrasés ont été retirés.

## Suivi sans doublons

RESTE-119 recouvre le glisser-déposer vérifié. RESTE-122 recouvre les scénarios automatiques visibles et désactivables de RESTE-050, déjà validés dans `tests/wish-comparisons.test.mjs` et `tests/rest_workshop_browser.py`. Ces doublons sont déplacés avec leurs preuves, sans déclarer achevé le reste des pages farm, vœux ou laboratoire.

## RESTE-122 · 2026-11-11T14:21:51+01:00

- [x] **RESTE-122** — Les cartes d’exploration alternées et cadeaux de versions demandés comme hypothèse personnelle ne sont plus activés automatiquement ; leur nombre est saisi explicitement. Ce choix diffère de la dernière règle d’autocalcul demandée.

# Validation — fiche personnage et règles de farm

## Fiche

`python tests/character_detail_browser.py` passe sur la page réelle : bandeau 310 px sur desktop, portrait officiel local, actions conservées, toutes les rubriques accessibles, onglets ARIA, flèches/Home/End, conservation de l’onglet après ajout aux favoris, focus contenu dans la fenêtre, fermeture Escape et largeur 390 px sans débordement. Le bandeau est à 260 px sur mobile. Espacements, cartes de talents, textes, informations élément/arme/rareté et navigation ont été repris, au-delà de la luminosité. La couleur d’élément pilote les accents des nouvelles rubriques.

Avant : `docs/captures/character-dossier/before.png` (capture du commit 5447e49). Après : `docs/captures/character-dossier/desktop.png`, `mobile.png`, `mobile-kit.png`. Le contenu de talent distant de cette vérification est une fixture ; le splash local est bien celui de Skirk.

## Farm

`node --test tests/farm-priorities.test.mjs tests/planning-simulation.test.mjs tests/farm-level.test.mjs tests/rest-workshop.test.mjs` : 18 tests réussis.

Corrections : suppression de l’alternance EXP/Mora, rendements de boss partagé répartis suivant la priorité, un seul prélèvement de résine pour une réclamation partagée, quatrième boss hebdomadaire permis à 60 résines après trois réductions à 30, rendement de l’activité principale réduit à la résine restante. Les boss restent limités à une réclamation par semaine ; les jours sont choisis parmi les activités les moins urgentes.

Table exacte d’EXP 1–90 et calcul par niveau déjà validés dans `tests/farm-level.test.mjs`. Coûts d’élévation et de talents distincts. Les rendements et dates demeurent des estimations et les conversions de matériaux hebdomadaires restent une hypothèse explicite.

Le glisser-déposer de la priorité est testé par `tests/recovery_browser.py --after-only` : l’ordre persiste en stockage. Les portraits, scénarios 0–4, stocks EXP/Mora et mobile sont également vérifiés. Les anciens gestionnaires de glisser-déposer qui étaient écrasés ont été retirés.

## Suivi sans doublons

RESTE-119 recouvre le glisser-déposer vérifié. RESTE-122 recouvre les scénarios automatiques visibles et désactivables de RESTE-050, déjà validés dans `tests/wish-comparisons.test.mjs` et `tests/rest_workshop_browser.py`. Ces doublons sont déplacés avec leurs preuves, sans déclarer achevé le reste des pages farm, vœux ou laboratoire.

## P0-BUILD-01 · 2026-11-11T14:59:50+01:00

- [x] **P0-BUILD-01 — Statistiques toujours erronées.** Le dernier message dit exactement « Statistiques du personnage dans son build toujours à » ; la valeur finale n’a pas été écrite. Ne pas inventer « 0 », « 14 k ATQ » ou une autre valeur comme nouvelle observation. Reproduire les anomalies de statistiques déjà signalées, comparer base/arme/artéfacts/sets/buffs/Enka et corriger la cause. Aucun zéro fictif si une donnée manque.

# Validation — stabilité des équipes/builds et références Enka

## Régression reproduite, puis corrigée

`python tests/workshop_stability_browser.py --baseline` reproduit sur le commit `d3cb557` la fermeture des détails d’équipe après un rendu complet. `python tests/workshop_stability_browser.py` vérifie la correction dans les vrais chemins `render()` et `renderPageOnly()`, exposés uniquement dans le serveur de test : détails d’équipe, état ARIA, ouverture de l’éditeur, sélecteurs de sets ouverts/fermés, recherche, filtres, focus, sélection du texte et défilement conservés. Un choix explicite ferme bien le sélecteur. Le compteur des builds indique le total enregistré, y compris avec des identifiants numériques.

Un test d’image force une première URL en 404 puis un vrai PNG local : cinq réaffichages réutilisent la source valide, sans nouvelle requête vers l’URL en échec. Le style qui annulait `hidden` sur les options de sets a été corrigé. Les visuels ont des dimensions réservées.

Captures : `docs/captures/workshop-stability/before-team-collapsed.png`, `after-team-expanded.png`, `after-picker.png`.

## Visuels locaux

Le script `tools/sync-equipment-art.py` a enregistré 553 PNG originaux correspondant aux 255 armes et aux 63 sets du catalogue local, pièces comprises ; aucune ressource manquante lors de cette exécution. Les sets qui n’ont qu’un diadème sont pris en compte. Les fichiers proviennent des noms exacts du catalogue, via le miroir Enka ; URLs, dimensions et SHA-256 figurent dans `assets/genshin/equipment/sources.json`. Aucune image générée ni nom d’asset deviné.

Le catalogue, les builds, les équipes, les fiches de sets et les modèles PNG priorisent ces fichiers. Une illustration personnelle reste prioritaire. Le registre entre dans le cache du service worker ; les images sont mises en cache à l’usage, sans prétendre qu’un catalogue jamais consulté serait intégralement précaché hors ligne.

`node --test tests/equipment-art.test.mjs` : trois tests réussis, couvrant toutes les empreintes et toutes les références du catalogue, l’ordre des sources et la préservation d’une image personnelle.

## Statistiques et import Enka

La configuration d’une référence Enka est désormais tracée : personnage, arme, niveau, éveil, raffinement, constellation, sets, statistiques des pièces et conditions. Modifier l’un de ces paramètres impose le recalcul depuis les données de jeu. Renommer ou recolorer le build conserve l’instantané. Les anciennes références non traçables restent enregistrées mais ne sont plus certifiées comme configuration courante. La réparation d’un ancien import ne lui attribue pas arbitrairement les statistiques du profil actuellement chargé.

Le calcul d’équipement est commun aux chemins snapshot et tables de niveaux. Le repli lit aussi les tableaux de sous-stats, compte les sets de la même façon et convertit correctement les bonus élémentaires d’élévation. Cas indépendant de contrôle : ATQ 1 792,4 ; taux CRIT 51,3 % ; DGT CRIT 112,2 % ; bonus Cryo 75,4 %. Les deux chemins donnent ces mêmes résultats. Une base absente retourne un résultat indisponible ; une sous-stat ou une principale absente ne devient pas un zéro artificiel.

`python tests/enka_build_browser.py` vérifie une fixture Enka explicitement synthétique : 19 180 PV, 1 812,4 ATQ, 800 DÉF, 100 maîtrise, 150 % recharge, 40 % taux CRIT, 120 % DGT CRIT et 61,6 % bonus Cryo. Les valeurs de la page, de l’équipe et des modèles PNG concordent. Le changement réel d’arme vers le Faucon d’Aquilon invalide la référence et recalcule les chiffres ; le choix et les résultats persistent après rechargement. La source de calcul est affichée dans la page.

Les tests d’import vérifient le sablier Recharge, les coupes Cryo/Hydro, le diadème DGT CRIT, les niveaux et les quatre sous-stats. Le test de cache ancien `python tests/artifact_cache_browser.py` confirme le démarrage sans erreur d’export `artifactStatKey` et une coupe élémentaire à 46,6 %.

## Résultats et limites

- Suite complète Node : 188 tests réussis, aucun échec.
- `tests/workshop_stability_browser.py` : réussi, ainsi que la reproduction sur l’ancienne version.
- `tests/enka_build_browser.py` : réussi.
- `tests/recovery_browser.py --after-only` : réussi, avec export PNG réellement téléchargé à 2×.
- `tests/pwa_browser.py` : WebKit mobile et rechargement hors ligne Chromium réussis avec le nouveau module de visuels.
- Vérification de syntaxe des modules et `git diff --check` : réussie.

Ces vérifications clôturent les causes de statistiques de build décrites ci-dessus et la stabilité de l’atelier. Elles ne valident pas la simulation complète des dégâts, tous les passifs conditionnels ni l’optimisation des équipes du laboratoire. P0-BUILD-02 (comparaison complète, laboratoire compris), P0-TEAM-03 et les chantiers du laboratoire restent ouverts.

## RESTE-031 · 2026-11-11T14:59:50+01:00

- [x] **RESTE-031** — Corriger durablement scintillement/disparition des équipes, boutons inactifs et listes de sets/pièces qui se referment lors des chargements ; chargements d’images stables, sans boucle placeholder/image/vide.

# Validation — stabilité des équipes/builds et références Enka

## Régression reproduite, puis corrigée

`python tests/workshop_stability_browser.py --baseline` reproduit sur le commit `d3cb557` la fermeture des détails d’équipe après un rendu complet. `python tests/workshop_stability_browser.py` vérifie la correction dans les vrais chemins `render()` et `renderPageOnly()`, exposés uniquement dans le serveur de test : détails d’équipe, état ARIA, ouverture de l’éditeur, sélecteurs de sets ouverts/fermés, recherche, filtres, focus, sélection du texte et défilement conservés. Un choix explicite ferme bien le sélecteur. Le compteur des builds indique le total enregistré, y compris avec des identifiants numériques.

Un test d’image force une première URL en 404 puis un vrai PNG local : cinq réaffichages réutilisent la source valide, sans nouvelle requête vers l’URL en échec. Le style qui annulait `hidden` sur les options de sets a été corrigé. Les visuels ont des dimensions réservées.

Captures : `docs/captures/workshop-stability/before-team-collapsed.png`, `after-team-expanded.png`, `after-picker.png`.

## Visuels locaux

Le script `tools/sync-equipment-art.py` a enregistré 553 PNG originaux correspondant aux 255 armes et aux 63 sets du catalogue local, pièces comprises ; aucune ressource manquante lors de cette exécution. Les sets qui n’ont qu’un diadème sont pris en compte. Les fichiers proviennent des noms exacts du catalogue, via le miroir Enka ; URLs, dimensions et SHA-256 figurent dans `assets/genshin/equipment/sources.json`. Aucune image générée ni nom d’asset deviné.

Le catalogue, les builds, les équipes, les fiches de sets et les modèles PNG priorisent ces fichiers. Une illustration personnelle reste prioritaire. Le registre entre dans le cache du service worker ; les images sont mises en cache à l’usage, sans prétendre qu’un catalogue jamais consulté serait intégralement précaché hors ligne.

`node --test tests/equipment-art.test.mjs` : trois tests réussis, couvrant toutes les empreintes et toutes les références du catalogue, l’ordre des sources et la préservation d’une image personnelle.

## Statistiques et import Enka

La configuration d’une référence Enka est désormais tracée : personnage, arme, niveau, éveil, raffinement, constellation, sets, statistiques des pièces et conditions. Modifier l’un de ces paramètres impose le recalcul depuis les données de jeu. Renommer ou recolorer le build conserve l’instantané. Les anciennes références non traçables restent enregistrées mais ne sont plus certifiées comme configuration courante. La réparation d’un ancien import ne lui attribue pas arbitrairement les statistiques du profil actuellement chargé.

Le calcul d’équipement est commun aux chemins snapshot et tables de niveaux. Le repli lit aussi les tableaux de sous-stats, compte les sets de la même façon et convertit correctement les bonus élémentaires d’élévation. Cas indépendant de contrôle : ATQ 1 792,4 ; taux CRIT 51,3 % ; DGT CRIT 112,2 % ; bonus Cryo 75,4 %. Les deux chemins donnent ces mêmes résultats. Une base absente retourne un résultat indisponible ; une sous-stat ou une principale absente ne devient pas un zéro artificiel.

`python tests/enka_build_browser.py` vérifie une fixture Enka explicitement synthétique : 19 180 PV, 1 812,4 ATQ, 800 DÉF, 100 maîtrise, 150 % recharge, 40 % taux CRIT, 120 % DGT CRIT et 61,6 % bonus Cryo. Les valeurs de la page, de l’équipe et des modèles PNG concordent. Le changement réel d’arme vers le Faucon d’Aquilon invalide la référence et recalcule les chiffres ; le choix et les résultats persistent après rechargement. La source de calcul est affichée dans la page.

Les tests d’import vérifient le sablier Recharge, les coupes Cryo/Hydro, le diadème DGT CRIT, les niveaux et les quatre sous-stats. Le test de cache ancien `python tests/artifact_cache_browser.py` confirme le démarrage sans erreur d’export `artifactStatKey` et une coupe élémentaire à 46,6 %.

## Résultats et limites

- Suite complète Node : 188 tests réussis, aucun échec.
- `tests/workshop_stability_browser.py` : réussi, ainsi que la reproduction sur l’ancienne version.
- `tests/enka_build_browser.py` : réussi.
- `tests/recovery_browser.py --after-only` : réussi, avec export PNG réellement téléchargé à 2×.
- `tests/pwa_browser.py` : WebKit mobile et rechargement hors ligne Chromium réussis avec le nouveau module de visuels.
- Vérification de syntaxe des modules et `git diff --check` : réussie.

Ces vérifications clôturent les causes de statistiques de build décrites ci-dessus et la stabilité de l’atelier. Elles ne valident pas la simulation complète des dégâts, tous les passifs conditionnels ni l’optimisation des équipes du laboratoire. P0-BUILD-02 (comparaison complète, laboratoire compris), P0-TEAM-03 et les chantiers du laboratoire restent ouverts.

## RESTE-033 · 2026-11-11T14:59:50+01:00

- [x] **RESTE-033** — Import Enka : principales de coupe/sablier/diadème exactes, bonus élémentaires non nuls, sous-stats exactes, pas de double comptage ni ATQ aberrante ; export artifactStatKey et démarrage sans erreur.

# Validation — stabilité des équipes/builds et références Enka

## Régression reproduite, puis corrigée

`python tests/workshop_stability_browser.py --baseline` reproduit sur le commit `d3cb557` la fermeture des détails d’équipe après un rendu complet. `python tests/workshop_stability_browser.py` vérifie la correction dans les vrais chemins `render()` et `renderPageOnly()`, exposés uniquement dans le serveur de test : détails d’équipe, état ARIA, ouverture de l’éditeur, sélecteurs de sets ouverts/fermés, recherche, filtres, focus, sélection du texte et défilement conservés. Un choix explicite ferme bien le sélecteur. Le compteur des builds indique le total enregistré, y compris avec des identifiants numériques.

Un test d’image force une première URL en 404 puis un vrai PNG local : cinq réaffichages réutilisent la source valide, sans nouvelle requête vers l’URL en échec. Le style qui annulait `hidden` sur les options de sets a été corrigé. Les visuels ont des dimensions réservées.

Captures : `docs/captures/workshop-stability/before-team-collapsed.png`, `after-team-expanded.png`, `after-picker.png`.

## Visuels locaux

Le script `tools/sync-equipment-art.py` a enregistré 553 PNG originaux correspondant aux 255 armes et aux 63 sets du catalogue local, pièces comprises ; aucune ressource manquante lors de cette exécution. Les sets qui n’ont qu’un diadème sont pris en compte. Les fichiers proviennent des noms exacts du catalogue, via le miroir Enka ; URLs, dimensions et SHA-256 figurent dans `assets/genshin/equipment/sources.json`. Aucune image générée ni nom d’asset deviné.

Le catalogue, les builds, les équipes, les fiches de sets et les modèles PNG priorisent ces fichiers. Une illustration personnelle reste prioritaire. Le registre entre dans le cache du service worker ; les images sont mises en cache à l’usage, sans prétendre qu’un catalogue jamais consulté serait intégralement précaché hors ligne.

`node --test tests/equipment-art.test.mjs` : trois tests réussis, couvrant toutes les empreintes et toutes les références du catalogue, l’ordre des sources et la préservation d’une image personnelle.

## Statistiques et import Enka

La configuration d’une référence Enka est désormais tracée : personnage, arme, niveau, éveil, raffinement, constellation, sets, statistiques des pièces et conditions. Modifier l’un de ces paramètres impose le recalcul depuis les données de jeu. Renommer ou recolorer le build conserve l’instantané. Les anciennes références non traçables restent enregistrées mais ne sont plus certifiées comme configuration courante. La réparation d’un ancien import ne lui attribue pas arbitrairement les statistiques du profil actuellement chargé.

Le calcul d’équipement est commun aux chemins snapshot et tables de niveaux. Le repli lit aussi les tableaux de sous-stats, compte les sets de la même façon et convertit correctement les bonus élémentaires d’élévation. Cas indépendant de contrôle : ATQ 1 792,4 ; taux CRIT 51,3 % ; DGT CRIT 112,2 % ; bonus Cryo 75,4 %. Les deux chemins donnent ces mêmes résultats. Une base absente retourne un résultat indisponible ; une sous-stat ou une principale absente ne devient pas un zéro artificiel.

`python tests/enka_build_browser.py` vérifie une fixture Enka explicitement synthétique : 19 180 PV, 1 812,4 ATQ, 800 DÉF, 100 maîtrise, 150 % recharge, 40 % taux CRIT, 120 % DGT CRIT et 61,6 % bonus Cryo. Les valeurs de la page, de l’équipe et des modèles PNG concordent. Le changement réel d’arme vers le Faucon d’Aquilon invalide la référence et recalcule les chiffres ; le choix et les résultats persistent après rechargement. La source de calcul est affichée dans la page.

Les tests d’import vérifient le sablier Recharge, les coupes Cryo/Hydro, le diadème DGT CRIT, les niveaux et les quatre sous-stats. Le test de cache ancien `python tests/artifact_cache_browser.py` confirme le démarrage sans erreur d’export `artifactStatKey` et une coupe élémentaire à 46,6 %.

## Résultats et limites

- Suite complète Node : 188 tests réussis, aucun échec.
- `tests/workshop_stability_browser.py` : réussi, ainsi que la reproduction sur l’ancienne version.
- `tests/enka_build_browser.py` : réussi.
- `tests/recovery_browser.py --after-only` : réussi, avec export PNG réellement téléchargé à 2×.
- `tests/pwa_browser.py` : WebKit mobile et rechargement hors ligne Chromium réussis avec le nouveau module de visuels.
- Vérification de syntaxe des modules et `git diff --check` : réussie.

Ces vérifications clôturent les causes de statistiques de build décrites ci-dessus et la stabilité de l’atelier. Elles ne valident pas la simulation complète des dégâts, tous les passifs conditionnels ni l’optimisation des équipes du laboratoire. P0-BUILD-02 (comparaison complète, laboratoire compris), P0-TEAM-03 et les chantiers du laboratoire restent ouverts.

## RESTE-039 · 2026-11-11T15:45:26+01:00

- [x] **RESTE-039** — Stock partagé, priorités par personnage, talents actuels/cibles individuellement ; synthèse 3:1 pour livres et matériaux de monstres APRÈS réservation des besoins de tous les personnages.

# Farm — validation du 11 novembre 2026

196 tests unitaires réussis. `tests/farm_workshop_browser.py` réussit sur la page réelle : niveaux actuels/cibles normalisés pour chaque talent, maintien du panneau ouvert, stock consolidé, synthèse 3:1 après réservation globale, calendrier et réclamations hebdomadaires, scénarios 0–4, dates vertes actualisées, dates manuelles réservées, priorité par glisser-déposer, largeur mobile et recherche des personnages.

Le test télécharge un vrai PNG 2×, compare son SHA-256 au canevas de l’aperçu et vérifie la copie image/png dans le presse-papiers. Captures avant/après et PNG dans `docs/captures/farm-workshop/`.

Correction du rendement des talents : chaque rareté dispose de son stock, aucune conversion descendante ; moyennes par journée de 180 résines = 20 verts, 18 bleus et 2 violets. Les stocks inutilisés persistent. Les bonus hebdomadaires réduisent la résine disponible. Les allocations de stock entre personnages sont partagées par le planning, les fiches du tableau de bord et les exports.

317 visuels originaux de matériaux disponibles localement ; URLs, dimensions et empreintes dans `assets/genshin/farm-materials/sources.json`, vérifiées par `tests/farm-art.test.mjs`. Aucun fichier manquant parmi les coûts de niveaux/talents du catalogue local.

Les besoins hors résine sont explicitement affichés et donnent accès au stock à saisir. Les dates restent des estimations sur rendements moyens ; la capacité réelle de récolte et l’exhaustivité des futurs personnages restent à auditer. P0-FARM-04, RESTE-041/044/117/118 demeurent ouverts : cette validation ne prétend pas clôturer leurs exigences intégrales.

## RESTE-042 · 2026-11-11T15:45:26+01:00

- [x] **RESTE-042** — Scénarios 0–4 jours d’artéfacts/semaine, dates par personnage, recalcul au changement de stock ou de planning manuel ; priorité réordonnable par glisser-déposer.

# Farm — validation du 11 novembre 2026

196 tests unitaires réussis. `tests/farm_workshop_browser.py` réussit sur la page réelle : niveaux actuels/cibles normalisés pour chaque talent, maintien du panneau ouvert, stock consolidé, synthèse 3:1 après réservation globale, calendrier et réclamations hebdomadaires, scénarios 0–4, dates vertes actualisées, dates manuelles réservées, priorité par glisser-déposer, largeur mobile et recherche des personnages.

Le test télécharge un vrai PNG 2×, compare son SHA-256 au canevas de l’aperçu et vérifie la copie image/png dans le presse-papiers. Captures avant/après et PNG dans `docs/captures/farm-workshop/`.

Correction du rendement des talents : chaque rareté dispose de son stock, aucune conversion descendante ; moyennes par journée de 180 résines = 20 verts, 18 bleus et 2 violets. Les stocks inutilisés persistent. Les bonus hebdomadaires réduisent la résine disponible. Les allocations de stock entre personnages sont partagées par le planning, les fiches du tableau de bord et les exports.

317 visuels originaux de matériaux disponibles localement ; URLs, dimensions et empreintes dans `assets/genshin/farm-materials/sources.json`, vérifiées par `tests/farm-art.test.mjs`. Aucun fichier manquant parmi les coûts de niveaux/talents du catalogue local.

Les besoins hors résine sont explicitement affichés et donnent accès au stock à saisir. Les dates restent des estimations sur rendements moyens ; la capacité réelle de récolte et l’exhaustivité des futurs personnages restent à auditer. P0-FARM-04, RESTE-041/044/117/118 demeurent ouverts : cette validation ne prétend pas clôturer leurs exigences intégrales.

## RESTE-043 · 2026-11-11T15:45:26+01:00

- [x] **RESTE-043** — Rendements du scénario utilisateur : 180 résines/jour ; Mora 540 000/jour, EXP environ 1 102 500/jour, boss normal environ 15–16 matériaux/jour ; livres environ 20 verts/18 bleus/2 violets par jour ; hebdomadaire 2–3 matériaux/run, une fois/semaine/boss, coût réel pris en compte.

# Farm — validation du 11 novembre 2026

196 tests unitaires réussis. `tests/farm_workshop_browser.py` réussit sur la page réelle : niveaux actuels/cibles normalisés pour chaque talent, maintien du panneau ouvert, stock consolidé, synthèse 3:1 après réservation globale, calendrier et réclamations hebdomadaires, scénarios 0–4, dates vertes actualisées, dates manuelles réservées, priorité par glisser-déposer, largeur mobile et recherche des personnages.

Le test télécharge un vrai PNG 2×, compare son SHA-256 au canevas de l’aperçu et vérifie la copie image/png dans le presse-papiers. Captures avant/après et PNG dans `docs/captures/farm-workshop/`.

Correction du rendement des talents : chaque rareté dispose de son stock, aucune conversion descendante ; moyennes par journée de 180 résines = 20 verts, 18 bleus et 2 violets. Les stocks inutilisés persistent. Les bonus hebdomadaires réduisent la résine disponible. Les allocations de stock entre personnages sont partagées par le planning, les fiches du tableau de bord et les exports.

317 visuels originaux de matériaux disponibles localement ; URLs, dimensions et empreintes dans `assets/genshin/farm-materials/sources.json`, vérifiées par `tests/farm-art.test.mjs`. Aucun fichier manquant parmi les coûts de niveaux/talents du catalogue local.

Les besoins hors résine sont explicitement affichés et donnent accès au stock à saisir. Les dates restent des estimations sur rendements moyens ; la capacité réelle de récolte et l’exhaustivité des futurs personnages restent à auditer. P0-FARM-04, RESTE-041/044/117/118 demeurent ouverts : cette validation ne prétend pas clôturer leurs exigences intégrales.

## FARM-DATES-20261111 — dates incomplètes corrigées

Une récolte dont la capacité manque ne reçoit plus de date finale même si une autre récolte du même personnage est connue. Le dépassement de 730 jours est explicite. Les besoins hors résine restent signalés séparément.

Validation : 199 tests unitaires réussis ; parcours `tests/farm_workshop_browser.py` réussi, avec téléchargement PNG identique à l’aperçu et copie presse-papiers. Preuves détaillées dans `docs/VALIDATION-FARM-TIERS-20261111.md`. Les exigences globales RESTE-044/117/118 ne sont pas clôturées par cette correction ciblée.
