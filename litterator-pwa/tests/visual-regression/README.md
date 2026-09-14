# Références visuelles

Accueil et catalogue `/works?author=chateaubriand`, à 375, 768 et 1440 px, en clair et sombre : 12 PNG pleine page, vérifiés visuellement.

Environnement de référence : Linux Debian 13, Chromium 152.0.7977.82, Node 22. Les polices sont celles définies par les feuilles de style de l’application. Les images distantes et les tuiles sont bloquées ; le service worker est désactivé uniquement pour la comparaison visuelle. Une recette distincte active le vrai service worker et vérifie le catalogue après rechargement hors connexion, ainsi que l’indisponibilité réelle d’une ressource non précachée.

`npm run test:e2e` compare les captures aux PNG conservés ici. `npm run test:visual:update` remplace les références : inspecter les nouvelles images avant de valider la modification. Le seuil de différence maximal est de 0,3 %, avec une sensibilité pixelmatch de 0,1. Ne pas régénérer les références uniquement pour faire disparaître une erreur inexpliquée.

Les captures actuelles, différences et diagnostics sont disponibles dans `test-results/visual/` (non versionné).
