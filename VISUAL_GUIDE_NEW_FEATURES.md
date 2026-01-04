# Visual Guide - New Features

## 1. 🎬 Slide Auto-Play Settings

### Location: Admin Dashboard → Slides Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🎬 Auto-Play Settings                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ☑ Enable Auto-Play                                        │
│                                                              │
│  └─ Interval (seconds): [5] [Save Button]                  │
│     ⏱️ Slide will auto-advance every 5 second(s).            │
│     Auto-play pauses on hover.                             │
│                                                              │
│  Examples:                                                  │
│  • 1 second  = Very fast advance                           │
│  • 5 seconds = Default (balanced)                          │
│  • 10+ sec   = Slow advance for detailed viewing           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Features:
- ✅ Toggle auto-play on/off
- ✅ Set interval from 1-60 seconds
- ✅ Auto-play pauses when hovering over slide
- ✅ Settings save automatically
- ✅ Works across page refreshes

---

## 2. 🌟 Slide Hover Effects (Home Page)

### Before
```
┌─────────────────────────┐
│   Match Slide           │
│   (Normal state)        │
└─────────────────────────┘
```

### After (On Hover)
```
┌─────────────────────────┐
│┊ Match Slide           ┊│
│┊ (Slightly Scaled Up)  ┊│
│┊ (Enhanced Shadow)     ┊│
└─────────────────────────┘
  ↑ Scale: 1.01
  ↑ Shadow: More prominent
  ↑ Smooth transition
```

### CSS Applied:
- Shadow enhancement: `hover:shadow-3xl`
- Scale: `hover:scale-[1.01]`
- Transition: `transition-transform duration-300`

---

## 3. 🎯 Default Slide Behavior

### Startup Flow:

```
1. Page loads
   ↓
2. Check if today's data exists
   ├─ YES → Show "Today" slide (Default)
   └─ NO  → Show "Winners-A" slide
   ↓
3. User can navigate or enable auto-play
```

### Today Slide Auto-Switch:

```
Timeline:
Morning (9 AM) → Today slide shows upcoming matches
                 ↓
Afternoon       → Today slide shows completed matches
                 ↓
Evening (8 PM)  → No more today data
                 ↓
Auto-switches to Winners slide automatically
```

---

## 4. 🎨 Theme Selector in Admin

### Location: Admin Header (next to Fullscreen button)

```
┌─────────────────────────────────────────────────────┐
│ [Palette] [Fullscreen] [Logout]                     │
│    ↓                                                 │
│  Click to open theme menu                          │
└─────────────────────────────────────────────────────┘
```

### Theme Menu:

```
┌─────────────────────────────────────────────────────┐
│ Website Theme                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [🌊] [🌲] [🌅]                                     │
│  Ocean Forest Sunset                                │
│                                                     │
│  [💜] [✨] [☁️]                                     │
│  Amethyst Gold Sky                                  │
│                                                     │
│  [⚪]                                               │
│  White                                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Current Theme                                       │
│ 🟦 🟦 Ocean                                         │
│ (Color preview)                                     │
└─────────────────────────────────────────────────────┘
```

### Benefits:
- ✅ Easy theme switching
- ✅ Live preview colors
- ✅ Immediately applies to entire dashboard
- ✅ Theme persists for admin across sessions

---

## 5. ⚪ White Theme Improvements

### Before
```
┌─────────────────────────────────────────────────┐
│ White Background                                │
│                                                 │
│ Light text (hard to read on white)             │
│ Content visibility: ★★☆☆☆                      │
└─────────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────────┐
│ White Background                                │
│                                                 │
│ Dark text (easy to read)                        │
│ Content visibility: ★★★★★                      │
│                                                 │
│ Better contrast ratio                          │
│ WCAG accessibility compliant                   │
└─────────────────────────────────────────────────┘
```

### Changed Values:
- `foreground`: "0 0% 8%" (Black text)
- `muted-foreground`: "0 0% 35%" ← **Updated** (Darker gray)
- Good contrast on white (#F2F2F2) background

---

## 6. 🔄 Auto-Play With Hover

### Active State:
```
Slide auto-advancing...
5s → 4s → 3s → 2s → 1s → [NEXT SLIDE]
```

### On Hover:
```
Slide auto-advancing...
5s → 4s → 3s → 2s ← [USER HOVERS HERE]
(Paused)
∞ → ∞ → ∞ (stays on current slide)
```

### Mouse Leave:
```
Resumes countdown...
← [USER LEAVES] →
5s → 4s → 3s → 2s → 1s → [NEXT SLIDE]
```

---

## Settings Flow Diagram

```
┌─────────────────────────────────────────────┐
│ Admin Dashboard - Slides Tab                │
└────────────────────┬────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Auto-Play Settings UI  │
        ├────────────────────────┤
        │ ☑ Enable Auto-Play     │
        │ Interval: [5] [Save]   │
        └────────┬───────────────┘
                 │
                 ↓ (Save clicked)
        ┌────────────────────────┐
        │  localStorage Update   │
        ├────────────────────────┤
        │ autoplay-enabled: true │
        │ autoplay-interval: 5   │
        └────────┬───────────────┘
                 │
                 ↓ (Storage event)
        ┌────────────────────────┐
        │ Home Page Slideshow    │
        ├────────────────────────┤
        │ Reads new settings     │
        │ Applies immediately    │
        │ Auto-play starts       │
        └────────────────────────┘
```

---

## User Journey

### For Regular Users:
1. ✅ See "Today" slide by default
2. ✅ Hover effects add visual feedback
3. ✅ If admin enabled auto-play, slide advances automatically
4. ✅ Hovering pauses auto-play for interaction
5. ✅ At end of day, automatically switches to winners

### For Admin Users:
1. ✅ Login to admin dashboard
2. ✅ Choose theme in header
3. ✅ Go to Slides tab
4. ✅ Toggle auto-play settings
5. ✅ Set desired interval
6. ✅ Settings apply to public home page immediately
7. ✅ Changes persist across sessions

---

## Quick Reference

### Default Settings:
- Default slide: **Today** (if available)
- Hover scale: **1.01** (1% increase)
- Auto-play: **OFF** (admin must enable)
- Auto-play interval: **5 seconds**
- White theme text: **Dark (#131313)**

### Shortcuts:
- Admin theme: Click Palette icon in header
- Slide settings: Admin → Slides tab → Bottom section
- Enable auto-play: Check box, set interval, click Save

### Keyboard Support:
- Navigation arrows: ← → (if not auto-playing)
- Tab: Navigate through controls
- Enter: Activate buttons

