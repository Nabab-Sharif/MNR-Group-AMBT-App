import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Plus, Settings, Users, Database, Share2, Presentation, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { CreateMatchDialog } from "@/components/CreateMatchDialog";
import { MatchList } from "@/components/MatchList";
import { LiveScoreboard } from "@/components/LiveScoreboard";
import { WinCelebration } from "@/components/WinCelebration";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { SlideManagement } from "@/components/SlideManagement";
import { FullscreenScoreboard } from "@/components/FullscreenScoreboard";
import { NavLink } from "@/components/NavLink";
import { DataManagement } from "@/components/DataManagement";

interface AdminDashboardProps {
  session: Session;
}

export const AdminDashboard = ({ session }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [winningMatch, setWinningMatch] = useState<any>(null);
  const [welcomeMatch, setWelcomeMatch] = useState<any>(null);
  const [fullscreenMatch, setFullscreenMatch] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"live" | "upcoming" | "today" | "tomorrow" | "completed">("live");
  const [groupFilter, setGroupFilter] = useState<"all" | "A" | "B">("all");
  const [activeTab, setActiveTab] = useState<'matches' | 'slides' | 'data'>('matches');
  const [stats, setStats] = useState({ teams: 0, matches: 0, live: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [showLiveScoreboard, setShowLiveScoreboard] = useState(false);
  const [playerDialog, setPlayerDialog] = useState<any>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      if (data && !error) {
        setIsAdmin(true);
      } else {
        toast.error("You don't have admin access");
        navigate("/");
      }
    };
    
    checkAdminStatus();
  }, [session, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const fetchMatches = async () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let query = supabase.from("matches").select("*");

    if (filter === "live") {
      query = query.eq("status", "live");
    } else if (filter === "upcoming") {
      query = query.eq("status", "upcoming")
        .neq("date", today)
        .neq("date", tomorrow);
    } else if (filter === "today") {
      query = query.eq("status", "upcoming")
        .eq("date", today);
    } else if (filter === "tomorrow") {
      query = query.eq("status", "upcoming")
        .eq("date", tomorrow);
    } else if (filter === "completed") {
      query = query.eq("status", "completed");
    }

    // Apply group filter
    if (groupFilter !== "all") {
      query = query.eq("group_name", groupFilter);
    }

    const { data } = await query.order("created_at", { ascending: false });
    if (data) setMatches(data);

    // Check for live matches
    const { data: liveMatches } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "live")
      .order("created_at", { ascending: true });
    
    if (liveMatches && liveMatches.length > 0) {
      setLiveMatches(liveMatches);
      setLiveMatch(liveMatches[0]);
      // Do not auto-show win overlay here; admin can open it explicitly.
    } else {
      setLiveMatches([]);
    }
    
    // Calculate stats
    const { data: allMatches } = await supabase.from("matches").select("*");
    if (allMatches) {
      const uniqueTeams = new Set();
      allMatches.forEach((match: any) => {
        uniqueTeams.add(match.team1_name);
        uniqueTeams.add(match.team2_name);
      });
      setStats({
        teams: uniqueTeams.size,
        matches: allMatches.length,
        live: allMatches.filter((m: any) => m.status === 'live').length
      });
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, groupFilter]);

  // Compute player details when a player avatar is clicked (from LiveScoreboard or GroupCards)
  const handlePlayerClick = (player: any) => {
    if (!player) return;

    // Ensure we have matches data
    const matchesForPlayer = matches.filter((m) => (
      m.team1_player1_name === player.name ||
      m.team1_player2_name === player.name ||
      m.team2_player1_name === player.name ||
      m.team2_player2_name === player.name
    ));

    const matchDetails = matchesForPlayer.map((m) => {
      const storageKey = `scores_${m.id}`;
      let playerTotal: number | null = null;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const s = JSON.parse(stored);
          if (m.team1_player1_name === player.name && s.team1p1) playerTotal = s.team1p1.reduce((a:any,b:any)=>a+b,0);
          else if (m.team1_player2_name === player.name && s.team1p2) playerTotal = s.team1p2.reduce((a:any,b:any)=>a+b,0);
          else if (m.team2_player1_name === player.name && s.team2p1) playerTotal = s.team2p1.reduce((a:any,b:any)=>a+b,0);
          else if (m.team2_player2_name === player.name && s.team2p2) playerTotal = s.team2p2.reduce((a:any,b:any)=>a+b,0);
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
  }, [matches]);

  // Auto-advance live matches when modal is open in admin dashboard
  useEffect(() => {
    if (!showLiveScoreboard) return;
    if (liveMatches.length <= 1) return;

    const id = setInterval(() => {
      setCurrentLiveIndex((prev) => {
        const next = (prev + 1) % liveMatches.length;
        setLiveMatch(liveMatches[next]);
        return next;
      });
    }, 6000);

    return () => clearInterval(id);
  }, [showLiveScoreboard, liveMatches]);

  // Keep displayed liveMatch in sync with currentLiveIndex
  useEffect(() => {
    if (showLiveScoreboard && liveMatches.length > 0) {
      setLiveMatch(liveMatches[currentLiveIndex]);
    }
  }, [currentLiveIndex, showLiveScoreboard, liveMatches]);

  const liveCount = matches.filter(m => m.status === 'live').length;
  const upcomingCount = matches.filter(m => m.status === 'upcoming').length;
  const todayCount = matches.filter(m => m.date === new Date().toISOString().split('T')[0]).length;
  const tomorrowCount = matches.filter(m => m.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]).length;
  const completedCount = matches.filter(m => m.status === 'completed').length;

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm w-full">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-12 w-12 rounded-full" />
              <div>
                <h1 className="text-3xl font-bold">Anis Memorial Badminton Tournament</h1>
                <p className="text-lg text-muted-foreground">Admin Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleFullscreenToggle} variant="outline">
                Fullscreen
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

  <div className="max-w-full mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground">Welcome, Nabab</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">{stats.teams}</div>
              <div className="text-xs text-muted-foreground">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.matches}</div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{stats.live}</div>
              <div className="text-xs text-muted-foreground">Live</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          <NavLink 
            icon={Users} 
            label="Matches" 
            active={activeTab === 'matches'}
            onClick={() => setActiveTab('matches')}
          />
          <NavLink 
            icon={Zap} 
            label="Live" 
            badge={stats.live}
            onClick={() => setActiveTab('matches')}
          />
          <NavLink 
            icon={Database} 
            label="Data" 
            active={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
          />
          <NavLink icon={Share2} label="Share" />
          <NavLink 
            icon={Presentation} 
            label="Slides"
            active={activeTab === 'slides'}
            onClick={() => setActiveTab('slides')}
          />
        </div>

        {/* Content */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Live Scoreboards (always visible when live matches exist) */}
            {liveMatches.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600 rounded-lg p-3">
                      <div className="h-6 w-6 bg-white rounded" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-600">Live Matches</h3>
                      <p className="text-sm text-muted-foreground">Active live scoreboards for admins</p>
                    </div>
                  </div>
                  <div>
                    <Button onClick={() => setShowLiveScoreboard(prev => !prev)} className="bg-red-600 hover:bg-red-700">
                      {liveMatches.length} Live
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                  {liveMatches.map((m) => (
                    <LiveScoreboard
                      key={m.id}
                      match={m}
                      isAdmin={true}
                      onFullscreen={() => setFullscreenMatch(m)}
                      onWin={(match) => setWinningMatch(match)}
                      onShowWelcome={() => setWelcomeMatch(m)}
                      onPlayerClick={(player) => handlePlayerClick(player)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold mb-4">Match Management</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Match
                </Button>
                {liveMatches.length > 0 && (
                  <Button
                    onClick={() => setShowLiveScoreboard(true)}
                    className="bg-red-600 hover:bg-red-700 gap-2"
                  >
                    Live Score {liveMatches.length > 1 && `(${liveMatches.length})`}
                  </Button>
                )}
                <Button
                  variant={filter === "live" ? "default" : "outline"}
                  onClick={() => {
                    setFilter("live");
                    if (liveMatch) {
                      setWelcomeMatch(liveMatch);
                    }
                  }}
                >
                  {liveCount} Go Live
                </Button>
                <Button
                  variant={filter === "upcoming" ? "default" : "outline"}
                  onClick={() => setFilter("upcoming")}
                >
                  {upcomingCount} Upcoming
                </Button>
                <Button
                  variant={filter === "today" ? "default" : "outline"}
                  onClick={() => setFilter("today")}
                >
                  {todayCount} Today
                </Button>
                <Button
                  variant={filter === "tomorrow" ? "default" : "outline"}
                  onClick={() => setFilter("tomorrow")}
                >
                  {tomorrowCount} Tomorrow
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                >
                  {completedCount} Completed
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Filter by Group:</span>
                <Button
                  variant={groupFilter === "all" ? "default" : "outline"}
                  onClick={() => setGroupFilter("all")}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={groupFilter === "A" ? "default" : "outline"}
                  onClick={() => setGroupFilter("A")}
                  className="text-xs"
                >
                  Group A
                </Button>
                <Button
                  variant={groupFilter === "B" ? "default" : "outline"}
                  onClick={() => setGroupFilter("B")}
                  className="text-xs"
                >
                  Group B
                </Button>
              </div>
              <MatchList 
                matches={matches} 
                onUpdate={fetchMatches}
                onGoLive={(match) => setWelcomeMatch(match)}
              />
            </div>
          </div>
        )}

        {activeTab === 'slides' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Home Slide Management</h3>
                <p className="text-sm text-muted-foreground">Manage 3D home page slides and player showcases</p>
              </div>
            </div>
            <SlideManagement />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Data Management</h3>
                <p className="text-sm text-muted-foreground">Export, import, and manage all tournament data</p>
              </div>
            </div>
            <DataManagement />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateMatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchMatches}
      />

      {/* Welcome Message */}
      {welcomeMatch && (
        <WelcomeMessage
          match={welcomeMatch}
          onClose={() => setWelcomeMatch(null)}
        />
      )}

      {/* Win Celebration */}
      {winningMatch && (
        <WinCelebration
          match={winningMatch}
          onClose={() => setWinningMatch(null)}
        />
      )}

      {/* Fullscreen Scoreboard */}
      {fullscreenMatch && (
        <FullscreenScoreboard
          match={fullscreenMatch}
          isAdmin={true}
          onClose={() => setFullscreenMatch(null)}
        />
      )}

      {/* Player Details Dialog for admin */}
      {playerDialog && (
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
      )}
    </div>
  );
};