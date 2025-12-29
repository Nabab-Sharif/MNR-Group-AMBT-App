import { Trophy, Star, Sparkles, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const isTeam1Winner = match.winner === match.team1_name;
  const winningTeam = isTeam1Winner ? {
    name: match.team1_name,
    leader: match.team1_leader,
    player1: match.team1_player1_name,
    player2: match.team1_player2_name,
    player1Photo: match.team1_player1_photo,
    player2Photo: match.team1_player2_photo,
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

  const losingTeam = isTeam1Winner ? {
    name: match.team2_name,
    player1: match.team2_player1_name,
    player2: match.team2_player2_name,
  } : {
    name: match.team1_name,
    player1: match.team1_player1_name,
    player2: match.team1_player2_name,
  };

  const losingScore = isTeam1Winner ? (match.team2_score || 0) : (match.team1_score || 0);

  useEffect(() => {
    const winnerName = isTeam1Winner ? match.team1_name : match.team2_name;
    playWinSound(winnerName);

    // Auto-download screenshot after animations start
    setTimeout(() => {
      downloadWinScreenshot(match);
    }, 1500);
  }, []);

  // Function to auto-download screenshot of win message
  const downloadWinScreenshot = async (matchData: any) => {
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      if (contentRef.current) {
        const canvas = await html2canvas(contentRef.current, {
          backgroundColor: '#0f172a',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `match-winner-${matchData.group_name}-${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Screenshot download failed:', err);
      // Fallback: still works even if html2canvas fails
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 cursor-pointer"
      onClick={onClose}
      style={{ perspective: '1200px' }}
    >
      {/* Enhanced animated gradient background with fire colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 animate-gradient-shift" />
      
      {/* Fire-like radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,69,0,0.4)_0%,rgba(255,165,0,0.2)_40%,transparent_70%)] animate-pulse-slow" />
      
      {/* Additional flame glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,215,0,0.2)_0%,transparent_50%)] animate-pulse-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,69,0,0.15)_0%,transparent_50%)] animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      
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
      
      {/* Main content with 3D perspective */}
      <div className="relative text-center space-y-4 sm:space-y-6 animate-celebration-entrance max-w-7xl w-full mx-auto px-2 sm:px-4" ref={contentRef} style={{ transformStyle: 'preserve-3d' }}>
        {/* Tournament Header - Larger */}
        <div className="bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600 rounded-2xl px-6 py-4 sm:py-5 animate-fade-in shadow-lg border-2 border-white/30">
          <div className="text-white text-sm sm:text-base md:text-lg font-bold tracking-wide">ANIS MEMORIAL BADMINTON TOURNAMENT</div>
          <div className="text-white/90 text-xs sm:text-sm md:text-base mt-1">2025-2026 • Organized by MNR Group</div>
        </div>

        {/* Trophy with enhanced 3D fire glow */}
        <div className="relative inline-block" style={{ perspective: '1000px' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur-3xl opacity-70 animate-flame-flare scale-150" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-50 animate-pulse-slow" />
          <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full p-6 sm:p-8 shadow-2xl animate-trophy-golden-spin animate-fire-glow-pulse" style={{ transformStyle: 'preserve-3d', boxShadow: '0 0 40px rgba(255, 69, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.3)' }}>
            <Trophy className="h-20 w-20 sm:h-28 sm:w-28 text-yellow-900 drop-shadow-lg" />
          </div>
          <Sparkles className="absolute -top-3 -right-3 h-8 w-8 sm:h-10 sm:w-10 text-yellow-300 animate-sparkle" />
          <Sparkles className="absolute -bottom-3 -left-3 h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 animate-sparkle-delayed" />
        </div>

        {/* Congratulations Text with fire glow effect */}
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent animate-shimmer drop-shadow-lg animate-text-fire-glow">
            ✨ MATCH WINNER! ✨
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mt-2 animate-fade-in-delayed">
            Congratulations on an amazing victory!
          </p>
        </div>

        {/* Enhanced Player Circles with wider 3D grid layout and fire effects */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-12 w-full max-w-5xl mx-auto px-2 sm:px-4" style={{ perspective: '1000px' }}>
          {/* Player 1 - Left side with 3D tilt */}
          <div className="text-center transform transition-all hover:scale-105" style={{ transformStyle: 'preserve-3d', transformOrigin: 'center', animation: 'rotateYLeft 6s ease-in-out infinite' }}>
            <div className="animate-player-fire-entrance" style={{ animationDelay: '0.3s' }}>
              <div className="relative mx-auto w-fit">
                {/* Fire glow rings */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur-2xl opacity-60 animate-flame-flare" style={{ width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', margin: '-15px' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-40 animate-pulse-glow" style={{ width: 'calc(100% + 15px)', height: 'calc(100% + 15px)', margin: '-7.5px' }} />
                
                {/* Player circle with 3D depth - LARGER SIZE */}
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 rounded-full flex items-center justify-center text-5xl sm:text-6xl md:text-7xl font-bold border-4 border-yellow-400 mx-auto overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-300 to-amber-400 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-fire-glow-pulse" style={{ boxShadow: '0 0 30px rgba(255, 69, 0, 0.5), 0 0 60px rgba(255, 165, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.2)' }}>
                  {winningTeam.player1Photo ? (
                    <img src={winningTeam.player1Photo} alt={winningTeam.player1} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-yellow-900">{winningTeam.player1.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <p className="font-bold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4 sm:mt-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{winningTeam.player1}</p>
            </div>
          </div>

          {/* Player 2 - Right side with 3D tilt */}
          <div className="text-center transform transition-all hover:scale-105" style={{ transformStyle: 'preserve-3d', transformOrigin: 'center', animation: 'rotateYRight 6s ease-in-out infinite' }}>
            <div className="animate-player-fire-entrance" style={{ animationDelay: '0.4s' }}>
              <div className="relative mx-auto w-fit">
                {/* Fire glow rings */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur-2xl opacity-60 animate-flame-flare" style={{ width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', margin: '-15px', animationDelay: '0.2s' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-40 animate-pulse-glow" style={{ width: 'calc(100% + 15px)', height: 'calc(100% + 15px)', margin: '-7.5px', animationDelay: '0.1s' }} />
                
                {/* Player circle with 3D depth - LARGER SIZE */}
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 rounded-full flex items-center justify-center text-5xl sm:text-6xl md:text-7xl font-bold border-4 border-yellow-400 mx-auto overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-300 to-amber-400 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-fire-glow-pulse" style={{ animationDelay: '0.2s', boxShadow: '0 0 30px rgba(255, 69, 0, 0.5), 0 0 60px rgba(255, 165, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.2)' }}>
                  {winningTeam.player2Photo ? (
                    <img src={winningTeam.player2Photo} alt={winningTeam.player2} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-yellow-900">{winningTeam.player2.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <p className="font-bold text-white text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4 sm:mt-5 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>{winningTeam.player2}</p>
            </div>
          </div>
        </div>

        {/* Team Name with fire glow styling */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-lg animate-text-fire-glow">
            {winningTeam.name}
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl animate-pulse">🔥</span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 animate-text-fire-glow">
              Group {match.group_name}
            </p>
            <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl animate-pulse">🔥</span>
          </div>
        </div>

        {/* Score Display with fire effects */}
        <div className="animate-score-pop" style={{ animationDelay: '0.9s' }}>
          <div className="inline-flex items-center gap-6 sm:gap-8 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 px-10 sm:px-16 md:px-20 py-5 sm:py-7 md:py-8 rounded-3xl shadow-2xl animate-fire-glow-pulse text-center" style={{ boxShadow: '0 0 30px rgba(255, 69, 0, 0.4), 0 0 60px rgba(255, 165, 0, 0.3)' }}>
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-yellow-900 animate-text-fire-glow">{winningTeam.score}</span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-900/60">-</span>
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-yellow-900/60">{losingScore}</span>
          </div>
        </div>

        {/* Losing Team Info with enhanced styling */}
        <div className="animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
          <div className="bg-gradient-to-r from-red-900/60 to-pink-900/60 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl border-2 border-red-500/70 shadow-lg" style={{ boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' }}>
            <p className="text-white/80 text-base sm:text-lg font-semibold">Competing Team</p>
            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold mt-1">{losingTeam.name}</p>
            <p className="text-white/70 text-sm sm:text-base md:text-lg mt-2">{losingTeam.player1} & {losingTeam.player2}</p>
          </div>
        </div>

        {/* Victory Message with fire effect */}
        <div className="animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl shadow-xl animate-fire-glow-pulse">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center gap-2 animate-text-fire-glow justify-center">
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
