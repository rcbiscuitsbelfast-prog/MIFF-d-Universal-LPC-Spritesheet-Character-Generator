# ?? Version 2.0 Changes

## Major Changes

### 1. ? Child Body Fix
**Insight from user**: In the original LPC generator, child heads and adult heads are separate categories. You can't select an adult head when child body is selected.

**Solution**: 
- Child body sprites **include the head** in the same sprite sheet!
- Added `loadHead: false` flag for child body type
- Child no longer tries to load a separate head sprite
- This explains why the head was "floating" - we were overlaying an adult head on a child body that already had its own head!

### 2. ? All Animations Added
Added **8 new animations** for a total of **15 animations**:

**New animations**:
- ?? Run
- ??? Combat Idle
- ??? Half Slash
- ?? Back Slash
- ?? Jump
- ?? Sit
- ?? Climb
- ?? Emote

**Previous animations**:
- ?? Walk
- ?? Idle
- ?? Slash
- ??? Thrust
- ? Spellcast
- ?? Shoot
- ?? Hurt

**Note**: Child body type only has 6 animations (walk, idle, slash, hurt, jump, sit). When child is selected and user clicks unsupported animation, it will gracefully fail to load but not crash.

### 3. ? Version Updated
- Browser tab: "LPC Character Builder v2"
- Header: "?? LPC Builder v2"

## Technical Changes

### CONFIG.bodyTypes
```javascript
bodyTypes: {
  male: { 
    path: 'body/bodies/male',
    headPath: 'head/heads/human/male',
    bodyColor: 'light',
    headColor: 'light',
    loadHead: true  // ? NEW: Load separate head
  },
  child: { 
    path: 'body/bodies/child',
    headPath: null,  // ? No separate head path
    bodyColor: 'light',
    headColor: null,
    loadHead: false  // ? NEW: Don't load head (body includes it)
  }
}
```

### CONFIG.animations
Added 8 new animation definitions with appropriate frame counts and fps.

### loadCharacter()
```javascript
if (!bodyType.loadHead) {
  console.log('?? Skipping head load (body includes head)');
  state.headSprite = null;
  return;
}
```

## Expected Results

? **Child body**:
- No separate head loading
- Body sprite includes head already
- Child head properly sized and positioned!

? **Adult bodies**:
- Load separate head as before
- All 15 animations available

? **Animation bar**:
- 15 buttons total
- Horizontally scrollable on mobile
- All animations work (if available for selected body type)

## Known Limitations

- Child only supports 6/15 animations
- When unsupported animation selected for child, sprite won't load (expected)
- Future: Could hide/disable unsupported animations per body type

## Deploy

```bash
git add builder.js builder.html V2_CHANGES.md
git commit -m "v2: Fix child head + add 8 new animations

- Child body sprites include head (no separate head load)
- Added run, combat_idle, halfslash, backslash, jump, sit, climb, emote
- 15 total animations now available
- Updated version to v2"
git push origin cursor/build-modular-lpc-character-system-45d7
```
