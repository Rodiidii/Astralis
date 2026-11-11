# Calendrier et récoltes — vérification du 11 novembre 2026

Plusieurs corrections livrées ensemble :

1. Les sessions mixtes EXP/artéfacts + hebdomadaire conservent les icônes des deux activités, dans le calendrier comme dans la liste. Les spécialités locales et couronnes sont exclues des icônes à résine. Les IDs numériques de personnages sont résolus aussi.
2. Chaque jour dispose d’un bouton accessible au clavier ouvrant toutes les sessions, les personnages, les matériaux et la résine hebdomadaire. Le bouton de planification remplit la date du formulaire. La fermeture remet le focus sur le jour.
3. Les récoltes s’affichent en fiches avec image locale, besoin restant, capacité par passage, passages cumulés, date estimée et lien source officiel. Le premier passage et la repousse de 48 h sont explicites. Une capacité inconnue ne reçoit pas de date.

Validation : 202 tests unitaires réussis, dont trois nouveaux tests de présentation des sessions ; `tests/farm_workshop_browser.py` réussi avec ouverture/fermeture d’une journée, fiches de récolte, talents, inventaire, calendrier, priorité, mobile et PNG téléchargé identique à l’aperçu avec presse-papiers. La liste reste pliée par défaut et les dates de talents/fin gardent leurs repères visuels.

Le registre des capacités existantes reste sourcé dans `data/local-specialties.json`. Cette passe améliore leur présentation mais ne prétend pas certifier l’exhaustivité de tous les personnages futurs. L’audit complet des spécialités reste ouvert.

`tests/pwa_browser.py` : manifeste, lancement WebKit mobile et rechargement hors ligne Chromium réussis avec le cache v96.
