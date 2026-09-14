function Pagination({ currentPage, pageSize, totalItems, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  const changePage = (page) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
    window.requestAnimationFrame(() => {
      document.querySelector('.results-toolbar')?.scrollIntoView({ block: 'start' });
    });
  };

  return (
    <nav className="pagination" aria-label="Pagination des résultats">
      <button
        type="button"
        className="button button-secondary"
        disabled={currentPage === 1}
        onClick={() => changePage(currentPage - 1)}
      >
        Précédent
      </button>
      <p aria-live="polite">
        <strong>Page {currentPage} sur {totalPages}</strong>
        <span>{start}–{end} sur {totalItems}</span>
      </p>
      <button
        type="button"
        className="button button-secondary"
        disabled={currentPage === totalPages}
        onClick={() => changePage(currentPage + 1)}
      >
        Suivant
      </button>
    </nav>
  );
}

export default Pagination;
