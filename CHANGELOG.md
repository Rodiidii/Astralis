# 1.0.51 — 12 novembre 2026

- Révèle la carte suivante d’un booster avec la barre d’espace, sans faire défiler la page.
- Affiche les vrais visuels de paquets Pokémon pour les 136 extensions, en WebP local pour rester rapide et disponible hors ligne.

# 1.0.48 — 11 novembre 2026

- Relance les planètes et leurs effets après une reconstruction de la vue, y compris avec la préférence système de réduction des animations.
- Normalise les reliques GOOD historiques à leur lecture afin qu’elles apparaissent et s’équipent dans Mes builds.
- Réduit la hauteur des listes de pièces et de sets et compacte les lignes d’artéfacts.

# 1.0.47 — 11 novembre 2026

- Regroupe les feuilles de style globales dans `styles/`, avec chargement, cache hors ligne et ressources liées mis à jour.
- Répare l’animation des lunes et des trois objets orbitaux du globe central, y compris quand plusieurs planètes sont affichées.
- Allège les nuages de Snezhnaya tout en conservant sa tempête de neige.
# 1.0.46 — 9 novembre 2026

- Étend le Laboratoire de dégâts : import GOOD avec aperçu et dédoublonnage, filtres de sets/stats, contraintes de priorité, comparaison de build, analyse de sensibilité et résultats d’optimisation.
- Rend les calculs de dégâts et de réactions vérifiables ; les données manquantes restent explicitement non confirmées.
- Ajoute des tests de référence pour les formules, l’inventaire et l’optimiseur.

# 1.0.42 — 8 novembre 2026

- Étend les correspondances Genshin.gg/GenshinFlex avec normalisation des accents, lecture tolérante de leur HTML et cache disque de secours.
- Affiche la provenance et la date des recommandations ; une absence de résultat est présentée comme telle, sans prétendre qu’un équipement est incompatible.
- Corrige le cadrage bord à bord des splash arts et affiche l’icône de type d’arme dans les fiches d’armes.

# 1.0.18 — 7 novembre 2026

- Rétablit un écran de lancement animé avec accueil personnalisé, heure/date locales, météo et messages de chargement.
- Remplace les symboles de navigation des jeux par les images fournies.
- Retire le fil d’Ariane de l’en-tête et regroupe les ressources du jeu avec un profil plus visible.
- Ajoute des compteurs éditables de primogemmes, vœux, jades, passes, astrites, marées et énergie; la résine HoYoLAB ouvre sa page dédiée.
- Renouvelle le cache hors ligne et inclut les nouvelles icônes.

# 1.0.17 — 7 novembre 2026

- Autorise correctement les requêtes d’installation provenant de localhost, 127.0.0.1 et ::1 sur le port local Astralis.
- Rétablit le défilement tactile et trackpad du menu latéral desktop.

# 1.0.16 — 7 novembre 2026

- Corrige la comparaison des versions : une release plus ancienne n’est plus signalée comme mise à jour disponible.

# 1.0.15 — 7 novembre 2026

- Ajout du Laboratoire de dégâts Genshin : simulateur transparent, détail des multiplicateurs et rotation enregistrée localement.
- Ajout d’un optimiseur GOOD exact pour un coup moyen, avec élagage des reliques dominées, worker annulable et liste de priorité.
- Les bonus 2 pièces et 4 pièces se cumulent correctement ; les données de talent/réaction manquantes restent marquées `TODO_DATA`.
- Le contrôle de mise à jour tolère une ancienne API locale qui renvoie la page HTML et consulte alors la release GitHub.
- Cache hors ligne renouvelé pour charger les nouveaux modules du laboratoire.

# 1.0.12 — 5 novembre 2026

- Restauration à l’identique des styles de cartes du fichier `cartes-apercu (8).html` pour le classeur et les boosters.
- Ajout d’un fallback d’illustration pour réduire les cartes vides lorsque l’art local dédié manque.
- Les effets restent masqués dans les cases du classeur et s’activent dans la vue détaillée.
- Mise en page compacte des cinq reliques sur une rangée et retrait du sélecteur d’inventaire importé dans l’éditeur de build.
- Police Circular Std choisie par défaut, avec sélection de police et import d’icône conservés dans Réglages.
- Ajout d’une bibliothèque de 200 presets d’animations de page, avec réduction des mouvements respectée.
- Cache hors ligne versionné et étendu aux nouveaux styles et au module d’animations.
# 1.0.13 — 6 novembre 2026

- Le bouton d’accès aux médias du thème est replacé dans le flux de page au lieu de rester épinglé à l’écran.
