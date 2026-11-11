# Quoi de neuf — validation

`changelog.json` alimente un module distinct du journal des données de jeu existant. Les nouveautés sont accessibles depuis la barre supérieure pour tous les jeux. Une annonce non modale est proposée après démarrage lorsqu’une entrée n’a pas encore été lue ; elle ne bloque pas les actions en cours. La fenêtre est réouvrable à tout moment, utilisable au clavier et conserve la mémoire de lecture par identifiant.

Le contenu précise aussi les travaux encore ouverts. Le fichier et le module entrent dans le cache du service worker. Un chargement indisponible affiche un repli lisible sans bloquer l’application. La documentation de maintenance est dans `NOUVEAUTES.md`.

217 tests unitaires réussis ; `tests/release_notes_browser.py` réussi : annonce, ouverture, Escape, mémorisation, réouverture, retour du focus, largeur mobile et repli réseau. Les entrées invalides et identifiants répétés sont filtrés. Cette livraison ne prétend pas résoudre le journal exhaustif de toutes les données des trois jeux.

`tests/pwa_browser.py` réussi : lancement WebKit mobile et rechargement hors ligne Chromium avec le cache v101.
