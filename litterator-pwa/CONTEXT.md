# Contexte Projet

## Objectif

Littérator est une PWA React/Vite dédiée à l'exploration de la littérature française depuis 1800. L'application met en relation mouvements littéraires, auteurs, œuvres, notions de glossaire, timeline et lieux biographiques.

## Données

Les données principales sont locales et servies depuis `public/data/` :

| Fichier | Rôle |
| --- | --- |
| `authors.json` | 300 auteurs de premier, second et troisième plan, portraits quand une image libre fiable existe, biographies, lieux, citations et relations. |
| `works.json` | 600 œuvres liées aux auteurs via `author`, avec couvertures libres quand elles sont disponibles et couvertures typographiques générées sinon. |
| `movements.json` | 28 mouvements littéraires avec thèmes, influences, auteurs et œuvres clés. |
| `glossary.json` | 224 entrées de glossaire complétées. |
| `locations.json` | Lieux littéraires éditoriaux. |
| `place-coordinates.json` | Coordonnées de lieux biographiques, enrichies depuis Wikidata. |

Les corpus de second et troisième plan sont intégrés dans les mêmes fichiers applicatifs que le corpus initial. Les identifiants doivent rester uniques car ils servent aux liens profonds, aux relations auteurs-œuvres et aux entrées de mouvements.

## Navigation

Les fiches sont adressables par hash. Les liens doivent pointer directement vers l'entité cible, pas seulement vers l'écran :

| Cible | Format |
| --- | --- |
| Auteur | `/authors#id-auteur` |
| Œuvre | `/works#id-oeuvre` |
| Mouvement | `/movements#id-mouvement` |
| Timeline | `/timeline#movement-id`, `/timeline#work-id`, `/timeline#author-birth-id` |
| Carte | `/map#slug-lieu` |

`src/utils/hashNavigation.js` gère le décodage et le scroll vers les fiches. `src/utils/locationIds.js` gère la génération de slugs de lieux.

## Timeline

La timeline utilise les années réellement retournées par les filtres. Elle ne projette plus les points sur une échelle fixe 1800-aujourd'hui.

Fonctions attendues :

- navigation gauche/droite ;
- zoom avant/arrière sans recentrage intempestif ;
- glissement horizontal ;
- points d'une couleur unique ;
- affichage au survol ou au clic des mouvements, auteurs, œuvres et événements de l'année ;
- accordéons par catégorie si le volume est important ;
- recentrage et surbrillance quand on arrive depuis un lien `Voir sur la timeline`.

## Carte

La carte utilise Leaflet avec un fond CARTO `light_all`, car les tuiles directes OpenStreetMap peuvent être bloquées. Les coordonnées de lieux biographiques viennent de `place-coordinates.json`.

Les lieux génériques comme `France` ne doivent pas être géolocalisés. Un bouton `Voir sur la carte` ne doit apparaître que si l'auteur possède un lieu précis.

## Sources Et Attributions

- Les portraits distants viennent de Wikimedia Commons via Wikidata.
- Les images libres du corpus de second plan viennent de Wikimedia Commons ou de fichiers libres exposés par Wikipédia en tant que `page_image_free`.
- Les coordonnées de lieux biographiques viennent de Wikidata, base structurée liée à Wikipédia.
- Les couvertures SVG typographiques sont générées localement et ne reproduisent pas de jaquette commerciale.
- Les attributions sont maintenues dans `public/images/ATTRIBUTIONS.md`.

## Validation

Commandes de référence :

```bash
npm run lint
npm run build
```
