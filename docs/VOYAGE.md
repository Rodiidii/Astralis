# Accueil Voyage

La vue orbitale s’ouvre sur un système centré, sans panneau latéral. Les satellites suivent trois pistes elliptiques séparées, à des vitesses différentes selon la piste. Les membres d’une piste gardent leur espacement. Le mode Orbites libres rétablit les vitesses, rayons et inclinaisons individuels. Leur surface continue de tourner sur elle-même. Le passage de la souris ou le focus clavier immobilise la piste visée pour faciliter la sélection.

Cliquer une planète déclenche une approche de caméra en plusieurs phases : inclinaison du système, trajectoire courbe, passage latéral autour du globe et arrivée avec une grande planète en rotation d’un côté et son panneau de l’autre. Le côté est automatique selon la planète sélectionnée, ou imposé par son réglage individuel. Sur petit écran, la planète et son titre précèdent le panneau. Le panneau grandit avec son contenu sans barre de défilement interne. Le bouton Retour au système et Échap reviennent à la vue d’ensemble. La préférence de réduction des animations raccourcit le trajet et immobilise les orbites.

Le réglage Apparence propose, pour chaque widget, le corps céleste, le personnage éventuel, la couleur, la période orbitale, l’inclinaison, le rayon, la vitesse de rotation et la couleur du fond de sa destination. Les trois lunes décoratives sont plus éloignées du globe central. Les champs de débris et étoiles filantes animent les destinations. Les anciennes images d’exemple ne sont pas intégrées. La nouvelle carte explicitement demandée est conservée sous `assets/cosmos/teyvat-map-v2.png`. Un remplissage connexe depuis les bords remplace son fond blanc et gris clair par **#20638C** ; les zones blanches isolées de la carte restent intactes. La projection conserve ses proportions, sur une texture panoramique à fond #20638C.

Le fond **Sans thème espace** affiche des blocs sobres, sans corps célestes ni décor astronomique. Le mode Blocs classiques avec ambiance reste disponible indépendamment.

## Rendu et performances

La Voie lactée photographique est maintenant dans une couche visible au-dessus du fond, avec nuages colorés, étoiles de différentes tailles, 66 astéroïdes et 7 trajectoires d’étoiles filantes (cycles de 8 à 16 secondes). Les effets sont visibles dans la vue d’ensemble comme dans les destinations ; les astéroïdes sont désactivables. La couleur de fond reste personnalisable.

Mars, Neptune, Uranus, Vénus, Mercure, Jupiter et un monde volcanique complètent les apparences existantes. Les cinq nouvelles textures photographiques proviennent de Solar System Scope, CC BY 4.0. Sources, crédits et empreintes sont dans `assets/cosmos/astronomy-credits.json`. Les sphères partagent les textures en mémoire ; la destination utilise un canevas de 256 pixels, la planète centrale 224 et les icônes 64.

Les orbites et la caméra suivent `requestAnimationFrame`. Le rendu des textures est plafonné à 30 images par seconde ; les sphères hors écran et l’animation orbitale hors champ sont suspendues. La préférence de réduction des animations et l’interrupteur d’ambiance immobilisent les mouvements. Ce plafond ne constitue pas une mesure garantie sur chaque matériel.

## Widgets

- **Objectif de vœux** : total égal aux vœux possédés + partie entière des primogemmes / 160. Le formulaire de gains ajoute les deux ressources au solde courant sans les convertir. `currentPrimos` et `primos` restent synchronisés, le solde de vœux augmente et `gainLog` conserve les ajouts datés. Le rafraîchissement reprend les mêmes données pour les compteurs de la barre supérieure.
- **Daily Challenge** : sélection explicite de personnages et tirage sans doublon. Sans sélection, tout le catalogue disponible est utilisé. Le tirage et la sélection sont conservés par jeu sous `astralis:challenge:<jeu>`.
- **Ma session** : objectif libre, durée, lancement, pause, reprise et fin; tâches ouvertes cochables et note rapide. Une session est enregistrée sous `astralis:session:<jeu>`.
- **Résumé & priorités** : objectifs, sessions de farm et builds, avec résumés, détails dépliables, portraits et liens d’action.
- **Événements à venir** : illustration de la source ou première icône publiée, sinon pictogramme de calendrier. Les bannières disposent de leur propre widget. Les portraits de bannières présentes et à venir utilisent le même résolveur, avec des cadres circulaires.
- **Mon build Enka** remplace le mur générique : choix d’un personnage exposé, arme, statistiques et artéfacts. Les données privées ou absentes ne sont pas inventées.
- **Prochain endgame** : prochaine échéance, dernière composition publiée de l’Abîme par chambre et parties 1/2, puis détails disponibles du Théâtre et du Carnage. Les informations non publiées restent indiquées comme absentes.
- **Préparation des personnages** remplace le radar : fiches existantes, équipement renseigné et sessions restantes par personnage possédé/suivi, avec accès à la prochaine action. Ce n’est pas une note de puissance.
- **Mémo de rotations** est retiré du catalogue et des dispositions sauvegardées. Les équipes enregistrées restent disponibles dans leur page habituelle.
- Le widget d’activité « Constellation » est retiré du catalogue et des dispositions normalisées; les autres dispositions et sauvegardes ne sont pas effacées.

## Vérification

`node --test tests/*.test.mjs` comprend le calcul du portefeuille, les gains et le tirage avec/sans sélection. `python tests/voyage_browser.py` parcourt l’application avec des fixtures explicitement déclarées : orbites animées, approche de caméra, enregistrement des gains et compteurs, Daily Challenge, build Enka, moitiés de l’Abîme, session, réglages individuels, mode neutre et affichage mobile. Les captures `docs/voyage-*.png` sont des sorties de ces tests; les données de compte montrées sont fictives.

`node --test tests/cosmos-destination.test.mjs` vérifie la couleur exacte, la préservation de la neige et les pistes sur une heure simulée. Le test Voyage vérifie les rectangles des panneaux à gauche et à droite, la texture réelle, les effets présents, le mobile et la réduction des animations. Le test Cosmos charge chaque nouvelle texture photographique et vérifie les réglages et leur persistance.
