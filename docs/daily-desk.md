# Astralis 1.0.59 — quotidien et communauté

Le tableau de bord reprend le plan de farm du jour, ses matériaux et ses personnages. Les sessions terminées sont conservées dans le même calendrier. Les profils choisissent paysage, personnage illustré, personnages suivis, serveur, espacement, couleur, mouvement et chacun des huit blocs (ordre, largeur, visibilité, titre et couleur). Les dispositions sont exportables.

Le menu est regroupé par usage et le démarrage se fait sur Genshin. Les pictogrammes de contenu et de navigation réutilisent les ressources du jeu déjà présentes. La barre du haut conserve ses commandes. Les mises à jour de données ne relancent plus les effets d’entrée en boucle.

Les Abysses et le Théâtre utilisent le reset mensuel à 4 h du serveur. Le Carnage conserve seulement une date publiée. Sources : [aide officielle HoYoverse](https://support.hoyoverse.com/hc/en-us/articles/50333950598553-When-does-the-Spiral-Abyss-reset-and-what-are-the-rewards), [HoYoWiki — Théâtre](https://wiki.hoyolab.com/pc/genshin/entry/5832).

Les fiches publiées sont vérifiées toutes les 30 secondes à l’ouverture et pendant l’utilisation. Le téléchargement commence immédiatement, sans condition d’inactivité. Le lecteur conserve sa position et les brouillons ne sont jamais remplacés. Le cache de l’index public reste inférieur à la période de vérification. Les installations autres que celle du créateur sont en lecture seule ; seul le poste configuré localement dispose du droit de publication GitHub.

Les bugs et idées sont envoyés au service PHP du site. Catégorie, description, étapes et capture facultative sont validées. Les messages et pièces jointes sont stockés hors du dossier public lorsque l’hébergement le permet. Sur InfinityFree, ils sont conservés dans un dossier protégé par une règle serveur de refus et une seconde protection propre au dossier ; leurs adresses directes sont vérifiées avant livraison. Les sessions du créateur utilisent un cookie HttpOnly ; les visiteurs ne peuvent lire ni l’index ni un message individuel. La boîte privée, sa notification et sa pastille se rafraîchissent toutes les 30 secondes. La clé créateur est exclusivement dans assets/user, exclu du dépôt et des distributions. Le raccourci privé local ouvre la boîte du propriétaire, sans introduire de secret dans les fichiers publics.

L’avatar du profil produit une vraie icône PNG 512×512 et un manifeste spécifique. Safari utilise apple-touch-icon lors de l’ajout à l’écran d’accueil. L’icône d’un raccourci existant peut nécessiter de supprimer puis recréer le raccourci. [Documentation Apple](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html). Le comportement d’installation sur un appareil physique Apple doit être vérifié sur l’appareil ; les tests du projet valident l’image, son adresse et le manifeste.

## Vérifications

- Logique : limites de la personnalisation, dates serveur, changements de mois et années, totaux du farm.
- API PHP réelle avec stockage temporaire : envoi privé et capture, accès visiteur refusé, accès créateur, statut, suppression, refus des images exécutables et création du PNG de profil.
- API Python : publication réservée à l’auteur, versions successives et lecture publique.
- Navigateur isolé : vraie sauvegarde de session farm, personnages suivis, personnalisation persistante, icônes, navigation et écran de 390 px.
- Horloge de navigateur contrôlée : téléchargement automatique, nouvelle version pendant la lecture active, conservation de la position, nouveau message dans la boîte, badge et notification au bout d’un intervalle de 30 secondes.
- Dossier InfinityFree : limites de taille, ressources privées exclues, moteurs de calcul comprimés et démarrage dans le navigateur.

Les contrôles de logique ne simulent pas une panne de réseau ni la suspension d’un navigateur par le système. La vérification reprend immédiatement au retour en ligne et à la réouverture de l’onglet. Les flux Événements et Endgame détaillés nécessitent toujours le serveur Python externe déjà indiqué dans la distribution web.
