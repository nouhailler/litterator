import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import MapPage from './pages/MapPage';
import MovementsPage from './pages/MovementsPage';
import AuthorsPage from './pages/AuthorsPage';
import WorksPage from './pages/WorksPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import './styles/global.css';

function App() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est installée (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Écouter les changements de mode d'affichage
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      setIsInstalled(e.matches);
    });

    // Vérifier si une nouvelle version est disponible (pour la PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <header>
          <h1>Littérator</h1>
          <nav>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/timeline">Frise Chronologique</Link></li>
              <li><Link to="/map">Carte Littéraire</Link></li>
              <li><Link to="/movements">Mouvements</Link></li>
              <li><Link to="/authors">Auteurs</Link></li>
              <li><Link to="/works">Œuvres</Link></li>
              <li><Link to="/settings">Paramétrage</Link></li>
            </ul>
          </nav>
          {isInstalled && (
            <div className="badge" style={{ backgroundColor: 'var(--accent-color)', marginTop: '10px' }}>
              Mode PWA activé
            </div>
          )}
        </header>

        <main className="main-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer>
          <p>Littérator - Découvrez la littérature française depuis 1800</p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            Une PWA 100% locale - Toutes les données sont stockées sur votre appareil
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
