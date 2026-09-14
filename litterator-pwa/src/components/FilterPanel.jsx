import { useState } from 'react';

function getInitialOpenState() {
  return typeof window === 'undefined' || !window.matchMedia('(max-width: 860px)').matches;
}

function FilterPanel({ children, activeCount = 0, title = 'Filtres' }) {
  const [isOpen, setIsOpen] = useState(getInitialOpenState);

  return (
    <section className={`filter-panel ${isOpen ? 'is-open' : ''}`} aria-label={title}>
      <button
        type="button"
        className="filter-panel-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{title}</span>
        <span>{activeCount > 0 ? `${activeCount} actif${activeCount > 1 ? 's' : ''}` : 'Afficher'}</span>
      </button>
      <div className="filters filter-panel-content">
        {children}
      </div>
    </section>
  );
}

export default FilterPanel;
