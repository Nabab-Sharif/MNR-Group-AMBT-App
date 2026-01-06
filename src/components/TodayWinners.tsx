import React from "react";
import { Badge } from "@/components/ui/badge";

interface TodayWinnersProps {
  matches: any[];
}

const TodayWinners = ({ matches = [] }: TodayWinnersProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  const todaysWins = matches.filter(
    (m) => m && m.date === todayString && m.status === "completed" && m.winner
  );

  if (!todaysWins || todaysWins.length === 0) return null;

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">Today's Winners</h2>
          <div className="text-sm text-muted-foreground">{todaysWins.length} completed match{todaysWins.length > 1 ? 'es' : ''}</div>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupName, groupMatches]: [string, any[]]) => (
              <div key={groupName} className="today-group p-4 bg-card/40 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold">
                    <span className="group-name-highlight" style={{ borderLeft: `4px solid ${getColorForTeam(groupName)}`, paddingLeft: 8 }}>{groupName}</span>
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-white/6 border border-white/10">
                    {groupMatches.length} win{groupMatches.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // Group matches by a normalized winner-first-name so variations merge (e.g., "Shohag", "Shohag A")
                    const byFirst: Record<string, any[]> = {};

                    const canonical = (s?: string) => {
                      if (!s) return '';
                      const t = String(s).toLowerCase().replace(/[^a-z\s]/g, '').trim();
                      return t.split(/\s+/)[0] || '';
                    };

                    groupMatches.forEach((m: any) => {
                      // Prefer explicit winner, otherwise infer from scores if completed, otherwise fallback to team1
                      let winnerName = m.winner || '';
                      if (!winnerName && m.status === 'completed') {
                        const s1 = Number(m.team1_score ?? 0);
                        const s2 = Number(m.team2_score ?? 0);
                        if (s1 > s2) winnerName = m.team1_name || '';
                        else if (s2 > s1) winnerName = m.team2_name || '';
                      }
                      if (!winnerName) winnerName = m.team1_name || m.team2_name || '';

                      const keyCandidate = canonical(winnerName);

                      // Merge similar keys (handle variants like 'shohag', 'shohagali', etc.)
                      let key = keyCandidate;
                      const existing = Object.keys(byFirst).find(k => k && (k === keyCandidate || k.startsWith(keyCandidate) || keyCandidate.startsWith(k)));
                      if (existing) key = existing;

                      if (!byFirst[key]) byFirst[key] = [];
                      byFirst[key].push(m);
                    });

                    const orderedFirsts = Object.keys(byFirst).sort((a, b) => a.localeCompare(b));

                    return orderedFirsts.map((k) => {
                      const items = (byFirst[k] || []).sort((a: any, b: any) => b.date.localeCompare(a.date));
                      const displayName = items[0]?.winner || items[0]?.team1_name || k || 'Unknown';
                      const groupColor = getColorForTeam(groupName);

                      // Break items into chunks of 3 for separate blocks
                      const chunks: any[] = [];
                      for (let i = 0; i < items.length; i += 3) {
                        chunks.push(items.slice(i, i + 3));
                      }

                      return (
                        <div key={k} className="winner-group">
                          <div className="winner-subheader mb-3" style={{ paddingLeft: 10 }}>
                            <span className="text-sm font-medium text-muted-foreground">{displayName}</span>
                          </div>

                          {chunks.map((chunk, ci) => (
                            <div className="chunk-separator" key={ci}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {chunk.map((m: any) => (
                                  <div
                                    key={m.id}
                                    className="today-match-card p-3 rounded-lg bg-card/30 hover:bg-card/60 transition-all pl-3"
                                    style={{ borderLeft: `4px solid ${groupColor}` }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-sm font-semibold truncate">
                                          {m.team1_name} <span className="text-muted-foreground">vs</span> {m.team2_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">{m.date}</div>
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
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    });
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
