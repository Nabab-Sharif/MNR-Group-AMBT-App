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
    <div className="fixed inset-0 z-50 bg-gray-800 text-white overflow-hidden flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 text-xl md:text-3xl w-full h-full">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="scoreboard bg-gray-900 p-6 rounded-lg w-full h-full flex flex-col justify-center items-center">
          <div className="value first font-bold text-yellow-300">1st Men: <span>...</span></div>
          <div className="value second font-bold text-yellow-300">2nd Men: <span>...</span></div>
          <div className="total font-bold text-yellow-300">Total: <span>...</span></div>
          <div className="result font-bold text-yellow-300">Result: <span>...</span></div>
          <div className="meta font-bold text-yellow-300">Date: <span>...</span> | Time: <span>...</span> | Day: <span>...</span></div>
        </div>
      </div>
    </div>
  );
};
