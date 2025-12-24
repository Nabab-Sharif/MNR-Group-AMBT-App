# Group Standings & Leaderboard Enhancements

## Overview
Enhanced the Group Standings and Leaderboard components with improved ranking logic, visual layout, and data presentation.

## Key Changes

### 1. **Enhanced Ranking Algorithm**
- **Primary Sort**: Wins (descending) - teams with more wins rank higher
- **Secondary Sort**: Win Points (descending) - total score accumulated in wins
- **Tertiary Sort**: Total Score (descending) - overall match scores
- **Ranking Sequence**: Maintains stable ordering for teams with identical stats

#### Win Points Calculation
- Win Points = Sum of all scores achieved in winning matches
- Example: Team wins 3 matches with scores of 21, 19, 22 = 62 Win Points

### 2. **Updated TeamStanding Interface**
Added new fields to provide comprehensive ranking data:
```typescript
interface TeamStanding {
  teamName: string;
  wins: number;
  losses: number;
  scoreTotal: number;
  winRate: string;
  winPoints: number;           // NEW: Total score in wins
  averageWinScore: number;     // NEW: Average score per win
  players: TeamPlayer[];
  rank: number;
  leaderPlayer?: TeamPlayer;   // NEW: Team leader/first player
}
```

### 3. **Card Layout Improvements**

#### Left Top - Team Leader Picture
- Displays the first team player's profile picture
- Circular avatar with blue border (14x14 SM / 16x16 sizing)
- Clickable to navigate to player profile
- Hover effect with scale and ring animation

#### Right Top - Ranking Badge
- Moved from center-top to right-top position
- Smaller, more compact design (14x14 SM / 16x16 sizing)
- Shows emoji badges (🥇 🥈 🥉 4️⃣-🔟) based on ranking
- Clickable with hover scale and ring effects
- Gradient background for visual appeal

#### Center Content
- Win Points (⭐) prominently displayed with amber color
- Stats grid showing: Wins, Losses, Total Score
- Each stat is clickable to see match details

### 4. **Modal/Details View Enhancements**

#### Header Section
- Team leader picture displayed on the left
- Team name and ranking in center
- Rank badge emoji showing (🥇 🥈 🥉 for top 3)
- Close button on the right

#### Overview Tab Stats
- Total Wins (Green)
- Total Losses (Red)
- **Win Points** (Amber) - NEW
- Win Rate (Purple)
- Total Score (Blue)

#### Key Metrics Row
- Total Matches
- **Average Win Score** - NEW (average points per winning match)
- Win Rate %

### 5. **Visual Enhancements**

#### Color Coding
- **Green**: Wins and positive stats
- **Red**: Losses
- **Amber**: Win Points (new metric)
- **Purple**: Win Rate percentage
- **Blue**: Total Score
- **Yellow**: Ranking badges

#### Responsiveness
- Scales appropriately for mobile, tablet, and desktop
- Avatar sizes adjust: 14x14 (mobile), 16x16 (tablet/desktop)
- Badge sizes adjust: 14x14 (mobile), 16x16 (tablet/desktop)
- All interactive elements maintain hover effects across devices

### 6. **Improved Data Processing**

The standings calculation now:
1. Tracks individual win scores for each team
2. Calculates total win points (sum of scores in wins)
3. Calculates average win score (win points / number of wins)
4. Sorts teams by comprehensive ranking criteria
5. Preserves ranking sequence for stable ordering

## Usage

The enhanced standings automatically appear in:
- Group Detail page
- Leaderboard displays
- All team ranking views

Teams are ranked based on:
1. **Most Wins** (primary metric)
2. **Highest Win Points** (secondary metric) - when wins are equal
3. **Highest Total Score** (tertiary metric) - when wins and win points are equal
4. **Ranking Sequence** - preserves original order for identical stats

## Example Scenario

**Two Teams with 5 Wins Each:**
- Team A: 5 wins with scores [20, 18, 22, 19, 21] = 100 Win Points
- Team B: 5 wins with scores [15, 16, 14, 17, 18] = 80 Win Points

**Result**: Team A ranks higher because of higher Win Points (100 > 80)

## Mobile & Desktop Preview

### Desktop (2xl screens)
- 5 cards per row
- Large avatars and badges
- Full detail visibility

### Tablet (lg screens)
- 3 cards per row
- Medium-sized avatars and badges
- Good balance between content and space

### Mobile (sm screens)
- 2 cards per row
- Compact avatars and badges
- Optimized touch targets
- Easy scrolling and interaction

## Technical Notes

- Win scores are tracked in `winScores` array during match processing
- Leader player is the first player in the team's player list
- All sorting is stable and deterministic
- Responsive design uses Tailwind CSS breakpoints
- No changes to existing match data structure required
