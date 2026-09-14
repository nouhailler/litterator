import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import WorkCover from '../components/WorkCover';
import LoadErrorState from '../components/LoadErrorState';
import { loadCoreCorpus } from '../data/corpus';

const adaptationIcon = (type) => ({ film: 'Film', tv_series: 'Série', musical: 'Adaptation musicale', opera: 'Opéra', music: 'Musique', ballet: 'Ballet', stage: 'Théâtre', performance: 'Performance' }[type] || 'Adaptation');
const adaptationMeta = (adaptation) => [adaptationIcon(adaptation.type), adaptation.year, adaptation.dateType].filter(Boolean).join(' · ');

function WorkDetailPage() {
  const { workId } = useParams();
  const [corpus, setCorpus] = useState({ authors: [], works: [], movements: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCoreCorpus().then(setCorpus).catch(setError).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="loading-state"><p>Chargement de la fiche…</p></div>;
  if (error) return <LoadErrorState title="Impossible de charger cette fiche d’œuvre" error={error} />;

  const work = corpus.works.find((item) => item.id === workId);
  if (!work) {
    return <EmptyState title="Œuvre introuvable">Cette fiche n’existe pas. <Link to="/works">Retour aux œuvres</Link></EmptyState>;
  }

  const author = corpus.authors.find((item) => item.id === work.author);
  const movement = corpus.movements.find((item) => item.id === work.movement);

  return (
    <article className="detail-page fade-in">
      <nav className="breadcrumb" aria-label="Fil d’Ariane">
        <Link to="/works">Œuvres</Link><span aria-hidden="true">/</span><span>{work.title}</span>
      </nav>
      <div className="detail-hero">
        <div className="detail-media-wrap">
          <WorkCover work={work} authorName={author?.name} className="detail-cover" />
        </div>
        <div>
          <PageHeader
            eyebrow={`${work.year} · ${work.genre}`}
            title={work.title}
            description={work.summary}
            actions={(
              <div className="detail-actions">
                {author && <Link to={`/authors/${author.id}`} className="button">{author.name}</Link>}
                <Link to={`/timeline#work-${work.id}`} className="button button-secondary">Voir sur la frise</Link>
              </div>
            )}
          />
          <div className="tag-row">
            {movement && <Link to={`/movements#${movement.id}`} className="badge badge-theme">{movement.name}</Link>}
            {(work.themes || []).map((theme) => <span key={theme} className="badge">{theme}</span>)}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-section detail-section-wide">
          <p className="eyebrow">Lecture</p>
          <h2>Extraits</h2>
          {work.excerpts?.length > 0 ? (
            <div className="quote-list">
              {work.excerpts.map((excerpt) => (
                <blockquote key={`${excerpt.chapter}-${excerpt.text}`}>
                  <p>{excerpt.text}</p>{excerpt.chapter && <footer>— {excerpt.chapter}</footer>}
                </blockquote>
              ))}
            </div>
          ) : <p className="muted">Aucun extrait court n’est renseigné.</p>}
          {work.externalLinks?.length > 0 && (
            <div className="detail-actions">
              {work.externalLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="button button-secondary">Lire sur {link.source}</a>)}
            </div>
          )}
        </section>

        <section className="detail-section detail-section-wide">
          <p className="eyebrow">Postérité</p>
          <h2>Adaptations</h2>
          {work.adaptations?.length > 0 ? (
            <div className="detail-link-list">
              {work.adaptations.map((adaptation) => (
                <div className="adaptation-entry" key={`${adaptation.title}-${adaptation.year}`}>
                  <a href={adaptation.link} target="_blank" rel="noopener noreferrer">
                    <span>{adaptation.title}</span><span>{adaptationMeta(adaptation)}</span>
                  </a>
                  {adaptation.yearNote && <p className="muted">{adaptation.yearNote}</p>}
                  {adaptation.yearSource && <p className="adaptation-source"><a href={adaptation.yearSource} target="_blank" rel="noopener noreferrer">Source de la date<span className="sr-only"> de {adaptation.title}</span></a>{adaptation.alternateYearSource && <> · <a href={adaptation.alternateYearSource} target="_blank" rel="noopener noreferrer">Notice alternative</a></>}</p>}
                </div>
              ))}
            </div>
          ) : <p className="muted">Aucune adaptation n’est encore renseignée.</p>}
        </section>
      </div>
    </article>
  );
}

export default WorkDetailPage;
