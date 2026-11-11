# Suite des demandes Astralis — 11 novembre 2026

## Livré dans cette révision

- Portefeuille de vœux éditable : primogemmes et destinées séparées, journal des gains, raccourcis de récompenses, protection contre les doubles crédits, graphiques 7/30/90 jours et répartition mensuelle. Les ajustements de solde ne sont pas pris pour des revenus.
- Date de garantie calculée avec les récompenses à leur date ; cartes de scénarios de pertes, paramètres d’exploration et cadeaux explicites. Aucun cadeau de carte inventé automatiquement.
- Actualités réservées aux sources officielles HoYoverse/HoYoLAB ; le calendrier est indépendant du fil. Versions estimées signalées, endgames et bannières séparés des objectifs de farm.
- Navigation datée des rotations endgame, conservation des compositions publiées et archivage local. Une composition absente n’est pas copiée depuis une autre rotation.
- Objectifs d’aptitudes avec portraits ; jours de domaine valides surlignés ; réservation des jours manuels ; trois boss hebdomadaires différents peuvent accompagner une semaine de farm.
- Fiches de personnages : icônes des passifs et onglet des builds enregistrés. Lore : typographie, couleurs, vidéos et absence de débordement horizontal harmonisées.
- Répertoire des descriptions des armes R1–R5, sets et kit chargé ; recherche et téléchargement JSON.
- Optimiseur : inventaire utilisateur par défaut, pièces verrouillées incluses sauf exclusion explicite, recherche/position directe dans les priorités, application des sets recommandés.
- Les paliers de sous-stats suspects restent un diagnostic et ne rendent plus inutilisable une pièce structurellement exploitable.
- Trois JSON fournis par l’utilisateur conservés comme fixtures de régression.
- Actualisation des tables numériques chaque jour, exports Celestia toutes les six heures, pendant l’ouverture du serveur local. Échec réseau : conservation des fichiers précédents. Les nouveaux exports gardent le badge Nouveau jusqu’à consultation.

## Validation

163 tests unitaires JavaScript et 5 tests Python passent. Les parcours navigateur `rest_workshop_browser.py`, `site_planning_browser.py`, `relations_browser.py`, `lore_browser.py` et `lab_browser.py` ont été exécutés. Le dernier inclut la sauvegarde TC, le calcul et le téléchargement PNG. Les tests Python couvrent les routes d’export, l’archivage daté et l’intervalle de maintenance. Les tests unitaires couvrent aussi les conversions de matériaux, réactions et inventaires GOOD/Enka.

Pour les mécaniques avancées de Skirk et des plumes, voir [TEST-SKIRK.md](TEST-SKIRK.md).

## Limites explicites

- L’archive publique historique peut répondre HTTP 403. Les dates/compositions non récupérées sont indisponibles, sans composition inventée.
- L’actualisation Celestia et des tables nécessite le serveur Python ouvert et le réseau. Les tests de maintenance vérifient son déclenchement ; ils ne garantissent pas la disponibilité permanente des services distants.
- Le répertoire des effets est plus large que la liste des mécaniques automatiquement calculées. Les descriptions complexes non modélisées demandent des buffs personnalisés explicites. Cette livraison ne certifie pas l’exhaustivité de tous les kits et constellations du jeu.
- L’exhaustivité de toutes les relations de lore dépend des preuves disponibles. Ce travail de présentation ne transforme pas une hypothèse en relation attestée.

Relancer le serveur local pour charger les nouvelles routes Python ; le cache de l’application est renouvelé automatiquement.
