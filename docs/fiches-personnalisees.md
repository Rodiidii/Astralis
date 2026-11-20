# Fiches personnalisées

## Stockage de publication sur le site hébergé

Les brouillons restent dans le navigateur de l’auteur. Les publications partagées sont conservées dans un dépôt GitHub privé : le service Render utilisé par Astralis n’a pas de disque persistant par défaut.

Dans les réglages du service Render, ajoute ces variables d’environnement :

| Variable | Valeur |
| --- | --- |
| `ASTRALIS_CHARACTER_SHEETS_ADMIN_PASSWORD` | Un mot de passe privé réservé à l’auteur des fiches. |
| `ASTRALIS_CHARACTER_SHEETS_GITHUB_REPO` | Le dépôt privé de stockage, au format `proprietaire/nom-du-depot`. |
| `ASTRALIS_CHARACTER_SHEETS_GITHUB_TOKEN` | Un jeton GitHub limité à ce dépôt, avec l’autorisation **Contents: Read and write**. |

Astralis utilise la branche `main` et le dossier `published/character-sheets` par défaut. Le petit index se trouve dans `index.json`; chaque fiche est dans son propre fichier afin que les contrôles périodiques ne téléchargent pas les images ni le contenu complet. Les variables `ASTRALIS_CHARACTER_SHEETS_GITHUB_BRANCH` et `ASTRALIS_CHARACTER_SHEETS_GITHUB_PATH` permettent de modifier ces choix.

Le mot de passe d’accès général au site ne donne pas le droit de publier. La session auteur utilise un cookie HTTPOnly, SameSite Strict, valable 12 heures. Les visiteurs peuvent lire les fiches par l’API du site; le jeton GitHub ne quitte jamais le serveur.

## Comportement de réception

- L’application vérifie les nouvelles publications à son ouverture, puis toutes les cinq minutes.
- Elle attend deux minutes sans interaction avant de télécharger les fiches et leurs nouvelles versions.
- Un message centré indique la progression sans remplacer ni fermer la page.
- La pastille du menu latéral compte les fiches nouvelles ou modifiées jusqu’à leur ouverture.
- Les fiches déjà téléchargées restent lisibles hors connexion.

## Fonctionnalités de l’éditeur

L’éditeur propose des fiches de build, d’équipe ou de rotation; plusieurs pages par personnage; la table des matières; la recherche par nom ou tag; une couverture locale ou HTTPS; six palettes et des couleurs personnalisées; titres sur quatre niveaux; gras, italique, soulignement, barré, couleurs, surlignage, taille, alignement, listes, citations, exposants, indices, code et liens HTTPS; les jetons `:element:`, éléments, actions, passifs, statistiques et portraits de personnages; des blocs texte, encadré, image, tableau, équipe et séparation; le déplacement des blocs, six largeurs, les couleurs par bloc, les lignes et colonnes de tableau et leurs bandes; légende, texte alternatif, largeur et alignement des images; quatre emplacements d’équipe avec personnage, arme et artéfact; quatre modèles de départ; autosauvegarde privée et enregistrement manuel; import et export JSON; aperçu téléphone, tablette et ordinateur; lien direct à partager; publication, révision versionnée et retrait d’une fiche.
