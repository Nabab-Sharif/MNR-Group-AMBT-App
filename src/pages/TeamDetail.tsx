import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

interface TeamPlayer {
  name: string;
  photo?: string | null;
}

interface TeamDetailData {
  teamName: string;
  wins: number;
  losses: number;
  scoreTotal: number;
  winRate: string;
  winPoints: number;
  loseScore: number;
  averageWinScore: number;
  players: TeamPlayer[];
  leaderPlayer?: TeamPlayer;
}

const TeamDetail = () => {
  const { groupName, teamName } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamDetailData | null>(null);
  const [expandedStats, setExpandedStats] = useState<string | null>(null);

  // Decode URL params
  const decodedTeamName = teamName ? decodeURIComponent(teamName) : "";
  const decodedGroupName = groupName ? decodeURIComponent(groupName) : "";

  // Calculate team stats
  const calculateTeamStats = (allMatches: any[]) => {
    // Normalize team name for matching (case-insensitive, trimmed)
    const normalizedTeamName = decodedTeamName.toLowerCase().trim();
    
    const teamMatches = allMatches.filter((m) => {
      const team1Normalized = (m.team1_name || "").toLowerCase().trim();
      const team2Normalized = (m.team2_name || "").toLowerCase().trim();
      return team1Normalized === normalizedTeamName || team2Normalized === normalizedTeamName;
    });

    let wins = 0;
    let losses = 0;
    let scoreTotal = 0;
    let winScores: number[] = [];
    let loseScores: number[] = [];
    const playersMap = new Map<string, TeamPlayer>();
    let leaderPlayer: TeamPlayer | undefined;

    teamMatches.forEach((match) => {
      const team1Normalized = (match.team1_name || "").toLowerCase().trim();
      const isTeam1 = team1Normalized === normalizedTeamName;
      const teamScore = isTeam1 ? match.team1_score : match.team2_score;

      scoreTotal += teamScore || 0;

      if (match.status === "completed") {
        const winnerNormalized = (match.winner || "").toLowerCase().trim();
        if (winnerNormalized === normalizedTeamName) {
          wins++;
          winScores.push(teamScore || 0);
        } else {
          losses++;
          loseScores.push(teamScore || 0);
        }
      }

      // Extract players using individual field names (like GroupStandings does)
      if (isTeam1) {
        if (match.team1_player1_name) {
          playersMap.set(match.team1_player1_name, {
            name: match.team1_player1_name,
            photo: match.team1_player1_photo || null,
          });
          if (!leaderPlayer) {
            leaderPlayer = {
              name: match.team1_player1_name,
              photo: match.team1_player1_photo || null,
            };
          }
        }
        if (match.team1_player2_name) {
          playersMap.set(match.team1_player2_name, {
            name: match.team1_player2_name,
            photo: match.team1_player2_photo || null,
          });
          if (!leaderPlayer) {
            leaderPlayer = {
              name: match.team1_player2_name,
              photo: match.team1_player2_photo || null,
            };
          }
        }
      } else {
        if (match.team2_player1_name) {
          playersMap.set(match.team2_player1_name, {
            name: match.team2_player1_name,
            photo: match.team2_player1_photo || null,
          });
          if (!leaderPlayer) {
            leaderPlayer = {
              name: match.team2_player1_name,
              photo: match.team2_player1_photo || null,
            };
          }
        }
        if (match.team2_player2_name) {
          playersMap.set(match.team2_player2_name, {
            name: match.team2_player2_name,
            photo: match.team2_player2_photo || null,
          });
          if (!leaderPlayer) {
            leaderPlayer = {
              name: match.team2_player2_name,
              photo: match.team2_player2_photo || null,
            };
          }
        }
      }
    });

    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) + "%" : "0%";
    const averageWinScore = winScores.length > 0
      ? Math.round(winScores.reduce((a, b) => a + b, 0) / winScores.length * 10) / 10
      : 0;

    return {
      teamName: decodedTeamName,
      wins,
      losses,
      scoreTotal,
      winRate,
      winPoints: wins,
      loseScore: loseScores.length > 0
        ? Math.round(loseScores.reduce((a, b) => a + b, 0) / loseScores.length * 10) / 10
        : 0,
      averageWinScore,
      players: Array.from(playersMap.values()),
      leaderPlayer,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("group_name", decodedGroupName)
          .order("date", { ascending: false });

        if (error) throw error;

        console.log('Fetched matches:', data);
        setMatches(data || []);
        const stats = calculateTeamStats(data || []);
        console.log('Calculated stats:', stats);
        setTeamData(stats);
      } catch (err) {
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (decodedGroupName) {
      fetchData();
    }
  }, [decodedGroupName]);

  const teamMatches = useMemo(
    () => {
      const normalizedTeamName = decodedTeamName.toLowerCase().trim();
      return matches.filter((m) => {
        const team1Normalized = (m.team1_name || "").toLowerCase().trim();
        const team2Normalized = (m.team2_name || "").toLowerCase().trim();
        return team1Normalized === normalizedTeamName || team2Normalized === normalizedTeamName;
      });
    },
    [matches, decodedTeamName]
  );

  const winMatches = useMemo(
    () => {
      const normalizedTeamName = decodedTeamName.toLowerCase().trim();
      return teamMatches.filter((m) => {
        const winnerNormalized = (m.winner || "").toLowerCase().trim();
        return winnerNormalized === normalizedTeamName && m.status === "completed";
      });
    },
    [teamMatches, decodedTeamName]
  );

  const lossMatches = useMemo(
    () => {
      const normalizedTeamName = decodedTeamName.toLowerCase().trim();
      return teamMatches.filter((m) => {
        const winnerNormalized = (m.winner || "").toLowerCase().trim();
        return (
          winnerNormalized !== normalizedTeamName &&
          m.status === "completed"
        );
      });
    },
    [teamMatches, decodedTeamName]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Team not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 pb-8 animate-fade-in">
      {/* Header with Back Button */}
      <div className="mb-8 animate-slide-down">
        <Button
          variant="ghost"
          onClick={() => navigate(`/group/${encodeURIComponent(decodedGroupName)}`)}
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Group
        </Button>
        <h1 className="text-4xl font-bold text-white">{teamData.teamName}</h1>
      </div>

      {/* Team Players Section - FIRST */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 mb-8 p-6 animate-slide-up">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>👥</span> Team Players ({teamData.players.length})
        </h2>
        {teamData.players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {teamData.players.map((player, idx) => (
              <div
                key={player.name}
                onClick={() => navigate(`/player/${encodeURIComponent(player.name)}`)}
                className={`group cursor-pointer flex flex-col items-center p-4 rounded-lg hover:scale-110 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 active:scale-95 ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-600/30 to-amber-600/30 border-2 border-yellow-400/60 hover:bg-gradient-to-br hover:from-yellow-600/50 hover:to-amber-600/50 hover:border-yellow-300 hover:shadow-yellow-500/30'
                    : 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-600/40 hover:to-blue-600/40 hover:border-purple-400/80 hover:shadow-purple-500/30'
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              >
                <Avatar className={`mb-3 shadow-lg group-hover:ring-4 transition-all ${
                  idx === 0 
                    ? 'w-20 h-20 border-4 border-yellow-400/60 group-hover:ring-yellow-300' 
                    : 'w-16 h-16 border-3 border-purple-400/60 group-hover:ring-yellow-300'
                }`}>
                  <AvatarImage src={player.photo || ""} alt={player.name} />
                  <AvatarFallback className={`text-white font-bold ${idx === 0 ? 'bg-gradient-to-br from-yellow-600 to-amber-600 text-xl' : 'bg-gradient-to-br from-purple-600 to-blue-600 text-lg'}`}>
                    {player.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {idx === 0 && <p className="text-yellow-300 text-xs font-bold mb-1">👑 Leader</p>}
                <p className={`font-bold text-center line-clamp-2 group-hover:text-yellow-300 transition-colors ${idx === 0 ? 'text-white text-sm' : 'text-white text-sm'}`}>
                  {player.name}
                </p>
                <p className="text-white/50 text-xs mt-1">Click to view</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-center py-8">No players found for this team.</p>
        )}
      </Card>

     

      {/* Detailed Stats - All Clickable */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 mb-8 p-6 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-4">📊 Score Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Wins - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'totalwins' ? null : 'totalwins')}
            className="p-4 bg-amber-500/20 rounded-lg border border-amber-500/30 hover:bg-amber-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-500/30">
            <div className="text-white/70 text-sm font-semibold">🎯 Total Wins Points</div>
            <div className="text-2xl font-bold text-amber-300">{teamData.winPoints}</div>
            {expandedStats === 'totalwins' && (
              <div className="mt-3 pt-3 border-t border-amber-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Win Count</span>
                  <span className="text-green-300 font-bold">{teamData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Loss Count</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Sets</span>
                  <span className="text-blue-300 font-bold">{teamData.wins + teamData.losses}</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Set */}
          {teamData.wins + teamData.losses > 0 && (
            <div 
              className="p-4 bg-amber-600/20 rounded-lg border border-amber-600/30 hover:bg-amber-600/30 transition-all">
              <div className="text-white/70 text-sm font-semibold">📋 Total Matches</div>
              <div className="text-2xl font-bold text-amber-300">{Math.ceil((teamData.wins + teamData.losses) / 3)}</div>
              <div className="mt-3 pt-3 border-t border-amber-600/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Sets</span>
                  <span className="text-blue-300 font-bold">{teamData.wins + teamData.losses}</span>
                </div>
              </div>
            </div>
          )}

          {/* Avg Win Score - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'avgwin' ? null : 'avgwin')}
            className="p-4 bg-cyan-500/20 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/30">
            <div className="text-white/70 text-sm font-semibold">📊 Avg Win Score</div>
            <div className="text-2xl font-bold text-cyan-300">{teamData.averageWinScore}</div>
            {expandedStats === 'avgwin' && (
              <div className="mt-3 pt-3 border-t border-cyan-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Wins Sets</span>
                  <span className="text-green-300 font-bold">{teamData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Score</span>
                  <span className="text-blue-300 font-bold">{teamData.scoreTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Win Rate</span>
                  <span className="text-purple-300 font-bold">{teamData.winRate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Avg Loss Score - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'avgloss' ? null : 'avgloss')}
            className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30 hover:bg-orange-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-orange-500/30">
            <div className="text-white/70 text-sm font-semibold">📉 Avg Loss Score</div>
            <div className="text-2xl font-bold text-orange-300">{teamData.loseScore}</div>
            {expandedStats === 'avgloss' && (
              <div className="mt-3 pt-3 border-t border-orange-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Losses Sets</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Win Rate</span>
                  <span className="text-purple-300 font-bold">{teamData.winRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Sets</span>
                  <span className="text-blue-300 font-bold">{teamData.wins + teamData.losses}</span>
                </div>
              </div>
            )}
          </div>

          {/* Total Matches - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'matches' ? null : 'matches')}
            className="p-4 bg-indigo-500/20 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/30">
            <div className="text-white/70 text-sm font-semibold">🎯 Total Sets</div>
            <div className="text-2xl font-bold text-indigo-300">{teamData.wins + teamData.losses}</div>
            {expandedStats === 'matches' && (
              <div className="mt-3 pt-3 border-t border-indigo-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Wins Sets</span>
                  <span className="text-green-300 font-bold">{teamData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Losses Sets</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Win Rate</span>
                  <span className="text-purple-300 font-bold">{teamData.winRate}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

 {/* Team Overview Stats */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 mb-8 p-6 animate-slide-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Wins - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'wins' ? null : 'wins')}
            className="p-4 bg-green-500/20 rounded-lg border border-green-500/30 hover:bg-green-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-green-500/30">
            <div className="text-white/70 text-sm font-semibold">🏆Total Wins Sets</div>
            <div className="text-3xl font-bold text-green-400">{teamData.wins}</div>
            {expandedStats === 'wins' && (
              <div className="mt-3 pt-3 border-t border-green-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Wins Sets</span>
                  <span className="text-green-300 font-bold">{teamData.winPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Losses Sets</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Win Rate</span>
                  <span className="text-purple-300 font-bold">{teamData.winRate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Losses - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'losses' ? null : 'losses')}
            className="p-4 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-red-500/30">
            <div className="text-white/70 text-sm font-semibold">❌ Total Loss Sets</div>
            <div className="text-3xl font-bold text-red-400">{teamData.losses}</div>
            {expandedStats === 'losses' && (
              <div className="mt-3 pt-3 border-t border-red-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Losses Sets</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Wins</span>
                  <span className="text-green-300 font-bold">{teamData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Avg Loss Score</span>
                  <span className="text-orange-300 font-bold">{teamData.loseScore}</span>
                </div>
              </div>
            )}
          </div>

          {/* Win Rate - Clickable */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'winrate' ? null : 'winrate')}
            className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30 hover:bg-purple-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/30">
            <div className="text-white/70 text-sm font-semibold">📊 WIN RATE</div>
            <div className="text-3xl font-bold text-purple-400">{teamData.winRate}</div>
            {expandedStats === 'winrate' && (
              <div className="mt-3 pt-3 border-t border-purple-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Wins Sets</span>
                  <span className="text-green-300 font-bold">{teamData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Losses Sets</span>
                  <span className="text-red-300 font-bold">{teamData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Sets</span>
                  <span className="text-blue-300 font-bold">{teamData.wins + teamData.losses}</span>
                </div>
              </div>
            )}
          </div>

          {/* Total Score */}
          <div 
            onClick={() => setExpandedStats(expandedStats === 'score' ? null : 'score')}
            className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30 hover:bg-blue-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/30">
            <div className="text-white/70 text-sm font-semibold">💰 TOTAL SCORE</div>
            <div className="text-3xl font-bold text-blue-400">{teamData.scoreTotal}</div>
            {expandedStats === 'score' && (
              <div className="mt-3 pt-3 border-t border-blue-500/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Avg Win Score</span>
                  <span className="text-cyan-300 font-bold">{teamData.averageWinScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Avg Loss Score</span>
                  <span className="text-orange-300 font-bold">{teamData.loseScore}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs for Details */}
      <Card className="bg-card/50 border-primary/30 p-6 animate-slide-up">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 mb-6">
            <TabsTrigger value="overview" className="text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="wins" className="text-white">
              Set Wins ({winMatches.length})
            </TabsTrigger>
            <TabsTrigger value="losses" className="text-white">
              Set Losses ({lossMatches.length})
            </TabsTrigger>
            <TabsTrigger value="players" className="text-white">
              Players ({teamData.players.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Team Summary</h3>
              <p className="text-white/70">
                {decodedTeamName} has played {teamData.wins + teamData.losses} sets with a win rate of{" "}
                <span className="text-amber-300 font-bold">{teamData.winRate}</span>.
              </p>
              <p className="text-white/70">
                The team has won <span className="text-green-400 font-bold">{teamData.wins}</span> sets and lost{" "}
                <span className="text-red-400 font-bold">{teamData.losses}</span> sets.
              </p>
              <p className="text-white/70">
                Average winning score: <span className="text-cyan-400 font-bold">{teamData.averageWinScore}</span>
              </p>
            </div>
          </TabsContent>

          {/* Wins Tab */}
          <TabsContent value="wins">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white mb-4">🏆 Winning Sets ({winMatches.length})</h3>
              {winMatches.length > 0 ? (
                winMatches.map((match) => (
                  <div key={match.id} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {match.team1_name} vs {match.team2_name}
                      </span>
                      <Badge className="bg-green-500/50 text-white">WIN</Badge>
                    </div>
                    <div className="text-white/70 text-sm">
                      Score: <span className="text-green-300 font-bold">{match.team1_name === decodedTeamName ? match.team1_score : match.team2_score}</span> -{" "}
                      <span className="text-red-300 font-bold">{match.team1_name === decodedTeamName ? match.team2_score : match.team1_score}</span>
                    </div>
                    <div className="text-white/50 text-xs mt-1">{match.date && new Date(match.date).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-white/70">No winning matches yet.</p>
              )}
            </div>
          </TabsContent>

          {/* Losses Tab */}
          <TabsContent value="losses">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white mb-4">❌ Losing Sets ({lossMatches.length})</h3>
              {lossMatches.length > 0 ? (
                lossMatches.map((match) => (
                  <div key={match.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {match.team1_name} vs {match.team2_name}
                      </span>
                      <Badge className="bg-red-500/50 text-white">LOSS</Badge>
                    </div>
                    <div className="text-white/70 text-sm">
                      Score: <span className="text-red-300 font-bold">{match.team1_name === decodedTeamName ? match.team1_score : match.team2_score}</span> -{" "}
                      <span className="text-green-300 font-bold">{match.team1_name === decodedTeamName ? match.team2_score : match.team1_score}</span>
                    </div>
                    <div className="text-white/50 text-xs mt-1">{match.date && new Date(match.date).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-white/70">No losing matches yet.</p>
              )}
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white mb-4">👥 Team Players ({teamData.players.length})</h3>
              {teamData.players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {teamData.players.map((player) => (
                    <div
                      key={player.name}
                      onClick={() => navigate(`/player/${encodeURIComponent(player.name)}`)}
                      className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-all"
                    >
                      <Avatar className="w-12 h-12 mb-2 border-2 border-purple-400/60">
                        <AvatarImage src={player.photo || ""} alt={player.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-white/50 text-xs">Click to view profile</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">No players found.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      <Footer />
    </div>
  );
};

export default TeamDetail;
