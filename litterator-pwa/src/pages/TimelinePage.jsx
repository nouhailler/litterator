import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Timeline from '../components/Timeline/Timeline';
import { getHashId } from '../utils/hashNavigation';

function TimelinePage() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    movement: '',
    genre: '',
    author: '',
    type: 'all', // all, movement, work, author, event
  });
  const [movements, setMovements] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeEventId = getHashId(location.hash);

  useEffect(() => {
    // Charger les données depuis les fichiers JSON
    const loadData = async () => {
      try {
        const [movementsRes, authorsRes, worksRes] = await Promise.all([
          fetch('/data/movements.json'),
          fetch('/data/authors.json'),
          fetch('/data/works.json'),
        ]);
        
        const movementsData = await movementsRes.json();
        const authorsData = await authorsRes.json();
        const worksData = await worksRes.json();

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
            link: `/works#${work.id}`,
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
              link: `/authors#${author.id}`,
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
              link: `/authors#${author.id}`,
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
        setFilteredEvents(allEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Appliquer les filtres
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

    setFilteredEvents(result);
  }, [filters, events, movements]);

  useEffect(() => {
    if (!activeEventId || events.length === 0) {
      return;
    }

    const activeEvent = events.find((event) => event.id === activeEventId);

    if (activeEvent?.type === 'movement') {
      setFilters((prev) => ({ ...prev, type: 'movement', movement: activeEventId.replace('movement-', '') }));
    }
  }, [activeEventId, events]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
        <p className="eyebrow">Chronologie</p>
        <h2>Frise de la littérature française</h2>
        <p className="lead">
          Situez mouvements, œuvres, auteurs et événements historiques dans une même lecture du temps.
        </p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Type d'événement</label>
          <select 
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
          <label>Mouvement Littéraire</label>
          <select 
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
          <label>Auteur</label>
          <select 
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
          onClick={() => setFilters({ movement: '', genre: '', author: '', type: 'all' })} 
          className="button button-secondary"
          style={{ alignSelf: 'flex-end', marginTop: '20px' }}
        >
          Réinitialiser les filtres
        </button>
      </div>

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
