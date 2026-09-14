import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FilterPanel from '../components/FilterPanel';
import HelpTooltip from '../components/HelpTooltip';
import Pagination from '../components/Pagination';
import LoadErrorState from '../components/LoadErrorState';
import { loadJson } from '../data/corpus';
import { getHashId } from '../utils/hashNavigation';
import { getLocationId, isSpecificLocation } from '../utils/locationIds';
import { readPositivePage, updateUrlState } from '../utils/urlState';

const LOCATION_PAGE_SIZE = 12;

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

const locationIcon = createCustomIcon();

function createClusterIcon(count) {
  return L.divIcon({
    className: 'location-cluster-wrapper',
    html: `<span class="location-cluster-icon">${count}</span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function LocationPopupContent({ location, movementsById, authorsById, onClose }) {
  return (
    <div className="map-popup-content">
      <h2>{location.name}</h2>
      <p>{location.description}</p>
      {location.movements.length > 0 && (
        <div className="tag-row">
          {location.movements.map((id) => movementsById[id] ? <span key={id} className="badge badge-theme">{movementsById[id].name}</span> : null)}
        </div>
      )}
      {location.authors.length > 0 && (
        <div className="map-popup-links">
          {location.authors.slice(0, 8).map((id) => authorsById[id] ? <Link key={id} to={`/authors/${id}`}>{authorsById[id].name}</Link> : null)}
        </div>
      )}
      <PopupCloseButton onClose={onClose} />
    </div>
  );
}

function ClusteredMarkers({ locations, movementsById, authorsById, onSelect }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const clusters = useMemo(() => {
    const step = zoom <= 5 ? 3 : zoom <= 7 ? 1.2 : zoom <= 9 ? 0.45 : zoom <= 11 ? 0.12 : 0;
    if (step === 0) return locations.map((location) => ({ key: location.id, locations: [location], center: [location.coordinates.lat, location.coordinates.lng] }));
    const groups = new Map();
    locations.forEach((location) => {
      const key = `${Math.round(location.coordinates.lat / step)}:${Math.round(location.coordinates.lng / step)}`;
      groups.set(key, [...(groups.get(key) || []), location]);
    });
    return [...groups.entries()].map(([key, groupedLocations]) => ({
      key,
      locations: groupedLocations,
      center: [
        groupedLocations.reduce((sum, item) => sum + item.coordinates.lat, 0) / groupedLocations.length,
        groupedLocations.reduce((sum, item) => sum + item.coordinates.lng, 0) / groupedLocations.length,
      ],
    }));
  }, [locations, zoom]);

  return clusters.map((cluster) => {
    if (cluster.locations.length > 1) {
      return (
        <Marker
          key={`cluster-${cluster.key}`}
          position={cluster.center}
          icon={createClusterIcon(cluster.locations.length)}
          eventHandlers={{ click: () => map.setView(cluster.center, Math.min(zoom + 2, 12)) }}
        />
      );
    }
    const location = cluster.locations[0];
    return (
      <Marker
        key={location.id}
        position={[location.coordinates.lat, location.coordinates.lng]}
        icon={locationIcon}
        alt={location.name}
        eventHandlers={{ click: () => onSelect(location) }}
      >
        <Popup>
          <LocationPopupContent location={location} movementsById={movementsById} authorsById={authorsById} onClose={() => onSelect(null)} />
        </Popup>
      </Marker>
    );
  });
}

function MapPage() {
  const routeLocation = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [movements, setMovements] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [placeCoordinates, setPlaceCoordinates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTileError, setHasTileError] = useState(false);
  const [tileLayerVersion, setTileLayerVersion] = useState(0);
  const selectedMovement = searchParams.get('movement') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const requestedPage = readPositivePage(searchParams.get('page'));

  // Position par défaut (Paris)
  const defaultCenter = [48.8566, 2.3522];
  const defaultZoom = 6;
  const activeLocationId = getLocationId(getHashId(routeLocation.hash));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsData, movementsData, authorsData, placeCoordinatesData] = await Promise.all([
          loadJson('/data/locations.json'),
          loadJson('/data/movements.json'),
          loadJson('/data/authors.json'),
          loadJson('/data/place-coordinates.json'),
        ]);

        setLocations(locationsData);
        setMovements(movementsData);
        setAuthors(authorsData);
        setPlaceCoordinates(placeCoordinatesData.coordinates || {});
        setIsLoading(false);
      } catch (loadError) {
        console.error('Erreur lors du chargement des données:', loadError);
        setError(loadError);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const allLocations = useMemo(() => {
    const result = locations.map((location) => ({
      ...location,
      authors: [...location.authors],
      movements: [...location.movements],
    }));
    const locationsById = new Map(result.map((location) => [location.id, location]));

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
      result.push(generatedLocation);
      });
    });
    return result;
  }, [authors, locations, placeCoordinates]);

  const movementsById = useMemo(() => Object.fromEntries(movements.map((movement) => [movement.id, movement])), [movements]);
  const authorsById = useMemo(() => Object.fromEntries(authors.map((author) => [author.id, author])), [authors]);

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

  useEffect(() => setSelectedLocation(null), [selectedMovement, selectedAuthor, activeLocationId]);

  const totalLocationPages = Math.max(1, Math.ceil(filteredLocations.length / LOCATION_PAGE_SIZE));
  const locationPage = Math.min(requestedPage, totalLocationPages);
  const visibleLocations = filteredLocations.slice((locationPage - 1) * LOCATION_PAGE_SIZE, locationPage * LOCATION_PAGE_SIZE);

  // Calculer le centre de la carte en fonction des lieux filtrés
  const getMapCenter = () => {
    if (highlightedLocation) {
      return [highlightedLocation.coordinates.lat, highlightedLocation.coordinates.lng];
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
    if (highlightedLocation) {
      return highlightedLocation.zoom || 10;
    }

    if (filteredLocations.length <= 1) {
      return 10;
    }
    if (filteredLocations.length <= 5) {
      return 8;
    }
    return defaultZoom;
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) return <LoadErrorState title="Impossible de charger la carte littéraire" error={error} />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="eyebrow">Géographie littéraire</p>
        <div className="page-title-row">
          <h1>Carte littéraire de la France</h1>
          <HelpTooltip label="Aide sur la carte">
            Filtrez puis touchez un marqueur pour lire les auteurs, mouvements et œuvres associés au lieu.
          </HelpTooltip>
        </div>
        <p className="lead">
          Explorez les lieux emblématiques de la littérature française : Paris romantique, la Normandie de Flaubert,
          Montmartre des surréalistes, l'Algérie de Camus, et bien d'autres.
        </p>
        <Link to="/help" className="context-help-link">Ouvrir l’aide sur la carte</Link>
      </div>

      <FilterPanel activeCount={Number(Boolean(selectedMovement)) + Number(Boolean(selectedAuthor))}>
        <div className="filter-group">
          <label htmlFor="map-movement">
            Mouvement littéraire
            <HelpTooltip label="Aide filtre mouvement">
              Affiche uniquement les lieux reliés au mouvement choisi.
            </HelpTooltip>
          </label>
          <select id="map-movement"
            value={selectedMovement} 
            onChange={(e) => updateUrlState(searchParams, setSearchParams, { movement: e.target.value, page: null })}
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
          <label htmlFor="map-author">Auteur</label>
          <select id="map-author"
            value={selectedAuthor} 
            onChange={(e) => updateUrlState(searchParams, setSearchParams, { author: e.target.value, page: null })}
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
          onClick={() => { updateUrlState(searchParams, setSearchParams, { movement: null, author: null, page: null }); setSelectedLocation(null); }}
          className="button button-secondary"
          disabled={!selectedMovement && !selectedAuthor && !selectedLocation}
        >
          Réinitialiser
        </button>
      </FilterPanel>

      <div className="result-count">
        {filteredLocations.length} lieux affichés
        {highlightedLocation ? ` · ${highlightedLocation.name}` : ''}
      </div>

      {hasTileError && (
        <div className="map-status" role="alert">
          <span><strong>Fond de carte indisponible.</strong> Les lieux restent consultables dans la liste ci-dessous.</span>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => { setHasTileError(false); setTileLayerVersion((version) => version + 1); }}
          >
            Recharger le fond
          </button>
        </div>
      )}

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
            key={tileLayerVersion}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            eventHandlers={{ tileerror: () => setHasTileError(true) }}
          />
          <ClusteredMarkers locations={filteredLocations} movementsById={movementsById} authorsById={authorsById} onSelect={setSelectedLocation} />
        </MapContainer>
      </div>

      <details className="card map-legend">
        <summary>Légende des mouvements</summary>
        <div className="map-legend-grid">
          {movements.map((movement) => (
            <div key={movement.id}>
              <span className="legend-dot" style={{ backgroundColor: movement.color }} />
              <span>{movement.name}</span>
            </div>
          ))}
        </div>
      </details>

      <details className="location-directory">
        <summary>Parcourir la liste des lieux <span>{filteredLocations.length}</span></summary>
        <div className="location-grid">
          {visibleLocations.map((location) => (
            <button
              type="button"
              key={location.id}
              className={`card location-card ${highlightedLocation?.id === location.id ? 'is-highlighted' : ''}`}
              onClick={() => {
                setSelectedLocation(location);
                const map = document.querySelector('.leaflet-container');
                map?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <strong>{location.name}</strong>
              <span>{location.description}</span>
              <div className="tag-row">
                {location.movements.slice(0, 3).map((id) => movementsById[id] ? <span key={id} className="badge badge-theme">{movementsById[id].name}</span> : null)}
              </div>
            </button>
          ))}
        </div>
        <Pagination
          currentPage={locationPage}
          pageSize={LOCATION_PAGE_SIZE}
          totalItems={filteredLocations.length}
          onPageChange={(page) => updateUrlState(searchParams, setSearchParams, { page: page === 1 ? null : page })}
        />
      </details>
    </div>
  );
}

export default MapPage;
