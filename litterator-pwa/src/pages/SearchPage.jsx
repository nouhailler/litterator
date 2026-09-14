import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadErrorState from '../components/LoadErrorState';
import { loadCoreCorpus, loadJson } from '../data/corpus';
import { enrichGlossary, normalizeText } from '../data/glossary';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [data, setData] = useState({ authors: [], works: [], movements: [], terms: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      loadCoreCorpus(),
      loadJson('/data/glossary.json'),
      loadJson('/data/glossary-categories.json'),
    ]).then(([corpus, terms, categoriesData]) => {
      setData({ ...corpus, terms: enrichGlossary(terms, categoriesData.categories) });
    }).catch(setError).finally(() => setIsLoading(false));
  }, []);

  const updateQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const normalized = normalizeText(query.trim());
    if (normalized.length < 2) return { authors: [], works: [], terms: [] };
    const includes = (value) => normalizeText(value).includes(normalized);
    return {
      authors: data.authors.filter((author) => includes(`${author.name} ${author.full_name || ''} ${author.bio || ''}`)).slice(0, 12),
      works: data.works.filter((work) => includes(`${work.title} ${work.summary || ''} ${(work.themes || []).join(' ')}`)).slice(0, 12),
      terms: data.terms.filter((term) => includes(`${term.term} ${term.definition} ${term.category}`)).slice(0, 12),
    };
  }, [data, query]);

  const totalVisible = results.authors.length + results.works.length + results.terms.length;

  if (error) return <LoadErrorState title="Recherche indisponible" error={error} />;

  return (
    <div className="search-page fade-in">
      <PageHeader
        eyebrow="Recherche globale"
        title="Explorer tout Littérator"
        description="Recherchez simultanément parmi les auteurs, les œuvres et les notions du glossaire."
      />
      <div className="global-search-box">
        <label htmlFor="global-search">Votre recherche</label>
        <input id="global-search" type="search" autoFocus value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Un auteur, une œuvre, une notion…" />
      </div>

      {isLoading ? <div className="loading-state"><p>Recherche dans le corpus…</p></div> : null}
      {!isLoading && query.trim().length < 2 && <p className="search-hint">Saisissez au moins deux caractères pour lancer la recherche.</p>}
      {!isLoading && query.trim().length >= 2 && totalVisible === 0 && <p className="search-hint">Aucun résultat. Essayez un terme plus court ou une autre orthographe.</p>}

      {totalVisible > 0 && (
        <div className="search-results" aria-live="polite">
          <SearchGroup title="Auteurs" count={results.authors.length} allHref={`/authors`}>
            {results.authors.map((author) => <Link key={author.id} to={`/authors/${author.id}`}><strong>{author.name}</strong><span>{author.birth.year}–{author.death?.year || 'aujourd’hui'}</span></Link>)}
          </SearchGroup>
          <SearchGroup title="Œuvres" count={results.works.length} allHref="/works">
            {results.works.map((work) => <Link key={work.id} to={`/works/${work.id}`}><strong>{work.title}</strong><span>{work.year} · {work.genre}</span></Link>)}
          </SearchGroup>
          <SearchGroup title="Glossaire" count={results.terms.length} allHref="/glossary">
            {results.terms.map((term) => <Link key={term.id} to={`/glossary/${term.id}`}><strong>{term.term}</strong><span>{term.category}</span></Link>)}
          </SearchGroup>
        </div>
      )}
    </div>
  );
}

function SearchGroup({ title, count, allHref, children }) {
  if (count === 0) return null;
  return (
    <section className="search-group">
      <div className="section-header"><h2>{title}</h2><Link to={allHref} className="context-help-link">Voir le catalogue</Link></div>
      <div className="search-result-list">{children}</div>
    </section>
  );
}

export default SearchPage;
