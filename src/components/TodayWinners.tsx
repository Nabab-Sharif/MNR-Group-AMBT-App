import React from "react";
import { Badge } from "@/components/ui/badge";

interface TodayWinnersProps {
  matches: any[];
}

const TodayWinners = ({ matches = [] }: TodayWinnersProps) => {
  const today = new Date();
  // Format as YYYY-MM-DD using local timezone instead of UTC
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const todaysWins = matches.filter(
    (m) => m && m.date === todayString && m.status === "completed" && m.winner
  );

  if (!todaysWins || todaysWins.length === 0) return null;

  const handleGroupClick = (groupName: string) => {
    console.log('Group clicked:', groupName);
    
    let filter = 'winners-all';
    if (groupName !== 'all-winners') {
      filter = `winners-${groupName}`;
    }
    
    // Dispatch event to open slideshow with group filter
    const event = new CustomEvent('open-slideshow', {
      detail: { filter: filter, scroll: true }
    });
    window.dispatchEvent(event);
  };

  const grouped = todaysWins.reduce((acc: Record<string, any[]>, m: any) => {
    const key = m.group_name || "Ungrouped";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, any[]>);

  // Helper to pick a consistent color per team name
  const palette = ['#F6C84C','#9F7AEA','#34D399','#60A5FA','#FB7185','#F97316','#EAB308'];
  const getColorForTeam = (team?: string) => {
    if (!team) return 'rgba(255,255,255,0.06)';
    let hash = 0;
    for (let i = 0; i < team.length; i++) {
      hash = ((hash << 5) - hash) + team.charCodeAt(i);
    }
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  };

  // Helper to get the "first name" (first token) from a full team/person name
  const getFirstName = (s?: string) => {
    if (!s) return '';
    return s.split(' ')[0].toLowerCase();
  };


  return (
    <div className="today-winners border-t border-border pt-6 pb-6">
      <div className="px-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleGroupClick('all-winners')}>
          <h2 className="text-3xl font-bold">Today's Winners</h2>
          <div className="text-sm text-muted-foreground">{todaysWins.length} completed match{todaysWins.length > 1 ? 'es' : ''}</div>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupName, groupMatches]: [string, any[]]) => (
              <div key={groupName} className="today-group p-4 bg-card/40 rounded-2xl cursor-pointer hover:bg-card/60 transition-all" onClick={() => handleGroupClick(groupName)}>
                <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-lg font-semibold">
                    <span className="group-name-highlight" style={{ borderLeft: `4px solid ${getColorForTeam(groupName)}`, paddingLeft: 8 }}>{groupName}</span>
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-white/6 border border-white/10">
                    {groupMatches.length} win{groupMatches.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    // Sort matches sequentially by match number or date, grouped by the actual team matchup
                    const sortedMatches = [...groupMatches].sort((a, b) => {
                      // Sort by match number first, then by date
                      if (a.match_number !== b.match_number) {
                        return (a.match_number || 0) - (b.match_number || 0);
                      }
                      return (a.date || '').localeCompare(b.date || '');
                    });

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMatches.map((m: any) => {
                          const groupColor = getColorForTeam(groupName);
                        return (
                          <div
                            key={m.id}
                            className="today-match-card p-4 rounded-lg bg-card/30 hover:bg-card/60 transition-all border border-border/50 hover:border-border hover:shadow-md"
                            style={{ borderLeft: `4px solid ${groupColor}` }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold truncate">
                                  {m.team1_name} <span className="text-muted-foreground">vs</span> {m.team2_name}
                                </div>
                                <div className="text-xs font-semibold truncate px-2 py-1 rounded bg-muted/30 text-muted-foreground">{m.date}</div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold numeric-highlight">{m.team1_score ?? 0} - {m.team2_score ?? 0}</div>
                                <div className="flex items-center gap-2 justify-end mt-1">
                                  <div className="win-badge inline-flex items-center px-2 py-1 rounded-full text-sm font-bold">WIN</div>
                                  <div className="text-xs text-muted-foreground">{m.winner}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TodayWinners;
