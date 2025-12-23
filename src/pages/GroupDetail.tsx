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

  const sortedTeams = Object.values(teamStats).sort((a, b) => b.totalScore - a.totalScore);
  
  // Filter leaderboard based on search - HOOK CALL
  const filteredLeaderboard = useMemo(() => {
    return sortedTeams.filter((team) =>
      team.name.toLowerCase().includes(leaderboardSearch.toLowerCase())
    );
  }, [sortedTeams, leaderboardSearch]);

  // Filter matches based on search - HOOK CALL
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const searchLower = matchesSearch.toLowerCase();
      return (
        match.team1_name.toLowerCase().includes(searchLower) ||
        match.team2_name.toLowerCase().includes(searchLower) ||
        (match.venue && match.venue.toLowerCase().includes(searchLower))
      );
    });
  }, [matches, matchesSearch]);

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
      <GroupStandings matches={matches} />

      {/* Top Teams Leaderboard */}
      <div className="mb-8 grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search team..."
              value={leaderboardSearch}
              onChange={(e) => setLeaderboardSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-3">
            {filteredLeaderboard.slice(0, 10).map((team, idx) => (
              <div
                key={team.name}
                className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-yellow-400 w-8 text-center">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </div>
                    <span className="text-white font-semibold">{team.name}</span>
                  </div>
                  <span className="text-yellow-300 font-extrabold text-xl">{team.totalScore}</span>
                </div>
                <div className="flex gap-4 text-xs text-white/70">
                  <span>🎯 Win: <span className="text-green-400 font-bold">{team.wins}</span></span>
                  <span>❌ Loss: <span className="text-red-400 font-bold">{team.losses}</span></span>
                  <span>📊 Rate: <span className="text-blue-400 font-bold">{team.winRate}</span></span>
                </div>
              </div>
            ))}
            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-8 text-white/50">
                No teams found matching "{leaderboardSearch}"
              </div>
            )}
          </div>
        </Card>

        {/* Match Stats */}
        <Card className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Statistics</h2>
          <div className="space-y-3">
            <div className="p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-sm">Total Matches</div>
              <div className="text-4xl font-extrabold text-blue-400">{matches.length}</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-sm">Completed</div>
              <div className="text-4xl font-extrabold text-green-400">
                {matches.filter((m) => m.status === "completed").length}
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/70 text-sm">Live/Upcoming</div>
              <div className="text-4xl font-extrabold text-orange-400">
                {matches.filter((m) => m.status !== "completed").length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Matches List */}
      <Card className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📋 All Matches</h2>
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search by team or venue..."
            value={matchesSearch}
            onChange={(e) => setMatchesSearch(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div className="grid gap-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 flex-1">
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
                    {match.date} • {match.match_time || "TBD"}
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="grid grid-cols-3 gap-4 items-center mb-3">
                <div className="text-right">
                  <div className="text-white font-bold mb-1">{match.team1_name}</div>
                  <div className="text-blue-400 text-2xl font-extrabold">{match.team1_score || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 font-bold">VS</div>
                </div>
                <div className="text-left">
                  <div className="text-white font-bold mb-1">{match.team2_name}</div>
                  <div className="text-orange-400 text-2xl font-extrabold">{match.team2_score || 0}</div>
                </div>
              </div>

              {/* Winner */}
              {match.winner && (
                <div className="text-center text-yellow-300 font-bold">
                  🏆 Winner: {match.winner}
                </div>
              )}
            </div>
          ))}
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
