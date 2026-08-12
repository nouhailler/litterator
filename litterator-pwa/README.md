# Littérator

> PWA éditoriale pour explorer la littérature française depuis 1800.

![React](https://img.shields.io/badge/React-19-6f1d1b?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-b8893b?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-installable-2f6f5e?style=for-the-badge)
![Offline](https://img.shields.io/badge/Données-locales-251b14?style=for-the-badge)

![Aperçu de Littérator](public/screenshots/home.png)

## Pourquoi Littérator ?

Littérator rassemble mouvements, auteurs, œuvres et lieux littéraires dans une interface claire, installable et utilisable comme une application. Le projet met l'accent sur la consultation rapide, la navigation chronologique et la découverte géographique.

## Aperçus

| Œuvres | Auteurs |
| --- | --- |
| ![Écran des œuvres](public/screenshots/works.png) | ![Écran des auteurs](public/screenshots/authors.png) |

| Carte littéraire |
| --- |
| ![Carte littéraire](public/screenshots/map.png) |

## Fonctionnalités

| Icône | Module | Description |
| --- | --- | --- |
| ⏳ | Frise chronologique | Situer mouvements, œuvres, auteurs et événements historiques de 1800 à aujourd'hui. |
| 🗺️ | Carte littéraire | Explorer les lieux liés aux auteurs, œuvres et mouvements avec Leaflet. |
| 📚 | Œuvres | Parcourir les œuvres, thèmes, extraits et adaptations. |
| ✒️ | Auteurs | Consulter biographies, œuvres principales, citations et repères. |
| 🏛️ | Mouvements | Comprendre les courants littéraires, leurs influences et leurs textes clés. |
| 📱 | PWA | Installer l'application sur desktop ou mobile, avec données locales précachées. |

## Corpus inclus

| Type | Volume |
| --- | ---: |
| Mouvements littéraires | 8 |
| Auteurs | 8 |
| Œuvres | 11 |
| Lieux littéraires | 8 |

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | React 19 |
| Build | Vite |
| PWA | vite-plugin-pwa + Workbox |
| Carte | Leaflet + React Leaflet |
| Données | JSON local dans `public/data/` |
| UI | CSS custom, variables de thème, Grid/Flexbox |

## Démarrage

```bash
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

## Installation PWA

1. Ouvrir Littérator dans Chrome, Edge ou un navigateur compatible PWA.
2. Cliquer sur l'action d'installation dans la barre d'adresse ou le menu du navigateur.
3. L'application s'installe avec son icône dédiée et se lance en mode autonome.

Les icônes PWA sont dans `public/icons/` et déclarées dans `public/manifest.json` ainsi que dans la configuration `vite-plugin-pwa`.

## Structure

```text
litterator-pwa/
├── public/
│   ├── data/             # Corpus JSON
│   ├── icons/            # Icônes PWA
│   ├── screenshots/      # Captures utilisées dans ce README
│   └── manifest.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Scripts

| Commande | Usage |
| --- | --- |
| `npm run dev` | Lance le serveur local. |
| `npm run build` | Génère la version production dans `dist/`. |
| `npm run preview` | Prévisualise le build production. |
| `npm run lint` | Lance Oxlint. |

## Personnaliser le corpus

Les données sont éditables directement en JSON :

```text
public/data/movements.json
public/data/authors.json
public/data/works.json
public/data/locations.json
```

Après modification :

```bash
npm run build
```

## Design

La direction visuelle utilise une palette éditoriale unique :

- bordeaux pour l'identité et les actions principales ;
- ivoire pour les surfaces ;
- encre sombre pour le texte ;
- accent doré discret pour les détails.

Les variables sont centralisées dans `src/styles/global.css`.
