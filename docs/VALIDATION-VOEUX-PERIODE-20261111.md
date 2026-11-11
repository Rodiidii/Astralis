# Vœux et revenus de période

204 tests unitaires réussis. `tests/wallet-period.test.mjs` vérifie la formule destinées + floor(primos/160), les restes, la priorité d’un solde explicitement nul sur une ancienne valeur, les nombres invalides et le crédit quotidien historisé une seule fois.

La période du 4 novembre au 16 décembre 2026 est testée sur les échéances demandées : commissions/Faveur, deux débuts de versions, J7, J20, dimanches, mercredi J35, codes le 4 décembre, boutique/théâtre le 1er et abysses le 16, exploration et ajouts personnels. Le tableau par origine s’additionne exactement aux primogemmes et vœux du résultat. Les scénarios de cartes/cadeaux restent personnels, visibles et désactivables ; les totaux sont transférables au budget théorique.

Le parcours `tests/rest_workshop_browser.py` vérifie les champs de solde, l’ajout des gains, le refus du deuxième clic quotidien, le reset mensuel, les journaux et comparaisons ainsi que les cases des scénarios. Les corrections de solde sont exclues des gains. Le nouveau tableau décompose le budget par source. Les règles de revenus sont celles du scénario explicitement demandé, pas une certification d’annonces futures du jeu.

Les calculs probabilistes de tous les scénarios et la Capture de radiance restent un chantier distinct ; cette validation ne clôture pas RESTE-047/048.
