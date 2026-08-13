import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHashId } from '../utils/hashNavigation';
import { getLocationId, isSpecificLocation } from '../utils/locationIds';

// Correction pour les icônes Leaflet (nécessaire avec Webpack/Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Composant pour recalculer la vue de la carte
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const resizeFrame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => window.cancelAnimationFrame(resizeFrame);
  }, [map]);

  return null;
}

function PopupCloseButton({ onClose }) {
  const map = useMap();

  return (
    <button
      type="button"
      className="popup-close-button"
      onClick={() => {
        onClose();
        map.closePopup();
      }}
    >
      Fermer
    </button>
  );
}

// Icône personnalisée harmonisée avec le thème.
function createCustomIcon() {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="#6f1d1b" stroke="#fffdf8" stroke-width="1.8" d="M12 2.8c-4.1 0-7.4 3.2-7.4 7.2 0 5.1 7.4 11.2 7.4 11.2s7.4-6.1 7.4-11.2c0-4-3.3-7.2-7.4-7.2Z"/>
        <circle cx="12" cy="10" r="2.7" fill="#fffdf8"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    className: 'custom-marker-icon',
  });
}

function MapPage() {
  const routeLocation = useLocation();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [movements, setMovements] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [placeCoordinates, setPlaceCoordinates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Position par défaut (Paris)
  const defaultCenter = [48.8566, 2.3522];
  const defaultZoom = 6;
  const activeLocationId = getLocationId(getHashId(routeLocation.hash));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsRes, movementsRes, authorsRes, placeCoordinatesRes] = await Promise.all([
          fetch('/data/locations.json'),
          fetch('/data/movements.json'),
          fetch('/data/authors.json'),
          fetch('/data/place-coordinates.json'),
        ]);
        
        const locationsData = await locationsRes.json();
        const movementsData = await movementsRes.json();
        const authorsData = await authorsRes.json();
        const placeCoordinatesData = await placeCoordinatesRes.json();

        setLocations(locationsData);
        setMovements(movementsData);
        setAuthors(authorsData);
        setPlaceCoordinates(placeCoordinatesData.coordinates || {});
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const allLocations = [...locations];
  const locationsById = new Map(allLocations.map((location) => [location.id, location]));

  authors.forEach((author) => {
    [author.birth?.place, author.death?.place].filter(Boolean).forEach((place) => {
      if (!isSpecificLocation(place)) {
        return;
      }

      const id = getLocationId(place);
      const coordinates = placeCoordinates[id]
        ? { lat: placeCoordinates[id].lat, lng: placeCoordinates[id].lng }
        : null;

      if (!coordinates) {
        return;
      }

      if (locationsById.has(id)) {
        const existingLocation = locationsById.get(id);
        if (!existingLocation.authors.includes(author.id)) {
          existingLocation.authors = [...existingLocation.authors, author.id];
        }
        author.movements?.forEach((movementId) => {
          if (!existingLocation.movements.includes(movementId)) {
            existingLocation.movements = [...existingLocation.movements, movementId];
          }
        });
        return;
      }

      const generatedLocation = {
        id,
        name: place,
        description: `Lieu biographique associé à ${author.name}.`,
        type: 'lieu biographique',
        coordinates,
        zoom: id === 'france' ? 6 : 11,
        period: {
          start: author.birth?.year || author.death?.year || 1800,
          end: author.death?.year || author.birth?.year || 2000,
        },
        movements: author.movements || [],
        authors: [author.id],
        works: [],
        places: [],
        color: '#6f1d1b',
      };

      locationsById.set(id, generatedLocation);
      allLocations.push(generatedLocation);
    });
  });

  const activeLocation = activeLocationId
    ? allLocations.find((location) => location.id === activeLocationId)
    : null;
  const highlightedLocation = selectedLocation || activeLocation;

  // Filtrer les lieux en fonction des filtres
  const filteredLocations = allLocations.filter((location) => {
    if (activeLocation && location.id !== activeLocation.id) {
      return false;
    }
    if (selectedMovement && !location.movements.includes(selectedMovement)) {
      return false;
    }
    if (selectedAuthor && !location.authors.includes(selectedAuthor)) {
      return false;
    }
    return true;
  });

  // Calculer le centre de la carte en fonction des lieux filtrés
  const getMapCenter = () => {
    if (activeLocation) {
      return [activeLocation.coordinates.lat, activeLocation.coordinates.lng];
    }

    if (filteredLocations.length === 0) {
      return defaultCenter;
    }
    
    // Si un seul lieu est sélectionné, centrer dessus
    if (filteredLocations.length === 1) {
      return [filteredLocations[0].coordinates.lat, filteredLocations[0].coordinates.lng];
    }

    // Sinon, calculer le centre moyen
    const latSum = filteredLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0);
    const lngSum = filteredLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0);
    const avgLat = latSum / filteredLocations.length;
    const avgLng = lngSum / filteredLocations.length;
    
    return [avgLat, avgLng];
  };

  // Calculer le zoom en fonction des lieux filtrés
  const getMapZoom = () => {
    if (activeLocation) {
      return activeLocation.zoom || 11;
    }

    if (filteredLocations.length <= 1) {
      return 10;
    }
    if (filteredLocations.length <= 5) {
      return 8;
    }
    return defaultZoom;
  };

  // Obtenir l'icône pour un lieu
  const getLocationIcon = () => {
    return createCustomIcon();
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="eyebrow">Géographie littéraire</p>
        <h2>Carte littéraire de la France</h2>
        <p className="lead">
          Explorez les lieux emblématiques de la littérature française : Paris romantique, la Normandie de Flaubert,
          Montmartre des surréalistes, l'Algérie de Camus, et bien d'autres.
        </p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Mouvement Littéraire</label>
          <select 
            value={selectedMovement} 
            onChange={(e) => setSelectedMovement(e.target.value)}
            style={{ width: '250px' }}
          >
            <option value="">Tous les mouvements</option>
            {movements.map((movement) => (
              <option key={movement.id} value={movement.id}>
                {movement.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Auteur</label>
          <select 
            value={selectedAuthor} 
            onChange={(e) => setSelectedAuthor(e.target.value)}
            style={{ width: '250px' }}
          >
            <option value="">Tous les auteurs</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => { setSelectedMovement(''); setSelectedAuthor(''); setSelectedLocation(null); }}
          className="button button-secondary"
          style={{ alignSelf: 'flex-end' }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="result-count">
        {filteredLocations.length} lieux affichés
        {highlightedLocation ? ` · ${highlightedLocation.name}` : ''}
      </div>

      <div className="map-container">
        <MapContainer 
          center={getMapCenter()} 
          zoom={getMapZoom()} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ResizeMap />
          <ChangeView center={getMapCenter()} zoom={getMapZoom()} />
          
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {filteredLocations.map((location) => (
            <Marker 
              key={location.id} 
              position={[location.coordinates.lat, location.coordinates.lng]} 
              icon={getLocationIcon()}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(location);
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>
                    {location.name}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {location.description}
                  </p>
                  
                  {location.movements.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      <strong>Mouvements :</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {location.movements.map((movementId) => {
                          const movement = movements.find(m => m.id === movementId);
                          return (
                            <span 
                              key={movementId} 
                              className="badge badge-theme" 
                              style={{ fontSize: '0.7rem' }}
                            >
                              {movement?.name || movementId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {location.authors.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      <strong>Auteurs :</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {location.authors.map((authorId) => {
                          const author = authors.find(a => a.id === authorId);
                          return (
                            <span 
                              key={authorId} 
                              style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}
                            >
                              {author?.name || authorId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {location.works.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      <strong>Œuvres associées :</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {location.works.map((workId) => (
                          <span 
                            key={workId} 
                            style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}
                          >
                            {workId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <PopupCloseButton onClose={() => setSelectedLocation(null)} />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Légende */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Légende</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {movements.map((movement) => (
            <div key={movement.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div className="legend-dot"></div>
              <span style={{ fontSize: '0.9rem' }}>{movement.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des lieux (pour mobile) */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Liste des lieux</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {filteredLocations.map((location) => (
            <div 
              key={location.id} 
              className="card" 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const map = document.querySelector('.leaflet-container');
                if (map) {
                  map.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <h4 style={{ marginBottom: '8px' }}>{location.name}</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '8px' }}>
                {location.description.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {location.movements.map((movementId) => {
                  const movement = movements.find(m => m.id === movementId);
                  return (
                    <span 
                      key={movementId} 
                      className="badge badge-theme" 
                      style={{ fontSize: '0.7rem' }}
                    >
                      {movement?.name || movementId}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
