import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import AuthorPortrait from '../components/AuthorPortrait';
import LoadErrorState from '../components/LoadErrorState';
import { loadCoreCorpus } from '../data/corpus';
import { readEnum, readPositivePage, updateUrlState } from '../utils/urlState';

const PAGE_SIZE = 24;

function AuthorsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authors, setAuthors] = useState([]);
  const [movements, setMovements] = useState([]);
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedMovement = searchParams.get('movement') || '';
  const searchTerm = searchParams.get('q') || '';
  const sortOrder = readEnum(searchParams.get('sort'), ['chronological', 'alphabetical'], 'chronological');
  const requestedPage = readPositivePage(searchParams.get('page'));

  useEffect(() => {
    loadCoreCorpus()
      .then((corpus) => {
        setAuthors(corpus.authors);
        setMovements(corpus.movements);
        setWorks(corpus.works);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading && location.hash) {
      navigate(`/authors/${decodeURIComponent(location.hash.slice(1))}`, { replace: true });
    }
  }, [isLoading, location.hash, navigate]);

  const movementsById = useMemo(
    () => Object.fromEntries(movements.map((movement) => [movement.id, movement])),
    [movements],
  );

  const worksByAuthor = useMemo(() => works.reduce((index, work) => {
    index[work.author] = [...(index[work.author] || []), work];
    return index;
  }, {}), [works]);

  const filteredAuthors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fr-FR');
    const result = authors.filter((author) => {
      const matchesMovement = selectedMovement ? author.movements.includes(selectedMovement) : true;
      const searchableText = `${author.name} ${author.full_name || ''} ${author.bio || ''}`.toLocaleLowerCase('fr-FR');
      return matchesMovement && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });

    return result.sort((a, b) => sortOrder === 'alphabetical'
      ? a.name.localeCompare(b.name, 'fr')
      : a.birth.year - b.birth.year);
  }, [authors, searchTerm, selectedMovement, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAuthors.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleAuthors = filteredAuthors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = Number(Boolean(searchTerm)) + Number(Boolean(selectedMovement));

  const updateParams = (changes, options) => updateUrlState(searchParams, setSearchParams, changes, options);

  const resetFilters = () => {
    updateParams({ q: null, movement: null, page: null });
  };

  if (isLoading) {
    return <div className="loading-state"><p>Chargement des auteurs…</p></div>;
  }

  if (error) {
    return <LoadErrorState title="Impossible de charger les auteurs" error={error} />;
  }

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Fiches biographiques"
        title="Auteurs de la littérature française"
        description="Parcourez les auteurs du corpus, puis ouvrez une fiche pour consulter leur parcours, leurs œuvres et leurs repères."
      />

      <FilterPanel activeCount={activeFilterCount}>
        <div className="filter-group filter-group-wide">
          <label htmlFor="author-search">Rechercher un auteur</label>
          <input
            id="author-search"
            type="search"
            value={searchTerm}
            onChange={(event) => updateParams({ q: event.target.value, page: null }, { replace: true })}
            placeholder="Victor Hugo, Camus…"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="author-movement">Mouvement littéraire</label>
          <select id="author-movement" value={selectedMovement} onChange={(event) => updateParams({ movement: event.target.value, page: null })}>
            <option value="">Tous les mouvements</option>
            {movements.map((movement) => <option key={movement.id} value={movement.id}>{movement.name}</option>)}
          </select>
        </div>
        <button type="button" onClick={resetFilters} className="button button-secondary filter-reset" disabled={activeFilterCount === 0}>
          Réinitialiser
        </button>
      </FilterPanel>

      <div className="results-toolbar">
        <p><strong>{filteredAuthors.length}</strong> auteurs trouvés</p>
        <div className="compact-field">
          <label htmlFor="author-sort">Trier par</label>
          <select id="author-sort" value={sortOrder} onChange={(event) => updateParams({ sort: event.target.value === 'chronological' ? null : event.target.value, page: null })}>
            <option value="chronological">Date de naissance</option>
            <option value="alphabetical">Nom</option>
          </select>
        </div>
      </div>

      {visibleAuthors.length === 0 ? (
        <EmptyState>Essayez de modifier ou de réinitialiser les filtres.</EmptyState>
      ) : (
        <div className="content-grid catalog-grid">
          {visibleAuthors.map((author) => {
            const authorWorks = worksByAuthor[author.id] || [];
            const authorMovements = author.movements.map((id) => movementsById[id]).filter(Boolean);
            return (
              <article key={author.id} className="card entity-card author-card catalog-card">
                <AuthorPortrait author={author} className="author-portrait catalog-media" decorative />
                <div className="catalog-card-heading">
                  <p className="meta-line">{author.birth.year}–{author.death?.year || 'aujourd’hui'}</p>
                  <h2 className="card-title">{author.name}</h2>
                </div>
                <p className="catalog-summary">{author.bio}</p>
                <div className="tag-row" aria-label="Mouvements associés">
                  {authorMovements.slice(0, 3).map((movement) => (
                    <span key={movement.id} className="badge badge-theme">{movement.name}</span>
                  ))}
                </div>
                {authorWorks.length > 0 && (
                  <p className="catalog-context">
                    {authorWorks.slice(0, 2).map((work) => work.title).join(' · ')}
                    {authorWorks.length > 2 ? ` · +${authorWorks.length - 2}` : ''}
                  </p>
                )}
                <div className="card-actions catalog-actions">
                  <Link to={`/authors/${author.id}`} className="button">Voir la fiche</Link>
                  <Link to={`/timeline#author-birth-${author.id}`} className="button button-secondary">Sur la frise</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filteredAuthors.length}
        onPageChange={(page) => updateParams({ page: page === 1 ? null : page })}
      />
    </div>
  );
}

export default AuthorsPage;
