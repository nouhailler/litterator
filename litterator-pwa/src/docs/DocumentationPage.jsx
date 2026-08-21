import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import packageInfo from '../../package.json';
import {
  docPages,
  documentationHomeLinks,
  documentationUpdatedAt,
  documentationVersion,
} from './documentationData';

const appVersion = import.meta.env.VITE_COMMIT_SHA || packageInfo.version;

const normalizeText = (value) =>
  value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const stringifySection = (section) => [
  section.title,
  ...(section.content || []),
  ...(section.list || []),
  ...(section.faq || []).flat(),
  ...(section.table?.headers || []),
  ...(section.table?.rows || []).flat(),
].join(' ');

const getPageText = (page) =>
  normalizeText([
    page.title,
    page.category,
    page.description,
    ...page.sections.map(stringifySection),
  ].join(' '));

const renderSection = (section) => (
  <section key={section.title} id={normalizeText(section.title).replace(/\s+/g, '-')}>
    <h2>{section.title}</h2>

    {section.content?.map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}

    {section.list && (
      <ul>
        {section.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}

    {section.faq && (
      <div className="doc-faq-list">
        {section.faq.map(([question, answer]) => (
          <article key={question} className="doc-faq-item">
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    )}

    {section.table && (
      <div className="doc-table-wrap">
        <table>
          <thead>
            <tr>
              {section.table.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

function DocumentationHome({ searchTerm, setSearchTerm, filteredPages }) {
  return (
    <div className="documentation-page fade-in">
      <header className="doc-hero">
        <p className="eyebrow">Documentation</p>
        <h1>Littérator</h1>
        <p className="lead">
          Documentation utilisateur, administrateur et developpeur pour la PWA Littérator.
        </p>
        <dl className="doc-meta">
          <div>
            <dt>Version application</dt>
            <dd>{appVersion}</dd>
          </div>
          <div>
            <dt>Version documentation</dt>
            <dd>{documentationVersion}</dd>
          </div>
          <div>
            <dt>Mise a jour</dt>
            <dd>{documentationUpdatedAt}</dd>
          </div>
        </dl>
      </header>

      <section className="doc-search-panel" aria-labelledby="doc-search-title">
        <div>
          <p className="eyebrow">Recherche globale</p>
          <h2 id="doc-search-title">Rechercher dans la documentation</h2>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Ex: offline, export, cache, mentions legales..."
          aria-label="Rechercher dans la documentation"
        />
      </section>

      <section className="doc-quick-grid" aria-label="Acces rapides">
        {documentationHomeLinks.map(([path, label]) => (
          <Link key={path} to={path} className="doc-quick-link">
            {label}
          </Link>
        ))}
      </section>

      <section className="doc-results" aria-labelledby="doc-results-title">
        <div className="section-header">
          <div>
            <p className="eyebrow">Sommaire</p>
            <h2 id="doc-results-title">Table des matieres</h2>
          </div>
          <span className="result-count">{filteredPages.length} pages</span>
        </div>
        <div className="doc-result-list">
          {filteredPages.map((page) => (
            <Link key={page.path} to={page.path} className="doc-result-card">
              <span className="badge">{page.category}</span>
              <h3>{page.title}</h3>
              <p>{page.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentationArticle({ page }) {
  const currentIndex = docPages.findIndex((item) => item.path === page.path);
  const previousPage = docPages[currentIndex - 1];
  const nextPage = docPages[currentIndex + 1];

  return (
    <article className="documentation-page doc-article fade-in">
      <nav className="doc-breadcrumb" aria-label="Fil d Ariane">
        <Link to="/docs">Documentation</Link>
        <span aria-hidden="true">/</span>
        <span>{page.title}</span>
      </nav>

      <div className="doc-article-layout">
        <aside className="doc-sidebar" aria-label="Navigation documentation">
          <Link to="/docs" className="button button-secondary">Sommaire</Link>
          <Link to="/docs/troubleshooting" className="button button-secondary">Depannage</Link>
          <Link to="/docs/faq" className="button button-secondary">FAQ</Link>
          <nav>
            {docPages.map((item) => (
              <Link key={item.path} to={item.path} className={item.path === page.path ? 'active' : ''}>
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="doc-content">
          <header className="page-header">
            <p className="eyebrow">{page.category}</p>
            <h1>{page.title}</h1>
            <p className="lead">{page.description}</p>
          </header>

          {page.sections.length > 1 && (
            <nav className="doc-local-toc" aria-label="Table des matieres locale">
              <p className="eyebrow">Dans cette page</p>
              {page.sections.map((section) => (
                <a key={section.title} href={`#${normalizeText(section.title).replace(/\s+/g, '-')}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          )}

          <div className="doc-section-stack">
            {page.sections.map(renderSection)}
          </div>

          {page.links?.length > 0 && (
            <section className="doc-related" aria-labelledby="doc-related-title">
              <h2 id="doc-related-title">Voir aussi</h2>
              <div>
                {page.links.map((path) => {
                  const linkedPage = docPages.find((item) => item.path === path);
                  return (
                    <Link key={path} to={path}>
                      {linkedPage?.title || path}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <nav className="doc-prev-next" aria-label="Navigation precedent suivant">
            {previousPage ? <Link to={previousPage.path}>Precedent: {previousPage.title}</Link> : <span />}
            {nextPage ? <Link to={nextPage.path}>Suivant: {nextPage.title}</Link> : <span />}
          </nav>
        </div>
      </div>
    </article>
  );
}

function DocumentationPage() {
  const { pathname } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const query = normalizeText(searchTerm.trim());

  const filteredPages = useMemo(() => {
    if (!query) {
      return docPages;
    }

    return docPages.filter((page) => getPageText(page).includes(query));
  }, [query]);

  if (pathname === '/docs' || pathname === '/docs/') {
    return (
      <DocumentationHome
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredPages={filteredPages}
      />
    );
  }

  const page = docPages.find((item) => item.path === pathname);

  if (!page) {
    return <Navigate to="/docs" replace />;
  }

  return <DocumentationArticle page={page} />;
}

export default DocumentationPage;
