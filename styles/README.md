# Feuilles de style

Les feuilles globales de l’application se trouvent ici. Leur ordre de chargement est défini dans `../index.html` ; conserver cet ordre, car les couches tardives ajustent les composants chargés avant elles.

Les styles propres à un modèle d’export restent à côté de ses ressources dans `../assets/` (par exemple `card-design/reference.css` et `sheet-reference.css`). Les URL de polices et d’images de ces fichiers dépendent de leur emplacement.

`card-runtime.css` est chargé par `src/card-renderer.js` pour le classeur, les détails et les boosters. Il doit rester disponible dans le shell hors ligne de `sw.js`.