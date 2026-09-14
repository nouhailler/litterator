function LoadErrorState({ title = 'Contenu indisponible', error, onRetry, children, headingLevel = 1 }) {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const technicalMessage = typeof error === 'string' ? error : error?.message || '';
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <section className="load-error-state" role="alert" data-testid="load-error-state">
      <p className="eyebrow">{isOffline ? 'Hors connexion' : 'Chargement interrompu'}</p>
      <Heading>{title}</Heading>
      <p className="lead">
        {children || (isOffline
          ? 'Cette ressource n’est pas encore disponible hors connexion. Reconnectez-vous puis réessayez.'
          : 'Les données nécessaires n’ont pas pu être chargées. Vous pouvez relancer la demande sans perdre vos filtres.')}
      </p>
      {technicalMessage && <details><summary>Détail technique</summary><code>{technicalMessage}</code></details>}
      <div className="card-actions">
        <button type="button" className="button" onClick={onRetry || (() => window.location.reload())}>Réessayer</button>
        <a className="button button-secondary" href="/">Retour à l’accueil</a>
      </div>
    </section>
  );
}

export default LoadErrorState;
