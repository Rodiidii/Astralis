# Revue du site de référence — réseau des relations

Consultation en lecture seule le 15 novembre 2026 : [Ties CatForest — Genshin](https://ties.catforest.dev/genshin?utm_source=x&utm_medium=social&utm_campaign=yties-202611).

## Compteurs visibles

Le site affiche 233 308 extraits d’histoire, 1 626 quêtes, 122 personnages jouables et 1 203 répliques vocales. Il annonce également 68 012 références originales. Ce sont les chiffres présentés par la page à la date de consultation; ils ne décrivent pas les preuves actuellement intégrées dans Astralis.

L’interface présente une recherche, un roster trié par région, les liens vocaux et narratifs, une comparaison de deux personnages, des statistiques de mentions et des personnages sans lien. Son panneau « Sources » cite le contenu officiel du jeu, Genshin Impact Wiki pour les voix et audios, BWIKI pour l’histoire et les quêtes, Project Amber pour certaines transcriptions et HoYoWiki pour des sous-titres. Le site se décrit lui-même comme une œuvre de fans non officielle.

## Provenance et disponibilité des données

L’audit réseau du 15 novembre 2026 a chargé la page avec succès (HTTP 200). Le graphe est livré dans des ressources JavaScript statiques. Les fiches narratives peuvent être demandées en JSON public, individuellement par personnage et langue; par exemple `https://ties.catforest.dev/genshin/story/en/Amber.json` répond HTTP 200 et renvoie les sections d’histoire d’Amber. Le code client montre un repli vers le chinois lorsque la langue demandée est absente. Je n’ai trouvé ni archive de base globale, ni index exportable, ni API documentée pour télécharger en masse le corpus. Le compteur « 233,308 » est une statistique affichée par le site, pas le nombre de lignes d’un fichier vérifié.

Astralis charge ses propres données depuis data/relations.json et data/relations-official.json. Le premier fichier contient 4 984 preuves dans le corpus actuellement audité (l’audit de couverture en compte 4 989 après génération). Les preuves ont leurs sources dans docs/AUDIT-RELATIONS.md; elles ne constituent pas les 233 308 extraits affichés par le site de référence.

La valeur confirmée et corrigée par l’utilisateur est **233 308 passages d’histoire**. Les **1 203 lignes vocales** constituent un compteur séparé. Les contenus narratifs restent servis sur le site par fiche; Astralis n’en copie pas un corpus massif. Ses compteurs restent calculés uniquement depuis ses preuves locales, et le panneau Sources expose les métriques de référence dans une section séparée avec le JSON d’exemple et l’inventaire téléchargeable.

Le panneau « Sources » d’Astralis expose désormais son propre inventaire, groupé par hôte et dataset, avec les types de preuves, les langues et les URL. L’inventaire complet peut être exporté en JSON; les liens sont montés seulement lorsqu’un groupe est ouvert.

Le contrôle peut être relancé avec `node scripts/audit-ties-reference.mjs`. Il relit les compteurs de la page, inspecte les scripts statiques effectivement chargés pour retrouver les agrégats `lines`, `quests`, `defined`, `sources`, compare les compteurs d’histoire et de quêtes, puis vérifie le statut et la structure d’un JSON témoin sans télécharger en masse les dialogues.

## Inspection complémentaire de la livraison

Le bundle Next.js chargé lors du contrôle contient un module de configuration qui déclare `lines: 233308`, `quests: 1626`, `defined: 371` et `sources: 68012`. `lines` correspond aux passages d’histoire indexés; le site donne aussi séparément 1 203 lignes vocales. Le navigateur charge des modules linguistiques séparés et les JSON de récits par personnage. Le témoin Amber contient huit sections de profil. Le contrôle réseau du 15 novembre 2026 confirme HTTP 200 pour la page, le bundle et le JSON Amber, et retrouve les mêmes agrégats dans le HTML et le bundle. Les réponses ne déclarent pas `Access-Control-Allow-Origin`; un chargement `fetch` depuis Astralis dans un navigateur tiers est donc bloqué. Le script vérifie la livraison et les compteurs, mais n’archive pas le contenu du site.
