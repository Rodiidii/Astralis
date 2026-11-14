# Héberger Astralis gratuitement et l’installer sur iPhone

Le projet est préparé pour Render en offre gratuite. Render fournit une adresse HTTPS, nécessaire pour l’installation PWA sur iPhone. Le serveur est protégé par un mot de passe généré au déploiement.

## Première mise en ligne

1. Pousser la branche contenant `render.yaml` sur le dépôt GitHub connecté à Render.
2. Se connecter à Render avec GitHub et choisir **New → Blueprint**.
3. Sélectionner le dépôt Astralis et confirmer la création du service `astralis-prive`.
4. Dans **Environment**, afficher la valeur générée de `ASTRALIS_ACCESS_PASSWORD` et la transmettre uniquement aux personnes autorisées.
5. Ouvrir l’adresse `https://astralis-prive.onrender.com` affichée dans le service. Safari demandera le nom d’utilisateur `astralis` et le mot de passe généré.

## Installation sur iPhone

1. Ouvrir l’adresse HTTPS dans Safari et s’authentifier.
2. Toucher **Partager → Sur l’écran d’accueil**, activer **Ouvrir comme app web**, puis **Ajouter**.

## Données et limites

- Les profils, équipes et réglages conservés par le navigateur restent locaux à chaque appareil ; ils ne sont pas synchronisés entre les personnes.
- La connexion HoYoLAB par cookie, l’installateur Windows et l’écriture d’exports dans les fichiers du projet restent désactivés côté hébergé.
- L’offre gratuite met le service en veille après une période d’inactivité ; le premier accès suivant peut prendre un peu de temps.
- Le système de fichiers du service gratuit n’est pas un stockage durable. Ne pas y enregistrer de données personnelles ou d’état partagé.
