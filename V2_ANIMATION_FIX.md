# v2 Animation Switching Fix

## Problem
User reported:
- Initial animation works for all body types ?
- Clicking animation buttons highlights them ?
- BUT sprite freezes, doesn't change animation ?
- Child missing certain animations could cause errors ?

## Root Cause

The `loadCharacter()` function was updating `state.bodySprite` even when the load failed:

```javascript
try {
  state.bodySprite = await loadImageWithFallback(bodyPaths);
} catch (e) {
  state.bodySprite = null;  // ? Sets sprite to null!
  return;
}
```

When an animation failed to load (e.g., child + combat_idle):
1. Load fails, sets `state.bodySprite = null`
2. Animation loop continues
3. `render()` sees `null` sprite and returns early
4. Canvas shows last successfully rendered frame
5. Result: **Sprite appears "frozen"**

## Solution

### 1. Don't Overwrite State on Failure
```javascript
let newBodySprite;
try {
  newBodySprite = await loadImageWithFallback(bodyPaths);
} catch (e) {
  return false; // ? Keep old sprite, signal failure
}

// Only update if successful
state.bodySprite = newBodySprite;
return true;
```

### 2. Revert UI on Failure
```javascript
const success = await loadCharacter(state.currentGender, animation);

if (success === false) {
  // Revert to previous animation
  state.currentAnimation = previousAnimation;
  state.currentFrame = 0;
  
  // Revert button highlight
  document.querySelector(`[data-animation="${previousAnimation}"]`)?.classList.add('active');
}
```

### 3. Return Success/Failure Boolean
- `return true` - Animation loaded successfully
- `return false` - Animation not available, kept old sprite

## Expected Results

? **All animations work for male/female/teen** (have all 15 animations)  
? **Child animations work** (walk, idle, slash, hurt, jump, sit)  
? **Child unsupported animations** - Clicking them shows console warning, reverts to previous animation  
? **No frozen sprites** - Always shows a valid animation  
? **Smooth UX** - User sees which animations are available per body type

## Console Output Example

### Successful Load
```
?? Loading male run...
Body paths: [...]
? Loaded: /spritesheets/body/bodies/male/run/light.png (512x256)
Head paths: [...]
? Loaded: /spritesheets/head/heads/human/male/run/light.png (512x256)
```

### Failed Load (Child + Combat Idle)
```
?? Loading child combat_idle...
Body paths: [...]
? Failed: /spritesheets/body/bodies/child/combat_idle/light.png
? Failed: /spritesheets/body/bodies/child/combat_idle.png
? All paths failed: [...]
? Animation "combat_idle" not available for child
?? Reverting to walk
```

## Deploy

```bash
git add builder.js V2_ANIMATION_FIX.md
git commit -m "v2: Fix animation switching freeze

- Don't overwrite sprite state on load failure
- Return success/failure boolean from loadCharacter
- Auto-revert to previous animation if load fails
- Child unsupported animations handled gracefully
- No more frozen sprites"
git push origin cursor/build-modular-lpc-character-system-45d7
```
