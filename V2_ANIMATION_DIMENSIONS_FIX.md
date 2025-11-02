# v2 Animation Dimensions & Direction Fix

## Problems Reported

1. ? **Hurt animation completely missing**
2. ? **Climb animation completely missing**
3. ?? **Emote and combat_idle flash** (wrong frame counts)
4. ?? **Sit looks like one frame** (configured wrong)
5. ?? **No way to test other directions** (only down visible)

## Root Cause Analysis

### Hurt & Climb Missing

**Problem**: These sprites are **384x64** = 6 frames ? **1 ROW ONLY**

```
Normal animations:  576x256 = 9 frames ? 4 rows (up/left/down/right)
Hurt/Climb:        384x64  = 6 frames ? 1 row  (down only!)
```

Our code tried to read rows 0-3 for directions, but hurt/climb only have row 0!

**Why it didn't show**: When rendering "down" direction (directionOffset=2), we tried to read row 2, which doesn't exist ? nothing renders!

### Flashing Animations

**Problem**: Wrong frame counts configured

```
Emote:       192x256 = 3 frames ? 4 directions (configured: 4 frames ?)
Combat_idle: 128x256 = 2 frames ? 4 directions (configured: 4 frames ?)
Sit:         192x256 = 3 frames ? 4 directions (configured: 1 frame ?)
```

When we configure more frames than exist, the animation reads blank/garbage data ? flashing!

## Solution

### 1. Add `singleDirection` Flag

```javascript
animations: {
  walk: { ..., singleDirection: false },   // Has 4 directions
  hurt: { ..., singleDirection: true },    // Only 1 direction!
  climb: { ..., singleDirection: true }    // Only 1 direction!
}
```

### 2. Fix Frame Counts

```javascript
sit: { frames: 3, ... },          // was: 1 ? now: 3
combat_idle: { frames: 2, ... },  // was: 4 ? now: 2
emote: { frames: 3, ... }         // was: 4 ? now: 3
```

### 3. Update Render Logic

```javascript
// Single-direction animations always use row 0
const directionOffset = animConfig.singleDirection 
  ? 0 
  : CONFIG.directions[state.currentDirection];
```

### 4. Add Direction Selector UI

Added 4 buttons: ?? Up | ?? Left | ?? Down | ?? Right

User can now test all directions for multi-directional animations.

## Expected Results

? **Hurt animation** - Shows correctly (single direction only)  
? **Climb animation** - Shows correctly (single direction only)  
? **Emote** - No more flashing (3 frames)  
? **Combat_idle** - No more flashing (2 frames)  
? **Sit** - Animated properly (3 frames)  
? **Direction buttons** - Test up/left/down/right for all animations  
? **Single-direction animations** - Don't change when direction clicked

## Sprite Dimensions Reference

```
Animation      | Dimensions | Frames | Rows | Type
---------------|------------|--------|------|------------------
walk           | 576x256    | 9      | 4    | Multi-directional
run            | 512x256    | 8      | 4    | Multi-directional
idle           | 64x256     | 1      | 4    | Multi-directional
slash          | 384x256    | 6      | 4    | Multi-directional
spellcast      | 448x256    | 7      | 4    | Multi-directional
shoot          | 832x256    | 13     | 4    | Multi-directional
thrust         | 512x256    | 8      | 4    | Multi-directional
jump           | 256x256    | 4      | 4    | Multi-directional
sit            | 192x256    | 3      | 4    | Multi-directional
combat_idle    | 128x256    | 2      | 4    | Multi-directional
emote          | 192x256    | 3      | 4    | Multi-directional
hurt           | 384x64     | 6      | 1    | SINGLE-DIRECTION
climb          | 384x64     | 6      | 1    | SINGLE-DIRECTION
```

## Deploy

```bash
git add builder.js builder.html V2_ANIMATION_DIMENSIONS_FIX.md
git commit -m "v2: Fix hurt/climb + frame counts + direction selector

- Add singleDirection flag for hurt and climb (1-row sprites)
- Fix frame counts: sit=3, combat_idle=2, emote=3
- Add direction selector UI (up/left/down/right)
- Update render logic to handle single-direction animations
- All animations now display correctly"
git push origin cursor/build-modular-lpc-character-system-45d7
```
