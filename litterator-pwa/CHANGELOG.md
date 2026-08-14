# Changelog

## 2026-08-14

### Ajouté

- Intégration d'un corpus de 80 auteurs `angles morts`.
- Intégration de 160 œuvres `angles morts` liées aux auteurs via `author`.
- Ajout des mouvements manquants nécessaires au corpus `angles morts` : Fantasy, Philosophie, Postmodernisme, Déconstruction, Féminisme et Humour.
- Intégration d'un corpus de 100 auteurs de troisième plan.
- Intégration de 200 œuvres de troisième plan liées aux auteurs via `author`.
- Ajout des mouvements manquants nécessaires au corpus de troisième plan : Chanson, Aventures, Jeunesse et Bande dessinée.
- Intégration d'un corpus de 100 auteurs de second plan.
- Intégration de 200 œuvres de second plan liées aux auteurs via `author`.
- Ajout des mouvements manquants nécessaires au corpus de second plan : Fantastique, Vaudeville, Policier, Dadaïsme et Science-fiction.
- Ajout de 95 portraits libres pour les auteurs du corpus de second plan.
- Ajout de 29 images libres d'œuvres lorsque la source Commons/Wikipédia est clairement exploitable.
- Ajout des crédits et licences correspondants dans `public/images/ATTRIBUTIONS.md`.

### Modifié

- Ajout d'un cache PWA dédié aux portraits Wikimedia Commons pour éviter de recharger les images des auteurs à chaque ouverture.
- Extension des relations `key_authors` et `key_works` des mouvements existants avec les nouveaux auteurs et œuvres.
- Conservation de couvertures typographiques générées pour les œuvres sans image libre fiable.
- Mise à jour des volumes documentés du corpus : 380 auteurs, 760 œuvres et 34 mouvements.

### Corrigé

- Correction des compteurs du corpus affichés sur la page d'accueil.
- Résolution de la collision d'identifiant `les-champs-magnetiques` en conservant l'entrée initiale et en utilisant `les-champs-magnetiques-soupault` pour l'œuvre de Soupault.
- Reconstitution de la fin tronquée du corpus d'œuvres de troisième plan à partir des auteurs restants, afin de conserver le total attendu de 200 œuvres.

## 2026-08-13

### Ajouté

- Ajout d'un corpus de 100 auteurs de premier plan.
- Ajout d'un corpus de 200 œuvres de premier plan liées aux auteurs.
- Ajout de 19 fiches de mouvements littéraires français.
- Ajout de 224 entrées de glossaire complétées.
- Ajout de `place-coordinates.json` avec 117 lieux biographiques géocodés.
- Ajout de portraits libres ou issus de Wikimedia Commons pour les auteurs.
- Ajout de couvertures typographiques SVG générées localement pour les œuvres sans visuel.
- Ajout de la navigation directe par hash vers auteurs, œuvres, mouvements, timeline et carte.

### Modifié

- Refonte de la page Mouvements avec accordéons pour `Auteurs majeurs` et `Œuvres clés`.
- Uniformisation des couleurs de cadres et accents visuels des fiches.
- Refonte de la timeline avec échelle adaptative selon les filtres actifs.
- Ajout du zoom, du déplacement gauche/droite et du glissement horizontal sur la timeline.
- Regroupement des informations de timeline par catégories avec accordéons.
- Remplacement du fond de carte OpenStreetMap direct par CARTO `light_all`.
- Enrichissement des lieux biographiques des auteurs depuis Wikidata/Wikipedia.
- Masquage des liens carte pour les lieux trop génériques comme `France`.
- Mise à jour de la page d'accueil avec les nouveaux volumes de corpus.

### Corrigé

- Correction du recentrage timeline qui revenait toujours vers l'ancre active pendant le zoom.
- Correction des clics sur les points de timeline interceptés par le glissement.
- Correction du chargement prioritaire des portraits quand on arrive directement sur une fiche auteur.
- Correction des liens `Voir sur la carte` pour utiliser des slugs de lieux stables.
- Correction de l'affichage de la carte quand le fournisseur de tuiles OSM bloque les requêtes.
- Correction des anciennes références d'identifiants dans les données de glossaire et lieux.
