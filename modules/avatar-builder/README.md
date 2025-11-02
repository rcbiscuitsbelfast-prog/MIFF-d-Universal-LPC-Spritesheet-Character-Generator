# LPC Avatar Builder Module

A modular character system for building and managing LPC (Liberated Pixel Cup) character sprites with layered composition, player customization, and NPC support.

## Features

- **Asset Loading**: Parse and load LPC spritesheets from organized directories
- **Layered Avatar Building**: Composite sprites using canvas with proper layer ordering
- **Player Customization**: Interactive UI for character creation with live preview
- **NPC System**: Define and spawn NPCs with preset configurations and patrol paths
- **Animation Support**: Full support for all LPC animations (walk, slash, spellcast, etc.)
- **MIFF Module**: Clean API for integration into game engines

## Installation

Include the module files in your HTML:

```html
<link rel="stylesheet" href="modules/avatar-builder/avatar-builder.css">
<script src="modules/avatar-builder/asset-loader.js"></script>
<script src="modules/avatar-builder/avatar-builder.js"></script>
<script src="modules/avatar-builder/player-customization.js"></script>
<script src="modules/avatar-builder/npc-system.js"></script>
<script src="modules/avatar-builder/index.js"></script>
```

## Quick Start

```javascript
// Initialize the module
const avatarModule = MIFF.AvatarBuilder.create({
  spritesheetsPath: '/workspace/spritesheets',
  npcPresetsPath: '/workspace/content/npcs'
});

await avatarModule.init();

// Build a character
const avatar = await avatarModule.buildAvatar({
  body: { type: 'male', color: 'light' },
  hair: { style: 'short', color: 'brown' },
  weapon: null
});

// Get animation frame
const frame = avatarModule.getFrame(avatar, 'walk', 'down', 0);

// Render to your game canvas
gameCtx.drawImage(frame, x, y);
```

## Player Customization

```javascript
// Initialize customization UI
await avatarModule.initCustomizationUI('#character-creator');

// Listen to changes
const customization = avatarModule.getCustomizationSystem();
customization.onChange((state) => {
  console.log('Character updated:', state);
});

// Save/load character
customization.saveCharacter(); // Saves to localStorage
customization.loadCharacter(); // Loads from localStorage
```

## NPC System

### Define NPC Preset

Create a JSON file in `/content/npcs/`:

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
  "dialogue": ["Welcome to the shrine."],
  "behavior": "patrol",
  "speed": 0.5
}
```

### Spawn and Manage NPCs

```javascript
// Spawn NPC
const npc = avatarModule.spawnNPC('Shrine Guardian', { x: 5, y: 10 });

// Update NPCs each frame
const npcSystem = avatarModule.getNPCSystem();
npcSystem.update(deltaTime);

// Render NPC
npcSystem.renderNPC(npc, ctx, cameraX, cameraY, scale);

// Get NPC at position
const clickedNPC = npcSystem.getNPCAtPosition({ x: 5, y: 10 }, 1);
if (clickedNPC) {
  console.log(clickedNPC.dialogue);
}
```

## API Reference

### AvatarBuilderModule

#### `async init()`
Initialize the module and load NPC presets.

#### `async buildAvatar(config)`
Build an avatar from configuration.

**Parameters:**
- `config` (Object): Avatar configuration
  - `body` (Object): `{ type: string, color: string }`
  - `hair` (Object): `{ style: string, color: string }`
  - `clothes` (Object): `{ torso: string, legs: string, feet: string }`
  - `weapon` (string|null): Path to weapon sprite
  - `accessories` (Object): Additional accessories

**Returns:** Promise<Object> - Avatar data

#### `getFrame(avatarData, action, direction, frameIndex)`
Get a specific animation frame.

**Parameters:**
- `avatarData` (Object): Avatar data from buildAvatar
- `action` (string): Animation name (walk, slash, spellcast, thrust, shoot, hurt)
- `direction` (string): Direction (up, down, left, right)
- `frameIndex` (number): Frame index in animation

**Returns:** HTMLCanvasElement - Canvas with rendered frame

#### `async applyOutfit(playerId, outfitConfig)`
Apply outfit to a registered player.

**Parameters:**
- `playerId` (string): Player ID
- `outfitConfig` (Object): Outfit configuration

**Returns:** Promise<Object> - Updated avatar data

### Layer Order

Sprites are rendered in the following order (bottom to top):

1. shadow
2. body
3. eyes
4. torso (shirts, armor)
5. legs (pants, skirts)
6. feet (shoes, boots)
7. arms
8. shoulders
9. hands (gloves)
10. hair
11. facial (beards)
12. head (hats, helmets)
13. neck (necklaces)
14. cape
15. weapon
16. shield
17. backpack

## Animation Frame Guide

All animations follow the LPC standard spritesheet format:

- **Spellcast**: 7 frames, row 0-3 (up/left/down/right)
- **Thrust**: 8 frames, row 4-7
- **Walk**: 9 frames, row 8-11
- **Slash**: 6 frames, row 12-15
- **Shoot**: 13 frames, row 16-19
- **Hurt**: 6 frames, row 20-23

Each frame is 64x64 pixels.

## Asset Organization

The module expects spritesheets organized as:

```
spritesheets/
??? body/
?   ??? bodies/
?       ??? male/
?       ??? female/
?       ??? child/
?       ??? ...
??? hair/
?   ??? short/
?   ??? long/
?   ??? ...
??? torso/
??? legs/
??? weapon/
??? ...
```

## Examples

### Creating a Custom Character

```javascript
const warrior = await avatarModule.buildAvatar({
  body: { type: 'muscular', color: 'tanned' },
  hair: { style: 'short', color: 'black' },
  clothes: {
    torso: 'torso/armor/chainmail.png',
    legs: 'legs/pants/brown.png'
  },
  weapon: 'weapon/sword/longsword.png'
});
```

### Creating a Walking Animation

```javascript
const walkFrames = avatarModule.createAnimationFrames(
  warrior,
  'walk',
  'down'
);

// Animate in game loop
let currentFrame = 0;
function animate() {
  ctx.drawImage(walkFrames[currentFrame], playerX, playerY);
  currentFrame = (currentFrame + 1) % walkFrames.length;
  requestAnimationFrame(animate);
}
```

### Multiplayer Support

```javascript
// Register players
avatarModule.registerPlayer('player1', player1Avatar);
avatarModule.registerPlayer('player2', player2Avatar);

// Update player outfit
await avatarModule.applyOutfit('player1', {
  clothes: { torso: 'torso/robe/red.png' }
});

// Get player avatar
const p1Avatar = avatarModule.getPlayerAvatar('player1');
```

## License

This module is part of the LPC Spritesheet Character Generator project. See the main project LICENSE for details.

## Credits

Built on top of the Universal LPC Spritesheet Character Generator.
See CREDITS.csv in the main project for full attribution.
