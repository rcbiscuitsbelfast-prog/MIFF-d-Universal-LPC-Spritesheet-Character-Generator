/**
 * NPC System
 * Manages NPC presets, spawning, and pathfinding
 */

class NPCSystem {
  constructor(avatarBuilder, assetLoader) {
    this.avatarBuilder = avatarBuilder;
    this.assetLoader = assetLoader;
    this.npcs = new Map();
    this.presets = new Map();
    this.nextId = 1;
  }

  /**
   * Load NPC preset from configuration
   * @param {Object} preset - NPC preset configuration
   * @returns {Promise<Object>} Loaded preset with avatar data
   */
  async loadPreset(preset) {
    const {
      name,
      sprite,
      path = [],
      dialogue = [],
      behavior = 'static',
      speed = 1
    } = preset;
    
    // Build avatar for NPC
    const avatarConfig = {
      body: sprite.body || { type: 'male', color: 'light' },
      hair: sprite.hair || { style: 'short', color: 'brown' },
      clothes: sprite.clothes || {},
      weapon: sprite.weapon || null,
      accessories: sprite.accessories || {}
    };
    
    const avatarData = await this.avatarBuilder.buildAvatar(avatarConfig);
    
    const npcPreset = {
      name,
      avatarData,
      path,
      dialogue,
      behavior,
      speed,
      originalConfig: preset
    };
    
    this.presets.set(name, npcPreset);
    return npcPreset;
  }

  /**
   * Spawn an NPC instance from a preset
   * @param {string} presetName - Name of preset to spawn
   * @param {Object} position - Initial position {x, y}
   * @returns {Object} NPC instance
   */
  spawnNPC(presetName, position = { x: 0, y: 0 }) {
    const preset = this.presets.get(presetName);
    if (!preset) {
      throw new Error(`NPC preset not found: ${presetName}`);
    }
    
    const npcId = `npc_${this.nextId++}`;
    const npc = {
      id: npcId,
      presetName,
      position: { ...position },
      currentPathIndex: 0,
      currentAnimation: 'walk',
      currentDirection: 'down',
      currentFrame: 0,
      avatarData: preset.avatarData,
      path: preset.path,
      dialogue: preset.dialogue,
      behavior: preset.behavior,
      speed: preset.speed,
      isMoving: false,
      targetPosition: null
    };
    
    this.npcs.set(npcId, npc);
    return npc;
  }

  /**
   * Remove an NPC instance
   * @param {string} npcId - NPC ID to remove
   */
  removeNPC(npcId) {
    this.npcs.delete(npcId);
  }

  /**
   * Update NPC state (called each frame)
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    for (const npc of this.npcs.values()) {
      this.updateNPC(npc, deltaTime);
    }
  }

  /**
   * Update individual NPC
   * @param {Object} npc - NPC instance
   * @param {number} deltaTime - Time delta
   */
  updateNPC(npc, deltaTime) {
    if (npc.behavior === 'static') {
      return; // Static NPCs don't move
    }
    
    if (npc.behavior === 'patrol' && npc.path.length > 0) {
      this.updatePatrolNPC(npc, deltaTime);
    }
    
    // Update animation frame
    if (npc.isMoving) {
      npc.currentFrame = (npc.currentFrame + 1) % 9; // Walk animation has 9 frames
    } else {
      npc.currentFrame = 0; // Idle frame
    }
  }

  /**
   * Update NPC following patrol path
   * @param {Object} npc - NPC instance
   * @param {number} deltaTime - Time delta
   */
  updatePatrolNPC(npc, deltaTime) {
    if (!npc.targetPosition) {
      // Set next waypoint
      const waypoint = npc.path[npc.currentPathIndex];
      npc.targetPosition = { x: waypoint[0], y: waypoint[1] };
    }
    
    const dx = npc.targetPosition.x - npc.position.x;
    const dy = npc.targetPosition.y - npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 0.1) {
      // Reached waypoint, move to next
      npc.currentPathIndex = (npc.currentPathIndex + 1) % npc.path.length;
      npc.targetPosition = null;
      npc.isMoving = false;
    } else {
      // Move towards waypoint
      const moveSpeed = npc.speed * (deltaTime / 1000);
      const moveX = (dx / distance) * moveSpeed;
      const moveY = (dy / distance) * moveSpeed;
      
      npc.position.x += moveX;
      npc.position.y += moveY;
      npc.isMoving = true;
      
      // Update direction based on movement
      if (Math.abs(dx) > Math.abs(dy)) {
        npc.currentDirection = dx > 0 ? 'right' : 'left';
      } else {
        npc.currentDirection = dy > 0 ? 'down' : 'up';
      }
    }
  }

  /**
   * Render an NPC to canvas
   * @param {Object} npc - NPC instance
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} offsetX - X offset for camera
   * @param {number} offsetY - Y offset for camera
   * @param {number} scale - Render scale
   */
  renderNPC(npc, ctx, offsetX = 0, offsetY = 0, scale = 1) {
    const frameCanvas = this.avatarBuilder.getFrame(
      npc.avatarData,
      npc.currentAnimation,
      npc.currentDirection,
      npc.currentFrame
    );
    
    const renderX = (npc.position.x - offsetX) * scale;
    const renderY = (npc.position.y - offsetY) * scale;
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      frameCanvas,
      renderX, renderY,
      64 * scale, 64 * scale
    );
  }

  /**
   * Get NPC at position
   * @param {Object} position - Position to check {x, y}
   * @param {number} threshold - Distance threshold
   * @returns {Object|null} NPC instance or null
   */
  getNPCAtPosition(position, threshold = 1) {
    for (const npc of this.npcs.values()) {
      const dx = npc.position.x - position.x;
      const dy = npc.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= threshold) {
        return npc;
      }
    }
    return null;
  }

  /**
   * Get all NPCs
   * @returns {Array<Object>} Array of all NPC instances
   */
  getAllNPCs() {
    return Array.from(this.npcs.values());
  }

  /**
   * Get NPC by ID
   * @param {string} npcId - NPC ID
   * @returns {Object|undefined} NPC instance
   */
  getNPC(npcId) {
    return this.npcs.get(npcId);
  }

  /**
   * Load NPC presets from directory
   * @param {string} directory - Directory path
   * @returns {Promise<Array>} Array of loaded presets
   */
  async loadPresetsFromDirectory(directory) {
    // This would typically load from files
    // For now, return a sample preset
    const samplePresets = [
      {
        name: 'Shrine Guardian',
        sprite: {
          body: { type: 'male', color: 'light' },
          clothes: {
            torso: 'torso/robe/blue.png'
          },
          hair: { style: 'long', color: 'black' },
          weapon: null
        },
        path: [[5, 10], [5, 11], [5, 10]],
        dialogue: [
          'Welcome to the shrine.',
          'May the spirits guide you.'
        ],
        behavior: 'patrol',
        speed: 0.5
      },
      {
        name: 'Village Merchant',
        sprite: {
          body: { type: 'male', color: 'tanned' },
          clothes: {
            torso: 'torso/tunic/green.png'
          },
          hair: { style: 'short', color: 'brown' },
          weapon: null
        },
        path: [],
        dialogue: [
          'Looking to buy or sell?',
          'I have the finest wares in the region!'
        ],
        behavior: 'static'
      },
      {
        name: 'Town Guard',
        sprite: {
          body: { type: 'muscular', color: 'light' },
          clothes: {
            torso: 'torso/armor/chainmail.png'
          },
          hair: { style: 'short', color: 'dark_brown' },
          weapon: 'weapon/sword/longsword.png'
        },
        path: [[10, 5], [15, 5], [15, 10], [10, 10]],
        dialogue: [
          'Halt! State your business.',
          'Keep the peace, citizen.'
        ],
        behavior: 'patrol',
        speed: 1
      }
    ];
    
    const loadedPresets = [];
    for (const preset of samplePresets) {
      const loaded = await this.loadPreset(preset);
      loadedPresets.push(loaded);
    }
    
    return loadedPresets;
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NPCSystem;
}
