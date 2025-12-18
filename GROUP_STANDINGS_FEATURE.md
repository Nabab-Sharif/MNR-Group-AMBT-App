# Group Standing Section - Feature Documentation

## Overview
A new **Group Standings** section has been added to the Group Detail page that displays each team's performance metrics in an interactive card layout with hover-card details.

## Features

### 1. **Team Standing Cards**
Each team is displayed as a card showing:
- **Rank Number**: Displayed with medal emojis (🥇🥈🥉) for top 3 teams
- **Team Name**: Bold text header
- **Quick Stats**: Grid showing:
  - **WINS**: Total wins in green
  - **LOSSES**: Total losses in red
  - **WIN RATE**: Percentage in purple
  - **SCORE**: Total score in blue

### 2. **Ranking System**
Teams are automatically ranked by:
- **Primary**: Number of wins (descending)
- **Secondary**: Win rate percentage (descending)
- Automatically numbered sequentially (#1, #2, #3, etc.)

### 3. **Player Display**
- Shows player avatars on the card preview
- Displays up to 2 player avatars with a "+X" indicator if more players exist
- Full player list available in the hover card

### 4. **Hover Card Details**
When hovering over a team card, a detailed popup appears showing:
- Team name with badges displaying wins, losses, and win rate
- Total matches played
- Total score
- Complete player list with:
  - Player avatar/photo
  - Player name

## Component Structure

### Files Created/Modified:
1. **`src/components/GroupStandings.tsx`** - New component for standings display
2. **`src/pages/GroupDetail.tsx`** - Modified to include GroupStandings component

### Data Flow:
- Receives matches array from GroupDetail
- Calculates team statistics:
  - Win/Loss counts from match winners
  - Total scores from match scores
  - Player information from match data
- Renders sorted standings with interactive hover cards

## Styling Features
- Gradient backgrounds for visual appeal
- Color-coded stats (green for wins, red for losses, etc.)
- Smooth hover animations with scale effect
- Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Backdrop blur effects for modern look

## Data Calculations

### Team Statistics:
- **Wins**: Count of matches where team won
- **Losses**: Count of matches where team lost (only completed matches)
- **Score Total**: Sum of all points scored across matches
- **Win Rate**: `(wins / (wins + losses)) * 100`

### Player Information:
- Collected from all matches where team participated
- Stores player name and photo URL
- Displayed in order of appearance

## Integration
The GroupStandings component is integrated into the GroupDetail page and displays right after the header, before the existing leaderboard and match stats sections.

## Usage Example
```tsx
<GroupStandings matches={matches} />
```

## Responsive Design
- **Mobile (< 768px)**: 1 column
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3 columns

## Future Enhancements
- Add filtering by player name
- Sort options (by wins, score, win rate)
- Historical stats view
- Player individual statistics
