import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const LiveModeSelector = () => {
  const [dualLiveEnabled, setDualLiveEnabled] = useState(() => {
    const saved = localStorage.getItem('slideshow-dual-live-enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Monitor custom events from storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const dual = localStorage.getItem('slideshow-dual-live-enabled');
      if (dual !== null) setDualLiveEnabled(JSON.parse(dual));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('live-mode-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('live-mode-changed', handleStorageChange);
    };
  }, []);

  const handleSingleLive = () => {
    setDualLiveEnabled(false);
    localStorage.setItem('slideshow-dual-live-enabled', JSON.stringify(false));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('live-mode-changed'));
  };

  const handleDualLive = () => {
    setDualLiveEnabled(true);
    localStorage.setItem('slideshow-dual-live-enabled', JSON.stringify(true));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('live-mode-changed'));
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6 px-4">
      <label className="text-xs sm:text-sm font-semibold text-muted-foreground">LIVE MODE:</label>
      <div className="flex gap-2">
        <Button
          variant={!dualLiveEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleSingleLive}
          className={!dualLiveEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Single
        </Button>
        <Button
          variant={dualLiveEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleDualLive}
          className={dualLiveEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          Doubel
        </Button>
      </div>
    </div>
  );
};
