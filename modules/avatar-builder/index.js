/**
 * MIFF Avatar Builder Module
 * Main entry point for the LPC character system
 * 
 * @module avatar-builder
 * @version 1.0.0
 */

// Import core components
if (typeof window !== 'undefined') {
  // Browser environment - assume scripts are loaded via script tags
  var LPCAssetLoader = window.LPCAssetLoader;
  var LPCAvatarBuilder = window.LPCAvatarBuilder;
  var PlayerCustomization = window.PlayerCustomization;
  var NPCSystem = window.NPCSystem;
}

/**
 * Main Avatar Builder Module
 */
class AvatarBuilderModule {
  constructor(config = {}) {
    this.config = {
      spritesheetsPath: config.spritesheetsPath || '/workspace/spritesheets',
      npcPresetsPath: config.npcPresetsPath || '/workspace/content/npcs',
      ...config
    };
    
    // Initialize core systems
    this.assetLoader = new LPCAssetLoader(this.config.spritesheetsPath);
    this.avatarBuilder = new LPCAvatarBuilder(this.assetLoader);
    this.playerCustomization = new PlayerCustomization(this.avatarBuilder, this.assetLoader);
    this.npcSystem = new NPCSystem(this.avatarBuilder, this.assetLoader);
    
    this.initialized = false;
  }

  /**
   * Initialize the module
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;
    
    // Load NPC presets
    await this.npcSystem.loadPresetsFromDirectory(this.config.npcPresetsPath);
    
    this.initialized = true;
  }

  /**
   * Build an avatar from configuration
   * @param {Object} config - Avatar configuration
   * @returns {Promise<Object>} Avatar data
   */
  async buildAvatar(config) {
    return this.avatarBuilder.buildAvatar(config);
  }

  /**
   * Get a specific animation frame
   * @param {Object} avatarData - Avatar data from buildAvatar
   * @param {string} action - Animation action (walk, slash, etc)
   * @param {string} direction - Direction (up, down, left, right)
   * @param {number} frameIndex - Frame index
   * @returns {HTMLCanvasElement} Canvas with rendered frame
   */
  getFrame(avatarData, action, direction, frameIndex = 0) {
    return this.avatarBuilder.getFrame(avatarData, action, direction, frameIndex);
  }

  /**
   * Apply outfit configuration to avatar
   * @param {string} playerId - Player ID
   * @param {Object} outfitConfig - Outfit configuration
   * @returns {Promise<Object>} Updated avatar data
   */
  async applyOutfit(playerId, outfitConfig) {
    // Get player's current avatar data
    const currentAvatar = this.getPlayerAvatar(playerId);
    if (!currentAvatar) {
      throw new Error(`Player not found: ${playerId}`);
    }
    
    return this.avatarBuilder.applyOutfit(currentAvatar, outfitConfig);
  }

  /**
   * Initialize player customization UI
   * @param {HTMLElement|string} container - Container element or selector
   * @returns {Promise<void>}
   */
  async initCustomizationUI(container) {
    await this.playerCustomization.initUI(container);
  }

  /**
   * Get player customization system
   * @returns {PlayerCustomization}
   */
  getCustomizationSystem() {
    return this.playerCustomization;
  }

  /**
   * Get NPC system
   * @returns {NPCSystem}
   */
  getNPCSystem() {
    return this.npcSystem;
  }

  /**
   * Load NPC preset
   * @param {Object} preset - NPC preset configuration
   * @returns {Promise<Object>} Loaded preset
   */
  async loadNPCPreset(preset) {
    return this.npcSystem.loadPreset(preset);
  }

  /**
   * Spawn NPC from preset
   * @param {string} presetName - Preset name
   * @param {Object} position - Initial position {x, y}
   * @returns {Object} NPC instance
   */
  spawnNPC(presetName, position) {
    return this.npcSystem.spawnNPC(presetName, position);
  }

  /**
   * Get asset loader
   * @returns {LPCAssetLoader}
   */
  getAssetLoader() {
    return this.assetLoader;
  }

  /**
   * Get avatar builder
   * @returns {LPCAvatarBuilder}
   */
  getAvatarBuilder() {
    return this.avatarBuilder;
  }

  /**
   * Register player avatar (for multiplayer support)
   * @param {string} playerId - Player ID
   * @param {Object} avatarData - Avatar data
   */
  registerPlayer(playerId, avatarData) {
    if (!this.players) {
      this.players = new Map();
    }
    this.players.set(playerId, avatarData);
  }

  /**
   * Get player avatar
   * @param {string} playerId - Player ID
   * @returns {Object|undefined} Avatar data
   */
  getPlayerAvatar(playerId) {
    if (!this.players) return undefined;
    return this.players.get(playerId);
  }

  /**
   * Remove player
   * @param {string} playerId - Player ID
   */
  removePlayer(playerId) {
    if (this.players) {
      this.players.delete(playerId);
    }
  }

  /**
   * Export spritesheet for an avatar
   * @param {Object} avatarData - Avatar data
   * @returns {HTMLCanvasElement} Full spritesheet canvas
   */
  exportSpritesheet(avatarData) {
    return this.avatarBuilder.renderSpritesheet(avatarData);
  }

  /**
   * Create animation frames
   * @param {Object} avatarData - Avatar data
   * @param {string} animation - Animation name
   * @param {string} direction - Direction
   * @returns {Array<HTMLCanvasElement>} Array of frame canvases
   */
  createAnimationFrames(avatarData, animation, direction) {
    return this.avatarBuilder.createAnimationFrames(avatarData, animation, direction);
  }
}

// Export module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AvatarBuilderModule;
} else if (typeof window !== 'undefined') {
  window.AvatarBuilderModule = AvatarBuilderModule;
}

// MIFF Module Interface
if (typeof window !== 'undefined') {
  window.MIFF = window.MIFF || {};
  window.MIFF.AvatarBuilder = {
    version: '1.0.0',
    create: (config) => new AvatarBuilderModule(config),
    
    // Convenience exports
    LPCAssetLoader,
    LPCAvatarBuilder,
    PlayerCustomization,
    NPCSystem
  };
}
