import { useState } from 'react';

function ImagePreview({ src, alt, style, className = '' }) {
  const [failedSource, setFailedSource] = useState(null);
  if (!src || src === failedSource) {
    return <div className={`image-preview-error ${className}`} style={style} role="img" aria-label={`${alt} : image indisponible`} data-image-fallback="error"><span>Image indisponible</span></div>;
  }
  return <img src={src} alt={alt} style={style} className={className} loading="lazy" onError={() => setFailedSource(src)} />;
}

export default ImagePreview;
