# Quick Start Guide - LPC Avatar Builder

Get started with the LPC Avatar Builder module in 5 minutes!

## Installation

### Option 1: Direct HTML Include

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="modules/avatar-builder/avatar-builder.css">
</head>
<body>
  <div id="character-creator"></div>

  <script src="modules/avatar-builder/asset-loader.js"></script>
  <script src="modules/avatar-builder/avatar-builder.js"></script>
  <script src="modules/avatar-builder/player-customization.js"></script>
  <script src="modules/avatar-builder/npc-system.js"></script>
  <script src="modules/avatar-builder/index.js"></script>
  
  <script>
    // Your code here
  </script>
</body>
</html>
```

### Option 2: Module Import (ES6)

```javascript
import AvatarBuilderModule from './modules/avatar-builder/index.js';
```

## Basic Usage

### 1. Initialize Module

```javascript
const avatarModule = MIFF.AvatarBuilder.create({
  spritesheetsPath: '/workspace/spritesheets',
  npcPresetsPath: '/workspace/content/npcs'
});

await avatarModule.init();
```

### 2. Build a Character

```javascript
const myCharacter = await avatarModule.buildAvatar({
  body: { type: 'male', color: 'light' },
  hair: { style: 'short', color: 'brown' }
});
```

### 3. Get Animation Frame

```javascript
const frame = avatarModule.getFrame(
  myCharacter,
  'walk',      // animation: walk, slash, spellcast, thrust, shoot, hurt
  'down',      // direction: up, down, left, right
  0            // frame index
);

// Draw to your game canvas
yourGameCanvas.getContext('2d').drawImage(frame, x, y);
```

### 4. Add Customization UI

```javascript
await avatarModule.initCustomizationUI('#character-creator');

// Listen to changes
avatarModule.getCustomizationSystem().onChange((state) => {
  console.log('Character changed:', state);
});
```

### 5. Spawn NPCs

```javascript
// Spawn from preset
const guard = avatarModule.spawnNPC('Town Guard', { x: 10, y: 5 });

// Update NPCs (in game loop)
const npcSystem = avatarModule.getNPCSystem();
npcSystem.update(deltaTime);

// Render NPC
npcSystem.renderNPC(guard, ctx, cameraX, cameraY, scale);
```

## Common Patterns

### Walking Animation Loop

```javascript
let currentFrame = 0;
const fps = 12;
const frameDelay = 1000 / fps;
let lastFrameTime = 0;

function gameLoop(timestamp) {
  if (timestamp - lastFrameTime > frameDelay) {
    currentFrame = (currentFrame + 1) % 9; // Walk has 9 frames
    
    const frame = avatarModule.getFrame(
      myCharacter,
      'walk',
      playerDirection,
      currentFrame
    );
    
    ctx.drawImage(frame, playerX, playerY);
    lastFrameTime = timestamp;
  }
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Change Outfit

```javascript
// Register player first
avatarModule.registerPlayer('player1', myCharacter);

// Apply new outfit
const updated = await avatarModule.applyOutfit('player1', {
  clothes: {
    torso: 'torso/armor/chainmail.png',
    legs: 'legs/pants/leather.png'
  },
  weapon: 'weapon/sword/longsword.png'
});
```

### Export Character Spritesheet

```javascript
const spritesheet = avatarModule.exportSpritesheet(myCharacter);

// Download as PNG
const link = document.createElement('a');
link.download = 'my-character.png';
link.href = spritesheet.toDataURL('image/png');
link.click();
```

### Create Custom NPC

```javascript
await avatarModule.loadNPCPreset({
  name: 'My Custom NPC',
  sprite: {
    body: { type: 'female', color: 'tanned' },
    hair: { style: 'long', color: 'red' },
    clothes: {
      torso: 'torso/dress/blue.png'
    }
  },
  path: [[0, 0], [5, 0], [5, 5], [0, 5]],
  dialogue: ['Hello traveler!'],
  behavior: 'patrol',
  speed: 1
});

const myNPC = avatarModule.spawnNPC('My Custom NPC', { x: 0, y: 0 });
```

## Configuration Options

### Body Types
- `male`, `female`, `child`, `teen`, `muscular`, `pregnant`

### Skin Colors
- `light`, `tanned`, `dark`, `dark2`, `darkelf`, `darkelf2`

### Hair Styles
- `short`, `long`, `bangs`, `bob`, `braid`, `curly_long`, `ponytail`

### Hair Colors
- `black`, `dark_brown`, `brown`, `blonde`, `red`, `white`, `blue`, `green`

### Animations
- `walk` - 9 frames, 12 fps
- `slash` - 6 frames, 12 fps
- `spellcast` - 7 frames, 12 fps
- `thrust` - 8 frames, 12 fps
- `shoot` - 13 frames, 12 fps
- `hurt` - 6 frames, 8 fps

### Directions
- `up`, `down`, `left`, `right`

### NPC Behaviors
- `static` - Stays in place
- `patrol` - Follows path waypoints

## Troubleshooting

### Images Not Loading
Check that `spritesheetsPath` points to the correct directory:
```javascript
const avatarModule = MIFF.AvatarBuilder.create({
  spritesheetsPath: '/workspace/spritesheets'  // Update this path
});
```

### Canvas Not Rendering
Ensure the canvas context is 2D:
```javascript
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // For crisp pixel art
```

### Animation Too Fast/Slow
Adjust the FPS or use frame delays:
```javascript
const animations = avatarModule.getAvatarBuilder().animations;
console.log(animations.walk.fps); // Default: 12
```

## Next Steps

- Read the full [README.md](README.md) for detailed API reference
- Open [demo.html](demo.html) in your browser to see the module in action
- Explore the `/content/npcs/` directory for NPC preset examples
- Check out the existing spritesheets in `/workspace/spritesheets/`

## Support

For issues and questions:
- GitHub Issues: https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/issues
- LPC Community: https://lpc.opengameart.org

## License

See main project LICENSE for details. Attribution required for most assets - see CREDITS.csv.
