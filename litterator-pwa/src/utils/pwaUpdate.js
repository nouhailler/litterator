import { registerSW } from 'virtual:pwa-register';

let updateServiceWorker;
let hasReloadStarted = false;

const reloadApp = () => {
  if (hasReloadStarted) {
    return;
  }

  hasReloadStarted = true;
  const appRoot = `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
  window.location.replace(appRoot);
};

const clearLocalCaches = async () => {
  if (!('caches' in window)) {
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
};

const waitForControllerChange = () => new Promise((resolve) => {
  if (!('serviceWorker' in navigator)) {
    resolve();
    return;
  }

  const timeout = window.setTimeout(resolve, 2500);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.clearTimeout(timeout);
    resolve();
  }, { once: true });
});

export const registerAppServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('litterator:update-available'));
    },
  });

  navigator.serviceWorker.addEventListener('controllerchange', reloadApp);
};

export const forceAppUpdate = async () => {
  if (!('serviceWorker' in navigator)) {
    reloadApp();
    return 'unsupported';
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (registration) {
    await registration.update();

    if (registration.waiting) {
      if (updateServiceWorker) {
        await updateServiceWorker(true);
      } else {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        await waitForControllerChange();
        reloadApp();
      }

      return 'updated';
    }

    await clearLocalCaches();
    await registration.unregister();
    reloadApp();
    return 'refreshed';
  }

  await clearLocalCaches();
  reloadApp();
  return 'reloaded';
};
