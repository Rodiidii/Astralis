# Automatisation des catalogues

| Jeu / données | Source configurée | Actualisation | Secours |
|---|---|---|---|
| Genshin : personnages, armes, artéfacts | Lunaris versionné + genshin-db | À la demande; jeu actif au démarrage et au plus toutes les 6 h | Cache local puis export statique livré avec Astralis |
| Star Rail : personnages, cônes, reliques, objets | Nanoka + StarRailStaticAPI / catalogues locaux | À la demande; jeu actif au démarrage et au plus toutes les 6 h | Cache local et fichiers locaux |
| Wuthering Waves : catalogues et matériaux | Catalogues locaux / assets publics configurés | À la demande; jeu actif au démarrage et au plus toutes les 6 h | Cache local et fichiers locaux |

`import-sources.json` est un manifeste public d’URL et de chemins, jamais un emplacement pour identifiants. `src/import-sources.js` valide schéma, hôtes HTTPS et chemins locaux; s’il est absent, illisible ou invalide, les valeurs intégrées de secours sont utilisées et l’état est affiché dans Sources & données.

Chaque synchronisation passe par `catalog()` : un cache frais est réutilisé, les erreurs sont enregistrées localement et le dernier catalogue valide reste affichable. La limite stricte est de 16 Mio par réponse JSON, contrôlée aussi lorsque le serveur ne donne pas `Content-Length`; Astralis n’essaie donc pas de charger une archive géante. Le bouton « Synchroniser maintenant » force personnages, armes, sets et matériaux du jeu actif. La synchronisation périodique ne force pas le réseau et se limite au jeu actif; les autres jeux se mettent à jour à leur prochaine consultation.

Le journal local conserve au plus 100 résultats (`astralis:data-sync-log`) et ne contient pas de cookies, identifiants HoYoLAB ni données personnelles. Les catalogues de bêta ne sont visibles qu’après leur publication par une source; l’application ne fabrique pas les kits manquants. Les nouveaux éléments ne sont pas encore soumis à une file de modération dédiée.
