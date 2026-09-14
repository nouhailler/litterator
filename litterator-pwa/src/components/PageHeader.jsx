function PageHeader({ eyebrow, title, description, actions, children, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="page-title-row">
        <h1>{title}</h1>
        {children}
      </div>
      {description && <p className="lead">{description}</p>}
      {actions}
    </header>
  );
}

export default PageHeader;
