# Littérator

> PWA éditoriale pour explorer la littérature française depuis 1800.

![React](https://img.shields.io/badge/React-19-6f1d1b?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-b8893b?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-installable-2f6f5e?style=for-the-badge)
![Offline](https://img.shields.io/badge/Données-locales-251b14?style=for-the-badge)
![Lecture](https://img.shields.io/badge/Liens-OpenLibrary%20%2B%20Gutenberg-2563eb?style=for-the-badge)

![Aperçu de Littérator](public/screenshots/home.png)

## Pourquoi Littérator ?

Littérator rassemble mouvements, auteurs, œuvres, notions de glossaire et lieux littéraires dans une interface claire, installable et utilisable comme une application. Le projet met l'accent sur la consultation rapide, la navigation chronologique, les liens directs entre fiches et la découverte géographique.

Les dernières fiches enrichies ajoutent aussi des liens vers les textes libres de droit, des extraits documentés, des adaptations connues et un lien Wikipédia direct sur chaque fiche auteur.

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
| Chronologie | Frise chronologique | Situer mouvements, œuvres, auteurs et événements historiques avec navigation horizontale, zoom et panneaux détaillés par année. |
| Carte | Carte littéraire | Explorer les 125 lieux liés aux auteurs, œuvres et mouvements avec Leaflet et un fond CARTO. |
| Œuvres | Fiches œuvres | Parcourir les œuvres, leurs auteurs, genres, mouvements, visuels, liens de lecture, extraits et adaptations. |
| Auteurs | Fiches biographiques | Consulter biographies, œuvres principales, citations, portraits, lieux biographiques précis et lien direct Wikipédia. |
| Mouvements | Fiches mouvements | Comprendre les courants littéraires, leurs influences, auteurs majeurs et œuvres clés en accordéons. |
| Glossaire | Notions littéraires | Rechercher les termes, procédés, genres, périodes et concepts, avec définitions complétées. |
| À propos | Informations application | Afficher nom, version ou SHA de commit, auteur, liens, crédits open-source et contacts de support. |
| Mentions légales | Avertissement et responsabilité | Afficher l’avertissement au premier lancement, puis garder les mentions légales accessibles dans l’application. |
| Mise à jour | Synchronisation PWA | Forcer la vérification du service worker, vider les caches locaux et recharger la dernière version déployée. |
| PWA | Application installable | Installer l'application sur desktop ou mobile, avec données locales précachées. |

## Corpus inclus

| Type | Volume |
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

Le corpus inclut les auteurs et œuvres de référence ainsi que des ensembles complémentaires et angles morts reliés aux mêmes filtres, fiches, mouvements et vues chronologiques.
La page d'accueil reprend ces volumes dans le bloc `Corpus local`.

Les œuvres libres de droit trouvées sur Open Library ou Project Gutenberg affichent un bloc `Lire le texte` dans leur fiche. Les liens ne sont ajoutés que lorsqu'une correspondance exploitable a été trouvée et que la date de décès de l'auteur permet une intégration prudente.

Les biographies d'auteurs évitent les classements subjectifs de type `premier plan`, `second plan` ou `troisième plan`.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | React 19 |
| Build | Vite |
| PWA | vite-plugin-pwa + Workbox |
| Carte | Leaflet + React Leaflet |
| Données | JSON local dans `public/data/` |
| UI | CSS custom, variables de thème, Grid/Flexbox |
| Sources externes | Open Library, Project Gutenberg, Wikipédia, Wikidata |

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

Après un nouveau déploiement Netlify, l'onglet `Paramètres > Mise à jour` permet de forcer la récupération de la dernière version sur mobile sans multiplier les rafraîchissements manuels.

## Avertissement et mentions légales

Au premier lancement, Littérator affiche un avertissement légal local. L’utilisateur peut consulter les détails ou valider avec `J’ai compris`. Cette validation est mémorisée uniquement dans le navigateur, sans compte utilisateur, sans serveur et sans donnée personnelle.

Stockage local utilisé :

```text
legal_notice_acknowledged=true
legal_notice_acknowledged_version=1.0
```

Les mentions complètes restent accessibles depuis `Mentions légales` dans la navigation principale, depuis `/legal`, et depuis `Paramètres > Mentions légales`.

Le contenu et la version sont centralisés dans :

```text
src/legal/legalNoticeConfig.js
```

Pour modifier le texte ou adapter le module à une autre PWA, ajuster `legalNotice`. Pour changer la version affichée, modifier `LEGAL_NOTICE_VERSION`. La logique actuelle ne réaffiche pas automatiquement l’avertissement à chaque changement de version mineur ; elle est volontairement simple et peut être durcie ultérieurement si une nouvelle acceptation devient nécessaire.

Pour tester un premier lancement en développement, ouvrir `Paramètres > Mentions légales` puis utiliser `Réinitialiser les mentions légales`. En production, ce bouton n’est pas rendu. Il est aussi possible d’effacer manuellement `legal_notice_acknowledged` et `legal_notice_acknowledged_version` dans le stockage local du navigateur.

Les champs d’identité légale non présents dans le projet restent marqués `[À COMPLÉTER]`. La politique de confidentialité n’est pas inventée ; un emplacement est prévu pour l’ajouter si nécessaire.

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
| `npm run test` | Lance les tests Node du module légal. |

## Personnaliser le corpus

Les données sont éditables directement en JSON :

```text
public/data/movements.json
public/data/authors.json
public/data/works.json
public/data/locations.json
public/data/place-coordinates.json
public/data/glossary.json
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

## Navigation Profonde

Les fiches supportent les liens directs par hash :

```text
/authors#lamartine
/works#meditations-poetiques
/movements#romantisme
/timeline#movement-parnasse
/map#macon-france
```

Les utilitaires de normalisation et de scroll sont dans `src/utils/`.

## Textes libres, extraits et adaptations

Les œuvres libres de droit utilisent le champ `externalLinks` pour afficher les sources de lecture. Le filtre `Texte libre` de l'écran `Œuvres de la littérature française` permet de remonter ces fiches directement.

Le bloc `Extraits` affiche les citations disponibles dans `excerpts`. Les adaptations sont stockées dans `adaptations` avec un type, un titre, une année et, quand elle existe, une URL Wikidata.

## À propos

Le menu `À propos` expose les informations demandées pour la distribution de l'application :

- nom de l'application et logo ;
- version issue du paquet ou SHA injecté par `VITE_COMMIT_SHA` ;
- auteur/développeur : Patrick Nouhailler, swinux.ch ;
- description courte ;
- liens GitHub, README, changelog et portfolio ;
- crédits open-source majeurs ;
- lien mailto pour les utilisateurs et tracker d'issues pour les développeurs.

## Sources

- Les portraits distants proviennent de Wikimedia Commons via Wikidata.
- Les images libres ajoutées pour le corpus de second plan proviennent de Wikimedia Commons ou de fichiers libres exposés par Wikipédia.
- Les lieux biographiques et coordonnées ajoutés proviennent de Wikidata, base structurée liée à Wikipédia.
- Les liens Wikipédia des auteurs pointent vers les pages Wikipédia en français, avec corrections explicites pour les noms ambigus.
- Les liens de lecture proviennent d'Open Library et de Project Gutenberg.
- Les adaptations connues sont liées à Wikidata quand une fiche structurée existe.
- Les attributions connues sont documentées dans `public/images/ATTRIBUTIONS.md`.
