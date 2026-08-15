import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getHashId, scrollToHash } from '../utils/hashNavigation';
import { getLocationId, isSpecificLocation } from '../utils/locationIds';

const wikipediaTitleOverrides = {
  beranger: 'Pierre-Jean de Béranger',
  chateaubriand: 'François-René de Chateaubriand',
  'erckmann-chatriau': 'Erckmann-Chatrian',
};

const getWikipediaTitle = (author) => wikipediaTitleOverrides[author.id] || author.name;

const getWikipediaUrl = (author) => (
  `https://fr.wikipedia.org/wiki/${encodeURIComponent(getWikipediaTitle(author).replaceAll(' ', '_'))}`
);

function AuthorsPage() {
  const location = useLocation();
  const [authors, setAuthors] = useState([]);
  const [movements, setMovements] = useState([]);
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovement, setSelectedMovement] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const activeAuthorId = getHashId(location.hash);

  const handlePortraitError = (event) => {
    const image = event.currentTarget;
    image.style.display = 'none';
    image.nextElementSibling?.removeAttribute('hidden');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsRes, movementsRes, worksRes] = await Promise.all([
          fetch('/data/authors.json'),
          fetch('/data/movements.json'),
          fetch('/data/works.json'),
        ]);
        
        const authorsData = await authorsRes.json();
        const movementsData = await movementsRes.json();
        const worksData = await worksRes.json();

        setAuthors(authorsData);
        setMovements(movementsData);
        setWorks(worksData);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      scrollToHash(location.hash);
    }
  }, [isLoading, location.hash]);

  // Trier les auteurs par année de naissance
  const sortedAuthors = [...authors].sort((a, b) => a.birth.year - b.birth.year);

  // Filtrer les auteurs
  const filteredAuthors = sortedAuthors.filter((author) => {
    const matchesMovement = selectedMovement ? author.movements.includes(selectedMovement) : true;
    const matchesSearch = searchTerm 
      ? author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.bio.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesMovement && matchesSearch;
  });

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
        <p className="eyebrow">Fiches biographiques</p>
        <h2>Auteurs de la littérature française</h2>
        <p className="lead">
          Découvrez les grands auteurs qui ont marqué l'histoire littéraire française,
          de Victor Hugo à Marguerite Duras.
        </p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Rechercher un auteur</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Ex: Victor Hugo, Camus..." 
            style={{ width: '300px' }}
          />
        </div>

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

        <button 
          onClick={() => { setSelectedMovement(''); setSearchTerm(''); }}
          className="button button-secondary"
          style={{ alignSelf: 'flex-end' }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="result-count">
        {filteredAuthors.length} auteurs trouvés
      </div>

      <div className="content-grid">
        {filteredAuthors.map((author) => {
          // Trouver les œuvres de l'auteur
          const authorWorks = works.filter(work => work.author === author.id);
          
          // Trouver les mouvements de l'auteur
          const authorMovements = movements.filter(movement => author.movements.includes(movement.id));

          return (
            <div 
              key={author.id} 
              id={author.id}
              className={`card entity-card author-card ${activeAuthorId === author.id ? 'is-highlighted' : ''}`}
            >
              {author.portrait ? (
                <>
                  <img
                    src={author.portrait}
                    alt={author.name}
                    className="author-portrait"
                    draggable="false"
                    loading={activeAuthorId === author.id ? 'eager' : 'lazy'}
                    fetchPriority={activeAuthorId === author.id ? 'high' : 'auto'}
                    onError={handlePortraitError}
                  />
                  <div className="entity-initial" aria-hidden="true" hidden>
                    {author.name.charAt(0)}
                  </div>
                </>
              ) : (
                <div className="entity-initial" aria-hidden="true">
                  {author.name.charAt(0)}
                </div>
              )}

              <h3 style={{ marginBottom: '10px' }}>
                {author.name} ({author.birth.year}-{author.death?.year || '...'})
              </h3>

              <p style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                {author.bio.substring(0, 200)}...
              </p>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Mouvements</h4>
                <div className="tag-row">
                  {authorMovements.map((movement) => (
                    <span 
                      key={movement.id} 
                      className="badge badge-theme" 
                      style={{ fontSize: '0.8rem' }}
                    >
                      {movement.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Œuvres Principales</h4>
                <div className="tag-row">
                  {authorWorks.slice(0, 5).map((work) => (
                    <Link 
                      key={work.id} 
                      to={`/works#${work.id}`} 
                      className="badge badge-theme" 
                      style={{ fontSize: '0.8rem' }}
                    >
                      {work.title} ({work.year})
                    </Link>
                  ))}
                  {authorWorks.length > 5 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      +{authorWorks.length - 5} autres
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Citations Célèbres</h4>
                {author.quotes.slice(0, 2).map((quote, index) => (
                  <blockquote 
                    key={index} 
                    style={{ 
                      fontStyle: 'italic', 
                      color: 'var(--text-light)', 
                      fontSize: '0.9rem',
                      marginBottom: '10px',
                      paddingLeft: '10px',
                      borderLeft: '3px solid var(--primary-color)'
                    }}
                  >
                    "{quote}"
                  </blockquote>
                ))}
                {author.quotes.length > 2 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    +{author.quotes.length - 2} autres citations
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Informations</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '5px' }}>
                  <strong>Naissance :</strong> {author.birth.date} à {author.birth.place}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '5px' }}>
                  <strong>Décès :</strong> {author.death?.date ? `${author.death.date} à ${author.death.place}` : 'Auteur vivant'}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '5px' }}>
                  <strong>Niveau de lecture :</strong> {author.reading_level}
                </p>
              </div>

              <div className="card-actions">
                <a
                  className="button"
                  href={getWikipediaUrl(author)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Wikipédia
                </a>
                <Link 
                  to={`/timeline#author-birth-${author.id}`} 
                  className="button button-secondary" 
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Voir sur la timeline
                </Link>
                {isSpecificLocation(author.birth.place) && (
                  <Link 
                    to={`/map#${getLocationId(author.birth.place)}`} 
                    className="button button-secondary" 
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                  >
                    Voir sur la carte
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default AuthorsPage;
