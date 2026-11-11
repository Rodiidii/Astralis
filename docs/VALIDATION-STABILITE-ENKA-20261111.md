# Validation — stabilité des équipes/builds et références Enka

## Régression reproduite, puis corrigée

`python tests/workshop_stability_browser.py --baseline` reproduit sur le commit `d3cb557` la fermeture des détails d’équipe après un rendu complet. `python tests/workshop_stability_browser.py` vérifie la correction dans les vrais chemins `render()` et `renderPageOnly()`, exposés uniquement dans le serveur de test : détails d’équipe, état ARIA, ouverture de l’éditeur, sélecteurs de sets ouverts/fermés, recherche, filtres, focus, sélection du texte et défilement conservés. Un choix explicite ferme bien le sélecteur. Le compteur des builds indique le total enregistré, y compris avec des identifiants numériques.

Un test d’image force une première URL en 404 puis un vrai PNG local : cinq réaffichages réutilisent la source valide, sans nouvelle requête vers l’URL en échec. Le style qui annulait `hidden` sur les options de sets a été corrigé. Les visuels ont des dimensions réservées.

Captures : `docs/captures/workshop-stability/before-team-collapsed.png`, `after-team-expanded.png`, `after-picker.png`.

## Visuels locaux

Le script `tools/sync-equipment-art.py` a enregistré 553 PNG originaux correspondant aux 255 armes et aux 63 sets du catalogue local, pièces comprises ; aucune ressource manquante lors de cette exécution. Les sets qui n’ont qu’un diadème sont pris en compte. Les fichiers proviennent des noms exacts du catalogue, via le miroir Enka ; URLs, dimensions et SHA-256 figurent dans `assets/genshin/equipment/sources.json`. Aucune image générée ni nom d’asset deviné.

Le catalogue, les builds, les équipes, les fiches de sets et les modèles PNG priorisent ces fichiers. Une illustration personnelle reste prioritaire. Le registre entre dans le cache du service worker ; les images sont mises en cache à l’usage, sans prétendre qu’un catalogue jamais consulté serait intégralement précaché hors ligne.

`node --test tests/equipment-art.test.mjs` : trois tests réussis, couvrant toutes les empreintes et toutes les références du catalogue, l’ordre des sources et la préservation d’une image personnelle.

## Statistiques et import Enka

La configuration d’une référence Enka est désormais tracée : personnage, arme, niveau, éveil, raffinement, constellation, sets, statistiques des pièces et conditions. Modifier l’un de ces paramètres impose le recalcul depuis les données de jeu. Renommer ou recolorer le build conserve l’instantané. Les anciennes références non traçables restent enregistrées mais ne sont plus certifiées comme configuration courante. La réparation d’un ancien import ne lui attribue pas arbitrairement les statistiques du profil actuellement chargé.

Le calcul d’équipement est commun aux chemins snapshot et tables de niveaux. Le repli lit aussi les tableaux de sous-stats, compte les sets de la même façon et convertit correctement les bonus élémentaires d’élévation. Cas indépendant de contrôle : ATQ 1 792,4 ; taux CRIT 51,3 % ; DGT CRIT 112,2 % ; bonus Cryo 75,4 %. Les deux chemins donnent ces mêmes résultats. Une base absente retourne un résultat indisponible ; une sous-stat ou une principale absente ne devient pas un zéro artificiel.

`python tests/enka_build_browser.py` vérifie une fixture Enka explicitement synthétique : 19 180 PV, 1 812,4 ATQ, 800 DÉF, 100 maîtrise, 150 % recharge, 40 % taux CRIT, 120 % DGT CRIT et 61,6 % bonus Cryo. Les valeurs de la page, de l’équipe et des modèles PNG concordent. Le changement réel d’arme vers le Faucon d’Aquilon invalide la référence et recalcule les chiffres ; le choix et les résultats persistent après rechargement. La source de calcul est affichée dans la page.

Les tests d’import vérifient le sablier Recharge, les coupes Cryo/Hydro, le diadème DGT CRIT, les niveaux et les quatre sous-stats. Le test de cache ancien `python tests/artifact_cache_browser.py` confirme le démarrage sans erreur d’export `artifactStatKey` et une coupe élémentaire à 46,6 %.

## Résultats et limites

- Suite complète Node : 188 tests réussis, aucun échec.
- `tests/workshop_stability_browser.py` : réussi, ainsi que la reproduction sur l’ancienne version.
- `tests/enka_build_browser.py` : réussi.
- `tests/recovery_browser.py --after-only` : réussi, avec export PNG réellement téléchargé à 2×.
- `tests/pwa_browser.py` : WebKit mobile et rechargement hors ligne Chromium réussis avec le nouveau module de visuels.
- Vérification de syntaxe des modules et `git diff --check` : réussie.

Ces vérifications clôturent les causes de statistiques de build décrites ci-dessus et la stabilité de l’atelier. Elles ne valident pas la simulation complète des dégâts, tous les passifs conditionnels ni l’optimisation des équipes du laboratoire. P0-BUILD-02 (comparaison complète, laboratoire compris), P0-TEAM-03 et les chantiers du laboratoire restent ouverts.
