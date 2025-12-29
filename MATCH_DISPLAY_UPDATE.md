# Tournament Groups Match Display Update

## Changes Made

### File Modified: `src/components/GroupCards.tsx`

#### 1. **Current Date Filter**
- Added logic to filter matches from the current date onwards
- Only matches with dates >= today will be displayed in tournament group cards
- Past matches are automatically excluded

```tsx
// Get current date
const today = new Date();
today.setHours(0, 0, 0, 0);

// Filter matches from current date onwards
const filteredMatches = matches.filter((match: any) => {
  if (!match.date) return false;
  const matchDate = new Date(match.date);
  matchDate.setHours(0, 0, 0, 0);
  return matchDate >= today;
});
```

#### 2. **Match Display Count**
- Changed from displaying 3 matches to **4-6 matches** per group card
- Used `.slice(0, 6)` to show up to 6 matches
- Updated "more matches" indicator from "+{length - 3}" to "+{length - 6}"

#### 3. **Colored Border Hover Effects**
- Each match card now displays with a different colored border on hover
- 6 distinct colors rotating across matches:
  - **Cyan** - hover:border-cyan-400/80 hover:shadow-cyan-500/30
  - **Blue** - hover:border-blue-400/80 hover:shadow-blue-500/30
  - **Purple** - hover:border-purple-400/80 hover:shadow-purple-500/30
  - **Pink** - hover:border-pink-400/80 hover:shadow-pink-500/30
  - **Green** - hover:border-green-400/80 hover:shadow-green-500/30
  - **Yellow** - hover:border-yellow-400/80 hover:shadow-yellow-500/30

```tsx
const borderColors = [
  'hover:border-cyan-400/80 hover:shadow-cyan-500/30',
  'hover:border-blue-400/80 hover:shadow-blue-500/30',
  'hover:border-purple-400/80 hover:shadow-purple-500/30',
  'hover:border-pink-400/80 hover:shadow-pink-500/30',
  'hover:border-green-400/80 hover:shadow-green-500/30',
  'hover:border-yellow-400/80 hover:shadow-yellow-500/30'
];
```

## Features

✅ Matches are filtered to show only upcoming matches (from today onwards)
✅ Each group card displays 4-6 matches
✅ Every match card has a unique colored border on hover
✅ Smooth transitions and shadow effects on hover
✅ Visual consistency with existing card design

## Result

Users will now see:
- Only relevant upcoming matches in tournament groups
- More matches displayed per card (up to 6 instead of 3)
- Vibrant colored borders appearing on hover for better visual feedback
