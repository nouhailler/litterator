# Contexte Projet

## Objectif

Littérator est une PWA React/Vite dédiée à l'exploration de la littérature française depuis 1800. L'application met en relation mouvements littéraires, auteurs, œuvres, notions de glossaire, timeline, lieux biographiques, liens de lecture libre et repères encyclopédiques.

## Données

Les données principales sont locales et servies depuis `public/data/` :

| Fichier | Rôle |
| --- | --- |
| `authors.json` | 380 auteurs, portraits quand une image libre fiable existe, biographies sans hiérarchie subjective, lieux, citations et relations. |
| `works.json` | 760 œuvres liées aux auteurs via `author`, avec couvertures libres quand elles sont disponibles, couvertures typographiques générées sinon, liens de lecture, extraits et adaptations. |
| `movements.json` | 34 mouvements littéraires avec thèmes, influences, auteurs et œuvres clés. |
| `glossary.json` | 224 entrées de glossaire complétées. |
| `locations.json` | Lieux littéraires éditoriaux. |
| `place-coordinates.json` | Coordonnées de lieux biographiques, enrichies depuis Wikidata. |

Les corpus complémentaires et angles morts sont intégrés dans les mêmes fichiers applicatifs que le corpus initial. Les identifiants doivent rester uniques car ils servent aux liens profonds, aux relations auteurs-œuvres et aux entrées de mouvements.

La page d'accueil affiche un résumé du corpus local. Ses compteurs doivent rester alignés avec `authors.json`, `works.json`, `movements.json`, `locations.json` et `place-coordinates.json`. Le compteur de carte correspond aux 8 lieux éditoriaux plus les 117 lieux biographiques géocodés, soit 125 lieux affichables.

Volumes actuels à conserver synchronisés :

| Donnée | Volume |
| --- | ---: |
| Mouvements littéraires | 34 |
| Auteurs | 380 |
| Œuvres | 760 |
| Œuvres avec lien de lecture externe | 177 |
| Liens de lecture vérifiés | 255 |
| Œuvres avec extrait documenté | 11 |
| Extraits documentés | 23 |
| Œuvres avec adaptation documentée | 154 |
| Adaptations documentées | 333 |
| Entrées de glossaire | 224 |
| Lieux littéraires éditoriaux | 8 |
| Lieux biographiques géocodés | 117 |
| Lieux affichables sur la carte | 125 |

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

## Auteurs

Les biographies ne doivent pas utiliser de classement contestable comme `premier plan`, `second plan` ou `troisième plan`. La formulation attendue est du type `est un auteur de la littérature française`.

Sur l'écran auteurs, les portraits et initiales ouvrent une fenêtre modale Wikipédia. Le contenu affiché est construit en Markdown depuis l'API publique Wikipédia en français, avec un résumé, les repères de naissance/décès issus de la fiche locale et un lien vers la page source.

## Œuvres, Textes Libres Et Adaptations

Les liens vers des textes libres de droit sont stockés dans `works.json` sous `externalLinks`. Les sources autorisées déjà utilisées sont Open Library et Project Gutenberg. Les liens sont ajoutés uniquement quand une correspondance exploitable existe et que le statut domaine public est prudent selon la règle générale vie + 70 ans.

L'écran `Œuvres de la littérature française` doit conserver le filtre `Texte libre` afin de trier ou isoler les œuvres qui possèdent au moins un lien dans `externalLinks`.

Le bloc `Extraits` s'appuie sur `excerpts`. Il doit rester visible et utile pour les œuvres qui ont un lien de lecture libre et des extraits documentés.

Les adaptations sont stockées dans `adaptations`, avec au minimum un type, un titre et, si possible, une année et un lien Wikidata.

## À Propos

Le menu `À propos` doit exposer les informations essentielles :

- nom de l'application et logo ;
- version issue de `package.json` ou SHA injecté par `VITE_COMMIT_SHA` ;
- auteur/développeur : Patrick Nouhailler, entité swinux.ch ;
- description courte de la promesse de l'application ;
- dépôt GitHub, README comme documentation, changelog et portfolio <https://swinux.ch/applications/> ;
- licence si elle est explicitement présente dans le dépôt ;
- crédits open-source majeurs : React, Vite, vite-plugin-pwa, Workbox, Leaflet, React Leaflet, OpenStreetMap, CARTO, Wikimedia Commons, Wikidata, Open Library, Project Gutenberg ;
- contact utilisateur par e-mail ;
- tracker développeur : <https://github.com/nouhailler/litterator/issues/new>.

## Mise À Jour PWA

La page `Paramètres` expose un onglet `Mise à jour`. Son bouton doit rester disponible pour les usages mobiles après un déploiement Netlify.

Le flux attendu :

- vérifier l'enregistrement du service worker ;
- activer un service worker en attente si une version est déjà détectée ;
- vider les caches locaux de l'origine ;
- désenregistrer l'ancien service worker si nécessaire ;
- recharger l'application pour récupérer les derniers fichiers publiés.

La logique est centralisée dans `src/utils/pwaUpdate.js`. Le service worker est enregistré depuis `src/main.jsx` via `registerAppServiceWorker()`.

## Sources Et Attributions

- Les portraits distants viennent de Wikimedia Commons via Wikidata.
- Les images libres du corpus de second plan viennent de Wikimedia Commons ou de fichiers libres exposés par Wikipédia en tant que `page_image_free`.
- Les coordonnées de lieux biographiques viennent de Wikidata, base structurée liée à Wikipédia.
- Les résumés Wikipédia des auteurs sont chargés depuis l'API publique de Wikipédia en français.
- Les liens de lecture proviennent d'Open Library et de Project Gutenberg.
- Les adaptations connues sont liées à Wikidata quand une fiche structurée existe.
- Les couvertures SVG typographiques sont générées localement et ne reproduisent pas de jaquette commerciale.
- Les attributions sont maintenues dans `public/images/ATTRIBUTIONS.md`.

## Validation

Commandes de référence :

```bash
npm run lint
npm run build
```
