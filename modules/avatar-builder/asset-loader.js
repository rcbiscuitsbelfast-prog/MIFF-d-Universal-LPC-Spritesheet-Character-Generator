/**
 * LPC Asset Loader
 * Loads and organizes LPC sprite assets from the spritesheets directory
 */

class LPCAssetLoader {
  constructor(basePath = '/workspace/spritesheets') {
    this.basePath = basePath;
    this.assets = {
      body: {},
      hair: {},
      clothes: {},
      weapons: {},
      accessories: {}
    };
    this.loadedImages = new Map();
    this.loadPromises = new Map();
  }

  /**
   * Parse animation and direction from filename pattern
   * LPC spritesheets follow: category/style/age/animation/color.png
   * @param {string} path - Full path to sprite
   * @returns {Object} Parsed metadata
   */
  parsePath(path) {
    const relativePath = path.replace(this.basePath + '/', '');
    const parts = relativePath.split('/');
    
    // Extract components based on path structure
    const [category, subcategory, ...rest] = parts;
    const filename = parts[parts.length - 1];
    const color = filename.replace('.png', '');
    
    // Determine age group and animation if present
    let age = 'adult';
    let animation = 'universal';
    
    if (parts.includes('child')) age = 'child';
    if (parts.includes('teen')) age = 'teen';
    
    // Common animations
    const animations = ['walk', 'spellcast', 'thrust', 'slash', 'shoot', 'hurt', 'jump', 'climb'];
    for (const anim of animations) {
      if (parts.includes(anim)) {
        animation = anim;
        break;
      }
    }
    
    return {
      category,
      subcategory,
      age,
      animation,
      color,
      path: relativePath,
      fullPath: path
    };
  }

  /**
   * Preload an image and cache it
   * @param {string} path - Path to image
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(path) {
    // Return cached image if already loaded
    if (this.loadedImages.has(path)) {
      return this.loadedImages.get(path);
    }
    
    // Return existing promise if currently loading
    if (this.loadPromises.has(path)) {
      return this.loadPromises.get(path);
    }
    
    // Create new load promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(path, img);
        this.loadPromises.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        this.loadPromises.delete(path);
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });
    
    this.loadPromises.set(path, loadPromise);
    return loadPromise;
  }

  /**
   * Load all assets from a specific category
   * @param {string} category - Category name (body, hair, etc)
   * @returns {Promise<Array>} Array of parsed asset metadata
   */
  async loadCategory(category) {
    // This would typically use a manifest or directory listing
    // For now, we'll return a structure that can be populated
    const categoryAssets = [];
    return categoryAssets;
  }

  /**
   * Get available body types
   * @returns {Array<Object>} Available body type options
   */
  getBodyTypes() {
    return [
      { id: 'male', name: 'Male', path: 'body/bodies/male' },
      { id: 'female', name: 'Female', path: 'body/bodies/female' },
      { id: 'child', name: 'Child', path: 'body/bodies/child' },
      { id: 'teen', name: 'Teen', path: 'body/bodies/teen' },
      { id: 'muscular', name: 'Muscular', path: 'body/bodies/muscular' },
      { id: 'pregnant', name: 'Pregnant', path: 'body/bodies/pregnant' }
    ];
  }

  /**
   * Get available hair styles
   * @returns {Array<Object>} Available hair style options
   */
  getHairStyles() {
    return [
      { id: 'bangs', name: 'Bangs', path: 'hair/bangs' },
      { id: 'bob', name: 'Bob', path: 'hair/bob' },
      { id: 'braid', name: 'Braid', path: 'hair/braid' },
      { id: 'curly_long', name: 'Curly Long', path: 'hair/curly_long' },
      { id: 'ponytail', name: 'Ponytail', path: 'hair/ponytail' },
      { id: 'short', name: 'Short', path: 'hair/short' },
      { id: 'long', name: 'Long', path: 'hair/long' }
    ];
  }

  /**
   * Get available colors for a specific asset type
   * @param {string} assetType - Type of asset (body, hair, etc)
   * @returns {Array<Object>} Available color options
   */
  getColors(assetType) {
    const bodyColors = [
      { id: 'light', name: 'Light', hex: '#ffd5b7' },
      { id: 'tanned', name: 'Tanned', hex: '#d69960' },
      { id: 'dark', name: 'Dark', hex: '#8b5a3c' },
      { id: 'dark2', name: 'Darker', hex: '#5c3b2e' },
      { id: 'darkelf', name: 'Dark Elf', hex: '#4b4b7e' },
      { id: 'darkelf2', name: 'Dark Elf 2', hex: '#3e3e60' }
    ];
    
    const hairColors = [
      { id: 'black', name: 'Black', hex: '#1a1a1a' },
      { id: 'dark_brown', name: 'Dark Brown', hex: '#4a2f14' },
      { id: 'brown', name: 'Brown', hex: '#784f31' },
      { id: 'blonde', name: 'Blonde', hex: '#e9c963' },
      { id: 'red', name: 'Red', hex: '#c84a3f' },
      { id: 'white', name: 'White', hex: '#f0f0f0' },
      { id: 'blue', name: 'Blue', hex: '#4169e1' },
      { id: 'green', name: 'Green', hex: '#3cb371' }
    ];
    
    if (assetType === 'body') return bodyColors;
    if (assetType === 'hair') return hairColors;
    return [];
  }

  /**
   * Build full path to a specific asset
   * @param {string} category - Asset category
   * @param {string} subcategory - Asset subcategory
   * @param {string} age - Age group
   * @param {string} animation - Animation type
   * @param {string} color - Color variant
   * @returns {string} Full path to asset
   */
  buildAssetPath(category, subcategory, age, animation, color) {
    return `${this.basePath}/${category}/${subcategory}/${age}/${animation}/${color}.png`;
  }

  /**
   * Get the universal spritesheet path (works across all animations)
   * Many LPC assets have universal spritesheets that contain all animations
   * @param {string} category - Asset category
   * @param {string} subcategory - Asset subcategory
   * @param {string} color - Color variant
   * @returns {string} Path to universal spritesheet
   */
  getUniversalPath(category, subcategory, color) {
    // Try common universal path patterns
    const patterns = [
      `${this.basePath}/${category}/${subcategory}/${color}.png`,
      `${this.basePath}/${category}/${subcategory}/universal/${color}.png`,
      `${this.basePath}/${category}/${subcategory}/adult/universal/${color}.png`
    ];
    return patterns[0]; // Return first pattern for now
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LPCAssetLoader;
}
