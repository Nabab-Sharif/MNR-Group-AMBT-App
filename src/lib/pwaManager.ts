/**
 * PWA Service Worker Registration
 * Handles service worker registration and updates for offline support
 */

export async function registerPWA() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration);

    // Check for updates periodically
    setInterval(async () => {
      try {
        await registration.update();
      } catch (error) {
        console.error('Failed to check for Service Worker updates:', error);
      }
    }, 60000); // Check every minute

    // Handle Service Worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
          // New service worker is ready, notify user
          console.log('New Service Worker version available');
          
          // You can show a toast/notification to user about the update
          window.dispatchEvent(new CustomEvent('pwa-update-available'));
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      window.location.reload();
    });

  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Check if PWA is installed
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

/**
 * Request install prompt (for browsers that support it)
 */
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Install prompt available');
  window.dispatchEvent(new CustomEvent('pwa-install-prompt', { detail: e }));
});

export function showInstallPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          resolve(true);
        } else {
          console.log('User dismissed the install prompt');
          resolve(false);
        }
        deferredPrompt = null;
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Check PWA installation status and availability
 */
export function getPWAStatus() {
  return {
    installed: isPWAInstalled(),
    installPromptAvailable: deferredPrompt !== null,
    serviceWorkerSupported: 'serviceWorker' in navigator,
  };
}
