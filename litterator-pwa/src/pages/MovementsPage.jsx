import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [works, setWorks] = useState([]);

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

  // Trier les mouvements par période de début
  const sortedMovements = [...movements].sort((a, b) => a.period.start - b.period.start);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-secondary)', marginBottom: '20px' }}>
        Mouvements Littéraires Français (1800 - Aujourd'hui)
      </h2>

      <p style={{ marginBottom: '30px', color: 'var(--text-light)' }}>
        Découvrez les grands mouvements qui ont marqué l'histoire de la littérature française,
        de la Révolution industrielle à l'ère numérique.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {sortedMovements.map((movement) => {
          // Trouver les auteurs et œuvres associés
          const movementAuthors = authors.filter(author => author.movements.includes(movement.id));
          const movementWorks = works.filter(work => work.movement === movement.id);

          return (
            <div 
              key={movement.id} 
              id={movement.id} 
              className="card" 
              style={{ borderTop: `4px solid ${movement.color}` }}
            >
              <h3 style={{ color: movement.color, marginBottom: '10px' }}>
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
                      className="badge" 
                      style={{ backgroundColor: movement.color, fontSize: '0.8rem' }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Auteurs Majeurs</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {movementAuthors.slice(0, 5).map((author) => (
                    <Link 
                      key={author.id} 
                      to={`/authors#${author.id}`} 
                      className="badge" 
                      style={{ backgroundColor: '#e0e0e0', color: 'var(--primary-color)', fontSize: '0.8rem' }}
                    >
                      {author.name}
                    </Link>
                  ))}
                  {movementAuthors.length > 5 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      +{movementAuthors.length - 5} autres
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Œuvres Clés</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {movementWorks.slice(0, 5).map((work) => (
                    <Link 
                      key={work.id} 
                      to={`/works#${work.id}`} 
                      className="badge" 
                      style={{ backgroundColor: '#e0e0e0', color: 'var(--primary-color)', fontSize: '0.8rem' }}
                    >
                      {work.title} ({work.year})
                    </Link>
                  ))}
                  {movementWorks.length > 5 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      +{movementWorks.length - 5} autres
                    </span>
                  )}
                </div>
              </div>

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
                        borderLeft: `3px solid ${movement.color}`
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
                            <span 
                              key={index} 
                              className="badge" 
                              style={{ backgroundColor: predMovement?.color || '#999', fontSize: '0.8rem' }}
                            >
                              {predMovement?.name || pred}
                            </span>
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
                            <span 
                              key={index} 
                              className="badge" 
                              style={{ backgroundColor: succMovement?.color || '#999', fontSize: '0.8rem' }}
                            >
                              {succMovement?.name || succ}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
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
