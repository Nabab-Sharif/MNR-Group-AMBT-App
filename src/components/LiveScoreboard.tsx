import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Maximize2, Camera, Download, Share2, Trash2, Edit, StopCircle, X } from "lucide-react";
import { validatePhotoFile } from "@/lib/validation";
import { playScoreSound } from "@/lib/soundEffects";
import { formatTimeToTwelveHour } from "@/lib/utils";
import html2canvas from "html2canvas";
import logo from "@/assets/logo.jpg";

interface LiveScoreboardProps {
  match: any;
  isAdmin?: boolean;
  onFullscreen?: () => void;
  onWin?: (match: any) => void;
  onShowWelcome?: () => void;
  onStop?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPlayerClick?: (player: any) => void;
}

export const LiveScoreboard = ({ match, isAdmin = false, onFullscreen, onWin, onShowWelcome, onStop, onEdit, onDelete, onPlayerClick }: LiveScoreboardProps) => {
  const [team1Player1Scores, setTeam1Player1Scores] = useState<number[]>(Array(16).fill(0));
  const [team1Player2Scores, setTeam1Player2Scores] = useState<number[]>(Array(16).fill(0));
  const [team2Player1Scores, setTeam2Player1Scores] = useState<number[]>(Array(16).fill(0));
  const [team2Player2Scores, setTeam2Player2Scores] = useState<number[]>(Array(16).fill(0));
  const [winner, setWinner] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scoreboardRef = useRef<HTMLDivElement>(null);
  
  const team1Player1Total = team1Player1Scores.reduce((a, b) => a + b, 0);
  const team1Player2Total = team1Player2Scores.reduce((a, b) => a + b, 0);
  const team2Player1Total = team2Player1Scores.reduce((a, b) => a + b, 0);
  const team2Player2Total = team2Player2Scores.reduce((a, b) => a + b, 0);
  
  const team1Total = team1Player1Total + team1Player2Total;
  const team2Total = team2Player1Total + team2Player2Total;

  useEffect(() => {
    const loadScores = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("id", match.id)
          .single();
        
        if (error) {
          console.error("Error loading match data:", error);
          return;
        }

        if (data) {
          const ensureArray = (arr: any) => {
            if (arr && Array.isArray(arr) && arr.length > 0) {
              const result = [...arr];
              while (result.length < 16) result.push(0);
              return result.slice(0, 16);
            }
            return Array(16).fill(0);
          };
          
          setTeam1Player1Scores(ensureArray(data.team1_player1_scores));
          setTeam1Player2Scores(ensureArray(data.team1_player2_scores));
          setTeam2Player1Scores(ensureArray(data.team2_player1_scores));
          setTeam2Player2Scores(ensureArray(data.team2_player2_scores));
          if (data.winner) setWinner(data.winner);
        }
      } catch (err) {
        console.error("Failed to load scores:", err);
      }
    };

    loadScores();

    const subscription = supabase
      .channel(`scoreboard:${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${match.id}`
        },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            if (data.team1_player1_scores && Array.isArray(data.team1_player1_scores)) {
              setTeam1Player1Scores(data.team1_player1_scores);
            }
            if (data.team1_player2_scores && Array.isArray(data.team1_player2_scores)) {
              setTeam1Player2Scores(data.team1_player2_scores);
            }
            if (data.team2_player1_scores && Array.isArray(data.team2_player1_scores)) {
              setTeam2Player1Scores(data.team2_player1_scores);
            }
            if (data.team2_player2_scores && Array.isArray(data.team2_player2_scores)) {
              setTeam2Player2Scores(data.team2_player2_scores);
            }
            if (data.winner) setWinner(data.winner);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [match.id]);

  const toggleScore = async (team: 1 | 2, player: 1 | 2, index: number) => {
    if (!isAdmin) return;
    
    let newScores;
    let updatedTeam1Player1 = [...team1Player1Scores];
    let updatedTeam1Player2 = [...team1Player2Scores];
    let updatedTeam2Player1 = [...team2Player1Scores];
    let updatedTeam2Player2 = [...team2Player2Scores];
    let isScoreAdded = false; // Track if score is being added (plus) or removed (minus)
    
    if (team === 1 && player === 1) {
      newScores = [...team1Player1Scores];
      isScoreAdded = newScores[index] === 0; // Will become 1
      newScores[index] = newScores[index] === 0 ? 1 : 0;
      updatedTeam1Player1 = newScores;
      setTeam1Player1Scores(newScores);
    } else if (team === 1 && player === 2) {
      newScores = [...team1Player2Scores];
      isScoreAdded = newScores[index] === 0;
      newScores[index] = newScores[index] === 0 ? 1 : 0;
      updatedTeam1Player2 = newScores;
      setTeam1Player2Scores(newScores);
    } else if (team === 2 && player === 1) {
      newScores = [...team2Player1Scores];
      isScoreAdded = newScores[index] === 0;
      newScores[index] = newScores[index] === 0 ? 1 : 0;
      updatedTeam2Player1 = newScores;
      setTeam2Player1Scores(newScores);
    } else {
      newScores = [...team2Player2Scores];
      isScoreAdded = newScores[index] === 0;
      newScores[index] = newScores[index] === 0 ? 1 : 0;
      updatedTeam2Player2 = newScores;
      setTeam2Player2Scores(newScores);
    }
    
    const team1NewTotal = updatedTeam1Player1.reduce((a, b) => a + b, 0) + updatedTeam1Player2.reduce((a, b) => a + b, 0);
    const team2NewTotal = updatedTeam2Player1.reduce((a, b) => a + b, 0) + updatedTeam2Player2.reduce((a, b) => a + b, 0);
    
    // Get individual player scores
    const team1Player1Total = updatedTeam1Player1.reduce((a, b) => a + b, 0);
    const team1Player2Total = updatedTeam1Player2.reduce((a, b) => a + b, 0);
    const team2Player1Total = updatedTeam2Player1.reduce((a, b) => a + b, 0);
    const team2Player2Total = updatedTeam2Player2.reduce((a, b) => a + b, 0);
    
    // Play sound effect only if score is being added (plus), not removed (minus)
    if (isScoreAdded) {
      const teamName = team === 1 ? match.team1_name : match.team2_name;
      const teamTotalScore = team === 1 ? team1NewTotal : team2NewTotal;
      let playerName = '';
      let playerTotalScore = 0;
      
      if (team === 1 && player === 1) {
        playerName = match.team1_player1_name;
        playerTotalScore = team1Player1Total;
      } else if (team === 1 && player === 2) {
        playerName = match.team1_player2_name;
        playerTotalScore = team1Player2Total;
      } else if (team === 2 && player === 1) {
        playerName = match.team2_player1_name;
        playerTotalScore = team2Player1Total;
      } else if (team === 2 && player === 2) {
        playerName = match.team2_player2_name;
        playerTotalScore = team2Player2Total;
      }
      
      playScoreSound(teamName, playerName, teamTotalScore, team, playerTotalScore);
    }
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          team1_score: team1NewTotal,
          team2_score: team2NewTotal,
          team1_player1_score: updatedTeam1Player1.reduce((a, b) => a + b, 0),
          team1_player2_score: updatedTeam1Player2.reduce((a, b) => a + b, 0),
          team2_player1_score: updatedTeam2Player1.reduce((a, b) => a + b, 0),
          team2_player2_score: updatedTeam2Player2.reduce((a, b) => a + b, 0),
          team1_player1_scores: updatedTeam1Player1,
          team1_player2_scores: updatedTeam1Player2,
          team2_player1_scores: updatedTeam2Player1,
          team2_player2_scores: updatedTeam2Player2,
        })
        .eq('id', match.id);

      if (error) {
        console.error('Error updating scores:', error);
        toast.error("Failed to save scores");
        return;
      }
    } catch (err) {
      console.error('Unexpected error updating scores:', err);
      toast.error("Failed to save scores");
      return;
    }
    
    if (team1NewTotal >= 15 || team2NewTotal >= 15) {
      const winnerName = team1NewTotal >= 15 ? match.team1_name : match.team2_name;
      setWinner(winnerName);
      
      try {
        await supabase
          .from('matches')
          .update({ status: 'completed', winner: winnerName })
          .eq('id', match.id);
      } catch (err) {
        console.error('Error marking match completed:', err);
      }
      
      toast.success(`${winnerName} wins!`);
      
      if (onWin) {
        onWin({ ...match, winner: winnerName, team1_score: team1NewTotal, team2_score: team2NewTotal });
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, playerKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('player-photos')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload photo");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('player-photos')
      .getPublicUrl(filePath);

    await supabase
      .from('matches')
      .update({ [`${playerKey}_photo`]: publicUrl })
      .eq('id', match.id);

    toast.success("Photo uploaded successfully");
    window.location.reload();
  };

  const handleDownload = async () => {
    // Find the scoreboard element - either fullscreen or in main view
    const scoreboardElement = scoreboardRef.current || document.querySelector('[data-scoreboard]');
    if (!scoreboardElement) {
      toast.error("Scoreboard element not found");
      return;
    }

    try {
      toast.info("Generating image...");

      // Wait for web fonts to be ready so text renders correctly in the export
      if ((document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }

      const el = scoreboardElement as HTMLElement;
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const canvas = await html2canvas(el, {
        scale: Math.max(1, dpr * 1.2),
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        backgroundColor: '#1e293b',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
      });

      const link = document.createElement('a');
      link.download = `scoreboard-match-${match.match_number || Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Scoreboard downloaded!");
    } catch (err) {
      console.error('Download error:', err);
      toast.error("Failed to download scoreboard");
    }
  };

  const handleWhatsAppShare = async () => {
    // Find the scoreboard element - either fullscreen or in main view
    const scoreboardElement = scoreboardRef.current || document.querySelector('[data-scoreboard]');
    if (!scoreboardElement) {
      toast.error("Scoreboard element not found");
      return;
    }

    try {
      toast.info('Opening WhatsApp...');

      // Create WhatsApp message with score details
      const scoreText = `🏸 *${match.team1_name}* vs *${match.team2_name}*\n\n📊 *Score: ${team1Total} - ${team2Total}*\n\n👥 *${match.team1_name}:*\n• ${match.team1_player1_name}: ${team1Player1Total}\n• ${match.team1_player2_name}: ${team1Player2Total}\n\n👥 *${match.team2_name}:*\n• ${match.team2_player1_name}: ${team2Player1Total}\n• ${match.team2_player2_name}: ${team2Player2Total}\n\n${winner ? `🏆 *Winner: ${winner}*` : '🔴 *Match Ongoing*'}`;
      
      const encodedText = encodeURIComponent(scoreText);
      
      // First try: WhatsApp app (mobile) - uses wa.me or whatsapp:// protocol
      const whatsappAppUrl = `https://wa.me/?text=${encodedText}`;
      const whatsappProtocol = `whatsapp://send?text=${encodedText}`;
      
      // Check if user is on mobile or if WhatsApp app might be available
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile: try WhatsApp app first via protocol, then wa.me
        const testWindow = window.open(whatsappProtocol, 'whatsapp');
        
        // Wait a bit to see if app opened, if not fall back to web
        setTimeout(() => {
          if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
            // App didn't open, use wa.me which opens app if installed or web if not
            window.open(whatsappAppUrl, 'whatsapp');
            toast.success('Opening WhatsApp...');
          }
        }, 500);
      } else {
        // On desktop: use wa.me which will open WhatsApp Web
        window.open(whatsappAppUrl, 'whatsapp');
        toast.success('Opening WhatsApp Web...');
      }
    } catch (err) {
      console.error('Error sharing on WhatsApp:', err);
      toast.error('Failed to open WhatsApp');
    }
  };

  const renderScoreCircles = (scores: number[], team: 1 | 2, player: 1 | 2, teamColor: 'cyan' | 'purple') => {
    const row1 = scores.slice(0, 8);
    const row2 = scores.slice(8, 16);
    
    const baseClasses = teamColor === 'cyan' 
      ? 'border-cyan-600 text-cyan-800 bg-white/80' 
      : 'border-purple-400 text-purple-700 bg-white/80';
    const activeClasses = teamColor === 'cyan'
      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white shadow-lg shadow-emerald-400/50'
      : 'bg-gradient-to-br from-rose-400 to-pink-500 border-rose-500 text-white shadow-lg shadow-rose-400/50';
    
    return (
      <div className="space-y-1">
        <div className="flex gap-0.5 justify-center flex-wrap">
          {row1.map((score, index) => (
            <button
              key={index}
              onClick={() => toggleScore(team, player, index)}
              disabled={!isAdmin}
              className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center border-2 ${
                score === 1 ? activeClasses : baseClasses
              } ${isAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 justify-center flex-wrap">
          {row2.map((score, index) => (
            <button
              key={index + 8}
              onClick={() => toggleScore(team, player, index + 8)}
              disabled={!isAdmin}
              className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center border-2 ${
                score === 1 ? activeClasses : baseClasses
              } ${isAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const PlayerCard = ({ 
    photo, 
    name, 
    label, 
    scores, 
    total, 
    team, 
    player, 
    photoKey,
    department,
    unit,
    teamColor
  }: { 
    photo: string | null; 
    name: string; 
    label: string;
    scores: number[];
    total: number;
    team: 1 | 2;
    player: 1 | 2;
    photoKey: string;
    department?: string;
    unit?: string;
    teamColor: 'cyan' | 'purple';
  }) => {
    const performance = Math.round((total / 16) * 100);
    const avatarBg = teamColor === 'cyan' ? 'bg-white border-cyan-300' : 'bg-white border-purple-300';
    const avatarText = teamColor === 'cyan' ? 'text-cyan-600' : 'text-purple-600';
    
    return (
      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-center">
          {/* Avatar - perfectly circular on all devices */}
          <div className="relative mb-1">
            <div 
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-full ${avatarBg} flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold border-4 shadow-lg overflow-hidden cursor-pointer flex-shrink-0`}
              onClick={() => onPlayerClick && onPlayerClick({ name, photo, team: team === 1 ? match.team1_name : match.team2_name, department, unit })}
            >
              {photo ? (
                <img 
                  src={photo} 
                  alt={name} 
                  className="w-full h-full object-cover hover:scale-110 transition aspect-square"
                />
              ) : (
                <span className={avatarText}>
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isAdmin && (
              <label className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 cursor-pointer shadow-lg hover:bg-orange-600 transition">
                <Camera className="h-2.5 w-2.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, photoKey)} />
              </label>
            )}
          </div>
          
          {/* Name */}
          <div className="text-white font-bold text-sm sm:text-base md:text-lg truncate max-w-full px-1">{name}</div>
          <div className="text-white text-sm sm:text-base md:text-lg truncate max-w-full px-1">{label} Perf: {performance}%</div>
          
          {/* Score Circles */}
          <div className="mt-2">
            {renderScoreCircles(scores, team, player, teamColor)}
          </div>
          
          {/* Score Button */}
          <div className="mt-2">
            <div className="bg-orange-600 text-white px-3 sm:px-4 py-1 rounded-full text-[20px] sm:text-xs md:text-lg font-bold shadow-lg">
              Score: {total}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Main Scoreboard */}
      <div ref={scoreboardRef} className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-center py-2 sm:py-3">
          <h1 className="text-slate-900 font-bold text-xs sm:text-sm md:text-base lg:text-lg tracking-wide">
            🏸 ANISH MEMORIAL BADMINTON TOURNAMENT 2025-2026 🏸
          </h1>
        </div>
        
        {/* Organized By Bar */}
        <div className="bg-gradient-to-r from-cyan-500 to-sky-500 text-center py-1.5">
          <p className="text-white text-[10px] sm:text-xs font-medium">✨ Organized by MNR Group ✨</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="p-2 sm:p-3 md:p-4" data-scoreboard>
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
            {/* Team 1 Section */}
            <div className="flex-1 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-xl">
              {/* Team Header */}
              <div className="bg-indigo-400/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 text-center border border-indigo-300/40">
                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg">{match.team1_name}</h3>
                <p className="text-white text-sm sm:text-base md:text-lg">{match.team1_leader} (Leader)</p>
              </div>
              
              {/* Date/Time Bar */}
              <div className="bg-indigo-400/30 rounded-lg  px-2 sm:px-3 py-1 sm:py-1.5 text-white text-sm md:text-lg text-[10px] sm:text-xs mb-2 sm:mb-3 text-center flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <span>📅 {match.date}</span>
                <span className="hidden sm:inline">|</span>
                <span>⏰ {formatTimeToTwelveHour(match.match_time)}</span>
                <span className="hidden sm:inline">|</span>
                <span>❤️ {match.day}</span>
              </div>
              
              {/* Players */}
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <PlayerCard
                  photo={match.team1_player1_photo}
                  name={match.team1_player1_name}
                  label="1st Men"
                  scores={team1Player1Scores}
                  total={team1Player1Total}
                  team={1}
                  player={1}
                  photoKey="team1_player1"
                  department={match.team1_player1_department}
                  unit={match.team1_player1_unit}
                  teamColor="cyan"
                />
                <PlayerCard
                  photo={match.team1_player2_photo}
                  name={match.team1_player2_name}
                  label="2nd Men"
                  scores={team1Player2Scores}
                  total={team1Player2Total}
                  team={1}
                  player={2}
                  photoKey="team1_player2"
                  department={match.team1_player2_department}
                  unit={match.team1_player2_unit}
                  teamColor="cyan"
                />
              </div>
              
              {/* Total Bar */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-2xl sm:text-3xl md:text-5xl lg:text-5xl px-2 sm:px-3 py-1.5 sm:py-2 mt-2 sm:mt-3 text-center shadow-lg">
                <div className="text-white/90 text-[10px] sm:text-xs font-medium">Total</div>
                <div className="text-white font-bold text-lg sm:text-xl">{team1Total}</div>
              </div>
              
              {/* Result Bar */}
              <div className="bg-orange-400/80 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mt-2 text-center">
                <div className="text-white/90 text-[10px] sm:text-xs font-medium">Result</div>
                <div className="text-white font-bold text-xs sm:text-sm">
                  {team1Total >= 15 ? '🏆 Win' : team2Total >= 15 ? '❌ Lost' : ''}
                </div>
              </div>
            </div>

            {/* Center VS Section */}
            <div className="flex lg:flex-col items-center justify-center gap-2 sm:gap-3 py-2 lg:py-0 lg:px-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">{team1Total}</div>
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-lg">
                  VS
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">{team2Total}</div>
              </div>
            </div>

            {/* Team 2 Section */}
            <div className="flex-1 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-xl">
              {/* Team Header */}
              <div className="bg-purple-400/40 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 text-center border border-purple-300/30">
                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg">{match.team2_name}</h3>
                <p className="text-white text-sm sm:text-base md:text-lg">{match.team2_leader} (Leader)</p>
              </div>
              
              {/* Venue Bar */}
              <div className="bg-purple-300/30 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-white text-sm sm:text-base md:text-lg mb-2 sm:mb-3 text-center">
                📍 Venue: {match.venue}
              </div>
              
              {/* Players */}
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <PlayerCard
                  photo={match.team2_player1_photo}
                  name={match.team2_player1_name}
                  label="1st Men"
                  scores={team2Player1Scores}
                  total={team2Player1Total}
                  team={2}
                  player={1}
                  photoKey="team2_player1"
                  department={match.team2_player1_department}
                  unit={match.team2_player1_unit}
                  teamColor="purple"
                />
                <PlayerCard
                  photo={match.team2_player2_photo}
                  name={match.team2_player2_name}
                  label="2nd Men"
                  scores={team2Player2Scores}
                  total={team2Player2Total}
                  team={2}
                  player={2}
                  photoKey="team2_player2"
                  department={match.team2_player2_department}
                  unit={match.team2_player2_unit}
                  teamColor="purple"
                />
              </div>
              
              {/* Total Bar */}
              <div className="bg-gradient-to-r from-fuchsia-500 to-violet-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mt-2 sm:mt-3 text-center shadow-lg">
                <div className="text-white/90 text-[10px] sm:text-xs font-medium">Total</div>
                <div className="text-white font-bold text-lg sm:text-xl">{team2Total}</div>
              </div>
              
              {/* Result Bar */}
              <div className="bg-purple-300/40 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mt-2 text-center">
                <div className="text-white/90 text-[10px] sm:text-xs font-medium">Result</div>
                <div className="text-white font-bold text-xs sm:text-sm">
                  {team2Total >= 15 ? '🏆 Win' : team1Total >= 15 ? '❌ Lost' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {/* Fullscreen Button */}
          <Button 
            onClick={() => setIsFullscreen(true)} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 border-blue-600 hover:bg-blue-50"
            title="Fullscreen View"
          >
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          {/* Download Icon Only */}
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 text-green-600 border-green-600 hover:bg-green-50"
            title="Download Scoreboard"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Share Button */}
          <Button 
            onClick={handleWhatsAppShare} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 text-green-500 border-green-500 hover:bg-green-50"
            title="Share on WhatsApp"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          {onStop && (
            <Button onClick={onStop} variant="outline" size="sm" className="gap-1 text-amber-600 border-amber-600 hover:bg-amber-50 text-xs sm:text-sm">
              <StopCircle className="h-3 w-3 sm:h-4 sm:w-4" /> End Match
            </Button>
          )}
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm" className="gap-1 text-xs sm:text-sm">
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="destructive" size="sm" className="gap-1 text-xs sm:text-sm">
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /> Delete
            </Button>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-auto">
          <Button
            onClick={() => setIsFullscreen(false)}
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6">
            <div className="w-full">
              {/* Fullscreen Scoreboard Content */}
              <div data-scoreboard ref={scoreboardRef} className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-center py-3 sm:py-4">
                  <h1 className="text-slate-900 font-bold text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide">
                    🏸 ANISH MEMORIAL BADMINTON TOURNAMENT 2025-2026 🏸
                  </h1>
                </div>
                
                {/* Organized By Bar */}
                <div className="bg-gradient-to-r from-cyan-500 to-sky-500 text-center py-2">
                  <p className="text-white text-xs sm:text-sm font-medium">✨ Organized by MNR Group ✨</p>
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
                    {/* Team 1 Section */}
                    <div className="flex-1 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-xl">
                      <div className="bg-indigo-400/30 rounded-lg px-4 py-2 sm:py-3 mb-4 text-center border border-indigo-300/40">
                        <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl">{match.team1_name}</h3>
                        <p className="text-white text-lg sm:text-xl md:text-2xl">{match.team1_leader} (Leader)</p>
                      </div>
                      
                      <div className="bg-indigo-400/30 rounded-lg  px-2 sm:px-3 py-1 sm:py-1.5 text-white text-sm md:text-lg text-[10px] sm:text-xs mb-2 sm:mb-3 text-center flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                        <span>📅 {match.date}</span>
                        <span>⏰ {formatTimeToTwelveHour(match.match_time)}</span>
                        <span>❤️ {match.day}</span>
                      </div>
                      
                      {/* Players */}
                      <div className="flex gap-4 sm:gap-6">
                        {/* Player 1 */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-full bg-white border-4 border-indigo-300 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0">
                            {match.team1_player1_photo ? (
                              <img src={match.team1_player1_photo} alt={match.team1_player1_name} className="w-full h-full object-cover aspect-square" />
                            ) : (
                              <span className="text-indigo-600">{match.team1_player1_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-white font-bold text-sm sm:text-base md:text-lg mt-2 text-center">{match.team1_player1_name}</div>
                          <div className="text-white text-sm sm:text-base md:text-lg mt-2 text-center">1st Men Perf: {Math.round((team1Player1Total / 16) * 100)}%</div>
                          <div className="mt-3">{renderScoreCircles(team1Player1Scores, 1, 1, 'cyan')}</div>
                          <div className="mt-3 bg-indigo-400/30 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-lg font-bold shadow-lg">Score: {team1Player1Total}</div>
                        </div>
                        
                        {/* Player 2 */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-full bg-white border-4 border-cyan-300 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0">
                            {match.team1_player2_photo ? (
                              <img src={match.team1_player2_photo} alt={match.team1_player2_name} className="w-full h-full object-cover aspect-square" />
                            ) : (
                              <span className="text-cyan-600">{match.team1_player2_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-white font-bold text-sm sm:text-base md:text-lg mt-2 text-center">{match.team1_player2_name}</div>
                          <div className="text-white text-sm sm:text-base md:text-lg mt-2 text-center">2nd Men Perf: {Math.round((team1Player2Total / 16) * 100)}%</div>
                          <div className="mt-3">{renderScoreCircles(team1Player2Scores, 1, 2, 'cyan')}</div>
                          <div className="mt-3 bg-indigo-400/30 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-lg font-bold shadow-lg">Score: {team1Player2Total}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl px-2 sm:px-3 py-1.5 sm:py-2 mt-2 sm:mt-3 text-center shadow-lg rounded-lg">
                        <div className="text-white/90 text-xs sm:text-sm font-medium">Total</div>
                        <div className="text-white font-bold text-2xl sm:text-3xl">{team1Total}</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl rounded-lg px-4 py-3 mt-3 text-center">
                        <div className="text-white/90 text-xs sm:text-sm font-medium">Result</div>
                        <div className="text-white font-bold text-sm sm:text-base">
                          {team1Total >= 15 ? '🏆 Win' : team2Total >= 15 ? '❌ Lost' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Center VS Section */}
                    <div className="flex lg:flex-col items-center justify-center gap-4 py-4 lg:py-0 lg:px-4">
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-4xl sm:text-5xl md:text-6xl px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg">{team1Total}</div>
                        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 rounded-lg shadow-lg">
                          VS
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-4xl sm:text-5xl md:text-6xl px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg">{team2Total}</div>
                      </div>
                    </div>

                    {/* Team 2 Section */}
                    <div className="flex-1 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 sm:p-6 shadow-xl">
                      <div className="bg-purple-400/40 rounded-lg px-4 py-2 sm:py-3 mb-4 text-center border border-purple-300/30">
                        <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl">{match.team2_name}</h3>
                        <p className="text-white text-lg sm:text-xl md:text-2xl">{match.team2_leader} (Leader)</p>
                      </div>
                      
                      <div className="bg-purple-300/30 rounded-lg  px-2 sm:px-3 py-1 sm:py-1.5 text-white text-sm md:text-lg text-[10px] sm:text-xs mb-2 sm:mb-3 text-center flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                        📍 Venue: {match.venue}
                      </div>
                      
                      {/* Players */}
                      <div className="flex gap-4 sm:gap-6">
                        {/* Player 1 */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-full bg-white border-4 border-purple-300 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0">
                            {match.team2_player1_photo ? (
                              <img src={match.team2_player1_photo} alt={match.team2_player1_name} className="w-full h-full object-cover aspect-square" />
                            ) : (
                              <span className="text-purple-600">{match.team2_player1_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-white font-bold text-sm sm:text-base md:text-lg mt-2 text-center">{match.team2_player1_name}</div>
                          <div className="text-white text-sm sm:text-base md:text-lg mt-2 text-center">1st Men Perf: {Math.round((team2Player1Total / 16) * 100)}%</div>
                          <div className="mt-3">{renderScoreCircles(team2Player1Scores, 2, 1, 'purple')}</div>
                          <div className="mt-3 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-lg font-bold shadow-lg">Score: {team2Player1Total}</div>
                        </div>
                        
                        {/* Player 2 */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-full bg-white border-4 border-purple-300 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0">
                            {match.team2_player2_photo ? (
                              <img src={match.team2_player2_photo} alt={match.team2_player2_name} className="w-full h-full object-cover aspect-square" />
                            ) : (
                              <span className="text-purple-600">{match.team2_player2_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-white font-bold text-sm sm:text-base md:text-lg mt-2 text-center">{match.team2_player2_name}</div>
                          <div className="text-white text-sm sm:text-base md:text-lg mt-2 text-center">2nd Men Perf: {Math.round((team2Player2Total / 16) * 100)}%</div>
                          <div className="mt-3">{renderScoreCircles(team2Player2Scores, 2, 2, 'purple')}</div>
                          <div className="mt-3 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-lg font-bold shadow-lg">Score: {team2Player2Total}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-fuchsia-500 to-violet-600 rounded-lg px-4 py-3 mt-4 text-center shadow-lg">
                        <div className="text-white/90 text-xs sm:text-sm font-medium">Total</div>
                        <div className="text-white font-bold text-2xl sm:text-3xl">{team2Total}</div>
                      </div>
                      
                      <div className="bg-purple-300/40 rounded-lg px-4 py-3 mt-3 text-center">
                        <div className="text-white/90 text-xs sm:text-sm font-medium">Result</div>
                        <div className="text-white font-bold text-sm sm:text-base">
                          {team2Total >= 15 ? '🏆 Win' : team1Total >= 15 ? '❌ Lost' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fullscreen Controls */}
              <div className="flex justify-center gap-3 mt-6">
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 bg-white/10 hover:bg-white/20 border-white/30 text-white"
                  title="Download"
                >
                  <Download className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={handleWhatsAppShare} 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 bg-green-600/20 hover:bg-green-600/40 border-green-500/50 text-green-400"
                  title="Share on WhatsApp"
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
