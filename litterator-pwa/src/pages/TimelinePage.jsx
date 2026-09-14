import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Timeline from '../components/Timeline/Timeline';
import HelpTooltip from '../components/HelpTooltip';
import FilterPanel from '../components/FilterPanel';
import LoadErrorState from '../components/LoadErrorState';
import { getHashId } from '../utils/hashNavigation';
import { loadCoreCorpus } from '../data/corpus';
import { readEnum, updateUrlState } from '../utils/urlState';

function TimelinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const appliedHashRef = useRef('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [movements, setMovements] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const filters = {
    movement: searchParams.get('movement') || '',
    author: searchParams.get('author') || '',
    type: readEnum(searchParams.get('type'), ['all', 'movement', 'work', 'author', 'event'], 'all'),
  };
  const activeEventId = getHashId(location.hash);

  useEffect(() => {
    // Charger les données depuis les fichiers JSON
    const loadData = async () => {
      try {
        const { movements: movementsData, authors: authorsData, works: worksData } = await loadCoreCorpus();

        setMovements(movementsData);
        setAuthors(authorsData);

        // Créer les événements pour la timeline
        const allEvents = [];

        // Ajouter les mouvements
        movementsData.forEach((movement) => {
          allEvents.push({
            id: `movement-${movement.id}`,
            type: 'movement',
            title: movement.name,
            start: movement.period.start,
            end: movement.period.end,
            description: movement.description,
            color: movement.color,
            subtitle: `Mouvement littéraire (${movement.period.start}-${movement.period.end})`,
            link: `/movements#${movement.id}`,
            icon: '🎭',
          });
        });

        // Ajouter les œuvres majeures
        worksData.forEach((work) => {
          allEvents.push({
            id: `work-${work.id}`,
            type: 'work',
            title: work.title,
            start: work.year,
            end: work.year,
            description: work.summary.substring(0, 200) + '...',
            color: movementsData.find(m => m.id === work.movement)?.color || '#999',
            authorId: work.author,
            movementId: work.movement,
            subtitle: `Œuvre de ${authorsData.find(a => a.id === work.author)?.name || work.author} (${work.year})`,
            link: `/works/${work.id}`,
            icon: '📖',
          });
        });

        // Ajouter les naissances et morts des auteurs
        authorsData.forEach((author) => {
          if (author.birth.year) {
            allEvents.push({
              id: `author-birth-${author.id}`,
              type: 'author',
              title: `Naissance de ${author.name}`,
              start: author.birth.year,
              end: author.birth.year,
              description: `Naissance de ${author.name} à ${author.birth.place}.`,
              color: '#666',
              authorId: author.id,
              subtitle: `Auteur ${author.movements?.join(', ') || ''}`,
              link: `/authors/${author.id}`,
              icon: '👶',
            });
          }
          if (author.death?.year) {
            allEvents.push({
              id: `author-death-${author.id}`,
              type: 'author',
              title: `Mort de ${author.name}`,
              start: author.death.year,
              end: author.death.year,
              description: `Mort de ${author.name} à ${author.death.place}.`,
              color: '#666',
              authorId: author.id,
              subtitle: `Auteur ${author.movements?.join(', ') || ''}`,
              link: `/authors/${author.id}`,
              icon: '⚰️',
            });
          }
        });

        // Ajouter des événements historiques marquants
        const historicalEvents = [
          {
            id: 'revolution-1830',
            type: 'event',
            title: 'Révolution de Juillet 1830',
            start: 1830,
            end: 1830,
            description: "Chute de Charles X, montée au pouvoir de Louis-Philippe. Cet événement influence le romantisme (ex: 'Hernani' de Hugo).",
            color: '#2196f3',
            subtitle: 'Événement historique',
            icon: '🏛️',
          },
          {
            id: 'commune-1871',
            type: 'event',
            title: 'Commune de Paris',
            start: 1871,
            end: 1871,
            description: "Soulèvement populaire à Paris. Inspire plusieurs œuvres naturalistes et engagées.",
            color: '#f44336',
            subtitle: 'Événement historique',
            icon: '✊',
          },
          {
            id: 'ww1-1914',
            type: 'event',
            title: 'Première Guerre mondiale',
            start: 1914,
            end: 1918,
            description: "La guerre influence profondément la littérature du XXe siècle, notamment le surréalisme et l'existentialisme.",
            color: '#795548',
            subtitle: 'Événement historique',
            icon: '💥',
          },
          {
            id: 'ww2-1939',
            type: 'event',
            title: 'Seconde Guerre mondiale',
            start: 1939,
            end: 1945,
            description: "La guerre et l'Occupation marquent la littérature française, avec des œuvres comme 'La Peste' de Camus.",
            color: '#795548',
            subtitle: 'Événement historique',
            icon: '💣',
          },
        ];
        allEvents.push(...historicalEvents);

        // Trier les événements par année
        allEvents.sort((a, b) => a.start - b.start);

        setEvents(allEvents);
        setIsLoading(false);
      } catch (loadError) {
        console.error('Erreur lors du chargement des données:', loadError);
        setError(loadError);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (filters.type !== 'all') {
      result = result.filter((event) => event.type === filters.type);
    }

    if (filters.movement) {
      result = result.filter((event) => {
        if (event.type === 'movement') {
          return event.id === `movement-${filters.movement}`;
        }
        if (event.type === 'work') {
          return event.movementId === filters.movement;
        }
        return false;
      });
    }

    if (filters.author) {
      result = result.filter((event) => {
        if (event.type === 'work') {
          return event.authorId === filters.author;
        }
        if (event.type === 'author') {
          return event.authorId === filters.author;
        }
        return false;
      });
    }

    return result;
  }, [events, filters.author, filters.movement, filters.type]);

  useEffect(() => {
    if (!activeEventId) {
      appliedHashRef.current = '';
      return;
    }
    if (events.length === 0 || appliedHashRef.current === activeEventId) {
      return;
    }
    appliedHashRef.current = activeEventId;

    const activeEvent = events.find((event) => event.id === activeEventId);

    const movementId = activeEventId.replace('movement-', '');
    if (activeEvent?.type === 'movement'
      && (searchParams.get('type') !== 'movement' || searchParams.get('movement') !== movementId)) {
      const next = new URLSearchParams(searchParams);
      next.set('type', 'movement');
      next.set('movement', movementId);
      navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true });
    }
  }, [activeEventId, events, searchParams, navigate, location.pathname, location.hash]);

  const handleFilterChange = (key, value) => {
    updateUrlState(searchParams, setSearchParams, { [key]: value === 'all' ? null : value });
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) return <LoadErrorState title="Impossible de charger la frise" error={error} />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="eyebrow">Chronologie</p>
        <div className="page-title-row">
          <h1>Frise de la littérature française</h1>
          <HelpTooltip label="Aide sur la frise">
            Les filtres réduisent les événements affichés. Les éléments de la frise ouvrent les fiches liées.
          </HelpTooltip>
        </div>
        <p className="lead">
          Situez mouvements, œuvres, auteurs et événements historiques dans une même lecture du temps.
        </p>
        <Link to="/help" className="context-help-link">Ouvrir l’aide sur la frise</Link>
      </div>

      <FilterPanel activeCount={Number(filters.type !== 'all') + Number(Boolean(filters.movement)) + Number(Boolean(filters.author))}>
        <div className="filter-group">
          <label htmlFor="timeline-type">
            Type d'événement
            <HelpTooltip label="Aide filtre type">
              Utilisez ce filtre pour isoler les mouvements, œuvres, auteurs ou événements historiques.
            </HelpTooltip>
          </label>
          <select id="timeline-type"
            value={filters.type} 
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="all">Tous</option>
            <option value="movement">Mouvements Littéraires</option>
            <option value="work">Œuvres</option>
            <option value="author">Auteurs</option>
            <option value="event">Événements Historiques</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="timeline-movement">Mouvement littéraire</label>
          <select id="timeline-movement"
            value={filters.movement} 
            onChange={(e) => handleFilterChange('movement', e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tous</option>
            {movements.map((movement) => (
              <option key={movement.id} value={movement.id}>
                {movement.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="timeline-author">Auteur</label>
          <select id="timeline-author"
            value={filters.author} 
            onChange={(e) => handleFilterChange('author', e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tous</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => updateUrlState(searchParams, setSearchParams, { movement: null, author: null, type: null })}
          className="button button-secondary"
          disabled={filters.type === 'all' && !filters.movement && !filters.author}
        >
          Réinitialiser les filtres
        </button>
      </FilterPanel>

      <div className="result-count">
        {filteredEvents.length} événements affichés
      </div>

      <div style={{ marginTop: '30px' }}>
        <Timeline events={filteredEvents} activeEventId={activeEventId} />
      </div>
    </div>
  );
}

export default TimelinePage;
