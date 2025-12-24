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
    }
  > = {};

  // Process all matches
  matches.forEach((match) => {
    // Initialize team stats if not exist
    if (!teamStats[match.team1_name]) {
      teamStats[match.team1_name] = {
        wins: 0,
        losses: 0,
        scoreTotal: 0,
        winScores: [],
        loseScores: [],
        players: new Map(),
      };
    }
    if (!teamStats[match.team2_name]) {
      teamStats[match.team2_name] = {
        wins: 0,
        losses: 0,
        scoreTotal: 0,
        winScores: [],
        loseScores: [],
        players: new Map(),
      };
    }

    // Add players to team
    if (match.team1_player1_name) {
      teamStats[match.team1_name].players.set(match.team1_player1_name, {
        name: match.team1_player1_name,
        photo: match.team1_player1_photo,
      });
    }
    if (match.team1_player2_name) {
      teamStats[match.team1_name].players.set(match.team1_player2_name, {
        name: match.team1_player2_name,
        photo: match.team1_player2_photo,
      });
    }
    if (match.team2_player1_name) {
      teamStats[match.team2_name].players.set(match.team2_player1_name, {
        name: match.team2_player1_name,
        photo: match.team2_player1_photo,
      });
    }
    if (match.team2_player2_name) {
      teamStats[match.team2_name].players.set(match.team2_player2_name, {
        name: match.team2_player2_name,
        photo: match.team2_player2_photo,
      });
    }

    // Update scores and wins/losses
    teamStats[match.team1_name].scoreTotal += match.team1_score || 0;
    teamStats[match.team2_name].scoreTotal += match.team2_score || 0;

    if (match.status === "completed" && match.winner) {
      if (match.winner === match.team1_name) {
        teamStats[match.team1_name].wins += 1;
        teamStats[match.team1_name].winScores.push(match.team1_score || 0);
        teamStats[match.team2_name].losses += 1;
        teamStats[match.team2_name].loseScores.push(match.team2_score || 0);
      } else {
        teamStats[match.team2_name].wins += 1;
        teamStats[match.team2_name].winScores.push(match.team2_score || 0);
        teamStats[match.team1_name].losses += 1;
        teamStats[match.team1_name].loseScores.push(match.team1_score || 0);
      }
    }
  });

  // Convert to array and sort by wins, win points, lose score, and total score
  const standings: TeamStanding[] = Object.entries(teamStats)
    .map(([teamName, stats], index) => {
      const players = Array.from(stats.players.values());
      const winPoints = stats.wins; // Win Points = Total number of wins
      const loseScore = stats.loseScores.reduce((a, b) => a + b, 0);
      const averageWinScore = stats.wins > 0 ? stats.winScores.reduce((a, b) => a + b, 0) / stats.wins : 0;
      
      return {
        teamName,
        wins: stats.wins,
        losses: stats.losses,
        scoreTotal: stats.scoreTotal,
        winRate: stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : "0.0",
        winPoints,
        loseScore,
        averageWinScore,
        players,
        leaderPlayer: players.length > 0 ? players[0] : undefined,
        rank: index + 1,
      };
    })
    .sort((a, b) => {
      // Primary sort by wins (descending) - same as winPoints since winPoints = wins count
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // Secondary sort by lose score (descending)
      if (b.loseScore !== a.loseScore) {
        return b.loseScore - a.loseScore;
      }
      // Tertiary sort by total score (descending)
      if (b.scoreTotal !== a.scoreTotal) {
        return b.scoreTotal - a.scoreTotal;
      }
      // Final sort by ranking sequence (original order for stability)
      return 0;
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
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🏆</span> Group Standings
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
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {filteredStandings.map((team) => (
          <div 
            key={team.teamName}
            onClick={() => navigate(`/team/${encodeURIComponent(groupName || '')}/${encodeURIComponent(team.teamName)}`)}
            className="cursor-pointer group flex flex-col active:scale-95 transition-transform duration-150"
          >
            {/* Card with Hover Effects - RESPONSIVE */}
            <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg sm:rounded-xl backdrop-blur transition-all duration-300 hover:border-blue-400/80 hover:bg-gradient-to-br hover:from-blue-600/40 hover:to-purple-600/40 hover:shadow-2xl hover:shadow-blue-500/30 group-hover:scale-105 group-hover:-translate-y-2 group-active:scale-100 group-active:shadow-xl group-active:shadow-blue-500/50 min-h-auto flex flex-col">
              
              {/* Team Leader Picture - Top Left - ENHANCED */}
              <div className="absolute top-2 left-2 z-20">
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
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-blue-400/60 shadow-lg shadow-blue-500/30 hover:ring-4 hover:ring-yellow-300 transition-all">
                    <AvatarImage src={team.leaderPlayer?.photo || ""} alt={team.leaderPlayer?.name || "Leader"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                      {team.leaderPlayer?.name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Rank Number Badge - Right Side - ENHANCED */}
              <div 
                className="ranking-badge-3d absolute top-2 right-2 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl border-2 sm:border-3 border-yellow-300/50 shadow-lg shadow-yellow-500/30 cursor-pointer transition-all duration-300 hover:scale-125 hover:ring-4 hover:ring-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/50 active:scale-110 z-10 bg-gradient-to-br from-yellow-500/40 to-orange-500/40"
                style={{ transformStyle: "preserve-3d" }}
              >
                {team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : team.rank === 4 ? "4️⃣" : team.rank === 5 ? "5️⃣" : team.rank === 6 ? "6️⃣" : team.rank === 7 ? "7️⃣" : team.rank === 8 ? "8️⃣" : team.rank === 9 ? "9️⃣" : "🔟"}
              </div>

              {/* Team Header - Adjusted for Side Badges - RESPONSIVE */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 pt-2 relative z-0 px-2">
                <div className="flex-1 min-w-0 ml-12 sm:ml-16">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-yellow-300 transition-colors truncate">{team.teamName}</h3>
                  <p className="text-white/60 text-xs sm:text-sm">{team.wins + team.losses} matches</p>
                </div>
              </div>

              {/* Win Points Display - NEW */}
              <div className="px-2 sm:px-3 py-1 sm:py-2 mb-2 bg-amber-500/20 rounded-lg border border-amber-500/30 group-hover:bg-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs font-semibold">🎯 Total Wins Points</span>
                  <span className="text-lg sm:text-xl font-extrabold text-amber-300">{team.winPoints}</span>
                </div>
              </div>

              {/* Stats Grid - All Clickable - RESPONSIVE */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 flex-grow">
                {/* Wins */}
                <div 
                  className="p-2 sm:p-3 bg-green-500/20 rounded-lg border border-green-500/30 group-hover:bg-green-500/30 transition-all">
                  <div className="text-white/70 text-xs font-semibold">WINS</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-400">{team.wins}</div>
                </div>

                {/* Losses */}
                <div 
                  className="p-2 sm:p-3 bg-red-500/20 rounded-lg border border-red-500/30 group-hover:bg-red-500/30 transition-all">
                  <div className="text-white/70 text-xs font-semibold">LOSSES</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-400">{team.losses}</div>
                </div>

                {/* Score Total - Clickable */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedScore(expandedScore === team.teamName ? null : team.teamName);
                  }}
                  className="col-span-2 p-2 sm:p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 group-hover:bg-blue-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="text-white/70 text-xs font-semibold">📊 TOTAL SCORE</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400">{team.scoreTotal}</div>
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
                        <span className="text-white/60">🎯 Total Matches</span>
                        <span className="text-purple-300 font-bold">{team.wins + team.losses}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="my-2 sm:my-3 border-t border-white/10"></div>

              {/* Footer Section - Win Rate + Players + CTA */}
              <div className="space-y-2 sm:space-y-3">
                {/* Win Rate */}
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-lg border border-purple-500/30 group-hover:from-purple-600/30 group-hover:to-purple-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-xs font-semibold">WIN RATE</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-purple-300">{team.winRate}%</p>
                  </div>
                </div>

                {/* Players - Enhanced Display */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/70 text-xs font-semibold">👥 Players</p>
                  <div className="flex flex-wrap gap-1.5">
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
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-purple-400/60 shadow-md hover:ring-3 hover:ring-yellow-300 transition-all hover:scale-125 group-hover/player:scale-125">
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
