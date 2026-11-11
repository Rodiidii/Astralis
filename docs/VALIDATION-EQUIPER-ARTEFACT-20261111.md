# Équiper une pièce possédée

La liste de pièces résout les identifiants de set sous leurs formes numérique et nom normalisé. Le remplacement d’une pièce efface ses anciennes lignes de sous-stats, copie les nouvelles sans partager l’objet de l’inventaire et remplace l’ancien visuel par celui de la pièce équipée. La sélection est limitée à l’emplacement demandé.

`tests/artifact-equip.test.mjs` vérifie le remplacement de la principale, du set, de l’image et des sous-stats, ainsi que l’absence de modification de l’inventaire quand le build est ensuite édité.

Le parcours `tests/artifact_equip_browser.py` utilise une coupe possédée avec quatre sous-stats : sélection depuis l’inventaire, principale Cryo 46,6 %, lignes 10,5 % ATQ / 7,8 % taux CRIT / 14 % DGT CRIT / 23 maîtrise, image locale correcte, statistiques et données persistées après rechargement. Les autres exigences globales de RESTE-032 ne sont pas considérées comme intégralement validées par ce seul parcours.
