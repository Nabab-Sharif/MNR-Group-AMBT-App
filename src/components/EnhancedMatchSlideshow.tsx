import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeToTwelveHour } from "@/lib/utils";
import logo from "@/assets/logo.jpg";

interface Match {
  id: string;
  match_number: number;
  team1_name: string;
  team2_name: string;
  team1_leader: string;
  team2_leader: string;
  team1_player1_name: string;
  team1_player2_name: string;
  team2_player1_name: string;
  team2_player2_name: string;
  team1_player1_photo: string | null;
  team1_player2_photo: string | null;
  team2_player1_photo: string | null;
  team2_player2_photo: string | null;
  team1_score: number;
  team2_score: number;
  team1_player1_scores?: number[];
  team1_player2_scores?: number[];
  team2_player1_scores?: number[];
  team2_player2_scores?: number[];
  winner: string | null;
  group_name: string;
  date: string;
  day: string;
  venue: string;
  match_time: string | null;
  status: string;
}

export const EnhancedMatchSlideshow = () => {
  const [slides, setSlides] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideFilter, setSlideFilter] = useState<'upcoming' | 'today' | 'tomorrow' | 'live' | 'winners' | 'today-winners-a' | 'today-winners-b'>('today');
  const [winnerDate, setWinnerDate] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { filter?: string; group?: string } | undefined;
      if (!detail) return;
      if (detail.filter === 'today' || detail.filter === 'tomorrow' || detail.filter === 'upcoming' || detail.filter === 'live' || detail.filter === 'winners' || detail.filter === 'today-winners-a' || detail.filter === 'today-winners-b') {
        setSlideFilter(detail.filter as 'upcoming' | 'today' | 'tomorrow' | 'live' | 'winners' | 'today-winners-a' | 'today-winners-b');
        setCurrentIndex(0);
        const el = document.getElementById('enhanced-slideshow');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('open-slideshow', handler as EventListener);
    return () => window.removeEventListener('open-slideshow', handler as EventListener);
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let query = supabase
        .from("matches")
        .select("*")
        .order("match_number", { ascending: true });

      if (slideFilter === 'live') {
        query = query.eq("status", "live");
      } else if (slideFilter === 'today') {
        query = query.eq("status", "upcoming").eq("date", today);
      } else if (slideFilter === 'tomorrow') {
        query = query.eq("status", "upcoming").eq("date", tomorrow);
      } else if (slideFilter === 'today-winners-a') {
        // Show A Group winners from the winner date only
        if (winnerDate) {
          query = query.eq("status", "completed").eq("group_name", "A").eq("date", winnerDate).not("winner", "is", null);
        } else {
          // If no date is set, fetch the latest A group winner date first
          const { data: latestData } = await supabase
            .from("matches")
            .select("date")
            .eq("status", "completed")
            .eq("group_name", "A")
            .not("winner", "is", null)
            .order("date", { ascending: false })
            .limit(1);
          
          if (latestData && latestData.length > 0) {
            setWinnerDate(latestData[0].date);
            query = query.eq("status", "completed").eq("group_name", "A").eq("date", latestData[0].date).not("winner", "is", null);
          }
        }
      } else if (slideFilter === 'today-winners-b') {
        // Show B Group winners from the winner date only
        if (winnerDate) {
          query = query.eq("status", "completed").eq("group_name", "B").eq("date", winnerDate).not("winner", "is", null);
        } else {
          // If no date is set, fetch the latest B group winner date first
          const { data: latestData } = await supabase
            .from("matches")
            .select("date")
            .eq("status", "completed")
            .eq("group_name", "B")
            .not("winner", "is", null)
            .order("date", { ascending: false })
            .limit(1);
          
          if (latestData && latestData.length > 0) {
            setWinnerDate(latestData[0].date);
            query = query.eq("status", "completed").eq("group_name", "B").eq("date", latestData[0].date).not("winner", "is", null);
          }
        }
      } else if (slideFilter === 'winners') {
        // Show winners from last 2 days (today and yesterday)
        query = query.eq("status", "completed").not("winner", "is", null).or(`date.eq.${today},date.eq.${yesterday}`);
      } else {
        query = query.eq("status", "upcoming").neq("date", today).neq("date", tomorrow);
      }

      const { data } = await query;
      
      if (data) {
        setSlides(data as Match[]);
        setCurrentIndex(0);
      }
    };

    fetchSlides();

    const channel = supabase
      .channel('enhanced-slideshow')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchSlides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slideFilter, winnerDate]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(touchStart, e.changedTouches[0].clientX);
  };

  const handleSwipe = (start: number | null, end: number) => {
    if (!start) return;
    const distance = start - end;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - show next slide
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      // Swipe right - show previous slide
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const filterButtons = (
    <div className="flex gap-2 justify-center mb-4 flex-wrap">
      <Button
        variant={slideFilter === 'today' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('today')}
        size="sm"
        className={slideFilter === 'today' ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        Today
      </Button>
      <Button
        variant={slideFilter === 'upcoming' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('upcoming')}
        size="sm"
        className={slideFilter === 'upcoming' ? 'bg-purple-600 hover:bg-purple-700' : ''}
      >
        Upcoming
      </Button>
      <Button
        variant={slideFilter === 'tomorrow' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('tomorrow')}
        size="sm"
        className={slideFilter === 'tomorrow' ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        Tomorrow
      </Button>
      <Button
        variant={slideFilter === 'live' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('live')}
        size="sm"
        className={slideFilter === 'live' ? 'bg-red-600 hover:bg-red-700' : ''}
      >
        🔴 Live
      </Button>
      <Button
        variant={slideFilter === 'today-winners-a' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('today-winners-a')}
        size="sm"
        className={slideFilter === 'today-winners-a' ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        🏆 A Group {winnerDate || 'Winner'}
      </Button>
      <Button
        variant={slideFilter === 'today-winners-b' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('today-winners-b')}
        size="sm"
        className={slideFilter === 'today-winners-b' ? 'bg-orange-600 hover:bg-orange-700' : ''}
      >
        🏆 B Group {winnerDate || 'Winner'}
      </Button>
      <Button
        variant={slideFilter === 'winners' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('winners')}
        size="sm"
        className={slideFilter === 'winners' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
      >
        🏆 All Winners
      </Button>
    </div>
  );

  if (slides.length === 0) {
    const getFilterLabel = () => {
      if (slideFilter === 'live') return 'live';
      if (slideFilter === 'winners') return 'winner';
      if (slideFilter === 'today-winners-a') return 'A Group winner';
      if (slideFilter === 'today-winners-b') return 'B Group winner';
      return slideFilter;
    };

    return (
      <div className="text-center py-10 space-y-4">
        {filterButtons}
        <h2 className="text-2xl font-bold mb-4">Welcome to Anish Memorial Tournament</h2>
        <p className="text-muted-foreground">Organized by MNR Group</p>
        <p className="text-sm text-muted-foreground mt-4">
          No {getFilterLabel()} matches found
        </p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const PlayerCard = ({ photo, name, gradient }: { photo: string | null; name: string; gradient: string }) => (
    <div className="rounded-2xl aspect-square flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform overflow-hidden relative">
      {/* Circular photo fills entire card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full overflow-hidden flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center rounded-full">
              <User className="h-8 w-8 sm:h-12 sm:w-12 text-white/70" />
            </div>
          )}
        </div>
      </div>
      {/* Name label at bottom with gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
        <div className="text-white text-xs sm:text-sm font-bold text-center truncate">
          {name}
        </div>
      </div>
    </div>
  );

  const renderPlayerScore = (playerScores: number[] | undefined, playerName: string, playerPhoto: string | null, total: number) => {
    if (!playerScores || playerScores.length === 0) {
      return (
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/50 flex items-center justify-center bg-gray-400">
              {playerPhoto ? (
                <img src={playerPhoto} alt={playerName} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-white/70" />
              )}
            </div>
          </div>
          <div className="text-white text-xs sm:text-sm font-bold">{playerName}</div>
          <div className="text-yellow-400 text-2xl sm:text-3xl font-bold">{total}</div>
        </div>
      );
    }

    const row1 = playerScores.slice(0, 8);
    const row2 = playerScores.slice(8, 16);

    return (
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-yellow-400/50 flex items-center justify-center bg-gray-400 shadow-lg shadow-yellow-400/30">
            {playerPhoto ? (
              <img src={playerPhoto} alt={playerName} className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white/70" />
            )}
          </div>
        </div>
        <div className="text-white text-xs sm:text-sm font-bold">{playerName}</div>
        <div className="flex gap-0.5 justify-center flex-wrap">
          {row1.map((score, index) => (
            <div
              key={index}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-xs font-bold flex items-center justify-center border ${
                score === 1
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white'
                  : 'bg-white/20 border-white/30 text-white/50'
              }`}
            >
              {score}
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 justify-center flex-wrap">
          {row2.map((score, index) => (
            <div
              key={index + 8}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-xs font-bold flex items-center justify-center border ${
                score === 1
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white'
                  : 'bg-white/20 border-white/30 text-white/50'
              }`}
            >
              {score}
            </div>
          ))}
        </div>
        <div className="text-yellow-400 text-lg sm:text-2xl font-bold mt-1">{total}</div>
      </div>
    );
  };

  return (
    <div id="enhanced-slideshow" className="w-full">
      {filterButtons}
      
      {/* Dark Theme Slide - Like Reference Image */}
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl shadow-2xl w-full cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Logo" className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full border-2 border-white/30" />
            <span className="text-white font-bold text-xs sm:text-sm md:text-lg truncate">Anish Memorial Badminton Tournament</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
            <span className="hidden sm:inline">Welcome</span>
            {currentSlide.status === 'live' && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs animate-pulse">LIVE</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-8 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
          {/* Left Side - Match Info & Scoreboard */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 flex flex-col justify-center">
            {/* Team Names with Score - Scoreboard Style */}
            <div className="space-y-2 sm:space-y-3 bg-gradient-to-b from-white/10 to-white/5 rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className="text-white text-lg sm:text-2xl md:text-3xl font-black truncate">{currentSlide.team1_name}</div>
                  <div className="text-white/50 text-xs sm:text-sm mt-1">Team 1</div>
                </div>
                <div className="text-yellow-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black px-2 sm:px-4 py-1 sm:py-2 bg-black/50 rounded-lg">
                  {currentSlide.team1_score || 0}
                </div>
              </div>

              {/* Team 1 Performance Bar */}
              {(slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Performance</span>
                    <span className="text-cyan-400 font-bold">{Math.round(((currentSlide.team1_score || 0) / 30) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${Math.min(((currentSlide.team1_score || 0) / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-center py-2 sm:py-3">
                <span className="text-white/60 text-sm sm:text-base font-bold px-3 py-1 bg-white/10 rounded-full">VS</span>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className="text-white text-lg sm:text-2xl md:text-3xl font-black truncate">{currentSlide.team2_name}</div>
                  <div className="text-white/50 text-xs sm:text-sm mt-1">Team 2</div>
                </div>
                <div className="text-yellow-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black px-2 sm:px-4 py-1 sm:py-2 bg-black/50 rounded-lg">
                  {currentSlide.team2_score || 0}
                </div>
              </div>

              {/* Team 2 Performance Bar */}
              {(slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Performance</span>
                    <span className="text-rose-400 font-bold">{Math.round(((currentSlide.team2_score || 0) / 30) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-500"
                      style={{ width: `${Math.min(((currentSlide.team2_score || 0) / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Winner Banner - Only show on winners slide */}
            {currentSlide.winner && (slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 p-0.5 shadow-2xl">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg px-4 sm:px-6 py-4 sm:py-5 text-center relative">
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-center gap-1 mb-2">
                      <span className="text-2xl animate-bounce">🏆</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                    </div>
                    <div className="text-white font-black text-2xl sm:text-4xl bg-gradient-to-r from-yellow-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                      {currentSlide.winner}
                    </div>
                    <div className="text-amber-300 font-bold text-xs sm:text-sm tracking-widest uppercase">
                      ⚡ Win • {currentSlide.date} ⚡
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Total Summary - Removed, already shown at top */}

            {/* Match Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/50 text-xs">📅 DATE</div>
                <div className="text-white font-bold text-xs sm:text-sm">{currentSlide.date}</div>
              </div>
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/50 text-xs">⏰ TIME</div>
                <div className="text-white font-bold text-xs sm:text-sm">{formatTimeToTwelveHour(currentSlide.match_time)}</div>
              </div>
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/50 text-xs">📍 VENUE</div>
                <div className="text-white font-bold text-xs sm:text-sm">{currentSlide.venue}</div>
              </div>
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                <div className="text-white/50 text-xs">🏆 GROUP</div>
                <div className="text-white font-bold text-xs sm:text-sm">{currentSlide.group_name}</div>
              </div>
            </div>
          </div>

          {/* Right Side - 4 Player Photos Grid */}
          {(slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') ? (
            <div className="relative rounded-xl p-4 sm:p-6 border border-white/20 bg-gradient-to-br from-white/10 to-white/5 overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 rounded-xl pointer-events-none"></div>
              
              <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 h-full place-content-center">
                {/* Team 1 Players */}
                <div className="col-span-2 text-center mb-2">
                  <div className="text-sm font-bold text-cyan-400 bg-cyan-600/20 rounded-full px-3 py-1 inline-block border border-cyan-400/30">
                    {currentSlide.team1_name}
                  </div>
                </div>
                
                {renderPlayerScore(
                  currentSlide.team1_player1_scores,
                  currentSlide.team1_player1_name,
                  currentSlide.team1_player1_photo,
                  currentSlide.team1_player1_scores?.reduce((a, b) => a + b, 0) || 0
                )}
                {renderPlayerScore(
                  currentSlide.team1_player2_scores,
                  currentSlide.team1_player2_name,
                  currentSlide.team1_player2_photo,
                  currentSlide.team1_player2_scores?.reduce((a, b) => a + b, 0) || 0
                )}
                
                {/* Divider */}
                <div className="col-span-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>
                
                {/* Team 2 Players */}
                <div className="col-span-2 text-center mb-2">
                  <div className="text-sm font-bold text-rose-400 bg-rose-600/20 rounded-full px-3 py-1 inline-block border border-rose-400/30">
                    {currentSlide.team2_name}
                  </div>
                </div>
                
                {renderPlayerScore(
                  currentSlide.team2_player1_scores,
                  currentSlide.team2_player1_name,
                  currentSlide.team2_player1_photo,
                  currentSlide.team2_player1_scores?.reduce((a, b) => a + b, 0) || 0
                )}
                {renderPlayerScore(
                  currentSlide.team2_player2_scores,
                  currentSlide.team2_player2_name,
                  currentSlide.team2_player2_photo,
                  currentSlide.team2_player2_scores?.reduce((a, b) => a + b, 0) || 0
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 h-full">
              <PlayerCard
                photo={currentSlide.team1_player1_photo}
                name={currentSlide.team1_player1_name}
                gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              />
              <PlayerCard
                photo={currentSlide.team1_player2_photo}
                name={currentSlide.team1_player2_name}
                gradient="bg-gradient-to-br from-pink-500 to-orange-500"
              />
              <PlayerCard
                photo={currentSlide.team2_player1_photo}
                name={currentSlide.team2_player1_name}
                gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              />
              <PlayerCard
                photo={currentSlide.team2_player2_photo}
                name={currentSlide.team2_player2_name}
                gradient="bg-gradient-to-br from-orange-500 to-red-600"
              />
            </div>
          )}
        </div>

        {/* Navigation & Indicators */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 py-3 sm:py-4 md:py-6 border-t border-white/10 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-cyan-500' 
                    : 'w-2 h-2 sm:h-2.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
