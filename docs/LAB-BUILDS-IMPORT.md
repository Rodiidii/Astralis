# Laboratoire, builds TC et import Enka

## Corrections
- L'identifiant textuel Enka de statistique principale est prioritaire sur l'identifiant numérique interne de configuration. Le niveau des reliques Enka est converti de 1–21 vers 0–20.
- Les sous-stats gardent leur nature et leur valeur, et les modifications du formulaire ont priorité sur le tableau source.
- Les tables de niveaux sont recherchées par niveau déclaré, sans confusion avec l'index du tableau.
- Les statistiques Enka de référence retirent les contributions de l'équipement avant de les appliquer une seule fois. La référence est invalidée si l'arme, les niveaux ou les sets changent.
- Les anciens imports Enka reconnaissables sont réparés à partir du profil encore stocké, sans écraser les pièces retouchées. Si le profil n'est plus disponible, réimporter la vitrine.
- La validation des sous-stats utilise les paliers sourcés par rareté et la précision d'affichage. Une DÉF fixe de 39 affichée n'est plus rejetée pour un simple arrondi.

## Utilisation
Dans le laboratoire, choisir le personnage, le niveau, C0–C6 et un build équipé. « Sous-stats de l'équipement » ouvre les cinq pièces. Les bonus personnalisés ont une nature, une valeur, des cumuls et une durée ; 0 seconde signifie toute la rotation.

Cliquer un coefficient dans Talents sélectionne une attaque précise. Les groupes de coups sont préservés, notamment cinq entailles et un coup final pour le déchaînement de Skirk. Le nombre de coups avec réaction est explicite et ne simule pas automatiquement l'application élémentaire, l'ICD ou les réactions d'une équipe.

Dans Rotation, ajouter l'attaque sélectionnée, choisir l'attaque de chaque étape, ses répétitions et sa durée. Les rotations d'un autre personnage ou les anciennes lignes sans coefficient restent à compléter, sans faux résultat nul.

« Enregistrer le build TC » conserve les réglages, buffs, pièces et rotation dans les builds locaux. « Essayer Skirk » charge TC · Skirk — banc d'essai, créé une seule fois : C0 niveau 90, sans arme, pièces théoriques légales, bonus 2 pièces Cryo seulement, passifs conditionnels à renseigner. Aucune pièce n'est ajoutée à l'inventaire possédé.

## Limites explicites
Les noms des réactions sont en anglais. Lunar-Charged, Lunar-Bloom, Lunar-Crystallize, Stellar-Conduct et Stellar Swirl sont proposés, mais leur formule spécifique reste marquée TODO_DATA tant qu'elle n'est pas implémentée et vérifiée. Aucun remplacement par la formule d'une autre réaction.

Le snapshot local contient les statistiques de base sourcées de 120 personnages et les paramètres détaillés de Skirk. Les kits des autres personnages continuent d'utiliser les sources habituelles. Les bonus conditionnels d'arme, de constellation et de passifs doivent être configurés explicitement quand ils ne sont pas portés par la référence Enka.

## Reproduction
- node --test tests/*.test.mjs
- python tests/lab_browser.py
- python tests/relations_browser.py
- python tools/audit-relation-coverage.py

Sources et révisions conservées dans data/lab-source-snapshot.json, src/artifact-sub-values.js et les preuves du corpus de relations.
