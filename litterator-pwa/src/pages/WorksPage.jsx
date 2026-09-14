import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import WorkCover from '../components/WorkCover';
import LoadErrorState from '../components/LoadErrorState';
import { loadCoreCorpus } from '../data/corpus';
import { readEnum, readPositivePage, updateUrlState } from '../utils/urlState';

const PAGE_SIZE = 24;

function WorksPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [works, setWorks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedMovement = searchParams.get('movement') || '';
  const selectedGenre = searchParams.get('genre') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const selectedReadingAccess = readEnum(searchParams.get('access'), ['', 'public-domain-text'], '');
  const searchTerm = searchParams.get('q') || '';
  const sortOrder = readEnum(searchParams.get('sort'), ['chronological', 'reverse-chronological', 'alphabetical'], 'chronological');
  const requestedPage = readPositivePage(searchParams.get('page'));

  useEffect(() => {
    loadCoreCorpus()
      .then((corpus) => {
        setWorks(corpus.works);
        setAuthors(corpus.authors);
        setMovements(corpus.movements);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading && location.hash) {
      navigate(`/works/${decodeURIComponent(location.hash.slice(1))}`, { replace: true });
    }
  }, [isLoading, location.hash, navigate]);

  const authorsById = useMemo(
    () => Object.fromEntries(authors.map((author) => [author.id, author])),
    [authors],
  );
  const movementsById = useMemo(
    () => Object.fromEntries(movements.map((movement) => [movement.id, movement])),
    [movements],
  );
  const genres = useMemo(
    () => [...new Set(works.map((work) => work.genre))].sort((a, b) => a.localeCompare(b, 'fr')),
    [works],
  );

  const filteredWorks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fr-FR');
    const result = works.filter((work) => {
      const authorName = authorsById[work.author]?.name || '';
      const searchableText = `${work.title} ${work.summary || ''} ${authorName} ${(work.themes || []).join(' ')}`.toLocaleLowerCase('fr-FR');
      return (!selectedMovement || work.movement === selectedMovement)
        && (!selectedGenre || work.genre === selectedGenre)
        && (!selectedAuthor || work.author === selectedAuthor)
        && (selectedReadingAccess !== 'public-domain-text' || work.externalLinks?.length > 0)
        && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });

    return result.sort((a, b) => {
      if (sortOrder === 'reverse-chronological') return b.year - a.year;
      if (sortOrder === 'alphabetical') return a.title.localeCompare(b.title, 'fr');
      return a.year - b.year;
    });
  }, [authorsById, searchTerm, selectedAuthor, selectedGenre, selectedMovement, selectedReadingAccess, sortOrder, works]);

  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleWorks = filteredWorks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = [searchTerm, selectedMovement, selectedGenre, selectedAuthor, selectedReadingAccess].filter(Boolean).length;

  const updateParams = (changes, options) => updateUrlState(searchParams, setSearchParams, changes, options);

  const resetFilters = () => {
    updateParams({ q: null, movement: null, genre: null, author: null, access: null, page: null });
  };

  if (isLoading) return <div className="loading-state"><p>Chargement des œuvres…</p></div>;
  if (error) return <LoadErrorState title="Impossible de charger les œuvres" error={error} />;

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Bibliothèque"
        title="Œuvres de la littérature française"
        description="Filtrez le catalogue, puis ouvrez une fiche pour découvrir son contexte, ses thèmes, ses extraits et ses adaptations."
      />

      <FilterPanel activeCount={activeFilterCount}>
        <div className="filter-group filter-group-wide">
          <label htmlFor="work-search">Rechercher une œuvre</label>
          <input id="work-search" type="search" value={searchTerm} onChange={(event) => updateParams({ q: event.target.value, page: null }, { replace: true })} placeholder="Les Misérables, Madame Bovary…" />
        </div>
        <div className="filter-group">
          <label htmlFor="work-movement">Mouvement littéraire</label>
          <select id="work-movement" value={selectedMovement} onChange={(event) => updateParams({ movement: event.target.value, page: null })}>
            <option value="">Tous les mouvements</option>
            {movements.map((movement) => <option key={movement.id} value={movement.id}>{movement.name}</option>)}
          </select>
        </div>
        <div className="filter-group filter-group-compact">
          <label htmlFor="work-genre">Genre</label>
          <select id="work-genre" value={selectedGenre} onChange={(event) => updateParams({ genre: event.target.value, page: null })}>
            <option value="">Tous les genres</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="work-author">Auteur</label>
          <select id="work-author" value={selectedAuthor} onChange={(event) => updateParams({ author: event.target.value, page: null })}>
            <option value="">Tous les auteurs</option>
            {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
          </select>
        </div>
        <div className="filter-group filter-group-compact">
          <label htmlFor="work-access">Accès</label>
          <select id="work-access" value={selectedReadingAccess} onChange={(event) => updateParams({ access: event.target.value, page: null })}>
            <option value="">Toutes les œuvres</option>
            <option value="public-domain-text">Avec lien de lecture</option>
          </select>
        </div>
        <button type="button" onClick={resetFilters} className="button button-secondary filter-reset" disabled={activeFilterCount === 0}>Réinitialiser</button>
      </FilterPanel>

      <div className="results-toolbar">
        <p><strong>{filteredWorks.length}</strong> œuvres trouvées</p>
        <div className="compact-field">
          <label htmlFor="work-sort">Trier par</label>
          <select id="work-sort" value={sortOrder} onChange={(event) => updateParams({ sort: event.target.value === 'chronological' ? null : event.target.value, page: null })}>
            <option value="chronological">Date croissante</option>
            <option value="reverse-chronological">Date décroissante</option>
            <option value="alphabetical">Titre</option>
          </select>
        </div>
      </div>

      {visibleWorks.length === 0 ? (
        <EmptyState>Essayez de modifier ou de réinitialiser les filtres.</EmptyState>
      ) : (
        <div className="content-grid catalog-grid">
          {visibleWorks.map((work) => {
            const author = authorsById[work.author];
            const movement = movementsById[work.movement];
            return (
              <article key={work.id} className="card entity-card work-card catalog-card">
                <WorkCover work={work} authorName={author?.name} className="work-cover catalog-media" decorative />
                <div className="catalog-card-heading">
                  <p className="meta-line">{work.year} · {work.genre}</p>
                  <h2 className="card-title">{work.title}</h2>
                  {author && <p>{author.name}</p>}
                </div>
                <p className="catalog-summary">{work.summary}</p>
                <div className="tag-row" aria-label="Thèmes et mouvement">
                  {movement && <span className="badge badge-theme">{movement.name}</span>}
                  {(work.themes || []).slice(0, 3).map((theme) => <span key={theme} className="badge">{theme}</span>)}
                </div>
                <div className="card-actions catalog-actions">
                  <Link to={`/works/${work.id}`} className="button">Voir la fiche</Link>
                  {author && <Link to={`/authors/${author.id}`} className="button button-secondary">L’auteur</Link>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filteredWorks.length}
        onPageChange={(page) => updateParams({ page: page === 1 ? null : page })}
      />
    </div>
  );
}

export default WorksPage;
