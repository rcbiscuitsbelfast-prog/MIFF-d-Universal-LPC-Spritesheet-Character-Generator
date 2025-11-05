# Architecture Change: Sprite Sheet Compositor

## The Problem

Current system tries to composite layers frame-by-frame during animation:
- Load body walk sprite
- Load hair walk sprite
- Load torso walk sprite
- Composite them every frame during render()
- When animation changes, reload all sprites
- Result: **Misalignment, missing items, broken animations**

## The Solution (Original LPC Approach)

Create a **single composite sprite sheet** with ALL animations pre-composed:

```
Master Sprite Sheet (832 ? 1088 pixels)
???????????????????????????????????????????
? Walk ?  (9 frames ? 4 directions)      ? Row 0-3
? Idle ?  (1 frame ? 4 directions)       ? Row 4-7
? Slash ? (6 frames ? 4 directions)      ? Row 8-11
? ... (all 15 animations)                 ?
???????????????????????????????????????????
```

Each pixel contains **all layers** (body + hair + torso + legs + head) already composited.

## Implementation Steps

### Step 1: Load All Animations for Each Layer

```javascript
async function loadAllBodyAnimations(bodyType) {
  const animations = {};
  for (const [name, config] of Object.entries(CONFIG.animations)) {
    animations[name] = await loadImage(
      `/spritesheets/${bodyType.path}/${config.dir}/${bodyType.bodyColor}.png`
    );
  }
  return animations;
}
```

### Step 2: Create Composite Master Sheet

```javascript
async function createCompositeSpriteSheet() {
  // Create large canvas for all animations
  const canvas = document.createElement('canvas');
  canvas.width = 832;  // 13 frames ? 64px
  canvas.height = 1088; // 17 rows ? 64px (15 animations ? 4 directions + some padding)
  const ctx = canvas.getContext('2d');
  
  // Load all animations for each layer
  const bodyAnims = await loadAllBodyAnimations(currentBodyType);
  const hairAnims = await loadAllHairAnimations(currentHair);
  const torsoAnims = await loadAllTorsoAnimations(currentTorso);
  const legsAnims = await loadAllLegsAnimations(currentLegs);
  
  // Composite each animation row
  let currentRow = 0;
  for (const [name, config] of Object.entries(CONFIG.animations)) {
    const directions = config.singleDirection ? 1 : 4;
    
    for (let dir = 0; dir < directions; dir++) {
      // Draw all layers for this animation row
      if (bodyAnims[name]) {
        ctx.drawImage(
          bodyAnims[name],
          0, dir * 64, // source
          832, 64,      // source size
          0, currentRow * 64, // dest
          832, 64       // dest size
        );
      }
      
      if (torsoAnims[name]) {
        ctx.drawImage(torsoAnims[name], 0, dir * 64, 832, 64, 0, currentRow * 64, 832, 64);
      }
      
      if (legsAnims[name]) {
        ctx.drawImage(legsAnims[name], 0, dir * 64, 832, 64, 0, currentRow * 64, 832, 64);
      }
      
      if (headAnims[name]) {
        ctx.drawImage(headAnims[name], 0, dir * 64, 832, 64, 0, currentRow * 64, 832, 64);
      }
      
      if (hairAnims[name]) {
        ctx.drawImage(hairAnims[name], 0, dir * 64, 832, 64, 0, currentRow * 64, 832, 64);
      }
      
      currentRow++;
    }
  }
  
  // Convert canvas to image
  return await loadImageFromCanvas(canvas);
}
```

### Step 3: Use Master Sheet for Animation

```javascript
function render() {
  const animConfig = CONFIG.animations[state.currentAnimation];
  const directionOffset = animConfig.singleDirection ? 0 : CONFIG.directions[state.currentDirection];
  
  // Calculate which row in the master sheet
  const row = getAnimationRow(state.currentAnimation) + directionOffset;
  const col = state.currentFrame;
  
  const sx = col * 64;
  const sy = row * 64;
  
  // Draw from master sheet (all layers already composited!)
  ctx.drawImage(
    state.compositeSpriteSheet,
    sx, sy, 64, 64,
    0, 0, canvas.width, canvas.height
  );
}
```

### Step 4: Export Master Sheet

```javascript
async function exportCharacter() {
  const link = document.createElement('a');
  link.download = 'character-spritesheet.png';
  link.href = state.compositeSpriteSheet.src;
  link.click();
}
```

## Benefits

1. **Perfect Alignment**: All layers composited once, not per-frame
2. **No Missing Animations**: Use walk fallback when creating sheet
3. **Better Performance**: No frame-by-frame compositing
4. **Correct Export**: Export what you see
5. **Matches LPC**: Same approach as original

## Migration Path

1. Keep current system functional
2. Add new compositor alongside
3. Switch rendering to use composite sheet
4. Remove old per-frame system
5. Test thoroughly

## Notes

- Some items only have walk animation ? Use walk for all rows
- Handle missing animations gracefully during composition
- Cache composite sheet, rebuild only on customization change
- Consider progressive loading (load animations as needed)
