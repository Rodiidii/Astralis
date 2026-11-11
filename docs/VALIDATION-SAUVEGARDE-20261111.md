# Sauvegarde et rappels

L’export portable conserve désormais une extension versionnée avec les objectifs de vœux/budgets, talents, priorité/EXP/scénario de farm, profil local, classeur, compteurs de boosters et dispositions des trois jeux. Les clés sont explicitement autorisées ; les tokens ou caches ne sont pas exportés par ce mécanisme. Les sauvegardes sans extension restent compatibles.

`tests/backup-workspace.test.mjs` vérifie l’aller-retour de toutes les clés, le rejet préalable des clés inattendues/JSON invalide, le retour aux anciennes valeurs de l’extension en cas d’écriture interrompue, et le rappel après sept jours/report de 24 h/désactivation.

`tests/backup_browser.py` exerce le téléchargement du vrai fichier depuis le bouton Exporter, efface les clés de test puis restaure le fichier avec le sélecteur Importer. Objectifs, talents, stock et priorité correspondent exactement aux données initiales. Le contrôle porte aussi sur la disparition du rappel après export, sa réapparition avec un export ancien et le report au lendemain.

Le rappel est local à l’application ouverte. Le fichier doit être conservé par l’utilisateur. La restauration complète des médias et toutes les opérations IndexedDB ne sont pas encore transactionnelles ; aucune garantie de transaction globale n’est annoncée. Le guide iPhone est mis à jour. RESTE-101 reste ouvert pour l’essai de bout en bout sur un appareil iPhone physique.
