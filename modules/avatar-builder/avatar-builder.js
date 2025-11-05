/**
 * LPC Avatar Builder
 * Handles layered composition of character sprites
 */

class LPCAvatarBuilder {
  constructor(assetLoader) {
    this.assetLoader = assetLoader;
    this.canvas = null;
    this.ctx = null;
    
    // LPC standard spritesheet dimensions
    this.frameWidth = 64;
    this.frameHeight = 64;
    this.sheetWidth = 832; // 13 columns
    this.sheetHeight = 1344; // 21 rows (standard)
    this.columns = 13;
    
    // Define layer order (bottom to top)
    this.layerOrder = [
      'shadow',
      'body',
      'eyes',
      'torso',      // shirts, armor
      'legs',       // pants, skirts
      'feet',       // shoes, boots
      'arms',       // arm accessories
      'shoulders',  // shoulder armor
      'hands',      // gloves
      'hair',
      'facial',     // beards, mustaches
      'head',       // hats, helmets
      'neck',       // necklaces
      'cape',
      'weapon',
      'shield',
      'backpack'
    ];
    
    // Animation frame mappings
    this.animations = {
      spellcast: { row: 0, frames: 7, fps: 12 },
      thrust: { row: 4, frames: 8, fps: 12 },
      walk: { row: 8, frames: 9, fps: 12 },
      slash: { row: 12, frames: 6, fps: 12 },
      shoot: { row: 16, frames: 13, fps: 12 },
      hurt: { row: 20, frames: 6, fps: 8 }
    };
    
    // Direction mappings (row offsets within animation)
    this.directions = {
      up: 0,
      left: 1,
      down: 2,
      right: 3
    };
  }

  /**
   * Initialize canvas for rendering
   * @param {HTMLCanvasElement|string} canvas - Canvas element or selector
   */
  initCanvas(canvas) {
    if (typeof canvas === 'string') {
      this.canvas = document.querySelector(canvas);
    } else {
      this.canvas = canvas;
    }
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }
    
    this.canvas.width = this.frameWidth;
    this.canvas.height = this.frameHeight;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Build a complete avatar from configuration
   * @param {Object} config - Avatar configuration
   * @returns {Promise<HTMLCanvasElement>} Canvas with rendered avatar
   */
  async buildAvatar(config) {
    if (!this.canvas) {
      this.initCanvas();
    }
    
    const {
      body = { type: 'male', color: 'light' },
      hair = { style: 'short', color: 'brown' },
      clothes = { torso: null, legs: null },
      weapon = null,
      accessories = {}
    } = config;
    
    // Collect all layers to render
    const layers = [];
    
    // Add body layer
    if (body) {
      layers.push({
        type: 'body',
        path: this.assetLoader.buildAssetPath('body', `bodies/${body.type}`, 'adult', 'walk', body.color)
      });
    }
    
    // Add clothing layers
    if (clothes.torso) {
      layers.push({
        type: 'torso',
        path: clothes.torso
      });
    }
    
    if (clothes.legs) {
      layers.push({
        type: 'legs',
        path: clothes.legs
      });
    }
    
    // Add hair layer
    if (hair) {
      layers.push({
        type: 'hair',
        path: this.assetLoader.buildAssetPath('hair', hair.style, 'adult', 'walk', hair.color)
      });
    }
    
    // Add weapon layer
    if (weapon) {
      layers.push({
        type: 'weapon',
        path: weapon
      });
    }
    
    // Sort layers by rendering order
    layers.sort((a, b) => {
      const aIndex = this.layerOrder.indexOf(a.type);
      const bIndex = this.layerOrder.indexOf(b.type);
      return aIndex - bIndex;
    });
    
    // Load all images
    const loadedLayers = await Promise.all(
      layers.map(async (layer) => ({
        ...layer,
        image: await this.assetLoader.loadImage(layer.path)
      }))
    );
    
    return { config, layers: loadedLayers };
  }

  /**
   * Get a specific animation frame
   * @param {Object} avatarData - Avatar data from buildAvatar
   * @param {string} animation - Animation name (walk, slash, etc)
   * @param {string} direction - Direction (up, down, left, right)
   * @param {number} frameIndex - Frame index in animation
   * @returns {HTMLCanvasElement} Canvas with rendered frame
   */
  getFrame(avatarData, animation, direction, frameIndex = 0) {
    if (!this.canvas) {
      this.initCanvas();
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const animData = this.animations[animation];
    if (!animData) {
      console.warn(`Unknown animation: ${animation}`);
      return this.canvas;
    }
    
    const dirOffset = this.directions[direction] || 0;
    const row = animData.row + dirOffset;
    const col = frameIndex % animData.frames;
    
    // Draw each layer
    for (const layer of avatarData.layers) {
      if (layer.image && layer.image.complete) {
        const sx = col * this.frameWidth;
        const sy = row * this.frameHeight;
        
        this.ctx.drawImage(
          layer.image,
          sx, sy, this.frameWidth, this.frameHeight,
          0, 0, this.frameWidth, this.frameHeight
        );
      }
    }
    
    return this.canvas;
  }

  /**
   * Render full spritesheet for an avatar
   * @param {Object} avatarData - Avatar data from buildAvatar
   * @returns {HTMLCanvasElement} Canvas with full spritesheet
   */
  renderSpritesheet(avatarData) {
    const canvas = document.createElement('canvas');
    canvas.width = this.sheetWidth;
    canvas.height = this.sheetHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw each layer's full spritesheet
    for (const layer of avatarData.layers) {
      if (layer.image && layer.image.complete) {
        ctx.drawImage(layer.image, 0, 0);
      }
    }
    
    return canvas;
  }

  /**
   * Apply outfit configuration to an existing avatar
   * @param {Object} avatarData - Existing avatar data
   * @param {Object} outfitConfig - New outfit configuration
   * @returns {Promise<Object>} Updated avatar data
   */
  async applyOutfit(avatarData, outfitConfig) {
    // Merge outfit config with existing config
    const newConfig = {
      ...avatarData.config,
      clothes: { ...avatarData.config.clothes, ...outfitConfig.clothes },
      weapon: outfitConfig.weapon !== undefined ? outfitConfig.weapon : avatarData.config.weapon,
      accessories: { ...avatarData.config.accessories, ...outfitConfig.accessories }
    };
    
    return this.buildAvatar(newConfig);
  }

  /**
   * Create animation sprite array for a specific animation
   * @param {Object} avatarData - Avatar data from buildAvatar
   * @param {string} animation - Animation name
   * @param {string} direction - Direction
   * @returns {Array<HTMLCanvasElement>} Array of frame canvases
   */
  createAnimationFrames(avatarData, animation, direction) {
    const animData = this.animations[animation];
    if (!animData) return [];
    
    const frames = [];
    for (let i = 0; i < animData.frames; i++) {
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = this.frameWidth;
      frameCanvas.height = this.frameHeight;
      const frameCtx = frameCanvas.getContext('2d');
      
      // Copy frame from main canvas
      const originalCanvas = this.canvas;
      this.canvas = frameCanvas;
      this.ctx = frameCtx;
      this.getFrame(avatarData, animation, direction, i);
      
      frames.push(frameCanvas);
      
      // Restore original canvas
      this.canvas = originalCanvas;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    }
    
    return frames;
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LPCAvatarBuilder;
}
