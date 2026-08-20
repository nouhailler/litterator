import { getLegalSections, legalNotice } from './legalNoticeConfig';

function LiabilityNotice({ compact = false, includeIdentity = true }) {
  const sections = getLegalSections({ includeLocationPrecision: true });

  return (
    <div className={compact ? 'legal-content legal-content-compact' : 'legal-content'}>
      {includeIdentity && (
        <section className="legal-section" aria-labelledby="legal-identity-title">
          <h2 id="legal-identity-title">Informations légales</h2>
          <dl className="legal-identity-list">
            {legalNotice.legalIdentity.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {sections.map((section) => (
        <section className="legal-section" key={section.id} aria-labelledby={`legal-${section.id}`}>
          <h2 id={`legal-${section.id}`}>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      <section className="legal-section" aria-labelledby="legal-privacy-title">
        <h2 id="legal-privacy-title">Confidentialité</h2>
        <p>{legalNotice.privacyPlaceholder}</p>
      </section>
    </div>
  );
}

export default LiabilityNotice;
