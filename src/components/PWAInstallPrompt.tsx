import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { showInstallPrompt, getPWAStatus } from '@/lib/pwaManager';

/**
 * PWA Install Prompt Component
 * Displays an install prompt to encourage app installation
 */
export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [status, setStatus] = useState(getPWAStatus());

  useEffect(() => {
    // Listen for install prompt availability
    const handleInstallPrompt = () => {
      setStatus(getPWAStatus());
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-prompt', handleInstallPrompt);
    
    return () => {
      window.removeEventListener('pwa-install-prompt', handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show prompt again for this session
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed or not available
  if (status.installed || !showPrompt || !status.installPromptAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white shadow-lg">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Install App</h3>
                <p className="text-xs text-blue-100">Get quick access on your device</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-blue-200 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1 bg-white text-blue-700 hover:bg-blue-50"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="flex-1 border-blue-200 text-white hover:bg-blue-600"
            >
              Not Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * PWA Status Indicator Component
 * Shows current PWA installation status (useful for debugging)
 */
export function PWAStatusIndicator() {
  const [status, setStatus] = useState(getPWAStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getPWAStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!status.serviceWorkerSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 text-xs font-mono">
      <div className="bg-gray-900/80 text-green-400 p-2 rounded border border-green-400/30">
        <div>PWA: {status.installed ? '✓ Installed' : '✗ Not Installed'}</div>
        <div>SW: {status.serviceWorkerSupported ? '✓ Supported' : '✗ Not Supported'}</div>
      </div>
    </div>
  );
}
