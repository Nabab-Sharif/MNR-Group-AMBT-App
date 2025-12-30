import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamPlayer {
  name: string;
  photo?: string | null;
}

interface TeamStanding {
  teamName: string;
  wins: number;
  losses: number;
  scoreTotal: number;
  winRate: string;
  winPoints: number;
  loseScore: number;
  averageWinScore: number;
  players: TeamPlayer[];
  rank: number;
  leaderPlayer?: TeamPlayer;
}

interface GroupStandingsProps {
  matches: any[];
  groupName?: string;
}

const GroupStandings = ({ matches, groupName }: GroupStandingsProps) => {
  const navigate = useNavigate();
  const [standingsSearch, setStandingsSearch] = useState("");
  const [expandedScore, setExpandedScore] = useState<string | null>(null);

  // Handle player picture click - navigate to player profile
  const handlePlayerClick = (player: TeamPlayer) => {
    navigate(`/player/${encodeURIComponent(player.name)}`);
  };

  // Calculate team statistics
  const teamStats: Record<
    string,
    {
      wins: number;
      losses: number;
      scoreTotal: number;
      winScores: number[];
      loseScores: number[];
      players: Map<string, { name: string; photo?: string | null }>;
      originalName: string;
    }
  > = {};

  // Process all matches
  matches.forEach((match) => {
    // Normalize team names for grouping (lowercase + trimmed)
    const team1Key = match.team1_name?.toLowerCase().trim() || "";
    const team2Key = match.team2_name?.toLowerCase().trim() || "";

    // Initialize team stats if not exist
    if (!teamStats[team1Key]) {
      teamStats[team1Key] = {
        wins: 0,
        losses: 0,
        scoreTotal: 0,
        winScores: [],
        loseScores: [],
        players: new Map(),
        originalName: match.team1_name,
      };
    }
    if (!teamStats[team2Key]) {
      teamStats[team2Key] = {
        wins: 0,
        losses: 0,
        scoreTotal: 0,
        winScores: [],
        loseScores: [],
        players: new Map(),
        originalName: match.team2_name,
      };
    }

    // Add players to team
    if (match.team1_player1_name) {
      teamStats[team1Key].players.set(match.team1_player1_name, {
        name: match.team1_player1_name,
        photo: match.team1_player1_photo,
      });
    }
    if (match.team1_player2_name) {
      teamStats[team1Key].players.set(match.team1_player2_name, {
        name: match.team1_player2_name,
        photo: match.team1_player2_photo,
      });
    }
    if (match.team2_player1_name) {
      teamStats[team2Key].players.set(match.team2_player1_name, {
        name: match.team2_player1_name,
        photo: match.team2_player1_photo,
      });
    }
    if (match.team2_player2_name) {
      teamStats[team2Key].players.set(match.team2_player2_name, {
        name: match.team2_player2_name,
        photo: match.team2_player2_photo,
      });
    }

    // Update scores and wins/losses using normalized keys
    teamStats[team1Key].scoreTotal += match.team1_score || 0;
    teamStats[team2Key].scoreTotal += match.team2_score || 0;

    if (match.status === "completed" && match.winner) {
      const winnerKey = match.winner?.toLowerCase().trim() || "";
      
      if (winnerKey === team1Key) {
        teamStats[team1Key].wins += 1;
        teamStats[team1Key].winScores.push(match.team1_score || 0);
        teamStats[team2Key].losses += 1;
        teamStats[team2Key].loseScores.push(match.team2_score || 0);
      } else if (winnerKey === team2Key) {
        teamStats[team2Key].wins += 1;
        teamStats[team2Key].winScores.push(match.team2_score || 0);
        teamStats[team1Key].losses += 1;
        teamStats[team1Key].loseScores.push(match.team1_score || 0);
      }
    }
  });

  // Convert to array and sort by wins, win points, lose score, and total score
  const standings: TeamStanding[] = Object.entries(teamStats)
    .map(([_, stats]) => {
      const players = Array.from(stats.players.values());
      const winPoints = stats.wins; // Win Points = Total number of wins
      const loseScore = stats.loseScores.reduce((a, b) => a + b, 0);
      const averageWinScore = stats.wins > 0 ? stats.winScores.reduce((a, b) => a + b, 0) / stats.wins : 0;
      
      return {
        teamName: stats.originalName,
        wins: stats.wins,
        losses: stats.losses,
        scoreTotal: stats.scoreTotal,
        winRate: stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : "0.0",
        winPoints,
        loseScore,
        averageWinScore,
        players,
        leaderPlayer: players.length > 0 ? players[0] : undefined,
        rank: 0, // Will be updated after sorting
      };
    })
    .sort((a, b) => {
      // Primary sort by wins (descending)
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // Secondary sort by total score (descending)
      if (b.scoreTotal !== a.scoreTotal) {
        return b.scoreTotal - a.scoreTotal;
      }
      // Tertiary sort by lose score (descending)
      if (b.loseScore !== a.loseScore) {
        return b.loseScore - a.loseScore;
      }
      // Final sort by team name for stability
      return a.teamName.localeCompare(b.teamName);
    })
    .map((standing, idx) => ({
      ...standing,
      rank: idx + 1,
    }));

  // Filter standings based on search
  const filteredStandings = useMemo(() => {
    return standings.filter((team) =>
      team.teamName.toLowerCase().includes(standingsSearch.toLowerCase())
    );
  }, [standings, standingsSearch]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🏆</span> <span className="hidden sm:inline">Group Standings</span><span className="sm:hidden">Standings</span>
        </h2>
        {standingsSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStandingsSearch("")}
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          type="text"
          placeholder="Search team..."
          value={standingsSearch}
          onChange={(e) => setStandingsSearch(e.target.value)}
          className="pl-10 text-sm sm:text-base bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {filteredStandings.map((team) => (
          <div 
            key={team.teamName}
            onClick={() => navigate(`/team/${encodeURIComponent(groupName || '')}/${encodeURIComponent(team.teamName)}`)}
            className="cursor-pointer group flex flex-col active:scale-95 transition-transform duration-150 relative"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>

            {/* Card with Footer-inspired Design */}
            <div className="relative p-3 sm:p-4 lg:p-6 bg-card border border-primary/20 rounded-lg sm:rounded-xl backdrop-blur transition-all duration-300 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/30 group-hover:bg-card/80 min-h-auto flex flex-col">
              
              {/* Team Leader Picture - Top Left */}
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-20">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (team.leaderPlayer) {
                      handlePlayerClick(team.leaderPlayer);
                    }
                  }}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  title={team.leaderPlayer?.name || 'Team Leader'}
                >
                  <Avatar className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border-2 sm:border-4 border-cyan-400/60 shadow-lg shadow-cyan-500/30 hover:ring-4 hover:ring-yellow-300 transition-all">
                    <AvatarImage src={team.leaderPlayer?.photo || ""} alt={team.leaderPlayer?.name || "Leader"} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-purple-600 text-white font-bold text-xs sm:text-sm">
                      {team.leaderPlayer?.name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Rank Number Badge - Right Side */}
              <div 
                className="ranking-badge-3d absolute top-1 sm:top-2 right-1 sm:right-2 w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-extrabold text-lg sm:text-xl lg:text-2xl border-2 sm:border-3 border-yellow-300/50 shadow-lg shadow-yellow-500/30 cursor-pointer transition-all duration-300 hover:scale-125 hover:ring-4 hover:ring-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/50 active:scale-110 z-10 bg-gradient-to-br from-yellow-500/40 to-orange-500/40"
                style={{ transformStyle: "preserve-3d" }}
                title={`Rank ${team.rank}`}
              >
                {team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : team.rank}
              </div>

              {/* Team Header - Adjusted for Side Badges - RESPONSIVE */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4 pt-1 sm:pt-2 relative z-0 px-1 sm:px-2">
                <div className="flex-1 min-w-0 ml-10 sm:ml-14 lg:ml-16">
                  <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">{team.teamName}</h3>
                  <p className="text-white/60 text-xs sm:text-sm">{team.wins + team.losses} sets</p>
                </div>
              </div>

              {/* Win Points Display with Set */}
              <div className="space-y-2 sm:space-y-2 mb-2">
                {team.wins + team.losses > 0 && (
                  <div className="px-2 sm:px-3 py-1 sm:py-2 bg-amber-600/20 rounded-lg border border-amber-500/30 group-hover:bg-amber-600/40 group-hover:border-amber-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/70 text-xs sm:text-sm font-semibold">📋 Total Match</span>
                      <span className="text-base sm:text-lg lg:text-xl font-extrabold text-amber-300 group-hover:text-amber-200 transition-colors">{Math.ceil((team.wins + team.losses) / 3)}</span>
                    </div>
                  </div>
                )}

                <div className="px-2 sm:px-3 py-1 sm:py-2 bg-cyan-600/20 rounded-lg border border-cyan-500/30 group-hover:bg-cyan-600/40 group-hover:border-cyan-400/60 transition-all duration-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/70 text-xs sm:text-sm font-semibold">🎯 Total Wins Points</span>
                    <span className="text-base sm:text-lg lg:text-xl font-extrabold text-cyan-300 group-hover:text-cyan-200 transition-colors">{team.winPoints}</span>
                  </div>
                </div>
                
              </div>

              {/* Stats Grid - All Clickable - RESPONSIVE */}
              <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4 flex-grow">
                {/* Wins */}
                <div 
                  className="p-2 sm:p-3 bg-green-500/20 rounded-lg border border-green-500/30 group-hover:bg-green-500/40 group-hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                  <div className="text-white/70 text-xs sm:text-sm font-semibold">Set Wins</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-green-400 group-hover:text-green-300 transition-colors">{team.wins}</div>
                </div>

                {/* Losses */}
                <div 
                  className="p-2 sm:p-3 bg-red-500/20 rounded-lg border border-red-500/30 group-hover:bg-red-500/40 group-hover:border-red-400/60 transition-all duration-300 hover:scale-105">
                  <div className="text-white/70 text-xs sm:text-sm font-semibold">Set Losses</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-red-400 group-hover:text-red-300 transition-colors">{team.losses}</div>
                </div>

                {/* Score Total - Clickable */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedScore(expandedScore === team.teamName ? null : team.teamName);
                  }}
                  className="col-span-2 p-2 sm:p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 group-hover:bg-blue-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="text-white/70 text-xs sm:text-sm font-semibold">📊 Total Score</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-blue-400">{team.scoreTotal}</div>
                  {expandedScore === team.teamName && (
                    <div className="mt-2 pt-2 border-t border-blue-500/50 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">📈 Avg per Win</span>
                        <span className="text-cyan-300 font-bold">{team.averageWinScore}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">📉 Avg per Loss</span>
                        <span className="text-orange-300 font-bold">{team.loseScore}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">🎯 Total Set</span>
                        <span className="text-purple-300 font-bold">{team.wins + team.losses}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 sm:my-2 lg:my-3 border-t border-white/10"></div>

              {/* Footer Section - Win Rate + Players + CTA */}
              <div className="space-y-2 sm:space-y-3">
                {/* Win Rate */}
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-lg border border-purple-500/30 group-hover:from-purple-600/30 group-hover:to-purple-500/30 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/60 text-xs sm:text-sm font-semibold">Win Rate</p>
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-extrabold text-purple-300">{team.winRate}%</p>
                  </div>
                </div>

                {/* Players - Enhanced Display */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/70 text-xs sm:text-sm font-semibold">👥 Players</p>
                  <div className="flex flex-wrap gap-1">
                    {team.players.map((player) => (
                      <div
                        key={player.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerClick(player);
                        }}
                        className="cursor-pointer group/player relative hover:z-10"
                        title={player.name}
                      >
                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 border-2 border-purple-400/60 shadow-md hover:ring-3 hover:ring-yellow-300 transition-all hover:scale-125 group-hover/player:scale-125">
                          <AvatarImage src={player.photo || ""} alt={player.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover/player:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-900/95 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap z-20 border border-purple-400/50 pointer-events-none">
                          {player.name.length > 12 ? player.name.substring(0, 12) + '...' : player.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal Dialog - RESPONSIVE */}
      {standings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">No teams found in this group yet.</p>
        </div>
      )}
    </div>
  );
};

export default GroupStandings;
