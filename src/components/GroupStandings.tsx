import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Trophy, TrendingUp, Zap } from "lucide-react";

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
  players: TeamPlayer[];
  rank: number;
}

interface MatchDetail {
  id: string;
  date: string;
  match_time: string;
  opponent: string;
  score: number;
  opponentScore: number;
  result: "Win" | "Loss";
}

interface GroupStandingsProps {
  matches: any[];
}

type DetailViewType = "team" | "wins" | "losses" | "score";

const GroupStandings = ({ matches }: GroupStandingsProps) => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<TeamStanding | null>(null);
  const [detailView, setDetailView] = useState<DetailViewType>("team");
  const [winMatches, setWinMatches] = useState<MatchDetail[]>([]);
  const [lossMatches, setLossMatches] = useState<MatchDetail[]>([]);
  const [allMatches, setAllMatches] = useState<MatchDetail[]>([]);
  // Function to get match details for wins
  const handleWinsClick = (team: TeamStanding) => {
    const winsList = matches.filter((m) => {
      const isTeam1 = m.team1_name === team.teamName;
      const isTeam2 = m.team2_name === team.teamName;
      const teamWon = (isTeam1 && m.winner === team.teamName) || (isTeam2 && m.winner === team.teamName);
      return m.status === "completed" && teamWon;
    }).map((m) => {
      const isTeam1 = m.team1_name === team.teamName;
      return {
        id: m.id,
        date: m.date,
        match_time: m.match_time || "N/A",
        opponent: isTeam1 ? m.team2_name : m.team1_name,
        score: isTeam1 ? m.team1_score : m.team2_score,
        opponentScore: isTeam1 ? m.team2_score : m.team1_score,
        result: "Win" as const,
      };
    });
    setWinMatches(winsList);
    setDetailView("wins");
  };

  // Function to get match details for losses
  const handleLossesClick = (team: TeamStanding) => {
    const lossList = matches.filter((m) => {
      const isTeam1 = m.team1_name === team.teamName;
      const isTeam2 = m.team2_name === team.teamName;
      const teamLost = (isTeam1 && m.winner !== team.teamName) || (isTeam2 && m.winner !== team.teamName);
      return m.status === "completed" && teamLost && m.winner;
    }).map((m) => {
      const isTeam1 = m.team1_name === team.teamName;
      return {
        id: m.id,
        date: m.date,
        match_time: m.match_time || "N/A",
        opponent: isTeam1 ? m.team2_name : m.team1_name,
        score: isTeam1 ? m.team1_score : m.team2_score,
        opponentScore: isTeam1 ? m.team2_score : m.team1_score,
        result: "Loss" as const,
      };
    });
    setLossMatches(lossList);
    setDetailView("losses");
  };

  // Handle player picture click - navigate to player profile
  const handlePlayerClick = (player: TeamPlayer) => {
    // Navigate to player profile page with player name as parameter
    navigate(`/player/${encodeURIComponent(player.name)}`);
  };

  // Handle score click - show all matches with score details
  const handleScoreClick = (team: TeamStanding) => {
    const allMatchesList = matches
      .filter((m) => {
        const isTeam1 = m.team1_name === team.teamName;
        const isTeam2 = m.team2_name === team.teamName;
        return m.status === "completed" && (isTeam1 || isTeam2);
      })
      .map((m) => {
        const isTeam1 = m.team1_name === team.teamName;
        const isTeam2 = m.team2_name === team.teamName;
        const teamWon = (isTeam1 && m.winner === team.teamName) || (isTeam2 && m.winner === team.teamName);
        return {
          id: m.id,
          date: m.date,
          match_time: m.match_time || "N/A",
          opponent: isTeam1 ? m.team2_name : m.team1_name,
          score: isTeam1 ? m.team1_score : m.team2_score,
          opponentScore: isTeam1 ? m.team2_score : m.team1_score,
          result: teamWon ? ("Win" as const) : ("Loss" as const),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setAllMatches(allMatchesList);
    setDetailView("score");
  };

  // Calculate team statistics
  const teamStats: Record<
    string,
    {
      wins: number;
      losses: number;
      scoreTotal: number;
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
        players: new Map(),
      };
    }
    if (!teamStats[match.team2_name]) {
      teamStats[match.team2_name] = {
        wins: 0,
        losses: 0,
        scoreTotal: 0,
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
        teamStats[match.team2_name].losses += 1;
      } else {
        teamStats[match.team2_name].wins += 1;
        teamStats[match.team1_name].losses += 1;
      }
    }
  });

  // Convert to array and sort by wins (descending)
  const standings: TeamStanding[] = Object.entries(teamStats)
    .map(([teamName, stats], index) => ({
      teamName,
      wins: stats.wins,
      losses: stats.losses,
      scoreTotal: stats.scoreTotal,
      winRate: stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : "0.0",
      players: Array.from(stats.players.values()),
      rank: index + 1,
    }))
    .sort((a, b) => {
      // Primary sort by wins (descending)
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // Secondary sort by win rate (descending)
      return parseFloat(b.winRate) - parseFloat(a.winRate);
    })
    .map((standing, idx) => ({
      ...standing,
      rank: idx + 1,
    }));

  return (
    <div className="mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl">🏆</span> Group Standings
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {standings.map((team) => (
          <div 
            key={team.teamName}
            onClick={() => setSelectedTeam(team)}
            className="cursor-pointer group flex flex-col"
          >
            {/* Card with Hover Effects - RESPONSIVE */}
            <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg sm:rounded-xl backdrop-blur transition-all duration-300 hover:border-blue-400/80 hover:bg-gradient-to-br hover:from-blue-600/40 hover:to-purple-600/40 hover:shadow-2xl hover:shadow-blue-500/30 group-hover:scale-105 group-hover:-translate-y-2 min-h-auto flex flex-col">
              
            {/* Rank Number Badge - Top Center - CLICKABLE with 3D Animation - RESPONSIVE */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTeam(team);
                  setDetailView("team");
                }}
                className="ranking-badge-3d absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-extrabold text-2xl sm:text-4xl md:text-6xl border-2 sm:border-4 border-transparent shadow-none cursor-pointer transition-all duration-300 hover:scale-125 hover:ring-4 hover:ring-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/50 hover:-translate-y-6 active:scale-110 z-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                {team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : team.rank === 4 ? "4️⃣" : team.rank === 5 ? "5️⃣" : team.rank === 6 ? "6️⃣" : team.rank === 7 ? "7️⃣" : team.rank === 8 ? "8️⃣" : team.rank === 9 ? "9️⃣" : "🔟"}
              </div>

              {/* Team Header - RESPONSIVE */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 pt-6 sm:pt-8 relative z-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-yellow-300 transition-colors truncate">{team.teamName}</h3>
                  <p className="text-white/60 text-xs sm:text-sm">{team.wins + team.losses} matches</p>
                </div>
              </div>

              {/* Stats Grid - All Clickable - RESPONSIVE (Without Rate) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 flex-grow">
                {/* Wins - CLICKABLE */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeam(team);
                    handleWinsClick(team);
                  }}
                  className="p-2 sm:p-3 bg-green-500/20 rounded-lg border border-green-500/30 group-hover:bg-green-500/30 transition-all cursor-pointer hover:bg-green-500/40 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/30">
                  <div className="text-white/70 text-xs font-semibold">WINS</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-400">{team.wins}</div>
                </div>

                {/* Losses - CLICKABLE */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeam(team);
                    handleLossesClick(team);
                  }}
                  className="p-2 sm:p-3 bg-red-500/20 rounded-lg border border-red-500/30 group-hover:bg-red-500/30 transition-all cursor-pointer hover:bg-red-500/40 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/30">
                  <div className="text-white/70 text-xs font-semibold">LOSSES</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-400">{team.losses}</div>
                </div>

                {/* Score Total - CLICKABLE */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeam(team);
                    handleScoreClick(team);
                  }}
                  className="col-span-2 p-2 sm:p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 group-hover:bg-blue-500/30 transition-all cursor-pointer hover:bg-blue-500/40 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/30">
                  <div className="text-white/70 text-xs font-semibold">TOTAL SCORE</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400">{team.scoreTotal}</div>
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

                {/* Players - Bottom */}
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30 group-hover:from-blue-600/30 group-hover:to-cyan-600/30 transition-all">
                  <span className="text-white/70 text-xs font-semibold flex-shrink-0">👥</span>
                  <div className="flex gap-1 overflow-hidden flex-1">
                    {team.players.slice(0, 4).map((player) => (
                      <div
                        key={player.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerClick(player);
                        }}
                        className="cursor-pointer hover:scale-125 transition-transform flex-shrink-0"
                        title={player.name}
                      >
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white/30 group-hover:border-white/60 transition-all hover:ring-2 hover:ring-blue-400">
                          <AvatarImage src={player.photo || ""} alt={player.name} />
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                    {team.players.length > 4 && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-200 border border-blue-400/50 group-hover:bg-blue-500/60 transition-all flex-shrink-0" title={`+${team.players.length - 4} more`}>
                        +{team.players.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Click for Details CTA - Bottom */}
                <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30 group-hover:from-yellow-600/30 group-hover:to-orange-600/30 transition-all text-center cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20">
                  <p className="text-white/70 text-xs sm:text-sm font-semibold group-hover:text-yellow-200 transition-colors">
                    💡 Click for full details
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal Dialog - RESPONSIVE */}
      {selectedTeam && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedTeam(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-500/20 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button - RESPONSIVE */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl sm:text-4xl border-4 border-slate-700 flex-shrink-0">
                  {selectedTeam.rank === 1 ? "🥇" : selectedTeam.rank === 2 ? "🥈" : selectedTeam.rank === 3 ? "🥉" : selectedTeam.rank === 4 ? "4️⃣" : selectedTeam.rank === 5 ? "5️⃣" : selectedTeam.rank === 6 ? "6️⃣" : selectedTeam.rank === 7 ? "7️⃣" : selectedTeam.rank === 8 ? "8️⃣" : selectedTeam.rank === 9 ? "9️⃣" : "🔟"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate">{selectedTeam.teamName}</h2>
                  <p className="text-white/60 text-xs sm:text-sm">Rank #{selectedTeam.rank}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1 sm:p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Tab Navigation - RESPONSIVE */}
            <div className="flex gap-2 mb-4 sm:mb-6 border-b border-white/20 overflow-x-auto">
              <button
                onClick={() => setDetailView("team")}
                className={`px-3 sm:px-4 py-2 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${detailView === "team" ? "text-white border-b-2 border-white" : "text-white/60 hover:text-white"}`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => handleWinsClick(selectedTeam)}
                className={`px-3 sm:px-4 py-2 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${detailView === "wins" ? "text-green-400 border-b-2 border-green-400" : "text-white/60 hover:text-white"}`}
              >
                ✅ Wins ({selectedTeam.wins})
              </button>
              <button
                onClick={() => handleLossesClick(selectedTeam)}
                className={`px-3 sm:px-4 py-2 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${detailView === "losses" ? "text-red-400 border-b-2 border-red-400" : "text-white/60 hover:text-white"}`}
              >
                ❌ Losses ({selectedTeam.losses})
              </button>
              <button
                onClick={() => handleScoreClick(selectedTeam)}
                className={`px-3 sm:px-4 py-2 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${detailView === "score" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/60 hover:text-white"}`}
              >
                📈 Score ({selectedTeam.scoreTotal})
              </button>
            </div>

            {/* Content Area */}
            {detailView === "team" && (
              <>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8">
                  <div className="p-3 sm:p-4 bg-green-500/20 rounded-lg sm:rounded-xl border border-green-500/30">
                    <p className="text-white/70 text-xs sm:text-sm font-semibold mb-1">Total Wins</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-400">{selectedTeam.wins}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-red-500/20 rounded-lg sm:rounded-xl border border-red-500/30">
                    <p className="text-white/70 text-xs sm:text-sm font-semibold mb-1">Total Losses</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-400">{selectedTeam.losses}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-purple-500/20 rounded-lg sm:rounded-xl border border-purple-500/30">
                    <p className="text-white/70 text-xs sm:text-sm font-semibold mb-1">Win Rate</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-400">{selectedTeam.winRate}%</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-blue-500/20 rounded-lg sm:rounded-xl border border-blue-500/30">
                    <p className="text-white/70 text-xs sm:text-sm font-semibold mb-1">Total Score</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400">{selectedTeam.scoreTotal}</p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-8 p-3 sm:p-4 bg-white/10 rounded-lg sm:rounded-xl border border-white/20">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <p className="text-white/60 text-xs sm:text-sm">Total Matches</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{selectedTeam.wins + selectedTeam.losses}</p>
                    </div>
                    <div className="text-center border-l border-r border-white/20">
                      <p className="text-white/60 text-xs sm:text-sm">Avg Score</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {selectedTeam.wins + selectedTeam.losses > 0 
                          ? (selectedTeam.scoreTotal / (selectedTeam.wins + selectedTeam.losses)).toFixed(1)
                          : 0
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs sm:text-sm">Win %</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{selectedTeam.winRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Team Players</h3>
                  <div className="space-y-3">
                    {selectedTeam.players.map((player, index) => (
                      <div 
                        key={player.name} 
                        onClick={() => handlePlayerClick(player)}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:border-white/30 cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full font-bold text-white">
                          {index + 1}
                        </div>
                        <Avatar className="w-12 h-12 border-2 border-white/20 hover:ring-2 hover:ring-blue-400 cursor-pointer">
                          <AvatarImage src={player.photo || ""} alt={player.name} />
                          <AvatarFallback className="bg-blue-600 text-white text-lg">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-lg">{player.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Wins Details */}
            {detailView === "wins" && (
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" /> Winning Matches
                </h3>
                {winMatches.length > 0 ? (
                  <div className="space-y-3">
                    {winMatches.map((match) => (
                      <div key={match.id} className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold text-lg">vs {match.opponent}</h4>
                          <Badge className="bg-green-600 text-white">WIN</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-white/60 text-sm">Date</p>
                            <p className="text-white font-semibold">{match.date}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Time</p>
                            <p className="text-white font-semibold">{match.match_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <p className="text-green-400 text-3xl font-extrabold">{match.score}</p>
                            <p className="text-white/60 text-xs">{selectedTeam.teamName}</p>
                          </div>
                          <div className="text-white font-bold">VS</div>
                          <div className="text-center">
                            <p className="text-red-400 text-3xl font-extrabold">{match.opponentScore}</p>
                            <p className="text-white/60 text-xs">{match.opponent}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No wins yet</p>
                )}
              </div>
            )}

            {/* Losses Details */}
            {detailView === "losses" && (
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" /> Lost Matches
                </h3>
                {lossMatches.length > 0 ? (
                  <div className="space-y-3">
                    {lossMatches.map((match) => (
                      <div key={match.id} className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold text-lg">vs {match.opponent}</h4>
                          <Badge className="bg-red-600 text-white">LOSS</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-white/60 text-sm">Date</p>
                            <p className="text-white font-semibold">{match.date}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Time</p>
                            <p className="text-white font-semibold">{match.match_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <p className="text-red-400 text-3xl font-extrabold">{match.score}</p>
                            <p className="text-white/60 text-xs">{selectedTeam.teamName}</p>
                          </div>
                          <div className="text-white font-bold">VS</div>
                          <div className="text-center">
                            <p className="text-green-400 text-3xl font-extrabold">{match.opponentScore}</p>
                            <p className="text-white/60 text-xs">{match.opponent}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No losses</p>
                )}
              </div>
            )}

            {/* Score Details - All Matches */}
            {detailView === "score" && (
              <div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6" /> Score Details
                </h3>
                
                {/* Summary Stats */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <p className="text-white/70 text-sm font-semibold mb-2">Total Score</p>
                    <p className="text-5xl font-extrabold text-blue-400 mb-3">{selectedTeam.scoreTotal}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">Average per Match</p>
                        <p className="text-2xl font-bold text-white">
                          {allMatches.length > 0 
                            ? (allMatches.reduce((sum, m) => sum + m.score, 0) / allMatches.length).toFixed(1)
                            : 0
                          }
                        </p>
                      </div>
                      <div className="border-l border-r border-white/20 pl-4 pr-4">
                        <p className="text-white/60 text-sm">Total Matches</p>
                        <p className="text-2xl font-bold text-white">{allMatches.length}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Win Rate</p>
                        <p className="text-2xl font-bold text-white">{selectedTeam.winRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Matches List */}
                {allMatches.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {allMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          match.result === "Win" 
                            ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20" 
                            : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-bold text-lg">vs {match.opponent}</h4>
                            <p className="text-white/60 text-sm">{match.date} • {match.match_time}</p>
                          </div>
                          <Badge className={match.result === "Win" ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                            {match.result.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {/* Score Comparison */}
                        <div className="flex items-center justify-center gap-4 mb-3">
                          <div className="text-center flex-1">
                            <p className={`text-3xl font-extrabold ${match.result === "Win" ? "text-green-400" : "text-red-400"}`}>
                              {match.score}
                            </p>
                            <p className="text-white/60 text-xs mt-1">{selectedTeam.teamName}</p>
                          </div>
                          <div className="text-white font-bold">VS</div>
                          <div className="text-center flex-1">
                            <p className={`text-3xl font-extrabold ${match.result === "Loss" ? "text-green-400" : "text-red-400"}`}>
                              {match.opponentScore}
                            </p>
                            <p className="text-white/60 text-xs mt-1">{match.opponent}</p>
                          </div>
                        </div>

                        {/* Score Difference */}
                        <div className="text-center">
                          <p className="text-white/70 text-sm">
                            Difference: <span className="font-bold text-white">{Math.abs(match.score - match.opponentScore)} points</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No matches yet</p>
                )}
              </div>
            )}

            {/* Close Button - RESPONSIVE */}
            <Button
              onClick={() => setSelectedTeam(null)}
              className="w-full mt-4 sm:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {standings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">No teams found in this group yet.</p>
        </div>
      )}
    </div>
  );
};

export default GroupStandings;
