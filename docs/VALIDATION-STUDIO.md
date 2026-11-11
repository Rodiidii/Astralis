# Atelier, planification et tableau de bord — 10 novembre 2026

## Modifications intégrées

| Demande | Résultat |
|---|---|
| Portraits des planètes | Venti, Zhongli, Raiden, Nahida, Furina, Neuvillette, Mavuika, Columbina et Tsarine : fichiers locaux utilisés par les équipes et les relations. |
| Suppression Résumé & priorités | Retiré du catalogue des widgets et des dispositions sauvegardées, sans réinitialiser les autres réglages. |
| Neuf mondes régionaux | Surfaces procédurales, reliefs projetés en 3D, arbres/pyramides, volcan et éjectas, orages, nuages/pluie, anneaux d’eau, trois lunes dans des plans différents, neige et astéroïdes. Aucune image IA. |
| Personnalisation | Couleur, surface, rotation, orbite, vitesse, fond et panneau gauche/droite/haut/bas par planète. Tailles différentes et séparation des sphères. Mouvement réduit et pause hors écran conservés. |
| Bibliothèques | Barre sur une ligne, recherche dimensionnée et libellés adaptés aux personnages, armes, sets et matériaux. Défilement limité à la barre sur petit écran. |
| Équipes | Repli quand un filtre sauvegardé vise une équipe supprimée, identifiants numériques acceptés, chargements protégés contre les boucles, détails maintenus ouverts et boutons d’édition vérifiés. |
| Builds | Portrait compact, sélections proportionnées, statistiques conservées, sélecteur ouvert préservé après chargement. Les sources d’images en échec sont mémorisées pendant la session. |
| Plan de farm | Priorité des personnages et des activités ; jours d’artéfacts placés sur les jours les moins urgents, niveaux actuels/cibles de chaque talent, stock partagé, synthèse 3:1 après réservation de tous les besoins, domaines ouverts uniquement aux jours publiés. |
| Calendrier de farm | Comparaison de 0 à 4 jours d’artéfacts par semaine, dates par personnage, mise à jour après changement de stock, fin estimée entourée de vert. Hebdomadaires en supplément, une réclamation par boss/semaine, résine réduite suivie. Livres/EXP/Mora/artéfacts/hebdomadaires illustrés. |
| Récoltes | Hors cases à résine. Capacités de 60 spécialités récupérées depuis la carte officielle, rendement par point pour les plantes groupées, passages espacés de 48 h et besoins cumulés entre personnages. |
| Actualités | Les sessions personnelles ne sont plus mélangées aux actualités. Calendrier compact, noms sur les plages continues, cycles mensuels, Carnage et bannières issus du flux. Clic sur un jour : toutes ses entrées et sources. Affichage des sources structurées corrigé. |
| Objectifs de vœux | Ordre modifiable, copies et constellations/raffinements actuels/cibles, pity et garanties du compte. Déficit exact en primogemmes, restes inférieurs à 160 conservés. Ancien objectif migré. |
| Probabilités | Deux graphes, solde actuel et solde avec revenus ; réussite cumulative par objectif, médianes, scénarios par nombre de 50/50 perdus. 6 000 simulations reproductibles. |
| Revenus personnalisés | Quotidiennes/Faveur, versions de 42 jours depuis le 04/11/2026, codes, événements, boutique, Théâtre/Abysses, cartes, vœux/multis et ajouts. Détail daté et transfert vers le budget théorique. |
| Mise à jour | Cache applicatif v80, nouveaux modules/données/icône fournie inclus. |

## Règles et limites explicites

- Les règles de revenus demandées constituent un scénario personnel ; elles ne sont pas présentées comme un calendrier de récompenses garanties par HoYoverse. Les jours explicitement nommés ont priorité sur les offsets approximatifs : troisième dimanche J18, quatrième dimanche J25 et cinquième mercredi après lancement J35.
- Le plafond des vœux est volontairement conservateur. Les taux intermédiaires de Radiance et la courbe de soft pity du modèle statistique sont communautaires, indiqués à côté des graphes. La garantie après trois pertes est distincte de la garantie classique. Source publique : https://www.hoyolab.com/article/32168979
- Les dates de farm utilisent les rendements moyens demandés et 180 résines/jour. Elles incluent les récoltes connues, excluent la recherche d’artéfacts et supposent les monstres/couronnes disponibles ainsi que les conversions de matériaux hebdomadaires. Un matériau régional absent de la carte n’obtient pas un nombre inventé.
- La carte officielle fournit des emplacements : les spécialités groupées multiplient ces emplacements par les unités récoltables. Cache et source par matériau dans `data/local-specialties.json`, mise à jour reproductible avec `python tools/sync-local-specialties.py`.
- Les tests navigateur utilisent des réponses réseau contrôlées pour reproduire les pannes et les mêmes comptes. Ils vérifient les parcours locaux, sans garantir la disponibilité future des sources externes.

## Vérification

- Tests Node : `node --test tests/*.test.mjs` ; import des modules, statistiques, artéfacts, optimisation, relations, planification et régressions.
- `tests/lab_browser.py` : attaques, inventaire, buffs de sets, rotations, sauvegarde et téléchargement PNG, import Enka avec principales et sous-statistiques.
- `tests/site_planning_browser.py` : équipe sauvegardée et modale, build et sélecteur maintenu ouvert, objectifs/constellations, graphes, farm automatique, actualités et calendrier quotidien, barre de catalogue.
- `tests/voyage_browser.py` : neuf régions et portraits chargés, séparation des sphères, destinations, gains, Daily Challenge, Enka, endgame, session, quatre positions de fiche, mode neutre, mobile et mouvement réduit.
- Captures et journaux associés dans `docs/` : `build-current.png`, `wishes-current.png`, `farm-current.png`, `news-current.png`, `catalog-current.png`, `voyage-*.png`, `verification-current.log`, `site-current-browser.log`, `lab-current-browser.log`, `voyage-regions.log`.
