# Group Standings UI Components - Visual Guide 🎨

## Component Structure Overview

### 1. TEAM CARD (Clickable)
```
┌─────────────────────────────────┐
│ 🥇 (Badge)                      │  ← Rank Badge
│                                 │     • Position: -top-4 -left-4
│ Team Name              ← Bold    │     • Size: w-14 h-14
│ 5 matches played ← Subtext       │     • Hover: scale-110
│                                 │
│ ┌───────────────┬──────────────┐│
│ │  WINS   🔢    │  LOSSES  🔢   ││
│ │  Green Box    │  Red Box     ││
│ ├───────────────┼──────────────┤│
│ │ WIN RATE 🔢%  │  SCORE  🔢    ││
│ │ Purple Box    │  Blue Box    ││
│ └───────────────┴──────────────┘│
│                                 │
│ 👤👤 +2  ← Player Avatars       │
│                                 │
│ 👉 Click for details            │
│                                 │
└─────────────────────────────────┘
    ↓ ON HOVER:
    • Scale: 105%
    • Translate: -translate-y-2
    • Shadow: Blue glow
    • Border: Brighter blue
    • Text: Team name turns yellow
    • Boxes: Background increases
    • Badge: Scales 110%
```

### 2. MODAL DIALOG (Opened on Click)
```
┌───────────────────────────────────────┐
│  🥇         ← Large Badge             │
│      Team Name                        │
│      Rank #1                    [X]   │
├───────────────────────────────────────┤
│                                       │
│  ┌──────────┬──────────┬──────────┐  │
│  │ Wins     │ Losses   │ Win Rate │  │
│  │ 15       │ 5        │ 75.0%    │  │
│  └──────────┴──────────┴──────────┘  │
│  ┌──────────┬──────────┬──────────┐  │
│  │ Score    │ Matches  │ Avg Scr  │  │
│  │ 450      │ 20       │ 22.5     │  │
│  └──────────┴──────────┴──────────┘  │
│                                       │
│  Team Players                         │
│  ┌───────────────────────────────┐   │
│  │ 1 👤  Player Name             │   │
│  ├───────────────────────────────┤   │
│  │ 2 👤  Player Name             │   │
│  └───────────────────────────────┘   │
│                                       │
│         [ Close Button ]              │
└───────────────────────────────────────┘
```

## Styling Details

### Card Hover Effects:
```css
/* Normal State */
border: border-blue-500/30
background: from-blue-600/20 to-purple-600/20
shadow: default

/* Hover State */
border: border-blue-400/80
background: from-blue-600/40 to-purple-600/40
shadow: shadow-2xl shadow-blue-500/30
transform: scale-105 translateY(-8px)
transition: 300ms
```

### Stat Boxes:
```
WINS Box:       bg-green-500/20  → hover: bg-green-500/30
LOSSES Box:     bg-red-500/20    → hover: bg-red-500/30
WIN RATE Box:   bg-purple-500/20 → hover: bg-purple-500/30
SCORE Box:      bg-blue-500/20   → hover: bg-blue-500/30
```

### Text Colors:
```
Wins:       text-green-400 (bright green)
Losses:     text-red-400 (bright red)
Win Rate:   text-purple-400 (bright purple)
Score:      text-blue-400 (bright blue)
Team Name:  text-white → hover: text-yellow-300
```

### Rank Badge:
```
Position:   absolute -top-4 -left-4
Size:       14rem (56px)
Background: from-yellow-400 to-yellow-600
Border:     4px solid slate-900
Emoji:      🥇 (Rank 1)
            🥈 (Rank 2)
            🥉 (Rank 3)
            #4+ (Number)
Hover:      scale-110
```

## Interaction Flow

### 1. Initial View
- User sees grid of team cards
- Cards are arranged 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- "Click for details" text visible

### 2. Hover State
- Card smoothly scales up 5%
- Card moves up 2px
- Border becomes brighter
- Shadow glows with blue color
- Badge scales larger (110%)
- Team name color changes to yellow
- Stat box backgrounds brighten
- Player avatars have brighter borders

### 3. Click Action
- Modal opens with smooth animation
- Background darkens with backdrop blur
- Modal contains full team statistics
- Players listed with numbers
- Can scroll if content too large

### 4. Close Modal
- Click close button [X]
- Click outside modal
- Both actions close the modal

## Responsive Breakpoints

### Mobile (< 768px):
- 1 column grid
- Smaller text sizes
- Smaller badge (still prominent)
- Full-width modal with padding

### Tablet (768px - 1024px):
- 2 column grid
- Medium text sizes
- Normal badge size
- Modal fits well

### Desktop (> 1024px):
- 3 column grid
- Full text sizes
- Normal badge size
- Max-width 2xl modal

## Animation Timings

```
Card Hover:         300ms ease-in-out
Badge Scale:        300ms ease-in-out
Text Color Change:  default (150ms)
Box Background:     default (150ms)
Modal Open:         fade-in zoom-in-95
Modal Close:        fade-out
```

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary Background | slate-900 | #0f172a |
| Card Background | blue-600/20 | rgba(37,99,235,0.2) |
| Win Box | green-400 | #4ade80 |
| Loss Box | red-400 | #f87171 |
| Win Rate | purple-400 | #c084fc |
| Score | blue-400 | #60a5fa |
| Rank Badge | yellow-400 to yellow-600 | #facc15 to #ca8a04 |
| Text Primary | white | #ffffff |
| Text Secondary | white/60 | rgba(255,255,255,0.6) |
| Border | blue-500/30 | rgba(59,130,246,0.3) |

## Accessibility Features

- ✅ Close button with X icon
- ✅ Click outside modal to close
- ✅ High contrast text colors
- ✅ Clear visual hierarchy with badges
- ✅ Numbered players in modal for clarity
- ✅ Large clickable surface area (entire card)

## Performance Considerations

- Uses CSS transitions (GPU accelerated)
- No JavaScript animations
- Smooth 300ms durations
- Backdrop blur on modal (performant)
- Shadow effects are subtle
- No heavy animations on scroll
