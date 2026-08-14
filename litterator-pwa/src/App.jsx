import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import MapPage from './pages/MapPage';
import MovementsPage from './pages/MovementsPage';
import AuthorsPage from './pages/AuthorsPage';
import WorksPage from './pages/WorksPage';
import GlossaryPage from './pages/GlossaryPage';
import HomePage from './pages/HomePage';
import './styles/global.css';

function App() {
  const [isInstalled, setIsInstalled] = useState(false);

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
      </div>
    </Router>
  );
}

export default App;
