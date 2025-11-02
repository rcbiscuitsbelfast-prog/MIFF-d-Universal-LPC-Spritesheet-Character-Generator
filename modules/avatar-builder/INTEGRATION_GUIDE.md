# Integration Guide - LPC Avatar Builder Module

Complete guide for integrating the LPC Avatar Builder into your game engine or framework.

## Table of Contents

1. [Phase 1: Asset Loading](#phase-1-asset-loading)
2. [Phase 2: Layered Avatar Builder](#phase-2-layered-avatar-builder)
3. [Phase 3: Player Customization](#phase-3-player-customization)
4. [Phase 4: NPC Presets](#phase-4-npc-presets)
5. [Phase 5: MIFF Module Integration](#phase-5-miff-module-integration)

---

## Phase 1: Asset Loading

The module provides automatic asset loading from the LPC spritesheet directory structure.

### Directory Structure

```
/workspace/spritesheets/
??? body/
?   ??? bodies/
?       ??? male/
?       ??? female/
?       ??? child/
?       ??? teen/
?       ??? muscular/
?       ??? pregnant/
??? hair/
?   ??? bangs/
?   ??? bob/
?   ??? braid/
?   ??? ...
??? torso/
??? legs/
??? feet/
??? weapon/
??? ...
```

### Asset Loader API

```javascript
const assetLoader = new LPCAssetLoader('/workspace/spritesheets');

// Get available options
const bodyTypes = assetLoader.getBodyTypes();
const hairStyles = assetLoader.getHairStyles();
const bodyColors = assetLoader.getColors('body');
const hairColors = assetLoader.getColors('hair');

// Build asset path
const path = assetLoader.buildAssetPath(
  'body',           // category
  'bodies/male',    // subcategory
  'adult',          // age
  'walk',           // animation
  'light'           // color
);

// Preload image
const image = await assetLoader.loadImage(path);
```

### Filename Pattern Recognition

The loader automatically parses paths like:
```
spritesheets/body/bodies/child/hurt/zombie_green.png
              ?      ?       ?     ?         ?
           category  type   age  anim    color

spritesheets/hair/page/adult/spellcast/orange.png
              ?     ?     ?       ?         ?
           category style age    anim    color
```

---

## Phase 2: Layered Avatar Builder

The avatar builder handles canvas compositing with proper layer ordering.

### Layer Order (Bottom to Top)

1. `shadow` - Character shadow
2. `body` - Base body sprite
3. `eyes` - Eye variations
4. `torso` - Shirts, armor
5. `legs` - Pants, skirts
6. `feet` - Shoes, boots
7. `arms` - Arm accessories
8. `shoulders` - Shoulder armor
9. `hands` - Gloves
10. `hair` - Hair styles
11. `facial` - Beards, mustaches
12. `head` - Hats, helmets
13. `neck` - Necklaces
14. `cape` - Capes
15. `weapon` - Weapons
16. `shield` - Shields
17. `backpack` - Backpacks

### Building Avatars

```javascript
const avatarBuilder = new LPCAvatarBuilder(assetLoader);

// Build complete avatar
const avatar = await avatarBuilder.buildAvatar({
  body: { type: 'male', color: 'light' },
  hair: { style: 'short', color: 'brown' },
  clothes: {
    torso: 'torso/shirt/white.png',
    legs: 'legs/pants/blue.png',
    feet: 'feet/shoes/brown.png'
  },
  weapon: 'weapon/sword/longsword.png',
  accessories: {
    cape: 'cape/red.png'
  }
});
```

### Getting Animation Frames

```javascript
// Get single frame
const frame = avatarBuilder.getFrame(
  avatar,
  'walk',    // animation
  'down',    // direction
  0          // frame index
);

// Get all frames for animation
const frames = avatarBuilder.createAnimationFrames(
  avatar,
  'walk',
  'down'
);

// Render full spritesheet
const spritesheet = avatarBuilder.renderSpritesheet(avatar);
```

### Animation Specifications

| Animation | Frames | FPS | Row Start |
|-----------|--------|-----|-----------|
| spellcast | 7      | 12  | 0         |
| thrust    | 8      | 12  | 4         |
| walk      | 9      | 12  | 8         |
| slash     | 6      | 12  | 12        |
| shoot     | 13     | 12  | 16        |
| hurt      | 6      | 8   | 20        |

Each animation has 4 direction rows: up (0), left (1), down (2), right (3)

---

## Phase 3: Player Customization

Interactive UI for character creation with live preview.

### Initialize UI

```javascript
const playerCustomization = new PlayerCustomization(
  avatarBuilder,
  assetLoader
);

// Attach to container
await playerCustomization.initUI('#character-creator');

// Listen to state changes
playerCustomization.onChange((state) => {
  console.log('Character updated:', state);
  
  // Save to your game state
  savePlayerCharacter(state);
});
```

### UI Features

- **Body Type Selection**: Choose from male, female, child, teen, muscular, pregnant
- **Skin Color**: Multiple skin tone options
- **Hair Style & Color**: Dozens of combinations
- **Weapon Toggle**: Show/hide weapon
- **Live Preview**: Animated character preview
- **Animation Controls**: Test different animations and directions
- **Save/Load**: LocalStorage persistence
- **Export**: Download full spritesheet as PNG

### Programmatic Control

```javascript
// Get current state
const state = playerCustomization.getState();

// Set state directly
await playerCustomization.setState({
  body: { type: 'female', color: 'tanned' },
  hair: { style: 'long', color: 'red' }
});

// Control animation
playerCustomization.playAnimation();
playerCustomization.stopAnimation();

// Save/load
playerCustomization.saveCharacter();
playerCustomization.loadCharacter();

// Export
playerCustomization.exportSpritesheet();
```

---

## Phase 4: NPC Presets

Define and spawn NPCs with behavior patterns and patrol paths.

### NPC Preset Format

Create JSON files in `/content/npcs/`:

```json
{
  "name": "Shrine Guardian",
  "sprite": {
    "body": { "type": "male", "color": "light" },
    "clothes": { "torso": "torso/robe/blue.png" },
    "hair": { "style": "long", "color": "black" },
    "weapon": null
  },
  "path": [[5, 10], [5, 11], [5, 10]],
  "dialogue": [
    "Welcome to the shrine.",
    "May the spirits guide you."
  ],
  "behavior": "patrol",
  "speed": 0.5
}
```

### NPC System API

```javascript
const npcSystem = new NPCSystem(avatarBuilder, assetLoader);

// Load preset
await npcSystem.loadPreset(presetConfig);

// Spawn NPC instance
const npc = npcSystem.spawnNPC('Shrine Guardian', { x: 5, y: 10 });

// Update NPCs (call in game loop)
npcSystem.update(deltaTime);

// Render NPC
npcSystem.renderNPC(npc, ctx, cameraX, cameraY, scale);

// Get NPC at position (for interaction)
const clickedNPC = npcSystem.getNPCAtPosition({ x: 5, y: 10 }, 1);
if (clickedNPC) {
  showDialogue(clickedNPC.dialogue);
}
```

### NPC Behaviors

#### Static
```javascript
{
  "behavior": "static",
  "speed": 0
}
```
NPC stays in place.

#### Patrol
```javascript
{
  "behavior": "patrol",
  "path": [[0, 0], [5, 0], [5, 5], [0, 5]],
  "speed": 1
}
```
NPC walks between waypoints in order, looping back to start.

### Game Loop Integration

```javascript
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update NPCs
  npcSystem.update(deltaTime);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render all NPCs
  const allNPCs = npcSystem.getAllNPCs();
  for (const npc of allNPCs) {
    npcSystem.renderNPC(npc, ctx, camera.x, camera.y, 2);
  }
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Phase 5: MIFF Module Integration

The module exposes a clean API through the MIFF namespace.

### Module Interface

```javascript
// Create module instance
const avatarModule = MIFF.AvatarBuilder.create({
  spritesheetsPath: '/workspace/spritesheets',
  npcPresetsPath: '/workspace/content/npcs'
});

// Initialize
await avatarModule.init();

// Access sub-systems
const assetLoader = avatarModule.getAssetLoader();
const avatarBuilder = avatarModule.getAvatarBuilder();
const customization = avatarModule.getCustomizationSystem();
const npcSystem = avatarModule.getNPCSystem();
```

### Public API Methods

#### Avatar Building
- `buildAvatar(config)` - Build avatar from config
- `getFrame(avatarData, action, direction, frameIndex)` - Get animation frame
- `exportSpritesheet(avatarData)` - Export full spritesheet
- `createAnimationFrames(avatarData, animation, direction)` - Get all frames

#### Player Management
- `registerPlayer(playerId, avatarData)` - Register player
- `getPlayerAvatar(playerId)` - Get player's avatar
- `removePlayer(playerId)` - Remove player
- `applyOutfit(playerId, outfitConfig)` - Change player's outfit

#### Customization
- `initCustomizationUI(container)` - Initialize UI
- `getCustomizationSystem()` - Get customization instance

#### NPC Management
- `loadNPCPreset(preset)` - Load NPC preset
- `spawnNPC(presetName, position)` - Spawn NPC instance
- `getNPCSystem()` - Get NPC system instance

### Example: Complete Game Integration

```javascript
// Initialize module
const game = {
  avatarModule: null,
  player: null,
  npcs: []
};

async function initGame() {
  // Create and init module
  game.avatarModule = MIFF.AvatarBuilder.create({
    spritesheetsPath: '/workspace/spritesheets',
    npcPresetsPath: '/workspace/content/npcs'
  });
  
  await game.avatarModule.init();
  
  // Create player character
  game.player = await game.avatarModule.buildAvatar({
    body: { type: 'male', color: 'light' },
    hair: { style: 'short', color: 'brown' }
  });
  
  game.avatarModule.registerPlayer('player1', game.player);
  
  // Spawn NPCs
  game.npcs.push(
    game.avatarModule.spawnNPC('Shrine Guardian', { x: 10, y: 5 }),
    game.avatarModule.spawnNPC('Town Guard', { x: 20, y: 15 })
  );
  
  // Start game loop
  requestAnimationFrame(gameLoop);
}

let playerFrame = 0;

function gameLoop(timestamp) {
  // Update NPCs
  game.avatarModule.getNPCSystem().update(16); // ~60 FPS
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render player
  const playerSprite = game.avatarModule.getFrame(
    game.player,
    'walk',
    'down',
    playerFrame
  );
  ctx.drawImage(playerSprite, playerX, playerY);
  
  // Render NPCs
  const npcSystem = game.avatarModule.getNPCSystem();
  for (const npc of game.npcs) {
    npcSystem.renderNPC(npc, ctx, 0, 0, 1);
  }
  
  playerFrame = (playerFrame + 1) % 9;
  requestAnimationFrame(gameLoop);
}

// Start game
initGame();
```

### Multiplayer Support

```javascript
// Server: Send player data to clients
const playerData = {
  id: 'player123',
  config: customization.getState(),
  position: { x: 10, y: 5 }
};

socket.emit('player-joined', playerData);

// Client: Receive and render other players
socket.on('player-joined', async (data) => {
  const avatar = await avatarModule.buildAvatar(data.config);
  avatarModule.registerPlayer(data.id, avatar);
});

socket.on('player-moved', (data) => {
  const avatar = avatarModule.getPlayerAvatar(data.id);
  const frame = avatarModule.getFrame(
    avatar,
    data.animation,
    data.direction,
    data.frame
  );
  // Render at data.position
});
```

---

## Performance Optimization

### Image Preloading

```javascript
// Preload common assets at startup
const commonAssets = [
  'body/bodies/male/walk/light.png',
  'body/bodies/female/walk/light.png',
  'hair/short/walk/brown.png',
  'hair/long/walk/black.png'
];

await Promise.all(
  commonAssets.map(path => assetLoader.loadImage(path))
);
```

### Canvas Caching

```javascript
// Cache rendered frames to avoid re-compositing
const frameCache = new Map();

function getCachedFrame(avatarId, animation, direction, frame) {
  const key = `${avatarId}-${animation}-${direction}-${frame}`;
  
  if (!frameCache.has(key)) {
    const canvas = avatarModule.getFrame(
      avatarData,
      animation,
      direction,
      frame
    );
    frameCache.set(key, canvas);
  }
  
  return frameCache.get(key);
}
```

### Batch Rendering

```javascript
// Render multiple NPCs in one pass
const npcs = npcSystem.getAllNPCs();
const sortedNPCs = npcs.sort((a, b) => a.position.y - b.position.y);

for (const npc of sortedNPCs) {
  npcSystem.renderNPC(npc, ctx, camera.x, camera.y, scale);
}
```

---

## Troubleshooting

### Common Issues

**Images not loading**
- Check `spritesheetsPath` is correct
- Verify files exist at the expected paths
- Check browser console for CORS errors

**Canvas not rendering**
- Ensure canvas has width/height set
- Check `imageSmoothingEnabled = false` for pixel art
- Verify context is 2D: `getContext('2d')`

**Animations choppy**
- Use proper FPS timing in game loop
- Cache frames to reduce compositing
- Preload assets before rendering

**NPCs not moving**
- Call `npcSystem.update(deltaTime)` each frame
- Verify NPC has `behavior: 'patrol'` and valid `path`
- Check `speed` value is greater than 0

---

## Next Steps

1. ? Explore the [demo.html](demo.html) file
2. ? Read the [QUICK_START.md](QUICK_START.md) guide
3. ? Review NPC presets in `/content/npcs/`
4. ? Test the customization UI
5. ? Integrate into your game engine

For questions and support, visit the LPC community at https://lpc.opengameart.org
