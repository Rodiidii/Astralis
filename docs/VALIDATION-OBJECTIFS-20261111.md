# Objectifs de vœux — cohérence des copies

Le calcul du plafond et la simulation utilisent maintenant la même normalisation des objectifs. Les constellations actuelles/cibles et raffinements actuels/cibles déterminent le nombre de copies restantes ; un ancien compteur enregistré ne peut plus contredire la possession. Les anciens objectifs qui ne renseignent que des copies restent compatibles.

Une modification directe du nombre de copies actualise les champs de possession correspondants. Les objectifs déjà atteints ont un coût nul. La pity initiale est consommée une seule fois dans l’ordre des objectifs et les restes de primogemmes sont conservés dans le déficit.

Chaque étape affiche son nombre de copies, son coût, le cumul et le financement restant. Les dates associées aux versions sont explicitement estimées.

208 tests unitaires réussis, dont quatre nouveaux cas dans `tests/wish-targets.test.mjs`. Les taux de Radiance et les scénarios probabilistes exhaustifs ne sont pas modifiés ni certifiés par cette correction. RESTE-047/048 restent ouverts pour leur validation complète.

Validation navigateur : `tests/rest_workshop_browser.py` réussi après relance ; `tests/wish_targets_browser.py` valide aussi le composant réel, la synchronisation bidirectionnelle copies/constellations et la persistance après rechargement.

## Budget théorique enregistré

La période du budget appliqué est désormais persistée. Une modification des revenus ou des dates indique que le budget des graphes doit être actualisé ; le dernier budget reste visible et utilisé explicitement. Une période invalide bloque l’application. Un ancien budget sans période n’est pas présenté comme à jour.

Trois tests dans `tests/wish-theory.test.mjs` couvrent les états absent/zéro appliqué/périmé/invalide. Le test navigateur `tests/wish_targets_browser.py` vérifie que modifier les revenus conserve les graphes jusqu’à application, que le bouton actualise effectivement leur budget et qu’une période invalide désactive le bouton.
