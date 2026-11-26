# Atelier de préparation · 1.0.60

Le tableau de bord réunit le journal des gains, les sessions réellement planifiées, les stocks des projets actifs, les fiches PNG issues des builds enregistrés, les objectifs et les compositions endgame publiées.

Les gains utilisent le même solde et le même historique que Vœux & objectifs. Les quotidiennes et la Faveur peuvent être enregistrées séparément, annulées et corrigées. Les étapes d’un objectif sont celles de Tâches & objectifs. L’export ICS contient les sessions restantes et les resets connus ; il ne crée pas de farm fictif.

Les prochaines compositions apparaissent uniquement si elles sont publiées et datées. Autrement, les rencontres du cycle en cours sont explicitement indiquées comme telles. Le flux public est actualisé par GitHub Actions toutes les quatre heures ; InfinityFree le relit avec un cache de cinq minutes et conserve un relevé de secours. La synchronisation des fiches personnalisées et des retours privés reste indépendante, à trente secondes.

Les anciennes icônes SVG du menu et des contrôles sont rétablies. Sur téléphone, le solde reste visible dans une seconde ligne de la barre supérieure, sauf si le joueur a choisi de masquer les ressources.

Validation : tests de calcul et de journal, services PHP isolés, chargement du dossier InfinityFree, parcours navigateur avec profils jetables, vrais fichiers PNG et ICS, contrôles de largeur 320, 360, 390, 430, 768, 844 paysage, 1024, 1366, 1536 et 1920 pixels. Les sauvegardes du propriétaire ne servent pas aux essais.
