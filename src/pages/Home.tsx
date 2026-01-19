import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { LiveScoreboard } from "@/components/LiveScoreboard";
import { WinCelebration } from "@/components/WinCelebration";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { EnhancedMatchSlideshow } from "@/components/EnhancedMatchSlideshow";
import { GroupCards } from "@/components/GroupCards";
import { LiveModeSelector } from "@/components/LiveModeSelector";
import { FullscreenScoreboard } from "@/components/FullscreenScoreboard";
import { Footer } from "@/components/Footer";
import TodayWinners from "@/components/TodayWinners";
import { ThemeSelector } from "@/components/ThemeSelector";
import { announceLiveMatchStart } from "@/lib/voiceAnnouncement";

const Home = () => {
  const navigate = useNavigate();
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [winningMatch, setWinningMatch] = useState<any>(null);
  const [welcomeMatch, setWelcomeMatch] = useState<any>(null);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [fullscreenMatch, setFullscreenMatch] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLiveScoreboard, setShowLiveScoreboard] = useState(true);
  const [playerDialog, setPlayerDialog] = useState<any>(null);
  const [liveMatchesDoubleView, setLiveMatchesDoubleView] = useState(() => {
    const saved = localStorage.getItem('live-matches-double-view');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const fullscreenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevLiveIdsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-close fullscreen scoreboard after 10 seconds
    if (fullscreenMatch) {
      // Clear any existing timeout
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current);
      }
      
      // Set new timeout for 10 seconds
      fullscreenTimeoutRef.current = setTimeout(() => {
        setFullscreenMatch(null);
      }, 10000);
    }

    return () => {
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current);
      }
    };
  }, [fullscreenMatch]);

  useEffect(() => {
    // Fetch all matches
    const fetchMatches = async () => {
      const { data: allData } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true });

      if (allData) {
        setAllMatches(allData);

        // Get all live matches
        const liveMatches = allData.filter(m => m.status === 'live');
        setLiveMatches(liveMatches);

        if (liveMatches.length > 0) {
          setLiveMatch(liveMatches[0]);
          setCurrentLiveIndex(0);
        }
      }
    };

    fetchMatches();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          // Check if match is completed and show win celebration
          const newRec = payload.new as any;
          if (newRec && newRec.status === 'completed' && newRec.winner) {
            setWinningMatch(newRec);
            setFullscreenMatch(newRec);
          }
          // Re-fetch matches on any change
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Announce when a new live match starts on the home page
  useEffect(() => {
    // Build a map of current live ids
    const currentIds: Record<string, boolean> = {};
    liveMatches.forEach(m => { if (m && m.id) currentIds[m.id] = true; });

    // Find any id that is new compared to previous
    const prevIds = prevLiveIdsRef.current || {};
    const newLive = liveMatches.find(m => m && m.id && !prevIds[m.id]);
    if (newLive) {
      // Announce the newly started live match
      try {
        announceLiveMatchStart(newLive);
      } catch (err) {
        console.error('Voice announcement failed:', err);
      }
    }

    // Update prev ids
    prevLiveIdsRef.current = currentIds;
  }, [liveMatches]);

  // NOTE: live modal will show all live scoreboards; no auto-advance.

  // Handle player clicks from LiveScoreboard or GroupCards. Compute per-match details
  const handlePlayerClick = (player: any) => {
    if (!player) return;

    // Find matches where this player participated
    const matchesForPlayer = allMatches.filter((m) => {
      return (
        m.team1_player1_name === player.name ||
        m.team1_player2_name === player.name ||
        m.team2_player1_name === player.name ||
        m.team2_player2_name === player.name
      );
    });

    const matchDetails = matchesForPlayer.map((m) => {
      // Try to load per-player breakdown from localStorage if available
      const storageKey = `scores_${m.id}`;
      let playerTotal: number | null = null;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const s = JSON.parse(stored);
          // map which field belongs to this player
          if (m.team1_player1_name === player.name && s.team1p1) playerTotal = s.team1p1.reduce((a: any, b: any) => a + b, 0);
          else if (m.team1_player2_name === player.name && s.team1p2) playerTotal = s.team1p2.reduce((a: any, b: any) => a + b, 0);
          else if (m.team2_player1_name === player.name && s.team2p1) playerTotal = s.team2p1.reduce((a: any, b: any) => a + b, 0);
          else if (m.team2_player2_name === player.name && s.team2p2) playerTotal = s.team2p2.reduce((a: any, b: any) => a + b, 0);
        }
      } catch (err) {
        console.error('Error reading stored scores for match', m.id, err);
      }

      const playerTeam = (m.team1_player1_name === player.name || m.team1_player2_name === player.name) ? m.team1_name : m.team2_name;
      const opponentTeam = playerTeam === m.team1_name ? m.team2_name : m.team1_name;
      const result = m.status === 'completed' && m.winner ? (m.winner === playerTeam ? 'Win' : 'Lost') : 'N/A';

      return {
        matchId: m.id,
        matchNumber: m.match_number,
        group: m.group_name,
        date: m.date,
        team: playerTeam,
        opponent: opponentTeam,
        playerTotal,
        teamTotal: playerTeam === m.team1_name ? m.team1_score ?? 0 : m.team2_score ?? 0,
        winner: m.winner ?? null,
        result
      };
    });

    const aggregateTotal = matchDetails.reduce((acc, d) => acc + (d.playerTotal ?? 0), 0);

    setPlayerDialog({
      name: player.name,
      photo: player.photo ?? null,
      team: player.team ?? null,
      matches: matchDetails,
      total: aggregateTotal
    });
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail) handlePlayerClick(e.detail);
    };
    window.addEventListener('show-player', handler as EventListener);
    return () => window.removeEventListener('show-player', handler as EventListener);
  }, [allMatches]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 w-full">
        <div className="w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MNR Group" className="h-12 w-12 rounded-full animate-logo-float animate-logo-glow" />
            <div>
              <h1 className="text-2xl font-bold">Anis Memorial Badminton Tournament</h1>
              <p className="text-sm text-muted-foreground">2025-2026 • Organized by MNR Group</p>
            </div>
          </div>
          <ThemeSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-0 py-8 space-y-12">
        {/* Enhanced Match Slideshow with Player Photos */}
        <EnhancedMatchSlideshow />

        {/* Live Scoreboards (always visible when live matches exist) */}
        {liveMatches.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 rounded-lg p-3">
                  <div className="h-6 w-6 bg-white rounded" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-500">Live Matches</h2>
                  <p className="text-sm text-muted-foreground">All active live scoreboards</p>
                </div>
              </div>
              {liveMatches.length >= 2 && (
                <Button
                  variant={liveMatchesDoubleView ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setLiveMatchesDoubleView(!liveMatchesDoubleView);
                    localStorage.setItem('live-matches-double-view', JSON.stringify(!liveMatchesDoubleView));
                  }}
                  className={liveMatchesDoubleView ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {liveMatchesDoubleView ? '2 Column' : '1 Column'}
                </Button>
              )}
            </div>

            <div className={`grid ${liveMatchesDoubleView && liveMatches.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4 w-full`}>
              {liveMatches.map((m) => (
                <LiveScoreboard
                  key={m.id}
                  match={m}
                  onWin={(match) => {
                    setWinningMatch(match);
                    setFullscreenMatch(match);
                  }}
                  onShowWelcome={() => {
                    setWelcomeMatch(m);
                    setShowWelcome(true);
                  }}
                  // route player clicks to handler that computes per-match stats
                  onPlayerClick={(player) => handlePlayerClick(player)}
                />
              ))}
            </div>
          </div>
        )}


        {/* Group Cards */}
        {allMatches.length > 0 && <GroupCards matches={allMatches} />}
      </main>

      {/* Welcome Message */}
      {welcomeMatch && showWelcome && (
        <WelcomeMessage
          match={welcomeMatch}
          onClose={() => {
            setWelcomeMatch(null);
            setShowWelcome(false);
          }}
        />
      )}

      {/* Win Celebration Overlay - Show immediately when winning match is set */}
      {winningMatch && (
        <WinCelebration
          match={winningMatch}
          onClose={() => {
            setWinningMatch(null);
            setFullscreenMatch(null);
          }}
        />
      )}

      {/* Fullscreen Scoreboard - Only show if no win celebration */}
      {fullscreenMatch && !winningMatch && (
        <FullscreenScoreboard
          match={fullscreenMatch}
          onClose={() => setFullscreenMatch(null)}
        />
      )}

      {/* Player Details Dialog (opened from live scoreboard or group cards) */}
      {playerDialog && (
        <div>
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl p-6 max-w-3xl w-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                    {playerDialog.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={playerDialog.photo} alt={playerDialog.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Photo</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{playerDialog.name}</h3>
                        <p className="text-sm text-muted-foreground">Team: {playerDialog.team}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total Points (from available data)</div>
                        <div className="text-2xl font-bold">{playerDialog.total ?? 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto">
                    <Button onClick={() => setPlayerDialog(null)} size="icon">X</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Match Breakdown</h4>
                  <div className="space-y-2">
                    {playerDialog.matches && playerDialog.matches.length > 0 ? (
                      playerDialog.matches.map((d: any) => (
                        <div key={d.matchId} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-semibold">Match #{d.matchNumber} • {d.group} • {d.date}</div>
                            <div className="text-sm text-muted-foreground">{d.team} vs {d.opponent}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">Player: {d.playerTotal ?? 'N/A'}</div>
                            <div className="text-sm">Team Total: {d.teamTotal}</div>
                            <div className="text-sm">Result: {d.result}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-muted rounded">No per-match player breakdown available for these matches.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's winners (above footer) */}
      <TodayWinners matches={allMatches} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;