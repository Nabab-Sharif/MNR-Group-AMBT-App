import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveScoreboard } from "./LiveScoreboard";
import { useEffect } from "react";

interface FullscreenScoreboardProps {
  match: any;
  isAdmin?: boolean;
  onClose: () => void;
}

export const FullscreenScoreboard = ({ match, isAdmin, onClose }: FullscreenScoreboardProps) => {
  useEffect(() => {
    // Prevent body scrolling when fullscreen scoreboard is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scrolling when closed
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground overflow-hidden flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 text-xl md:text-3xl w-full h-full overflow-hidden">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="scoreboard bg-card p-6 rounded-lg w-full h-full flex flex-col justify-center items-center">
          <div className="value first font-bold text-accent">1st Men: <span>...</span></div>
          <div className="value second font-bold text-accent">2nd Men: <span>...</span></div>
          <div className="total font-bold text-accent">Total: <span>...</span></div>
          <div className="result font-bold text-accent">Result: <span>...</span></div>
          <div className="meta font-bold text-accent">Date: <span>...</span> | Time: <span>...</span> | Day: <span>...</span></div>
        </div>
      </div>
    </div>
  );
};
