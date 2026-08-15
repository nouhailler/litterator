# Littérator

> Explorer la littérature française depuis 1800 avec une PWA éditoriale, visuelle et installable.

![React](https://img.shields.io/badge/React-19-6f1d1b?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-b8893b?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-2f6f5e?style=for-the-badge)
![OpenLibrary](https://img.shields.io/badge/OpenLibrary-liens%20lecture-2563eb?style=for-the-badge)
![Gutenberg](https://img.shields.io/badge/Project%20Gutenberg-textes%20libres-607d8b?style=for-the-badge)

![Accueil de Littérator](litterator-pwa/public/screenshots/home.png)

## Aperçu

Littérator rassemble mouvements, auteurs, œuvres, lieux et notions littéraires dans une interface de consultation rapide. L'application permet de naviguer entre les fiches, situer les périodes sur une frise, explorer une carte littéraire, ouvrir des textes libres de droit et consulter des repères encyclopédiques sur les auteurs.

## Captures

| Bibliothèque | Auteurs |
| --- | --- |
| ![Page des œuvres](litterator-pwa/public/screenshots/works.png) | ![Page des auteurs](litterator-pwa/public/screenshots/authors.png) |

| Carte littéraire |
| --- |
| ![Carte littéraire](litterator-pwa/public/screenshots/map.png) |

## Fonctionnalités

| Module | Ce que l'on peut faire |
| --- | --- |
| 🕰️ Frise | Situer les mouvements, auteurs, œuvres et événements dans le temps. |
| 🗺️ Carte | Explorer les 125 lieux littéraires et biographiques géocodés. |
| 📚 Œuvres | Filtrer 760 œuvres par mouvement, genre, auteur, recherche texte ou disponibilité d'un texte libre. |
| 🔗 Lecture | Ouvrir les textes libres de droit disponibles sur Open Library ou Project Gutenberg. |
| ✍️ Auteurs | Parcourir 380 fiches biographiques avec portraits, citations, œuvres liées et lien direct Wikipédia. |
| 🧭 Mouvements | Comprendre 34 courants avec influences, thèmes, auteurs et œuvres clés. |
| 🧠 Glossaire | Consulter 224 notions pour l'analyse littéraire. |
| 🎬 Adaptations | Identifier les adaptations connues des œuvres quand elles sont documentées. |
| ℹ️ À propos | Afficher nom de l'application, version, auteur, liens, crédits et support. |
| 📱 PWA | Installer l'application et utiliser les données locales précachées. |

## Corpus

| Données | Volume |
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

Les liens de lecture sont ajoutés uniquement pour les œuvres dont l'auteur est entré dans le domaine public selon la règle générale vie + 70 ans, et uniquement lorsqu'une correspondance exploitable a été trouvée sur Open Library ou Project Gutenberg.

Les biographies d'auteurs évitent les classements subjectifs de type `premier plan`, `second plan` ou `troisième plan`. Chaque fiche auteur propose un bouton `Wikipédia` sous forme de lien HTML direct vers la page Wikipédia de l'auteur.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | React 19 |
| Build | Vite 8 |
| PWA | vite-plugin-pwa + Workbox |
| Carte | Leaflet + React Leaflet |
| Données | JSON local dans `litterator-pwa/public/data/` |
| Qualité | Oxlint |

## Démarrage

```bash
cd litterator-pwa
npm install
npm run dev
```

L'application est disponible sur :

```text
http://localhost:3000
```

Build production :

```bash
npm run build
npm run preview
```

## Structure

```text
litterator/
├── README.md
└── litterator-pwa/
    ├── public/
    │   ├── data/          # Corpus JSON
    │   ├── icons/         # Icônes PWA
    │   └── screenshots/   # Captures du README
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── styles/
    │   └── utils/
    └── package.json
```

## Scripts

| Commande | Usage |
| --- | --- |
| `npm run dev` | Lance le serveur local Vite. |
| `npm run build` | Génère le build de production. |
| `npm run preview` | Sert le build de production en local. |
| `npm run lint` | Lance Oxlint. |

## Données

Le corpus est éditable directement dans les fichiers JSON :

```text
litterator-pwa/public/data/authors.json
litterator-pwa/public/data/works.json
litterator-pwa/public/data/movements.json
litterator-pwa/public/data/locations.json
litterator-pwa/public/data/place-coordinates.json
litterator-pwa/public/data/glossary.json
```

## Sources et attributions

- Les liens de lecture proviennent d'Open Library et de Project Gutenberg.
- Les liens Wikipédia des auteurs pointent vers les pages Wikipédia en français, avec corrections explicites pour les noms ambigus.
- Les adaptations sont liées à Wikidata quand une fiche structurée existe.
- Les coordonnées biographiques s'appuient sur Wikidata/Wikipedia et des données locales.
- Les attributions d'images connues sont documentées dans [`litterator-pwa/public/images/ATTRIBUTIONS.md`](litterator-pwa/public/images/ATTRIBUTIONS.md).

## À propos et support

Le menu `À propos` expose les informations essentielles de l'application : nom, version ou SHA de commit, auteur/développeur Patrick Nouhailler, entité swinux.ch, liens GitHub, README, changelog, portfolio, crédits open-source et contacts de support.

- Dépôt source : <https://github.com/nouhailler/litterator>
- Documentation : <https://github.com/nouhailler/litterator#readme>
- Changelog : <https://github.com/nouhailler/litterator/blob/main/litterator-pwa/CHANGELOG.md>
- Portfolio : <https://swinux.ch/applications/>
- Issues développeurs : <https://github.com/nouhailler/litterator/issues/new>
