# Installer Astralis sur iPhone gratuitement

## Ce qui est prêt et ce qui reste nécessaire

Astralis possède un manifeste, des icônes PNG adaptées à iOS et un service worker. L’installation depuis Safari nécessite une adresse HTTPS accessible par l’iPhone. Une adresse `127.0.0.1` du PC ne désigne jamais ce PC depuis l’iPhone.

Les fonctions locales (équipes, builds, inventaire, réglages, exports) restent sur l’appareil. Certaines fonctions dépendent du serveur Python : actualités, données de certaines sources, import via proxy et collecte Celestia. Une copie statique seule ne remplace pas ce serveur. Un mode hors ligne conserve les fichiers déjà mis en cache, pas toutes les images distantes ni les mises à jour en direct.

## Installation depuis une adresse HTTPS

1. Ouvrir l’adresse d’Astralis dans **Safari** et attendre la fin du chargement. Ouvrir une première fois les pages utiles pour les mettre en cache.
2. Toucher **Partager**, puis **Sur l’écran d’accueil** et **Ajouter**. Si l’option n’apparaît pas, vérifier que l’adresse est ouverte directement dans Safari et non dans un navigateur intégré à une messagerie.
3. Ouvrir Astralis depuis sa nouvelle icône. Les données du PC ne se transfèrent pas automatiquement : exporter la sauvegarde depuis le PC puis l’importer dans l’application iPhone.

L’installation sur l’écran d’accueil ne nécessite ni abonnement ni compte développeur Apple payant. Le geste d’ajout est effectué par l’utilisateur dans Safari ; un test automatisé ne peut pas certifier l’icône réellement ajoutée sur son iPhone.

## Utiliser le PC comme serveur

Le serveur doit rester ouvert sur le PC. Pour un accès hors réseau local, un tunnel HTTPS peut exposer son port ; son adresse temporaire peut changer après redémarrage. Ne pas exposer des fichiers personnels ou des secrets avec un serveur générique lancé depuis le dossier utilisateur. Utiliser uniquement le serveur de l’application depuis son projet et vérifier ses contrôles d’origine.

En réseau local, une adresse `http://IP-DU-PC:8766` peut servir à consulter l’application si le serveur écoute sur cette interface et que le pare-feu l’autorise. Cette adresse HTTP n’équivaut pas à une PWA HTTPS : le service worker et les fonctions qui exigent un contexte sécurisé peuvent être indisponibles.

## Mise à jour

Avec le réseau et le serveur accessibles, fermer puis rouvrir Astralis. Les modules sont renouvelés et les nouveaux fichiers mis en cache. Ne pas effacer les données du site pour une mise à jour ordinaire : cela peut supprimer les sauvegardes locales.

## Sauvegarder les données

Utiliser **Exporter** dans Astralis et conserver le fichier dans Fichiers/iCloud Drive. Garder au moins une copie hors du stockage du navigateur. Avant de changer d’adresse, de navigateur ou de téléphone, exporter puis tester l’import sur le nouvel emplacement. Chaque adresse possède son propre stockage : changer d’URL de tunnel peut donner l’impression d’avoir perdu les données alors qu’elles sont attachées à l’ancienne adresse.

L’iPhone peut supprimer le stockage d’un site dans certaines situations ; l’installation n’est pas une sauvegarde distante. Les fichiers d’export peuvent contenir le profil et les données du joueur : les conserver en privé.

## Dépannage

- **Page inaccessible** : vérifier l’adresse HTTPS, le serveur PC, le tunnel et le réseau.
- **Actualités ou import indisponibles mais équipes visibles** : les fichiers locaux fonctionnent ; la partie serveur ou une source distante est indisponible.
- **Images absentes hors ligne** : ouvrir les pages avec le réseau avant de repartir hors ligne ; toutes les images ne sont pas préchargées.
- **Ancien affichage** : fermer toutes les fenêtres Astralis puis rouvrir avec le réseau. Exporter sa sauvegarde avant toute suppression manuelle des données du site.
- **Safari et application installée différents** : importer explicitement la sauvegarde dans la fenêtre qui sera utilisée.

## Vérification fournie

Les tests vérifient le manifeste, les tailles PNG, le lancement WebKit en viewport iPhone et le fonctionnement hors ligne sur Chromium. Ils ne remplacent pas un essai d’ajout sur un véritable iPhone ni la disponibilité permanente d’un hébergement HTTPS et de son backend.
