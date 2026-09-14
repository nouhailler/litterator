import { useMemo, useState } from 'react';

function coverHue(id = '') {
  return [...id].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) % 360, 18);
}

function WorkCover({ work, authorName = '', className = '', decorative = false }) {
  const [failedCover, setFailedCover] = useState(null);
  const imageFailed = Boolean(work.cover) && failedCover === work.cover;
  const hue = useMemo(() => coverHue(work.id), [work.id]);

  if (work.cover && !imageFailed) {
    return (
      <img
        src={work.cover}
        alt={decorative ? '' : `Couverture de ${work.title}`}
        className={className}
        loading="lazy"
        onError={() => setFailedCover(work.cover)}
      />
    );
  }

  const fallbackReason = imageFailed ? 'Image indisponible, couverture générée' : 'Couverture générée';

  return (
    <div
      className={`generated-work-cover ${className}`.trim()}
      style={{ '--cover-hue': hue }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${fallbackReason} pour ${work.title}`}
      aria-hidden={decorative ? 'true' : undefined}
      data-generated-cover="true"
      data-image-fallback={imageFailed ? 'error' : 'missing'}
    >
      <span className="generated-cover-brand">Littérator</span>
      <strong>{work.title}</strong>
      <span>{authorName}</span>
      <small>{work.year} · {work.genre}</small>
    </div>
  );
}

export default WorkCover;
