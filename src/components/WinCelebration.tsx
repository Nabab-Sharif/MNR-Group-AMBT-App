import { Trophy, Star, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { playWinSound } from "@/lib/soundEffects";

interface WinCelebrationProps {
  match: any;
  onClose: () => void;
}

// Confetti particle component
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <div
            className="animate-confetti-spin"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Floating stars background
const FloatingStars = () => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    size: 12 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <Star
          key={star.id}
          className="absolute text-yellow-400 animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export const WinCelebration = ({ match, onClose }: WinCelebrationProps) => {
  const isTeam1Winner = match.winner === match.team1_name;
  const winningTeam = isTeam1Winner ? {
    name: match.team1_name,
    leader: match.team1_leader,
    player1: match.team1_player1_name,
    player2: match.team1_player2_name,
    player1Photo: match.team1_player1_photo,
    player2Photo: match.team2_player2_photo,
    score: match.team1_score || 15,
  } : {
    name: match.team2_name,
    leader: match.team2_leader,
    player1: match.team2_player1_name,
    player2: match.team2_player2_name,
    player1Photo: match.team2_player1_photo,
    player2Photo: match.team2_player2_photo,
    score: match.team2_score || 15,
  };

  const losingScore = isTeam1Winner ? (match.team2_score || 0) : (match.team1_score || 0);

  useEffect(() => {
    const winnerName = isTeam1Winner ? match.team1_name : match.team2_name;
    playWinSound(winnerName);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-gradient-shift" />
      
      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.3)_0%,transparent_70%)] animate-pulse-slow" />
      
      {/* Confetti */}
      <Confetti />
      
      {/* Floating stars */}
      <FloatingStars />
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
      >
        <X className="h-6 w-6 text-white" />
      </button>
      
      {/* Main content */}
      <div className="relative text-center space-y-4 sm:space-y-6 animate-celebration-entrance max-w-2xl w-full mx-auto px-4">
        {/* Tournament Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 rounded-xl px-4 py-3 animate-fade-in shadow-lg">
          <div className="text-white text-xs sm:text-sm font-bold">ANISH MEMORIAL BADMINTON TOURNAMENT</div>
          <div className="text-white/90 text-[10px] sm:text-xs">2025-2026 • Organized by MNR Group</div>
        </div>

        {/* Trophy with glow */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-3xl opacity-60 animate-pulse-glow scale-150" />
          <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full p-6 sm:p-8 shadow-2xl animate-trophy-bounce animate-glow-pulse">
            <Trophy className="h-20 w-20 sm:h-28 sm:w-28 text-yellow-900 drop-shadow-lg" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 sm:h-10 sm:w-10 text-yellow-300 animate-sparkle" />
          <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 animate-sparkle-delayed" />
        </div>

        {/* Congratulations Text with gradient */}
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent animate-shimmer drop-shadow-lg">
            ✨ MATCH WINNER! ✨
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mt-2 animate-fade-in-delayed">
            Congratulations on an amazing victory!
          </p>
        </div>

        {/* Player Circles with enhanced styling */}
        <div className="flex justify-center gap-6 sm:gap-10">
          <div className="text-center animate-player-entrance" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-yellow-400 mx-auto overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-300 to-amber-400"
              >
                {winningTeam.player1Photo ? (
                  <img src={winningTeam.player1Photo} alt={winningTeam.player1} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-yellow-900">{winningTeam.player1.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <p className="font-bold text-white text-base sm:text-lg mt-3">{winningTeam.player1}</p>
          </div>

          <div className="text-center animate-player-entrance" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-yellow-400 mx-auto overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-300 to-amber-400"
              >
                {winningTeam.player2Photo ? (
                  <img src={winningTeam.player2Photo} alt={winningTeam.player2} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-yellow-900">{winningTeam.player2.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <p className="font-bold text-white text-base sm:text-lg mt-3">{winningTeam.player2}</p>
          </div>
        </div>

        {/* Team Name with special styling */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            {winningTeam.name}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg sm:text-xl">🏆</span>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400">
              Group {match.group_name}
            </p>
            <span className="text-yellow-400 text-lg sm:text-xl">🏆</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="animate-score-pop" style={{ animationDelay: '0.9s' }}>
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-2xl">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-yellow-900">{winningTeam.score}</span>
            <span className="text-2xl sm:text-3xl font-bold text-yellow-900/60">-</span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-yellow-900/60">{losingScore}</span>
          </div>
        </div>

        {/* Victory Message */}
        <div className="animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl">
            <p className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              🎉 MATCH WINNER! 🎉
            </p>
          </div>
        </div>

        {/* Close Instruction */}
        <p className="text-white/60 text-sm sm:text-base animate-pulse">
          Click anywhere or press X to continue
        </p>
      </div>
    </div>
  );
};
