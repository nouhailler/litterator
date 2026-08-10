import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HomePage() {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const response = await fetch('/data/authors.json');
        const data = await response.json();
        setAuthors(data.slice(0, 4)); // Charger les 4 premiers auteurs
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
        setIsLoading(false);
      }
    };
    loadAuthors();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-secondary)', fontSize: '2.5rem', marginBottom: '20px' }}>
          Bienvenue sur Littérator
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 30px' }}>
          Explorez la littérature française depuis 1800 à travers une frise chronologique interactive,
          une carte des lieux emblématiques, et des fiches détaillées sur les mouvements, les auteurs et les œuvres.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/timeline" className="button">
            Découvrir la Frise Chronologique
          </Link>
          <Link to="/map" className="button button-secondary">
            Explorer la Carte Littéraire
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', marginBottom: '20px', textAlign: 'center' }}>
          Les Mouvements Littéraires
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { id: 'romantisme', name: 'Romantisme', period: '1820-1850', color: 'var(--romantisme)' },
            { id: 'realisme', name: 'Réalisme', period: '1850-1880', color: 'var(--realisme)' },
            { id: 'naturalisme', name: 'Naturalisme', period: '1870-1890', color: 'var(--naturalisme)' },
            { id: 'symbolisme', name: 'Symbolisme', period: '1880-1900', color: 'var(--symbolisme)' },
            { id: 'surréalisme', name: 'Surréalisme', period: '1920-1940', color: 'var(--surréalisme)' },
            { id: 'existentialisme', name: 'Existentialisme', period: '1940-1960', color: 'var(--existentialisme)' },
          ].map((movement) => (
            <div 
              key={movement.id} 
              className="card" 
              style={{ borderTop: `4px solid ${movement.color}` }}
            >
              <h4 style={{ color: movement.color, marginBottom: '10px' }}>{movement.name}</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px' }}>
                {movement.period}
              </p>
              <Link 
                to={`/movements#${movement.id}`} 
                className="button" 
                style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}
              >
                En savoir plus
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', marginBottom: '20px', textAlign: 'center' }}>
          Auteurs et Œuvres Célèbres
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {authors.map((author) => (
            <div key={author.id} className="card">
              {author.image_url && (
                <img 
                  src={author.image_url} 
                  alt={author.name} 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: 'var(--border-radius)',
                    marginBottom: '10px'
                  }} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Portrait+non+disponible';
                  }}
                />
              )}
              <h4 style={{ marginBottom: '5px' }}>{author.name}</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px' }}>
                {author.works[0]?.title || 'Œuvre inconnue'} ({author.works[0]?.year || '???'})
              </p>
              <Link 
                to={`/authors#${author.id}`} 
                className="button" 
                style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}
              >
                Voir la fiche
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', padding: '30px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--border-radius)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
          Une application 100% locale
        </h3>
        <p style={{ fontSize: '1rem' }}>
          Toutes les données sont stockées sur votre appareil. Pas besoin de connexion Internet pour explorer la littérature française !
        </p>
      </section>
    </div>
  );
}

export default HomePage;
