# Yun Jin, quotas et conditions de combat — 11 novembre 2026

## Changements vérifiés

- Yun Jin : ajout plat fondé sur la DÉF finale saisie et le coefficient du Q ; passif A4 selon les éléments réellement distincts, désactivable ; C3 augmente le niveau Q ; C2 ajoute 15 % aux attaques normales. La formation ne s’applique ni aux chargées, ni aux plongeantes, ni aux compétences/déchaînements.
- Trente déclenchements par bénéficiaire, consommés par impact et par cible, fenêtre de douze secondes. Les quotas de Yun Jin, Shenhe et Escoffier C2 distinguent désormais le bénéficiaire et l’instant de lancement : un nouveau lancement renouvelle le quota.
- Shenhe C6 : les attaques normales/chargées gardent leur bonus sans consommation, même après épuisement des charges par un autre type de dégât.
- Source absente/infinie et composition requise absente : calcul direct et optimiseur refusent le résultat incomplet, au lieu de classer un score sans ce bonus.
- Panneau : quatre éléments modifiables séparément, presets conservés, enregistrement/réouverture/annulation vérifiés. Débordement horizontal du sélecteur corrigé sur mobile.

## Sources

Tables et implémentation de Genshin Optimizer figées à la révision `283952a096249677a0b7dfedf927cc30fbcd5ca6`, listées dans `docs/sources/lab-complex/sources.json` :

- [Yun Jin — paramètres](https://raw.githubusercontent.com/frzyc/genshin-optimizer/283952a096249677a0b7dfedf927cc30fbcd5ca6/libs/gi/stats/Data/Characters/YunJin/skillParam.json)
- [Yun Jin — formules](https://raw.githubusercontent.com/frzyc/genshin-optimizer/283952a096249677a0b7dfedf927cc30fbcd5ca6/libs/gi/sheets/src/Characters/YunJin/index.tsx)

## Preuves

`tests/quill-lifecycle.test.mjs` : six cas couvrent coefficients indépendants (DÉF 2 500, Q10 et quatre éléments : ajout 1 734,7 par déclenchement), diversité, C2/C3, quotas/multicibles/expiration, renouvellement/bénéficiaires, Shenhe C6 épuisée et refus des sources invalides. Résultat Yun Jin C2 sur 31 impacts comparé à une formule indépendante. Suite globale : 235 tests réussis.

`tests/complex_controls_browser.py` : succès Chromium aux largeurs 1 440 et 390 pixels ; enregistrement, réouverture, composition personnalisée, preset, annulation et absence de débordement. Captures nouvelles dans `docs/captures/lab-effects/`.

`tests/lab_browser.py` : parcours complet réussi sur la page réelle — inventaire, buffs, rotation, cas Skirk/Éclazur/Furina C2/Escoffier/Mona C4, aperçu et téléchargement PNG.

## Travail restant

La DÉF de Yun Jin est une valeur finale saisie, pas encore un lien dynamique au build d’un autre membre. C4 doit donc déjà être incluse si active. C6 est signalée mais ne raccourcit pas automatiquement une rotation : sa durée reste explicitement saisie. Les cibles importées pondérées restent une somme pondérée indépendante, pas une simulation chronologique partageant les quotas. Lauma, Xianyun et les autres effets demandés restent au suivi ; ce lot ne clôture pas RESTE-037, RESTE-060 ni P0-LAB-03/05.
