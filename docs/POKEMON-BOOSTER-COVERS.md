# Couvertures des boosters Pokémon

Les aperçus et l’ouverture des boosters affichent les visuels réels des emballages Pokémon TCG. Les jaquettes sont conservées dans `assets/booster-covers/pokemon/` en WebP, pour que l’affichage reste rapide et fonctionne hors ligne.

Le catalogue couvre les 136 extensions de l’application. Les sous-extensions sans emballage commercial distinct (galeries, énergies et collections liées) reprennent l’illustration du booster de leur extension parente. La correspondance et les sources sont consignées dans `public/pokemon-booster-covers.json`.

Les visuels proviennent de l’index d’artworks de paquets [PokeSymbols](https://pokesymbols.com/tcg/booster-pack-art), qui répertorie les faces de boosters par extension. Pour reconstruire le catalogue et les fichiers locaux, lancer `python scripts/sync_pokemon_booster_covers.py`.
