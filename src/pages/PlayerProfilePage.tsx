import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Target, TrendingUp, Calendar, User, Building2, MapPin, Zap, Award } from "lucide-react";
import { Footer } from "@/components/Footer";

interface PlayerStats {
  name: string;
  photo: string | null;
  department: string | null;
  unit: string | null;
  total_score: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matchHistory: Array<{
    match_id: string;
    date: string;
    opponent_team: string;
    score: number;
    result: 'won' | 'lost' | 'pending';
    match_time: string;
  }>;
}

export default function PlayerProfilePage() {
  const { playerName } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!playerName) return;

      const decodedName = decodeURIComponent(playerName);

      // Fetch all matches where this player participated
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`team1_player1_name.eq.${decodedName},team1_player2_name.eq.${decodedName},team2_player1_name.eq.${decodedName},team2_player2_name.eq.${decodedName}`);

      if (error) {
        console.error('Error fetching player stats:', error);
        setLoading(false);
        return;
      }

      if (!matches || matches.length === 0) {
        setLoading(false);
        return;
      }

      let totalScore = 0;
      let matchesWon = 0;
      let matchesLost = 0;
      let photo: string | null = null;
      let department: string | null = null;
      let unit: string | null = null;
      const matchHistory: PlayerStats['matchHistory'] = [];

      matches.forEach(match => {
        let playerScore = 0;
        let playerTeam = '';
        let opponentTeam = '';

        if (match.team1_player1_name === decodedName) {
          playerScore = match.team1_player1_score || 0;
          photo = photo || match.team1_player1_photo;
          department = department || match.team1_player1_department;
          unit = unit || match.team1_player1_unit;
          playerTeam = match.team1_name;
          opponentTeam = match.team2_name;
        } else if (match.team1_player2_name === decodedName) {
          playerScore = match.team1_player2_score || 0;
          photo = photo || match.team1_player2_photo;
          department = department || match.team1_player2_department;
          unit = unit || match.team1_player2_unit;
          playerTeam = match.team1_name;
          opponentTeam = match.team2_name;
        } else if (match.team2_player1_name === decodedName) {
          playerScore = match.team2_player1_score || 0;
          photo = photo || match.team2_player1_photo;
          department = department || match.team2_player1_department;
          unit = unit || match.team2_player1_unit;
          playerTeam = match.team2_name;
          opponentTeam = match.team1_name;
        } else if (match.team2_player2_name === decodedName) {
          playerScore = match.team2_player2_score || 0;
          photo = photo || match.team2_player2_photo;
          department = department || match.team2_player2_department;
          unit = unit || match.team2_player2_unit;
          playerTeam = match.team2_name;
          opponentTeam = match.team1_name;
        }

        totalScore += playerScore;

        let result: 'won' | 'lost' | 'pending' = 'pending';
        if (match.status === 'completed' && match.winner) {
          if (match.winner === playerTeam) {
            matchesWon++;
            result = 'won';
          } else {
            matchesLost++;
            result = 'lost';
          }
        }

        matchHistory.push({
          match_id: match.id,
          date: match.date,
          opponent_team: opponentTeam,
          score: playerScore,
          result,
          match_time: match.match_time || '12:00'
        });
      });

      setPlayer({
        name: decodedName,
        photo,
        department,
        unit,
        total_score: totalScore,
        matches_played: matches.length,
        matches_won: matchesWon,
        matches_lost: matchesLost,
        matchHistory: matchHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });

      setLoading(false);
    };

    fetchPlayerStats();
  }, [playerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading player profile...</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">Player not found</div>
        <Button onClick={() => navigate(-1)} variant="outline" className="text-white border-white hover:bg-white/10">
          Go Back
        </Button>
      </div>
    );
  }

  const winRate = player.matches_played > 0
    ? Math.round((player.matches_won / player.matches_played) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header - Full Width */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-center py-3 sm:py-4 shadow-2xl relative z-10">
        <h1 className="text-slate-900 font-bold text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide">
          🏸 ANIS MEMORIAL BADMINTON TOURNAMENT 2025-2026 🏸
        </h1>
      </div>

      {/* Organized By Bar - Full Width */}
      <div className="bg-gradient-to-r from-cyan-500 to-sky-500 text-center py-2 shadow-lg relative z-10">
        <p className="text-white text-xs md:text-sm sm:text-sm font-medium">✨ Organized by MNR Group ✨</p>
      </div>

      {/* Main Content Area - Flex Grow */}
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-4xl mx-auto relative z-20">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-white mb-6 hover:bg-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>

          {/* Profile Header Card with 3D Effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <Card className="relative bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 backdrop-blur-xl border-white/30 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                {/* Avatar with 3D Perspective */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center border-4 border-white/50 shadow-2xl overflow-hidden transform hover:scale-110 transition-transform duration-300">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-6xl font-bold">{player.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {/* Name with Gradient */}
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-3">
                  {player.name}
                </h1>

                {/* Department & Unit Info */}
                {(player.department || player.unit) && (
                  <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
                    {player.department && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:border-white/40 transition-all">
                        <Building2 className="h-5 w-5 text-cyan-400" />
                        <span>{player.department}</span>
                      </div>
                    )}
                    {player.unit && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:border-white/40 transition-all">
                        <MapPin className="h-5 w-5 text-purple-400" />
                        <span>{player.unit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid with 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Score Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <Card className="relative bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-white animate-bounce" />
                </div>
                <div className="text-5xl font-black text-white mb-2">{player.total_score}</div>
                <div className="text-white/90 text-sm font-semibold">Total Points</div>
              </CardContent>
            </Card>
          </div>

          {/* Matches Won Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <Card className="relative bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-12 w-12 text-white animate-bounce" style={{ animationDelay: '0.1s' }} />
                </div>
                <div className="text-5xl font-black text-white mb-2">{player.matches_won}</div>
                <div className="text-white/90 text-sm font-semibold">Total Sets Won</div>
              </CardContent>
            </Card>
          </div>

          {/* Matches Lost Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <Card className="relative bg-gradient-to-br from-red-500 to-pink-600 border-0 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="h-12 w-12 text-white animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="text-5xl font-black text-white mb-2">{player.matches_lost}</div>
                <div className="text-white/90 text-sm font-semibold">Total Sets Lost</div>
              </CardContent>
            </Card>
          </div>

          {/* Win Rate Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <Card className="relative bg-gradient-to-br from-purple-500 to-violet-600 border-0 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-white animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <div className="text-5xl font-black text-white mb-2">{winRate}%</div>
                <div className="text-white/90 text-sm font-semibold">Win Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Match History Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
          <Card className="relative bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 backdrop-blur-xl border-white/30 shadow-2xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text mb-6 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-cyan-400" />
                Match History
              </h2>

              <div className="space-y-3">
                {player.matchHistory.map((match, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border backdrop-blur-sm transition-all hover:scale-102 transform ${match.result === 'won'
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 hover:border-green-400'
                      : match.result === 'lost'
                        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 hover:border-red-400'
                        : 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 hover:border-white/40'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          vs {match.opponent_team}
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          📅 {match.date} • ⏰ {match.match_time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-2xl bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                          {match.score}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${match.result === 'won' ? 'text-green-300' :
                          match.result === 'lost' ? 'text-red-300' : 'text-white/60'
                          }`}>
                          {match.result === 'won' ? '🏆 WON' : match.result === 'lost' ? '❌ LOST' : '⏳ PENDING'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {player.matchHistory.length === 0 && (
                  <div className="text-white/60 text-center py-8 text-lg">No match history available</div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      
      {/* Footer - Full Width */}
      <Footer />
    </div>
    
  );
}
