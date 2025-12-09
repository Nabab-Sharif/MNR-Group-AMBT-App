import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Play, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { EditMatchDialog } from "./EditMatchDialog";
import { getDisplayStatus } from "@/lib/matchStatus";
import { formatTimeToTwelveHour } from "@/lib/utils";

interface MatchListProps {
  matches: any[];
  onUpdate: () => void;
  onGoLive?: (match: any) => void;
}

export const MatchList = ({ matches, onUpdate, onGoLive }: MatchListProps) => {
  const [editingMatch, setEditingMatch] = useState<any>(null);

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      let updateData: any = { status: status === 'today' || status === 'tomorrow' ? 'upcoming' : status };
      
      // Update date based on status selection
      if (status === 'today') {
        updateData.date = today;
      } else if (status === 'tomorrow') {
        updateData.date = tomorrow;
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);
      
      if (error) {
        toast.error(`Failed to update match status: ${error.message}`);
      } else {
        toast.success(`Match updated to ${status}`);
        onUpdate();
      }
    } catch (err) {
      toast.error("Failed to update match status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    const { error } = await supabase.from("matches").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to delete match");
    } else {
      toast.success("Match deleted");
      onUpdate();
    }
  };

  const handleDownload = (match: any) => {
    const data = JSON.stringify(match, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${match.match_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Match data downloaded");
  };

  const handleWhatsAppShare = (match: any) => {
    try {
      const text = `🏸 *Match #${match.match_number}*\n\n👥 *${match.team1_name}* vs *${match.team2_name}*\n\n📅 Date: ${match.date}\n⏰ Time: ${formatTimeToTwelveHour(match.match_time)}\n📍 Venue: ${match.venue}\n🏆 Group: ${match.group_name}\n\n👤 ${match.team1_name}:\n• ${match.team1_player1_name}\n• ${match.team1_player2_name}\n\n👤 ${match.team2_name}:\n• ${match.team2_player1_name}\n• ${match.team2_player2_name}\n\n${match.status === 'completed' ? `🏆 Winner: ${match.winner || 'TBD'}` : match.status === 'live' ? '🔴 LIVE NOW!' : '📌 Upcoming'}`;
      
      const encodedText = encodeURIComponent(text);
      const waUrl = `https://wa.me/?text=${encodedText}`;
      
      // Try to open WhatsApp
      const newWindow = window.open(waUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.error("Could not open WhatsApp. Make sure WhatsApp is installed or try again.");
      } else {
        toast.success("Opening WhatsApp...");
      }
    } catch (err) {
      console.error('Error sharing on WhatsApp:', err);
      toast.error("Failed to share on WhatsApp");
    }
  };

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No matches found</p>
      </Card>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const isToday = match.date === today;
        const isTomorrow = match.date === tomorrow;
        const displayStatus = getDisplayStatus(match);

        return (
          <Card key={match.id} className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-bold">Match #{match.match_number}</h3>
                  {match.status === "live" && (
                    <span className="flex items-center gap-1 text-sm bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-white" />
                      LIVE
                    </span>
                  )}
                  {isToday && match.status !== 'live' && (
                    <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full">TODAY</span>
                  )}
                  {isTomorrow && (
                    <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">TOMORROW</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {match.date} • {match.day} {match.match_time && `• ${formatTimeToTwelveHour(match.match_time)}`} • {match.venue} • {match.group_name}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-1 flex-wrap">
                  <Button 
                    size="sm" 
                    variant={displayStatus === 'upcoming' && !isToday && !isTomorrow ? 'default' : 'outline'} 
                    onClick={() => updateMatchStatus(match.id, 'upcoming')} 
                    className="text-xs"
                  >
                    Upcoming
                  </Button>
                  <Button 
                    size="sm" 
                    variant={isToday && match.status === 'upcoming' ? 'default' : 'outline'} 
                    onClick={() => updateMatchStatus(match.id, 'today')} 
                    className="text-xs"
                  >
                    Today
                  </Button>
                  <Button 
                    size="sm" 
                    variant={isTomorrow && match.status === 'upcoming' ? 'default' : 'outline'} 
                    onClick={() => updateMatchStatus(match.id, 'tomorrow')} 
                    className="text-xs"
                  >
                    Tomorrow
                  </Button>
                  <Button 
                    size="sm" 
                    variant={match.status === 'live' ? 'default' : 'outline'} 
                    onClick={() => {
                      updateMatchStatus(match.id, 'live');
                      if (onGoLive) {
                        onGoLive({ ...match, status: 'live' });
                      }
                    }} 
                    className="text-xs gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Live
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditingMatch(match)} className="gap-1">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(match)} className="gap-1">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleWhatsAppShare(match)} className="gap-1 text-green-600 hover:text-green-700">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(match.id)} className="gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
                <h4 className="font-semibold mb-2">{match.team1_name}</h4>
                <p className="text-sm opacity-90">Leader: {match.team1_leader}</p>
                <p className="text-sm opacity-90">
                  1st Men: {match.team1_player1_name} | 2nd Men: {match.team1_player2_name}
                </p>
                <p className="text-2xl font-bold mt-2">Score: {match.team1_score}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white">
                <h4 className="font-semibold mb-2">{match.team2_name}</h4>
                <p className="text-sm opacity-90">Leader: {match.team2_leader}</p>
                <p className="text-sm opacity-90">
                  1st Men: {match.team2_player1_name} | 2nd Men: {match.team2_player2_name}
                </p>
                <p className="text-2xl font-bold mt-2">Score: {match.team2_score}</p>
              </div>
            </div>

            {match.winner && (
              <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                <span className="text-yellow-800 font-bold">🏆 Winner: {match.winner}</span>
              </div>
            )}
          </Card>
        );
      })}
      
      {editingMatch && (
        <EditMatchDialog
          open={!!editingMatch}
          onOpenChange={(open) => !open && setEditingMatch(null)}
          onSuccess={() => {
            setEditingMatch(null);
            onUpdate();
          }}
          match={editingMatch}
        />
      )}
    </div>
  );
};