import { useEffect, useRef, useState } from 'react';
import LiabilityNotice from './LiabilityNotice';
import { legalNotice } from './legalNoticeConfig';
import { acknowledgeLegalNotice, hasAcknowledgedLegalNotice } from './legalStorage';

function FirstLaunchNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dialogRef = useRef(null);
  const detailsButtonRef = useRef(null);
  const acknowledgeButtonRef = useRef(null);

  useEffect(() => {
    if (!hasAcknowledgedLegalNotice()) {
      setIsVisible(true);
      window.history.pushState({ legalNoticeOpen: true }, '', window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showDetails) {
        setShowDetails(false);
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const focusable = Array.from(focusableElements);

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handlePopState = () => {
      if (showDetails) {
        setShowDetails(false);
        window.history.pushState({ legalNoticeOpen: true }, '', window.location.href);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    window.requestAnimationFrame(() => acknowledgeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isVisible, showDetails]);

  if (!isVisible) {
    return null;
  }

  const handleAcknowledge = () => {
    acknowledgeLegalNotice();
    setIsVisible(false);
  };

  const toggleDetails = () => {
    setShowDetails((isOpen) => !isOpen);
    window.requestAnimationFrame(() => detailsButtonRef.current?.focus());
  };

  return (
    <div className="modal-backdrop legal-notice-backdrop" role="presentation">
      <section
        className="about-modal legal-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-launch-legal-title"
        ref={dialogRef}
      >
        <div className="modal-header legal-notice-header">
          <div>
            <p className="eyebrow">Premier lancement</p>
            <h2 id="first-launch-legal-title">{legalNotice.title}</h2>
          </div>
        </div>

        <div className="legal-notice-summary">
          {legalNotice.shortWarning.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {showDetails && (
          <div className="legal-notice-details" id="first-launch-legal-details">
            <LiabilityNotice compact includeIdentity={false} />
          </div>
        )}

        <div className="legal-notice-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={toggleDetails}
            aria-expanded={showDetails}
            aria-controls="first-launch-legal-details"
            ref={detailsButtonRef}
          >
            {showDetails ? 'Masquer les détails' : 'Voir les détails'}
          </button>
          <button
            type="button"
            className="button"
            onClick={handleAcknowledge}
            ref={acknowledgeButtonRef}
          >
            J’ai compris
          </button>
        </div>
      </section>
    </div>
  );
}

export default FirstLaunchNotice;
