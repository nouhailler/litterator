import { useId } from 'react';

function HelpTooltip({ label = 'Aide', children }) {
  const tooltipId = useId();
  return (
    <span className="help-tooltip">
      <button type="button" className="help-tooltip-trigger" aria-label={label} aria-describedby={tooltipId}>
        ?
      </button>
      <span className="help-tooltip-content" role="tooltip" id={tooltipId}>
        {children}
      </span>
    </span>
  );
}

export default HelpTooltip;
