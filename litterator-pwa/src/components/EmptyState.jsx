function EmptyState({ title = 'Aucun résultat', children }) {
  return (
    <div className="empty-state" role="status">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export default EmptyState;
