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
