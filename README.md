# Litterator

> Explorer la littérature française depuis 1800 avec une PWA éditoriale, visuelle et installable.

![React](https://img.shields.io/badge/React-19-6f1d1b?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-b8893b?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-2f6f5e?style=for-the-badge)
![OpenLibrary](https://img.shields.io/badge/OpenLibrary-liens%20lecture-2563eb?style=for-the-badge)
![Gutenberg](https://img.shields.io/badge/Project%20Gutenberg-textes%20libres-607d8b?style=for-the-badge)

![Accueil de Litterator](litterator-pwa/public/screenshots/home.png)

## Apercu

Litterator rassemble mouvements, auteurs, oeuvres, lieux et notions litteraires dans une interface de consultation rapide. L'application est concue pour naviguer entre les fiches, situer les periodes sur une frise, explorer une carte litteraire et ouvrir les textes libres de droit quand une source fiable est disponible.

## Captures

| Bibliotheque | Auteurs |
| --- | --- |
| ![Page des oeuvres](litterator-pwa/public/screenshots/works.png) | ![Page des auteurs](litterator-pwa/public/screenshots/authors.png) |

| Carte litteraire |
| --- |
| ![Carte litteraire](litterator-pwa/public/screenshots/map.png) |

## Fonctionnalites

| Module | Ce que l'on peut faire |
| --- | --- |
| 🕰️ Frise | Situer les mouvements, auteurs, oeuvres et evenements dans le temps. |
| 🗺️ Carte | Explorer les lieux litteraires et biographiques geocodes. |
| 📚 Oeuvres | Filtrer 760 oeuvres par mouvement, genre, auteur ou recherche texte. |
| 🔗 Lecture | Ouvrir les textes libres de droit disponibles sur Open Library ou Project Gutenberg. |
| ✍️ Auteurs | Parcourir 380 fiches biographiques avec portraits, citations et oeuvres liees. |
| 🧭 Mouvements | Comprendre 34 courants avec influences, themes, auteurs et oeuvres cles. |
| 🧠 Glossaire | Consulter 224 notions pour l'analyse litteraire. |
| 📱 PWA | Installer l'application et utiliser les donnees locales precachees. |

## Corpus

| Donnees | Volume |
| --- | ---: |
| Mouvements litteraires | 34 |
| Auteurs | 380 |
| Oeuvres | 760 |
| Oeuvres avec lien de lecture externe | 177 |
| Liens de lecture verifies | 255 |
| Entrees de glossaire | 224 |
| Lieux litteraires editoriaux | 8 |
| Lieux biographiques geocodes | 117 |

Les liens de lecture sont ajoutes uniquement pour les oeuvres dont l'auteur est entre dans le domaine public selon la regle generale vie + 70 ans, et uniquement lorsqu'une correspondance exploitable a ete trouvee sur Open Library ou Project Gutenberg.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | React 19 |
| Build | Vite 8 |
| PWA | vite-plugin-pwa + Workbox |
| Carte | Leaflet + React Leaflet |
| Donnees | JSON local dans `litterator-pwa/public/data/` |
| Qualite | Oxlint |

## Demarrage

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
    │   ├── icons/         # Icones PWA
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
| `npm run build` | Genere le build de production. |
| `npm run preview` | Sert le build de production en local. |
| `npm run lint` | Lance Oxlint. |

## Donnees

Le corpus est editable directement dans les fichiers JSON :

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
- Les coordonnees biographiques s'appuient sur Wikidata/Wikipedia et des donnees locales.
- Les attributions d'images connues sont documentees dans [`litterator-pwa/public/images/ATTRIBUTIONS.md`](litterator-pwa/public/images/ATTRIBUTIONS.md).
