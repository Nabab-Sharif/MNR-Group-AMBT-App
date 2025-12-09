import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const GroupDetail = () => {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate team totals
  const teamTotals: Record<string, number> = {};
  matches.forEach((m) => {
    teamTotals[m.team1_name] = (teamTotals[m.team1_name] || 0) + (m.team1_score || 0);
    teamTotals[m.team2_name] = (teamTotals[m.team2_name] || 0) + (m.team2_score || 0);
  });

  const sortedTeams = Object.entries(teamTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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

      {/* Top Teams Leaderboard */}
      <div className="mb-8 grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-4">🏆 Leaderboard</h2>
          <div className="space-y-3">
            {sortedTeams.map(([team, score], idx) => (
              <div
                key={team}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-yellow-400 w-8 text-center">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </div>
                  <span className="text-white font-semibold">{team}</span>
                </div>
                <span className="text-yellow-300 font-extrabold text-xl">{score}</span>
              </div>
            ))}
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
        <h2 className="text-2xl font-bold text-white mb-6">📋 All Matches</h2>
        <div className="grid gap-4">
          {matches.map((match) => (
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
