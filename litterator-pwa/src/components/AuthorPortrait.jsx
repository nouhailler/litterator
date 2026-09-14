import { useState } from 'react';

function AuthorPortrait({ author, className = '', decorative = false }) {
  const [failedPortrait, setFailedPortrait] = useState(null);
  const imageFailed = Boolean(author.portrait) && failedPortrait === author.portrait;

  if (author.portrait && !imageFailed) {
    return (
      <img
        src={author.portrait}
        alt={decorative ? '' : `Portrait de ${author.name}`}
        className={className}
        loading="lazy"
        onError={() => setFailedPortrait(author.portrait)}
      />
    );
  }

  const status = imageFailed ? 'Portrait indisponible' : 'Portrait non renseigné';

  return (
    <div
      className={`author-portrait-fallback ${className}`.trim()}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${status} pour ${author.name}`}
      aria-hidden={decorative ? 'true' : undefined}
      data-image-fallback={imageFailed ? 'error' : 'missing'}
    >
      <strong aria-hidden="true">{author.name.charAt(0)}</strong>
      {!decorative && <span>{status}</span>}
    </div>
  );
}

export default AuthorPortrait;
