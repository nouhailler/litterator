import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [dataType, setDataType] = useState('author'); // 'author', 'work', 'movement', 'location'
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Gabarits JSON pour l'import
  const templates = {
    author: `{
  "id": "nouvel_auteur",
  "name": "Nom Auteur",
  "full_name": "Nom Complet",
  "birth": {
    "year": 1900,
    "date": "1900-01-01",
    "place": "Lieu de naissance"
  },
  "death": {
    "year": 1980,
    "date": "1980-01-01",
    "place": "Lieu de décès"
  },
  "portrait": "/images/authors/nouvel_auteur.jpg",
  "bio": "Biographie de l'auteur...",
  "movements": ["romantisme"],
  "genres": ["roman", "poésie"],
  "works": [
    { "id": "oeuvre1", "title": "Titre de l'œuvre", "year": 1950, "genre": "roman" }
  ],
  "quotes": ["Citation célèbre..."],
  "influences": {
    "received": ["auteur_influence"],
    "exerted": ["auteur_influence"]
  },
  "reading_level": "lycéen"
}`,
    work: `{
  "id": "nouvelle_oeuvre",
  "title": "Titre de l'œuvre",
  "author": "id_auteur",
  "year": 1950,
  "genre": "roman",
  "movement": "romantisme",
  "summary": "Résumé de l'œuvre...",
  "themes": ["thème1", "thème2"],
  "style": "Style littéraire...",
  "historical_importance": "Importance historique...",
  "reception": "Réception critique...",
  "posterity": "Postérité de l'œuvre...",
  "excerpts": [
    { "text": "Extrait de l'œuvre...", "chapter": "Chapitre 1" }
  ],
  "editions": [
    { "publisher": "Éditeur", "year": 1950, "notes": "Première édition" }
  ],
  "adaptations": [
    { "type": "film", "title": "Titre du film", "year": 2000, "director": "Réalisateur", "link": "https://imdb.com/..." }
  ],
  "reading_level": "lycéen"
}`,
    movement: `{
  "id": "nouveau_mouvement",
  "name": "Nouveau Mouvement",
  "period": {
    "start": 1900,
    "end": 1950
  },
  "description": "Description du mouvement...",
  "context": {
    "historical": "Contexte historique...",
    "cultural": "Contexte culturel..."
  },
  "key_authors": ["auteur1", "auteur2"],
  "key_works": ["oeuvre1", "oeuvre2"],
  "themes": ["thème1", "thème2"],
  "influences": {
    "predecessors": ["mouvement_précédent"],
    "successors": ["mouvement_suivant"]
  },
  "quotes": [
    { "text": "Citation...", "author": "auteur1" }
  ],
  "color": "#e91e63"
}`,
    location: `{
  "id": "nouveau_lieu",
  "name": "Nom du Lieu",
  "description": "Description du lieu...",
  "type": "ville",
  "coordinates": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "zoom": 12,
  "period": {
    "start": 1800,
    "end": 1900
  },
  "movements": ["romantisme"],
  "authors": ["auteur1"],
  "works": ["oeuvre1"],
  "places": [
    {
      "name": "Nom du sous-lieu",
      "description": "Description...",
      "coordinates": { "lat": 48.8566, "lng": 2.3522 }
    }
  ],
  "image": "/images/locations/nouveau_lieu.jpg",
  "color": "#e91e63"
}`
  };

  // Charger les données existantes pour vérification
  const [existingData, setExistingData] = useState({
    authors: [],
    works: [],
    movements: [],
    locations: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsRes, worksRes, movementsRes, locationsRes] = await Promise.all([
          fetch('/data/authors.json'),
          fetch('/data/works.json'),
          fetch('/data/movements.json'),
          fetch('/data/locations.json'),
        ]);
        const [authors, works, movements, locations] = await Promise.all([
          authorsRes.json(),
          worksRes.json(),
          movementsRes.json(),
          locationsRes.json(),
        ]);
        setExistingData({ authors, works, movements, locations });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    loadData();
  }, []);

  // Valider le JSON
  const validateJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Vérifier les champs obligatoires selon le type
      switch (dataType) {
        case 'author':
          if (!data.id || !data.name) {
            return 'Les champs "id" et "name" sont obligatoires pour un auteur.';
          }
          break;
        case 'work':
          if (!data.id || !data.title || !data.author) {
            return 'Les champs "id", "title" et "author" sont obligatoires pour une œuvre.';
          }
          break;
        case 'movement':
          if (!data.id || !data.name || !data.period) {
            return 'Les champs "id", "name" et "period" sont obligatoires pour un mouvement.';
          }
          break;
        case 'location':
          if (!data.id || !data.name || !data.coordinates) {
            return 'Les champs "id", "name" et "coordinates" sont obligatoires pour un lieu.';
          }
          break;
        default:
          return 'Type de données invalide.';
      }
      
      // Vérifier que l'ID n'existe pas déjà
      const existingIds = existingData[dataType + 's'].map(item => item.id);
      if (existingIds.includes(data.id)) {
        return `Un ${dataType} avec l'ID "${data.id}" existe déjà.`;
      }
      
      return null; // Pas d'erreur
    } catch (error) {
      return 'JSON invalide : ' + error.message;
    }
  };

  // Importer les données
  const handleImport = async () => {
    const validationError = validateJSON(jsonInput);
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const newData = JSON.parse(jsonInput);
      const fileName = `${dataType}s.json`;
      const currentData = existingData[dataType + 's'];
      
      // Ajouter la nouvelle entrée
      const updatedData = [...currentData, newData];
      
      // Sauvegarder dans le fichier JSON (simulation pour une PWA locale)
      // Dans une vraie PWA, on utiliserait IndexedDB ou localStorage
      // Ici, on va créer un blob et proposer un téléchargement
      const blob = new Blob([JSON.stringify(updatedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess(`Données importées avec succès ! Téléchargez le fichier ${fileName} pour le remplacer dans /public/data/.`);
      
      // Recharger les données après un délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError('Erreur lors de l\'import : ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter les données
  const handleExport = (type) => {
    const data = existingData[type + 's'];
    const fileName = `${type}s_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess(`Export de ${data.length} ${type}s terminé !`);
  };

  // Exporter tout
  const handleExportAll = () => {
    const allData = {
      authors: existingData.authors,
      works: existingData.works,
      movements: existingData.movements,
      locations: existingData.locations,
      exported_at: new Date().toISOString()
    };
    const fileName = `litterator_full_export_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess(`Export complet terminé ! (${allData.authors.length} auteurs, ${allData.works.length} œuvres, ${allData.movements.length} mouvements, ${allData.locations.length} lieux)`);
  };

  // Charger le gabarit sélectionné
  const loadTemplate = () => {
    setJsonInput(templates[dataType]);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-secondary)', marginBottom: '20px' }}>
        Paramétrage - Import/Export de Données
      </h2>

      <p style={{ marginBottom: '30px', color: 'var(--text-light)' }}>
        Gérez vos données littéraires : importez de nouvelles œuvres, auteurs, mouvements ou lieux,
        ou exportez les données existantes pour les sauvegarder ou les partager.
      </p>

      {/* Menu de navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #eee' }}>
        <button 
          onClick={() => setActiveTab('import')} 
          className={`button ${activeTab === 'import' ? 'button-secondary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          Importer des données
        </button>
        <button 
          onClick={() => setActiveTab('export')} 
          className={`button ${activeTab === 'export' ? 'button-secondary' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          Exporter des données
        </button>
      </div>

      {/* Onglet Import */}
      {activeTab === 'import' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Importer des données</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Type de données à importer :
            </label>
            <select 
              value={dataType} 
              onChange={(e) => setDataType(e.target.value)}
              style={{ padding: '10px', borderRadius: 'var(--border-radius)', width: '300px' }}
            >
              <option value="author">Auteur</option>
              <option value="work">Œuvre</option>
              <option value="movement">Mouvement Littéraire</option>
              <option value="location">Lieu Littéraire</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button onClick={loadTemplate} className="button button-secondary" style={{ marginRight: '10px' }}>
              Charger le gabarit
            </button>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              (Exemple de structure JSON pour {dataType === 'author' ? 'un auteur' : dataType === 'work' ? 'une œuvre' : dataType === 'movement' ? 'un mouvement' : 'un lieu'})
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Données JSON à importer :
            </label>
            <textarea 
              value={jsonInput} 
              onChange={(e) => setJsonInput(e.target.value)}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '10px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid #ddd',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
              placeholder={`Collez ici vos données JSON au format :
{
  "id": "...",
  "name": "...",
  ...
}`}
            />
          </div>

          {error && (
            <div style={{ color: '#f44336', marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', borderRadius: 'var(--border-radius)' }}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#4caf50', marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: 'var(--border-radius)' }}>
              ✅ {success}
            </div>
          )}

          <button 
            onClick={handleImport} 
            disabled={isLoading || !jsonInput.trim()}
            className="button"
            style={{ padding: '10px 20px' }}
          >
            {isLoading ? 'Import en cours...' : 'Importer'}
          </button>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: 'var(--border-radius)' }}>
            <h4 style={{ marginBottom: '10px' }}>Instructions :</h4>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Sélectionnez le type de données à importer.</li>
              <li>Cliquez sur "Charger le gabarit" pour obtenir un exemple de structure JSON.</li>
              <li>Modifiez le JSON avec vos propres données.</li>
              <li>Cliquez sur "Importer" pour valider et télécharger le fichier mis à jour.</li>
              <li>Remplacez le fichier correspondant dans <code>/public/data/</code> par le fichier téléchargé.</li>
              <li>Rafraîchissez la page pour voir les nouvelles données.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Onglet Export */}
      {activeTab === 'export' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Exporter des données</h3>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '15px' }}>Exporter par catégorie :</h4>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleExport('author')} 
                className="button"
                style={{ padding: '10px 20px' }}
              >
                Exporter les Auteurs ({existingData.authors.length})
              </button>
              <button 
                onClick={() => handleExport('work')} 
                className="button"
                style={{ padding: '10px 20px' }}
              >
                Exporter les Œuvres ({existingData.works.length})
              </button>
              <button 
                onClick={() => handleExport('movement')} 
                className="button"
                style={{ padding: '10px 20px' }}
              >
                Exporter les Mouvements ({existingData.movements.length})
              </button>
              <button 
                onClick={() => handleExport('location')} 
                className="button"
                style={{ padding: '10px 20px' }}
              >
                Exporter les Lieux ({existingData.locations.length})
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '15px' }}>Exporter tout :</h4>
            <button 
              onClick={handleExportAll} 
              className="button button-secondary"
              style={{ padding: '10px 20px' }}
            >
              Exporter Toutes les Données
            </button>
            <p style={{ marginTop: '10px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Téléchargez un fichier JSON contenant toutes les données (auteurs, œuvres, mouvements, lieux).
            </p>
          </div>

          {success && (
            <div style={{ color: '#4caf50', marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: 'var(--border-radius)' }}>
              ✅ {success}
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: 'var(--border-radius)' }}>
            <h4 style={{ marginBottom: '10px' }}>Instructions :</h4>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Cliquez sur le bouton correspondant à la catégorie que vous souhaitez exporter.</li>
              <li>Un fichier JSON sera téléchargé automatiquement.</li>
              <li>Vous pouvez utiliser ce fichier pour :
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Faire une sauvegarde de vos données.</li>
                  <li>Partager vos données avec d'autres utilisateurs.</li>
                  <li>Importer les données dans une autre instance de Littérator.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Résumé des données existantes */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Résumé des données actuelles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--romantisme)', color: 'white', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            <h4>Auteurs</h4>
            <p style={{ fontSize: '2rem', margin: '10px 0' }}>{existingData.authors.length}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--realisme)', color: 'white', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            <h4>Œuvres</h4>
            <p style={{ fontSize: '2rem', margin: '10px 0' }}>{existingData.works.length}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--symbolisme)', color: 'white', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            <h4>Mouvements</h4>
            <p style={{ fontSize: '2rem', margin: '10px 0' }}>{existingData.movements.length}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--surréalisme)', color: 'white', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            <h4>Lieux</h4>
            <p style={{ fontSize: '2rem', margin: '10px 0' }}>{existingData.locations.length}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/" className="button" style={{ marginRight: '10px' }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default SettingsPage;
