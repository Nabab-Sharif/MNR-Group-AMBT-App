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
  const [slideFilter, setSlideFilter] = useState<'upcoming' | 'today' | 'tomorrow' | 'live' | 'winners'>('upcoming');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { filter?: string; group?: string } | undefined;
      if (!detail) return;
      if (detail.filter === 'today' || detail.filter === 'tomorrow' || detail.filter === 'upcoming' || detail.filter === 'live' || detail.filter === 'winners') {
        setSlideFilter(detail.filter as 'upcoming' | 'today' | 'tomorrow' | 'live' | 'winners');
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
      } else if (slideFilter === 'winners') {
        query = query.eq("status", "completed").not("winner", "is", null);
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
  }, [slideFilter]);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const filterButtons = (
    <div className="flex gap-2 justify-center mb-4 flex-wrap">
      <Button
        variant={slideFilter === 'upcoming' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('upcoming')}
        size="sm"
        className={slideFilter === 'upcoming' ? 'bg-purple-600 hover:bg-purple-700' : ''}
      >
        Upcoming
      </Button>
      <Button
        variant={slideFilter === 'today' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('today')}
        size="sm"
        className={slideFilter === 'today' ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        Today
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
        variant={slideFilter === 'winners' ? 'default' : 'outline'}
        onClick={() => setSlideFilter('winners')}
        size="sm"
        className={slideFilter === 'winners' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
      >
        🏆 Winners
      </Button>
    </div>
  );

  if (slides.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        {filterButtons}
        <h2 className="text-2xl font-bold mb-4">Welcome to Anish Memorial Tournament</h2>
        <p className="text-muted-foreground">Organized by MNR Group</p>
        <p className="text-sm text-muted-foreground mt-4">
          No {slideFilter === 'live' ? 'live' : slideFilter === 'winners' ? 'winner' : slideFilter} matches found
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

  return (
    <div id="enhanced-slideshow" className="w-full">
      {filterButtons}
      
      {/* Dark Theme Slide - Like Reference Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30" />
            <span className="text-white font-bold text-sm sm:text-lg">Anish Memorial Badminton Tournament</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
            <span>Welcome</span>
            {currentSlide.status === 'live' && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs animate-pulse">LIVE</span>
            )}
          </div>
        </div>

        {/* Full View Button
        <div className="absolute top-3 right-3">
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            Full View
          </button>
        </div> */}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
          {/* Left Side - Match Info */}
          <div className="space-y-4">
            {/* Team Names with Score */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-white text-3xl sm:text-5xl font-black">{currentSlide.team1_name}</span>
                <span className="text-yellow-400 text-3xl sm:text-5xl font-black">- {currentSlide.team1_score || 0}</span>
              </div>
              <div className="text-white/50 text-xl sm:text-2xl font-bold">VS</div>
              <div className="flex items-center gap-3">
                <span className="text-white text-3xl sm:text-5xl font-black">{currentSlide.team2_name}</span>
                <span className="text-yellow-400 text-3xl sm:text-5xl font-black">- {currentSlide.team2_score || 0}</span>
              </div>
            </div>

            {/* Winner Banner */}
            {currentSlide.winner && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl px-4 py-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-white" />
                <span className="text-white font-bold text-sm sm:text-base">
                  {currentSlide.winner} WINS!
                </span>
              </div>
            )}

            {/* Match Details */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-white/50 text-[10px] sm:text-xs">📅 DATE</div>
                <div className="text-white font-bold text-sm sm:text-base">{currentSlide.date}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-white/50 text-[10px] sm:text-xs">⏰ TIME</div>
                <div className="text-white font-bold text-sm sm:text-base">{formatTimeToTwelveHour(currentSlide.match_time)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-white/50 text-[10px] sm:text-xs">📍 VENUE</div>
                <div className="text-white font-bold text-sm sm:text-base">{currentSlide.venue}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-white/50 text-[10px] sm:text-xs">🏆 GROUP</div>
                <div className="text-white font-bold text-sm sm:text-base">{currentSlide.group_name}</div>
              </div>
            </div>
          </div>

          {/* Right Side - 4 Player Photos Grid */}
          <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Navigation & Indicators */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="text-white hover:bg-white/10 h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-cyan-500' 
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            className="text-white hover:bg-white/10 h-8 w-8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Responsive Slideshow Grid - New Addition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? 'active' : ''} transition-opacity duration-500`}
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          >
            <div className="p-4 rounded-lg shadow-lg">
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
