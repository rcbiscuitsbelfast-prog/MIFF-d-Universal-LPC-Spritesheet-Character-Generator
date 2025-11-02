/**
 * Player Customization System
 * Handles UI for character customization and state management
 */

class PlayerCustomization {
  constructor(avatarBuilder, assetLoader) {
    this.avatarBuilder = avatarBuilder;
    this.assetLoader = assetLoader;
    this.playerState = this.getDefaultState();
    this.listeners = [];
    this.previewCanvas = null;
    this.currentAnimation = 'walk';
    this.currentDirection = 'down';
    this.currentFrame = 0;
    this.animationTimer = null;
  }

  /**
   * Get default player state
   * @returns {Object} Default configuration
   */
  getDefaultState() {
    return {
      body: { type: 'male', color: 'light' },
      hair: { style: 'short', color: 'brown' },
      clothes: {
        torso: null,
        legs: null,
        feet: null
      },
      weapon: null,
      weaponVisible: true,
      accessories: {}
    };
  }

  /**
   * Initialize UI and attach to container
   * @param {HTMLElement|string} container - Container element or selector
   */
  async initUI(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      throw new Error('Container element not found');
    }
    
    // Create UI structure
    container.innerHTML = this.buildUIHTML();
    
    // Attach event listeners
    this.attachEventListeners(container);
    
    // Create preview canvas
    this.previewCanvas = container.querySelector('#avatar-preview');
    if (this.previewCanvas) {
      this.previewCanvas.width = 64 * 3; // 3x scale for visibility
      this.previewCanvas.height = 64 * 3;
    }
    
    // Initial render
    await this.updatePreview();
  }

  /**
   * Build HTML structure for customization UI
   * @returns {string} HTML string
   */
  buildUIHTML() {
    const bodyTypes = this.assetLoader.getBodyTypes();
    const hairStyles = this.assetLoader.getHairStyles();
    const bodyColors = this.assetLoader.getColors('body');
    const hairColors = this.assetLoader.getColors('hair');
    
    return `
      <div class="avatar-customization">
        <div class="preview-section">
          <h3>Preview</h3>
          <canvas id="avatar-preview" class="avatar-canvas"></canvas>
          <div class="animation-controls">
            <label>Animation:</label>
            <select id="anim-select">
              <option value="walk" selected>Walk</option>
              <option value="slash">Slash</option>
              <option value="spellcast">Spellcast</option>
              <option value="thrust">Thrust</option>
              <option value="shoot">Shoot</option>
              <option value="hurt">Hurt</option>
            </select>
            <label>Direction:</label>
            <select id="dir-select">
              <option value="down" selected>Down</option>
              <option value="up">Up</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <button id="play-anim">Play</button>
            <button id="stop-anim">Stop</button>
          </div>
        </div>
        
        <div class="customization-section">
          <div class="option-group">
            <h4>Body Type</h4>
            <select id="body-type" data-option="body.type">
              ${bodyTypes.map(bt => `<option value="${bt.id}">${bt.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="option-group">
            <h4>Skin Color</h4>
            <select id="body-color" data-option="body.color">
              ${bodyColors.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="option-group">
            <h4>Hair Style</h4>
            <select id="hair-style" data-option="hair.style">
              <option value="">None</option>
              ${hairStyles.map(hs => `<option value="${hs.id}">${hs.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="option-group">
            <h4>Hair Color</h4>
            <select id="hair-color" data-option="hair.color">
              ${hairColors.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="option-group">
            <h4>Weapon</h4>
            <input type="text" id="weapon-path" placeholder="Path to weapon sprite" data-option="weapon">
            <label>
              <input type="checkbox" id="weapon-visible" checked data-option="weaponVisible">
              Show Weapon
            </label>
          </div>
          
          <div class="option-group">
            <h4>Actions</h4>
            <button id="save-character">Save Character</button>
            <button id="load-character">Load Character</button>
            <button id="export-spritesheet">Export Spritesheet</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to UI elements
   * @param {HTMLElement} container - UI container
   */
  attachEventListeners(container) {
    // Body type change
    const bodyType = container.querySelector('#body-type');
    if (bodyType) {
      bodyType.value = this.playerState.body.type;
      bodyType.addEventListener('change', (e) => {
        this.updateState({ body: { ...this.playerState.body, type: e.target.value } });
      });
    }
    
    // Skin color change
    const bodyColor = container.querySelector('#body-color');
    if (bodyColor) {
      bodyColor.value = this.playerState.body.color;
      bodyColor.addEventListener('change', (e) => {
        this.updateState({ body: { ...this.playerState.body, color: e.target.value } });
      });
    }
    
    // Hair style change
    const hairStyle = container.querySelector('#hair-style');
    if (hairStyle) {
      hairStyle.value = this.playerState.hair.style;
      hairStyle.addEventListener('change', (e) => {
        this.updateState({ hair: { ...this.playerState.hair, style: e.target.value } });
      });
    }
    
    // Hair color change
    const hairColor = container.querySelector('#hair-color');
    if (hairColor) {
      hairColor.value = this.playerState.hair.color;
      hairColor.addEventListener('change', (e) => {
        this.updateState({ hair: { ...this.playerState.hair, color: e.target.value } });
      });
    }
    
    // Weapon toggle
    const weaponVisible = container.querySelector('#weapon-visible');
    if (weaponVisible) {
      weaponVisible.checked = this.playerState.weaponVisible;
      weaponVisible.addEventListener('change', (e) => {
        this.updateState({ weaponVisible: e.target.checked });
      });
    }
    
    // Animation controls
    const animSelect = container.querySelector('#anim-select');
    const dirSelect = container.querySelector('#dir-select');
    const playBtn = container.querySelector('#play-anim');
    const stopBtn = container.querySelector('#stop-anim');
    
    if (animSelect) {
      animSelect.addEventListener('change', (e) => {
        this.currentAnimation = e.target.value;
        this.stopAnimation();
        this.updatePreview();
      });
    }
    
    if (dirSelect) {
      dirSelect.addEventListener('change', (e) => {
        this.currentDirection = e.target.value;
        this.stopAnimation();
        this.updatePreview();
      });
    }
    
    if (playBtn) {
      playBtn.addEventListener('click', () => this.playAnimation());
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopAnimation());
    }
    
    // Action buttons
    const saveBtn = container.querySelector('#save-character');
    const loadBtn = container.querySelector('#load-character');
    const exportBtn = container.querySelector('#export-spritesheet');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCharacter());
    }
    
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadCharacter());
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportSpritesheet());
    }
  }

  /**
   * Update player state and trigger re-render
   * @param {Object} updates - State updates to apply
   */
  async updateState(updates) {
    this.playerState = { ...this.playerState, ...updates };
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.playerState));
    
    // Update preview
    await this.updatePreview();
  }

  /**
   * Update the preview canvas
   */
  async updatePreview() {
    if (!this.previewCanvas) return;
    
    try {
      // Build avatar with current state
      const config = { ...this.playerState };
      if (!config.weaponVisible) {
        config.weapon = null;
      }
      
      const avatarData = await this.avatarBuilder.buildAvatar(config);
      
      // Render current frame
      const frameCanvas = this.avatarBuilder.getFrame(
        avatarData,
        this.currentAnimation,
        this.currentDirection,
        this.currentFrame
      );
      
      // Scale up for preview
      const ctx = this.previewCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
      ctx.drawImage(
        frameCanvas,
        0, 0, 64, 64,
        0, 0, this.previewCanvas.width, this.previewCanvas.height
      );
      
      this.currentAvatarData = avatarData;
    } catch (error) {
      console.error('Failed to update preview:', error);
    }
  }

  /**
   * Play animation loop
   */
  playAnimation() {
    if (this.animationTimer) return;
    
    const animData = this.avatarBuilder.animations[this.currentAnimation];
    if (!animData) return;
    
    const frameDelay = 1000 / animData.fps;
    
    this.animationTimer = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % animData.frames;
      this.updatePreview();
    }, frameDelay);
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    this.currentFrame = 0;
  }

  /**
   * Save character configuration to localStorage
   */
  saveCharacter() {
    const json = JSON.stringify(this.playerState);
    localStorage.setItem('lpc_character', json);
    alert('Character saved!');
  }

  /**
   * Load character configuration from localStorage
   */
  async loadCharacter() {
    const json = localStorage.getItem('lpc_character');
    if (json) {
      try {
        const state = JSON.parse(json);
        this.playerState = state;
        await this.updatePreview();
        alert('Character loaded!');
      } catch (error) {
        alert('Failed to load character: ' + error.message);
      }
    } else {
      alert('No saved character found');
    }
  }

  /**
   * Export full spritesheet as PNG
   */
  async exportSpritesheet() {
    if (!this.currentAvatarData) return;
    
    const spritesheet = this.avatarBuilder.renderSpritesheet(this.currentAvatarData);
    const dataURL = spritesheet.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'character-spritesheet.png';
    link.href = dataURL;
    link.click();
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current player state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.playerState };
  }

  /**
   * Set player state directly
   * @param {Object} state - New state
   */
  async setState(state) {
    this.playerState = state;
    await this.updatePreview();
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerCustomization;
}
