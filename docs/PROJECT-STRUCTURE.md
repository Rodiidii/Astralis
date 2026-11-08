# Structure du projet Astralis

Les chemins publics utilisés par l’application restent stables ; les modules ne sont pas déplacés afin de préserver les imports, le cache PWA et la mise à jour différentielle.

- `src/`: logique applicative et modules par domaine (`data.js`, `app.js`, calculs, assistants, classeur).
- `assets/genshin/elements/`: icônes élémentaires Genshin locales.
- `assets/genshin/weapons/types/`: icônes locales des cinq types d’armes Genshin.
- `assets/data/`: catalogues et données de jeu mises en cache/servies localement.
- `tests/`: tests automatisés des transformations et règles de données.
- `docs/`: documentation technique et sources.

Les nouveaux assets sont nommés par jeu et catégorie ; les données distantes gardent leurs identifiants source et un repli d’image local/distant.
