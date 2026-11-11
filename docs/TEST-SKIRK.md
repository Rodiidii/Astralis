# Validation Skirk, Éclazur, Furina C2, Escoffier et Mona C4

## Essai dans l’application

Laboratoire → **Essayer Skirk**. Le build de démonstration est enregistré dans Mes builds ; ses artéfacts théoriques ne sont pas ajoutés à l’inventaire personnel.

Hypothèses : Skirk C0 niveau 90, Éclazur R1 niveau 90, Q niveau 10, Furina C2 Q10, Escoffier C0, Mona C4 Q10 ; quatre personnages Hydro/Cryo. Énergie de Skirk nulle, 3 cumuls A4, 12 points de Serpentine supplémentaires. Fanfare : 150 initiale + 100 % de variations de PV × 3,5, plafonnée à 400. Ennemi niveau 100, résistance Cryo initiale 10 %. Tous les effets sont actifs au temps zéro : il s’agit d’une comparaison instantanée, pas de la promesse qu’une rotation pratique maintient ces hypothèses en permanence.

**Équipiers et sources de buffs → Effets complexes** permet de changer les conditions, constellations, ATQ sources, dates de lancement, fanfare et plumes. Le temps du calcul et le nombre d’ennemis se règlent dans Réaction et ennemi.

## Formules et tests

- Éclazur R1 : +24 % ATQ après E ; énergie nulle : +24 % ATQ et +40 % DGT CRIT supplémentaires, 12 s. R5 et l’énergie non nulle sont également testés.
- Furina C2 : plafond de 400 fanfare et +100 % DGT à Q10. Les PV excédentaires restent réservés à Furina.
- Escoffier : −55 % RES Hydro/Cryo avec quatre personnages de ces éléments ; fenêtre de 12 s. La C1 (+60 % DGT CRIT Cryo, 15 s) et les plumes C2 sont indépendantes.
- Mona C4 : Présage +60 % DGT et +15 % Taux CRIT contre la cible marquée. Début et prolongation effective de bulle sont explicites.
- Skirk : cinq entailles à 220,968 % puis un coup final à 368,28 %. A4 : ×1,6 sur la base Q et ×1,7 sur les normales des Sept phases à trois cumuls. L’ATQ liée à la Serpentine excédentaire est ajoutée à chaque impact. N3/N4 ont deux impacts, la chargée en a trois. Le mentorat Hydro/Cryo ajoute un niveau E ; C3/C5 modifient les niveaux du talent concerné.
- Shenhe : plume E10 = 82,1808 % de son ATQ finale. Appui court : 5 déclenchements/10 s ; long : 7/15 s. Escoffier C2 : 240 % de son ATQ, 5 déclenchements/15 s pour les autres personnages. Les quotas sont suivis par bénéficiaire, impact et ennemi. Les deux sources se cumulent. La C6 de Shenhe évite la consommation par NA/CA tant que l’effet existe.
- Les plumes s’ajoutent avant bonus DGT/CRIT/DEF/RES ; elles ne reçoivent pas le multiplicateur A4 appliqué à la base du talent de Skirk.
- La rotation conserve les quotas entre les actions et recalcule les répétitions avec les expirations. Elle ne multiplie pas simplement une première rotation buffée.

`tests/complex-effects.test.mjs` contient 11 cas ciblés. Le cas indépendant de référence à ATQ de base 1 000, CRIT 50/100 et bonus Cryo 46,6 %, avec l’équipe complète, attend **329 165,4076124881** dégâts moyens pour le Q complet. Cette fixture mathématique n’est pas le build de démonstration de l’interface.

Le test navigateur `tests/lab_browser.py` compare aussi le résultat de l’interface à une formule indépendante utilisant les statistiques finales de la démonstration. Il désactive/réactive Furina, sauvegarde le build TC et télécharge le vrai PNG. Le dernier relevé est dans `lab-skirk-test-state.json` ; capture : `lab-complex-team.png`.

## Sources reproductibles

Adaptation des tables et formules du projet [Genshin Optimizer](https://github.com/frzyc/genshin-optimizer/tree/283952a096249677a0b7dfedf927cc30fbcd5ca6), révision `283952a096249677a0b7dfedf927cc30fbcd5ca6`. Les fichiers sources consultés, paramètres et licence MIT sont conservés dans `docs/sources/lab-complex/`. Les effets d’armes/sets activés manuellement ne doivent pas dupliquer les mêmes bonus dans Buffs personnalisés.

Le panneau n’est pas un simulateur automatique complet d’auras, de soins et d’IA des invocations : la variation de PV utilisée par Furina est une condition saisie. Les attaques supplémentaires de constellations hors du cas documenté ne sont pas générées automatiquement dans une rotation.
