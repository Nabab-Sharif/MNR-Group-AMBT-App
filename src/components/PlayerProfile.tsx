import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Building2, MapPin, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerProfileProps {
  player: {
    name: string;
    photo: string | null;
    team: string;
    department?: string;
    unit?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export const PlayerProfile = ({ player, open, onClose }: PlayerProfileProps) => {
  const navigate = useNavigate();

  if (!player) return null;

  const handleViewFullProfile = () => {
    onClose();
    navigate(`/player/${encodeURIComponent(player.name)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-sky-500 to-purple-600 border-white/20">
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Player Photo */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="text-4xl font-bold text-sky-600">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Player Details */}
          <div className="text-center space-y-4 w-full">
            <div>
              <h2 className="text-2xl font-bold text-white">{player.name}</h2>
              <p className="text-white/80 mt-1">Team: {player.team}</p>
            </div>

            {(player.department || player.unit) && (
              <div className="space-y-2 pt-4 border-t border-white/20">
                {player.department && (
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">{player.department}</span>
                  </div>
                )}
                {player.unit && (
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{player.unit}</span>
                  </div>
                )}
              </div>
            )}

            {/* View Full Profile Button */}
            <Button 
              onClick={handleViewFullProfile}
              className="bg-orange-500 hover:bg-orange-600 text-white mt-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
