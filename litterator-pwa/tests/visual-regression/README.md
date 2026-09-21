# Références visuelles

Accueil et catalogue `/works?author=chateaubriand`, à 375, 768 et 1440 px, en clair et sombre : 12 PNG pleine page, vérifiés visuellement.

Environnement de référence : Linux Debian 13, Chromium 152.0.7977.82, Node 22. Les captures chargent explicitement DejaVu Sans et Liberation Serif (normal et gras) depuis `tests/fixtures/fonts/`, avec leurs licences. Le chargement des quatre fontes est vérifié avant la capture. Ces fichiers restent réservés aux tests et ne sont pas embarqués dans la PWA. Les images distantes et les tuiles sont bloquées ; le service worker est désactivé uniquement pour la comparaison visuelle. Une recette distincte active le vrai service worker et vérifie le catalogue après rechargement hors connexion, ainsi que l’indisponibilité réelle d’une ressource non précachée.

Une modification des polices système avait remplacé DejaVu Sans par Noto Sans et réduit l’accueil mobile de 54 px en changeant les retours à la ligne. Les fontes explicites restaurent les références existantes sans modifier les PNG, le seuil de comparaison ou la mise en page de production.

`npm run test:e2e` compare les captures aux PNG conservés ici. `npm run test:visual:update` remplace les références : inspecter les nouvelles images avant de valider la modification. Le seuil de différence maximal est de 0,3 %, avec une sensibilité pixelmatch de 0,1. Ne pas régénérer les références uniquement pour faire disparaître une erreur inexpliquée.

Les captures actuelles, différences et diagnostics sont disponibles dans `test-results/visual/` (non versionné).
