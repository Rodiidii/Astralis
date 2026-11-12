# Audit des cartes Astralis

Catalogue : **1465 cartes**. Illustrations attribuées sans réutilisation : **688**. Emplacements à fournir : **777**.

La source canonique est `public/card-artworks.json` (`ASTRALIS_CARD_ARTWORKS`), fichiers `assets/card-art/<jeu>/<slug>-<n>.webp`.
Le rendu ne réutilise aucune image entre deux cartes, y compris entre les raretés d’un même personnage. Une seule image admissible pour une identité ne couvre donc qu’une carte ; les variantes restantes restent signalées comme manquantes et utilisent le repli visuel propre.

| Jeu | Cartes | Attribuées | Manquantes |
|---|---:|---:|---:|
| gi | 628 | 489 | 139 |
| hsr | 532 | 132 | 400 |
| ww | 305 | 67 | 238 |
Empreintes SHA-256 du fichier et des pixels décodés, dimensions et dHash perceptuel enregistrés. Une illustration ne peut être attribuée qu’à une carte. Seules les illustrations publiées par HoYoverse ou Kuro Games et leurs comptes officiels sont admises; aucun dessin de fan, croquis ou contenu communautaire n’est importé.
Règle de rareté : aucun splash art, poster ou visuel promotionnel de personnage n’est attribué aux cartes au-dessus de Full Art (Secrète, Gold, Légende, Astrale, Astrale éternelle, Aeon), ni aux Groupes. Ces visuels restent réservés aux Full Art.
Contrôle manuel récent : l’illustration éditoriale de Phainon publiée par le compte officiel Honkai: Star Rail JP a été téléchargée et inspectée. Elle est distincte du splash art du jeu et attribuée uniquement à `hsr-char-1408-eternal`. Les visuels de Baizhi, Chixia et Taoqi précédemment inspectés restent rejetés pour leur format d’affiche ou leur sujet trop petit/masqué.
La miniature officielle de la vidéo d’album INSIDE de Robin a également été vérifiée puis écartée : format paysage et grand logo, donc mauvais cadrage pour une carte plein cadre.
Les imports officiels sont examinés pour les doublons exacts, les ressemblances perceptuelles et la résolution. Le cadrage central haut reste à valider pour chaque nouvelle image; aucune détection automatique de visage anime n’est prétendue.
38 visuels Kuro de type guide, fiche de matériaux, panneau de statistiques, vignette « Resonator Review » ou chibi sont écartés par `assets/card-art/quality-exclusions.json`. Les visuels Brant-2/3 sont exclus explicitement; les affiches Wuwa très allongées (ratio largeur/hauteur inférieur à 0.62, dont le format 9:16) sont aussi rejetées automatiquement.

## Quantités

| Rareté | Cartes |
|---|---:|
| aeon | 10 |
| astral | 20 |
| common | 287 |
| energy | 23 |
| epic | 287 |
| equipment | 55 |
| eternal | 17 |
| full | 90 |
| gold | 22 |
| group | 30 |
| legend | 30 |
| rare | 287 |
| secret | 20 |
| super | 287 |

## Images uniques disponibles par personnage

Une seule image retrouvée ne signifie pas qu’aucune autre image officielle n’existe. Elle est attribuée à une seule carte ; les autres cartes de la même identité attendent des illustrations distinctes.

- gi / aino : **une seule image admissible retrouvée**.
- gi / alyosha : **une seule image admissible retrouvée**.
- gi / ifa : **une seule image admissible retrouvée**.
- gi / il-dottore : **une seule image admissible retrouvée**.
- gi / illuga : **une seule image admissible retrouvée**.
- gi / istaroth : **une seule image admissible retrouvée**.
- gi / kokomi : **une seule image admissible retrouvée**.
- gi / lohen : **une seule image admissible retrouvée**.
- gi / mitya : **une seule image admissible retrouvée**.
- gi / odette : **une seule image admissible retrouvée**.
- gi / prune : **une seule image admissible retrouvée**.
- gi / ronova : **une seule image admissible retrouvée**.
- gi / sandrone : **une seule image admissible retrouvée**.
- gi / varka : **une seule image admissible retrouvée**.
- gi / vesna : **une seule image admissible retrouvée**.
- gi / vodyanitsa : **une seule image admissible retrouvée**.
- hsr / aglaea : **une seule image admissible retrouvée**.
- hsr / an-instant-before-a-gaze : **une seule image admissible retrouvée**.
- hsr / anaxa : **une seule image admissible retrouvée**.
- hsr / archer : **une seule image admissible retrouvée**.
- hsr / argenti : **une seule image admissible retrouvée**.
- hsr / arlan : **une seule image admissible retrouvée**.
- hsr / asta : **une seule image admissible retrouvée**.
- hsr / astral-express : **une seule image admissible retrouvée**.
- hsr / aventurine-waveflair : **une seule image admissible retrouvée**.
- hsr / bailu : **une seule image admissible retrouvée**.
- hsr / baptism-of-pure-thought : **une seule image admissible retrouvée**.
- hsr / before-dawn : **une seule image admissible retrouvée**.
- hsr / black-swan : **une seule image admissible retrouvée**.
- hsr / blade : **une seule image admissible retrouvée**.
- hsr / boothill : **une seule image admissible retrouvée**.
- hsr / brighter-than-the-sun : **une seule image admissible retrouvée**.
- hsr / bronya : **une seule image admissible retrouvée**.
- hsr / castorice : **une seule image admissible retrouvée**.
- hsr / cerydra : **une seule image admissible retrouvée**.
- hsr / clara : **une seule image admissible retrouvée**.
- hsr / cruising-in-the-stellar-sea : **une seule image admissible retrouvée**.
- hsr / dan-heng : **une seule image admissible retrouvée**.
- hsr / dan-heng-imbibitor-lunae : **une seule image admissible retrouvée**.
- hsr / dan-heng-permansor-terrae : **une seule image admissible retrouvée**.
- hsr / dance-at-sunset : **une seule image admissible retrouvée**.
- hsr / dr-ratio : **une seule image admissible retrouvée**.
- hsr / elation-brimming-with-blessings : **une seule image admissible retrouvée**.
- hsr / eternal-calculus : **une seule image admissible retrouvée**.
- hsr / evernight : **une seule image admissible retrouvée**.
- hsr / feixiao : **une seule image admissible retrouvée**.
- hsr / firefly : **une seule image admissible retrouvée**.
- hsr / fugue : **une seule image admissible retrouvée**.
- hsr / gallagher : **une seule image admissible retrouvée**.
- hsr / gepard : **une seule image admissible retrouvée**.
- hsr / gilgamesh : **une seule image admissible retrouvée**.
- hsr / guinaifen : **une seule image admissible retrouvée**.
- hsr / hanya : **une seule image admissible retrouvée**.
- hsr / herta : **une seule image admissible retrouvée**.
- hsr / himeko : **une seule image admissible retrouvée**.
- hsr / himeko-nova : **une seule image admissible retrouvée**.
- hsr / hook : **une seule image admissible retrouvée**.
- hsr / huohuo : **une seule image admissible retrouvée**.
- hsr / hyacine : **une seule image admissible retrouvée**.
- hsr / hysilens : **une seule image admissible retrouvée**.
- hsr / i-am-as-you-behold : **une seule image admissible retrouvée**.
- hsr / i-venture-forth-to-hunt : **une seule image admissible retrouvée**.
- hsr / in-the-night : **une seule image admissible retrouvée**.
- hsr / incessant-rain : **une seule image admissible retrouvée**.
- hsr / inherently-unjust-destiny : **une seule image admissible retrouvée**.
- hsr / jade : **une seule image admissible retrouvée**.
- hsr / jiaoqiu : **une seule image admissible retrouvée**.
- hsr / jing-yuan : **une seule image admissible retrouvée**.
- hsr / jingliu : **une seule image admissible retrouvée**.
- hsr / kafka : **une seule image admissible retrouvée**.
- hsr / lingsha : **une seule image admissible retrouvée**.
- hsr / luka : **une seule image admissible retrouvée**.
- hsr / luocha : **une seule image admissible retrouvée**.
- hsr / lynx : **une seule image admissible retrouvée**.
- hsr / march-7th-1224 : **une seule image admissible retrouvée**.
- hsr / misha : **une seule image admissible retrouvée**.
- hsr / mortenax-blade : **une seule image admissible retrouvée**.
- hsr / moze : **une seule image admissible retrouvée**.
- hsr / mydei : **une seule image admissible retrouvée**.
- hsr / natasha : **une seule image admissible retrouvée**.
- hsr / never-forget-her-flame : **une seule image admissible retrouvée**.
- hsr / past-self-in-mirror : **une seule image admissible retrouvée**.
- hsr / pela : **une seule image admissible retrouvée**.
- hsr / phainon : **une seule image admissible retrouvée**.
- hsr / qingque : **une seule image admissible retrouvée**.
- hsr / rappa : **une seule image admissible retrouvée**.
- hsr / rin-tohsaka : **une seule image admissible retrouvée**.
- hsr / rise-and-sing : **une seule image admissible retrouvée**.
- hsr / robin : **une seule image admissible retrouvée**.
- hsr / robin-summeretto : **une seule image admissible retrouvée**.
- hsr / ruan-mei : **une seule image admissible retrouvée**.
- hsr / saber : **une seule image admissible retrouvée**.
- hsr / sampo : **une seule image admissible retrouvée**.
- hsr / scent-alone-stays-true : **une seule image admissible retrouvée**.
- hsr / seele : **une seule image admissible retrouvée**.
- hsr / serval : **une seule image admissible retrouvée**.
- hsr / she-already-shut-her-eyes : **une seule image admissible retrouvée**.
- hsr / sparkle : **une seule image admissible retrouvée**.
- hsr / sunday : **une seule image admissible retrouvée**.
- hsr / sushang : **une seule image admissible retrouvée**.
- hsr / the-finale-of-a-lie : **une seule image admissible retrouvée**.
- hsr / the-hell-where-ideals-burn : **une seule image admissible retrouvée**.
- hsr / the-herta : **une seule image admissible retrouvée**.
- hsr / this-love-forever : **une seule image admissible retrouvée**.
- hsr / though-worlds-apart : **une seule image admissible retrouvée**.
- hsr / tingyun : **une seule image admissible retrouvée**.
- hsr / topaz-numby : **une seule image admissible retrouvée**.
- hsr / until-the-flowers-bloom-again : **une seule image admissible retrouvée**.
- hsr / welt : **une seule image admissible retrouvée**.
- hsr / when-she-decided-to-see : **une seule image admissible retrouvée**.
- hsr / whereabouts-should-dreams-rest : **une seule image admissible retrouvée**.
- hsr / xueyi : **une seule image admissible retrouvée**.
- hsr / yanqing : **une seule image admissible retrouvée**.
- hsr / yukong : **une seule image admissible retrouvée**.
- hsr / yunli : **une seule image admissible retrouvée**.
- ww / augusta : **une seule image admissible retrouvée**.
- ww / brant : **une seule image admissible retrouvée**.
- ww / buling : **une seule image admissible retrouvée**.
- ww / calcharo : **une seule image admissible retrouvée**.
- ww / camellya : **une seule image admissible retrouvée**.
- ww / cantarella : **une seule image admissible retrouvée**.
- ww / carlotta : **une seule image admissible retrouvée**.
- ww / cartethyia : **une seule image admissible retrouvée**.
- ww / changli : **une seule image admissible retrouvée**.
- ww / chisa : **une seule image admissible retrouvée**.
- ww / chixia : **une seule image admissible retrouvée**.
- ww / ciaccona : **une seule image admissible retrouvée**.
- ww / denia : **une seule image admissible retrouvée**.
- ww / galbrena : **une seule image admissible retrouvée**.
- ww / iuno : **une seule image admissible retrouvée**.
- ww / jianxin : **une seule image admissible retrouvée**.
- ww / jinhsi : **une seule image admissible retrouvée**.
- ww / lucilla : **une seule image admissible retrouvée**.
- ww / lumi : **une seule image admissible retrouvée**.
- ww / lupa : **une seule image admissible retrouvée**.
- ww / luuk-herssen : **une seule image admissible retrouvée**.
- ww / lynae : **une seule image admissible retrouvée**.
- ww / phoebe : **une seule image admissible retrouvée**.
- ww / phrolova : **une seule image admissible retrouvée**.
- ww / roccia : **une seule image admissible retrouvée**.
- ww / verina : **une seule image admissible retrouvée**.
- ww / xiangli-yao : **une seule image admissible retrouvée**.
- ww / yinlin : **une seule image admissible retrouvée**.
- ww / youhu : **une seule image admissible retrouvée**.
- ww / zani : **une seule image admissible retrouvée**.

## Recherche automatique

1165 candidats issus de sources éditeur sont inscrits dans le registre local avec leurs URLs et leur provenance. Les collecteurs ne consultent pas de wiki ou galerie communautaire. Les images restent non attribuées si le personnage, la source ou le format ne peuvent pas être vérifiés. Détails dans `docs/card-audit.json`.

## Doublons et résolution

367 fichiers identiques écartés, 1 paires visuellement proches à vérifier, 1179 fichiers sous 500 px sur leur petit côté écartés.

## Illustrations restant à fournir

| Jeu | Carte | Rareté | Fichier attendu (numéro libre) |
|---|---|---|---|
| gi | Mitya | eternal | assets/card-art/gi/mitya-n.webp |
| gi | Capitano | eternal | assets/card-art/gi/capitano-n.webp |
| hsr | Hysilens | eternal | assets/card-art/hsr/hysilens-n.webp |
| hsr | Evernight | eternal | assets/card-art/hsr/evernight-n.webp |
| hsr | Obsidian | eternal | assets/card-art/hsr/obsidian-n.webp |
| hsr | Ashveil | eternal | assets/card-art/hsr/ashveil-n.webp |
| hsr | Robin | eternal | assets/card-art/hsr/robin-n.webp |
| hsr | Aha (forme Nihilux) | eternal | assets/card-art/hsr/aha-n.webp |
| hsr | The Herta | eternal | assets/card-art/hsr/the-herta-n.webp |
| gi | Sandrone | astral | assets/card-art/gi/sandrone-n.webp |
| gi | Varka | astral | assets/card-art/gi/varka-n.webp |
| hsr | Kafka | astral | assets/card-art/hsr/kafka-n.webp |
| hsr | Castorice | astral | assets/card-art/hsr/castorice-n.webp |
| hsr | Aglaea | astral | assets/card-art/hsr/aglaea-n.webp |
| hsr | Sunday | astral | assets/card-art/hsr/sunday-n.webp |
| hsr | Cyrene | astral | assets/card-art/hsr/cyrene-n.webp |
| hsr | Jing Yuan | astral | assets/card-art/hsr/jing-yuan-n.webp |
| hsr | Seele | astral | assets/card-art/hsr/seele-n.webp |
| hsr | Huohuo | gold | assets/card-art/hsr/huohuo-n.webp |
| hsr | Feixiao | gold | assets/card-art/hsr/feixiao-n.webp |
| hsr | The Herta | gold | assets/card-art/hsr/the-herta-n.webp |
| hsr | Fugue | gold | assets/card-art/hsr/fugue-n.webp |
| hsr | Luocha | gold | assets/card-art/hsr/luocha-n.webp |
| hsr | Jade | gold | assets/card-art/hsr/jade-n.webp |
| hsr | Boothill | gold | assets/card-art/hsr/boothill-n.webp |
| hsr | Dr. Ratio | gold | assets/card-art/hsr/dr-ratio-n.webp |
| gi | Rhinedottir | secret | assets/card-art/gi/rhinedottir-n.webp |
| hsr | Argenti | secret | assets/card-art/hsr/argenti-n.webp |
| hsr | Moze | secret | assets/card-art/hsr/moze-n.webp |
| hsr | Rappa | secret | assets/card-art/hsr/rappa-n.webp |
| hsr | Anaxa | secret | assets/card-art/hsr/anaxa-n.webp |
| hsr | Yunli | secret | assets/card-art/hsr/yunli-n.webp |
| hsr | Topaz & Numby | secret | assets/card-art/hsr/topaz-numby-n.webp |
| hsr | Firefly | legend | assets/card-art/hsr/firefly-n.webp |
| hsr | Sparkle | legend | assets/card-art/hsr/sparkle-n.webp |
| hsr | Blade | legend | assets/card-art/hsr/blade-n.webp |
| hsr | Jingliu | legend | assets/card-art/hsr/jingliu-n.webp |
| hsr | Black Swan | legend | assets/card-art/hsr/black-swan-n.webp |
| hsr | Ruan Mei | legend | assets/card-art/hsr/ruan-mei-n.webp |
| hsr | Silver Wolf | legend | assets/card-art/hsr/silver-wolf-n.webp |
| hsr | Himeko | full | assets/card-art/hsr/himeko-n.webp |
| hsr | Welt | full | assets/card-art/hsr/welt-n.webp |
| hsr | Bronya | full | assets/card-art/hsr/bronya-n.webp |
| hsr | Serval | full | assets/card-art/hsr/serval-n.webp |
| hsr | Gepard | full | assets/card-art/hsr/gepard-n.webp |
| hsr | Clara | full | assets/card-art/hsr/clara-n.webp |
| hsr | Bailu | full | assets/card-art/hsr/bailu-n.webp |
| hsr | Yanqing | full | assets/card-art/hsr/yanqing-n.webp |
| hsr | Sampo | full | assets/card-art/hsr/sampo-n.webp |
| hsr | Hook | full | assets/card-art/hsr/hook-n.webp |
| hsr | Pela | full | assets/card-art/hsr/pela-n.webp |
| hsr | Natasha | full | assets/card-art/hsr/natasha-n.webp |
| hsr | Qingque | full | assets/card-art/hsr/qingque-n.webp |
| hsr | Tingyun | full | assets/card-art/hsr/tingyun-n.webp |
| hsr | Luka | full | assets/card-art/hsr/luka-n.webp |
| hsr | Sushang | full | assets/card-art/hsr/sushang-n.webp |
| hsr | Arlan | full | assets/card-art/hsr/arlan-n.webp |
| hsr | Asta | full | assets/card-art/hsr/asta-n.webp |
| hsr | Herta | full | assets/card-art/hsr/herta-n.webp |
| hsr | Dan Heng | full | assets/card-art/hsr/dan-heng-n.webp |
| hsr | March 7th | full | assets/card-art/hsr/march-7th-1224-n.webp |
| hsr | Trailblazer | full | assets/card-art/hsr/trailblazer-n.webp |
| hsr | Yukong | full | assets/card-art/hsr/yukong-n.webp |
| hsr | Dan Heng • Imbibitor Lunae | full | assets/card-art/hsr/dan-heng-imbibitor-lunae-n.webp |
| hsr | Guinaifen | full | assets/card-art/hsr/guinaifen-n.webp |
| hsr | Misha | full | assets/card-art/hsr/misha-n.webp |
| hsr | Jiaoqiu | full | assets/card-art/hsr/jiaoqiu-n.webp |
| hsr | Lingsha | full | assets/card-art/hsr/lingsha-n.webp |
| hsr | Gallagher | full | assets/card-art/hsr/gallagher-n.webp |
| hsr | Tribbie | full | assets/card-art/hsr/tribbie-n.webp |
| hsr | Hyacine | full | assets/card-art/hsr/hyacine-n.webp |
| hsr | Cipher | full | assets/card-art/hsr/cipher-n.webp |
| hsr | Xueyi | full | assets/card-art/hsr/xueyi-n.webp |
| hsr | Hanya | full | assets/card-art/hsr/hanya-n.webp |
| hsr | Lynx | full | assets/card-art/hsr/lynx-n.webp |
| ww | Rover (Spectro) | full | assets/card-art/ww/rover-spectro-n.webp |
| ww | Rover (Havoc) | full | assets/card-art/ww/rover-havoc-n.webp |
| ww | Rover (Aero) | full | assets/card-art/ww/rover-aero-n.webp |
| ww | Chixia | full | assets/card-art/ww/chixia-n.webp |
| ww | Baizhi | full | assets/card-art/ww/baizhi-n.webp |
| ww | Sanhua | full | assets/card-art/ww/sanhua-n.webp |
| ww | Danjin | full | assets/card-art/ww/danjin-n.webp |
| ww | Taoqi | full | assets/card-art/ww/taoqi-n.webp |
| ww | Mortefi | full | assets/card-art/ww/mortefi-n.webp |
| gi | Équipe d’Inazuma | group | assets/card-art/gi/equipe-d-inazuma-n.webp |
| gi | Équipe de Natlan | group | assets/card-art/gi/equipe-de-natlan-n.webp |
| gi | Les Sept Archons | group | assets/card-art/gi/les-sept-archons-n.webp |
| gi | Hexenzirkel | group | assets/card-art/gi/hexenzirkel-n.webp |
| gi | Columbina & Sandrone | group | assets/card-art/gi/columbina-sandrone-n.webp |
| gi | Les Fatui | group | assets/card-art/gi/les-fatui-n.webp |
| gi | Chevaliers de Favonius | group | assets/card-art/gi/chevaliers-de-favonius-n.webp |
| gi | Groupe de Liyue | group | assets/card-art/gi/groupe-de-liyue-n.webp |
| gi | Groupe de Fontaine | group | assets/card-art/gi/groupe-de-fontaine-n.webp |
| gi | Équipe de Sumeru | group | assets/card-art/gi/equipe-de-sumeru-n.webp |
| gi | Duo de justice | group | assets/card-art/gi/duo-de-justice-n.webp |
| hsr | Famille de Penacony | group | assets/card-art/hsr/famille-de-penacony-n.webp |
| hsr | Aglaea & Tribbie | group | assets/card-art/hsr/aglaea-tribbie-n.webp |
| hsr | March 7th & Evernight | group | assets/card-art/hsr/march-7th-evernight-n.webp |
| hsr | Héritiers de Chrysos | group | assets/card-art/hsr/heritiers-de-chrysos-n.webp |
| hsr | Cerydra & Hysilens | group | assets/card-art/hsr/cerydra-hysilens-n.webp |
| hsr | Madame Herta & Herta | group | assets/card-art/hsr/madame-herta-herta-n.webp |
| hsr | Étudiants de Lâh-Roi | group | assets/card-art/hsr/etudiants-de-lah-roi-n.webp |
| hsr | Chasseurs de Stellaron | group | assets/card-art/hsr/chasseurs-de-stellaron-n.webp |
| hsr | Gardiens de Belobog | group | assets/card-art/hsr/gardiens-de-belobog-n.webp |
| hsr | Commission des Dix Seigneurs | group | assets/card-art/hsr/commission-des-dix-seigneurs-n.webp |
| ww | Résonateurs de Rinascita | group | assets/card-art/ww/resonateurs-de-rinascita-n.webp |
| ww | Camellya & Shorekeeper | group | assets/card-art/ww/camellya-shorekeeper-n.webp |
| ww | Jinhsi & Changli | group | assets/card-art/ww/jinhsi-changli-n.webp |
| ww | Phoebe & Cartethyia | group | assets/card-art/ww/phoebe-cartethyia-n.webp |
| ww | Équipe de Jinzhou | group | assets/card-art/ww/equipe-de-jinzhou-n.webp |
| ww | Black Shores | group | assets/card-art/ww/black-shores-n.webp |
| ww | Fractsidus | group | assets/card-art/ww/fractsidus-n.webp |
| ww | Jiyan & Mortefi | group | assets/card-art/ww/jiyan-mortefi-n.webp |
| hsr | Aha | aeon | assets/card-art/hsr/aha-n.webp |
| hsr | Akivili | aeon | assets/card-art/hsr/akivili-n.webp |
| hsr | Fuli | aeon | assets/card-art/hsr/fuli-n.webp |
| hsr | Lan | aeon | assets/card-art/hsr/lan-n.webp |
| hsr | Nanook | aeon | assets/card-art/hsr/nanook-n.webp |
| hsr | Nous | aeon | assets/card-art/hsr/nous-n.webp |
| hsr | Qlipoth | aeon | assets/card-art/hsr/qlipoth-n.webp |
| hsr | Yaoshi | aeon | assets/card-art/hsr/yaoshi-n.webp |
| hsr | Xipe | aeon | assets/card-art/hsr/xipe-n.webp |
| hsr | IX | aeon | assets/card-art/hsr/ix-n.webp |
| gi | Aether | epic | assets/card-art/gi/aether-n.webp |
| gi | Aloy | epic | assets/card-art/gi/aloy-n.webp |
| gi | Lumine | epic | assets/card-art/gi/lumine-n.webp |
| gi | Manekin | epic | assets/card-art/gi/manekin-n.webp |
| gi | Manekina | epic | assets/card-art/gi/manekina-n.webp |
| hsr | Silver Wolf LV.<unbreak>999</unbreak> | epic | assets/card-art/hsr/silver-wolf-lv-unbreak-999-unbreak-n.webp |
| hsr | Pionnier · Physical | epic | assets/card-art/hsr/nickname-8001-n.webp |
| hsr | Pionnier · Physical | epic | assets/card-art/hsr/nickname-8002-n.webp |
| hsr | Pionnier · Fire | epic | assets/card-art/hsr/nickname-8003-n.webp |
| hsr | Pionnier · Fire | epic | assets/card-art/hsr/nickname-8004-n.webp |
| hsr | Pionnier · Imaginary | epic | assets/card-art/hsr/nickname-8005-n.webp |
| hsr | Pionnier · Imaginary | epic | assets/card-art/hsr/nickname-8006-n.webp |
| hsr | Pionnier · Ice | epic | assets/card-art/hsr/nickname-8007-n.webp |
| hsr | Pionnier · Ice | epic | assets/card-art/hsr/nickname-8008-n.webp |
| hsr | Pionnier · Thunder | epic | assets/card-art/hsr/nickname-8009-n.webp |
| hsr | Pionnier · Thunder | epic | assets/card-art/hsr/nickname-8010-n.webp |
| ww | Verina | epic | assets/card-art/ww/verina-n.webp |
| ww | Rover: Spectro | epic | assets/card-art/ww/rover-1501-n.webp |
| ww | Sanhua | epic | assets/card-art/ww/sanhua-n.webp |
| ww | Taoqi | epic | assets/card-art/ww/taoqi-n.webp |
| ww | Rover: Spectro | epic | assets/card-art/ww/rover-1502-n.webp |
| ww | Baizhi | epic | assets/card-art/ww/baizhi-n.webp |
| ww | Danjin | epic | assets/card-art/ww/danjin-n.webp |
| ww | Aalto | epic | assets/card-art/ww/aalto-n.webp |
| ww | Mortefi | epic | assets/card-art/ww/mortefi-n.webp |
| ww | Camellya | epic | assets/card-art/ww/camellya-n.webp |
| ww | Calcharo | epic | assets/card-art/ww/calcharo-n.webp |
| ww | Yinlin | epic | assets/card-art/ww/yinlin-n.webp |
| ww | Yuanwu | epic | assets/card-art/ww/yuanwu-n.webp |
| ww | Rover: Havoc | epic | assets/card-art/ww/rover-1604-n.webp |
| ww | Rover: Havoc | epic | assets/card-art/ww/rover-1605-n.webp |
| ww | Jianxin | epic | assets/card-art/ww/jianxin-n.webp |
| ww | Jinhsi | epic | assets/card-art/ww/jinhsi-n.webp |
| ww | Xiangli Yao | epic | assets/card-art/ww/xiangli-yao-n.webp |
| ww | Changli | epic | assets/card-art/ww/changli-n.webp |
| ww | Youhu | epic | assets/card-art/ww/youhu-n.webp |
| ww | Roccia | epic | assets/card-art/ww/roccia-n.webp |
| ww | Carlotta | epic | assets/card-art/ww/carlotta-n.webp |
| ww | Brant | epic | assets/card-art/ww/brant-n.webp |
| ww | Phoebe | epic | assets/card-art/ww/phoebe-n.webp |
| ww | Rover: Aero | epic | assets/card-art/ww/rover-1406-n.webp |
| ww | Cantarella | epic | assets/card-art/ww/cantarella-n.webp |
| ww | Ciaccona | epic | assets/card-art/ww/ciaccona-n.webp |
| ww | Zani | epic | assets/card-art/ww/zani-n.webp |
| ww | Rover: Aero | epic | assets/card-art/ww/rover-1408-n.webp |
| ww | Lupa | epic | assets/card-art/ww/lupa-n.webp |
| ww | Phrolova | epic | assets/card-art/ww/phrolova-n.webp |
| ww | Cartethyia | epic | assets/card-art/ww/cartethyia-n.webp |
| ww | Chisa | epic | assets/card-art/ww/chisa-n.webp |
| ww | Rebecca | epic | assets/card-art/ww/rebecca-n.webp |
| ww | Lucy | epic | assets/card-art/ww/lucy-n.webp |
| ww | Rover: Electro | epic | assets/card-art/ww/rover-electro-1309-n.webp |
| ww | Rover: Electro | epic | assets/card-art/ww/rover-electro-1310-n.webp |
| ww | Yangyang: Xuanling | epic | assets/card-art/ww/yangyang-xuanling-n.webp |
| gi | Aether | rare | assets/card-art/gi/aether-n.webp |
| gi | Aino | rare | assets/card-art/gi/aino-n.webp |
| gi | Aloy | rare | assets/card-art/gi/aloy-n.webp |
| gi | Alyosha | rare | assets/card-art/gi/alyosha-n.webp |
| gi | Columbina | rare | assets/card-art/gi/columbina-n.webp |
| gi | Ifa | rare | assets/card-art/gi/ifa-n.webp |
| gi | Illuga | rare | assets/card-art/gi/illuga-n.webp |
| gi | Lohen | rare | assets/card-art/gi/lohen-n.webp |
| gi | Lumine | rare | assets/card-art/gi/lumine-n.webp |
| gi | Manekin | rare | assets/card-art/gi/manekin-n.webp |
| gi | Manekina | rare | assets/card-art/gi/manekina-n.webp |
| gi | Odette | rare | assets/card-art/gi/odette-n.webp |
| gi | Prune | rare | assets/card-art/gi/prune-n.webp |
| gi | Sandrone | rare | assets/card-art/gi/sandrone-n.webp |
| gi | Varka | rare | assets/card-art/gi/varka-n.webp |
| gi | Vesna | rare | assets/card-art/gi/vesna-n.webp |
| gi | Vodyanitsa | rare | assets/card-art/gi/vodyanitsa-n.webp |
| hsr | Dan Heng | rare | assets/card-art/hsr/dan-heng-n.webp |
| hsr | Himeko | rare | assets/card-art/hsr/himeko-n.webp |
| hsr | Welt | rare | assets/card-art/hsr/welt-n.webp |
| hsr | Kafka | rare | assets/card-art/hsr/kafka-n.webp |
| hsr | Arlan | rare | assets/card-art/hsr/arlan-n.webp |
| hsr | Asta | rare | assets/card-art/hsr/asta-n.webp |
| hsr | Herta | rare | assets/card-art/hsr/herta-n.webp |
| hsr | Saber | rare | assets/card-art/hsr/saber-n.webp |
| hsr | Archer | rare | assets/card-art/hsr/archer-n.webp |
| hsr | Bronya | rare | assets/card-art/hsr/bronya-n.webp |
| hsr | Seele | rare | assets/card-art/hsr/seele-n.webp |
| hsr | Serval | rare | assets/card-art/hsr/serval-n.webp |
| hsr | Gepard | rare | assets/card-art/hsr/gepard-n.webp |
| hsr | Natasha | rare | assets/card-art/hsr/natasha-n.webp |
| hsr | Pela | rare | assets/card-art/hsr/pela-n.webp |
| hsr | Clara | rare | assets/card-art/hsr/clara-n.webp |
| hsr | Sampo | rare | assets/card-art/hsr/sampo-n.webp |
| hsr | Hook | rare | assets/card-art/hsr/hook-n.webp |
| hsr | Lynx | rare | assets/card-art/hsr/lynx-n.webp |
| hsr | Luka | rare | assets/card-art/hsr/luka-n.webp |
| hsr | Topaz & Numby | rare | assets/card-art/hsr/topaz-numby-n.webp |
| hsr | Qingque | rare | assets/card-art/hsr/qingque-n.webp |
| hsr | Tingyun | rare | assets/card-art/hsr/tingyun-n.webp |
| hsr | Luocha | rare | assets/card-art/hsr/luocha-n.webp |
| hsr | Jing Yuan | rare | assets/card-art/hsr/jing-yuan-n.webp |
| hsr | Blade | rare | assets/card-art/hsr/blade-n.webp |
| hsr | Sushang | rare | assets/card-art/hsr/sushang-n.webp |
| hsr | Yukong | rare | assets/card-art/hsr/yukong-n.webp |
| hsr | Fu Xuan | rare | assets/card-art/hsr/fu-xuan-n.webp |
| hsr | Yanqing | rare | assets/card-art/hsr/yanqing-n.webp |
| hsr | Guinaifen | rare | assets/card-art/hsr/guinaifen-n.webp |
| hsr | Bailu | rare | assets/card-art/hsr/bailu-n.webp |
| hsr | Jingliu | rare | assets/card-art/hsr/jingliu-n.webp |
| hsr | Dan Heng • Imbibitor Lunae | rare | assets/card-art/hsr/dan-heng-imbibitor-lunae-n.webp |
| hsr | Xueyi | rare | assets/card-art/hsr/xueyi-n.webp |
| hsr | Hanya | rare | assets/card-art/hsr/hanya-n.webp |
| hsr | Huohuo | rare | assets/card-art/hsr/huohuo-n.webp |
| hsr | Jiaoqiu | rare | assets/card-art/hsr/jiaoqiu-n.webp |
| hsr | Feixiao | rare | assets/card-art/hsr/feixiao-n.webp |
| hsr | Yunli | rare | assets/card-art/hsr/yunli-n.webp |
| hsr | Lingsha | rare | assets/card-art/hsr/lingsha-n.webp |
| hsr | Moze | rare | assets/card-art/hsr/moze-n.webp |
| hsr | March 7th | rare | assets/card-art/hsr/march-7th-1224-n.webp |
| hsr | Fugue | rare | assets/card-art/hsr/fugue-n.webp |
| hsr | Gallagher | rare | assets/card-art/hsr/gallagher-n.webp |
| hsr | Argenti | rare | assets/card-art/hsr/argenti-n.webp |
| hsr | Ruan Mei | rare | assets/card-art/hsr/ruan-mei-n.webp |
| hsr | Aventurine | rare | assets/card-art/hsr/aventurine-n.webp |
| hsr | Dr. Ratio | rare | assets/card-art/hsr/dr-ratio-n.webp |
| hsr | Sparkle | rare | assets/card-art/hsr/sparkle-n.webp |
| hsr | Black Swan | rare | assets/card-art/hsr/black-swan-n.webp |
| hsr | Acheron | rare | assets/card-art/hsr/acheron-n.webp |
| hsr | Robin | rare | assets/card-art/hsr/robin-n.webp |
| hsr | Firefly | rare | assets/card-art/hsr/firefly-n.webp |
| hsr | Misha | rare | assets/card-art/hsr/misha-n.webp |
| hsr | Sunday | rare | assets/card-art/hsr/sunday-n.webp |
| hsr | Jade | rare | assets/card-art/hsr/jade-n.webp |
| hsr | Boothill | rare | assets/card-art/hsr/boothill-n.webp |
| hsr | Rappa | rare | assets/card-art/hsr/rappa-n.webp |
| hsr | The Herta | rare | assets/card-art/hsr/the-herta-n.webp |
| hsr | Aglaea | rare | assets/card-art/hsr/aglaea-n.webp |
| hsr | Mydei | rare | assets/card-art/hsr/mydei-n.webp |
| hsr | Anaxa | rare | assets/card-art/hsr/anaxa-n.webp |
| hsr | Castorice | rare | assets/card-art/hsr/castorice-n.webp |
| hsr | Phainon | rare | assets/card-art/hsr/phainon-n.webp |
| hsr | Hyacine | rare | assets/card-art/hsr/hyacine-n.webp |
| hsr | Hysilens | rare | assets/card-art/hsr/hysilens-n.webp |
| hsr | Cerydra | rare | assets/card-art/hsr/cerydra-n.webp |
| hsr | Evernight | rare | assets/card-art/hsr/evernight-n.webp |
| hsr | Dan Heng • Permansor Terrae | rare | assets/card-art/hsr/dan-heng-permansor-terrae-n.webp |
| hsr | Silver Wolf LV.<unbreak>999</unbreak> | rare | assets/card-art/hsr/silver-wolf-lv-unbreak-999-unbreak-n.webp |
| hsr | Mortenax Blade | rare | assets/card-art/hsr/mortenax-blade-n.webp |
| hsr | Rin Tohsaka | rare | assets/card-art/hsr/rin-tohsaka-n.webp |
| hsr | Gilgamesh | rare | assets/card-art/hsr/gilgamesh-n.webp |
| hsr | Himeko • Nova | rare | assets/card-art/hsr/himeko-nova-n.webp |
| hsr | Robin • Summeretto | rare | assets/card-art/hsr/robin-summeretto-n.webp |
| hsr | Aventurine • Waveflair | rare | assets/card-art/hsr/aventurine-waveflair-n.webp |
| hsr | Pionnier · Physical | rare | assets/card-art/hsr/nickname-8001-n.webp |
| hsr | Pionnier · Physical | rare | assets/card-art/hsr/nickname-8002-n.webp |
| hsr | Pionnier · Fire | rare | assets/card-art/hsr/nickname-8003-n.webp |
| hsr | Pionnier · Fire | rare | assets/card-art/hsr/nickname-8004-n.webp |
| hsr | Pionnier · Imaginary | rare | assets/card-art/hsr/nickname-8005-n.webp |
| hsr | Pionnier · Imaginary | rare | assets/card-art/hsr/nickname-8006-n.webp |
| hsr | Pionnier · Ice | rare | assets/card-art/hsr/nickname-8007-n.webp |
| hsr | Pionnier · Ice | rare | assets/card-art/hsr/nickname-8008-n.webp |
| hsr | Pionnier · Thunder | rare | assets/card-art/hsr/nickname-8009-n.webp |
| hsr | Pionnier · Thunder | rare | assets/card-art/hsr/nickname-8010-n.webp |
| ww | Yangyang | rare | assets/card-art/ww/yangyang-n.webp |
| ww | Chixia | rare | assets/card-art/ww/chixia-n.webp |
| ww | Verina | rare | assets/card-art/ww/verina-n.webp |
| ww | Rover: Spectro | rare | assets/card-art/ww/rover-1501-n.webp |
| ww | Sanhua | rare | assets/card-art/ww/sanhua-n.webp |
| ww | Taoqi | rare | assets/card-art/ww/taoqi-n.webp |
| ww | Rover: Spectro | rare | assets/card-art/ww/rover-1502-n.webp |
| ww | Baizhi | rare | assets/card-art/ww/baizhi-n.webp |
| ww | Encore | rare | assets/card-art/ww/encore-n.webp |
| ww | Danjin | rare | assets/card-art/ww/danjin-n.webp |
| ww | Aalto | rare | assets/card-art/ww/aalto-n.webp |
| ww | Mortefi | rare | assets/card-art/ww/mortefi-n.webp |
| ww | Camellya | rare | assets/card-art/ww/camellya-n.webp |
| ww | Calcharo | rare | assets/card-art/ww/calcharo-n.webp |
| ww | Yinlin | rare | assets/card-art/ww/yinlin-n.webp |
| ww | Lingyang | rare | assets/card-art/ww/lingyang-n.webp |
| ww | Yuanwu | rare | assets/card-art/ww/yuanwu-n.webp |
| ww | Rover: Havoc | rare | assets/card-art/ww/rover-1604-n.webp |
| ww | Rover: Havoc | rare | assets/card-art/ww/rover-1605-n.webp |
| ww | Jianxin | rare | assets/card-art/ww/jianxin-n.webp |
| ww | Jinhsi | rare | assets/card-art/ww/jinhsi-n.webp |
| ww | Xiangli Yao | rare | assets/card-art/ww/xiangli-yao-n.webp |
| ww | Changli | rare | assets/card-art/ww/changli-n.webp |
| ww | Zhezhi | rare | assets/card-art/ww/zhezhi-n.webp |
| ww | Lumi | rare | assets/card-art/ww/lumi-n.webp |
| ww | Youhu | rare | assets/card-art/ww/youhu-n.webp |
| ww | Roccia | rare | assets/card-art/ww/roccia-n.webp |
| ww | Carlotta | rare | assets/card-art/ww/carlotta-n.webp |
| ww | Brant | rare | assets/card-art/ww/brant-n.webp |
| ww | Phoebe | rare | assets/card-art/ww/phoebe-n.webp |
| ww | Rover: Aero | rare | assets/card-art/ww/rover-1406-n.webp |
| ww | Cantarella | rare | assets/card-art/ww/cantarella-n.webp |
| ww | Ciaccona | rare | assets/card-art/ww/ciaccona-n.webp |
| ww | Zani | rare | assets/card-art/ww/zani-n.webp |
| ww | Rover: Aero | rare | assets/card-art/ww/rover-1408-n.webp |
| ww | Lupa | rare | assets/card-art/ww/lupa-n.webp |
| ww | Phrolova | rare | assets/card-art/ww/phrolova-n.webp |
| ww | Cartethyia | rare | assets/card-art/ww/cartethyia-n.webp |
| ww | Augusta | rare | assets/card-art/ww/augusta-n.webp |
| ww | Iuno | rare | assets/card-art/ww/iuno-n.webp |
| ww | Buling | rare | assets/card-art/ww/buling-n.webp |
| ww | Galbrena | rare | assets/card-art/ww/galbrena-n.webp |
| ww | Chisa | rare | assets/card-art/ww/chisa-n.webp |
| ww | Lynae | rare | assets/card-art/ww/lynae-n.webp |
| ww | Mornye | rare | assets/card-art/ww/mornye-n.webp |
| ww | Luuk Herssen | rare | assets/card-art/ww/luuk-herssen-n.webp |
| ww | Aemeath | rare | assets/card-art/ww/aemeath-n.webp |
| ww | Denia | rare | assets/card-art/ww/denia-n.webp |
| ww | Rebecca | rare | assets/card-art/ww/rebecca-n.webp |
| ww | Lucilla | rare | assets/card-art/ww/lucilla-n.webp |
| ww | Lucy | rare | assets/card-art/ww/lucy-n.webp |
| ww | Rover: Electro | rare | assets/card-art/ww/rover-electro-1309-n.webp |
| ww | Rover: Electro | rare | assets/card-art/ww/rover-electro-1310-n.webp |
| ww | Yangyang: Xuanling | rare | assets/card-art/ww/yangyang-xuanling-n.webp |
| ww | Suoming | rare | assets/card-art/ww/suoming-n.webp |
| gi | Aether | super | assets/card-art/gi/aether-n.webp |
| gi | Aino | super | assets/card-art/gi/aino-n.webp |
| gi | Aloy | super | assets/card-art/gi/aloy-n.webp |
| gi | Alyosha | super | assets/card-art/gi/alyosha-n.webp |
| gi | Columbina | super | assets/card-art/gi/columbina-n.webp |
| gi | Dahlia | super | assets/card-art/gi/dahlia-n.webp |
| gi | Durin | super | assets/card-art/gi/durin-n.webp |
| gi | Ifa | super | assets/card-art/gi/ifa-n.webp |
| gi | Illuga | super | assets/card-art/gi/illuga-n.webp |
| gi | Ineffa | super | assets/card-art/gi/ineffa-n.webp |
| gi | Jahoda | super | assets/card-art/gi/jahoda-n.webp |
| gi | Lan Yan | super | assets/card-art/gi/lan-yan-n.webp |
| gi | Linnea | super | assets/card-art/gi/linnea-n.webp |
| gi | Lohen | super | assets/card-art/gi/lohen-n.webp |
| gi | Lumine | super | assets/card-art/gi/lumine-n.webp |
| gi | Manekin | super | assets/card-art/gi/manekin-n.webp |
| gi | Manekina | super | assets/card-art/gi/manekina-n.webp |
| gi | Mavuika | super | assets/card-art/gi/mavuika-n.webp |
| gi | Nefer | super | assets/card-art/gi/nefer-n.webp |
| gi | Nicole | super | assets/card-art/gi/nicole-n.webp |
| gi | Odette | super | assets/card-art/gi/odette-n.webp |
| gi | Prune | super | assets/card-art/gi/prune-n.webp |
| gi | Sandrone | super | assets/card-art/gi/sandrone-n.webp |
| gi | Varka | super | assets/card-art/gi/varka-n.webp |
| gi | Vesna | super | assets/card-art/gi/vesna-n.webp |
| gi | Vodyanitsa | super | assets/card-art/gi/vodyanitsa-n.webp |
| gi | Zibai | super | assets/card-art/gi/zibai-n.webp |
| hsr | Dan Heng | super | assets/card-art/hsr/dan-heng-n.webp |
| hsr | Himeko | super | assets/card-art/hsr/himeko-n.webp |
| hsr | Welt | super | assets/card-art/hsr/welt-n.webp |
| hsr | Kafka | super | assets/card-art/hsr/kafka-n.webp |
| hsr | Silver Wolf | super | assets/card-art/hsr/silver-wolf-n.webp |
| hsr | Arlan | super | assets/card-art/hsr/arlan-n.webp |
| hsr | Asta | super | assets/card-art/hsr/asta-n.webp |
| hsr | Herta | super | assets/card-art/hsr/herta-n.webp |
| hsr | Saber | super | assets/card-art/hsr/saber-n.webp |
| hsr | Archer | super | assets/card-art/hsr/archer-n.webp |
| hsr | Bronya | super | assets/card-art/hsr/bronya-n.webp |
| hsr | Seele | super | assets/card-art/hsr/seele-n.webp |
| hsr | Serval | super | assets/card-art/hsr/serval-n.webp |
| hsr | Gepard | super | assets/card-art/hsr/gepard-n.webp |
| hsr | Natasha | super | assets/card-art/hsr/natasha-n.webp |
| hsr | Pela | super | assets/card-art/hsr/pela-n.webp |
| hsr | Clara | super | assets/card-art/hsr/clara-n.webp |
| hsr | Sampo | super | assets/card-art/hsr/sampo-n.webp |
| hsr | Hook | super | assets/card-art/hsr/hook-n.webp |
| hsr | Lynx | super | assets/card-art/hsr/lynx-n.webp |
| hsr | Luka | super | assets/card-art/hsr/luka-n.webp |
| hsr | Topaz & Numby | super | assets/card-art/hsr/topaz-numby-n.webp |
| hsr | Qingque | super | assets/card-art/hsr/qingque-n.webp |
| hsr | Tingyun | super | assets/card-art/hsr/tingyun-n.webp |
| hsr | Luocha | super | assets/card-art/hsr/luocha-n.webp |
| hsr | Jing Yuan | super | assets/card-art/hsr/jing-yuan-n.webp |
| hsr | Blade | super | assets/card-art/hsr/blade-n.webp |
| hsr | Sushang | super | assets/card-art/hsr/sushang-n.webp |
| hsr | Yukong | super | assets/card-art/hsr/yukong-n.webp |
| hsr | Fu Xuan | super | assets/card-art/hsr/fu-xuan-n.webp |
| hsr | Yanqing | super | assets/card-art/hsr/yanqing-n.webp |
| hsr | Guinaifen | super | assets/card-art/hsr/guinaifen-n.webp |
| hsr | Bailu | super | assets/card-art/hsr/bailu-n.webp |
| hsr | Jingliu | super | assets/card-art/hsr/jingliu-n.webp |
| hsr | Dan Heng • Imbibitor Lunae | super | assets/card-art/hsr/dan-heng-imbibitor-lunae-n.webp |
| hsr | Xueyi | super | assets/card-art/hsr/xueyi-n.webp |
| hsr | Hanya | super | assets/card-art/hsr/hanya-n.webp |
| hsr | Huohuo | super | assets/card-art/hsr/huohuo-n.webp |
| hsr | Jiaoqiu | super | assets/card-art/hsr/jiaoqiu-n.webp |
| hsr | Feixiao | super | assets/card-art/hsr/feixiao-n.webp |
| hsr | Yunli | super | assets/card-art/hsr/yunli-n.webp |
| hsr | Lingsha | super | assets/card-art/hsr/lingsha-n.webp |
| hsr | Moze | super | assets/card-art/hsr/moze-n.webp |
| hsr | March 7th | super | assets/card-art/hsr/march-7th-1224-n.webp |
| hsr | Fugue | super | assets/card-art/hsr/fugue-n.webp |
| hsr | Gallagher | super | assets/card-art/hsr/gallagher-n.webp |
| hsr | Argenti | super | assets/card-art/hsr/argenti-n.webp |
| hsr | Ruan Mei | super | assets/card-art/hsr/ruan-mei-n.webp |
| hsr | Aventurine | super | assets/card-art/hsr/aventurine-n.webp |
| hsr | Dr. Ratio | super | assets/card-art/hsr/dr-ratio-n.webp |
| hsr | Sparkle | super | assets/card-art/hsr/sparkle-n.webp |
| hsr | Black Swan | super | assets/card-art/hsr/black-swan-n.webp |
| hsr | Acheron | super | assets/card-art/hsr/acheron-n.webp |
| hsr | Robin | super | assets/card-art/hsr/robin-n.webp |
| hsr | Firefly | super | assets/card-art/hsr/firefly-n.webp |
| hsr | Misha | super | assets/card-art/hsr/misha-n.webp |
| hsr | Sunday | super | assets/card-art/hsr/sunday-n.webp |
| hsr | Jade | super | assets/card-art/hsr/jade-n.webp |
| hsr | Boothill | super | assets/card-art/hsr/boothill-n.webp |
| hsr | Rappa | super | assets/card-art/hsr/rappa-n.webp |
| hsr | The Dahlia | super | assets/card-art/hsr/the-dahlia-n.webp |
| hsr | The Herta | super | assets/card-art/hsr/the-herta-n.webp |
| hsr | Aglaea | super | assets/card-art/hsr/aglaea-n.webp |
| hsr | Tribbie | super | assets/card-art/hsr/tribbie-n.webp |
| hsr | Mydei | super | assets/card-art/hsr/mydei-n.webp |
| hsr | Anaxa | super | assets/card-art/hsr/anaxa-n.webp |
| hsr | Cipher | super | assets/card-art/hsr/cipher-n.webp |
| hsr | Castorice | super | assets/card-art/hsr/castorice-n.webp |
| hsr | Phainon | super | assets/card-art/hsr/phainon-n.webp |
| hsr | Hyacine | super | assets/card-art/hsr/hyacine-n.webp |
| hsr | Hysilens | super | assets/card-art/hsr/hysilens-n.webp |
| hsr | Cerydra | super | assets/card-art/hsr/cerydra-n.webp |
| hsr | Evernight | super | assets/card-art/hsr/evernight-n.webp |
| hsr | Dan Heng • Permansor Terrae | super | assets/card-art/hsr/dan-heng-permansor-terrae-n.webp |
| hsr | Cyrene | super | assets/card-art/hsr/cyrene-n.webp |
| hsr | Sparxie | super | assets/card-art/hsr/sparxie-n.webp |
| hsr | Yao Guang | super | assets/card-art/hsr/yao-guang-n.webp |
| hsr | Pearl | super | assets/card-art/hsr/pearl-n.webp |
| hsr | Ashveil | super | assets/card-art/hsr/ashveil-n.webp |
| hsr | Evanescia | super | assets/card-art/hsr/evanescia-n.webp |
| hsr | Silver Wolf LV.<unbreak>999</unbreak> | super | assets/card-art/hsr/silver-wolf-lv-unbreak-999-unbreak-n.webp |
| hsr | Mortenax Blade | super | assets/card-art/hsr/mortenax-blade-n.webp |
| hsr | Rin Tohsaka | super | assets/card-art/hsr/rin-tohsaka-n.webp |
| hsr | Gilgamesh | super | assets/card-art/hsr/gilgamesh-n.webp |
| hsr | Himeko • Nova | super | assets/card-art/hsr/himeko-nova-n.webp |
| hsr | Aeon ★ Aha | super | assets/card-art/hsr/aeon-aha-n.webp |
| hsr | Robin • Summeretto | super | assets/card-art/hsr/robin-summeretto-n.webp |
| hsr | Aventurine • Waveflair | super | assets/card-art/hsr/aventurine-waveflair-n.webp |
| hsr | Pionnier · Physical | super | assets/card-art/hsr/nickname-8001-n.webp |
| hsr | Pionnier · Physical | super | assets/card-art/hsr/nickname-8002-n.webp |
| hsr | Pionnier · Fire | super | assets/card-art/hsr/nickname-8003-n.webp |
| hsr | Pionnier · Fire | super | assets/card-art/hsr/nickname-8004-n.webp |
| hsr | Pionnier · Imaginary | super | assets/card-art/hsr/nickname-8005-n.webp |
| hsr | Pionnier · Imaginary | super | assets/card-art/hsr/nickname-8006-n.webp |
| hsr | Pionnier · Ice | super | assets/card-art/hsr/nickname-8007-n.webp |
| hsr | Pionnier · Ice | super | assets/card-art/hsr/nickname-8008-n.webp |
| hsr | Pionnier · Thunder | super | assets/card-art/hsr/nickname-8009-n.webp |
| hsr | Pionnier · Thunder | super | assets/card-art/hsr/nickname-8010-n.webp |
| ww | Yangyang | super | assets/card-art/ww/yangyang-n.webp |
| ww | Chixia | super | assets/card-art/ww/chixia-n.webp |
| ww | Verina | super | assets/card-art/ww/verina-n.webp |
| ww | Rover: Spectro | super | assets/card-art/ww/rover-1501-n.webp |
| ww | Sanhua | super | assets/card-art/ww/sanhua-n.webp |
| ww | Taoqi | super | assets/card-art/ww/taoqi-n.webp |
| ww | Rover: Spectro | super | assets/card-art/ww/rover-1502-n.webp |
| ww | Baizhi | super | assets/card-art/ww/baizhi-n.webp |
| ww | Encore | super | assets/card-art/ww/encore-n.webp |
| ww | Danjin | super | assets/card-art/ww/danjin-n.webp |
| ww | Aalto | super | assets/card-art/ww/aalto-n.webp |
| ww | Mortefi | super | assets/card-art/ww/mortefi-n.webp |
| ww | Camellya | super | assets/card-art/ww/camellya-n.webp |
| ww | Calcharo | super | assets/card-art/ww/calcharo-n.webp |
| ww | Yinlin | super | assets/card-art/ww/yinlin-n.webp |
| ww | Lingyang | super | assets/card-art/ww/lingyang-n.webp |
| ww | Yuanwu | super | assets/card-art/ww/yuanwu-n.webp |
| ww | Rover: Havoc | super | assets/card-art/ww/rover-1604-n.webp |
| ww | Rover: Havoc | super | assets/card-art/ww/rover-1605-n.webp |
| ww | Jianxin | super | assets/card-art/ww/jianxin-n.webp |
| ww | Jinhsi | super | assets/card-art/ww/jinhsi-n.webp |
| ww | Xiangli Yao | super | assets/card-art/ww/xiangli-yao-n.webp |
| ww | Changli | super | assets/card-art/ww/changli-n.webp |
| ww | Zhezhi | super | assets/card-art/ww/zhezhi-n.webp |
| ww | Lumi | super | assets/card-art/ww/lumi-n.webp |
| ww | Youhu | super | assets/card-art/ww/youhu-n.webp |
| ww | Shorekeeper | super | assets/card-art/ww/shorekeeper-n.webp |
| ww | Roccia | super | assets/card-art/ww/roccia-n.webp |
| ww | Carlotta | super | assets/card-art/ww/carlotta-n.webp |
| ww | Brant | super | assets/card-art/ww/brant-n.webp |
| ww | Phoebe | super | assets/card-art/ww/phoebe-n.webp |
| ww | Rover: Aero | super | assets/card-art/ww/rover-1406-n.webp |
| ww | Cantarella | super | assets/card-art/ww/cantarella-n.webp |
| ww | Ciaccona | super | assets/card-art/ww/ciaccona-n.webp |
| ww | Zani | super | assets/card-art/ww/zani-n.webp |
| ww | Rover: Aero | super | assets/card-art/ww/rover-1408-n.webp |
| ww | Lupa | super | assets/card-art/ww/lupa-n.webp |
| ww | Phrolova | super | assets/card-art/ww/phrolova-n.webp |
| ww | Cartethyia | super | assets/card-art/ww/cartethyia-n.webp |
| ww | Augusta | super | assets/card-art/ww/augusta-n.webp |
| ww | Iuno | super | assets/card-art/ww/iuno-n.webp |
| ww | Buling | super | assets/card-art/ww/buling-n.webp |
| ww | Galbrena | super | assets/card-art/ww/galbrena-n.webp |
| ww | Chisa | super | assets/card-art/ww/chisa-n.webp |
| ww | Qiuyuan | super | assets/card-art/ww/qiuyuan-n.webp |
| ww | Lynae | super | assets/card-art/ww/lynae-n.webp |
| ww | Mornye | super | assets/card-art/ww/mornye-n.webp |
| ww | Luuk Herssen | super | assets/card-art/ww/luuk-herssen-n.webp |
| ww | Aemeath | super | assets/card-art/ww/aemeath-n.webp |
| ww | Sigrika | super | assets/card-art/ww/sigrika-n.webp |
| ww | Denia | super | assets/card-art/ww/denia-n.webp |
| ww | Rebecca | super | assets/card-art/ww/rebecca-n.webp |
| ww | Lucilla | super | assets/card-art/ww/lucilla-n.webp |
| ww | Lucy | super | assets/card-art/ww/lucy-n.webp |
| ww | Rover: Electro | super | assets/card-art/ww/rover-electro-1309-n.webp |
| ww | Rover: Electro | super | assets/card-art/ww/rover-electro-1310-n.webp |
| ww | Yangyang: Xuanling | super | assets/card-art/ww/yangyang-xuanling-n.webp |
| ww | Suisui | super | assets/card-art/ww/suisui-n.webp |
| ww | Qingxiao | super | assets/card-art/ww/qingxiao-n.webp |
| ww | Hsin | super | assets/card-art/ww/hsin-n.webp |
| ww | Jingran | super | assets/card-art/ww/jingran-n.webp |
| ww | Suoming | super | assets/card-art/ww/suoming-n.webp |
| ww | Lily | super | assets/card-art/ww/lily-n.webp |
| gi | Aether | common | assets/card-art/gi/aether-n.webp |
| gi | Aino | common | assets/card-art/gi/aino-n.webp |
| gi | Aloy | common | assets/card-art/gi/aloy-n.webp |
| gi | Alyosha | common | assets/card-art/gi/alyosha-n.webp |
| gi | Charlotte | common | assets/card-art/gi/charlotte-n.webp |
| gi | Citlali | common | assets/card-art/gi/citlali-n.webp |
| gi | Columbina | common | assets/card-art/gi/columbina-n.webp |
| gi | Dahlia | common | assets/card-art/gi/dahlia-n.webp |
| gi | Durin | common | assets/card-art/gi/durin-n.webp |
| gi | Gaming | common | assets/card-art/gi/gaming-n.webp |
| gi | Ifa | common | assets/card-art/gi/ifa-n.webp |
| gi | Illuga | common | assets/card-art/gi/illuga-n.webp |
| gi | Ineffa | common | assets/card-art/gi/ineffa-n.webp |
| gi | Jahoda | common | assets/card-art/gi/jahoda-n.webp |
| gi | Kachina | common | assets/card-art/gi/kachina-n.webp |
| gi | Lan Yan | common | assets/card-art/gi/lan-yan-n.webp |
| gi | Linnea | common | assets/card-art/gi/linnea-n.webp |
| gi | Lohen | common | assets/card-art/gi/lohen-n.webp |
| gi | Lumine | common | assets/card-art/gi/lumine-n.webp |
| gi | Manekin | common | assets/card-art/gi/manekin-n.webp |
| gi | Manekina | common | assets/card-art/gi/manekina-n.webp |
| gi | Mavuika | common | assets/card-art/gi/mavuika-n.webp |
| gi | Mualani | common | assets/card-art/gi/mualani-n.webp |
| gi | Nefer | common | assets/card-art/gi/nefer-n.webp |
| gi | Nicole | common | assets/card-art/gi/nicole-n.webp |
| gi | Odette | common | assets/card-art/gi/odette-n.webp |
| gi | Ororon | common | assets/card-art/gi/ororon-n.webp |
| gi | Prune | common | assets/card-art/gi/prune-n.webp |
| gi | Sandrone | common | assets/card-art/gi/sandrone-n.webp |
| gi | Sigewinne | common | assets/card-art/gi/sigewinne-n.webp |
| gi | Skirk | common | assets/card-art/gi/skirk-n.webp |
| gi | Varesa | common | assets/card-art/gi/varesa-n.webp |
| gi | Varka | common | assets/card-art/gi/varka-n.webp |
| gi | Vesna | common | assets/card-art/gi/vesna-n.webp |
| gi | Vodyanitsa | common | assets/card-art/gi/vodyanitsa-n.webp |
| gi | Xilonen | common | assets/card-art/gi/xilonen-n.webp |
| gi | Zibai | common | assets/card-art/gi/zibai-n.webp |
| hsr | Dan Heng | common | assets/card-art/hsr/dan-heng-n.webp |
| hsr | Himeko | common | assets/card-art/hsr/himeko-n.webp |
| hsr | Welt | common | assets/card-art/hsr/welt-n.webp |
| hsr | Kafka | common | assets/card-art/hsr/kafka-n.webp |
| hsr | Silver Wolf | common | assets/card-art/hsr/silver-wolf-n.webp |
| hsr | Arlan | common | assets/card-art/hsr/arlan-n.webp |
| hsr | Asta | common | assets/card-art/hsr/asta-n.webp |
| hsr | Herta | common | assets/card-art/hsr/herta-n.webp |
| hsr | Saber | common | assets/card-art/hsr/saber-n.webp |
| hsr | Archer | common | assets/card-art/hsr/archer-n.webp |
| hsr | Bronya | common | assets/card-art/hsr/bronya-n.webp |
| hsr | Seele | common | assets/card-art/hsr/seele-n.webp |
| hsr | Serval | common | assets/card-art/hsr/serval-n.webp |
| hsr | Gepard | common | assets/card-art/hsr/gepard-n.webp |
| hsr | Natasha | common | assets/card-art/hsr/natasha-n.webp |
| hsr | Pela | common | assets/card-art/hsr/pela-n.webp |
| hsr | Clara | common | assets/card-art/hsr/clara-n.webp |
| hsr | Sampo | common | assets/card-art/hsr/sampo-n.webp |
| hsr | Hook | common | assets/card-art/hsr/hook-n.webp |
| hsr | Lynx | common | assets/card-art/hsr/lynx-n.webp |
| hsr | Luka | common | assets/card-art/hsr/luka-n.webp |
| hsr | Topaz & Numby | common | assets/card-art/hsr/topaz-numby-n.webp |
| hsr | Qingque | common | assets/card-art/hsr/qingque-n.webp |
| hsr | Tingyun | common | assets/card-art/hsr/tingyun-n.webp |
| hsr | Luocha | common | assets/card-art/hsr/luocha-n.webp |
| hsr | Jing Yuan | common | assets/card-art/hsr/jing-yuan-n.webp |
| hsr | Blade | common | assets/card-art/hsr/blade-n.webp |
| hsr | Sushang | common | assets/card-art/hsr/sushang-n.webp |
| hsr | Yukong | common | assets/card-art/hsr/yukong-n.webp |
| hsr | Fu Xuan | common | assets/card-art/hsr/fu-xuan-n.webp |
| hsr | Yanqing | common | assets/card-art/hsr/yanqing-n.webp |
| hsr | Guinaifen | common | assets/card-art/hsr/guinaifen-n.webp |
| hsr | Bailu | common | assets/card-art/hsr/bailu-n.webp |
| hsr | Jingliu | common | assets/card-art/hsr/jingliu-n.webp |
| hsr | Dan Heng • Imbibitor Lunae | common | assets/card-art/hsr/dan-heng-imbibitor-lunae-n.webp |
| hsr | Xueyi | common | assets/card-art/hsr/xueyi-n.webp |
| hsr | Hanya | common | assets/card-art/hsr/hanya-n.webp |
| hsr | Huohuo | common | assets/card-art/hsr/huohuo-n.webp |
| hsr | Jiaoqiu | common | assets/card-art/hsr/jiaoqiu-n.webp |
| hsr | Feixiao | common | assets/card-art/hsr/feixiao-n.webp |
| hsr | Yunli | common | assets/card-art/hsr/yunli-n.webp |
| hsr | Lingsha | common | assets/card-art/hsr/lingsha-n.webp |
| hsr | Moze | common | assets/card-art/hsr/moze-n.webp |
| hsr | March 7th | common | assets/card-art/hsr/march-7th-1224-n.webp |
| hsr | Fugue | common | assets/card-art/hsr/fugue-n.webp |
| hsr | Gallagher | common | assets/card-art/hsr/gallagher-n.webp |
| hsr | Argenti | common | assets/card-art/hsr/argenti-n.webp |
| hsr | Ruan Mei | common | assets/card-art/hsr/ruan-mei-n.webp |
| hsr | Aventurine | common | assets/card-art/hsr/aventurine-n.webp |
| hsr | Dr. Ratio | common | assets/card-art/hsr/dr-ratio-n.webp |
| hsr | Sparkle | common | assets/card-art/hsr/sparkle-n.webp |
| hsr | Black Swan | common | assets/card-art/hsr/black-swan-n.webp |
| hsr | Acheron | common | assets/card-art/hsr/acheron-n.webp |
| hsr | Robin | common | assets/card-art/hsr/robin-n.webp |
| hsr | Firefly | common | assets/card-art/hsr/firefly-n.webp |
| hsr | Misha | common | assets/card-art/hsr/misha-n.webp |
| hsr | Sunday | common | assets/card-art/hsr/sunday-n.webp |
| hsr | Jade | common | assets/card-art/hsr/jade-n.webp |
| hsr | Boothill | common | assets/card-art/hsr/boothill-n.webp |
| hsr | Rappa | common | assets/card-art/hsr/rappa-n.webp |
| hsr | The Dahlia | common | assets/card-art/hsr/the-dahlia-n.webp |
| hsr | The Herta | common | assets/card-art/hsr/the-herta-n.webp |
| hsr | Aglaea | common | assets/card-art/hsr/aglaea-n.webp |
| hsr | Tribbie | common | assets/card-art/hsr/tribbie-n.webp |
| hsr | Mydei | common | assets/card-art/hsr/mydei-n.webp |
| hsr | Anaxa | common | assets/card-art/hsr/anaxa-n.webp |
| hsr | Cipher | common | assets/card-art/hsr/cipher-n.webp |
| hsr | Castorice | common | assets/card-art/hsr/castorice-n.webp |
| hsr | Phainon | common | assets/card-art/hsr/phainon-n.webp |
| hsr | Hyacine | common | assets/card-art/hsr/hyacine-n.webp |
| hsr | Hysilens | common | assets/card-art/hsr/hysilens-n.webp |
| hsr | Cerydra | common | assets/card-art/hsr/cerydra-n.webp |
| hsr | Evernight | common | assets/card-art/hsr/evernight-n.webp |
| hsr | Dan Heng • Permansor Terrae | common | assets/card-art/hsr/dan-heng-permansor-terrae-n.webp |
| hsr | Cyrene | common | assets/card-art/hsr/cyrene-n.webp |
| hsr | Sparxie | common | assets/card-art/hsr/sparxie-n.webp |
| hsr | Yao Guang | common | assets/card-art/hsr/yao-guang-n.webp |
| hsr | Pearl | common | assets/card-art/hsr/pearl-n.webp |
| hsr | Ashveil | common | assets/card-art/hsr/ashveil-n.webp |
| hsr | Evanescia | common | assets/card-art/hsr/evanescia-n.webp |
| hsr | Silver Wolf LV.<unbreak>999</unbreak> | common | assets/card-art/hsr/silver-wolf-lv-unbreak-999-unbreak-n.webp |
| hsr | Mortenax Blade | common | assets/card-art/hsr/mortenax-blade-n.webp |
| hsr | Rin Tohsaka | common | assets/card-art/hsr/rin-tohsaka-n.webp |
| hsr | Gilgamesh | common | assets/card-art/hsr/gilgamesh-n.webp |
| hsr | Himeko • Nova | common | assets/card-art/hsr/himeko-nova-n.webp |
| hsr | Aeon ★ Aha | common | assets/card-art/hsr/aeon-aha-n.webp |
| hsr | Robin • Summeretto | common | assets/card-art/hsr/robin-summeretto-n.webp |
| hsr | Aventurine • Waveflair | common | assets/card-art/hsr/aventurine-waveflair-n.webp |
| hsr | Pionnier · Physical | common | assets/card-art/hsr/nickname-8001-n.webp |
| hsr | Pionnier · Physical | common | assets/card-art/hsr/nickname-8002-n.webp |
| hsr | Pionnier · Fire | common | assets/card-art/hsr/nickname-8003-n.webp |
| hsr | Pionnier · Fire | common | assets/card-art/hsr/nickname-8004-n.webp |
| hsr | Pionnier · Imaginary | common | assets/card-art/hsr/nickname-8005-n.webp |
| hsr | Pionnier · Imaginary | common | assets/card-art/hsr/nickname-8006-n.webp |
| hsr | Pionnier · Ice | common | assets/card-art/hsr/nickname-8007-n.webp |
| hsr | Pionnier · Ice | common | assets/card-art/hsr/nickname-8008-n.webp |
| hsr | Pionnier · Thunder | common | assets/card-art/hsr/nickname-8009-n.webp |
| hsr | Pionnier · Thunder | common | assets/card-art/hsr/nickname-8010-n.webp |
| ww | Yangyang | common | assets/card-art/ww/yangyang-n.webp |
| ww | Chixia | common | assets/card-art/ww/chixia-n.webp |
| ww | Verina | common | assets/card-art/ww/verina-n.webp |
| ww | Rover: Spectro | common | assets/card-art/ww/rover-1501-n.webp |
| ww | Sanhua | common | assets/card-art/ww/sanhua-n.webp |
| ww | Taoqi | common | assets/card-art/ww/taoqi-n.webp |
| ww | Rover: Spectro | common | assets/card-art/ww/rover-1502-n.webp |
| ww | Baizhi | common | assets/card-art/ww/baizhi-n.webp |
| ww | Encore | common | assets/card-art/ww/encore-n.webp |
| ww | Danjin | common | assets/card-art/ww/danjin-n.webp |
| ww | Aalto | common | assets/card-art/ww/aalto-n.webp |
| ww | Jiyan | common | assets/card-art/ww/jiyan-n.webp |
| ww | Mortefi | common | assets/card-art/ww/mortefi-n.webp |
| ww | Camellya | common | assets/card-art/ww/camellya-n.webp |
| ww | Calcharo | common | assets/card-art/ww/calcharo-n.webp |
| ww | Yinlin | common | assets/card-art/ww/yinlin-n.webp |
| ww | Lingyang | common | assets/card-art/ww/lingyang-n.webp |
| ww | Yuanwu | common | assets/card-art/ww/yuanwu-n.webp |
| ww | Rover: Havoc | common | assets/card-art/ww/rover-1604-n.webp |
| ww | Rover: Havoc | common | assets/card-art/ww/rover-1605-n.webp |
| ww | Jianxin | common | assets/card-art/ww/jianxin-n.webp |
| ww | Jinhsi | common | assets/card-art/ww/jinhsi-n.webp |
| ww | Xiangli Yao | common | assets/card-art/ww/xiangli-yao-n.webp |
| ww | Changli | common | assets/card-art/ww/changli-n.webp |
| ww | Zhezhi | common | assets/card-art/ww/zhezhi-n.webp |
| ww | Lumi | common | assets/card-art/ww/lumi-n.webp |
| ww | Youhu | common | assets/card-art/ww/youhu-n.webp |
| ww | Shorekeeper | common | assets/card-art/ww/shorekeeper-n.webp |
| ww | Roccia | common | assets/card-art/ww/roccia-n.webp |
| ww | Carlotta | common | assets/card-art/ww/carlotta-n.webp |
| ww | Brant | common | assets/card-art/ww/brant-n.webp |
| ww | Phoebe | common | assets/card-art/ww/phoebe-n.webp |
| ww | Rover: Aero | common | assets/card-art/ww/rover-1406-n.webp |
| ww | Cantarella | common | assets/card-art/ww/cantarella-n.webp |
| ww | Ciaccona | common | assets/card-art/ww/ciaccona-n.webp |
| ww | Zani | common | assets/card-art/ww/zani-n.webp |
| ww | Rover: Aero | common | assets/card-art/ww/rover-1408-n.webp |
| ww | Lupa | common | assets/card-art/ww/lupa-n.webp |
| ww | Phrolova | common | assets/card-art/ww/phrolova-n.webp |
| ww | Cartethyia | common | assets/card-art/ww/cartethyia-n.webp |
| ww | Augusta | common | assets/card-art/ww/augusta-n.webp |
| ww | Iuno | common | assets/card-art/ww/iuno-n.webp |
| ww | Buling | common | assets/card-art/ww/buling-n.webp |
| ww | Galbrena | common | assets/card-art/ww/galbrena-n.webp |
| ww | Chisa | common | assets/card-art/ww/chisa-n.webp |
| ww | Qiuyuan | common | assets/card-art/ww/qiuyuan-n.webp |
| ww | Lynae | common | assets/card-art/ww/lynae-n.webp |
| ww | Mornye | common | assets/card-art/ww/mornye-n.webp |
| ww | Luuk Herssen | common | assets/card-art/ww/luuk-herssen-n.webp |
| ww | Aemeath | common | assets/card-art/ww/aemeath-n.webp |
| ww | Sigrika | common | assets/card-art/ww/sigrika-n.webp |
| ww | Denia | common | assets/card-art/ww/denia-n.webp |
| ww | Rebecca | common | assets/card-art/ww/rebecca-n.webp |
| ww | Lucilla | common | assets/card-art/ww/lucilla-n.webp |
| ww | Lucy | common | assets/card-art/ww/lucy-n.webp |
| ww | Hiyuki | common | assets/card-art/ww/hiyuki-n.webp |
| ww | Rover: Electro | common | assets/card-art/ww/rover-electro-1309-n.webp |
| ww | Rover: Electro | common | assets/card-art/ww/rover-electro-1310-n.webp |
| ww | Yangyang: Xuanling | common | assets/card-art/ww/yangyang-xuanling-n.webp |
| ww | Suisui | common | assets/card-art/ww/suisui-n.webp |
| ww | Qingxiao | common | assets/card-art/ww/qingxiao-n.webp |
| ww | Hsin | common | assets/card-art/ww/hsin-n.webp |
| ww | Jingran | common | assets/card-art/ww/jingran-n.webp |
| ww | Suoming | common | assets/card-art/ww/suoming-n.webp |
| ww | Lily | common | assets/card-art/ww/lily-n.webp |
| gi | Geste du loup puissant | equipment | assets/card-art/gi/geste-du-loup-puissant-n.webp |
| gi | Atlas de la Voûte d'Azur | equipment | assets/card-art/gi/atlas-de-la-voute-d-azur-n.webp |
| gi | Mille soleils brûlants | equipment | assets/card-art/gi/mille-soleils-brulants-n.webp |
| gi | Éclazur | equipment | assets/card-art/gi/eclazur-n.webp |
| gi | Lumière d'incision foliaire | equipment | assets/card-art/gi/lumiere-d-incision-foliaire-n.webp |
| gi | Ultime soupir | equipment | assets/card-art/gi/ultime-soupir-n.webp |
| gi | Athame Artis | equipment | assets/card-art/gi/athame-artis-n.webp |
| gi | Chanson de patrouille de sommet | equipment | assets/card-art/gi/chanson-de-patrouille-de-sommet-n.webp |
| gi | Vérité de Kagura | equipment | assets/card-art/gi/verite-de-kagura-n.webp |
| gi | Écho de la grue | equipment | assets/card-art/gi/echo-de-la-grue-n.webp |
| gi | Au-delà de la chrysalide | equipment | assets/card-art/gi/au-dela-de-la-chrysalide-n.webp |
| gi | Splendeur des eaux calmes | equipment | assets/card-art/gi/splendeur-des-eaux-calmes-n.webp |
| gi | Tranche-sommets | equipment | assets/card-art/gi/tranche-sommets-n.webp |
| gi | Corde de pluie blanche | equipment | assets/card-art/gi/corde-de-pluie-blanche-n.webp |
| gi | Hymne dans le maelström | equipment | assets/card-art/gi/hymne-dans-le-maelstrom-n.webp |
| gi | Amour chéri | equipment | assets/card-art/gi/amour-cheri-n.webp |
| gi | Marcheur du feu | equipment | assets/card-art/gi/marcheur-du-feu-n.webp |
| gi | Emblème du destin brisé | equipment | assets/card-art/gi/embleme-du-destin-brise-n.webp |
| gi | Chasseur de la Maréchaussée | equipment | assets/card-art/gi/chasseur-de-la-marechaussee-n.webp |
| gi | Météore inversé | equipment | assets/card-art/gi/meteore-inverse-n.webp |
| gi | Chronique du Pavillon du désert | equipment | assets/card-art/gi/chronique-du-pavillon-du-desert-n.webp |
| gi | Roche ancienne | equipment | assets/card-art/gi/roche-ancienne-n.webp |
| gi | Murmure nocturne en forêt d'échos | equipment | assets/card-art/gi/murmure-nocturne-en-foret-d-echos-n.webp |
| gi | Lueur du vourukasha | equipment | assets/card-art/gi/lueur-du-vourukasha-n.webp |
| gi | Échos d'une offrande | equipment | assets/card-art/gi/echos-d-une-offrande-n.webp |
| gi | Rideau du Gladiateur | equipment | assets/card-art/gi/rideau-du-gladiateur-n.webp |
| gi | Nuit de la révélation céleste | equipment | assets/card-art/gi/nuit-de-la-revelation-celeste-n.webp |
| gi | Réminiscence nostalgique | equipment | assets/card-art/gi/reminiscence-nostalgique-n.webp |
| gi | Ténacité du Millelithe | equipment | assets/card-art/gi/tenacite-du-millelithe-n.webp |
| gi | Fleur du paradis perdu | equipment | assets/card-art/gi/fleur-du-paradis-perdu-n.webp |
| gi | Énergie · Pyro | energy | assets/card-art/gi/energy-pyro-n.webp |
| gi | Énergie · Hydro | energy | assets/card-art/gi/energy-hydro-n.webp |
| gi | Énergie · Cryo | energy | assets/card-art/gi/energy-cryo-n.webp |
| gi | Énergie · Electro | energy | assets/card-art/gi/energy-electro-n.webp |
| gi | Énergie · Dendro | energy | assets/card-art/gi/energy-dendro-n.webp |
| gi | Énergie · Anemo | energy | assets/card-art/gi/energy-anemo-n.webp |
| gi | Énergie · Geo | energy | assets/card-art/gi/energy-geo-n.webp |
| hsr | Énergie · Physical | energy | assets/card-art/hsr/energy-physical-n.webp |
| hsr | Énergie · Fire | energy | assets/card-art/hsr/energy-fire-n.webp |
| hsr | Énergie · Ice | energy | assets/card-art/hsr/energy-ice-n.webp |
| hsr | Énergie · Lightning | energy | assets/card-art/hsr/energy-lightning-n.webp |
| hsr | Énergie · Wind | energy | assets/card-art/hsr/energy-wind-n.webp |
| hsr | Énergie · Quantum | energy | assets/card-art/hsr/energy-quantum-n.webp |
| hsr | Énergie · Imaginary | energy | assets/card-art/hsr/energy-imaginary-n.webp |
| hsr | Énergie · Destruction | energy | assets/card-art/hsr/energy-destruction-n.webp |
| hsr | Énergie · The Hunt | energy | assets/card-art/hsr/energy-the-hunt-n.webp |
| hsr | Énergie · Erudition | energy | assets/card-art/hsr/energy-erudition-n.webp |
| hsr | Énergie · Harmony | energy | assets/card-art/hsr/energy-harmony-n.webp |
| hsr | Énergie · Nihility | energy | assets/card-art/hsr/energy-nihility-n.webp |
| hsr | Énergie · Preservation | energy | assets/card-art/hsr/energy-preservation-n.webp |
| hsr | Énergie · Abundance | energy | assets/card-art/hsr/energy-abundance-n.webp |
| hsr | Énergie · Remembrance | energy | assets/card-art/hsr/energy-remembrance-n.webp |
| hsr | Énergie · Elation | energy | assets/card-art/hsr/energy-elation-n.webp |

## Ajouter une image

Ajouter une entrée à `assets/card-art/sources.json` avec game, slug, local, source, title et attribution. Seules les provenances `official-hoyoverse` et `official-kuro` sont admises; dessins de fans et reposts communautaires sont exclus.

## Reproduire

node scripts/export_card_catalog.mjs, python scripts/sync_official_art_sources.py --games gi hsr, python scripts/sync_official_wuwa_art_sources.py, python scripts/audit_cards.py --incremental, python scripts/audit_cards.py --strict, python scripts/optimize_card_assets.py --apply, python tests/cards_browser.py
Les images officielles sont stockées en WebP qualité 89, limitées à 1600 × 2400 px. Les binaires de téléchargement temporaires sont exclus du dépôt et des versions distribuées; les sources et crédits restent dans le manifeste officiel.

Le contrôle strict et le contrôle Playwright des images échouent tant que la liste des images manquantes n’est pas vide. Le rapport ne transforme pas un emplacement de secours en réussite.

## Référence et limites

`docs/reference/cards.html` est la copie exacte du fichier fourni. Dix raretés y figurent. Aeon reprend le modèle Légende (classe Aeon déjà présente); Équipement reprend Full Art; Énergie reprend Common sans attaques. Le modèle unique Obsidian reprend la carte Obsidian originale. Aucun modèle inédit absent du fichier n’est présenté comme une correspondance visuelle originale.
Les textes réels viennent de characterDetails()/skillList() et du rendu riche existants. Un kit non publié reste indiqué, sans attaques, coûts, faiblesses ou chiffres inventés. Les groupes reprennent des compétences réelles de leurs membres, sans inventer de kit collectif.

## Roster demandé

Les raretés prioritaires listées représentent **199 cartes personnage** (The Herta compte deux fois car elle figure dans deux raretés). Images attribuées : **115** ; encore manquantes : **84**.
La section Astrales annonce 21 cartes mais ne nomme que 20 personnages : sept Genshin (alors que la sous-liste en annonce huit), huit HSR et cinq Wuthering Waves. Aucun nom n’a été ajouté par déduction.
- **eternal** : 8/17 illustrées — à fournir : Mitya, Capitano, Hysilens, Evernight, Obsidian, Ashveil, Robin, Aha (forme Nihilux), The Herta.
- **astral** : 11/20 illustrées — à fournir : Sandrone, Varka, Kafka, Castorice, Aglaea, Sunday, Cyrene, Jing Yuan, Seele.
- **legend** : 23/30 illustrées — à fournir : Firefly, Sparkle, Blade, Jingliu, Black Swan, Ruan Mei, Silver Wolf.
- **gold** : 14/22 illustrées — à fournir : Huohuo, Feixiao, The Herta, Fugue, Luocha, Jade, Boothill, Dr. Ratio.
- **secret** : 13/20 illustrées — à fournir : Rhinedottir, Argenti, Moze, Rappa, Anaxa, Yunli, Topaz & Numby.
- **full** : 46/90 illustrées — à fournir : Himeko, Welt, Bronya, Serval, Gepard, Clara, Bailu, Yanqing, Sampo, Hook, Pela, Natasha, Qingque, Tingyun, Luka, Sushang, Arlan, Asta, Herta, Dan Heng, March 7th, Trailblazer, Yukong, Dan Heng • Imbibitor Lunae, Guinaifen, Misha, Jiaoqiu, Lingsha, Gallagher, Tribbie, Hyacine, Cipher, Xueyi, Hanya, Lynx, Rover (Spectro), Rover (Havoc), Rover (Aero), Chixia, Baizhi, Sanhua, Danjin, Taoqi, Mortefi.

Kits officiels absents pour 8 des cartes de ce roster (personnages de lore, personnages récents ou variantes sans fiche de combat publiée) :

- `gi:capitano`
- `gi:istaroth`
- `gi:mitya`
- `gi:rhinedottir`
- `gi:ronova`
- `hsr:aha`
- `hsr:obsidian`
- `hsr:trailblazer`

## Provenance à confirmer

346 fichiers ont une archive communautaire comme URL de référence et nécessitent une correspondance avec une publication primaire. 646 fichiers ont été reliés à une pièce jointe HoYoLAB officielle; 67 à une publication Kuro officielle. Les anciennes entrées sans URL primaire prouvée restent signalées ici.
Le contrôle colorimétrique a écarté les images en niveaux de gris détectées. 235 exclusion(s) noir et blanc sont consignées dans cet audit.

## Kits de personnages

290 kits réels en cache. Kits non obtenus (dont personnages de lore et Aeons non jouables) :

- `gi:aether`
- `gi:capitano`
- `gi:istaroth`
- `gi:lumine`
- `gi:manekin`
- `gi:manekina`
- `gi:mitya`
- `gi:rhinedottir`
- `gi:ronova`
- `hsr:aha`
- `hsr:akivili`
- `hsr:archer`
- `hsr:fuli`
- `hsr:gilgamesh`
- `hsr:ix`
- `hsr:lan`
- `hsr:nanook`
- `hsr:nous`
- `hsr:obsidian`
- `hsr:qlipoth`
- `hsr:rin-tohsaka`
- `hsr:saber`
- `hsr:trailblazer`
- `hsr:xipe`
- `hsr:yaoshi`
