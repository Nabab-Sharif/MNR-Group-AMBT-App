import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { updateMatchStatus, getDisplayStatus } from "@/lib/matchStatus";
import { User } from "lucide-react";
import { PlayerProfile } from "./PlayerProfile";
import { supabase } from "@/integrations/supabase/client";

interface GroupCardsProps {
  matches: any[];
}

export const GroupCards = ({ matches }: GroupCardsProps) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerProfileOpen, setPlayerProfileOpen] = useState(false);

  // Group matches by group_name
  const groupedMatches = matches.reduce((acc: any, match: any) => {
    if (!acc[match.group_name]) {
      acc[match.group_name] = [];
    }
    acc[match.group_name].push(match);
    return acc;
  }, {});

  const handlePlayerClick = async (playerData: any) => {
    // Fetch full player details including department and unit
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('id', playerData.matchId)
      .single();

    if (matchData) {
      const playerKey = playerData.playerKey;
      setSelectedPlayer({
        name: playerData.name,
        photo: playerData.photo,
        team: playerData.team,
        department: matchData[`${playerKey}_department`] || undefined,
        unit: matchData[`${playerKey}_unit`] || undefined,
      });
      setPlayerProfileOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Tournament Groups</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedMatches).map(([groupName, groupMatches]: [string, any]) => (
          <Card 
            key={groupName} 
            className="p-6 bg-card hover:shadow-glow-gold transition-all cursor-pointer hover:scale-105 transform" 
            onClick={() => navigate(`/group/${groupName}`)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                {groupName}
              </h3>
              <Badge variant="secondary">{groupMatches.length} Matches</Badge>
            </div>
            <div className="space-y-3">
              {groupMatches.slice(0, 3).map((match: any) => (
                <div key={match.id} className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{match.team1_name}</span>
                    <span className="text-xs text-muted-foreground">VS</span>
                    <span className="font-semibold">{match.team2_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span>{match.date}</span>
                    <Badge variant={
                      match.status === 'live' ? 'destructive' : 
                      match.status === 'completed' ? 'default' : 
                      'secondary'
                    } className="text-xs">
                      {getDisplayStatus(match)}
                    </Badge>
                  </div>
                  
                  {/* Player chips - clickable for profile */}
                  <div className="flex gap-2 items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handlePlayerClick({ 
                            name: match.team1_player1_name, 
                            photo: match.team1_player1_photo, 
                            team: match.team1_name, 
                            playerKey: 'team1_player1', 
                            matchId: match.id 
                          }); 
                        }} 
                        className="w-8 h-8 rounded-full overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition"
                      >
                        {match.team1_player1_photo ? (
                          <img src={match.team1_player1_photo} alt={match.team1_player1_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handlePlayerClick({ 
                            name: match.team1_player2_name, 
                            photo: match.team1_player2_photo, 
                            team: match.team1_name, 
                            playerKey: 'team1_player2', 
                            matchId: match.id 
                          }); 
                        }} 
                        className="w-8 h-8 rounded-full overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition"
                      >
                        {match.team1_player2_photo ? (
                          <img src={match.team1_player2_photo} alt={match.team1_player2_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handlePlayerClick({ 
                            name: match.team2_player1_name, 
                            photo: match.team2_player1_photo, 
                            team: match.team2_name, 
                            playerKey: 'team2_player1', 
                            matchId: match.id 
                          }); 
                        }} 
                        className="w-8 h-8 rounded-full overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition"
                      >
                        {match.team2_player1_photo ? (
                          <img src={match.team2_player1_photo} alt={match.team2_player1_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handlePlayerClick({ 
                            name: match.team2_player2_name, 
                            photo: match.team2_player2_photo, 
                            team: match.team2_name, 
                            playerKey: 'team2_player2', 
                            matchId: match.id 
                          }); 
                        }} 
                        className="w-8 h-8 rounded-full overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition"
                      >
                        {match.team2_player2_photo ? (
                          <img src={match.team2_player2_photo} alt={match.team2_player2_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      size="sm"
                      variant={getDisplayStatus(match) === 'upcoming' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMatchStatus(match.id, 'upcoming');
                        window.dispatchEvent(new CustomEvent('open-slideshow', { detail: { filter: 'upcoming', group: groupName } }));
                      }}
                      className="text-xs h-6"
                    >
                      Upcoming
                    </Button>
                    <Button
                      size="sm"
                      variant={getDisplayStatus(match) === 'today' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMatchStatus(match.id, 'today');
                        window.dispatchEvent(new CustomEvent('open-slideshow', { detail: { filter: 'today', group: groupName } }));
                      }}
                      className="text-xs h-6"
                    >
                      Today
                    </Button>
                    <Button
                      size="sm"
                      variant={getDisplayStatus(match) === 'tomorrow' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMatchStatus(match.id, 'tomorrow');
                        window.dispatchEvent(new CustomEvent('open-slideshow', { detail: { filter: 'tomorrow', group: groupName } }));
                      }}
                      className="text-xs h-6"
                    >
                      Tomorrow
                    </Button>
                    <Button
                      size="sm"
                      variant={match.status === 'live' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMatchStatus(match.id, 'live');
                      }}
                      className="text-xs h-6"
                    >
                      Live
                    </Button>
                  </div>
                </div>
              ))}
              {groupMatches.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{groupMatches.length - 3} more matches
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Group Details Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-3xl">
          {selectedGroup && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{selectedGroup} - Details</h3>
                <Badge variant="secondary">{groupedMatches[selectedGroup].length} Matches</Badge>
              </div>

              {(() => {
                const totals: Record<string, number> = {};
                groupedMatches[selectedGroup].forEach((m: any) => {
                  totals[m.team1_name] = (totals[m.team1_name] || 0) + (m.team1_score || 0);
                  totals[m.team2_name] = (totals[m.team2_name] || 0) + (m.team2_score || 0);
                });
                const sortedTeams = Object.entries(totals).sort((a, b) => b[1] - a[1]);
                const topTeam = sortedTeams[0];

                return (
                  <div className="space-y-3">
                    {topTeam ? (
                      <div className="p-4 bg-card rounded-lg">
                        <h4 className="text-lg font-bold">Top Team: {topTeam[0]}</h4>
                        <p className="text-sm text-muted-foreground">Total Points: {topTeam[1]}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No scores yet.</p>
                    )}

                    <div className="grid gap-3">
                      {groupedMatches[selectedGroup].map((m: any) => (
                        <div key={m.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">Match #{m.match_number} • {m.group_name}</div>
                              <div className="text-xs text-muted-foreground">{m.date} • {m.venue}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{m.team1_name} - {m.team1_score ?? 0}</div>
                              <div className="font-bold">{m.team2_name} - {m.team2_score ?? 0}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Player Profile Dialog */}
      <PlayerProfile 
        player={selectedPlayer} 
        open={playerProfileOpen} 
        onClose={() => {
          setPlayerProfileOpen(false);
          setSelectedPlayer(null);
        }} 
      />
    </div>
  );
};
