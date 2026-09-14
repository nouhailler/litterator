import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import HelpTooltip from '../components/HelpTooltip';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import LoadErrorState from '../components/LoadErrorState';
import { loadJson } from '../data/corpus';
import { buildGlossaryCategories, enrichGlossary, normalizeText } from '../data/glossary';
import { readPositivePage, updateUrlState } from '../utils/urlState';

const PAGE_SIZE = 24;

function GlossaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [terms, setTerms] = useState([]);
  const [glossaryMeta, setGlossaryMeta] = useState(null);
  const [glossaryCategories, setGlossaryCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedCategory = searchParams.get('category') || '';
  const selectedLetter = searchParams.get('letter') || '';
  const searchTerm = searchParams.get('q') || '';
  const requestedPage = readPositivePage(searchParams.get('page'));

  useEffect(() => {
    Promise.all([loadJson('/data/glossary.json'), loadJson('/data/glossary-categories.json')])
      .then(([glossaryData, categoriesData]) => {
        setTerms(glossaryData);
        setGlossaryMeta(categoriesData.meta);
        setGlossaryCategories(categoriesData.categories);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading && location.hash) {
      navigate(`/glossary/${decodeURIComponent(location.hash.slice(1))}`, { replace: true });
    }
  }, [isLoading, location.hash, navigate]);

  const enrichedTerms = useMemo(() => enrichGlossary(terms, glossaryCategories), [glossaryCategories, terms]);
  const categories = useMemo(() => buildGlossaryCategories(enrichedTerms, glossaryCategories), [enrichedTerms, glossaryCategories]);
  const letters = useMemo(
    () => [...new Set(enrichedTerms.map((term) => normalizeText(term.term).charAt(0).toUpperCase()))],
    [enrichedTerms],
  );

  const filteredTerms = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm.trim());
    return enrichedTerms.filter((term) => {
      const searchableText = normalizeText([term.term, term.category, term.definition, term.example, ...(term.relatedTerms || [])].join(' '));
      return (!selectedCategory || term.categoryId === selectedCategory)
        && (!selectedLetter || normalizeText(term.term).startsWith(selectedLetter.toLocaleLowerCase('fr-FR')))
        && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [enrichedTerms, searchTerm, selectedCategory, selectedLetter]);

  const totalPages = Math.max(1, Math.ceil(filteredTerms.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleTerms = filteredTerms.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = [searchTerm, selectedCategory, selectedLetter].filter(Boolean).length;
  const updateParams = (changes, options) => updateUrlState(searchParams, setSearchParams, changes, options);
  const resetFilters = () => {
    updateParams({ q: null, category: null, letter: null, page: null });
  };

  if (isLoading) return <div className="loading-state"><p>Chargement du glossaire…</p></div>;
  if (error) return <LoadErrorState title="Impossible de charger le glossaire" error={error} />;

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Outils d’analyse"
        title="Glossaire des termes littéraires"
        description="Retrouvez les notions utiles pour lire, commenter et comparer les textes : figures de style, registres, narration et mouvements."
        actions={<Link to="/help" className="context-help-link">Ouvrir l’aide sur le glossaire</Link>}
      >
        <HelpTooltip label="Aide sur le glossaire">Combinez recherche, catégories et lettres pour retrouver rapidement une notion.</HelpTooltip>
      </PageHeader>

      <div className="glossary-category-panel" aria-label="Catégories du glossaire">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedCategory === category.id ? 'category-filter active' : 'category-filter'}
            aria-pressed={selectedCategory === category.id}
            onClick={() => updateParams({ category: selectedCategory === category.id ? null : category.id, page: null })}
          >
            <span>{category.label}</span><strong>{category.terms.length}</strong>
          </button>
        ))}
      </div>

      <FilterPanel activeCount={activeFilterCount}>
        <div className="filter-group filter-group-wide">
          <label htmlFor="glossary-search">Rechercher un terme</label>
          <input id="glossary-search" type="search" value={searchTerm} onChange={(event) => updateParams({ q: event.target.value, page: null }, { replace: true })} placeholder="Métaphore, focalisation, réalisme…" />
        </div>
        <div className="filter-group">
          <label htmlFor="glossary-category">Catégorie</label>
          <select id="glossary-category" value={selectedCategory} onChange={(event) => updateParams({ category: event.target.value, page: null })}>
            <option value="">Toutes les catégories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </div>
        <button type="button" onClick={resetFilters} className="button button-secondary filter-reset" disabled={activeFilterCount === 0}>Réinitialiser</button>
      </FilterPanel>

      <div className="letter-filter" aria-label="Filtrer par lettre">
        <button type="button" className={!selectedLetter ? 'letter-button active' : 'letter-button'} aria-pressed={!selectedLetter} onClick={() => updateParams({ letter: null, page: null })}>Tous</button>
        {letters.map((letter) => (
          <button key={letter} type="button" className={selectedLetter === letter ? 'letter-button active' : 'letter-button'} aria-pressed={selectedLetter === letter} onClick={() => updateParams({ letter, page: null })}>{letter}</button>
        ))}
      </div>

      <div className="results-toolbar">
        <p><strong>{filteredTerms.length}</strong> termes trouvés</p>
        {glossaryMeta?.totalTerms && <p className="muted">{glossaryMeta.totalTerms} termes catalogués</p>}
      </div>

      {visibleTerms.length === 0 ? (
        <EmptyState>Essayez une autre recherche ou réinitialisez les filtres.</EmptyState>
      ) : (
        <div className="glossary-grid catalog-grid">
          {visibleTerms.map((term) => (
            <article key={term.id} className="card glossary-card catalog-card">
              <div className="glossary-card-header">
                <div><p className="glossary-letter">{term.term.charAt(0)}</p><h2 className="card-title">{term.term}</h2></div>
                <span className="badge badge-theme">{term.category}</span>
              </div>
              <p className="glossary-definition catalog-summary">{term.definition}</p>
              {term.isPendingDefinition && <p className="glossary-status">Fiche détaillée à compléter</p>}
              <div className="card-actions catalog-actions">
                <Link to={`/glossary/${term.id}`} className="button">Voir la définition</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filteredTerms.length}
        onPageChange={(page) => updateParams({ page: page === 1 ? null : page })}
      />
    </div>
  );
}

export default GlossaryPage;
