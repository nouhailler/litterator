import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const normalizeText = (value) =>
  value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const slugify = (value) =>
  normalizeText(value)
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function GlossaryPage() {
  const location = useLocation();
  const [terms, setTerms] = useState([]);
  const [glossaryMeta, setGlossaryMeta] = useState(null);
  const [glossaryCategories, setGlossaryCategories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [glossaryRes, categoriesRes, movementsRes, worksRes] = await Promise.all([
          fetch('/data/glossary.json'),
          fetch('/data/glossary-categories.json'),
          fetch('/data/movements.json'),
          fetch('/data/works.json'),
        ]);

        const glossaryData = await glossaryRes.json();
        const categoriesData = await categoriesRes.json();
        const movementsData = await movementsRes.json();
        const worksData = await worksRes.json();

        setTerms(glossaryData);
        setGlossaryMeta(categoriesData.meta);
        setGlossaryCategories(categoriesData.categories);
        setMovements(movementsData);
        setWorks(worksData);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du glossaire:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const enrichedTerms = useMemo(() => {
    const detailedTermsByName = new Map(
      terms.map((term) => [normalizeText(term.term), term]),
    );
    const catalogTermNames = new Set();
    const catalogTerms = glossaryCategories.flatMap((category) =>
      category.terms.map((termLabel) => {
        const detailedTerm = detailedTermsByName.get(normalizeText(termLabel));
        catalogTermNames.add(normalizeText(termLabel));

        return {
          ...(detailedTerm || {}),
          id: detailedTerm?.id || slugify(termLabel),
          term: detailedTerm?.term || termLabel,
          category: category.label,
          categoryId: category.id,
          definition: detailedTerm?.definition || 'Définition à compléter.',
          example: detailedTerm?.example || 'Cette entrée est classée dans le catalogue du glossaire et pourra recevoir une fiche détaillée.',
          isPendingDefinition: !detailedTerm,
        };
      }),
    );
    const uncataloguedTerms = terms
      .filter((term) => !catalogTermNames.has(normalizeText(term.term)))
      .map((term) => ({
        ...term,
        categoryId: `legacy-${slugify(term.category)}`,
        isPendingDefinition: false,
      }));

    return [...catalogTerms, ...uncataloguedTerms].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  }, [glossaryCategories, terms]);

  const categories = useMemo(() => {
    const uncataloguedCategoriesById = new Map();

    enrichedTerms
      .filter((term) => term.categoryId?.startsWith('legacy-'))
      .forEach((term) => {
        const existingCategory = uncataloguedCategoriesById.get(term.categoryId);

        if (existingCategory) {
          existingCategory.terms.push(term.term);
        } else {
          uncataloguedCategoriesById.set(term.categoryId, {
            id: term.categoryId,
            label: term.category,
            terms: [term.term],
          });
        }
      });

    return [...glossaryCategories, ...uncataloguedCategoriesById.values()];
  }, [enrichedTerms, glossaryCategories]);

  const letters = useMemo(
    () => [...new Set(enrichedTerms.map((term) => normalizeText(term.term).charAt(0).toUpperCase()))],
    [enrichedTerms],
  );

  const movementsById = useMemo(
    () => Object.fromEntries(movements.map((movement) => [movement.id, movement])),
    [movements],
  );

  const worksById = useMemo(
    () => Object.fromEntries(works.map((work) => [work.id, work])),
    [works],
  );

  const filteredTerms = enrichedTerms.filter((term) => {
    const normalizedSearch = normalizeText(searchTerm.trim());
    const matchesCategory = selectedCategory ? term.categoryId === selectedCategory : true;
    const matchesLetter = selectedLetter
      ? normalizeText(term.term).startsWith(selectedLetter.toLocaleLowerCase('fr-FR'))
      : true;
    const searchableText = normalizeText([
      term.term,
      term.category,
      term.definition,
      term.example,
      ...(term.relatedTerms || []),
    ].join(' '));
    const matchesSearch = normalizedSearch ? searchableText.includes(normalizedSearch) : true;

    return matchesCategory && matchesLetter && matchesSearch;
  });

  useEffect(() => {
    if (isLoading || !location.hash) {
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    const targetTerm = enrichedTerms.find((term) => term.id === targetId);

    if (!targetTerm) {
      return;
    }

    setSelectedCategory('');
    setSelectedLetter('');
    setSearchTerm('');

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [enrichedTerms, isLoading, location.hash]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedLetter('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Chargement du glossaire...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="eyebrow">Outils d'analyse</p>
        <h2>Glossaire des termes littéraires</h2>
        <p className="lead">
          Retrouvez les notions utiles pour lire, commenter et comparer les textes:
          figures de style, registres, narration, structure et mouvements.
        </p>
      </div>

      <div className="glossary-category-panel" aria-label="Catégories du glossaire">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedCategory === category.id ? 'category-filter active' : 'category-filter'}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
          >
            <span>{category.label}</span>
            <strong>{category.terms.length}</strong>
          </button>
        ))}
      </div>

      <div className="filters glossary-filters">
        <div className="filter-group">
          <label>Rechercher un terme</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ex: métaphore, focalisation, réalisme..."
          />
        </div>

        <div className="filter-group">
          <label>Catégorie</label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="button button-secondary"
        >
          Réinitialiser
        </button>
      </div>

      <div className="letter-filter" aria-label="Filtrer par lettre">
        <button
          type="button"
          className={!selectedLetter ? 'letter-button active' : 'letter-button'}
          onClick={() => setSelectedLetter('')}
        >
          Tous
        </button>
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            className={selectedLetter === letter ? 'letter-button active' : 'letter-button'}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="result-count">
        {filteredTerms.length} termes trouvés
        {glossaryMeta?.totalTerms && ` - ${glossaryMeta.totalTerms} termes catalogués`}
      </div>

      <div className="glossary-grid">
        {filteredTerms.map((term) => (
          <article key={term.id} id={term.id} className="card glossary-card">
            <div className="glossary-card-header">
              <div>
                <p className="glossary-letter">{term.term.charAt(0)}</p>
                <h3>{term.term}</h3>
              </div>
              <span className="badge badge-theme">{term.category}</span>
            </div>

            <p className="glossary-definition">{term.definition}</p>
            <p className="glossary-example">{term.example}</p>

            {term.isPendingDefinition && (
              <p className="glossary-status">Fiche détaillée à compléter</p>
            )}

            {term.relatedTerms?.length > 0 && (
              <div className="card-section">
                <h4>Notions liées</h4>
                <div className="tag-row">
                  {term.relatedTerms.map((relatedTermId) => {
                    const relatedTerm = enrichedTerms.find((item) => item.id === relatedTermId);

                    return relatedTerm ? (
                      <Link key={relatedTermId} to={`/glossary#${relatedTermId}`} className="badge badge-theme">
                        {relatedTerm.term}
                      </Link>
                    ) : (
                      <span key={relatedTermId} className="badge badge-theme">
                        {relatedTermId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {term.relatedMovements?.length > 0 && (
              <div className="card-section">
                <h4>Mouvements associés</h4>
                <div className="tag-row">
                  {term.relatedMovements.map((movementId) => {
                    const movement = movementsById[movementId];

                    return movement ? (
                      <Link key={movementId} to={`/movements#${movementId}`} className="badge badge-theme">
                        {movement.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {term.relatedWorks?.length > 0 && (
              <div className="card-section">
                <h4>Œuvres repères</h4>
                <div className="tag-row">
                  {term.relatedWorks.map((workId) => {
                    const work = worksById[workId];

                    return work ? (
                      <Link key={workId} to={`/works#${workId}`} className="badge badge-theme">
                        {work.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default GlossaryPage;
