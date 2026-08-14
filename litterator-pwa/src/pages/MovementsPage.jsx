import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getHashId, scrollToHash } from '../utils/hashNavigation';

function MovementsPage() {
  const location = useLocation();
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [works, setWorks] = useState([]);
  const activeMovementId = getHashId(location.hash);

  useEffect(() => {
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

  // Trier les mouvements par période de début
  const sortedMovements = [...movements].sort((a, b) => a.period.start - b.period.start);
  const authorsById = Object.fromEntries(authors.map((author) => [author.id, author]));
  const worksById = Object.fromEntries(works.map((work) => [work.id, work]));

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
        <p className="eyebrow">Courants et ruptures</p>
        <h2>Mouvements littéraires français</h2>
        <p className="lead">
          Découvrez les grands mouvements qui ont marqué l'histoire de la littérature française,
          de la Révolution industrielle à l'ère numérique.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {sortedMovements.map((movement) => {
          const movementAuthors = (movement.key_authors || [])
            .map((authorId) => authorsById[authorId])
            .filter(Boolean);
          const movementWorks = (movement.key_works || [])
            .map((workId) => worksById[workId])
            .filter(Boolean);

          return (
            <div 
              key={movement.id} 
              id={movement.id} 
              className={`card movement-card ${activeMovementId === movement.id ? 'is-highlighted' : ''}`}
            >
              <h3 style={{ marginBottom: '10px' }}>
                {movement.name} ({movement.period.start}-{movement.period.end})
              </h3>
              
              <p style={{ marginBottom: '15px', color: 'var(--text-light)' }}>
                {movement.description}
              </p>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Contexte</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '5px' }}>
                  <strong>Historique :</strong> {movement.context.historical}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  <strong>Culturel :</strong> {movement.context.cultural}
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Thèmes Principaux</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {movement.themes.map((theme, index) => (
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

              <details className="movement-accordion">
                <summary>
                  <span>Auteurs Majeurs</span>
                  <strong>{movementAuthors.length}</strong>
                </summary>
                <div className="movement-accordion-content">
                  {movementAuthors.map((author) => (
                    <Link
                      key={author.id}
                      to={`/authors#${author.id}`}
                      className="badge badge-theme"
                    >
                      {author.name}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="movement-accordion">
                <summary>
                  <span>Œuvres Clés</span>
                  <strong>{movementWorks.length}</strong>
                </summary>
                <div className="movement-accordion-content">
                  {movementWorks.map((work) => (
                    <Link
                      key={work.id}
                      to={`/works#${work.id}`}
                      className="badge badge-theme"
                    >
                      {work.title} ({work.year})
                    </Link>
                  ))}
                </div>
              </details>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Citations</h4>
                {movement.quotes.map((quote, index) => {
                  const author = authors.find(a => a.id === quote.author);
                  return (
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
                      "{quote.text}"
                      {author && <footer style={{ marginTop: '5px', fontWeight: '600' }}>
                        — {author.name}
                      </footer>}
                    </blockquote>
                  );
                })}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Influences</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {movement.influences.predecessors.length > 0 && (
                    <div>
                      <strong>Prédécesseurs :</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {movement.influences.predecessors.map((pred, index) => {
                          const predMovement = movements.find(m => m.id === pred);
                          return (
                            <Link
                              key={index} 
                              to={`/movements#${pred}`}
                              className="badge badge-theme" 
                              style={{ fontSize: '0.8rem' }}
                            >
                              {predMovement?.name || pred}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {movement.influences.successors.length > 0 && (
                    <div>
                      <strong>Successeurs :</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {movement.influences.successors.map((succ, index) => {
                          const succMovement = movements.find(m => m.id === succ);
                          return (
                            <Link
                              key={index} 
                              to={`/movements#${succ}`}
                              className="badge badge-theme" 
                              style={{ fontSize: '0.8rem' }}
                            >
                              {succMovement?.name || succ}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <Link 
                  to={`/timeline#movement-${movement.id}`} 
                  className="button" 
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

export default MovementsPage;
