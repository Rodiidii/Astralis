# Cartes : fonctionnement et vérification

La référence fournie est conservée sans modification dans `docs/reference/cards.html`. Son SHA-256 est enregistré dans `assets/card-design/reference.json`. Les modèles et le CSS sont extraits de ce fichier; aucun effet de rareté n’est redessiné. Un composant `astralis-card` isole ces styles du thème général avec un Shadow DOM et partage ses feuilles de style entre les cartes.

Le même composant sert au classeur, à « Visualiser la page », au détail, au booster et à l’export PNG. Le mode `static` supprime les animations et calques d’effets du classeur. Les autres modes conservent les effets de la référence. Les animations sont suspendues hors écran et avec la préférence système de réduction des animations. Le cache d’images décodées est limité à 16 entrées; les URL portent l’empreinte du fichier pour éviter une illustration périmée après un nouvel import.

`src/card-catalog.js` centralise les raretés, les quantités, les groupes et les exclusions. Les variantes d’un même personnage ont des identités d’illustration distinctes. Les identifiants d’inventaire et les sauvegardes existantes ne sont pas effacés. Les groupes utilisent des compétences réelles de leurs membres; les personnages sans kit disponible restent signalés. Les données mises en cache viennent des sources déjà utilisées par Astralis : Genshin-DB, StarRailStaticAPI et Encore. Les textes passent par le rendu riche existant. Les chiffres de dégâts et faiblesses Pokémon générés arbitrairement ne sont plus affichés.

## Illustrations

`public/card-artworks.json` est le registre canonique, exposé aussi comme `ASTRALIS_CARD_ARTWORKS`. Il associe une carte à un seul fichier `assets/card-art/<jeu>/<slug>-<n>.webp`. Une image ne peut pas être attribuée à deux cartes. Le registre conserve les crédits, dimensions, empreintes du fichier et des pixels, ainsi qu’un dHash perceptuel.

Le rapport `docs/AUDIT-CARTES.md` et son équivalent JSON listent les fichiers manquants, rejetés, identiques, proches et les personnages pour lesquels une seule image admissible a été retrouvée. Ce dernier état ne prouve pas qu’aucune autre illustration n’existe. Les sources sont limitées aux illustrations officielles identifiées et aux fichiers explicitement fournis; les anciennes images de type splash, icône, capture de jeu, fan art ou de provenance ambiguë ne servent pas de repli.

Un emplacement conserve les proportions et affiche son nom lorsque l’image manque. Le point focal par défaut est `50 % / 35 %`; il est modifiable dans le registre pour chaque illustration. Le cadrage de toutes les illustrations nouvellement importées reste à vérifier visuellement : le programme ne prétend pas reconnaître automatiquement les visages de personnages dessinés.

Les dix raretés présentes dans le HTML sont les modèles visuels de référence. Aeon réutilise le modèle Légende, déjà doté de la classe Aeon. Équipement réutilise Full Art; Énergie réutilise Common sans attaques. La carte unique Obsidian reprend son modèle Astral d’origine. Ces adaptations ne constituent pas des modèles distincts présents dans le fichier fourni.

## Maintenance

L’application conserve son serveur Python sans nouvelle dépendance d’exécution. Les outils de maintenance et les tests nécessitent Pillow et Playwright :

```powershell
python -m pip install pillow playwright
python -m playwright install chromium
node scripts/export_card_catalog.mjs
python scripts/sync_card_kits.py
python scripts/audit_cards.py --fetch
python scripts/audit_cards.py --strict
node --test tests/*.test.mjs
python -m unittest discover -s tests -p "test_*.py"
python tests/cards_browser.py
python tests/cards_app_browser.py
```

Le cache brut `assets/card-art/downloads/*.image` est jetable. Les fichiers finaux et leurs crédits restent vérifiables après sa suppression. Le registre existant est réutilisé et chaque fichier canonique est revérifié par son empreinte lors de l’audit. Les nouveaux fichiers fournis sont déclarés dans `assets/card-art/sources.json`, comme indiqué dans le rapport.

## Tests et diagnostic

`tests/cards_browser.py` compare directement les 49 exemples du document d’origine au rendu isolé, à 0 et 1 600 ms d’animation. Une image de test identique remplace les illustrations des deux côtés pour isoler cadres, proportions, typographie et effets. Les captures côte à côte et les différences éventuelles sont conservées dans `docs/card-visual-tests/`. Le document d’origine constitue la référence, et non des captures automatiquement approuvées.

Le test vérifie aussi une grille de plus de 100 cartes, les débordements, les effets statiques, la réduction des animations, la remise à zéro de l’inclinaison, une image volontairement inaccessible et la détection d’un doublon injecté. Les emplacements Énergie prévus pour des images futures ne bloquent pas le contrôle strict. Les autres images absentes le font échouer. L’option `--design-only` contrôle le design et le fonctionnement sans prétendre que le catalogue d’illustrations est complet.

`tests/cards_app_browser.py` parcourt la vraie application : classeur, ouverture au clavier, détail, page complète, export PNG, booster, fermeture et affichage mobile.

Ouvrir `http://127.0.0.1:8766/?debug=cards` pour afficher le panneau de diagnostic. `astralisCards.diagnose()` donne l’état des cartes présentes à l’écran, leurs empreintes, images absentes/cassées, doublons et textes débordants. Les données complètes restent dans l’audit.
