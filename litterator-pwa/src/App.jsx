import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import FirstLaunchNotice from './legal/FirstLaunchNotice';
import ConnectivityBanner from './components/ConnectivityBanner';
import packageInfo from '../package.json';
import './styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const MovementsPage = lazy(() => import('./pages/MovementsPage'));
const AuthorsPage = lazy(() => import('./pages/AuthorsPage'));
const AuthorDetailPage = lazy(() => import('./pages/AuthorDetailPage'));
const WorksPage = lazy(() => import('./pages/WorksPage'));
const WorkDetailPage = lazy(() => import('./pages/WorkDetailPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const GlossaryDetailPage = lazy(() => import('./pages/GlossaryDetailPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const DocumentationPage = lazy(() => import('./docs/DocumentationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LegalPage = lazy(() => import('./legal/LegalPage'));

const appVersion = import.meta.env.VITE_COMMIT_SHA || packageInfo.version;
const githubRepositoryUrl = 'https://github.com/nouhailler/litterator';

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  } catch {
    return 'light';
  }
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme);
  const aboutDialogRef = useRef(null);
  const aboutTriggerRef = useRef(null);
  const aboutCloseRef = useRef(null);
  const utilityMenuRef = useRef(null);
  const bugReportUrl = `mailto:contact@swinux.ch?subject=${encodeURIComponent('[Bug Report] Littérator')}&body=${encodeURIComponent(`Version : ${appVersion}\nOS : \nDescription du problème : \n\nÉtapes pour reproduire : `)}`;

  const closeNav = () => {
    setIsNavOpen(false);
    if (utilityMenuRef.current) {
      utilityMenuRef.current.open = false;
    }
  };

  const scrollHomeToTop = () => {
    closeNav();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  const openAbout = () => {
    closeNav();
    setIsAboutOpen(true);
  };

  const closeAbout = () => {
    setIsAboutOpen(false);
    window.requestAnimationFrame(() => aboutTriggerRef.current?.focus());
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Le thème reste actif pour la session si le stockage local est indisponible.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17130f' : '#6f1d1b');
  }, [theme]);

  useEffect(() => {
    if (!isAboutOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAbout();
        return;
      }
      if (event.key !== 'Tab' || !aboutDialogRef.current) return;
      const focusable = [...aboutDialogRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => aboutCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAboutOpen]);

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    // Vérifier si l'application est installée (PWA)
    setIsInstalled(standaloneQuery.matches);

    // Écouter les changements de mode d'affichage
    const handleDisplayModeChange = (e) => {
      setIsInstalled(e.matches);
    };
    standaloneQuery.addEventListener('change', handleDisplayModeChange);
    return () => {
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <a className="skip-link" href="#main-content">Aller au contenu</a>
        <header className="app-header">
          <div className="header-inner">
            <Link to="/" className="brand-link" onClick={scrollHomeToTop}>
              <span className="brand-mark">L</span>
              <span className="brand-text">
                <span className="brand-title">Littérator</span>
                <span className="brand-subtitle">Littérature française depuis 1800</span>
              </span>
            </Link>

            <button
              type="button"
              className={`menu-toggle ${isNavOpen ? 'is-open' : ''}`}
              onClick={() => setIsNavOpen((isOpen) => !isOpen)}
              aria-expanded={isNavOpen}
              aria-controls="main-navigation"
              aria-label={isNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <nav
              id="main-navigation"
              className={`app-nav ${isNavOpen ? 'is-open' : ''}`}
              aria-label="Navigation principale"
            >
              <ul>
                <li><NavLink to="/" end onClick={scrollHomeToTop}>Accueil</NavLink></li>
                <li><NavLink to="/search" onClick={closeNav}>Recherche</NavLink></li>
                <li><NavLink to="/timeline" onClick={closeNav}>Frise</NavLink></li>
                <li><NavLink to="/map" onClick={closeNav}>Carte</NavLink></li>
                <li><NavLink to="/movements" onClick={closeNav}>Mouvements</NavLink></li>
                <li><NavLink to="/authors" onClick={closeNav}>Auteurs</NavLink></li>
                <li><NavLink to="/works" onClick={closeNav}>Œuvres</NavLink></li>
                <li><NavLink to="/glossary" onClick={closeNav}>Glossaire</NavLink></li>
                <li className="utility-menu-item">
                  <details className="utility-menu" ref={utilityMenuRef}>
                    <summary>Plus</summary>
                    <ul className="utility-menu-list">
                      <li><NavLink to="/help" onClick={closeNav}>Aide</NavLink></li>
                      <li><NavLink to="/docs" onClick={closeNav}>Documentation</NavLink></li>
                      <li><NavLink to="/settings" onClick={closeNav}>Paramètres</NavLink></li>
                      <li><NavLink to="/legal" onClick={closeNav}>Mentions légales</NavLink></li>
                      <li>
                        <button type="button" className="nav-button" onClick={openAbout} ref={aboutTriggerRef}>À propos</button>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </nav>

            {isInstalled && (
              <div className="badge pwa-badge">
                Mode PWA activé
              </div>
            )}
          </div>
        </header>

        <ConnectivityBanner />

        <main className="main-container" id="main-content">
          <Suspense fallback={<div className="loading-state"><p>Chargement de la page…</p></div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/movements" element={<MovementsPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/authors/:authorId" element={<AuthorDetailPage />} />
              <Route path="/works" element={<WorksPage />} />
              <Route path="/works/:workId" element={<WorkDetailPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/glossary/:termId" element={<GlossaryDetailPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/docs/*" element={<DocumentationPage />} />
              <Route path="/settings" element={<SettingsPage theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="app-footer">
          <div className="footer-inner">
            <p>Littérator - Découvrez la littérature française depuis 1800</p>
            <p className="footer-note">
              PWA locale - données stockées sur votre appareil
            </p>
          </div>
        </footer>

        {isAboutOpen && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={closeAbout}
          >
            <section
              className="about-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
              ref={aboutDialogRef}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div className="about-title-group">
                  <span className="brand-mark" aria-hidden="true">L</span>
                  <div>
                    <p className="eyebrow">À propos</p>
                    <h2 id="about-title">Littérator</h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeAbout}
                  aria-label="Fermer"
                  ref={aboutCloseRef}
                >
                  ×
                </button>
              </div>

              <p className="about-description">
                Une PWA éditoriale pour explorer, situer et relier la littérature française depuis 1800.
              </p>

              <div className="about-grid">
                <section>
                  <h3>Informations essentielles</h3>
                  <dl className="about-list">
                    <div>
                      <dt>Nom</dt>
                      <dd>Littérator</dd>
                    </div>
                    <div>
                      <dt>Version</dt>
                      <dd>{appVersion}</dd>
                    </div>
                    <div>
                      <dt>Auteur / développeur</dt>
                      <dd>Patrick Nouhailler, swinux.ch</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h3>Informations complémentaires & liens</h3>
                  <div className="about-link-list">
                    <a href={githubRepositoryUrl} target="_blank" rel="noopener noreferrer">
                      Dépôt source sur GitHub
                    </a>
                    <a href={`${githubRepositoryUrl}#readme`} target="_blank" rel="noopener noreferrer">
                      Documentation GitHub
                    </a>
                    <Link to="/docs" onClick={closeAbout}>
                      Documentation intégrée
                    </Link>
                    <a href={`${githubRepositoryUrl}/blob/main/litterator-pwa/CHANGELOG.md`} target="_blank" rel="noopener noreferrer">
                      Changelog
                    </a>
                    <a href="https://swinux.ch/applications/" target="_blank" rel="noopener noreferrer">
                      Portfolio des applications
                    </a>
                  </div>
                </section>

                <section>
                  <h3>Licence & crédits</h3>
                  <p>
                    Licence : non précisée dans le dépôt.
                  </p>
                  <p>
                    Librairies et ressources majeures : React, Vite, vite-plugin-pwa, Workbox, Leaflet,
                    React Leaflet, OpenStreetMap, Wikimedia Commons, Wikidata, Open Library et
                    Project Gutenberg.
                  </p>
                </section>

                <section>
                  <h3>Contact & support</h3>
                  <p>Si vous êtes un utilisateur :</p>
                  <a href={bugReportUrl}>
                    Signaler un problème par e-mail
                  </a>
                  <p>Si vous êtes un développeur :</p>
                  <a href="https://github.com/nouhailler/litterator/issues/new" target="_blank" rel="noopener noreferrer">
                    Ouvrir une issue GitHub
                  </a>
                </section>
              </div>
            </section>
          </div>
        )}

        <FirstLaunchNotice />
      </div>
    </Router>
  );
}

export default App;
