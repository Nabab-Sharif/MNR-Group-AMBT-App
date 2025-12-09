import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveScoreboard } from "./LiveScoreboard";

interface FullscreenScoreboardProps {
  match: any;
  isAdmin?: boolean;
  onClose: () => void;
}

export const FullscreenScoreboard = ({ match, isAdmin, onClose }: FullscreenScoreboardProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
        <LiveScoreboard match={match} isAdmin={isAdmin} />
      </div>
    </div>
  );
};
