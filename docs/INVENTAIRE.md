# Inventaire fonctionnel initial Astralis

Date : 2026-11-08. Établi avant les refontes du cahier joint à partir du registre de navigation names dans src/app.js, des modules src/ présents et des feuilles CSS chargées par index.html. Cet inventaire sert de contrôle anti-régression ; les détails fins de chaque bouton et option seront complétés pendant les migrations.

## Pages/rubriques repérées

| Page | Clé de navigation | Implémentation actuelle | Fonctions à préserver / vérifier |
|---|---|---|---|
| Tableau de bord | dashboard | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Classeur | collection | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Boosters | boosters | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Personnages | characters | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Armes | weapons | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Sets & reliques | sets | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Objets & matériaux | materials | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Équipes | teams | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Favoris | favorites | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Tâches & objectifs | tasks | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Carnet | notes | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Médias | media | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Personnaliser | customize | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Compagnon | assistant | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Optimiseurs | optimizer | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Skowt · modèles & médias | skowt | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Sources & données | data | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Calc Sheets | calc | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Plan de farm | farming | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Endgame | endgame | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Mes builds | builds | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Laboratoire de dégâts | lab | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Profil Akasha | profile | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| HoYoLAB | hoyolab | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Vœux & objectifs | wishes | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Événements Genshin | events | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Lore & archives | lore | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Tier list | tierlist | src/app.js | À auditer : commandes, données, préférences, raccourcis |
| Journal des données | changelog | src/app.js | À auditer : commandes, données, préférences, raccourcis |

## Modules transverses relevés

| Fichier | Responsabilité apparente | Contrat à préserver |
|---|---|---|
| src/app.js | Coque, navigation, rendu des pages, actions déléguées, import/export | routes, boutons, stockage, modales, événements |
| src/data.js | Catalogues et normalisation des données | chargement, identifiants, relations et replis |
| src/store.js, src/persistence.js | État et persistance locale | données locales, import/export, préférences |
| src/lab-page.js, src/damage-engine.js | Laboratoire de dégâts et calculs | recherche d’attaques, rotation, cibles, résultats |
| src/optimizer.js, src/optimizer.worker.js, src/artifact-model.js | Optimisation / calcul d’artéfacts | inventaire, contraintes, progression, annulation |
| src/collection-data.js, src/equipment-cards.js | Catalogue de cartes et équipements | identité des cartes, rareté, images, classeur/booster |
| src/assistant.js, src/character-content.js | Compagnons, contenus et interactions | profils, déclencheurs, messages, dialogues |
| src/lore.js | Archives et lore | catégories, liens internes, textes et médias |
| src/wish-pulls.js | Suivi des vœux | historique, pity, probabilités et présentation |
| src/icons.js | Registre d’icônes | API de résolution et replis d’image |

## Contrôles globaux à compléter avant chaque refonte

- Navigation directe vers chaque clé, y compris après rechargement.
- Tous les boutons et formulaires de la page, événements délégués et raccourcis.
- Données affichées, filtres/recherche, tris, états vides/erreur/chargement.
- Persistance locale, import/export et compatibilité des anciennes sauvegardes.
- Responsive 390/768/1440 px, thèmes clair/sombre, clavier et mouvement réduit.
- Défauts ciblés du cahier : tests associés et captures avant/après dans docs/captures/.

## Limite de cet inventaire initial

L’inventaire des commandes individuelles n’est pas encore complet : aucune page n’a été remplacée. Il sera enrichi avant modification de chaque page et comparé au rendu final.
