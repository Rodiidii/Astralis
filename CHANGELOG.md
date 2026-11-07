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
