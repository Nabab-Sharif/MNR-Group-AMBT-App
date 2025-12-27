import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, X } from "lucide-react";
import GroupStandings from "@/components/GroupStandings";

interface TeamStats {
  name: string;
  totalScore: number;
  wins: number;
  losses: number;
  winRate: string;
}

const GroupDetail = () => {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [matchesSearch, setMatchesSearch] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Calculate team stats (wins, losses, win rate)
  const teamStats: Record<string, TeamStats> = {};
  
  matches.forEach((m) => {
    if (!teamStats[m.team1_name]) {
      teamStats[m.team1_name] = { name: m.team1_name, totalScore: 0, wins: 0, losses: 0, winRate: "0%" };
    }
    if (!teamStats[m.team2_name]) {
      teamStats[m.team2_name] = { name: m.team2_name, totalScore: 0, wins: 0, losses: 0, winRate: "0%" };
    }

    // Add scores
    teamStats[m.team1_name].totalScore += m.team1_score || 0;
    teamStats[m.team2_name].totalScore += m.team2_score || 0;

    // Track wins/losses
    if (m.status === "completed") {
      if (m.winner === m.team1_name) {
        teamStats[m.team1_name].wins += 1;
        teamStats[m.team2_name].losses += 1;
      } else if (m.winner === m.team2_name) {
        teamStats[m.team2_name].wins += 1;
        teamStats[m.team1_name].losses += 1;
      }
    }
  });

  // Calculate win rates
  Object.values(teamStats).forEach((team) => {
    const total = team.wins + team.losses;
    const rate = total > 0 ? ((team.wins / total) * 100).toFixed(1) : "0.0";
    team.winRate = `${rate}%`;
  });

  // Sort by wins first (descending), then by total score (descending)
  const sortedTeams = Object.values(teamStats).sort((a, b) => {
    // Primary sort by wins (descending)
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    // Secondary sort by total score (descending)
    return b.totalScore - a.totalScore;
  }); // Show all teams, not limited to 10
  
  // Filter leaderboard based on search - HOOK CALL
  const filteredLeaderboard = useMemo(() => {
    return sortedTeams.filter((team) =>
      team.name.toLowerCase().includes(leaderboardSearch.toLowerCase())
    );
  }, [sortedTeams, leaderboardSearch]);

  // Filter matches based on search AND show only completed matches - HOOK CALL
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const searchLower = matchesSearch.toLowerCase();
      return (
        match.status === "completed" &&
        (match.team1_name.toLowerCase().includes(searchLower) ||
        match.team2_name.toLowerCase().includes(searchLower) ||
        (match.venue && match.venue.toLowerCase().includes(searchLower)))
      );
    });
  }, [matches, matchesSearch]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredMatches.forEach((match) => {
      if (!grouped[match.date]) {
        grouped[match.date] = [];
      }
      grouped[match.date].push(match);
    });
    // Sort dates in descending order
    return Object.entries(grouped).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
  }, [filteredMatches]);

  // Calculate team match sequence
  const getTeamMatchSequence = (teamName: string) => {
    const completedMatches = matches
      .filter(m => (m.team1_name === teamName || m.team2_name === teamName) && m.status === "completed")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const sequence: Record<string, string> = {};
    completedMatches.forEach((match, index) => {
      sequence[match.id] = ['1st', '2nd', '3rd'][index] || (index + 1).toString();
    });
    return sequence;
  };

  useEffect(() => {
    const fetchGroupMatches = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("group_name", groupName)
          .order("date", { ascending: true });

        if (error) throw error;
        setMatches(data || []);
      } catch (err) {
        console.error("Error fetching group matches:", err);
      } finally {
        setLoading(false);
      }
    };

    if (groupName) {
      fetchGroupMatches();
    }
  }, [groupName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  // Calculate per-player aggregated stats within this group
  interface PlayerStat {
    name: string;
    photo?: string | null;
    totalPoints: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    lastPlayed?: string | null;
  }

  const playerMap: Record<string, PlayerStat> = {};

  const addOrUpdatePlayer = (name: string | null | undefined, photo: string | null | undefined, teamName: string, scoreKey: string, matchItem: any) => {
    if (!name) return;
    if (!playerMap[name]) {
      playerMap[name] = {
        name,
        photo: photo || null,
        totalPoints: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        lastPlayed: null,
      };
    }

    const p = playerMap[name];
    p.matchesPlayed += 1;

    // If match stores per-player breakdown in player_scores JSON, use it
    const ps = matchItem.player_scores || {};
    if (ps && Array.isArray(ps[scoreKey])) {
      p.totalPoints += ps[scoreKey].reduce((a: number, b: number) => a + b, 0);
    }

    if (matchItem.status === 'completed') {
      if (matchItem.winner && matchItem.winner === teamName) p.wins += 1;
      else if (matchItem.winner && matchItem.winner !== teamName) p.losses += 1;
    }

    // lastPlayed - keep most recent
    if (!p.lastPlayed || new Date(matchItem.date) > new Date(p.lastPlayed)) {
      p.lastPlayed = matchItem.date;
    }
  };

  matches.forEach((m) => {
    addOrUpdatePlayer(m.team1_player1_name, m.team1_player1_photo, m.team1_name, 'team1p1', m);
    addOrUpdatePlayer(m.team1_player2_name, m.team1_player2_photo, m.team1_name, 'team1p2', m);
    addOrUpdatePlayer(m.team2_player1_name, m.team2_player1_photo, m.team2_name, 'team2p1', m);
    addOrUpdatePlayer(m.team2_player2_name, m.team2_player2_photo, m.team2_name, 'team2p2', m);
  });

  const sortedPlayers = Object.values(playerMap).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="bg-white/10 border-white/30 hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div>
            <h1 className="text-4xl font-extrabold text-white">{groupName}</h1>
            <p className="text-white/70">Tournament Group Details</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-lg">
          {matches.length} Matches
        </Badge>
      </div>

      {/* Group Standings Section */}
      <GroupStandings matches={matches} groupName={groupName} />

      {/* Statistics + Scoreboard Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Statistics */}
        <Card className="lg:col-span-1 p-4 sm:p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">📊 Statistics</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-xs sm:text-sm">Total Matches</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-blue-400">{matches.length}</div>
            </div>
            <div className="p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-xs sm:text-sm">Completed</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-green-400">
                {matches.filter((m) => m.status === "completed").length}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-xs sm:text-sm">Live/Upcoming</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-orange-400">
                {matches.filter((m) => m.status !== "completed").length}
              </div>
            </div>
          </div>
        </Card>

        {/* Scoreboard */}
        <Card className="lg:col-span-2 p-4 sm:p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">🏆 Point Table (All Teams)</h2>
            {leaderboardSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeaderboardSearch("")}
                className="text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Search Input */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search team..."
              value={leaderboardSearch}
              onChange={(e) => setLeaderboardSearch(e.target.value)}
              className="pl-10 text-sm sm:text-base bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLeaderboard.map((team, idx) => {
              const rank = sortedTeams.findIndex(t => t.name === team.name) + 1;
              return (
              <div
                key={team.name}
                className="p-3 sm:p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="text-lg sm:text-xl font-bold text-yellow-400 w-7 sm:w-8 text-center flex-shrink-0">
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base truncate">{team.name}</span>
                  </div>
                  <span className="text-yellow-300 font-extrabold text-base sm:text-lg flex-shrink-0">{team.totalScore}</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-white/70">
                  <span>🎯Total Wins Points: <span className="text-green-400 font-bold">{team.wins}</span></span>
                  <span>🏅 Total Win: <span className="text-amber-400 font-bold">{team.wins}</span></span>
                  <span>❌ L: <span className="text-red-400 font-bold">{team.losses}</span></span>
                  <span>📊 {team.winRate}</span>
                </div>
              </div>
            );
            })}
            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-8 text-white/50 text-sm sm:text-base">
                No teams found matching "{leaderboardSearch}"
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Matches List */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">🏆 Completed Matches (Wins)</h2>
          {matchesSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMatchesSearch("")}
              className="text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search by team or venue..."
            value={matchesSearch}
            onChange={(e) => setMatchesSearch(e.target.value)}
            className="pl-10 text-sm sm:text-base bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Date wise grouped matches */}
        <div className="space-y-4">
          {matchesByDate.length > 0 ? (
            matchesByDate.map(([date, dateMatches]) => {
              const team1Sequence = getTeamMatchSequence(dateMatches[0]?.team1_name);
              const team2Sequence = getTeamMatchSequence(dateMatches[0]?.team2_name);
              
              return (
                <div key={date}>
                  {/* Date Card Header */}
                  <button
                    onClick={() => setExpandedDate(expandedDate === date ? null : date)}
                    className="w-full p-4 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/50 rounded-lg hover:from-blue-600/50 hover:to-purple-600/50 transition mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div className="text-left">
                          <div className="text-white font-bold text-lg">{date}</div>
                          <div className="text-white/70 text-sm">{dateMatches.length} match{dateMatches.length > 1 ? 'es' : ''}</div>
                        </div>
                      </div>
                      <span className="text-white text-2xl">
                        {expandedDate === date ? '▼' : '▶'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded match details */}
                  {expandedDate === date && (
                    <div className="ml-4 pl-4 border-l-2 border-blue-400/50 space-y-3">
                      {/* Display all matches from this date without duplicate grouping */}
                      {dateMatches.map((match) => {
                                    const team1Seq = getTeamMatchSequence(match.team1_name)[match.id] || '-';
                                    const team2Seq = getTeamMatchSequence(match.team2_name)[match.id] || '-';
                                    
                                    return (
                                      <div
                                        key={match.id}
                                        className="p-3 sm:p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition"
                                      >
                                        {/* Team Names Header - Team1 VS Team2 */}
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                                          <div className="text-white font-bold text-base sm:text-lg">{match.team1_name}</div>
                                          <div className="text-white/70 font-bold text-sm">VS</div>
                                          <div className="text-white font-bold text-base sm:text-lg">{match.team2_name}</div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                          <Badge
                                            variant={
                                              match.status === "live"
                                                ? "destructive"
                                                : match.status === "completed"
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            {match.status.toUpperCase()}
                                          </Badge>
                                          <div className="text-white/70 text-sm">
                                            {match.match_time || "TBD"} • {match.venue || "TBD"}
                                          </div>
                                        </div>

                                        {/* Match Score */}
                                        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center mb-3">
                                          <div className="text-right p-3 rounded-lg bg-blue-600/20 border-2 border-blue-400 animate-pulse">
                                            <div className="text-white font-bold mb-2 text-sm sm:text-base">{match.team1_name}</div>
                                            <div className="text-blue-400 text-2xl sm:text-3xl font-extrabold">{match.team1_score || 0}</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-white/50 font-bold text-lg">VS</div>
                                          </div>
                                          <div className="text-left p-3 rounded-lg bg-orange-600/20 border-2 border-orange-400 animate-pulse">
                                            <div className="text-white font-bold mb-2 text-sm sm:text-base">{match.team2_name}</div>
                                            <div className="text-orange-400 text-2xl sm:text-3xl font-extrabold">{match.team2_score || 0}</div>
                                          </div>
                                        </div>

                                        {/* Winner */}
                                        {match.winner && (
                                          <div className="text-center text-yellow-300 font-bold text-sm">
                                            🏆 Winner: {match.winner}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-white/50">
              No matches found
            </div>
          )}
        </div>
      </Card>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default GroupDetail;
