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
