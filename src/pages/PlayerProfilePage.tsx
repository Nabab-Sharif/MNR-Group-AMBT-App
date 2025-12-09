import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Target, TrendingUp, Calendar, User, Building2, MapPin } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-purple-600 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">Player not found</div>
        <Button onClick={() => navigate(-1)} variant="outline" className="text-white border-white">
          Go Back
        </Button>
      </div>
    );
  }

  const winRate = player.matches_played > 0 
    ? Math.round((player.matches_won / player.matches_played) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="text-white mb-4 hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>

        {/* Profile Header */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-2xl overflow-hidden mb-4">
                {player.photo ? (
                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sky-600">{player.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Name & Info */}
              <h1 className="text-3xl font-bold text-white mb-2">{player.name}</h1>
              
              {(player.department || player.unit) && (
                <div className="flex flex-wrap justify-center gap-3 text-white/80 text-sm">
                  {player.department && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{player.department}</span>
                    </div>
                  )}
                  {player.unit && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{player.unit}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-0">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{player.total_score}</div>
              <div className="text-white/80 text-sm">Total Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400 to-green-500 border-0">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{player.matches_won}</div>
              <div className="text-white/80 text-sm">Matches Won</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-400 to-red-500 border-0">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{player.matches_lost}</div>
              <div className="text-white/80 text-sm">Matches Lost</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400 to-purple-500 border-0">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{winRate}%</div>
              <div className="text-white/80 text-sm">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Match History */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Match History
            </h2>
            
            <div className="space-y-3">
              {player.matchHistory.map((match, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    match.result === 'won' 
                      ? 'bg-green-500/30 border border-green-400/50' 
                      : match.result === 'lost'
                      ? 'bg-red-500/30 border border-red-400/50'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">vs {match.opponent_team}</div>
                      <div className="text-white/60 text-xs">
                        {match.date} • {match.match_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">Score: {match.score}</div>
                      <div className={`text-xs font-medium ${
                        match.result === 'won' ? 'text-green-300' : 
                        match.result === 'lost' ? 'text-red-300' : 'text-white/60'
                      }`}>
                        {match.result === 'won' ? '🏆 Won' : match.result === 'lost' ? '❌ Lost' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {player.matchHistory.length === 0 && (
                <div className="text-white/60 text-center py-4">No match history available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
