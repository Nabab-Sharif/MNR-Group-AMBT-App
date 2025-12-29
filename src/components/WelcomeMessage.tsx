import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeToTwelveHour } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface WelcomeMessageProps {
  match: any;
  onClose: () => void;
}

export const WelcomeMessage = ({ match, onClose }: WelcomeMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Auto-download match preview screenshot on component mount
  useEffect(() => {
    setTimeout(() => {
      downloadMatchScreenshot(match);
    }, 1500); // Wait for animations to complete
  }, [match]);

  // Function to auto-download screenshot of the message
  const downloadMatchScreenshot = async (matchData: any) => {
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      if (messageRef.current) {
        const canvas = await html2canvas(messageRef.current, {
          backgroundColor: '#0f172a',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `match-welcome-${matchData.group_name}-${new Date().getTime()}.png`;
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
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Top Handle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-cyan-400 rounded-full" />
      
      {/* Close Button */}
      <Button
        onClick={onClose}
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div className="text-center space-y-6 animate-scale-in max-w-5xl w-full" onClick={(e) => e.stopPropagation()} ref={messageRef}>
        {/* Welcome Title */}
        <div>
          <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
            🎉 Welcome! 🎉
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold text-yellow-400 mt-2">
            Anis Memorial Badminton Tournament
          </h2>
          <p className="text-white/80 text-base sm:text-lg mt-1">
            Organized by MNR Group
          </p>
        </div>

        {/* Match Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl animate-slide-up">
          {/* Group Name & Info */}
          <div className="text-center mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 rounded-full mb-3">
              <span className="text-white font-bold text-lg">Group {match.group_name}</span>
            </div>
            <p className="text-white/70 text-sm">Live Match Starting</p>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-4 text-white/80 text-base sm:text-lg mb-6 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="flex items-center gap-1">
              📅 {formatDate(match.date)}
            </span>
            <span className="flex items-center gap-1">
              🏆 {formatTimeToTwelveHour(match.match_time)}
            </span>
            <span className="flex items-center gap-1">
              📍 {match.venue}
            </span>
          </div>

          {/* Teams Container */}
          <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Team 1 */}
            <div className="flex-1 bg-gradient-to-br from-teal-600/50 to-cyan-700/50 rounded-xl p-4 border border-teal-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-teal-400 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
              <h4 className="text-white font-bold text-2xl sm:text-3xl mb-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{match.team1_name}</h4>
              <p className="text-white/80 text-base mb-4 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
                {match.team1_leader} <span className="text-yellow-400">(Leader)</span>
              </p>
              
              {/* Players */}
              <div className="flex justify-center gap-4">
                <div className="text-center animate-slide-in-left transform transition-all" style={{ animationDelay: '0.6s' }}>
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold mx-auto mb-3 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-scale-in" style={{ animationDelay: '0.65s' }}>
                    {match.team1_player1_photo ? (
                      <img src={match.team1_player1_photo} alt={match.team1_player1_name} className="w-full h-full object-cover" />
                    ) : (
                      match.team1_player1_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium animate-fade-in-up" style={{ animationDelay: '0.7s' }}>{match.team1_player1_name}</p>
                  <p className="text-white/60 text-xs sm:text-sm">1st Men</p>
                </div>
                <div className="text-center animate-slide-in-left transform transition-all" style={{ animationDelay: '0.7s' }}>
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold mx-auto mb-3 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-scale-in" style={{ animationDelay: '0.75s' }}>
                    {match.team1_player2_photo ? (
                      <img src={match.team1_player2_photo} alt={match.team1_player2_name} className="w-full h-full object-cover" />
                    ) : (
                      match.team1_player2_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium animate-fade-in-up" style={{ animationDelay: '0.75s' }}>{match.team1_player2_name}</p>
                  <p className="text-white/60 text-xs sm:text-sm">2nd Men</p>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-2xl px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
              VS
            </div>

            {/* Team 2 */}
            <div className="flex-1 bg-gradient-to-br from-orange-600/50 to-amber-700/50 rounded-xl p-4 border border-orange-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange-400 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <h4 className="text-white font-bold text-2xl sm:text-3xl mb-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{match.team2_name}</h4>
              <p className="text-white/80 text-base mb-4 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
                {match.team2_leader} <span className="text-yellow-400">(Leader)</span>
              </p>
              
              {/* Players */}
              <div className="flex justify-center gap-4">
                <div className="text-center animate-slide-in-right transform transition-all" style={{ animationDelay: '0.6s' }}>
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold mx-auto mb-3 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-scale-in" style={{ animationDelay: '0.65s' }}>
                    {match.team2_player1_photo ? (
                      <img src={match.team2_player1_photo} alt={match.team2_player1_name} className="w-full h-full object-cover" />
                    ) : (
                      match.team2_player1_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium animate-fade-in-up" style={{ animationDelay: '0.7s' }}>{match.team2_player1_name}</p>
                  <p className="text-white/60 text-xs sm:text-sm">1st Men</p>
                </div>
                <div className="text-center animate-slide-in-right transform transition-all" style={{ animationDelay: '0.7s' }}>
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold mx-auto mb-3 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-scale-in" style={{ animationDelay: '0.75s' }}>
                    {match.team2_player2_photo ? (
                      <img src={match.team2_player2_photo} alt={match.team2_player2_name} className="w-full h-full object-cover" />
                    ) : (
                      match.team2_player2_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium animate-fade-in-up" style={{ animationDelay: '0.75s' }}>{match.team2_player2_name}</p>
                  <p className="text-white/60 text-xs sm:text-sm">2nd Men</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Banner */}
          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/80 to-rose-600/80 text-white px-6 py-2 rounded-full animate-pulse hover:from-red-500 hover:to-rose-500 transition-all">
              <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              <span className="font-bold tracking-wide">MATCH IS NOW LIVE</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-base sm:text-lg animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          🎉 Best of Luck to Both Teams! 🎉
        </p>
        
        {/* Click instruction */}
        <p className="text-white/40 text-xs sm:text-sm animate-pulse">Click anywhere or press X to continue</p>
      </div>
    </div>
  );
};
