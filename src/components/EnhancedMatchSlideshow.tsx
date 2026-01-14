import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeToTwelveHour } from "@/lib/utils";
import { LiveScoreboard } from "./LiveScoreboard";
import logo from "@/assets/logo.jpg";
import { useTheme } from "@/contexts/ThemeContext";

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
  updated_at?: string;
  day: string;
  venue: string;
  match_time: string | null;
  status: string;
}

export const EnhancedMatchSlideshow = () => {
  const { currentTheme } = useTheme();
  const isWhiteTheme = currentTheme === 'white';
  
  const [slides, setSlides] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideFilter, setSlideFilter] = useState<string>('winners-all');
  const [winnerDate, setWinnerDate] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [todayDataExists, setTodayDataExists] = useState(false);
  const [todayUpcomingData, setTodayUpcomingData] = useState<Match[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    const saved = localStorage.getItem('slideshow-autoplay-enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [autoPlayInterval, setAutoPlayInterval] = useState(() => {
    const saved = localStorage.getItem('slideshow-autoplay-interval');
    return saved !== null ? parseInt(saved, 10) : 5;
  });
  const [isHovering, setIsHovering] = useState(false);
  const [dualLiveEnabled, setDualLiveEnabled] = useState(() => {
    const saved = localStorage.getItem('slideshow-dual-live-enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // Use ref to track slideFilter in subscription callback without re-creating subscription
  const slideFilterRef = useRef<string>('winners-all');
  
  useEffect(() => {
    slideFilterRef.current = slideFilter;
  }, [slideFilter]);

  // Monitor localStorage changes for auto-play settings
  useEffect(() => {
    const handleStorageChange = () => {
      const enabled = localStorage.getItem('slideshow-autoplay-enabled');
      const interval = localStorage.getItem('slideshow-autoplay-interval');
      if (enabled !== null) setAutoPlayEnabled(JSON.parse(enabled));
      if (interval !== null) setAutoPlayInterval(parseInt(interval, 10));
    };

    const dual = localStorage.getItem('slideshow-dual-live-enabled');
    if (dual !== null) setDualLiveEnabled(JSON.parse(dual));

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { filter?: string; group?: string; scroll?: boolean } | undefined;
      if (!detail) return;
      if (detail.filter) {
        setSlideFilter(detail.filter);
        setCurrentIndex(0);
        // Only scroll if explicitly requested
        if (detail.scroll) {
          const el = document.getElementById('enhanced-slideshow');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    window.addEventListener('open-slideshow', handler as EventListener);
    return () => window.removeEventListener('open-slideshow', handler as EventListener);
  }, []);

  // Check if today has any upcoming matches or any completed matches
  useEffect(() => {
    const checkTodayData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Get today's upcoming OR live matches
      const { data: upcomingData } = await supabase
        .from("matches")
        .select("*")
        .in("status", ["upcoming", "live"])
        .eq("date", today);
      
      // Get today's completed matches
      const { data: completedData } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .eq("date", today);
      
      const hasUpcoming = upcomingData && upcomingData.length > 0;
      const hasCompleted = completedData && completedData.length > 0;
      const hasAnyToday = hasUpcoming || hasCompleted;
      
      setTodayDataExists(hasAnyToday);
      setTodayUpcomingData(upcomingData || []);
      
      // Don't auto-switch if a custom group filter is active
      const isCustomGroupFilter = slideFilter.startsWith('winners-') && !slideFilter.includes('winners-all') && slideFilter !== 'winners';
      if (isCustomGroupFilter) return;
      
      // Auto-switch behavior:
      if (hasUpcoming) {
        // Today has upcoming/live matches - switch to live-only if live mode enabled, otherwise show today's matches
        if (hasUpcoming && dualLiveEnabled) {
          if (slideFilter !== 'live-only') {
            setSlideFilter('live-only');
            setWinnerDate(null);
            setCurrentIndex(0);
          }
        } else {
          if (slideFilter !== 'today' && !slideFilter.startsWith('today-')) {
            setSlideFilter('today');
            setWinnerDate(null);
            setCurrentIndex(0);
          }
        }
      } else if (hasCompleted && !hasUpcoming) {
        // All today's matches are completed - show today's winners
        setSlideFilter('winners');
        setWinnerDate(today);
        setCurrentIndex(0);
      } else if (!hasAnyToday && (slideFilter === 'today' || slideFilter.startsWith('today-'))) {
        // No matches today - switch to general winners showing yesterday's winners
        setSlideFilter('winners');
        setWinnerDate(yesterday);
        setCurrentIndex(0);
      }
    };
    
    checkTodayData();
    
    const interval = setInterval(checkTodayData, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [slideFilter, dualLiveEnabled]);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlayEnabled || isHovering || slides.length === 0) return;

    const autoPlayTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval * 1000);

    return () => clearInterval(autoPlayTimer);
  }, [autoPlayEnabled, autoPlayInterval, slides.length, isHovering]);

  useEffect(() => {
    const fetchSlides = async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Fetch all available groups from all matches
      const { data: allMatches } = await supabase
        .from("matches")
        .select("group_name");

      if (allMatches) {
        const uniqueGroups = Array.from(
          new Set(allMatches.map((m: any) => m.group_name).filter(Boolean))
        ).sort() as string[];
        setAvailableGroups(uniqueGroups);
      }

      let query = supabase
        .from("matches")
        .select("*")
        .order("match_number", { ascending: true });

      // Live-only filter
      if (slideFilter === 'live-only') {
        query = supabase
          .from('matches')
          .select('*')
          .eq('status', 'live')
          .eq('date', today)
          .order('match_number', { ascending: true });
      }

      // Handle today filters
      if (slideFilter === 'today') {
        // Show all today's upcoming or live matches
        query = query.in("status", ["upcoming", "live"]).eq("date", today);
      } else if (slideFilter.startsWith('today-') && !slideFilter.includes('winners')) {
        // Handle dynamic 'today-[GroupName]' filters like 'today-B>A'
        const groupName = slideFilter.replace('today-', '');
        query = query.in("status", ["upcoming", "live"]).eq("date", today).eq("group_name", groupName);
      } else if (slideFilter === 'winners-all') {
        // Show all recent winners across groups
        query = query
          .eq('status', 'completed')
          .not('winner', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(200);
      } else if (slideFilter === 'winners') {
        // Show winners for the specific date (`winnerDate`) or determine the best date:
        // - If `winnerDate` is explicitly set use it
        // - Otherwise, prefer today if there are completed matches today, else show yesterday
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let dateToShow = winnerDate || null;
        if (!dateToShow) {
          const { data: completedToday } = await supabase
            .from('matches')
            .select('id')
            .eq('status', 'completed')
            .eq('date', today)
            .limit(1);

          dateToShow = completedToday && completedToday.length > 0 ? today : yesterday;
        }

        query = query
          .eq("status", "completed")
          .not("winner", "is", null)
          .eq("date", dateToShow)
          .order("updated_at", { ascending: false });
      } else if (slideFilter.startsWith('winners-')) {
        // Handle dynamic 'winners-[GroupName]' filters like 'winners-B>A'
        const groupName = slideFilter.replace('winners-', '');
        // Show winners for the selected group (specific date or today)
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let dateToShow = winnerDate || null;
        if (!dateToShow) {
          const { data: completedToday } = await supabase
            .from('matches')
            .select('id')
            .eq('status', 'completed')
            .eq('date', today)
            .limit(1);
          dateToShow = completedToday && completedToday.length > 0 ? today : yesterday;
        }
        query = query
          .eq("status", "completed")
          .eq("group_name", groupName)
          .not("winner", "is", null)
          .eq("date", dateToShow)
          .order("updated_at", { ascending: false });
      } else if (slideFilter === 'today-winners-a') {
        // Legacy support for A Group winners (deprecated)
        // Only today's A-group winners
        query = query.eq("status", "completed").eq("group_name", "A").eq("date", today).not("winner", "is", null);
      } else if (slideFilter === 'today-winners-b') {
        // Legacy support for B Group winners (deprecated)
        // Only today's B-group winners
        query = query.eq("status", "completed").eq("group_name", "B").eq("date", today).not("winner", "is", null);
      }

      const { data } = await query;
      
      if (data) {
        let slidesData = data as Match[];

        // If we're showing winners, ensure slides are ordered by updated_at (most recently updated first)
        if (slideFilter === 'winners-all') {
          // For 'All Winners' show matches grouped by date with the most-recently-updated date first
          slidesData = slidesData.sort((a, b) => {
            const aTime = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.date).getTime();
            const bTime = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.date).getTime();
            return bTime - aTime;
          });

          const byDate: Record<string, Match[]> = {};
          for (const s of slidesData) {
            const d = s.date || (s.updated_at ? s.updated_at.split('T')[0] : '');
            if (!byDate[d]) byDate[d] = [];
            byDate[d].push(s);
          }

          // Order dates by the most recent updated_at inside each date (descending)
          const dateKeys = Object.keys(byDate).sort((a, b) => {
            const aMost = Math.max(...byDate[a].map(m => m.updated_at ? new Date(m.updated_at).getTime() : new Date(m.date).getTime()));
            const bMost = Math.max(...byDate[b].map(m => m.updated_at ? new Date(m.updated_at).getTime() : new Date(m.date).getTime()));
            return bMost - aMost;
          });

          const groupedByDate: Match[] = [];
          for (const dk of dateKeys) {
            // within a date, keep the most-recent-updated first
            byDate[dk].sort((a, b) => {
              const aT = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.date).getTime();
              const bT = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.date).getTime();
              return bT - aT;
            });
            groupedByDate.push(...byDate[dk]);
          }
          if (groupedByDate.length > 0) slidesData = groupedByDate;

          // Restrict 'winners-all' to matches from day 6 or 7 only
          slidesData = slidesData.filter((s) => {
            const d = s.date || (s.updated_at ? s.updated_at.split('T')[0] : '');
            if (!d) return false;
            const dayStr = d.split('-')[2] || '';
            const day = parseInt(dayStr, 10);
            return day === 6 || day === 7;
          });
        } else if (slideFilter.includes('winners')) {
          slidesData = slidesData.sort((a, b) => {
            const aTime = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.date).getTime();
            const bTime = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.date).getTime();
            return bTime - aTime;
          });

          // Group slides by the winning team so all matches for a given team appear together
          const groups: Record<string, Match[]> = {};
          for (const s of slidesData) {
            if (!s.winner) continue;
            if (!groups[s.winner]) groups[s.winner] = [];
            groups[s.winner].push(s);
          }

          // Sort matches within each group by updated_at descending
          for (const k of Object.keys(groups)) {
            groups[k].sort((a, b) => {
              const aT = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.date).getTime();
              const bT = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.date).getTime();
              return bT - aT;
            });
          }

          // Order groups by the most recent match in each group (so most-recent-winning teams come first)
          const winnerOrder = Object.keys(groups).sort((a, b) => {
            const aT = groups[a][0].updated_at ? new Date(groups[a][0].updated_at).getTime() : new Date(groups[a][0].date).getTime();
            const bT = groups[b][0].updated_at ? new Date(groups[b][0].updated_at).getTime() : new Date(groups[b][0].date).getTime();
            return bT - aT;
          });

          // Flatten groups back into slidesData preserving the group sequences
          const groupedSlides: Match[] = [];
          for (const w of winnerOrder) {
            groupedSlides.push(...groups[w]);
          }

          if (groupedSlides.length > 0) slidesData = groupedSlides;
        }

        setSlides(slidesData);
        setCurrentIndex(0);
      } else {
        setSlides([]);
      }
    };

    // When Dual Live is enabled and viewing today's slides, ensure we fetch up to 2 live/upcoming matches
    const ensureTwoLiveMatches = async () => {
      try {
        if (dualLiveEnabled && (slideFilter === 'today' || slideFilter.startsWith('today-'))) {
          // If we already have two, nothing to do
          if (todayUpcomingData.length >= 2) return;

          const today = new Date().toISOString().split('T')[0];
          const { data: extra } = await supabase
            .from('matches')
            .select('*')
            .in('status', ['upcoming', 'live'])
            .eq('date', today)
            .order('match_number', { ascending: true })
            .limit(2);

          if (extra && extra.length > 0) {
            setTodayUpcomingData(extra as Match[]);
          }
        }
      } catch (err) {
        // ignore
      }
    };

    fetchSlides();
    ensureTwoLiveMatches();

    const channel = supabase
      .channel('enhanced-slideshow')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        async (payload: any) => {
          try {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // If the realtime payload indicates an inserted/updated completed match for today,
            // force showing today's winners (this replaces previous-day winners)
            const evt = payload?.eventType || payload?.event || payload?.type;
            const newRec = payload?.new || payload?.record || payload?.payload?.new || payload?.payload || payload;
                if ((evt === 'INSERT' || evt === 'UPDATE' || payload?.action === 'INSERT' || payload?.action === 'UPDATE')
                    && newRec) {
                  // If a match becomes live and live mode is enabled, switch to live-only
                  if (newRec.status === 'live' && dualLiveEnabled) {
                    setSlideFilter('live-only');
                    setWinnerDate(null);
                    setCurrentIndex(0);
                  }

                  // If a completed match for today is inserted/updated, but user isn't on winners-all, consider switching to winners
                  if (newRec.status === 'completed' && newRec.date === today) {
                    if (slideFilterRef.current !== 'winners-all') {
                      setSlideFilter('winners');
                      setWinnerDate(today);
                      setCurrentIndex(0);
                    }
                  }
                  // fetchSlides will run below and replace previous slides
                }

            // Re-evaluate today's matches to decide which filter to show
            const { data: todayMatches } = await supabase
              .from('matches')
              .select('id,status')
              .eq('date', today);

            if (todayMatches && todayMatches.length > 0) {
              const hasNonCompleted = todayMatches.some((m: any) => m.status !== 'completed');
              const hasCompleted = todayMatches.some((m: any) => m.status === 'completed');

              if (hasNonCompleted) {
                // If any match today is still upcoming/live, show today's upcoming slides
                setSlideFilter('today');
                setWinnerDate(null);
                setCurrentIndex(0);
              } else if (hasCompleted && !hasNonCompleted) {
                // All today's matches are completed -> switch to today's winners
                setSlideFilter('winners');
                setWinnerDate(today);
                setCurrentIndex(0);
              }
            } else {
              // No matches today -> show yesterday's winners by default
              if (slideFilterRef.current === 'today' || slideFilterRef.current.startsWith('today-')) {
                setSlideFilter('winners');
                setWinnerDate(yesterday);
                setCurrentIndex(0);
              }
            }
          } catch (err) {
            // ignore errors; still refresh slides below
          }

          fetchSlides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slideFilter, winnerDate, dualLiveEnabled]);

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
      {/* Today Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground mr-2">Today:</span>
        {todayDataExists && (
          <Button
            variant={slideFilter === 'today' ? 'default' : 'outline'}
            onClick={() => setSlideFilter('today')}
            size="sm"
            className={slideFilter === 'today' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            All Today
          </Button>
        )}
        
        {/* Dynamic Today Group buttons */}
        {availableGroups.map((groupName) => (
          <Button
            key={`today-${groupName}`}
            variant={slideFilter === `today-${groupName}` ? 'default' : 'outline'}
            onClick={() => setSlideFilter(`today-${groupName}`)}
            size="sm"
            className={slideFilter === `today-${groupName}` ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {groupName}
          </Button>
        ))}
      </div>

      {/* Winners Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground mr-2">Winners:</span>
        <Button
          key="winners-all"
          variant={slideFilter === 'winners-all' ? 'default' : 'outline'}
          onClick={() => setSlideFilter('winners-all')}
          size="sm"
          className={slideFilter === 'winners-all' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          🏆 All Winners
        </Button>

        

        

        {/* Dynamic Group Winners buttons */}
        {availableGroups.map((groupName) => (
          <Button
            key={`winners-${groupName}`}
            variant={slideFilter === `winners-${groupName}` ? 'default' : 'outline'}
            onClick={() => setSlideFilter(`winners-${groupName}`)}
            size="sm"
            className={slideFilter === `winners-${groupName}` ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            🏆 {groupName}
          </Button>
        ))}
      </div>
    </div>
  );

  // When showing today's live matches and dual-live is enabled, render two live scoreboards
  if (slideFilter === 'today' && dualLiveEnabled) {
    const liveMatches = todayUpcomingData.slice(0, 2);

    // Debug: ensure we attempted to fetch enough matches
    console.debug('[EnhancedMatchSlideshow] Dual Live enabled, todayUpcomingData count:', todayUpcomingData.length, 'liveMatches count:', liveMatches.length, 'slideFilter:', slideFilter, 'dualLiveEnabled:', dualLiveEnabled);

    return (
      <div id="enhanced-slideshow" className="w-full">
        {filterButtons}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveMatches.length === 0 && (
            <div className="col-span-1 text-center py-10">No live matches available</div>
          )}
          {liveMatches.map((m) => (
            <div key={m.id} className="w-full min-h-[320px] sm:min-h-[420px]">
              <div className="w-full h-full">
                <LiveScoreboard match={m} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Live-only view: show up to two live matches (1 if one live match, 2 if two)
  if (slideFilter === 'live-only') {
    const liveMatches = (todayUpcomingData || []).filter((m) => m.status === 'live').slice(0, 2);

    return (
      <div id="enhanced-slideshow" className="w-full">
        {filterButtons}
        <div className={`grid grid-cols-1 ${liveMatches.length === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
          {liveMatches.length === 0 && (
            <div className="col-span-1 text-center py-10">No live matches available</div>
          )}
          {liveMatches.map((m) => (
            <div key={m.id} className="w-full min-h-[320px] sm:min-h-[420px]">
              <div className="w-full h-full">
                <LiveScoreboard match={m} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    const getFilterLabel = () => {
      if (slideFilter === 'today') return "today's matches";
      if (slideFilter.startsWith('today-') && !slideFilter.includes('winners')) {
        const groupName = slideFilter.replace('today-', '');
        return `today's ${groupName} group matches`;
      }
      if (slideFilter === 'winners') return 'winner';
      if (slideFilter.startsWith('winners-')) {
        const groupName = slideFilter.replace('winners-', '');
        return `${groupName} group winner`;
      }
      if (slideFilter === 'today-winners-a') return 'A Group winner';
      if (slideFilter === 'today-winners-b') return 'B Group winner';
      return slideFilter;
    };

    return (
      <div className="text-center py-10 space-y-4">
        {filterButtons}
        <h2 className="text-2xl font-bold mb-4">Welcome to Anis Memorial Tournament</h2>
        <p className="text-muted-foreground">Organized by MNR Group</p>
        <p className="text-sm text-muted-foreground mt-4">
          No {getFilterLabel()} matches found
        </p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const currentWinCount = currentSlide?.winner ? slides.filter(s => s.winner === currentSlide.winner).length : 0;

  const PlayerCard = ({ photo, name, gradient }: { photo: string | null; name: string; gradient: string }) => (
    <div className="rounded-2xl aspect-square flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform overflow-hidden relative">
      {/* Circular photo fills entire card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full overflow-hidden flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center rounded-full">
              <User className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/70" />
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
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex items-center justify-center ${isWhiteTheme ? 'border-blue-400/50 bg-blue-50' : 'border-primary/50 bg-muted'}`}>
              {playerPhoto ? (
                <img src={playerPhoto} alt={playerName} className="w-full h-full object-cover" />
              ) : (
                <User className={`h-6 w-6 sm:h-8 sm:w-8 ${isWhiteTheme ? 'text-blue-400/70' : 'text-muted-foreground/70'}`} />
              )}
            </div>
          </div>
          <div className={`text-xs sm:text-sm font-bold ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{playerName}</div>
          <div className={`text-2xl sm:text-3xl font-bold ${isWhiteTheme ? 'text-orange-600' : 'text-yellow-400'}`}>{total}</div>
        </div>
      );
    }

    const row1 = playerScores.slice(0, 8);
    const row2 = playerScores.slice(8, 16);

    return (
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg ${isWhiteTheme ? 'border-orange-400/50 bg-orange-50 shadow-orange-400/30' : 'border-accent/50 bg-muted shadow-accent/30'}`}>
            {playerPhoto ? (
              <img src={playerPhoto} alt={playerName} className="w-full h-full object-cover" />
            ) : (
              <User className={`h-6 w-6 sm:h-8 sm:w-8 ${isWhiteTheme ? 'text-orange-400/70' : 'text-muted-foreground/70'}`} />
            )}
          </div>
        </div>
        <div className={`text-xs sm:text-sm font-bold ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{playerName}</div>
        <div className="flex gap-0.5 justify-center flex-wrap">
          {row1.map((score, index) => (
            <div
              key={index}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-xs font-bold flex items-center justify-center border ${
                score === 1
                  ? isWhiteTheme ? 'bg-gradient-to-br from-green-400 to-teal-400 border-green-500 text-green-900' : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white'
                  : isWhiteTheme ? 'bg-gray-200 border-gray-300 text-gray-400' : 'bg-white/20 border-white/30 text-white/50'
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
                  ? isWhiteTheme ? 'bg-gradient-to-br from-green-400 to-teal-400 border-green-500 text-green-900' : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500 text-white'
                  : isWhiteTheme ? 'bg-gray-200 border-gray-300 text-gray-400' : 'bg-white/20 border-white/30 text-white/50'
              }`}
            >
              {score}
            </div>
          ))}
        </div>
        <div className={`text-lg sm:text-2xl font-bold mt-1 ${isWhiteTheme ? 'text-orange-600' : 'text-yellow-400'}`}>{total}</div>
      </div>
    );
  };

  return (
    <div id="enhanced-slideshow" className="w-full">
      {filterButtons}
      
      {/* Dark Theme Slide - Enhanced Visual */}
      <div 
        key={currentSlide?.id ?? 'slide'}
        className={`relative overflow-hidden rounded-3xl shadow-2xl w-full cursor-grab active:cursor-grabbing transition-transform duration-300 hover:shadow-3xl hover:scale-[1.01] slide-card-glass animate-fade-in ${
          isWhiteTheme ? 'bg-white/60 border border-foreground/10' : 'bg-gradient-to-br from-slate-900 via-primary/60 to-rose-900'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Live indicator (gola) for today's/upcoming matches */}
        { (slideFilter.startsWith('today-') && slideFilter !== 'today') && currentSlide?.status && currentSlide.status !== 'completed' && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${isWhiteTheme ? 'bg-red-100 text-red-700' : 'bg-red-600 text-white'}`}>
              LIVE
            </div>
          </div>
        )}
        {/* Decorative Blobs */}
        <div className="blob" style={{ right: '-6rem', top: '-6rem', width: '28rem', height: '28rem', background: 'radial-gradient(circle at 25% 30%, rgba(99,102,241,0.40), transparent 40%)' }} />
        <div className="blob" style={{ left: '-6rem', bottom: '-6rem', width: '22rem', height: '22rem', background: 'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.30), transparent 40%)', animationDelay: '2s' }} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-8 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
          {/* Left Side - Match Info & Scoreboard */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 flex flex-col justify-center lg:col-span-2">
            {/* Team Names with Score - Scoreboard Style */}
            <div className={`space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 border ${
              isWhiteTheme
                ? 'bg-foreground/5 border-foreground/20'
                : 'bg-card/50 border-primary/20'
            }`}>
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className={`text-lg sm:text-2xl md:text-3xl font-black truncate ${
                    isWhiteTheme ? 'text-foreground' : 'text-white'
                  }`}>
                    {currentSlide.team1_name}
                    {currentSlide.winner === currentSlide.team1_name && (
                      <span className={`ml-3 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${isWhiteTheme ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500 text-white'}`}>WIN</span>
                    )}
                  </div>
                  <div className={`text-xs sm:text-sm mt-1 ${
                    isWhiteTheme ? 'text-foreground/50' : 'text-white/50'
                  }`}>Team 1</div>
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${
                  isWhiteTheme 
                    ? 'text-orange-600 bg-orange-100' 
                    : 'text-yellow-400 bg-black/50'
                }`}>
                  {currentSlide.team1_score || 0}
                </div>
              </div>

              {/* Team 1 Performance Bar */}
              {(slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}>Performance</span>
                    <span className={`font-bold ${isWhiteTheme ? 'text-blue-600' : 'text-cyan-400'}`}>{Math.round(((currentSlide.team1_score || 0) / 30) * 100)}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden border ${isWhiteTheme ? 'bg-foreground/10 border-foreground/20' : 'bg-white/10 border-white/20'}`}>
                    <div 
                      className={`h-full transition-all duration-500 ${isWhiteTheme ? 'bg-blue-600' : 'bg-primary'}`}
                      style={{ width: `${Math.min(((currentSlide.team1_score || 0) / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-center py-2 sm:py-3">
                <span className={`text-sm sm:text-base font-bold px-3 py-1 rounded-full ${isWhiteTheme ? 'text-foreground/60 bg-foreground/10' : 'text-white/60 bg-white/10'}`}>VS</span>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className={`text-lg sm:text-2xl md:text-3xl font-black truncate ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>
                    {currentSlide.team2_name}
                    {currentSlide.winner === currentSlide.team2_name && (
                      <span className={`ml-3 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${isWhiteTheme ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500 text-white'}`}>WIN</span>
                    )}
                  </div>
                  <div className={`text-xs sm:text-sm mt-1 ${isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}`}>Team 2</div>
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${isWhiteTheme ? 'text-pink-600 bg-pink-100' : 'text-yellow-400 bg-black/50'}`}>
                  {currentSlide.team2_score || 0}
                </div>
              </div>

              {/* Team 2 Performance Bar */}
              {(slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}>Performance</span>
                    <span className={`font-bold ${isWhiteTheme ? 'text-red-600' : 'text-rose-400'}`}>{Math.round(((currentSlide.team2_score || 0) / 30) * 100)}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden border ${isWhiteTheme ? 'bg-foreground/10 border-foreground/20' : 'bg-white/10 border-white/20'}`}>
                    <div 
                      className={`h-full transition-all duration-500 ${isWhiteTheme ? 'bg-red-600' : 'bg-destructive'}`}
                      style={{ width: `${Math.min(((currentSlide.team2_score || 0) / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Winner Banner - Only show on winners slide */}
            {currentSlide.winner && (slideFilter === 'winners' || slideFilter === 'today-winners-a' || slideFilter === 'today-winners-b') && (
              <div className={`relative overflow-hidden rounded-xl p-0.5 shadow-2xl ${isWhiteTheme ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary via-primary to-primary'}`}>
                <div className={`rounded-lg px-4 sm:px-6 py-4 sm:py-5 text-center relative ${isWhiteTheme ? 'bg-white' : 'bg-card'}`}>
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: isWhiteTheme ? 'rgba(251, 146, 60, 0.1)' : 'rgba(234, 179, 8, 0.1)' }}></div>
                    <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: isWhiteTheme ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 179, 8, 0.1)', animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex justify-center items-center gap-3 mb-2 relative">
                      <div className="flex items-center gap-1">
                        <span className="text-3xl animate-bounce">🏆</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                      </div>

                      {currentWinCount > 1 && (
                        <div className={`slide-badge ${isWhiteTheme ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'}`}>
                          {currentWinCount} wins today
                        </div>
                      )}
                    </div>

                    <div className={`font-black text-2xl sm:text-4xl bg-clip-text text-transparent ${isWhiteTheme ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-amber-300 to-pink-500'}`}>
                      {currentSlide.winner}
                    </div>
                    <div className={`font-bold text-xs sm:text-sm tracking-widest uppercase ${isWhiteTheme ? 'text-orange-600' : 'text-amber-300'}`}>
                      ⚡ Win • {currentSlide.date} ⚡
                    </div>

                    {/* Confetti */}
                    <div className="confetti" aria-hidden>
                      {['#F87171','#FB923C','#FDE68A','#34D399','#60A5FA','#A78BFA','#FB7185','#F59E0B'].map((c, i) => (
                        <span key={i} style={{ left: `${6 + i * 11}%`, background: c, top: `${-8 + (i % 3) * 6}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Total Summary - Removed, already shown at top */}

            {/* Match Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 border ${isWhiteTheme ? 'bg-foreground/5 border-foreground/10' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-xs ${isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}`}>📅 DATE</div>
                <div className={`font-bold text-xs sm:text-sm ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{currentSlide.date}</div>
              </div>
              <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 border ${isWhiteTheme ? 'bg-foreground/5 border-foreground/10' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-xs ${isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}`}>⏰ TIME</div>
                <div className={`font-bold text-xs sm:text-sm ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{formatTimeToTwelveHour(currentSlide.match_time)}</div>
              </div>
              <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 border ${isWhiteTheme ? 'bg-foreground/5 border-foreground/10' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-xs ${isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}`}>📍 VENUE</div>
                <div className={`font-bold text-xs sm:text-sm ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{currentSlide.venue}</div>
              </div>
              <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 border ${isWhiteTheme ? 'bg-foreground/5 border-foreground/10' : 'bg-white/5 border-white/10'}`}>
                <div className={`text-xs ${isWhiteTheme ? 'text-foreground/50' : 'text-white/50'}`}>🏆 GROUP</div>
                <div className={`font-bold text-xs sm:text-sm ${isWhiteTheme ? 'text-foreground' : 'text-white'}`}>{currentSlide.group_name}</div>
              </div>
            </div>
          </div>

          {/* Right Side - Player Scores & Photos (always visible) */}
          <div className={`relative rounded-xl p-4 sm:p-6 border overflow-hidden ${isWhiteTheme ? 'bg-foreground/5 border-foreground/20' : 'bg-card/60 border-primary/20'} lg:col-span-1`}>
            {/* Decorative gradient background */}
            <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: isWhiteTheme ? 'linear-gradient(135deg, rgba(59,130,246,0.03), transparent)' : 'linear-gradient(135deg, rgba(2,6,23,0.05), transparent)' }} />
            
            <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 h-full place-content-center">
              {/* Team 1 Players */}
              <div className="col-span-2 text-center mb-2">
                <div className={`text-sm font-bold rounded-full px-3 py-1 inline-block border ${isWhiteTheme ? 'text-blue-700 bg-blue-100 border-blue-300' : 'text-cyan-400 bg-cyan-600/20 border-cyan-400/30'}`}>
                  {currentSlide.team1_name}
                  {currentSlide.winner === currentSlide.team1_name && (
                    <span className="ml-2 inline-block win-badge text-[12px] sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-500 text-white">WIN</span>
                  )}
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
              <div className={`col-span-2 h-px bg-gradient-to-r ${isWhiteTheme ? 'from-transparent via-foreground/20 to-transparent' : 'from-transparent via-white/20 to-transparent'} my-2`}></div>
              
              {/* Team 2 Players */}
              <div className="col-span-2 text-center mb-2">
                <div className={`text-sm font-bold rounded-full px-3 py-1 inline-block border ${isWhiteTheme ? 'text-red-700 bg-red-100 border-red-300' : 'text-rose-400 bg-rose-600/20 border-rose-400/30'}`}>
                  {currentSlide.team2_name}
                  {currentSlide.winner === currentSlide.team2_name && (
                    <span className="ml-2 inline-block win-badge text-[12px] sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-500 text-white">WIN</span>
                  )}
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

            {/* Player photo row for extra visual */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <PlayerCard photo={currentSlide.team1_player1_photo} name={currentSlide.team1_player1_name} gradient="bg-gradient-to-br from-purple-600 to-pink-600" />
              <PlayerCard photo={currentSlide.team1_player2_photo} name={currentSlide.team1_player2_name} gradient="bg-gradient-to-br from-pink-500 to-orange-500" />
              <PlayerCard photo={currentSlide.team2_player1_photo} name={currentSlide.team2_player1_name} gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
              <PlayerCard photo={currentSlide.team2_player2_photo} name={currentSlide.team2_player2_name} gradient="bg-gradient-to-br from-orange-500 to-red-600" />
            </div>
          </div>
        </div>

        {/* Navigation & Indicators */}
        <div className={`flex items-center justify-center gap-3 sm:gap-4 md:gap-6 py-3 sm:py-4 md:py-6 border-t flex-wrap ${isWhiteTheme ? 'border-foreground/10' : 'border-white/10'}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className={`h-8 w-8 sm:h-10 sm:w-10 ${isWhiteTheme ? 'text-foreground hover:bg-foreground/10' : 'text-white hover:bg-white/10'}`}
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
                    ? `w-6 sm:w-8 h-2 sm:h-2.5 ${isWhiteTheme ? 'bg-orange-600' : 'bg-cyan-500'}` 
                    : `w-2 h-2 sm:h-2.5 ${isWhiteTheme ? 'bg-gray-400 hover:bg-gray-600' : 'bg-white/30 hover:bg-white/50'}`
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            className={`h-8 w-8 sm:h-10 sm:w-10 ${isWhiteTheme ? 'text-foreground hover:bg-foreground/10' : 'text-white hover:bg-white/10'}`}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
