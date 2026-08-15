import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLocationId, isSpecificLocation } from '../utils/locationIds';

const featuredMovementIds = [
  'romantisme',
  'realisme',
  'modernite',
  'surréalisme',
  'existentialisme',
  'contemporain',
];

const featuredAuthorWorks = [
  { authorId: 'hugo', workId: 'les-miserables' },
  { authorId: 'flaubert', workId: 'madame-bovary' },
  { authorId: 'zola', workId: 'germinal' },
  { authorId: 'camus', workId: 'l-etranger' },
];

const defaultCorpus = {
  movements: [],
  authors: [],
  works: [],
  locations: [],
  glossary: [],
  placeCoordinates: {},
};

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('fr-FR') : '...';

const getMapLocationCount = (locations, authors, placeCoordinates) => {
  const locationIds = new Set(locations.map((location) => location.id));

  authors.forEach((author) => {
    [author.birth?.place, author.death?.place].filter(Boolean).forEach((place) => {
      if (!isSpecificLocation(place)) {
        return;
      }

      const id = getLocationId(place);

      if (placeCoordinates[id]) {
        locationIds.add(id);
      }
    });
  });

  return locationIds.size;
};

function HomePage() {
  const [corpus, setCorpus] = useState(defaultCorpus);
  const [isCorpusLoaded, setIsCorpusLoaded] = useState(false);

  useEffect(() => {
    const loadCorpus = async () => {
      try {
        const [
          movementsRes,
          authorsRes,
          worksRes,
          locationsRes,
          glossaryRes,
          placeCoordinatesRes,
        ] = await Promise.all([
          fetch('/data/movements.json'),
          fetch('/data/authors.json'),
          fetch('/data/works.json'),
          fetch('/data/locations.json'),
          fetch('/data/glossary.json'),
          fetch('/data/place-coordinates.json'),
        ]);

        const [
          movementsData,
          authorsData,
          worksData,
          locationsData,
          glossaryData,
          placeCoordinatesData,
        ] = await Promise.all([
          movementsRes.json(),
          authorsRes.json(),
          worksRes.json(),
          locationsRes.json(),
          glossaryRes.json(),
          placeCoordinatesRes.json(),
        ]);

        setCorpus({
          movements: movementsData,
          authors: authorsData,
          works: worksData,
          locations: locationsData,
          glossary: glossaryData,
          placeCoordinates: placeCoordinatesData.coordinates || {},
        });
        setIsCorpusLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des données d'accueil:", error);
      }
    };

    loadCorpus();
  }, []);

  const stats = useMemo(() => ({
    movements: corpus.movements.length,
    authors: corpus.authors.length,
    works: corpus.works.length,
    locations: getMapLocationCount(corpus.locations, corpus.authors, corpus.placeCoordinates),
    glossary: corpus.glossary.length,
  }), [corpus]);

  const movements = useMemo(() => {
    const movementsById = Object.fromEntries(corpus.movements.map((movement) => [movement.id, movement]));

    return featuredMovementIds
      .map((id) => movementsById[id])
      .filter(Boolean)
      .map((movement) => ({
        id: movement.id,
        name: movement.name,
        period: `${movement.period.start}-${movement.period.end}`,
        color: movement.color,
      }));
  }, [corpus.movements]);

  const authors = useMemo(() => {
    const authorsById = Object.fromEntries(corpus.authors.map((author) => [author.id, author]));
    const worksById = Object.fromEntries(corpus.works.map((work) => [work.id, work]));

    return featuredAuthorWorks
      .map(({ authorId, workId }) => {
        const author = authorsById[authorId];
        const work = worksById[workId];

        if (!author) {
          return null;
        }

        return {
          id: author.id,
          name: author.name,
          work: work?.title || 'Œuvre à préciser',
          period: `${author.birth.year}-${author.death?.year || '...'}`,
        };
      })
      .filter(Boolean);
  }, [corpus.authors, corpus.works]);

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
              <span className="stat-number">{formatNumber(isCorpusLoaded ? stats.movements : null)}</span>
            </div>
            <div className="stat-item">
              <span>Auteurs</span>
              <span className="stat-number">{formatNumber(isCorpusLoaded ? stats.authors : null)}</span>
            </div>
            <div className="stat-item">
              <span>Œuvres</span>
              <span className="stat-number">{formatNumber(isCorpusLoaded ? stats.works : null)}</span>
            </div>
            <div className="stat-item">
              <span>Lieux</span>
              <span className="stat-number">{formatNumber(isCorpusLoaded ? stats.locations : null)}</span>
            </div>
            <div className="stat-item">
              <span>Termes</span>
              <span className="stat-number">{formatNumber(isCorpusLoaded ? stats.glossary : null)}</span>
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
