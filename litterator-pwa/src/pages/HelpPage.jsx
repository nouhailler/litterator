import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import packageInfo from '../../package.json';

const appVersion = import.meta.env.VITE_COMMIT_SHA || packageInfo.version;

const helpSections = [
  {
    id: 'navigation',
    title: 'Se repérer dans Littérator',
    type: 'Aide',
    body: 'Utilisez Accueil pour revenir au tableau de bord, Frise pour situer les événements, Carte pour explorer les lieux, puis Auteurs, Œuvres et Glossaire pour approfondir.',
  },
  {
    id: 'timeline',
    title: 'Utiliser la frise chronologique',
    type: 'Tutoriel',
    body: 'Filtrez par type, mouvement ou auteur. Les événements sont ordonnés par date et les cartes renvoient vers les fiches liées.',
  },
  {
    id: 'map',
    title: 'Explorer la carte littéraire',
    type: 'Tutoriel',
    body: 'Choisissez un mouvement ou un auteur, touchez un marqueur, puis utilisez la fiche du lieu pour comprendre les liens avec le corpus.',
  },
  {
    id: 'glossary',
    title: 'Trouver une notion dans le glossaire',
    type: 'Tutoriel',
    body: 'Recherchez un terme, filtrez par catégorie ou par initiale, puis ouvrez les notions liées, mouvements associés et œuvres repères.',
  },
  {
    id: 'data',
    title: 'Importer ou exporter des données',
    type: 'Aide',
    body: 'Les paramètres permettent de générer un fichier JSON modifié ou d’exporter le corpus existant. Après remplacement des fichiers, utilisez la mise à jour PWA si l’application installée garde une ancienne version.',
  },
];

const faqs = [
  {
    question: 'Pourquoi l’application affiche-t-elle parfois une ancienne version ?',
    answer: 'Une PWA conserve des fichiers en cache pour fonctionner vite et hors ligne. Utilisez Paramètres > Mise à jour après un déploiement terminé.',
  },
  {
    question: 'Les données sont-elles envoyées sur un serveur ?',
    answer: 'Non. Le corpus est chargé depuis les fichiers locaux publiés avec l’application. Les exports créent des fichiers sur votre appareil.',
  },
  {
    question: 'Comment trouver rapidement un auteur ou une œuvre ?',
    answer: 'Passez par les pages Auteurs ou Œuvres, puis utilisez les filtres et la recherche de la page concernée.',
  },
  {
    question: 'Comment signaler un problème ?',
    answer: 'Utilisez le bloc Contact support de cette page. Le message e-mail contient automatiquement la version et les informations techniques utiles.',
  },
  {
    question: 'Le tutoriel est-il réaccessible ?',
    answer: 'Oui. Cette page d’aide contient un tutoriel interactif que vous pouvez relancer à tout moment.',
  },
];

const tutorialSteps = [
  {
    title: 'Commencer par la vue d’ensemble',
    body: 'Depuis Accueil, ouvrez la frise ou la carte selon votre objectif: chronologie ou géographie.',
    link: '/',
    linkLabel: 'Aller à l’accueil',
  },
  {
    title: 'Filtrer le corpus',
    body: 'Sur la frise, combinez type, mouvement et auteur pour isoler une période ou un parcours littéraire.',
    link: '/timeline',
    linkLabel: 'Ouvrir la frise',
  },
  {
    title: 'Croiser avec les lieux',
    body: 'Sur la carte, sélectionnez un auteur ou un mouvement et touchez les marqueurs pour lire les liens associés.',
    link: '/map',
    linkLabel: 'Ouvrir la carte',
  },
  {
    title: 'Approfondir les notions',
    body: 'Dans le glossaire, recherchez une notion et suivez les liens vers les œuvres et mouvements liés.',
    link: '/glossary',
    linkLabel: 'Ouvrir le glossaire',
  },
];

const normalizeText = (value) =>
  value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getDiagnostics = () => {
  const nav = window.navigator;
  const uaData = nav.userAgentData;

  return {
    version: appVersion,
    url: window.location.href,
    platform: uaData?.platform || nav.platform || 'non disponible',
    mobile: uaData ? (uaData.mobile ? 'oui' : 'non') : 'non disponible',
    model: 'non disponible dans ce navigateur',
    os: nav.userAgent || 'non disponible',
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: nav.language || 'non disponible',
  };
};

const buildSupportHref = () => {
  const diagnostics = getDiagnostics();
  const body = [
    'Bonjour,',
    '',
    'Je rencontre un problème avec Littérator.',
    '',
    'Description du problème :',
    '',
    'Étapes pour reproduire :',
    '1. ',
    '',
    'Diagnostic automatique :',
    `Version : ${diagnostics.version}`,
    `URL : ${diagnostics.url}`,
    `Plateforme : ${diagnostics.platform}`,
    `Mobile : ${diagnostics.mobile}`,
    `Modèle : ${diagnostics.model}`,
    `OS / navigateur : ${diagnostics.os}`,
    `Écran : ${diagnostics.screen}`,
    `Viewport : ${diagnostics.viewport}`,
    `Langue : ${diagnostics.language}`,
  ].join('\n');

  return `mailto:contact@swinux.ch?subject=${encodeURIComponent('[Support] Littérator')}&body=${encodeURIComponent(body)}`;
};

function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const searchableItems = useMemo(() => [
    ...helpSections.map((item) => ({ ...item, kind: item.type })),
    ...faqs.map((item, index) => ({
      id: `faq-${index}`,
      title: item.question,
      body: item.answer,
      kind: 'FAQ',
    })),
  ], []);

  const filteredItems = useMemo(() => {
    const query = normalizeText(searchTerm.trim());

    if (!query) {
      return searchableItems;
    }

    return searchableItems.filter((item) =>
      normalizeText(`${item.kind} ${item.title} ${item.body}`).includes(query),
    );
  }, [searchTerm, searchableItems]);

  const step = tutorialSteps[activeStep];

  return (
    <div className="fade-in">
      <div className="page-header help-page-header">
        <p className="eyebrow">Aide et support</p>
        <h2>Centre d’aide Littérator</h2>
        <p className="lead">
          Recherchez une réponse, relancez le tutoriel ou contactez le support sans quitter l’application.
        </p>
      </div>

      <div className="help-search">
        <label htmlFor="help-search-input">Rechercher dans l’aide</label>
        <input
          id="help-search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Ex: mise à jour, carte, frise, export..."
        />
      </div>

      <section className="help-layout">
        <div className="help-main">
          <section className="card help-tutorial" aria-labelledby="tutorial-title">
            <div className="help-section-heading">
              <div>
                <p className="eyebrow">Tutoriel interactif</p>
                <h3 id="tutorial-title">{step.title}</h3>
              </div>
              <span className="badge">{activeStep + 1} / {tutorialSteps.length}</span>
            </div>
            <p>{step.body}</p>
            <div className="tutorial-progress" aria-hidden="true">
              {tutorialSteps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={index === activeStep ? 'active' : ''}
                  onClick={() => setActiveStep(index)}
                  aria-label={`Étape ${index + 1}`}
                />
              ))}
            </div>
            <div className="help-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setActiveStep(Math.max(activeStep - 1, 0))}
                disabled={activeStep === 0}
              >
                Précédent
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setActiveStep(Math.min(activeStep + 1, tutorialSteps.length - 1))}
                disabled={activeStep === tutorialSteps.length - 1}
              >
                Suivant
              </button>
              <Link to={step.link} className="button button-secondary">
                {step.linkLabel}
              </Link>
            </div>
          </section>

          <section aria-labelledby="help-results-title">
            <div className="section-header">
              <div>
                <p className="eyebrow">Base de connaissances</p>
                <h3 id="help-results-title">Résultats</h3>
              </div>
              <span className="result-count">{filteredItems.length} entrées</span>
            </div>

            <div className="help-results">
              {filteredItems.map((item) => (
                <article key={item.id} className="card help-result-card">
                  <span className="badge badge-theme">{item.kind}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="help-side">
          <section className="card support-card">
            <p className="eyebrow">Contact support</p>
            <h3>Écrire au support</h3>
            <p>
              Le message e-mail inclut automatiquement la version, l’URL, la plateforme,
              l’OS/navigateur et les dimensions d’écran.
            </p>
            <a className="button" href={buildSupportHref()}>
              Contacter contact@swinux.ch
            </a>
          </section>

          <section className="card help-quick-links">
            <p className="eyebrow">Accès rapides</p>
            <Link to="/docs" className="button button-secondary">Documentation</Link>
            <Link to="/docs/troubleshooting" className="button button-secondary">Dépannage</Link>
            <Link to="/docs/faq" className="button button-secondary">FAQ complète</Link>
            <Link to="/settings" className="button button-secondary">Paramètres</Link>
            <Link to="/timeline" className="button button-secondary">Frise</Link>
            <Link to="/map" className="button button-secondary">Carte</Link>
            <Link to="/glossary" className="button button-secondary">Glossaire</Link>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default HelpPage;
