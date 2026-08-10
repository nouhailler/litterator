# Littérator - PWA de Littérature Française

Une **Progressive Web App (PWA)** dédiée à la découverte de la littérature française depuis 1800. Explorez les mouvements littéraires, les auteurs, les œuvres et les lieux emblématiques à travers une interface interactive et moderne.

![Littérator Logo](public/icons/icon.svg)

## 📚 Fonctionnalités

### 1. **Frise Chronologique Interactive**
- Timeline de 1800 à aujourd'hui avec les grands mouvements littéraires.
- Affichage des œuvres majeures, des naissances et décès des auteurs, et des événements historiques.
- **Filtres** par :
  - Type d'événement (mouvements, œuvres, auteurs, événements historiques)
  - Mouvement littéraire (Romantisme, Réalisme, Naturalisme, etc.)
  - Auteur

### 2. **Carte Littéraire Interactive**
- Carte des lieux emblématiques de la littérature française (Leaflet.js).
- **Lieux inclus** :
  - Paris romantique (Notre-Dame, Théâtre de la Porte-Saint-Martin)
  - Rouen et la Normandie de Flaubert
  - Montmartre des surréalistes
  - L'Algérie de Camus
  - L'Indochine de Duras
  - Et bien d'autres...
- **Filtres** par mouvement littéraire ou auteur.
- Légende des couleurs par mouvement.

### 3. **Fiches Détailées**
- **Mouvements Littéraires** : Contexte historique, thèmes, auteurs majeurs, œuvres clés, citations, influences.
- **Auteurs** : Biographie, portrait, œuvres, citations, influences, niveau de lecture.
- **Œuvres** : Résumé, thèmes, style, importance historique, extraits, adaptations (films, séries, comédies musicales).

### 4. **Mode Hors Ligne (PWA)**
- **100% local** : Toutes les données sont stockées sur votre appareil.
- Pas besoin de connexion Internet pour explorer la littérature.

### 5. **Paramétrage (Import/Export)**
- **Importer des données** : Ajoutez de nouveaux auteurs, œuvres, mouvements ou lieux via un gabarit JSON.
- **Exporter des données** : Sauvegardez ou partagez vos données (par catégorie ou toutes ensemble).
- **Gabarits JSON** : Des exemples de structure sont fournis pour chaque type de données.
- Installation possible sur mobile et desktop.

## 🛠 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 19 + Vite |
| **UI** | CSS personnalisé (variables CSS, Flexbox, Grid) |
| **Cartographie** | Leaflet.js + React-Leaflet |
| **Timeline** | Composant custom React |
| **PWA** | Vite PWA Plugin + Workbox |
| **Données** | JSON (stockées dans `/public/data/`) |
| **Polices** | Google Fonts (Roboto, Merriweather) |

## 📁 Structure du Projet

```
litterator-pwa/
├── public/
│   ├── data/                  # Données JSON (mouvements, auteurs, œuvres, lieux)
│   │   ├── movements.json
│   │   ├── authors.json
│   │   ├── works.json
│   │   └── locations.json
│   ├── images/               # Images (portraits, couvertures, etc.)
│   └── icons/                # Icônes pour la PWA
├── src/
│   ├── components/
│   │   ├── Timeline/         # Composant Timeline
│   │   │   └── Timeline.jsx
│   │   └── Map/              # Composant Carte
│   ├── pages/                # Pages principales
│   │   ├── HomePage.jsx
│   │   ├── TimelinePage.jsx
│   │   ├── MapPage.jsx
│   │   ├── MovementsPage.jsx
│   │   ├── AuthorsPage.jsx
│   │   └── WorksPage.jsx
│   ├── styles/
│   │   └── global.css       # Styles globaux
│   ├── App.jsx              # Routing principal
│   └── main.jsx             # Point d'entrée
├── vite.config.js            # Configuration Vite + PWA
├── index.html               # Page HTML principale
└── package.json
```

## 🚀 Installation et Utilisation

### Prérequis
- Node.js (v18 ou supérieur recommandé)
- npm ou yarn

### Installation
1. Cloner le dépôt :
   ```bash
   git clone https://github.com/pnoualhier/litterator.git
   cd litterator/litterator-pwa
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Lancer en mode développement :
   ```bash
   npm run dev
   ```
   L'application sera disponible à l'adresse : [http://localhost:3000](http://localhost:3000)

4. Build pour la production :
   ```bash
   npm run build
   ```
   Les fichiers seront générés dans le dossier `dist/`.

5. Prévisualiser le build :
   ```bash
   npm run preview
   ```

### Déploiement
- **Firebase Hosting** (recommandé) :
  ```bash
  firebase init hosting
  firebase deploy
  ```
- **Vercel** :
  ```bash
  vercel
  ```
- **Netlify** : Glisser-déposer le dossier `dist` dans l'interface Netlify.

## 📊 Données Incluses

### Mouvements Littéraires (7)
- **Romantisme** (1820-1850)
- **Réalisme** (1850-1880)
- **Naturalisme** (1870-1890)
- **Symbolisme** (1880-1900)
- **Surréalisme** (1920-1940)
- **Existentialisme** (1940-1960)
- **Nouveau Roman** (1950-1970)
- **Littérature Contemporaine** (1980-2025)

### Auteurs (10+)
Victor Hugo, Alphonse de Lamartine, Gustave Flaubert, Émile Zola, Charles Baudelaire, Albert Camus, Simone de Beauvoir, Marguerite Duras, et bien d'autres.

### Œuvres (15+)
Les Misérables, Notre-Dame de Paris, Madame Bovary, L'Éducation sentimentale, L'Assommoir, Germinal, Les Fleurs du Mal, L'Étranger, Le Deuxième Sexe, L'Amant, etc.

### Lieux Littéraires (7+)
Paris romantique, Rouen de Flaubert, Paris naturaliste, Montmartre bohème, Algérie de Camus, Indochine de Duras, Paris existentialiste.

## 🎨 Personnalisation

### Ajouter un Mouvement Littéraire
1. Éditer `public/data/movements.json` et ajouter un nouvel objet :
   ```json
   {
     "id": "nouveau_mouvement",
     "name": "Nouveau Mouvement",
     "period": { "start": 2000, "end": 2025 },
     "description": "Description du mouvement...",
     "context": { "historical": "...", "cultural": "..." },
     "key_authors": ["auteur1", "auteur2"],
     "key_works": ["oeuvre1", "oeuvre2"],
     "themes": ["thème1", "thème2"],
     "influences": { "predecessors": [], "successors": [] },
     "quotes": [],
     "color": "#couleurhex"
   }
   ```

### Ajouter un Auteur
1. Éditer `public/data/authors.json` et ajouter un nouvel objet :
   ```json
   {
     "id": "nouvel_auteur",
     "name": "Nom Auteur",
     "full_name": "Nom Complet",
     "birth": { "year": 1900, "date": "1900-01-01", "place": "Lieu" },
     "death": { "year": 1980, "date": "1980-01-01", "place": "Lieu" },
     "portrait": "/images/authors/nouvel_auteur.jpg",
     "bio": "Biographie...",
     "movements": ["mouvement1"],
     "genres": ["roman", "poésie"],
     "works": [
       { "id": "oeuvre1", "title": "Titre", "year": 1950, "genre": "roman" }
     ],
     "quotes": ["Citation célèbre..."],
     "influences": { "received": [], "exerted": [] },
     "reading_level": "lycéen"
   }
   ```

### Ajouter une Œuvre
1. Éditer `public/data/works.json` et ajouter un nouvel objet :
   ```json
   {
     "id": "nouvelle_oeuvre",
     "title": "Titre",
     "author": "auteur_id",
     "year": 1950,
     "genre": "roman",
     "movement": "mouvement_id",
     "summary": "Résumé...",
     "themes": ["thème1", "thème2"],
     "style": "Style...",
     "historical_importance": "Importance...",
     "reception": "Réception...",
     "posterity": "Postérité...",
     "excerpts": [
       { "text": "Extrait...", "chapter": "Chapitre 1" }
     ],
     "editions": [],
     "adaptations": [],
     "reading_level": "lycéen"
   }
   ```

### Ajouter un Lieu
1. Éditer `public/data/locations.json` et ajouter un nouvel objet :
   ```json
   {
     "id": "nouveau_lieu",
     "name": "Nom du Lieu",
     "description": "Description...",
     "type": "ville",
     "coordinates": { "lat": 48.8566, "lng": 2.3522 },
     "zoom": 12,
     "period": { "start": 1800, "end": 1900 },
     "movements": ["mouvement1"],
     "authors": ["auteur1"],
     "works": ["oeuvre1"],
     "places": [],
     "image": "/images/locations/nouveau_lieu.jpg",
     "color": "#couleurhex"
   }
   ```

## 📱 Installation en tant que PWA

1. Ouvrez l'application dans Chrome ou Edge sur mobile/desktop.
2. Cliquez sur l'icône **"Installer"** dans la barre d'adresse ou dans le menu.
3. L'application s'installera comme une app native.
4. Vous pouvez la lancer hors ligne !

## 🔧 Configuration Avancée

### Changer les Couleurs
Modifiez les variables CSS dans `src/styles/global.css` :
```css
:root {
  --primary-color: #1a237e; /* Bleu foncé */
  --secondary-color: #3f51b5; /* Bleu */
  --accent-color: #ff5722; /* Orange */
  /* ... */
}
```

### Ajouter des Polices
1. Ajoutez un lien dans `index.html` :
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Nouvelle+Police&display=swap" rel="stylesheet">
   ```
2. Mettez à jour `global.css` :
   ```css
   :root {
     --font-primary: 'Nouvelle Police', sans-serif;
   }
   ```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le dépôt.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalité`).
3. **Commit** vos changements (`git commit -m 'Ajout de ma fonctionnalité'`).
4. **Push** vers la branche (`git push origin feature/ma-fonctionnalité`).
5. Ouvrez une **Pull Request**.

### Idées de Contributions
- Ajouter plus d'auteurs/œuvres/mouvements.
- Améliorer les styles CSS.
- Ajouter des animations.
- Implémenter un système de favoris (localStorage).
- Ajouter une fonctionnalité de recherche avancée.
- Traduire l'application en anglais.

## 📜 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🙏 Remerciements

- **React** et **Vite** pour le développement moderne.
- **Leaflet** pour la cartographie interactive.
- **OpenStreetMap** pour les cartes libres.
- **Workbox** pour la gestion du cache PWA.
- Tous les auteurs et œuvres qui ont inspiré ce projet !

---

**Littérator** - Découvrez la littérature française comme jamais auparavant ! 📖✨
