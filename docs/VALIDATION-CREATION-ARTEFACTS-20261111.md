# Création manuelle d’artéfacts

La saisie bloque les erreurs de structure : sous-stats répétées ou identiques à la principale, valeur absente/non positive, emplacement incompatible et niveau hors bornes ou non entier. Les paliers atypiques et fiches partielles restent des diagnostics, selon la demande de l’utilisateur ; ils n’interdisent pas l’enregistrement.

La principale proposée suit le niveau et le type de pièce. Modifier une valeur manuellement reste possible. Après un enregistrement réussi, le formulaire reste ouvert, repart sur Fleur +20 avec principale 4 780 et efface les sous-stats. Le set peut être choisi pour chaque saisie. Les images des pièces de l’inventaire utilisent aussi les assets locaux connus.

`tests/artifact-entry.test.mjs` : trois tests réussis couvrant les erreurs de structure et l’acceptation d’une saisie partielle/d’un palier douteux.

`tests/artifact_entry_browser.py` : réussi sur la vraie page Sets. Vérification d’une coupe Cryo à +0 puis +20, refus d’un doublon sans écriture, acceptation de DÉF 39, conservation des deux sous-stats, réinitialisation puis création d’une seconde pièce dans la même fenêtre. Aucune erreur JavaScript.

Les tests portent sur le formulaire et les données enregistrées. La validation complète de tous les builds, passifs et résultats du laboratoire reste distincte.
