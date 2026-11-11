# Nouveautés Astralis

Le journal visible dans l’application est alimenté par `changelog.json`. Le bouton **Quoi de neuf** de la barre supérieure permet de le rouvrir à tout moment. Une nouvelle entrée non lue déclenche une annonce discrète après le démarrage ; la fenêtre s’ouvre à la demande. Fermer la fenêtre mémorise la dernière version lue sur cet appareil.

## 11 novembre 2026

- Builds et équipes : visuels locaux, icônes de rotation, calcul des statistiques et conservation des sélecteurs pendant les chargements.
- Farm : stocks partagés, conversions par rareté, talents individuels, détails par journée, fiches de récolte et export PNG.
- Vœux : budget détaillé, objectifs de copies cohérents et indication des estimations périmées.
- Sauvegarde : objectifs et réglages supplémentaires conservés ; rappels locaux d’export.

Les entrées du journal décrivent uniquement les changements réalisés. Les limites visibles dans l’application sont conservées dans le JSON. Le détail des validations figure dans `docs/FAIT.md` ; les travaux restants demeurent dans `docs/A-FAIRE.md`.

## Ajouter une entrée

Conserver `schemaVersion: 1`. Chaque version a un `id` unique, une date `AAAA-MM-JJ`, un titre, un résumé et des `changes` avec `area` et `text`. Ajouter les limites importantes dans `limits`. Le journal trie les dates décroissantes et ignore les entrées mal formées. Changer l’identifiant pour annoncer une nouvelle livraison ; ne pas réutiliser un identifiant déjà lu pour des modifications importantes.
