# Catalogue Pokémon TCG

Le classeur et les boosters Astralis utilisent maintenant le catalogue français de TCGdex. Le snapshot livré avec le projet référence 136 extensions principales et 18 117 cartes. Les cartes sont filtrables par Pokémon, série, extension, catégorie et rareté.

Les scans sont chargés à la demande depuis TCGdex. Quand un scan localisé manque, Astralis essaie la version anglaise de TCGdex, puis le CDN Pokémon TCG et le CDN GotemTCG. Les images ne sont pas copiées dans le dossier de l’application. Une connexion Internet est nécessaire pour afficher les scans.

Les 25 cartes de Célébrations Collection Classique utilisent les scans correspondants du CDN Pokémon TCG, car TCGdex ne publie pas les images de cette extension. Le rapport de vérification complète des 136 extensions se trouve dans [AUDIT-POKEMON-IMAGES.md](AUDIT-POKEMON-IMAGES.md).

Pour actualiser le catalogue depuis la racine du projet :

```powershell
python scripts/sync_pokemon_tcg_catalog.py
```

La synchronisation remplace `public/pokemon-tcg-catalog.json`. Les boosters simulés choisissent dix cartes distinctes dans la série sélectionnée et affichent clairement que la répartition des raretés n’est pas une reproduction des probabilités garanties d’un produit imprimé.

Sources : [documentation TCGdex](https://www.tcgdex.dev/) · [API française](https://api.tcgdex.net/v2/fr/sets)
