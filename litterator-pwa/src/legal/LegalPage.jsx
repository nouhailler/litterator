import LiabilityNotice from './LiabilityNotice';
import { legalNotice } from './legalNoticeConfig';

export function LegalPageContent({ compact = false }) {
  return (
    <article className={compact ? 'legal-page legal-page-compact' : 'legal-page'}>
      <header className="page-header">
        <p className="eyebrow">Mentions légales</p>
        <h1>Mentions légales</h1>
        <p className="lead">
          Avertissement, limitation de responsabilité et informations permanentes relatives à l’utilisation
          de Littérator. Version {legalNotice.version}.
        </p>
      </header>

      <LiabilityNotice compact={compact} />
    </article>
  );
}

function LegalPage() {
  return <LegalPageContent />;
}

export default LegalPage;
