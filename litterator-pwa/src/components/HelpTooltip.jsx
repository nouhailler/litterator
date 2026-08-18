function HelpTooltip({ label = 'Aide', children }) {
  return (
    <span className="help-tooltip">
      <button type="button" className="help-tooltip-trigger" aria-label={label}>
        ?
      </button>
      <span className="help-tooltip-content" role="tooltip">
        {children}
      </span>
    </span>
  );
}

export default HelpTooltip;
