# Observatoire personnel

Le nouvel accueil est rendu par `src/dashboard-studio.js` et `dashboard-studio.css`. Les données viennent des catalogues, tâches, vœux, équipes, calendrier et profils déjà présents dans Astralis. Aucun service de génération ni dépendance externe n’est ajouté.

## Utilisation

- **Modifier mon espace** ouvre le catalogue des widgets. Une poignée déplace le widget à la souris ou au toucher; les flèches de son en-tête permettent aussi de réordonner au clavier.
- Le coin inférieur redimensionne le widget. Les flèches du clavier modifient largeur et hauteur lorsqu’il a le focus. Les largeurs utilisent trois colonnes sur ordinateur et s’adaptent aux petits écrans; la hauteur est automatique par défaut.
- Masquer conserve le widget dans la disposition; retirer le supprime de celle-ci. Le catalogue permet de le réajouter.
- **Enregistrer une copie** crée une disposition indépendante. Le sélecteur restaure une disposition enregistrée. Le nom, la suppression et la réinitialisation discrète se trouvent dans l’éditeur.
- **Ctrl/Cmd J** ouvre la palette de widgets et de pages. Le bouton d’agrandissement ouvre la vue focus; Échap la ferme.

Les dispositions sont sauvegardées automatiquement dans `astralis:studio:<jeu>`. Les anciens réglages et données personnelles ne sont pas effacés.

## Widgets

La scène varie selon le jeu et l’heure locale. La frise affiche les sept prochains jours, avec les événements/bannières de la source, la prochaine échéance endgame connue et les tâches datées. Le radar représente collection possédée/catalogue, objectifs terminés/totaux, builds/personnages possédés et pity/90. Il ne représente pas une évaluation de puissance.

L’activité est comptée localement à partir de la première utilisation; les jours sans données ne sont pas inventés. Le compagnon sélectionne trois actions par règles déterministes : objectif en retard, événement proche de sa fin, farm restant, premier build ou collection, puis raccourcis utiles.

Les bannières Genshin sont alimentées automatiquement par le calendrier existant. Les portraits restent sur une ligne, sans nom ni rareté visibles, avec leur nom accessible et en infobulle. La date de départ ou de fin publiée détermine le minuteur. Les prochains groupes suivent la même structure. Les données absentes restent signalées; les sources connectées ne fournissent actuellement pas de flux équivalent pour les bannières HSR/Wuwa.

L’objectif de vœux compact utilise les vœux et le solde actuel de primogemmes, sans lancer la simulation probabiliste lourde au chargement de l’accueil. L’équipe quotidienne et le boss partagent un widget. La vitrine conserve **toutes les entrées publiques reçues d’Enka**, avec leur équipement, artéfacts et statistiques; elle ne prétend pas accéder aux personnages privés du compte.

Les effets d’ambiance respectent `prefers-reduced-motion`. Les images absentes sont masquées; leur texte alternatif et les états d’attente restent disponibles.

## Vérification

`node --test tests/dashboard-studio.test.mjs` vérifie la normalisation des dispositions et la sélection des jours. `python tests/dashboard_browser.py` parcourt la vraie application et vérifie édition, masquage, ajout, redimensionnement clavier, focus, palette, copie et restauration d’une disposition, bannières datées et absence de débordement mobile. Ses données de bannières sont des fixtures explicitement définies dans le test.

## Navigation orbitale

L’accueil affiche maintenant une roue de widgets autour d’un panneau actif. Un clic sur un satellite change le contenu central sans déplacer le reste de l’écran. Les boutons précédent/suivant et les flèches lorsque la roue a le focus parcourent les widgets. Le dernier widget sélectionné est conservé par jeu. Sur mobile, la roue se place au-dessus du panneau pour conserver une largeur lisible.

Les anneaux, poussières lumineuses, balayage et éclairage du pointeur respectent la préférence de réduction des animations. Les cibles de navigation restent fixes. L’éditeur conserve la disposition libre pour l’ajout, le masquage, l’ordre et les dimensions; il revient à la roue une fois fermé.
