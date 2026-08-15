import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import MapPage from './pages/MapPage';
import MovementsPage from './pages/MovementsPage';
import AuthorsPage from './pages/AuthorsPage';
import WorksPage from './pages/WorksPage';
import GlossaryPage from './pages/GlossaryPage';
import HomePage from './pages/HomePage';
import packageInfo from '../package.json';
import './styles/global.css';

const appVersion = import.meta.env.VITE_COMMIT_SHA || packageInfo.version;
const githubRepositoryUrl = 'https://github.com/nouhailler/litterator';

function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const bugReportUrl = `mailto:contact@swinux.ch?subject=${encodeURIComponent('[Bug Report] Littérator')}&body=${encodeURIComponent(`Version : ${appVersion}\nOS : \nDescription du problème : \n\nÉtapes pour reproduire : `)}`;

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    // Vérifier si l'application est installée (PWA)
    setIsInstalled(standaloneQuery.matches);

    // Écouter les changements de mode d'affichage
    const handleDisplayModeChange = (e) => {
      setIsInstalled(e.matches);
    };
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    // Vérifier si une nouvelle version est disponible (pour la PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    return () => {
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-inner">
            <Link to="/" className="brand-link">
              <span className="brand-mark">L</span>
              <span className="brand-text">
                <span className="brand-title">Littérator</span>
                <span className="brand-subtitle">Littérature française depuis 1800</span>
              </span>
            </Link>

            <nav className="app-nav" aria-label="Navigation principale">
              <ul>
                <li><NavLink to="/" end>Accueil</NavLink></li>
                <li><NavLink to="/timeline">Frise</NavLink></li>
                <li><NavLink to="/map">Carte</NavLink></li>
                <li><NavLink to="/movements">Mouvements</NavLink></li>
                <li><NavLink to="/authors">Auteurs</NavLink></li>
                <li><NavLink to="/works">Œuvres</NavLink></li>
                <li><NavLink to="/glossary">Glossaire</NavLink></li>
                <li>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => setIsAboutOpen(true)}
                  >
                    À propos
                  </button>
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

        <main className="main-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
            onClick={() => setIsAboutOpen(false)}
          >
            <section
              className="about-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
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
                  onClick={() => setIsAboutOpen(false)}
                  aria-label="Fermer"
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
                      Documentation
                    </a>
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
                    React Leaflet, OpenStreetMap, CARTO, Wikimedia Commons, Wikidata, Open Library et
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
      </div>
    </Router>
  );
}

export default App;
