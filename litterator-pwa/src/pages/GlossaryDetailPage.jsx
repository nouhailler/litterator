import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import LoadErrorState from '../components/LoadErrorState';
import { loadJson } from '../data/corpus';
import { enrichGlossary } from '../data/glossary';

function GlossaryDetailPage() {
  const { termId } = useParams();
  const [data, setData] = useState({ terms: [], categories: [], movements: [], works: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      loadJson('/data/glossary.json'),
      loadJson('/data/glossary-categories.json'),
      loadJson('/data/movements.json'),
      loadJson('/data/works.json'),
    ]).then(([terms, categoryData, movements, works]) => setData({ terms, categories: categoryData.categories, movements, works }))
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const enrichedTerms = useMemo(() => enrichGlossary(data.terms, data.categories), [data.categories, data.terms]);
  const term = enrichedTerms.find((item) => item.id === termId);

  if (isLoading) return <div className="loading-state"><p>Chargement de la définition…</p></div>;
  if (error) return <LoadErrorState title="Impossible de charger cette définition" error={error} />;
  if (!term) return <EmptyState title="Terme introuvable">Cette définition n’existe pas. <Link to="/glossary">Retour au glossaire</Link></EmptyState>;

  const movementsById = Object.fromEntries(data.movements.map((movement) => [movement.id, movement]));
  const worksById = Object.fromEntries(data.works.map((work) => [work.id, work]));

  return (
    <article className="detail-page detail-page-reading fade-in">
      <nav className="breadcrumb" aria-label="Fil d’Ariane"><Link to="/glossary">Glossaire</Link><span aria-hidden="true">/</span><span>{term.term}</span></nav>
      <PageHeader eyebrow={term.category} title={term.term} description={term.definition} />
      <section className="detail-section">
        <p className="eyebrow">Exemple</p>
        <h2>Dans un texte</h2>
        <blockquote>{term.example}</blockquote>
      </section>
      {term.relatedTerms?.length > 0 && (
        <section className="detail-section">
          <h2>Notions liées</h2>
          <div className="tag-row">
            {term.relatedTerms.map((relatedId) => {
              const related = enrichedTerms.find((item) => item.id === relatedId);
              return related ? <Link key={relatedId} to={`/glossary/${related.id}`} className="badge badge-theme">{related.term}</Link> : null;
            })}
          </div>
        </section>
      )}
      {term.relatedMovements?.length > 0 && (
        <section className="detail-section">
          <h2>Mouvements associés</h2>
          <div className="tag-row">{term.relatedMovements.map((id) => movementsById[id] ? <Link key={id} to={`/movements#${id}`} className="badge badge-theme">{movementsById[id].name}</Link> : null)}</div>
        </section>
      )}
      {term.relatedWorks?.length > 0 && (
        <section className="detail-section">
          <h2>Œuvres repères</h2>
          <div className="detail-link-list">{term.relatedWorks.map((id) => worksById[id] ? <Link key={id} to={`/works/${id}`}><span>{worksById[id].title}</span><span>{worksById[id].year}</span></Link> : null)}</div>
        </section>
      )}
    </article>
  );
}

export default GlossaryDetailPage;
