import { useEffect, useState } from 'react';

function ConnectivityBanner() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="connectivity-banner" role="status" aria-live="polite">
      <strong>Mode hors connexion.</strong>
      <span>Les contenus déjà enregistrés restent accessibles ; la carte et les images externes peuvent manquer.</span>
    </div>
  );
}

export default ConnectivityBanner;
