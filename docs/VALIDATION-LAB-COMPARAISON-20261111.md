# Laboratoire — références et gains

Le calcul de comparaison est partagé par les résultats d’optimisation et la vue de comparaison. Une référence strictement positive permet `(candidat - référence) / référence × 100`. Une perte reste négative ; une égalité vaut 0 %. Référence inconnue, nulle ou négative et résultat non fini donnent un état explicite, jamais un pourcentage inventé.

Les cartes d’optimisation affichent la valeur de référence et son unité. Les objectifs PV/ATQ/DÉF comparent les statistiques correspondantes et ne dépendent plus d’un calcul de dégâts réussi. Les autres objectifs sans référence homogène ne reçoivent pas de gain artificiel.

L’optimisation DPS refuse une durée absente, nulle, négative ou non finie. Elle ne suppose plus une durée d’une seconde.

`tests/lab-comparison.test.mjs` vérifie les signes, les références invalides, les unités et durées, ainsi que le classement top 5 comparé à l’énumération brute de 243 assemblages variés avec deux sets et des sous-stats différentes. Ce cas ne constitue pas un benchmark de 1 000/5 000 pièces ni une validation de toutes les mécaniques complexes.

Les points globaux P0-LAB-02/03/05 restent ouverts pour les effets, rotations, équipes et inventaires plus grands.

Le test de rendu des cartes confirme −20 %, la référence 100 ATQ et le message de référence nulle sans NaN/Infinity. `tests/lab_browser.py` réussi : parcours laboratoire, inventaire, buffs, rotation et téléchargement PNG.
