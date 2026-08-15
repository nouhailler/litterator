import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getHashId, scrollToHash } from '../utils/hashNavigation';

function WorksPage() {
  const location = useLocation();
  const [works, setWorks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovement, setSelectedMovement] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedReadingAccess, setSelectedReadingAccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const activeWorkId = getHashId(location.hash);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [worksRes, authorsRes, movementsRes] = await Promise.all([
          fetch('/data/works.json'),
          fetch('/data/authors.json'),
          fetch('/data/movements.json'),
        ]);
        
        const worksData = await worksRes.json();
        const authorsData = await authorsRes.json();
        const movementsData = await movementsRes.json();

        setWorks(worksData);
        setAuthors(authorsData);
        setMovements(movementsData);
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

  // Trier les œuvres par année
  const sortedWorks = [...works].sort((a, b) => a.year - b.year);

  // Extraire les genres uniques
  const genres = [...new Set(works.map(work => work.genre))];

  // Filtrer les œuvres
  const filteredWorks = sortedWorks.filter((work) => {
    const matchesMovement = selectedMovement ? work.movement === selectedMovement : true;
    const matchesGenre = selectedGenre ? work.genre === selectedGenre : true;
    const matchesAuthor = selectedAuthor ? work.author === selectedAuthor : true;
    const matchesReadingAccess = selectedReadingAccess === 'public-domain-text'
      ? work.externalLinks?.length > 0
      : true;
    const matchesSearch = searchTerm 
      ? work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.summary.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesMovement && matchesGenre && matchesAuthor && matchesReadingAccess && matchesSearch;
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
        <p className="eyebrow">Bibliothèque</p>
        <h2>Œuvres de la littérature française</h2>
        <p className="lead">
          Explorez les œuvres majeures qui ont marqué l'histoire littéraire française,
          des Misérables de Victor Hugo à L'Amant de Marguerite Duras.
        </p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Rechercher une œuvre</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Ex: Les Misérables, Madame Bovary..." 
            style={{ width: '300px' }}
          />
        </div>

        <div className="filter-group">
          <label>Mouvement Littéraire</label>
          <select 
            value={selectedMovement} 
            onChange={(e) => setSelectedMovement(e.target.value)}
            style={{ width: '200px' }}
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
          <label>Genre</label>
          <select 
            value={selectedGenre} 
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">Tous les genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Auteur</label>
          <select 
            value={selectedAuthor} 
            onChange={(e) => setSelectedAuthor(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tous les auteurs</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Texte libre</label>
          <select
            value={selectedReadingAccess}
            onChange={(e) => setSelectedReadingAccess(e.target.value)}
            style={{ width: '190px' }}
          >
            <option value="">Toutes les œuvres</option>
            <option value="public-domain-text">Avec lien de lecture</option>
          </select>
        </div>

        <button 
          onClick={() => { 
            setSelectedMovement(''); 
            setSelectedGenre(''); 
            setSelectedAuthor(''); 
            setSelectedReadingAccess('');
            setSearchTerm(''); 
          }}
          className="button button-secondary"
          style={{ alignSelf: 'flex-end' }}
        >
          Réinitialiser
        </button>
      </div>

      <div className="result-count">
        {filteredWorks.length} œuvres trouvées
      </div>

      <div className="content-grid">
        {filteredWorks.map((work) => {
          const author = authors.find(a => a.id === work.author);
          const movement = movements.find(m => m.id === work.movement);

          return (
            <div 
              key={work.id} 
              id={work.id} 
              className={`card entity-card work-card ${activeWorkId === work.id ? 'is-highlighted' : ''}`}
            >
              {work.cover && (
                <img
                  src={work.cover}
                  alt={work.title}
                  className="work-cover"
                  loading="lazy"
                />
              )}

              <h3 style={{ marginBottom: '10px' }}>
                {work.title}
              </h3>

              <p style={{ marginBottom: '10px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                {author?.name} ({work.year}) - {work.genre}
              </p>

              {movement && (
                <div style={{ marginBottom: '10px' }}>
                  <span 
                    className="badge badge-theme" 
                    style={{ fontSize: '0.8rem' }}
                  >
                    {movement.name}
                  </span>
                </div>
              )}

              <p style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                {work.summary.substring(0, 200)}...
              </p>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Thèmes Principaux</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {work.themes.map((theme, index) => (
                    <span 
                      key={index} 
                      className="badge badge-theme" 
                      style={{ fontSize: '0.8rem' }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Extraits</h4>
                {work.excerpts.length > 0 ? (
                  work.excerpts.slice(0, 1).map((excerpt, index) => (
                    <blockquote 
                      key={index} 
                      style={{ 
                        fontStyle: 'italic', 
                        color: 'var(--text-light)', 
                        fontSize: '0.9rem',
                        marginBottom: '10px',
                        paddingLeft: '10px',
                        borderLeft: '3px solid var(--brand)'
                      }}
                    >
                      "{excerpt.text}"
                      {excerpt.chapter && (
                        <footer style={{ marginTop: '5px', fontWeight: '600', fontSize: '0.8rem' }}>
                          — {excerpt.chapter}
                        </footer>
                      )}
                    </blockquote>
                  ))
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '10px' }}>
                    Aucun extrait court n'est encore renseigné pour cette œuvre.
                  </p>
                )}
                {work.excerpts.length > 1 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    +{work.excerpts.length - 1} autres extraits
                  </p>
                )}
                {work.externalLinks?.length > 0 && (
                  <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                      Texte intégral librement accessible :
                    </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {work.externalLinks.map((link) => (
                      <a
                        key={`${work.id}-${link.source}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge badge-theme"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {link.source}
                      </a>
                    ))}
                  </div>
                  </>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Adaptations</h4>
                {work.adaptations.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {work.adaptations.slice(0, 3).map((adaptation, index) => (
                      <a 
                        key={index} 
                        href={adaptation.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="badge badge-theme" 
                        style={{ fontSize: '0.8rem' }}
                      >
                        {adaptation.type === 'film' ? '🎬' : adaptation.type === 'tv_series' ? '📺' : adaptation.type === 'musical' ? '🎭' : '🎵'} 
                        {adaptation.title} ({adaptation.year})
                      </a>
                    ))}
                    {work.adaptations.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        +{work.adaptations.length - 3} autres
                      </span>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Aucune adaptation connue</p>
                )}
              </div>

              <div className="card-actions">
                <Link 
                  to={`/authors#${work.author}`} 
                  className="button" 
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Voir l'auteur
                </Link>
                <Link 
                  to={`/timeline#work-${work.id}`} 
                  className="button button-secondary" 
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  Voir sur la timeline
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorksPage;
