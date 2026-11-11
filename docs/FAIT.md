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
