import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import AuthorPortrait from '../components/AuthorPortrait';
import LoadErrorState from '../components/LoadErrorState';
import { loadCoreCorpus } from '../data/corpus';
import { getLocationId, isSpecificLocation } from '../utils/locationIds';

const wikipediaTitleOverrides = {
  beranger: 'Pierre-Jean de Béranger',
  chateaubriand: 'François-René de Chateaubriand',
  'erckmann-chatriau': 'Erckmann-Chatrian',
};

function AuthorDetailPage() {
  const { authorId } = useParams();
  const [corpus, setCorpus] = useState({ authors: [], works: [], movements: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCoreCorpus().then(setCorpus).catch(setError).finally(() => setIsLoading(false));
  }, []);

  const author = corpus.authors.find((item) => item.id === authorId);
  const authorWorks = useMemo(
    () => corpus.works.filter((work) => work.author === authorId).sort((a, b) => a.year - b.year),
    [authorId, corpus.works],
  );
  const authorMovements = useMemo(
    () => corpus.movements.filter((movement) => author?.movements.includes(movement.id)),
    [author, corpus.movements],
  );

  if (isLoading) return <div className="loading-state"><p>Chargement de la fiche…</p></div>;
  if (error) return <LoadErrorState title="Impossible de charger cette fiche d’auteur" error={error} />;
  if (!author) {
    return (
      <EmptyState title="Auteur introuvable">
        Cette fiche n’existe pas ou n’est plus disponible.
        {' '}<Link to="/authors">Retour aux auteurs</Link>
      </EmptyState>
    );
  }

  const wikipediaTitle = wikipediaTitleOverrides[author.id] || author.name;
  const wikipediaUrl = `https://fr.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replaceAll(' ', '_'))}`;

  return (
    <article className="detail-page fade-in">
      <nav className="breadcrumb" aria-label="Fil d’Ariane">
        <Link to="/authors">Auteurs</Link><span aria-hidden="true">/</span><span>{author.name}</span>
      </nav>
      <div className="detail-hero">
        <div className="detail-media-wrap">
          <AuthorPortrait author={author} className="detail-portrait" />
        </div>
        <div>
          <PageHeader
            eyebrow={`${author.birth.year}–${author.death?.year || 'aujourd’hui'}`}
            title={author.name}
            description={author.bio}
            actions={(
              <div className="detail-actions">
                <a className="button" href={wikipediaUrl} target="_blank" rel="noopener noreferrer">Wikipédia</a>
                <Link to={`/timeline#author-birth-${author.id}`} className="button button-secondary">Voir sur la frise</Link>
                {isSpecificLocation(author.birth.place) && (
                  <Link to={`/map#${getLocationId(author.birth.place)}`} className="button button-secondary">Lieu de naissance</Link>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-section">
          <p className="eyebrow">Repères</p>
          <h2>Informations biographiques</h2>
          <dl className="detail-definition-list">
            <div><dt>Naissance</dt><dd>{author.birth.date} à {author.birth.place}</dd></div>
            <div><dt>Décès</dt><dd>{author.death?.date ? `${author.death.date} à ${author.death.place}` : 'Auteur vivant'}</dd></div>
            <div><dt>Niveau de lecture</dt><dd>{author.reading_level}</dd></div>
          </dl>
          <div className="tag-row">
            {authorMovements.map((movement) => <Link key={movement.id} to={`/movements#${movement.id}`} className="badge badge-theme">{movement.name}</Link>)}
          </div>
        </section>

        <section className="detail-section detail-section-wide">
          <p className="eyebrow">Bibliographie</p>
          <h2>Œuvres dans Littérator</h2>
          {authorWorks.length > 0 ? (
            <div className="detail-link-list">
              {authorWorks.map((work) => (
                <Link key={work.id} to={`/works/${work.id}`}>
                  <span>{work.title}</span><span>{work.year} · {work.genre}</span>
                </Link>
              ))}
            </div>
          ) : <p className="muted">Aucune œuvre n’est encore associée à cette fiche.</p>}
        </section>

        {author.quotes?.length > 0 && (
          <section className="detail-section detail-section-wide">
            <p className="eyebrow">Voix</p>
            <h2>Citations</h2>
            <div className="quote-list">
              {author.quotes.map((quote) => <blockquote key={quote}>{quote}</blockquote>)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default AuthorDetailPage;
