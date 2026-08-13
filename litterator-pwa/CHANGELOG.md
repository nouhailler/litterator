# Changelog

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

