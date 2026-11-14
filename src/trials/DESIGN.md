# Épreuves de Teyvat — conception et équilibrage

## Règles

| Système | Valeur mise en œuvre |
| --- | --- |
| Équipe Énergie / Sans soin | 5 / 4 personnages |
| Rareté | au plus un 5★ par expédition |
| Invocation ciblée | personnage garanti dans les 2 prochains tirages d’équipe |
| Expédition | 5 zones × 6 étages = 30 étages |
| Butin | +10 boosters par étage réclamé, donc +300 sur un parcours complet |
| Bestiaire | 48 boss et élites sélectionnables, chacun avec emblème vectoriel et profil dédié |
| Boss hebdomadaire | rotation déterministe par semaine ISO, un essai quotidien |
| Saison | 3 éléments et jusqu’à 3 personnages mis en avant pour toute la semaine ISO ; personnages vedettes : ATQ +12 % |
| Sanctuaires Sans soin | zones 2, 4 et 5 de chaque cycle de cinq zones ; restauration intégrale garantie |
| Infini, mode Énergie | +15 % PV aux combattants actifs au passage d’une zone |

La halte du mode Énergie propose un vrai choix : +24 % PV à toute l’équipe, +55 % aux deux personnages les plus blessés, ou +22 Énergie d’expédition. Le mode Sans soin n’offre aucune récompense de soin ; ses seuls soins sont les sanctuaires. La progression, les chroniques et l’essai quotidien sont conservés sur l’appareil.

## Formules utilisées

- Dégâts : `ATQ × multiplicateur × (1 + bonus) × défense × résistance × réaction × résonance`.
- Défense : `190 / (190 + DEF ennemie)`.
- Résistance : `1 − RES` jusqu’à 75 %, puis `1 / (4 × RES + 1)` ; une résistance négative est amortie de moitié.
- Réactions simplifiées : multiplicateur selon la paire élémentaire ; l’attaque élémentaire pose l’aura utilisée par la suivante.
- Coûts : 12 Énergie d’expédition pour entrer en combat, 5 par compétence, 14 par Burst ; Burst chargé à 60.
- PV ennemis : `1,22^(zone−1)` jusqu’à la zone 5, puis `1,01^(zone−5)` en Infini. Attaque : `1,14^(zone−1)`, puis `1,01^(zone−5)` en Infini.
- Rencontre : normal ×2,8 ; élite ×1,45 ; boss de zone ×6,2 ; boss hebdomadaire ×2,2 (×1,3 pour son occurrence en Infini).
- Récompenses : 100 points × zone ; 10 boosters à la validation de l’étage.

## Idées ajoutées

1. Invocation ciblée temporaire avec compteur persistant.
2. Choix du boss de départ dans le bestiaire ; boss hebdomadaire choisi par la semaine ISO.
3. Carte ramifiée avec combats, élites, haltes, sanctuaires, failles, marchands et autels.
4. Chroniques locales des runs et classement par score.
5. Saison hebdomadaire avec éléments, combattants vedettes, bonus et emblèmes de boss.

## Rapport de simulation

`node src/trials/sim.js` exécute 5 000 parcours par stratégie et mode. Le moteur simulé partage les profils de boss, la croissance, les coûts, la saison et les soins ciblés avec l’application. Il compte aussi les lancers séparément pour les combats normaux, élites, boss de zone et boss hebdomadaires.

Le cahier des charges donne des taux de parcours atteints cumulés de 92 %, 82 %, 68 %, 52 % et 38 % en mode Énergie. Le mode Sans soin vise environ 10 à 15 points de moins. Dernière simulation :

| Zone atteinte | Énergie mesuré | Cible Énergie | Sans soin mesuré | Cible Sans soin (−12,5 pts) |
| --- | ---: | ---: | ---: | ---: |
| 1 | 97,1 % | 92 % | 84,2 % | 80 % |
| 2 | 82,4 % | 82 % | 76,3 % | 70 % |
| 3 | 68,7 % | 68 % | 54,5 % | 56 % |
| 4 | 60,2 % | 52 % | 48,0 % | 40 % |
| 5 | 41,0 % | 38 % | 32,6 % | 26 % |

Profondeur médiane en Infini : IA naïve, gloutonne, experte — Énergie : zones 2, 5, 7 ; Sans soin : zones 1, 4, 5. La stratégie experte atteint donc la cible de 7 à 8 zones en mode Énergie. Les écarts du mode Sans soin sont liés aux sanctuaires garantis, qui produisent des paliers de récupération ; les résultats restent visibles dans la sortie complète du simulateur plutôt que présentés comme un ajustement parfait.

La simulation complète inclut l’énergie moyenne restante, les casts par rencontre, et les défaites dues à l’épuisement d’énergie ou aux PV. Les taux par stratégie sont calculés séparément, afin que la moyenne ne masque pas la stratégie naïve ou experte.

## Liaison avec le catalogue Astralis

`renderExpedition` accepte `characters`, `owned` et `profileIcon`. Les personnages sont convertis en `{ id, name, rarity, element, region, image }`; `profileIcon(character)` fournit leur icône de profil. `owned` est une table `{ [characterId]: true }`. Si la collection possédée est trop petite pour l’équipe, le tirage s’étend au catalogue chargé.
