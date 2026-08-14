import { Link } from 'react-router-dom';

const movements = [
  { id: 'romantisme', name: 'Romantisme', period: '1800-1865', color: 'var(--romantisme)' },
  { id: 'realisme', name: 'Réalisme', period: '1830-1922', color: 'var(--realisme)' },
  { id: 'modernite', name: 'Modernité', period: '1857-1968', color: '#2563eb' },
  { id: 'surréalisme', name: 'Surréalisme', period: '1917-1938', color: 'var(--surréalisme)' },
  { id: 'existentialisme', name: 'Existentialisme', period: '1938-1964', color: 'var(--existentialisme)' },
  { id: 'contemporain', name: 'Contemporain', period: '1967-2022', color: '#607d8b' },
];

const authors = [
  { id: 'hugo', name: 'Victor Hugo', work: 'Les Misérables', period: '1802-1885' },
  { id: 'flaubert', name: 'Gustave Flaubert', work: 'Madame Bovary', period: '1821-1880' },
  { id: 'zola', name: 'Émile Zola', work: 'Germinal', period: '1840-1902' },
  { id: 'camus', name: 'Albert Camus', work: "L'Étranger", period: '1913-1960' },
];

function HomePage() {
  return (
    <div className="fade-in">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Explorer, situer, relier</p>
          <h1>Littérature française depuis 1800</h1>
          <p className="lead">
            Parcourez les mouvements, les auteurs, les œuvres et les lieux qui structurent deux siècles
            de création littéraire. L'application privilégie une lecture claire, chronologique et locale.
          </p>

          <div className="hero-actions">
            <Link to="/timeline" className="button">
              Ouvrir la frise
            </Link>
            <Link to="/map" className="button button-secondary">
              Explorer la carte
            </Link>
          </div>
        </div>

        <aside className="hero-aside" aria-label="Résumé du corpus">
          <div>
            <p className="eyebrow">Corpus local</p>
            <h2>Littérator</h2>
          </div>
          <div className="stat-list">
            <div className="stat-item">
              <span>Mouvements</span>
              <span className="stat-number">19</span>
            </div>
            <div className="stat-item">
              <span>Auteurs</span>
              <span className="stat-number">100</span>
            </div>
            <div className="stat-item">
              <span>Œuvres</span>
              <span className="stat-number">200</span>
            </div>
            <div className="stat-item">
              <span>Lieux</span>
              <span className="stat-number">8</span>
            </div>
            <div className="stat-item">
              <span>Termes</span>
              <span className="stat-number">224</span>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Périodes</p>
            <h2 className="section-title">Mouvements littéraires</h2>
          </div>
          <Link to="/movements" className="button button-secondary">
            Tout voir
          </Link>
        </div>

        <div className="content-grid">
          {movements.map((movement) => (
            <article
              key={movement.id}
              className="card movement-card"
              style={{ '--card-accent': movement.color }}
            >
              <div>
                <h3>{movement.name}</h3>
                <p className="movement-period">{movement.period}</p>
              </div>
              <Link to={`/movements#${movement.id}`} className="button button-secondary">
                En savoir plus
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Repères</p>
            <h2 className="section-title">Auteurs et œuvres</h2>
          </div>
          <Link to="/authors" className="button button-secondary">
            Parcourir les auteurs
          </Link>
        </div>

        <div className="content-grid">
          {authors.map((author) => (
            <article key={author.id} className="card entity-card">
              <div className="entity-initial" aria-hidden="true">
                {author.name.charAt(0)}
              </div>
              <div>
                <h3>{author.name}</h3>
                <p className="meta-line">{author.period}</p>
              </div>
              <p>{author.work}</p>
              <Link to={`/authors#${author.id}`} className="button button-secondary">
                Voir la fiche
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Méthode</p>
            <h2 className="section-title">Glossaire littéraire</h2>
          </div>
          <Link to="/glossary" className="button button-secondary">
            Ouvrir le glossaire
          </Link>
        </div>

        <div className="content-grid">
          {[
            { term: 'Focalisation', category: 'Narration' },
            { term: 'Métaphore', category: 'Figure de sens' },
            { term: 'Registre', category: 'Analyse' },
          ].map((item) => (
            <article key={item.term} className="card entity-card">
              <span className="badge badge-theme">{item.category}</span>
              <h3>{item.term}</h3>
              <p>Un repère pour commenter les textes et relier les procédés aux œuvres du corpus.</p>
              <Link to="/glossary" className="button button-secondary">
                Consulter
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
