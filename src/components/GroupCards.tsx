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
          <div
            key={groupName}
            onClick={() => navigate(`/group/${groupName}`)}
            className="relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Card with Footer-inspired Design */}
            <div className="relative p-6 bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border border-white/10 rounded-2xl transition-all duration-300 hover:border-cyan-400/80 hover:shadow-lg hover:shadow-cyan-500/30 group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:via-purple-900 group-hover:to-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                  {groupName}
                </h3>
                <Badge variant="secondary" className="bg-cyan-600/30 border border-cyan-400/50 text-cyan-300 group-hover:bg-cyan-600/50 group-hover:border-cyan-400/80 transition-all duration-300">{groupMatches.length} Matches</Badge>
              </div>
              <div className="space-y-3">
                {groupMatches.slice(0, 3).map((match: any) => (
                  <div key={match.id} className="p-3 bg-white/5 hover:bg-white/15 rounded-lg space-y-2 transition-all duration-200 cursor-default border border-white/10 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-white/90 hover:text-cyan-300 transition-colors">{match.team1_name}</span>
                      {/* <span className="text-xs text-white/50">VS</span> */}
                      <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-pink-600 transition-all">
                        VS
                      </span>
                      <span className="font-semibold text-white/90 hover:text-cyan-300 transition-colors">{match.team2_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                      <span>{match.date}</span>
                      <Badge variant={
                        match.status === 'live' ? 'destructive' :
                          match.status === 'completed' ? 'default' :
                            'secondary'
                      } className="text-xs bg-white/10 border border-white/20 text-white/80">
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
                          className="w-8 h-8 rounded-full overflow-hidden bg-white/10 cursor-pointer hover:ring-3 hover:ring-cyan-400 transition-all duration-200 hover:scale-125 hover:shadow-lg shadow-cyan-500/20"
                        >
                          {match.team1_player1_photo ? (
                            <img src={match.team1_player1_photo} alt={match.team1_player1_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-white/50" /></div>
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
                          className="w-8 h-8 rounded-full overflow-hidden bg-white/10 cursor-pointer hover:ring-3 hover:ring-cyan-400 transition-all duration-200 hover:scale-125 hover:shadow-lg shadow-cyan-500/20"
                        >
                          {match.team1_player2_photo ? (
                            <img src={match.team1_player2_photo} alt={match.team1_player2_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-white/50" /></div>
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
                          className="w-8 h-8 rounded-full overflow-hidden bg-white/10 cursor-pointer hover:ring-3 hover:ring-cyan-400 transition-all duration-300 hover:scale-150 hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-1"
                        >
                          {match.team2_player1_photo ? (
                            <img src={match.team2_player1_photo} alt={match.team2_player1_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-white/50" /></div>
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
                        className="w-8 h-8 rounded-full overflow-hidden bg-white/10 cursor-pointer hover:ring-3 hover:ring-cyan-400 transition-all duration-200 hover:scale-125 hover:shadow-lg shadow-cyan-500/20"
                      >
                        {match.team2_player2_photo ? (
                          <img src={match.team2_player2_photo} alt={match.team2_player2_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User className="h-4 w-4 text-white/50" /></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Filter Buttons */}
                  {/* <div className="flex gap-1 flex-wrap">
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
                  </div> */}


                </div>
              ))}
              {groupMatches.length > 3 && (
                <p className="text-xs text-center text-white/60 mt-3">
                  +{groupMatches.length - 3} more matches
                </p>
              )}
            </div>
            </div>
          </div>
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
