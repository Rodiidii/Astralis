# Farm — validation du 11 novembre 2026

196 tests unitaires réussis. `tests/farm_workshop_browser.py` réussit sur la page réelle : niveaux actuels/cibles normalisés pour chaque talent, maintien du panneau ouvert, stock consolidé, synthèse 3:1 après réservation globale, calendrier et réclamations hebdomadaires, scénarios 0–4, dates vertes actualisées, dates manuelles réservées, priorité par glisser-déposer, largeur mobile et recherche des personnages.

Le test télécharge un vrai PNG 2×, compare son SHA-256 au canevas de l’aperçu et vérifie la copie image/png dans le presse-papiers. Captures avant/après et PNG dans `docs/captures/farm-workshop/`.

Correction du rendement des talents : chaque rareté dispose de son stock, aucune conversion descendante ; moyennes par journée de 180 résines = 20 verts, 18 bleus et 2 violets. Les stocks inutilisés persistent. Les bonus hebdomadaires réduisent la résine disponible. Les allocations de stock entre personnages sont partagées par le planning, les fiches du tableau de bord et les exports.

317 visuels originaux de matériaux disponibles localement ; URLs, dimensions et empreintes dans `assets/genshin/farm-materials/sources.json`, vérifiées par `tests/farm-art.test.mjs`. Aucun fichier manquant parmi les coûts de niveaux/talents du catalogue local.

Les besoins hors résine sont explicitement affichés et donnent accès au stock à saisir. Les dates restent des estimations sur rendements moyens ; la capacité réelle de récolte et l’exhaustivité des futurs personnages restent à auditer. P0-FARM-04, RESTE-041/044/117/118 demeurent ouverts : cette validation ne prétend pas clôturer leurs exigences intégrales.

## Fiabilité des dates — complément

Trois tests `tests/farm-completion.test.mjs` couvrent une récolte inconnue combinée à une récolte connue, le dépassement de l’horizon de simulation et les stocks hors résine. Le moteur expose un état explicite par personnage. Aucune date ni contour vert ne doit être créé si une récolte reste sans capacité ou si les activités dépassent l’horizon. Une date estimée avec des matériaux hors résine manquants conserve le signalement de stock à compléter. Les points de couverture générale des données et récoltes restent ouverts.
