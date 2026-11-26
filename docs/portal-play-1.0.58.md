# Astralis 1.0.58 — Portail et jeux

Le tableau de bord devient un portail visuel : paysage de Teyvat, personnage choisi ou personnage du thème, géométrie orbitale, rayons de lumière, particules et profondeur au pointeur. Les mouvements respectent la préférence de réduction des animations. L’horloge, les informations et les commandes ne dépendent pas d’une animation.

L’accueil propose une prochaine action d’après les sessions de farm du jour, les objectifs ouverts et les équipes enregistrées. Ses quatre panneaux — farm, objectifs, vœux et événements — peuvent être masqués et réordonnés. Le budget utilise le solde enregistré ; aucun revenu prévisionnel n’est ajouté automatiquement. Les événements absents ne sont pas inventés.

Les réglages de l’accueil couvrent six paysages, le personnage, quatre ambiances, la couleur, la hauteur, la luminosité, l’intensité des mouvements, les particules, la réaction au pointeur, l’horloge et un message personnel.

Le menu latéral et la barre supérieure n’ont plus de bordure. L’habillage ajoute la respiration des pages, les arrondis, l’écart entre panneaux, la largeur du contenu, les transitions et une barre supérieure fixe ou défilante. L’espace au-dessus du contenu suit la hauteur réelle de la barre. Les pages conservent leurs outils existants.

## Arcade et Genshin Idle

Les couvertures de la galerie sont des illustrations et des paysages Genshin déjà présents dans l’application. Une couverture de personnage peut revenir au paysage de sa région si l’image manque. La galerie compte seize destinations : les quinze précédentes et Genshin Idle.

Genshin Idle retrouve son équipe de quatre, ses recrutements, ses niveaux, ses combats, ses régions et sa production hors connexion plafonnée à huit heures. Sa sauvegarde reste indépendante de l’Express et du compte de jeu réel. Le retour à la galerie arrête son minuteur et enregistre l’état courant. Un accès est également présent depuis la cabine, à côté de l’Express et du défi.

## Express des Mondes

Le comptoir prend une apparence de jardin de Teyvat avec une équipe compacte, une arène centrale et des ateliers. Deux autres ambiances sont proposées : escale nocturne et fête des lanternes. Le niveau des animations se règle indépendamment.

Les fêtes d’escale ajoutent trois programmes : récolte active et butin, double rendement des recettes, ou recharge/VIT/taux CRIT. Les matériaux sont réellement consommés. Chaque programme dure deux minutes et une escale ne peut relancer une fête qu’après cinq minutes. L’état est conservé par univers et région ; les effets expirent d’après la date enregistrée. Ces règles sont originales au mini-jeu et ne prétendent pas reproduire les kits officiels.

## CalcSheets

« Mes compositions » demeure dans Suivi, avec une position normale dans le document. Le bloc disparaît de l’écran lorsque le contenu défile. La vue Composition et rotation garde son tableau.

## Distribution et nettoyage

La release Windows est construite à partir du commit publié. Les profils locaux, brouillons privés, caches, diagnostics et tests sont exclus de l’archive. L’ancien moteur de tycoon, qui n’était plus importé, a été retiré avec sa feuille de style et ses entrées de cache.

Le dossier séparé `releases/InfinityFree/htdocs` est préparé pour l’hébergement web. Le fichier principal y est minifié ; deux moteurs de calcul volumineux sont servis avec compression gzip via `.htaccess`. Les vidéos sont demandées aux fichiers de la version GitHub. Aucun profil ou secret local n’est copié.

InfinityFree n’exécute pas le serveur Python. Le dossier comprend donc une passerelle PHP en lecture seule, avec adresse facultative d’un serveur de données Astralis pour les flux en direct. Les fonctions Windows restent réservées à l’application installée. La notice d’upload indique ces limites et le rapport distingue les vérifications locales d’un essai réel sur InfinityFree.

Les résultats observés sont enregistrés dans `portal-play-observed.json`. Les captures portant le préfixe `portal-` proviennent d’une session de test séparée ; les fiches et soldes de l’utilisateur n’ont pas été modifiés.
